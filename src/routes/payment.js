const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const Razorpay = require('razorpay')
const Story = require('../models/Story')
const User = require('../models/User')
const { protect } = require('../middleware/auth')
const { sendPaymentConfirmationEmail } = require('../lib/email')

// Razorpay instance — uses live keys in production, test keys in dev
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Prices in INR paise (100 paise = ₹1)
// Signature: ₹1,250  |  Luxe: ₹2,900
const PRICES_PAISE = {
  signature: 125000,
  luxe:      290000,
}

// ── POST /api/payment/create-order ──
router.post('/create-order', protect, async (req, res) => {
  try {
    const { storyId, packageType } = req.body
    if (!storyId || !packageType) return res.status(400).json({ error: 'storyId and packageType are required.' })

    const story = await Story.findOne({ _id: storyId, userId: req.user._id })
    if (!story) return res.status(404).json({ error: 'Story not found.' })
    if (story.paymentStatus === 'paid') return res.status(400).json({ error: 'This story has already been paid for.' })

    const amountPaise = PRICES_PAISE[packageType] || PRICES_PAISE.signature

    const order = await razorpay.orders.create({
      amount:   amountPaise,
      currency: 'INR',
      receipt:  `ws_${storyId.toString().slice(-8)}`,
      notes: {
        storyId:  storyId.toString(),
        userId:   req.user._id.toString(),
        customer: req.user.email,
      },
    })

    await Story.findByIdAndUpdate(storyId, { razorpayOrderId: order.id })

    res.json({
      success: true,
      order: {
        orderId:  order.id,
        amount:   order.amount,
        currency: order.currency,
        key:      process.env.RAZORPAY_KEY_ID,
      }
    })
  } catch (err) {
    console.error('Razorpay create-order error:', err)
    res.status(500).json({ error: 'Could not create payment order. Please try again.' })
  }
})

// ── POST /api/payment/verify ──
router.post('/verify', protect, async (req, res) => {
  try {
    const { storyId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification fields.' })
    }

    // HMAC-SHA256 signature verification
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      console.warn('Razorpay signature mismatch for story:', storyId)
      return res.status(400).json({ error: 'Payment verification failed. Please contact support.' })
    }

    const story = await Story.findByIdAndUpdate(
      storyId,
      {
        paymentStatus:    'paid',
        paymentId:        razorpay_payment_id,
        status:           'submitted',
      },
      { new: true }
    )
    if (!story) return res.status(404).json({ error: 'Story not found.' })

    // Send confirmation email (non-blocking)
    const user = await User.findById(req.user._id)
    if (user) sendPaymentConfirmationEmail(user, story).catch(console.error)

    // Real-time notification to admin panel
    const io = req.app.get('io')
    if (io) io.emit('new-order', { storyId: story._id, recipientName: story.recipientName })

    res.json({ success: true, story })
  } catch (err) {
    console.error('Razorpay verify error:', err)
    res.status(500).json({ error: 'Verification failed. Please contact support.' })
  }
})

module.exports = router

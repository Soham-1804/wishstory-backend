const express = require('express')
const router = express.Router()
const Razorpay = require('razorpay')
const crypto = require('crypto')
const { protect } = require('../middleware/auth')
const GiftOrder = require('../models/GiftOrder.model')

const rzp = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

/* POST /api/gift-orders/create-payment
   Creates a Razorpay order and saves draft GiftOrder */
router.post('/create-payment', protect, async (req, res) => {
  try {
    const { amount, items, recipientName, recipientPhone, deliveryAddress } = req.body

    if (!items?.length)         return res.status(400).json({ error: 'No items in cart' })
    if (!recipientName)         return res.status(400).json({ error: 'Recipient name required' })
    if (!deliveryAddress?.line1) return res.status(400).json({ error: 'Delivery address required' })

    // Create Razorpay order
    const rzOrder = await rzp.orders.create({
      amount: Math.round(amount),           // already in paise
      currency: 'INR',
      receipt: `gift-${Date.now()}`.slice(0, 40),
    })

    // Save draft order to DB
    const giftOrder = await GiftOrder.create({
      userId:          req.user._id,
      razorpayOrderId: rzOrder.id,
      items,
      recipientName,
      recipientPhone,
      deliveryAddress,
      totalAmount:     amount,
      paymentStatus:   'pending',
      orderStatus:     'pending',
    })

    res.json({
      razorpayOrderId: rzOrder.id,
      giftOrderId:     giftOrder._id,
      amount:          rzOrder.amount,
      currency:        rzOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.error('Gift order create-payment error:', err)
    res.status(500).json({ error: err.message || 'Payment initiation failed' })
  }
})

/* POST /api/gift-orders/verify-payment
   Verifies Razorpay signature and marks order paid */
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, giftOrderId } = req.body

    // HMAC verification
    const body = `${razorpayOrderId}|${razorpayPaymentId}`
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expected !== razorpaySignature) {
      return res.status(400).json({ error: 'Invalid payment signature' })
    }

    const order = await GiftOrder.findByIdAndUpdate(
      giftOrderId,
      {
        paymentStatus:    'paid',
        orderStatus:      'confirmed',
        paymentId:        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
      },
      { new: true }
    )

    if (!order) return res.status(404).json({ error: 'Gift order not found' })

    res.json({ success: true, order })
  } catch (err) {
    console.error('Gift verify-payment error:', err)
    res.status(500).json({ error: err.message })
  }
})

/* GET /api/gift-orders/my
   Returns the logged-in user's gift orders */
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await GiftOrder
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean()
    res.json({ orders })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* GET /api/gift-orders/:id
   Returns a single order (owner only) */
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await GiftOrder.findById(req.params.id).lean()
    if (!order) return res.status(404).json({ error: 'Order not found' })
    if (order.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Not authorised' })
    res.json({ order })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* GET /api/gift-orders (admin only) */
router.get('/', protect, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
  try {
    const orders = await GiftOrder.find().sort({ createdAt: -1 }).lean()
    res.json({ orders })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* PATCH /api/gift-orders/:id/status (admin) */
router.patch('/:id/status', protect, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
  try {
    const { orderStatus, trackingId, estimatedDelivery } = req.body
    const order = await GiftOrder.findByIdAndUpdate(
      req.params.id,
      { orderStatus, ...(trackingId && { trackingId }), ...(estimatedDelivery && { estimatedDelivery }) },
      { new: true }
    )
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json({ order })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router

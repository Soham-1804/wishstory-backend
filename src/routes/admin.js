const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const Story = require('../models/Story')
const User = require('../models/User')
const { protect, adminOnly } = require('../middleware/auth')
const { sendStoryCompletedEmail } = require('../lib/email')

// All admin routes require authentication + admin role
router.use(protect, adminOnly)

// ── GET /api/admin/stats ──
router.get('/stats', async (req, res) => {
  try {
    const [totalOrders, completedOrders, pendingOrders, revenueResult, recentOrders] = await Promise.all([
      Story.countDocuments({ paymentStatus: 'paid' }),
      Story.countDocuments({ status: 'completed' }),
      Story.countDocuments({ paymentStatus: 'paid', status: { $ne: 'completed' } }),
      Story.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$packagePrice' } } }
      ]),
      Story.find({ paymentStatus: 'paid' }).sort({ createdAt: -1 }).limit(8),
    ])

    res.json({
      success: true,
      stats: {
        totalOrders,
        completedOrders,
        pendingOrders,
        totalRevenue: revenueResult[0]?.total || 0,
        recentOrders,
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch stats.' })
  }
})

// ── GET /api/admin/stories ──
router.get('/stories', async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query
    const query = {}
    if (status && status !== 'all') query.status = status

    const stories = await Story.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    const total = await Story.countDocuments(query)
    res.json({ success: true, stories, total })
  } catch {
    res.status(500).json({ error: 'Failed to fetch stories.' })
  }
})

// ── GET /api/admin/stories/:id ──
router.get('/stories/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
    if (!story) return res.status(404).json({ error: 'Story not found.' })
    res.json({ success: true, story })
  } catch {
    res.status(500).json({ error: 'Failed to fetch story.' })
  }
})

// ── PUT /api/admin/update-story ──
router.put('/update-story', async (req, res) => {
  try {
    const { storyId, status, storyLink, adminNotes, sendEmail, passwordProtected, storyPassword } = req.body

    const updateData = { status, adminNotes }
    if (storyLink) updateData.storyLink = storyLink
    if (passwordProtected !== undefined) updateData.passwordProtected = passwordProtected
    if (passwordProtected && storyPassword) {
      updateData.storyPassword = await bcrypt.hash(storyPassword, 10)
    }

    const story = await Story.findByIdAndUpdate(storyId, updateData, { new: true })
    if (!story) return res.status(404).json({ error: 'Story not found.' })

    // Send completion email if requested and story is completed
    if (sendEmail && status === 'completed' && story.storyLink) {
      const user = await User.findById(story.userId)
      if (user) await sendStoryCompletedEmail(user, story)
    }

    // Emit real-time status update
    const io = req.app.get('io')
    if (io) io.to(`story:${storyId}`).emit('status-update', { status: story.status })

    res.json({ success: true, story })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Update failed.' })
  }
})

// ── POST /api/admin/send-email/:id — manual completion email ──
router.post('/send-email/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
    if (!story) return res.status(404).json({ error: 'Story not found.' })
    if (!story.storyLink) return res.status(400).json({ error: 'No story link set. Please add a story link first.' })

    const user = await User.findById(story.userId)
    if (!user) return res.status(404).json({ error: 'User not found.' })

    await sendStoryCompletedEmail(user, story)
    res.json({ success: true, message: 'Email sent.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to send email.' })
  }
})

// ── GET /api/admin/users — all users ──
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password')
    res.json({ success: true, users })
  } catch {
    res.status(500).json({ error: 'Failed to fetch users.' })
  }
})

module.exports = router

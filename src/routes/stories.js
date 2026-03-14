const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator')
const Story = require('../models/Story')
const User = require('../models/User')
const { protect } = require('../middleware/auth')
const { upload } = require('../middleware/upload')

const PRICES = { signature: 15, luxe: 35 }

// ── POST /api/stories — create story (auth required, with photo upload) ──
router.post('/', protect, upload.array('photos', 10), [
  body('recipientName').trim().notEmpty().withMessage('Recipient name is required'),
  body('occasion').isIn(['birthday','romantic','friendship','family','celebration','memorial']),
  body('theme').isIn(['warm','cinematic','elegant','playful','melancholic','joyful']),
  body('storyDetails').isLength({ min: 10 }).withMessage('Please provide story details'),
  body('packageType').isIn(['signature','luxe']),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

  try {
    const { recipientName, occasion, theme, storyDetails, musicChoice, packageType } = req.body
    const uploadedPhotos = (req.files || []).map(f => f.path)

    const story = await Story.create({
      userId: req.user._id,
      clientName: req.user.name,
      clientEmail: req.user.email,
      recipientName,
      occasion,
      theme,
      storyDetails,
      musicChoice: musicChoice || 'none',
      uploadedPhotos,
      packageType,
      packagePrice: PRICES[packageType],
    })

    // Add story reference to user
    await User.findByIdAndUpdate(req.user._id, { $push: { createdStories: story._id } })

    res.status(201).json({ success: true, story })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create story.' })
  }
})

// ── GET /api/stories/my — user's stories ──
router.get('/my', protect, async (req, res) => {
  try {
    const stories = await Story.find({ userId: req.user._id }).sort({ createdAt: -1 })
    res.json({ success: true, stories })
  } catch {
    res.status(500).json({ error: 'Failed to fetch stories.' })
  }
})

// ── GET /api/stories/view/:id — public cinematic story view ──
router.get('/view/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
    if (!story) return res.status(404).json({ error: 'Story not found.' })
    if (story.status !== 'completed') return res.status(403).json({ error: 'This story is not yet published.' })

    if (story.passwordProtected) {
      // Return partial data indicating password is required
      return res.json({
        success: true,
        story: { _id: story._id, recipientName: story.recipientName, passwordProtected: true }
      })
    }
    res.json({ success: true, story })
  } catch {
    res.status(500).json({ error: 'Failed to load story.' })
  }
})

// ── POST /api/stories/view/:id — unlock password-protected story ──
router.post('/view/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).select('+storyPassword')
    if (!story) return res.status(404).json({ error: 'Story not found.' })
    if (!story.passwordProtected) return res.json({ success: true, story })

    const { password } = req.body
    const match = await bcrypt.compare(password, story.storyPassword)
    if (!match) return res.status(401).json({ error: 'Incorrect password.' })

    // Return full story without exposing password hash
    story.storyPassword = undefined
    res.json({ success: true, story })
  } catch {
    res.status(500).json({ error: 'Unlock failed.' })
  }
})

// ── GET /api/stories/:id — single story (owner only) ──
router.get('/:id', protect, async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id, userId: req.user._id })
    if (!story) return res.status(404).json({ error: 'Story not found.' })
    res.json({ success: true, story })
  } catch {
    res.status(500).json({ error: 'Failed to fetch story.' })
  }
})

module.exports = router

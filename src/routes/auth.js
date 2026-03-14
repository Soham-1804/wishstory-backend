const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const { protect } = require('../middleware/auth')
const { sendWelcomeEmail } = require('../lib/email')

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' })
}

function sendTokenResponse(user, statusCode, res) {
  const token = signToken(user._id)
  const userData = { _id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt }
  res.status(statusCode).json({ success: true, token, user: userData })
}

// ── POST /api/auth/register ──
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

  try {
    const { name, email, password } = req.body
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ error: 'An account with this email already exists.' })

    const user = await User.create({ name, email, password })

    // Fire-and-forget welcome email
    sendWelcomeEmail(user).catch(console.error)

    sendTokenResponse(user, 201, res)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
})

// ── POST /api/auth/login ──
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid credentials.' })

  try {
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }
    sendTokenResponse(user, 200, res)
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' })
  }
})

// ── GET /api/auth/me ──
router.get('/me', protect, (req, res) => {
  const { _id, name, email, role, createdAt } = req.user
  res.json({ success: true, user: { _id, name, email, role, createdAt } })
})

// ── PUT /api/auth/profile ──
router.put('/profile', protect, [
  body('name').trim().isLength({ min: 2, max: 60 }),
  body('email').isEmail().normalizeEmail(),
], async (req, res) => {
  try {
    const { name, email } = req.body
    const user = await User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    res.json({ success: true, user })
  } catch {
    res.status(500).json({ error: 'Update failed.' })
  }
})

// ── PUT /api/auth/password ──
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!newPassword || newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters.' })
    const user = await User.findById(req.user._id).select('+password')
    if (!(await user.comparePassword(currentPassword))) return res.status(401).json({ error: 'Current password is incorrect.' })
    user.password = newPassword
    await user.save()
    res.json({ success: true, message: 'Password updated.' })
  } catch {
    res.status(500).json({ error: 'Password change failed.' })
  }
})

module.exports = router

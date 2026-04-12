const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const QuizSession = require('../models/QuizSession')
const { QUESTIONS } = require('../lib/quizQuestions')

// ── helpers ──────────────────────────────────────────────────────────────────

// Pick `count` random question IDs per category — total 20 questions (4 per cat)
function pickQuestionIds() {
  const categories = ['loveLanguage', 'lifestyle', 'futureGoals', 'dailyHabits', 'personality']
  const selected = []
  for (const cat of categories) {
    const pool = QUESTIONS.filter(q => q.category === cat)
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 4)
    shuffled.forEach(q => selected.push(q.id))
  }
  return selected
}

// Score two answer arrays against each other
function computeScore(questionIds, answers1, answers2) {
  const map1 = Object.fromEntries(answers1.map(a => [a.questionId, a.value]))
  const map2 = Object.fromEntries(answers2.map(a => [a.questionId, a.value]))

  const categoryPoints = {
    loveLanguage: { earned: 0, max: 0 },
    lifestyle:    { earned: 0, max: 0 },
    futureGoals:  { earned: 0, max: 0 },
    dailyHabits:  { earned: 0, max: 0 },
    personality:  { earned: 0, max: 0 },
  }

  const WEIGHTS = { futureGoals: 1.5, loveLanguage: 1.3, personality: 1.2, lifestyle: 1.0, dailyHabits: 1.0 }

  for (const id of questionIds) {
    const q = QUESTIONS.find(q => q.id === id)
    if (!q) continue
    const v1 = map1[id]
    const v2 = map2[id]
    if (v1 === undefined || v2 === undefined) continue

    const w = WEIGHTS[q.category] || 1.0
    const maxPts = 10 * w
    let pts = 0

    if (q.type === 'slider') {
      // slider 1-5: diff 0→10pts, 1→7, 2→4, 3+→0
      const diff = Math.abs(Number(v1) - Number(v2))
      pts = diff === 0 ? 10 * w : diff === 1 ? 7 * w : diff === 2 ? 4 * w : 0
    } else {
      // choice: exact match = 10, off by 1 option index = 5, else 0
      const opts = q.options.map(o => o.value)
      const i1 = opts.indexOf(v1)
      const i2 = opts.indexOf(v2)
      if (i1 === -1 || i2 === -1) { pts = 0 } // unknown value
      else {
        const diff = Math.abs(i1 - i2)
        pts = diff === 0 ? 10 * w : diff === 1 ? 5 * w : 0
      }
    }

    categoryPoints[q.category].earned += pts
    categoryPoints[q.category].max    += maxPts
  }

  // Category scores (0-100)
  const categoryScores = {}
  let totalEarned = 0, totalMax = 0
  for (const [cat, { earned, max }] of Object.entries(categoryPoints)) {
    categoryScores[cat] = max > 0 ? Math.round((earned / max) * 100) : 0
    totalEarned += earned
    totalMax    += max
  }

  const overall = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0

  const LABELS = [
    { min: 90, label: 'Soul Mates' },
    { min: 75, label: 'Perfect Pair' },
    { min: 60, label: 'Great Match' },
    { min: 45, label: 'Almost There' },
    { min: 0,  label: 'Opposites Attract' },
  ]
  const scoreLabel = LABELS.find(l => overall >= l.min)?.label || 'Opposites Attract'

  return { score: overall, categoryScores, scoreLabel }
}

// ── POST /api/quiz/start ──────────────────────────────────────────────────────
// Partner 1 starts a quiz session
router.post('/start', [
  body('partner1Name').trim().notEmpty().withMessage('Your name is required').isLength({ max: 60 }),
  body('partner2Name').trim().notEmpty().withMessage('Partner name is required').isLength({ max: 60 }),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

  try {
    const { partner1Name, partner2Name } = req.body
    const questionIds = pickQuestionIds()

    const session = await QuizSession.create({ partner1Name, partner2Name, questionIds })
    res.status(201).json({ success: true, quizId: session._id, questionIds })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create quiz session.' })
  }
})

// ── GET /api/quiz/:id ─────────────────────────────────────────────────────────
// Get session info + question IDs (both partners call this to load their quiz)
router.get('/:id', async (req, res) => {
  try {
    const session = await QuizSession.findById(req.params.id).select('-partner1Answers -partner2Answers')
    if (!session) return res.status(404).json({ error: 'Quiz not found or expired.' })

    res.json({
      success: true,
      quizId: session._id,
      partner1Name: session.partner1Name,
      partner2Name: session.partner2Name,
      questionIds: session.questionIds,
      partner1Completed: session.partner1Completed,
      partner2Completed: session.partner2Completed,
      score: session.score,
      categoryScores: session.categoryScores,
      scoreLabel: session.scoreLabel,
      expiresAt: session.expiresAt,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load quiz.' })
  }
})

// ── POST /api/quiz/:id/submit ─────────────────────────────────────────────────
// Submit answers — body: { partner: 1 | 2, answers: [{questionId, value}] }
router.post('/:id/submit', [
  body('partner').isIn([1, 2]).withMessage('partner must be 1 or 2'),
  body('answers').isArray({ min: 1 }).withMessage('answers array required'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

  try {
    const session = await QuizSession.findById(req.params.id)
    if (!session) return res.status(404).json({ error: 'Quiz not found or expired.' })

    const { partner, answers } = req.body

    if (partner === 1) {
      if (session.partner1Completed) return res.status(400).json({ error: 'Partner 1 already submitted.' })
      session.partner1Answers = answers
      session.partner1Completed = true
    } else {
      if (session.partner2Completed) return res.status(400).json({ error: 'Partner 2 already submitted.' })
      session.partner2Answers = answers
      session.partner2Completed = true
    }

    // If both done — compute score
    if (session.partner1Completed && session.partner2Completed) {
      const { score, categoryScores, scoreLabel } = computeScore(
        session.questionIds,
        session.partner1Answers,
        session.partner2Answers
      )
      session.score = score
      session.categoryScores = categoryScores
      session.scoreLabel = scoreLabel
    }

    await session.save()

    res.json({
      success: true,
      bothCompleted: session.partner1Completed && session.partner2Completed,
      quizId: session._id,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to submit answers.' })
  }
})

// ── GET /api/quiz/:id/result ──────────────────────────────────────────────────
// Get full result (only after both partners completed)
router.get('/:id/result', async (req, res) => {
  try {
    const session = await QuizSession.findById(req.params.id)
    if (!session) return res.status(404).json({ error: 'Quiz not found or expired.' })

    if (!session.partner1Completed || !session.partner2Completed) {
      return res.status(400).json({
        error: 'Both partners must complete the quiz first.',
        partner1Completed: session.partner1Completed,
        partner2Completed: session.partner2Completed,
      })
    }

    res.json({
      success: true,
      partner1Name: session.partner1Name,
      partner2Name: session.partner2Name,
      score: session.score,
      categoryScores: session.categoryScores,
      scoreLabel: session.scoreLabel,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load result.' })
  }
})

module.exports = router
const mongoose = require('mongoose')

const AnswerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }, // number or string
}, { _id: false })

const QuizSessionSchema = new mongoose.Schema({
  partner1Name: { type: String, required: true, trim: true, maxlength: 60 },
  partner2Name: { type: String, trim: true, maxlength: 60, default: '' },

  // which question IDs were selected for this session (subset of master bank)
  questionIds: [{ type: String }],

  partner1Answers: [AnswerSchema],
  partner2Answers: [AnswerSchema],

  // computed after both partners complete
  score: { type: Number, default: null },          // 0-100
  categoryScores: {                                 // per-category breakdown 0-100
    loveLanguage:  { type: Number, default: null },
    lifestyle:     { type: Number, default: null },
    futureGoals:   { type: Number, default: null },
    dailyHabits:   { type: Number, default: null },
    personality:   { type: Number, default: null },
  },
  scoreLabel: { type: String, default: null },      // e.g. "Soul Mates"

  partner1Completed: { type: Boolean, default: false },
  partner2Completed: { type: Boolean, default: false },

  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
    index: { expires: 0 }, // TTL index — Mongo auto-deletes after expiresAt
  },
}, { timestamps: true })

module.exports = mongoose.model('QuizSession', QuizSessionSchema)

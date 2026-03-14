const mongoose = require('mongoose')

const StorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  clientName: { type: String, required: true, trim: true },
  clientEmail: { type: String, required: true, lowercase: true },
  recipientName: { type: String, required: true, trim: true },
  occasion: {
    type: String,
    enum: ['birthday','romantic','friendship','family','celebration','memorial'],
    required: true,
  },
  theme: {
    type: String,
    enum: ['warm','cinematic','elegant','playful','melancholic','joyful'],
    required: true,
  },
  storyDetails: { type: String, required: true, minlength: 10 },
  uploadedPhotos: [{ type: String }],   // Cloudinary URLs
  musicChoice: { type: String, default: 'none' },
  packageType: {
    type: String,
    enum: ['signature', 'luxe'],
    required: true,
  },
  packagePrice: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  paymentId: { type: String },
  razorpayOrderId: { type: String },
  status: {
    type: String,
    enum: ['submitted', 'in-production', 'review', 'completed'],
    default: 'submitted',
  },
  storyLink: { type: String },
  passwordProtected: { type: Boolean, default: false },
  storyPassword: { type: String, select: false },
  adminNotes: { type: String },
}, { timestamps: true })

// Index for fast user queries
StorySchema.index({ userId: 1, createdAt: -1 })
StorySchema.index({ status: 1 })

module.exports = mongoose.model('Story', StorySchema)

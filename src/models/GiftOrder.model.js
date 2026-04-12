const mongoose = require('mongoose')

const giftOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  razorpayOrderId:  { type: String },
  razorpayPaymentId:{ type: String },
  razorpaySignature:{ type: String },

  items: [{
    productId:   { type: String, required: true },
    productName: { type: String, required: true },
    quantity:    { type: Number, required: true, min: 1 },
    price:       { type: Number, required: true },   // paise
    giftNote:    { type: String, default: '' },
  }],

  recipientName:  { type: String, required: true },
  recipientPhone: { type: String },

  deliveryAddress: {
    line1:   { type: String, required: true },
    line2:   { type: String },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    pincode: { type: String, required: true },
  },

  totalAmount:    { type: Number, required: true },   // paise
  paymentStatus:  { type: String, enum: ['pending','paid','failed'], default: 'pending' },
  orderStatus:    { type: String, enum: ['pending','confirmed','packed','shipped','delivered','cancelled'], default: 'pending' },

  bundledStoryId: { type: String },
  bundleDiscount: { type: Number },

  trackingId:        { type: String },
  estimatedDelivery: { type: String },
}, { timestamps: true })

module.exports = mongoose.model('GiftOrder', giftOrderSchema)

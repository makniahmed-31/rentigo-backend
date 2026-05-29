const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['deposit', 'full', 'installment'], required: true },
  method: { type: String, enum: ['virement', 'cash', 'mandat-minute'], required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
  reference: String,
  confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  confirmedAt: Date,
  notes: String,
}, { timestamps: true })

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema)

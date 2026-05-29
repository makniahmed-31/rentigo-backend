const mongoose = require('mongoose')

const reservationSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestType: { type: String, enum: ['visit', 'reservation'], required: true },
  visitDate: Date,
  visitTime: String,
  startDate: Date,
  endDate: Date,
  duration: Number,
  totalAmount: Number,
  depositAmount: Number,
  paymentMethod: { type: String, enum: ['virement', 'cash', 'mandat-minute'] },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  notes: String,
  adminNotes: String,
  whatsappSent: { type: Boolean, default: false },
  depositPaid: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema)

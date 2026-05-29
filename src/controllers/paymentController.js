const Payment = require('../models/Payment')
const Reservation = require('../models/Reservation')

exports.getPayments = async (req, res) => {
  try {
    const { status, method, page = 1, limit = 20 } = req.query
    const filter = {}
    if (req.user.role !== 'admin') filter.user = req.user.id
    if (status) filter.status = status
    if (method) filter.method = method

    const skip = (Number(page) - 1) * Number(limit)
    const [payments, total] = await Promise.all([
      Payment.find(filter).sort('-createdAt').skip(skip).limit(Number(limit))
        .populate('reservation', 'requestType visitDate')
        .populate('property', 'title images price')
        .populate('user', 'name email'),
      Payment.countDocuments(filter)
    ])
    res.json({ payments, total })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.createPayment = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.body.reservation)
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' })

    const payment = new Payment({
      ...req.body,
      user: req.user.id,
      property: reservation.property,
    })
    await payment.save()
    res.status(201).json(payment)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.confirmPayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'confirmed', confirmedBy: req.user.id, confirmedAt: new Date() },
      { new: true }
    )
    if (!payment) return res.status(404).json({ error: 'Payment not found' })
    await Reservation.findByIdAndUpdate(payment.reservation, { depositPaid: true })
    res.json(payment)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.rejectPayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    )
    if (!payment) return res.status(404).json({ error: 'Payment not found' })
    res.json(payment)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

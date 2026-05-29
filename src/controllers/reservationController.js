const Reservation = require('../models/Reservation')
const Property = require('../models/Property')
const Payment = require('../models/Payment')

exports.getReservations = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const filter = {}
    if (req.user.role !== 'admin') filter.user = req.user.id
    if (status) filter.status = status

    const skip = (Number(page) - 1) * Number(limit)
    const [reservations, total] = await Promise.all([
      Reservation.find(filter).sort('-createdAt').skip(skip).limit(Number(limit))
        .populate('property', 'title images price type location')
        .populate('user', 'name email image phone'),
      Reservation.countDocuments(filter)
    ])
    res.json({ reservations, total })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('property').populate('user', 'name email image phone')
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' })
    if (req.user.role !== 'admin' && reservation.user._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' })
    }
    res.json(reservation)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.createReservation = async (req, res) => {
  try {
    const property = await Property.findById(req.body.property)
    if (!property) return res.status(404).json({ error: 'Property not found' })

    const depositAmount = property.price * 0.3
    const reservation = new Reservation({
      ...req.body,
      user: req.user.id,
      depositAmount,
      totalAmount: property.price,
    })
    await reservation.save()
    res.status(201).json(reservation)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.updateReservationStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
      { new: true }
    ).populate('property', 'title').populate('user', 'name email phone')

    if (!reservation) return res.status(404).json({ error: 'Reservation not found' })
    res.json(reservation)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' })
    if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' })
    }
    reservation.status = 'cancelled'
    await reservation.save()
    res.json(reservation)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

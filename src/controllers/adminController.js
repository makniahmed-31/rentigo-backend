const Property = require('../models/Property')
const Reservation = require('../models/Reservation')
const Payment = require('../models/Payment')
const User = require('../models/User')

exports.getStats = async (req, res) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalProperties, availableProperties,
      totalReservations, pendingReservations, approvedReservations,
      totalUsers,
      totalPayments, confirmedPayments,
      monthlyReservations, lastMonthReservations,
      recentReservations,
      propertyTypeStats,
      reservationsByStatus,
    ] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ status: 'available' }),
      Reservation.countDocuments(),
      Reservation.countDocuments({ status: 'pending' }),
      Reservation.countDocuments({ status: 'approved' }),
      User.countDocuments({ role: 'user' }),
      Payment.countDocuments(),
      Payment.countDocuments({ status: 'confirmed' }),
      Reservation.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Reservation.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Reservation.find({ status: 'pending' }).sort('-createdAt').limit(5)
        .populate('property', 'title images price')
        .populate('user', 'name email image'),
      Property.aggregate([{ $group: { _id: '$propertyType', count: { $sum: 1 } } }]),
      Reservation.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ])

    const confirmedRevenue = await Payment.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    const last6Months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      const count = await Reservation.countDocuments({ createdAt: { $gte: start, $lte: end } })
      last6Months.push({
        month: start.toLocaleString('fr-FR', { month: 'short' }),
        reservations: count
      })
    }

    res.json({
      totalProperties, availableProperties,
      totalReservations, pendingReservations, approvedReservations,
      totalUsers,
      totalPayments, confirmedPayments,
      revenue: confirmedRevenue[0]?.total || 0,
      monthlyReservations, lastMonthReservations,
      recentReservations,
      propertyTypeStats,
      reservationsByStatus,
      last6Months,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role } = req.query
    const filter = role ? { role } : {}
    const skip = (Number(page) - 1) * Number(limit)
    const [users, total] = await Promise.all([
      User.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
      User.countDocuments(filter)
    ])
    res.json({ users, total })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.updateUserRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/reservationController')
const { auth, requireAdmin } = require('../middleware/auth')

router.get('/', auth, ctrl.getReservations)
router.get('/:id', auth, ctrl.getReservation)
router.post('/', auth, ctrl.createReservation)
router.patch('/:id/status', auth, requireAdmin, ctrl.updateReservationStatus)
router.patch('/:id/cancel', auth, ctrl.cancelReservation)

module.exports = router

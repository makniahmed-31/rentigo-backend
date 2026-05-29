const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/paymentController')
const { auth, requireAdmin } = require('../middleware/auth')

router.get('/', auth, ctrl.getPayments)
router.post('/', auth, ctrl.createPayment)
router.patch('/:id/confirm', auth, requireAdmin, ctrl.confirmPayment)
router.patch('/:id/reject', auth, requireAdmin, ctrl.rejectPayment)

module.exports = router

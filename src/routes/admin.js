const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/adminController')
const { auth, requireAdmin } = require('../middleware/auth')

router.get('/stats', auth, requireAdmin, ctrl.getStats)
router.get('/users', auth, requireAdmin, ctrl.getUsers)
router.patch('/users/:id/role', auth, requireAdmin, ctrl.updateUserRole)

module.exports = router

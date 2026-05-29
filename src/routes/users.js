const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/userController')
const { auth } = require('../middleware/auth')

router.post('/sync', ctrl.syncUser)
router.get('/profile', auth, ctrl.getProfile)
router.put('/profile', auth, ctrl.updateProfile)

module.exports = router

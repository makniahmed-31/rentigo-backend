const express = require('express')
const router = express.Router()
const multer = require('multer')
const ctrl = require('../controllers/propertyController')
const { auth, optionalAuth, requireAdmin } = require('../middleware/auth')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

router.get('/', optionalAuth, ctrl.getProperties)
router.get('/featured', ctrl.getFeatured)
router.get('/:id', optionalAuth, ctrl.getProperty)
router.post('/', auth, requireAdmin, ctrl.createProperty)
router.put('/:id', auth, requireAdmin, ctrl.updateProperty)
router.delete('/:id', auth, requireAdmin, ctrl.deleteProperty)
router.post('/upload/images', auth, requireAdmin, upload.array('images', 10), ctrl.uploadImages)

module.exports = router

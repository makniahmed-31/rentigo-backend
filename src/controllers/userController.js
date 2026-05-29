const User = require('../models/User')
const jwt = require('jsonwebtoken')

exports.syncUser = async (req, res) => {
  try {
    const { name, email, image } = req.body
    let user = await User.findOne({ email })
    if (!user) {
      user = await User.create({ name, email, image })
    } else {
      user.name = name
      user.image = image
      await user.save()
    }
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role, name: user.name, image: user.image },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ user, token })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-__v')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, language } = req.body
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, language },
      { new: true, runValidators: true }
    )
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

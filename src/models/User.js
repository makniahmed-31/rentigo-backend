const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  image: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: String,
  language: { type: String, enum: ['fr', 'en'], default: 'fr' },
  emailVerified: Date,
}, { timestamps: true })

module.exports = mongoose.models.User || mongoose.model('User', userSchema)

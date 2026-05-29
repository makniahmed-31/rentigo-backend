const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: String,
}, { _id: false })

const locationSchema = new mongoose.Schema({
  address: String,
  city: String,
  governorate: String,
  lat: Number,
  lng: Number,
}, { _id: false })

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleFr: String,
  titleEn: String,
  description: String,
  descriptionFr: String,
  descriptionEn: String,
  type: { type: String, enum: ['rent', 'sale'], required: true },
  saleType: { type: String, enum: ['immediate', 'sur-plan'] },
  rentType: { type: String, enum: ['long-term', 'short-term'] },
  propertyType: {
    type: String,
    enum: ['apartment', 'villa', 'house', 'commercial', 'terrain', 'office'],
    default: 'apartment'
  },
  status: {
    type: String,
    enum: ['available', 'rented', 'sold', 'pending'],
    default: 'available'
  },
  price: { type: Number, required: true },
  surface: Number,
  rooms: Number,
  bathrooms: Number,
  floor: Number,
  parking: Boolean,
  furnished: Boolean,
  location: locationSchema,
  amenities: [String],
  images: [imageSchema],
  isVerified: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  views: { type: Number, default: 0 },
}, { timestamps: true })

propertySchema.index({ 'location.governorate': 1, type: 1, status: 1, price: 1 })
propertySchema.index({ title: 'text', description: 'text' })

module.exports = mongoose.models.Property || mongoose.model('Property', propertySchema)

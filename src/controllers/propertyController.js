const Property = require('../models/Property')
const cloudinary = require('../config/cloudinary')

exports.getProperties = async (req, res) => {
  try {
    const {
      type, propertyType, governorate, city, minPrice, maxPrice,
      minSurface, maxSurface, rooms, status, featured, search,
      page = 1, limit = 12, sort = '-createdAt'
    } = req.query

    const filter = {}
    if (type) filter.type = type
    if (propertyType) filter.propertyType = propertyType
    if (governorate) filter['location.governorate'] = governorate
    if (city) filter['location.city'] = city
    if (status) filter.status = status
    if (featured === 'true') filter.isFeatured = true
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }
    if (minSurface || maxSurface) {
      filter.surface = {}
      if (minSurface) filter.surface.$gte = Number(minSurface)
      if (maxSurface) filter.surface.$lte = Number(maxSurface)
    }
    if (rooms) filter.rooms = Number(rooms)
    if (search) filter.$text = { $search: search }

    const skip = (Number(page) - 1) * Number(limit)
    const [properties, total] = await Promise.all([
      Property.find(filter).sort(sort).skip(skip).limit(Number(limit)).populate('agent', 'name email image'),
      Property.countDocuments(filter)
    ])

    res.json({ properties, total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('agent', 'name email image phone')
    if (!property) return res.status(404).json({ error: 'Property not found' })
    await Property.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })
    res.json(property)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.createProperty = async (req, res) => {
  try {
    const property = new Property({ ...req.body, agent: req.user.id })
    await property.save()
    res.status(201).json(property)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!property) return res.status(404).json({ error: 'Property not found' })
    res.json(property)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id)
    if (!property) return res.status(404).json({ error: 'Property not found' })
    for (const img of property.images) {
      if (img.publicId) await cloudinary.uploader.destroy(img.publicId)
    }
    res.json({ message: 'Property deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.uploadImages = async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' })
    const uploads = await Promise.all(
      req.files.map(file =>
        cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
          folder: 'rentigo/properties'
        })
      )
    )
    const images = uploads.map(r => ({ url: r.secure_url, publicId: r.public_id }))
    res.json({ images })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getFeatured = async (req, res) => {
  try {
    const properties = await Property.find({ isFeatured: true, status: 'available' })
      .sort('-createdAt').limit(8).populate('agent', 'name image')
    res.json(properties)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

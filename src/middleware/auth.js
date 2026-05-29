const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET)
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.NEXTAUTH_SECRET)
    } catch {}
  }
  next()
}

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

module.exports = { auth, optionalAuth, requireAdmin }

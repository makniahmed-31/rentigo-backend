require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const connectDB = require('./config/database')

const app = express()

connectDB()

app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/properties', require('./routes/properties'))
app.use('/api/reservations', require('./routes/reservations'))
app.use('/api/payments', require('./routes/payments'))
app.use('/api/users', require('./routes/users'))
app.use('/api/admin', require('./routes/admin'))

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Rentigo API running on port ${PORT}`))

const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const mongoose = require('mongoose')
const { connectDBWithRetry } = require('./config/db')
const requireDatabase = require('./middleware/dbMiddleware')
const authRoutes = require('./routes/authRoutes')
const boardRoutes = require('./routes/boardRoutes')
const taskRoutes = require('./routes/taskRoutes')
const aiRoutes = require('./routes/aiRoutes')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// ── Security Hardening ────────────────────────────────────────────────────────
app.use(helmet())

// Rate limiting: max 150 requests per 15 minutes per IP for /api endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', apiLimiter)

// CORS Configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())

app.use('/api/auth', requireDatabase, authRoutes)
app.use('/api/boards', requireDatabase, boardRoutes)
app.use('/api/tasks', requireDatabase, taskRoutes)
app.use('/api/ai', aiRoutes) // No DB needed for AI calls

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date(),
  })
})

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'TaskFlow API Running',
    database:
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
})

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})

connectDBWithRetry()

const server = app.listen(PORT, () => {
  console.log(`TaskFlow server running on port ${PORT}`)
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `Port ${PORT} is already in use. Stop the other server or set a different PORT in .env.`,
    )
    process.exit(1)
  }

  console.error(`Server error: ${error.message}`)
  process.exit(1)
})

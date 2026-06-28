const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
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

app.use(cors())
app.use(express.json())

app.use('/api/auth', requireDatabase, authRoutes)
app.use('/api/boards', requireDatabase, boardRoutes)
app.use('/api/tasks', requireDatabase, taskRoutes)
app.use('/api/ai', aiRoutes) // No DB needed for AI calls

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

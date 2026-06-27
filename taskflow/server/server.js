import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskFlow API is running',
  })
})

app.listen(PORT, () => {
  console.log(`TaskFlow server running on port ${PORT}`)
})

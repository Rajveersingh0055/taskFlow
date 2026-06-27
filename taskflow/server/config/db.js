const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined')
    }

    const connection = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    })

    console.log(`MongoDB connected: ${connection.connection.host}`)
    return true
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`)
    console.error(
      'Check MongoDB Atlas Network Access, your database user credentials, and your MONGO_URI value.',
    )
    return false
  }
}

const connectDBWithRetry = async () => {
  const connected = await connectDB()

  if (!connected) {
    setTimeout(connectDBWithRetry, 30000)
  }
}

module.exports = {
  connectDB,
  connectDBWithRetry,
}

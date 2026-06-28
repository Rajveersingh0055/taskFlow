const mongoose = require('mongoose')

const requireDatabase = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message:
        'Database is not connected. Check MongoDB Atlas Network Access and MONGO_URI.',
    })
  }

  return next()
}

module.exports = requireDatabase

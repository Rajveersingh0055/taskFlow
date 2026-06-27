const bcrypt = require('bcryptjs')
const User = require('../models/User')
const generateToken = require('../utils/generateToken')

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
})

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      })
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
      })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    })

    return res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: buildUserResponse(user),
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
    })
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    return res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: buildUserResponse(user),
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Login failed',
    })
  }
}

const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: buildUserResponse(req.user),
  })
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
}

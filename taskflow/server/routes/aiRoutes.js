const express = require('express')
const { suggestTaskEstimate } = require('../controllers/aiController')
const protect = require('../middleware/authMiddleware')

const router = express.Router()

// All AI routes require authentication (never expose to unauthenticated users)
router.use(protect)

// POST /api/ai/suggest
router.post('/suggest', suggestTaskEstimate)

module.exports = router

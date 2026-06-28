const express = require('express')
const {
  createBoard,
  getBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
} = require('../controllers/boardController')
const protect = require('../middleware/authMiddleware')

const router = express.Router()

// All board routes require authentication
router.use(protect)

router.route('/').post(createBoard).get(getBoards)

router.route('/:id').get(getBoardById).put(updateBoard).delete(deleteBoard)

module.exports = router

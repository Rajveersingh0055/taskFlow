const express = require('express')
const {
  createTask,
  getTasksByBoard,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController')
const protect = require('../middleware/authMiddleware')

const router = express.Router()

// All task routes require authentication
router.use(protect)

// Board-scoped task fetch — must come before /:id to avoid route conflicts
router.get('/board/:boardId', getTasksByBoard)

// General CRUD routes
router.post('/', createTask)
router.route('/:id').get(getTaskById).put(updateTask).delete(deleteTask)

module.exports = router

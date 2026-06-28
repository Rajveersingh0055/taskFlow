const mongoose = require('mongoose')
const Board = require('../models/Board')
const Task = require('../models/Task')

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Check if a MongoDB ObjectId string is valid */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

/** Confirm the task's owner matches the requesting user */
const verifyTaskOwnership = (task, userId) =>
  task.owner.toString() === userId.toString()

/** Confirm the board's owner matches the requesting user */
const verifyBoardOwnership = (board, userId) =>
  board.owner.toString() === userId.toString()

// ─── Create Task ─────────────────────────────────────────────────────────────

/**
 * POST /api/tasks
 * Body: { title, description, priority, status, dueDate, estimatedEffort, board }
 */
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      status,
      dueDate,
      estimatedEffort,
      board: boardId,
    } = req.body

    // ── Validate title ───────────────────────────────────────────────────────
    const trimmedTitle = typeof title === 'string' ? title.trim() : ''

    if (!trimmedTitle) {
      return res
        .status(400)
        .json({ success: false, message: 'Task title is required' })
    }

    if (trimmedTitle.length > 150) {
      return res.status(400).json({
        success: false,
        message: 'Title cannot exceed 150 characters',
      })
    }

    // ── Validate boardId ─────────────────────────────────────────────────────
    if (!boardId || !isValidId(boardId)) {
      return res
        .status(400)
        .json({ success: false, message: 'A valid board id is required' })
    }

    // ── Verify board exists and belongs to this user ─────────────────────────
    const board = await Board.findById(boardId)

    if (!board) {
      return res
        .status(404)
        .json({ success: false, message: 'Board not found' })
    }

    if (!verifyBoardOwnership(board, req.user._id)) {
      return res
        .status(403)
        .json({ success: false, message: 'Access denied' })
    }

    // ── Build task payload ───────────────────────────────────────────────────
    const taskData = {
      title: trimmedTitle,
      description:
        typeof description === 'string' ? description.trim() : '',
      board: boardId,
      owner: req.user._id,
    }

    if (priority) taskData.priority = priority
    if (status) taskData.status = status
    if (dueDate) taskData.dueDate = dueDate
    if (estimatedEffort)
      taskData.estimatedEffort =
        typeof estimatedEffort === 'string' ? estimatedEffort.trim() : ''

    const task = await Task.create(taskData)

    return res.status(201).json({ success: true, task })
  } catch (error) {
    console.error('createTask error:', error)

    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message)
      return res
        .status(400)
        .json({ success: false, message: messages.join(', ') })
    }

    return res
      .status(500)
      .json({ success: false, message: 'Failed to create task' })
  }
}

// ─── Get Tasks by Board ───────────────────────────────────────────────────────

/**
 * GET /api/tasks/board/:boardId
 * Returns all tasks for a board, newest first.
 */
const getTasksByBoard = async (req, res) => {
  try {
    const { boardId } = req.params

    if (!isValidId(boardId)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid board id' })
    }

    // Verify board exists and belongs to user
    const board = await Board.findById(boardId)

    if (!board) {
      return res
        .status(404)
        .json({ success: false, message: 'Board not found' })
    }

    if (!verifyBoardOwnership(board, req.user._id)) {
      return res
        .status(403)
        .json({ success: false, message: 'Access denied' })
    }

    const tasks = await Task.find({ board: boardId }).sort({ createdAt: -1 })

    return res.status(200).json({ success: true, tasks })
  } catch (error) {
    console.error('getTasksByBoard error:', error)
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch tasks' })
  }
}

// ─── Get Task by ID ───────────────────────────────────────────────────────────

/**
 * GET /api/tasks/:id
 * Returns a single task after verifying ownership.
 */
const getTaskById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid task id' })
    }

    const task = await Task.findById(req.params.id)

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: 'Task not found' })
    }

    if (!verifyTaskOwnership(task, req.user._id)) {
      return res
        .status(403)
        .json({ success: false, message: 'Access denied' })
    }

    return res.status(200).json({ success: true, task })
  } catch (error) {
    console.error('getTaskById error:', error)
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch task' })
  }
}

// ─── Update Task ──────────────────────────────────────────────────────────────

/**
 * PUT /api/tasks/:id
 * Allows partial update of allowed fields.
 */
const updateTask = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid task id' })
    }

    const task = await Task.findById(req.params.id)

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: 'Task not found' })
    }

    if (!verifyTaskOwnership(task, req.user._id)) {
      return res
        .status(403)
        .json({ success: false, message: 'Access denied' })
    }

    const { title, description, priority, status, dueDate, estimatedEffort } =
      req.body

    // ── Apply updates conditionally ──────────────────────────────────────────
    if (title !== undefined) {
      const trimmedTitle = typeof title === 'string' ? title.trim() : ''

      if (!trimmedTitle) {
        return res.status(400).json({
          success: false,
          message: 'Title must be a non-empty string',
        })
      }

      if (trimmedTitle.length > 150) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot exceed 150 characters',
        })
      }

      task.title = trimmedTitle
    }

    if (description !== undefined) {
      task.description =
        typeof description === 'string' ? description.trim() : ''
    }

    if (priority !== undefined) task.priority = priority
    if (status !== undefined) task.status = status

    // Allow clearing dueDate by passing null or empty string
    if (dueDate !== undefined) {
      task.dueDate = dueDate === '' || dueDate === null ? null : dueDate
    }

    if (estimatedEffort !== undefined) {
      task.estimatedEffort =
        typeof estimatedEffort === 'string' ? estimatedEffort.trim() : ''
    }

    const updated = await task.save()

    return res.status(200).json({ success: true, task: updated })
  } catch (error) {
    console.error('updateTask error:', error)

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message)
      return res
        .status(400)
        .json({ success: false, message: messages.join(', ') })
    }

    return res
      .status(500)
      .json({ success: false, message: 'Failed to update task' })
  }
}

// ─── Delete Task ──────────────────────────────────────────────────────────────

/**
 * DELETE /api/tasks/:id
 * Deletes a task after verifying ownership.
 */
const deleteTask = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid task id' })
    }

    const task = await Task.findById(req.params.id)

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: 'Task not found' })
    }

    if (!verifyTaskOwnership(task, req.user._id)) {
      return res
        .status(403)
        .json({ success: false, message: 'Access denied' })
    }

    await task.deleteOne()

    return res
      .status(200)
      .json({ success: true, message: 'Task deleted successfully' })
  } catch (error) {
    console.error('deleteTask error:', error)
    return res
      .status(500)
      .json({ success: false, message: 'Failed to delete task' })
  }
}

module.exports = {
  createTask,
  getTasksByBoard,
  getTaskById,
  updateTask,
  deleteTask,
}

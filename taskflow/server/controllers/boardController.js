const mongoose = require('mongoose')
const Board = require('../models/Board')
const Task = require('../models/Task')

// ─── Helpers ────────────────────────────────────────────────────────────────

const verifyOwnership = (board, userId) =>
  board.owner.toString() === userId.toString()

const isValidBoardId = (id) => mongoose.Types.ObjectId.isValid(id)

// ─── Create Board ────────────────────────────────────────────────────────────

const createBoard = async (req, res) => {
  try {
    const { title, description } = req.body

    const trimmedTitle = typeof title === 'string' ? title.trim() : ''

    if (!trimmedTitle) {
      return res.status(400).json({ success: false, message: 'Title is required' })
    }

    if (trimmedTitle.length > 100) {
      return res.status(400).json({ success: false, message: 'Title cannot exceed 100 characters' })
    }

    const trimmedDescription = description == null
      ? ''
      : typeof description === 'string'
        ? description.trim()
        : null

    if (trimmedDescription === null) {
      return res.status(400).json({ success: false, message: 'Description must be a string' })
    }

    const board = await Board.create({
      title: trimmedTitle,
      description: trimmedDescription,
      owner: req.user._id,
    })

    return res.status(201).json({ success: true, board })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Failed to create board',
    })
  }
}

// ─── Get All Boards (current user only) ─────────────────────────────────────

const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ owner: req.user._id }).sort({ createdAt: -1 })
    return res.status(200).json({ success: true, boards })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch boards',
    })
  }
}

// ─── Get Single Board ────────────────────────────────────────────────────────

const getBoardById = async (req, res) => {
  try {
    if (!isValidBoardId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid board id' })
    }

    const board = await Board.findById(req.params.id)

    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' })
    }

    if (!verifyOwnership(board, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    return res.status(200).json({ success: true, board })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch board',
    })
  }
}

// ─── Update Board ────────────────────────────────────────────────────────────

const updateBoard = async (req, res) => {
  try {
    const { title, description } = req.body

    if (!isValidBoardId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid board id' })
    }

    const board = await Board.findById(req.params.id)

    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' })
    }

    if (!verifyOwnership(board, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    if (title !== undefined) {
      const trimmedTitle = typeof title === 'string' ? title.trim() : ''

      if (!trimmedTitle) {
        return res.status(400).json({ success: false, message: 'Title must be a non-empty string' })
      }

      if (trimmedTitle.length > 100) {
        return res.status(400).json({ success: false, message: 'Title cannot exceed 100 characters' })
      }

      board.title = trimmedTitle
    }

    if (description !== undefined) {
      if (description === null) {
        board.description = ''
      } else if (typeof description !== 'string') {
        return res.status(400).json({ success: false, message: 'Description must be a string' })
      } else {
        board.description = description.trim()
      }
    }

    const updated = await board.save()

    return res.status(200).json({ success: true, board: updated })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Failed to update board',
    })
  }
}

// ─── Delete Board ────────────────────────────────────────────────────────────

const deleteBoard = async (req, res) => {
  try {
    if (!isValidBoardId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid board id' })
    }

    const board = await Board.findById(req.params.id)

    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' })
    }

    if (!verifyOwnership(board, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    // Cascade: remove all tasks belonging to this board
    await Task.deleteMany({ board: board._id })

    await board.deleteOne()

    return res.status(200).json({ success: true, message: 'Board deleted' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Failed to delete board',
    })
  }
}

module.exports = { createBoard, getBoards, getBoardById, updateBoard, deleteBoard }

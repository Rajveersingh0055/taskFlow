const mongoose = require('mongoose')
const Board = require('../models/Board')

// ─── Helpers ────────────────────────────────────────────────────────────────

const verifyOwnership = (board, userId) =>
  board.owner.toString() === userId.toString()

const isValidBoardId = (id) => mongoose.Types.ObjectId.isValid(id)

// ─── Create Board ────────────────────────────────────────────────────────────

const createBoard = async (req, res) => {
  try {
    const { title, description } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' })
    }

    const board = await Board.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      owner: req.user._id,
    })

    return res.status(201).json({ success: true, board })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create board',
    })
  }
}

// ─── Get All Boards (current user only) ─────────────────────────────────────

const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ owner: req.user._id }).sort({ createdAt: -1 })
    return res.status(200).json({ success: true, boards })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch boards',
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
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch board',
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
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Title must be a non-empty string' })
      }
      board.title = title.trim()
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
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update board',
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

    await board.deleteOne()

    return res.status(200).json({ success: true, message: 'Board deleted' })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete board',
    })
  }
}

module.exports = { createBoard, getBoards, getBoardById, updateBoard, deleteBoard }

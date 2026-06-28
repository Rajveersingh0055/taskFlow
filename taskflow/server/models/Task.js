const mongoose = require('mongoose')

/**
 * Task Schema
 * Belongs to a Board and is owned by a User.
 * Tracks status, priority, due date, and estimated effort.
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    status: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'done'],
        message: 'Status must be todo, in-progress, or done',
      },
      default: 'todo',
    },

    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be low, medium, or high',
      },
      default: 'medium',
    },

    dueDate: {
      type: Date,
      default: null,
    },

    estimatedEffort: {
      type: String,
      default: '',
      trim: true,
    },

    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: [true, 'Board reference is required'],
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
  },
  { timestamps: true },
)

// Index for fast board-scoped queries
taskSchema.index({ board: 1, createdAt: -1 })

module.exports = mongoose.model('Task', taskSchema)

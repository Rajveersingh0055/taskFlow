const { generateTaskSuggestion } = require('../services/aiService')

// ─── Fallback suggestion ──────────────────────────────────────────────────────

const FALLBACK_SUGGESTION = {
  estimatedEffort: '2-4 hours',
  suggestedDueDate: null,
  reasoning:
    'AI service is currently unavailable. This is a default estimate — please adjust based on task complexity.',
}

// ─── POST /api/ai/suggest ─────────────────────────────────────────────────────

/**
 * Accepts { title, description } and returns an AI-generated estimation.
 * Always returns HTTP 200 — uses fallback if AI is unavailable.
 */
const suggestTaskEstimate = async (req, res) => {
  try {
    const { title, description = '' } = req.body

    // Validate required field
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required for AI suggestion',
      })
    }

    const suggestion = await generateTaskSuggestion(
      title.trim(),
      typeof description === 'string' ? description.trim() : '',
    )

    // If AI returned null (any error), use fallback
    if (!suggestion) {
      return res.status(200).json({
        success: true,
        fallback: true,
        suggestion: FALLBACK_SUGGESTION,
      })
    }

    return res.status(200).json({
      success: true,
      fallback: false,
      suggestion,
    })
  } catch (error) {
    // Last-resort safety net — still return fallback, never 500
    console.error('[aiController] Unexpected error:', error)
    return res.status(200).json({
      success: true,
      fallback: true,
      suggestion: FALLBACK_SUGGESTION,
    })
  }
}

module.exports = { suggestTaskEstimate }

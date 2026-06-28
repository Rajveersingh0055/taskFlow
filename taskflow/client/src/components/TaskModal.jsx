import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { getSuggestion } from '../services/aiService'

// ─── Options ─────────────────────────────────────────────────────────────────

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

// ─── AI Suggestion Panel ──────────────────────────────────────────────────────

function SuggestionPanel({ suggestion, isFallback, onAccept, onIgnore }) {
  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-lg">✨</span>
        <span className="text-sm font-bold text-violet-800">
          AI Suggestion
          {isFallback && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
              Fallback
            </span>
          )}
        </span>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-white p-2.5 shadow-sm">
          <p className="font-semibold text-violet-600 uppercase tracking-wide text-[10px]">
            Estimated Effort
          </p>
          <p className="mt-1 font-bold text-slate-800">
            {suggestion.estimatedEffort || '—'}
          </p>
        </div>
        <div className="rounded-lg bg-white p-2.5 shadow-sm">
          <p className="font-semibold text-violet-600 uppercase tracking-wide text-[10px]">
            Suggested Due Date
          </p>
          <p className="mt-1 font-bold text-slate-800">
            {suggestion.suggestedDueDate
              ? new Date(suggestion.suggestedDueDate).toLocaleDateString(
                  'en-US',
                  { month: 'short', day: 'numeric', year: 'numeric' },
                )
              : '—'}
          </p>
        </div>
      </div>

      {/* Reasoning */}
      <p className="text-xs text-slate-600 italic leading-relaxed">
        {suggestion.reasoning}
      </p>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          id="ai-accept-btn"
          onClick={onAccept}
          className="flex-1 rounded-lg bg-violet-600 py-2 text-xs font-semibold text-white transition hover:bg-violet-700 active:scale-95"
        >
          ✓ Accept
        </button>
        <button
          type="button"
          id="ai-ignore-btn"
          onClick={onIgnore}
          className="flex-1 rounded-lg border border-violet-200 bg-white py-2 text-xs font-semibold text-slate-700 transition hover:bg-violet-50 active:scale-95"
        >
          Ignore
        </button>
      </div>
    </div>
  )
}

// ─── Task Modal ───────────────────────────────────────────────────────────────

/**
 * TaskModal — reusable create / edit modal for tasks.
 * Props:
 *  - initialData: task object (edit mode) or partial { status } (create mode)
 *  - boardId: required in create mode
 *  - onSubmit(formData): called with form payload
 *  - onClose(): called to dismiss modal
 */
function TaskModal({ initialData = null, boardId, onSubmit, onClose }) {
  // Edit mode only when initialData has an _id (existing task)
  const isEditing = Boolean(initialData?._id)

  const [formData, setFormData] = useState({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    priority: initialData?.priority ?? 'medium',
    status: initialData?.status ?? 'todo',
    dueDate: initialData?.dueDate
      ? new Date(initialData.dueDate).toISOString().split('T')[0]
      : '',
    estimatedEffort: initialData?.estimatedEffort ?? '',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  // ── AI Suggestion state ──────────────────────────────────────────────────────
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [suggestion, setSuggestion] = useState(null)
  const [suggestionIsFallback, setSuggestionIsFallback] = useState(false)

  const titleRef = useRef(null)

  // Auto-focus title on open
  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    // Clear suggestion if title/description changes
    if (name === 'title' || name === 'description') setSuggestion(null)
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    else if (formData.title.trim().length > 150)
      newErrors.title = 'Title cannot exceed 150 characters'
    return newErrors
  }

  // ── AI Suggest handler ───────────────────────────────────────────────────────

  const handleSuggest = async () => {
    const titleTrimmed = formData.title.trim()
    if (!titleTrimmed) {
      setErrors({ title: 'Enter a title first to get AI suggestions' })
      return
    }

    try {
      setIsSuggesting(true)
      setSuggestion(null)

      const result = await getSuggestion({
        title: titleTrimmed,
        description: formData.description.trim(),
      })

      setSuggestion(result.suggestion)
      setSuggestionIsFallback(result.fallback === true)

      if (result.fallback) {
        toast('AI unavailable — showing default estimate', {
          icon: '⚠️',
          style: { background: '#78350f', color: '#fff' },
        })
      } else {
        toast.success('AI suggestion loaded!')
      }
    } catch (err) {
      toast.error('Could not fetch AI suggestion')
      console.error(err)
    } finally {
      setIsSuggesting(false)
    }
  }

  // ── Accept AI suggestion ─────────────────────────────────────────────────────

  const handleAcceptSuggestion = () => {
    setFormData((prev) => ({
      ...prev,
      estimatedEffort: suggestion.estimatedEffort || prev.estimatedEffort,
      dueDate: suggestion.suggestedDueDate
        ? suggestion.suggestedDueDate.split('T')[0]
        : prev.dueDate,
    }))
    setSuggestion(null)
    toast.success('Estimate applied ✓')
  }

  // ── Form submit ──────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setApiError('')
      setIsSubmitting(true)

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate || null,
        estimatedEffort: formData.estimatedEffort.trim(),
      }

      if (!isEditing) payload.board = boardId

      await onSubmit(payload)
    } catch (err) {
      setApiError(
        err.response?.data?.message || 'Something went wrong. Please try again.',
      )
      setIsSubmitting(false)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            id="task-modal-title"
            className="text-lg font-bold text-slate-900"
          >
            {isEditing ? 'Edit Task' : 'Create Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          {/* ── Title ──────────────────────────────────────────────────────── */}
          <div>
            <label
              htmlFor="task-title"
              className="block text-sm font-medium text-slate-700"
            >
              Title <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              ref={titleRef}
              id="task-title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Design homepage mockup"
              maxLength={150}
              autoComplete="off"
              className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
                errors.title
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-300 focus:border-primary-500 focus:ring-primary-100'
              }`}
            />
            {errors.title ? (
              <p className="mt-1 text-xs text-red-600">{errors.title}</p>
            ) : (
              <p className="mt-1 text-right text-xs text-slate-400">
                {formData.title.length}/150
              </p>
            )}
          </div>

          {/* ── Description ────────────────────────────────────────────────── */}
          <div>
            <label
              htmlFor="task-description"
              className="block text-sm font-medium text-slate-700"
            >
              Description{' '}
              <span className="text-xs font-normal text-slate-400">
                (optional)
              </span>
            </label>
            <textarea
              id="task-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the task…"
              rows={3}
              className="mt-1.5 w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          {/* ── AI Suggest Button ───────────────────────────────────────────── */}
          <div>
            <button
              type="button"
              id="ai-suggest-btn"
              onClick={handleSuggest}
              disabled={isSuggesting}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-300 bg-violet-50 py-2.5 text-sm font-semibold text-violet-700 transition hover:border-violet-400 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
            >
              {isSuggesting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400 border-t-violet-700" />
                  Asking AI…
                </>
              ) : (
                <>
                  <span>✨</span>
                  Suggest Estimate with AI
                </>
              )}
            </button>
          </div>

          {/* ── AI Suggestion Panel ─────────────────────────────────────────── */}
          {suggestion && (
            <SuggestionPanel
              suggestion={suggestion}
              isFallback={suggestionIsFallback}
              onAccept={handleAcceptSuggestion}
              onIgnore={() => setSuggestion(null)}
            />
          )}

          {/* ── Priority + Status (row) ─────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="task-priority"
                className="block text-sm font-medium text-slate-700"
              >
                Priority
              </label>
              <select
                id="task-priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status — only shown in edit mode */}
            {isEditing && (
              <div>
                <label
                  htmlFor="task-status"
                  className="block text-sm font-medium text-slate-700"
                >
                  Status
                </label>
                <select
                  id="task-status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ── Due Date + Estimated Effort (row) ──────────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="task-dueDate"
                className="block text-sm font-medium text-slate-700"
              >
                Due Date{' '}
                <span className="text-xs font-normal text-slate-400">
                  (optional)
                </span>
              </label>
              <input
                id="task-dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>

            <div>
              <label
                htmlFor="task-estimatedEffort"
                className="block text-sm font-medium text-slate-700"
              >
                Est. Effort{' '}
                <span className="text-xs font-normal text-slate-400">
                  (optional)
                </span>
              </label>
              <input
                id="task-estimatedEffort"
                name="estimatedEffort"
                type="text"
                value={formData.estimatedEffort}
                onChange={handleChange}
                placeholder="e.g. 2h, 3 days"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>

          {/* ── Actions ────────────────────────────────────────────────────── */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70 active:scale-95"
            >
              {isSubmitting
                ? isEditing
                  ? 'Saving…'
                  : 'Creating…'
                : isEditing
                  ? 'Save Changes'
                  : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskModal

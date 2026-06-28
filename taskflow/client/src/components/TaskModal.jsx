import { useEffect, useRef, useState } from 'react'

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

/**
 * TaskModal — reusable create / edit modal for tasks.
 * Props:
 *  - initialData: task object (edit mode) or null (create mode)
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
    // Clear field error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    else if (formData.title.trim().length > 150)
      newErrors.title = 'Title cannot exceed 150 characters'
    return newErrors
  }

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

      // In create mode attach the boardId
      if (!isEditing) payload.board = boardId

      await onSubmit(payload)
    } catch (err) {
      setApiError(
        err.response?.data?.message || 'Something went wrong. Please try again.',
      )
      setIsSubmitting(false)
    }
  }

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
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10 max-h-[90vh] overflow-y-auto">
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
          {/* ── Title ─────────────────────────────────────────────────────── */}
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

          {/* ── Description ───────────────────────────────────────────────── */}
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
              placeholder="Describe the task..."
              rows={3}
              className="mt-1.5 w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          {/* ── Priority + Status (row) ────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
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

          {/* ── Due Date + Estimated Effort (row) ─────────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
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

            {/* Estimated Effort */}
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

          {/* ── Actions ───────────────────────────────────────────────────── */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70 active:scale-95"
            >
              {isSubmitting
                ? isEditing
                  ? 'Saving...'
                  : 'Creating...'
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

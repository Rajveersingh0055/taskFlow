import { useEffect, useRef, useState } from 'react'

function BoardModal({ title, initialData = null, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const titleRef = useRef(null)

  // Auto-focus title field on open
  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    try {
      setError('')
      setIsSubmitting(true)
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  const isEditing = Boolean(initialData)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            id="modal-title"
            className="text-lg font-bold text-slate-900"
          >
            {title}
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

        {/* Error banner */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          {/* Title */}
          <div>
            <label
              htmlFor="board-title"
              className="block text-sm font-medium text-slate-700"
            >
              Title <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              ref={titleRef}
              id="board-title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Personal Project"
              maxLength={100}
              autoComplete="off"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {formData.title.length}/100
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="board-description"
              className="block text-sm font-medium text-slate-700"
            >
              Description{' '}
              <span className="text-xs font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="board-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What is this board for?"
              rows={3}
              className="mt-1.5 w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70 active:scale-95"
            >
              {isSubmitting
                ? isEditing ? 'Saving...' : 'Creating...'
                : isEditing ? 'Save Changes' : 'Create Board'}
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

export default BoardModal

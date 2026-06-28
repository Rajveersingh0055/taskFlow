import { useEffect, useState } from 'react'

function DeleteBoardModal({ board, onConfirm, onClose }) {
  const [isDeleting, setIsDeleting] = useState(false)

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && !isDeleting) onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isDeleting, onClose])

  const handleConfirm = async () => {
    try {
      setIsDeleting(true)
      await onConfirm()
    } catch {
      setIsDeleting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={!isDeleting ? onClose : undefined}
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10">
        {/* Icon + Heading */}
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-2xl">
            🗑️
          </div>
          <div>
            <h2
              id="delete-modal-title"
              className="text-base font-bold text-slate-900"
            >
              Delete Board
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Confirmation text */}
        <p className="mt-4 text-sm text-slate-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-slate-900">
            &ldquo;{board.title}&rdquo;
          </span>
          ? All data in this board will be permanently removed.
        </p>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 active:scale-95"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteBoardModal

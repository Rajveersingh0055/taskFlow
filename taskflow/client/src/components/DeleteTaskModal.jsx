/**
 * DeleteTaskModal — confirmation dialog before deleting a task.
 * Props:
 *  - task: task object being deleted
 *  - onConfirm(): called when user clicks Delete
 *  - onClose(): called to dismiss without deleting
 *  - isDeleting: boolean — disables buttons while request is in-flight
 */
function DeleteTaskModal({ task, onConfirm, onClose, isDeleting = false }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-task-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={!isDeleting ? onClose : undefined}
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10">
        {/* Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <span className="text-2xl" aria-hidden="true">
            🗑️
          </span>
        </div>

        {/* Content */}
        <h2
          id="delete-task-title"
          className="mt-4 text-base font-bold text-slate-900"
        >
          Delete Task
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Are you sure you want to delete{' '}
          <strong className="text-slate-700">"{task.title}"</strong>? This
          action cannot be undone.
        </p>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            id="confirm-delete-task-btn"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 active:scale-95"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 active:scale-95"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteTaskModal

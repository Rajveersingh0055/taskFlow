// ─── Priority config ─────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  low: {
    label: 'Low',
    color: 'text-emerald-700',
    bg: 'bg-emerald-100',
    dot: 'bg-emerald-500',
  },
  medium: {
    label: 'Medium',
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    dot: 'bg-amber-500',
  },
  high: {
    label: 'High',
    color: 'text-red-700',
    bg: 'bg-red-100',
    dot: 'bg-red-500',
  },
}

// ─── Status cycle ─────────────────────────────────────────────────────────────

const STATUS_CYCLE = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: 'todo',
}

const STATUS_NEXT_LABEL = {
  todo: '▶ Start',
  'in-progress': '✓ Complete',
  done: '↺ Reopen',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const isOverdue = (dateStr) => {
  if (!dateStr) return false
  return new Date(dateStr) < new Date(new Date().toDateString())
}

/**
 * TaskCard — displays a single task with priority badge, due date,
 * effort chip, and action buttons.
 *
 * Props:
 *  - task: task object
 *  - onEdit(): open edit modal
 *  - onDelete(): open delete modal
 *  - onMoveStatus(): advance status in cycle
 *  - isMoving: boolean — disables move button while updating
 */
function TaskCard({ task, onEdit, onDelete, onMoveStatus, isMoving = false }) {
  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium
  const overdue = isOverdue(task.dueDate)

  return (
    <article className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* ── Header row ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
          {task.title}
        </h4>

        {/* Priority badge */}
        <span
          className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${priority.bg} ${priority.color}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
          {priority.label}
        </span>
      </div>

      {/* ── Description preview ────────────────────────────────────────────── */}
      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* ── Meta chips ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {task.dueDate && (
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
              overdue
                ? 'bg-red-50 text-red-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            📅{' '}
            {overdue && <span className="font-bold">Overdue · </span>}
            {formatDate(task.dueDate)}
          </span>
        )}

        {task.estimatedEffort && (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
            ⏱ {task.estimatedEffort}
          </span>
        )}
      </div>

      {/* ── Action buttons ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 border-t border-slate-100 pt-3">
        {/* Move Status */}
        <button
          type="button"
          id={`move-status-${task._id}`}
          onClick={onMoveStatus}
          disabled={isMoving}
          title={`Move to ${STATUS_CYCLE[task.status]}`}
          className="flex-1 rounded-md bg-slate-50 py-1.5 text-center text-xs font-semibold text-slate-700 transition hover:bg-primary-50 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
        >
          {isMoving ? '...' : STATUS_NEXT_LABEL[task.status]}
        </button>

        {/* Edit */}
        <button
          type="button"
          id={`edit-task-${task._id}`}
          onClick={onEdit}
          aria-label={`Edit ${task.title}`}
          className="rounded-md px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95"
        >
          ✏️
        </button>

        {/* Delete */}
        <button
          type="button"
          id={`delete-task-${task._id}`}
          onClick={onDelete}
          aria-label={`Delete ${task.title}`}
          className="rounded-md px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-700 active:scale-95"
        >
          🗑️
        </button>
      </div>
    </article>
  )
}

export default TaskCard

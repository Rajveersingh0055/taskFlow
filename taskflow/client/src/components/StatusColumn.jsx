import TaskCard from './TaskCard.jsx'

// ─── Column config ────────────────────────────────────────────────────────────

const COLUMN_CONFIG = {
  todo: {
    label: 'To Do',
    icon: '📋',
    headerColor: 'text-slate-700',
    headerBg: 'bg-slate-100',
    accentBar: 'bg-slate-400',
  },
  'in-progress': {
    label: 'In Progress',
    icon: '⚡',
    headerColor: 'text-blue-700',
    headerBg: 'bg-blue-50',
    accentBar: 'bg-blue-500',
  },
  done: {
    label: 'Done',
    icon: '✅',
    headerColor: 'text-emerald-700',
    headerBg: 'bg-emerald-50',
    accentBar: 'bg-emerald-500',
  },
}

/**
 * StatusColumn — renders a single Kanban column with its tasks.
 *
 * Props:
 *  - status: 'todo' | 'in-progress' | 'done'
 *  - tasks: array of task objects
 *  - movingTaskId: id of task currently being moved (for loading state)
 *  - onCreateTask(): open create modal pre-set to this status
 *  - onEdit(task): open edit modal
 *  - onDelete(task): open delete modal
 *  - onMoveStatus(task): advance task status
 */
function StatusColumn({
  status,
  tasks,
  movingTaskId,
  onCreateTask,
  onEdit,
  onDelete,
  onMoveStatus,
}) {
  const config = COLUMN_CONFIG[status]

  return (
    <section
      aria-label={`${config.label} column`}
      className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden"
    >
      {/* ── Column Header ─────────────────────────────────────────────────── */}
      <div className={`flex items-center justify-between px-4 py-3 ${config.headerBg}`}>
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden="true">
            {config.icon}
          </span>
          <h3 className={`text-sm font-bold ${config.headerColor}`}>
            {config.label}
          </h3>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${config.headerBg} ${config.headerColor} border border-current/20`}
          >
            {tasks.length}
          </span>
        </div>

        {/* Quick-add button */}
        <button
          type="button"
          id={`add-task-${status}`}
          onClick={onCreateTask}
          aria-label={`Add task to ${config.label}`}
          className={`flex h-7 w-7 items-center justify-center rounded-lg text-lg leading-none transition hover:bg-white/60 ${config.headerColor}`}
        >
          +
        </button>
      </div>

      {/* ── Accent bar ────────────────────────────────────────────────────── */}
      <div className={`h-0.5 ${config.accentBar}`} />

      {/* ── Task list ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-3 p-3 min-h-[200px]">
        {tasks.length === 0 ? (
          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-10 text-center">
            <span className="text-3xl" aria-hidden="true">
              📭
            </span>
            <p className="mt-2 text-xs font-medium text-slate-400">
              No tasks here
            </p>
            <button
              type="button"
              onClick={onCreateTask}
              className="mt-3 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 active:scale-95"
            >
              + Add Task
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              isMoving={movingTaskId === task._id}
              onEdit={() => onEdit(task)}
              onDelete={() => onDelete(task)}
              onMoveStatus={() => onMoveStatus(task)}
            />
          ))
        )}
      </div>
    </section>
  )
}

export default StatusColumn

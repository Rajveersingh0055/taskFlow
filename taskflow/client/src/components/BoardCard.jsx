const ACCENT_COLORS = [
  '#8b5cf6', // violet
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#14b8a6', // teal
]

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

function BoardCard({ board, index, onEdit, onDelete }) {
  const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length]

  return (
    <article
      className="group flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      {/* Card Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3
          className="truncate text-base font-bold text-slate-900"
          title={board.title}
        >
          {board.title}
        </h3>

        {board.description ? (
          <p className="mt-2 text-sm leading-relaxed text-slate-500 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
            {board.description}
          </p>
        ) : (
          <p className="mt-2 text-sm italic text-slate-400">No description</p>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <time
          dateTime={board.createdAt}
          className="text-xs text-slate-400"
        >
          {formatDate(board.createdAt)}
        </time>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${board.title}`}
            className="rounded-md px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${board.title}`}
            className="rounded-md px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 active:scale-95"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}

export default BoardCard

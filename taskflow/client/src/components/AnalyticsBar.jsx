import { useMemo } from 'react'

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, gradient, textColor }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-4 ${gradient} shadow-sm`}
    >
      {/* Background decoration */}
      <div className="absolute -right-3 -top-3 text-5xl opacity-10 select-none">
        {icon}
      </div>

      <div className="relative">
        <p className={`text-xs font-semibold uppercase tracking-wide ${textColor} opacity-70`}>
          {label}
        </p>
        <p className={`mt-1 text-3xl font-bold ${textColor}`}>{value}</p>
      </div>
    </div>
  )
}

// ─── Analytics Bar ────────────────────────────────────────────────────────────

/**
 * AnalyticsBar — displays 6 stat cards computed from boards + tasks data.
 * Props:
 *  - boards: array of board objects
 *  - tasks: array of task objects (all tasks across all boards)
 *  - loadingTasks: boolean
 */
function AnalyticsBar({ boards = [], tasks = [], loadingTasks = false }) {
  const stats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const done = tasks.filter((t) => t.status === 'done').length
    const pending = tasks.filter((t) => t.status !== 'done').length
    const highPriority = tasks.filter((t) => t.priority === 'high').length
    const overdue = tasks.filter((t) => {
      if (!t.dueDate || t.status === 'done') return false
      return new Date(t.dueDate) < today
    }).length

    return {
      totalBoards: boards.length,
      totalTasks: tasks.length,
      done,
      pending,
      highPriority,
      overdue,
    }
  }, [boards, tasks])

  const cards = [
    {
      label: 'Boards',
      value: stats.totalBoards,
      icon: '📋',
      gradient: 'bg-gradient-to-br from-violet-500 to-purple-600',
      textColor: 'text-white',
    },
    {
      label: 'Total Tasks',
      value: loadingTasks ? '…' : stats.totalTasks,
      icon: '📝',
      gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      textColor: 'text-white',
    },
    {
      label: 'Completed',
      value: loadingTasks ? '…' : stats.done,
      icon: '✅',
      gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      textColor: 'text-white',
    },
    {
      label: 'Pending',
      value: loadingTasks ? '…' : stats.pending,
      icon: '⏳',
      gradient: 'bg-gradient-to-br from-amber-400 to-orange-500',
      textColor: 'text-white',
    },
    {
      label: 'High Priority',
      value: loadingTasks ? '…' : stats.highPriority,
      icon: '🔴',
      gradient: 'bg-gradient-to-br from-rose-500 to-red-600',
      textColor: 'text-white',
    },
    {
      label: 'Overdue',
      value: loadingTasks ? '…' : stats.overdue,
      icon: '⚠️',
      gradient:
        stats.overdue > 0
          ? 'bg-gradient-to-br from-red-700 to-rose-800'
          : 'bg-gradient-to-br from-slate-500 to-slate-600',
      textColor: 'text-white',
    },
  ]

  return (
    <section aria-label="Analytics overview" className="mb-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
    </section>
  )
}

export default AnalyticsBar

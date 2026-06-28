import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DeleteTaskModal from '../components/DeleteTaskModal.jsx'
import StatusColumn from '../components/StatusColumn.jsx'
import TaskModal from '../components/TaskModal.jsx'
import { getBoardById } from '../services/boardService'
import {
  createTask,
  deleteTask,
  getTasksByBoard,
  updateTask,
} from '../services/taskService'

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUSES = ['todo', 'in-progress', 'done']

const PRIORITY_FILTERS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'low', label: '🟢 Low' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'high', label: '🔴 High' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'due-asc', label: 'Due Date ↑' },
  { value: 'due-desc', label: 'Due Date ↓' },
]

// ─── Skeleton Loader ─────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex justify-between gap-2">
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="h-5 w-14 rounded-full bg-slate-200" />
      </div>
      <div className="h-3 w-full rounded bg-slate-100" />
      <div className="h-3 w-2/3 rounded bg-slate-100" />
      <div className="flex gap-2 pt-1">
        <div className="h-6 w-16 rounded bg-slate-100" />
        <div className="h-6 w-16 rounded bg-slate-100" />
      </div>
    </div>
  )
}

function SkeletonColumn() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
      <div className="h-12 bg-slate-100 animate-pulse" />
      <div className="h-0.5 bg-slate-200" />
      <div className="p-3 space-y-3">
        {[1, 2].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}

// ─── Board Details Page ───────────────────────────────────────────────────────

/**
 * BoardDetails — Kanban board page at /boards/:boardId.
 * Fetches the board and its tasks, then renders three status columns
 * with filtering, sorting, create/edit/delete modals.
 */
function BoardDetails() {
  const { boardId } = useParams()
  const navigate = useNavigate()

  // ── Data state ──────────────────────────────────────────────────────────────
  const [board, setBoard] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ── Filter / sort state ─────────────────────────────────────────────────────
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  /** Status pre-selected when opening create from a column's + button */
  const [createStatus, setCreateStatus] = useState('todo')
  const [editingTask, setEditingTask] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)
  const [isDeletingTask, setIsDeletingTask] = useState(false)

  // ── Moving task status ──────────────────────────────────────────────────────
  const [movingTaskId, setMovingTaskId] = useState(null)

  // ─── Fetch board + tasks ────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [boardData, tasksData] = await Promise.all([
        getBoardById(boardId),
        getTasksByBoard(boardId),
      ])
      setBoard(boardData.board)
      setTasks(tasksData.tasks)
    } catch (err) {
      const status = err.response?.status
      if (status === 403 || status === 404) {
        // Board not found or doesn't belong to this user
        navigate('/dashboard', { replace: true })
      } else {
        setError(
          err.response?.data?.message ||
            'Failed to load board. Please try again.',
        )
      }
    } finally {
      setLoading(false)
    }
  }, [boardId, navigate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ─── Filtered + sorted tasks ────────────────────────────────────────────────

  const processedTasks = useMemo(() => {
    let result = [...tasks]

    // Filter by priority
    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter)
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'due-asc':
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate) - new Date(b.dueDate)
        case 'due-desc':
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(b.dueDate) - new Date(a.dueDate)
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })

    return result
  }, [tasks, priorityFilter, sortBy])

  // Group tasks by status for column rendering
  const tasksByStatus = useMemo(() => {
    return STATUSES.reduce((acc, status) => {
      acc[status] = processedTasks.filter((t) => t.status === status)
      return acc
    }, {})
  }, [processedTasks])

  // ─── CRUD handlers ──────────────────────────────────────────────────────────

  const handleCreate = async (formData) => {
    const data = await createTask({ ...formData, status: createStatus })
    setTasks((prev) => [data.task, ...prev])
    setIsCreateOpen(false)
  }

  const handleUpdate = async (formData) => {
    const data = await updateTask(editingTask._id, formData)
    setTasks((prev) =>
      prev.map((t) => (t._id === editingTask._id ? data.task : t)),
    )
    setEditingTask(null)
  }

  const handleDelete = async () => {
    try {
      setIsDeletingTask(true)
      await deleteTask(deletingTask._id)
      setTasks((prev) => prev.filter((t) => t._id !== deletingTask._id))
      setDeletingTask(null)
    } finally {
      setIsDeletingTask(false)
    }
  }

  const handleMoveStatus = async (task) => {
    const STATUS_CYCLE = {
      todo: 'in-progress',
      'in-progress': 'done',
      done: 'todo',
    }
    const nextStatus = STATUS_CYCLE[task.status]

    try {
      setMovingTaskId(task._id)
      const data = await updateTask(task._id, { status: nextStatus })
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? data.task : t)),
      )
    } catch (err) {
      console.error('Failed to move task status:', err)
    } finally {
      setMovingTaskId(null)
    }
  }

  // ─── Open create modal with pre-selected status ─────────────────────────────

  const openCreateForStatus = (status) => {
    setCreateStatus(status)
    setIsCreateOpen(true)
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        {/* Header skeleton */}
        <div className="animate-pulse mb-6 space-y-2">
          <div className="h-8 w-1/3 rounded bg-slate-200" />
          <div className="h-4 w-1/2 rounded bg-slate-100" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SkeletonColumn />
          <SkeletonColumn />
          <SkeletonColumn />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center">
        <span className="text-5xl" aria-hidden="true">⚠️</span>
        <p className="mt-4 text-sm font-medium text-red-700">{error}</p>
        <button
          type="button"
          onClick={fetchData}
          className="mt-4 rounded-lg border border-red-300 bg-white px-5 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <>
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="mb-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-sm text-slate-500">
          <Link
            to="/dashboard"
            className="flex items-center gap-1 transition hover:text-primary-700"
          >
            ← Dashboard
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-slate-700">{board?.title}</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {board?.title}
            </h1>
            {board?.description && (
              <p className="mt-1 max-w-xl text-sm text-slate-500">
                {board.description}
              </p>
            )}
          </div>

          <button
            type="button"
            id="create-task-btn"
            onClick={() => openCreateForStatus('todo')}
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 active:scale-95"
          >
            <span className="text-base leading-none" aria-hidden="true">+</span>
            Create Task
          </button>
        </div>
      </div>

      {/* ── Filter + Sort controls ──────────────────────────────────────────── */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {/* Priority filter tabs */}
        <div
          role="group"
          aria-label="Filter by priority"
          className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1"
        >
          {PRIORITY_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              id={`filter-${f.value}`}
              onClick={() => setPriorityFilter(f.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                priorityFilter === f.value
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort select */}
        <select
          id="sort-tasks"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort tasks"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Task count summary */}
        <span className="ml-auto text-xs text-slate-400">
          {processedTasks.length} task{processedTasks.length !== 1 ? 's' : ''}
          {priorityFilter !== 'all' && ' (filtered)'}
        </span>
      </div>

      {/* ── Kanban Board ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {STATUSES.map((status) => (
          <StatusColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status] ?? []}
            movingTaskId={movingTaskId}
            onCreateTask={() => openCreateForStatus(status)}
            onEdit={(task) => setEditingTask(task)}
            onDelete={(task) => setDeletingTask(task)}
            onMoveStatus={handleMoveStatus}
          />
        ))}
      </div>

      {/* ── Create Modal ────────────────────────────────────────────────────── */}
      {isCreateOpen && (
        <TaskModal
          boardId={boardId}
          initialData={{ status: createStatus }}
          onSubmit={handleCreate}
          onClose={() => setIsCreateOpen(false)}
        />
      )}

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      {editingTask && (
        <TaskModal
          initialData={editingTask}
          boardId={boardId}
          onSubmit={handleUpdate}
          onClose={() => setEditingTask(null)}
        />
      )}

      {/* ── Delete Confirmation ─────────────────────────────────────────────── */}
      {deletingTask && (
        <DeleteTaskModal
          task={deletingTask}
          isDeleting={isDeletingTask}
          onConfirm={handleDelete}
          onClose={() => setDeletingTask(null)}
        />
      )}
    </>
  )
}

export default BoardDetails

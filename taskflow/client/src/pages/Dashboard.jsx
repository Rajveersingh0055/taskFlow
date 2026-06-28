import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import AnalyticsBar from '../components/AnalyticsBar.jsx'
import BoardCard from '../components/BoardCard.jsx'
import BoardModal from '../components/BoardModal.jsx'
import DeleteBoardModal from '../components/DeleteBoardModal.jsx'
import SearchBar from '../components/SearchBar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  createBoard,
  deleteBoard,
  getBoards,
  updateBoard,
} from '../services/boardService'
import { getTasksByBoard } from '../services/taskService'

// ─── Skeleton loader for board cards ─────────────────────────────────────────

function BoardCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 space-y-3">
      <div className="h-5 w-3/4 rounded bg-slate-200" />
      <div className="h-3 w-full rounded bg-slate-100" />
      <div className="h-3 w-1/2 rounded bg-slate-100" />
      <div className="mt-4 flex justify-between">
        <div className="h-3 w-16 rounded bg-slate-100" />
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded bg-slate-100" />
          <div className="h-6 w-16 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard() {
  const { user } = useAuth()

  // ── Board state ─────────────────────────────────────────────────────────────
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ── Analytics: all tasks across all boards ──────────────────────────────────
  const [allTasks, setAllTasks] = useState([])
  const [loadingTasks, setLoadingTasks] = useState(false)

  // ── Search ──────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingBoard, setEditingBoard] = useState(null)
  const [deletingBoard, setDeletingBoard] = useState(null)

  // ─── Fetch boards ───────────────────────────────────────────────────────────

  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getBoards()
      setBoards(data.boards)
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to load boards. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBoards()
  }, [fetchBoards])

  // ─── Fetch all tasks (for analytics) ───────────────────────────────────────

  useEffect(() => {
    if (boards.length === 0) {
      setAllTasks([])
      return
    }

    const fetchAllTasks = async () => {
      try {
        setLoadingTasks(true)
        const results = await Promise.allSettled(
          boards.map((b) => getTasksByBoard(b._id)),
        )
        const tasks = results.flatMap((r) =>
          r.status === 'fulfilled' ? r.value.tasks : [],
        )
        setAllTasks(tasks)
      } catch {
        // Analytics are non-critical — fail silently
      } finally {
        setLoadingTasks(false)
      }
    }

    fetchAllTasks()
  }, [boards])

  // ─── Filtered boards (search) ───────────────────────────────────────────────

  const filteredBoards = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return boards
    return boards.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.description || '').toLowerCase().includes(q),
    )
  }, [boards, searchQuery])

  // ─── CRUD handlers ──────────────────────────────────────────────────────────

  const handleCreate = async (formData) => {
    const data = await createBoard(formData)
    setBoards((prev) => [data.board, ...prev])
    setIsCreateOpen(false)
    toast.success(`Board "${data.board.title}" created!`)
  }

  const handleUpdate = async (formData) => {
    const data = await updateBoard(editingBoard._id, formData)
    setBoards((prev) =>
      prev.map((b) => (b._id === editingBoard._id ? data.board : b)),
    )
    setEditingBoard(null)
    toast.success('Board updated!')
  }

  const handleDelete = async () => {
    const boardTitle = deletingBoard.title
    await deleteBoard(deletingBoard._id)
    setBoards((prev) => prev.filter((b) => b._id !== deletingBoard._id))
    // Also remove tasks from analytics that belonged to this board
    setAllTasks((prev) =>
      prev.filter((t) => t.board !== deletingBoard._id),
    )
    setDeletingBoard(null)
    toast.success(`Board "${boardTitle}" deleted`)
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Analytics Bar ─────────────────────────────────────────────────── */}
      <AnalyticsBar
        boards={boards}
        tasks={allTasks}
        loadingTasks={loadingTasks}
      />

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Boards
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {user?.name && (
              <span>
                Welcome back, <strong>{user.name}</strong> ·{' '}
              </span>
            )}
            {loading
              ? 'Loading…'
              : `${boards.length} board${boards.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <button
          type="button"
          id="create-board-btn"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 active:scale-95"
        >
          <span className="text-base leading-none" aria-hidden="true">
            +
          </span>
          Create Board
        </button>
      </div>

      {/* ── Search Bar ────────────────────────────────────────────────────────── */}
      {!loading && boards.length > 0 && (
        <div className="mb-5 flex items-center gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search boards by title or description…"
          />
          {searchQuery && (
            <span className="shrink-0 text-xs text-slate-400">
              {filteredBoards.length} result
              {filteredBoards.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* ── Loading State ──────────────────────────────────────────────────────── */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <BoardCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* ── Error State ────────────────────────────────────────────────────────── */}
      {!loading && error && (
        <div className="flex flex-col items-center rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <span className="text-4xl" aria-hidden="true">
            ⚠️
          </span>
          <p className="mt-3 text-sm font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={fetchBoards}
            className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── Empty State ────────────────────────────────────────────────────────── */}
      {!loading && !error && boards.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-24 text-center">
          <span className="text-6xl" aria-hidden="true">
            📋
          </span>
          <h2 className="mt-5 text-lg font-bold text-slate-700">
            No boards yet
          </h2>
          <p className="mt-2 max-w-xs text-sm text-slate-500">
            Create your first board to start organising your work.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="mt-6 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95"
          >
            Create your first board
          </button>
        </div>
      )}

      {/* ── No Search Results ───────────────────────────────────────────────────── */}
      {!loading && !error && boards.length > 0 && filteredBoards.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
          <span className="text-5xl" aria-hidden="true">
            🔍
          </span>
          <h2 className="mt-4 text-base font-bold text-slate-700">
            No boards match &ldquo;{searchQuery}&rdquo;
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Try a different keyword or clear the search.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-4 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* ── Board Grid ─────────────────────────────────────────────────────────── */}
      {!loading && !error && filteredBoards.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBoards.map((board, index) => (
            <BoardCard
              key={board._id}
              board={board}
              index={index}
              onEdit={() => setEditingBoard(board)}
              onDelete={() => setDeletingBoard(board)}
            />
          ))}
        </div>
      )}

      {/* ── Create Modal ───────────────────────────────────────────────────────── */}
      {isCreateOpen && (
        <BoardModal
          title="Create Board"
          onSubmit={handleCreate}
          onClose={() => setIsCreateOpen(false)}
        />
      )}

      {/* ── Edit Modal ─────────────────────────────────────────────────────────── */}
      {editingBoard && (
        <BoardModal
          title="Edit Board"
          initialData={editingBoard}
          onSubmit={handleUpdate}
          onClose={() => setEditingBoard(null)}
        />
      )}

      {/* ── Delete Confirmation ─────────────────────────────────────────────────── */}
      {deletingBoard && (
        <DeleteBoardModal
          board={deletingBoard}
          onConfirm={handleDelete}
          onClose={() => setDeletingBoard(null)}
        />
      )}
    </>
  )
}

export default Dashboard

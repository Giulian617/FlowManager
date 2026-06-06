import { useEffect, useState } from "react"
import { Search, X, Trash2, Pencil, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MessageSquare, ListFilter, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import {
  getComments,
  updateComment,
  deleteComment
} from "../api/comment"
import type { CommentResponseWorkItemDto } from "../types/comment"
import { getInitials, formatDateTimeShortMonth } from "../utils/functions"

type SortField = "date" | "author" | "default"

function ConfirmDeleteModal({ onConfirm, onClose }: {
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/40">
            <Trash2 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Delete comment</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Are you sure you want to permanently delete this comment?
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-700">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-500 dark:bg-rose-800 px-4 py-2.5 text-sm font-semibold text-white dark:text-rose-200 transition hover:bg-rose-600 dark:hover:bg-rose-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminComments() {
  const [comments, setComments] = useState<CommentResponseWorkItemDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState("")
  const [page, setPage] = useState(1)
  const [authorFilter, setAuthorFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("default")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    getComments()
      .then(setComments)
      .catch(() => setError("Failed to load comments."))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    await deleteComment(id)
    setComments((prev) => prev.filter((c) => c.id !== id))
    setDeleteTarget(null)
  }

  const handleEdit = async (id: number) => {
    if (!editText.trim()) return
    try {
      const updated = await updateComment(id, editText.trim())
      setComments((prev) => prev.map((c) => c.id === id ? updated : c))
      setEditingId(null)
    } catch (e) {
      console.error(e)
    }
  }

  const authorOptions = Array.from(
    new Map(
      comments
        .filter((c) => c.author)
        .map((c) => [String(c.author!.id), c.author!.username])
    ).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]))

  const hasActiveFilters = authorFilter !== "all"

  const clearFilters = () => {
    setAuthorFilter("all")
    setSortField("default")
    setSortDir("asc")
    setPage(1)
  }

  const filtered = comments
    .filter((c) => {
      const q = query.toLowerCase()
      const matchesSearch =
        c.content.toLowerCase().includes(q) ||
        c.author?.username?.toLowerCase().includes(q)

      const matchesAuthor =
        authorFilter === "all" || String(c.author?.id) === authorFilter

      return matchesSearch && matchesAuthor
    })
    .sort((a, b) => {
      if (sortField === "default") return 0
      const dir = sortDir === "asc" ? 1 : -1
      switch (sortField) {
        case "author":
          return (a.author?.username ?? "").localeCompare(b.author?.username ?? "") * dir
        case "date":
          const dateA = a.updatedAt ?? a.createdAt;
          const dateB = b.updatedAt ?? b.createdAt;
          return (new Date(dateA).getTime() - new Date(dateB).getTime()) * dir
        default:
          return 0
      }
    })

  const itemsPerPage = 15
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  useEffect(() => { setPage(1) }, [query, authorFilter])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <p className="text-slate-500 dark:text-slate-400">Loading comments…</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center py-24">
      <p className="text-rose-500 dark:text-rose-400">{error}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Admin</p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Comments</h1>
      </header>

      {/* Filters + Sort + Search */}
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-4 py-3 shadow-sm">

        {/* Filters + Sort */}
        <div className="flex flex-wrap items-center gap-4">

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <ListFilter className="h-4 w-4 flex-none text-slate-500 dark:text-slate-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Filter:</span>

            <select
              value={authorFilter}
              onChange={(e) => { setAuthorFilter(e.target.value); setPage(1) }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 outline-none transition focus:border-slate-400 dark:focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
            >
              <option value="all">All authors</option>
              {authorOptions.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>

            {hasActiveFilters && (
              <div className="relative group">
                <button
                  onClick={() => { setAuthorFilter("all"); setPage(1) }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <span className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full mb-2 hidden rounded-full bg-slate-800 dark:bg-slate-700 px-3 py-1 text-xs text-white shadow-sm group-hover:block whitespace-nowrap">
                  Clear filters
                </span>
              </div>
            )}
          </div>

          <div className="hidden h-6 w-px bg-slate-200 dark:bg-slate-700 md:block" />

          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 flex-none text-slate-500 dark:text-slate-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sort:</span>

            <select
              value={sortField}
              onChange={(e) => { setSortField(e.target.value as SortField); setPage(1) }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 outline-none transition focus:border-slate-400 dark:focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
            >
              <option value="default">Default</option>
              <option value="author">Author</option>
              <option value="date">Date</option>
            </select>

            {sortField !== "default" && (
              <button
                onClick={() => { setSortDir((d) => (d === "asc" ? "desc" : "asc")); setPage(1) }}
                className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-sm text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {sortDir === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                {sortDir === "asc" ? "Asc" : "Desc"}
              </button>
            )}

            {sortField !== "default" && (
              <div className="relative group">
                <button
                  onClick={() => { setSortField("default"); setSortDir("asc"); setPage(1) }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <span className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full mb-2 hidden rounded-full bg-slate-800 dark:bg-slate-700 px-3 py-1 text-xs text-white shadow-sm group-hover:block whitespace-nowrap">
                  Reset sorting
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800 px-3 py-2 border border-slate-200 dark:border-slate-700">
          <Search className="h-4 w-4 flex-none text-slate-400 dark:text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by content or author…"
            className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition flex-none">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-20 shadow-sm text-center gap-2">
          <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No comments yet.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-20 shadow-sm text-center gap-2">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No comments match your filters.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Try a different author or keyword.</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-1 text-xs text-slate-500 dark:text-slate-400 underline underline-offset-2 hover:text-slate-700 dark:hover:text-slate-200 transition">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
            {paginated.map((c) => {
              const edited = new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime() > 1000
              return (
                <div key={c.id} className="flex items-start gap-4 px-6 py-4 group hover:bg-slate-50 dark:hover:bg-slate-800/80 transition">
                  <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
                    {getInitials(c.author?.username ?? "?")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {c.author?.username ?? "Unknown"}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {edited
                          ? <>{formatDateTimeShortMonth(c.updatedAt)}<span className="italic"> (edited)</span></>
                          : formatDateTimeShortMonth(c.createdAt)
                        }
                      </span>
                    </div>

                    {editingId === c.id ? (
                      <div className="space-y-2 mt-1">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={2}
                          className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-600 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="w-16 rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(c.id)}
                            className="w-16 rounded-xl bg-slate-900 dark:bg-blue-950 px-3 py-1.5 text-xs font-semibold text-white dark:text-blue-300 hover:bg-slate-800 dark:hover:bg-blue-900 transition"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap wrap-break-word">{c.content}</p>
                    )}
                  </div>

                  {editingId !== c.id && (
                    <div className="flex-none flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingId(c.id); setEditText(c.content) }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 transition hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-rose-100 dark:border-rose-900/50 bg-white dark:bg-slate-800 text-rose-400 dark:text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>
              Showing {(page - 1) * itemsPerPage + 1}–{Math.min(filtered.length, page * itemsPerPage)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={page === 1}
                className="inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1.5 px-2">
                <span className="text-slate-500 dark:text-slate-400">Page</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={5}
                  value={page}
                  onChange={(e) => {
                    const next = Number(e.target.value.replace(/\D/g, ""))
                    if (!isNaN(next) && e.target.value !== "") {
                      setPage(Math.min(Math.max(1, next), totalPages))
                    } else if (e.target.value === "") {
                      setPage(1)
                    }
                  }}
                  className="h-8 w-10 rounded-2xl border border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800 px-0 text-center text-sm leading-8 text-slate-800 dark:text-slate-200 outline-none appearance-none focus:border-slate-500 dark:focus:border-slate-400 focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600"
                />
                <span className="text-slate-500 dark:text-slate-400">/ {totalPages}</span>
              </div>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
                <ChevronRight className="h-4 w-4" />
              </button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                className="inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {deleteTarget !== null && (
        <ConfirmDeleteModal
          onConfirm={() => handleDelete(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
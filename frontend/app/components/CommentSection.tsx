import React, { useState, useEffect } from "react"
import { Pencil, Trash2, Send } from "lucide-react"
import { getWorkItemComments } from "../api/workItem"
import {
  createComment,
  updateComment,
  deleteComment
} from "../api/comment"
import type { CommentResponseWorkItemDto } from "../types/comment"
import type { UserSummaryDto } from "../types/user"

function initials(username: string): string {
  const parts = username.split(/[.\s_-]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return username.slice(0, 2).toUpperCase()
}

export default function CommentSection({
  currentUser,
  workItemId,
  reporterId
}: {
  currentUser: UserSummaryDto | null
  workItemId: number
  reporterId?: number
}) {
  const [comments, setComments] = useState<CommentResponseWorkItemDto[]>([])
  const [draft, setDraft] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState("")
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    getWorkItemComments(workItemId)
      .then(setComments)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [workItemId])

  const submit = async () => {
    if (!draft.trim() || !currentUser) return
    setSubmitting(true)
    try {
      const created = await createComment(workItemId, draft.trim())
      setComments((c) => [...c, created])
      setDraft("")
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const submitEdit = async (commentId: number) => {
    if (!editText.trim()) return
    try {
      const updated = await updateComment(commentId, editText.trim())
      setComments((c) => c.map((cm) => cm.id === commentId ? updated : cm))
      setEditingId(null)
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (commentId: number) => {
    try {
      await deleteComment(commentId)
      setComments((c) => c.filter((cm) => cm.id !== commentId))
    } catch (e) {
      console.error(e)
    }
  }

  const authorName = currentUser?.username ?? ""

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Comments</h2>

      {loading && <p className="text-sm text-slate-400 italic">Loading comments…</p>}

      {!loading && comments.length === 0 && (
        <p className="text-sm text-slate-400 italic">No comments yet. Be the first to comment.</p>
      )}

      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-900 text-xs font-semibold">
              {initials(c.author.username)}
            </div>
            <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-slate-900">{c.author.username}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime() > 1000
                        ? <>
                            {new Date(c.updatedAt).toLocaleString("ro-RO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            <span className="italic"> (edited)</span>
                        </>
                        : new Date(c.createdAt).toLocaleString("ro-RO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                    }
                  </span>
                </div>
                {(currentUser?.role === "ADMIN" ||
                  currentUser?.id === c.author.id ||
                  currentUser?.id === reporterId) && (
                  <div className="flex items-center gap-1.5 flex-none">
                    <button
                      type="button"
                      onClick={() => { setEditingId(c.id); setEditText(c.content) }}
                      className="text-slate-400 hover:text-slate-600 transition"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(c.id)}
                      className="text-rose-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {deletingId === c.id && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-2xl bg-rose-50 border border-rose-200">
                              <Trash2 className="h-4 w-4 text-rose-600" />
                            </div>
                            <div>
                              <h2 className="text-base font-semibold text-slate-900">Delete comment?</h2>
                              <p className="mt-1 text-sm text-slate-500">This action cannot be undone.</p>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setDeletingId(null)}
                              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => { handleDelete(deletingId); setDeletingId(null) }}
                              className="flex-1 rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {editingId === c.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-200"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => submitEdit(c.id)}
                      className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New comment input */}
      <div className="flex gap-3">
        {authorName && (
          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-900 text-xs font-semibold">
            {initials(authorName)}
          </div>
        )}
        <div className="flex-1 rounded-2xl border border-slate-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-slate-200 focus-within:border-slate-400 transition">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit() }}
            placeholder="Add a comment… (Ctrl+Enter to submit)"
            rows={3}
            className="w-full resize-none bg-transparent px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
          <div className="flex items-center justify-end border-t border-slate-100 px-3 py-2">
            <button
              type="button"
              onClick={submit}
              disabled={!draft.trim() || submitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-3 w-3" /> {submitting ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
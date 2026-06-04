import React, { useEffect, useState, useCallback, useRef, useMemo } from "react"
import { useNavigate } from "react-router"
import { statusMeta } from "../utils/status"
import { Bug, CheckSquare, Zap, BookOpen, X } from "lucide-react"
import { getWorkItemsByProjectId } from "../api/project"
import { updateWorkItem } from "../api/workItem"
import type { WorkItemSummaryDto } from "../types/workItem"
import type { Status } from "../types/enums"

type WorkItem = {
  id: string
  type?: string
  title: string
  status: string
  assigneeId?: string
  assigneeName?: string
  assignees?: { id: string; name: string }[]
  severity?: string
  deadline?: string
}

type ToastMsg = {
  id: string
  text: string
  itemId: string
  fromStatus: ColStatus
  toStatus: ColStatus
}

const COLUMNS = ["ToDo", "InProgress", "Testing", "Done", "Closed"] as const
type ColStatus = (typeof COLUMNS)[number]

const backendStatusMap: Record<string, ColStatus> = {
  To_do:       "ToDo",
  In_Progress: "InProgress",
  Testing:     "Testing",
  Done:        "Done",
  Closed:      "Closed",
}

const frontendStatusMap: Record<ColStatus, string> = {
  ToDo:       "To_do",
  InProgress: "In_Progress",
  Testing:    "Testing",
  Done:       "Done",
  Closed:     "Closed",
}

const severityMeta: Record<string, string> = {
  Low: "bg-emerald-600/10 text-emerald-700",
  Medium: "bg-sky-600/10 text-sky-700",
  High:"bg-amber-600/10 text-amber-700",
  Critical: "bg-rose-600/10 text-rose-700",
  Blocker: "bg-slate-200 text-slate-900",
}

const typeIcons: Record<string, { textClass: string; icon: React.ReactNode }> = {
  Task: { textClass: "text-sky-700", icon: <CheckSquare className="h-3.5 w-3.5" /> },
  Bug: { textClass: "text-rose-700", icon: <Bug className="h-3.5 w-3.5" /> },
  "User Story": { textClass: "text-emerald-700", icon: <BookOpen className="h-3.5 w-3.5" /> },
  Epic: { textClass: "text-violet-700", icon: <Zap className="h-3.5 w-3.5" /> },
}

function initials(username: string): string {
  const parts = username.split(/[.\s_-]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return username.slice(0, 2).toUpperCase()
}

function formatDate(d?: string) {
  if (!d) return "—"
  const date = new Date(d)
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

function isOverdue(d?: string, status?: string) {
  if (!d || status === "Done" || status === "Closed") return false
  return new Date(d).getTime() < new Date().getTime()
}

function mapWorkItem(w: WorkItemSummaryDto): WorkItem {
  return {
    id:          String(w.id),
    type:        w.itemType === "User_Story" ? "User Story" : w.itemType,
    title:       w.title,
    status:      backendStatusMap[w.status as string] ?? "ToDo",
    assigneeId:  w.assignees?.[0] ? String(w.assignees[0].id) : undefined,
    assigneeName: w.assignees?.[0]?.username,
    assignees:   w.assignees?.map((a) => ({ id: String(a.id), name: a.username })) ?? [],
    severity:    w.severity,
    deadline:    w.dueDate ?? undefined,
  }
}

function KanbanCard({ item, isDragging, onDragStart, onClick }: {
  item: WorkItem
  isDragging: boolean
  onDragStart: (e: React.DragEvent, id: string) => void
  onClick: (id: string) => void
}) {
  const typeMeta = item.type ? typeIcons[item.type] : undefined
  const overdue  = isOverdue(item.deadline, item.status)

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item.id)}
      onClick={() => onClick(item.id)}
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm cursor-grab active:cursor-grabbing select-none transition-all duration-150 ${
        isDragging ? "opacity-40 scale-95 rotate-1" : "hover:shadow-md hover:-translate-y-0.5"
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <span className={typeMeta?.textClass ?? "text-slate-500"}>{typeMeta?.icon}</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
            {item.type ?? "Item"}
          </span>
          <span className="text-[10px] font-medium text-slate-400">#{item.id}</span>
        </div>
        {item.severity && (
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.13em] ${severityMeta[item.severity] ?? "bg-slate-100 text-slate-600"}`}>
            {item.severity}
          </span>
        )}
      </div>

      <p className="mb-3 text-sm font-semibold leading-snug text-slate-900">{item.title}</p>

      <div className="flex items-center justify-between gap-2">
        <div className="flex -space-x-2">
          {(item.assignees ?? (item.assigneeName ? [{ id: item.assigneeId ?? "", name: item.assigneeName }] : [])).map((a) => (
            <div
              key={a.id}
              className="flex h-7 w-7 flex-none items-center justify-center rounded-full border-2 border-white bg-blue-100 text-[10px] font-semibold text-blue-900"
              title={a.name}
            >
              {initials(a.name)}
            </div>
          ))}
        </div>
        <div className={`flex items-center gap-1 text-xs ${overdue ? "text-red-600 font-semibold" : "text-slate-400"}`}>
          <span>{formatDate(item.deadline)}</span>
        </div>
      </div>
    </div>
  )
}

function KanbanColumn({ col, items, draggingId, isOver, onDragStart, onDragOver, onDrop, onDragLeave, onCardClick }: {
  col: ColStatus
  items: WorkItem[]
  draggingId: string | null
  isOver: boolean
  onDragStart: (e: React.DragEvent, id: string) => void
  onCardClick: (id: string) => void
  onDragOver: (e: React.DragEvent, col: ColStatus) => void
  onDrop: (e: React.DragEvent, col: ColStatus) => void
  onDragLeave: (e: React.DragEvent) => void
}) {
  const meta = statusMeta[col as keyof typeof statusMeta]

  return (
    <div
      className={`flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-150 ${isOver ? "ring-2 ring-slate-300 scale-[1.01]" : ""}`}
      onDragOver={(e) => onDragOver(e, col)}
      onDrop={(e) => onDrop(e, col)}
      onDragLeave={onDragLeave}
    >
      <div className={`rounded-t-3xl border-b px-4 py-4 ${meta.headerClass}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${meta.dotClass}`} />
            <span className="text-sm font-semibold">{meta.label}</span>
          </div>
          <span className="text-xs font-medium text-slate-500">{items.length}</span>
        </div>
      </div>
      <div className={`flex flex-col gap-3 p-4 min-h-55 rounded-b-3xl transition-colors duration-150 ${isOver ? "bg-slate-100" : "bg-slate-50"}`}>
        {items.map((item) => (
          <KanbanCard key={item.id} item={item} isDragging={draggingId === item.id} onDragStart={onDragStart} onClick={onCardClick} />
        ))}
        {isOver && items.every((i) => i.id !== draggingId) && (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 py-6 text-center text-xs text-slate-400">Drop here</div>
        )}
        {items.length === 0 && !isOver && (
          <p className="text-sm text-slate-400">No cards yet</p>
        )}
      </div>
    </div>
  )
}

function Toast({ toast, onUndo, onDismiss }: {
  toast: ToastMsg
  onUndo: (t: ToastMsg) => void
  onDismiss: (id: string) => void
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 shadow-lg text-sm text-white">
      <span className="flex-1">{toast.text}</span>
      <button onClick={() => onUndo(toast)} className="ml-1 rounded-xl bg-white px-3 py-1 text-xs font-semibold text-slate-900 transition hover:bg-slate-100">
        Undo
      </button>
      <button onClick={() => onDismiss(toast.id)} aria-label="Dismiss" className="rounded-full p-0.5 text-slate-300 transition hover:text-white">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

const SEVERITY_ORDER: Record<string, number> = {
  Blocker: 0, Critical: 1, High: 2, Medium: 3, Low: 4,
}

export default function KanbanBoard({
  sortBy = "Default",
  sortDir = "asc",
  typeFilter = new Set<string>(),
}: {
  sortBy: "Deadline" | "Severity" | "Default"
  sortDir: "asc" | "desc"
  typeFilter?: Set<string>
}){
  const [items, setItems] = useState<WorkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<ColStatus | null>(null)
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const toastTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const navigate = useNavigate()

  const dismissToast = useCallback((id: string) => {
    clearTimeout(toastTimers.current[id])
    delete toastTimers.current[id]
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const pid = Number(localStorage.getItem("selectedProject"))
      const data = await getWorkItemsByProjectId(pid)
      setItems(data.map(mapWorkItem))
    } catch (err: any) {
      setError(err.message ?? "Error fetching work items")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  
  const visibleItems = useMemo(() => items.filter((item) => {
    if (typeFilter.size > 0 && !typeFilter.has(item.type ?? "")) return false
    return true
  }), [items, typeFilter])

  const byColumn = useMemo(() => {
    const map: Record<string, WorkItem[]> = {}
    COLUMNS.forEach((c) => (map[c] = []))
    visibleItems.forEach((item) => {
      const s = item.status ?? "ToDo"
      if (map[s]) map[s].push(item)
      else map["ToDo"].push(item)
    })
    COLUMNS.forEach((col) => {
      map[col].sort((a, b) => {
        let result = 0
        if (sortBy === "Deadline") {
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          result = new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        } else if (sortBy === "Severity") {
          const aPrio = SEVERITY_ORDER[a.severity ?? ""] ?? 99
          const bPrio = SEVERITY_ORDER[b.severity ?? ""] ?? 99
          result = aPrio - bPrio
        }
        return sortDir === "desc" ? -result : result
      })
    })
    return map
  }, [visibleItems, sortBy, sortDir])

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("itemId", id)
    setDraggingId(id)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, col: ColStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverCol(col)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if ((e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) return
    setDragOverCol(null)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggingId(null)
    setDragOverCol(null)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent, toCol: ColStatus) => {
    e.preventDefault()
    const id = e.dataTransfer.getData("itemId")
    setDraggingId(null)
    setDragOverCol(null)

    const item = items.find((i) => i.id === id)
    if (!item || item.status === toCol) return
    const fromStatus = item.status as ColStatus
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: toCol } : i)))

    const toastId = `t-${Date.now()}`
    setToasts((prev) => [...prev, {
      id: toastId,
      text: `${item.type ?? "Item"} #${item.id} "${item.title}" moved to ${statusMeta[toCol as keyof typeof statusMeta]?.label ?? toCol}.`,
      itemId: id, fromStatus, toStatus: toCol,
    }])
    toastTimers.current[toastId] = setTimeout(() => dismissToast(toastId), 5000)

    try {
      await updateWorkItem(Number(id), { status: frontendStatusMap[toCol] as Status })
    } catch {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: fromStatus } : i)))
      clearTimeout(toastTimers.current[toastId])
      delete toastTimers.current[toastId]
      setToasts((prev) => prev.filter((t) => t.id !== toastId))
      setError(`Could not move "${item.title}". Please try again.`)
    }
  }, [items, dismissToast])

  const handleUndo = useCallback(async (toast: ToastMsg) => {
    dismissToast(toast.id)
    setItems((prev) =>
      prev.map((i) => (i.id === toast.itemId ? { ...i, status: toast.fromStatus } : i))
    )
    try {
      await updateWorkItem(Number(toast.itemId), { status: frontendStatusMap[toast.fromStatus] as Status })
    } catch {
      setError(`Could not undo move. Please try again.`)
    }
  }, [dismissToast])

  if (loading) return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
      Loading Kanban board…
    </div>
  )

  if (error) return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center shadow-sm">
      <p className="mb-4 text-rose-700">{error}</p>
      <button onClick={load} className="rounded-2xl border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50">
        Retry
      </button>
    </div>
  )

  return (
    <div className="relative space-y-4" onDragEnd={handleDragEnd}>
      <div className="grid gap-4 lg:grid-cols-5">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col} col={col}
            items={byColumn[col] ?? []}
            draggingId={draggingId}
            isOver={dragOverCol === col}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
            onCardClick={(id) => navigate(`/project/work-items/${id}/edit`)}
          />
        ))}
      </div>

      {visibleItems.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600 shadow-sm">
          No tickets match the current filters.
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onUndo={handleUndo} onDismiss={dismissToast} />
        ))}
      </div>
    </div>
  )
}
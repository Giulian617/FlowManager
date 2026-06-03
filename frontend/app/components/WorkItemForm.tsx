import React, { useState, useRef, useEffect } from "react"
import {
  Bug, CheckSquare, Zap, BookOpen, ArrowLeft, ChevronDown, Search, UserCircle,
  AlertCircle, Send, Paperclip, Calendar, Link2, Lock, X, Plus
} from "lucide-react"
import { useNavigate } from "react-router"
import { severityMeta } from "../utils/status"
import { getCurrentUser } from "../api/user"
import {
  getWorkItemsByProjectId,
  getMembersByProjectId,
} from "../api/project"
import {
  createWorkItem,
  updateWorkItem,
} from "../api/workItem"
import type {
  WorkItemCreateDto,
  WorkItemUpdateDto,
  WorkItemSummaryDto,
  WorkItemResponseDto,
} from "../types/workItem"
import type { UserSummaryDto } from "../types/user"
import type { ItemType, Severity } from "../types/enums"

const severityOptions = ["Low", "Medium", "High", "Critical", "Blocker"]

function initials(username: string): string {
  const parts = username.split(/[.\s_-]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return username.slice(0, 2).toUpperCase()
}

function FieldLabel({ children, required, satisfied }: {
  children: React.ReactNode
  required?: boolean
  satisfied?: boolean
}) {
  return (
    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
      {children}
      {required && (
        <span className={`ml-1 transition-colors duration-300 ${satisfied ? "text-slate-300" : "text-rose-500"}`}>*</span>
      )}
    </label>
  )
}

function LockedField({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
      {children}
      <Lock className="ml-auto h-3 w-3 flex-none text-slate-300" />
    </div>
  )
}

function SelectDropdown({ value, options, onChange, placeholder, renderOption, renderSelected, error }: {
  value: string
  options: string[]
  onChange: (v: string) => void
  placeholder?: string
  renderOption?: (v: string) => React.ReactNode
  renderSelected?: (v: string) => React.ReactNode
  error?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-xl border bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:ring-2 ${
          error ? "border-rose-400 focus:border-rose-400 focus:ring-rose-100" : "border-slate-200 hover:border-slate-400 focus:ring-slate-100"
        }`}
      >
        <span className="text-sm">
          {value
            ? (renderSelected ? renderSelected(value) : value)
            : <span className="text-slate-400">{placeholder ?? "Select…"}</span>
          }
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 flex-none ml-2" />
      </button>
      {open && (
        <ul className="absolute left-0 z-20 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          {options.map((opt) => (
            <li
              key={opt}
              className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition hover:bg-slate-50 ${opt === value ? "font-semibold text-slate-900 bg-slate-50" : "text-slate-700"}`}
              onMouseDown={(e) => { e.preventDefault(); onChange(opt); setOpen(false) }}
            >
              {renderOption ? renderOption(opt) : opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AssigneeMultiDropdown({ value, onChange, options }: {
  value: string[]
  onChange: (v: string[]) => void
  options: UserSummaryDto[]
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setSearch("") }
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const filtered = options.filter((o) => o.username.toLowerCase().includes(search.toLowerCase()))
  const toggle = (name: string) =>
    value.includes(name) ? onChange(value.filter((v) => v !== name)) : onChange([...value, name])

  const selectedUsers = options.filter((o) => value.includes(String(o.id)))

  return (
    <div ref={ref} className="relative">
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {selectedUsers.map((user) => (
            <span key={user.id} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 pl-1.5 pr-1 py-0.5 text-xs text-slate-700">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-900 text-[9px] font-semibold flex-none">
                {initials(user.username)}
              </div>
              {user.username}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); onChange(value.filter((v) => v !== String(user.id))) }}
                className="ml-0.5 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSearch("") }}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition hover:border-slate-400 focus:ring-2 focus:ring-slate-200"
      >
        <div className="flex items-center gap-2">
          <UserCircle className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-400">{selectedUsers.length === 0 ? "Add assignee…" : "Add more…"}</span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 flex-none" />
      </button>
      {open && (
        <div className="absolute left-0 z-20 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="px-2.5 py-2 border-b border-slate-100">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
              <Search className="h-3.5 w-3.5 text-slate-400 flex-none" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full bg-transparent text-xs text-slate-700 outline-none"
              />
            </div>
          </div>
          <ul className="max-h-44 overflow-auto">
            {filtered.map((opt) => {
              const selected = value.includes(String(opt.id))
              return (
                <li
                  key={opt.id}
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer transition hover:bg-slate-50 ${selected ? "bg-slate-50" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); toggle(String(opt.id)) }}
                >
                  <div className={`h-4 w-4 flex-none rounded border flex items-center justify-center transition-colors ${selected ? "bg-slate-900 border-slate-900" : "border-slate-300 bg-white"}`}>
                    {selected && (
                      <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </div>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-900 text-[10px] font-semibold flex-none">
                    {initials(opt.username)}
                  </div>
                  <span>{opt.username}</span>
                </li>
              )
            })}
            {filtered.length === 0 && <li className="px-3 py-3 text-xs text-slate-400">No results</li>}
          </ul>
        </div>
      )}
    </div>
  )
}

function ParentField({ value, onChange, candidates }: {
  value: string
  onChange: (v: string) => void
  candidates: WorkItemSummaryDto[]
}) {
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState(value)
  const ref = useRef<HTMLDivElement>(null)
  const selected = candidates.find((c) => String(c.id) === value)

  useEffect(() => {
    setTyped(selected ? `#${selected.id} ${selected.title}` : "")
  }, [value])

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const filtered = candidates.filter(
    (p) => String(p.id).includes(typed.replace("#", "")) || p.title.toLowerCase().includes(typed.toLowerCase())
  )

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center rounded-xl border border-slate-200 bg-white transition hover:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 overflow-hidden">
        <Link2 className="ml-3 h-3.5 w-3.5 flex-none text-slate-400" />
        <input
          value={typed}
          onChange={(e) => { setTyped(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Type ID or search…"
          className="flex-1 bg-transparent px-2.5 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
        {value && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setTyped(""); onChange("") }}
            className="mr-2.5 text-slate-300 hover:text-slate-500 transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute left-0 z-20 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 text-slate-700"
              onMouseDown={(e) => {
                e.preventDefault()
                setTyped(`#${p.id} ${p.title}`)
                onChange(String(p.id))
                setOpen(false)
              }}
            >
              <span className="font-semibold text-slate-400 text-xs flex-none">#{p.id}</span>
              <span className="truncate">{p.title}</span>
              <span className="ml-auto text-xs text-slate-400 flex-none">{p.itemType}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ChildItemsField({ value, onChange, candidates }: {
  value: string[]
  onChange: (v: string[]) => void
  candidates: WorkItemSummaryDto[]
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setSearch("") }
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const filtered = candidates.filter(
    (c) => !value.includes(String(c.id)) && (String(c.id).includes(search) || c.title.toLowerCase().includes(search.toLowerCase()))
  )
  const selectedItems = candidates.filter((c) => value.includes(String(c.id)))
  const remove = (id: string) => onChange(value.filter((v) => v !== id))
  const add = (id: string) => { onChange([...value, id]); setSearch(""); setOpen(false) }

  return (
    <div ref={ref} className="relative">
      {selectedItems.length > 0 && (
        <div className="flex flex-col gap-1 mb-1.5">
          {selectedItems.map((item) => (
            <span key={item.id} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 pl-2 pr-1 py-1 text-xs text-slate-700">
              <span className="font-semibold text-slate-400">#{item.id}</span>
              <span className="truncate">{item.title}</span>
              <span className="ml-auto text-[10px] text-slate-400 flex-none mr-1">{item.itemType}</span>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); remove(String(item.id)) }}
                className="text-slate-400 hover:text-slate-600 transition flex-none"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSearch("") }}
        className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition hover:border-slate-400 focus:ring-2 focus:ring-slate-100"
      >
        <Plus className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-sm text-slate-400">Link child item…</span>
      </button>
      {open && (
        <div className="absolute left-0 z-20 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="px-2.5 py-2 border-b border-slate-100">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
              <Search className="h-3.5 w-3.5 text-slate-400 flex-none" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full bg-transparent text-xs text-slate-700 outline-none"
              />
            </div>
          </div>
          <ul className="max-h-44 overflow-auto">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 text-slate-700"
                onMouseDown={(e) => { e.preventDefault(); add(String(item.id)) }}
              >
                <span className="font-semibold text-slate-400 text-xs flex-none">#{item.id}</span>
                <span className="truncate">{item.title}</span>
                <span className="ml-auto text-xs text-slate-400 flex-none">{item.itemType}</span>
              </li>
            ))}
            {filtered.length === 0 && <li className="px-3 py-3 text-xs text-slate-400">No items available</li>}
          </ul>
        </div>
      )}
    </div>
  )
}

type Comment = { id: number; author: string; text: string; date: string }

function CommentSection({ currentUser }: { currentUser: UserSummaryDto | null }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [draft, setDraft] = useState("")

  const submit = () => {
    if (!draft.trim() || !currentUser) return
    setComments((c) => [...c, {
      id: Date.now(),
      author: currentUser.username,
      text: draft.trim(),
      date: new Date().toLocaleString("ro-RO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
    }])
    setDraft("")
  }

  const authorName = currentUser?.username ?? ""

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Comments</h2>
      {comments.length === 0 && (
        <p className="text-sm text-slate-400 italic">No comments yet. Be the first to comment.</p>
      )}
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-900 text-xs font-semibold">
              {initials(c.author)}
            </div>
            <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-semibold text-slate-900">{c.author}</span>
                <span className="text-xs text-slate-400">{c.date}</span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
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
              disabled={!draft.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-3 w-3" /> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export type WorkItemType = "bug" | "task" | "user-story" | "epic"

interface WorkItemFormConfig {
  icon: React.ReactNode
  iconBg: string
  iconBorder: string
  heading: string
  titlePlaceholder: string
  descPlaceholder: string
  saveLabel: string
  parentLabel: string
  itemType: ItemType
  showParent: boolean
  showChildren: boolean
}

const configs: Record<WorkItemType, WorkItemFormConfig> = {
  task: {
    icon: <CheckSquare className="h-5 w-5 text-sky-700" />,
    iconBg: "bg-sky-50", iconBorder: "border-sky-200",
    heading: "Task",
    titlePlaceholder: "What needs to be done?",
    descPlaceholder: "Provide context, steps, or any relevant details…",
    saveLabel: "Save Task",
    parentLabel: "Parent",
    itemType: "Task",
    showParent: true,
    showChildren: false,
  },
  bug: {
    icon: <Bug className="h-5 w-5 text-rose-700" />,
    iconBg: "bg-rose-50", iconBorder: "border-rose-200",
    heading: "Bug Report",
    titlePlaceholder: "Short, descriptive title of the bug…",
    descPlaceholder: "Describe the bug, steps to reproduce, expected vs. actual behaviour…",
    saveLabel: "Save Bug",
    parentLabel: "Parent",
    itemType: "Bug",
    showParent: true,
    showChildren: false,
  },
  "user-story": {
    icon: <BookOpen className="h-5 w-5 text-emerald-700" />,
    iconBg: "bg-emerald-50", iconBorder: "border-emerald-200",
    heading: "User Story",
    titlePlaceholder: "Add a title",
    descPlaceholder: "Describe the feature from the user's perspective…",
    saveLabel: "Save User Story",
    parentLabel: "Parent Epic",
    itemType: "User_Story",
    showParent: true,
    showChildren: true,
  },
  epic: {
    icon: <Zap className="h-5 w-5 text-violet-700" />,
    iconBg: "bg-violet-50", iconBorder: "border-violet-200",
    heading: "Epic",
    titlePlaceholder: "Name of the epic…",
    descPlaceholder: "Describe the scope and goals of this epic…",
    saveLabel: "Save Epic",
    parentLabel: "Parent",
    itemType: "Epic",
    showParent: false,
    showChildren: true,
  },
}

export default function WorkItemForm({
    type,
    initialData
}: {
  type: WorkItemType
  initialData?: WorkItemResponseDto
}) {
  const navigate = useNavigate()
  const cfg = configs[type]
  const isEdit = !!initialData

  const [currentUser, setCurrentUser] = useState<UserSummaryDto | null>(null)
  const [projectMembers, setProjectMembers] = useState<UserSummaryDto[]>([])
  const [projectWorkItems, setProjectWorkItems] = useState<WorkItemSummaryDto[]>([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [title, setTitle]           = useState(initialData?.title ?? "")
  const [description, setDesc]      = useState(initialData?.description ?? "")
  const [acceptanceCriteria, setAC] = useState("")
  const [severity, setSeverity]     = useState<string>(initialData?.severity ?? "")
  const [assignees, setAssignees]   = useState<string[]>(initialData?.assignees?.map((a) => String(a.id)) ?? [])
  const [deadline, setDeadline]     = useState(initialData?.dueDate ?? "")
  const [startDate, setStartDate]   = useState("")
  const [endDate, setEndDate]       = useState(initialData?.dueDate ?? "")
  const [parent, setParent]         = useState(initialData?.parent ? String(initialData.parent.id) : "")
  const [children, setChildren]     = useState<string[]>(initialData?.children?.map((c) => String(c.id)) ?? [])

  const [baseline, setBaseline] = useState({
    title:              initialData?.title ?? "",
    description:        initialData?.description ?? "",
    acceptanceCriteria: "",
    severity:           initialData?.severity ?? "",
    deadline:           initialData?.dueDate ?? "",
    startDate:          "",
    endDate:            initialData?.dueDate ?? "",
    parent:             initialData?.parent ? String(initialData.parent.id) : "",
    assignees:          JSON.stringify(initialData?.assignees?.map((a) => String(a.id)) ?? []),
    children:           JSON.stringify(initialData?.children?.map((c) => String(c.id)) ?? []),
  })

  useEffect(() => {
    const projectId = Number(localStorage.getItem("selectedProject"))

    async function load() {
      try {
        const [user, members, workItems] = await Promise.all([
          getCurrentUser(),
          getMembersByProjectId(projectId),
          getWorkItemsByProjectId(projectId),
        ])
        setCurrentUser(user)
        setProjectMembers(members)
        setProjectWorkItems(workItems.filter((w: WorkItemSummaryDto) => w.id !== initialData?.id))
      } catch (e) {
        console.error("Failed to load form data", e)
      }
    }
    load()
  }, [])

  const createdDate = initialData?.createdAt
    ? new Date(initialData.createdAt).toLocaleDateString("ro-RO", { day: "2-digit", month: "short", year: "numeric" })
    : new Date().toLocaleDateString("ro-RO", { day: "2-digit", month: "short", year: "numeric" })
  const reporter = initialData?.reporter ?? currentUser

  const isDirty =
    title              !== baseline.title ||
    description        !== baseline.description ||
    acceptanceCriteria !== baseline.acceptanceCriteria ||
    severity           !== baseline.severity ||
    deadline           !== baseline.deadline ||
    startDate          !== baseline.startDate ||
    endDate            !== baseline.endDate ||
    parent             !== baseline.parent ||
    JSON.stringify(assignees) !== baseline.assignees ||
    JSON.stringify(children)  !== baseline.children

  const titleOk    = title.trim() !== ""
  const descOk     = description.trim() !== ""
  const severityOk = severity !== ""
  const canSave    = titleOk && descOk && severityOk && (!isEdit || isDirty)

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setSaveError(null)

    try {
      const projectId = Number(localStorage.getItem("selectedProject"))

      if (isEdit) {
        const payload: WorkItemUpdateDto = {
          title,
          description,
          severity: severity as Severity,
          dueDate: endDate,
          assigneesIds: assignees.map(Number),
        }
        await updateWorkItem(initialData!.id, payload)
        setBaseline({ title, description, acceptanceCriteria, severity, deadline, startDate, endDate, parent, assignees: JSON.stringify(assignees), children: JSON.stringify(children) })
      } else {
        const payload: WorkItemCreateDto = {
          title,
          description,
          itemType: cfg.itemType,
          severity: severity as Severity,
          projectId,
          parentId: parent ? Number(parent) : undefined,
          dueDate: endDate,
          assigneesIds: assignees.map(Number),
        }
        await createWorkItem(payload)
        navigate("/project/work-items")
      }
    } catch (e) {
      setSaveError("Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Work Items
        </button>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${cfg.iconBg} ${cfg.iconBorder}`}>
            {cfg.icon}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              {isEdit ? "Edit Work Item" : "New Work Item"}
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">{cfg.heading}</h1>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* Left column */}
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <FieldLabel required satisfied={titleOk}>Title</FieldLabel>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={cfg.titlePlaceholder}
                className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                  !titleOk
                    ? "border-rose-400 hover:border-rose-400 focus:border-rose-400 focus:ring-rose-100"
                    : "border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-slate-200"
                }`}
              />
            </div>

            <div>
              <FieldLabel required satisfied={descOk}>Description</FieldLabel>
              <textarea
                value={description}
                onChange={(e) => setDesc(e.target.value)}
                placeholder={cfg.descPlaceholder}
                rows={6}
                className={`w-full resize-none rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                  !descOk
                    ? "border-rose-400 hover:border-rose-400 focus:border-rose-400 focus:ring-rose-100"
                    : "border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-slate-200"
                }`}
              />
            </div>

            {(!titleOk || !descOk || !severityOk) && (
              <div className="flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700">
                <AlertCircle className="h-4 w-4 flex-none" />
                <span>Title, description, and severity are required to save.</span>
              </div>
            )}

            {saveError && (
              <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 flex-none" />
                <span>{saveError}</span>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <CommentSection currentUser={currentUser} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-3.5">
            <div>
              <FieldLabel>Status</FieldLabel>
              <LockedField>
                <span className="h-2 w-2 rounded-full flex-none bg-sky-500" />
                <span className="text-sm text-slate-600">{initialData?.status ?? "To Do"}</span>
              </LockedField>
            </div>

            <div>
              <FieldLabel required satisfied={severityOk}>Severity</FieldLabel>
              <SelectDropdown
                value={severity}
                options={severityOptions}
                onChange={setSeverity}
                placeholder="Select severity…"
                error={!severityOk}
                renderOption={(v) => (
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.15em] ${severityMeta[v as keyof typeof severityMeta]?.className}`}>
                    {v}
                  </span>
                )}
                renderSelected={(v) => (
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.15em] ${severityMeta[v as keyof typeof severityMeta]?.className}`}>
                    {v}
                  </span>
                )}
              />
            </div>

            <div>
              <FieldLabel>Created By</FieldLabel>
              <LockedField>
                {reporter ? (
                  <>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-900 text-[10px] font-semibold flex-none">
                      {initials(reporter.username)}
                    </div>
                    <span className="text-sm text-slate-600">{reporter.username}</span>
                  </>
                ) : (
                  <span className="text-sm text-slate-400">Loading…</span>
                )}
              </LockedField>
            </div>

            <div>
              <FieldLabel>Created Date</FieldLabel>
              <LockedField>
                <Calendar className="h-3.5 w-3.5 flex-none text-slate-400" />
                <span className="text-sm text-slate-600">{createdDate}</span>
              </LockedField>
            </div>

            <div>
              <FieldLabel>Deadline</FieldLabel>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
              </div>
            </div>

            <div>
              <FieldLabel>Assigned To</FieldLabel>
              <AssigneeMultiDropdown value={assignees} onChange={setAssignees} options={projectMembers} />
            </div>

            {cfg.showParent && (
              <div>
                <FieldLabel>{cfg.parentLabel}</FieldLabel>
                <ParentField
                value={parent}
                onChange={setParent}
                candidates={projectWorkItems.filter((w) =>
                    type === "user-story"
                    ? w.itemType === "Epic"
                    : ["Epic", "User_Story"].includes(w.itemType)
                )}
                />
              </div>
            )}

            {cfg.showChildren && (
              <div>
                <FieldLabel>Child Items</FieldLabel>
                <ChildItemsField
                value={children}
                onChange={setChildren}
                candidates={projectWorkItems.filter((w) =>
                    type === "epic"
                    ? w.itemType !== "Epic"
                    : ["Task", "Bug"].includes(w.itemType)
                )}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={!canSave || saving}
              onClick={handleSave}
              className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : isEdit ? "Save Changes" : cfg.saveLabel}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
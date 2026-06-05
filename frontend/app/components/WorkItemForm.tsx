import React, { useState, useRef, useEffect } from "react"
import {
  Bug, CheckSquare, Zap, BookOpen, ArrowLeft, ChevronDown, Search, UserCircle,
  AlertCircle, Send, Calendar, Link2, Lock, X, Plus, Pencil, Trash2
} from "lucide-react"
import { useNavigate } from "react-router"
import { severityMeta } from "../utils/status"
import { getCurrentUser } from "../api/user"
import {
  getWorkItemsByProjectId,
  getMembersByProjectId,
} from "../api/project"
import {
  getWorkItemComments,
  createWorkItem,
  updateWorkItem,
  setWorkItemParent,
  removeWorkItemParent,
  deleteWorkItem,
} from "../api/workItem"
import type {
  WorkItemCreateDto,
  WorkItemUpdateDto,
  WorkItemSummaryDto,
  WorkItemResponseDto,
} from "../types/workItem"
import type { UserSummaryDto } from "../types/user"
import type { ItemType, Severity, Status } from "../types/enums"
import { statusMeta } from "../utils/status"
import CommentSection from "./CommentSection"

const severityOptions = ["Low", "Medium", "High", "Critical", "Blocker"]
const statusOptions: { value: Status; label: string }[] = [
  { value: "To_do",       label: "To Do" },
  { value: "In_Progress", label: "In Progress" },
  { value: "Testing",     label: "Testing" },
  { value: "Done",        label: "Done" },
  { value: "Closed",      label: "Closed" },
]

function initials(username: string): string {
  const parts = username.split(/[.\s_-]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return username.slice(0, 2).toUpperCase()
}

const backendStatusMap: Record<string, keyof typeof statusMeta> = {
  To_do:       "ToDo",
  In_Progress: "InProgress",
  Testing:     "Testing",
  Done:        "Done",
  Closed:      "Closed",
}

function FieldLabel({ children, required, satisfied }: {
  children: React.ReactNode
  required?: boolean
  satisfied?: boolean
}) {
  return (
    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
      {children}
      {required && (
        <span className={`ml-1 transition-colors duration-300 ${satisfied ? "text-slate-300 dark:text-slate-600" : "text-rose-500 dark:text-rose-400"}`}>*</span>
      )}
    </label>
  )
}

function LockedField({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 px-3 py-2">
      {children}
      <Lock className="ml-auto h-3 w-3 flex-none text-slate-300 dark:text-slate-600" />
    </div>
  )
}

function ReadOnlyField({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 px-3 py-2">
      {children}
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
        className={`flex w-full items-center justify-between rounded-xl border bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none transition focus:ring-2 ${
          error
            ? "border-rose-400 dark:border-rose-600 focus:border-rose-400 focus:ring-rose-100 dark:focus:ring-rose-900/30"
            : "border-slate-200 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 focus:ring-slate-100 dark:focus:ring-slate-700"
        }`}
      >
        <span className="text-sm">
          {value
            ? (renderSelected ? renderSelected(value) : value)
            : <span className="text-slate-400 dark:text-slate-500">{placeholder ?? "Select…"}</span>
          }
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 flex-none ml-2" />
      </button>
      {open && (
        <ul className="absolute left-0 z-20 mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
          {options.map((opt) => (
            <li
              key={opt}
              className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-700 ${opt === value ? "font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-700" : "text-slate-700 dark:text-slate-300"}`}
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
            <span key={user.id} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 pl-1.5 pr-1 py-0.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[9px] font-semibold flex-none">
                {initials(user.username)}
              </div>
              {user.username}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); onChange(value.filter((v) => v !== String(user.id))) }}
                className="ml-0.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"
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
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm outline-none transition hover:border-slate-400 dark:hover:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
      >
        <div className="flex items-center gap-2">
          <UserCircle className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          <span className="text-sm text-slate-400 dark:text-slate-500">{selectedUsers.length === 0 ? "Add assignee…" : "Add more…"}</span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 flex-none" />
      </button>
      {open && (
        <div className="absolute left-0 z-20 mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
          <div className="px-2.5 py-2 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-2 py-1.5">
              <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 flex-none" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>
          <ul className="max-h-44 overflow-auto">
            {filtered.map((opt) => {
              const selected = value.includes(String(opt.id))
              return (
                <li
                  key={opt.id}
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-700 ${selected ? "bg-slate-50 dark:bg-slate-700" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); toggle(String(opt.id)) }}
                >
                  <div className={`h-4 w-4 flex-none rounded border flex items-center justify-center transition-colors ${selected ? "bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"}`}>
                    {selected && (
                      <svg className="h-2.5 w-2.5 text-white dark:text-slate-900" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </div>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-semibold flex-none">
                    {initials(opt.username)}
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">{opt.username}</span>
                </li>
              )
            })}
            {filtered.length === 0 && <li className="px-3 py-3 text-xs text-slate-400 dark:text-slate-500">No results</li>}
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
      <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 transition hover:border-slate-400 dark:hover:border-slate-500 focus-within:ring-2 focus-within:ring-slate-100 dark:focus-within:ring-slate-700 overflow-hidden">
        <Link2 className="ml-3 h-3.5 w-3.5 flex-none text-slate-400 dark:text-slate-500" />
        <input
          value={typed}
          onChange={(e) => { setTyped(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Type ID or search…"
          className="flex-1 bg-transparent px-2.5 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
        {value && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setTyped(""); onChange("") }}
            className="mr-2.5 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute left-0 z-20 mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              onMouseDown={(e) => {
                e.preventDefault()
                setTyped(`#${p.id} ${p.title}`)
                onChange(String(p.id))
                setOpen(false)
              }}
            >
              <span className="font-semibold text-slate-400 dark:text-slate-500 text-xs flex-none">#{p.id}</span>
              <span className="truncate">{p.title}</span>
              <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 flex-none">{p.itemType}</span>
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
            <span key={item.id} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 pl-2 pr-1 py-1 text-xs text-slate-700 dark:text-slate-300">
              <span className="font-semibold text-slate-400 dark:text-slate-500">#{item.id}</span>
              <span className="truncate">{item.title}</span>
              <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 flex-none mr-1">{item.itemType}</span>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); remove(String(item.id)) }}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition flex-none"
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
        className="flex w-full items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm outline-none transition hover:border-slate-400 dark:hover:border-slate-500 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-700"
      >
        <Plus className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
        <span className="text-sm text-slate-400 dark:text-slate-500">Link child item…</span>
      </button>
      {open && (
        <div className="absolute left-0 z-20 mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
          <div className="px-2.5 py-2 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-2 py-1.5">
              <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 flex-none" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>
          <ul className="max-h-44 overflow-auto">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                onMouseDown={(e) => { e.preventDefault(); add(String(item.id)) }}
              >
                <span className="font-semibold text-slate-400 dark:text-slate-500 text-xs flex-none">#{item.id}</span>
                <span className="truncate">{item.title}</span>
                <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 flex-none">{item.itemType}</span>
              </li>
            ))}
            {filtered.length === 0 && <li className="px-3 py-3 text-xs text-slate-400 dark:text-slate-500">No items available</li>}
          </ul>
        </div>
      )}
    </div>
  )
}

export type WorkItemType = "bug" | "task" | "user-story" | "epic"
export type WorkItemMode = "new" | "edit" | "view"

interface WorkItemFormConfig {
  icon: React.ReactNode
  iconBg: string
  iconBorder: string
  iconBgDark: string
  iconBorderDark: string
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
    icon: <CheckSquare className="h-5 w-5 text-sky-700 dark:text-sky-400" />,
    iconBg: "bg-sky-50", iconBorder: "border-sky-200",
    iconBgDark: "dark:bg-sky-950/50", iconBorderDark: "dark:border-sky-800",
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
    icon: <Bug className="h-5 w-5 text-rose-700 dark:text-rose-400" />,
    iconBg: "bg-rose-50", iconBorder: "border-rose-200",
    iconBgDark: "dark:bg-rose-950/50", iconBorderDark: "dark:border-rose-800",
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
    icon: <BookOpen className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />,
    iconBg: "bg-emerald-50", iconBorder: "border-emerald-200",
    iconBgDark: "dark:bg-emerald-950/50", iconBorderDark: "dark:border-emerald-800",
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
    icon: <Zap className="h-5 w-5 text-violet-700 dark:text-violet-400" />,
    iconBg: "bg-violet-50", iconBorder: "border-violet-200",
    iconBgDark: "dark:bg-violet-950/50", iconBorderDark: "dark:border-violet-800",
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
    mode = "new",
    initialData
}: {
  type: WorkItemType
  mode?: WorkItemMode
  initialData?: WorkItemResponseDto
}) {
  const navigate = useNavigate()
  const cfg = configs[type]
  const isView = mode === "view"
  const isEdit = mode === "edit"

  const [currentUser, setCurrentUser] = useState<UserSummaryDto | null>(null)
  const [projectMembers, setProjectMembers] = useState<UserSummaryDto[]>([])
  const [projectWorkItems, setProjectWorkItems] = useState<WorkItemSummaryDto[]>([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [title, setTitle]           = useState(initialData?.title ?? "")
  const [description, setDesc]      = useState(initialData?.description ?? "")
  const [status, setStatus] = useState<string>(initialData?.status ?? "To_do")
  const [severity, setSeverity]     = useState<string>(initialData?.severity ?? "")
  const [assignees, setAssignees]   = useState<string[]>(initialData?.assignees?.map((a) => String(a.id)) ?? [])
  const [deadline, setDeadline]     = useState(initialData?.dueDate ?? "")
  const [parent, setParent]         = useState(initialData?.parent ? String(initialData.parent.id) : "")
  const [children, setChildren]     = useState<string[]>(initialData?.children?.map((c) => String(c.id)) ?? [])

  const [baseline, setBaseline] = useState({
    title:              initialData?.title ?? "",
    description:        initialData?.description ?? "",
    status:             initialData?.status ?? "To_do" as Status,
    severity:           initialData?.severity ?? "",
    deadline:           initialData?.dueDate ?? "",
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
    status             !== baseline.status ||
    severity           !== baseline.severity ||
    deadline           !== baseline.deadline ||
    parent             !== baseline.parent ||
    JSON.stringify(assignees) !== baseline.assignees ||
    JSON.stringify(children)  !== baseline.children

  const titleOk    = title.trim() !== ""
  const descOk     = description.trim() !== ""
  const severityOk = severity !== ""
  const canSave    = titleOk && descOk && severityOk && (!isEdit || isDirty)

  const canEdit = currentUser && initialData && (
    currentUser.role === "ADMIN" ||
    currentUser.role === "MANAGER" ||
    currentUser.id === initialData.reporter?.id
  )

  const canDelete = currentUser && initialData && (
    currentUser.role === "ADMIN" ||
    currentUser.role === "MANAGER"
  )

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
          status: status as Status,
          severity: severity as Severity,
          dueDate: deadline || undefined,
          assigneesIds: assignees.map(Number),
        }
        await updateWorkItem(initialData!.id, payload)

        const originalParent = baseline.parent
        if (parent !== originalParent) {
          if (parent) {
            await setWorkItemParent(initialData!.id, Number(parent))
          } else {
            await removeWorkItemParent(initialData!.id)
          }
        }

        const originalChildren = JSON.parse(baseline.children) as string[]
        const added   = children.filter((id) => !originalChildren.includes(id))
        const removed = originalChildren.filter((id) => !children.includes(id))

        await Promise.all([
          ...added.map((id)   => setWorkItemParent(Number(id), initialData!.id)),
          ...removed.map((id) => removeWorkItemParent(Number(id))),
        ])

        setBaseline({
          title,
          description,
          status: status as Status,
          severity,
          deadline,
          parent,
          assignees: JSON.stringify(assignees),
          children:  JSON.stringify(children),
        })

      } else {
        const payload: WorkItemCreateDto = {
          title,
          description,
          itemType: cfg.itemType,
          severity: severity as Severity,
          projectId,
          parentId: parent ? Number(parent) : undefined,
          dueDate: deadline,
          assigneesIds: assignees.map(Number),
        }
        const created = await createWorkItem(payload)

        if (children.length > 0) {
          await Promise.all(children.map((id) => setWorkItemParent(Number(id), created.id)))
        }

        navigate("/project/work-items")
      }
    } catch (e) {
      if (e instanceof Error) {
        setSaveError(e.message)
      } else {
        setSaveError("Failed to save. Please try again.")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData) return
    setDeleting(true)
    try {
      await deleteWorkItem(initialData.id)
      navigate("/project/work-items")
    } catch (e) {
      console.error("Failed to delete work item", e)
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const statusKey   = backendStatusMap[initialData?.status ?? ""] ?? "ToDo"
  const statusClass = statusMeta[statusKey]
  const assignedUsers = projectMembers.filter((m) => assignees.includes(String(m.id)))

  const modeLabel = isView ? "View Work Item" : isEdit ? "Edit Work Item" : "New Work Item"

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Work Items
        </button>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${cfg.iconBg} ${cfg.iconBorder} ${cfg.iconBgDark} ${cfg.iconBorderDark}`}>
              {cfg.icon}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">{modeLabel}</p>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{cfg.heading}</h1>
            </div>
          </div>

          {isView && initialData && (
            <div className="flex items-center gap-2">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => navigate(`/project/work-items/${initialData.id}/edit`)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-4 py-2.5 text-sm font-semibold text-rose-700 dark:text-rose-400 transition hover:bg-rose-100 dark:hover:bg-rose-950/60"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-none items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800">
                <Trash2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Delete work item?</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  This will permanently delete <span className="font-semibold text-slate-700 dark:text-slate-300">#{initialData?.id} — {initialData?.title}</span>. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-2xl bg-rose-600 dark:bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 dark:hover:bg-rose-600 disabled:opacity-40"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* Left column */}
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-5">

            {/* Title */}
            <div>
              <FieldLabel required={!isView} satisfied={titleOk}>Title</FieldLabel>
              {isView ? (
                <p className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {title || <span className="text-slate-400 dark:text-slate-500 italic">No title</span>}
                </p>
              ) : (
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={cfg.titlePlaceholder}
                  className={`w-full rounded-2xl border bg-slate-50 dark:bg-slate-700/50 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 ${
                    !titleOk
                      ? "border-rose-400 dark:border-rose-600 hover:border-rose-400 focus:border-rose-400 focus:ring-rose-100 dark:focus:ring-rose-900/30"
                      : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 focus:border-slate-400 dark:focus:border-slate-400 focus:ring-slate-200 dark:focus:ring-slate-700"
                  }`}
                />
              )}
            </div>

            {/* Description */}
            <div>
              <FieldLabel required={!isView} satisfied={descOk}>Description</FieldLabel>
              {isView ? (
                <p className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap min-h-24">
                  {description || <span className="text-slate-400 dark:text-slate-500 italic">No description provided.</span>}
                </p>
              ) : (
                <textarea
                  value={description}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder={cfg.descPlaceholder}
                  rows={6}
                  className={`w-full resize-none rounded-2xl border bg-slate-50 dark:bg-slate-700/50 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 ${
                    !descOk
                      ? "border-rose-400 dark:border-rose-600 hover:border-rose-400 focus:border-rose-400 focus:ring-rose-100 dark:focus:ring-rose-900/30"
                      : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 focus:border-slate-400 dark:focus:border-slate-400 focus:ring-slate-200 dark:focus:ring-slate-700"
                  }`}
                />
              )}
            </div>

            {!isView && (!titleOk || !descOk || !severityOk) && (
              <div className="flex items-center gap-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
                <AlertCircle className="h-4 w-4 flex-none" />
                <span>Title, description, and severity are required to save.</span>
              </div>
            )}

            {saveError && (
              <div className="flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-4 py-3 text-xs text-rose-700 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 flex-none" />
                <span>{saveError}</span>
              </div>
            )}
          </div>

          {/* Comments */}
          {isView && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
              <CommentSection currentUser={currentUser} workItemId={initialData!.id} reporterId={initialData?.reporter?.id}/>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm space-y-3.5">

            {/* Status */}
            <div>
              <FieldLabel>Status</FieldLabel>
              {isView ? (
                <ReadOnlyField>
                  <span className={`h-2 w-2 rounded-full flex-none ${statusMeta[backendStatusMap[status] ?? "ToDo"]?.dotClass ?? "bg-sky-500"}`} />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{statusMeta[backendStatusMap[status] ?? "ToDo"]?.label ?? status}</span>
                </ReadOnlyField>
              ) : (
                <SelectDropdown
                  value={status}
                  options={statusOptions.map((s) => s.value)}
                  onChange={setStatus}
                  renderOption={(v) => {
                    const key = backendStatusMap[v] ?? "ToDo"
                    const meta = statusMeta[key]
                    return (
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full flex-none ${meta?.dotClass ?? "bg-slate-300"}`} />
                        <span>{meta?.label ?? v}</span>
                      </div>
                    )
                  }}
                  renderSelected={(v) => {
                    const key = backendStatusMap[v] ?? "ToDo"
                    const meta = statusMeta[key]
                    return (
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full flex-none ${meta?.dotClass ?? "bg-slate-300"}`} />
                        <span>{meta?.label ?? v}</span>
                      </div>
                    )
                  }}
                />
              )}
            </div>

            {/* Severity */}
            <div>
              <FieldLabel required={!isView} satisfied={severityOk}>Severity</FieldLabel>
              {isView ? (
                <ReadOnlyField>
                  {severity ? (
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.15em] ${severityMeta[severity as keyof typeof severityMeta]?.className}`}>
                      {severity}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400 dark:text-slate-500 italic">Not set</span>
                  )}
                </ReadOnlyField>
              ) : (
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
              )}
            </div>

            {/* Created By */}
            <div>
              <FieldLabel>Created By</FieldLabel>
              <ReadOnlyField>
                {reporter ? (
                  <>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-semibold flex-none">
                      {initials(reporter.username)}
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">{reporter.username}</span>
                  </>
                ) : (
                  <span className="text-sm text-slate-400 dark:text-slate-500">Loading…</span>
                )}
              </ReadOnlyField>
            </div>

            {/* Created Date */}
            <div>
              <FieldLabel>Created Date</FieldLabel>
              <ReadOnlyField>
                <Calendar className="h-3.5 w-3.5 flex-none text-slate-400 dark:text-slate-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">{createdDate}</span>
              </ReadOnlyField>
            </div>

            {/* Deadline */}
            <div>
              <FieldLabel>Deadline</FieldLabel>
              {isView ? (
                <ReadOnlyField>
                  <Calendar className="h-3.5 w-3.5 flex-none text-slate-400 dark:text-slate-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {deadline
                      ? new Date(deadline).toLocaleDateString("ro-RO", { day: "2-digit", month: "short", year: "numeric" })
                      : <span className="text-slate-400 dark:text-slate-500 italic">Not set</span>
                    }
                  </span>
                </ReadOnlyField>
              ) : (
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 pl-9 pr-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none transition hover:border-slate-300 dark:hover:border-slate-500 focus:border-slate-400 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 scheme-light dark:scheme-dark"
                  />
                </div>
              )}
            </div>

            {/* Assigned To */}
            <div>
              <FieldLabel>Assigned To</FieldLabel>
              {isView ? (
                <div className="space-y-1.5">
                  {assignedUsers.length === 0 ? (
                    <ReadOnlyField>
                      <UserCircle className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <span className="text-sm text-slate-400 dark:text-slate-500 italic">Unassigned</span>
                    </ReadOnlyField>
                  ) : (
                    assignedUsers.map((user) => (
                      <ReadOnlyField key={user.id}>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-900 dark:border-blue-700 text-[10px] font-semibold flex-none">
                          {initials(user.username)}
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{user.username}</span>
                      </ReadOnlyField>
                    ))
                  )}
                </div>
              ) : (
                <AssigneeMultiDropdown value={assignees} onChange={setAssignees} options={projectMembers} />
              )}
            </div>

            {/* Parent */}
            {cfg.showParent && (
              <div>
                <FieldLabel>{cfg.parentLabel}</FieldLabel>
                {isView ? (
                  <ReadOnlyField>
                    <Link2 className="h-3.5 w-3.5 flex-none text-slate-400 dark:text-slate-500" />
                    {parent ? (
                      (() => {
                        const p = projectWorkItems.find((w) => String(w.id) === parent)
                        return p
                          ? <span className="text-sm text-slate-700 dark:text-slate-300"><span className="font-semibold text-slate-400 dark:text-slate-500 mr-1">#{p.id}</span>{p.title}</span>
                          : <span className="text-sm text-slate-700 dark:text-slate-300">#{parent}</span>
                      })()
                    ) : (
                      <span className="text-sm text-slate-400 dark:text-slate-500 italic">None</span>
                    )}
                  </ReadOnlyField>
                ) : (
                  <ParentField
                    value={parent}
                    onChange={setParent}
                    candidates={projectWorkItems.filter((w) =>
                      type === "user-story"
                        ? w.itemType === "Epic"
                        : ["Epic", "User_Story"].includes(w.itemType)
                    )}
                  />
                )}
              </div>
            )}

            {/* Child Items */}
            {cfg.showChildren && (
              <div>
                <FieldLabel>Child Items</FieldLabel>
                {isView ? (
                  <div className="space-y-1.5">
                    {children.length === 0 ? (
                      <ReadOnlyField>
                        <span className="text-sm text-slate-400 dark:text-slate-500 italic">No child items</span>
                      </ReadOnlyField>
                    ) : (
                      children.map((childId) => {
                        const child = projectWorkItems.find((w) => String(w.id) === childId)
                        return (
                          <ReadOnlyField key={childId}>
                            <span className="font-semibold text-slate-400 dark:text-slate-500 text-xs flex-none">#{childId}</span>
                            <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{child?.title ?? "—"}</span>
                            {child && <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 flex-none">{child.itemType}</span>}
                          </ReadOnlyField>
                        )
                      })
                    )}
                  </div>
                ) : (
                  <ChildItemsField
                    value={children}
                    onChange={setChildren}
                    candidates={projectWorkItems.filter((w) =>
                      type === "epic"
                        ? w.itemType !== "Epic"
                        : ["Task", "Bug"].includes(w.itemType)
                    )}
                  />
                )}
              </div>
            )}
          </div>

          {/* Action buttons — only for new/edit */}
          {!isView && (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={!canSave || saving}
                onClick={handleSave}
                className="w-full rounded-2xl bg-slate-900 dark:bg-slate-100 px-5 py-3 text-sm font-semibold text-white dark:text-slate-900 transition hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : isEdit ? "Save Changes" : cfg.saveLabel}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
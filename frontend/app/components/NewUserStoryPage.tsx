import React, { useState, useRef, useEffect } from "react"
import {
  BookOpen, ArrowLeft, ChevronDown, Search, UserCircle,
  AlertCircle, Send, Paperclip, Calendar, Link2, Lock, X, Plus} from "lucide-react"
import { useNavigate } from "react-router"
import { priorityMeta } from "../src/status"

const severityOptions = ["Blocker", "Critical", "High", "Medium", "Low"]
const assigneeOptions = ["Unassigned", "Mihai Pop", "Luke Tomson", "Maria Ionescu", "Ana Serban", "Alex Tudor", "Joe Nik"]
const parentOptions = [
  { id: "11", title: "Save settings button not working", type: "Epic" },
  { id: "10", title: "Implement user settings", type: "User Story" },
]

const childCandidates = [
  { id: "9",  title: "Login functionality not working", type: "Bug" },
  { id: "10", title: "Implement user settings", type: "User Story" },
  { id: "12", title: "Drop-down button not working", type: "Task" },
]

const CURRENT_USER = "Joe Nik"
const CREATED_DATE = new Date().toLocaleDateString("ro-RO", { day: "2-digit", month: "short", year: "numeric" })
const STATUS_DOT = "bg-sky-500"

function initials(name: string) {
  return name === "Unassigned" ? null : name.split(" ").map((n) => n[0]).join("").toUpperCase()
}

function FieldLabel({ children, required, satisfied }: { children: React.ReactNode; required?: boolean; satisfied?: boolean }) {
  return (
    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
      {children}
      {required && <span className={`ml-1 transition-colors duration-300 ${satisfied ? "text-slate-300" : "text-rose-500"}`}>*</span>}
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

function SelectDropdown({
  value, options, onChange, placeholder, renderOption, renderSelected, error,
}: {
  value: string; options: string[]; onChange: (v: string) => void
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
        <span>{value ? (renderSelected ? renderSelected(value) : value) : <span className="text-slate-400 text-sm">{placeholder ?? "Select…"}</span>}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 flex-none ml-2" />
      </button>
      {open && (
        <ul className="absolute left-0 z-20 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          {options.map((opt) => (
            <li key={opt} className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition hover:bg-slate-50 ${opt === value ? "font-semibold text-slate-900 bg-slate-50" : "text-slate-700"}`}
              onMouseDown={(e) => { e.preventDefault(); onChange(opt); setOpen(false) }}>
              {renderOption ? renderOption(opt) : opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AssigneeMultiDropdown({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setSearch("") } }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])
  const filtered = assigneeOptions.filter((o) => o !== "Unassigned" && o.toLowerCase().includes(search.toLowerCase()))
  const toggle = (name: string) => value.includes(name) ? onChange(value.filter((v) => v !== name)) : onChange([...value, name])
  return (
    <div ref={ref} className="relative">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {value.map((name) => (
            <span key={name} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 pl-1.5 pr-1 py-0.5 text-xs text-slate-700">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-900 text-[9px] font-semibold flex-none">{initials(name)}</div>
              {name}
              <button type="button" onMouseDown={(e) => { e.preventDefault(); onChange(value.filter((v) => v !== name)) }} className="ml-0.5 text-slate-400 hover:text-slate-600 transition"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      )}
      <button type="button" onClick={() => { setOpen((o) => !o); setSearch("") }}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition hover:border-slate-400 focus:ring-2 focus:ring-slate-200">
        <div className="flex items-center gap-2"><UserCircle className="h-4 w-4 text-slate-400" /><span className="text-sm text-slate-400">{value.length === 0 ? "Add assignee…" : "Add more…"}</span></div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 flex-none" />
      </button>
      {open && (
        <div className="absolute left-0 z-20 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="px-2.5 py-2 border-b border-slate-100">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
              <Search className="h-3.5 w-3.5 text-slate-400 flex-none" />
              <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="w-full bg-transparent text-xs text-slate-700 outline-none" />
            </div>
          </div>
          <ul className="max-h-44 overflow-auto">
            {filtered.map((opt) => {
              const selected = value.includes(opt)
              return (
                <li key={opt} className={`flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer transition hover:bg-slate-50 ${selected ? "bg-slate-50" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); toggle(opt) }}>
                  <div className={`h-4 w-4 flex-none rounded border flex items-center justify-center transition-colors ${selected ? "bg-slate-900 border-slate-900" : "border-slate-300 bg-white"}`}>
                    {selected && <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5" /></svg>}
                  </div>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-900 text-[10px] font-semibold flex-none">{initials(opt)}</div>
                  <span>{opt}</span>
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

function ParentField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState(value)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { setTyped(value) }, [value])
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])
  const filtered = parentOptions.filter((p) => p.id.includes(typed.replace("#", "")) || p.title.toLowerCase().includes(typed.toLowerCase()))
  return (
    <div ref={ref} className="relative">
      <div className="flex items-center rounded-xl border border-slate-200 bg-white transition hover:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 overflow-hidden">
        <Link2 className="ml-3 h-3.5 w-3.5 flex-none text-slate-400" />
        <input value={typed} onChange={(e) => { setTyped(e.target.value); onChange(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)}
          placeholder="Type ID or search…" className="flex-1 bg-transparent px-2.5 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400" />
        {typed && <button type="button" onMouseDown={(e) => { e.preventDefault(); setTyped(""); onChange("") }} className="mr-2.5 text-slate-300 hover:text-slate-500 transition"><X className="h-3.5 w-3.5" /></button>}
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute left-0 z-20 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          {filtered.map((p) => (
            <li key={p.id} className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 text-slate-700"
              onMouseDown={(e) => { e.preventDefault(); setTyped(`#${p.id}`); onChange(p.id); setOpen(false) }}>
              <span className="font-semibold text-slate-400 text-xs flex-none">#{p.id}</span>
              <span className="truncate">{p.title}</span>
              <span className="ml-auto text-xs text-slate-400 flex-none">{p.type}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ChildItemsField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setSearch("") } }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])
  const filtered = childCandidates.filter((c) => !value.includes(c.id) && (c.id.includes(search) || c.title.toLowerCase().includes(search.toLowerCase())))
  const remove = (id: string) => onChange(value.filter((v) => v !== id))
  const add = (id: string) => { onChange([...value, id]); setSearch(""); setOpen(false) }
  const selectedItems = childCandidates.filter((c) => value.includes(c.id))
  return (
    <div ref={ref} className="relative">
      {selectedItems.length > 0 && (
        <div className="flex flex-col gap-1 mb-1.5">
          {selectedItems.map((item) => (
            <span key={item.id} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 pl-2 pr-1 py-1 text-xs text-slate-700">
              <span className="font-semibold text-slate-400">#{item.id}</span>
              <span className="truncate">{item.title}</span>
              <span className="ml-auto text-[10px] text-slate-400 flex-none mr-1">{item.type}</span>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); remove(item.id) }} className="text-slate-400 hover:text-slate-600 transition flex-none"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      )}
      <button type="button" onClick={() => { setOpen((o) => !o); setSearch("") }}
        className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition hover:border-slate-400 focus:ring-2 focus:ring-slate-200">
        <Plus className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-sm text-slate-400">Link child item…</span>
      </button>
      {open && (
        <div className="absolute left-0 z-20 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="px-2.5 py-2 border-b border-slate-100">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
              <Search className="h-3.5 w-3.5 text-slate-400 flex-none" />
              <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="w-full bg-transparent text-xs text-slate-700 outline-none" />
            </div>
          </div>
          <ul className="max-h-44 overflow-auto">
            {filtered.map((item) => (
              <li key={item.id} className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 text-slate-700"
                onMouseDown={(e) => { e.preventDefault(); add(item.id) }}>
                <span className="font-semibold text-slate-400 text-xs flex-none">#{item.id}</span>
                <span className="truncate">{item.title}</span>
                <span className="ml-auto text-xs text-slate-400 flex-none">{item.type}</span>
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
function CommentSection() {
  const [comments, setComments] = useState<Comment[]>([])
  const [draft, setDraft] = useState("")
  const submit = () => {
    if (!draft.trim()) return
    setComments((c) => [...c, { id: Date.now(), author: CURRENT_USER, text: draft.trim(), date: new Date().toLocaleString("ro-RO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) }])
    setDraft("")
  }
  return (
    <div className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Comments</h2>
      {comments.length === 0 && <p className="text-sm text-slate-400 italic">No comments yet. Be the first to comment.</p>}
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-900 text-xs font-semibold">{initials(c.author)}</div>
            <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-baseline gap-2 mb-1"><span className="text-sm font-semibold text-slate-900">{c.author}</span><span className="text-xs text-slate-400">{c.date}</span></div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-900 text-xs font-semibold">{initials(CURRENT_USER)}</div>
        <div className="flex-1 rounded-2xl border border-slate-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-slate-200 focus-within:border-slate-400 transition">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit() }}
            placeholder="Add a comment… (Ctrl+Enter to submit)" rows={3} className="w-full resize-none bg-transparent px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400" />
          <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
            <button type="button" className="inline-flex items-center gap-1.5 rounded-xl px-2 py-1 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"><Paperclip className="h-3.5 w-3.5" /> Attach</button>
            <button type="button" onClick={submit} disabled={!draft.trim()} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"><Send className="h-3 w-3" /> Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}

type WorkItemData = { id?: string; title?: string; description?: string; acceptanceCriteria?: string; severity?: string; assigned?: string[]; deadline?: string; parent?: string; status?: string }

export default function NewUserStoryPage({ initialData }: { initialData?: WorkItemData }) {
  const navigate = useNavigate()
  const isEdit = !!initialData
  const [title, setTitle] = useState(initialData?.title ?? "")
  const [description, setDescription] = useState(initialData?.description ?? "")
  const [acceptanceCriteria, setAC] = useState(initialData?.acceptanceCriteria ?? "")
  const [severity, setSeverity] = useState(initialData?.severity ?? "")
  const [assignees, setAssignees] = useState<string[]>(initialData?.assigned ?? [])
  const [deadline, setDeadline] = useState(initialData?.deadline ?? "")
  const [parent, setParent] = useState(initialData?.parent ?? "")

  const [baseline, setBaseline] = useState({
  title: initialData?.title ?? "",
  description: initialData?.description ?? "",
  acceptanceCriteria: initialData?.acceptanceCriteria ?? "",
  severity: initialData?.severity ?? "",
  deadline: initialData?.deadline ?? "",
  parent: initialData?.parent ?? "",
  assignees: JSON.stringify(initialData?.assigned ?? []),
})

const isDirty =
  title !== baseline.title ||
  description !== baseline.description ||
  acceptanceCriteria !== baseline.acceptanceCriteria ||
  severity !== baseline.severity ||
  deadline !== baseline.deadline ||
  parent !== baseline.parent ||
  JSON.stringify(assignees) !== baseline.assignees

  const titleOk = title.trim() !== ""
  const descOk = description.trim() !== ""
  const severityOk = severity !== ""
  const canSave = titleOk && descOk && severityOk && (!isEdit || isDirty)

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <button type="button" onClick={() => navigate(-1)} className="inline-flex w-fit items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Work Items
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200">
            <BookOpen className="h-5 w-5 text-emerald-700" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{isEdit ? "Edit Work Item" : "New Work Item"}</p>
            <h1 className="text-2xl font-semibold text-slate-900">User Story</h1>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <FieldLabel required satisfied={titleOk}>Title</FieldLabel>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title"
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
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the feature from the user's perspective…"
                rows={5}
                className={`w-full resize-none rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                    !descOk
                    ? "border-rose-400 hover:border-rose-400 focus:border-rose-400 focus:ring-rose-100"
                    : "border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-slate-200"
                }`}
              />
            </div>
            <div>
              <FieldLabel>Acceptance Criteria</FieldLabel>
              <textarea value={acceptanceCriteria} onChange={(e) => setAC(e.target.value)}
                placeholder={"Given… When… Then…\n- Criterion 1\n- Criterion 2"} rows={5}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 font-mono" />
            </div>
            {(!titleOk || !descOk || !severityOk) && (
              <div className="flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700">
                <AlertCircle className="h-4 w-4 flex-none" />
                <span>Title, description, and severity are required to save.</span>
              </div>
            )}
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <CommentSection />
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-3.5">
            <div>
              <FieldLabel>Status</FieldLabel>
              <LockedField>
                <span className={`h-2 w-2 rounded-full flex-none ${STATUS_DOT}`} />
                <span className="text-sm text-slate-600">To Do</span>
              </LockedField>
            </div>
            <div>
              <FieldLabel required satisfied={severityOk}>Severity</FieldLabel>
              <SelectDropdown value={severity} options={severityOptions} onChange={setSeverity} placeholder="Select severity…"
                error={!severityOk}
                renderOption={(v) => <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.15em] ${priorityMeta[v as keyof typeof priorityMeta]?.className}`}>{v}</span>}
                renderSelected={(v) => <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.15em] ${priorityMeta[v as keyof typeof priorityMeta]?.className}`}>{v}</span>}
              />
            </div>
            <div>
              <FieldLabel>Created By</FieldLabel>
              <LockedField>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-900 text-[10px] font-semibold flex-none">{initials(CURRENT_USER)}</div>
                <span className="text-sm text-slate-600">{CURRENT_USER}</span>
              </LockedField>
            </div>
            <div>
              <FieldLabel>Created Date</FieldLabel>
              <LockedField>
                <Calendar className="h-3.5 w-3.5 flex-none text-slate-400" />
                <span className="text-sm text-slate-600">{CREATED_DATE}</span>
              </LockedField>
            </div>
            <div>
              <FieldLabel>Assigned To</FieldLabel>
              <AssigneeMultiDropdown value={assignees} onChange={setAssignees} />
            </div>
            <div>
              <FieldLabel>Deadline</FieldLabel>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200" />
              </div>
            </div>
            <div>
              <FieldLabel>Parent Epic</FieldLabel>
              <ParentField value={parent} onChange={setParent} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button type="button" disabled={!canSave}
              onClick={() => {
                if (isEdit) {
                  setBaseline({ title, description, acceptanceCriteria, severity, deadline, parent, assignees: JSON.stringify(assignees) })
                }
              }}
              className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed">
              {isEdit ? "Save Changes" : "Save User Story"}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
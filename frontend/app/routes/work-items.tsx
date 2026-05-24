import React, { useMemo, useState, useRef, useEffect } from "react"
import { priorityMeta, statusMeta, statusOptions, workItemStatusMap } from "../lib/status"
import { ListFilter, Search, Plus, X, Bug, CheckSquare, Zap, BookOpen, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, UserCircle, ChevronDown, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router"

const workItems = [
  { id: "5", type: "Bug", title: "Implement attachment feature", createdBy: "Joe Nik", assigned: "Mihai Pop", assignedAvatar: "MP", status: "To Do", priority: "Medium", severity: "Low", deadline: "2026-06-02", description: "Users cannot attach files to work items. The attachment button is visible but clicking it does nothing." },
  { id: "4", type: "Task", title: "Drop-down button not working", createdBy: "Maria Ionescu", assigned: "Unassigned", assignedAvatar: "U", status: "Closed", priority: "Blocker", severity: "Blocker", deadline: "2026-05-21", description: "The drop-down component in the settings panel does not respond to click events in Chrome and Firefox." },
  { id: "3", type: "Epic", title: "Save settings button not working", createdBy: "Ana Serban", assigned: "Unassigned", assignedAvatar: "U", status: "Closed", priority: "Low", severity: "Low", deadline: "2026-06-10", description: "Epic covering all issues related to the settings page save functionality across browsers and devices." },
  { id: "2", type: "User Story", title: "Implement user settings", createdBy: "Joe Nik", assigned: "Luke Tomson", assignedAvatar: "LT", status: "In progress", priority: "High", severity: "High", deadline: "2026-05-29", description: "As a user, I want to be able to update my profile settings including name, email, and notification preferences." },
  { id: "1", type: "Bug", title: "Login functionality not working", createdBy: "Alex Tudor", assigned: "Luke Tomson", assignedAvatar: "LT", status: "Testing", priority: "Low", severity: "Low", deadline: "2026-05-26", description: "Login button becomes unresponsive after the first failed attempt. Requires page refresh to try again." },
]

const typeOptions = ["Bug", "Task", "Epic", "User Story"]
const severityOptions = ["Blocker", "Critical", "High", "Medium", "Low"]
const priorityOptions = ["Blocker", "Critical", "High", "Medium", "Low"]
const statusFilterOptions = ["To Do", "In progress", "Testing", "Done", "Closed"]
const assigneeOptions = ["Unassigned", "Mihai Pop", "Luke Tomson", "Maria Ionescu", "Ana Serban", "Alex Tudor", "Joe Nik"]

type WorkItemType = "Bug" | "Task" | "Epic" | "User Story"

const typeIcons: Record<string, { textClass: string; icon: React.ReactNode }> = {
  Bug: { textClass: "text-rose-700", icon: <Bug className="h-4 w-4" /> },
  Task: { textClass: "text-sky-700", icon: <CheckSquare className="h-4 w-4" /> },
  Epic: { textClass: "text-violet-700", icon: <Zap className="h-4 w-4" /> },
  "User Story": { textClass: "text-emerald-700", icon: <BookOpen className="h-4 w-4" /> },
}

const typeConfig: Record<WorkItemType, { textClass: string; bgClass: string; borderClass: string; icon: React.ReactNode; description: string }> = {
  Bug:          { textClass: "text-rose-700",    bgClass: "bg-rose-50",    borderClass: "border-rose-200",   icon: <Bug className="h-5 w-5" />,         description: "Track a defect or unexpected behaviour" },
  Task:         { textClass: "text-sky-700",     bgClass: "bg-sky-50",     borderClass: "border-sky-200",    icon: <CheckSquare className="h-5 w-5" />, description: "A unit of work to be completed" },
  Epic:         { textClass: "text-violet-700",  bgClass: "bg-violet-50",  borderClass: "border-violet-200", icon: <Zap className="h-5 w-5" />,         description: "A large body of work spanning multiple items" },
  "User Story": { textClass: "text-emerald-700", bgClass: "bg-emerald-50", borderClass: "border-emerald-200",icon: <BookOpen className="h-5 w-5" />,    description: "Describe functionality from the user's perspective" },
}



function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: Set<string>
  onChange: (val: Set<string>) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const toggle = (val: string) => {
    const next = new Set(selected)
    if (next.has(val)) next.delete(val)
    else next.add(val)
    onChange(next)
  }

  const label_text = selected.size === 0
    ? `${label}: All`
    : selected.size === 1
    ? `${label}: ${Array.from(selected)[0]}`
    : `${label}: ${selected.size} selected`

  return (
    <div ref={ref} className="relative flex-none">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:ring-2 focus:ring-slate-200 whitespace-nowrap"
      >
        <span>{label_text}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>
      {open && (
        <ul className="absolute left-0 z-20 mt-2 w-48 rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
          {options.map((opt) => (
            <li
              key={opt}
              className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm text-slate-700"
              onMouseDown={(e) => { e.preventDefault(); toggle(opt) }}
            >
              <div className={`h-4 w-4 flex-none rounded border flex items-center justify-center transition-colors ${selected.has(opt) ? "bg-slate-900 border-slate-900" : "border-slate-300 bg-white"}`}>
                {selected.has(opt) && (
                  <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                )}
              </div>
              <span>{opt}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}


function PeopleSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: Set<string>
  onChange: (val: Set<string>) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const toggle = (val: string) => {
    const next = new Set(selected)
    if (next.has(val)) next.delete(val)
    else next.add(val)
    onChange(next)
  }

  const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))

  const label_text = selected.size === 0
    ? `${label}: All`
    : selected.size === 1
    ? `${label}: ${Array.from(selected)[0]}`
    : `${label}: ${selected.size} selected`

  return (
    <div ref={ref} className="relative flex-none">
      <button
        onClick={() => { setOpen((o) => !o); setSearch("") }}
        className="flex items-center gap-1.5 rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:ring-2 focus:ring-slate-200 whitespace-nowrap"
      >
        <span>{label_text}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>
      {open && (
        <div className="absolute left-0 z-20 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 text-slate-400 flex-none" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-xs text-slate-700 outline-none"
              />
            </div>
          </div>
          <ul className="max-h-48 overflow-auto">
            {filtered.map((opt) => (
              <li
                key={opt}
                className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm text-slate-700"
                onMouseDown={(e) => { e.preventDefault(); toggle(opt) }}
              >
                <div className={`h-4 w-4 flex-none rounded border flex items-center justify-center transition-colors ${selected.has(opt) ? "bg-slate-900 border-slate-900" : "border-slate-300 bg-white"}`}>
                  {selected.has(opt) && (
                    <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  )}
                </div>
                <span>{opt}</span>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-xs text-slate-400">No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

function TypeSelectorModal({ onSelect, onClose }: { onSelect: (t: WorkItemType) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">New Work Item</h2>
            <p className="text-sm text-slate-500 mt-0.5">Select the type of work item to create</p>
          </div>
          <button onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(typeOptions as WorkItemType[]).map((type) => {
            const cfg = typeConfig[type]
            return (
              <button
                key={type}
                onClick={() => onSelect(type)}
                className={`flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition hover:shadow-md ${cfg.bgClass} ${cfg.borderClass}`}
              >
                <span className={cfg.textClass}>{cfg.icon}</span>
                <div>
                  <div className={`font-semibold text-sm ${cfg.textClass}`}>{type}</div>
                  <div className="text-xs text-slate-500 mt-0.5 leading-snug">{cfg.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}


export default function WorkItems() {
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set())
  const [severityFilter, setSeverityFilter] = useState<Set<string>>(new Set())
  const [createdByFilter, setCreatedByFilter] = useState<Set<string>>(new Set())
  const [assignedFilter, setAssignedFilter] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState("")
  const [page, setPage] = useState<number>(1)
  const [modalStep, setModalStep] = useState<null | "type" | WorkItemType>(null)
  const [selectedType, setSelectedType] = useState<WorkItemType | null>(null)
  //const [showFormModal, setShowFormModal] = useState(false)
  const navigate = useNavigate()
  const itemsPerPage = 12

  const createdList = useMemo(() => Array.from(new Set(workItems.map((w) => w.createdBy))), [])
  const assignedList = useMemo(() => Array.from(new Set(workItems.map((w) => w.assigned))), [])

  const filteredItems = useMemo(() => {
    return workItems.filter((item) => {
      if (typeFilter.size > 0 && !typeFilter.has(item.type)) return false
      if (statusFilter.size > 0 && !statusFilter.has(item.status)) return false
      if (severityFilter.size > 0 && !severityFilter.has(item.severity)) return false
      if (createdByFilter.size > 0 && !createdByFilter.has(item.createdBy)) return false
      if (assignedFilter.size > 0 && !assignedFilter.has(item.assigned)) return false
      if (query) {
        const q = query.toLowerCase().replace(/^#/, "")
        const matchesId = item.id.toString().includes(q)
        const matchesTitle = item.title.toLowerCase().includes(q)
        if (!matchesId && !matchesTitle) return false
      }
      return true
    })
  }, [typeFilter, statusFilter, severityFilter, createdByFilter, assignedFilter, query])

  useEffect(() => { setPage(1) }, [typeFilter, statusFilter, severityFilter, createdByFilter, assignedFilter, query])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))
  const startIndex = (page - 1) * itemsPerPage
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage)

  const hasFilters = typeFilter.size > 0 || statusFilter.size > 0 || severityFilter.size > 0 || createdByFilter.size > 0 || assignedFilter.size > 0 || query !== ""

  const clearFilters = () => {
    setTypeFilter(new Set())
    setStatusFilter(new Set())
    setSeverityFilter(new Set())
    setCreatedByFilter(new Set())
    setAssignedFilter(new Set())
    setQuery("")
  }

  return (
    <div className="space-y-6">
    <header className="flex flex-col gap-2">
      <div className="mx-auto max-w-6xl w-full">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Work Items</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Work items</h1>
              <p className="text-sm leading-6 text-slate-600">Filter and review work items by type, status, severity, creator, and assignee.</p>
            </div>
            <button
              onClick={() => setModalStep("type")}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              New Work Item
            </button>
          </div>
        </div>
      </header>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
            <ListFilter className="h-4 w-4 text-slate-500" />
            Filters
          </div>

          <MultiSelect label="Type" options={typeOptions} selected={typeFilter} onChange={setTypeFilter} />
          <MultiSelect label="Status" options={statusFilterOptions} selected={statusFilter} onChange={setStatusFilter} />
          <MultiSelect label="Severity" options={severityOptions} selected={severityFilter} onChange={setSeverityFilter} />
          <PeopleSelect label="Created by" options={createdList} selected={createdByFilter} onChange={setCreatedByFilter} />
          <PeopleSelect label="Assigned to" options={assignedList} selected={assignedFilter} onChange={setAssignedFilter} />

          {hasFilters && (
            <div className="relative ml-1 group">
              <button
                onClick={clearFilters}
                aria-label="Clear filters"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <span className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full mb-2 hidden rounded-full bg-slate-800 px-3 py-1 text-xs text-white shadow-sm group-hover:block whitespace-nowrap">
                Clear filters
              </span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Work Items..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-200">
          <table className="min-w-full table-auto divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-xs text-left font-semibold uppercase tracking-[0.15em] text-slate-700">ID</th>
                <th className="px-4 py-3 text-xs text-left font-semibold uppercase tracking-[0.15em] text-slate-700">Title</th>
                <th className="px-4 py-3 text-xs text-left font-semibold uppercase tracking-[0.15em] text-slate-700">Assigned To</th>
                <th className="px-4 py-3 text-xs text-left font-semibold uppercase tracking-[0.15em] text-slate-700">Status</th>
                <th className="w-[100px] px-3 pr-6 py-3 text-xs text-center font-semibold uppercase tracking-[0.15em] text-slate-700">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {paginatedItems.map((item) => {
                const statusKey = workItemStatusMap[item.status] ?? "ToDo"
                const statusClass = statusMeta[statusKey]
                const priorityClass = priorityMeta[item.priority as keyof typeof priorityMeta]
                const typeMeta = typeIcons[item.type]
                return (
                  <tr key={item.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/work-items/${item.id}/edit`)}>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{item.id}</td>
                    <td className="px-4 py-3 text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className={`flex-none ${typeMeta?.textClass ?? "text-slate-600"}`}>
                          {typeMeta?.icon}
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900">{item.title}</div>
                          <div className="truncate text-xs uppercase tracking-[0.18em] text-slate-500">{item.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.assigned === "Unassigned" ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                            <UserCircle className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-900 text-xs font-semibold">
                            {item.assignedAvatar}
                          </div>
                        )}
                        <span className="text-sm text-slate-700">{item.assigned}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${statusClass.dotClass}`} />
                        <span className="text-sm text-slate-700">{item.status}</span>
                      </div>
                    </td>
                    <td className="w-[100px] px-3 pr-6 py-3 text-center">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${priorityClass.className}`}>
                        {item.priority}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                    No work items match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600">
          <div>Showing {filteredItems.length === 0 ? 0 : Math.min(filteredItems.length, startIndex + 1)}–{Math.min(filteredItems.length, startIndex + itemsPerPage)} of {filteredItems.length}</div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={page === 1} className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 disabled:opacity-40 hover:bg-slate-50">
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 disabled:opacity-40 hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2">
              <label htmlFor="pageNumber" className="text-slate-500">Page</label>
              <input
                id="pageNumber"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={5}
                value={page}
                onChange={(e) => {
                  const nextPage = Number(e.target.value.replace(/\D/g, ""))
                  if (!Number.isNaN(nextPage) && e.target.value !== "") {
                    setPage(Math.min(Math.max(1, nextPage), totalPages))
                  } else if (e.target.value === "") {
                    setPage(1)
                  }
                }}
                className="h-8 w-10 rounded-2xl border border-slate-400 bg-white px-0 text-center text-sm leading-8 text-slate-800 outline-none appearance-none focus:border-slate-500 focus:ring-1 focus:ring-slate-300"
              />
              <span>/ {totalPages}</span>
            </div>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 disabled:opacity-40 hover:bg-slate-50">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 disabled:opacity-40 hover:bg-slate-50">
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modalStep === "type" && (
        <TypeSelectorModal
          onSelect={(type) => {
            setModalStep(null)
            navigate(`/work-items/new/${type.toLowerCase().replace(" ", "-")}`)
          }}
          onClose={() => setModalStep(null)}
        />
      )}
      
    </div>
  )
}
import React, { useEffect, useMemo, useState, useRef } from "react"
import { severityMeta, statusMeta } from "../utils/status"
import { ListFilter, Search, Plus, X, Bug, CheckSquare, Zap, BookOpen, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, UserCircle, ChevronDown } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router"
import { getCurrentUser } from "../api/user"
import { getWorkItemsByProjectId } from "../api/project"
import { getWorkItems } from "../api/workItem"
import NewWorkItemModal from "../components/NewWorkItemModal"
import type { WorkItemSummaryDto } from "../types/workItem"
import { getInitials } from "../utils/functions"

const typeOptions = ["Task", "Bug", "User Story", "Epic"]
const severityOptions = ["Low", "Medium", "High", "Critical", "Blocker"]
const statusFilterOptions = ["To Do", "In progress", "Testing", "Done", "Closed"]

const typeIcons: Record<string, { textClass: string; icon: React.ReactNode }> = {
  Bug:          { textClass: "text-rose-700 dark:text-rose-400",       icon: <Bug className="h-4 w-4" /> },
  Task:         { textClass: "text-sky-700 dark:text-sky-400",         icon: <CheckSquare className="h-4 w-4" /> },
  "User Story": { textClass: "text-emerald-700 dark:text-emerald-400", icon: <BookOpen className="h-4 w-4" /> },
  Epic:         { textClass: "text-violet-700 dark:text-violet-400",   icon: <Zap className="h-4 w-4" /> },
}

const backendStatusMap: Record<string, keyof typeof statusMeta> = {
  To_do:       "ToDo",
  In_Progress: "InProgress",
  Testing:     "Testing",
  Done:        "Done",
  Closed:      "Closed",
}

function formatItemType(itemType: string): string {
  return itemType === "User_Story" ? "User Story" : itemType
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
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const toggle = (val: string) => {
    const next = new Set(selected)
    next.has(val) ? next.delete(val) : next.add(val)
    onChange(next)
  }

  const labelText =
    selected.size === 0
      ? `${label}: All`
      : selected.size === 1
      ? `${label}: ${Array.from(selected)[0]}`
      : `${label}: ${selected.size} selected`

  return (
    <div ref={ref} className="relative flex-none">

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 outline-none transition focus:border-slate-400 dark:focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
      >
        <span>{labelText}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
      </button>

      {open && (
        <ul className="absolute left-0 z-20 mt-2 w-48 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md overflow-hidden">

          {options.map((opt) => (
            <li
              key={opt}
              className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              onMouseDown={(e) => {
                e.preventDefault()
                toggle(opt)
              }}
            >
              <div
                className={`h-4 w-4 flex-none rounded border flex items-center justify-center transition-colors ${
                  selected.has(opt)
                    ? "bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100"
                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                }`}
              >
                {selected.has(opt) && (
                  <svg
                    className="h-2.5 w-2.5 text-white dark:text-slate-900"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
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
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const toggle = (val: string) => {
    const next = new Set(selected)
    next.has(val) ? next.delete(val) : next.add(val)
    onChange(next)
  }

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  )

  const labelText =
    selected.size === 0
      ? `${label}: All`
      : selected.size === 1
      ? `${label}: ${Array.from(selected)[0]}`
      : `${label}: ${selected.size} selected`

  return (
    <div ref={ref} className="relative flex-none">
      <button
        onClick={() => {
          setOpen((o) => !o)
          setSearch("")
        }}
        className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 outline-none transition focus:border-slate-400 dark:focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 whitespace-nowrap min-w-40"
      >
        <span className="truncate">{labelText}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 flex-none" />
      </button>

      {open && (
        <div className="absolute left-0 z-20 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 flex-none" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          <ul className="max-h-48 overflow-auto">
            {filtered.map((opt) => (
              <li
                key={opt}
                onMouseDown={(e) => {
                  e.preventDefault()
                  toggle(opt)
                }}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <div
                  className={`h-4 w-4 flex-none rounded border flex items-center justify-center transition-colors ${
                    selected.has(opt)
                      ? "bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100"
                      : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  }`}
                >
                  {selected.has(opt) && (
                    <svg
                      className="h-2.5 w-2.5 text-white dark:text-slate-900"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  )}
                </div>

                <span className="truncate">{opt}</span>
              </li>
            ))}

            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500">
                No results
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function WorkItems({ mode }: { mode: "project" | "admin" }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [items, setItems] = useState<WorkItemSummaryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set())
  const [severityFilter, setSeverityFilter] = useState<Set<string>>(new Set())
  const [createdByFilter, setCreatedByFilter] = useState<Set<string>>(new Set())
  const [assignedFilter, setAssignedFilter] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState(searchParams.get("search") ?? "")
  const [page, setPage] = useState(1)
  const itemsPerPage = 12

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        if (mode === "admin") {
          setItems(await getWorkItems())
        } else {
          const projectId = localStorage.getItem("selectedProject")
          if (!projectId) {
            navigate("/org");
            return
          }
          setItems(await getWorkItemsByProjectId(Number(projectId)))
        }
      } catch {
        setError("Failed to load work items.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [mode])

  useEffect(() => {
    setQuery(searchParams.get("search") ?? "")
  }, [searchParams])

  const handleNewWorkItem = async () => {
    const user = await getCurrentUser()
    user.role === "USER" ? navigate("/project/work-items/new/bug") : setShowModal(true)
  }
  
  const reporterList = useMemo(
    () => Array.from(new Set(items.map((w) => w.reporter?.username).filter(Boolean))) as string[],
    [items]
  )
  const assigneeList = useMemo(() => {
    const names = items.flatMap((w) => w.assignees?.map((a) => a.username) ?? [])
    return Array.from(new Set(["Unassigned", ...names]))
  }, [items])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (typeFilter.size > 0 && !typeFilter.has(formatItemType(item.itemType))) return false
      if (statusFilter.size > 0 && !statusFilter.has(statusMeta[backendStatusMap[item.status]]?.label)) return false
      if (severityFilter.size > 0 && !severityFilter.has(item.severity)) return false
      if (createdByFilter.size > 0 && !createdByFilter.has(item.reporter?.username)) return false
      if (assignedFilter.size > 0) {
        const assigneeNames = item.assignees?.map((a) => a.username) ?? []
        const isUnassigned = assigneeNames.length === 0
        const matchesUnassigned = assignedFilter.has("Unassigned") && isUnassigned
        const matchesNamed = assigneeNames.some((n) => assignedFilter.has(n))
        if (!matchesUnassigned && !matchesNamed) return false
      }
      if (query) {
        const q = query.toLowerCase().replace(/^#/, "")
        if (!String(item.id).includes(q) && !item.title.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [items, typeFilter, statusFilter, severityFilter, createdByFilter, assignedFilter, query])

  useEffect(() => { setPage(1) }, [typeFilter, statusFilter, severityFilter, createdByFilter, assignedFilter, query])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))
  const startIndex = (page - 1) * itemsPerPage
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage)

  const hasFilters = typeFilter.size > 0 || statusFilter.size > 0 || severityFilter.size > 0
    || createdByFilter.size > 0 || assignedFilter.size > 0 || query !== ""

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
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
          {"Work Items"}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Work Items</h1>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              {"Filter and review work items by type, status, severity, creator, and assignee."}
            </p>
          </div>
          <button
            onClick={handleNewWorkItem}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 dark:bg-slate-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:hover:bg-slate-600"
          >
            <Plus className="h-4 w-4" />
            New Work Item
          </button>
        </div>
      </header>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <ListFilter className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            Filters
          </div>
          <MultiSelect label="Type"       options={typeOptions}         selected={typeFilter}      onChange={setTypeFilter} />
          <MultiSelect label="Status"     options={statusFilterOptions} selected={statusFilter}    onChange={setStatusFilter} />
          <MultiSelect label="Severity"   options={severityOptions}     selected={severityFilter}  onChange={setSeverityFilter} />
          <PeopleSelect label="Created by"  options={reporterList} selected={createdByFilter} onChange={setCreatedByFilter} />
          <PeopleSelect label="Assigned to" options={assigneeList} selected={assignedFilter}  onChange={setAssignedFilter} />
          {hasFilters && (
            <div className="relative ml-1 group">
              <button
                onClick={clearFilters}
                aria-label="Clear filters"
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

        <div className="mb-6">
          <div className="flex w-full items-center gap-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3">
            <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search work items…"
              className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition flex-none">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-slate-400 dark:text-slate-500">Loading work items…</div>
        ) : error ? (
          <div className="flex items-center justify-center py-16 text-sm text-rose-500 dark:text-rose-400">{error}</div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-700">
            <table className="min-w-full table-auto divide-y divide-slate-200 dark:divide-slate-700 text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-xs text-left font-semibold uppercase tracking-[0.15em] text-slate-700 dark:text-slate-300">ID</th>
                  <th className="px-4 py-3 text-xs text-left font-semibold uppercase tracking-[0.15em] text-slate-700 dark:text-slate-300">Title</th>
                  <th className="px-4 py-3 text-xs text-left font-semibold uppercase tracking-[0.15em] text-slate-700 dark:text-slate-300">Assigned To</th>
                  <th className="px-4 py-3 text-xs text-left font-semibold uppercase tracking-[0.15em] text-slate-700 dark:text-slate-300">Status</th>
                  <th className="w-25 px-3 pr-6 py-3 text-xs text-center font-semibold uppercase tracking-[0.15em] text-slate-700 dark:text-slate-300">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800/30">
                {paginatedItems.map((item) => {
                  const statusKey = backendStatusMap[item.status] ?? "ToDo"
                  const statusClass = statusMeta[statusKey]
                  const severityClass = severityMeta[item.severity as keyof typeof severityMeta]
                  const typeMeta = typeIcons[formatItemType(item.itemType)]
                  const firstAssignee = item.assignees?.[0]
                  const isUnassigned = !firstAssignee

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                      onClick={() => {
                        if (mode === "admin") {
                          localStorage.setItem("selectedProject", String(item.projectId))
                          navigate(`/admin/work-items/${item.id}`)
                        } else {
                          navigate(`/project/work-items/${item.id}`)
                        }
                      }}
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{item.id}</td>
                      <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <span className={`flex-none ${typeMeta?.textClass ?? "text-slate-600 dark:text-slate-400"}`}>
                            {typeMeta?.icon}
                          </span>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</div>
                            <div className="truncate text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                              {formatItemType(item.itemType)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {isUnassigned ? (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                              <UserCircle className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
                              {getInitials(firstAssignee.username)}
                            </div>
                          )}
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {isUnassigned ? "Unassigned" : firstAssignee.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${statusClass?.dotClass ?? "bg-slate-300"}`} />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{statusClass?.label ?? item.status}</span>
                        </div>
                      </td>
                      <td className="w-25 px-3 pr-6 py-3 text-center">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${severityClass?.className ?? ""}`}>
                          {item.severity}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {paginatedItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                      No work items match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600 dark:text-slate-400">
          <div>
            Showing {filteredItems.length === 0 ? 0 : Math.min(filteredItems.length, startIndex + 1)}–{Math.min(filteredItems.length, startIndex + itemsPerPage)} of {filteredItems.length}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={page === 1} className="inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
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
                  if (!isNaN(next) && e.target.value !== "") setPage(Math.min(Math.max(1, next), totalPages))
                  else if (e.target.value === "") setPage(1)
                }}
                className="h-8 w-10 rounded-2xl border border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800 px-0 text-center text-sm leading-8 text-slate-800 dark:text-slate-200 outline-none appearance-none focus:border-slate-500 dark:focus:border-slate-400 focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600"
              />
              <span className="text-slate-500 dark:text-slate-400">/ {totalPages}</span>
            </div>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {showModal && <NewWorkItemModal onClose={() => setShowModal(false)} mode={mode} />}
    </div>
  )
}
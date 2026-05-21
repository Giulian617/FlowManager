import React, { useMemo, useState, useEffect } from "react"
import { priorityMeta, statusMeta, statusOptions, workItemStatusMap } from "../lib/status"

const workItems = [
  {
    id: "13",
    type: "Bug",
    title: "Implement attachment feature",
    createdBy: "Joe Nik",
    assigned: "Mihai Pop",
    assignedAvatar: "MP",
    status: "Open",
    priority: "Medium",
    severity: "Low",
    deadline: "2026-06-02",
  },
  {
    id: "12",
    type: "Task",
    title: "Drop-down button not working",
    createdBy: "Maria Ionescu",
    assigned: "Unassigned",
    assignedAvatar: "U",
    status: "Closed",
    priority: "Blocker",
    severity: "Blocker",
    deadline: "2026-05-21",
  },
  {
    id: "11",
    type: "Epic",
    title: "Save settings button not working",
    createdBy: "Ana Serban",
    assigned: "Unassigned",
    assignedAvatar: "U",
    status: "Closed",
    priority: "Low",
    severity: "Low",
    deadline: "2026-06-10",
  },
  {
    id: "10",
    type: "User Story",
    title: "Implement user settings",
    createdBy: "Joe Nik",
    assigned: "Luke Tomson",
    assignedAvatar: "LT",
    status: "In progress",
    priority: "High",
    severity: "High",
    deadline: "2026-05-29",
  },
  {
    id: "9",
    type: "Bug",
    title: "Login functionality not working",
    createdBy: "Alex Tudor",
    assigned: "Luke Tomson",
    assignedAvatar: "LT",
    status: "Testing",
    priority: "Low",
    severity: "Low",
    deadline: "2026-05-26",
  },
]

const typeOptions = ["All", "Bug", "Task", "Epic", "User Story"]
// user lists are derived from work items and exposed via searchable popups

const typeIcons: Record<string, { textClass: string; icon: React.JSX.Element }> = {
  Bug: {
    textClass: "text-rose-700",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3.5a6.5 6.5 0 0 0-6.5 6.5c0 1.7.7 3.3 1.8 4.4L8 18a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l.7-3.6A6.5 6.5 0 0 0 18.5 10C18.5 5.8 15.2 3.5 12 3.5z" />
        <path d="M12 3.5v16" />
        <path d="M6.5 10h11" />
        <path d="M8 8.5c0 1 1 2 2 2" />
        <path d="M16 8.5c0 1-1 2-2 2" />
        <path d="M9.5 14.5h.01" />
        <path d="M12 15.5h.01" />
        <path d="M14.5 14.5h.01" />
      </svg>
    ),
  },
  Task: {
    textClass: "text-sky-700",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4.5" y="4.5" width="15" height="15" rx="2" />
        <path d="M8.5 12.5l2 2 5-5" />
      </svg>
    ),
  },
  Epic: {
    textClass: "text-violet-700",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="6" width="16" height="4" rx="1" />
        <path d="M5 9h14" />
        <rect x="6" y="11.5" width="14" height="4" rx="1" />
        <path d="M7 14.5h12" />
        <rect x="8" y="17" width="12" height="4" rx="1" />
      </svg>
    ),
  },
  "User Story": {
    textClass: "text-emerald-700",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 7h12" />
        <path d="M6 12h12" />
        <path d="M6 17h12" />
      </svg>
    ),
  },
}

export default function WorkItems() {
  const [typeFilter, setTypeFilter] = useState<string>("All")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [severityFilter, setSeverityFilter] = useState<string>("All")
  const [createdByFilter, setCreatedByFilter] = useState<string>("All")
  const [assignedFilter, setAssignedFilter] = useState<string>("All")
  const [query, setQuery] = useState("")
  const [createdSearch, setCreatedSearch] = useState("All")
  const [createdOpen, setCreatedOpen] = useState(false)
  const [assignedSearch, setAssignedSearch] = useState("")
  const [assignedOpen, setAssignedOpen] = useState(false)
  const [page, setPage] = useState<number>(1)
  const itemsPerPage = 12

  const createdList = useMemo(() => Array.from(new Set(workItems.map((w) => w.createdBy))), [])
  const assignedList = useMemo(() => Array.from(new Set(workItems.map((w) => w.assigned))), [])

  const filteredItems = useMemo(() => {
    return workItems.filter((item) => {
      if (typeFilter !== "All" && item.type !== typeFilter) return false
      if (statusFilter !== "All" && item.status !== statusFilter) return false
      if (severityFilter !== "All" && item.severity !== severityFilter) return false
      if (createdByFilter !== "All" && item.createdBy !== createdByFilter) return false
      if (assignedFilter !== "All" && item.assigned !== assignedFilter) return false
      if (query && !item.title.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [typeFilter, statusFilter, severityFilter, createdByFilter, assignedFilter, query])

  useEffect(() => {
    setPage(1)
  }, [typeFilter, statusFilter, severityFilter, createdByFilter, assignedFilter, query])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))
  const startIndex = (page - 1) * itemsPerPage
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage)

  const clearFilters = () => {
    setTypeFilter("All")
    setStatusFilter("All")
    setSeverityFilter("All")
    setCreatedByFilter("All")
    setAssignedFilter("All")
    setQuery("")
    setCreatedSearch("All")
    setAssignedSearch("")
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Work Items</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Work items</h1>
            <p className="text-sm leading-6 text-slate-600">Filter and review work items by type, status, severity, creator, and assignee.</p>
          </div>
          <button className="inline-flex items-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            + New Work Item
          </button>
        </div>
      </header>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
            <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4h18" />
              <path d="M5 12h14" />
              <path d="M8 20h8" />
            </svg>
            Filters
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="min-w-[100px] flex-none rounded-3xl border border-slate-200 bg-white px-1.5 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {`Types: ${type}`}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-w-[100px] flex-none rounded-3xl border border-slate-200 bg-white px-1.5 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {`Status: ${status}`}
              </option>
            ))}
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="min-w-[100px] flex-none rounded-3xl border border-slate-200 bg-white px-1.5 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            {["All", "Blocker", "Critical", "High", "Medium", "Low"].map((severity) => (
              <option key={severity} value={severity}>
                {`Severity: ${severity}`}
              </option>
            ))}
          </select>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-700">Created by:</span>
            <input
              value={createdSearch}
              onChange={(e) => {
                const v = e.target.value
                setCreatedOpen(true)
                if (v.trim() === "") {
                  setCreatedByFilter("All")
                  setCreatedSearch("All")
                } else {
                  setCreatedSearch(v)
                }
              }}
              onFocus={() => setCreatedOpen(true)}
              onBlur={() => setTimeout(() => setCreatedOpen(false), 150)}
              placeholder=""
              className="w-[140px] min-w-[140px] box-border flex-none rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 pl-24"
            />
            {createdOpen && (
              <ul className="absolute left-0 z-10 mt-2 w-[220px] max-h-48 overflow-auto rounded-3xl border border-slate-200 bg-slate-50 shadow-none">
                <li
                  className="cursor-pointer px-4 py-2 hover:bg-slate-100 text-slate-700 font-normal text-sm"
                  onMouseDown={() => {
                    setCreatedByFilter("All")
                    setCreatedSearch("All")
                    setCreatedOpen(false)
                  }}
                >
                  All
                </li>
                {createdSearch.trim() !== "" &&
                  createdList
                    .filter((name) => name.toLowerCase().includes(createdSearch.toLowerCase()))
                    .map((name) => (
                      <li
                        key={name}
                        className="cursor-pointer px-4 py-2 hover:bg-slate-100 text-sm"
                        onMouseDown={() => {
                          setCreatedByFilter(name)
                          setCreatedSearch(name)
                          setCreatedOpen(false)
                        }}
                      >
                        {name}
                      </li>
                    ))}
              </ul>
            )}
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-sm text-slate-700">Assigned to:</span>
            <input
              value={assignedSearch !== "" ? assignedSearch : assignedFilter}
              onChange={(e) => {
                const v = e.target.value
                setAssignedSearch(v)
                setAssignedOpen(true)
                if (v.trim() === "") setAssignedFilter("All")
              }}
              onFocus={() => setAssignedOpen(true)}
              onBlur={() => setTimeout(() => setAssignedOpen(false), 150)}
              placeholder=""
              className="w-[140px] min-w-[140px] box-border flex-none rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 pl-24"
            />
            {assignedOpen && (
              <ul className="absolute left-0 z-10 mt-2 w-[220px] max-h-48 overflow-auto rounded-3xl border border-slate-200 bg-slate-50 shadow-none">
                <li
                  className="cursor-pointer px-4 py-2 hover:bg-slate-100 text-slate-700 font-normal text-sm"
                  onMouseDown={() => {
                    setAssignedFilter("All")
                    setAssignedSearch("")
                    setAssignedOpen(false)
                  }}
                >
                  All
                </li>
                {assignedSearch.trim() !== "" &&
                  assignedList
                    .filter((name) => name.toLowerCase().includes(assignedSearch.toLowerCase()))
                    .map((name) => (
                      <li
                        key={name}
                        className="cursor-pointer px-4 py-2 hover:bg-slate-100 text-sm"
                        onMouseDown={() => {
                          setAssignedFilter(name)
                          setAssignedSearch(name)
                          setAssignedOpen(false)
                        }}
                      >
                        {name}
                      </li>
                    ))}
              </ul>
            )}
          </div>
          <div className="ml-16 flex-shrink-0 relative group">
            <button
              onClick={clearFilters}
              title="Clear filters"
              aria-label="Clear filters"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black bg-white text-slate-700 transition hover:bg-slate-100"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <span className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full mb-2 hidden rounded-full border border-black bg-white px-3 py-1 text-xs text-slate-900 shadow-sm group-hover:block whitespace-nowrap">
              Clear filters
            </span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
            <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-200">
          <table className="min-w-full table-auto divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600">
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
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{item.id}</td>
                    <td className="px-4 py-3 text-slate-900">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const typeMeta = typeIcons[item.type]
                          return (
                            <span className={`inline-flex h-9 w-9 flex-none items-center justify-center rounded-2xl ${typeMeta?.textClass ?? "text-slate-600"}`}>
                              {typeMeta?.icon ?? (
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="4" />
                                </svg>
                              )}
                            </span>
                          )
                        })()}
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
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
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
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600">
          <div>Showing {Math.min(filteredItems.length, startIndex + 1)}-{Math.min(filteredItems.length, startIndex + itemsPerPage)} of {filteredItems.length}</div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:opacity-40"
            >
              <span className="text-base">&lt;&lt;</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:opacity-40"
            >
              <span className="text-base">&lt;</span>
            </button>
            <div className="flex items-center gap-2">
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
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:opacity-40"
            >
              <span className="text-base">&gt;</span>
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:opacity-40"
            >
              <span className="text-base">&gt;&gt;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


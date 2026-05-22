import React, { useState } from "react"
import KanbanBoard from "../components/KanbanBoard"
import { deadlineOptions, severityOptions } from "../lib/status"

export default function Kanban() {
  const [severityFilter, setSeverityFilter] = useState<typeof severityOptions[number]>("All")
  const [sortBy, setSortBy] = useState<"Deadline" | "Severity" | "Default">("Default")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Kanban Board</p>
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-3xl font-semibold text-slate-900">Kanban Board</h1>
      <p className="text-sm leading-6 text-slate-600">Manage your active tasks and filter by deadline or severity.</p>
    </div>
    <button className="inline-flex items-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
      + New Work Item
    </button>
  </div>

  <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
    <svg className="h-4 w-4 flex-none text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
    <span className="text-sm font-semibold text-slate-700">Filter:</span>
    <select
      value={severityFilter}
      onChange={(e) => setSeverityFilter(e.target.value as typeof severityOptions[number])}
      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
    >
      {severityOptions.map((s) => (
        <option key={s} value={s}>{s === "All" ? "All Types" : s}</option>
      ))}
    </select>

    <div className="mx-1 h-4 w-px bg-slate-200" />

    <svg className="h-4 w-4 flex-none text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M7 12h10M11 18h2" />
    </svg>
    <span className="text-sm font-semibold text-slate-700">Sort by:</span>
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value as "Deadline" | "Severity" | "Default")}
      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
    >
      <option value="Default">Default</option>
      <option value="Deadline">Deadline</option>
      <option value="Severity">Severity</option>
    </select>

    {sortBy !== "Default" && (
      <button
        onClick={() => setSortDir((d) => d === "asc" ? "desc" : "asc")}
        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
      >
        {sortDir === "asc" ? (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M7 12h10M11 18h2" /><path d="M17 3l3 3-3 3" />
          </svg>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M7 12h10M11 18h2" /><path d="M17 21l3-3-3-3" />
          </svg>
        )}
        {sortDir === "asc" ? "Asc" : "Desc"}
      </button>
    )}

    <div className="relative ml-4 group">
      <button
        onClick={() => { setSeverityFilter("All"); setSortBy("Default"); setSortDir("asc") }}
        aria-label="Clear filters"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <span className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full mb-2 hidden rounded-full bg-slate-700 px-3 py-1 text-xs text-white shadow-sm group-hover:block whitespace-nowrap">
        Clear filters
      </span>
    </div>
  </div>
</header>



      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <KanbanBoard severityFilter={severityFilter} sortBy={sortBy} sortDir={sortDir} />
      </div>
    </div>
  )
}
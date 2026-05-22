import React, { useState } from "react"
import KanbanBoard from "../components/KanbanBoard"
import { LayoutDashboard, ListFilter, ArrowUp, ArrowDown, ArrowUpDown, X, Plus, ChevronDown } from "lucide-react"

const typeOptions = ["Bug", "Task", "Epic", "User Story"]
const sortOptions = ["Default", "Deadline", "Severity"] as const

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
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
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
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 outline-none transition hover:border-slate-400 whitespace-nowrap"
      >
        <span>{labelText}</span>
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

export default function Kanban() {
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<"Deadline" | "Severity" | "Default">("Default")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const hasFilters = typeFilter.size > 0 || sortBy !== "Default"

  const clearFilters = () => {
    setTypeFilter(new Set())
    setSortBy("Default")
    setSortDir("asc")
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Kanban Board</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Kanban Board</h1>
            <p className="text-sm leading-6 text-slate-600">Manage your active tasks and filter by type or sort by deadline and severity.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            <Plus className="h-4 w-4" />
            New Work Item
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <ListFilter className="h-4 w-4 flex-none text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">Filter:</span>

          <MultiSelect
            label="Type"
            options={typeOptions}
            selected={typeFilter}
            onChange={setTypeFilter}
          />

          <ArrowUpDown className="h-4 w-4 flex-none text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "Deadline" | "Severity" | "Default")}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            {sortOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>

          {sortBy !== "Default" && (
            <button
              onClick={() => setSortDir((d) => d === "asc" ? "desc" : "asc")}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              {sortDir === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              {sortDir === "asc" ? "Asc" : "Desc"}
            </button>
          )}

          {hasFilters && (
            <div className="relative ml-4 group">
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
      </header>

      <KanbanBoard sortBy={sortBy} sortDir={sortDir} typeFilter={typeFilter} />
    </div>
  )
}
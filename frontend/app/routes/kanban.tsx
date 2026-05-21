import React, { useState } from "react"
import KanbanBoard from "../components/KanbanBoard"
import { deadlineOptions, severityOptions } from "../lib/status"

export default function Kanban() {
  const [severityFilter, setSeverityFilter] = useState<typeof severityOptions[number]>("All")
  const [deadlineFilter, setDeadlineFilter] = useState<typeof deadlineOptions[number]>("All")

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Kanban Board</p>
            <h1 className="text-3xl font-semibold text-slate-900">Work item board</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Manage your active tasks and filter by deadline or severity.
            </p>
          </div>
          <button className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            New work item
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">Severity filter</p>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as typeof severityOptions[number])}
              className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              {severityOptions.map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">Deadline filter</p>
            <select
              value={deadlineFilter}
              onChange={(e) => setDeadlineFilter(e.target.value as typeof deadlineOptions[number])}
              className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              {deadlineOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <KanbanBoard severityFilter={severityFilter} deadlineFilter={deadlineFilter} />
      </div>
    </div>
  )
}

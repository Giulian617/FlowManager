import React from "react"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Dashboard</p>
          <h1 className="text-3xl font-semibold text-slate-900">Welcome back, Product Owner</h1>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Here’s an overview of your active projects, team workload, and pending work items.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Open work items", value: "42", accent: "bg-sky-100 text-sky-700" },
          { label: "Active projects", value: "8", accent: "bg-emerald-100 text-emerald-700" },
          { label: "Teams", value: "4", accent: "bg-indigo-100 text-indigo-700" },
          { label: "Blocked items", value: "5", accent: "bg-rose-100 text-rose-700" },
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
              <span>{card.label}</span>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${card.accent}`}>
                live
              </span>
            </div>
            <div className="mt-6 text-4xl font-semibold text-slate-900">{card.value}</div>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Recent activity</h2>
            <p className="text-sm leading-6 text-slate-600">A quick summary of your recent workflow and team updates.</p>
          </div>
          <button className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
            View all updates
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            { title: "Sprint planning ready", detail: "6 work items are awaiting review." },
            { title: "New bug reported", detail: "Customer issue logged in production." },
            { title: "Project kickoff", detail: "New team onboarding scheduled for Monday." },
            { title: "Work item backlog", detail: "27 items need prioritization." },
          ].map((event) => (
            <div key={event.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{event.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{event.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

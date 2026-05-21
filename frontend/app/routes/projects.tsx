import React from "react"

const projects = [
  { name: "FlowManager portal", team: "Platform", status: "In progress" },
  { name: "Bug triage dashboard", team: "QA", status: "Review" },
  { name: "Mobile release", team: "Mobile", status: "Planning" },
]

export default function Projects() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Projects</p>
        <h1 className="text-3xl font-semibold text-slate-900">Project portfolio</h1>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <div key={project.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">{project.name}</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                {project.status}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{project.team} team</p>
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" />
              <span>Next milestone due in 7 days</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import React from "react"

const teams = [
  { name: "Product", members: 8, focus: "Roadmap and discovery" },
  { name: "Engineering", members: 14, focus: "Delivery and stability" },
  { name: "QA", members: 5, focus: "Testing and quality" },
]

export default function Teams() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Teams</p>
        <h1 className="text-3xl font-semibold text-slate-900">Your organization</h1>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {teams.map((team) => (
          <div key={team.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">{team.name}</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                {team.members} members
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{team.focus}</p>
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>Capacity is healthy</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

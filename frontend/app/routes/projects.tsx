import React, { useState } from "react"
import { useNavigate } from "react-router"
import { ChevronRight, Calendar, User, Users, Search } from "lucide-react"

const PROJECT_TEAMS: Record<string, { name: string; members: string[] }[]> = {
  "1": [
    { name: "Engineering", members: ["Mihai Pop", "Luke Tomson", "Ana Serban", "Joe Nik"] },
    { name: "QA", members: ["Maria Ionescu", "Alex Tudor"] },
    { name: "Design", members: ["Ana Serban", "Joe Nik"] },
  ],
  "2": [
    { name: "Engineering", members: ["Luke Tomson", "Mihai Pop", "Alex Tudor"] },
    { name: "DevOps", members: ["Alex Tudor"] },
  ],
  "3": [
    { name: "Mobile Engineering", members: ["Joe Nik", "Luke Tomson", "Mihai Pop"] },
    { name: "QA", members: ["Maria Ionescu", "Ana Serban"] },
    { name: "Design", members: ["Ana Serban"] },
  ],
  "4": [
    { name: "Design", members: ["Ana Serban", "Joe Nik", "Maria Ionescu"] },
    { name: "Engineering", members: ["Mihai Pop", "Luke Tomson"] },
  ],
}

const MOCK_PROJECTS = [
  {
    id: "1",
    name: "FlowManager Frontend",
    description: "React frontend application for the FlowManager project management platform.",
    startDate: "2026-01-15",
    endDate: "2026-07-30",
    manager: "Joe Nik",
    color: "bg-sky-500",
  },
  {
    id: "2",
    name: "API Gateway",
    description: "Backend services and REST API layer handling authentication and routing.",
    startDate: "2026-02-01",
    endDate: "2026-06-15",
    manager: "Mihai Pop",
    color: "bg-violet-500",
  },
  {
    id: "3",
    name: "Mobile App",
    description: "iOS and Android client application built with React Native.",
    startDate: "2026-03-10",
    endDate: "2026-09-01",
    manager: "Ana Serban",
    color: "bg-emerald-500",
  },
  {
    id: "4",
    name: "Design System",
    description: "Shared component library, design tokens and documentation.",
    startDate: "2026-01-01",
    endDate: "2026-05-31",
    manager: "Luke Tomson",
    color: "bg-amber-500",
  },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ro-RO", { day: "2-digit", month: "short", year: "numeric" })
}

function isOverdue(endDate: string) {
  return new Date(endDate) < new Date()
}

function isNearDeadline(endDate: string) {
  const diff = new Date(endDate).getTime() - new Date().getTime()
  return diff > 0 && diff < 1000 * 60 * 60 * 24 * 14
}

export default function Projects() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")

  const filtered = MOCK_PROJECTS.filter((p) => {
    const q = query.toLowerCase()
    const teams = PROJECT_TEAMS[p.id] ?? []
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.manager.toLowerCase().includes(q) ||
      teams.some((t) => t.name.toLowerCase().includes(q))
    )
  })

  const handleSelect = (project: typeof MOCK_PROJECTS[0]) => {
    localStorage.setItem("selectedProject", project.id)
    localStorage.setItem("selectedProjectName", project.name)
    navigate("/")
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Projects</p>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-slate-900">Project portfolio</h1>
          <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            + New Project
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <Search className="h-5 w-5 text-slate-400 flex-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, description, manager or team…"
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-slate-300 hover:text-slate-500 transition text-lg leading-none flex-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 shadow-sm text-center gap-2">
          <p className="text-sm font-medium text-slate-600">No projects match your search.</p>
          <p className="text-xs text-slate-400">Try a different name, manager, or team.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => {
            const overdue = isOverdue(project.endDate)
            const nearDeadline = isNearDeadline(project.endDate)
            const teams = PROJECT_TEAMS[project.id] ?? []
            const totalMembers = [...new Set(teams.flatMap((t) => t.members))].length

            return (
              <button
                key={project.id}
                onClick={() => handleSelect(project)}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-left transition hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 duration-150"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`flex h-10 w-10 flex-none items-center justify-center rounded-2xl ${project.color} text-white text-xs font-bold`}>
                    {project.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-slate-900 leading-tight truncate">{project.name}</h2>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{project.description}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 mb-4" />

                {/* Details */}
                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center gap-2.5">
                    <User className="h-3.5 w-3.5 flex-none text-slate-400" />
                    <span className="text-xs text-slate-500">Manager</span>
                    <span className="ml-auto text-xs font-medium text-slate-700">{project.manager}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-3.5 w-3.5 flex-none text-slate-400" />
                    <span className="text-xs text-slate-500">Start date</span>
                    <span className="ml-auto text-xs font-medium text-slate-700">{formatDate(project.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-3.5 w-3.5 flex-none text-slate-400" />
                    <span className="text-xs text-slate-500">End date</span>
                    <span className={`ml-auto text-xs font-medium ${overdue ? "text-rose-600" : nearDeadline ? "text-amber-600" : "text-slate-700"}`}>
                      {formatDate(project.endDate)}
                      {overdue && <span className="ml-1.5 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600">Overdue</span>}
                      {!overdue && nearDeadline && <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">Soon</span>}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 mb-4" />

                {/* Teams */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500">{teams.length} team{teams.length !== 1 ? "s" : ""}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500">{totalMembers} member{totalMembers !== 1 ? "s" : ""}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      Open <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {teams.map((team) => (
                      <span key={team.name} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-2 py-1">
                        <span className="text-xs font-medium text-slate-600">{team.name}</span>
                        <span className="text-[10px] text-slate-400">{team.members.length}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
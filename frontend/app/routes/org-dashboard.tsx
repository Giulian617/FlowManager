import React, { useEffect, useState } from "react"
import { Building2, Users, FolderKanban, Calendar, TrendingUp } from "lucide-react"

const MOCK_ORGS: Record<string, {
  name: string; description: string; industry: string
  createdAt: string; manager: string; members: number; projects: number
}> = {
  "1": { name: "Acme Corporation", description: "Enterprise software solutions provider focused on project management tools.", industry: "Software", createdAt: "2022-03-15", manager: "Joe Nik",     members: 24, projects: 8 },
  "2": { name: "TechFlow SRL",     description: "Cloud infrastructure and DevOps automation services.",                       industry: "Cloud",    createdAt: "2021-07-01", manager: "Mihai Pop",  members: 12, projects: 4 },
  "3": { name: "DevSquad",         description: "Boutique agency specializing in mobile and web development.",                industry: "Mobile",   createdAt: "2023-01-10", manager: "Ana Serban", members: 6,  projects: 3 },
}

export default function OrgDashboard() {
  const [org, setOrg] = useState<typeof MOCK_ORGS[string] | null>(null)

  useEffect(() => {
    const id = localStorage.getItem("selectedOrg")
    if (id) setOrg(MOCK_ORGS[id] ?? null)
  }, [])

  if (!org) return null

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Organization</p>
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">{org.name}</h1>
          <p className="text-sm leading-6 text-slate-500 mt-0.5">{org.description}</p>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Members",  value: String(org.members),  icon: <Users className="h-5 w-5 text-blue-500" />,          bg: "bg-blue-50"   },
          { label: "Projects", value: String(org.projects), icon: <FolderKanban className="h-5 w-5 text-violet-500" />, bg: "bg-violet-50" },
          { label: "Industry", value: org.industry,         icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,  bg: "bg-emerald-50"},
          { label: "Manager",  value: org.manager,          icon: <Users className="h-5 w-5 text-amber-500" />,         bg: "bg-amber-50"  },
        ].map((s) => (
          <div key={s.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${s.bg} mb-3`}>
              {s.icon}
            </div>
            <div className="text-lg font-semibold text-slate-900 truncate">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-4">Organization details</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Building2 className="h-4 w-4 flex-none text-slate-400" />
            <span className="text-sm text-slate-500 w-28">Name</span>
            <span className="text-sm font-medium text-slate-700">{org.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-4 w-4 flex-none text-slate-400" />
            <span className="text-sm text-slate-500 w-28">Industry</span>
            <span className="text-sm font-medium text-slate-700">{org.industry}</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 flex-none text-slate-400" />
            <span className="text-sm text-slate-500 w-28">Manager</span>
            <span className="text-sm font-medium text-slate-700">{org.manager}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 flex-none text-slate-400" />
            <span className="text-sm text-slate-500 w-28">Created</span>
            <span className="text-sm font-medium text-slate-700">
              {new Date(org.createdAt).toLocaleDateString("ro-RO", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
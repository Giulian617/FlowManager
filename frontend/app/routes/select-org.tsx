import React, { useState } from "react"
import { useNavigate } from "react-router"
import { Building2, ChevronRight, Search } from "lucide-react"

const MOCK_ORGS = [
  { id: "1", name: "Acme Corporation", members: 24, projects: 8, avatar: "AC" },
  { id: "2", name: "TechFlow SRL", members: 12, projects: 4, avatar: "TF" },
  { id: "3", name: "DevSquad", members: 6, projects: 3, avatar: "DS" },
]

export default function SelectOrg() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")

  const filtered = MOCK_ORGS.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  )
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-slate-50">
      <div className="mb-10 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-3xl bg-slate-900 text-lg font-bold text-white">F</div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">FlowManager</p>
          <p className="text-xs text-slate-400">Project workspace</p>
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Select organization</h1>
          <p className="mt-1 text-sm text-slate-500">Choose the organization you want to work in</p>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Search className="h-4 w-4 flex-none text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizations..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          {filtered.map((org) => (
            <button
              key={org.id}
              onClick={() => {
                localStorage.setItem("selectedOrg", org.id)
                localStorage.setItem("selectedOrgName", org.name)
                localStorage.setItem("selectedOrgAvatar", org.avatar)
                navigate("/org/projects")
                }}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
                {org.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{org.name}</p>
                <p className="text-xs text-slate-400">{org.members} members · {org.projects} projects</p>
              </div>
              <ChevronRight className="h-4 w-4 flex-none text-slate-400" />
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">No organizations found.</p>
          )}
        </div>

        <button className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-medium text-slate-500 transition hover:border-slate-400 hover:text-slate-700">
          <Building2 className="h-4 w-4" />
          Create new organization
        </button>
      </div>
    </div>
  )
}
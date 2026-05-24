import React, { useEffect, useState } from "react"
import { NavLink, Outlet, useNavigate, useLocation } from "react-router"
import { LayoutDashboard, FolderKanban, Users, ArrowLeft, Building2 } from "lucide-react"

const MOCK_ORGS: Record<string, {
  name: string; description: string; industry: string; members: number; projects: number
}> = {
  "1": { name: "Acme Corporation", description: "Enterprise software solutions", industry: "Software", members: 24, projects: 8 },
  "2": { name: "TechFlow SRL",     description: "Cloud and DevOps services",     industry: "Cloud",    members: 12, projects: 4 },
  "3": { name: "DevSquad",         description: "Mobile and web development",    industry: "Mobile",   members: 6,  projects: 3 },
}

const orgNav = [
  { to: "/org/projects",  label: "Projects",  icon: <FolderKanban className="h-4 w-4" /> },
  { to: "/org/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/org/teams",     label: "Teams",     icon: <Users className="h-4 w-4" /> },
]

export default function OrgLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [orgData, setOrgData] = useState<typeof MOCK_ORGS[string] | null>(null)

  useEffect(() => {
    const id = localStorage.getItem("selectedOrg")
    if (!id) { navigate("/select-org"); return }
    setOrgData(MOCK_ORGS[id] ?? null)
  }, [])

  useEffect(() => {
    if (location.pathname === "/org" || location.pathname === "/org/") {
      navigate("/org/projects", { replace: true })
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">

      <aside className="w-[220px] border-r border-slate-200 bg-white shadow-sm flex-none">
        <div className="flex h-full min-h-screen flex-col px-3 py-4">

          {/* Logo */}
          <div className="mb-3 flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-sm font-bold text-white flex-none">F</div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-900">FlowManager</p>
              <p className="text-[11px] text-slate-400 truncate max-w-[130px]">{orgData?.name ?? "Organization"}</p>
            </div>
          </div>

          {/* Org info */}
          {orgData && (
            <div className="mb-3 rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-2 space-y-1">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3 w-3 flex-none text-slate-400" />
                <span className="text-[11px] text-slate-500 truncate">{orgData.industry}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{orgData.members} members</span>
                <span className="text-[11px] text-slate-400">{orgData.projects} projects</span>
              </div>
            </div>
          )}

          {/* Nav */}
          <nav className="flex flex-1 flex-col gap-0.5">
            {orgNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition ${
                    isActive ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-900 transition">
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="mt-4 space-y-2">
            <button
              onClick={() => {
                localStorage.removeItem("selectedOrg")
                localStorage.removeItem("selectedProject")
                localStorage.removeItem("selectedProjectName")
                navigate("/select-org")
              }}
              className="w-full flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            >
              <ArrowLeft className="h-3.5 w-3.5 flex-none" />
              Change organization
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-5 lg:p-6">
        <div className="mx-auto max-w-[1500px]">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
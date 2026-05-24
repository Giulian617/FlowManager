import React, { useEffect, useState } from "react"
import { NavLink, Outlet, Navigate, useNavigate } from "react-router"
import { LayoutDashboard, FolderKanban, Users, ChevronDown, LogOut, Building2 } from "lucide-react"

const MOCK_ORGS = [
  { id: "1", name: "Acme Corporation", avatar: "AC" },
  { id: "2", name: "TechFlow SRL", avatar: "TF" },
  { id: "3", name: "DevSquad", avatar: "DS" },
]

export default function OrgLayout() {
  const navigate = useNavigate()
  const [selectedOrgId, setSelectedOrgId]       = useState<string | null>(null)
  const [selectedOrgName, setSelectedOrgName]   = useState("")
  const [selectedOrgAvatar, setSelectedOrgAvatar] = useState("")
  const [orgMenuOpen, setOrgMenuOpen] = useState(false)

  useEffect(() => {
  if (typeof window === "undefined") return
  
  const id = localStorage.getItem("selectedOrg")
  if (!id) {
    navigate("/select-org")
    return
  }
  setSelectedOrgId(id)
  setSelectedOrgName(localStorage.getItem("selectedOrgName") ?? "")
  setSelectedOrgAvatar(localStorage.getItem("selectedOrgAvatar") ?? "")
}, [])

  const navItems = [
  { to: "/org/projects",  icon: FolderKanban,     label: "Projects"  },
  { to: "/org/teams",     icon: Users,             label: "Teams"     },
  { to: "/org/dashboard", icon: LayoutDashboard,   label: "Dashboard" },
]

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-slate-200 bg-white">

        {/* Org selector */}
        <div className="relative border-b border-slate-100">
          <button
            onClick={() => setOrgMenuOpen((o) => !o)}
            className="flex w-full items-center gap-3 px-4 py-4 transition hover:bg-slate-50"
          >
            <div className="flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
              {selectedOrgAvatar}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-slate-900 truncate">{selectedOrgName}</p>
              <p className="text-xs text-slate-400">Organization</p>
            </div>
            <ChevronDown className={`h-4 w-4 flex-none text-slate-400 transition-transform ${orgMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {orgMenuOpen && (
            <div className="absolute left-0 top-full z-20 w-full border border-slate-200 bg-white shadow-lg rounded-b-2xl overflow-hidden">
              {MOCK_ORGS.filter((o) => o.id !== selectedOrgId).map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    localStorage.setItem("selectedOrg", org.id)
                    localStorage.setItem("selectedOrgName", org.name)
                    localStorage.setItem("selectedOrgAvatar", org.avatar)
                    localStorage.removeItem("selectedProject")
                    localStorage.removeItem("selectedProjectName")
                    setOrgMenuOpen(false)
                    navigate("/org/dashboard")
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <div className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                    {org.avatar}
                  </div>
                  <span className="text-sm text-slate-700">{org.name}</span>
                </button>
              ))}
              <div className="border-t border-slate-100">
                <button
                  onClick={() => { navigate("/select-org"); setOrgMenuOpen(false) }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-500">All organizations</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <Icon className="h-4 w-4 flex-none" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-100 px-3 py-3">
          <button
            onClick={() => {
              localStorage.removeItem("selectedOrg")
              localStorage.removeItem("selectedOrgName")
              localStorage.removeItem("selectedOrgAvatar")
              localStorage.removeItem("selectedProject")
              localStorage.removeItem("selectedProjectName")
              navigate("/select-org")
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <LogOut className="h-4 w-4" />
            Switch organization
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
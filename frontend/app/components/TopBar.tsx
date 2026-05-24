import React, { useEffect, useState } from "react"
import { NavLink, useNavigate } from "react-router"
import { LayoutDashboard, FolderKanban, Users, ChevronDown, LogOut, Building2, UserCircle } from "lucide-react"

const MOCK_ORGS = [
  { id: "1", name: "Acme Corporation", avatar: "AC" },
  { id: "2", name: "TechFlow SRL", avatar: "TF" },
  { id: "3", name: "DevSquad", avatar: "DS" },
]

const navItems = [
  { to: "/org/projects", icon: FolderKanban, label: "Projects" },
  { to: "/org/teams", icon: Users, label: "Teams" },
  { to: "/org/users", icon: UserCircle, label: "Users" },
  { to: "/org/dashboard", icon: LayoutDashboard, label: "Dashboard" },
]

export default function OrgSidebar() {
  const navigate = useNavigate()
  const [orgId, setOrgId] = useState("")
  const [orgName, setOrgName] = useState("")
  const [orgAvatar, setOrgAvatar] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setOrgId(localStorage.getItem("selectedOrg") ?? "")
    setOrgName(localStorage.getItem("selectedOrgName") ?? "")
    setOrgAvatar(localStorage.getItem("selectedOrgAvatar") ?? "")
  }, [])

  return (
    <aside style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "240px",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid #e2e8f0",
      backgroundColor: "white",
      zIndex: 10,
      overflow: "hidden",
    }}>

      {/* Org selector */}
      <div style={{ position: "relative", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex w-full items-center gap-3 px-4 py-4 transition hover:bg-slate-50"
        >
          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
            {orgAvatar}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-slate-900 truncate">{orgName}</p>
            <p className="text-xs text-slate-400">Organization</p>
          </div>
          <ChevronDown className={`h-4 w-4 flex-none text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
        </button>

        {menuOpen && (
          <div className="absolute left-0 top-full z-20 w-full border border-slate-200 bg-white shadow-lg rounded-b-2xl overflow-hidden">
            {MOCK_ORGS.filter((o) => o.id !== orgId).map((org) => (
              <button
                key={org.id}
                onClick={() => {
                  localStorage.setItem("selectedOrg", org.id)
                  localStorage.setItem("selectedOrgName", org.name)
                  localStorage.setItem("selectedOrgAvatar", org.avatar)
                  localStorage.removeItem("selectedProject")
                  localStorage.removeItem("selectedProjectName")
                  setOrgId(org.id)
                  setOrgName(org.name)
                  setOrgAvatar(org.avatar)
                  setMenuOpen(false)
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
                onClick={() => { navigate("/select-org"); setMenuOpen(false) }}
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
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            <Icon className="h-4 w-4 flex-none" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #f1f5f9", padding: "12px", flexShrink: 0 }}>
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
  )
}
import { useEffect, useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router"
import { LayoutDashboard, FolderKanban, Users, ChevronDown, LogOut, Building2, UserCircle, ArrowLeft, Pencil } from "lucide-react"
import TopBar from "../components/TopBar"
import {
  getCurrentUser,
  getOrganizations,
  getUserOrganizations,
} from "../src/api"
import type { OrganizationSummaryDto } from "../types/organization"

function getAvatar(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
}

export default function OrgLayout() {
  const navigate = useNavigate()
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [selectedOrgName, setSelectedOrgName] = useState("")
  const [selectedOrgAvatar, setSelectedOrgAvatar] = useState("")
  const [orgMenuOpen, setOrgMenuOpen] = useState(false)
  const [orgs, setOrgs] = useState<OrganizationSummaryDto[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    
    const orgId = localStorage.getItem("selectedOrg")
    if (!orgId) {
      navigate("/select-org")
      return
    }
    setSelectedOrgId(orgId)
    setSelectedOrgName(localStorage.getItem("selectedOrgName") ?? "")
    setSelectedOrgAvatar(localStorage.getItem("selectedOrgAvatar") ?? "")

    async function loadOrgs() {
      try {
        const currentUser = await getCurrentUser()
        const data = currentUser.role === "ADMIN"
          ? await getOrganizations()
          : await getUserOrganizations(currentUser.id)
        setOrgs(data)
        setIsAdmin(currentUser.role === "ADMIN")
      } catch (err) {
        console.error(err)
      }
    }

    loadOrgs()
  }, [])

  const navItems = [
    { to: "/org/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/org/projects",  icon: FolderKanban,    label: "Projects"  },
    { to: "/org/teams",     icon: Users,           label: "Teams"     },
    { to: "/org/users",     icon: UserCircle,      label: "Users"     },
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

          {/* Edit button*/}
          {isAdmin && (
            <button
              onClick={() => navigate("/org/edit")}
              className="absolute right-10 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}

          {orgMenuOpen && (
            <div className="absolute left-0 top-full z-20 w-full border border-slate-200 bg-white shadow-lg rounded-b-2xl overflow-hidden">
              {orgs.filter((o) => o.id !== Number(selectedOrgId)).map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    const avatar = getAvatar(org.name)
                    localStorage.setItem("selectedOrg", String(org.id))
                    localStorage.setItem("selectedOrgName", org.name)
                    localStorage.setItem("selectedOrgAvatar", avatar)
                    localStorage.removeItem("selectedProject")
                    localStorage.removeItem("selectedProjectName")
                    setSelectedOrgId(String(org.id))
                    setSelectedOrgName(org.name)
                    setSelectedOrgAvatar(avatar)
                    setOrgMenuOpen(false)
                    navigate("/org/dashboard")
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <div className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                    {getAvatar(org.name)}
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
        <div className="border-t border-slate-100 px-3 py-3 space-y-0.5">
        <button
            onClick={() => {
              localStorage.removeItem("selectedOrg")
              localStorage.removeItem("selectedOrgName")
              localStorage.removeItem("selectedOrgAvatar")
              localStorage.removeItem("selectedProject")
              localStorage.removeItem("selectedProjectName")
              navigate("/select-org", { replace: true })
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
            <TopBar />
            <Outlet />
        </div>
      </main>
    </div>
  )
}
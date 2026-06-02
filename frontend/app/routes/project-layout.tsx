import { NavLink, Outlet, useNavigate } from "react-router"
import { useEffect, useState } from "react"
import TopBar from "../components/TopBar"
import { LayoutDashboard, Users, List, KanbanSquare, Building2, ChevronRight, LogOut } from "lucide-react"
import {
  getProjectById
} from "../api/project"

const fullNav = [
  { to: "/project/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/project/teams", label: "Teams", icon: <Users className="h-4 w-4" /> },
  { to: "/project/work-items", label: "Work Items", icon: <List className="h-4 w-4" /> },
  { to: "/project/kanban", label: "Kanban Board", icon: <KanbanSquare className="h-4 w-4" /> },
]

export default function ProjectLayout() {
  const navigate = useNavigate()
  const [orgName, setOrgName] = useState<string | null>(null)
  const [projectName, setProjectName] = useState<string | null>(null)

  useEffect(() => {
    const projectId = localStorage.getItem("selectedProject")
    if (!projectId) {
      navigate("/org");
      return
    }

    getProjectById(Number(projectId))
      .then((project) => {
        setProjectName(project.name)
        setOrgName(project.organization?.name ?? null)
      })
      .catch(console.error)
  }, [])

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="flex w-60 flex-col border-r border-slate-200 bg-white">
        <div className="flex flex-col px-3 py-4" style={{ height: "100vh", overflow: "hidden" }}>

          {/* Logo */}
          <div className="mb-3 flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-sm font-bold text-white flex-none">FM</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-900">FlowManager</p>
              <p className="text-[11px] text-slate-400 truncate max-w-32.5">
                {projectName ?? "Project workspace"}
              </p>
            </div>
          </div>

          {/* Org info */}
          {orgName && (
            <div className="mb-3 rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-2">
              <button
                onClick={() => navigate("/org/dashboard")}
                className="flex w-full items-center justify-between gap-2 group"
                title="See organization details"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Building2 className="h-3 w-3 flex-none text-slate-400" />
                  <span className="text-[11px] text-slate-400 truncate group-hover:text-slate-900 transition">
                    {orgName}
                  </span>
                </div>
                <ChevronRight className="h-3 w-3 flex-none text-slate-300 group-hover:text-slate-600 transition" />
              </button>
            </div>
          )}

          {/* Nav */}
          <nav className="flex flex-1 flex-col gap-0.5">
            {fullNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
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

      <main className="flex-1 overflow-y-auto" style={{ height: "100vh" }}>
        <div className="px-8 py-8">
          <div className="mx-auto max-w-6xl">
            <TopBar />
          </div>
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
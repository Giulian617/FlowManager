import { NavLink, Outlet, useNavigate } from "react-router"
import { LayoutDashboard, Users, Building2, FolderKanban, UsersRound, CheckSquare, MessageSquare, LogOut, ShieldCheck } from "lucide-react"
import TopBar from "../components/TopBar"

export default function AdminLayout() {
  const navigate = useNavigate()

  const navItems = [
    { to: "/admin/dashboard",    icon: LayoutDashboard, label: "Dashboard"    },
    { to: "/admin/users",        icon: Users,           label: "Users"        },
    { to: "/admin/organizations",icon: Building2,       label: "Organizations"},
    { to: "/admin/projects",     icon: FolderKanban,    label: "Projects"     },
    { to: "/admin/teams",        icon: UsersRound,      label: "Teams"        },
    { to: "/admin/work-items",   icon: CheckSquare,     label: "Work Items"   },
    { to: "/admin/comments",     icon: MessageSquare,   label: "Comments"     },
  ]

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">

      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">

        {/* Brand */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 px-4 py-4">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-rose-100 dark:bg-rose-950 text-sm font-bold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex-none">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-900 dark:text-slate-100">FlowManager</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Admin panel</p>
          </div>
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
                    ? "bg-slate-900 dark:bg-slate-700 text-white dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                }`
              }
            >
              <Icon className="h-4 w-4 flex-none" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-700 px-3 py-3 space-y-0.5">
          <button
            onClick={() => navigate("/admin-menu", { replace: true })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <LogOut className="h-4 w-4" />
            Exit admin panel
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
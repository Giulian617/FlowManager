import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { Users, Building2, FolderKanban, UsersRound, CheckSquare, MessageSquare, ChevronRight } from "lucide-react"
import { getUsers } from "../api/user"
import { getOrganizations } from "../api/organization"
import { getProjects } from "../api/project"
import { getTeams } from "../api/team"
import { getWorkItems } from "../api/workItem"
import { getComments } from "../api/comment"

const statCards = [
  { key: "users",         label: "Users",          icon: Users,        color: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300",    nav: "/admin/users"         },
  { key: "organizations", label: "Organizations",  icon: Building2,    color: "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300",     nav: "/admin/organizations" },
  { key: "projects",      label: "Projects",       icon: FolderKanban, color: "bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300",         nav: "/admin/projects"      },
  { key: "teams",         label: "Teams",          icon: UsersRound,   color: "bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300", nav: "/admin/teams"     },
  { key: "workItems",     label: "Work Items",     icon: CheckSquare,  color: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300",  nav: "/admin/work-items"    },
  { key: "comments",      label: "Comments",       icon: MessageSquare,color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300", nav: "/admin/comments" },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [counts, setCounts] = useState<Record<string, number | null>>({
    users: null, organizations: null, projects: null,
    teams: null, workItems: null, comments: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAll() {
      try {
        const [users, organizations, projects, teams, workItems, comments] = await Promise.all([
          getUsers(),
          getOrganizations(),
          getProjects(),
          getTeams(),
          getWorkItems(),
          getComments(),
        ])
        setCounts({
          users:         users?.length          ?? 0,
          organizations: organizations?.length  ?? 0,
          projects:      projects?.length       ?? 0,
          teams:         teams?.length          ?? 0,
          workItems:     workItems?.length      ?? 0,
          comments:      comments?.length       ?? 0,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [])

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Overview</p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Application-wide statistics.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map(({ key, label, icon: Icon, color, nav }) => (
          <div
            key={key}
            onClick={() => navigate(nav)}
            className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-0.5 transition duration-150"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-2xl ${color}`}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4 text-4xl font-semibold text-slate-900 dark:text-slate-100">
              {loading ? (
                <span className="inline-block h-9 w-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700" />
              ) : (
                counts[key] ?? "—"
              )}
            </div>
            <div className="mt-3 flex justify-end items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
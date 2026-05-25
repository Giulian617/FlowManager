import { isRouteErrorResponse, Links, Meta, NavLink, Outlet, Scripts, ScrollRestoration, useLocation, useNavigate } from "react-router"
import { useEffect, useState } from "react"
import type { Route } from "./+types/root"
import "./app.css"
import KeycloakProviderWrapper from "./auth/KeycloakProvider"
import TopBar from "./components/TopBar"
import { LayoutDashboard, FolderKanban, Users, List, KanbanSquare, Building2, ChevronRight, ArrowLeft } from "lucide-react"

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

const MOCK_ORGS: Record<string, string> = {
  "1": "Acme Corporation",
  "2": "TechFlow SRL",
  "3": "DevSquad",
}

const MOCK_PROJECTS: Record<string, string> = {
  "1": "FlowManager Frontend",
  "2": "API Gateway",
  "3": "Mobile App",
  "4": "Design System",
}

const fullNav = [
  { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/projects", label: "Projects", icon: <FolderKanban className="h-4 w-4" /> },
  { to: "/teams", label: "Teams", icon: <Users className="h-4 w-4" /> },
  { to: "/work-items", label: "Work Items", icon: <List className="h-4 w-4" /> },
  { to: "/kanban", label: "Kanban Board", icon: <KanbanSquare className="h-4 w-4" /> },
]

const NO_SIDEBAR_PREFIXES = ["/", "/login", "/select-org", "/select-project", "/org"]
const NO_PROJECT_REQUIRED = ["/projects"]
const NO_AUTH_REQUIRED = ["/", "/login", "/select-org", "/select-project"]

function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname

  const [orgName, setOrgName] = useState<string | null>(null)
  const [projectName, setProjectName] = useState<string | null>(null)

  const isNoSidebar = NO_SIDEBAR_PREFIXES.some((p) =>
    path === p || path.startsWith(p + "/")
  )

  useEffect(() => {
    const isNoAuth = NO_AUTH_REQUIRED.some((p) => path.startsWith(p))
    const isOrgRoute = path.startsWith("/org")
    if (isNoAuth || isOrgRoute) return

    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      navigate("/login", { replace: true })
      return
    }

    const orgId = localStorage.getItem("selectedOrg")
    if (!orgId) {
      navigate("/select-org", { replace: true })
      return
    }

    const projectId = localStorage.getItem("selectedProject")
    const noProjectRequired = NO_PROJECT_REQUIRED.some((p) => path === p)
    if (!projectId && !noProjectRequired) {
      navigate("/projects", { replace: true })
      return
    }
  }, [path])

  useEffect(() => {
    const orgId = localStorage.getItem("selectedOrg")
    const projectId = localStorage.getItem("selectedProject")
    setOrgName(orgId ? (MOCK_ORGS[orgId] ?? null) : null)
    setProjectName(
      localStorage.getItem("selectedProjectName") ??
      (projectId ? (MOCK_PROJECTS[projectId] ?? null) : null)
    )
  }, [path])

  if (isNoSidebar) return <Outlet />

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-slate-200 bg-white">
        <div className="flex flex-col px-3 py-4" style={{ height: "100vh", overflow: "hidden" }}>

          {/* Logo */}
          <div className="mb-3 flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-sm font-bold text-white flex-none">F</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-900">FlowManager</p>
              <p className="text-[11px] text-slate-400 truncate max-w-[130px]">
                {projectName ?? "Project workspace"}
              </p>
            </div>
          </div>

          {/* Org info */}
          {orgName && (
            <div className="mb-3 rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-2">
              <button
                onClick={() => {
                  localStorage.removeItem("selectedOrg")
                  localStorage.removeItem("selectedProject")
                  localStorage.removeItem("selectedProjectName")
                  navigate("/select-org")
                }}
                className="flex w-full items-center justify-between gap-2 group"
                title="Change organization"
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
            onClick={() => navigate("/org/dashboard")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <ArrowLeft className="h-3.5 w-3.5 flex-none" />
            <span className="font-medium">See organization details</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-5 lg:p-6" style={{ height: "100vh", overflowY: "auto" }}>
          <div className="mx-auto max-w-[1500px]">
          <TopBar />
          <Outlet />
        </div>
      </main>
    </div>
  )
}


export default function App() {
  return (
    <KeycloakProviderWrapper>
      <AppShell />
    </KeycloakProviderWrapper>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!"
  let details = "An unexpected error occurred."
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error"
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && <pre className="w-full p-4 overflow-x-auto"><code>{stack}</code></pre>}
    </main>
  )
}
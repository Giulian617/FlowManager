import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { FolderKanban, Users, Building2, Calendar, User, ChevronRight, Bug, CheckSquare, Zap, BookOpen } from "lucide-react"

const MOCK_ORGS: Record<string, {
  name: string
  description: string
  industry: string
  createdAt: string
  manager: string
  members: number
  projects: number
  teams: number
  recentActivity: { title: string; detail: string; time: string; type: "bug" | "task" | "epic" | "story"; projectId: string; workItemId: string }[]
}> = {
  "1": {
    name: "Acme Corporation",
    description: "Enterprise software solutions for global clients.",
    industry: "Software",
    createdAt: "2023-01-15T09:00:00",
    manager: "Joe Nik",
    members: 24, projects: 8, teams: 6,
    recentActivity: [
      { title: "New bug reported", detail: "Login button unresponsive on Safari.", time: "2h ago", type: "bug", projectId: "1", workItemId: "1" },
      { title: "Sprint planning", detail: "6 tasks added to current sprint.", time: "4h ago", type: "task", projectId: "1", workItemId: "2" },
      { title: "Q3 Epic created", detail: "New epic for Q3 delivery kick-off.", time: "Yesterday", type: "epic", projectId: "1", workItemId: "3" },
      { title: "User story refined", detail: "Onboarding flow story estimated.", time: "2 days ago", type: "story", projectId: "1", workItemId: "4" },
    ],
  },
  "2": {
    name: "TechFlow SRL",
    description: "Cloud infrastructure and backend services.",
    industry: "Cloud",
    createdAt: "2023-06-01T09:00:00",
    manager: "Mihai Pop",
    members: 12, projects: 4, teams: 3,
    recentActivity: [
      { title: "Pipeline bug fixed", detail: "CI/CD deploy issue resolved.", time: "1h ago", type: "bug", projectId: "1", workItemId: "1" },
      { title: "API endpoint shipped", detail: "/api/tickets/status deployed.", time: "3h ago", type: "task", projectId: "1", workItemId: "2" },
      { title: "Infrastructure epic", detail: "Kubernetes migration epic started.", time: "Yesterday", type: "epic", projectId: "1", workItemId: "3" },
      { title: "Auth story closed", detail: "OAuth2 integration story done.", time: "3 days ago", type: "story", projectId: "1", workItemId: "4" },
    ],
  },
  "3": {
    name: "DevSquad",
    description: "Mobile and cross-platform development agency.",
    industry: "Mobile",
    createdAt: "2024-02-10T09:00:00",
    manager: "Ana Serban",
    members: 6, projects: 3, teams: 3,
    recentActivity: [
      { title: "Crash reported", detail: "Null pointer on Android login.", time: "30m ago", type: "bug", projectId: "1", workItemId: "1" },
      { title: "iOS build shipped", detail: "Version 1.2.0 sent to App Store.", time: "2h ago", type: "task", projectId: "1", workItemId: "2" },
      { title: "Mobile epic created", detail: "Offline mode epic kick-off.", time: "Yesterday", type: "epic", projectId: "1", workItemId: "3" },
      { title: "Onboarding story", detail: "User onboarding story approved.", time: "2 days ago", type: "story", projectId: "1", workItemId: "4" },
    ],
  },
}

const activityColors = {
  bug: "bg-rose-50 text-rose-700 border-rose-200",
  task: "bg-sky-50 text-sky-700 border-sky-200",
  epic: "bg-violet-50 text-violet-700 border-violet-200",
  story: "bg-emerald-50 text-emerald-700 border-emerald-200",
}

const activityIcons = {
  bug: <Bug className="h-4 w-4 flex-none" />,
  task: <CheckSquare className="h-4 w-4 flex-none" />,
  epic: <Zap className="h-4 w-4 flex-none" />,
  story: <BookOpen className="h-4 w-4 flex-none" />,
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ro-RO", { day: "2-digit", month: "long", year: "numeric" })
}

export default function OrgDashboard() {
  const navigate = useNavigate()
  const [org, setOrg] = useState<typeof MOCK_ORGS[string] | null>(null)

  useEffect(() => {
    const id = localStorage.getItem("selectedOrg") ?? ""
    setOrg(MOCK_ORGS[id] ?? null)
  }, [])

  if (!org) return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-24 shadow-sm text-center gap-3">
      <Building2 className="h-10 w-10 text-slate-300" />
      <p className="text-sm font-medium text-slate-600">No organization selected.</p>
      <button
        onClick={() => navigate("/select-org")}
        className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Select organization
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Dashboard</p>
        <h1 className="text-3xl font-semibold text-slate-900">{org.name}</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">{org.description}</p>
      </header>

      {/* Org info card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 flex-none">
              <Building2 className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Industry</p>
              <p className="text-sm font-medium text-slate-800">{org.industry}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 flex-none">
              <User className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Manager</p>
              <p className="text-sm font-medium text-slate-800">{org.manager}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 flex-none">
              <Calendar className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Created</p>
              <p className="text-sm font-medium text-slate-800">{formatDate(org.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div onClick={() => navigate("/org/projects")}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm cursor-pointer hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition duration-150">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-500">Projects</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <FolderKanban className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4 text-4xl font-semibold text-slate-900">{org.projects}</div>
          <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
            <span>View all</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>

        <div onClick={() => navigate("/org/teams")}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm cursor-pointer hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition duration-150">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-500">Teams</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4 text-4xl font-semibold text-slate-900">{org.teams}</div>
          <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
            <span>View all</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-500">Members</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Building2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4 text-4xl font-semibold text-slate-900">{org.members}</div>
        </div>
      </div>

      {/* Recent activity */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
            <p className="text-sm text-slate-500 mt-0.5">Latest work items across the organization</p>
          </div>
          <button
            onClick={() => navigate("/org/projects")}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View projects
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {org.recentActivity.map((event) => (
            <div
                key={event.title}
                onClick={() => {
                localStorage.setItem("selectedProject", event.projectId)
                localStorage.setItem("selectedProjectName",
                    event.projectId === "1" ? "FlowManager Frontend" :
                    event.projectId === "2" ? "API Gateway" :
                    event.projectId === "3" ? "Mobile App" : "Design System"
                )
                navigate(`/work-items/${event.workItemId}/edit`)
                }}
                className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition hover:opacity-80 ${activityColors[event.type]}`}
            >
                <span className="mt-0.5">{activityIcons[event.type]}</span>
                <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{event.title}</p>
                <p className="text-xs mt-0.5 opacity-80">{event.detail}</p>
                </div>
                <span className="text-[10px] opacity-60 whitespace-nowrap flex-none">{event.time}</span>
            </div>
            ))}
        </div>
      </section>
    </div>
  )
}
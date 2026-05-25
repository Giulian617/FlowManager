import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { FolderKanban, Users, ListChecks, Clock, ChevronRight, Bug, CheckSquare, Zap, BookOpen } from "lucide-react"

const PROJECT_DATA: Record<string, {
  openItems: number
  teams: number
  members: number
  progress: number
  deadline: string
  recentActivity: { title: string; detail: string; time: string; type: "bug" | "task" | "epic" | "us"; 
  workItemId: string }[]
}> = {
  "1": {
    openItems: 34, teams: 3, members: 9, progress: 62,
    deadline: "2026-07-30",
    recentActivity: [
      { title: "Login bug reported", detail: "Login button unresponsive on Safari.", time: "4h ago", type: "bug" as const, workItemId: "1" },
      { title: "Implement user settings", detail: "Task added to current sprint.", time: "2h ago", type: "task" as const, workItemId: "2" },
      { title: "Q3 Delivery Epic", detail: "New epic created for Q3 delivery.", time: "Yesterday", type: "epic" as const, workItemId: "3" },
      { title: "User onboarding story", detail: "User story refined and estimated.", time: "2 days ago", type: "us" as const, workItemId: "4" },
    ],
  },
  "2": {
    openItems: 21, teams: 2, members: 4, progress: 45,
    deadline: "2026-06-15",
    recentActivity: [
      { title: "Login bug reported", detail: "Login button unresponsive on Safari.", time: "4h ago", type: "bug" as const, workItemId: "1" },
      { title: "Implement user settings", detail: "Task added to current sprint.", time: "2h ago", type: "task" as const, workItemId: "2" },
      { title: "Q3 Delivery Epic", detail: "New epic created for Q3 delivery.", time: "Yesterday", type: "epic" as const, workItemId: "3" },
      { title: "User onboarding story", detail: "User story refined and estimated.", time: "2 days ago", type: "us" as const, workItemId: "4" },
    ],
  },
  "3": {
    openItems: 18, teams: 3, members: 6, progress: 30,
    deadline: "2026-09-01",
    recentActivity: [
      { title: "Login bug reported", detail: "Login button unresponsive on Safari.", time: "4h ago", type: "bug" as const, workItemId: "1" },
      { title: "Implement user settings", detail: "Task added to current sprint.", time: "2h ago", type: "task" as const, workItemId: "2" },
      { title: "Q3 Delivery Epic", detail: "New epic created for Q3 delivery.", time: "Yesterday", type: "epic" as const, workItemId: "3" },
      { title: "User onboarding story", detail: "User story refined and estimated.", time: "2 days ago", type: "us" as const, workItemId: "4" },
    ],
  },
  "4": {
    openItems: 12, teams: 2, members: 5, progress: 78,
    deadline: "2026-05-31",
    recentActivity: [
      { title: "Login bug reported", detail: "Login button unresponsive on Safari.", time: "4h ago", type: "bug" as const, workItemId: "1" },
      { title: "Implement user settings", detail: "Task added to current sprint.", time: "2h ago", type: "task" as const, workItemId: "2" },
      { title: "Q3 Delivery Epic", detail: "New epic created for Q3 delivery.", time: "Yesterday", type: "epic" as const, workItemId: "3" },
      { title: "User onboarding story", detail: "User story refined and estimated.", time: "2 days ago", type: "us" as const, workItemId: "4" },
    ],
  },
}

const activityColors = {
  bug: "bg-rose-50 text-rose-700 border-rose-200",
  task: "bg-sky-50 text-sky-700 border-sky-200",
  epic: "bg-violet-50 text-violet-700 border-violet-200",
  us: "bg-emerald-50 text-emerald-700 border-emerald-200",
}

const activityIcons = {
  bug: <Bug className="h-4 w-4 flex-none" />,
  task: <CheckSquare className="h-4 w-4 flex-none" />,
  epic: <Zap className="h-4 w-4 flex-none" />,
  us: <BookOpen className="h-4 w-4 flex-none" />,
}

function formatDeadline(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ro-RO", { day: "2-digit", month: "long", year: "numeric" })
}

function daysLeft(dateStr: string) {
  const diff = new Date(dateStr).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [projectId, setProjectId] = useState<string | null>(null)
  const [projectName, setProjectName] = useState<string | null>(null)

  useEffect(() => {
    setProjectId(localStorage.getItem("selectedProject"))
    setProjectName(localStorage.getItem("selectedProjectName"))
  }, [])

  const data = projectId ? PROJECT_DATA[projectId] : null
  const days = data ? daysLeft(data.deadline) : null
  const isOverdue = days !== null && days < 0
  const isNear = days !== null && days >= 0 && days <= 14

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Dashboard</p>
        <h1 className="text-3xl font-semibold text-slate-900">
          {projectName ?? "Welcome back"}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          {data
            ? `Overview of work items, teams and recent activity for this project.`
            : "Select a project from the sidebar to see its dashboard."}
        </p>
      </header>

      {!data ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-24 shadow-sm text-center gap-3">
          <FolderKanban className="h-10 w-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">No project selected</p>
          <p className="text-xs text-slate-400">Go to Projects and select one to get started.</p>
          <button
            onClick={() => navigate("/projects")}
            className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <FolderKanban className="h-4 w-4" />
            Go to Projects
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">Open work items</span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                  <ListChecks className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-4 text-4xl font-semibold text-slate-900">{data.openItems}</div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">Teams</span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                  <Users className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-4 text-4xl font-semibold text-slate-900">{data.teams}</div>
              <p className="mt-1 text-xs text-slate-400">{data.members} members total</p>
            </div>

            <div className={`rounded-3xl border p-5 shadow-sm ${isOverdue ? "border-rose-200 bg-rose-50" : isNear ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}>
              <div className="flex items-center justify-between gap-3">
                <span className={`text-sm ${isOverdue ? "text-rose-600" : isNear ? "text-amber-600" : "text-slate-500"}`}>Deadline</span>
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-2xl ${isOverdue ? "bg-rose-100 text-rose-700" : isNear ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                  <Clock className="h-4 w-4" />
                </span>
              </div>
              <div className={`mt-4 text-2xl font-semibold ${isOverdue ? "text-rose-700" : isNear ? "text-amber-700" : "text-slate-900"}`}>
                {isOverdue ? `${Math.abs(days!)} days overdue` : `${days} days left`}
              </div>
              <p className={`mt-1 text-xs ${isOverdue ? "text-rose-500" : isNear ? "text-amber-500" : "text-slate-400"}`}>
                {formatDeadline(data.deadline)}
              </p>
            </div>
          </div>

          {/* Recent activity */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
                <p className="text-sm text-slate-500 mt-0.5">Latest updates for this project</p>
              </div>
              <button
                onClick={() => navigate("/work-items")}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View work items
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {data.recentActivity.map((event) => (
                <div
                  key={event.title}
                  onClick={() => navigate(`/work-items/${event.workItemId}/edit`)}
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
        </>
      )}
    </div>
  )
}
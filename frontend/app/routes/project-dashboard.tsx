import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { FolderKanban, Users, ListChecks, Clock, ChevronRight, Bug, CheckSquare, Zap, BookOpen } from "lucide-react"
import {
  getProjectById,
  getWorkItemsByProjectId
} from "../api/project";
import type { ProjectSummaryDto } from "../types/project";
import type { WorkItemSummaryDto } from "../types/workItem";
import type { ItemType} from "../types/enums"

type ActivityType = "bug" | "task" | "epic" | "user_story"

const ITEM_TYPE_MAP: Record<ItemType, ActivityType> = {
  Task: "task",
  Bug: "bug",
  User_Story: "user_story",
  Epic: "epic",
}

const activityColors = {
  task: "bg-sky-50 text-sky-700 border-sky-200",
  bug: "bg-rose-50 text-rose-700 border-rose-200",
  user_story: "bg-emerald-50 text-emerald-700 border-emerald-200",
  epic: "bg-violet-50 text-violet-700 border-violet-200",
}

const activityIcons = {
  task: <CheckSquare className="h-4 w-4 flex-none" />,
  bug: <Bug className="h-4 w-4 flex-none" />,
  user_story: <BookOpen className="h-4 w-4 flex-none" />,
  epic: <Zap className="h-4 w-4 flex-none" />,
}

function formatDeadline(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ro-RO", { day: "2-digit", month: "long", year: "numeric" })
}

function daysLeft(dateStr: string) {
  const diff = new Date(dateStr).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [project, setProject] = useState<ProjectSummaryDto | null>(null)
  const [workItems, setWorkItems] = useState<WorkItemSummaryDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const projectId = Number(localStorage.getItem("selectedProject"))
    if (!projectId) {
      navigate("/org");
      return
    }

    async function load() {
      try {
        const [projectData, workItemsData] = await Promise.all([
          getProjectById(projectId),
          getWorkItemsByProjectId(projectId),
        ])
        setProject(projectData)
        setWorkItems(workItemsData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <p className="text-slate-500">Loading dashboard…</p>
    </div>
  )

  if (!project) return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-24 shadow-sm text-center gap-3">
      <FolderKanban className="h-10 w-10 text-slate-300" />
      <p className="text-sm font-medium text-slate-600">No project selected</p>
      <p className="text-xs text-slate-400">Go to Projects and select one to get started.</p>
      <button onClick={() => navigate("/org-projects")}
        className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
        <FolderKanban className="h-4 w-4" />
        Go to Projects
      </button>
    </div>
  )

  const days = daysLeft(project.endDate)
  const isOverdue = days < 0
  const isNear = days >= 0 && days <= 14
  const openItems = workItems.filter((w) => w.status !== "Done" && w.status !== "Closed").length
  const recentItems = workItems.slice(0, 4)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Dashboard</p>
        <h1 className="text-3xl font-semibold text-slate-900">{project.name}</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">{project.description}</p>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-500">Open work items</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <ListChecks className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4 text-4xl font-semibold text-slate-900">{openItems}</div>
          <p className="mt-1 text-xs text-slate-400">{workItems.length} total</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-500">Teams</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4 text-4xl font-semibold text-slate-900">{project.teamCount}</div>
        </div>

        <div className={`rounded-3xl border p-5 shadow-sm ${isOverdue ? "border-rose-200 bg-rose-50" : isNear ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}>
          <div className="flex items-center justify-between gap-3">
            <span className={`text-sm ${isOverdue ? "text-rose-600" : isNear ? "text-amber-600" : "text-slate-500"}`}>Deadline</span>
            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-2xl ${isOverdue ? "bg-rose-100 text-rose-700" : isNear ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <div className={`mt-4 text-2xl font-semibold ${isOverdue ? "text-rose-700" : isNear ? "text-amber-700" : "text-slate-900"}`}>
            {isOverdue ? `${Math.abs(days)} days overdue` : `${days} days left`}
          </div>
          <p className={`mt-1 text-xs ${isOverdue ? "text-rose-500" : isNear ? "text-amber-500" : "text-slate-400"}`}>
            {formatDeadline(project.endDate)}
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
            <p className="text-sm text-slate-500 mt-0.5">Latest updates for this project</p>
          </div>
          <button onClick={() => navigate("/work-items")}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            View work items
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {recentItems.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No work items yet.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {recentItems.map((item) => {
              const type: ActivityType = ITEM_TYPE_MAP[item.itemType] ?? "task"
              return (
                <div key={item.id}
                  onClick={() => navigate(`/work-items/${item.id}/edit`)}
                  className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition hover:opacity-80 ${activityColors[type]}`}>
                  <span className="mt-0.5">{activityIcons[type]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs mt-0.5 opacity-80 capitalize">
                      {item.status?.toLowerCase().replace(/_/g, " ")}
                      {item.severity ? ` · ${item.severity.toLowerCase()}` : ""}
                    </p>
                  </div>
                  <span className="text-[10px] opacity-60 whitespace-nowrap flex-none">
                    {item.createdAt ? timeAgo(item.createdAt) : ""}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { FolderKanban, Users, Building2, Calendar, User, ChevronRight, Bug, CheckSquare, Zap, BookOpen } from "lucide-react"
import {
  getCurrentUser,
  getReportedWorkItemsByUserId,
  getAssignedWorkItemsByUserId,
} from "../api/user"
import {
  getOrganizationById,
  getWorkItemsByOrganizationId,
} from "../api/organization"
import type { UserSummaryDto } from "../types/user"
import type { OrganizationResponseDto } from "../types/organization"
import type { WorkItemSummaryDto } from "../types/workItem"
import type { ItemType } from "../types/enums"

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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ro-RO", { day: "2-digit", month: "long", year: "numeric" })
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function OrgDashboard() {
  const navigate = useNavigate()
  const [org, setOrg] = useState<OrganizationResponseDto | null>(null)
  const [currentUser, setCurrentUser] = useState<UserSummaryDto | null>(null)
  const [workItems, setWorkItems] = useState<WorkItemSummaryDto[]>([])
  const [loading, setLoading] = useState(true)
    
  useEffect(() => {
    const orgId = Number(localStorage.getItem("selectedOrg"))
    if (!orgId) {
      navigate("/select-org");
      return
    }
    
    async function loadAll() {
      try {
        const [orgData, user] = await Promise.all([
          getOrganizationById(orgId),
          getCurrentUser(),
        ])
        setCurrentUser(user)
        setOrg(orgData)

        if (user.role === "ADMIN") {
          const items = await getWorkItemsByOrganizationId(orgId)
          setWorkItems(items)
        } else {
          const [reported, assigned] = await Promise.all([
            getReportedWorkItemsByUserId(user.id),
            getAssignedWorkItemsByUserId(user.id),
          ])
          const merged = [...(reported ?? []), ...(assigned ?? [])]
            .filter((item, i, arr) => arr.findIndex((x) => x.id === item.id) === i)
          setWorkItems(merged)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [])

  if(loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-slate-500">Loading dashboard…</p>
      </div>
    )
  }

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

  const recentItems = workItems.slice(0, 4)

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
              <p className="text-sm font-medium text-slate-800">{org.manager.username}</p>
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
          <div className="mt-4 text-4xl font-semibold text-slate-900">{org.projectCount}</div>
          <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
            <span>View yours</span>
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
          <div className="mt-4 text-4xl font-semibold text-slate-900">{org.teamCount}</div>
          <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
            <span>View yours</span>
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
          <div className="mt-4 text-4xl font-semibold text-slate-900">{org.memberCount}</div>
        </div>
      </div>

      {/* Recent activity */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {currentUser?.role === "ADMIN"
                ? "Latest work items across the organization"
                : "Latest work items across your projects"}
            </p>
          </div>
          <button
            onClick={() => navigate("/org/projects")}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View projects
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
              <div
                key={item.id}
                  onClick={() => navigate(`/project/work-items/${item.id}/edit`)}
                  className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition hover:opacity-80 ${activityColors[type]}`}
              >
              <span className="mt-0.5">{activityIcons[type]}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs mt-0.5 opacity-80 capitalize">
                    {item.status?.toLowerCase().replace(/_/g, " ")}
                    {item.severity ? ` · ${item.severity.toLowerCase()}` : ""}
                  </p>
                </div>
                <span className="text-[10px] opacity-60 whitespace-nowrap flex-none capitalize">
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
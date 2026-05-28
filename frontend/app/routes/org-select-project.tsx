import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { FolderKanban, ChevronRight, Search, ArrowLeft, Plus } from "lucide-react"
import { getProjectsByOrganizationId } from "../src/api"
import type { ProjectSummaryDto } from "../types/project"

const PROJECT_COLORS = [
  "bg-sky-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500",
  "bg-rose-500", "bg-indigo-500", "bg-teal-500", "bg-orange-500",
]

export default function SelectProject() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [projects, setProjects] = useState<ProjectSummaryDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const orgId = Number(localStorage.getItem("selectedOrg"))
    if (!orgId) {
      navigate("/select-org")
      return
    }

    async function loadProjects() {
      try {
        const data = await getProjectsByOrganizationId(orgId)
        setProjects(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  })

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading projects...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-slate-50">
      <div className="mb-10 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-3xl bg-slate-900 text-lg font-bold text-white">F</div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">FlowManager</p>
          <p className="text-xs text-slate-400">Project workspace</p>
        </div>
      </div>

      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/select-org")}
          className="mb-4 flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to organizations
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Select project</h1>
          <p className="mt-1 text-sm text-slate-500">Choose a project to start working</p>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Search className="h-4 w-4 flex-none text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          {filtered.map((project, index) => (
            <button
              key={project.id}
              onClick={() => {
                localStorage.setItem("selectedProject", String(project.id))
                localStorage.setItem("selectedProjectName", project.name)
                navigate("/dashboard", { replace: true })
                }}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className={`flex h-10 w-10 flex-none items-center justify-center rounded-2xl ${PROJECT_COLORS[index % PROJECT_COLORS.length]}`}>
                <FolderKanban className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{project.name}</p>
                <p className="text-xs text-slate-400 truncate">{project.description} · {project.itemCount} items · {project.memberCount} members</p>
              </div>
              <ChevronRight className="h-4 w-4 flex-none text-slate-400" />
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">No projects found.</p>
          )}
        </div>

        <button className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-medium text-slate-500 transition hover:border-slate-400 hover:text-slate-700">
          <Plus className="h-4 w-4" />
          Create new project
        </button>
      </div>
    </div>
  )
}
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { Calendar, User, Users, Search, Plus, X, ChevronDown, AlertCircle, Pencil, Trash2 } from "lucide-react"
import {
  getCurrentUser,
  getManagedProjectsByUserId,
  getAssignedProjectsByUserId
} from "../api/user"
import {
  getProjectsByOrganizationId,
  getTeamsByOrganizationId,
  getUsersByOrganizationId,
} from "../api/organization"
import {
  createProject,
  updateProject,
  deleteProject,
} from "../api/project"
import type {
  ProjectCreateDto,
  ProjectUpdateDto,
  ProjectResponseDto,
} from "../types/project"
import type { UserSummaryDto } from "../types/user"
import type { TeamSummaryDto } from "../types/team"

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ro-RO", { day: "2-digit", month: "short", year: "numeric" })
}

function isOverdue(endDate: string) {
  return new Date(endDate) < new Date()
}

function isNearDeadline(endDate: string) {
  const diff = new Date(endDate).getTime() - new Date().getTime()
  return diff > 0 && diff < 1000 * 60 * 60 * 24 * 14
}

function ManagerPicker({ value, onChange, managers }: {
  value: string
  onChange: (id: string) => void
  managers: UserSummaryDto[]
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const selected = managers.find((u) => u.id === Number(value)) ?? null

  return (
  <div className="relative">
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSearch("") }}
        className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition hover:border-slate-400"
      >
        {selected ? (
          <>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-semibold flex-none">
              {selected.username[0].toUpperCase()}
            </div>
            <span className="text-slate-700 flex-1 text-left">{selected.username}</span>
          </>
        ) : (
          <>
            <User className="h-4 w-4 text-slate-400" />
            <span className="text-slate-400 flex-1 text-left">Select manager…</span>
          </>
        )}
        <ChevronDown className="h-4 w-4 text-slate-400 flex-none" />
      </button>

      {open && (
        <div className="absolute left-0 z-30 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
            <Search className="h-3.5 w-3.5 text-slate-400 flex-none" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
          <ul className="max-h-44 overflow-y-auto">
            {managers
              .filter((u) => u.username.toLowerCase().includes(search.toLowerCase()))
              .map((u) => (
                <li
                  key={u.id}
                  className={`flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer hover:bg-slate-100 ${u.id === Number(value) ? "bg-slate-100" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); onChange(String(u.id)); setOpen(false) }}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-semibold flex-none">
                    {u.username[0].toUpperCase()}
                  </div>
                  <span className="text-slate-700">{u.username}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function ConfirmDeleteModal({ project, onConfirm, onClose }: {
  project: ProjectResponseDto
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-slate-200 bg-white shadow-2xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100">
            <Trash2 className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Delete project</h2>
            <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete <span className="font-semibold text-slate-900">"{project.name}"</span>?
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function TeamsPicker({ value, onChange, teams }: {
  value: string[]
  onChange: (v: string[]) => void
  teams: TeamSummaryDto[]
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const toggle = (id: string) =>
    value.includes(id) ? onChange(value.filter((v) => v !== id)) : onChange([...value, id])

  const selectedTeams = teams.filter((t) => value.includes(String(t.id)))
  const filtered = teams.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div ref={ref} className="relative">
      {selectedTeams.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedTeams.map((t) => (
            <span key={t.id} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 pl-2 pr-1 py-0.5 text-xs text-slate-700">
              {t.name}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); toggle(String(t.id)) }}
                className="ml-0.5 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSearch("") }}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition hover:border-slate-400"
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" />
          <span className="text-slate-400">{value.length === 0 ? "Select teams…" : "Add more…"}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute left-0 z-30 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
            <Search className="h-3.5 w-3.5 text-slate-400 flex-none" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teams…"
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-xs text-slate-400">No teams found</li>
            )}
            {filtered.map((t) => {
              const selected = value.includes(String(t.id))
              return (
                <li
                  key={t.id}
                  className={`flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer transition hover:bg-slate-50 ${selected ? "bg-slate-50" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); toggle(String(t.id)) }}
                >
                  <div className={`h-4 w-4 flex-none rounded border flex items-center justify-center transition-colors ${selected ? "bg-slate-900 border-slate-900" : "border-slate-300 bg-white"}`}>
                    {selected && (
                      <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </div>
                  <span className="text-slate-700">{t.name}</span>
                  {t.manager && (
                    <span className="ml-auto text-xs text-slate-400">{t.manager.username}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

function ProjectFormModal({ initial, managers, currentUser, orgId, teams, onClose, onSave }: {
  initial?: ProjectResponseDto
  managers: UserSummaryDto[]
  currentUser: UserSummaryDto | null
  teams: TeamSummaryDto[]
  orgId: number
  onClose: () => void
  onSave: (data: ProjectCreateDto | ProjectUpdateDto, id?: number) => Promise<void>
}) {
  const isEdit = !!initial
  const [name, setName] = useState(initial?.name ?? "")
  const [description, setDesc] = useState(initial?.description ?? "")
  const [startDate, setStartDate] = useState(initial?.startDate ?? "")
  const [endDate, setEndDate] = useState(initial?.endDate ?? "")
  const [teamsIds, setTeamsIds] = useState<string[]>(initial?.teams.map(team => String(team.id)) ?? [])
  const [managerId, setManagerId] = useState(initial?.manager.id ?? currentUser?.id ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nameOk = name.trim() !== ""
  const descOk = description.trim() !== ""
  const startOk = startDate !== ""
  const endOk = endDate !== ""
  const dateRangeOk = !startOk || !endOk || new Date(endDate) >= new Date(startDate)
  const canSave = nameOk && descOk && startOk && endOk && dateRangeOk && managerId !== null

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setError(null)
    
    try {
      const payload = { name: name.trim(), description: description.trim(), startDate, endDate, organizationId: orgId, teamsIds: teamsIds.map(Number) }
      await onSave(payload, initial?.id)
      onClose()
    } catch(e) {
      setError("Failed to save project. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const inputCls = (valid: boolean) =>
    `w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
      valid
        ? "border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-slate-200"
        : "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{isEdit ? "Edit Project" : "Create Project"}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{isEdit ? "Update the project details." : "Fill in the details to create a new project."}</p>
          </div>
          <button onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Name <span className={nameOk ? "text-slate-300" : "text-rose-500"}>*</span>
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. FlowManager Frontend…" className={inputCls(nameOk)} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Description <span className={descOk ? "text-slate-300" : "text-rose-500"}>*</span>
            </label>
            <textarea value={description} onChange={(e) => setDesc(e.target.value)} rows={3}
              placeholder="What is this project about?"
              className={inputCls(descOk) + " resize-none"} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Start Date <span className={startOk ? "text-slate-300" : "text-rose-500"}>*</span>
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full rounded-xl border bg-white pl-9 pr-3 py-2.5 text-sm text-slate-700 outline-none transition focus:ring-2 ${startOk ? "border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-slate-200" : "border-rose-300 focus:border-rose-400 focus:ring-rose-100"}`} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                End Date <span className={endOk ? "text-slate-300" : "text-rose-500"}>*</span>
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full rounded-xl border bg-white pl-9 pr-3 py-2.5 text-sm text-slate-700 outline-none transition focus:ring-2 ${endOk ? "border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-slate-200" : "border-rose-300 focus:border-rose-400 focus:ring-rose-100"}`} />
              </div>
            </div>
          </div>

          {startOk && endOk && !dateRangeOk && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 flex-none" />
              End date must be after start date.
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Manager</label>
            {isEdit ? (
              <ManagerPicker
                value={String(managerId)}
                onChange={(id) => setManagerId(Number(id))}
                managers={managers}
              />
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 cursor-not-allowed">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-semibold flex-none">
                  {currentUser?.username[0].toUpperCase() ?? "?"}
                </div>
                <span className="text-sm text-slate-600">{currentUser?.username ?? "Loading…"}</span>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Teams
            </label>
            <TeamsPicker value={teamsIds} onChange={setTeamsIds} teams={teams} />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 flex-none" />
              {error}
            </div>
          )}

          {!canSave && dateRangeOk && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700">
              <AlertCircle className="h-4 w-4 flex-none" />
              Name, description, manager and both dates are required.
            </div>
          )}
        </div>

        <div className="flex gap-2 px-6 pb-6 pt-4 border-t border-slate-100">
          <button onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!canSave || saving}
            className="flex-1 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed">
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Projects() {
  const navigate = useNavigate()
  const [orgId, setOrgId] = useState<number>(0)
  const [projects, setProjects] = useState<ProjectResponseDto[]>([])
  const [currentUser, setCurrentUser] = useState<UserSummaryDto | null>(null)
  const [managers, setManagers] = useState<UserSummaryDto[]>([])
  const [teams, setTeams] = useState<TeamSummaryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null> (null)
  const [query, setQuery] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [editProject, setEditProject] = useState<ProjectResponseDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProjectResponseDto | null>(null)
  
  useEffect(() => {
    const orgId = typeof window !== "undefined" ? Number(localStorage.getItem("selectedOrg")) : 0
    if (!orgId) {
      navigate("/select-org");
      return
    }

    async function load() {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
        setOrgId(orgId)

        let projectsData: ProjectResponseDto[] = []

        if (user.role === "ADMIN") {
          projectsData = await getProjectsByOrganizationId(orgId)
        } else if (user.role === "MANAGER") {
          const [managed, assigned] = await Promise.all([
            getManagedProjectsByUserId(user.id),
            getAssignedProjectsByUserId(user.id),
          ])
          projectsData = [...(managed ?? []), ...(assigned ?? [])].filter(
            (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i
          )
        } else {
          projectsData = await getAssignedProjectsByUserId(user.id)
        }

        setProjects(projectsData)

        if (user.role === "ADMIN" || user.role === "MANAGER") {
          const [managersData, teamsData] = await Promise.all([
            getUsersByOrganizationId(orgId, "MANAGER"),
            getTeamsByOrganizationId(orgId),
          ])
          setManagers(managersData)
          setTeams(teamsData)
        }
      } catch (e) {
        setError("Failed to load projects.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [location.pathname])
  
  const handleCreate = async (data: ProjectCreateDto) => {
    const created = await createProject(orgId, data)
    setProjects((prev) => [...prev, created])
  }

  const handleEdit = async (data: ProjectUpdateDto, id?: number) => {
    const updated = await updateProject(id!, data)
    setProjects((prev) => prev.map((p) => p.id === updated.id ? updated : p))
  }

  const handleDelete = async (id: number) => {
    await deleteProject(id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
    if (Number(localStorage.getItem("selectedProject")) === id) {
      localStorage.removeItem("selectedProject")
      localStorage.removeItem("selectedProjectName")
    }
    setDeleteTarget(null)
  }

  const handleSelect = (project: ProjectResponseDto) => {
    localStorage.setItem("selectedProject", String(project.id))
    localStorage.setItem("selectedProjectName", project.name)
    navigate("/project/dashboard")
  }

  const filtered = projects.filter((p) => {
    const q = query.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.manager?.username?.toLowerCase().includes(q)
    )
  })

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <p className="text-slate-500">Loading projects…</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center py-24">
      <p className="text-rose-500">{error}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Projects</p>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-slate-900">Projects</h1>
          {(currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER") && (
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          )}
        </div>
      </header>

      <div className="flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <Search className="h-5 w-5 text-slate-400 flex-none" />
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, description, manager or team…"
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" />
        {query && (
          <button onClick={() => setQuery("")} className="text-slate-300 hover:text-slate-500 transition flex-none">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 shadow-sm text-center gap-2">
            {query ? (
            <>
                <p className="text-sm font-medium text-slate-600">No projects match your search.</p>
                <p className="text-xs text-slate-400">Try a different name, manager, or team.</p>
            </>
            ) : (
            <>
                <p className="text-sm font-medium text-slate-600">No projects for this organization.</p>
                <p className="text-xs text-slate-400">Create a new project to get started.</p>
            </>
            )}
        </div>
        ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => {
            const overdue     = isOverdue(project.endDate)
            const nearDeadline = isNearDeadline(project.endDate)

            const canModify = currentUser?.role === "ADMIN" || project.manager?.id === currentUser?.id

            return (
              <div key={project.id} className="relative group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 duration-150">
                {canModify && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditProject(project) }}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(project) }}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-rose-100 bg-white text-rose-400 transition hover:bg-rose-50 hover:text-rose-600"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <button className="w-full text-left" onClick={() => handleSelect(project)}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`flex h-10 w-10 flex-none items-center justify-center rounded-2xl "bg-slate-500" text-white text-xs font-bold`}>
                      {project.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 pr-14">
                      <h2 className="text-base font-semibold text-slate-900 leading-tight truncate">{project.name}</h2>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{project.description}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 mb-4" />

                  <div className="space-y-2.5 mb-4">
                    <div className="flex items-center gap-2.5">
                      <User className="h-3.5 w-3.5 flex-none text-slate-400" />
                      <span className="text-xs text-slate-500">Manager</span>
                      <span className="ml-auto text-xs font-medium text-slate-700">{project.manager?.username ?? "—"}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Calendar className="h-3.5 w-3.5 flex-none text-slate-400" />
                      <span className="text-xs text-slate-500">Start date</span>
                      <span className="ml-auto text-xs font-medium text-slate-700">{formatDate(project.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Calendar className="h-3.5 w-3.5 flex-none text-slate-400" />
                      <span className="text-xs text-slate-500">End date</span>
                      <span className={`ml-auto text-xs font-medium ${overdue ? "text-rose-600" : nearDeadline ? "text-amber-600" : "text-slate-700"}`}>
                        {formatDate(project.endDate)}
                        {overdue      && <span className="ml-1.5 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600">Overdue</span>}
                        {!overdue && nearDeadline && <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">Soon</span>}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 mb-4" />

                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500">
                      {project.teams?.length ?? 0} team{(project.teams?.length ?? 0) !== 1 ? "s" : ""}
                    </span>
                    <span className="mx-1 text-slate-200">·</span>
                    <span className="text-xs text-slate-500">
                      {project.workItems?.length ?? 0} work item{(project.workItems?.length ?? 0) !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {(project.teams?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {project.teams!.map((t) => (
                        <span key={t.id} className="inline-flex items-center rounded-lg bg-slate-50 border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {showCreate && (
        <ProjectFormModal
          managers={managers}
          currentUser={currentUser}
          teams={teams}
          orgId={orgId}
          onClose={() => setShowCreate(false)}
          onSave={(data) => handleCreate(data as ProjectCreateDto)}
        />
      )}
      {editProject && (
        <ProjectFormModal
          initial={editProject}
          managers={managers}
          currentUser={currentUser}
          teams={teams}
          orgId={orgId}
          onClose={() => setEditProject(null)}
          onSave={(data, id) => handleEdit(data as ProjectUpdateDto, id)}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          project={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

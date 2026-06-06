import { useEffect, useRef, useState } from "react"
import { useNavigate} from "react-router"
import { Calendar, User, Users, Search, Plus, X, ChevronDown, AlertCircle, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import {
  getCurrentUser,
  getManagedProjectsByUserId,
  getAssignedProjectsByUserId
} from "../api/user"
import {
  getOrganizations,
  getProjectsByOrganizationId,
  getTeamsByOrganizationId,
  getUsersByOrganizationId,
} from "../api/organization"
import {
  getProjects,
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
import type { OrganizationResponseDto } from "../types/organization"
import SelectDropdown from "./SelectDropdown"
import { getInitials, formatDateShortMonth } from "../utils/functions" 

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
        className="flex w-full items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm outline-none transition hover:border-slate-400 dark:hover:border-slate-500"
      >
        {selected ? (
          <>
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
              {getInitials(selected.username)}
            </div>
            <span className="text-slate-700 dark:text-slate-300 flex-1 text-left">{selected.username}</span>
          </>
        ) : (
          <>
            <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <span className="text-slate-400 dark:text-slate-500 flex-1 text-left">Select manager…</span>
          </>
        )}
        <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-none" />
      </button>

      {open && (
        <div className="absolute left-0 z-30 mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-slate-700">
            <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 flex-none" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <ul className="max-h-44 overflow-y-auto">
            {managers
              .filter((u) => u.username.toLowerCase().includes(search.toLowerCase()))
              .map((u) => (
                <li
                  key={u.id}
                  className={`flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${u.id === Number(value) ? "bg-slate-100 dark:bg-slate-700" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); onChange(String(u.id)); setOpen(false) }}
                >
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
                    {getInitials(u.username)}
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">{u.username}</span>
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
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/40">
            <Trash2 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Delete project</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-slate-100">"{project.name}"</span>?
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-500 dark:bg-rose-800 px-4 py-2.5 text-sm font-semibold text-white dark:text-rose-200 transition hover:bg-rose-600 dark:hover:bg-rose-700"
          >
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
            <span key={t.id} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 pl-2 pr-1 py-0.5 text-xs text-slate-700 dark:text-slate-300">
              {t.name}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); toggle(String(t.id)) }}
                className="ml-0.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"
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
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm outline-none transition hover:border-slate-400 dark:hover:border-slate-500"
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          <span className="text-slate-400 dark:text-slate-500">{value.length === 0 ? "Select teams…" : "Add more…"}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
      </button>

      {open && (
        <div className="absolute left-0 z-30 mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-slate-700">
            <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 flex-none" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teams…"
              className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-xs text-slate-400 dark:text-slate-500">No teams found</li>
            )}
            {filtered.map((t) => {
              const selected = value.includes(String(t.id))
              return (
                <li
                  key={t.id}
                  className={`flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-700 ${selected ? "bg-slate-50 dark:bg-slate-700" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); toggle(String(t.id)) }}
                >
                  <div className={`h-4 w-4 flex-none rounded border flex items-center justify-center transition-colors ${selected ? "bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100" : "border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700"}`}>
                    {selected && (
                      <svg className="h-2.5 w-2.5 text-white dark:text-slate-900" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">{t.name}</span>
                  {t.manager && (
                    <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{t.manager.username}</span>
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

function ProjectFormModal({ initial, managers, currentUser, orgId, teams, organizations = [], onClose, onSave }: {
  initial?: ProjectResponseDto
  managers: UserSummaryDto[]
  currentUser: UserSummaryDto | null
  teams: TeamSummaryDto[]
  orgId: number
  organizations?: OrganizationResponseDto[]
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
  const [selectedOrgId, setSelectedOrgId] = useState<number>(orgId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nameOk = name.trim() !== ""
  const descOk = description.trim() !== ""
  const startOk = startDate !== ""
  const endOk = endDate !== ""
  const dateRangeOk = !startOk || !endOk || new Date(endDate) >= new Date(startDate)
  const canSave = nameOk && descOk && startOk && endOk && dateRangeOk && managerId !== null && (isEdit || selectedOrgId !== 0)

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      const payload = isEdit
        ? { name: name.trim(), description: description.trim(), startDate, endDate, teamsIds: teamsIds.map(Number) } satisfies ProjectUpdateDto
        : { name: name.trim(), description: description.trim(), startDate, endDate, organizationId: selectedOrgId, teamsIds: teamsIds.map(Number) } satisfies ProjectCreateDto
      await onSave(payload, initial?.id)
      onClose()
    } catch(e) {
      setError("Failed to save project. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const inputCls = (valid: boolean) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 ${
      valid
        ? "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-500 focus:border-slate-400 dark:focus:border-slate-400 focus:ring-slate-200 dark:focus:ring-slate-700"
        : "border-rose-300 dark:border-rose-700 bg-rose-50/30 dark:bg-rose-950/20 text-slate-900 dark:text-slate-100 focus:border-rose-400 dark:focus:border-rose-600 focus:ring-rose-100 dark:focus:ring-rose-900/30"
    }`

  const dateCls = (valid: boolean) =>
    `w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
      valid
        ? "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500 focus:border-slate-400 dark:focus:border-slate-400 focus:ring-slate-200 dark:focus:ring-slate-700"
        : "border-rose-300 dark:border-rose-700 bg-rose-50/30 dark:bg-rose-950/20 text-slate-700 dark:text-slate-300 focus:border-rose-400 dark:focus:border-rose-600 focus:ring-rose-100 dark:focus:ring-rose-900/30"
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{isEdit ? "Edit Project" : "Create Project"}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{isEdit ? "Update the project details." : "Fill in the details to create a new project."}</p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Name <span className={nameOk ? "text-slate-300 dark:text-slate-600" : "text-rose-500 dark:text-rose-400"}>*</span>
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. FlowManager Frontend…" className={inputCls(nameOk)} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Description <span className={descOk ? "text-slate-300 dark:text-slate-600" : "text-rose-500 dark:text-rose-400"}>*</span>
            </label>
            <textarea value={description} onChange={(e) => setDesc(e.target.value)} rows={3}
              placeholder="What is this project about?"
              className={inputCls(descOk) + " resize-none"} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Start Date <span className={startOk ? "text-slate-300 dark:text-slate-600" : "text-rose-500 dark:text-rose-400"}>*</span>
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={dateCls(startOk)} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                End Date <span className={endOk ? "text-slate-300 dark:text-slate-600" : "text-rose-500 dark:text-rose-400"}>*</span>
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={dateCls(endOk)} />
              </div>
            </div>
          </div>

          {startOk && endOk && !dateRangeOk && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-4 py-3 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 flex-none" />
              End date must be after start date.
            </div>
          )}

          {organizations.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Organization <span className={selectedOrgId !== 0 ? "text-slate-300 dark:text-slate-600" : "text-rose-500 dark:text-rose-400"}>*</span>
              </label>
              <SelectDropdown
                value={selectedOrgId !== 0 ? String(selectedOrgId) : ""}
                options={organizations.map((o) => String(o.id))}
                onChange={(v) => setSelectedOrgId(Number(v))}
                placeholder="Select organization…"
                error={selectedOrgId === 0}
                renderOption={(v) => {
                  const o = organizations.find((o) => String(o.id) === v)
                  return <span>{o?.name ?? v}</span>
                }}
                renderSelected={(v) => {
                  const o = organizations.find((o) => String(o.id) === v)
                  return <span>{o?.name ?? v}</span>
                }}
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Manager</label>
            {isEdit ? (
              <ManagerPicker
                value={String(managerId)}
                onChange={(id) => setManagerId(Number(id))}
                managers={managers}
              />
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 px-3 py-2.5 cursor-not-allowed">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-semibold flex-none">
                  {currentUser ? getInitials(currentUser.username) : "?"}
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">{currentUser?.username ?? "Loading…"}</span>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Teams</label>
            <TeamsPicker value={teamsIds} onChange={setTeamsIds} teams={teams} />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-4 py-3 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 flex-none" />
              {error}
            </div>
          )}

          {!canSave && dateRangeOk && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-4 py-3 text-xs text-amber-700 dark:text-amber-300">
              <AlertCircle className="h-4 w-4 flex-none" />
              Name, description, manager and both dates are required.
            </div>
          )}
        </div>

        <div className="flex gap-2 px-6 pb-6 pt-4 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="flex-1 rounded-xl bg-slate-900 dark:bg-blue-950 px-5 py-2.5 text-sm font-semibold text-white dark:text-blue-300 transition hover:bg-slate-800 dark:hover:bg-blue-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Projects({ mode }: { mode: "org" | "admin" }) {
  const navigate = useNavigate()
  const [orgId, setOrgId] = useState<number>(0)
  const [projects, setProjects] = useState<ProjectResponseDto[]>([])
  const [currentUser, setCurrentUser] = useState<UserSummaryDto | null>(null)
  const [organizations, setOrganizations] = useState<OrganizationResponseDto[]>([])
  const [managers, setManagers] = useState<UserSummaryDto[]>([])
  const [teams, setTeams] = useState<TeamSummaryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [editProject, setEditProject] = useState<ProjectResponseDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProjectResponseDto | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const storedOrgId = typeof window !== "undefined" ? Number(localStorage.getItem("selectedOrg")) : 0
    if (!storedOrgId && mode !== "admin") {
      navigate("/select-org")
      return
    }

    async function load() {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
        setOrgId(storedOrgId)

        let projectsData: ProjectResponseDto[] = []

        if (mode === "admin") {
          projectsData = await getProjects()
          const orgs = await getOrganizations()
          setOrganizations(orgs)
        } else if (user.role === "ADMIN") {
          projectsData = await getProjectsByOrganizationId(storedOrgId)
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

        if ((user.role === "ADMIN" || user.role === "MANAGER") && mode !== "admin") {
          const [managersData, teamsData] = await Promise.all([
            getUsersByOrganizationId(storedOrgId, "MANAGER"),
            getTeamsByOrganizationId(storedOrgId),
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
  }, [])

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
    if (mode === "admin" && project.organization?.id) {
      localStorage.setItem("selectedOrg", String(project.organization.id))
      localStorage.setItem("selectedOrgName", project.organization.name)
    }
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

  const itemsPerPage = 6
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  useEffect(() => { setPage(1) }, [query])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <p className="text-slate-500 dark:text-slate-400">Loading projects…</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center py-24">
      <p className="text-rose-500 dark:text-rose-400">{error}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Projects</p>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Projects</h1>
          {(currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER") && (
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 dark:bg-slate-700 px-5 py-3 text-sm font-semibold text-white dark:text-white transition hover:bg-slate-800 dark:hover:bg-slate-600"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          )}
        </div>
      </header>

      <div className="flex w-full items-center gap-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 shadow-sm">
        <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 flex-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, description, manager or team…"
          className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition flex-none">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-20 shadow-sm text-center gap-2">
          {query ? (
            <>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No projects match your search.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Try a different name, manager, or team.</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No projects for this organization.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Create a new project to get started.</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginated.map((project) => {
              const overdue      = isOverdue(project.endDate)
              const nearDeadline = isNearDeadline(project.endDate)
              const canModify    = currentUser?.role === "ADMIN" || project.manager?.id === currentUser?.id

              return (
                <div key={project.id} className="relative group rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm transition hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-0.5 duration-150">
                  {canModify && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation()
                          if (mode === "admin") {
                            const orgIdForProject = project.organization?.id
                            if (orgIdForProject) {
                              const [managersData, teamsData] = await Promise.all([
                                getUsersByOrganizationId(orgIdForProject, "MANAGER"),
                                getTeamsByOrganizationId(orgIdForProject),
                              ])
                              setManagers(managersData)
                              setTeams(teamsData)
                            }
                          }
                          setEditProject(project)
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 transition hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(project) }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 transition hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:text-rose-700 dark:hover:text-rose-200"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  <button className="w-full text-left" onClick={() => handleSelect(project)}>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-sm font-bold">
                        {project.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 pr-14">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-tight truncate">{project.name}</h2>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{project.description}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700 mb-4" />

                    <div className="space-y-2.5 mb-4">
                      <div className="flex items-center gap-2.5">
                        <User className="h-3.5 w-3.5 flex-none text-slate-400 dark:text-slate-500" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">Manager</span>
                        <span className="ml-auto text-xs font-medium text-slate-700 dark:text-slate-300">{project.manager?.username ?? "—"}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Calendar className="h-3.5 w-3.5 flex-none text-slate-400 dark:text-slate-500" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">Start date</span>
                        <span className="ml-auto text-xs font-medium text-slate-700 dark:text-slate-300">{formatDateShortMonth(project.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Calendar className="h-3.5 w-3.5 flex-none text-slate-400 dark:text-slate-500" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">End date</span>
                        <span className={`ml-auto text-xs font-medium ${overdue ? "text-rose-600 dark:text-rose-400" : nearDeadline ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-300"}`}>
                          {formatDateShortMonth(project.endDate)}
                          {overdue && <span className="ml-1.5 rounded-full bg-rose-100 dark:bg-rose-950/50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">Overdue</span>}
                          {!overdue && nearDeadline && <span className="ml-1.5 rounded-full bg-amber-100 dark:bg-amber-950/50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">Soon</span>}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700 mb-4" />

                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {project.teams?.length ?? 0} team{(project.teams?.length ?? 0) !== 1 ? "s" : ""}
                      </span>
                      <span className="mx-1 text-slate-200 dark:text-slate-600">·</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {project.workItems?.length ?? 0} work item{(project.workItems?.length ?? 0) !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {(project.teams?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {project.teams!.map((t) => (
                          <span key={t.id} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 pl-1 pr-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[9px] font-semibold flex-none">
                              {getInitials(t.name)}
                            </div>
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

          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>
              Showing {(page - 1) * itemsPerPage + 1}–{Math.min(filtered.length, page * itemsPerPage)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={page === 1}
                className="inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1.5 px-2">
                <span className="text-slate-500 dark:text-slate-400">Page</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={5}
                  value={page}
                  onChange={(e) => {
                    const next = Number(e.target.value.replace(/\D/g, ""))
                    if (!isNaN(next) && e.target.value !== "") {
                      setPage(Math.min(Math.max(1, next), totalPages))
                    } else if (e.target.value === "") {
                      setPage(1)
                    }
                  }}
                  className="h-8 w-10 rounded-2xl border border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800 px-0 text-center text-sm leading-8 text-slate-800 dark:text-slate-200 outline-none appearance-none focus:border-slate-500 dark:focus:border-slate-400 focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600"
                />
                <span className="text-slate-500 dark:text-slate-400">/ {totalPages}</span>
              </div>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
                <ChevronRight className="h-4 w-4" />
              </button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                className="inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {showCreate && (
        <ProjectFormModal
          managers={managers}
          currentUser={currentUser}
          teams={teams}
          orgId={orgId}
          organizations={mode === "admin" ? organizations : []}
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
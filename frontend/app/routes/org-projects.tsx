import React, { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router"
import { ChevronRight, Calendar, User, Users, Search, Plus, X, ChevronDown, AlertCircle, Pencil, Trash2 } from "lucide-react"

const MOCK_USERS = [
  { id: "1", firstName: "Mihai", lastName: "Pop", username: "mihai.pop", role: "DEVELOPER" },
  { id: "2", firstName: "Luke", lastName: "Tomson", username: "luke.tomson", role: "DEVELOPER" },
  { id: "3", firstName: "Ana", lastName: "Serban", username: "ana.serban", role: "DESIGNER" },
  { id: "4", firstName: "Joe", lastName: "Nik", username: "joe.nik", role: "MANAGER" },
  { id: "5", firstName: "Maria", lastName: "Ionescu", username: "maria.ionescu", role: "QA" },
  { id: "6", firstName: "Alex", lastName: "Tudor", username: "alex.tudor", role: "DEVOPS" },
]

// TODO: inlocuire cu userul din Keycloak
const LOGGED_IN_USER = MOCK_USERS[0]

const MOCK_TEAMS = [
  { id: "1", name: "Engineering", projectId: "1" },
  { id: "2", name: "QA", projectId: "1" },
  { id: "3", name: "Design", projectId: "1" },
  { id: "4", name: "Engineering", projectId: "2" },
  { id: "5", name: "DevOps", projectId: "2" },
  { id: "6", name: "Mobile Engineering", projectId: "3" },
  { id: "7", name: "QA", projectId: "3" },
  { id: "8", name: "Design", projectId: "3" },
  { id: "9", name: "Design", projectId: "4" },
  { id: "10", name: "Engineering", projectId: "4" },
]

const PROJECT_TEAMS: Record<string, { name: string; description: string; createdAt: string; organization: string; manager: string; members: string[] }[]> = {
  "1": [
    { name: "Engineering", description: "Frontend delivery and code reviews.", createdAt: "2025-03-01T09:00:00", organization: "Acme Corporation", manager: "Mihai Pop", members: ["Mihai Pop", "Luke Tomson", "Ana Serban", "Joe Nik"] },
    { name: "QA", description: "Manual and automated testing.", createdAt: "2025-03-15T10:30:00", organization: "Acme Corporation", manager: "Maria Ionescu", members: ["Maria Ionescu", "Alex Tudor"] },
    { name: "Design", description: "UI/UX and design system.", createdAt: "2025-04-01T08:00:00", organization: "Acme Corporation", manager: "Ana Serban", members: ["Ana Serban", "Joe Nik"] },
  ],
  "2": [
    { name: "Engineering", description: "Backend services and REST API.", createdAt: "2025-02-10T09:00:00", organization: "TechFlow SRL", manager: "Luke Tomson", members: ["Luke Tomson", "Mihai Pop", "Alex Tudor"] },
    { name: "DevOps", description: "Infrastructure and CI/CD.", createdAt: "2025-02-10T09:00:00", organization: "TechFlow SRL", manager: "Alex Tudor", members: ["Alex Tudor"] },
  ],
  "3": [
    { name: "Mobile Engineering", description: "iOS and Android development.", createdAt: "2025-05-01T11:00:00", organization: "DevSquad", manager: "Joe Nik", members: ["Joe Nik", "Luke Tomson", "Mihai Pop"] },
    { name: "QA", description: "Device-specific testing.", createdAt: "2025-05-10T09:00:00", organization: "DevSquad", manager: "Maria Ionescu", members: ["Maria Ionescu", "Ana Serban"] },
    { name: "Design", description: "Mobile UI and accessibility.", createdAt: "2025-05-15T08:00:00", organization: "DevSquad", manager: "Ana Serban", members: ["Ana Serban"] },
  ],
  "4": [
    { name: "Design", description: "Component library and tokens.", createdAt: "2025-01-20T09:00:00", organization: "Acme Corporation", manager: "Ana Serban", members: ["Ana Serban", "Joe Nik", "Maria Ionescu"] },
    { name: "Engineering", description: "React implementation of design system.", createdAt: "2025-01-20T09:00:00", organization: "Acme Corporation", manager: "Mihai Pop", members: ["Mihai Pop", "Luke Tomson"] },
  ],
}

const INITIAL_PROJECTS = [
  { id: "1", name: "FlowManager Frontend", description: "React frontend application.", startDate: "2026-01-15", endDate: "2026-07-30", manager: "Mihai Pop", managerId: "1", teamIds: ["1", "2", "3"], color: "bg-sky-500" },
  { id: "2", name: "API Gateway", description: "Backend services and REST API.", startDate: "2026-02-01", endDate: "2026-06-15", manager: "Mihai Pop", managerId: "1", teamIds: ["4", "5"], color: "bg-violet-500" },
  { id: "3", name: "Mobile App", description: "iOS and Android client.", startDate: "2026-03-10", endDate: "2026-09-01", manager: "Ana Serban", managerId: "3", teamIds: ["6", "7", "8"], color: "bg-emerald-500" },
  { id: "4", name: "Design System", description: "Shared component library.", startDate: "2026-01-01", endDate: "2026-05-31", manager: "Luke Tomson", managerId: "2", teamIds: ["9", "10"], color: "bg-amber-500" },
]

type Project = typeof INITIAL_PROJECTS[0]

const PROJECT_COLORS = [
  { value: "bg-sky-500", label: "Sky" },
  { value: "bg-violet-500", label: "Violet" },
  { value: "bg-emerald-500", label: "Emerald" },
  { value: "bg-amber-500", label: "Amber" },
  { value: "bg-rose-500", label: "Rose" },
  { value: "bg-slate-500", label: "Slate" },
]

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

function fullName(u: typeof MOCK_USERS[0]) {
  return `${u.firstName} ${u.lastName}`
}


function ManagerPicker({ value, onChange }: {
  value: string
  onChange: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const selected = MOCK_USERS.find((u) => u.id === value)

  return (
  <div ref={ref} className="relative">
    <button
      type="button"
      onClick={() => { setOpen((o) => !o); setSearch("") }}
      className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition hover:border-slate-400"
    >
      {selected ? (
        <>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-semibold flex-none">
            {selected.firstName[0]}{selected.lastName[0]}
          </div>
          <span className="text-slate-700 flex-1 text-left">{fullName(selected)}</span>
          <span className="text-xs text-slate-400">{selected.role}</span>
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
          {search && (
            <button onMouseDown={(e) => { e.preventDefault(); setSearch("") }} className="text-slate-300 hover:text-slate-500">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <ul className="max-h-44 overflow-y-auto">
          {MOCK_USERS.filter((u) =>
            fullName(u).toLowerCase().includes(search.toLowerCase()) ||
            u.role.toLowerCase().includes(search.toLowerCase())
          ).map((u) => {
            const isSelected = u.id === value
            return (
              <li
                key={u.id}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer transition ${isSelected ? "bg-slate-200 text-white hover:bg-slate-200" : "hover:bg-slate-100"}`}
                onMouseDown={(e) => { e.preventDefault(); onChange(u.id); setOpen(false); setSearch("") }}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-semibold flex-none">
                  {u.firstName[0]}{u.lastName[0]}
                </div>
                <span className="text-slate-700 flex-1">{fullName(u)}</span>
                <span className="text-xs text-slate-400">{u.role}</span>
              </li>
            )
          })}
          {MOCK_USERS.filter((u) => fullName(u).toLowerCase().includes(search.toLowerCase()) || u.role.toLowerCase().includes(search.toLowerCase())).length === 0 && (
            <li className="px-3 py-3 text-xs text-slate-400">No users found.</li>
          )}
        </ul>
      </div>
    )}
  </div>
)
}

function TeamsPicker({ projectId, value, onChange }: {
  projectId: string
  value: string[]
  onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const availableTeams = projectId
    ? MOCK_TEAMS.filter((t) => t.projectId === projectId)
    : MOCK_TEAMS

  const toggle = (id: string) =>
    value.includes(id) ? onChange(value.filter((v) => v !== id)) : onChange([...value, id])

  const selectedTeams = MOCK_TEAMS.filter((t) => value.includes(t.id))

  return (
    <div ref={ref} className="relative">
      {selectedTeams.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedTeams.map((t) => (
            <span key={t.id} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 pl-2 pr-1 py-0.5 text-xs text-slate-700">
              {t.name}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); toggle(t.id) }}
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
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition hover:border-slate-400"
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" />
          <span className="text-slate-400">{value.length === 0 ? "Select teams…" : "Add more…"}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>
      {open && (
        <ul className="absolute left-0 z-30 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden max-h-48 overflow-y-auto">
          {availableTeams.length === 0 && (
            <li className="px-3 py-3 text-xs text-slate-400">No teams available</li>
          )}
          {availableTeams.map((t) => {
            const selected = value.includes(t.id)
            return (
              <li
                key={t.id}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer transition hover:bg-slate-50 ${selected ? "bg-slate-50" : ""}`}
                onMouseDown={(e) => { e.preventDefault(); toggle(t.id) }}
              >
                <div className={`h-4 w-4 flex-none rounded border flex items-center justify-center transition-colors ${selected ? "bg-slate-900 border-slate-900" : "border-slate-300 bg-white"}`}>
                  {selected && (
                    <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  )}
                </div>
                <span className="text-slate-700">{t.name}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function ConfirmDeleteModal({ project, onConfirm, onClose }: {
  project: Project
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
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">
            Delete
          </button>
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}


function ProjectFormModal({ initial, onClose, onSave }: {
  initial?: Project
  onClose: () => void
  onSave: (p: Project) => void
}) {
  const isEdit = !!initial
  const [name, setName] = useState(initial?.name ?? "")
  const [description, setDesc] = useState(initial?.description ?? "")
  const [startDate, setStartDate] = useState(initial?.startDate ?? "")
  const [endDate, setEndDate] = useState(initial?.endDate ?? "")
  const [color, setColor] = useState(initial?.color ?? "bg-sky-500")
  const [teamIds, setTeamIds] = useState<string[]>(initial?.teamIds ?? [])
  const [managerId, setManagerId] = useState(initial?.managerId ?? LOGGED_IN_USER.id)

  const nameOk = name.trim() !== ""
  const descOk = description.trim() !== ""
  const startOk = startDate !== ""
  const endOk = endDate !== ""
  const dateRangeOk = !startOk || !endOk || new Date(endDate) >= new Date(startDate)
  const canSave = nameOk && descOk && startOk && endOk && dateRangeOk

  const handleSave = () => {
    if (!canSave) return
    const manager = MOCK_USERS.find((u) => u.id === managerId) ?? MOCK_USERS[0]
    onSave({
      id: initial?.id ?? String(Date.now()),
      name: name.trim(),
      description: description.trim(),
      startDate,
      endDate,
      manager: fullName(manager),
      managerId: manager.id,
      teamIds,
      color,
    })
    onClose()
  }

  const inputCls = (valid: boolean) =>
    `w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
      valid
        ? "border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-slate-200"
        : "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
    }`

  const loggedInUser = MOCK_USERS.find((u) => u.id === LOGGED_IN_USER.id)!

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

          {/* Name */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Name <span className={nameOk ? "text-slate-300" : "text-rose-500"}>*</span>
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. FlowManager Frontend…" className={inputCls(nameOk)} />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Description <span className={descOk ? "text-slate-300" : "text-rose-500"}>*</span>
            </label>
            <textarea value={description} onChange={(e) => setDesc(e.target.value)} rows={3}
              placeholder="What is this project about?"
              className={inputCls(descOk) + " resize-none"} />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Start Date <span className={startOk ? "text-slate-300" : "text-rose-500"}>*</span>
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full rounded-xl border bg-white pl-9 pr-3 py-2.5 text-sm text-slate-700 outline-none transition focus:ring-2 ${
                    startOk ? "border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-slate-200"
                            : "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                  }`} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                End Date <span className={endOk ? "text-slate-300" : "text-rose-500"}>*</span>
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full rounded-xl border bg-white pl-9 pr-3 py-2.5 text-sm text-slate-700 outline-none transition focus:ring-2 ${
                    endOk ? "border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-slate-200"
                          : "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                  }`} />
              </div>
            </div>
          </div>

          {startOk && endOk && !dateRangeOk && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 flex-none" />
              End date must be after start date.
            </div>
          )}

          {/* Manager */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Manager</label>

            {isEdit ? (
              <ManagerPicker value={managerId} onChange={setManagerId} />
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 cursor-not-allowed">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-semibold flex-none">
                  {loggedInUser.firstName[0]}{loggedInUser.lastName[0]}
                </div>
                <span className="text-sm text-slate-600">{fullName(loggedInUser)}</span>
                <span className="ml-auto text-xs text-slate-400">{loggedInUser.role}</span>
              </div>
            )}
          </div>

          {/* Teams */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Teams</label>
            <TeamsPicker
              projectId={initial?.id ?? ""}
              value={teamIds}
              onChange={setTeamIds}
            />
          </div>

          {/* Color */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Color</label>
            <div className="flex gap-2">
              {PROJECT_COLORS.map((c) => (
                <button key={c.value} type="button" onClick={() => setColor(c.value)}
                  className={`h-7 w-7 rounded-full ${c.value} transition ring-offset-2 ${color === c.value ? "ring-2 ring-slate-700" : "hover:ring-2 hover:ring-slate-300"}`}
                  title={c.label} />
              ))}
            </div>
          </div>

          {!canSave && dateRangeOk && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700">
              <AlertCircle className="h-4 w-4 flex-none" />
              Name, description and both dates are required.
            </div>
          )}
        </div>

        <div className="flex gap-2 px-6 pb-6 pt-4 border-t border-slate-100">
          <button onClick={handleSave} disabled={!canSave}
            className="flex-1 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed">
            {isEdit ? "Save Changes" : "Create Project"}
          </button>
          <button onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}


export default function Projects() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState(INITIAL_PROJECTS)
  const [query, setQuery] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [deleteProject, setDeleteProject] = useState<Project | null>(null)
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)

  useEffect(() => {
    setSelectedOrgId(localStorage.getItem("selectedOrg"))
  }, [])

  const MOCK_ORGS_MAP = [
    { id: "1", name: "Acme Corporation" },
    { id: "2", name: "TechFlow SRL" },
    { id: "3", name: "DevSquad" },
  ]

  const loggedInOrg = MOCK_ORGS_MAP.find((o) => o.id === selectedOrgId)?.name

  const filtered = projects.filter((p) => {
    const q = query.toLowerCase()
    const teams = PROJECT_TEAMS[p.id] ?? []
    const matchesOrg = selectedOrgId
      ? (PROJECT_TEAMS[p.id] ?? []).some((t) => t.organization === loggedInOrg)
      : true
    return (
      matchesOrg && (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.manager.toLowerCase().includes(q) ||
        teams.some((t) => t.name.toLowerCase().includes(q))
      )
    )
  })

  const handleSelect = (project: Project) => {
  localStorage.setItem("selectedProject", project.id)
  localStorage.setItem("selectedProjectName", project.name)
  navigate("/dashboard")
}

  const handleCreate = (p: Project) => setProjects((prev) => [...prev, p])
  const handleEdit = (p: Project) => setProjects((prev) => prev.map((x) => x.id === p.id ? p : x))
  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    if (localStorage.getItem("selectedProject") === id) {
      localStorage.removeItem("selectedProject")
      localStorage.removeItem("selectedProjectName")
    }
    setDeleteProject(null)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Projects</p>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-slate-900">Project portfolio</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
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
            const overdue = isOverdue(project.endDate)
            const nearDeadline = isNearDeadline(project.endDate)
            const teams = PROJECT_TEAMS[project.id] ?? []
            const totalMembers = [...new Set(teams.flatMap((t) => t.members))].length
            const selectedTeamNames = MOCK_TEAMS.filter((t) => project.teamIds.includes(t.id)).map((t) => t.name)

            return (
              <div key={project.id} className="relative group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 duration-150">

                {/* Edit + Delete */}
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditProject(project) }}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteProject(project) }}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-rose-100 bg-white text-rose-400 transition hover:bg-rose-50 hover:text-rose-600"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button className="w-full text-left" onClick={() => handleSelect(project)}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`flex h-10 w-10 flex-none items-center justify-center rounded-2xl ${project.color} text-white text-xs font-bold`}>
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
                      <span className="ml-auto text-xs font-medium text-slate-700">{project.manager}</span>
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
                        {overdue && <span className="ml-1.5 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600">Overdue</span>}
                        {!overdue && nearDeadline && <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">Soon</span>}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 mb-4" />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs text-slate-500">{teams.length} team{teams.length !== 1 ? "s" : ""}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500">{totalMembers} member{totalMembers !== 1 ? "s" : ""}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        Open <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTeamNames.length > 0 ? selectedTeamNames.map((name) => (
                        <span key={name} className="inline-flex items-center rounded-lg bg-slate-50 border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600">
                          {name}
                        </span>
                      )) : teams.map((team) => (
                        <span key={team.name} className="inline-flex items-center rounded-lg bg-slate-50 border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600">
                          {team.name}
                        </span>
                      ))}
                      {teams.length === 0 && selectedTeamNames.length === 0 && (
                        <span className="text-xs text-slate-400 italic">No teams yet</span>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {showCreate && <ProjectFormModal onClose={() => setShowCreate(false)} onSave={handleCreate} />}
      {editProject && <ProjectFormModal initial={editProject} onClose={() => setEditProject(null)} onSave={handleEdit} />}
      {deleteProject && (
        <ConfirmDeleteModal
          project={deleteProject}
          onConfirm={() => handleDelete(deleteProject.id)}
          onClose={() => setDeleteProject(null)}
        />
      )}
    </div>
  )
}

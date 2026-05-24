import React, { useEffect, useRef, useState } from "react"
import { User, Calendar, Building2, Users, Search, X, Plus, Pencil, Trash2, ChevronDown, AlertCircle } from "lucide-react"

const MOCK_USERS = [
  { id: "1", firstName: "Mihai", lastName: "Pop", username: "mihai.pop", role: "DEVELOPER", organization: "Acme Corporation" },
  { id: "2", firstName: "Luke", lastName: "Tomson", username: "luke.tomson", role: "DEVELOPER", organization: "TechFlow SRL" },
  { id: "3", firstName: "Ana", lastName: "Serban", username: "ana.serban", role: "DESIGNER", organization: "Acme Corporation" },
  { id: "4", firstName: "Joe", lastName: "Nik", username: "joe.nik", role: "MANAGER", organization: "DevSquad" },
  { id: "5", firstName: "Maria", lastName: "Ionescu", username: "maria.ionescu", role: "QA", organization: "Acme Corporation" },
  { id: "6", firstName: "Alex", lastName: "Tudor", username: "alex.tudor", role: "DEVOPS", organization: "TechFlow SRL" },
]

const LOGGED_IN_USER = MOCK_USERS[0]

const MOCK_ORGS: Record<string, string> = {
  "1": "Acme Corporation",
  "2": "TechFlow SRL",
  "3": "DevSquad",
}

const INITIAL_TEAMS = [
  { id: "1", name: "Engineering", description: "Frontend delivery and code reviews.", createdAt: "2025-03-01T09:00:00", organization: "Acme Corporation", manager: "Mihai Pop", managerId: "1", members: ["Mihai Pop", "Luke Tomson", "Ana Serban", "Joe Nik"] },
  { id: "2", name: "QA", description: "Manual and automated testing.", createdAt: "2025-03-15T10:30:00", organization: "Acme Corporation", manager: "Maria Ionescu", managerId: "5", members: ["Maria Ionescu", "Alex Tudor"] },
  { id: "3", name: "Design", description: "UI/UX and design system.", createdAt: "2025-04-01T08:00:00", organization: "Acme Corporation", manager: "Ana Serban", managerId: "3", members: ["Ana Serban", "Joe Nik"] },
  { id: "4", name: "Engineering", description: "Backend services and REST API.", createdAt: "2025-02-10T09:00:00", organization: "TechFlow SRL", manager: "Luke Tomson", managerId: "2", members: ["Luke Tomson", "Mihai Pop", "Alex Tudor"] },
  { id: "5", name: "DevOps", description: "Infrastructure and CI/CD.", createdAt: "2025-02-10T09:00:00", organization: "TechFlow SRL", manager: "Alex Tudor", managerId: "6", members: ["Alex Tudor"] },
  { id: "6", name: "Mobile Engineering", description: "iOS and Android development.", createdAt: "2025-05-01T11:00:00", organization: "DevSquad", manager: "Joe Nik", managerId: "4", members: ["Joe Nik", "Luke Tomson", "Mihai Pop"] },
  { id: "7", name: "QA", description: "Device-specific testing.", createdAt: "2025-05-10T09:00:00", organization: "DevSquad", manager: "Maria Ionescu", managerId: "5", members: ["Maria Ionescu", "Ana Serban"] },
  { id: "8", name: "Design", description: "Mobile UI and accessibility.", createdAt: "2025-05-15T08:00:00", organization: "DevSquad", manager: "Ana Serban", managerId: "3", members: ["Ana Serban"] },
  { id: "9", name: "Design", description: "Component library and tokens.", createdAt: "2025-01-20T09:00:00", organization: "Acme Corporation", manager: "Ana Serban", managerId: "3", members: ["Ana Serban", "Joe Nik", "Maria Ionescu"] },
  { id: "10", name: "Engineering", description: "React implementation of design system.", createdAt: "2025-01-20T09:00:00", organization: "Acme Corporation", manager: "Mihai Pop", managerId: "1", members: ["Mihai Pop", "Luke Tomson"] },
]

type Team = typeof INITIAL_TEAMS[0]

function fullName(u: typeof MOCK_USERS[0]) {
  return `${u.firstName} ${u.lastName}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ro-RO", { day: "2-digit", month: "short", year: "numeric" })
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase()
}


function MembersPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const toggle = (name: string) =>
    value.includes(name) ? onChange(value.filter((v) => v !== name)) : onChange([...value, name])

  const allNames = MOCK_USERS.map(fullName)

  return (
    <div ref={ref} className="relative">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map((m) => (
            <span key={m} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 pl-2 pr-1 py-0.5 text-xs text-slate-700">
              {m}
              <button type="button" onMouseDown={(e) => { e.preventDefault(); toggle(m) }} className="ml-0.5 text-slate-400 hover:text-slate-600">
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
          <span className="text-slate-400">{value.length === 0 ? "Select members…" : "Add more…"}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>
      {open && (
        <ul className="absolute left-0 z-30 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden max-h-48 overflow-y-auto">
          {allNames.map((name) => {
            const selected = value.includes(name)
            return (
              <li key={name}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer transition hover:bg-slate-50 ${selected ? "bg-slate-50" : ""}`}
                onMouseDown={(e) => { e.preventDefault(); toggle(name) }}
              >
                <div className={`h-4 w-4 flex-none rounded border flex items-center justify-center transition-colors ${selected ? "bg-slate-900 border-slate-900" : "border-slate-300 bg-white"}`}>
                  {selected && (
                    <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  )}
                </div>
                <span className="text-slate-700">{name}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}


function ManagerPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const selected = MOCK_USERS.find((u) => u.id === value)

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => { setOpen((o) => !o); setSearch("") }}
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
            <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…" className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" />
          </div>
          <ul className="max-h-44 overflow-y-auto">
            {MOCK_USERS.filter((u) => fullName(u).toLowerCase().includes(search.toLowerCase())).map((u) => (
              <li key={u.id}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer transition ${u.id === value ? "bg-slate-200 text-black" : "hover:bg-slate-100"}`}
                onMouseDown={(e) => { e.preventDefault(); onChange(u.id); setOpen(false) }}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-semibold flex-none">
                  {u.firstName[0]}{u.lastName[0]}
                </div>
                <span className="flex-1">{fullName(u)}</span>
                <span className="text-xs opacity-60">{u.role}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}


function ConfirmDeleteModal({ team, onConfirm, onClose }: { team: Team; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-slate-200 bg-white shadow-2xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100">
            <Trash2 className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Delete team</h2>
            <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete <span className="font-semibold text-slate-900">"{team.name}"</span>?
        </p>
        <div className="flex gap-2">
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700">Delete</button>
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
        </div>
      </div>
    </div>
  )
}


function TeamFormModal({ initial, orgName, onClose, onSave }: {
  initial?: Team; orgName: string; onClose: () => void; onSave: (t: Team) => void
}) {
  const isEdit = !!initial
  const [name, setName] = useState(initial?.name ?? "")
  const [description, setDesc] = useState(initial?.description ?? "")
  const [managerId, setManagerId] = useState(initial?.managerId ?? LOGGED_IN_USER.id)
  const [members, setMembers] = useState<string[]>(initial?.members ?? [])

  const nameOk = name.trim() !== ""
  const descOk = description.trim() !== ""
  const canSave = nameOk && descOk

  const handleSave = () => {
    if (!canSave) return
    const manager = MOCK_USERS.find((u) => u.id === managerId) ?? MOCK_USERS[0]
    onSave({
      id: initial?.id ?? String(Date.now()),
      name: name.trim(),
      description: description.trim(),
      organization: orgName,
      manager: fullName(manager),
      managerId: manager.id,
      members,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    })
    onClose()
  }

  const inputCls = (valid: boolean) =>
    `w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
      valid ? "border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-slate-200"
            : "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{isEdit ? "Edit Team" : "Create Team"}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{isEdit ? "Update the team details." : "Fill in the details to create a new team."}</p>
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
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Engineering…" className={inputCls(nameOk)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Description <span className={descOk ? "text-slate-300" : "text-rose-500"}>*</span>
            </label>
            <textarea value={description} onChange={(e) => setDesc(e.target.value)} rows={3}
              placeholder="What does this team do?" className={inputCls(descOk) + " resize-none"} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Organization</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 cursor-not-allowed">
              <Building2 className="h-4 w-4 text-slate-400 flex-none" />
              <span className="text-sm text-slate-600">{orgName}</span>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Manager</label>
            {isEdit ? (
              <ManagerPicker value={managerId} onChange={setManagerId} />
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 cursor-not-allowed">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-semibold flex-none">
                  {LOGGED_IN_USER.firstName[0]}{LOGGED_IN_USER.lastName[0]}
                </div>
                <span className="text-sm text-slate-600">{fullName(LOGGED_IN_USER)}</span>
                <span className="ml-auto text-xs text-slate-400">{LOGGED_IN_USER.role}</span>
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Members</label>
            <MembersPicker value={members} onChange={setMembers} />
          </div>
          {!canSave && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700">
              <AlertCircle className="h-4 w-4 flex-none" />
              Name and description are required.
            </div>
          )}
        </div>

        <div className="flex gap-2 px-6 pb-6 pt-4 border-t border-slate-100">
          <button onClick={handleSave} disabled={!canSave}
            className="flex-1 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed">
            {isEdit ? "Save Changes" : "Create Team"}
          </button>
          <button onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OrgTeams() {
  const [teams, setTeams] = useState(INITIAL_TEAMS)
  const [orgName, setOrgName] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [editTeam, setEditTeam] = useState<Team | null>(null)
  const [deleteTeam, setDeleteTeam] = useState<Team | null>(null)

  useEffect(() => {
    const id = localStorage.getItem("selectedOrg")
    if (id) setOrgName(MOCK_ORGS[id] ?? null)
  }, [])

  const orgTeams = orgName ? teams.filter((t) => t.organization === orgName) : []

  const filtered = orgTeams.filter((t) => {
    const q = query.toLowerCase()
    return (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.manager.toLowerCase().includes(q) ||
      t.members.some((m) => m.toLowerCase().includes(q))
    )
  })

  const handleCreate = (t: Team) => setTeams((prev) => [...prev, t])
  const handleEdit = (t: Team) => setTeams((prev) => prev.map((x) => x.id === t.id ? t : x))
  const handleDelete = (id: string) => { setTeams((prev) => prev.filter((t) => t.id !== id)); setDeleteTeam(null) }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Teams</p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Teams</h1>
            {orgName && (
              <p className="text-sm leading-6 text-slate-500 mt-0.5">
                All teams in <span className="font-medium text-slate-700">{orgName}</span>
              </p>
            )}
          </div>
          <button onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            <Plus className="h-4 w-4" />
            New Team
          </button>
        </div>
      </header>

      <div className="flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <Search className="h-5 w-5 text-slate-400 flex-none" />
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, manager or member…"
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" />
        {query && (
          <button onClick={() => setQuery("")} className="text-slate-300 hover:text-slate-500 transition flex-none">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {orgTeams.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 shadow-sm text-center gap-2">
          <p className="text-sm font-medium text-slate-600">No teams found for this organization.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 shadow-sm text-center gap-2">
          <p className="text-sm font-medium text-slate-600">No teams match your search.</p>
          <p className="text-xs text-slate-400">Try a different name, manager, or member.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((team) => (
            <div key={team.id} className="relative group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 duration-150 space-y-4">

              <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditTeam(team)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 hover:text-slate-700" title="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setDeleteTeam(team)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-rose-100 bg-white text-rose-400 transition hover:bg-rose-50 hover:text-rose-600" title="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="pr-14">
                <h2 className="text-base font-semibold text-slate-900">{team.name}</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{team.description}</p>
              </div>
              <div className="border-t border-slate-100" />
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-3.5 w-3.5 flex-none text-slate-400" />
                  <span className="text-xs text-slate-500">Organization</span>
                  <span className="ml-auto text-xs font-medium text-slate-700">{team.organization}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <User className="h-3.5 w-3.5 flex-none text-slate-400" />
                  <span className="text-xs text-slate-500">Manager</span>
                  <span className="ml-auto text-xs font-medium text-slate-700">{team.manager}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-3.5 w-3.5 flex-none text-slate-400" />
                  <span className="text-xs text-slate-500">Created</span>
                  <span className="ml-auto text-xs font-medium text-slate-700">{formatDate(team.createdAt)}</span>
                </div>
              </div>
              <div className="border-t border-slate-100" />
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500">{team.members.length} member{team.members.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {team.members.map((member) => (
                    <div key={member} className="flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 pl-1 pr-2.5 py-1">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-[9px] font-semibold flex-none">
                        {initials(member)}
                      </div>
                      <span className="text-xs text-slate-600">{member}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && orgName && <TeamFormModal orgName={orgName} onClose={() => setShowCreate(false)} onSave={handleCreate} />}
      {editTeam && orgName && <TeamFormModal initial={editTeam} orgName={orgName} onClose={() => setEditTeam(null)} onSave={handleEdit} />}
      {deleteTeam && <ConfirmDeleteModal team={deleteTeam} onConfirm={() => handleDelete(deleteTeam.id)} onClose={() => setDeleteTeam(null)} />}
    </div>
  )
}
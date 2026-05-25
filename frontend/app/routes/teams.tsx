import React, { useState, useRef, useEffect } from "react"
import { Users, Search, Plus, X, ChevronDown, Pencil, Trash2, AlertCircle, User, Building2 } from "lucide-react"

const MOCK_USERS = [
  { id: "1", firstName: "Mihai", lastName: "Pop", username: "mihai.pop", role: "DEVELOPER", organization: "Acme Corporation", email: "mihai.pop@acme.com", phone: "+40 721 234 567" },
  { id: "2", firstName: "Luke", lastName: "Tomson", username: "luke.tomson", role: "DEVELOPER", organization: "TechFlow SRL", email: "luke.tomson@techflow.com", phone: "+40 722 345 678" },
  { id: "3", firstName: "Ana", lastName: "Serban", username: "ana.serban", role: "DESIGNER", organization: "Acme Corporation", email: "ana.serban@acme.com", phone: "+40 723 456 789" },
  { id: "4", firstName: "Joe", lastName: "Nik", username: "joe.nik", role: "MANAGER", organization: "DevSquad", email: "joe.nik@devsquad.com", phone: "+40 724 567 890" },
  { id: "5", firstName: "Maria", lastName: "Ionescu", username: "maria.ionescu", role: "QA", organization: "Acme Corporation", email: "maria.ionescu@acme.com", phone: "+40 725 678 901" },
  { id: "6", firstName: "Alex", lastName: "Tudor", username: "alex.tudor", role: "DEVOPS", organization: "TechFlow SRL", email: "alex.tudor@techflow.com", phone: "+40 726 789 012" },
]

// TODO: inlocuire cu userul din Keycloak
const LOGGED_IN_USER = MOCK_USERS[0]

const ORGANIZATIONS = [...new Set(MOCK_USERS.map((u) => u.organization))]

const INITIAL_TEAMS = [
  { id: "1", name: "Engineering", description: "Frontend delivery and code reviews.", organization: "Acme Corporation", manager: "Mihai Pop", managerId: "1", projectId: "1", createdAt: "2025-03-01T09:00:00", memberIds: ["1", "2", "3", "4"] },
  { id: "2", name: "QA", description: "Manual and automated testing.", organization: "Acme Corporation", manager: "Maria Ionescu", managerId: "5", projectId: "1", createdAt: "2025-03-15T10:30:00", memberIds: ["5", "6"] },
  { id: "3", name: "Design", description: "UI/UX and design system.", organization: "Acme Corporation", manager: "Ana Serban", managerId: "3", projectId: "1", createdAt: "2025-04-01T08:00:00", memberIds: ["3", "4"] },
  { id: "4", name: "Engineering", description: "Backend services and REST API.", organization: "TechFlow SRL", manager: "Luke Tomson", managerId: "2", projectId: "2", createdAt: "2025-02-10T09:00:00", memberIds: ["2", "1", "6"] },
  { id: "5", name: "DevOps", description: "Infrastructure and CI/CD.", organization: "TechFlow SRL", manager: "Alex Tudor", managerId: "6", projectId: "2", createdAt: "2025-02-10T09:00:00", memberIds: ["6"] },
  { id: "6", name: "Mobile Engineering", description: "iOS and Android development.", organization: "DevSquad", manager: "Joe Nik", managerId: "4", projectId: "3", createdAt: "2025-05-01T11:00:00", memberIds: ["4", "2", "1"] },
  { id: "7", name: "QA", description: "Device-specific testing.", organization: "DevSquad", manager: "Maria Ionescu", managerId: "5", projectId: "3", createdAt: "2025-05-10T09:00:00", memberIds: ["5", "3"] },
  { id: "8", name: "Design", description: "Mobile UI and accessibility.", organization: "DevSquad", manager: "Ana Serban", managerId: "3", projectId: "3", createdAt: "2025-05-15T08:00:00", memberIds: ["3"] },
]

type Team = typeof INITIAL_TEAMS[0]

function fullName(u: typeof MOCK_USERS[0]) {
  return `${u.firstName} ${u.lastName}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ro-RO", { day: "2-digit", month: "short", year: "numeric" })
}


function SearchablePicker({ value, placeholder, options, renderOption, renderSelected, onSelect }: {
  value: string
  placeholder: string
  options: { id: string }[]
  renderOption: (item: any, isSelected: boolean) => React.ReactNode
  renderSelected: (item: any) => React.ReactNode
  onSelect: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const selected = options.find((o) => o.id === value)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSearch("") }}
        className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition hover:border-slate-400"
      >
        {selected ? renderSelected(selected) : <span className="text-slate-400 flex-1 text-left">{placeholder}</span>}
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
            {options
              .filter((o: any) => {
                const text = [
                  o.label,
                  o.firstName && o.lastName ? `${o.firstName} ${o.lastName}` : null,
                  o.username,
                  o.name,
                  o.role,
                ].filter(Boolean).join(" ").toLowerCase()
                return text.includes(search.toLowerCase())
              })
              .map((o) => {
                const isSelected = o.id === value
                return (
                  <li
                    key={o.id}
                    className={`cursor-pointer transition ${isSelected ? "bg-slate-200 hover:bg-slate-300" : "hover:bg-slate-100"}`}
                    onMouseDown={(e) => { e.preventDefault(); onSelect(o.id); setOpen(false); setSearch("") }}
                  >
                    {renderOption(o, isSelected)}
                  </li>
                )
              })}
            {options.filter((o: any) => {
              const text = [
                o.label,
                o.firstName && o.lastName ? `${o.firstName} ${o.lastName}` : null,
                o.username,
                o.name,
                o.role,
              ].filter(Boolean).join(" ").toLowerCase()
              return text.includes(search.toLowerCase())
            }).length === 0 && (
              <li className="px-3 py-3 text-xs text-slate-400">No results found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

function ConfirmDeleteModal({ team, onConfirm, onClose }: {
  team: Team
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
            <h2 className="text-base font-semibold text-slate-900">Delete team</h2>
            <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete <span className="font-semibold text-slate-900">"{team.name}"</span>?
        </p>
        <div className="flex gap-2">
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">
            Delete
          </button>
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function MemberPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setSearch("") } }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const filtered = MOCK_USERS.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.username} ${u.role}`.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (id: string) =>
    value.includes(id) ? onChange(value.filter((v) => v !== id)) : onChange([...value, id])

  const selectedUsers = MOCK_USERS.filter((u) => value.includes(u.id))

  return (
    <div ref={ref} className="relative">
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedUsers.map((u) => (
            <span key={u.id} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 pl-1.5 pr-1 py-0.5 text-xs text-slate-700">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-[9px] font-semibold flex-none">
                {u.firstName[0]}{u.lastName[0]}
              </div>
              {u.firstName} {u.lastName}
              <button type="button" onMouseDown={(e) => { e.preventDefault(); toggle(u.id) }} className="ml-0.5 text-slate-400 hover:text-slate-600">
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
          <span className="text-slate-400">{value.length === 0 ? "Add members…" : "Add more…"}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>
      {open && (
        <div className="absolute left-0 z-30 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 text-slate-400 flex-none" />
              <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="w-full bg-transparent text-xs text-slate-700 outline-none" />
            </div>
          </div>
          <ul className="max-h-44 overflow-auto">
            {filtered.map((u) => {
              const selected = value.includes(u.id)
              return (
                <li key={u.id}
                  className={`flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer transition hover:bg-slate-50 ${selected ? "bg-slate-50" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); toggle(u.id) }}
                >
                  <div className={`h-4 w-4 flex-none rounded border flex items-center justify-center transition-colors ${selected ? "bg-slate-900 border-slate-900" : "border-slate-300 bg-white"}`}>
                    {selected && <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5" /></svg>}
                  </div>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-semibold flex-none">
                    {u.firstName[0]}{u.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-slate-700">{u.firstName} {u.lastName}</div>
                    <div className="text-xs text-slate-400">{u.role}</div>
                  </div>
                </li>
              )
            })}
            {filtered.length === 0 && <li className="px-3 py-3 text-xs text-slate-400">No results</li>}
          </ul>
        </div>
      )}
    </div>
  )
}

function TeamFormModal({ initial, onClose, onSave }: {
  initial?: Team
  onClose: () => void
  onSave: (t: Team) => void
}) {
  const isEdit = !!initial
  const [name, setName] = useState(initial?.name ?? "")
  const [description, setDesc] = useState(initial?.description ?? "")
  const [managerId, setManagerId] = useState(initial?.managerId ?? LOGGED_IN_USER.id)
  const [organization, setOrganization] = useState(initial?.organization ?? LOGGED_IN_USER.organization)
  const [memberIds, setMemberIds] = useState<string[]>(initial?.memberIds ?? [])

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
      organization,
      manager: fullName(manager),
      managerId: manager.id,
      memberIds,
      projectId: initial?.projectId ?? "",
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    })
    onClose()
  }

  const inputCls = (valid: boolean) =>
    `w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
      valid
        ? "border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-slate-200"
        : "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
    }`

  const orgOptions = ORGANIZATIONS.map((o) => ({ id: o, label: o }))

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

          {/* Name */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Name <span className={nameOk ? "text-slate-300" : "text-rose-500"}>*</span>
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Engineering…" className={inputCls(nameOk)} />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Description <span className={descOk ? "text-slate-300" : "text-rose-500"}>*</span>
            </label>
            <textarea value={description} onChange={(e) => setDesc(e.target.value)} rows={3}
              placeholder="What does this team do?"
              className={inputCls(descOk) + " resize-none"} />
          </div>

          {/* Manager */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Manager</label>
            {isEdit ? (
              <SearchablePicker
                value={managerId}
                placeholder="Select manager…"
                options={MOCK_USERS}
                renderSelected={(u) => (
                  <>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-semibold flex-none">
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <span className="text-slate-700 flex-1 text-left">{fullName(u)}</span>
                    <span className="text-xs text-slate-400">{u.role}</span>
                  </>
                )}
                renderOption={(u, isSelected) => (
                  <div className="flex items-center gap-2.5 px-3 py-2.5 text-sm">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold flex-none ${isSelected ? "bg-blue-100 border-blue-200 text-blue-900" : "bg-blue-100 text-blue-900 border-blue-200"}`}>
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <span className={`flex-1 ${isSelected ? "text-slate-900" : "text-slate-700"}`}>{fullName(u)}</span>
                    <span className={`text-xs ${isSelected ? "text-slate-500" : "text-slate-400"}`}>{u.role}</span>
                  </div>
                )}
                onSelect={setManagerId}
              />
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

          {/* Organization */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Organization</label>
            {isEdit ? (
              <SearchablePicker
                value={organization}
                placeholder="Select organization…"
                options={orgOptions}
                renderSelected={(o) => (
                  <>
                    <Building2 className="h-4 w-4 text-slate-400 flex-none" />
                    <span className="text-slate-700 flex-1 text-left">{o.label}</span>
                  </>
                )}
                renderOption={(o, isSelected) => (
                  <div className="flex items-center gap-2.5 px-3 py-2.5 text-sm">
                    <Building2 className={`h-4 w-4 flex-none ${isSelected ? "text-white/70" : "text-slate-400"}`} />
                    <span className={isSelected ? "text-white" : "text-slate-700"}>{o.label}</span>
                  </div>
                )}
                onSelect={setOrganization}
              />
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 cursor-not-allowed">
                <Building2 className="h-4 w-4 text-slate-400 flex-none" />
                <span className="text-sm text-slate-600">{LOGGED_IN_USER.organization}</span>
              </div>
            )}
          </div>

          {/* Members */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Members
            </label>
            <MemberPicker value={memberIds} onChange={setMemberIds} />
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

function UserProfileModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const user = MOCK_USERS.find((u) => u.id === userId)
  if (!user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-slate-200 bg-white shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-900">User Profile</h2>
          <button onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3 mb-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-900 border border-blue-200 text-xl font-semibold">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-slate-900">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-slate-400">{user.role}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5">
            <User className="h-4 w-4 text-slate-400 flex-none" />
            <span className="text-xs text-slate-500 w-20">Username</span>
            <span className="text-sm font-medium text-slate-700">{user.username}</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5">
            <Building2 className="h-4 w-4 text-slate-400 flex-none" />
            <span className="text-xs text-slate-500 w-20">Organization</span>
            <span className="text-sm font-medium text-slate-700">{user.organization}</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5">
            <Users className="h-4 w-4 text-slate-400 flex-none" />
            <span className="text-xs text-slate-500 w-20">Role</span>
            <span className="text-sm font-medium text-slate-700">{user.role}</span>
          </div>

          {/*Email */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5">
            <svg className="h-4 w-4 text-slate-400 flex-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-slate-500 w-20">Email</span>
            <span className="text-sm font-medium text-slate-700 truncate">{user.email}</span>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5">
            <svg className="h-4 w-4 text-slate-400 flex-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-xs text-slate-500 w-20">Phone</span>
            <span className="text-sm font-medium text-slate-700">{user.phone}</span>
          </div>
        </div>
      </div>
    </div>
  )
}


function TeamDetailModal({ team, onClose, onEditUser }: {
  team: Team
  onClose: () => void
  onEditUser: (userId: string) => void
}) {
  const members = MOCK_USERS.filter((u) => team.memberIds.includes(u.id))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{team.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{team.description}</p>
          </div>
          <button onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-5">

          {/* Details */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5">
              <User className="h-4 w-4 text-slate-400 flex-none" />
              <span className="text-xs text-slate-500 w-24">Manager</span>
              <button
                onClick={() => {
                  const mgr = MOCK_USERS.find((u) => u.id === team.managerId)
                  if (mgr) onEditUser(mgr.id)
                }}
                className="ml-auto text-sm font-medium text-slate-700 hover:text-slate-900 hover:underline transition"
              >
                {team.manager}
              </button>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5">
              <Building2 className="h-4 w-4 text-slate-400 flex-none" />
              <span className="text-xs text-slate-500 w-24">Organization</span>
              <span className="ml-auto text-sm font-medium text-slate-700">{team.organization}</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5">
              <Users className="h-4 w-4 text-slate-400 flex-none" />
              <span className="text-xs text-slate-500 w-24">Created</span>
              <span className="ml-auto text-sm font-medium text-slate-700">{formatDate(team.createdAt)}</span>
            </div>
          </div>

          {/* Members */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-3">
              Members ({members.length})
            </p>
            <div className="space-y-2">
              {members.map((u) => (
                <button
                  key={u.id}
                  onClick={() => onEditUser(u.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left transition hover:bg-slate-50 hover:border-slate-300"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-xs font-semibold flex-none">
                    {u.firstName[0]}{u.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-slate-400">{u.role}</p>
                  </div>
                  <span className="text-xs text-slate-300">View →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export default function Teams() {
  const [teams, setTeams] = useState(INITIAL_TEAMS)
  const [query, setQuery] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [editTeam, setEditTeam] = useState<Team | null>(null)
  const [deleteTeam, setDeleteTeam] = useState<Team | null>(null)
  const [viewTeam, setViewTeam]   = useState<Team | null>(null)
  const [viewUser, setViewUser]   = useState<string | null>(null)

  const selectedProjectId = localStorage.getItem("selectedProject")

  const filtered = teams.filter((t) => {
    const q = query.toLowerCase()
    const matchesProject = t.projectId === selectedProjectId
      return (
        matchesProject &&
        (
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.manager.toLowerCase().includes(q) ||
          t.organization.toLowerCase().includes(q)
        )
      )
  })

  const handleCreate = (t: Team) => setTeams((prev) => [...prev, t])
  const handleEdit = (t: Team) => setTeams((prev) => prev.map((x) => x.id === t.id ? t : x))
  const handleDelete = (id: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== id))
    setDeleteTeam(null)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Teams</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">All teams</h1>
            <p className="text-sm leading-6 text-slate-600">Manage and review all teams for this project.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            New Team
          </button>
        </div>
      </header>

      <div className="flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <Search className="h-5 w-5 text-slate-400 flex-none" />
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, description, manager or organization…"
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" />
        {query && (
          <button onClick={() => setQuery("")} className="text-slate-300 hover:text-slate-500 transition flex-none">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 shadow-sm text-center gap-2">
          <p className="text-sm font-medium text-slate-600">No teams match your search.</p>
          <p className="text-xs text-slate-400">Try a different name, manager, or organization.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((team) => (
            <div key={team.id} onClick={() => setViewTeam(team)} className="relative group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 duration-150">

              {/* Edit + Delete */}
              <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditTeam(team) }}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteTeam(team) }}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-rose-100 bg-white text-rose-400 transition hover:bg-rose-50 hover:text-rose-600"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mb-4 pr-14">
                <h2 className="text-base font-semibold text-slate-900 leading-tight truncate">{team.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{team.description}</p>
              </div>

              <div className="border-t border-slate-100 mb-4" />

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <User className="h-3.5 w-3.5 flex-none text-slate-400" />
                  <span className="text-xs text-slate-500">Manager</span>
                  <span className="ml-auto text-xs font-medium text-slate-700">{team.manager}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-3.5 w-3.5 flex-none text-slate-400" />
                  <span className="text-xs text-slate-500">Organization</span>
                  <span className="ml-auto text-xs font-medium text-slate-700">{team.organization}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Users className="h-3.5 w-3.5 flex-none text-slate-400" />
                  <span className="text-xs text-slate-500">Created</span>
                  <span className="ml-auto text-xs font-medium text-slate-700">{formatDate(team.createdAt)}</span>
                </div>
              </div>
              {team.memberIds && team.memberIds.length > 0 && (
                  <>
                    <div className="border-t border-slate-100 my-3" />
                    <div className="flex flex-wrap gap-1.5">
                      {MOCK_USERS.filter((u) => team.memberIds.includes(u.id)).map((u) => (
                        <div key={u.id} className="flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 pl-1 pr-2.5 py-1">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-[9px] font-semibold flex-none">
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <span className="text-xs text-slate-600">{u.firstName} {u.lastName}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
            </div>
          ))}
        </div>
      )}

      {showCreate && <TeamFormModal onClose={() => setShowCreate(false)} onSave={handleCreate} />}
      {editTeam && <TeamFormModal initial={editTeam} onClose={() => setEditTeam(null)} onSave={handleEdit} />}
      {deleteTeam && (
        <ConfirmDeleteModal
          team={deleteTeam}
          onConfirm={() => handleDelete(deleteTeam.id)}
          onClose={() => setDeleteTeam(null)}
        />
      )}

      {viewTeam && (
        <TeamDetailModal
          team={viewTeam}
          onClose={() => setViewTeam(null)}
          onEditUser={(id) => { setViewUser(id) }}
        />
      )}
      {viewUser && (
        <UserProfileModal
          userId={viewUser}
          onClose={() => setViewUser(null)}
        />
      )}
    </div>
  )
}
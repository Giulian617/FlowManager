import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { User, Calendar, Users, Search, X, Plus, Pencil, Trash2, ChevronDown, AlertCircle } from "lucide-react"
import {
  getCurrentUser,
} from "../api/user"
import {
  createTeam,
  updateTeam,
  deleteTeam,
} from "../api/team"
import {
  getTeamsByOrganizationId,
  getUsersByOrganizationId,
} from "../api/organization"
import type {
  TeamResponseDto,
  TeamCreateDto,
  TeamUpdateDto
} from "../types/team"
import type { UserSummaryDto } from "../types/user"

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ro-RO", { day: "2-digit", month: "short", year: "numeric" })
}

function MembersPicker({ value, onChange, users }: {
  value: string[];
  onChange: (v: string[]) => void
  users: UserSummaryDto[]
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setSearch("") } }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const toggle = (id: number) =>
    value.includes(String(id)) ? onChange(value.filter((v) => v !== String(id))) : onChange([...value, String(id)])

  const selectedUsers = users.filter((u) => value.includes(String(u.id)))
  const filtered = users.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()))

  return (
    <div ref={ref} className="relative">
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedUsers.map((u) => (
            <span key={u.id} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 pl-1 pr-1.5 py-0.5 text-xs text-slate-700">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-[9px] font-semibold flex-none">
                {u.username[0].toUpperCase()}
              </div>
              {u.username}
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
          <span className="text-slate-400">{value.length === 0 ? "Select members…" : "Add more…"}</span>
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
              placeholder="Search…"
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
            {search && (
              <button onMouseDown={(e) => { e.preventDefault(); setSearch("") }} className="text-slate-300 hover:text-slate-500">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-xs text-slate-400">No results</li>
            ) : (
              filtered.map((u) => {
                const selected = value.includes(String(u.id))
                return (
                  <li
                    key={u.id}
                    className={`flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer transition hover:bg-slate-50 ${selected ? "bg-slate-50" : ""}`}
                    onMouseDown={(e) => { e.preventDefault(); toggle(u.id) }}
                  >
                    <div className={`h-4 w-4 flex-none rounded border flex items-center justify-center transition-colors ${selected ? "bg-slate-900 border-slate-900" : "border-slate-300 bg-white"}`}>
                      {selected && (
                        <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 6l3 3 5-5" />
                        </svg>
                      )}
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-semibold flex-none">
                      {u.username[0].toUpperCase()}
                    </div>
                    <span className="text-slate-700">{u.username}</span>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

function ManagerPicker({ value, onChange, managers }: {
  value: string;
  onChange: (id: string) => void
  managers: UserSummaryDto[]
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const selected = managers.find((u) => String(u.id) === value) ?? null

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
                  className={`flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer hover:bg-slate-100 ${String(u.id) === value ? "bg-slate-100" : ""}`}
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


function ConfirmDeleteModal({ team, onConfirm, onClose }: {
  team: TeamResponseDto
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


function TeamFormModal({ initial, currentUser, managers, users, orgId, onClose, onSave }: {
  initial?: TeamResponseDto
  currentUser: UserSummaryDto | null
  managers: UserSummaryDto[]
  users: UserSummaryDto[]
  orgId: number
  onClose: () => void
  onSave: (data: TeamCreateDto | TeamUpdateDto, id?: number) => Promise<void>
}) {
  const isEdit = !!initial
  const [name, setName] = useState(initial?.name ?? "")
  const [description, setDesc] = useState(initial?.description ?? "")
  const [managerId, setManagerId] = useState<number | null>(initial?.manager?.id ?? currentUser?.id ?? null)
  const [membersIds, setMembersIds] = useState<number[]>(initial?.members?.map((m) => m.id) ?? [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nameOk = name.trim() !== ""
  const descOk = description.trim() !== ""
  const canSave = nameOk && descOk

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      const payload = isEdit
        ? { name: name.trim(), description: description.trim(), managerId: managerId !== initial?.manager?.id ? managerId ?? undefined : undefined, membersIds } satisfies TeamUpdateDto
        : { name: name.trim(), description: description.trim(), organizationId: orgId, membersIds } satisfies TeamCreateDto
      await onSave(payload, initial?.id)
      onClose()
    } catch {
      setError("Failed to save team. Please try again.")
    } finally {
      setSaving(false)
    }
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
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Manager</label>
            {isEdit ? (
              <ManagerPicker
                value={String(managerId)}
                onChange={(id) => {
                  const newManagerId = Number(id)

                  setMembersIds(prev => {
                    let updated = [...prev]

                    if (managerId !== null) {
                      updated = updated.filter(memberId => memberId !== managerId)
                    }
                    if (!updated.includes(newManagerId)) {
                      updated.push(newManagerId)
                    }

                    return updated
                  })

                  setManagerId(newManagerId)
                }}
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
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Members</label>
            <MembersPicker
            value={membersIds.map(String)}
            onChange={(v) => setMembersIds(v.map(Number))}
            users={users} />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 flex-none" />
              {error}
            </div>
          )}

          {!canSave && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700">
              <AlertCircle className="h-4 w-4 flex-none" />
              Name and description are required.
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
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Team"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OrgTeams() {
  const navigate = useNavigate()
  const [orgId, setOrgId] = useState<number>(0)
  const [teams, setTeams] = useState<TeamResponseDto[]>([])
  const [currentUser, setCurrentUser] = useState<UserSummaryDto | null>(null)
  const [users, setUsers] = useState<UserSummaryDto[]>([])
  const [managers, setManagers] = useState<UserSummaryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [editTeam, setEditTeam] = useState<TeamResponseDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TeamResponseDto | null>(null)

  useEffect(() => {
    const orgId = typeof window !== "undefined" ? Number(localStorage.getItem("selectedOrg")) : 0
    if (!orgId) { navigate("/select-org"); return }
    setOrgId(orgId)

    async function load() {
      try {
        const [teamsData, user, managersData, regularUsersData] = await Promise.all([
          getTeamsByOrganizationId(orgId),
          getCurrentUser(),
          getUsersByOrganizationId(orgId, "MANAGER"),
          getUsersByOrganizationId(orgId, "USER"),
        ])
        setTeams(teamsData)
        setCurrentUser(user)
        setManagers(managersData)
        setUsers([...(managersData ?? []), ...(regularUsersData ?? [])].filter(
          (u, i, arr) => arr.findIndex(x => x.id === u.id) === i
        ))
      } catch {
        setError("Failed to load teams.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleCreate = async (data: TeamCreateDto) => {
    const created = await createTeam(data)
    setTeams((prev) => [...prev, created])
  }

  const handleEdit = async (data: TeamUpdateDto, id?: number) => {
    const updated = await updateTeam(id!, data)
    setTeams((prev) => prev.map((t) => t.id === updated.id ? updated : t))
  }

  const handleDelete = async (id: number) => {
    await deleteTeam(id)
    setTeams((prev) => prev.filter((t) => t.id !== id))
    setDeleteTarget(null)
  }

  const filtered = teams.filter((t) => {
    const q = query.toLowerCase()
    return (
      t.name.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.manager?.username?.toLowerCase().includes(q) ||
      t.members?.some((m) => m.username.toLowerCase().includes(q))
    )
  })

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <p className="text-slate-500">Loading teams…</p>
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
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Teams</p>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-slate-900">Teams</h1>
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
          placeholder="Search by name, manager or member…"
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" />
        {query && (
          <button onClick={() => setQuery("")} className="text-slate-300 hover:text-slate-500 transition flex-none">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 shadow-sm text-center gap-2">
          <p className="text-sm font-medium text-slate-600">No teams for this organization.</p>
          <p className="text-xs text-slate-400">Create a new team to get started.</p>
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
                <button
                  onClick={() => setEditTeam(team)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTarget(team)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-rose-100 bg-white text-rose-400 transition hover:bg-rose-50 hover:text-rose-600"
                  title="Delete"
                >
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
                  <User className="h-3.5 w-3.5 flex-none text-slate-400" />
                  <span className="text-xs text-slate-500">Manager</span>
                  <span className="ml-auto text-xs font-medium text-slate-700">{team.manager?.username ?? "—"}</span>
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
                  <span className="text-xs text-slate-500">
                    {team.members?.length ?? 0} member{(team.members?.length ?? 0) !== 1 ? "s" : ""}
                  </span>
                </div>
                {(team.members?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {team.members!.map((member) => (
                      <div key={member.id} className="flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 pl-1 pr-2.5 py-1">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-[9px] font-semibold flex-none">
                          {member.username[0].toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-600">{member.username}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <TeamFormModal
          currentUser={currentUser}
          managers={managers}
          users={users}
          orgId={orgId}
          onClose={() => setShowCreate(false)}
          onSave={(data) => handleCreate(data as TeamCreateDto)}
        />
      )}
      {editTeam && (
        <TeamFormModal
          initial={editTeam}
          currentUser={currentUser}
          managers={managers}
          users={users}
          orgId={orgId}
          onClose={() => setEditTeam(null)}
          onSave={(data, id) => handleEdit(data as TeamUpdateDto, id)}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          team={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
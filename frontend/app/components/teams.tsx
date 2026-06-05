import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { User, Calendar, Users, Search, X, Plus, Pencil, Trash2, ChevronDown, AlertCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight  } from "lucide-react"
import {
  getCurrentUser,
  getManagedTeamsByUserId,
  getAssignedTeamsByUserId,
} from "../api/user"
import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
} from "../api/team"
import {
  getOrganizations,
  getTeamsByOrganizationId,
  getUsersByOrganizationId,
} from "../api/organization"
import {
    getTeamsByProjectId
} from "../api/project"
import type {
  TeamResponseDto,
  TeamCreateDto,
  TeamUpdateDto,
} from "../types/team"
import type { UserSummaryDto } from "../types/user"
import type { OrganizationResponseDto } from "../types/organization"
import SelectDropdown from "./SelectDropdown"

function getInitials(username: string): string {
  const parts = username.split(/[.\s_-]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return username.slice(0, 2).toUpperCase()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ro-RO", { day: "2-digit", month: "short", year: "numeric" })
}

function MembersPicker({ value, onChange, users }: {
  value: string[]
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
            <span key={u.id} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 pl-1 pr-1.5 py-0.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[9px] font-semibold flex-none">
                {getInitials(u.username)}
              </div>
              {u.username}
              <button type="button" onMouseDown={(e) => { e.preventDefault(); toggle(u.id) }} className="ml-0.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <button type="button" onClick={() => { setOpen((o) => !o); setSearch("") }}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm outline-none transition hover:border-slate-400 dark:hover:border-slate-500">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          <span className="text-slate-400 dark:text-slate-500">{value.length === 0 ? "Select members…" : "Add more…"}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
      </button>
      {open && (
        <div className="absolute left-0 z-30 mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-slate-700">
            <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 flex-none" />
            <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…"
              className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500" />
            {search && (
              <button onMouseDown={(e) => { e.preventDefault(); setSearch("") }} className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-xs text-slate-400 dark:text-slate-500">No results</li>
            ) : filtered.map((u) => {
              const selected = value.includes(String(u.id))
              return (
                <li key={u.id}
                  className={`flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-700 ${selected ? "bg-slate-50 dark:bg-slate-700" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); toggle(u.id) }}>
                  <div className={`h-4 w-4 flex-none rounded border flex items-center justify-center transition-colors ${selected ? "bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"}`}>
                    {selected && <svg className="h-2.5 w-2.5 text-white dark:text-slate-900" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5" /></svg>}
                  </div>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-semibold flex-none">
                    {getInitials(u.username)}
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">{u.username}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

function ManagerPicker({ value, onChange, managers }: {
  value: string
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
      <button type="button" onClick={() => { setOpen((o) => !o); setSearch("") }}
        className="flex w-full items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm outline-none transition hover:border-slate-400 dark:hover:border-slate-500">
        {selected ? (
          <>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-semibold flex-none">
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
            <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…"
              className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500" />
          </div>
          <ul className="max-h-44 overflow-y-auto">
            {managers.filter((u) => u.username.toLowerCase().includes(search.toLowerCase())).map((u) => (
              <li key={u.id}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${String(u.id) === value ? "bg-slate-100 dark:bg-slate-700" : ""}`}
                onMouseDown={(e) => { e.preventDefault(); onChange(String(u.id)); setOpen(false) }}>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-semibold flex-none">
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

function TeamDetailModal({ team, onClose }: {
  team: TeamResponseDto
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{team.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{team.description}</p>
          </div>
          <button onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 transition">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 space-y-5">
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 px-4 py-2.5">
              <User className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-none" />
              <span className="text-xs text-slate-500 dark:text-slate-400 w-24">Manager</span>
              <span className="ml-auto text-sm font-medium text-slate-700 dark:text-slate-300">{team.manager?.username ?? "—"}</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 px-4 py-2.5">
              <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-none" />
              <span className="text-xs text-slate-500 dark:text-slate-400 w-24">Created</span>
              <span className="ml-auto text-sm font-medium text-slate-700 dark:text-slate-300">{formatDate(team.createdAt)}</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-3">
              Members ({team.members?.length ?? 0})
            </p>
            <div className="space-y-2">
              {(team.members ?? []).map((member) => (
                <div key={member.id} className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50 px-4 py-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold flex-none">
                    {getInitials(member.username)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{member.username}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{member.role}</p>
                  </div>
                </div>
              ))}
              {(team.members?.length ?? 0) === 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-2">No members yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
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
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/50">
            <Trash2 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Delete team</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-slate-100">"{team.name}"</span>?
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-600">Cancel</button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-rose-500 dark:bg-rose-800 px-4 py-2.5 text-sm font-semibold text-white dark:text-rose-200 transition hover:bg-rose-600 dark:hover:bg-rose-700">Delete</button>
        </div>
      </div>
    </div>
  )
}

function TeamFormModal({ initial, currentUser, managers, users, orgId, organizations = [], onClose, onSave }: {
  initial?: TeamResponseDto
  currentUser: UserSummaryDto | null
  managers: UserSummaryDto[]
  users: UserSummaryDto[]
  orgId: number
  organizations?: OrganizationResponseDto[]
  onClose: () => void
  onSave: (data: TeamCreateDto | TeamUpdateDto, id?: number) => Promise<void>
}) {
  const isEdit = !!initial
  const [name, setName] = useState(initial?.name ?? "")
  const [description, setDesc] = useState(initial?.description ?? "")
  const [managerId, setManagerId] = useState<number | null>(initial?.manager?.id ?? currentUser?.id ?? null)
  const [membersIds, setMembersIds] = useState<number[]>(initial?.members?.map((m) => m.id) ?? [])
  const [selectedOrgId, setSelectedOrgId] = useState<number>(orgId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nameOk = name.trim() !== ""
  const descOk = description.trim() !== ""
  const canSave = nameOk && descOk && (isEdit || selectedOrgId !== 0)

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      const payload = isEdit
        ? { name: name.trim(), description: description.trim(), managerId: managerId !== initial?.manager?.id ? managerId ?? undefined : undefined, membersIds } satisfies TeamUpdateDto
        : { name: name.trim(), description: description.trim(), organizationId: selectedOrgId, membersIds } satisfies TeamCreateDto
      await onSave(payload, initial?.id)
      onClose()
    } catch {
      setError("Failed to save team. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const inputCls = (valid: boolean) =>
    `w-full rounded-xl border bg-slate-50 dark:bg-slate-700/50 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 ${
      valid
        ? "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 focus:border-slate-400 dark:focus:border-slate-400 focus:ring-slate-200 dark:focus:ring-slate-700"
        : "border-rose-300 dark:border-rose-700 focus:border-rose-400 dark:focus:border-rose-600 focus:ring-rose-100 dark:focus:ring-rose-900/30"
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{isEdit ? "Edit Team" : "Create Team"}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{isEdit ? "Update the team details." : "Fill in the details to create a new team."}</p>
          </div>
          <button onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 transition">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Name <span className={nameOk ? "text-slate-300 dark:text-slate-600" : "text-rose-500 dark:text-rose-400"}>*</span>
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Engineering…" className={inputCls(nameOk)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Description <span className={descOk ? "text-slate-300 dark:text-slate-600" : "text-rose-500 dark:text-rose-400"}>*</span>
            </label>
            <textarea value={description} onChange={(e) => setDesc(e.target.value)} rows={3}
              placeholder="What does this team do?" className={inputCls(descOk) + " resize-none"} />
          </div>
          {organizations.length > 0 && !isEdit && (
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
                onChange={(id) => {
                  const newManagerId = Number(id)
                  setMembersIds(prev => {
                    let updated = [...prev]
                    if (managerId !== null) updated = updated.filter(m => m !== managerId)
                    if (!updated.includes(newManagerId)) updated.push(newManagerId)
                    return updated
                  })
                  setManagerId(newManagerId)
                }}
                managers={managers}
              />
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700/50 px-3 py-2.5 cursor-not-allowed">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-semibold flex-none">
                  {currentUser ? getInitials(currentUser.username) : "?"}
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">{currentUser?.username ?? "Loading…"}</span>
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Members</label>
            <MembersPicker value={membersIds.map(String)} onChange={(v) => setMembersIds(v.map(Number))} users={users} />
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-4 py-3 text-xs text-rose-700 dark:text-rose-400">
              <AlertCircle className="h-4 w-4 flex-none" />{error}
            </div>
          )}
          {!canSave && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 flex-none" />Name and description are required.
            </div>
          )}
        </div>
        <div className="flex gap-2 px-6 pb-6 pt-4 border-t border-slate-100 dark:border-slate-700">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-600">Cancel</button>
          <button onClick={handleSave} disabled={!canSave || saving}
            className="flex-1 rounded-xl bg-slate-900 dark:bg-blue-950 px-5 py-2.5 text-sm font-semibold text-white dark:text-blue-300 transition hover:bg-slate-800 dark:hover:bg-blue-900 disabled:opacity-40 disabled:cursor-not-allowed">
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Team"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Teams({ mode }: { mode: "org" | "project" | "admin" }) {
  const navigate = useNavigate()
  const [orgId, setOrgId] = useState<number>(0)
  const [teams, setTeams] = useState<TeamResponseDto[]>([])
  const [currentUser, setCurrentUser] = useState<UserSummaryDto | null>(null)
  const [managers, setManagers] = useState<UserSummaryDto[]>([])
  const [organizations, setOrganizations] = useState<OrganizationResponseDto[]>([])
  const [users, setUsers] = useState<UserSummaryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [editTeam, setEditTeam] = useState<TeamResponseDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TeamResponseDto | null>(null)
  const [viewTeam, setViewTeam] = useState<TeamResponseDto | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const storedOrgId = Number(localStorage.getItem("selectedOrg"))
    const storedProjectId = Number(localStorage.getItem("selectedProject"))
    if (!storedOrgId && mode !== "admin") {
      navigate("/select-org")
      return
    }
    if (mode === "project" && !storedProjectId) {
      navigate(-1)
      return
    }
    setOrgId(storedOrgId)

    async function load() {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)

        let teamsData: TeamResponseDto[] = []

        if (mode === "admin") {
          teamsData = await getTeams()
          const orgs = await getOrganizations()
          setOrganizations(orgs)
        } else if (mode === "project") {
          teamsData = await getTeamsByProjectId(storedProjectId)
        } else {
          if (user.role === "ADMIN") {
            teamsData = await getTeamsByOrganizationId(storedOrgId)
          } else if (user.role === "MANAGER") {
            const [managed, assigned] = await Promise.all([
              getManagedTeamsByUserId(user.id),
              getAssignedTeamsByUserId(user.id),
            ])
            teamsData = [...(managed ?? []), ...(assigned ?? [])].filter(
              (t, i, arr) => arr.findIndex((x) => x.id === t.id) === i
            )
          } else {
            teamsData = await getAssignedTeamsByUserId(user.id)
          }
        }

        setTeams(teamsData)

        if ((user.role === "ADMIN" || user.role === "MANAGER") && mode !== "admin") {
          const [managersData, regularUsersData] = await Promise.all([
            getUsersByOrganizationId(storedOrgId, "MANAGER"),
            getUsersByOrganizationId(storedOrgId, "USER"),
          ])
          setManagers(managersData)
          setUsers([...(managersData ?? []), ...(regularUsersData ?? [])].filter(
            (u, i, arr) => arr.findIndex((x) => x.id === u.id) === i
          ))
        }
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

  const itemsPerPage = 6
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  useEffect(() => { setPage(1) }, [query])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <p className="text-slate-500 dark:text-slate-400">Loading teams…</p>
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
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Teams</p>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Teams</h1>
          {(currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER") && (
            <button onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 dark:bg-slate-700 px-5 py-3 text-sm font-semibold text-white dark:text-white transition hover:bg-slate-800 dark:hover:bg-slate-600">
              <Plus className="h-4 w-4" />
              New Team
            </button>
          )}
        </div>
      </header>

      <div className="flex w-full items-center gap-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 shadow-sm">
        <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 flex-none" />
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, manager or member…"
          className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500" />
        {query && (
          <button onClick={() => setQuery("")} className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition flex-none">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-20 shadow-sm text-center gap-2">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {mode === "project" ? "No teams for this project." : "No teams for this organization."}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Create a new team to get started.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-20 shadow-sm text-center gap-2">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No teams match your search.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Try a different name, manager, or member.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginated.map((team) => {
              const canModify = currentUser?.role === "ADMIN" || team.manager?.id === currentUser?.id
              return (
                <div key={team.id}
                  onClick={() => setViewTeam(team)}
                  className="relative group rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm transition hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-0.5 duration-150 space-y-4 cursor-pointer">
                  {canModify && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation()
                          if (mode === "admin") {
                            const orgIdForTeam = team.organization?.id
                            if (orgIdForTeam) {
                              const [managersData, regularUsersData] = await Promise.all([
                                getUsersByOrganizationId(orgIdForTeam, "MANAGER"),
                                getUsersByOrganizationId(orgIdForTeam, "USER"),
                              ])
                              setManagers(managersData)
                              setUsers([...(managersData ?? []), ...(regularUsersData ?? [])].filter(
                                (u, i, arr) => arr.findIndex((x) => x.id === u.id) === i
                              ))
                            }
                          }
                          setEditTeam(team)
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-500 transition hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-slate-700 dark:hover:text-slate-300" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(team) }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 transition hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:text-rose-700 dark:hover:text-rose-200" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  <div className={`flex items-center gap-3 ${canModify ? "pr-14" : ""}`}>
                    <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-sm font-bold">
                      {getInitials(team.name)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">{team.name}</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed truncate">{team.description}</p>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-700" />
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <User className="h-3.5 w-3.5 flex-none text-slate-400 dark:text-slate-500" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">Manager</span>
                      <span className="ml-auto text-xs font-medium text-slate-700 dark:text-slate-300">{team.manager?.username ?? "—"}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Calendar className="h-3.5 w-3.5 flex-none text-slate-400 dark:text-slate-500" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">Created</span>
                      <span className="ml-auto text-xs font-medium text-slate-700 dark:text-slate-300">{formatDate(team.createdAt)}</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-700" />
                  <div>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Users className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {team.members?.length ?? 0} member{(team.members?.length ?? 0) !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {(team.members?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {team.members!.map((member) => (
                          <div key={member.id} className="flex items-center gap-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 pl-1 pr-2.5 py-1">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[9px] font-semibold flex-none">
                              {getInitials(member.username)}
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-400">{member.username}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                className="inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
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
                <span>/ {totalPages}</span>
              </div>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
                <ChevronRight className="h-4 w-4" />
              </button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                className="inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {showCreate && (
        <TeamFormModal
          currentUser={currentUser}
          managers={managers}
          users={users}
          orgId={orgId}
          organizations={mode === "admin" ? organizations : []}
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
      {viewTeam && (
        <TeamDetailModal
          team={viewTeam}
          onClose={() => setViewTeam(null)}
        />
      )}
    </div>
  )
}
import { useState, useRef, useEffect } from "react"
import { useNavigate} from "react-router"
import { Search, X, Plus, Pencil, Trash2, AlertCircle, ChevronDown, Building2, Mail, Phone, Check, EyeOff, Eye } from "lucide-react"
import {
  getCurrentUser,
  createUser,
  updateUser,
  deleteUser
} from "../api/user"
import {
  getOrganizations,
  getOrganizationById,
  getUsersByOrganizationId,
} from "../api/organization"
import type {
  UserCreateDto,
  UserUpdateDto,
  UserResponseDto
} from "../types/user"
import type { OrganizationSummaryDto } from "../types/organization"
import type { Role } from "../types/enums"

const ROLE_OPTIONS: Role[] = ["USER", "MANAGER", "ADMIN"]

function fullName(u: UserResponseDto) { return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() }
function initials(u: UserResponseDto) { return `${u.firstName?.[0] ?? "?"}${u.lastName?.[0] ?? "?"}`.toUpperCase() }

function ConfirmDeleteModal({ user, onConfirm, onClose }: {
  user: UserResponseDto;
  onConfirm: () => void;
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
            <h2 className="text-base font-semibold text-slate-900">Delete user</h2>
            <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete <span className="font-semibold text-slate-900">"{fullName(user)}"</span>?
        </p>
        <div className="flex gap-2">
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">Delete</button>
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
        </div>
      </div>
    </div>
  )
}

function RoleDropdown({ value, onChange, error }: {
  value: string;
  onChange: (v: Role) => void;
  error?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition hover:border-slate-400 ${error ? "border-rose-300" : "border-slate-200"}`}>
        <span className={value ? "text-slate-700" : "text-slate-400"}>{value || "Select role…"}</span>
        <ChevronDown className="h-4 w-4 text-slate-400 flex-none" />
      </button>
      {open && (
        <ul className="absolute left-0 z-30 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          {ROLE_OPTIONS.map((opt) => (
            <li key={opt}
              className={`px-3 py-2.5 text-sm cursor-pointer transition ${opt === value ? "bg-slate-200 text-slate-900" : "hover:bg-slate-100 text-slate-700"}`}
              onMouseDown={(e) => { e.preventDefault(); onChange(opt); setOpen(false) }}>
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function OrgsPicker({ value, onChange, organizations }: {
  value: number[]
  onChange: (ids: number[]) => void
  organizations: OrganizationSummaryDto[]
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const toggle = (id: number) =>
    value.includes(id) ? onChange(value.filter((v) => v !== id)) : onChange([...value, id])

  const selected = organizations.filter((o) => value.includes(o.id))
  const filtered = organizations.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div ref={ref} className="relative">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((o) => (
            <span key={o.id} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 pl-2 pr-1 py-0.5 text-xs text-slate-700">
              {o.name}
              <button type="button" onMouseDown={(e) => { e.preventDefault(); toggle(o.id) }} className="ml-0.5 text-slate-400 hover:text-slate-600">
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
          <Building2 className="h-4 w-4 text-slate-400" />
          <span className="text-slate-400">{value.length === 0 ? "Select organizations…" : "Add more…"}</span>
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
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-xs text-slate-400">No results</li>
            ) : filtered.map((o) => {
              const sel = value.includes(o.id)
              return (
                <li
                  key={o.id}
                  className={`flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer transition hover:bg-slate-50 ${sel ? "bg-slate-50" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); toggle(o.id) }}
                >
                  <div className={`h-4 w-4 flex-none rounded border flex items-center justify-center transition-colors ${sel ? "bg-slate-900 border-slate-900" : "border-slate-300 bg-white"}`}>
                    {sel && (
                      <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </div>
                  <span className="text-slate-700">{o.name}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

function UserFormModal({ initial, orgName, orgId, organizations, onClose, onSave }: {
  initial?: UserResponseDto
  orgName: string
  orgId: number
  organizations: OrganizationSummaryDto[]
  onClose: () => void
  onSave: (u: UserResponseDto) => void
}) {
  const isEdit = !!initial
  const [firstName, setFirstName] = useState(initial?.firstName ?? "")
  const [lastName, setLastName] = useState(initial?.lastName ?? "")
  const [username, setUsername] = useState(initial?.username ?? "")
  const [email, setEmail] = useState(initial?.email ?? "")
  const [phoneNumber, setPhone] = useState(initial?.phoneNumber ?? "")
  const [role, setRole] = useState<Role>(initial?.role ?? "USER")
  const [active, setActive] = useState<boolean>(initial?.active ?? true)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [organizationIds, setOrganizationIds] = useState<number[]>(
    initial ? (initial.memberOrganizations?.map((o) => o.id) ?? [orgId]) : [orgId]
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const firstOk = firstName.trim() !== ""
  const lastOk = lastName.trim() !== ""
  const userOk = username.trim() !== ""
  const emailOk = email.trim() !== "" && email.includes("@")
  const phoneOk = phoneNumber.trim() !== ""
  const roleOk = true
  const passwordOk = isEdit || password.trim() !== ""
  const canSave = firstOk && lastOk && userOk && emailOk && phoneOk && roleOk && passwordOk

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      let result: UserResponseDto
      if (isEdit) {
        const payload: UserUpdateDto = {
          email: email.trim(),
          username: username.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneNumber: phoneNumber.trim(),
          active,
          role: role as Role,
          organizationsIds: organizationIds,
        }
        result = await updateUser(initial!.id, payload)
      } else {
        const payload: UserCreateDto = {
          email: email.trim(),
          password: password.trim(),
          username: username.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneNumber: phoneNumber.trim(),
          role: role as Role,
          organizationsIds: organizationIds,
        }
        result = await createUser(payload)
      }
      onSave(result)
      onClose()
    } catch {
      setError("Failed to save user. Please try again.")
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
            <h2 className="text-lg font-semibold text-slate-900">{isEdit ? "Edit User" : "Create User"}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{isEdit ? "Update user details." : "Fill in the details to create a new user."}</p>
          </div>
          <button onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                First Name <span className={firstOk ? "text-slate-300" : "text-rose-500"}>*</span>
              </label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g. Mihai…" className={inputCls(firstOk)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Last Name <span className={lastOk ? "text-slate-300" : "text-rose-500"}>*</span>
              </label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="e.g. Pop…" className={inputCls(lastOk)} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Username <span className={userOk ? "text-slate-300" : "text-rose-500"}>*</span>
            </label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. mihai.pop…" className={inputCls(userOk)} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Email <span className={emailOk ? "text-slate-300" : "text-rose-500"}>*</span>
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. mihai.pop@acme.com…" className={inputCls(emailOk)} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Phone Number <span className={phoneOk ? "text-slate-300" : "text-rose-500"}>*</span>
            </label>
            <input value={phoneNumber} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +40721000001…" className={inputCls(phoneOk)} />
          </div>

          {!isEdit && (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Password <span className={passwordOk ? "text-slate-300" : "text-rose-500"}>*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password…"
                  className={inputCls(passwordOk) + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Role <span className={roleOk ? "text-slate-300" : "text-rose-500"}>*</span>
            </label>
            <RoleDropdown value={role} onChange={setRole} error={!roleOk} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Organization{!isEdit && <span className="ml-1 text-rose-500">*</span>}
            </label>
              <OrgsPicker
                value={organizationIds}
                onChange={setOrganizationIds}
                organizations={organizations}
              />
          </div>

          {isEdit && (
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Active</p>
              <p className="text-xs text-slate-400">User can log in and access the system</p>
            </div>
            <button type="button" onClick={() => setActive((a) => !a)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${active ? "bg-slate-900" : "bg-slate-300"}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${active ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 flex-none" />
              {error}
            </div>
          )}

          {!canSave && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700">
              <AlertCircle className="h-4 w-4 flex-none" />
              {isEdit ? "All fields are required. Email must be valid." : "All fields including password are required. Email must be valid."}
            </div>
          )}
        </div>

        <div className="flex gap-2 px-6 pb-6 pt-4 border-t border-slate-100">
          <button onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!canSave || saving}
            className="flex-1 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed">
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create User"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OrgUsers() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState<UserResponseDto | null>(null)
  const [orgId, setOrgId] = useState<number>(0)
  const [orgName, setOrgName] = useState<string>("")
  const [users, setUsers] = useState<UserResponseDto[]>([])
  const [organizations, setOrganizations] = useState<OrganizationSummaryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser] = useState<UserResponseDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserResponseDto | null>(null)

  useEffect(() => {
    const id = typeof window !== "undefined" ? Number(localStorage.getItem("selectedOrg")) : 0
    if (!id) { navigate("/select-org"); return }
    setOrgId(id)

    async function load() {
      try {
        const [usersData, org, user] = await Promise.all([
          getUsersByOrganizationId(id),
          getOrganizationById(id),
          getCurrentUser(),
        ])
        setUsers(usersData)
        setOrgName(org.name)
        setCurrentUser(user)

        if (user.role === "ADMIN") {
          const orgsData = await getOrganizations()
          setOrganizations(orgsData)
        }
      } catch {
        setError("Failed to load users.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleCreate = (u: UserResponseDto) => setUsers((prev) => [...prev, u])
  const handleEdit   = (u: UserResponseDto) => setUsers((prev) => prev.map((x) => x.id === u.id ? u : x))
  const handleDelete = async (id: number) => {
    await deleteUser(id)
    setUsers((prev) => prev.filter((u) => u.id !== id))
    setDeleteTarget(null)
  }

  const filtered = users.filter((u) => {
    const q = query.toLowerCase()
    return (
      fullName(u).toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    )
  })

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <p className="text-slate-500">Loading users…</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center py-24">
      <p className="text-rose-500">{error}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Users</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Users</h1>
            {orgName && (
              <p className="text-sm leading-6 text-slate-600">
                All users in <span className="font-medium text-slate-700">{orgName}</span>
              </p>
            )}
          </div>
          {currentUser?.role === "ADMIN" && (
            <button onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              <Plus className="h-4 w-4" />
              New User
            </button>
          )}
        </div>
      </header>

      <div className="flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <Search className="h-5 w-5 text-slate-400 flex-none" />
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, username, email or role…"
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" />
        {query && (
          <button onClick={() => setQuery("")} className="text-slate-300 hover:text-slate-500 transition flex-none">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 shadow-sm text-center gap-2">
          <p className="text-sm font-medium text-slate-600">No users found for this organization.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 shadow-sm text-center gap-2">
          <p className="text-sm font-medium text-slate-600">No users match your search.</p>
          <p className="text-xs text-slate-400">Try a different name, username, email, or role.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((user) => (
            <div key={user.id} className="relative group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 duration-150">
              {currentUser?.role === "ADMIN" && (
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditUser(user)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 hover:text-slate-700" title="Edit">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setDeleteTarget(user)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-rose-100 bg-white text-rose-400 transition hover:bg-rose-50 hover:text-rose-600" title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-4 mb-4 pr-14">
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-blue-100 text-blue-900 border border-blue-200 text-sm font-bold">
                  {initials(user)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-900 truncate">{fullName(user)}</h2>
                    <span
                      className={`inline-flex h-2 w-2 rounded-full flex-none ${user.active ? "bg-emerald-500" : "bg-slate-300"}`}
                      title={user.active ? "Active" : "Inactive"}
                    />
                  </div>
                  <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 mb-4" />

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <Mail className="h-3.5 w-3.5 flex-none text-slate-400" />
                  <span className="text-xs text-slate-500 truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="h-3.5 w-3.5 flex-none text-slate-400" />
                  <span className="text-xs text-slate-500">{user.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-3.5 w-3.5 flex-none text-slate-400" />
                  <span className="text-xs text-slate-500">Role</span>
                  <span className="ml-auto">
                    <span className="inline-flex rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      {user.role}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <UserFormModal
          orgName={orgName}
          orgId={orgId}
          organizations={organizations}
          onClose={() => setShowCreate(false)}
          onSave={handleCreate}
        />
      )}
      {editUser && (
        <UserFormModal
          initial={editUser}
          orgName={orgName}
          orgId={orgId}
          organizations={organizations}
          onClose={() => setEditUser(null)}
          onSave={handleEdit}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
        user={deleteTarget}
        onConfirm={() => handleDelete(deleteTarget.id)}
        onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

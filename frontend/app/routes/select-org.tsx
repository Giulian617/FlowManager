import { useNavigate } from "react-router"
import { Building2, ChevronRight, Search, X, AlertCircle, ChevronDown, User, RollerCoaster } from "lucide-react"
import { useEffect, useRef, useState} from "react"
import {
  getCurrentUser,
  getManagers,
  getUserOrganizations,
} from "../api/user"
import {
  getOrganizations,
  createOrganization,
} from "../api/organization"
import type { UserSummaryDto } from "../types/user"
import type { OrganizationSummaryDto } from "../types/organization"

const INDUSTRY_OPTIONS = ["Software", "Cloud", "Mobile", "Finance", "Healthcare", "Education", "Retail", "Other"]

function getAvatar(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
}

function ManagerPicker({
  users,
  value,
  onChange
}: {
  users: UserSummaryDto[]
  value: number | null
  onChange: (id: number) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const selected = users.find((u) => u.id === value)
  const filtered = users.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()))

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => { setOpen((o) => !o); setSearch("") }}
        className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition hover:border-slate-400">
        {selected ? (
          <>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-semibold flex-none">
              {selected.username.slice(0, 2).toUpperCase()}
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
            <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…" className="w-full bg-transparent text-sm text-slate-700 outline-none" />
          </div>
          <ul className="max-h-44 overflow-y-auto">
            {filtered.map((u) => (
              <li key={u.id}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer transition ${u.id === value ? "bg-slate-200" : "hover:bg-slate-100"}`}
                onMouseDown={(e) => { e.preventDefault(); onChange(u.id); setOpen(false) }}>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-semibold flex-none">
                  {u.username.slice(0, 2).toUpperCase()}
                </div>
                <span>{u.username}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function CreateOrgModal({ onClose, onCreate }: {
  onClose: () => void
  onCreate: (org: OrganizationSummaryDto) => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [industry, setIndustry] = useState("")
  const [industrySearch, setIndustrySearch] = useState("")
  const [industryOpen, setIndustryOpen] = useState(false)
  const industryRef = useRef<HTMLDivElement>(null)
  const [users, setUsers] = useState<UserSummaryDto[]>([])
  const [managerId, setManagerId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadManagers() {
      try {
        const data = await getManagers()
        setUsers(data)
      } catch (err) {
        console.error(err)
      }
    }

    loadManagers()
  }, [])

  useEffect(() => {
    const h = (e: MouseEvent) => { if (industryRef.current && !industryRef.current.contains(e.target as Node)) setIndustryOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const nameOk = name.trim() !== ""
  const descOk = description.trim() !== ""
  const industryOk = industry !== ""
  const managerOk = managerId !== null
  const canSave = nameOk && descOk && industryOk && managerOk

  const inputCls = (valid: boolean) =>
    `w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
      valid ? "border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-slate-200"
            : "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
    }`

  const handleSave = async () => {
    if (!canSave) return

    try {
      setSaving(true)

      const newOrg = await createOrganization({
        name,
        description,
        industry,
        managerId,
      })

      onCreate(newOrg)
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Create Organization</h2>
            <p className="text-sm text-slate-500 mt-0.5">Fill in the details to create a new organization.</p>
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
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corporation…" className={inputCls(nameOk)} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Description <span className={descOk ? "text-slate-300" : "text-rose-500"}>*</span>
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              placeholder="What does this organization do?"
              className={inputCls(descOk) + " resize-none"} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Industry <span className={industryOk ? "text-slate-300" : "text-rose-500"}>*</span>
            </label>
            <div ref={industryRef} className="relative">
            <button type="button" onClick={() => { setIndustryOpen((o) => !o); setIndustrySearch("") }}
                className={`flex w-full items-center justify-between rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition hover:border-slate-400 ${!industryOk ? "border-rose-300" : "border-slate-200"}`}>
                <span className={industry ? "text-slate-700" : "text-slate-400"}>{industry || "Select industry…"}</span>
                <ChevronDown className="h-4 w-4 text-slate-400 flex-none" />
            </button>
            {industryOpen && (
                <div className="absolute left-0 z-30 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
                    <Search className="h-3.5 w-3.5 text-slate-400 flex-none" />
                    <input autoFocus value={industrySearch} onChange={(e) => setIndustrySearch(e.target.value)}
                    placeholder="Search…" className="w-full bg-transparent text-sm text-slate-700 outline-none" />
                </div>
                <ul className="max-h-44 overflow-y-auto">
                    {INDUSTRY_OPTIONS.filter((o) => o.toLowerCase().includes(industrySearch.toLowerCase())).map((opt) => (
                    <li key={opt}
                        className={`px-3 py-2.5 text-sm cursor-pointer transition ${opt === industry ? "bg-slate-200 text-slate-900" : "hover:bg-slate-100 text-slate-700"}`}
                        onMouseDown={(e) => { e.preventDefault(); setIndustry(opt); setIndustryOpen(false) }}>
                        {opt}
                    </li>
                    ))}
                    {INDUSTRY_OPTIONS.filter((o) => o.toLowerCase().includes(industrySearch.toLowerCase())).length === 0 && (
                    <li className="px-3 py-3 text-xs text-slate-400">No results</li>
                    )}
                </ul>
                </div>
            )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Manager <span className={managerOk ? "text-slate-300" : "text-rose-500"}>*</span>
            </label>

            <ManagerPicker
              users={users}
              value={managerId}
              onChange={setManagerId}
            />
          </div>

          {(!nameOk || !descOk || !industryOk || !managerOk) && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700">
              <AlertCircle className="h-4 w-4 flex-none" />
              All fields are required.
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
            {saving ? "Creating..." : "Create Organization"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SelectOrg() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [orgs, setOrgs] = useState<OrganizationSummaryDto[]>([])
  const [user, setUser] = useState<UserSummaryDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    
    async function loadOrgs() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        const data = currentUser.role === "ADMIN"
          ? await getOrganizations()
          : await getUserOrganizations(currentUser.id)
        setOrgs(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadOrgs()
  }, [])

  const filtered = orgs.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading organizations...</p>
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
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Select organization</h1>
          <p className="mt-1 text-sm text-slate-500">Choose the organization you want to work in</p>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Search className="h-4 w-4 flex-none text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizations..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none" />
        </div>

        <div className="flex flex-col gap-2">
          {filtered.map((org) => (
            <button key={org.id}
              onClick={() => {
                localStorage.setItem("selectedOrg", String(org.id))
                localStorage.setItem("selectedOrgName", org.name)
                localStorage.setItem("selectedOrgAvatar", getAvatar(org.name))
                if (localStorage.getItem("selectedOrg")) {
                  navigate("/org/projects")
                }
              }}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
                {getAvatar(org.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{org.name}</p>
                <p className="text-xs text-slate-400 truncate">{org.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 flex-none text-slate-400" />
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">No organizations found.</p>
          )}
        </div>

        {user?.role === "ADMIN" && (
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-medium text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
          >
            <Building2 className="h-4 w-4" />
            Create new organization
          </button>
        )}
      </div>

      {showCreate && (
        <CreateOrgModal
          onClose={() => setShowCreate(false)}
          onCreate={(org) => {
            setOrgs((prev) => [...prev, org])
          }}
        />
      )}
    </div>
  )
}
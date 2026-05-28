import { useEffect, useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router"
import { LayoutDashboard, FolderKanban, Users, LogOut, UserCircle, Pencil, Trash2, X, AlertTriangle, AlertCircle } from "lucide-react"
import TopBar from "../components/TopBar"
import {
  getCurrentUser,
  getManagers,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
} from "../src/api"
import type { UserSummaryDto } from "../types/user"
import type { OrganizationUpdateDto } from "../types/organization"

const INDUSTRY_OPTIONS = ["Software", "Cloud", "Mobile", "Finance", "Healthcare", "Education", "Retail", "Other"]

function getAvatar(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
}

function EditOrgModal({
  open, onClose, onSave,
  initialName, initialDescription, initialIndustry, initialManagerId,
  managers,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: { name: string; description: string; industry: string; managerId: number }) => Promise<void>
  initialName: string
  initialDescription: string
  initialIndustry: string
  initialManagerId: number | null
  managers: UserSummaryDto[]
}) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [industry, setIndustry] = useState(initialIndustry)
  const [managerId, setManagerId] = useState<number | null>(initialManagerId)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setName(initialName)
    setDescription(initialDescription)
    setIndustry(initialIndustry)
    setManagerId(initialManagerId)
  }, [initialName, initialDescription, initialIndustry, initialManagerId])

  if (!open) return null

  const nameOk = name.trim() !== ""
  const descOk = description.trim() !== ""
  const canSave = nameOk && descOk && !!managerId

  const inputCls = (valid: boolean) =>
    `w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
      valid
        ? "border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-slate-200"
        : "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
    }`

  async function handleSave() {
    if (!canSave || !managerId) return
    setLoading(true)
    try {
      await onSave({ name, description, industry, managerId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !loading && onClose()} />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Edit Organization</h2>
            <p className="text-sm text-slate-500 mt-0.5">Update your organization's details.</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Name <span className={nameOk ? "text-slate-300" : "text-rose-500"}>*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={initialName}
              className={inputCls(nameOk)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Description <span className={descOk ? "text-slate-300" : "text-rose-500"}>*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={initialDescription}
              className={inputCls(descOk) + " resize-none"}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Manager</label>
            <select
              value={managerId ?? ""}
              onChange={(e) => setManagerId(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="" disabled>Select manager…</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>{m.username}</option>
              ))}
            </select>
          </div>

          {!canSave && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700">
              <AlertCircle className="h-4 w-4 flex-none" />
              Name, description, and manager are required.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 pb-6 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || loading}
            className="flex-1 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteOrgModal({
  open,
  onClose,
  onConfirm,
  orgName,
  deleting,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  orgName: string
  deleting: boolean
}) {
  const [input, setInput] = useState("")

  useEffect(() => {
    if (!open) setInput("")
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !deleting && onClose()} />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Delete Organization</h2>
            <p className="text-sm text-slate-500 mt-0.5">This action is irreversible.</p>
          </div>
          <button
            onClick={onClose}
            disabled={deleting}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-rose-600 flex-none mt-0.5" />
            <p className="text-xs text-rose-700 leading-relaxed">
              This will permanently delete{" "}
              <span className="font-semibold">{orgName}</span> and{" "}
              <span className="font-semibold">all</span> its projects, teams, and work items.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Type <span className="font-semibold text-slate-700 normal-case tracking-normal">{orgName}</span> to confirm
            </label>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={orgName}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 pb-6 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={input !== orgName || deleting}
            className="flex-1 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {deleting ? "Deleting…" : "Delete Organization"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OrgLayout() {
  const navigate = useNavigate()
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [selectedOrgName, setSelectedOrgName] = useState("")
  const [selectedOrgAvatar, setSelectedOrgAvatar] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editOrgName, setEditOrgName] = useState("")
  const [editOrgDescription, setEditOrgDescription] = useState("")
  const [editOrgIndustry, setEditOrgIndustry] = useState("")
  const [editOrgManagerId, setEditOrgManagerId] = useState<number | null>(null)
  const [managers, setManagers] = useState<UserSummaryDto[]>([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    
    const orgId = localStorage.getItem("selectedOrg")
    if (!orgId) {
      navigate("/select-org")
      return
    }
    setSelectedOrgId(orgId)
    setSelectedOrgName(localStorage.getItem("selectedOrgName") ?? "")
    setSelectedOrgAvatar(localStorage.getItem("selectedOrgAvatar") ?? "")

    async function loadOrgs() {
      try {
        const [currentUser, orgData, managersData] = await Promise.all([
          getCurrentUser(),
          getOrganizationById(Number(orgId)),
          getManagers(),
        ])

        setIsAdmin(currentUser.role === "ADMIN")
        setEditOrgName(orgData.name)
        setEditOrgDescription(orgData.description)
        setEditOrgIndustry(orgData.industry)
        setEditOrgManagerId(orgData.manager.id)
        setManagers(managersData)
      } catch (err) {
        console.error(err)
      }
    }

  loadOrgs()
  }, [])

  const navItems = [
    { to: "/org/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/org/projects",  icon: FolderKanban,    label: "Projects"  },
    { to: "/org/teams",     icon: Users,           label: "Teams"     },
    { to: "/org/users",     icon: UserCircle,      label: "Users"     },
 ]

  async function handleEditOrg(data: OrganizationUpdateDto) {
    if (!selectedOrgId) return

    try {
      await updateOrganization(Number(selectedOrgId), data)
      const avatar = getAvatar(data.name)

      localStorage.setItem("selectedOrgName", data.name)
      localStorage.setItem("selectedOrgAvatar", avatar)

      setSelectedOrgName(data.name)
      setSelectedOrgAvatar(avatar)

      setEditOrgName(data.name)
      setEditOrgDescription(data.description)
      setEditOrgIndustry(data.industry)
      setEditOrgManagerId(data.managerId)

      setEditModalOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDeleteOrg() {
    if (!selectedOrgId) return
    setDeleteLoading(true)
    try {
      await deleteOrganization(Number(selectedOrgId))
      localStorage.removeItem("selectedOrg")
      localStorage.removeItem("selectedOrgName")
      localStorage.removeItem("selectedOrgAvatar")
      localStorage.removeItem("selectedProject")
      localStorage.removeItem("selectedProjectName")
      setDeleteModalOpen(false)
      navigate("/select-org", { replace: true })
    } catch (err) {
      console.error(err)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-slate-200 bg-white">

        {/* Organization*/}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
              {selectedOrgAvatar}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {selectedOrgName}
              </p>
              <p className="text-xs text-slate-400">Organization</p>
            </div>
          </div>

          {/* Edit + Delete buttons (admin only) */}
          {isAdmin && (
            <div className="-mr-1 ml-auto flex items-center gap-2">
              <button
                onClick={() => setEditModalOpen(true)}
                title="Edit organization"
                className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => setDeleteModalOpen(true)}
                title="Delete organization"
                className="flex h-6 w-6 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}  
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <Icon className="h-4 w-4 flex-none" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-100 px-3 py-3 space-y-0.5">
        <button
            onClick={() => {
              localStorage.removeItem("selectedOrg")
              localStorage.removeItem("selectedOrgName")
              localStorage.removeItem("selectedOrgAvatar")
              localStorage.removeItem("selectedProject")
              localStorage.removeItem("selectedProjectName")
              navigate("/select-org", { replace: true })
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
            <LogOut className="h-4 w-4" />
            Switch organization
        </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">
            <TopBar />
            <Outlet />
        </div>
      </main>

      {/* Edit modal */}
      <EditOrgModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleEditOrg}
        initialName={editOrgName}
        initialDescription={editOrgDescription}
        initialIndustry={editOrgIndustry}
        initialManagerId={editOrgManagerId}
        managers={managers}
      />

      {/* Delete modal */}
      <DeleteOrgModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteOrg}
        orgName={selectedOrgName}
        deleting={deleteLoading}
      />
    </div>
  )
}
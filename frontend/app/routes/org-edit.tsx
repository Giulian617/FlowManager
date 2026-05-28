import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { AlertTriangle } from "lucide-react"
import {
    getOrganizationById,
    getManagers,
    updateOrganization,
    deleteOrganization
} from "../src/api"
import type { OrganizationResponseDto } from "../types/organization"
import type { UserSummaryDto } from "../types/user"

const INDUSTRY_OPTIONS = ["Software", "Cloud", "Mobile", "Finance", "Healthcare", "Education", "Retail", "Other"]

function DeleteConfirmModal({ orgName, onClose, onConfirm, deleting } : {
    orgName: string
    onClose: () => void
    onConfirm: () => void
    deleting: boolean
}) {
  const [input, setInput] = useState("")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 flex-none">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Delete organization</h2>
            <p className="text-xs text-slate-500 mt-0.5">This action is irreversible</p>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          This will permanently delete{" "}
          <span className="font-semibold text-slate-900">{orgName}</span> and{" "}
          <span className="font-semibold text-slate-900">all</span> its projects, teams, and work items.
        </p>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Type <span className="font-semibold text-slate-900">{orgName}</span> to confirm
          </label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={orgName}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={input !== orgName || deleting}
            className="flex-1 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {deleting ? "Deleting..." : "Delete organization"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OrgEdit() {
  const navigate = useNavigate()
  const [org, setOrg] = useState<OrganizationResponseDto | null>(null)
  const [managers, setManagers] = useState<UserSummaryDto[]>([])
  const [orgName, setOrgName] = useState("")
  const [orgDescription, setOrgDescription] = useState("")
  const [orgIndustry, setOrgIndustry] = useState("")
  const [orgManagerId, setOrgManagerId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const orgId = Number(localStorage.getItem("selectedOrg"))
        const [orgData, managersData] = await Promise.all([
          getOrganizationById(orgId),
          getManagers(),
        ])
        setOrg(orgData)
        setOrgName(orgData.name)
        setOrgDescription(orgData.description)
        setOrgIndustry(orgData.industry)
        setOrgManagerId(orgData.manager.id)
        setManagers(managersData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!org || !orgManagerId) return
    try {
      setSaving(true)
      await updateOrganization(org.id, {
        name: orgName,
        description: orgDescription,
        industry: orgIndustry,
        managerId: orgManagerId,
      })
      setSaved(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!org) return
    try {
      setDeleting(true)
      await deleteOrganization(org.id)
      localStorage.removeItem("selectedOrg")
      localStorage.removeItem("selectedOrgName")
      localStorage.removeItem("selectedOrgAvatar")
      localStorage.removeItem("selectedProject")
      localStorage.removeItem("selectedProjectName")
      navigate("/select-org", { replace: true })
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  if (!org) return null

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Organization</p>
        <h1 className="text-3xl font-semibold text-slate-900">Edit Organization</h1>
        <p className="text-sm text-slate-500">Update your organization's details</p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Name</label>
            <input
              value={orgName}
              onChange={(e) => { setOrgName(e.target.value); setSaved(false) }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Description</label>
            <textarea
              value={orgDescription}
              onChange={(e) => { setOrgDescription(e.target.value); setSaved(false) }}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Industry</label>
            <select
              value={orgIndustry}
              onChange={(e) => { setOrgIndustry(e.target.value); setSaved(false) }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-slate-400"
            >
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Manager</label>
            <select
              value={orgManagerId ?? ""}
              onChange={(e) => { setOrgManagerId(Number(e.target.value)); setSaved(false) }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-slate-400"
            >
              <option value="" disabled>Select manager…</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>{m.username}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-sm text-emerald-600 font-medium">Organization updated.</span>}
        <button
          onClick={handleSave}
          disabled={saving || !orgManagerId}
          className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      {/* Dange zone */}
      <section className="rounded-3xl border border-rose-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-rose-100">
          <h2 className="text-sm font-semibold text-rose-600">Danger zone</h2>
          <p className="text-xs text-slate-400 mt-0.5">These actions are irreversible</p>
        </div>
        <div className="px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-900">Delete organization</p>
            <p className="text-xs text-slate-400 mt-0.5">Permanently delete this organization and all its data</p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-none rounded-2xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Delete
          </button>
        </div>
      </section>

      {showDeleteConfirm && (
        <DeleteConfirmModal
          orgName={org.name}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  )
}
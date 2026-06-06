import { useEffect, useRef, useState } from "react"
import { Search, X, AlertCircle, ChevronDown } from "lucide-react"
import OrgManagerPicker from "./OrgManagerPicker"
import { getUsers } from "../api/user"
import { createOrganization, updateOrganization } from "../api/organization"
import type { UserSummaryDto } from "../types/user"
import type {
  OrganizationSummaryDto,
  OrganizationResponseDto
} from "../types/organization"

const INDUSTRY_OPTIONS = ["Software", "Cloud", "Mobile", "Finance", "Healthcare", "Education", "Retail", "Other"]

export default function OrgFormModal({ initial, onClose, onSave }: {
  initial?: OrganizationResponseDto
  onClose: () => void
  onSave: (org: OrganizationSummaryDto | OrganizationResponseDto) => void
}) {
  const isEdit = !!initial
  const [name, setName] = useState(initial?.name ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [industry, setIndustry] = useState(initial?.industry ?? "")
  const [industrySearch, setIndustrySearch] = useState("")
  const [industryOpen, setIndustryOpen] = useState(false)
  const industryRef = useRef<HTMLDivElement>(null)
  const [managers, setManagers] = useState<UserSummaryDto[]>([])
  const [managerId, setManagerId] = useState<number | null>(initial?.manager?.id ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getUsers("MANAGER").then(setManagers).catch(console.error)
  }, [])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (industryRef.current && !industryRef.current.contains(e.target as Node)) setIndustryOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const nameOk = name.trim() !== ""
  const descOk = description.trim() !== ""
  const industryOk = industry !== ""
  const managerOk = managerId !== null
  const canSave = nameOk && descOk && industryOk && managerOk

  const inputCls = (valid: boolean) =>
    `w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 ${
      valid
        ? "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-slate-200 dark:focus:ring-slate-700"
        : "border-rose-300 dark:border-rose-700 focus:border-rose-400 dark:focus:border-rose-600 focus:ring-rose-100 dark:focus:ring-rose-900"
    }`

  const handleSave = async () => {
    if (!canSave || !managerId) return
    setSaving(true)
    setError(null)
    try {
      const payload = { name: name.trim(), description: description.trim(), industry, managerId }
      const result = isEdit
        ? await updateOrganization(initial!.id, payload)
        : await createOrganization(payload)
      onSave(result)
      onClose()
    } catch {
      setError("Failed to save organization. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {isEdit ? "Edit Organization" : "Create Organization"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {isEdit ? "Update the organization details." : "Fill in the details to create a new organization."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Name <span className={nameOk ? "text-slate-300 dark:text-slate-600" : "text-rose-500"}>*</span>
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Corporation…" className={inputCls(nameOk)} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Description <span className={descOk ? "text-slate-300 dark:text-slate-600" : "text-rose-500"}>*</span>
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              placeholder="What does this organization do?"
              className={inputCls(descOk) + " resize-none"} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Industry <span className={industryOk ? "text-slate-300 dark:text-slate-600" : "text-rose-500"}>*</span>
            </label>
            <div ref={industryRef} className="relative">
              <button
                type="button"
                onClick={() => { setIndustryOpen((o) => !o); setIndustrySearch("") }}
                className={`flex w-full items-center justify-between rounded-xl border bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none transition hover:border-slate-400 dark:hover:border-slate-500 ${!industryOk ? "border-rose-300 dark:border-rose-700" : "border-slate-200 dark:border-slate-700"}`}
              >
                <span className={industry ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"}>
                  {industry || "Select industry…"}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-none" />
              </button>
              {industryOpen && (
                <div className="absolute left-0 z-30 mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                    <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 flex-none" />
                    <input
                      autoFocus
                      value={industrySearch}
                      onChange={(e) => setIndustrySearch(e.target.value)}
                      placeholder="Search…"
                      className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                  <ul className="max-h-44 overflow-y-auto">
                    {INDUSTRY_OPTIONS.filter((o) => o.toLowerCase().includes(industrySearch.toLowerCase())).map((opt) => (
                      <li
                        key={opt}
                        className={`px-3 py-2.5 text-sm cursor-pointer transition ${opt === industry ? "bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-slate-100" : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"}`}
                        onMouseDown={(e) => { e.preventDefault(); setIndustry(opt); setIndustryOpen(false) }}
                      >
                        {opt}
                      </li>
                    ))}
                    {INDUSTRY_OPTIONS.filter((o) => o.toLowerCase().includes(industrySearch.toLowerCase())).length === 0 && (
                      <li className="px-3 py-3 text-xs text-slate-400 dark:text-slate-500">No results</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Manager <span className={managerOk ? "text-slate-300 dark:text-slate-600" : "text-rose-500"}>*</span>
            </label>
            <OrgManagerPicker users={managers} value={managerId} onChange={setManagerId} />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-4 py-3 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 flex-none" />
              {error}
            </div>
          )}

          {!canSave && !error && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 flex-none" />
              All fields are required.
            </div>
          )}
        </div>

        <div className="flex gap-2 px-6 pb-6 pt-4 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="flex-1 rounded-xl bg-slate-900 dark:bg-blue-950 px-5 py-2.5 text-sm font-semibold text-white dark:text-blue-300 transition hover:bg-slate-800 dark:hover:bg-blue-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save Changes" : "Create Organization")}
          </button>
        </div>
      </div>
    </div>
  )
}
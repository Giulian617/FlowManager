import { useNavigate } from "react-router"
import { Building2, ChevronRight, Search, ChevronLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { getCurrentUser, getMemberOrganizationsByUserId } from "../api/user"
import { getOrganizations } from "../api/organization"
import OrgFormModal from "../components/OrgFormModal"
import type { UserSummaryDto } from "../types/user"
import type { OrganizationSummaryDto } from "../types/organization"
import { getInitials } from "../utils/functions"

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
          : await getMemberOrganizationsByUserId(currentUser.id)
        setOrgs(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadOrgs()
  }, [])

  const filtered = orgs.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500 dark:text-slate-400">Loading organizations...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-900">

      {user?.role === "ADMIN" && (
        <button
          onClick={() => navigate("/admin-menu")}
          className="fixed top-4 left-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm transition hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Admin Menu
        </button>
      )}

      <div className="mb-10 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-100 dark:bg-blue-950 text-lg font-bold text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex-none">FM</div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">FlowManager</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Project workspace</p>
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Select organization</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose the organization you want to work in</p>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-4 py-3 shadow-sm">
          <Search className="h-4 w-4 flex-none text-slate-400 dark:text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizations..."
            className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          {filtered.map((org) => (
            <button
              key={org.id}
              onClick={() => {
                localStorage.setItem("selectedOrg", String(org.id))
                localStorage.setItem("selectedOrgName", org.name)
                navigate("/org/dashboard")
              }}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-4 py-4 text-left shadow-sm transition hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md"
            >
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950 text-sm font-bold text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {getInitials(org.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{org.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{org.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 flex-none text-slate-400 dark:text-slate-500" />
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">No organizations found.</p>
          )}
        </div>

        {user?.role === "ADMIN" && (
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 px-4 py-4 text-sm font-medium text-slate-500 dark:text-slate-400 transition hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <Building2 className="h-4 w-4" />
            Create new organization
          </button>
        )}
      </div>

      {showCreate && (
        <OrgFormModal
          onClose={() => setShowCreate(false)}
          onSave={(org) => setOrgs((prev) => [...prev, org as OrganizationSummaryDto])}
        />
      )}
    </div>
  )
}
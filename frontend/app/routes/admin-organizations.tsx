import { useEffect, useState } from "react"
import { Building2, Search, X, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Users, User, FolderKanban, UsersRound, Calendar, ListFilter, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import {
  getOrganizations,
  deleteOrganization
} from "../api/organization"
import OrgFormModal from "../components/OrgFormModal"
import type { OrganizationResponseDto } from "../types/organization"
import { getInitials, formatDateShortMonth } from "../utils/functions"

function OrgDetailModal({ org, onClose }: {
  org: OrganizationResponseDto
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{org.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{org.description}</p>
          </div>
          <button onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 transition">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 px-4 py-2.5">
            <Building2 className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-none" />
            <span className="text-xs text-slate-500 dark:text-slate-400 w-24">Industry</span>
            <span className="ml-auto text-sm font-medium text-slate-700 dark:text-slate-300">{org.industry}</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 px-4 py-2.5">
            <User className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-none" />
            <span className="text-xs text-slate-500 dark:text-slate-400 w-24">Manager</span>
            <span className="ml-auto text-sm font-medium text-slate-700 dark:text-slate-300">{org.manager.username}</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 px-4 py-2.5">
            <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-none" />
            <span className="text-xs text-slate-500 dark:text-slate-400 w-24">Created</span>
            <span className="ml-auto text-sm font-medium text-slate-700 dark:text-slate-300">{formatDateShortMonth(org.createdAt)}</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 px-4 py-2.5">
            <Users className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-none" />
            <span className="text-xs text-slate-500 dark:text-slate-400 w-24">Members</span>
            <span className="ml-auto text-sm font-medium text-slate-700 dark:text-slate-300">{org.memberCount}</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 px-4 py-2.5">
            <FolderKanban className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-none" />
            <span className="text-xs text-slate-500 dark:text-slate-400 w-24">Projects</span>
            <span className="ml-auto text-sm font-medium text-slate-700 dark:text-slate-300">{org.projectCount}</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 px-4 py-2.5">
            <UsersRound className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-none" />
            <span className="text-xs text-slate-500 dark:text-slate-400 w-24">Teams</span>
            <span className="ml-auto text-sm font-medium text-slate-700 dark:text-slate-300">{org.teamCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfirmDeleteModal({ org, onConfirm, onClose }: {
  org: OrganizationResponseDto
  onConfirm: () => void
  onClose: () => void
}) {
  const [input, setInput] = useState("")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/40">
            <Trash2 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Delete organization</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          This will permanently delete <span className="font-semibold text-slate-900 dark:text-slate-100">"{org.name}"</span> and all its projects, teams, and work items.
        </p>
        <div className="mb-4">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Type <span className="font-semibold text-slate-700 dark:text-slate-300 normal-case tracking-normal">{org.name}</span> to confirm
          </label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={org.name}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-rose-400 dark:focus:border-rose-600 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/30"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-700">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={input !== org.name}
            className="flex-1 rounded-xl bg-rose-500 dark:bg-rose-800 px-4 py-2.5 text-sm font-semibold text-white dark:text-rose-200 transition hover:bg-rose-600 dark:hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

type SortField = "name" | "members" | "projects" | "teams" | "date" | "default"

export default function AdminOrganizations() {
  const [organizations, setOrganizations] = useState<OrganizationResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [editOrg, setEditOrg] = useState<OrganizationResponseDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<OrganizationResponseDto | null>(null)
  const [viewOrg, setViewOrg] = useState<OrganizationResponseDto | null>(null)
  const [page, setPage] = useState(1)

  // Filters
  const [industryFilter, setIndustryFilter] = useState<string>("all")
  const [managerFilter, setManagerFilter] = useState<string>("all")

  // Sort
  const [sortField, setSortField] = useState<SortField>("default")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    getOrganizations()
      .then(setOrganizations)
      .catch(() => setError("Failed to load organizations."))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    await deleteOrganization(id)
    setOrganizations((prev) => prev.filter((o) => o.id !== id))
    setDeleteTarget(null)
  }

  // Derived filter options from data
  const industryOptions = Array.from(
    new Set(organizations.map((o) => o.industry).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))

  const managerOptions = Array.from(
    new Map(
      organizations
        .filter((o) => o.manager)
        .map((o) => [String(o.manager.id), o.manager.username])
    ).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]))

  const hasActiveFilters = industryFilter !== "all" || managerFilter !== "all"

  const clearFilters = () => {
    setIndustryFilter("all")
    setManagerFilter("all")
    setPage(1)
  }

  const filtered = organizations
    .filter((o) => {
      const q = query.toLowerCase()
      const matchesSearch =
        o.name.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q) ||
        o.industry?.toLowerCase().includes(q) ||
        o.manager?.username?.toLowerCase().includes(q)

      const matchesIndustry =
        industryFilter === "all" || o.industry === industryFilter

      const matchesManager =
        managerFilter === "all" || String(o.manager?.id) === managerFilter

      return matchesSearch && matchesIndustry && matchesManager
    })
    .sort((a, b) => {
      if (sortField === "default") return 0
      const dir = sortDir === "asc" ? 1 : -1
      switch (sortField) {
        case "name":
          return a.name.localeCompare(b.name) * dir
        case "members":
          return (a.memberCount - b.memberCount) * dir
        case "projects":
          return (a.projectCount - b.projectCount) * dir
        case "teams":
          return (a.teamCount - b.teamCount) * dir
        case "date":
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
        default:
          return 0
      }
    })

  const itemsPerPage = 9
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  useEffect(() => { setPage(1) }, [query, industryFilter, managerFilter])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <p className="text-slate-500 dark:text-slate-400">Loading organizations…</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center py-24">
      <p className="text-rose-500 dark:text-rose-400">{error}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Organizations</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Organizations</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 dark:bg-slate-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:hover:bg-slate-600"
          >
            <Plus className="h-4 w-4" />
            New Organization
          </button>
        </div>
      </header>

      {/* Filters + Sort + Search */}
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-4 py-3 shadow-sm">

        {/* Filters + Sort */}
        <div className="flex flex-wrap items-center gap-4">

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <ListFilter className="h-4 w-4 flex-none text-slate-500 dark:text-slate-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Filter:</span>

            <select
              value={managerFilter}
              onChange={(e) => { setManagerFilter(e.target.value); setPage(1) }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 outline-none transition focus:border-slate-400 dark:focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
            >
              <option value="all">All managers</option>
              {managerOptions.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
            
            <select
              value={industryFilter}
              onChange={(e) => { setIndustryFilter(e.target.value); setPage(1) }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 outline-none transition focus:border-slate-400 dark:focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
            >
              <option value="all">All industries</option>
              {industryOptions.map((industry) => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>

            {/* Clear filters */}
            {hasActiveFilters && (
              <div className="relative group">
                <button
                  onClick={clearFilters}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <span className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full mb-2 hidden rounded-full bg-slate-800 dark:bg-slate-700 px-3 py-1 text-xs text-white shadow-sm group-hover:block whitespace-nowrap">
                  Clear filters
                </span>
              </div>
            )}
          </div>

          <div className="hidden h-6 w-px bg-slate-200 dark:bg-slate-700 md:block" />

          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 flex-none text-slate-500 dark:text-slate-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sort:</span>

            <select
              value={sortField}
              onChange={(e) => { setSortField(e.target.value as SortField); setPage(1) }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 outline-none transition focus:border-slate-400 dark:focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
            >
              <option value="default">Default</option>
              <option value="name">Name</option>
              <option value="members">Members</option>
              <option value="projects">Projects</option>
              <option value="teams">Teams</option>
              <option value="date">Date</option>
            </select>

            {sortField !== "default" && (
              <button
                onClick={() => { setSortDir((d) => (d === "asc" ? "desc" : "asc")); setPage(1) }}
                className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-sm text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {sortDir === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                {sortDir === "asc" ? "Asc" : "Desc"}
              </button>
            )}

            {/* Reset sorting */}
            {sortField !== "default" && (
              <div className="relative group">
                <button
                  onClick={() => { setSortField("default"); setSortDir("asc"); setPage(1) }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <span className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full mb-2 hidden rounded-full bg-slate-800 dark:bg-slate-700 px-3 py-1 text-xs text-white shadow-sm group-hover:block whitespace-nowrap">
                  Reset sorting
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800 px-3 py-2 border border-slate-200 dark:border-slate-700">
          <Search className="h-4 w-4 flex-none text-slate-400 dark:text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, description, industry or manager…"
            className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition flex-none">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {organizations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-20 shadow-sm text-center gap-2">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No organizations yet.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Create one to get started.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-20 shadow-sm text-center gap-2">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No organizations match your filters.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Try adjusting your search or filters.</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-1 text-xs text-slate-500 dark:text-slate-400 underline underline-offset-2 hover:text-slate-700 dark:hover:text-slate-200 transition">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginated.map((org) => (
              <div
                key={org.id}
                onClick={() => setViewOrg(org)}
                className="relative group rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm transition hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-0.5 duration-150 cursor-pointer"
              >
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditOrg(org) }}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 transition hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(org) }}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-rose-100 dark:border-rose-900/50 bg-white dark:bg-slate-800 text-rose-400 dark:text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-4 pr-14">
                  <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-sm font-bold">
                    {getInitials(org.name)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">{org.name}</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{org.description}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700 mb-4" />

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="h-3.5 w-3.5 flex-none text-slate-400 dark:text-slate-500" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Industry</span>
                    <span className="ml-auto">
                      <span className="inline-flex rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {org.industry}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <User className="h-3.5 w-3.5 flex-none text-slate-400 dark:text-slate-500" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Manager</span>
                    <span className="ml-auto text-xs font-medium text-slate-700 dark:text-slate-300">
                      {org.manager.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-3.5 w-3.5 flex-none text-slate-400 dark:text-slate-500" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Created</span>
                    <span className="ml-auto text-xs font-medium text-slate-700 dark:text-slate-300">{formatDateShortMonth(org.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Users className="h-3.5 w-3.5 flex-none text-slate-400 dark:text-slate-500" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Members</span>
                    <span className="ml-auto text-xs font-medium text-slate-700 dark:text-slate-300">{org.memberCount}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FolderKanban className="h-3.5 w-3.5 flex-none text-slate-400 dark:text-slate-500" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Projects</span>
                    <span className="ml-auto text-xs font-medium text-slate-700 dark:text-slate-300">{org.projectCount}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <UsersRound className="h-3.5 w-3.5 flex-none text-slate-400 dark:text-slate-500" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Teams</span>
                    <span className="ml-auto text-xs font-medium text-slate-700 dark:text-slate-300">{org.teamCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>
              Showing {(page - 1) * itemsPerPage + 1}–{Math.min(filtered.length, page * itemsPerPage)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={page === 1}
                className="inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
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
                <span className="text-slate-500 dark:text-slate-400">/ {totalPages}</span>
              </div>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
                <ChevronRight className="h-4 w-4" />
              </button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                className="inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {showCreate && (
        <OrgFormModal
          onClose={() => setShowCreate(false)}
          onSave={(org) => setOrganizations((prev) => [...prev, org as OrganizationResponseDto])}
        />
      )}
      {editOrg && (
        <OrgFormModal
          initial={editOrg}
          onClose={() => setEditOrg(null)}
          onSave={(updated) => setOrganizations((prev) =>
            prev.map((o) => o.id === (updated as OrganizationResponseDto).id ? updated as OrganizationResponseDto : o)
          )}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          org={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
      {viewOrg && (
        <OrgDetailModal
          org={viewOrg}
          onClose={() => setViewOrg(null)}
        />
      )}
    </div>
  )
}
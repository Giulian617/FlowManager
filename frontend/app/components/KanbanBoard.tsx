import React, { useEffect, useMemo, useState } from "react"
import { useKeycloak } from "@react-keycloak/web"
import TicketCard from "./TicketCard"
import { statusMeta } from "../lib/status"

type Ticket = {
  id: string
  title: string
  description?: string
  status: string
  assigneeId?: string
  priority?: string
  severity?: string
  deadline?: string
}

const COLUMNS = ["ToDo", "InProgress", "Testing", "Done", "Closed"]

export default function KanbanBoard({
  severityFilter,
  deadlineFilter,
}: {
  severityFilter: string
  deadlineFilter: string
}) {
  const { keycloak, initialized } = useKeycloak()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      try {
        if (!initialized) return

        if (!keycloak || !keycloak.authenticated) {
          setTickets([])
          setLoading(false)
          return
        }

        const token = keycloak.token
        const userId = keycloak.tokenParsed?.sub || keycloak.subject || null

        if (!userId) {
          setTickets([])
          setLoading(false)
          return
        }

        const headers: Record<string, string> = {
          Accept: "application/json",
        }
        if (token) headers["Authorization"] = `Bearer ${token}`

        const resp = await fetch(`/api/tickets?assignedTo=${encodeURIComponent(userId)}`, { headers })
        if (!resp.ok) throw new Error("Failed to fetch tickets")
        const data = await resp.json()
        setTickets(data || [])
      } catch (err: any) {
        setError(err.message || "Error fetching tickets")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [initialized, keycloak])

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (severityFilter !== "All") {
        const severity = ticket.severity || ticket.priority || ""
        if (severity !== severityFilter) return false
      }

      if (deadlineFilter !== "All") {
        if (!ticket.deadline) return false
        const deadlineDate = new Date(ticket.deadline)
        const now = new Date()
        const next7days = new Date(now)
        next7days.setDate(now.getDate() + 7)

        if (deadlineFilter === "Overdue" && deadlineDate >= now) return false
        if (deadlineFilter === "Next 7 days" && (deadlineDate < now || deadlineDate > next7days)) return false
        if (deadlineFilter === "Later" && deadlineDate <= next7days) return false
      }

      return true
    })
  }, [tickets, severityFilter, deadlineFilter])

  const byColumn: Record<string, Ticket[]> = {}
  COLUMNS.forEach((c) => (byColumn[c] = []))
  filteredTickets.forEach((t) => {
    const s = t.status || "ToDo"
    if (!byColumn[s]) byColumn[s] = []
    byColumn[s].push(t)
  })

  if (loading)
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
        Loading Kanban board...
      </div>
    )

  if (error)
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700 shadow-sm">
        {error}
      </div>
    )

  if (!keycloak?.authenticated)
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center shadow-sm">
        <p className="mb-4 text-lg font-semibold text-slate-900">Autentificare necesară</p>
        <p className="mb-6 text-sm leading-6 text-slate-600">
          Vă rugăm să vă autentificați din meniul de sus pentru a vedea boardul Kanban și a gestiona elementele.
        </p>
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-5">
        {COLUMNS.map((col) => {
          const meta = statusMeta[col as keyof typeof statusMeta]
          return (
            <div key={col} className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className={`rounded-3xl border-b px-4 py-4 ${meta.headerClass}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${meta.dotClass}`} />
                    <span className="text-sm font-semibold">{meta.label}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-500">{byColumn[col].length}</span>
                </div>
              </div>
              <div className="p-4 space-y-3 bg-slate-50 min-h-[220px]">
                {byColumn[col].length === 0 ? (
                  <div className="text-sm text-slate-500">No cards yet</div>
                ) : (
                  byColumn[col].map((t) => <TicketCard key={t.id} ticket={t} />)
                )}
              </div>
            </div>
          )
        })}
      </div>
      {filteredTickets.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600 shadow-sm">
          No tickets match the current filters.
        </div>
      )}
    </div>
  )
}

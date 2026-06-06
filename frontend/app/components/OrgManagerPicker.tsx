import { useEffect, useRef, useState } from "react"
import { User, ChevronDown, Search } from "lucide-react"
import type { UserSummaryDto } from "../types/user"

export default function ManagerPicker({
  users,
  value,
  onChange,
}: {
  users: UserSummaryDto[]
  value: number | null
  onChange: (id: number) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const selected = users.find((u) => u.id === value)
  const filtered = users.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSearch("") }}
        className="flex w-full items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none transition hover:border-slate-400 dark:hover:border-slate-500"
      >
        {selected ? (
          <>
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
              {selected.username.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-slate-700 dark:text-slate-200 flex-1 text-left">{selected.username}</span>
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
        <div className="absolute left-0 z-30 mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-slate-700">
            <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 flex-none" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <ul className="max-h-44 overflow-y-auto">
            {filtered.map((u) => (
              <li
                key={u.id}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer transition ${u.id === value ? "bg-slate-200 dark:bg-slate-600" : "hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                onMouseDown={(e) => { e.preventDefault(); onChange(u.id); setOpen(false) }}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-semibold flex-none">
                  {u.username.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-slate-700 dark:text-slate-200">{u.username}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
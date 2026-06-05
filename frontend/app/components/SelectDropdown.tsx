import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

export default function SelectDropdown({ value, options, onChange, placeholder, renderOption, renderSelected, error }: {
  value: string
  options: string[]
  onChange: (v: string) => void
  placeholder?: string
  renderOption?: (v: string) => React.ReactNode
  renderSelected?: (v: string) => React.ReactNode
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
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-xl border bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none transition focus:ring-2 ${
          error
            ? "border-rose-400 dark:border-rose-600 focus:border-rose-400 focus:ring-rose-100 dark:focus:ring-rose-900/30"
            : "border-slate-200 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 focus:ring-slate-100 dark:focus:ring-slate-700"
        }`}
      >
        <span className="text-sm">
          {value
            ? (renderSelected ? renderSelected(value) : value)
            : <span className="text-slate-400 dark:text-slate-500">{placeholder ?? "Select…"}</span>
          }
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 flex-none ml-2" />
      </button>
      {open && (
        <ul className="absolute left-0 z-20 mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
          {options.map((opt) => (
            <li
              key={opt}
              className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-700 ${opt === value ? "font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-700" : "text-slate-700 dark:text-slate-300"}`}
              onMouseDown={(e) => { e.preventDefault(); onChange(opt); setOpen(false) }}
            >
              {renderOption ? renderOption(opt) : opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
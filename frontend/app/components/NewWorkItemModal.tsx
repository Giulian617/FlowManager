import { useEffect, useRef } from "react"
import ReactDOM from "react-dom"
import { useNavigate } from "react-router"
import { Bug, CheckSquare, Zap, BookOpen, X } from "lucide-react"

const types = [
  {
    id: "task",
    label: "Task",
    description: "A unit of work to be completed",
    icon: <CheckSquare className="h-5 w-5" />,
    textClass: "text-sky-700 dark:text-sky-400",
    bgClass: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-950/70",
  },
  {
    id: "bug",
    label: "Bug",
    description: "A problem or defect that needs to be fixed",
    icon: <Bug className="h-5 w-5" />,
    textClass: "text-rose-700 dark:text-rose-400",
    bgClass: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-950/70",
  },
  {
    id: "user-story",
    label: "User Story",
    description: "A feature described from the user's perspective",
    icon: <BookOpen className="h-5 w-5" />,
    textClass: "text-emerald-700 dark:text-emerald-400",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/70",
  },
  {
    id: "epic",
    label: "Epic",
    description: "A large body of work spanning multiple items",
    icon: <Zap className="h-5 w-5" />,
    textClass: "text-violet-700 dark:text-violet-400",
    bgClass: "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-950/70",
  },
]

function ModalContent({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [onClose])

  const handleSelect = (typeId: string) => {
    onClose()
    navigate(`/project/work-items/new/${typeId}`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/50 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div ref={ref} className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Select work item type</h2>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id)}
              className={`flex flex-col gap-3 rounded-2xl border px-5 py-5 text-left transition ${t.bgClass}`}
            >
              <span className={`flex-none ${t.textClass}`}>{t.icon}</span>
              <div>
                <p className={`text-base font-semibold ${t.textClass}`}>{t.label}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function NewWorkItemModal({ onClose }: { onClose: () => void }) {
  return ReactDOM.createPortal(
    <ModalContent onClose={onClose} />,
    document.body
  )
}
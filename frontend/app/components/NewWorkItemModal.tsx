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
    textClass: "text-sky-700",
    bgClass: "bg-sky-50 border-sky-200 hover:bg-sky-100",
  },
  {
    id: "bug",
    label: "Bug",
    description: "A problem or defect that needs to be fixed",
    icon: <Bug className="h-5 w-5" />,
    textClass: "text-rose-700",
    bgClass: "bg-rose-50 border-rose-200 hover:bg-rose-100",
  },
  {
    id: "user-story",
    label: "User Story",
    description: "A feature described from the user's perspective",
    icon: <BookOpen className="h-5 w-5" />,
    textClass: "text-emerald-700",
    bgClass: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
  },
  {
    id: "epic",
    label: "Epic",
    description: "A large body of work spanning multiple items",
    icon: <Zap className="h-5 w-5" />,
    textClass: "text-violet-700",
    bgClass: "bg-violet-50 border-violet-200 hover:bg-violet-100",
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div ref={ref} className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Select work item type</h2>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
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
                <p className="text-sm text-slate-500 mt-0.5">{t.description}</p>
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
import { useState } from "react"
import { useNavigate } from "react-router"
import { Building2, ShieldCheck, ArrowRight } from "lucide-react"

export default function AdminMenu() {
  const navigate = useNavigate()
  const [hoveredCard, setHoveredCard] = useState<"org" | "admin" | null>(null)

  const cards = [
    {
      id: "org" as const,
      icon: Building2,
      title: "Organizations",
      description: "Browse and switch between organization workspaces.",
      cta: "View organizations",
      onClick: () => navigate("/select-org"),
      accent: "blue",
    },
    {
      id: "admin" as const,
      icon: ShieldCheck,
      title: "Admin panel",
      description: "Manage everything in a dedicated panel.",
      cta: "View dashboard",
      onClick: () => navigate("/admin/dashboard"),
      accent: "red",
    },
  ]

  const accentMap: Record<string, { icon: string; ring: string; badge: string }> = {
    blue: {
      icon: "bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
      ring: "hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-blue-100/60 dark:hover:shadow-blue-950/40",
      badge: "bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    },
    red: {
      icon: "bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800",
      ring: "hover:border-rose-300 dark:hover:border-rose-600 hover:shadow-rose-100/60 dark:hover:shadow-rose-950/40",
      badge: "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800",
    },
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-900">

      {/* Logo */}
      <div className="mb-10 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-100 dark:bg-blue-950 text-lg font-bold text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex-none">
          FM
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">FlowManager</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Project workspace</p>
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Select destination</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose where you'd like to go</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((card) => {
            const a = accentMap[card.accent]
            const Icon = card.icon
            const isHovered = hoveredCard === card.id

            return (
              <button
                key={card.id}
                onClick={card.onClick}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`
                  group relative text-left rounded-3xl border border-slate-200 dark:border-slate-700
                  bg-white dark:bg-slate-800 p-6 shadow-sm flex flex-col
                  transition-all duration-200 hover:shadow-md
                  ${a.ring}
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400
                `}
              >
                <div className={`mb-4 inline-grid h-11 w-11 place-items-center rounded-2xl ${a.icon}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {card.title}
                </p>
                <p className="flex-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {card.description}
                </p>
                <div className={`mt-5 inline-flex items-center gap-1.5 text-xs font-semibold rounded-xl px-3 py-1.5 transition-colors ${a.badge}`}>
                  {card.cta}
                  <ArrowRight
                    className={`h-3.5 w-3.5 transition-transform duration-150 ${isHovered ? "translate-x-0.5" : ""}`}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
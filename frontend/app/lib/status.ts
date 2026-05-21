export const statusMeta = {
  ToDo: {
    label: "To Do",
    headerClass: "bg-sky-50 border-sky-200 text-sky-700",
    dotClass: "bg-sky-500",
  },
  InProgress: {
    label: "In Progress",
    headerClass: "bg-amber-50 border-amber-200 text-amber-700",
    dotClass: "bg-amber-500",
  },
  Testing: {
    label: "Testing",
    headerClass: "bg-violet-50 border-violet-200 text-violet-700",
    dotClass: "bg-violet-500",
  },
  Done: {
    label: "Done",
    headerClass: "bg-emerald-50 border-emerald-200 text-emerald-700",
    dotClass: "bg-emerald-500",
  },
  Closed: {
    label: "Closed",
    headerClass: "bg-slate-50 border-slate-200 text-slate-700",
    dotClass: "bg-rose-500",
  },
} as const

export const workItemStatusMap: Record<string, keyof typeof statusMeta> = {
  "To Do": "ToDo",
  Open: "ToDo",
  "In progress": "InProgress",
  Done: "Done",
  Closed: "Closed",
  ToDo: "ToDo",
  InProgress: "InProgress",
  Testing: "Testing",
}

export const priorityMeta = {
  Critical: {
    label: "Critical",
    className: "bg-rose-600/10 text-rose-700",
  },
  High: {
    label: "High",
    className: "bg-amber-600/10 text-amber-700",
  },
  Medium: {
    label: "Medium",
    className: "bg-sky-600/10 text-sky-700",
  },
  Low: {
    label: "Low",
    className: "bg-emerald-600/10 text-emerald-700",
  },
  Blocker: {
    label: "Blocker",
    className: "bg-slate-200 text-slate-900",
  },
} as const

export const severityOptions = ["All", "Blocker", "Critical", "High", "Medium", "Low"] as const
export const deadlineOptions = ["All", "Overdue", "Next 7 days", "Later"] as const
export const statusOptions = ["All", "To Do", "In progress", "Done", "Closed"] as const

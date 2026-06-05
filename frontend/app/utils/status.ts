export const statusMeta = {
  ToDo: {
    label: "To Do",
    headerClass: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400",
    dotClass: "bg-sky-500",
  },
  InProgress: {
    label: "In Progress",
    headerClass: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400",
    dotClass: "bg-amber-500",
  },
  Testing: {
    label: "Testing",
    headerClass: "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400",
    dotClass: "bg-violet-500",
  },
  Done: {
    label: "Done",
    headerClass: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400",
    dotClass: "bg-emerald-500",
  },
  Closed: {
    label: "Closed",
    headerClass: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400",
    dotClass: "bg-rose-500",
  },
} as const

export const workItemStatusMap: Record<string, keyof typeof statusMeta> = {
  "To Do": "ToDo",
  "In progress": "InProgress",
  Done: "Done",
  Closed: "Closed",
  ToDo: "ToDo",
  InProgress: "InProgress",
  Testing: "Testing",
}

export const severityMeta = {
  Low: {
    label: "Low",
    className: "bg-emerald-600/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  Medium: {
    label: "Medium",
    className: "bg-sky-600/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  },
  High: {
    label: "High",
    className: "bg-amber-600/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  },
  Critical: {
    label: "Critical",
    className: "bg-rose-600/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  },
  Blocker: {
    label: "Blocker",
    className: "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100",
  },
} as const

export const severityOptions = ["All", "Blocker", "Critical", "High", "Medium", "Low"] as const
export const deadlineOptions = ["All", "Overdue", "Next 7 days", "Later"] as const
export const statusOptions = ["All", "To Do", "In progress", "Done", "Closed"] as const
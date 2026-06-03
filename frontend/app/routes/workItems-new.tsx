import { useParams } from "react-router"
import WorkItemForm, { type WorkItemType } from "../components/WorkItemForm"

export default function NewWorkItem() {
  const { type } = useParams<{ type: string }>()
  if (!["bug", "task", "epic", "user-story"].includes(type ?? "")) return (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
          <p className="text-2xl font-semibold text-slate-800">Unknown type: {type}</p>
          <p className="text-sm">Supported types: bug, task, epic, user-story</p>
        </div>
      )
  return <WorkItemForm type={type as WorkItemType} />
}
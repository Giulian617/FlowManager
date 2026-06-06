import { useEffect, useState } from "react"
import { useParams } from "react-router"
import WorkItemForm, { type WorkItemType } from "../components/WorkItemForm"
import { getWorkItemById } from "../api/workItem"
import type { WorkItemResponseDto } from "../types/workItem"

const typeMap: Record<string, WorkItemType> = {
  "Bug": "bug",
  "Task": "task",
  "User_Story": "user-story",
  "Epic": "epic",
}

export default function ViewWorkItem() {
  const { id } = useParams<{ id: string }>()
  const [item, setItem] = useState<WorkItemResponseDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getWorkItemById(Number(id))
        setItem(data)
      } catch (e) {
        console.error("Failed to load work item", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-sm text-slate-400 dark:text-slate-500">Loading…</div>
  )

  if (!item) return (
    <div className="flex flex-col items-center justify-center py-24 text-slate-500 dark:text-slate-400 gap-3">
      <p className="text-2xl font-semibold text-slate-800 dark:text-slate-200">Work item not found</p>
    </div>
  )

  return <WorkItemForm type={typeMap[item.itemType]} mode="view" initialData={item} />
}
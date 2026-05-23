import { useParams } from "react-router"
import NewBugPage from "../components/NewBugPage"
import NewEpicPage from "../components/NewEpicPage"
import NewTaskPage from "../components/NewTaskPage"
import NewUserStoryPage from "../components/NewUserStoryPage"

export default function WorkItemNew() {
  const { type } = useParams<{ type: string }>()

  switch (type) {
    case "bug":
      return <NewBugPage />
    case "task":         
      return <NewTaskPage />
    case "epic":         
      return <NewEpicPage />
    case "user-story":   
      return <NewUserStoryPage />
    default:
      return (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
          <p className="text-2xl font-semibold text-slate-800">Unknown type: {type}</p>
          <p className="text-sm">Supported types: bug, task, epic, user-story</p>
        </div>
      )
  }
}

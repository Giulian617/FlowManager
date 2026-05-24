import { useParams } from "react-router"
import NewBugPage from "../components/NewBugPage"
import NewEpicPage from "../components/NewEpicPage"
import NewTaskPage from "../components/NewTaskPage"
import NewUserStoryPage from "../components/NewUserStoryPage"

const workItems = [
  { id: "5", type: "Bug",        title: "Implement attachment feature",     status: "To Do",       severity: "Medium",  assigned: ["Mihai Pop"],   deadline: "2026-06-02", description: "Users cannot attach files to work items. The attachment button is visible but clicking it does nothing.", parent: "" },
  { id: "4", type: "Task",       title: "Drop-down button not working",     status: "Closed",      severity: "Blocker", assigned: [],              deadline: "2026-05-21", description: "The drop-down component in the settings panel does not respond to click events in Chrome and Firefox.", parent: "" },
  { id: "3", type: "Epic",       title: "Save settings button not working", status: "Closed",      severity: "Low",     assigned: [],              deadline: "2026-06-10", description: "Epic covering all issues related to the settings page save functionality across browsers and devices.", parent: "", children: [] },
  { id: "2", type: "User Story", title: "Implement user settings",          status: "In progress", severity: "High",    assigned: ["Luke Tomson"], deadline: "2026-05-29", description: "As a user, I want to be able to update my profile settings including name, email, and notification preferences.", parent: "" },
  { id: "1",  type: "Bug",        title: "Login functionality not working",  status: "Testing",     severity: "Low",     assigned: ["Luke Tomson"], deadline: "2026-05-26", description: "Login button becomes unresponsive after the first failed attempt. Requires page refresh to try again.", parent: "" },
]

export default function WorkItemEdit() {
  const { id } = useParams<{ id: string }>()
  const item = workItems.find((w) => w.id === id)

  if (!item) return (
    <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
      <p className="text-2xl font-semibold text-slate-800">Work item not found</p>
    </div>
  )

  switch (item.type) {
    case "Bug":        
      return <NewBugPage initialData={item} />
    case "Task":       
      return <NewTaskPage initialData={item} />
    case "Epic":       
      return <NewEpicPage initialData={item} />
    case "User Story": 
      return <NewUserStoryPage initialData={item} />
    default:           
      return null
  }
}
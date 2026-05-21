import React from "react"
import KanbanBoard from "../components/KanbanBoard.tsx"

export default function Home() {
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>Kanban — Task-urile mele</h1>
      <KanbanBoard severityFilter="All" deadlineFilter="All" />
    </div>
  )
}
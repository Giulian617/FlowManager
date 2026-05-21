import React from "react"

type Ticket = {
  id: string
  title: string
  description?: string
  priority?: string
}

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 6,
      padding: 10,
      marginBottom: 8,
      boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
    }}>
      <div style={{ fontWeight: 600 }}>{ticket.title}</div>
      {ticket.priority && (
        <div style={{ fontSize: 12, color: "#666" }}>Priority: {ticket.priority}</div>
      )}
      {ticket.description && (
        <div style={{ marginTop: 6, fontSize: 13, color: "#444" }}>{ticket.description}</div>
      )}
    </div>
  )
}

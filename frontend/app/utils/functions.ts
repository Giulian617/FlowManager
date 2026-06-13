import { redirect } from "react-router"

export function getInitials(username: string): string {
  const parts = username.split(/[.\s_-]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return username.slice(0, 2).toUpperCase()
}

export function formatDateShortMonth(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ro-RO", { day: "2-digit", month: "short", year: "numeric" })
}

export function formatDateLongMonth(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ro-RO", { day: "2-digit", month: "long", year: "numeric" })
}

export function formatDateTimeShortMonth(dateStr: string) {
  return new Date(dateStr).toLocaleString("ro-RO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export async function requireAuth() {
  const accessToken = localStorage.getItem("accessToken")
  const tokenExpiry = Number(localStorage.getItem("tokenExpiry") ?? 0)
  const isLoggedIn = accessToken !== null && Date.now() < tokenExpiry

  if (!isLoggedIn) {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("tokenExpiry")
    localStorage.removeItem("userRole")
    return redirect("/")
  }

  return null
}
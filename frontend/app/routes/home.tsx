import { Navigate } from "react-router"

function getRedirectPath() {
  if (typeof window === "undefined") return "/login"
  const isLoggedIn = localStorage.getItem("accessToken") !== null
  const orgId = localStorage.getItem("selectedOrg")
  const projectId = localStorage.getItem("selectedProject")

  if (!isLoggedIn) return "/login"
  if (!orgId) return "/select-org"
  if (!projectId) return "/projects"
  return "/dashboard"
}

export default function Home() {
  return <Navigate to={getRedirectPath()} replace />
}
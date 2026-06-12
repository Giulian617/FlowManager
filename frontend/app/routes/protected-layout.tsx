import { Outlet, redirect } from "react-router"
import { requireAuth } from "../utils/functions"

export const clientLoader = requireAuth

export default function ProtectedLayout() {
  return <Outlet />
}
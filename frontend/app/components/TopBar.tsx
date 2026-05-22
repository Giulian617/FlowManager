import React, { useEffect, useRef, useState } from "react"
import { useKeycloak } from "@react-keycloak/web"
import { useNavigate } from "react-router"
import { Search, Bell, Settings } from "lucide-react"

export default function TopBar() {
  const { keycloak, initialized } = useKeycloak()
  const [search, setSearch] = useState("")
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [])

  const userName = initialized && keycloak?.authenticated ? keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username || "User" : "Guest"
  const initials = userName
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .slice(0, 2)

  return (
    <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Search className="mr-3 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none"
          />
        </div>

        <button className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm transition hover:bg-slate-100">
          <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-semibold text-white">3</span>
          <Bell className="h-5 w-5" />
        </button>

        <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm transition hover:bg-slate-100" aria-label="Settings">
          <Settings className="h-5 w-5" />
        </button>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileMenuOpen((open) => !open)}
            className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            aria-label="User profile"
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen}
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-100 text-blue-900 border border-blue-900 text-xs font-semibold">
              {initials}
            </span>
            <span className="truncate max-w-[100px] text-left text-sm text-slate-900">{userName}</span>
          </button>
          {profileMenuOpen && (
            <div className="absolute right-0 z-20 mt-2 w-44 rounded-2xl border border-slate-200 bg-white shadow-lg" role="menu">
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false)
                  navigate("/profile")
                }}
                className="w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                role="menuitem"
              >
                Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false)
                  keycloak?.authenticated ? keycloak.logout() : keycloak?.login()
                }}
                className="w-full rounded-b-2xl px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                role="menuitem"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

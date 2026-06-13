import React, { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { User, Moon, Sun, Monitor, Shield, LogOut, X, Settings } from "lucide-react"
import { logout } from "../api/auth"
import { getCurrentUser } from "../api/user"
import { useTheme } from "../context/ThemeContext"
import { getInitials } from "../utils/functions"

function SettingsPopup({ onClose }: { onClose: () => void }) {
  const { theme, setTheme } = useTheme()

  return (
    <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Settings</span>
        <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Appearance</p>
        <div className="flex gap-2">
          {([["light", Sun, "Light"], ["dark", Moon, "Dark"], ["system", Monitor, "System"]] as const).map(([val, Icon, label]) => (
            <button
              key={val}
              onClick={() => setTheme(val)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl border py-2.5 text-xs font-medium transition ${
                theme === val
                  ? "border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                  : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TopBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const routePrefix = location.pathname.startsWith("/admin")
    ? "/admin"
    : location.pathname.startsWith("/org")
      ? "/org"
      : "/project"

  const [currentUser, setCurrentUser] = useState<{ username: string; email: string } | null>(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const settingsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getCurrentUser().then(setCurrentUser).catch(() => {})
  }, [])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setSettingsOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileMenuOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const userName = currentUser?.username ?? ""

  return (
    <div className="mb-6 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="ml-auto flex items-center gap-3">
          
          {/* Settings */}
          <div ref={settingsRef} className="relative">
            <button
              onClick={() => { setSettingsOpen((o) => !o); setProfileMenuOpen(false) }}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-sm transition hover:bg-slate-100 dark:hover:bg-slate-600"
            >
              <Settings className="h-5 w-5" />
            </button>
            {settingsOpen && <SettingsPopup onClose={() => setSettingsOpen(false)} />}
          </div>

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => { setProfileMenuOpen((o) => !o); setSettingsOpen(false) }}
              className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition hover:bg-slate-100 dark:hover:bg-slate-600"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
                {getInitials(userName)}
              </span>
              <span className="truncate max-w-25 text-left text-sm text-slate-900 dark:text-slate-100">{userName}</span>
            </button>
            {profileMenuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{userName}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{currentUser?.email ?? ""}</p>
                </div>
                <button
                  onClick={() => { setProfileMenuOpen(false); navigate(`${routePrefix}/profile`) }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                >
                  <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  View profile
                </button>
                <div className="border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={async () => {
                      setProfileMenuOpen(false)
                      try {
                        await logout()
                      } finally {
                        localStorage.removeItem("accessToken")
                        localStorage.removeItem("refreshToken")
                        localStorage.removeItem("tokenExpiry")
                        localStorage.removeItem("selectedOrg")
                        localStorage.removeItem("selectedProject")
                        localStorage.removeItem("selectedProjectName")
                        window.location.href = "/"
                      }
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
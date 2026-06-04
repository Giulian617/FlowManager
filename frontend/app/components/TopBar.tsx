import React, { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { Search, Bell, Settings, X, Check, Info, AlertTriangle, ChevronRight, User, Moon, Sun, Monitor, Shield, LogOut, Bug, BookOpen, Zap, CheckSquare } from "lucide-react"
import { logout } from "../api/auth"
import { getCurrentUser } from "../api/user"
import { useTheme } from "../context/ThemeContext"

const MOCK_NOTIFICATIONS = [
  { id: "1", type: "info", title: "New comment on WI #2", desc: "Mihai Pop left a comment on your task.", time: "2m ago", read: false, workItemId: "2" },
  { id: "2", type: "success", title: "WI #3 marked as Done", desc: "API rate limiting was completed.", time: "1h ago", read: false, workItemId: "3" },
  { id: "3", type: "warning", title: "Deadline approaching", desc: "FlowManager Frontend ends in 3 days.", time: "3h ago", read: false, workItemId: null },
  { id: "4", type: "info", title: "You were added to Mobile App", desc: "Joe Nik added you to the project.", time: "1d ago", read: true, workItemId: null },
  { id: "5", type: "success", title: "WI #5 moved in Testing", desc: "Auth token refresh bug is in testing.", time: "2d ago", read: true, workItemId: "5" },
]

function getInitials(username: string): string {
  const parts = username.split(/[.\s_-]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return username.slice(0, 2).toUpperCase()
}

function NotificationsPopup({ onClose, notifications, setNotifications }: {
  onClose: () => void
  notifications: typeof MOCK_NOTIFICATIONS
  setNotifications: React.Dispatch<React.SetStateAction<typeof MOCK_NOTIFICATIONS>>
}) {
  const navigate = useNavigate()
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  const unreadCount = notifications.filter((n) => !n.read).length

  const iconMap: Record<string, React.ReactNode> = {
    info: <Info className="h-4 w-4 text-sky-500" />,
    success: <Check className="h-4 w-4 text-emerald-500" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  }

  return (
    <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">Notifications</span>
          {unreadCount > 0 && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-semibold text-white">{unreadCount}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-slate-400 hover:text-slate-600 transition">Mark all read</button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => {
              setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))
              if (n.workItemId) {
                navigate(`/work-items/${n.workItemId}/edit`)
                onClose()
              }
            }}
            className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 transition hover:bg-slate-50 cursor-pointer ${!n.read ? "bg-sky-50/40" : ""}`}
          >
            <div className="flex h-7 w-7 flex-none items-center justify-center rounded-xl bg-slate-100 mt-0.5">
              {iconMap[n.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${!n.read ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>{n.title}</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.desc}</p>
              <p className="text-[10px] text-slate-300 mt-1">{n.time}</p>
            </div>
            {!n.read && <div className="h-2 w-2 rounded-full bg-sky-500 flex-none mt-1.5" />}
          </div>
        ))}
      </div>
      <div className="px-4 py-2.5 border-t border-slate-100">
        <button className="text-xs text-slate-400 hover:text-slate-600 transition w-full text-center">View all notifications</button>
      </div>
    </div>
  )
}

function SettingsPopup({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const routePrefix = location.pathname.startsWith("/org") ? "/org" : "/project"
  const { theme, setTheme } = useTheme()

  return (
    <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <span className="text-sm font-semibold text-slate-900">Settings</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Appearance</p>
        <div className="flex gap-2">
          {([["light", Sun, "Light"], ["dark", Moon, "Dark"], ["system", Monitor, "System"]] as const).map(([val, Icon, label]) => (
            <button
              key={val}
              onClick={() => setTheme(val)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl border py-2.5 text-xs font-medium transition ${
                theme === val ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={() => {
          navigate(`${routePrefix}/notification-settings`)
          onClose()
        }}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-2.5">
          <Bell className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-700">Notification settings</span>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400" />
      </button>
    </div>
  )
}

export default function TopBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const routePrefix = location.pathname.startsWith("/org") ? "/org" : "/project"

  const [currentUser, setCurrentUser] = useState<{ username: string; email: string } | null>(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  const notifRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getCurrentUser().then(setCurrentUser).catch(() => {})
  }, [])

  useEffect(() => {
      const h = (e: MouseEvent) => {
        if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
        if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setSettingsOpen(false)
        if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileMenuOpen(false)
      }
      document.addEventListener("mousedown", h)
      return () => document.removeEventListener("mousedown", h)
    }, [])

  const userName = currentUser?.username ?? ""
  const initials = getInitials(userName)
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
      <div className="flex items-center gap-3">

        {/* Notifications */}
        <div ref={notifRef} className="relative ml-auto">
          <button
            onClick={() => { setNotifOpen((o) => !o); setSettingsOpen(false); setProfileMenuOpen(false) }}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm transition hover:bg-slate-100"
          >
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-semibold text-white">{unreadCount}</span>
            )}
            <Bell className="h-5 w-5" />
          </button>
          {notifOpen && <NotificationsPopup onClose={() => setNotifOpen(false)} notifications={notifications} setNotifications={setNotifications} />}
        </div>

        {/* Settings */}
        <div ref={settingsRef} className="relative">
          <button
            onClick={() => { setSettingsOpen((o) => !o); setNotifOpen(false); setProfileMenuOpen(false) }}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm transition hover:bg-slate-100"
          >
            <Settings className="h-5 w-5" />
          </button>
          {settingsOpen && <SettingsPopup onClose={() => setSettingsOpen(false)} />}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setProfileMenuOpen((o) => !o); setNotifOpen(false); setSettingsOpen(false) }}
            className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-100 text-blue-900 border border-blue-200 text-xs font-semibold">
              {initials}
            </span>
            <span className="truncate max-w-25 text-left text-sm text-slate-900">{userName}</span>
          </button>
          {profileMenuOpen && (
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
                <p className="text-xs text-slate-400 truncate">{currentUser?.email ?? ""}</p>
              </div>
              <button
                onClick={() => { setProfileMenuOpen(false); navigate(`${routePrefix}/profile`) }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                <User className="h-4 w-4 text-slate-400" />
                View profile
              </button>
              <button
                onClick={() => { setProfileMenuOpen(false); navigate(`${routePrefix}/profile`) }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                <Shield className="h-4 w-4 text-slate-400" />
                Security
              </button>
              <div className="border-t border-slate-100">
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
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition"
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
  )
}
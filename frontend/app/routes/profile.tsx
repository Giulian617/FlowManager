import React, { useRef, useState, useEffect } from "react"
import { Mail, User, Phone, Lock, Shield } from "lucide-react"
import { getCurrentUser, updateUser } from "../api/user"
import type { UserResponseDto } from "../types/user"

function getInitials(username: string): string {
  const parts = username.split(/[.\s_-]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return username.slice(0, 2).toUpperCase()
}

export default function Profile() {
  const [user, setUser] = useState<UserResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const initialProfile = useRef<UserResponseDto | null>(null)

  useEffect(() => {
    getCurrentUser()
      .then((u: UserResponseDto) => {
        console.log(u)
        setUser(u)
        setFirstName(u.firstName)
        setLastName(u.lastName)
        setEmail(u.email)
        setPhone(u.phoneNumber)
        initialProfile.current = u
      })
      .catch(() => setFetchError("Failed to load profile. Please refresh."))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <p className="text-slate-500">Loading profile…</p>
    </div>
  )

  const initials = getInitials(user?.username ?? "")

  const handleSaveProfile = async () => {
    if (!user) return
    setSaveError(null)
    try {
      const updated: UserResponseDto = await updateUser(user.id, {
        firstName,
        lastName,
        email,
        phoneNumber: phone,
      })
      setUser(updated)
      initialProfile.current = updated
      setFirstName(updated.firstName)
      setLastName(updated.lastName)
      setEmail(updated.email)
      setPhone(updated.phoneNumber)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setSaveError("Failed to save changes. Please try again.")
    }
  }

  const handleCancelProfile = () => {
    if (!initialProfile.current) return
    setFirstName(initialProfile.current.firstName)
    setLastName(initialProfile.current.lastName)
    setEmail(initialProfile.current.email)
    setPhone(initialProfile.current.phoneNumber)
  }

  const isProfileDirty =
    !!initialProfile.current && (
      firstName !== initialProfile.current.firstName ||
      lastName !== initialProfile.current.lastName ||
      email !== initialProfile.current.email ||
      phone !== initialProfile.current.phoneNumber
    )

  const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 flex items-center justify-center">
        <svg className="h-6 w-6 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
        </svg>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <p className="text-sm text-rose-600">{fetchError}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Account</p>
        <h1 className="text-3xl font-semibold text-slate-900">My Profile</h1>
      </header>

      {/* Personal Information */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-semibold text-slate-900">Personal Information</h2>

        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="flex-none">
            <div className="h-20 w-20 rounded-3xl bg-blue-100 border border-blue-200 flex items-center justify-center text-2xl font-semibold text-blue-900">
              {initials}
            </div>
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">{firstName} {lastName}</p>
            <p className="text-sm text-slate-400">{user?.role}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">First Name</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className={inputCls + " pl-9"} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Last Name</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className={inputCls + " pl-9"} />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className={inputCls + " pl-9"} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Phone</label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className={inputCls + " pl-9"} />
          </div>
        </div>

        {/* Role — read-only */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Role</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <div className={inputCls + " pl-9 cursor-default text-slate-500 select-none"}>
              {user?.role ?? "—"}
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-400">Role is managed only by your administrator.</p>
        </div>

        {saveError && <p className="text-xs text-rose-600 font-medium">{saveError}</p>}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          {saved && <span className="text-sm text-emerald-600 font-medium">Changes saved successfully.</span>}
          <button
            onClick={handleCancelProfile}
            disabled={!isProfileDirty}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={!isProfileDirty}
            className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save changes
          </button>
        </div>
      </section>

      {/* Password — delegated to Keycloak */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">Change Password</h2>
        </div>
        <p className="text-sm text-slate-500">
          Password changes are managed through your identity provider.
        </p>
        <button
          type="button"
          onClick={() => window.location.href = "http://localhost:8080/realms/flowmanager/login-actions/reset-credentials"}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
        >
          <Shield className="h-4 w-4 text-slate-400" />
          Reset password via Keycloak
        </button>
      </section>
    </div>
  )
}
import React, { useRef, useState } from "react"
import { Camera, Mail, User, Phone, Building2, Shield, Eye, EyeOff } from "lucide-react"

export default function Profile() {
  const [avatar, setAvatar] = useState<string | null>(null)
  const [firstName, setFirstName] = useState("Mihai")
  const [lastName, setLastName] = useState("Pop")
  const [email, setEmail] = useState("mihai.pop@acme.com")
  const [phone, setPhone] = useState("+40 712 345 678")
  const [role, setRole] = useState("Developer")
  const [bio, setBio] = useState("")

  const [codeSent, setCodeSent] = useState(false)
  const [codeMethod, setCodeMethod] = useState<"email" | "phone">("email")
  const [codeVerified, setCodeVerified] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [codeError, setCodeError] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [saved, setSaved] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatar(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = () => {
    initialProfile.current = { firstName, lastName, email, phone, role, bio, avatar }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
}

  const handleSavePassword = () => {
    setPasswordError("")
    if (newPassword.length < 8) return setPasswordError("New password must be at least 8 characters.")
    if (newPassword !== confirmPassword) return setPasswordError("Passwords do not match.")
    setPasswordSaved(true)
    setCodeSent(false)
    setCodeVerified(false)
    setVerificationCode("")
    setNewPassword("")
    setConfirmPassword("")
    setTimeout(() => setPasswordSaved(false), 3000)
  }

  const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
  const initialProfile = useRef({ firstName, lastName, email, phone, role, bio, avatar })
  const isProfileDirty =
    firstName !== initialProfile.current.firstName ||
    lastName !== initialProfile.current.lastName ||
    email !== initialProfile.current.email ||
    phone !== initialProfile.current.phone ||
    role !== initialProfile.current.role ||
    bio !== initialProfile.current.bio ||
    avatar !== initialProfile.current.avatar

  //const isPasswordDirty = currentPassword !== "" || newPassword !== "" || confirmPassword !== ""

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Account</p>
        <h1 className="text-3xl font-semibold text-slate-900">My Profile</h1>
      </header>

      {/* Profile picture + basic info */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-semibold text-slate-900">Personal Information</h2>

        {/* Profile picture */}
        <div className="flex items-center gap-5">
          <div className="relative flex-none">
            {avatar ? (
              <img src={avatar} alt="avatar" className="h-20 w-20 rounded-3xl object-cover border border-slate-200" />
            ) : (
              <div className="h-20 w-20 rounded-3xl bg-blue-100 border border-blue-200 flex items-center justify-center text-2xl font-semibold text-blue-900">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white shadow-md transition hover:bg-slate-700"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">{firstName} {lastName}</p>
            <p className="text-sm text-slate-400">{role}</p>
            <button onClick={() => fileRef.current?.click()} className="mt-1.5 text-xs text-slate-400 hover:text-slate-600 transition underline underline-offset-2">
              Change photo
            </button>
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

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Role</label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Your role" className={inputCls + " pl-9"} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
            placeholder="Tell your team a little about yourself…"
            className={inputCls + " resize-none"} />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          {saved && <span className="text-sm text-emerald-600 font-medium">Changes saved successfully.</span>}
          <button
            onClick={() => {
              setFirstName(initialProfile.current.firstName)
              setLastName(initialProfile.current.lastName)
              setEmail(initialProfile.current.email)
              setPhone(initialProfile.current.phone)
              setRole(initialProfile.current.role)
              setBio(initialProfile.current.bio)
              setAvatar(initialProfile.current.avatar)
            }}
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

      {/* Password */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">Change Password</h2>
        </div>

        {!codeSent ? (
          <>
            <p className="text-sm text-slate-500">To change your password, we'll send a verification code to your email or phone number.</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setCodeSent(true); setCodeMethod("email") }}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
              >
                <Mail className="h-4 w-4 text-slate-400" />
                Send code via Email
              </button>
              <button
                onClick={() => { setCodeSent(true); setCodeMethod("phone") }}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
              >
                <Phone className="h-4 w-4 text-slate-400" />
                Send code via SMS
              </button>
            </div>
          </>
        ) : !codeVerified ? (
          <>
            <p className="text-sm text-slate-500">
              A verification code was sent to your {codeMethod === "email" ? "email address" : "phone number"}.
              <button onClick={() => { setCodeSent(false); setVerificationCode(""); setCodeError("") }} className="ml-1.5 text-slate-700 underline underline-offset-2 hover:text-slate-900">Change method</button>
            </p>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Verification Code</label>
              <input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className={inputCls}
              />
            </div>
            {codeError && <p className="text-xs text-rose-600 font-medium">{codeError}</p>}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => { setCodeSent(false); setVerificationCode(""); setCodeError("") }}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (verificationCode.length !== 6) return setCodeError("Please enter the 6-digit code.")
                  // mock: orice cod de 6 cifre e valid
                  setCodeVerified(true)
                  setCodeError("")
                }}
                disabled={verificationCode.length === 0}
                className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Verify Code
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-500">Identity verified. You can now set a new password.</p>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">New Password</label>
              <div className="relative">
                <input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••" className={inputCls + " pr-10"} />
                <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Confirm New Password</label>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" className={inputCls + " pr-10"} />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {passwordError && <p className="text-xs text-rose-600 font-medium">{passwordError}</p>}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              {passwordSaved && <span className="text-sm text-emerald-600 font-medium">Password updated successfully.</span>}
              <button
                onClick={() => { setCodeSent(false); setCodeVerified(false); setVerificationCode(""); setNewPassword(""); setConfirmPassword(""); setPasswordError("") }}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePassword}
                disabled={newPassword === "" && confirmPassword === ""}
                className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Update password
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
import React, { useState } from "react"
import { useNavigate } from "react-router"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { login } from "../api/auth"

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [usernameTouched, setUsernameTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)

  const usernameOk = username.trim() !== ""
  const passwordOk = password.length >= 3
  const canSubmit = usernameOk && passwordOk && !loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const data = await login(username, password)
      localStorage.setItem("accessToken", data.accessToken)
      localStorage.setItem("refreshToken", data.refreshToken)
      localStorage.setItem("tokenExpiry", String(Date.now() + data.expiresIn * 1000))
      navigate("/select-org", { replace: true })
    } catch {
      setError("Invalid username or password.")
    } finally {
      setLoading(false)
    }
  }

  const inputCls = (valid: boolean, touched: boolean) =>
    `w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
      touched && !valid
        ? "border-rose-300 bg-rose-50/30 focus:border-rose-400 focus:ring-rose-100"
        : "border-slate-200 bg-white focus:border-slate-400 focus:ring-slate-200"
    }`

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-slate-50">

      {/* Logo */}
      <div className="mb-10 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-900 text-lg font-bold text-white flex-none">FM</div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">FlowManager</p>
          <p className="text-xs text-slate-400">Project workspace</p>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-1.5 text-sm text-slate-500">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          {/* Username */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => setUsernameTouched(true)}
              placeholder="your username"
              autoComplete="username"
              className={inputCls(usernameOk, usernameTouched)}
            />
            {usernameTouched && !usernameOk && (
              <p className="mt-1 text-xs text-rose-500">Username is required.</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setPasswordTouched(true)}
                placeholder="••••••••"
                autoComplete="current-password"
                className={inputCls(passwordOk, passwordTouched) + " pr-11"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordTouched && !passwordOk && (
              <p className="mt-1 text-xs text-rose-500">Password is required.</p>
            )}
          </div>

          {/* Forgot password */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => window.location.href = "http://localhost:8080/realms/flowmanager/login-actions/reset-credentials"}
              className="text-xs text-slate-400 transition hover:text-slate-700"
            >
              Forgot password?
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
              </svg>
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{" "}
          <button className="font-medium text-slate-700 transition hover:text-slate-900">
            Contact your manager
          </button>
        </p>
      </div>
    </div>
  )
}
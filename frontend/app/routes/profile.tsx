export default function Profile() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">My Profile</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Account details</h1>
        </div>
      </div>
      <div className="space-y-4 text-sm text-slate-700">
        <p>Welcome to your profile area. Here you can add user details, settings, and preferences.</p>
        <p className="text-slate-500">This is a placeholder page for the profile action in the top bar menu.</p>
      </div>
    </div>
  )
}

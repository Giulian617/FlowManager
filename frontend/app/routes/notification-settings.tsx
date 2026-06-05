import { useState } from "react"
import { Mail, Smartphone, Globe, ChevronDown } from "lucide-react"

const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onChange(!value) }}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${value ? "bg-slate-900 dark:bg-slate-100" : "bg-slate-200 dark:bg-slate-600"}`}
  >
    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white dark:bg-slate-900 shadow transition-transform ${value ? "translate-x-4.5" : "translate-x-0.5"}`} />
  </button>
)

const defaultTriggers = {
  assigned: true,
  statusChange: true,
  severity: true,
  comment: true,
  tagged: true,
  reopened: false,
  deleted: false,
  deadline: true,
  deadlineDays: 3,
}

const TRIGGERS = [
  ["Assigned to a work item", "assigned"],
  ["Work item status changes", "statusChange"],
  ["Work item severity changes", "severity"],
  ["Comment on my work item", "comment"],
  ["Tagged in a comment", "tagged"],
  ["Work item reopened", "reopened"],
  ["Work item deleted", "deleted"],
]

export default function Settings() {
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifPush, setNotifPush] = useState(true)
  const [notifWeb, setNotifWeb] = useState(true)
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null)
  const [emailSettings, setEmailSettings] = useState({ ...defaultTriggers })
  const [pushSettings, setPushSettings] = useState({ ...defaultTriggers })
  const [webSettings, setWebSettings] = useState({ ...defaultTriggers })
  const [saved, setSaved] = useState(false)

  const channels = [
    { Icon: Mail, label: "Email notifications", enabled: notifEmail, setEnabled: setNotifEmail, settings: emailSettings, setSettings: setEmailSettings },
    { Icon: Smartphone, label: "Push notifications", enabled: notifPush, setEnabled: setNotifPush, settings: pushSettings, setSettings: setPushSettings },
    { Icon: Globe, label: "Web notifications", enabled: notifWeb, setEnabled: setNotifWeb, settings: webSettings, setSettings: setWebSettings },
  ]
  const initialState = {
    notifEmail, notifPush, notifWeb,
    email: { ...defaultTriggers },
    push: { ...defaultTriggers },
    web: { ...defaultTriggers },
  }

  const [lastSaved, setLastSaved] = useState(initialState)
  const isDirty =
    notifEmail !== lastSaved.notifEmail ||
    notifPush !== lastSaved.notifPush ||
    notifWeb !== lastSaved.notifWeb ||
    JSON.stringify(emailSettings) !== JSON.stringify(lastSaved.email) ||
    JSON.stringify(pushSettings) !== JSON.stringify(lastSaved.push) ||
    JSON.stringify(webSettings) !== JSON.stringify(lastSaved.web)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Settings</p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Preferences</h1>
      </header>

      <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notification Channels</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Choose how you want to receive notifications</p>
        </div>

        {channels.map(({ Icon, label, enabled, setEnabled, settings, setSettings }) => {
          const isExpanded = expandedChannel === label
          return (
            <div key={label} className="border-b border-slate-100 dark:border-slate-700 last:border-0">
              <div
                className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                onClick={() => { if (enabled) setExpandedChannel(isExpanded ? null : label) }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">
                    <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Toggle value={enabled} onChange={(v) => { setEnabled(v); if (!v) setExpandedChannel(null) }} />
                  {enabled && (
                    <ChevronDown className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  )}
                </div>
              </div>

              {isExpanded && enabled && (
                <div className="px-6 pb-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 pt-3 mb-3">Notify me when</p>
                  <div className="space-y-3">
                    {TRIGGERS.map(([triggerLabel, key]) => (
                      <div key={key} className="flex items-center justify-between py-1">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{triggerLabel}</span>
                        <Toggle
                          value={settings[key as keyof typeof defaultTriggers] as boolean}
                          onChange={(v) => setSettings((prev) => ({ ...prev, [key]: v }))}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Deadline reminder</span>
                      <Toggle
                        value={settings.deadline}
                        onChange={(v) => setSettings((prev) => ({ ...prev, deadline: v }))}
                      />
                    </div>
                    {settings.deadline && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 dark:text-slate-500">Notify</span>
                        <select
                          value={settings.deadlineDays}
                          onChange={(e) => setSettings((prev) => ({ ...prev, deadlineDays: Number(e.target.value) }))}
                          className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 outline-none"
                        >
                          {[1, 2, 3, 5, 7, 14].map((d) => (
                            <option key={d} value={d}>{d} day{d !== 1 ? "s" : ""} before deadline</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </section>

      <div className="flex items-center justify-end gap-3">
        {saved && !isDirty && (
          <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Changes saved successfully.</span>
        )}
        <button
          onClick={() => {
            setNotifEmail(lastSaved.notifEmail)
            setNotifPush(lastSaved.notifPush)
            setNotifWeb(lastSaved.notifWeb)
            setEmailSettings({ ...lastSaved.email })
            setPushSettings({ ...lastSaved.push })
            setWebSettings({ ...lastSaved.web })
            setExpandedChannel(null)
          }}
          disabled={!isDirty}
          className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          disabled={!isDirty}
          onClick={() => {
            setLastSaved({
              notifEmail, notifPush, notifWeb,
              email: { ...emailSettings },
              push: { ...pushSettings },
              web: { ...webSettings },
            })
            setSaved(true)
          }}
          className="rounded-2xl bg-slate-900 dark:bg-slate-100 px-5 py-2.5 text-sm font-semibold text-white dark:text-slate-900 transition hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save changes
        </button>
      </div>
    </div>
  )
}
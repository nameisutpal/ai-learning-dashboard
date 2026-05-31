import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Settings,
  Palette,
  Bell,
  Download,
  Upload,
  RotateCcw,
  LayoutGrid,
  Target,
  LogOut,
  User,
} from 'lucide-react'
import { PageShell } from '../components/page/PageShell.jsx'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { SectionHeader } from '../components/ui/SectionHeader.jsx'
import { ThemeToggle } from '../components/layout/ThemeToggle.jsx'
import { usePreferences } from '../hooks/usePreferences.js'
import { useToast } from '../hooks/useToast.js'
import { useAuth } from '../hooks/useAuth.js'
import {
  serializeDashboardExport,
  validateDashboardImport,
  applyDashboardImport,
} from '../services/dashboardDataPortability.js'

/**
 * SettingsPage — theme, goals, density, notification toggles, and JSON backup/restore.
 * Everything persists in LocalStorage (see `PreferencesContext` + `dashboardDataPortability`).
 */
export function SettingsPage() {
  const { preferences, setPreference, setPreferences, resetPreferences } = usePreferences()
  const { showToast } = useToast()
  const { user, signOutUser } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [importing, setImporting] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOutUser()
      showToast('Signed out')
      navigate('/login', { replace: true })
    } catch {
      showToast('Could not sign out.', 'error')
    } finally {
      setSigningOut(false)
    }
  }

  function downloadExport() {
    const blob = new Blob([serializeDashboardExport()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-learning-dashboard-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Dashboard data exported')
  }

  async function handleImportFile(file) {
    if (!file) return
    setImporting(true)
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const result = validateDashboardImport(parsed)
      if (!result.ok) {
        showToast(result.errors.join(' '), 'error')
        return
      }
      applyDashboardImport(result.payload)
      showToast('Import complete — your workspace was restored from the file.')
    } catch {
      showToast('Could not read that JSON file.', 'error')
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <PageShell
      icon={Settings}
      title="Settings"
      description="Tune the dashboard for how you learn — every control here writes to LocalStorage so the experience survives refresh without a backend."
      highlights={[
        {
          title: 'Appearance',
          text: 'Switch light/dark neon glass themes or follow your OS automatically.',
        },
        {
          title: 'Goals',
          text: 'Daily and weekly hour targets feed directly into dashboard KPI math.',
        },
        {
          title: 'Data portability',
          text: 'Export/import JSON snapshots for backups or moving between browsers.',
        },
      ]}
    >
      <Card className="mb-6 space-y-4" padding="p-5 md:p-6">
        <SectionHeader
          title="Account"
          subtitle="You are signed in with Firebase Authentication. Sessions persist across refresh in this browser."
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-200/90 bg-violet-50 text-violet-700 dark:border-white/10 dark:bg-white/5 dark:text-violet-200">
              <User className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                {user?.displayName || 'Learner'}
              </p>
              <p className="truncate text-xs text-zinc-500">{user?.email ?? '—'}</p>
              {user?.uid ? <p className="mt-1 truncate font-mono text-[10px] text-zinc-400">UID: {user.uid}</p> : null}
            </div>
          </div>
          <Button type="button" variant="secondary" loading={signingOut} onClick={handleSignOut}>
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-6" padding="p-5 md:p-6">
          <SectionHeader
            title="Appearance"
            subtitle="Theme is also available from the navbar for quick toggles."
          />
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Quick toggle</p>
              <div className="mt-2">
                <ThemeToggle />
              </div>
            </div>
            <div className="min-w-[10rem] flex-1 space-y-1.5">
              <label htmlFor="theme-mode" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Theme mode
              </label>
              <select
                id="theme-mode"
                value={preferences.theme}
                onChange={(e) => setPreference('theme', e.target.value)}
                className="h-11 w-full rounded-xl border border-zinc-200/90 bg-white/90 px-3 text-sm text-zinc-900 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/30 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-100"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-zinc-200/90 px-4 py-3 dark:border-white/10">
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200/80 bg-violet-50 text-violet-700 dark:border-white/10 dark:bg-white/5 dark:text-violet-200">
                <LayoutGrid className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-medium text-zinc-900 dark:text-white">Compact mode</span>
                <span className="text-xs text-zinc-500">Tighter vertical spacing on pages.</span>
              </span>
            </span>
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-zinc-300 text-violet-600 focus:ring-violet-500/40 dark:border-white/20 dark:bg-zinc-900 dark:text-violet-500"
              checked={preferences.compactMode}
              onChange={(e) => setPreference('compactMode', e.target.checked)}
              aria-label="Enable compact mode"
            />
          </label>
        </Card>

        <Card className="space-y-6" padding="p-5 md:p-6">
          <SectionHeader
            title="Study goals"
            subtitle="These numbers power the home dashboard stats (see `lib/stats.js`)."
          />
          <Input
            label="Daily focus goal (hours)"
            type="number"
            min={0.5}
            max={24}
            step={0.5}
            value={preferences.studyGoalHours}
            onChange={(e) => setPreference('studyGoalHours', Number(e.target.value))}
            hint="Used for the “today” completion ring on the dashboard."
          />
          <Input
            label="Weekly goal (hours)"
            type="number"
            min={1}
            max={80}
            step={1}
            value={preferences.weeklyGoalHours}
            onChange={(e) => setPreference('weeklyGoalHours', Number(e.target.value))}
            hint="Compared against logged sessions Monday–Sunday."
          />
        </Card>

        <Card className="space-y-5" padding="p-5 md:p-6">
          <SectionHeader title="Notifications" subtitle="Stored locally — connect to a backend later." />
          <ToggleRow
            icon={Bell}
            label="Study reminders"
            description="Nudges when a streak might break (UI placeholder)."
            checked={preferences.notifications.studyReminders}
            onChange={(v) => setPreferences((p) => ({ notifications: { ...p.notifications, studyReminders: v } }))}
          />
          <ToggleRow
            icon={Target}
            label="Weekly digest"
            description="Summary of hours + tasks (placeholder)."
            checked={preferences.notifications.weeklyDigest}
            onChange={(v) => setPreferences((p) => ({ notifications: { ...p.notifications, weeklyDigest: v } }))}
          />
          <ToggleRow
            icon={Palette}
            label="Product tips"
            description="Occasional feature highlights (placeholder)."
            checked={preferences.notifications.productTips}
            onChange={(v) => setPreferences((p) => ({ notifications: { ...p.notifications, productTips: v } }))}
          />
        </Card>

        <Card className="space-y-5" padding="p-5 md:p-6">
          <SectionHeader
            title="Backup & restore"
            subtitle="JSON includes sessions, tasks, notes, and preferences — validated on import."
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button type="button" variant="secondary" className="gap-2" onClick={downloadExport}>
              <Download className="h-4 w-4" aria-hidden />
              Export JSON
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={() => fileRef.current?.click()}
              loading={importing}
              loadingLabel="Reading file…"
            >
              <Upload className="h-4 w-4" aria-hidden />
              Import JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              aria-hidden
              onChange={(e) => handleImportFile(e.target.files?.[0])}
            />
            <Button type="button" variant="ghost" className="gap-2 text-rose-700 dark:text-rose-300" onClick={resetPreferences}>
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset preferences
            </Button>
          </div>
          <p className="text-xs leading-relaxed text-zinc-500">
            Import replaces matching LocalStorage keys on this device. Keep backups before experimenting in interviews.
          </p>
        </Card>
      </div>
    </PageShell>
  )
}

function ToggleRow({ icon: Icon, label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-zinc-200/90 px-4 py-3 dark:border-white/10">
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200/80 bg-violet-50 text-violet-700 dark:border-white/10 dark:bg-white/5 dark:text-violet-200">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium text-zinc-900 dark:text-white">{label}</span>
          <span className="text-xs text-zinc-500">{description}</span>
        </span>
      </span>
      <input
        type="checkbox"
        className="h-5 w-5 shrink-0 rounded border-zinc-300 text-violet-600 focus:ring-violet-500/40 dark:border-white/20 dark:bg-zinc-900 dark:text-violet-500"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
      />
    </label>
  )
}

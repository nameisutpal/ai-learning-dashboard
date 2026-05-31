import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Timer, Trash2 } from 'lucide-react'
import { PageShell } from '../components/page/PageShell.jsx'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { SectionHeader } from '../components/ui/SectionHeader.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { SkeletonPulse } from '../components/dashboard/SkeletonPulse.jsx'
import { useFirestoreData } from '../hooks/useFirestoreData.js'
import { useToast } from '../hooks/useToast.js'

function todayInputValue() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * StudyTrackerPage — sessions stored in Firestore `studySessions` with `userId`.
 */
export function StudyTrackerPage() {
  const { showToast } = useToast()
  const { sessions, loading, error, addSession, deleteSession } = useFirestoreData()

  const [subject, setSubject] = useState('')
  const [duration, setDuration] = useState('')
  const [date, setDate] = useState(todayInputValue())
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const totalHours = useMemo(() => {
    const mins = sessions.reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0)
    return Math.round((mins / 60) * 10) / 10
  }, [sessions])

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [sessions],
  )

  function validate() {
    const next = {}
    if (!subject.trim()) next.subject = 'Add a subject so future-you knows what this block was for.'
    const dm = Number(duration)
    if (!Number.isFinite(dm) || dm <= 0) next.duration = 'Enter duration in minutes (greater than zero).'
    if (dm > 720) next.duration = 'For demo safety, cap a single session at 12 hours (720 min).'
    if (!date) next.date = 'Pick the day this session happened.'
    return next
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSaving(true)
    try {
      await addSession({
        subject: subject.trim(),
        durationMinutes: Number(duration),
        date,
      })
      showToast('Study session logged — nice work!')
      setSubject('')
      setDuration('')
      setDate(todayInputValue())
    } catch (err) {
      showToast(err?.message || 'Could not save session.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteSession(id)
      showToast('Session removed')
    } catch (err) {
      showToast(err?.message || 'Could not delete session.', 'error')
    }
  }

  return (
    <PageShell
      icon={Timer}
      title="Study Tracker"
      description="Log focus blocks to Firestore — totals and weekly charts on the dashboard read the same data."
      highlights={[
        {
          title: 'Honest totals',
          text: 'Minutes roll up into hours for KPI cards and the weekly activity chart.',
        },
        {
          title: 'Per-user isolation',
          text: 'Each document stores `userId` so security rules can restrict reads and writes.',
        },
        {
          title: 'Validation first',
          text: 'Simple checks keep empty rows out of your history.',
        },
      ]}
    >
      {error ? (
        <Card className="mb-6 border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-900 dark:text-rose-100" padding="">
          <p className="font-medium">Firestore</p>
          <p className="mt-1 text-rose-800/90 dark:text-rose-200/90">{error}</p>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1" padding="p-5 md:p-6">
          <SectionHeader
            title="Log a session"
            subtitle="Subject, duration (minutes), and date — then save."
          />
          <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
            <Input
              label="Subject"
              placeholder="e.g. React hooks deep dive"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              error={errors.subject}
            />
            <Input
              label="Duration (minutes)"
              type="number"
              min={1}
              max={720}
              placeholder="45"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              error={errors.duration}
              hint="Whole minutes — keeps math simple for beginners."
            />
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              error={errors.date}
            />
            <Button type="submit" className="w-full" loading={saving} loadingLabel="Saving session…" disabled={loading}>
              Save session
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-2" padding="p-0 overflow-hidden">
          <div className="flex flex-col gap-1 border-b border-zinc-200/90 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6 dark:border-white/10">
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Session history</h3>
              <p className="text-xs text-zinc-500">Newest-first sort · Firestore sync</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-violet-300/50 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-900 dark:border-violet-400/25 dark:bg-violet-500/10 dark:text-violet-100">
              <Clock className="h-4 w-4" aria-hidden />
              Total:{' '}
              <span className="tabular-nums text-violet-950 dark:text-white">{totalHours}h</span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-5 md:p-6">
              <SkeletonPulse className="h-10 w-full" />
              <SkeletonPulse className="h-10 w-full" />
              <SkeletonPulse className="h-10 w-full" />
            </div>
          ) : sortedSessions.length === 0 ? (
            <div className="p-5 md:p-6">
              <EmptyState
                icon={Calendar}
                title="No sessions yet"
                description="Add your first study block — the dashboard charts update automatically."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-zinc-200/90 bg-zinc-100/80 text-xs uppercase tracking-wide text-zinc-600 dark:border-white/10 dark:bg-black/20 dark:text-zinc-500">
                  <tr>
                    <th className="px-5 py-3 font-medium md:px-6">Subject</th>
                    <th className="px-3 py-3 font-medium">Minutes</th>
                    <th className="px-3 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 text-right font-medium md:px-6"> </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSessions.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.24) }}
                      className="border-b border-zinc-100 hover:bg-zinc-50/80 dark:border-white/5 dark:hover:bg-white/[0.03]"
                    >
                      <td className="max-w-[12rem] truncate px-5 py-3 font-medium text-zinc-800 md:max-w-xs md:px-6 dark:text-zinc-100">
                        {row.subject}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 tabular-nums text-zinc-600 dark:text-zinc-400">
                        {row.durationMinutes}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-zinc-600 dark:text-zinc-400">{row.date}</td>
                      <td className="px-5 py-3 text-right md:px-6">
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
                          className="inline-flex rounded-lg border border-zinc-200/90 p-2 text-zinc-600 transition hover:border-rose-400/40 hover:text-rose-700 dark:border-white/10 dark:text-zinc-500 dark:hover:text-rose-200"
                          aria-label={`Delete session ${row.subject}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  )
}

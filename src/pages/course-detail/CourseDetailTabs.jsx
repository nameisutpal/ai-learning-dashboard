import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { GlassCard } from '../../components/dashboard/GlassCard.jsx'
import { ProgressBar } from '../../components/dashboard/ProgressBar.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { useLms } from '../../hooks/useLms.js'
import {
  courseProgressPercent,
  sessionDurationMinutes,
  sessionMinutesForCourse,
  tasksProgressPercent,
  weeklyConsistency,
} from '../../lib/lmsProgress.js'
import { createId } from '../../lib/id.js'

export function CourseOverviewTab() {
  const { courseId } = useParams()
  const { state, getCourse, progressForCourse } = useLms()
  const course = courseId ? getCourse(courseId) : undefined
  if (!courseId || !course) return null

  const tasks = state.tasks.filter((t) => t.courseId === courseId)
  const resources = state.resources.filter((r) => r.courseId === courseId)
  const sessions = state.sessions.filter((s) => s.courseId === courseId)
  const minutes = sessionMinutesForCourse(courseId, state.sessions)
  const pct = progressForCourse(courseId)
  const taskPct = tasks.length ? tasksProgressPercent(tasks) : null

  return (
    <GlassCard hover={false} className="p-5 md:p-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Overview</h2>
      <p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-300">{course.description}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat k="Completion" v={`${pct}%`} />
        <Stat k="Logged time" v={`${Math.round((minutes / 60) * 10) / 10}h`} />
        <Stat k="Resources" v={String(resources.length)} />
        <Stat
          k="Tasks"
          v={`${tasks.filter((t) => t.done).length}/${tasks.length || 0}`}
        />
      </div>
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        {taskPct !== null
          ? `Task checklist drives completion when tasks exist (${taskPct}% done). Otherwise logged minutes are compared to your ${course.estimatedDurationHours}h estimate.`
          : `No tasks yet — completion is inferred from study time vs the ${course.estimatedDurationHours}h estimate (${courseProgressPercent(course, tasks, sessions)}%).`}
      </p>
    </GlassCard>
  )
}

function Stat({ k, v }) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {k}
      </div>
      <div className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">{v}</div>
    </div>
  )
}

const kinds = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'article', label: 'Article' },
  { value: 'pdf', label: 'PDF' },
  { value: 'external_course', label: 'External course' },
]

function kindIcon(k) {
  if (k === 'youtube') return '▶'
  if (k === 'article') return '↗'
  if (k === 'pdf') return 'PDF'
  return '∞'
}

export function CourseResourcesTab() {
  const { courseId } = useParams()
  const { state, addResource, removeResource } = useLms()
  const [kind, setKind] = useState('youtube')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  const rows = useMemo(
    () => state.resources.filter((r) => r.courseId === courseId),
    [state.resources, courseId],
  )

  if (!courseId) return null

  function onAdd(e) {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return
    addResource({ courseId, kind, title: title.trim(), url: url.trim() })
    setTitle('')
    setUrl('')
  }

  return (
    <div className="space-y-4">
      <GlassCard hover={false} className="p-5 md:p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Add resource</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-[140px_1fr_2fr_auto] md:items-end" onSubmit={onAdd}>
          <label className="block space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <span>Type</span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="w-full rounded-xl border border-zinc-200/90 bg-white/90 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950/80 dark:text-white"
            >
              {kinds.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <span>Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-zinc-200/90 bg-white/90 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950/80 dark:text-white"
            />
          </label>
          <label className="block space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <span>URL</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-xl border border-zinc-200/90 bg-white/90 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950/80 dark:text-white"
              placeholder="https://…"
            />
          </label>
          <Button type="submit" className="md:mb-0.5">
            Add
          </Button>
        </form>
      </GlassCard>
      <GlassCard hover={false} className="p-5 md:p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Library</h2>
        {rows.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">No resources yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-violet-500/25 to-cyan-500/15 text-xs font-bold text-white">
                    {kindIcon(r.kind)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-zinc-900 dark:text-white">{r.title}</div>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-sm text-violet-600 underline-offset-2 hover:underline dark:text-violet-300"
                    >
                      {r.url}
                    </a>
                  </div>
                </div>
                <Button variant="danger" size="sm" onClick={() => removeResource(r.id)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  )
}

export function CourseNotesTab() {
  const { courseId } = useParams()
  const { state, upsertNote, removeNote } = useLms()
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const notes = useMemo(
    () => state.notes.filter((n) => n.courseId === courseId),
    [state.notes, courseId],
  )

  if (!courseId) return null

  function startNew() {
    setEditingId(null)
    setTitle('')
    setBody('')
  }

  function startEdit(id) {
    const n = notes.find((x) => x.id === id)
    if (!n) return
    setEditingId(id)
    setTitle(n.title)
    setBody(n.body)
  }

  function onSave(e) {
    e.preventDefault()
    const id = editingId ?? createId()
    upsertNote({
      id,
      courseId,
      title: title.trim() || 'Untitled note',
      body: body.trim(),
      updatedAt: new Date().toISOString(),
    })
    startNew()
  }

  return (
    <div className="space-y-4">
      <GlassCard hover={false} className="p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {editingId ? 'Edit note' : 'New note'}
          </h2>
          {editingId ? (
            <Button type="button" variant="ghost" size="sm" onClick={startNew}>
              Cancel edit
            </Button>
          ) : null}
        </div>
        <form className="mt-4 space-y-3" onSubmit={onSave}>
          <label className="block space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <span>Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-zinc-200/90 bg-white/90 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950/80 dark:text-white"
            />
          </label>
          <label className="block space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <span>Body</span>
            <textarea
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full rounded-xl border border-zinc-200/90 bg-white/90 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950/80 dark:text-white"
            />
          </label>
          <Button type="submit">{editingId ? 'Save note' : 'Add note'}</Button>
        </form>
      </GlassCard>
      <GlassCard hover={false} className="p-5 md:p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Notebook</h2>
        {notes.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">No notes yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {notes.map((n) => (
              <li
                key={n.id}
                className="rounded-2xl border border-zinc-200/80 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <div className="font-semibold text-zinc-900 dark:text-white">{n.title}</div>
                  <div className="text-xs text-zinc-500">{new Date(n.updatedAt).toLocaleString()}</div>
                </div>
                <pre className="mt-2 whitespace-pre-wrap font-mono text-sm text-zinc-700 dark:text-zinc-200">
                  {n.body}
                </pre>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(n.id)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => removeNote(n.id)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  )
}

export function CourseTasksTab() {
  const { courseId } = useParams()
  const { state, addTask, toggleTask, removeTask } = useLms()
  const [title, setTitle] = useState('')

  const tasks = useMemo(
    () => state.tasks.filter((t) => t.courseId === courseId),
    [state.tasks, courseId],
  )

  if (!courseId) return null

  function onAdd(e) {
    e.preventDefault()
    if (!title.trim()) return
    addTask({ courseId, title: title.trim(), done: false })
    setTitle('')
  }

  return (
    <div className="space-y-4">
      <GlassCard hover={false} className="p-5 md:p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Add task</h2>
        <form className="mt-3 flex flex-wrap gap-2" onSubmit={onAdd}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="min-w-[200px] flex-1 rounded-xl border border-zinc-200/90 bg-white/90 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950/80 dark:text-white"
            placeholder="Ship a small artifact, read a chapter…"
          />
          <Button type="submit">Add</Button>
        </form>
      </GlassCard>
      <GlassCard hover={false} className="p-5 md:p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Checklist</h2>
        {tasks.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">No tasks yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200/80 bg-white/60 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <label className="flex min-w-0 cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => toggleTask(t.id)}
                    className="h-4 w-4 rounded border-zinc-300 text-violet-600"
                  />
                  <span
                    className={
                      t.done
                        ? 'text-zinc-500 line-through dark:text-zinc-400'
                        : 'text-zinc-900 dark:text-white'
                    }
                  >
                    {t.title}
                  </span>
                </label>
                <Button variant="danger" size="sm" onClick={() => removeTask(t.id)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  )
}

const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function CourseProgressTab() {
  const { courseId } = useParams()
  const { state, getCourse, progressForCourse } = useLms()
  const course = courseId ? getCourse(courseId) : undefined

  const tasks = useMemo(
    () => state.tasks.filter((t) => t.courseId === courseId),
    [state.tasks, courseId],
  )

  if (!courseId || !course) return null

  const pct = progressForCourse(courseId)
  const taskPct = tasks.length ? tasksProgressPercent(tasks) : 0
  const minutes = sessionMinutesForCourse(courseId, state.sessions)
  const targetMin = Math.max(1, course.estimatedDurationHours * 60)
  const timePct = Math.min(100, Math.round((minutes / targetMin) * 100))
  const week = weeklyConsistency(state, new Date(), courseId)
  const modeled = courseProgressPercent(course, tasks, state.sessions)

  return (
    <div className="space-y-4">
      <GlassCard hover={false} className="p-5 md:p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Completion model</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Modeled completion is <strong className="text-zinc-900 dark:text-white">{modeled}%</strong>.
        </p>
        <div className="mt-4">
          <ProgressBar label={`Course progress · ${pct}%`} percent={pct} hint={`${pct}%`} />
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <GlassCard hover={false} className="p-4" asMotion={false}>
            <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">Task progress</div>
            <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
              {tasks.length ? `${taskPct}%` : '—'}
            </div>
            <ProgressBar label="Tasks" percent={taskPct} hint={`${taskPct}%`} />
          </GlassCard>
          <GlassCard hover={false} className="p-4" asMotion={false}>
            <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">Time vs estimate</div>
            <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">{timePct}%</div>
            <ProgressBar label="Minutes" percent={timePct} hint={`${timePct}%`} />
            <p className="mt-2 text-xs text-zinc-500">
              {Math.round(minutes)} / {Math.round(targetMin)} minutes
            </p>
          </GlassCard>
        </div>
      </GlassCard>
      <GlassCard hover={false} className="p-5 md:p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Weekly consistency</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          This course — days with ≥1 logged minute this week.
        </p>
        <div className="mt-4 flex justify-between gap-1">
          {dayLabels.map((d, i) => (
            <div key={`${d}-${i}`} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={`h-3 w-3 rounded-full border transition ${
                  week[i]
                    ? 'scale-110 border-transparent bg-gradient-to-tr from-violet-500 to-cyan-400 shadow-[0_0_14px_-2px_rgba(139,92,246,0.7)]'
                    : 'border-zinc-300/80 bg-zinc-200/80 dark:border-white/10 dark:bg-zinc-800'
                }`}
              />
              <span className="text-[10px] text-zinc-500">{d}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

function toLocalInputValue(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function CourseSessionsTab() {
  const { courseId } = useParams()
  const { state, addSession, removeSession } = useLms()
  const now = new Date()
  const defaultStart = new Date(now.getTime() - 45 * 60000)
  const [startedAt, setStartedAt] = useState(toLocalInputValue(defaultStart.toISOString()))
  const [endedAt, setEndedAt] = useState(toLocalInputValue(now.toISOString()))

  const rows = useMemo(
    () =>
      state.sessions
        .filter((s) => s.courseId === courseId)
        .slice()
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    [state.sessions, courseId],
  )

  if (!courseId) return null

  function onAdd(e) {
    e.preventDefault()
    const sIso = new Date(startedAt).toISOString()
    const eIso = new Date(endedAt).toISOString()
    if (new Date(eIso).getTime() <= new Date(sIso).getTime()) {
      window.alert('End time must be after start time.')
      return
    }
    addSession({ courseId, startedAt: sIso, endedAt: eIso })
  }

  return (
    <div className="space-y-4">
      <GlassCard hover={false} className="p-5 md:p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Log study session</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end" onSubmit={onAdd}>
          <label className="block space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <span>Started</span>
            <input
              type="datetime-local"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              className="w-full rounded-xl border border-zinc-200/90 bg-white/90 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950/80 dark:text-white"
            />
          </label>
          <label className="block space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <span>Ended</span>
            <input
              type="datetime-local"
              value={endedAt}
              onChange={(e) => setEndedAt(e.target.value)}
              className="w-full rounded-xl border border-zinc-200/90 bg-white/90 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950/80 dark:text-white"
            />
          </label>
          <Button type="submit" className="md:mb-0.5">
            Log session
          </Button>
        </form>
      </GlassCard>
      <GlassCard hover={false} className="p-5 md:p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">History</h2>
        {rows.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">No sessions yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {rows.map((s) => {
              const m = sessionDurationMinutes(s.startedAt, s.endedAt)
              return (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-zinc-200/80 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-white">{m} minutes</div>
                    <div className="text-xs text-zinc-500">
                      {new Date(s.startedAt).toLocaleString()} → {new Date(s.endedAt).toLocaleString()}
                    </div>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => removeSession(s.id)}>
                    Remove
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </GlassCard>
    </div>
  )
}

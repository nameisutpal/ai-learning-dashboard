import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckSquare, ListTodo, Trash2 } from 'lucide-react'
import { PageShell } from '../components/page/PageShell.jsx'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { SectionHeader } from '../components/ui/SectionHeader.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { ProgressBar } from '../components/dashboard/ProgressBar.jsx'
import { SkeletonPulse } from '../components/dashboard/SkeletonPulse.jsx'
import { useFirestoreData } from '../hooks/useFirestoreData.js'
import { useToast } from '../hooks/useToast.js'

/**
 * TasksPage — checklist backed by Firestore `tasks` collection (scoped with `userId`).
 */
export function TasksPage() {
  const { showToast } = useToast()
  const { tasks, loading, error, addTask, updateTaskDone, deleteTask } = useFirestoreData()

  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const completed = tasks.filter((t) => t.done).length
  const total = tasks.length
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  const sorted = useMemo(
    () => [...tasks].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [tasks],
  )

  async function handleAddTask(e) {
    e.preventDefault()
    if (!title.trim()) {
      setFormError('Give the task a short title.')
      return
    }
    setFormError('')
    setSaving(true)
    try {
      await addTask({ title: title.trim(), priority })
      showToast('Task added')
      setTitle('')
    } catch (err) {
      showToast(err?.message || 'Could not add task.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function toggleDone(id, done) {
    try {
      await updateTaskDone(id, !done)
    } catch (err) {
      showToast(err?.message || 'Could not update task.', 'error')
    }
  }

  async function removeTask(id) {
    try {
      await deleteTask(id)
      showToast('Task deleted')
    } catch (err) {
      showToast(err?.message || 'Could not delete task.', 'error')
    }
  }

  return (
    <PageShell
      icon={ListTodo}
      title="Task manager"
      description="Tasks sync to your Firebase project — each row is stored with your account `userId` so only you can read or change it (when security rules are deployed)."
      highlights={[
        {
          title: 'Live sync',
          text: 'Open two tabs: checking a box updates Firestore and the other tab follows automatically.',
        },
        {
          title: 'Dashboard tie-in',
          text: 'The home KPI cards read the same snapshot stream via `useDashboardStats()`.',
        },
        {
          title: 'Rules-ready',
          text: 'Ship `firestore.rules` from the repo root so production data stays private per user.',
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
        <Card className="lg:col-span-1">
          <SectionHeader title="New task" subtitle="Title + priority, then add to your list." />
          <form className="mt-5 space-y-4" onSubmit={handleAddTask}>
            <Input
              label="Title"
              placeholder="e.g. Finish flashcards"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={formError}
            />
            <div className="space-y-1.5">
              <label htmlFor="task-priority" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Priority
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="h-11 w-full rounded-xl border border-zinc-200/90 bg-white/90 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/35 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-100 dark:focus:border-violet-400/50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <Button type="submit" className="w-full" loading={saving} disabled={loading}>
              Add task
            </Button>
          </form>
        </Card>

        <Card className="space-y-6 lg:col-span-2" padding="p-5 md:p-6">
          <SectionHeader
            title="Your tasks"
            subtitle={loading ? 'Loading…' : `${completed} of ${total} complete`}
            action={
              <Link
                to="/"
                className="text-xs font-medium text-violet-700 underline-offset-4 hover:underline dark:text-violet-300"
              >
                Back to dashboard
              </Link>
            }
          />

          <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-black/20">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Progress</p>
            <div className="mt-3">
              <ProgressBar
                label="Completion"
                percent={percent}
                hint={total ? `${completed}/${total}` : '0/0'}
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              <SkeletonPulse className="h-16 w-full rounded-2xl" />
              <SkeletonPulse className="h-16 w-full rounded-2xl" />
              <SkeletonPulse className="h-16 w-full rounded-2xl" />
            </div>
          ) : sorted.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No tasks yet"
              description="Add your first task with the form — it will be stored in Firestore under your account."
            />
          ) : (
            <ul className="space-y-2">
              {sorted.map((task, i) => (
                <motion.li
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.2) }}
                  className="flex flex-col gap-3 rounded-2xl border border-zinc-200/90 bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleDone(task.id, task.done)}
                      className="mt-1 h-4 w-4 rounded border-zinc-300 bg-white text-violet-600 focus:ring-violet-500/40 dark:border-white/20 dark:bg-zinc-900 dark:text-violet-500"
                      aria-label={`Mark complete: ${task.title}`}
                    />
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium ${task.done ? 'text-zinc-500 line-through' : 'text-zinc-900 dark:text-white'}`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-600">{task.priority}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTask(task.id)}
                    className="inline-flex items-center gap-1 self-end rounded-lg border border-zinc-200/90 px-3 py-1.5 text-xs text-zinc-600 transition hover:border-rose-400/40 hover:text-rose-700 dark:border-white/10 dark:text-zinc-400 dark:hover:text-rose-200 sm:self-auto"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Delete
                  </button>
                </motion.li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </PageShell>
  )
}

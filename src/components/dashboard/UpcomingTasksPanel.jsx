import { Link } from 'react-router-dom'
import { ListTodo } from 'lucide-react'
import { GlassCard } from './GlassCard.jsx'
import { SectionHeader } from './SectionHeader.jsx'
import { EmptyState } from '../ui/EmptyState.jsx'
import { SkeletonPulse } from './SkeletonPulse.jsx'
import { useFirestoreData } from '../../hooks/useFirestoreData.js'

const chip = {
  high: 'border-rose-300/70 bg-rose-50 text-rose-800 dark:border-rose-400/35 dark:bg-rose-500/10 dark:text-rose-200',
  medium: 'border-amber-300/70 bg-amber-50 text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100',
  low: 'border-emerald-300/70 bg-emerald-50 text-emerald-900 dark:border-emerald-400/25 dark:bg-emerald-500/10 dark:text-emerald-100',
}

/**
 * UpcomingTasksPanel — preview of Firestore tasks (same source as `/tasks`).
 */
export function UpcomingTasksPanel() {
  const { tasks, loading, updateTaskDone } = useFirestoreData()
  const preview = tasks.slice(0, 5)

  async function toggle(id, done) {
    try {
      await updateTaskDone(id, !done)
    } catch {
      /* errors surface in Tasks page / console; keep panel quiet */
    }
  }

  return (
    <GlassCard hover={false} className="p-5 md:p-6">
      <SectionHeader
        title="Upcoming tasks"
        subtitle="Pulled from Firestore — same list as the Task manager page."
        action={
          <Link
            to="/tasks"
            className="text-xs font-medium text-violet-700 underline-offset-4 hover:underline dark:text-violet-300"
          >
            Manage tasks
          </Link>
        }
      />

      {loading ? (
        <div className="mt-5 space-y-2">
          <SkeletonPulse className="h-14 w-full rounded-2xl" />
          <SkeletonPulse className="h-14 w-full rounded-2xl" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon={ListTodo}
            title="No tasks yet"
            description="Create tasks on the Task manager page — they sync from Firestore here."
            action={
              <Link
                to="/tasks"
                className="inline-flex rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-600/25"
              >
                Add a task
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-5 space-y-2">
          {preview.map((task) => (
            <li
              key={task.id}
              className="flex items-start gap-3 rounded-2xl border border-zinc-200/90 bg-zinc-50/80 px-4 py-3 dark:border-white/10 dark:bg-black/15"
            >
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggle(task.id, task.done)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 bg-white text-violet-600 focus:ring-violet-500/40 dark:border-white/20 dark:bg-zinc-900 dark:text-violet-500"
                aria-label={`Toggle ${task.title}`}
              />
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${task.done ? 'text-zinc-500 line-through' : 'text-zinc-900 dark:text-white'}`}
                >
                  {task.title}
                </p>
                <span
                  className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${chip[task.priority] ?? chip.medium}`}
                >
                  {task.priority}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  )
}

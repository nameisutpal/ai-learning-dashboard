import { NavLink, Outlet, useParams, Link } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { GlassCard } from '../components/dashboard/GlassCard.jsx'
import { ProgressBar } from '../components/dashboard/ProgressBar.jsx'
import { Button } from '../components/ui/Button.jsx'
import { PageContainer } from '../components/layout/PageContainer.jsx'
import { useLms } from '../hooks/useLms.js'
import { SECTION_STACK } from '../constants/layout.js'

const tabCls = ({ isActive }) =>
  `rounded-full px-3 py-1.5 text-sm font-medium transition border ${
    isActive
      ? 'border-transparent bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25'
      : 'border-transparent text-zinc-600 hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-zinc-900 dark:text-zinc-400 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white'
  }`

export function CourseDetailPage() {
  const { courseId } = useParams()
  const { getCourse, progressForCourse } = useLms()
  const course = courseId ? getCourse(courseId) : undefined

  if (!courseId || !course) {
    return (
      <PageContainer className={SECTION_STACK}>
        <p className="text-zinc-600 dark:text-zinc-400">Course not found.</p>
        <Link to="/courses">
          <Button>Back to courses</Button>
        </Link>
      </PageContainer>
    )
  }

  const pct = progressForCourse(course.id)

  return (
    <PageContainer className={SECTION_STACK}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:items-stretch">
        <img
          src={course.thumbnailUrl}
          alt=""
          className="h-56 w-full rounded-3xl border border-zinc-200/80 object-cover shadow-xl shadow-violet-500/10 dark:border-white/10 dark:shadow-black/40 lg:h-full lg:min-h-[14rem]"
        />
        <GlassCard hover={false} className="flex flex-col p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {course.category} · <span className="capitalize">{course.difficulty}</span>
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl dark:text-white">
                {course.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-lg border border-zinc-200/80 bg-white/70 px-2 py-0.5 font-mono text-[11px] text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <Link to={`/courses/${course.id}/edit`}>
              <Button variant="secondary" size="sm" className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" aria-hidden />
                Edit
              </Button>
            </Link>
          </div>
          <div className="mt-5">
            <ProgressBar label={`Overall progress · ${pct}%`} percent={pct} hint={`${pct}%`} />
          </div>
          <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>~{course.estimatedDurationHours}h estimated</span>
            <span>Updated {new Date(course.updatedAt).toLocaleString()}</span>
          </div>
        </GlassCard>
      </div>

      <nav
        className="flex flex-wrap gap-1 rounded-full border border-zinc-200/80 bg-white/60 p-1 shadow-inner shadow-zinc-200/40 dark:border-white/10 dark:bg-zinc-950/40 dark:shadow-black/30"
        aria-label="Course sections"
      >
        <NavLink className={tabCls} to="overview" end>
          Overview
        </NavLink>
        <NavLink className={tabCls} to="resources">
          Resources
        </NavLink>
        <NavLink className={tabCls} to="notes">
          Notes
        </NavLink>
        <NavLink className={tabCls} to="tasks">
          Tasks
        </NavLink>
        <NavLink className={tabCls} to="progress">
          Progress
        </NavLink>
        <NavLink className={tabCls} to="sessions">
          Study sessions
        </NavLink>
      </nav>

      <Outlet />
    </PageContainer>
  )
}

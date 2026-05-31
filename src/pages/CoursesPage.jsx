import { Link } from 'react-router-dom'
import { BookOpen, GraduationCap, Library, PlayCircle, Bookmark, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageShell } from '../components/page/PageShell.jsx'
import { GlassCard } from '../components/dashboard/GlassCard.jsx'
import { Button } from '../components/ui/Button.jsx'
import { ProgressBar } from '../components/dashboard/ProgressBar.jsx'
import { useLms } from '../hooks/useLms.js'
import { buildSampleLmsState } from '../lib/lmsSampleData.js'

export function CoursesPage() {
  const { state, progressForCourse, deleteCourse, replaceState } = useLms()

  return (
    <PageShell
      icon={BookOpen}
      title="My Courses"
      description="Create structured paths with resources, notes, tasks, and timed sessions — persisted locally with entity relationships ready for a future API."
      highlights={[
        {
          title: 'Course graph',
          text: 'Each course owns resources, notes, tasks, and study sessions — mirroring normalized backend tables.',
        },
        {
          title: 'Progress model',
          text: 'Checklist completion when tasks exist; otherwise minutes vs your estimated duration.',
        },
        {
          title: 'Portable state',
          text: 'Single versioned JSON blob today; swap `services/lmsState.js` for REST sync later.',
        },
      ]}
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link to="/courses/new">
          <Button>Create course</Button>
        </Link>
        <Button
          variant="secondary"
          onClick={() => {
            if (
              state.courses.length > 0 &&
              !window.confirm(
                'Replace local LMS workspace with sample courses? This cannot be undone.',
              )
            )
              return
            replaceState(buildSampleLmsState())
          }}
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          Load sample workspace
        </Button>
      </div>

      {state.courses.length === 0 ? (
        <GlassCard hover={false} className="p-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No courses yet. Create one or load the sample workspace to explore the workflow.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/courses/new">
              <Button>Create your first course</Button>
            </Link>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {state.courses.map((c) => (
            <motion.article
              key={c.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassCard className="flex h-full flex-col overflow-hidden">
                <div className="relative">
                  <img
                    src={c.thumbnailUrl}
                    alt=""
                    className="h-40 w-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full border border-white/15 bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-md">
                      {c.category}
                    </span>
                    <span className="rounded-full border border-white/15 bg-black/50 px-2 py-0.5 text-[10px] font-medium capitalize text-white backdrop-blur-md">
                      {c.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
                      {c.title}
                    </h2>
                    <p className="mt-1 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {c.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.tags.slice(0, 5).map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-zinc-200/80 bg-zinc-50/80 px-1.5 py-0.5 font-mono text-[10px] text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>~{c.estimatedDurationHours}h est.</span>
                    <span>{progressForCourse(c.id)}% complete</span>
                  </div>
                  <ProgressBar
                    label="Progress"
                    percent={progressForCourse(c.id)}
                    hint={`${progressForCourse(c.id)}%`}
                  />
                  <div className="mt-auto flex flex-wrap gap-2 pt-1">
                    <Link to={`/courses/${c.id}/overview`} className="flex-1 min-w-[6rem]">
                      <Button className="w-full" size="sm">
                        Open
                      </Button>
                    </Link>
                    <Link to={`/courses/${c.id}/edit`}>
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        if (window.confirm(`Delete “${c.title}”?`)) deleteCourse(c.id)
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </motion.article>
          ))}
        </div>
      )}

      <ul className="mt-8 flex flex-wrap gap-3 text-xs text-zinc-600 dark:text-zinc-500">
        <li className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-white/80 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
          <Library className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300" aria-hidden />
          Resources: YouTube, articles, PDFs, external courses
        </li>
        <li className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-white/80 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
          <PlayCircle className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300" aria-hidden />
          Study sessions per course
        </li>
        <li className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-white/80 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
          <Bookmark className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300" aria-hidden />
          Notes + tasks on course detail
        </li>
        <li className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-white/80 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
          <GraduationCap className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300" aria-hidden />
          Completion tied to your inputs
        </li>
      </ul>
    </PageShell>
  )
}

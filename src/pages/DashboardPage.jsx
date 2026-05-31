import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckSquare, Clock, Flame, StickyNote, TrendingUp, BookOpen, Trophy, Target, Library } from 'lucide-react'
import { motion } from 'framer-motion'
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline.jsx'
import { AiQuickActions } from '../components/dashboard/AiQuickActions.jsx'
import { ChartContainer } from '../components/dashboard/ChartContainer.jsx'
import { DashboardHero } from '../components/dashboard/DashboardHero.jsx'
import { GlassCard } from '../components/dashboard/GlassCard.jsx'
import { ProgressBar } from '../components/dashboard/ProgressBar.jsx'
import { SectionHeader } from '../components/dashboard/SectionHeader.jsx'
import { StatCard } from '../components/dashboard/StatCard.jsx'
import { UpcomingTasksPanel } from '../components/dashboard/UpcomingTasksPanel.jsx'
import { SkeletonPulse } from '../components/dashboard/SkeletonPulse.jsx'
import { AnimatedCounter } from '../components/ui/AnimatedCounter.jsx'
import { CourseCompletionChart } from '../components/charts/CourseCompletionChart.jsx'
import { WeeklyStudyChart } from '../components/charts/WeeklyStudyChart.jsx'
import { courseCompletionData } from '../data/dashboardCharts.js'
import { useLms } from '../hooks/useLms.js'
import { weeklyConsistency } from '../lib/lmsProgress.js'
import { buildSampleLmsState } from '../lib/lmsSampleData.js'
import { recentActivities } from '../data/recentActivity.js'
import { useDashboardStats } from '../hooks/useDashboardStats.js'
import { useAuth } from '../hooks/useAuth.js'
import { Button } from '../components/ui/Button.jsx'
import { PageContainer } from '../components/layout/PageContainer.jsx'
import { SECTION_STACK } from '../constants/layout.js'

/**
 * DashboardPage — hero + KPI cards + charts + panels.
 *
 * Dynamic data: `useDashboardStats()` mirrors `FirestoreDataProvider` — study sessions, tasks, and notes
 * from Firestore; study goals still come from preferences (LocalStorage) via `readUserPreferences()` inside `lib/stats.js`.
 */
export function DashboardPage() {
  const stats = useDashboardStats()
  const { user } = useAuth()
  const lms = useLms()
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => setBooting(false), 220)
    return () => window.clearTimeout(t)
  }, [])

  const dailyPct = Math.min(
    100,
    Math.round((stats.dailyDoneHoursToday / Math.max(stats.dailyGoalHours, 0.01)) * 100),
  )

  const weekFlags = useMemo(() => weeklyConsistency(lms.state), [lms.state])
  const studiedDays = weekFlags.filter(Boolean).length

  const lmsChartData = useMemo(() => {
    if (!lms.state.courses.length) return courseCompletionData
    return lms.state.courses.map((c) => ({
      name: c.title.length > 20 ? `${c.title.slice(0, 20)}…` : c.title,
      percent: lms.progressForCourse(c.id),
    }))
  }, [lms])

  const mostStudied = lms.dashboardStats.mostStudiedCourseId
    ? lms.state.courses.find((c) => c.id === lms.dashboardStats.mostStudiedCourseId)
    : null

  const weekYMax = useMemo(() => {
    const peak = Math.max(0, ...stats.weeklyChartData.map((d) => Number(d.hours) || 0))
    return Math.max(5, Math.ceil(peak + 1))
  }, [stats.weeklyChartData])

  const statItems = [
    {
      key: 'hours',
      title: 'Study hours',
      value: (
        <span className="inline-flex items-baseline gap-0.5">
          <AnimatedCounter value={stats.totalStudyHours} decimals={1} className="text-2xl font-semibold md:text-3xl" />
          <span className="text-xl font-semibold md:text-2xl">h</span>
        </span>
      ),
      hint: 'Total from saved sessions',
      icon: Clock,
    },
    {
      key: 'tasks',
      title: 'Tasks completed',
      value:
        stats.tasksTotal > 0 ? (
          <span className="inline-flex items-baseline gap-0.5 font-semibold">
            <AnimatedCounter value={stats.tasksCompleted} className="text-2xl md:text-3xl" />
            <span className="text-xl text-zinc-400 dark:text-zinc-500">/</span>
            <AnimatedCounter value={stats.tasksTotal} className="text-2xl md:text-3xl" />
          </span>
        ) : (
          '0/0'
        ),
      hint: stats.tasksTotal ? 'Checklist progress' : 'Add tasks on /tasks',
      icon: CheckSquare,
    },
    {
      key: 'notes',
      title: 'Active notes',
      value: <AnimatedCounter value={stats.notesCount} className="text-2xl font-semibold md:text-3xl" />,
      hint: 'Saved in this browser',
      icon: StickyNote,
    },
    {
      key: 'streak',
      title: 'Learning streak',
      value: (
        <span className="inline-flex items-baseline gap-1.5">
          <AnimatedCounter value={stats.streakDays} className="text-2xl font-semibold md:text-3xl" />
          <span className="text-base font-medium text-zinc-500 dark:text-zinc-400">days</span>
        </span>
      ),
      hint: 'Consecutive days with sessions',
      icon: Flame,
    },
    {
      key: 'weekly',
      title: 'Weekly progress',
      value: (
        <span className="inline-flex items-baseline gap-0.5">
          <AnimatedCounter value={stats.weeklyProgressPercent} className="text-2xl font-semibold md:text-3xl" />
          <span className="text-xl font-semibold md:text-2xl">%</span>
        </span>
      ),
      hint: `${stats.thisWeekHours}h / ${stats.weeklyGoalHours}h goal`,
      icon: TrendingUp,
    },
  ]

  const heroName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  return (
    <PageContainer className={SECTION_STACK}>
      <DashboardHero userName={heroName} />

      <motion.section
        className="space-y-4"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        aria-labelledby="lms-heading"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SectionHeader
            id="lms-heading"
            title="Course workspace"
            subtitle="Live metrics from your LMS graph (LocalStorage key ai-learn:lms-state-v1) — structured for a future API boundary."
          />
          <div className="flex flex-wrap gap-2">
            <Link to="/courses/new">
              <Button size="sm">New course</Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (
                  lms.state.courses.length > 0 &&
                  !window.confirm('Replace LMS workspace with sample data?')
                )
                  return
                lms.replaceState(buildSampleLmsState())
              }}
            >
              Sample data
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active courses"
            value={<AnimatedCounter value={lms.dashboardStats.activeCourses} className="text-2xl font-semibold md:text-3xl" />}
            hint="Below 100% completion"
            icon={BookOpen}
            motionDelay={0}
          />
          <StatCard
            title="LMS study hours"
            value={
              <span className="inline-flex items-baseline gap-0.5">
                <AnimatedCounter value={lms.dashboardStats.totalLearningHours} decimals={1} className="text-2xl font-semibold md:text-3xl" />
                <span className="text-xl font-semibold md:text-2xl">h</span>
              </span>
            }
            hint="From course-linked sessions"
            icon={Library}
            motionDelay={0.05}
          />
          <StatCard
            title="Avg. course completion"
            value={
              <span className="inline-flex items-baseline gap-0.5">
                <AnimatedCounter value={lms.dashboardStats.averageCompletionPercent} className="text-2xl font-semibold md:text-3xl" />
                <span className="text-xl font-semibold md:text-2xl">%</span>
              </span>
            }
            hint="Across all courses"
            icon={Target}
            motionDelay={0.1}
          />
          <StatCard
            title="Weekly LMS rhythm"
            value={
              <span className="inline-flex items-baseline gap-0.5">
                <AnimatedCounter value={studiedDays} className="text-2xl font-semibold md:text-3xl" />
                <span className="text-xl text-zinc-400 dark:text-zinc-500">/</span>
                <span className="text-2xl font-semibold md:text-3xl">7</span>
              </span>
            }
            hint="Days with ≥1 LMS minute"
            icon={Trophy}
            motionDelay={0.15}
          />
        </div>
        {mostStudied ? (
          <GlassCard hover={false} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
            <div className="flex min-w-0 items-center gap-4">
              <img
                src={mostStudied.thumbnailUrl}
                alt=""
                className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-2 ring-violet-500/25"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Most studied course
                </p>
                <p className="truncate font-semibold text-zinc-900 dark:text-white">{mostStudied.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{mostStudied.description}</p>
              </div>
            </div>
            <Link to={`/courses/${mostStudied.id}/sessions`}>
              <Button variant="secondary" size="sm">
                Open sessions
              </Button>
            </Link>
          </GlassCard>
        ) : null}
        <div className="flex justify-between gap-1 rounded-2xl border border-zinc-200/80 bg-white/50 px-2 py-3 dark:border-white/10 dark:bg-white/[0.03]">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={`${d}-${i}`} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={`h-3 w-3 rounded-full border transition ${
                  weekFlags[i]
                    ? 'scale-110 border-transparent bg-gradient-to-tr from-violet-500 to-cyan-400 shadow-[0_0_14px_-2px_rgba(139,92,246,0.65)]'
                    : 'border-zinc-300/80 bg-zinc-200/80 dark:border-white/10 dark:bg-zinc-800'
                }`}
              />
              <span className="text-[10px] text-zinc-500">{d}</span>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="space-y-4"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        aria-labelledby="dash-stats-heading"
      >
        <SectionHeader
          id="dash-stats-heading"
          title="Analytics overview"
          subtitle="Numbers update live from LocalStorage — no backend required for this portfolio slice."
        />
        {booting ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonPulse key={i} className="h-[7.5rem] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {statItems.map((s, index) => (
              <StatCard
                key={s.key}
                title={s.title}
                value={s.value}
                hint={s.hint}
                icon={s.icon}
                motionDelay={index * 0.06}
              />
            ))}
          </div>
        )}
      </motion.section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.45 }}
        >
          <GlassCard hover={false} className="p-5 md:p-6">
            <SectionHeader
              title="Course progress"
              subtitle="Pulled from your LMS courses — tasks drive completion when present; otherwise logged minutes vs estimates."
            />
            <div className="mt-6 space-y-5">
              {lms.state.courses.length === 0 ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  No courses yet.{' '}
                  <Link to="/courses" className="font-medium text-violet-600 underline-offset-2 hover:underline dark:text-violet-300">
                    Create a course
                  </Link>{' '}
                  to populate this panel.
                </p>
              ) : (
                lms.state.courses.map((c) => {
                  const p = lms.progressForCourse(c.id)
                  return (
                    <ProgressBar key={c.id} label={c.title} percent={p} hint={`${p}%`} />
                  )
                })
              )}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.45, delay: 0.06 }}
        >
          <GlassCard hover={false} className="flex h-full flex-col p-5 md:p-6">
            <SectionHeader
              title="Daily study goal"
              subtitle={`Based on today’s logged minutes vs your ${stats.dailyGoalHours}h target (editable in Settings).`}
            />
            <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-6 text-center">
              <div className="relative flex h-32 w-32 items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-600/50 to-indigo-500/40 blur-xl"
                  aria-hidden
                  initial={{ opacity: 0.5, scale: 0.9 }}
                  animate={{ opacity: 0.85, scale: 1 }}
                  transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}
                />
                <div className="relative flex h-28 w-28 flex-col items-center justify-center rounded-full border border-zinc-200/90 bg-white/90 shadow-inner shadow-zinc-200/50 dark:border-white/15 dark:bg-zinc-950/90 dark:shadow-black/40">
                  <span className="text-3xl font-bold tabular-nums text-zinc-900 dark:text-white">{dailyPct}%</span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    Today
                  </span>
                </div>
              </div>
              <div className="w-full space-y-2 text-left">
                <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-900 dark:text-white">{stats.dailyDoneHoursToday}h</span>
                  <span className="text-zinc-400 dark:text-zinc-600"> / </span>
                  <span>{stats.dailyGoalHours}h</span> planned focus
                </p>
                <ProgressBar label="Goal completion" percent={dailyPct} hint={`${dailyPct}%`} />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: 0.45 }}
        aria-label="AI assistant shortcuts"
      >
        <AiQuickActions />
      </motion.section>

      <motion.section
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: 0.45 }}
        aria-labelledby="dash-charts-heading"
      >
        <h2 id="dash-charts-heading" className="sr-only">
          Study charts
        </h2>
        <ChartContainer
          title="Weekly study activity"
          subtitle="Built from your saved sessions for the current week (Mon–Sun)."
          loading={false}
        >
          <WeeklyStudyChart data={stats.weeklyChartData} yMax={weekYMax} />
        </ChartContainer>
        <ChartContainer
          title="Course completion"
          subtitle={
            lms.state.courses.length
              ? 'Live completion percentages from your LMS courses.'
              : 'Placeholder mix until you add courses — then this chart switches automatically.'
          }
          loading={false}
        >
          <CourseCompletionChart data={lmsChartData} />
        </ChartContainer>
      </motion.section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ActivityTimeline items={recentActivities} />
        <UpcomingTasksPanel />
      </div>
    </PageContainer>
  )
}

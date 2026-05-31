import { useMemo } from 'react'
import { BarChart3, TrendingUp, PieChart, Activity, Award, BookOpen, Clock } from 'lucide-react'
import { PageShell } from '../components/page/PageShell.jsx'
import { Card } from '../components/ui/Card.jsx'
import { useFirestoreData } from '../hooks/useFirestoreData.js'

export function AnalyticsPage() {
  const { quizAttempts } = useFirestoreData()

  // Calculate quiz analytics
  const quizAnalytics = useMemo(() => {
    if (!quizAttempts || quizAttempts.length === 0) {
      return {
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0,
        recentQuiz: null,
      }
    }

    const totalQuizzes = quizAttempts.length
    const averageScore = Math.round(
      quizAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalQuizzes
    )
    const bestScore = Math.max(...quizAttempts.map((attempt) => attempt.percentage))
    const recentQuiz = quizAttempts[0]

    return {
      totalQuizzes,
      averageScore,
      bestScore,
      recentQuiz,
    }
  }, [quizAttempts])

  return (
    <PageShell
      icon={BarChart3}
      title="Analytics"
      description="Track your learning progress and quiz performance over time."
      highlights={[
        {
          title: 'Learning velocity',
          text: 'Track how fast you move through modules compared to your own baseline.',
        },
        {
          title: 'Engagement mix',
          text: 'Balance passive video time with active recall and practice prompts.',
        },
        {
          title: 'Export snapshots',
          text: 'PNG or CSV exports are a nice touch for mentors or hiring managers.',
        },
      ]}
    >
      {/* Quiz Learning Analytics */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
              <BookOpen className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Total Quizzes</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-white">{quizAnalytics.totalQuizzes}</p>
            </div>
          </div>
        </Card>
        <Card padding="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
              <TrendingUp className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Average Score</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-white">{quizAnalytics.averageScore}%</p>
            </div>
          </div>
        </Card>
        <Card padding="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
              <Award className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Best Score</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-white">{quizAnalytics.bestScore}%</p>
            </div>
          </div>
        </Card>
        <Card padding="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
              <Clock className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Recent Quiz</p>
              <p className="truncate text-lg font-semibold text-zinc-900 dark:text-white">
                {quizAnalytics.recentQuiz?.quizTitle || 'No quizzes yet'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Chart placeholder */}
      <div className="rounded-2xl border border-zinc-200/90 bg-gradient-to-br from-white/90 to-violet-50/80 p-6 shadow-lg shadow-violet-500/10 backdrop-blur-xl dark:border-white/10 dark:from-zinc-900/80 dark:to-violet-950/30 dark:shadow-none">
        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
          <TrendingUp className="h-5 w-5 text-emerald-300/90" aria-hidden />
          Chart area placeholder — drop in Recharts or similar when you add data.
        </div>
        <div className="mt-6 flex h-40 items-end justify-between gap-2 rounded-xl border border-zinc-200/80 bg-white/80 px-4 pb-4 pt-8 dark:border-white/5 dark:bg-black/20">
          {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
            <div
              key={i}
              className="w-full max-w-[2.5rem] rounded-t-md bg-gradient-to-t from-violet-600/40 to-violet-400/90 transition hover:from-violet-500/50 hover:to-fuchsia-300/90"
              style={{ height: `${h}%` }}
              aria-hidden
            />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <PieChart className="h-3.5 w-3.5 text-violet-300" aria-hidden />
            Distribution widgets
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-indigo-300" aria-hidden />
            Session health
          </span>
        </div>
      </div>
    </PageShell>
  )
}

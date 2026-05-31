import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Award, BookOpen, Clock, TrendingUp } from 'lucide-react'
import { PageShell } from '../components/page/PageShell.jsx'
import { Card } from '../components/ui/Card.jsx'
import { SectionHeader } from '../components/ui/SectionHeader.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { SkeletonPulse } from '../components/dashboard/SkeletonPulse.jsx'
import { useFirestoreData } from '../hooks/useFirestoreData.js'

/**
 * QuizHistoryPage — Display quiz attempts and learning analytics.
 */
export function QuizHistoryPage() {
  const { quizAttempts, loading } = useFirestoreData()

  // Calculate analytics
  const analytics = useMemo(() => {
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
      icon={BookOpen}
      title="Quiz History"
      description="Track your learning progress and quiz performance over time."
      highlights={[]}
    >
      {/* Analytics Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
              <BookOpen className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Total Quizzes</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-white">{analytics.totalQuizzes}</p>
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
              <p className="text-lg font-semibold text-zinc-900 dark:text-white">{analytics.averageScore}%</p>
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
              <p className="text-lg font-semibold text-zinc-900 dark:text-white">{analytics.bestScore}%</p>
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
                {analytics.recentQuiz?.quizTitle || 'No quizzes yet'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quiz History List */}
      <Card padding="p-0 overflow-hidden">
        <div className="border-b border-zinc-200/90 px-5 py-4 dark:border-white/10 md:px-6">
          <SectionHeader
            title="Quiz Attempts"
            subtitle={loading ? 'Loading…' : `${quizAttempts.length} attempt${quizAttempts.length === 1 ? '' : 's'}`}
          />
        </div>
        {loading ? (
          <div className="space-y-3 p-5 md:p-6">
            <SkeletonPulse className="h-20 w-full rounded-xl" />
            <SkeletonPulse className="h-20 w-full rounded-xl" />
          </div>
        ) : quizAttempts.length === 0 ? (
          <div className="p-5 md:p-6">
            <EmptyState
              icon={BookOpen}
              title="No quiz attempts yet"
              description="Complete a quiz to see your learning progress here."
            />
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200/90 dark:divide-white/10">
            {quizAttempts.map((attempt, i) => (
              <motion.li
                key={attempt.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.18) }}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between md:px-6"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-zinc-900 dark:text-white">{attempt.quizTitle}</h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Score: {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-600">
                    {attempt.completedAt ? `Completed ${new Date(attempt.completedAt).toLocaleString()}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <div
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${
                      attempt.percentage >= 80
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                        : attempt.percentage >= 60
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                    }`}
                  >
                    {attempt.percentage >= 80 ? 'Excellent' : attempt.percentage >= 60 ? 'Good' : 'Keep practicing'}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </Card>
    </PageShell>
  )
}

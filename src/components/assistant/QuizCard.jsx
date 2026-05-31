import { useState } from 'react'
import { CheckCircle2, Circle, XCircle } from 'lucide-react'

export function QuizCard({ quiz, onQuizComplete }) {
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)

  const handleSelectAnswer = (questionIndex, optionIndex) => {
    if (showResults) return
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }))
  }

  const handleSubmit = () => {
    console.log('[QuizCard] Quiz submitted')
    setShowResults(true)

    // Calculate score
    const score = calculateScore()
    const percentage = Math.round((score.correct / score.total) * 100)

    console.log('[QuizCard] Score calculated:', score, 'Percentage:', percentage)

    // Notify parent component
    if (onQuizComplete) {
      console.log('[QuizCard] Calling onQuizComplete with:', {
        quizId: quiz.id,
        quizTitle: quiz.title,
        score: score.correct,
        totalQuestions: score.total,
        percentage,
      })
      onQuizComplete({
        quizId: quiz.id,
        quizTitle: quiz.title,
        score: score.correct,
        totalQuestions: score.total,
        percentage,
      })
    } else {
      console.log('[QuizCard] onQuizComplete callback is not defined')
    }
  }

  const handleReset = () => {
    setSelectedAnswers({})
    setShowResults(false)
  }

  const calculateScore = () => {
    let correct = 0
    quiz.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++
      }
    })
    return { correct, total: quiz.questions.length }
  }

  const score = calculateScore()

  return (
    <div className="mt-3 rounded-2xl border border-violet-200/90 bg-violet-50/50 p-4 dark:border-violet-400/20 dark:bg-violet-500/5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{quiz.title}</h3>
        {showResults && (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              Score: {score.correct}/{score.total}
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100 dark:text-violet-300 dark:hover:bg-violet-500/10"
            >
              Retake
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {quiz.questions.map((question, qIndex) => (
          <div key={qIndex} className="space-y-2">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              {qIndex + 1}. {question.question}
            </p>
            {question.rawContent && (
              <div className="rounded-lg border border-zinc-200/80 bg-zinc-50 p-3 text-xs text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                <p className="mb-1 font-medium">Raw model output:</p>
                <pre className="whitespace-pre-wrap break-words">{question.rawContent}</pre>
              </div>
            )}
            <div className="space-y-1.5">
              {question.options.map((option, oIndex) => {
                const isSelected = selectedAnswers[qIndex] === oIndex
                const isCorrect = question.correctAnswer === oIndex
                const showCorrect = showResults && isCorrect
                const showIncorrect = showResults && isSelected && !isCorrect

                return (
                  <button
                    key={oIndex}
                    type="button"
                    onClick={() => handleSelectAnswer(qIndex, oIndex)}
                    disabled={showResults}
                    className={`flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      isSelected
                        ? 'border-violet-400 bg-violet-100 text-zinc-900 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-zinc-100'
                        : showCorrect
                          ? 'border-emerald-400 bg-emerald-50 text-zinc-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-zinc-100'
                          : showIncorrect
                            ? 'border-rose-400 bg-rose-50 text-zinc-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-zinc-100'
                            : 'border-zinc-200/80 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10'
                    }`}
                  >
                    <span className="mt-0.5 shrink-0">
                      {showCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : showIncorrect ? (
                        <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                      ) : isSelected ? (
                        <CheckCircle2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      ) : (
                        <Circle className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                      )}
                    </span>
                    <span className="flex-1">{option}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {!showResults && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length < quiz.questions.length}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-violet-500 dark:hover:bg-violet-600"
          >
            Submit Answers
          </button>
        </div>
      )}
    </div>
  )
}

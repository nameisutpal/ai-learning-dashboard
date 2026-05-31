import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bot, Check, Loader2, MessageSquare, Sparkles, StickyNote, User, Layers } from 'lucide-react'
import { EmptyState } from '../ui/EmptyState.jsx'
import { SkeletonPulse } from '../dashboard/SkeletonPulse.jsx'
import { MarkdownMessage } from './MarkdownMessage.jsx'
import { QuizCard } from './QuizCard.jsx'
import { TypingIndicator } from './TypingIndicator.jsx'

function MessageBubble({ message, onGenerateQuiz, isGeneratingQuiz, onGenerateFlashcards, isGeneratingFlashcards, onSaveAsNote, isSavingNote, savedNoteIds, userPrompt }) {
  const isUser = message.role === 'user'
  const Icon = isUser ? User : Bot
  const isSaved = savedNoteIds?.has(message.id)

  return (
    <article className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser ? (
        <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-300/40 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-200">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      ) : null}
      <div
        className={`max-w-[min(42rem,85%)] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-600/20'
            : 'border border-zinc-200/90 bg-white/85 text-zinc-800 dark:border-white/10 dark:bg-white/[0.055] dark:text-zinc-100'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <>
            <MarkdownMessage content={message.content} />
            {!isUser && (
              <div className="mt-3 flex flex-wrap gap-2">
                {onGenerateQuiz && (
                  <button
                    type="button"
                    onClick={() => onGenerateQuiz(message.content)}
                    disabled={isGeneratingQuiz}
                    className="flex items-center gap-2 rounded-lg border border-violet-200/80 bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
                  >
                    {isGeneratingQuiz ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                        Generating Quiz...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" aria-hidden />
                        Generate Quiz
                      </>
                    )}
                  </button>
                )}
                {onGenerateFlashcards && (
                  <button
                    type="button"
                    onClick={() => onGenerateFlashcards(message.content)}
                    disabled={isGeneratingFlashcards}
                    className="flex items-center gap-2 rounded-lg border border-violet-200/80 bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
                  >
                    {isGeneratingFlashcards ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                        Generating Flashcards...
                      </>
                    ) : (
                      <>
                        <Layers className="h-3.5 w-3.5" aria-hidden />
                        Generate Flashcards
                      </>
                    )}
                  </button>
                )}
                {onSaveAsNote && (
                  <button
                    type="button"
                    onClick={() => onSaveAsNote(message.content, message.id, userPrompt)}
                    disabled={isSavingNote || isSaved}
                    className="flex items-center gap-2 rounded-lg border border-violet-200/80 bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
                  >
                    {isSavingNote ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                        Saving...
                      </>
                    ) : isSaved ? (
                      <>
                        <Check className="h-3.5 w-3.5" aria-hidden />
                        Saved
                      </>
                    ) : (
                      <>
                        <StickyNote className="h-3.5 w-3.5" aria-hidden />
                        Save as Note
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
      {isUser ? (
        <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200/90 bg-white text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      ) : null}
    </article>
  )
}

export function ChatThread({ messages, streamingMessage, loading, isTyping, error, onGenerateQuiz, quizzes, isGeneratingQuiz, onSaveAsNote, isSavingNote, savedNoteIds, onQuizComplete }) {
  const scrollerRef = useRef(null)
  const bottomRef = useRef(null)
  const [nearBottom, setNearBottom] = useState(true)

  const rows = useMemo(
    () => (streamingMessage ? [...messages, streamingMessage] : messages),
    [messages, streamingMessage],
  )

  useEffect(() => {
    if (!nearBottom) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [rows, isTyping, nearBottom, quizzes])

  // Find the user prompt that preceded each assistant message
  const getUserPromptForMessage = useCallback((messageIndex) => {
    if (rows[messageIndex].role !== 'assistant') return null
    // Look for the most recent user message before this assistant message
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (rows[i].role === 'user') {
        return rows[i].content
      }
    }
    return null
  }, [rows])

  function handleScroll() {
    const el = scrollerRef.current
    if (!el) return
    setNearBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 140)
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 overflow-hidden p-4 md:p-6">
        <SkeletonPulse className="h-16 w-3/4 rounded-2xl" />
        <SkeletonPulse className="ml-auto h-16 w-2/3 rounded-2xl" />
        <SkeletonPulse className="h-24 w-4/5 rounded-2xl" />
      </div>
    )
  }

  return (
    <div ref={scrollerRef} onScroll={handleScroll} className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
      {rows.length === 0 ? (
        <div className="flex min-h-full items-center justify-center">
          <EmptyState
            icon={MessageSquare}
            title="Start a learning chat"
            description="Ask for an explanation, quiz, study plan, or a quick summary. Your conversation will save to Firestore."
          />
        </div>
      ) : (
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          {rows.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              onGenerateQuiz={onGenerateQuiz}
              isGeneratingQuiz={isGeneratingQuiz}
              onSaveAsNote={onSaveAsNote}
              isSavingNote={isSavingNote}
              savedNoteIds={savedNoteIds}
              userPrompt={getUserPromptForMessage(index)}
            />
          ))}
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="mx-auto max-w-4xl">
              <QuizCard quiz={quiz} onQuizComplete={(result) => {
                console.log('[ChatThread] onQuizComplete callback fired with:', result)
                if (onQuizComplete) {
                  onQuizComplete(result)
                } else {
                  console.log('[ChatThread] onQuizComplete prop is not defined')
                }
              }} />
            </div>
          ))}
          {isTyping ? (
            <div className="flex gap-3">
              <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-300/40 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-200">
                <Bot className="h-4 w-4" aria-hidden />
              </span>
              <TypingIndicator />
            </div>
          ) : null}
          {error ? (
            <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-100">
              {error}
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}

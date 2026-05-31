export function TypingIndicator() {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-violet-300/40 bg-violet-50 px-3 py-2 dark:border-violet-400/20 dark:bg-violet-500/10">
      <span className="sr-only">Assistant is typing</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-600 dark:bg-violet-300"
          style={{ animationDelay: `${i * 120}ms` }}
          aria-hidden
        />
      ))}
    </div>
  )
}

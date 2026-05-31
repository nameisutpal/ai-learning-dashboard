/**
 * Card — glass panel wrapper used across forms and lists.
 */
export function Card({ children, className = '', padding = 'p-5', hover = false }) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200/90 bg-white/75 shadow-lg shadow-violet-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/25 ${padding} ${
        hover ? 'transition hover:border-violet-400/40 hover:bg-white/90 dark:hover:border-violet-400/30 dark:hover:bg-white/[0.055]' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

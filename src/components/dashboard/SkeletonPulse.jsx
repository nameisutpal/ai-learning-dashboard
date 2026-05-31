/**
 * SkeletonPulse — shimmering placeholder for loading states (no API yet).
 */
export function SkeletonPulse({ className = '', style }) {
  return (
    <span
      className={`block animate-pulse rounded-lg bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:200%_100%] dark:from-zinc-800/90 dark:via-zinc-600/50 dark:to-zinc-800/90 ${className}`}
      style={style}
      aria-hidden
    />
  )
}

/** Placeholder chart bars — use when ChartContainer `loading` is true. */
export function ChartSkeleton() {
  const heightsPct = [48, 66, 42, 78, 55, 88, 60]
  return (
    <div className="flex h-full items-end justify-between gap-2 px-1 pt-4">
      {heightsPct.map((pct, i) => (
        <div key={i} className="flex h-full min-h-0 flex-1 flex-col justify-end">
          <SkeletonPulse className="w-full max-w-full rounded-md" style={{ height: `${pct}%` }} />
        </div>
      ))}
    </div>
  )
}

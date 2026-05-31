/**
 * SectionHeader — reusable title row for any page or panel.
 */
export function SectionHeader({ title, subtitle, action, id }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h2 id={id} className="text-lg font-semibold tracking-tight text-zinc-900 md:text-xl dark:text-white">
          {title}
        </h2>
        {subtitle ? <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-500">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

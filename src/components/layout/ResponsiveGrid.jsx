/**
 * ResponsiveGrid — opinionated 1 → 2 → 3 column layout for feature grids.
 * Override with `className` when a page needs a different rhythm.
 */
export function ResponsiveGrid({
  children,
  className = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6',
}) {
  return <div className={className}>{children}</div>
}

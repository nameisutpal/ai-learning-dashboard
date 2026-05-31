import { GlassCard } from './GlassCard.jsx'
import { SectionHeader } from './SectionHeader.jsx'
import { ChartSkeleton } from './SkeletonPulse.jsx'

/**
 * ChartContainer — shared glass frame + title for Recharts (or any chart library).
 */
export function ChartContainer({ title, subtitle, children, loading = false, className = '' }) {
  return (
    <GlassCard hover={false} className={`p-5 md:p-6 ${className}`}>
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="mt-5 h-[200px] w-full min-w-0 sm:h-[240px] md:h-[280px]">{loading ? <ChartSkeleton /> : children}</div>
    </GlassCard>
  )
}

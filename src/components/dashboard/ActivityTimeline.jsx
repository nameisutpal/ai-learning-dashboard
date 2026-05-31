import { motion } from 'framer-motion'
import { GlassCard } from './GlassCard.jsx'
import { SectionHeader } from './SectionHeader.jsx'

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
}

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
}

/**
 * ActivityTimeline — vertical line + dots for a SaaS-style feed.
 *
 * Props:
 * - items: array with { id, title, time, icon } (icon = Lucide component)
 */
export function ActivityTimeline({ items }) {
  return (
    <GlassCard hover={false} className="p-5 md:p-6">
      <SectionHeader
        title="Recent activity"
        subtitle="A lightweight timeline you can later drive from events in your database."
      />
      <motion.ol
        className="relative mt-6 ml-3 border-l border-violet-300/50 pl-8 dark:border-violet-500/25"
        variants={listVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        aria-label="Recent activity timeline"
      >
        {items.map((row) => {
          const Icon = row.icon
          return (
            <motion.li
              key={row.id}
              variants={rowVariants}
              className="relative pb-8 last:pb-0"
            >
              <span className="absolute -left-[39px] top-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-violet-400/50 bg-white text-violet-700 shadow-[0_0_18px_-5px_rgba(167,139,250,0.45)] dark:border-violet-400/40 dark:bg-zinc-950/95 dark:text-violet-200 dark:shadow-[0_0_18px_-5px_rgba(167,139,250,0.55)]">
                <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{row.title}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{row.time}</p>
              </div>
            </motion.li>
          )
        })}
      </motion.ol>
    </GlassCard>
  )
}

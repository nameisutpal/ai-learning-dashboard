import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BookOpenCheck, ClipboardList, Lightbulb, MessageSquare } from 'lucide-react'
import { GlassCard } from './GlassCard.jsx'
import { SectionHeader } from './SectionHeader.jsx'

const actions = [
  {
    id: 'summarize',
    label: 'Summarize',
    description: 'Turn dense notes into skimmable bullets.',
    icon: ClipboardList,
    to: '/assistant',
  },
  {
    id: 'quiz',
    label: 'Quiz me',
    description: 'Adaptive checks on what you studied today.',
    icon: BookOpenCheck,
    to: '/assistant',
  },
  {
    id: 'explain',
    label: 'Explain',
    description: 'Break down a tough concept in plain language.',
    icon: Lightbulb,
    to: '/assistant',
  },
  {
    id: 'plan',
    label: 'Plan session',
    description: 'Build a focused 25–50 minute study block.',
    icon: MessageSquare,
    to: '/assistant',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

/**
 * AIQuickActions — grid of glass links with Framer Motion stagger.
 */
export function AiQuickActions() {
  return (
    <GlassCard hover={false} className="p-5 md:p-6">
      <SectionHeader
        title="AI assistant quick actions"
        subtitle="Jump into common workflows — wire these to real prompts when you connect a backend."
      />
      <motion.ul
        className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
      >
        {actions.map((a) => {
          const Icon = a.icon
          return (
            <motion.li key={a.id} variants={item}>
              <Link
                to={a.to}
                className="group flex h-full min-h-[120px] flex-col rounded-2xl border border-zinc-200/90 bg-white/60 p-4 transition duration-300 hover:border-violet-400/45 hover:bg-violet-50/80 dark:border-white/10 dark:bg-black/20 dark:hover:border-violet-400/35 dark:hover:bg-violet-500/[0.07]"
              >
                <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-violet-200/80 bg-gradient-to-br from-violet-500/25 to-indigo-600/20 text-violet-800 transition group-hover:scale-105 dark:border-white/10 dark:from-violet-500/30 dark:to-indigo-600/20 dark:text-violet-100">
                  <Icon className="h-5 w-5" strokeWidth={1.65} aria-hidden />
                </span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">{a.label}</span>
                <span className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-500">{a.description}</span>
              </Link>
            </motion.li>
          )
        })}
      </motion.ul>
    </GlassCard>
  )
}

import { motion } from 'framer-motion'

/**
 * GlassCard — reusable glassmorphism surface with a gentle hover lift.
 */
export function GlassCard({ children, className = '', hover = true, asMotion = true }) {
  const baseClass = `relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/70 shadow-lg shadow-violet-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/25 ${className}`

  if (!asMotion) {
    return <div className={baseClass}>{children}</div>
  }

  return (
    <motion.div
      className={baseClass}
      whileHover={
        hover
          ? {
              y: -4,
              boxShadow: '0 24px 48px -12px rgba(139, 92, 246, 0.32), 0 12px 24px -8px rgba(0,0,0,0.25)',
              borderColor: 'rgba(167, 139, 250, 0.45)',
            }
          : undefined
      }
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
    >
      {children}
    </motion.div>
  )
}

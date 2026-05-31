import { useLocation, Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * Wraps `<Outlet />` with a lightweight cross-fade + slide when routes change.
 * Lives in the layout so lazy-loaded chunks still suspend inside this boundary.
 */
export function PageTransition() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-0 flex-1"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}

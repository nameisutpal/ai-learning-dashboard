import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ToastContext } from './toastContext.js'

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/**
 * ToastProvider — mount once near the app root (see `main.jsx`).
 * Call `useToast()` from `src/hooks/useToast.js` inside any child component.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, variant = 'success') => {
    const id = newId()
    setToasts((prev) => [...prev, { id, message, variant }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4200)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-24 right-4 z-[200] flex w-[min(100%,20rem)] flex-col gap-2 sm:bottom-28 sm:right-6 lg:bottom-6"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 16, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur-xl ${
                t.variant === 'error'
                  ? 'border-rose-300/60 bg-rose-50/95 text-rose-900 dark:border-rose-400/35 dark:bg-rose-950/90 dark:text-rose-50'
                  : 'border-emerald-300/60 bg-emerald-50/95 text-emerald-900 dark:border-emerald-400/30 dark:bg-zinc-950/90 dark:text-emerald-50'
              }`}
              role="status"
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * Modal — accessible overlay dialog (Escape + backdrop click close).
 */
export function Modal({ isOpen, onClose, title, children, footer }) {
  useEffect(() => {
    if (!isOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          key="modal-root"
          className="fixed inset-0 z-[150] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm dark:bg-black/75"
            aria-label="Close dialog"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xl shadow-violet-500/20 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/95 dark:shadow-violet-950/40"
          >
            <h2 id="modal-title" className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
              {title}
            </h2>
            <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">{children}</div>
            {footer ? (
              <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-zinc-200/90 pt-4 dark:border-white/10">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

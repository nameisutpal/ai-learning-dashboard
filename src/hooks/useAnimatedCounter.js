import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion.js'

/**
 * Smoothly eases a displayed number toward `target` — used by dashboard KPI tiles.
 * When `prefers-reduced-motion` is on, returns `target` directly (no effect-driven setState).
 */
export function useAnimatedCounter(target, { duration = 900 } = {}) {
  const reduced = usePrefersReducedMotion()
  const [animated, setAnimated] = useState(0)
  const displayRef = useRef(0)

  useEffect(() => {
    displayRef.current = animated
  }, [animated])

  useEffect(() => {
    if (reduced) return undefined

    const from = displayRef.current
    let raf = 0
    const start = performance.now()
    const delta = target - from

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) ** 3
      const next = from + delta * eased
      displayRef.current = next
      setAnimated(next)
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, reduced])

  return reduced ? target : animated
}

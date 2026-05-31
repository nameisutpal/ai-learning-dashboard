import { useEffect, useState } from 'react'

/**
 * Returns true when the user prefers reduced motion (OS accessibility setting).
 * Animated counters skip easing when this is true — better UX + a11y.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  return reduced
}

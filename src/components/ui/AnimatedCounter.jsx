import { useAnimatedCounter } from '../../hooks/useAnimatedCounter.js'

/**
 * Tabular-nums counter for KPI tiles — decimals kept small for readability.
 */
export function AnimatedCounter({ value, decimals = 0, className = '' }) {
  const display = useAnimatedCounter(Number(value) || 0)
  const text = decimals > 0 ? (Math.round(display * 10 ** decimals) / 10 ** decimals).toFixed(decimals) : String(Math.round(display))
  return <span className={`tabular-nums ${className}`.trim()}>{text}</span>
}

/** Same-tab + cross-tab listeners use this event name. */
export const LS_EVENT = 'ai-learn:storage'

export function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    const parsed = JSON.parse(raw)
    return parsed
  } catch {
    return fallback
  }
}

/** Writes JSON and notifies every listener (including other components in this tab). */
export function writeLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent(LS_EVENT, { detail: { key } }))
}

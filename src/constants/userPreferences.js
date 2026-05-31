/**
 * Default user preferences — merged on read so older LocalStorage blobs stay valid
 * when new fields are added (forward-compatible for portfolio growth).
 */
export const DEFAULT_USER_PREFERENCES = Object.freeze({
  /** `'dark'` | `'light'` | `'system'` — `system` follows OS `prefers-color-scheme`. */
  theme: 'dark',
  /** Daily study target in hours (drives dashboard “today” ring + stats copy). */
  studyGoalHours: 4,
  /** Weekly hours target for the progress KPI (Mon–Sun sum vs this number). */
  weeklyGoalHours: 20,
  /** Tighter vertical rhythm site-wide when true (see DashboardLayout main padding). */
  compactMode: false,
  /** Frontend-only toggles — wire to real notifications when you add a backend. */
  notifications: Object.freeze({
    studyReminders: true,
    weeklyDigest: true,
    productTips: false,
  }),
})

/**
 * Deep-merge notifications and top-level keys so partial saves never wipe nested objects.
 */
export function normalizeUserPreferences(raw) {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_USER_PREFERENCES, notifications: { ...DEFAULT_USER_PREFERENCES.notifications } }
  }
  return {
    ...DEFAULT_USER_PREFERENCES,
    ...raw,
    studyGoalHours: clampDailyHours(raw.studyGoalHours, DEFAULT_USER_PREFERENCES.studyGoalHours),
    weeklyGoalHours: clampWeeklyHours(raw.weeklyGoalHours, DEFAULT_USER_PREFERENCES.weeklyGoalHours),
    notifications: {
      ...DEFAULT_USER_PREFERENCES.notifications,
      ...(typeof raw.notifications === 'object' && raw.notifications ? raw.notifications : {}),
    },
  }
}

function clampDailyHours(value, fallback) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return Math.min(24, Math.max(0.5, Math.round(n * 2) / 2))
}

function clampWeeklyHours(value, fallback) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return Math.min(80, Math.max(1, Math.round(n)))
}

import { readUserPreferences } from './preferences.js'

function toYMD(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Monday-start week (local timezone). */
function getMonday(d) {
  const x = new Date(d)
  const offset = (x.getDay() + 6) % 7
  x.setDate(x.getDate() - offset)
  x.setHours(0, 0, 0, 0)
  return x
}

const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/**
 * Sum session minutes where `date` falls in the current Mon–Sun window.
 * `sessions` shape matches Firestore rows: `{ date, durationMinutes, ... }`.
 */
export function buildWeeklyChartSeries(sessions) {
  const monday = getMonday(new Date())
  return SHORT_DAYS.map((label, i) => {
    const dt = new Date(monday)
    dt.setDate(monday.getDate() + i)
    const key = toYMD(dt)
    const minutes = sessions
      .filter((s) => s.date === key)
      .reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0)
    const hours = Math.round((minutes / 60) * 10) / 10
    return { day: label, hours }
  })
}

/**
 * Count consecutive calendar days with ≥1 session.
 */
export function computeStreakDays(sessions) {
  if (!sessions.length) return 0
  const dates = new Set(sessions.map((s) => s.date))
  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  const todayStr = toYMD(cursor)
  if (!dates.has(todayStr)) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (dates.has(toYMD(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
    if (streak > 400) break
  }
  return streak
}

/**
 * Dashboard KPI math from in-memory arrays (fed by Firestore snapshots in `FirestoreDataProvider`).
 * Preferences (daily/weekly goals) still come from LocalStorage via `readUserPreferences()`.
 */
export function computeDashboardStats(sessions = [], tasks = [], notes = [], preferencesOverride = null) {
  const prefs =
    preferencesOverride && typeof preferencesOverride === 'object'
      ? preferencesOverride
      : readUserPreferences()
  const dailyGoalHours = prefs.studyGoalHours
  const weeklyGoalHours = prefs.weeklyGoalHours

  const totalMinutes = sessions.reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0)
  const totalStudyHours = Math.round((totalMinutes / 60) * 10) / 10

  const weekSeries = buildWeeklyChartSeries(sessions)
  const thisWeekHours =
    Math.round(weekSeries.reduce((sum, row) => sum + row.hours, 0) * 10) / 10
  const weeklyProgressPercent = Math.min(
    100,
    Math.round((thisWeekHours / Math.max(weeklyGoalHours, 0.01)) * 100) || 0,
  )

  const todayStr = toYMD(new Date())
  const todayMinutes = sessions
    .filter((s) => s.date === todayStr)
    .reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0)
  const dailyDoneHoursToday = Math.round((todayMinutes / 60) * 10) / 10

  const tasksTotal = tasks.length
  const tasksCompleted = tasks.filter((t) => t.done).length

  return {
    totalStudyHours,
    thisWeekHours,
    weeklyProgressPercent,
    dailyDoneHoursToday,
    dailyGoalHours,
    weeklyGoalHours,
    tasksTotal,
    tasksCompleted,
    notesCount: notes.length,
    streakDays: computeStreakDays(sessions),
    weeklyChartData: weekSeries,
  }
}

/** @typedef {import('../domain/lmsTypes.js').Course} Course */
/** @typedef {import('../domain/lmsTypes.js').CourseTask} CourseTask */
/** @typedef {import('../domain/lmsTypes.js').LmsState} LmsState */
/** @typedef {import('../domain/lmsTypes.js').StudySession} StudySession */

/**
 * @param {string} startedAt
 * @param {string} endedAt
 */
export function sessionDurationMinutes(startedAt, endedAt) {
  const a = new Date(startedAt).getTime()
  const b = new Date(endedAt).getTime()
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 0
  return Math.round((b - a) / 60000)
}

/** @param {CourseTask[]} tasks */
export function tasksProgressPercent(tasks) {
  if (!tasks.length) return 0
  const done = tasks.filter((t) => t.done).length
  return Math.round((done / tasks.length) * 100)
}

/**
 * @param {string} courseId
 * @param {StudySession[]} sessions
 */
export function sessionMinutesForCourse(courseId, sessions) {
  return sessions
    .filter((s) => s.courseId === courseId)
    .reduce((acc, s) => acc + sessionDurationMinutes(s.startedAt, s.endedAt), 0)
}

/**
 * @param {Course} course
 * @param {CourseTask[]} tasks
 * @param {StudySession[]} sessions
 */
export function courseProgressPercent(course, tasks, sessions) {
  const courseTasks = tasks.filter((t) => t.courseId === course.id)
  if (courseTasks.length) return tasksProgressPercent(courseTasks)
  const minutes = sessionMinutesForCourse(course.id, sessions)
  const target = Math.max(1, course.estimatedDurationHours * 60)
  return Math.min(100, Math.round((minutes / target) * 100))
}

/** @param {LmsState} state */
export function totalLearningMinutes(state) {
  return state.sessions.reduce(
    (acc, s) => acc + sessionDurationMinutes(s.startedAt, s.endedAt),
    0,
  )
}

/** @param {LmsState} state */
export function mostStudiedCourseId(state) {
  /** @type {Map<string, number>} */
  const map = new Map()
  for (const s of state.sessions) {
    const m = sessionDurationMinutes(s.startedAt, s.endedAt)
    map.set(s.courseId, (map.get(s.courseId) ?? 0) + m)
  }
  let best = /** @type {string | null} */ (null)
  let bestM = 0
  for (const [id, m] of map) {
    if (m > bestM) {
      bestM = m
      best = id
    }
  }
  return best
}

/** @param {LmsState} state */
export function averageCompletionPercent(state) {
  if (!state.courses.length) return 0
  const sum = state.courses.reduce(
    (acc, c) => acc + courseProgressPercent(c, state.tasks, state.sessions),
    0,
  )
  return Math.round(sum / state.courses.length)
}

/**
 * @param {Date} d
 */
export function startOfWeekMonday(d) {
  const x = new Date(d)
  const day = x.getDay()
  const diff = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + diff)
  x.setHours(0, 0, 0, 0)
  return x
}

/**
 * @param {Date} startMonday
 */
export function eachDayOfWeek(startMonday) {
  const out = []
  for (let i = 0; i < 7; i++) {
    const n = new Date(startMonday)
    n.setDate(startMonday.getDate() + i)
    out.push(n)
  }
  return out
}

/**
 * @param {LmsState} state
 * @param {Date} [now]
 * @param {string} [courseId]
 */
export function weeklyConsistency(state, now = new Date(), courseId) {
  const start = startOfWeekMonday(now)
  const days = eachDayOfWeek(start)
  const sessions = courseId
    ? state.sessions.filter((s) => s.courseId === courseId)
    : state.sessions
  return days.map((day) => {
    const y = day.getFullYear()
    const m = day.getMonth()
    const d = day.getDate()
    return sessions.some((s) => {
      const dt = new Date(s.startedAt)
      if (dt.getFullYear() !== y || dt.getMonth() !== m || dt.getDate() !== d) return false
      return sessionDurationMinutes(s.startedAt, s.endedAt) > 0
    })
  })
}

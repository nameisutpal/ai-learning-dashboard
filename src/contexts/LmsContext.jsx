import { useCallback, useEffect, useMemo, useState } from 'react'
import { LS_KEYS } from '../constants/storageKeys.js'
import { loadLmsState, saveLmsState } from '../services/lmsState.js'
import { createId } from '../lib/id.js'
import {
  averageCompletionPercent,
  courseProgressPercent,
  mostStudiedCourseId,
  totalLearningMinutes,
} from '../lib/lmsProgress.js'
import { LmsContext } from './lmsContext.js'

function isoNow() {
  return new Date().toISOString()
}

export function LmsProvider({ children }) {
  const [state, setState] = useState(() => loadLmsState())

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === LS_KEYS.lmsState) setState(loadLmsState())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const replaceState = useCallback((next) => {
    saveLmsState(next)
    setState(next)
  }, [])

  const createCourse = useCallback((input) => {
    const id = createId()
    const now = isoNow()
    const course = { ...input, id, createdAt: now, updatedAt: now }
    setState((prev) => {
      const next = { ...prev, courses: [...prev.courses, course] }
      saveLmsState(next)
      return next
    })
    return course
  }, [])

  const updateCourse = useCallback((id, patch) => {
    setState((prev) => {
      const next = {
        ...prev,
        courses: prev.courses.map((c) =>
          c.id === id ? { ...c, ...patch, updatedAt: isoNow() } : c,
        ),
      }
      saveLmsState(next)
      return next
    })
  }, [])

  const deleteCourse = useCallback((id) => {
    setState((prev) => {
      const next = {
        ...prev,
        courses: prev.courses.filter((c) => c.id !== id),
        resources: prev.resources.filter((r) => r.courseId !== id),
        notes: prev.notes.filter((n) => n.courseId !== id),
        tasks: prev.tasks.filter((t) => t.courseId !== id),
        sessions: prev.sessions.filter((s) => s.courseId !== id),
      }
      saveLmsState(next)
      return next
    })
  }, [])

  const addResource = useCallback((input) => {
    const row = { ...input, id: createId(), createdAt: isoNow() }
    setState((prev) => {
      const next = { ...prev, resources: [...prev.resources, row] }
      saveLmsState(next)
      return next
    })
    return row
  }, [])

  const removeResource = useCallback((rid) => {
    setState((prev) => {
      const next = { ...prev, resources: prev.resources.filter((r) => r.id !== rid) }
      saveLmsState(next)
      return next
    })
  }, [])

  const upsertNote = useCallback((input) => {
    const now = input.updatedAt ?? isoNow()
    setState((prev) => {
      const exists = prev.notes.some((n) => n.id === input.id)
      const note = { ...input, updatedAt: now }
      const notes = exists
        ? prev.notes.map((n) => (n.id === input.id ? note : n))
        : [...prev.notes, note]
      const next = { ...prev, notes }
      saveLmsState(next)
      return next
    })
  }, [])

  const removeNote = useCallback((nid) => {
    setState((prev) => {
      const next = { ...prev, notes: prev.notes.filter((n) => n.id !== nid) }
      saveLmsState(next)
      return next
    })
  }, [])

  const addTask = useCallback((input) => {
    const row = { ...input, id: createId(), createdAt: isoNow() }
    setState((prev) => {
      const next = { ...prev, tasks: [...prev.tasks, row] }
      saveLmsState(next)
      return next
    })
    return row
  }, [])

  const toggleTask = useCallback((tid) => {
    setState((prev) => {
      const next = {
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === tid ? { ...t, done: !t.done } : t)),
      }
      saveLmsState(next)
      return next
    })
  }, [])

  const removeTask = useCallback((tid) => {
    setState((prev) => {
      const next = { ...prev, tasks: prev.tasks.filter((t) => t.id !== tid) }
      saveLmsState(next)
      return next
    })
  }, [])

  const addSession = useCallback((input) => {
    const row = { ...input, id: createId() }
    setState((prev) => {
      const next = { ...prev, sessions: [...prev.sessions, row] }
      saveLmsState(next)
      return next
    })
    return row
  }, [])

  const removeSession = useCallback((sid) => {
    setState((prev) => {
      const next = { ...prev, sessions: prev.sessions.filter((s) => s.id !== sid) }
      saveLmsState(next)
      return next
    })
  }, [])

  const getCourse = useCallback((id) => state.courses.find((c) => c.id === id), [state.courses])

  const progressForCourse = useCallback(
    (courseId) => {
      const c = state.courses.find((x) => x.id === courseId)
      if (!c) return 0
      return courseProgressPercent(c, state.tasks, state.sessions)
    },
    [state.courses, state.tasks, state.sessions],
  )

  const dashboardStats = useMemo(() => {
    const totalMin = totalLearningMinutes(state)
    const activeCourses = state.courses.filter(
      (c) => courseProgressPercent(c, state.tasks, state.sessions) < 100,
    ).length
    return {
      activeCourses,
      mostStudiedCourseId: mostStudiedCourseId(state),
      totalLearningHours: Math.round((totalMin / 60) * 10) / 10,
      averageCompletionPercent: averageCompletionPercent(state),
    }
  }, [state])

  const value = useMemo(
    () => ({
      state,
      replaceState,
      createCourse,
      updateCourse,
      deleteCourse,
      addResource,
      removeResource,
      upsertNote,
      removeNote,
      addTask,
      toggleTask,
      removeTask,
      addSession,
      removeSession,
      getCourse,
      dashboardStats,
      progressForCourse,
    }),
    [
      state,
      replaceState,
      createCourse,
      updateCourse,
      deleteCourse,
      addResource,
      removeResource,
      upsertNote,
      removeNote,
      addTask,
      toggleTask,
      removeTask,
      addSession,
      removeSession,
      getCourse,
      dashboardStats,
      progressForCourse,
    ],
  )

  return <LmsContext.Provider value={value}>{children}</LmsContext.Provider>
}

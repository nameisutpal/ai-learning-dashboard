import { startTransition, useCallback, useEffect, useMemo, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/firebase.js'
import { COLLECTIONS } from '../constants/firestoreCollections.js'
import { FirestoreDataContext } from './firestoreDataContext.js'
import { useAuth } from '../hooks/useAuth.js'
import { usePreferences } from '../hooks/usePreferences.js'
import { computeDashboardStats } from '../lib/stats.js'
import { toIso } from '../lib/firestoreTimestamps.js'

function mapSessionDoc(d) {
  const x = d.data()
  return {
    id: d.id,
    userId: x.userId,
    subject: x.subject ?? '',
    durationMinutes: Number(x.durationMinutes) || 0,
    date: x.date ?? '',
  }
}

function mapTaskDoc(d) {
  const x = d.data()
  return {
    id: d.id,
    userId: x.userId,
    title: x.title ?? '',
    done: Boolean(x.done),
    priority: x.priority ?? 'medium',
    createdAt: toIso(x.createdAt),
  }
}

function mapNoteDoc(d) {
  const x = d.data()
  return {
    id: d.id,
    userId: x.userId,
    title: x.title ?? '',
    content: x.content ?? '',
    updatedAt: toIso(x.updatedAt) || toIso(x.createdAt),
  }
}

function mapQuizAttemptDoc(d) {
  const x = d.data()
  return {
    id: d.id,
    userId: x.userId,
    quizId: x.quizId,
    quizTitle: x.quizTitle,
    score: x.score,
    totalQuestions: x.totalQuestions,
    percentage: x.percentage,
    completedAt: toIso(x.completedAt),
  }
}

function mapStudyPlanDoc(d) {
  const x = d.data()
  return {
    id: d.id,
    userId: x.userId,
    title: x.title ?? 'Study Plan',
    content: x.content ?? '',
    createdAt: toIso(x.createdAt),
  }
}

function mapDocumentDoc(d) {
  const x = d.data()
  return {
    id: d.id,
    userId: x.userId,
    fileName: x.fileName ?? '',
    fileUrl: x.fileUrl ?? '',
    uploadedAt: toIso(x.uploadedAt),
  }
}

function mapFlashcardDoc(d) {
  const x = d.data()
  return {
    id: d.id,
    userId: x.userId,
    title: x.title ?? 'Flashcards',
    cards: x.cards ?? [],
    sourceType: x.sourceType ?? 'ai',
    sourceId: x.sourceId ?? null,
    sourceTitle: x.sourceTitle ?? null,
    createdAt: toIso(x.createdAt),
    lastReviewedAt: toIso(x.lastReviewedAt),
  }
}

/**
 * FirestoreDataProvider — one real-time listener per collection for the signed-in user.
 *
 * Why one provider?
 * - Dashboard, Tasks page, Notes page, Study Tracker, and `UpcomingTasksPanel` all need the same rows.
 * - `onSnapshot` keeps every surface in sync without manual refetch.
 * - Security: queries always include `where('userId', '==', uid)` so rules can scope access per user.
 */
export function FirestoreDataProvider({ children }) {
  const { user } = useAuth()
  const { preferences } = usePreferences()
  const [sessions, setSessions] = useState([])
  const [tasks, setTasks] = useState([])
  const [notes, setNotes] = useState([])
  const [quizAttempts, setQuizAttempts] = useState([])
  const [studyPlans, setStudyPlans] = useState([])
  const [documents, setDocuments] = useState([])
  const [flashcards, setFlashcards] = useState([])
  const [sessionLoad, setSessionLoad] = useState(true)
  const [taskLoad, setTaskLoad] = useState(true)
  const [noteLoad, setNoteLoad] = useState(true)
  const [quizAttemptLoad, setQuizAttemptLoad] = useState(true)
  const [studyPlanLoad, setStudyPlanLoad] = useState(true)
  const [documentLoad, setDocumentLoad] = useState(true)
  const [flashcardLoad, setFlashcardLoad] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user?.uid) {
      startTransition(() => {
        setSessions([])
        setTasks([])
        setNotes([])
        setQuizAttempts([])
        setStudyPlans([])
        setDocuments([])
        setFlashcards([])
        setSessionLoad(false)
        setTaskLoad(false)
        setNoteLoad(false)
        setQuizAttemptLoad(false)
        setStudyPlanLoad(false)
        setDocumentLoad(false)
        setFlashcardLoad(false)
        setError(null)
      })
      return undefined
    }

    const uid = user.uid
    startTransition(() => {
      setSessionLoad(true)
      setTaskLoad(true)
      setNoteLoad(true)
      setQuizAttemptLoad(true)
      setStudyPlanLoad(true)
      setDocumentLoad(true)
      setFlashcardLoad(true)
      setError(null)
    })

    const qSessions = query(collection(db, COLLECTIONS.studySessions), where('userId', '==', uid))
    const qTasks = query(collection(db, COLLECTIONS.tasks), where('userId', '==', uid))
    const qNotes = query(collection(db, COLLECTIONS.notes), where('userId', '==', uid))
    const qQuizAttempts = query(
      collection(db, COLLECTIONS.quizAttempts),
      where('userId', '==', uid),
      orderBy('completedAt', 'desc'),
    )
    const qStudyPlans = query(
      collection(db, COLLECTIONS.studyPlans),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
    )
    const qDocuments = query(
      collection(db, COLLECTIONS.documents),
      where('userId', '==', uid),
      orderBy('uploadedAt', 'desc'),
    )
    const qFlashcards = query(
      collection(db, COLLECTIONS.flashcards),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
    )

    const unsubSessions = onSnapshot(
      qSessions,
      (snap) => {
        setSessions(snap.docs.map(mapSessionDoc))
        setSessionLoad(false)
      },
      (err) => {
        console.error(err)
        setError(err.message || 'Could not load study sessions.')
        setSessionLoad(false)
      },
    )

    const unsubTasks = onSnapshot(
      qTasks,
      (snap) => {
        setTasks(snap.docs.map(mapTaskDoc))
        setTaskLoad(false)
      },
      (err) => {
        console.error(err)
        setError(err.message || 'Could not load tasks.')
        setTaskLoad(false)
      },
    )

    const unsubNotes = onSnapshot(
      qNotes,
      (snap) => {
        setNotes(snap.docs.map(mapNoteDoc))
        setNoteLoad(false)
      },
      (err) => {
        console.error(err)
        setError(err.message || 'Could not load notes.')
        setNoteLoad(false)
      },
    )

    const unsubQuizAttempts = onSnapshot(
      qQuizAttempts,
      (snap) => {
        setQuizAttempts(snap.docs.map(mapQuizAttemptDoc))
        setQuizAttemptLoad(false)
      },
      (err) => {
        console.error(err)
        setError(err.message || 'Could not load quiz attempts.')
        setQuizAttemptLoad(false)
      },
    )

    const unsubStudyPlans = onSnapshot(
      qStudyPlans,
      (snap) => {
        setStudyPlans(snap.docs.map(mapStudyPlanDoc))
        setStudyPlanLoad(false)
      },
      (err) => {
        console.error(err)
        setError(err.message || 'Could not load study plans.')
        setStudyPlanLoad(false)
      },
    )

    const unsubDocuments = onSnapshot(
      qDocuments,
      (snap) => {
        setDocuments(snap.docs.map(mapDocumentDoc))
        setDocumentLoad(false)
      },
      (err) => {
        console.error(err)
        setError(err.message || 'Could not load documents.')
        setDocumentLoad(false)
      },
    )

    const unsubFlashcards = onSnapshot(
      qFlashcards,
      (snap) => {
        setFlashcards(snap.docs.map(mapFlashcardDoc))
        setFlashcardLoad(false)
      },
      (err) => {
        console.error(err)
        setError(err.message || 'Could not load flashcards.')
        setFlashcardLoad(false)
      },
    )

    return () => {
      unsubSessions()
      unsubTasks()
      unsubNotes()
      unsubQuizAttempts()
      unsubStudyPlans()
      unsubDocuments()
      unsubFlashcards()
    }
  }, [user?.uid])

  const loading = Boolean(user?.uid) && (sessionLoad || taskLoad || noteLoad || quizAttemptLoad || studyPlanLoad || documentLoad || flashcardLoad)

  const stats = useMemo(
    () => computeDashboardStats(sessions, tasks, notes, preferences),
    [sessions, tasks, notes, preferences],
  )

  const addSession = useCallback(
    async ({ subject, durationMinutes, date }) => {
      if (!user?.uid) return
      await addDoc(collection(db, COLLECTIONS.studySessions), {
        userId: user.uid,
        subject,
        durationMinutes,
        date,
        createdAt: serverTimestamp(),
      })
    },
    [user],
  )

  const deleteSession = useCallback(async (id) => {
    await deleteDoc(doc(db, COLLECTIONS.studySessions, id))
  }, [])

  const addTask = useCallback(
    async ({ title, priority }) => {
      if (!user?.uid) return
      await addDoc(collection(db, COLLECTIONS.tasks), {
        userId: user.uid,
        title,
        done: false,
        priority,
        createdAt: serverTimestamp(),
      })
    },
    [user],
  )

  const updateTaskDone = useCallback(async (id, done) => {
    await updateDoc(doc(db, COLLECTIONS.tasks, id), { done })
  }, [])

  const deleteTask = useCallback(async (id) => {
    await deleteDoc(doc(db, COLLECTIONS.tasks, id))
  }, [])

  const addNote = useCallback(
    async ({ title, content }) => {
      if (!user?.uid) return
      await addDoc(collection(db, COLLECTIONS.notes), {
        userId: user.uid,
        title,
        content,
        updatedAt: serverTimestamp(),
      })
    },
    [user],
  )

  const updateNote = useCallback(async (id, { title, content }) => {
    await updateDoc(doc(db, COLLECTIONS.notes, id), {
      title,
      content,
      updatedAt: serverTimestamp(),
    })
  }, [])

  const deleteNote = useCallback(async (id) => {
    await deleteDoc(doc(db, COLLECTIONS.notes, id))
  }, [])

  const addQuizAttempt = useCallback(
    async ({ quizId, quizTitle, score, totalQuestions, percentage }) => {
      if (!user?.uid) return
      await addDoc(collection(db, COLLECTIONS.quizAttempts), {
        userId: user.uid,
        quizId,
        quizTitle,
        score,
        totalQuestions,
        percentage,
        completedAt: serverTimestamp(),
      })
    },
    [user],
  )

  const addStudyPlan = useCallback(
    async ({ title, content }) => {
      if (!user?.uid) return
      await addDoc(collection(db, COLLECTIONS.studyPlans), {
        userId: user.uid,
        title,
        content,
        createdAt: serverTimestamp(),
      })
    },
    [user],
  )

  const deleteStudyPlan = useCallback(async (id) => {
    await deleteDoc(doc(db, COLLECTIONS.studyPlans, id))
  }, [])

  const addDocument = useCallback(
    async ({ fileName, fileUrl }) => {
      if (!user?.uid) return
      await addDoc(collection(db, COLLECTIONS.documents), {
        userId: user.uid,
        fileName,
        fileUrl,
        uploadedAt: serverTimestamp(),
      })
    },
    [user],
  )

  const deleteDocument = useCallback(async (id) => {
    await deleteDoc(doc(db, COLLECTIONS.documents, id))
  }, [])

  const addFlashcard = useCallback(
    async ({ title, cards, sourceType, sourceId, sourceTitle }) => {
      if (!user?.uid) return
      await addDoc(collection(db, COLLECTIONS.flashcards), {
        userId: user.uid,
        title,
        cards,
        sourceType,
        sourceId,
        sourceTitle,
        createdAt: serverTimestamp(),
        lastReviewedAt: null,
      })
    },
    [user],
  )

  const deleteFlashcard = useCallback(async (id) => {
    await deleteDoc(doc(db, COLLECTIONS.flashcards, id))
  }, [])

  const updateFlashcardCards = useCallback(async (id, cards) => {
    await updateDoc(doc(db, COLLECTIONS.flashcards, id), {
      cards,
      lastReviewedAt: serverTimestamp(),
    })
  }, [])

  const value = useMemo(
    () => ({
      user,
      sessions,
      tasks,
      notes,
      quizAttempts,
      studyPlans,
      documents,
      flashcards,
      loading,
      error,
      stats,
      addSession,
      deleteSession,
      addTask,
      updateTaskDone,
      deleteTask,
      addNote,
      updateNote,
      deleteNote,
      addQuizAttempt,
      addStudyPlan,
      deleteStudyPlan,
      addDocument,
      deleteDocument,
      addFlashcard,
      deleteFlashcard,
      updateFlashcardCards,
    }),
    [
      user,
      sessions,
      tasks,
      notes,
      quizAttempts,
      studyPlans,
      documents,
      flashcards,
      loading,
      error,
      stats,
      addSession,
      deleteSession,
      addTask,
      updateTaskDone,
      deleteTask,
      addNote,
      updateNote,
      deleteNote,
      addQuizAttempt,
      addStudyPlan,
      deleteStudyPlan,
      addDocument,
      deleteDocument,
      addFlashcard,
      deleteFlashcard,
      updateFlashcardCards,
    ],
  )

  return <FirestoreDataContext.Provider value={value}>{children}</FirestoreDataContext.Provider>
}

import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/firebase.js'
import { COLLECTIONS } from '../constants/firestoreCollections.js'
import { toIso } from '../lib/firestoreTimestamps.js'

function quizAttemptsRef() {
  return collection(db, COLLECTIONS.quizAttempts)
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

export async function addQuizAttempt(userId, quizId, quizTitle, score, totalQuestions, percentage) {
  const ref = await addDoc(quizAttemptsRef(), {
    userId,
    quizId,
    quizTitle,
    score,
    totalQuestions,
    percentage,
    completedAt: serverTimestamp(),
  })
  return ref.id
}

export function subscribeQuizAttempts(userId, onNext, onError) {
  const q = query(
    quizAttemptsRef(),
    where('userId', '==', userId),
    orderBy('completedAt', 'desc'),
  )
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map(mapQuizAttemptDoc)
      onNext(rows)
    },
    onError,
  )
}

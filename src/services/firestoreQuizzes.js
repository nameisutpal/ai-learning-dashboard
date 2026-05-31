import {
  addDoc,
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/firebase.js'
import { COLLECTIONS } from '../constants/firestoreCollections.js'
import { toIso } from '../lib/firestoreTimestamps.js'

function quizzesRef() {
  return collection(db, COLLECTIONS.quizzes)
}

function mapQuizDoc(d) {
  const x = d.data()
  return {
    id: d.id,
    userId: x.userId,
    chatId: x.chatId,
    noteId: x.noteId,
    noteTitle: x.noteTitle,
    title: x.title ?? 'Quiz',
    questions: x.questions ?? [],
    createdAt: toIso(x.createdAt),
  }
}

export async function createQuiz(userId, chatId, title, questions, noteId, noteTitle) {
  const ref = await addDoc(quizzesRef(), {
    userId,
    chatId,
    noteId,
    noteTitle,
    title,
    questions,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export function subscribeQuizzes(userId, onNext, onError) {
  const q = query(
    quizzesRef(),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map(mapQuizDoc)
      onNext(rows)
    },
    onError,
  )
}

export async function getQuizzesByChatId(userId, chatId) {
  const q = query(
    quizzesRef(),
    where('userId', '==', userId),
    where('chatId', '==', chatId),
    orderBy('createdAt', 'desc'),
    limit(10),
  )
  const snap = await getDocs(q)
  return snap.docs.map(mapQuizDoc)
}

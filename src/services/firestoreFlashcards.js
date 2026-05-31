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
import { toIso } from '../lib/firestoreTimestamps.js'

function flashcardsRef() {
  return collection(db, COLLECTIONS.flashcards)
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

export async function createFlashcard(userId, title, cards, sourceType, sourceId, sourceTitle) {
  const ref = await addDoc(flashcardsRef(), {
    userId,
    title,
    cards,
    sourceType,
    sourceId,
    sourceTitle,
    createdAt: serverTimestamp(),
    lastReviewedAt: null,
  })
  return ref.id
}

export async function deleteFlashcard(id) {
  await deleteDoc(doc(db, COLLECTIONS.flashcards, id))
}

export async function updateFlashcardCards(id, cards) {
  await updateDoc(doc(db, COLLECTIONS.flashcards, id), {
    cards,
    lastReviewedAt: serverTimestamp(),
  })
}

export function subscribeFlashcards(userId, onNext, onError) {
  const q = query(
    flashcardsRef(),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map(mapFlashcardDoc)
      onNext(rows)
    },
    onError,
  )
}

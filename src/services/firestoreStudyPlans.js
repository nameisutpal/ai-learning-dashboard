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

function studyPlansRef() {
  return collection(db, COLLECTIONS.studyPlans)
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

export async function addStudyPlan(userId, title, content) {
  const ref = await addDoc(studyPlansRef(), {
    userId,
    title,
    content,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateStudyPlan(id, { title, content }) {
  await updateDoc(doc(db, COLLECTIONS.studyPlans, id), {
    title,
    content,
  })
}

export async function deleteStudyPlan(id) {
  await deleteDoc(doc(db, COLLECTIONS.studyPlans, id))
}

export function subscribeStudyPlans(userId, onNext, onError) {
  const q = query(
    studyPlansRef(),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map(mapStudyPlanDoc)
      onNext(rows)
    },
    onError,
  )
}

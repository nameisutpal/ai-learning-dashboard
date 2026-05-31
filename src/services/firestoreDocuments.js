import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/firebase.js'
import { COLLECTIONS } from '../constants/firestoreCollections.js'
import { toIso } from '../lib/firestoreTimestamps.js'

function documentsRef() {
  return collection(db, COLLECTIONS.documents)
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

export async function addDocument(userId, fileName, fileUrl) {
  const ref = await addDoc(documentsRef(), {
    userId,
    fileName,
    fileUrl,
    uploadedAt: serverTimestamp(),
  })
  return ref.id
}

export async function deleteDocument(id) {
  await deleteDoc(doc(db, COLLECTIONS.documents, id))
}

export function subscribeDocuments(userId, onNext, onError) {
  const q = query(
    documentsRef(),
    where('userId', '==', userId),
    orderBy('uploadedAt', 'desc'),
  )
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map(mapDocumentDoc)
      onNext(rows)
    },
    onError,
  )
}

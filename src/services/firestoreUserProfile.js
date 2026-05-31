import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/firebase.js'
import { COLLECTIONS } from '../constants/firestoreCollections.js'

/**
 * Creates `users/{uid}` on first sign-in (email or Google).
 * Idempotent: if the doc already exists, we do nothing.
 */
export async function ensureUserProfile(user) {
  if (!user?.uid) return

  const ref = doc(db, COLLECTIONS.users, user.uid)
  const snap = await getDoc(ref)
  if (snap.exists()) return

  await setDoc(ref, {
    uid: user.uid,
    name: user.displayName || '',
    email: user.email || '',
    createdAt: serverTimestamp(),
  })
}

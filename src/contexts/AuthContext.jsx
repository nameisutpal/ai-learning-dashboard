import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from '../firebase/firebase.js'
import { AuthContext } from './authContext.js'
import { mapFirebaseAuthError } from '../lib/mapFirebaseAuthError.js'
import { ensureUserProfile } from '../services/firestoreUserProfile.js'

/**
 * AuthProvider — subscribes once to Firebase `onAuthStateChanged`.
 *
 * Why this pattern?
 * - Firebase restores the signed-in user on refresh automatically (default browser persistence).
 * - `onAuthStateChanged` fires once with the current user (or `null`), then on every login/logout.
 * - We mirror that into React state so any component can read `user` / `loading` via `useAuth()`.
 *
 * Auth flow summary:
 * 1. App mounts → `loading` is true until the first auth callback runs.
 * 2. `ProtectedRoute` waits for `loading === false`, then either renders the dashboard or redirects to `/login`.
 * 3. Login / Signup pages call `signInWithEmail`, `signUpWithEmail`, or `signInWithGoogle`.
 * 4. Navbar calls `signOutUser()` which clears the Firebase session; routes react via context.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser)
      setLoading(false)
      if (nextUser) {
        try {
          await ensureUserProfile(nextUser)
        } catch (e) {
          console.error('ensureUserProfile', e)
        }
      }
    })
    return () => unsub()
  }, [])

  const signInWithEmail = useCallback(async (email, password) => {
    await signInWithEmailAndPassword(auth, email.trim(), password)
  }, [])

  const signUpWithEmail = useCallback(async (email, password) => {
    await createUserWithEmailAndPassword(auth, email.trim(), password)
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    await signInWithPopup(auth, provider)
  }, [])

  const signOutUser = useCallback(async () => {
    await firebaseSignOut(auth)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOutUser,
      mapFirebaseAuthError,
    }),
    [user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOutUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

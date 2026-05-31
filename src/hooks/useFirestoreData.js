import { useContext } from 'react'
import { FirestoreDataContext } from '../contexts/firestoreDataContext.js'

export function useFirestoreData() {
  const ctx = useContext(FirestoreDataContext)
  if (!ctx) {
    throw new Error('useFirestoreData must be used inside FirestoreDataProvider')
  }
  return ctx
}

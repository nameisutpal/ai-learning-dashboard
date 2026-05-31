import { useFirestoreData } from './useFirestoreData.js'

/**
 * Dashboard KPIs — backed by Firestore via `FirestoreDataProvider`.
 * (Study sessions, tasks, and notes were previously read from LocalStorage in `lib/stats.js`.)
 */
export function useDashboardStats() {
  const { stats } = useFirestoreData()
  return stats
}

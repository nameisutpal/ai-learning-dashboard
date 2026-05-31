/**
 * Top-level Firestore collection names (match Firebase Console / security rules).
 *
 * Data model (each doc includes `userId` for queries + rules):
 * - `users/{uid}` — profile: uid, name, email, createdAt
 * - `tasks/{taskId}` — userId, title, done, priority, createdAt
 * - `notes/{noteId}` — userId, title, content, updatedAt
 * - `studySessions/{sessionId}` — userId, subject, durationMinutes, date (YYYY-MM-DD)
 * - `chats/{chatId}` — userId, title, createdAt, updatedAt
 * - `chats/{chatId}/messages/{messageId}` — role, content, createdAt
 * - `quizzes/{quizId}` — userId, chatId, title, questions, createdAt
 */
export const COLLECTIONS = {
  users: 'users',
  tasks: 'tasks',
  notes: 'notes',
  studySessions: 'studySessions',
  chats: 'chats',
  quizzes: 'quizzes',
  quizAttempts: 'quizAttempts',
  studyPlans: 'studyPlans',
  documents: 'documents',
  flashcards: 'flashcards',
}

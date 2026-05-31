import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from './layouts/DashboardLayout.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { SignupPage } from './pages/SignupPage.jsx'
import { ProtectedRoute } from './components/routing/ProtectedRoute.jsx'
import { GuestRoute } from './components/routing/GuestRoute.jsx'
import {
  CourseOverviewTab,
  CourseResourcesTab,
  CourseNotesTab,
  CourseTasksTab,
  CourseProgressTab,
  CourseSessionsTab,
} from './pages/course-detail/CourseDetailTabs.jsx'

/**
 * Route-based code splitting: each `lazy()` call becomes its own async chunk at build time.
 * Suspense boundaries live in `DashboardLayout` so the shell (sidebar/nav) stays mounted.
 *
 * Auth routing:
 * - `GuestRoute` → only `/login` + `/signup` when signed out (signed-in users bounce home).
 * - `ProtectedRoute` → entire dashboard tree; unauthenticated users bounce to `/login`.
 */
const CoursesPage = lazy(() => import('./pages/CoursesPage.jsx').then((m) => ({ default: m.CoursesPage })))
const CourseFormPage = lazy(() =>
  import('./pages/CourseFormPage.jsx').then((m) => ({ default: m.CourseFormPage })),
)
const CourseDetailPage = lazy(() =>
  import('./pages/CourseDetailPage.jsx').then((m) => ({ default: m.CourseDetailPage })),
)
const AiAssistantPage = lazy(() => import('./pages/AiAssistantPage.jsx').then((m) => ({ default: m.AiAssistantPage })))
const StudyTrackerPage = lazy(() =>
  import('./pages/StudyTrackerPage.jsx').then((m) => ({ default: m.StudyTrackerPage })),
)
const TasksPage = lazy(() => import('./pages/TasksPage.jsx').then((m) => ({ default: m.TasksPage })))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage.jsx').then((m) => ({ default: m.AnalyticsPage })))
const NotesPage = lazy(() => import('./pages/NotesPage.jsx').then((m) => ({ default: m.NotesPage })))
const QuizHistoryPage = lazy(() => import('./pages/QuizHistoryPage.jsx').then((m) => ({ default: m.QuizHistoryPage })))
const StudyPlansPage = lazy(() => import('./pages/StudyPlansPage.jsx').then((m) => ({ default: m.StudyPlansPage })))
const DocumentsPage = lazy(() => import('./pages/DocumentsPage.jsx').then((m) => ({ default: m.DocumentsPage })))
const FlashcardsPage = lazy(() => import('./pages/FlashcardsPage.jsx').then((m) => ({ default: m.FlashcardsPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx').then((m) => ({ default: m.SettingsPage })))

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="courses/new" element={<CourseFormPage />} />
          <Route path="courses/:courseId/edit" element={<CourseFormPage />} />
          <Route path="courses/:courseId" element={<CourseDetailPage />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<CourseOverviewTab />} />
            <Route path="resources" element={<CourseResourcesTab />} />
            <Route path="notes" element={<CourseNotesTab />} />
            <Route path="tasks" element={<CourseTasksTab />} />
            <Route path="progress" element={<CourseProgressTab />} />
            <Route path="sessions" element={<CourseSessionsTab />} />
          </Route>
          <Route path="courses" element={<CoursesPage />} />
          <Route path="assistant" element={<AiAssistantPage />} />
          <Route path="study-tracker" element={<StudyTrackerPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="quiz-history" element={<QuizHistoryPage />} />
          <Route path="study-plans" element={<StudyPlansPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="flashcards" element={<FlashcardsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

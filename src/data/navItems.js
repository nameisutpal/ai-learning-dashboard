import {
  LayoutDashboard,
  BookOpen,
  Bot,
  Timer,
  ListTodo,
  BarChart3,
  StickyNote,
  Award,
  Calendar,
  FileText,
  Layers,
  Settings,
} from 'lucide-react'

/**
 * Sidebar navigation — each item has a URL `path` for React Router.
 * `id` is a stable key; `path` is what NavLink uses in `to`.
 */
export const navItems = [
  { id: 'dashboard', path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', path: '/courses', label: 'My Courses', icon: BookOpen },
  { id: 'assistant', path: '/assistant', label: 'AI Assistant', icon: Bot },
  { id: 'tracker', path: '/study-tracker', label: 'Study Tracker', icon: Timer },
  { id: 'tasks', path: '/tasks', label: 'Tasks', icon: ListTodo },
  { id: 'analytics', path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'notes', path: '/notes', label: 'Notes', icon: StickyNote },
  { id: 'quiz-history', path: '/quiz-history', label: 'Quiz History', icon: Award },
  { id: 'study-plans', path: '/study-plans', label: 'Study Plans', icon: Calendar },
  { id: 'documents', path: '/documents', label: 'Documents', icon: FileText },
  { id: 'flashcards', path: '/flashcards', label: 'Flashcards', icon: Layers },
  { id: 'settings', path: '/settings', label: 'Settings', icon: Settings },
]

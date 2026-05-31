import { CheckCircle2, Sparkles, BookMarked, Timer, MessageCircle } from 'lucide-react'

/** Timeline rows for “Recent activity” (static demo data). */
export const recentActivities = [
  {
    id: '1',
    title: 'Completed lesson: React state patterns',
    time: '2 hours ago',
    icon: CheckCircle2,
  },
  {
    id: '2',
    title: 'AI tutor summarized Chapter 4 notes',
    time: 'Yesterday · 8:12 PM',
    icon: Sparkles,
  },
  {
    id: '3',
    title: 'Bookmarked “Advanced hooks” course',
    time: 'Yesterday',
    icon: BookMarked,
  },
  {
    id: '4',
    title: 'Logged a 45‑minute focus block',
    time: '2 days ago',
    icon: Timer,
  },
  {
    id: '5',
    title: 'Asked AI to explain closures with examples',
    time: '3 days ago',
    icon: MessageCircle,
  },
]

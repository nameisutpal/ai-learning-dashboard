import { createId } from '../lib/id.js'

function isoNow() {
  return new Date().toISOString()
}

function thumb(seed) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/400`
}

/** Deterministic sample graph for first-time demos. */
export function buildSampleLmsState() {
  const c1 = createId()
  const c2 = createId()
  const now = new Date()
  const mon = new Date(now)
  mon.setDate(now.getDate() - ((now.getDay() + 6) % 7))

  const sessions = [0, 1, 3, 4].map((d, i) => {
    const day = new Date(mon)
    day.setDate(mon.getDate() + d)
    const start = new Date(day)
    start.setHours(10 + i, 0, 0, 0)
    const end = new Date(start)
    end.setMinutes(start.getMinutes() + 35 + i * 5)
    return {
      id: createId(),
      courseId: i % 2 === 0 ? c1 : c2,
      startedAt: start.toISOString(),
      endedAt: end.toISOString(),
    }
  })

  return {
    version: 1,
    courses: [
      {
        id: c1,
        title: 'Systems design foundations',
        description:
          'Caches, queues, and sharding — a pragmatic path from single-box apps to resilient platforms.',
        thumbnailUrl: thumb('sysdesign-nebula'),
        category: 'Engineering',
        difficulty: 'intermediate',
        tags: ['architecture', 'backend', 'scale'],
        estimatedDurationHours: 24,
        createdAt: isoNow(),
        updatedAt: isoNow(),
      },
      {
        id: c2,
        title: 'Product sense for builders',
        description:
          'Translate user pain into crisp problem statements, bets, and measurable outcomes.',
        thumbnailUrl: thumb('product-glass'),
        category: 'Product',
        difficulty: 'beginner',
        tags: ['discovery', 'metrics', 'storytelling'],
        estimatedDurationHours: 12,
        createdAt: isoNow(),
        updatedAt: isoNow(),
      },
    ],
    resources: [
      {
        id: createId(),
        courseId: c1,
        kind: 'youtube',
        title: 'Designing data-intensive applications — talk',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        createdAt: isoNow(),
      },
      {
        id: createId(),
        courseId: c1,
        kind: 'article',
        title: 'Consistent hashing explained',
        url: 'https://en.wikipedia.org/wiki/Consistent_hashing',
        createdAt: isoNow(),
      },
      {
        id: createId(),
        courseId: c2,
        kind: 'pdf',
        title: 'JTBD primer (sample PDF)',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        createdAt: isoNow(),
      },
    ],
    notes: [
      {
        id: createId(),
        courseId: c1,
        title: 'Week 1 — throughput vs latency',
        body: 'When users say slow, clarify whether they mean tail latency or average case.',
        updatedAt: isoNow(),
      },
    ],
    tasks: [
      {
        id: createId(),
        courseId: c1,
        title: 'Sketch current read path for your flagship feature',
        done: true,
        createdAt: isoNow(),
      },
      {
        id: createId(),
        courseId: c1,
        title: 'List three failure modes and mitigations',
        done: false,
        createdAt: isoNow(),
      },
      {
        id: createId(),
        courseId: c2,
        title: 'Interview one user this week',
        done: false,
        createdAt: isoNow(),
      },
    ],
    sessions,
  }
}

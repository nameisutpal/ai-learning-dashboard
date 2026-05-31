import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Plus, Sparkles, Trash2 } from 'lucide-react'
import { PageShell } from '../components/page/PageShell.jsx'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { SectionHeader } from '../components/ui/SectionHeader.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { SkeletonPulse } from '../components/dashboard/SkeletonPulse.jsx'
import { Modal } from '../components/ui/Modal.jsx'
import { MarkdownMessage } from '../components/assistant/MarkdownMessage.jsx'
import { useFirestoreData } from '../hooks/useFirestoreData.js'
import { useAuth } from '../hooks/useAuth.js'
import { useToast } from '../hooks/useToast.js'
import { generateStudyPlan } from '../services/studyPlanGeneration.js'

/**
 * StudyPlansPage — View and generate personalized study plans.
 */
export function StudyPlansPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { studyPlans, loading, notes, quizAttempts, addStudyPlan, deleteStudyPlan } = useFirestoreData()

  const [generateOpen, setGenerateOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewPlan, setViewPlan] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [duration, setDuration] = useState(5)
  const [focusAreas, setFocusAreas] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const abortRef = useRef(null)

  async function handleGeneratePlan() {
    if (!user?.uid || isGenerating) return

    setIsGenerating(true)
    setGeneratedContent('')

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const data = {
        quizAttempts,
        notes,
        quizzes: [],
      }

      const options = {
        duration,
        focusAreas: focusAreas.split(',').map((s) => s.trim()).filter(Boolean),
      }

      const planContent = await generateStudyPlan(data, options, controller.signal)

      setGeneratedContent(planContent)
    } catch (err) {
      if (err?.name === 'AbortError') return
      showToast(err?.message || 'Failed to generate study plan', 'error')
    } finally {
      setIsGenerating(false)
      abortRef.current = null
    }
  }

  async function handleSavePlan() {
    if (!user?.uid || !generatedContent) return

    try {
      const title = focusAreas
        ? `${duration}-Day Plan: ${focusAreas}`
        : `${duration}-Day Study Plan`

      await addStudyPlan({ title, content: generatedContent })
      showToast('Study plan saved successfully!')
      setGenerateOpen(false)
      setGeneratedContent('')
      setFocusAreas('')
    } catch (err) {
      showToast(err?.message || 'Failed to save study plan', 'error')
    }
  }

  async function handleDeletePlan(id) {
    try {
      await deleteStudyPlan(id)
      showToast('Study plan deleted')
    } catch (err) {
      showToast(err?.message || 'Could not delete study plan.', 'error')
    }
  }

  function openView(plan) {
    setViewPlan(plan)
    setViewOpen(true)
  }

  function openGenerate() {
    setGenerateOpen(true)
    setGeneratedContent('')
  }

  return (
    <PageShell
      icon={Calendar}
      title="Study Plans"
      description="Personalized study plans generated from your quiz performance and notes."
      highlights={[]}
    >
      <div className="mb-6 flex justify-end">
        <Button type="button" onClick={openGenerate}>
          <Plus className="h-4 w-4" aria-hidden />
          Generate Study Plan
        </Button>
      </div>

      <Card padding="p-0 overflow-hidden">
        <div className="border-b border-zinc-200/90 px-5 py-4 dark:border-white/10 md:px-6">
          <SectionHeader
            title="Your Study Plans"
            subtitle={loading ? 'Loading…' : `${studyPlans.length} plan${studyPlans.length === 1 ? '' : 's'}`}
          />
        </div>
        {loading ? (
          <div className="space-y-3 p-5 md:p-6">
            <SkeletonPulse className="h-20 w-full rounded-xl" />
            <SkeletonPulse className="h-20 w-full rounded-xl" />
          </div>
        ) : studyPlans.length === 0 ? (
          <div className="p-5 md:p-6">
            <EmptyState
              icon={Calendar}
              title="No study plans yet"
              description="Generate a personalized study plan based on your quiz performance and notes."
            />
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200/90 dark:divide-white/10">
            {studyPlans.map((plan, i) => (
              <motion.li
                key={plan.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.18) }}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between md:px-6"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-zinc-900 dark:text-white">{plan.title}</h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {plan.createdAt ? `Created ${new Date(plan.createdAt).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => openView(plan)}
                  >
                    View
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleDeletePlan(plan.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-200/90 bg-white px-3 py-1.5 text-xs text-zinc-600 transition hover:border-rose-400/40 hover:bg-rose-50 hover:text-rose-700 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-rose-400/20 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Delete
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </Card>

      {/* Generate Study Plan Modal */}
      <Modal
        isOpen={generateOpen}
        onClose={() => setGenerateOpen(false)}
        title="Generate Study Plan"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setGenerateOpen(false)}>
              Cancel
            </Button>
            {generatedContent ? (
              <Button type="button" onClick={handleSavePlan}>
                Save Plan
              </Button>
            ) : (
              <Button type="button" onClick={handleGeneratePlan} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" aria-hidden />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" aria-hidden />
                    Generate
                  </>
                )}
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-zinc-900 dark:text-white">
              Plan Duration (days)
            </label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={isGenerating || generatedContent}
              className="mt-1 block w-full rounded-lg border border-zinc-200/90 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100 disabled:opacity-50"
            >
              <option value={3}>3 days</option>
              <option value={5}>5 days</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
            </select>
          </div>
          <div>
            <label htmlFor="focusAreas" className="block text-sm font-medium text-zinc-900 dark:text-white">
              Focus Areas (optional, comma-separated)
            </label>
            <input
              id="focusAreas"
              type="text"
              value={focusAreas}
              onChange={(e) => setFocusAreas(e.target.value)}
              disabled={isGenerating || generatedContent}
              placeholder="e.g., Biology, Chemistry, Physics"
              className="mt-1 block w-full rounded-lg border border-zinc-200/90 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100 disabled:opacity-50"
            />
          </div>
          {isGenerating && (
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <Sparkles className="h-4 w-4 animate-spin" aria-hidden />
              Analyzing your performance and generating plan...
            </div>
          )}
          {generatedContent && (
            <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-zinc-200/90 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-950">
              <MarkdownMessage content={generatedContent} />
            </div>
          )}
        </div>
      </Modal>

      {/* View Plan Modal */}
      <Modal
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        title={viewPlan?.title || 'Study Plan'}
        footer={
          <Button type="button" variant="secondary" onClick={() => setViewOpen(false)}>
            Close
          </Button>
        }
      >
        {viewPlan && (
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
              {viewPlan.createdAt ? `Created ${new Date(viewPlan.createdAt).toLocaleString()}` : ''}
            </div>
            <MarkdownMessage content={viewPlan.content} />
          </div>
        )}
      </Modal>
    </PageShell>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Layers, Trash2, Play } from 'lucide-react'
import { PageShell } from '../components/page/PageShell.jsx'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { SectionHeader } from '../components/ui/SectionHeader.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { SkeletonPulse } from '../components/dashboard/SkeletonPulse.jsx'
import { Modal } from '../components/ui/Modal.jsx'
import { FlashcardCard } from '../components/flashcard/FlashcardCard.jsx'
import { useFirestoreData } from '../hooks/useFirestoreData.js'
import { useToast } from '../hooks/useToast.js'

/**
 * FlashcardsPage — View and study flashcard decks.
 */
export function FlashcardsPage() {
  const { showToast } = useToast()
  const { flashcards, loading, deleteFlashcard, updateFlashcardCards } = useFirestoreData()

  const [studyOpen, setStudyOpen] = useState(false)
  const [studyDeck, setStudyDeck] = useState(null)

  async function handleDeleteDeck(id) {
    try {
      await deleteFlashcard(id)
      showToast('Flashcard deck deleted')
    } catch (err) {
      showToast(err?.message || 'Could not delete flashcard deck.', 'error')
    }
  }

  function handleStudy(deck) {
    setStudyDeck(deck)
    setStudyOpen(true)
  }

  async function handleCardUpdate(updatedCards) {
    if (studyDeck) {
      await updateFlashcardCards(studyDeck.id, updatedCards)
      setStudyDeck({ ...studyDeck, cards: updatedCards })
    }
  }

  function getSourceTypeLabel(sourceType) {
    switch (sourceType) {
      case 'ai':
        return 'AI Assistant'
      case 'note':
        return 'Note'
      case 'document':
        return 'Document'
      default:
        return 'Unknown'
    }
  }

  return (
    <PageShell
      icon={Layers}
      title="Flashcards"
      description="Study with flashcards generated from AI, notes, and documents."
      highlights={[]}
    >
      <Card padding="p-0 overflow-hidden">
        <div className="border-b border-zinc-200/90 px-5 py-4 dark:border-white/10 md:px-6">
          <SectionHeader
            title="Your Flashcard Decks"
            subtitle={loading ? 'Loading…' : `${flashcards.length} deck${flashcards.length === 1 ? '' : 's'}`}
          />
        </div>
        {loading ? (
          <div className="space-y-3 p-5 md:p-6">
            <SkeletonPulse className="h-20 w-full rounded-xl" />
            <SkeletonPulse className="h-20 w-full rounded-xl" />
          </div>
        ) : flashcards.length === 0 ? (
          <div className="p-5 md:p-6">
            <EmptyState
              icon={Layers}
              title="No flashcard decks yet"
              description="Generate flashcards from AI Assistant, Notes, or Documents to start studying."
            />
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200/90 dark:divide-white/10">
            {flashcards.map((deck, i) => (
              <motion.li
                key={deck.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.18) }}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between md:px-6"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-zinc-900 dark:text-white">{deck.title}</h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {deck.cards.length} card{deck.cards.length === 1 ? '' : 's'} • {getSourceTypeLabel(deck.sourceType)}
                    {deck.sourceTitle && ` • ${deck.sourceTitle}`}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Created {deck.createdAt ? new Date(deck.createdAt).toLocaleDateString() : ''}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleStudy(deck)}
                  >
                    <Play className="h-3.5 w-3.5" aria-hidden />
                    Study
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDeck(deck.id)}
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

      {/* Study Modal */}
      <Modal
        isOpen={studyOpen}
        onClose={() => setStudyOpen(false)}
        title={studyDeck?.title || 'Study Flashcards'}
        footer={null}
        size="large"
      >
        {studyDeck && (
          <FlashcardCard
            cards={studyDeck.cards}
            onCardUpdate={handleCardUpdate}
            onClose={() => setStudyOpen(false)}
          />
        )}
      </Modal>
    </PageShell>
  )
}

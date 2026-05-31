import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Shuffle, Check, X } from 'lucide-react'

export function FlashcardCard({ cards, onCardUpdate, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [displayCards, setDisplayCards] = useState(cards)

  const currentCard = displayCards[currentIndex]

  function handleFlip() {
    setIsFlipped(!isFlipped)
  }

  function handleNext() {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev + 1) % displayCards.length)
  }

  function handlePrevious() {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev - 1 + displayCards.length) % displayCards.length)
  }

  function handleShuffle() {
    const shuffled = [...displayCards].sort(() => Math.random() - 0.5)
    setDisplayCards(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  async function handleMarkKnown() {
    const updatedCards = [...displayCards]
    updatedCards[currentIndex] = { ...updatedCards[currentIndex], status: 'known' }
    setDisplayCards(updatedCards)
    if (onCardUpdate) {
      await onCardUpdate(updatedCards)
    }
    handleNext()
  }

  async function handleMarkDifficult() {
    const updatedCards = [...displayCards]
    updatedCards[currentIndex] = { ...updatedCards[currentIndex], status: 'difficult' }
    setDisplayCards(updatedCards)
    if (onCardUpdate) {
      await onCardUpdate(updatedCards)
    }
    handleNext()
  }

  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200/90 bg-white p-8 dark:border-white/10 dark:bg-zinc-950">
        <p className="text-zinc-600 dark:text-zinc-400">No cards to display</p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600"
          >
            Close
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          Card {currentIndex + 1} of {displayCards.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShuffle}
            className="rounded-lg border border-zinc-200/90 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-white/20 dark:hover:bg-zinc-900"
          >
            <Shuffle className="h-3.5 w-3.5" aria-hidden />
            Shuffle
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200/90 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-white/20 dark:hover:bg-zinc-900"
            >
              Close
            </button>
          )}
        </div>
      </div>

      <div
        className="relative h-80 cursor-pointer perspective-1000"
        onClick={handleFlip}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleFlip()
          }
        }}
        role="button"
        tabIndex={0}
      >
        <motion.div
          className="relative h-full w-full"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div
            className={`absolute inset-0 flex items-center justify-center rounded-2xl border border-zinc-200/90 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-zinc-950 ${
              isFlipped ? 'backface-hidden' : ''
            }`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-lg font-medium text-zinc-900 dark:text-white">{currentCard.front}</p>
          </div>
          <div
            className={`absolute inset-0 flex items-center justify-center rounded-2xl border border-violet-200/90 bg-violet-50 p-6 text-center shadow-sm dark:border-violet-400/20 dark:bg-violet-500/10 ${
              isFlipped ? '' : 'backface-hidden'
            }`}
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-lg font-medium text-zinc-900 dark:text-white">{currentCard.back}</p>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          className="rounded-lg border border-zinc-200/90 bg-white px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-white/20 dark:hover:bg-zinc-900"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleMarkDifficult}
            className="flex items-center gap-1.5 rounded-lg border border-rose-200/90 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:border-rose-400/30 dark:hover:bg-rose-500/20"
          >
            <X className="h-4 w-4" aria-hidden />
            Difficult
          </button>
          <button
            type="button"
            onClick={handleMarkKnown}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-200/90 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:border-emerald-400/30 dark:hover:bg-emerald-500/20"
          >
            <Check className="h-4 w-4" aria-hidden />
            Known
          </button>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="rounded-lg border border-zinc-200/90 bg-white px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-white/20 dark:hover:bg-zinc-900"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}

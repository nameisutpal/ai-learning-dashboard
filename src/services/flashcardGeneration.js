import { streamOpenRouterChat } from './openRouterChat.js'

/**
 * Parse flashcards from AI response text
 * Supports JSON and markdown formats
 */
export function parseFlashcardsFromText(text) {
  // Try JSON first
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.cards && Array.isArray(parsed.cards)) {
        return {
          title: parsed.title || 'Flashcards',
          cards: parsed.cards.map((card) => ({
            front: card.front || '',
            back: card.back || '',
            status: 'unknown',
          })),
        }
      }
    } catch {
      // JSON parse failed, try other formats
    }
  }

  // Try markdown format: Q: ... A: ...
  const lines = text.split('\n').filter((line) => line.trim())
  const cards = []
  let currentCard = null

  for (const line of lines) {
    const trimmed = line.trim()

    // Check for question/front
    const qMatch = trimmed.match(/^(Q:|Question:|Front:)\s*(.+)$/i)
    if (qMatch) {
      if (currentCard) {
        cards.push(currentCard)
      }
      currentCard = {
        front: qMatch[2],
        back: '',
        status: 'unknown',
      }
      continue
    }

    // Check for answer/back
    const aMatch = trimmed.match(/^(A:|Answer:|Back:)\s*(.+)$/i)
    if (aMatch && currentCard) {
      currentCard.back = aMatch[2]
      continue
    }

    // Append to current card content
    if (currentCard) {
      if (!currentCard.back && trimmed) {
        currentCard.back = trimmed
      } else if (currentCard.back) {
        currentCard.back += ' ' + trimmed
      }
    }
  }

  if (currentCard) {
    cards.push(currentCard)
  }

  if (cards.length > 0) {
    return {
      title: 'Flashcards',
      cards,
    }
  }

  // Fallback: return raw content as single card
  return {
    title: 'Flashcards',
    cards: [
      {
        front: 'Review the following content',
        back: text,
        status: 'unknown',
      },
    ],
  }
}

/**
 * Generate flashcards from content using AI
 * @param {string} content - The content to generate flashcards from
 * @param {AbortSignal} signal - Abort signal for cancellation
 * @returns {Promise<Object>} Flashcard data with title and cards
 */
export async function generateFlashcardsFromContent(content, signal) {
  const flashcardPrompt = `Generate 10-15 flashcards based on the following content. Each flashcard should have a front (question/prompt) and back (answer/explanation). Return the flashcards in one of these formats:

1. Valid JSON (preferred):
{
  "title": "Flashcard Deck Title",
  "cards": [
    {
      "front": "Question or prompt",
      "back": "Answer or explanation"
    }
  ]
}

2. Markdown format:
Q: Question 1
A: Answer 1

Q: Question 2
A: Answer 2

Content to flashcards:
${content}`

  let flashcardText = ''
  await streamOpenRouterChat({
    messages: [{ role: 'user', content: flashcardPrompt }],
    signal,
    onToken: (token) => {
      flashcardText += token
    },
  })

  const flashcardData = parseFlashcardsFromText(flashcardText)

  if (!flashcardData.cards || !Array.isArray(flashcardData.cards) || flashcardData.cards.length === 0) {
    throw new Error('Invalid flashcard structure: no cards found')
  }

  return flashcardData
}

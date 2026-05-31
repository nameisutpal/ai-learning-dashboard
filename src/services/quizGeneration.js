import { streamOpenRouterChat } from './openRouterChat.js'

/**
 * Parse quiz from AI response text
 * Supports JSON, markdown lists, and numbered questions
 */
export function parseQuizFromText(text) {
  // Try JSON first
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.questions && Array.isArray(parsed.questions)) {
        return {
          title: parsed.title || 'Quiz',
          questions: parsed.questions,
        }
      }
    } catch {
      // JSON parse failed, try other formats
    }
  }

  // Try markdown list format
  const lines = text.split('\n').filter((line) => line.trim())
  const questions = []
  let currentQuestion = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Check for numbered question
    const questionMatch = line.match(/^(\d+)\.\s+(.+)$/)
    if (questionMatch) {
      if (currentQuestion) {
        questions.push(currentQuestion)
      }
      currentQuestion = {
        question: questionMatch[2],
        options: [],
        correctAnswer: 0,
      }
      continue
    }

    // Check for options (A, B, C, D)
    const optionMatch = line.match(/^([A-D])\.\s+(.+)$/)
    if (optionMatch && currentQuestion) {
      currentQuestion.options.push(optionMatch[2])

      // Check for answer line
      if (line.toLowerCase().includes('answer:')) {
        const answerMatch = line.match(/answer:\s*([A-D])/i)
        if (answerMatch) {
          currentQuestion.correctAnswer = answerMatch[1].charCodeAt(0) - 65
        }
      }
      continue
    }

    // Check for answer on separate line
    if (line.toLowerCase().startsWith('answer:') && currentQuestion) {
      const answerMatch = line.match(/answer:\s*([A-D])/i)
      if (answerMatch) {
        currentQuestion.correctAnswer = answerMatch[1].charCodeAt(0) - 65
      }
    }
  }

  if (currentQuestion) {
    questions.push(currentQuestion)
  }

  if (questions.length > 0) {
    return {
      title: 'Quiz',
      questions,
    }
  }

  // Fallback: return raw content as single question
  return {
    title: 'Quiz',
    questions: [
      {
        question: 'Review the following content',
        options: ['Continue', 'Back'],
        correctAnswer: 0,
        rawContent: text,
      },
    ],
  }
}

/**
 * Generate quiz from content using AI
 * @param {string} content - The content to generate quiz from
 * @param {AbortSignal} signal - Abort signal for cancellation
 * @returns {Promise<Object>} Quiz data with title and questions
 */
export async function generateQuizFromContent(content, signal) {
  const quizPrompt = `Generate a quiz with 5-10 multiple choice questions based on the following content. Return the quiz in one of these formats:

1. Valid JSON (preferred):
{
  "title": "Quiz Title",
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

2. Markdown list format:
1. Question text
   A. Option A
   B. Option B
   C. Option C
   D. Option D
   Answer: A

Content to quiz:
${content}`

  let quizText = ''
  await streamOpenRouterChat({
    messages: [{ role: 'user', content: quizPrompt }],
    signal,
    onToken: (token) => {
      quizText += token
    },
  })

  const quizData = parseQuizFromText(quizText)

  if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
    throw new Error('Invalid quiz structure: no questions found')
  }

  return quizData
}

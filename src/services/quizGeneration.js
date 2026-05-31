import { streamOpenRouterChat } from './openRouterChat.js'

/**
 * Parse quiz from AI response text
 * Extracts JSON from response, handling markdown code fences if present
 */
export function parseQuizFromText(text) {
  console.log('[quizGeneration] Raw AI response:', text)

  // Remove markdown code fences if present
  let cleanedText = text
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    cleanedText = codeBlockMatch[1]
    console.log('[quizGeneration] Extracted from code block')
  }

  // Try to find JSON object
  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error('[quizGeneration] No JSON object found in response')
    throw new Error('No valid JSON found in AI response')
  }

  try {
    const parsed = JSON.parse(jsonMatch[0])
    console.log('[quizGeneration] Parsed quiz object:', parsed)

    // Validate structure
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      console.error('[quizGeneration] Invalid quiz structure: missing or invalid questions array')
      throw new Error('Invalid quiz structure: missing or invalid questions array')
    }

    if (parsed.questions.length === 0) {
      console.error('[quizGeneration] Invalid quiz structure: empty questions array')
      throw new Error('Invalid quiz structure: empty questions array')
    }

    // Validate each question
    for (let i = 0; i < parsed.questions.length; i++) {
      const q = parsed.questions[i]
      if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length < 2) {
        console.error(`[quizGeneration] Invalid question at index ${i}:`, q)
        throw new Error(`Invalid question at index ${i}: missing question or options`)
      }
      if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        console.error(`[quizGeneration] Invalid correctAnswer at index ${i}:`, q.correctAnswer)
        throw new Error(`Invalid correctAnswer at index ${i}: must be a valid option index`)
      }
    }

    return {
      title: parsed.title || 'Quiz',
      questions: parsed.questions,
    }
  } catch (err) {
    console.error('[quizGeneration] JSON parse failed:', err)
    const error = new Error(`Failed to parse quiz JSON: ${err.message}`)
    error.cause = err
    throw error
  }
}

/**
 * Generate quiz from content using AI
 * @param {string} content - The content to generate quiz from
 * @param {AbortSignal} signal - Abort signal for cancellation
 * @returns {Promise<Object>} Quiz data with title and questions
 */
export async function generateQuizFromContent(content, signal) {
  const quizPrompt = `You are a quiz generator. Generate a quiz with 5-10 multiple choice questions based on the following content.

CRITICAL REQUIREMENTS:
- Return ONLY valid JSON - no markdown, no code fences, no explanations, no "Here's a quiz" text
- The response must start with { and end with }
- Do not include any text before or after the JSON

Required JSON schema:
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

Notes:
- correctAnswer must be a number (0 for first option, 1 for second, etc.)
- Each question must have exactly 4 options
- Questions should test understanding of key concepts

Content to quiz:
${content}`

  let lastError = null

  // Retry logic: try up to 2 times
  for (let attempt = 1; attempt <= 2; attempt++) {
    console.log(`[quizGeneration] Attempt ${attempt} to generate quiz`)

    let quizText = ''
    try {
      await streamOpenRouterChat({
        messages: [{ role: 'user', content: quizPrompt }],
        signal,
        onToken: (token) => {
          quizText += token
        },
      })

      console.log(`[quizGeneration] Attempt ${attempt} received response, length: ${quizText.length}`)

      const quizData = parseQuizFromText(quizText)
      console.log(`[quizGeneration] Attempt ${attempt} successfully parsed quiz`)
      return quizData
    } catch (err) {
      lastError = err
      console.error(`[quizGeneration] Attempt ${attempt} failed:`, err.message)

      if (attempt < 2) {
        console.log(`[quizGeneration] Retrying...`)
        // Add a stronger instruction for retry
        continue
      }
    }
  }

  // All attempts failed
  console.error('[quizGeneration] All attempts failed')
  throw lastError || new Error('Failed to generate quiz after multiple attempts')
}

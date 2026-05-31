import { streamOpenRouterChat } from './openRouterChat.js'

/**
 * Analyze quiz performance to identify weak and strong topics
 */
function analyzeQuizPerformance(quizAttempts) {
  if (!quizAttempts || quizAttempts.length === 0) {
    return {
      averageScore: 0,
      weakTopics: [],
      strongTopics: [],
      recentActivity: 'No quiz attempts yet',
    }
  }

  const averageScore = Math.round(
    quizAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / quizAttempts.length
  )

  // Identify weak topics (quizzes with low scores)
  const weakTopics = quizAttempts
    .filter((attempt) => attempt.percentage < 70)
    .map((attempt) => attempt.quizTitle)

  // Identify strong topics (quizzes with high scores)
  const strongTopics = quizAttempts
    .filter((attempt) => attempt.percentage >= 80)
    .map((attempt) => attempt.quizTitle)

  const recentActivity = quizAttempts[0]?.quizTitle || 'No quiz attempts yet'

  return {
    averageScore,
    weakTopics,
    strongTopics,
    recentActivity,
  }
}

/**
 * Generate a personalized study plan using AI
 * @param {Object} data - Study data including quizAttempts, notes, quizzes
 * @param {Object} options - Plan options (duration, focusAreas)
 * @param {AbortSignal} signal - Abort signal for cancellation
 * @returns {Promise<string>} Generated study plan content
 */
export async function generateStudyPlan(data, options = {}, signal) {
  const { quizAttempts, notes, quizzes } = data
  const { duration = 5, focusAreas = [] } = options

  const performance = analyzeQuizPerformance(quizAttempts)

  // Build context for AI
  const notesContext = notes
    ? `Notes (${notes.length} total): ${notes.map((n) => n.title).join(', ')}`
    : 'No notes available'

  const quizzesContext = quizzes
    ? `Quizzes (${quizzes.length} total): ${quizzes.map((q) => q.title).join(', ')}`
    : 'No quizzes available'

  const performanceContext = `
Average Quiz Score: ${performance.averageScore}%
Weak Topics: ${performance.weakTopics.length > 0 ? performance.weakTopics.join(', ') : 'None identified'}
Strong Topics: ${performance.strongTopics.length > 0 ? performance.strongTopics.join(', ') : 'None identified'}
Recent Activity: ${performance.recentActivity}
`

  const focusAreasContext = focusAreas.length > 0
    ? `Focus Areas: ${focusAreas.join(', ')}`
    : 'No specific focus areas - generate a balanced plan'

  const prompt = `Generate a personalized ${duration}-day study plan based on the following student data:

${performanceContext}

${notesContext}

${quizzesContext}

${focusAreasContext}

Requirements:
1. Create a day-by-day study plan for ${duration} days
2. Each day should include:
   - 2-3 specific topics to study
   - 1-2 actions (e.g., "Complete quiz", "Review notes", "Take assessment")
   - Time allocation suggestions
3. Prioritize weak topics while maintaining balance
4. Include review sessions for strong topics
5. Format as markdown with clear day headings

Example format:
# Day 1
**Topics**: Photosynthesis, Cell Division
**Actions**:
- Review Photosynthesis notes (30 min)
- Complete Photosynthesis quiz (20 min)
- Study Cell Division concepts (40 min)

# Day 2
**Topics**: Respiration, Genetics
**Actions**:
- Review Respiration notes (30 min)
- Take Genetics assessment (25 min)
- Practice problems (35 min)

Generate the study plan now:`

  let planText = ''
  await streamOpenRouterChat({
    messages: [{ role: 'user', content: prompt }],
    signal,
    onToken: (token) => {
      planText += token
    },
  })

  return planText
}

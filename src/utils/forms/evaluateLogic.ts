import {
  ELogicCondition,
  type TLogic,
  type TQuestion,
} from '~/types/question.types'

/**
 * Evaluate logic conditions to determine next question
 * @param currentQuestion - The current question with logic rules
 * @param answer - The user's answer (string for text, array for select)
 * @param allQuestions - All questions in the form
 * @returns The next question ID to navigate to, or null for default next
 */
export function evaluateLogic(
  currentQuestion: TQuestion,
  answer: string | string[],
  allQuestions: TQuestion[],
): string | null {
  // If no logic rules, return null (go to next question in order)
  if (!currentQuestion.logic || currentQuestion.logic.length === 0) {
    return null
  }

  // Evaluate each logic rule in order
  for (const logic of currentQuestion.logic) {
    if (evaluateCondition(logic, answer)) {
      // Found a matching condition, return the skipTo target
      return logic.skipTo
    }
  }

  // No logic matched, return null (go to next question in order)
  return null
}

/**
 * Evaluate a single logic condition
 */
function evaluateCondition(logic: TLogic, answer: string | string[]): boolean {
  const { condition, value } = logic

  switch (condition) {
    case ELogicCondition.ALWAYS:
      return true

    case ELogicCondition.IS:
      if (Array.isArray(answer)) {
        // For select questions, check if any selected option matches
        return Array.isArray(value)
          ? answer.some((a) => value.includes(a))
          : answer.includes(value)
      }
      // For text questions, exact match
      return answer === value

    case ELogicCondition.IS_NOT:
      if (Array.isArray(answer)) {
        return Array.isArray(value)
          ? !answer.some((a) => value.includes(a))
          : !answer.includes(value)
      }
      return answer !== value

    case ELogicCondition.CONTAINS:
      if (Array.isArray(answer)) {
        return false // Not applicable for select
      }
      return (
        typeof value === 'string' &&
        answer.toLowerCase().includes(value.toLowerCase())
      )

    case ELogicCondition.DOES_NOT_CONTAIN:
      if (Array.isArray(answer)) {
        return false // Not applicable for select
      }
      return (
        typeof value === 'string' &&
        !answer.toLowerCase().includes(value.toLowerCase())
      )

    case ELogicCondition.IS_GREATER_THAN:
      if (Array.isArray(answer)) {
        return false // Not applicable for select
      }
      const numAnswer = Number(answer)
      const numValue = typeof value === 'string' ? Number(value) : 0
      return !isNaN(numAnswer) && !isNaN(numValue) && numAnswer > numValue

    case ELogicCondition.IS_LESS_THAN:
      if (Array.isArray(answer)) {
        return false // Not applicable for select
      }
      const numAnswer2 = Number(answer)
      const numValue2 = typeof value === 'string' ? Number(value) : 0
      return !isNaN(numAnswer2) && !isNaN(numValue2) && numAnswer2 < numValue2

    case ELogicCondition.IS_ONE_OF:
      if (!Array.isArray(value)) {
        return false
      }
      if (Array.isArray(answer)) {
        // For select questions, check if any selected option is in the value array
        return answer.some((a) => value.includes(a))
      }
      // For text questions, check if answer is in the value array
      return value.includes(answer)

    default:
      return false
  }
}

/**
 * Get the next question index based on logic evaluation
 * @param currentIndex - Current question index
 * @param currentQuestion - Current question with logic
 * @param answer - User's answer
 * @param allQuestions - All questions
 * @returns Next question index, or null if no more questions
 */
export function getNextQuestionIndex(
  currentIndex: number,
  currentQuestion: TQuestion,
  answer: string | string[],
  allQuestions: TQuestion[],
): number | null {
  // Evaluate logic to get skipTo target
  const skipToId = evaluateLogic(currentQuestion, answer, allQuestions)

  if (skipToId) {
    // If skipTo is 'end', return null to finish form
    if (skipToId === 'end') {
      return null
    }

    // Find the index of the target question
    const targetIndex = allQuestions.findIndex((q) => q.id === skipToId)
    if (targetIndex !== -1) {
      return targetIndex
    }
  }

  // Default: go to next question in order
  const nextIndex = currentIndex + 1
  return nextIndex < allQuestions.length ? nextIndex : null
}

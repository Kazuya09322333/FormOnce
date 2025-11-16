import { TQuestion } from '~/types/question.types'

/**
 * 質問の完了状態を判定するインターフェース
 */
export interface QuestionProgress {
  hasTitle: boolean
  hasDescription: boolean
  hasVideo: boolean
  hasLogic: boolean
  isComplete: boolean
  completionPercentage: number
}

/**
 * 質問の完了状態をチェック
 */
export function checkQuestionProgress(question: TQuestion): QuestionProgress {
  const hasTitle = Boolean(question.title && question.title.trim().length > 0)
  const hasDescription = Boolean(
    question.description && question.description.trim().length > 0,
  )
  const hasVideo = Boolean(question.videoId && question.videoUrl)
  const hasLogic = Boolean(question.logic && question.logic.length > 0)

  // 完了条件を計算（タイトルは必須、その他は任意）
  const checks = [
    hasTitle, // 必須
    hasDescription,
    hasVideo,
    hasLogic,
  ]

  const completedCount = checks.filter(Boolean).length
  const completionPercentage = Math.round(
    (completedCount / checks.length) * 100,
  )

  // タイトルがあれば基本的には「使用可能」とみなす
  // ただし、すべて完了していれば「完全完了」
  const isComplete = completedCount === checks.length

  return {
    hasTitle,
    hasDescription,
    hasVideo,
    hasLogic,
    isComplete,
    completionPercentage,
  }
}

/**
 * フォーム全体の進捗率を計算
 */
export function calculateFormProgress(questions: TQuestion[]): {
  totalQuestions: number
  completeQuestions: number
  progressPercentage: number
  questionsWithTitle: number
  questionsWithVideo: number
  questionsWithLogic: number
} {
  if (questions.length === 0) {
    return {
      totalQuestions: 0,
      completeQuestions: 0,
      progressPercentage: 0,
      questionsWithTitle: 0,
      questionsWithVideo: 0,
      questionsWithLogic: 0,
    }
  }

  const progressData = questions.map(checkQuestionProgress)

  const completeQuestions = progressData.filter((p) => p.isComplete).length
  const questionsWithTitle = progressData.filter((p) => p.hasTitle).length
  const questionsWithVideo = progressData.filter((p) => p.hasVideo).length
  const questionsWithLogic = progressData.filter((p) => p.hasLogic).length

  const progressPercentage = Math.round(
    (completeQuestions / questions.length) * 100,
  )

  return {
    totalQuestions: questions.length,
    completeQuestions,
    progressPercentage,
    questionsWithTitle,
    questionsWithVideo,
    questionsWithLogic,
  }
}

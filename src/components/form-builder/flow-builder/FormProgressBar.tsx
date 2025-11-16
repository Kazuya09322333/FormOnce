import { CheckCircle2, FileText, Split, Video } from 'lucide-react'
import { TQuestion } from '~/types/question.types'
import { calculateFormProgress } from '~/utils/questionProgress'

type FormProgressBarProps = {
  questions: TQuestion[]
}

export function FormProgressBar({ questions }: FormProgressBarProps) {
  const progress = calculateFormProgress(questions)

  if (questions.length === 0) {
    return null
  }

  return (
    <div className="bg-white border-2 border-violet-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">フォーム進捗</h3>
        <span className="text-2xl font-bold text-violet-600">
          {progress.progressPercentage}%
        </span>
      </div>

      {/* プログレスバー */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-violet-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress.progressPercentage}%` }}
        />
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-600" />
          <span className="text-gray-600">
            完了:{' '}
            <span className="font-semibold text-gray-900">
              {progress.completeQuestions}
            </span>
            /<span className="text-gray-500">{progress.totalQuestions}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <FileText size={16} className="text-blue-600" />
          <span className="text-gray-600">
            タイトル:{' '}
            <span className="font-semibold text-gray-900">
              {progress.questionsWithTitle}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Video size={16} className="text-purple-600" />
          <span className="text-gray-600">
            動画:{' '}
            <span className="font-semibold text-gray-900">
              {progress.questionsWithVideo}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Split size={16} className="text-orange-600" />
          <span className="text-gray-600">
            ロジック:{' '}
            <span className="font-semibold text-gray-900">
              {progress.questionsWithLogic}
            </span>
          </span>
        </div>
      </div>

      {/* 完了メッセージ */}
      {progress.progressPercentage === 100 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800 font-medium flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-600" />
            すべての質問が完了しました！
          </p>
        </div>
      )}
    </div>
  )
}

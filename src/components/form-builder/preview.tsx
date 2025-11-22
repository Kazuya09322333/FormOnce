import { X } from 'lucide-react'
import React from 'react'
import type { TFormSchema } from '~/types/form.types'
import type { TQuestion } from '~/types/question.types'

import { Button, Icons } from '../ui'
import VideoAskRenderer from './videoask-renderer'

type TPreviewProps = {
  formSchema?: TFormSchema
  currentQuestionIdx?: number
  questions?: TQuestion[]
  onClose?: () => void
  embedded?: boolean
}

function Preview({
  formSchema,
  currentQuestionIdx,
  questions,
  onClose,
  embedded = false,
}: TPreviewProps) {
  const [resetSignal, setResetSignal] = React.useState(false)
  const [currentIdx, setCurrentIdx] = React.useState(0)
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  const onNext = () => {
    setCurrentIdx((prev) => prev + 1)
  }

  const onPrev = () => {
    setCurrentIdx((prev) => Math.max(0, prev - 1))
  }

  const onSubmit = async (values: unknown) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log('submit', values)
    setIsSubmitted(true)
  }

  const onReset = () => {
    setResetSignal(true)
    setCurrentIdx(0)
    setIsSubmitted(false)
    setTimeout(() => setResetSignal(false), 100)
  }

  const containerClass = embedded
    ? 'absolute inset-0 bg-black'
    : 'fixed inset-0 bg-black z-50'

  return (
    <div className={containerClass}>
      {formSchema && questions && questions.length > 0 ? (
        <>
          {onClose && (
            <Button
              variant="secondary"
              onClick={onClose}
              className="absolute top-4 left-4 z-[60] gap-1 text-sm font-normal bg-black/50 hover:bg-black/70 text-white border-white/20"
              size="sm"
            >
              <X className="w-4 h-4" /> 閉じる
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={onReset}
            className="absolute top-4 right-4 z-[60] gap-1 text-sm font-normal [&>svg]:active:rotate-180 bg-black/50 hover:bg-black/70 text-white border-white/20"
            size="sm"
          >
            Reset <Icons.reset className="duration-50 transform transition" />
          </Button>
          <div className="relative w-full h-full">
            {isSubmitted ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-900 via-purple-900 to-black">
                <div className="text-center space-y-4">
                  <div className="text-6xl">✓</div>
                  <div className="text-white text-2xl font-bold">
                    送信完了！
                  </div>
                  <Button
                    onClick={onReset}
                    className="mt-4 bg-violet-600 hover:bg-violet-700"
                  >
                    もう一度試す
                  </Button>
                </div>
              </div>
            ) : (
              <VideoAskRenderer
                formSchema={formSchema}
                questions={questions}
                currentQuestionIdx={currentIdx}
                onNext={onNext}
                onPrev={onPrev}
                onSubmit={onSubmit}
                resetSignal={resetSignal}
                onReset={() => setResetSignal(false)}
                isPreview={true}
              />
            )}
          </div>
        </>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">
            Add questions to see the preview
          </p>
        </div>
      )}
    </div>
  )
}

export { Preview }

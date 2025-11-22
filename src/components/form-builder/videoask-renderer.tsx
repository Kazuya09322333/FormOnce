import { Button, Form, FormField, Icons } from '@components/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import type { TFormSchema } from '~/types/form.types'
import type { TQuestion } from '~/types/question.types'
import { getNextQuestionIndex } from '~/utils/forms/evaluateLogic'
import { formSchemaToZod } from '~/utils/forms/formSchemaToZod'
import { VideoAskInput } from './videoask-input'

type TProps = {
  formSchema: TFormSchema
  questions: TQuestion[]
  onSubmit: (values: Record<string, unknown>) => Promise<void>
  onNext: () => void
  onPrev: () => void
  currentQuestionIdx?: number
  onReset?: () => void
  resetSignal?: boolean
  isPreview?: boolean
}

function VideoAskRenderer({
  formSchema,
  questions,
  currentQuestionIdx,
  resetSignal,
  onReset,
  isPreview = false,
  ...props
}: TProps) {
  const [qIdx, setQuestionIdx] = useState(currentQuestionIdx ?? 0)
  const [isNextLoading, setIsNextLoading] = useState(false)
  const [videoEnded, setVideoEnded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const currentQuestion = questions[qIdx]
  const hasVideo = !!currentQuestion?.videoUrl

  const ZFormSchema = formSchemaToZod(formSchema)

  useEffect(() => {
    setQuestionIdx(currentQuestionIdx ?? 0)
  }, [currentQuestionIdx, questions])

  // Auto-play video when question changes
  useEffect(() => {
    setVideoEnded(false)
    if (videoRef.current && hasVideo) {
      videoRef.current.currentTime = 0
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log('Auto-play prevented:', error)
          // Auto-play was prevented, user needs to interact first
        })
      }
    } else {
      // No video, show input immediately
      setVideoEnded(true)
    }
  }, [qIdx, hasVideo])

  const handleVideoEnded = () => {
    setVideoEnded(true)
  }

  const handleNext = async () => {
    const currentQ = questions[qIdx]
    if (!currentQ) return

    await form.trigger(currentQ.id)
    if (form.formState.errors[currentQ.id!]) {
      console.log('error', form.formState.errors[currentQ.id!])
      return
    }

    setIsNextLoading(true)

    // Get current answer
    const currentAnswer = form.getValues()[currentQ.id!]

    // Check if this is the last question
    if (qIdx === questions.length - 1) {
      await props.onSubmit(form.getValues())
      form.reset()
      setIsNextLoading(false)
      return
    }

    // Evaluate logic to determine next question
    const nextIndex = getNextQuestionIndex(
      qIdx,
      currentQ,
      currentAnswer as string | string[],
      questions,
    )

    if (nextIndex !== null) {
      props.onNext()
      setQuestionIdx(nextIndex)
    } else {
      // No more questions, submit
      await props.onSubmit(form.getValues())
      form.reset()
    }

    setIsNextLoading(false)
  }

  const defaultValues = questions.reduce(
    (acc: Record<string, unknown>, curr) => {
      if (curr.id) {
        switch (curr.type) {
          case 'text':
            acc[curr.id] = ''
            break
          case 'select':
            acc[curr.id] = []
            break
          default:
            acc[curr.id] = ''
            break
        }
      }
      return acc
    },
    {},
  )

  const form = useForm<z.infer<typeof ZFormSchema>>({
    resolver: zodResolver(ZFormSchema),
    defaultValues: defaultValues,
    mode: 'all',
  })

  // watch for reset signal and reset form
  useEffect(() => {
    if (resetSignal) {
      form.reset()
      setQuestionIdx(0)
      if (onReset) {
        onReset()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal])

  if (!currentQuestion) return null

  const positionClass = isPreview ? 'absolute' : 'fixed'

  return (
    <div className={positionClass + ' inset-0 bg-gray-100 flex flex-col'}>
      {/* Progress Indicator - Top Bar */}
      <div className="flex-shrink-0 p-4 bg-white/90 backdrop-blur-sm border-b z-20">
        <div className="flex items-center gap-2">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={
                'h-1 flex-1 rounded-full transition-all ' +
                (idx < qIdx
                  ? 'bg-violet-500'
                  : idx === qIdx
                    ? 'bg-violet-400'
                    : 'bg-gray-300')
              }
            />
          ))}
        </div>
        <div className="mt-2 text-gray-700 text-sm font-medium">
          {qIdx + 1} / {questions.length}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Side - Video (Portrait 9:16) */}
        <div className="w-1/2 flex items-center justify-center bg-gray-200 p-6">
          {hasVideo ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <div
                className="relative"
                style={{
                  aspectRatio: '9/16',
                  maxHeight: '100%',
                  maxWidth: '100%',
                }}
              >
                <video
                  ref={videoRef}
                  src={currentQuestion.videoUrl}
                  className="w-full h-full object-cover rounded-2xl shadow-2xl"
                  onEnded={handleVideoEnded}
                  playsInline
                  preload="auto"
                  controls
                >
                  お使いのブラウザは動画タグをサポートしていません。
                </video>

                {/* Skip Video Button */}
                {!videoEnded && (
                  <button
                    onClick={() => setVideoEnded(true)}
                    className="absolute bottom-4 right-4 text-white bg-black/60 hover:bg-black/80 px-4 py-2 rounded-full text-sm transition-colors"
                  >
                    スキップ
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>動画がありません</p>
            </div>
          )}
        </div>

        {/* Right Side - Answer Options */}
        <div className="w-1/2 bg-white overflow-y-auto">
          <div className="max-w-xl mx-auto p-8 pb-16">
            <Form {...form}>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  void handleNext()
                }}
                className="space-y-6"
              >
                {questions.map((question, idx) => (
                  <FormField
                    key={idx}
                    control={form.control}
                    name={question.id!}
                    render={({ field }) => (
                      <div
                        className={
                          'transition-all duration-300 ' +
                          (qIdx === idx ? 'block' : 'hidden')
                        }
                      >
                        <VideoAskInput
                          field={field}
                          question={question}
                          formControl={form.control}
                          onNext={handleNext}
                          isLoading={isNextLoading}
                          isLastQuestion={qIdx === questions.length - 1}
                        />
                      </div>
                    )}
                  />
                ))}
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoAskRenderer

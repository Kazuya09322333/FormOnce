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
}

function VideoAskRenderer({
  formSchema,
  questions,
  currentQuestionIdx,
  resetSignal,
  onReset,
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

  return (
    <div className="fixed inset-0 bg-black flex">
      {/* Progress Indicator - Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all ${
                idx < qIdx
                  ? 'bg-violet-500'
                  : idx === qIdx
                    ? 'bg-violet-400'
                    : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
        <div className="mt-2 text-white text-sm">
          {qIdx + 1} / {questions.length}
        </div>
      </div>

      {/* Left Side - Video Section */}
      {hasVideo && (
        <div className="relative w-1/2 flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            src={currentQuestion.videoUrl}
            className="w-full h-full object-contain"
            onEnded={handleVideoEnded}
            playsInline
            preload="auto"
          >
            お使いのブラウザは動画タグをサポートしていません。
          </video>

          {/* Skip Video Button */}
          {!videoEnded && (
            <button
              onClick={() => setVideoEnded(true)}
              className="absolute bottom-4 right-4 text-white bg-black/50 hover:bg-black/70 px-4 py-2 rounded-full text-sm transition-colors z-10"
            >
              スキップ
            </button>
          )}
        </div>
      )}

      {/* Right Side - Answer Section */}
      <div
        className={`${
          hasVideo ? 'w-1/2' : 'w-full'
        } flex items-center justify-center bg-gradient-to-br from-violet-900/20 via-purple-900/20 to-black p-8 transition-all duration-500 ${
          videoEnded || !hasVideo
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-50 pointer-events-none'
        }`}
      >
        <div className="w-full max-w-xl">
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
                      className={`transition-all duration-300 ${
                        qIdx === idx ? 'block' : 'hidden'
                      }`}
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
  )
}

export default VideoAskRenderer

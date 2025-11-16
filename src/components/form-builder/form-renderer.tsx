import { Button, Form, FormField, Icons, Progress } from '@components/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import type { TFormSchema } from '~/types/form.types'
import {
  EQuestionType,
  type TQuestion,
  type TSelectQuestion,
} from '~/types/question.types'
import { formSchemaToZod } from '~/utils/forms/formSchemaToZod'
import { InputRenderer } from './input-renderer'

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

function FormRenderer({
  formSchema,
  questions,
  currentQuestionIdx,
  resetSignal,
  onReset,
  ...props
}: TProps) {
  const [qIdx, setQuestionIdx] = useState(currentQuestionIdx ?? 0)
  const [progress, setProgress] = useState(0)
  const [isNextLoading, setIsNextLoading] = useState(false)

  const ZFormSchema = formSchemaToZod(formSchema)

  useEffect(() => {
    setQuestionIdx(currentQuestionIdx ?? 0)

    const currProgress =
      (((currentQuestionIdx ?? 0) + 1) * 100) / questions.length
    setProgress(currProgress)
  }, [currentQuestionIdx, questions])

  const handleNext = async (skipToQuestionId?: string) => {
    await form.trigger(questions[qIdx]?.id)
    if (form.formState.errors[questions[qIdx]!.id!]) {
      console.log('error', form.formState.errors[questions[qIdx]!.id!])
      return
    }

    setIsNextLoading(true)

    // Handle branching logic
    let nextIdx = qIdx + 1

    if (skipToQuestionId && skipToQuestionId !== 'end') {
      // Find the index of the question to skip to
      const targetIdx = questions.findIndex((q) => q.id === skipToQuestionId)
      if (targetIdx !== -1) {
        nextIdx = targetIdx
      }
    } else if (skipToQuestionId === 'end') {
      // Submit the form
      await props.onSubmit(form.getValues())
      form.reset()
      setIsNextLoading(false)
      return
    }

    if (qIdx === questions.length - 1 || nextIdx >= questions.length) {
      await props.onSubmit(form.getValues())
      form.reset()
    } else {
      props.onNext()
    }

    setQuestionIdx(nextIdx > questions.length - 1 ? 0 : nextIdx)

    const currProgress =
      ((nextIdx < questions.length ? nextIdx + 1 : 1) * 100) / questions.length
    setProgress(currProgress)

    setIsNextLoading(false)
  }

  const handleAnswerSelect = (answer: string, skipTo?: string) => {
    // Automatically trigger next when an answer is selected in VideoAsk mode
    setTimeout(() => {
      void handleNext(skipTo)
    }, 500) // Small delay for UX
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
      // reset form
      form.reset()

      setQuestionIdx(0)
      currentQuestionIdx
      setProgress(100 / questions.length)

      if (onReset) {
        onReset()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal])

  return (
    <div>
      <Form {...form}>
        <form
          // onSubmit={form.handleSubmit(onSubmit, onError)}
          onSubmit={(e) => {
            e.preventDefault()
            void handleNext()
          }}
          className="my-8"
        >
          {questions.map((question, idx) => (
            <FormField
              key={idx}
              control={form.control}
              name={question.id!}
              render={({ field }) => (
                <div className="overflow-hidden">
                  <div
                    className={`transition-all duration-150 ease-out ${
                      qIdx === idx
                        ? 'not-sr-only translate-x-0'
                        : 'sr-only -translate-x-full'
                    }`}
                  >
                    <InputRenderer
                      field={field}
                      question={question}
                      formControl={form.control}
                      onAnswerSelect={handleAnswerSelect}
                    />
                  </div>
                </div>
              )}
            />
          ))}
        </form>
      </Form>
      {/* Hide Next button for VideoAsk-style questions (they auto-advance) */}
      {(() => {
        const currentQuestion = questions[qIdx]
        if (
          !currentQuestion?.videoUrl ||
          currentQuestion.type !== EQuestionType.Select
        ) {
          return true
        }
        const selectQuestion = currentQuestion as TSelectQuestion
        return !(selectQuestion.options && selectQuestion.options.length > 0)
      })() && (
        <div className="mt-8 flex justify-end">
          <Button type="button" onClick={() => void handleNext()}>
            {isNextLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : qIdx === questions.length - 1 ? (
              'Submit'
            ) : (
              'Next'
            )}
          </Button>
        </div>
      )}
      <div className="mt-14 px-24">
        <Progress className="h-[5px]" value={progress} />
      </div>
    </div>
  )
}

export default FormRenderer

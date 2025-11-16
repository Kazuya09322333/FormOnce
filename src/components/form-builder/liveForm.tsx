import { Check } from 'lucide-react'
import React from 'react'
import type { TFormSchema } from '~/types/form.types'
import type { TQuestion } from '~/types/question.types'

import { api } from '~/utils/api'
import VideoAskRenderer from './videoask-renderer'

type TLiveFormProps = {
  formId: string
  formSchema: TFormSchema
  questions: TQuestion[]
  formViewId: string
}

function LiveForm({
  formId,
  formSchema,
  questions,
  formViewId,
}: TLiveFormProps) {
  const { mutateAsync: submitResponse, isSuccess: formSubmitted } =
    api.form.submitResponse.useMutation()

  const onNext = () => {
    console.log('next')
  }

  const onPrev = () => {
    console.log('prev')
  }

  const onSubmit = async (values: Record<string, unknown>) => {
    await submitResponse({
      formId: formId,
      response: values,
      formViewId,
    })
  }

  if (formSubmitted) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-violet-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center px-6 space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300 delay-150">
            <Check className="w-16 h-16 text-white" strokeWidth={3} />
          </div>
          <div className="text-white text-5xl font-bold animate-in slide-in-from-bottom-4 duration-500 delay-300">
            送信完了！
          </div>
          <div className="text-gray-300 text-xl font-light animate-in slide-in-from-bottom-4 duration-500 delay-500">
            ご回答ありがとうございました
          </div>
        </div>
      </div>
    )
  }

  return (
    <VideoAskRenderer
      formSchema={formSchema}
      questions={questions}
      onNext={onNext}
      onPrev={onPrev}
      onSubmit={onSubmit}
    />
  )
}

export { LiveForm }

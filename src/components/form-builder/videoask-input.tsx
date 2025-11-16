import type { CheckedState } from '@radix-ui/react-checkbox'
import { Check, ChevronRight, ExternalLink } from 'lucide-react'
import React from 'react'
import type { Control, ControllerRenderProps } from 'react-hook-form'
import {
  ECTAActionType,
  EQuestionType,
  ESelectSubType,
  type TCTAButtonQuestion,
  type TQuestion,
} from '~/types/question.types'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Icons,
  Input,
  Textarea,
} from '../ui'
import { Checkbox } from '../ui/checkbox'

type TVideoAskInputProps = {
  question: TQuestion
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  field: ControllerRenderProps<Record<string, any>, string>
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  formControl: Control<Record<string, any>, string>
  onNext: () => void
  isLoading: boolean
  isLastQuestion: boolean
}

export const VideoAskInput = ({
  question,
  field,
  formControl,
  onNext,
  isLoading,
  isLastQuestion,
}: TVideoAskInputProps) => {
  switch (question.type) {
    case EQuestionType.Text:
      return (
        <FormItem className="text-white">
          <FormLabel className="text-2xl font-bold text-white">
            {question.title}
          </FormLabel>
          {question.description && (
            <FormDescription className="text-gray-300 text-lg">
              {question.description}
            </FormDescription>
          )}
          <div className="pt-4">
            <FormControl>
              <RenderTextInput
                type={question.subType}
                field={field}
                placeholder={question.placeholder ?? ''}
              />
            </FormControl>
          </div>
          <FormMessage className="text-red-400" />
          <div className="pt-6">
            <button
              type="button"
              onClick={onNext}
              disabled={isLoading || !field.value}
              className="group flex items-center gap-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="h-5 w-5 animate-spin" />
                  送信中...
                </>
              ) : (
                <>
                  {isLastQuestion ? '送信' : '次へ'}
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </FormItem>
      )

    case EQuestionType.Select:
      return (
        <FormItem className="text-white">
          <FormLabel className="text-2xl font-bold text-white">
            {question.title}
          </FormLabel>
          {question.description && (
            <FormDescription className="text-gray-300 text-lg">
              {question.description}
            </FormDescription>
          )}
          <div className="pt-6">
            <RenderSelectInput
              question={question}
              field={field}
              formControl={formControl}
              onNext={onNext}
              isLoading={isLoading}
              isLastQuestion={isLastQuestion}
            />
          </div>
        </FormItem>
      )

    case EQuestionType.CTAButton: {
      const ctaQuestion = question as TCTAButtonQuestion
      const handleCTAClick = () => {
        if (
          ctaQuestion.actionType === ECTAActionType.URLRedirect &&
          ctaQuestion.redirectUrl
        ) {
          // URLリダイレクト
          window.location.href = ctaQuestion.redirectUrl
        } else if (ctaQuestion.actionType === ECTAActionType.EndScreen) {
          // エンドスクリーン（フォーム送信）
          onNext()
        } else {
          // 次のステップへ
          onNext()
        }
      }

      return (
        <FormItem className="text-white">
          <FormLabel className="text-2xl font-bold text-white">
            {question.title}
          </FormLabel>
          {question.description && (
            <FormDescription className="text-gray-300 text-lg">
              {question.description}
            </FormDescription>
          )}
          <div className="pt-8">
            <button
              type="button"
              onClick={handleCTAClick}
              disabled={isLoading}
              className="group flex items-center justify-center gap-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-12 py-5 rounded-full text-xl font-bold transition-all transform hover:scale-105 disabled:hover:scale-100 w-full max-w-md shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="h-6 w-6 animate-spin" />
                  読み込み中...
                </>
              ) : (
                <>
                  {ctaQuestion.buttonText}
                  {ctaQuestion.actionType === ECTAActionType.URLRedirect ? (
                    <ExternalLink className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  ) : (
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  )}
                </>
              )}
            </button>
          </div>
        </FormItem>
      )
    }

    default:
      return null
  }
}

type TRenderTextInputProps = {
  type: string
  field: TVideoAskInputProps['field']
  placeholder: string
}

const RenderTextInput = ({
  type,
  field,
  placeholder,
}: TRenderTextInputProps) => {
  const inputClasses =
    'bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-lg py-6 px-4 focus:bg-white/20 focus:border-violet-400 transition-all'

  switch (type) {
    case 'short':
      return (
        <Input
          className={inputClasses}
          placeholder={placeholder}
          type="text"
          {...field}
        />
      )
    case 'long':
      return (
        <Textarea
          className={`${inputClasses} min-h-32`}
          placeholder={placeholder}
          {...field}
        />
      )
    case 'email':
      return (
        <Input
          className={inputClasses}
          placeholder={placeholder}
          type="email"
          {...field}
        />
      )
    case 'number':
      return (
        <Input
          className={inputClasses}
          placeholder={placeholder}
          type="number"
          {...field}
          onChange={(e) =>
            field.onChange(
              Number(e.target.value) ? Number(e.target.value) : e.target.value,
            )
          }
        />
      )
    case 'url':
      return (
        <Input
          className={inputClasses}
          placeholder={placeholder}
          type="url"
          {...field}
        />
      )
    case 'phone':
      return (
        <Input
          className={inputClasses}
          placeholder={placeholder}
          type="tel"
          pattern="[0-9]{3}[0-9]{3}[0-9]{4}"
          {...field}
        />
      )
    case 'password':
      return (
        <Input
          className={inputClasses}
          placeholder={placeholder}
          type="password"
          {...field}
        />
      )
    default:
      return (
        <Input
          className={inputClasses}
          placeholder={placeholder}
          type="text"
          {...field}
        />
      )
  }
}

type TRenderSelectInputProps = {
  question: TQuestion
  field: TVideoAskInputProps['field']
  formControl: TVideoAskInputProps['formControl']
  onNext: () => void
  isLoading: boolean
  isLastQuestion: boolean
}

const RenderSelectInput = ({
  question,
  formControl,
  onNext,
  isLoading,
  isLastQuestion,
}: TRenderSelectInputProps) => {
  type THandleCheckboxChange = {
    item: string
    checked: CheckedState
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    field: ControllerRenderProps<Record<string, any>, string>
    mode: ESelectSubType
  }

  const handleCheckboxChange = ({
    item,
    checked,
    field,
    mode,
  }: THandleCheckboxChange) => {
    field.value = (field.value as string[]) ?? []

    if (mode === ESelectSubType.Single) {
      const newValue = checked ? [item] : []
      field.onChange(newValue)
      // Auto-advance on single selection after a short delay
      if (checked) {
        setTimeout(() => {
          onNext()
        }, 300)
      }
    } else {
      return checked
        ? field.onChange([...(field?.value as string[]), item])
        : field.onChange(
            (field?.value as string[])?.filter((value) => value !== item),
          )
    }
  }

  const isSingleSelect = question.subType === ESelectSubType.Single

  switch (question.subType) {
    case ESelectSubType.Multiple:
    case ESelectSubType.Single:
      return (
        <div className="space-y-4">
          <div className="grid gap-3">
            {question.options.map((item, idx) => (
              <FormField
                key={item}
                control={formControl}
                name={question.id!}
                render={({ field }) => {
                  const isSelected = (field.value as string[])?.includes(item)
                  return (
                    <FormItem key={item}>
                      <label
                        htmlFor={`${item}-${idx}`}
                        className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all transform hover:scale-[1.02] ${
                          isSelected
                            ? 'bg-violet-600 border-violet-400 shadow-lg shadow-violet-500/50'
                            : 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40'
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            isSelected
                              ? 'bg-white text-violet-600'
                              : 'bg-white/20 text-white'
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            String.fromCharCode(65 + idx)
                          )}
                        </div>
                        <span className="flex-1 text-white text-lg font-medium">
                          {item}
                        </span>
                        <FormControl>
                          <Checkbox
                            id={`${item}-${idx}`}
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange({
                                item,
                                checked,
                                field,
                                mode: question.subType,
                              })
                            }
                            className="sr-only"
                          />
                        </FormControl>
                      </label>
                    </FormItem>
                  )
                }}
              />
            ))}
          </div>

          {/* Show Next button for multiple select */}
          {!isSingleSelect && (
            <div className="pt-4">
              <button
                type="button"
                onClick={onNext}
                disabled={isLoading}
                className="group flex items-center gap-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="h-5 w-5 animate-spin" />
                    送信中...
                  </>
                ) : (
                  <>
                    {isLastQuestion ? '送信' : '次へ'}
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          )}

          <FormMessage className="text-red-400" />
        </div>
      )
    default:
      return null
  }
}

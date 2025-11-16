import type { CheckedState } from '@radix-ui/react-checkbox'
import React from 'react'
import type { Control, ControllerRenderProps } from 'react-hook-form'
import {
  EQuestionType,
  ESelectSubType,
  type TQuestion,
} from '~/types/question.types'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from '../ui'
import { Checkbox } from '../ui/checkbox'
import { VideoAskPlayer } from '../video-ask-player'

type TInputRenderProps = {
  question: TQuestion
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  field: ControllerRenderProps<Record<string, any>, string>
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  formControl: Control<Record<string, any>, string>
  onAnswerSelect?: (answer: string, skipTo?: string) => void
}

export const InputRenderer = ({
  question,
  field,
  formControl,
  onAnswerSelect,
}: // ...props
TInputRenderProps) => {
  // VideoAsk-style rendering for questions with video and options
  if (
    question.videoUrl &&
    question.type === EQuestionType.Select &&
    'options' in question &&
    question.options &&
    question.options.length > 0
  ) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <VideoAskPlayer
          videoUrl={question.videoUrl}
          question={question}
          onAnswerSelect={(answer, skipTo) => {
            // Update the form field with the selected answer
            if (question.subType === ESelectSubType.Single) {
              field.onChange([answer])
            } else {
              field.onChange([...((field.value as string[]) || []), answer])
            }
            // Call the callback if provided
            if (onAnswerSelect) {
              onAnswerSelect(answer, skipTo)
            }
          }}
        />
      </div>
    )
  }

  switch (question.type) {
    case EQuestionType.Text:
      return (
        <FormItem>
          {question.videoUrl && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <video
                src={question.videoUrl}
                controls
                className="w-full max-h-96 bg-black"
                preload="metadata"
              >
                お使いのブラウザは動画タグをサポートしていません。
              </video>
            </div>
          )}
          <FormLabel>{question.title}</FormLabel>
          <FormControl>
            <RenderTextInput
              type={question.subType}
              field={field}
              placeholder={question.placeholder ?? ''}
            />
          </FormControl>
          <FormDescription>{question.description}</FormDescription>
          <FormMessage />
        </FormItem>
      )

    case EQuestionType.Select:
      return (
        <FormItem>
          {question.videoUrl && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <video
                src={question.videoUrl}
                controls
                className="w-full max-h-96 bg-black"
                preload="metadata"
              >
                お使いのブラウザは動画タグをサポートしていません。
              </video>
            </div>
          )}
          <RenderSelectInput
            question={question}
            field={field}
            formControl={formControl}
          />
        </FormItem>
      )
    default:
      return (
        <Input
          className="mt-2"
          placeholder="Enter your answer"
          type="text"
          name="answer"
        />
      )
  }
}

type TRenderTextInputProps = {
  type: string
  field: TInputRenderProps['field']
  placeholder: string
}

const RenderTextInput = ({
  type,
  field,
  placeholder,
}: TRenderTextInputProps) => {
  switch (type) {
    case 'short':
      return (
        <Input
          className="mt-2"
          placeholder={placeholder}
          type="text"
          {...field}
        />
      )
    case 'long':
      return <Textarea className="mt-2" placeholder={placeholder} {...field} />
    case 'email':
      return (
        <Input
          className="mt-2"
          placeholder={placeholder}
          type="email"
          {...field}
        />
      )
    case 'number':
      return (
        <Input
          className="mt-2"
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
          className="mt-2"
          placeholder={placeholder}
          type="url"
          {...field}
        />
      )
    case 'phone':
      return (
        <Input
          className="mt-2"
          placeholder={placeholder}
          type="tel"
          pattern="[0-9]{3}[0-9]{3}[0-9]{4}"
          {...field}
        />
      )
    case 'password':
      return (
        <Input
          className="mt-2"
          placeholder={placeholder}
          type="password"
          {...field}
        />
      )
    default:
      return (
        <Input
          className="mt-2"
          placeholder="Enter your answer"
          type="text"
          {...field}
        />
      )
  }
}

type TRenderSelectInputProps = {
  question: TQuestion
  field: TInputRenderProps['field']
  formControl: TInputRenderProps['formControl']
}

const RenderSelectInput = ({
  question,
  formControl,
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
    // set field.value empty array if it's undefined, (this happens for new questions)
    field.value = (field.value as string[]) ?? []

    if (mode === ESelectSubType.Single) {
      return checked
        ? field.onChange([item])
        : field.onChange(
            (field?.value as string[])?.filter((value) => value !== item),
          )
    } else {
      return checked
        ? field.onChange([...(field?.value as string[]), item])
        : field.onChange(
            (field?.value as string[])?.filter((value) => value !== item),
          )
    }
  }

  switch (question.subType) {
    case ESelectSubType.Multiple:
    case ESelectSubType.Single:
      return (
        <>
          <div className="mb-4">
            <FormLabel className="text-base">{question.title}</FormLabel>
            <FormDescription>{question.description}</FormDescription>
          </div>
          {question.options.map((item) => (
            <FormField
              key={item}
              control={formControl}
              name={question.id!}
              render={({ field }) => {
                return (
                  <FormItem
                    key={item}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={(field.value as string[])?.includes(item)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange({
                            item,
                            checked,
                            field,
                            mode: question.subType,
                          })
                        }
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      {item}
                    </FormLabel>
                  </FormItem>
                )
              }}
            />
          ))}
          <FormMessage />
        </>
      )
    default:
      return <></>
  }
}

'use client'

import React from 'react'
import {
  EQuestionType,
  type TCTAButtonQuestion,
  type TQuestion,
  type TSelectQuestion,
  type TTextQuestion,
} from '~/types/question.types'

import { Dialog, DialogContent } from '@components/ui'
import { CTAButtonForm } from './cta-button-form'
import { SelectQuestionForm } from './select-question-form'
import { TextQuestionForm } from './text-question-form'

type TEditableQuestionDialogProps = TQuestion & {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  editQuestion: (values: TQuestion) => Promise<void>
}

const EditableQuestionDialog = ({
  isOpen,
  setIsOpen,
  editQuestion,
  ...question
}: TEditableQuestionDialogProps) => {
  const onEditQuestion = async (values: TQuestion) => {
    await editQuestion({
      ...values,
      id: question.id,
    } as TQuestion)
  }

  const onOpenChange = (open: boolean) => {
    setIsOpen(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        {question.type === EQuestionType.Text && (
          <TextQuestionForm
            onEdit={onEditQuestion}
            mode="edit"
            {...(question as TTextQuestion)}
          />
        )}
        {question.type === EQuestionType.Select && (
          <SelectQuestionForm
            onEdit={onEditQuestion}
            mode="edit"
            {...(question as TSelectQuestion)}
          />
        )}
        {question.type === EQuestionType.CTAButton && (
          <CTAButtonForm
            onSubmit={onEditQuestion}
            defaultValues={question as TCTAButtonQuestion}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export { EditableQuestionDialog }

'use client'

import { Dialog, DialogContent } from '@components/ui'
import React from 'react'
import type { TQuestion } from '~/types/question.types'
import { AdvancedVideoEditor } from '../advanced-video-editor'

type AdvancedEditorDialogProps = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  question: TQuestion
  onSave: (question: TQuestion) => void
  allQuestions?: TQuestion[]
}

export const AdvancedEditorDialog = ({
  isOpen,
  setIsOpen,
  question,
  onSave,
  allQuestions = [],
}: AdvancedEditorDialogProps) => {
  const handleSave = (updatedQuestion: TQuestion) => {
    onSave(updatedQuestion)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[95vw] h-[95vh] p-0 overflow-hidden">
        <AdvancedVideoEditor
          question={question}
          onSave={handleSave}
          onCancel={handleCancel}
          allQuestions={allQuestions}
        />
      </DialogContent>
    </Dialog>
  )
}

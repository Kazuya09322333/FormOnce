import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { useState } from 'react'
import { TQuestion } from '~/types/question.types'

type QuestionType =
  | 'short-text'
  | 'long-text'
  | 'single-choice'
  | 'multiple-choice'
  | 'email'
  | 'number'
  | 'cta-button'

const questionTypes: { type: QuestionType; label: string; icon: string }[] = [
  { type: 'short-text', label: '短文回答', icon: '📝' },
  { type: 'long-text', label: '長文回答', icon: '📄' },
  { type: 'single-choice', label: '単一選択', icon: '⭕' },
  { type: 'multiple-choice', label: '複数選択', icon: '☑️' },
  { type: 'email', label: 'メール', icon: '📧' },
  { type: 'number', label: '数値', icon: '🔢' },
  { type: 'cta-button', label: 'CTAボタン', icon: '🔘' },
]

type AddQuestionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (question: TQuestion) => void
}

export function AddQuestionDialog({
  open,
  onOpenChange,
  onAdd,
}: AddQuestionDialogProps) {
  const [step, setStep] = useState<'select-type' | 'configure'>('select-type')
  const [selectedType, setSelectedType] = useState<QuestionType>('short-text')
  const [title, setTitle] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])

  const handleTypeSelect = (type: QuestionType) => {
    setSelectedType(type)
    setStep('configure')
  }

  const handleBack = () => {
    setStep('select-type')
    setTitle('')
    setOptions(['', ''])
  }

  const handleAdd = () => {
    let questionType: 'text' | 'select' | 'cta_button' = 'text'
    let questionSubType: string | undefined

    // Map question types to schema
    if (selectedType === 'short-text') {
      questionType = 'text'
      questionSubType = 'free text'
    } else if (selectedType === 'long-text') {
      questionType = 'text'
      questionSubType = 'free text'
    } else if (selectedType === 'email') {
      questionType = 'text'
      questionSubType = 'email'
    } else if (selectedType === 'number') {
      questionType = 'text'
      questionSubType = 'number'
    } else if (selectedType === 'single-choice') {
      questionType = 'select'
      questionSubType = 'single'
    } else if (selectedType === 'multiple-choice') {
      questionType = 'select'
      questionSubType = 'multiple'
    } else if (selectedType === 'cta-button') {
      questionType = 'cta_button'
    }

    // タイトルが空の場合はデフォルト値を設定
    const questionTitle = title.trim() || '無題の質問'

    // Create the question based on type
    let question: TQuestion

    if (questionType === 'cta_button') {
      // For CTA button questions
      question = {
        title: questionTitle,
        type: questionType,
        buttonText: '次へ',
        actionType: 'next_step',
        logic: [],
        position: { x: 0, y: 0 },
      } as TQuestion
    } else if (questionType === 'select') {
      // For select questions, include options
      const filteredOptions = options.filter((opt) => opt.trim() !== '')
      question = {
        title: questionTitle,
        type: questionType,
        subType: questionSubType,
        logic: [],
        position: { x: 0, y: 0 },
        options:
          filteredOptions.length > 0
            ? filteredOptions
            : ['選択肢 1', '選択肢 2'],
      } as TQuestion
    } else {
      // For text questions, no options
      question = {
        title: questionTitle,
        type: questionType,
        subType: questionSubType,
        logic: [],
        position: { x: 0, y: 0 },
      } as TQuestion
    }

    onAdd(question)
    handleClose()
  }

  const handleClose = () => {
    onOpenChange(false)
    setStep('select-type')
    setTitle('')
    setOptions(['', ''])
  }

  const addOption = () => {
    setOptions([...options, ''])
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'select-type' ? (
          <>
            <DialogHeader>
              <DialogTitle>質問タイプを選択</DialogTitle>
              <DialogDescription>
                追加したい質問のタイプを選んでください
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              {questionTypes.map(({ type, label, icon }) => (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-accent hover:border-primary transition-colors"
                >
                  <span className="text-3xl">{icon}</span>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>質問を設定</DialogTitle>
              <DialogDescription>
                質問の詳細を入力してください
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">
                  質問文
                </Label>
                <Input
                  id="title"
                  placeholder="質問を入力してください"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background text-foreground"
                />
              </div>

              {(selectedType === 'single-choice' ||
                selectedType === 'multiple-choice') && (
                <div className="space-y-2">
                  <Label className="text-foreground">選択肢</Label>
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`選択肢 ${index + 1}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="bg-background text-foreground"
                      />
                      {options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                          className="text-foreground hover:text-destructive"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="w-full text-foreground"
                  >
                    選択肢を追加
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                戻る
              </Button>
              <Button onClick={handleAdd}>追加</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

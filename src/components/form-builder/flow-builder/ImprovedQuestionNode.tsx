'use client'

import {
  Badge,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui'
import {
  CheckCircle2,
  Copy,
  MessageSquare,
  MoreVertical,
  Play,
  Plus,
  Settings2,
  Split,
  Trash,
  Video,
} from 'lucide-react'
import { memo, useState } from 'react'
import { Handle, Position, useReactFlow } from 'reactflow'
import type { TLogic, TQuestion } from '~/types/question.types'
import { EQuestionType } from '~/types/question.types'
import { api } from '~/utils/api'
import { checkQuestionProgress } from '~/utils/questionProgress'
import { EditableQuestionDialog } from '../editable-question-modal'
import { VideoUploadDialog } from './VideoUploadDialog'
import { AdvancedEditorDialog } from './advanced-editor-dialog'
import { EditQuestion as EditNode } from './edit-question'
import { handleStyleLeft, handleStyleRight } from './utils'

type QuestionNodeProps = {
  data: {
    question: TQuestion
    label: string
    formId: string
    refreshFormData: () => void
    allQuestions?: TQuestion[]
  }
}

const ImprovedQuestionNode = ({ data }: QuestionNodeProps) => {
  const { question, label } = data

  const reactFlowInstance = useReactFlow()
  const questionNode = reactFlowInstance.getNode(question.id!)

  const edges = reactFlowInstance.getEdges()
  const hasIncomingEdge = edges.some((edge) => edge.target === question.id)

  // Get the number of outgoing connections
  const outgoingEdges = edges.filter((edge) => edge.source === question.id)
  const hasLogic = (question.logic?.length ?? 0) > 0

  // 進捗状態をチェック
  const progress = checkQuestionProgress(question)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editQuestionNodeOpen, setEditQuestionNodeOpen] = useState(false)
  const [editQuestionNodeMode, setEditQuestionNodeMode] = useState<
    'video' | 'logic' | 'answer'
  >('video')
  const [toolBarOpen, setToolBarOpen] = useState(false)
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)
  const [advancedEditorOpen, setAdvancedEditorOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const { mutateAsync: editQuestion } = api.form.editQuestion.useMutation()
  const { mutateAsync: deleteQuestion } = api.form.deleteQuestion.useMutation()
  const { mutateAsync: duplicateQuestion } =
    api.form.duplicateQuestion.useMutation()

  const onDuplicate = async () => {
    await duplicateQuestion({
      formId: data.formId,
      questionId: question.id!,
    })
    data.refreshFormData()
  }

  const onDelete = async () => {
    await deleteQuestion({
      formId: data.formId,
      questionId: question.id!,
    })
    data.refreshFormData()
  }

  const onEdit = async (values: Partial<TQuestion> | TQuestion) => {
    const updatedQuestion = {
      ...question,
      ...values,
      id: question.id!,
    } as TQuestion & { id: string }

    await editQuestion({
      formId: data.formId,
      question: updatedQuestion,
    })
    data.refreshFormData()
    setEditDialogOpen(false)
  }

  const onVideoUploaded = async (videoId: string, videoUrl: string) => {
    if (!question.id) return

    await editQuestion({
      formId: data.formId,
      question: {
        ...question,
        id: question.id,
        videoId,
        videoUrl,
      },
    })
    data.refreshFormData()
  }

  const onUpdateLogic = async (values: TLogic[]) => {
    const updatedQuestion = {
      ...questionNode!.data.question,
      logic: values,
    }

    await editQuestion({
      formId: data.formId,
      question: updatedQuestion,
    }).then(() => {
      data.refreshFormData()
    })
  }

  // Extract step number from label (e.g., "1. Welcome" -> "1")
  const stepNumber = label.split('.')[0]
  const stepTitle = label.split('.').slice(1).join('.').trim() || question.title

  return (
    <div
      className={`relative group ${hasIncomingEdge ? '' : 'opacity-50'}`}
      onMouseEnter={() => {
        setToolBarOpen(true)
        setIsHovered(true)
      }}
      onMouseLeave={() => {
        setToolBarOpen(false)
        setIsHovered(false)
      }}
    >
      {/* Hover Toolbar */}
      <div className={`absolute -top-20 left-1/2 -translate-x-1/2 z-50`}>
        <div
          className={`flex gap-1 bg-white rounded-lg shadow-xl border items-stretch overflow-hidden transition-all duration-200 ${
            toolBarOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2 hover:bg-gray-100 text-gray-700"
            onClick={() => setVideoDialogOpen(true)}
          >
            <Video size={20} />
            <span className="text-xs text-gray-700">動画</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2 hover:bg-gray-100 text-gray-700"
            onClick={() => setEditDialogOpen(true)}
          >
            <MessageSquare size={20} />
            <span className="text-xs text-gray-700">回答</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2 hover:bg-gray-100 text-gray-700"
            onClick={() => setEditQuestionNodeOpen(true)}
          >
            <Split size={20} />
            <span className="text-xs text-gray-700">ロジック</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2 hover:bg-gray-100 text-gray-700"
            onClick={() => setAdvancedEditorOpen(true)}
          >
            <Settings2 size={20} />
            <span className="text-xs text-gray-700">調整</span>
          </Button>

          <div className="border-l">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-full px-2 rounded-none"
                >
                  <MoreVertical size={20} className="text-gray-700" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="center" side="right" className="w-36 p-2">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={onDuplicate}
                  >
                    <Copy size={16} className="mr-2" />
                    複製
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={onDelete}
                  >
                    <Trash size={16} className="mr-2" />
                    削除
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Main Node Card - Simple Layout like image26 */}
      <div
        className={`
          relative bg-white rounded-2xl border-4
          w-[400px] shadow-lg overflow-hidden
          transition-all duration-200
          ${
            progress.isComplete
              ? isHovered
                ? 'border-green-500 shadow-2xl'
                : 'border-green-400'
              : isHovered
                ? 'border-purple-500 shadow-2xl'
                : 'border-purple-400'
          }
          ${!hasIncomingEdge ? 'opacity-50' : ''}
        `}
      >
        {/* Title Bar */}
        <div
          className={`px-4 py-3 border-b-2 ${
            progress.isComplete
              ? 'bg-green-50 border-green-200'
              : 'bg-gray-100 border-gray-200'
          } flex items-center justify-between gap-2`}
        >
          <h3 className="font-bold text-gray-900 text-lg flex-1">{label}</h3>
          {progress.isComplete ? (
            <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
          ) : (
            <div className="flex-shrink-0 text-sm font-semibold text-purple-600">
              {progress.completionPercentage}%
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex p-4 gap-4">
          {/* Left: Video Thumbnail */}
          <div
            className="relative w-48 h-48 bg-black rounded-lg overflow-hidden cursor-pointer flex-shrink-0"
            onClick={() => setVideoDialogOpen(true)}
          >
            {question.videoUrl ? (
              <video
                src={question.videoUrl}
                className="w-full h-full object-cover"
                muted
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <Play size={48} />
              </div>
            )}
          </div>

          {/* Right: Options List */}
          <div className="flex-1 flex flex-col justify-center gap-3">
            {question.type === EQuestionType.Select &&
            question.options.length > 0 ? (
              (question.options as string[])
                .slice(0, 3)
                .map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0" />
                    <div className="flex-1 h-8 bg-gray-200 rounded-lg flex items-center px-3 text-sm text-gray-700">
                      {option}
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-sm text-gray-400 text-center">
                選択肢なし
              </div>
            )}
          </div>
        </div>

        {/* Connection Handles */}
        <Handle
          type="target"
          position={Position.Left}
          style={{
            ...handleStyleLeft,
            width: 12,
            height: 12,
            left: -6,
            top: '50%',
            background: isHovered ? '#9333ea' : '#6b7280',
            border: '2px solid white',
          }}
        />

        <Handle
          type="source"
          position={Position.Right}
          style={{
            ...handleStyleRight,
            width: 12,
            height: 12,
            right: -6,
            top: '50%',
            background: isHovered ? '#9333ea' : '#6b7280',
            border: '2px solid white',
          }}
        />
      </div>

      {/* Dialogs */}
      <EditableQuestionDialog
        {...question}
        isOpen={editDialogOpen}
        setIsOpen={setEditDialogOpen}
        editQuestion={onEdit}
      />
      <VideoUploadDialog
        isOpen={videoDialogOpen}
        setIsOpen={setVideoDialogOpen}
        onVideoUploaded={onVideoUploaded}
        existingVideoUrl={question.videoUrl}
        existingVideoId={question.videoId}
      />
      <AdvancedEditorDialog
        isOpen={advancedEditorOpen}
        setIsOpen={setAdvancedEditorOpen}
        question={question}
        onSave={onEdit}
        allQuestions={data.allQuestions}
      />
      {questionNode && (
        <EditNode
          isOpen={editQuestionNodeOpen}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onClose={() => setEditQuestionNodeOpen(false)}
          editingNode={questionNode}
          onUpdateLogic={onUpdateLogic}
          defaultMode={editQuestionNodeMode}
        />
      )}
    </div>
  )
}

export default memo(ImprovedQuestionNode)

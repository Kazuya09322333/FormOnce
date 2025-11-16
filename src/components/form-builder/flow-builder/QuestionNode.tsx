import {
  CheckCircle2,
  Circle,
  MessageSquare,
  MoreVertical,
  MousePointerClick,
  Play,
  Settings2,
  Split,
  Video,
} from 'lucide-react'
import { memo, useState } from 'react'
import { Handle, Position, useReactFlow } from 'reactflow'
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui'
import { EQuestionType, TLogic, TQuestion } from '~/types/question.types'
import { api } from '~/utils/api'
import { checkQuestionProgress } from '~/utils/questionProgress'
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
  }
}

const QuestionNode = ({ data }: QuestionNodeProps) => {
  const { question, label } = data

  const reactFlowInstance = useReactFlow()
  const questionNode = reactFlowInstance.getNode(question.id!)

  // TODO: see if there is better way to do this
  const edges = reactFlowInstance.getEdges()
  const hasIncomingEdge = edges.some((edge) => edge.target === question.id)

  // 進捗状態をチェック
  const progress = checkQuestionProgress(question)

  const [editQuestionNodeOpen, setEditQuestionNodeOpen] = useState(false)
  const [editQuestionNodeMode, setEditQuestionNodeMode] = useState<
    'video' | 'logic' | 'answer'
  >('video')

  const [toolBarOpen, setToolBarOpen] = useState(false)

  const [videoDialogOpen, setVideoDialogOpen] = useState(false)
  const [advancedEditorOpen, setAdvancedEditorOpen] = useState(false)

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

  const onEdit = async (values: Partial<TQuestion>) => {
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
  }

  const openVideoDialog = () => {
    setVideoDialogOpen(true)
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

  const onCloseEditQuestionNode = () => {
    if (!questionNode) return

    // zoom out
    reactFlowInstance.fitView({
      nodes: [questionNode],
      padding: 150,
      duration: 500,
      minZoom: 0.7,
    })
    setEditQuestionNodeOpen(false)
  }

  const onEditQuestionNode = (mode: 'video' | 'logic' | 'answer') => {
    if (!questionNode) return

    // Fit view to source node
    reactFlowInstance.fitView({
      nodes: [questionNode],
      padding: 150,
      duration: 500,
      minZoom: 1,
    })

    setToolBarOpen(false)

    setEditQuestionNodeMode(mode)
    setEditQuestionNodeOpen(true)
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

  return (
    <div
      className={`relative group ${hasIncomingEdge ? '' : 'opacity-50'}`}
      onMouseEnter={() => setToolBarOpen(true)}
      onMouseLeave={() => setToolBarOpen(false)}
    >
      <div className={`absolute -top-32 left-1/2 -translate-x-1/2`}>
        <ToolBar
          open={toolBarOpen}
          onVideoClick={() => onEditQuestionNode('video')}
          onAnswerClick={() => onEditQuestionNode('answer')}
          onLogicClick={() => onEditQuestionNode('logic')}
          onAdvancedClick={() => setAdvancedEditorOpen(true)}
          onDelete={onDelete}
          onDuplciate={onDuplicate}
        />
      </div>
      <div
        className={`flex flex-col border-2 ${
          progress.isComplete
            ? 'border-green-600 group-hover:border-green-500'
            : 'border-violet-800 group-hover:border-violet-500'
        } [&>div:first-child]:hover:border-violet-500 rounded-lg bg-primary-foreground w-48 h-64 group-hover:scale-105 transition-all duration-200 ${
          toolBarOpen ? 'scale-105 border-violet-500' : ''
        }`}
      >
        <div
          className={`px-4 py-2 bg-primary-foreground rounded-t-lg border-b-2 ${
            progress.isComplete ? 'border-green-600' : 'border-violet-800'
          } flex items-center justify-between gap-2`}
        >
          <p className="overflow-hidden text-ellipsis whitespace-nowrap flex-1">
            {label}
          </p>
          {progress.isComplete ? (
            <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
          ) : (
            <div className="flex-shrink-0 text-xs text-muted-foreground">
              {progress.completionPercentage}%
            </div>
          )}
        </div>
        <div className="flex h-full rounded-b-lg">
          <div
            className="w-1/2 h-full rounded-bl-lg bg-black opacity-50 hover:opacity-100 flex justify-center items-center border-r border-violet-500 [&>*:first-child]:hover:bg-violet-800 [&>*:first-child]:hover:text-white [&>*:first-child]:hover:h-10 [&>*:first-child]:hover:w-10 relative"
            onClick={openVideoDialog}
          >
            {question.videoId ? (
              <div className="absolute inset-0 flex items-center justify-center bg-green-900 bg-opacity-70">
                <Video size={32} className="text-green-300" />
              </div>
            ) : null}
            <Button
              variant={'secondary'}
              size={'icon'}
              className="rounded-full p-2 hover:w-10 hover:h-10 hover:bg-violet-800 hover:text-white"
            >
              <Play size={32} className="text-violet-300 ml-0.5" />
            </Button>
          </div>
          <div className="w-1/2 h-full flex flex-col justify-center items-center gap-2 p-2 overflow-y-auto">
            {question.type === EQuestionType.Select &&
            question.options &&
            (question.options as string[]).length > 0 ? (
              (question.options as string[]).map((option, index) => (
                <div
                  key={index}
                  className="w-full px-3 py-1.5 bg-violet-100 hover:bg-violet-200 text-violet-900 rounded-md text-xs text-center cursor-pointer transition-colors truncate"
                  title={option}
                >
                  {option}
                </div>
              ))
            ) : question.type === EQuestionType.CTAButton ? (
              <div className="flex flex-col items-center justify-center gap-2 text-violet-600">
                <MousePointerClick size={32} />
                <div className="text-xs text-center font-medium">CTAボタン</div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground text-center px-2">
                {question.type === EQuestionType.Select ? '選択肢なし' : ''}
              </div>
            )}
          </div>
        </div>
        <Handle
          type="source"
          position={Position.Right}
          style={handleStyleRight}
        />
        <Handle
          type="target"
          position={Position.Left}
          style={handleStyleLeft}
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
        />
      </div>
      {questionNode && (
        <EditNode
          isOpen={editQuestionNodeOpen}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onClose={onCloseEditQuestionNode}
          editingNode={questionNode}
          onUpdateLogic={onUpdateLogic}
          defaultMode={editQuestionNodeMode}
        />
      )}
    </div>
  )
}

export default memo(QuestionNode)

type ToolBarProps = {
  open: boolean
  onVideoClick: () => void
  onAnswerClick: () => void
  onLogicClick: () => void
  onAdvancedClick: () => void

  // NOTE: these will be used in future for hover effects
  // onLogicHoverStart: () => void
  // onLogicHoverStop: () => void
  // onAnswerHoverStart: () => void
  // onAnswerHoverStop: () => void
  // onVideoHoverStart: () => void
  // onVideoHoverStop: () => void

  onDelete: () => Promise<void>
  onDuplciate: () => Promise<void>
}

const ToolBar = ({
  open,
  onVideoClick,
  onAnswerClick,
  onLogicClick,
  onAdvancedClick,
  onDelete,
  onDuplciate,
  // onAnswerHoverStart,
  // onAnswerHoverStop,
  // onLogicHoverStart,
  // onLogicHoverStop,
  // onVideoHoverStart,
  // onVideoHoverStop
}: ToolBarProps) => {
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [isDuplicateLoading, setIsDuplicateLoading] = useState(false)

  const handleDelete = async () => {
    setIsDeleteLoading(true)
    await onDelete()
    setIsDeleteLoading(false)
  }

  const handleDuplicate = async () => {
    setIsDuplicateLoading(true)
    await onDuplciate()
    setIsDuplicateLoading(false)
  }

  return (
    <div
      className="flex gap-1 bg-primary-foreground rounded-lg items-stretch overflow-hidden transition-opacity duration-200"
      style={{
        opacity: open ? 1 : 0,
      }}
    >
      <div className="flex">
        <Button
          variant={'ghost'}
          size={'lg'}
          className="h-full flex flex-col items-center gap-2 w-fit rounded-none"
          onClick={onVideoClick}
          // onMouseEnter={onVideoHoverStart}
          // onMouseLeave={onVideoHoverStop}
        >
          <Video size={32} fill="white" />
          動画
        </Button>
        <Button
          variant={'ghost'}
          size={'lg'}
          className="h-full flex flex-col items-center gap-2 w-fit rounded-none"
          onClick={onAnswerClick}
          // onMouseEnter={onAnswerHoverStart}
          // onMouseLeave={onAnswerHoverStop}
        >
          <MessageSquare size={32} />
          回答
        </Button>
        <Button
          variant={'ghost'}
          size={'lg'}
          className="h-full flex flex-col items-center gap-2 w-fit rounded-none"
          onClick={onLogicClick}
          // onMouseEnter={onLogicHoverStart}
          // onMouseLeave={onLogicHoverStop}
        >
          <Split size={32} />
          ロジック
        </Button>
        <Button
          variant={'ghost'}
          size={'lg'}
          className="h-full flex flex-col items-center gap-2 w-fit rounded-none"
          onClick={onAdvancedClick}
        >
          <Settings2 size={32} />
          調整
        </Button>
      </div>
      <div>
        <Popover>
          <PopoverTrigger className="h-full" asChild>
            <Button
              variant={'ghost'}
              className="h-full flex items-center justify-center border-l-2 rounded-none"
            >
              <MoreVertical size={32} className="text-gray-700" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="center"
            side="right"
            className={`p-0 w-36 -translate-x-2 shadow-2xl rounded-lg ${
              open ? '' : 'hidden'
            }`}
          >
            <div className="flex flex-col gap-1 bg-primary-foreground rounded-lg items-stretch overflow-hidden p-2">
              <Button
                variant={'ghost'}
                size={'sm'}
                onClick={handleDuplicate}
                loading={isDuplicateLoading}
                noChildOnLoading
              >
                複製
              </Button>
              <Button
                variant={'ghost'}
                size={'sm'}
                onClick={handleDelete}
                loading={isDeleteLoading}
                noChildOnLoading
                className="hover:text-red-500"
              >
                削除
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

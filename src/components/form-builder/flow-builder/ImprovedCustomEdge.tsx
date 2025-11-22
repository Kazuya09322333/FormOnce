'use client'

import {
  Badge,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/router'
import { memo, useState } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
  useReactFlow,
} from 'reactflow'
import {
  EQuestionType,
  ETextSubType,
  TLogic,
  TQuestion,
} from '~/types/question.types'
import { api } from '~/utils/api'
import { AdvancedEditorDialog } from './advanced-editor-dialog'
import { LogicBuilderDialog } from './logic-builder-dialog'

const ImprovedCustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) => {
  const router = useRouter()
  const reactFlowInstance = useReactFlow()

  const { mutateAsync: addQuestion } = api.form.addQuestion.useMutation()
  const { mutateAsync: createForm } = api.form.create.useMutation()

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const [advancedEditorOpen, setAdvancedEditorOpen] = useState(false)
  const [logicBuilderDialogOpen, setLogicBuilderDialogOpen] = useState(false)
  const [sourceLogic, setSourceLogic] = useState<TLogic | null>(null)
  const [newQuestion, setNewQuestion] = useState<TQuestion | null>(null)

  // Check if this edge represents a conditional branch
  const isConditional = data?.condition || data?.label

  const sourceNode = reactFlowInstance.getNode(
    reactFlowInstance.getEdge(id)?.source!,
  )

  const fitEdgeIntoView = () => {
    data?.setIsEdgeClickBlocked?.(true)
    const edge = reactFlowInstance.getEdge(id)

    const targetNode = edge?.target ? { id: edge.target } : null
    const sourceNode = edge?.source ? { id: edge.source } : null

    if (!targetNode || !sourceNode) return

    reactFlowInstance.fitView({
      nodes: [sourceNode, targetNode],
      padding: 100,
      duration: 500,
      minZoom: 0.7,
    })
  }

  const onAddNode = () => {
    fitEdgeIntoView()

    // Create a new question with default title
    const emptyQuestion: TQuestion = {
      title: '無題の質問',
      type: EQuestionType.Text,
      subType: ETextSubType.FreeText,
      logic: [],
      position: { x: 0, y: 0 },
    }

    setNewQuestion(emptyQuestion)

    if (sourceNode?.id === 'start') {
      setAdvancedEditorOpen(true)
      return
    }

    setLogicBuilderDialogOpen(true)
  }

  const onAddLogic = (values: TLogic) => {
    setSourceLogic(values)
    setAdvancedEditorOpen(true)
    setLogicBuilderDialogOpen(false)
    data?.setIsEdgeClickBlocked?.(true)
  }

  const onAddQuestion = async (values: TQuestion) => {
    if (!data) return

    const edge = reactFlowInstance.getEdge(id)
    const sourceNode = edge?.source
      ? reactFlowInstance.getNode(edge.source)
      : null

    const targetNode = edge?.target
      ? reactFlowInstance.getNode(edge.target)
      : null

    if (!targetNode || !sourceNode) return

    const targetNodeId = targetNode.id
    const sourceNodeIdxStr = sourceNode.data.label?.split('.')[0] ?? '0'
    const sourceNodeIdx = parseInt(sourceNodeIdxStr) || 0

    if (data.formId === 'new') {
      await createForm({
        name: 'New Form',
        questions: [values],
      }).then((res) => {
        void router.push(`/dashboard/forms/${res.id}`)
      })
      return
    }

    await addQuestion({
      formId: data.formId,
      question: values,
      targetIdx: sourceNodeIdx,
      targetQuestionId: targetNodeId,
      sourceLogic: sourceLogic ? sourceLogic : undefined,
    }).then(() => {
      void data.refreshFormData()
    })

    setSourceLogic(null)
    setAdvancedEditorOpen(false)
    setNewQuestion(null)
  }

  const blockEdgeClick = () => {
    data?.setIsEdgeClickBlocked?.(true)
  }

  const unblockEdgeClick = () => {
    if (logicBuilderDialogOpen || advancedEditorOpen) return
    data?.setIsEdgeClickBlocked?.(false)
  }

  const onSetLogicBuilderDialogOpen = (isOpen: boolean) => {
    setLogicBuilderDialogOpen(isOpen)
    if (!isOpen) {
      data?.setIsEdgeClickBlocked?.(false)
    }
  }

  const onSetAdvancedEditorOpen = (isOpen: boolean) => {
    setAdvancedEditorOpen(isOpen)
    if (!isOpen) {
      data?.setIsEdgeClickBlocked?.(false)
      setNewQuestion(null)
    }
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: '#9333ea',
          strokeWidth: 2,
          ...style,
        }}
      />
      <EdgeLabelRenderer>
        {/* Add Question Button */}
        <TooltipProvider>
          <Tooltip delayDuration={10}>
            <TooltipContent sideOffset={10}>
              <p className="text-sm p-1">質問を追加</p>
            </TooltipContent>
            <TooltipTrigger
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all',
                zIndex: 9999,
              }}
              onMouseEnter={blockEdgeClick}
              onMouseLeave={unblockEdgeClick}
            >
              <Button
                variant={'secondary'}
                size={'icon'}
                className="nodrag nopan rounded-full hover:ring-4 ring-purple-500 bg-white hover:bg-white p-1 w-8 h-8 shadow-lg border-2 border-purple-200"
                onClick={onAddNode}
                onMouseEnter={blockEdgeClick}
                onMouseLeave={unblockEdgeClick}
              >
                <Plus size={20} className="text-purple-600" />
              </Button>
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider>

        {/* Conditional Label */}
        {isConditional && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${
                labelY - 40
              }px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <Badge className="bg-purple-600 text-white shadow-md">
              {data.label || data.condition}
            </Badge>
          </div>
        )}
      </EdgeLabelRenderer>

      <LogicBuilderDialog
        open={logicBuilderDialogOpen}
        setIsOpen={onSetLogicBuilderDialogOpen}
        sourceQuestion={sourceNode?.data.question as TQuestion & { id: string }}
        onAddLogic={onAddLogic}
      />

      {newQuestion && (
        <AdvancedEditorDialog
          isOpen={advancedEditorOpen}
          setIsOpen={onSetAdvancedEditorOpen}
          question={newQuestion}
          onSave={onAddQuestion}
          allQuestions={data?.allQuestions}
        />
      )}
    </>
  )
}

export default memo(ImprovedCustomEdge)

import {
  Button,
  Icons,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@components/ui'
import { Copy, Trash, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Edge, Node, useReactFlow } from 'reactflow'
import {
  ELogicCondition,
  EQuestionType,
  TLogic,
  TQuestion,
} from '~/types/question.types'

const getConditionsfromLogic = (logics: TLogic[]) => {
  const conditions: TConditions = {}

  if (logics.length === 0) {
    return conditions
  }

  let optionCount = 0

  logics.forEach((logic) => {
    if (logic.value instanceof Array) {
      logic.value.forEach((option) => {
        conditions[String.fromCharCode(65 + optionCount++)] = {
          option,
          skipTo: logic.skipTo,
          condition: logic.condition,
        }
      })
    } else {
      conditions[logic.value] = {
        option: logic.value,
        skipTo: logic.skipTo,
        condition: logic.condition,
      }
    }
  })

  return conditions
}

const getLogicFromConditions = (conditions: TConditions): TLogic[] => {
  const logics: TLogic[] = []
  const logicMap = new Map<string, TLogic>()

  Object.entries(conditions).forEach(([key, condition]) => {
    const existingLogic = logicMap.get(condition.skipTo)

    if (existingLogic && existingLogic.condition === condition.condition) {
      if (Array.isArray(existingLogic.value)) {
        ;(existingLogic.value as string[]).push(condition.option)
      } else {
        existingLogic.value = [existingLogic.value as string, condition.option]
      }
    } else {
      const newLogic: TLogic = {
        questionId: '', // This needs to be set externally as it's not part of the conditions
        condition: condition.condition,
        value: condition.option,
        skipTo: condition.skipTo,
      }
      logics.push(newLogic)
      logicMap.set(condition.skipTo, newLogic)
    }
  })

  return logics
}

export type EditQuestionProps = {
  isOpen: boolean
  onEdit: (values: Partial<TQuestion>) => Promise<void>
  onDelete: () => Promise<void>
  onDuplicate: () => Promise<void>
  onClose: () => void
  editingNode: Node | null
  onUpdateLogic: (logics: TLogic[]) => Promise<void>
  defaultMode?: 'video' | 'logic' | 'answer'
}

type TConditions = {
  [key: string]: {
    option: string
    skipTo: string
    condition: TLogic['condition']
  }
}

export const EditQuestion = ({
  isOpen,
  onClose,
  editingNode,
  onEdit,
  onUpdateLogic,
  onDelete,
  onDuplicate,
  defaultMode,
}: EditQuestionProps) => {
  const reactFlowInstance = useReactFlow()

  //   Condtions are logic conditions that are used to determine the next step in the flow depending on the answer to a question.
  const [conditions, setConditions] = useState<TConditions | null>(null)

  // メモリに保存する一時的なデータ
  const [tempVideoUrl, setTempVideoUrl] = useState<string>('')
  const [tempQuestionData, setTempQuestionData] = useState<Partial<TQuestion>>(
    {},
  )
  const [tempOptions, setTempOptions] = useState<string[]>([])

  const [isSaveLoading, setIsSaveLoading] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [isDuplicateLoading, setIsDuplicateLoading] = useState(false)

  useEffect(() => {
    if (!editingNode) return
    const logics = editingNode.data.question.logic ?? []
    const updateConditions = getConditionsfromLogic(logics)
    setConditions(updateConditions)

    // 既存のデータをメモリに読み込む
    setTempVideoUrl(editingNode.data.question.videoUrl || '')
    setTempQuestionData({
      title: editingNode.data.question.title,
      description: editingNode.data.question.description,
      placeholder: editingNode.data.question.placeholder,
    })
    // 選択肢がある場合は読み込む
    if (editingNode.data.question.type === EQuestionType.Select) {
      setTempOptions(editingNode.data.question.options)
    } else {
      setTempOptions([])
    }
  }, [editingNode])

  if (!editingNode) {
    return null
  }

  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose()
      setConditions({})
      setTempVideoUrl('')
      setTempQuestionData({})
      setTempOptions([])
    }
  }

  const getConditionLabel = (condition: TLogic['condition'] | undefined) => {
    switch (condition) {
      case 'always':
        return 'Always'
      default:
        return 'If'
    }
  }

  const getNodeLabelFromId = (id: string) => {
    const node = reactFlowInstance.getNode(id)
    if (!node) return ['', '']

    const labelA = node.data.label.split('.')[0]

    if (labelA === 'End') return ['End' + ' 👋', '']
    return [labelA, node.data.label.split('.')[1]]
  }

  // 全てのタブのデータを保存する関数
  const saveAll = async () => {
    if (!editingNode || !conditions) return
    setIsSaveLoading(true)

    try {
      // 1. ロジックを保存
      const logics = getLogicFromConditions(conditions)
      await onUpdateLogic(logics)

      // 2. 質問データと動画URLを保存
      const updatedData: any = {}

      if (
        tempQuestionData.title !== undefined &&
        tempQuestionData.title !== editingNode.data.question.title
      ) {
        updatedData.title = tempQuestionData.title
      }
      if (
        tempQuestionData.description !== undefined &&
        tempQuestionData.description !== editingNode.data.question.description
      ) {
        updatedData.description = tempQuestionData.description
      }
      if (
        tempQuestionData.placeholder !== undefined &&
        tempQuestionData.placeholder !== editingNode.data.question.placeholder
      ) {
        updatedData.placeholder = tempQuestionData.placeholder
      }
      if (tempVideoUrl !== editingNode.data.question.videoUrl) {
        updatedData.videoUrl = tempVideoUrl
      }
      // 選択式質問の場合は選択肢も保存
      if (
        editingNode.data.question.type === EQuestionType.Select &&
        tempOptions.length > 0
      ) {
        const currentOptions = editingNode.data.question.options
        const optionsChanged =
          JSON.stringify(tempOptions) !== JSON.stringify(currentOptions)
        if (optionsChanged) {
          updatedData.options = tempOptions
        }
      }

      // 変更があれば保存
      if (Object.keys(updatedData).length > 0) {
        await onEdit({
          ...updatedData,
          id: editingNode.data.question.id,
        })
      }

      setIsSaveLoading(false)
      onOpenChange(false)
    } catch (error) {
      console.error('保存エラー:', error)
      setIsSaveLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!editingNode) return
    setIsDeleteLoading(true)
    await onDelete()
    setIsDeleteLoading(false)
    onClose()
  }

  const handleDuplicate = async () => {
    if (!editingNode) return
    setIsDeleteLoading(true)
    await onDuplicate()
    setIsDeleteLoading(false)
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="sm:max-w-[500px] sm:w-[450px] flex flex-col"
      >
        <SheetHeader>
          <SheetTitle>
            <div className="flex justify-between w-full gap-2">
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                {editingNode?.data.label}
              </div>
              <div className="flex gap-0">
                <Button
                  variant={'ghost'}
                  size={'sm'}
                  loading={isDuplicateLoading}
                  noChildOnLoading
                  onClick={handleDuplicate}
                >
                  <Copy className="h-4 w-4 hover:scale-105" />
                </Button>

                <Button
                  variant={'ghost'}
                  size={'sm'}
                  className="hover:bg-destructive hover:text-destructive-foreground shadow-sm"
                  loading={isDeleteLoading}
                  noChildOnLoading
                  onClick={handleDelete}
                >
                  <Trash className="h-4 w-4 hover:scale-105" />
                </Button>
                <SheetClose>
                  <Button variant={'ghost'} size={'sm'}>
                    <X className="h-6 w-5 hover:scale-105" />
                  </Button>
                </SheetClose>
              </div>
            </div>
          </SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <div className="h-full">
          <Tabs defaultValue={defaultMode ?? 'logic'}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="video">動画</TabsTrigger>
              <TabsTrigger value="answer">答える</TabsTrigger>
              <TabsTrigger value="logic">論理</TabsTrigger>
            </TabsList>
            <TabsContent value="video" className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">動画URL</label>
                <Input
                  type="url"
                  value={tempVideoUrl}
                  onChange={(e) => setTempVideoUrl(e.target.value)}
                  placeholder="動画のURLを入力してください"
                />
                {tempVideoUrl && (
                  <p className="text-xs text-muted-foreground">
                    ✓ 動画URLが保存されています（「完成です」で確定）
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent
              value="answer"
              className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">質問タイトル</label>
                  <Input
                    type="text"
                    value={tempQuestionData.title || ''}
                    onChange={(e) =>
                      setTempQuestionData({
                        ...tempQuestionData,
                        title: e.target.value,
                      })
                    }
                    placeholder="質問のタイトルを入力"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">質問の説明</label>
                  <Input
                    type="text"
                    value={tempQuestionData.description || ''}
                    onChange={(e) =>
                      setTempQuestionData({
                        ...tempQuestionData,
                        description: e.target.value,
                      })
                    }
                    placeholder="質問の説明を入力"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    プレースホルダー
                  </label>
                  <Input
                    type="text"
                    value={tempQuestionData.placeholder || ''}
                    onChange={(e) =>
                      setTempQuestionData({
                        ...tempQuestionData,
                        placeholder: e.target.value,
                      })
                    }
                    placeholder="入力欄のヒントテキスト"
                  />
                </div>

                {(tempQuestionData.title ||
                  tempQuestionData.description ||
                  tempQuestionData.placeholder) && (
                  <p className="text-xs text-muted-foreground">
                    ✓ 質問データが保存されています（「完成です」で確定）
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent
              value="logic"
              className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto"
            >
              {editingNode.data.question.type === EQuestionType.Select &&
              tempOptions.length > 0 ? (
                <>
                  <p className="text-xs text-muted-foreground mb-2">
                    各選択肢をクリックして次の質問を設定してください
                  </p>
                  {tempOptions.map((option, index) => {
                    const optionKey = String.fromCharCode(65 + index)
                    const condition = conditions?.[optionKey]
                    return (
                      <Popover key={index}>
                        <PopoverTrigger asChild>
                          <div className="flex justify-between items-center border py-2 px-4 rounded-md cursor-pointer hover:bg-primary-foreground hover:border-violet-600">
                            <div className="flex gap-4 items-center text-sm">
                              <div className="border py-1.5 px-2 rounded-md overflow-hidden text-ellipsis whitespace-nowrap">
                                <span className="bg-violet-600 text-primary p-0.5 px-2 rounded-sm">
                                  {optionKey}
                                </span>
                                <span className="ml-2 text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                                  {option}
                                </span>
                              </div>
                              <span>→</span>
                            </div>
                            <span className="overflow-hidden text-ellipsis whitespace-nowrap bg-violet-600 text-sm p-0.5 px-2 rounded-full">
                              {condition
                                ? getNodeLabelFromId(condition.skipTo)[0]
                                : '未設定'}
                            </span>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="flex flex-col gap-2">
                          <p className="text-xs text-secondary-foreground opacity-75">
                            遷移先を選択...
                          </p>
                          <div>
                            {reactFlowInstance.getNodes().map((node) => {
                              if (
                                node.id === editingNode.id ||
                                node.id === 'start'
                              )
                                return null

                              const [id, label] = getNodeLabelFromId(node.id)
                              return (
                                <div
                                  key={node.id}
                                  className={`flex items-center gap-2 border border-black py-2 px-4 rounded-md cursor-pointer text-sm hover:bg-primary-foreground hover:border-violet-600 ${
                                    node.id === condition?.skipTo &&
                                    '!border-violet-600 text-primary'
                                  }`}
                                  onClick={() => {
                                    const updatedConditions = {
                                      ...conditions,
                                      [optionKey]: {
                                        option,
                                        skipTo: node.id,
                                        condition: ELogicCondition.IS,
                                      },
                                    }
                                    setConditions(updatedConditions)
                                  }}
                                >
                                  <span className="bg-violet-600 text-primary p-0.5 px-2 rounded-sm">
                                    {id}
                                  </span>
                                  <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                                    {label}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )
                  })}
                </>
              ) : conditions && Object.entries(conditions).length > 0 ? (
                Object.entries(conditions).map(([key, condition]) => (
                  <Popover key={key}>
                    <PopoverTrigger asChild>
                      <div className="flex justify-between items-center border py-2 px-4 rounded-md cursor-pointer hover:bg-primary-foreground hover:border-violet-600">
                        <div className="flex gap-4 items-center text-sm">
                          <span>{getConditionLabel(condition.condition)}</span>
                          {condition.condition !== ELogicCondition.ALWAYS && (
                            <div className="border py-1.5 px-2 rounded-md overflow-hidden text-ellipsis whitespace-nowrap">
                              <span className="bg-violet-600 text-primary p-0.5 px-2 rounded-sm">
                                {key}
                              </span>
                              <span className="ml-2 text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                                {condition.option}
                              </span>
                            </div>
                          )}
                          <span>→</span>
                        </div>
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap bg-violet-600 text-sm p-0.5 px-2 rounded-full">
                          {getNodeLabelFromId(condition.skipTo)[0]}
                        </span>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="flex flex-col gap-2">
                      <p className="text-xs text-secondary-foreground opacity-75">
                        遷移先を選択...
                      </p>
                      <div>
                        {/* all nodes but the current one and start node*/}
                        {reactFlowInstance.getNodes().map((node) => {
                          if (node.id === editingNode.id || node.id === 'start')
                            return null

                          const [id, label] = getNodeLabelFromId(node.id)
                          return (
                            <div
                              key={node.id}
                              className={`flex items-center gap-2 border border-black py-2 px-4 rounded-md cursor-pointer text-sm hover:bg-primary-foreground hover:border-violet-600 ${
                                node.id === condition.skipTo &&
                                '!border-violet-600 text-primary'
                              }`}
                              onClick={() => {
                                const updatedConditions = {
                                  ...conditions,
                                  [key]: {
                                    ...condition,
                                    skipTo: node.id,
                                  },
                                }
                                setConditions(updatedConditions)
                              }}
                            >
                              <span className="bg-violet-600 text-primary p-0.5 px-2 rounded-sm">
                                {id}
                              </span>
                              <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                                {label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  {editingNode.data.question.type === EQuestionType.Select
                    ? '「答える」タブで選択肢を追加してください'
                    : '論理条件が設定されていません'}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        <SheetFooter>
          <Button
            onClick={saveAll}
            size={'lg'}
            className="w-full text-base"
            loading={isSaveLoading}
          >
            完成です 👍
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

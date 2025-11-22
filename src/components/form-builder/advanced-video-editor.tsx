'use client'

import {
  Badge,
  Button,
  Card,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@components/ui'
import {
  Plus,
  Trash2,
  Upload,
} from 'lucide-react'
import React, { useState } from 'react'
import type { TFormSchema } from '~/types/form.types'
import type { TQuestion } from '~/types/question.types'
import {
  ECTAActionType,
  ELogicCondition,
  EQuestionType,
  ESelectSubType,
  ETextSubType,
} from '~/types/question.types'
import { Preview } from './preview'
import { VideoUploadDialog } from './flow-builder/VideoUploadDialog'

type AdvancedVideoEditorProps = {
  question: TQuestion
  onSave: (question: TQuestion) => void
  onCancel: () => void
  allQuestions?: TQuestion[]
}

export const AdvancedVideoEditor = ({
  question,
  onSave,
  onCancel,
  allQuestions = [],
}: AdvancedVideoEditorProps) => {
  const [activeTab, setActiveTab] = useState('video')
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)

  // Question state
  const [questionData, setQuestionData] = useState<TQuestion>(question)

  const addOption = () => {
    if (questionData.type === EQuestionType.Select) {
      const newOptions = [...(questionData.options || []), '新しい選択肢']
      setQuestionData({ ...questionData, options: newOptions })
    }
  }

  const updateOption = (index: number, value: string) => {
    if (questionData.type === EQuestionType.Select) {
      const newOptions = [...(questionData.options || [])]
      newOptions[index] = value
      setQuestionData({ ...questionData, options: newOptions })
    }
  }

  const removeOption = (index: number) => {
    if (questionData.type === EQuestionType.Select) {
      const newOptions =
        questionData.options?.filter((_, i) => i !== index) || []
      setQuestionData({ ...questionData, options: newOptions })
    }
  }

  const onVideoUploaded = (videoId: string, videoUrl: string) => {
    setQuestionData({
      ...questionData,
      videoId,
      videoUrl,
    })
  }

  // Generate formSchema from question
  const generateFormSchema = (question: TQuestion): TFormSchema => {
    if (!question.id) {
      return {
        type: 'object',
        properties: {},
        required: [],
      }
    }

    const properties: Record<string, unknown> = {}

    if (question.type === EQuestionType.Text) {
      properties[question.id] = {
        type: 'string',
        minLength: question.validation?.required ? 1 : 0,
      }
    } else if (question.type === EQuestionType.Select) {
      if (question.selectSubType === ESelectSubType.Multiple) {
        properties[question.id] = {
          type: 'array',
          items: { type: 'string' },
          minItems: question.validation?.required ? 1 : 0,
        }
      } else {
        properties[question.id] = {
          type: 'string',
          enum: question.options || [],
          minLength: question.validation?.required ? 1 : 0,
        }
      }
    }

    return {
      type: 'object',
      properties,
      required: question.validation?.required ? [question.id] : [],
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left: Live Preview with VideoAskRenderer */}
      <div className="w-2/3 bg-black relative">
        <Preview
          key={JSON.stringify(questionData)}
          formSchema={generateFormSchema(questionData)}
          questions={[questionData]}
          embedded={true}
        />

        {/* Upload Button Overlay */}
        <Button
          size="sm"
          variant="outline"
          className="absolute top-20 right-4 z-[70] text-white bg-black/50 hover:bg-black/70 border-white/20"
          onClick={() => setVideoDialogOpen(true)}
        >
          <Upload className="w-4 h-4 mr-2" />
          動画変更
        </Button>
      </div>

      {/* Video Upload Dialog */}
      <VideoUploadDialog
        isOpen={videoDialogOpen}
        setIsOpen={setVideoDialogOpen}
        onVideoUploaded={onVideoUploaded}
        existingVideoUrl={questionData.videoUrl}
        existingVideoId={questionData.videoId}
      />

      {/* Right: Settings Panel */}
      <div className="w-1/3 p-6 bg-gray-50 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-200 p-1">
            <TabsTrigger
              value="video"
              className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:font-semibold data-[state=inactive]:text-gray-600"
            >
              ビデオ
            </TabsTrigger>
            <TabsTrigger
              value="answer"
              className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:font-semibold data-[state=inactive]:text-gray-600"
            >
              答える
            </TabsTrigger>
            <TabsTrigger
              value="logic"
              className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:font-semibold data-[state=inactive]:text-gray-600"
            >
              論理
            </TabsTrigger>
          </TabsList>

          {/* Video Tab */}
          <TabsContent value="video" className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-semibold text-gray-900">
                ステップタイトル
              </Label>
              <Input
                value={questionData.title || ''}
                onChange={(e) =>
                  setQuestionData({ ...questionData, title: e.target.value })
                }
                placeholder="例: お名前を教えてください"
                className="mt-2 bg-white text-gray-900"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-900">
                説明（オプション）
              </Label>
              <Input
                value={questionData.description || ''}
                onChange={(e) =>
                  setQuestionData({
                    ...questionData,
                    description: e.target.value,
                  })
                }
                placeholder="追加の説明文を入力"
                className="mt-2 bg-white text-gray-900"
              />
            </div>

            <div className="border-t pt-4">
              <Label className="text-sm font-semibold mb-3 block text-gray-900">
                ビデオ設定
              </Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-gray-900">自動再生</Label>
                    <p className="text-xs text-gray-600">
                      ビデオを自動的に再生します
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-gray-900">
                      ループ再生
                    </Label>
                    <p className="text-xs text-gray-600">
                      ビデオを繰り返し再生します
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-gray-900">
                      ビデオコントロール表示
                    </Label>
                    <p className="text-xs text-gray-600">
                      再生/一時停止ボタンを表示
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Answer Tab */}
          <TabsContent value="answer" className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-semibold text-gray-900">
                回答タイプ
              </Label>
              <Select
                value={questionData.type}
                onValueChange={(value) => {
                  const newType = value as EQuestionType
                  // Set appropriate subType based on type
                  let newSubType: string
                  if (newType === EQuestionType.Select) {
                    newSubType = ESelectSubType.Single
                    // Ensure options exist for select type
                    const newOptions =
                      questionData.type === EQuestionType.Select
                        ? questionData.options
                        : ['選択肢 1', '選択肢 2']
                    setQuestionData({
                      ...questionData,
                      type: newType,
                      subType: newSubType,
                      options: newOptions,
                    })
                  } else {
                    newSubType = ETextSubType.FreeText
                    setQuestionData({
                      ...questionData,
                      type: newType,
                      subType: newSubType,
                    })
                  }
                }}
              >
                <SelectTrigger className="mt-2 bg-white text-gray-900">
                  <SelectValue placeholder="タイプを選択" />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-900">
                  <SelectItem value="select">
                    ✓ 選択式（Multiple choice）
                  </SelectItem>
                  <SelectItem value="text">📝 テキスト入力（Text）</SelectItem>
                  <SelectItem value="cta_button">
                    🔘 CTAボタン（CTA Button）
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 選択肢管理UI - 選択式の場合のみ表示 */}
            {questionData.type === EQuestionType.Select && (
              <div className="space-y-2 border-t pt-4">
                <Label className="text-sm font-semibold text-gray-900">
                  選択肢
                </Label>
                <p className="text-xs text-gray-600 mb-2">
                  回答者が選択できるオプションを追加してください
                </p>
                {(questionData.options || []).map((option, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Badge
                      variant="outline"
                      className="min-w-[24px] justify-center text-gray-900"
                    >
                      {String.fromCharCode(65 + index)}
                    </Badge>
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`選択肢 ${index + 1}`}
                      className="flex-1 bg-white text-gray-900"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeOption(index)}
                      className="hover:bg-red-50 text-gray-900"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="w-full mt-2 text-gray-900"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  選択肢を追加
                </Button>
              </div>
            )}

            {/* CTAボタン設定UI - CTAボタンの場合のみ表示 */}
            {questionData.type === EQuestionType.CTAButton && (
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">
                    ボタンテキスト
                  </Label>
                  <Input
                    value={
                      'buttonText' in questionData
                        ? questionData.buttonText
                        : ''
                    }
                    onChange={(e) =>
                      setQuestionData({
                        ...questionData,
                        buttonText: e.target.value,
                      } as TQuestion)
                    }
                    placeholder="例: 次へ進む"
                    className="bg-white text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">
                    アクション
                  </Label>
                  <Select
                    value={
                      'actionType' in questionData
                        ? questionData.actionType
                        : ECTAActionType.NextStep
                    }
                    onValueChange={(value) => {
                      setQuestionData({
                        ...questionData,
                        actionType: value as ECTAActionType,
                        redirectUrl:
                          value === ECTAActionType.URLRedirect
                            ? questionData.redirectUrl || ''
                            : undefined,
                      } as TQuestion)
                    }}
                  >
                    <SelectTrigger className="bg-white text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-gray-900">
                      <SelectItem value={ECTAActionType.NextStep}>
                        次のステップへ進む
                      </SelectItem>
                      <SelectItem value={ECTAActionType.URLRedirect}>
                        外部URLへリダイレクト
                      </SelectItem>
                      <SelectItem value={ECTAActionType.EndScreen}>
                        完了画面へ
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {'actionType' in questionData &&
                  questionData.actionType === ECTAActionType.URLRedirect && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-900">
                        リダイレクトURL
                      </Label>
                      <Input
                        type="url"
                        value={
                          'redirectUrl' in questionData
                            ? questionData.redirectUrl || ''
                            : ''
                        }
                        onChange={(e) =>
                          setQuestionData({
                            ...questionData,
                            redirectUrl: e.target.value,
                          } as TQuestion)
                        }
                        placeholder="https://example.com"
                        className="bg-white text-gray-900"
                      />
                    </div>
                  )}
              </div>
            )}

            <div className="border-t pt-4 space-y-3">
              <Label className="text-sm font-semibold block text-gray-900">
                回答設定
              </Label>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm text-gray-900">必須回答</Label>
                  <p className="text-xs text-gray-600">
                    回答を必須にします
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              {questionData.type === EQuestionType.Select && (
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-gray-900">
                      複数選択を許可
                    </Label>
                    <p className="text-xs text-gray-600">
                      複数の選択肢を選べます
                    </p>
                  </div>
                  <Switch />
                </div>
              )}
              {questionData.type === EQuestionType.Select && (
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-gray-900">
                      ランダム順序
                    </Label>
                    <p className="text-xs text-gray-600">
                      選択肢をランダム表示
                    </p>
                  </div>
                  <Switch />
                </div>
              )}
            </div>

            {questionData.type !== EQuestionType.Select &&
              questionData.type !== EQuestionType.CTAButton && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-semibold text-gray-900">
                    プレースホルダー
                  </Label>
                  <Input
                    value={questionData.placeholder || ''}
                    onChange={(e) =>
                      setQuestionData({
                        ...questionData,
                        placeholder: e.target.value,
                      })
                    }
                    placeholder="例: ここに入力してください"
                    className="mt-2 bg-white text-gray-900"
                  />
                </div>
              )}
          </TabsContent>

          {/* Logic Tab */}
          <TabsContent value="logic" className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-semibold text-gray-900">
                条件分岐設定
              </Label>
              <p className="text-xs text-gray-600 mt-1">
                各選択肢に対して次のステップを設定できます
              </p>
            </div>

            {questionData.type === EQuestionType.Select &&
            (questionData.options || []).length > 0 ? (
              <div className="space-y-3">
                {(questionData.options || []).map((option, index) => {
                  // Find existing logic for this option
                  const existingLogic = questionData.logic?.find(
                    (l) => l.value === option,
                  )
                  const currentTarget = existingLogic?.skipTo || 'next'

                  return (
                    <Card key={index} className="p-3 bg-white border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge
                          variant="outline"
                          className="bg-purple-100 text-purple-700 border-purple-300"
                        >
                          {String.fromCharCode(65 + index)}
                        </Badge>
                        <span className="text-sm font-medium text-gray-900">
                          {option}
                        </span>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 mb-1 block">
                          次のステップ
                        </Label>
                        <Select
                          value={currentTarget}
                          onValueChange={(value) => {
                            // Update or create logic for this option
                            const newLogic = [...(questionData.logic || [])]

                            // Remove existing logic for this option
                            const filteredLogic = newLogic.filter(
                              (l) => l.value !== option,
                            )

                            // Add new logic entry
                            if (value !== 'next') {
                              filteredLogic.push({
                                questionId: questionData.id || '',
                                condition: ELogicCondition.IS,
                                value: option,
                                skipTo: value,
                              })
                            }

                            setQuestionData({
                              ...questionData,
                              logic: filteredLogic,
                            })
                          }}
                        >
                          <SelectTrigger className="text-sm bg-white text-gray-900">
                            <SelectValue placeholder="遷移先を選択" />
                          </SelectTrigger>
                          <SelectContent className="bg-white text-gray-900">
                            <SelectItem value="next">→ 次の質問へ</SelectItem>
                            {allQuestions
                              .filter((q) => q.id !== questionData.id)
                              .map((q, idx) => (
                                <SelectItem key={q.id} value={q.id!}>
                                  📋 質問 {idx + 1}: {q.title}
                                </SelectItem>
                              ))}
                            <SelectItem value="end">✓ 終了画面</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600 text-sm">
                {questionData.type === EQuestionType.Select
                  ? '「答える」タブで選択肢を追加してください'
                  : 'テキスト入力タイプでは条件分岐は使用できません'}
              </div>
            )}

            <div className="space-y-3 pt-4 border-t">
              <Label className="text-sm font-semibold block text-gray-900">
                その他の設定
              </Label>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm text-gray-900">データ収集</Label>
                  <p className="text-xs text-gray-600">
                    回答データを保存します
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm text-gray-900">
                    スキップを許可
                  </Label>
                  <p className="text-xs text-gray-600">
                    この質問をスキップ可能にします
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => {
              // Validate and ensure required fields
              const validatedData: TQuestion = {
                ...questionData,
                title: questionData.title.trim() || '無題の質問',
                // Ensure options exist for select type
                ...(questionData.type === EQuestionType.Select && {
                  options:
                    questionData.options && questionData.options.length > 0
                      ? questionData.options
                      : ['選択肢 1', '選択肢 2'],
                }),
              }
              onSave(validatedData)
            }}
          >
            完成です
          </Button>
          <Button variant="outline" className="w-full" onClick={onCancel}>
            キャンセル
          </Button>
        </div>
      </div>
    </div>
  )
}

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
  Pause,
  Play,
  Plus,
  Subtitles,
  Trash2,
  Upload,
  Video as VideoIcon,
} from 'lucide-react'
import React, { useRef, useState } from 'react'
import type { TQuestion } from '~/types/question.types'
import {
  ECTAActionType,
  ELogicCondition,
  EQuestionType,
  ESelectSubType,
  ETextSubType,
} from '~/types/question.types'
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
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showCaptions, setShowCaptions] = useState(false)
  const [activeTab, setActiveTab] = useState('video')
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)

  // Question state
  const [questionData, setQuestionData] = useState<TQuestion>(question)

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        void videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left: Video Player */}
      <div className="w-1/3 bg-black p-6 flex flex-col">
        <div className="flex-1 flex flex-col">
          {/* Video Container */}
          <div className="relative flex-1 bg-gray-900 rounded-lg overflow-hidden mb-4">
            {questionData.videoUrl ? (
              <video
                ref={videoRef}
                src={questionData.videoUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                playsInline
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <VideoIcon className="w-16 h-16 mb-4" />
                <p>動画をアップロードしてください</p>
              </div>
            )}
          </div>

          {/* Video Controls */}
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            {/* Progress Bar */}
            <div className="flex items-center gap-3 text-white text-sm">
              <span>{formatTime(currentTime)}</span>
              <div className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 transition-all"
                  style={{
                    width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  }}
                />
              </div>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={togglePlayPause}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCaptions(!showCaptions)}
                className={`bg-white/10 border-white/20 text-white hover:bg-white/20 ${
                  showCaptions ? 'bg-purple-600' : ''
                }`}
              >
                <Subtitles className="w-4 h-4" />
              </Button>

              <div className="flex-1" />

              <Button
                size="sm"
                variant="outline"
                className="text-white"
                onClick={() => setVideoDialogOpen(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                動画変更
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Upload Dialog */}
      <VideoUploadDialog
        isOpen={videoDialogOpen}
        setIsOpen={setVideoDialogOpen}
        onVideoUploaded={onVideoUploaded}
        existingVideoUrl={questionData.videoUrl}
        existingVideoId={questionData.videoId}
      />

      {/* Center: Options Display */}
      <div className="w-1/3 p-6 bg-white border-x">
        <h2 className="text-xl font-bold mb-4 text-foreground">
          回答オプション
        </h2>

        {/* Options List - Display Only */}
        <div className="space-y-2">
          {questionData.type === EQuestionType.Select &&
          (questionData.options || []).length > 0 ? (
            (questionData.options || []).map((option, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-2 p-3 bg-purple-100 hover:bg-purple-200 border border-purple-300 rounded-lg cursor-pointer transition-colors"
              >
                <Badge variant="outline" className="bg-white text-foreground">
                  {String.fromCharCode(65 + index)}
                </Badge>
                <span className="flex-1 text-left font-medium text-purple-900">
                  {option}
                </span>
              </button>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              右側の「答える」タブで選択肢を追加してください
            </div>
          )}
        </div>
      </div>

      {/* Right: Settings Panel */}
      <div className="w-1/3 p-6 bg-gray-50">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="video">ビデオ</TabsTrigger>
            <TabsTrigger value="answer">答える</TabsTrigger>
            <TabsTrigger value="logic">論理</TabsTrigger>
          </TabsList>

          {/* Video Tab */}
          <TabsContent value="video" className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-semibold text-foreground">
                ステップタイトル
              </Label>
              <Input
                value={questionData.title || ''}
                onChange={(e) =>
                  setQuestionData({ ...questionData, title: e.target.value })
                }
                placeholder="例: お名前を教えてください"
                className="mt-2 bg-background text-foreground"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-foreground">
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
                className="mt-2 bg-background text-foreground"
              />
            </div>

            <div className="border-t pt-4">
              <Label className="text-sm font-semibold mb-3 block text-foreground">
                ビデオ設定
              </Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-foreground">自動再生</Label>
                    <p className="text-xs text-muted-foreground">
                      ビデオを自動的に再生します
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-foreground">
                      ループ再生
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      ビデオを繰り返し再生します
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-foreground">
                      ビデオコントロール表示
                    </Label>
                    <p className="text-xs text-muted-foreground">
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
              <Label className="text-sm font-semibold text-foreground">
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
                <SelectTrigger className="mt-2 bg-background text-foreground">
                  <SelectValue placeholder="タイプを選択" />
                </SelectTrigger>
                <SelectContent className="bg-background text-foreground">
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
                <Label className="text-sm font-semibold text-foreground">
                  選択肢
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  回答者が選択できるオプションを追加してください
                </p>
                {(questionData.options || []).map((option, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Badge
                      variant="outline"
                      className="min-w-[24px] justify-center text-foreground"
                    >
                      {String.fromCharCode(65 + index)}
                    </Badge>
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`選択肢 ${index + 1}`}
                      className="flex-1 bg-background text-foreground"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeOption(index)}
                      className="hover:bg-red-50 text-foreground"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="w-full mt-2 text-foreground"
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
                  <Label className="text-sm font-semibold text-foreground">
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
                    className="bg-background text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">
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
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background text-foreground">
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
                      <Label className="text-sm font-semibold text-foreground">
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
                        className="bg-background text-foreground"
                      />
                    </div>
                  )}
              </div>
            )}

            <div className="border-t pt-4 space-y-3">
              <Label className="text-sm font-semibold block text-foreground">
                回答設定
              </Label>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm text-foreground">必須回答</Label>
                  <p className="text-xs text-muted-foreground">
                    回答を必須にします
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              {questionData.type === EQuestionType.Select && (
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-foreground">
                      複数選択を許可
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      複数の選択肢を選べます
                    </p>
                  </div>
                  <Switch />
                </div>
              )}
              {questionData.type === EQuestionType.Select && (
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-foreground">
                      ランダム順序
                    </Label>
                    <p className="text-xs text-muted-foreground">
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
                  <Label className="text-sm font-semibold text-foreground">
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
                    className="mt-2 bg-background text-foreground"
                  />
                </div>
              )}
          </TabsContent>

          {/* Logic Tab */}
          <TabsContent value="logic" className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-semibold text-foreground">
                条件分岐設定
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
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
                        <span className="text-sm font-medium text-foreground">
                          {option}
                        </span>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">
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
                          <SelectTrigger className="text-sm bg-background text-foreground">
                            <SelectValue placeholder="遷移先を選択" />
                          </SelectTrigger>
                          <SelectContent className="bg-background text-foreground">
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
              <div className="text-center py-8 text-muted-foreground text-sm">
                {questionData.type === EQuestionType.Select
                  ? '「答える」タブで選択肢を追加してください'
                  : 'テキスト入力タイプでは条件分岐は使用できません'}
              </div>
            )}

            <div className="space-y-3 pt-4 border-t">
              <Label className="text-sm font-semibold block text-foreground">
                その他の設定
              </Label>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm text-foreground">データ収集</Label>
                  <p className="text-xs text-muted-foreground">
                    回答データを保存します
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm text-foreground">
                    スキップを許可
                  </Label>
                  <p className="text-xs text-muted-foreground">
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

'use client'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  Input,
  Label,
} from '@components/ui'
import {
  Camera,
  Monitor,
  PlayCircle,
  StopCircle,
  Upload,
  Video,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '~/lib/supabase'
import { api } from '~/utils/api'
import {
  convertVideoTo9x16,
  getVideoDimensions,
  needsConversion,
} from '~/utils/videoConverter'
import { generateVideoThumbnail } from '~/utils/videoThumbnail'

// Video upload constraints
const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB in bytes
const MAX_RECORDING_TIME = 300 // 5 minutes in seconds
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
  'video/webm',
]

type UploadMode = 'upload' | 'record' | 'screen'

export const VideoUploadDialog = ({
  isOpen,
  setIsOpen,
  onVideoUploaded,
  existingVideoUrl,
  existingVideoId,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onVideoUploaded?: (videoId: string, videoUrl: string) => void
  existingVideoUrl?: string
  existingVideoId?: string
}) => {
  // Common states
  const [mode, setMode] = useState<UploadMode>('upload')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [videoId, setVideoId] = useState<string | null>(existingVideoId || null)
  const [isConverting, setIsConverting] = useState(false)
  const [conversionProgress, setConversionProgress] = useState(0)
  const [videoInfo, setVideoInfo] = useState<{
    width: number
    height: number
    aspectRatio: number
    needsConversion: boolean
  } | null>(null)

  // Recording states
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordedBlobs, setRecordedBlobs] = useState<Blob[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const { mutateAsync: getUploadUrl } = api.video.getUploadUrl.useMutation()
  const { mutateAsync: finalizeVideo } = api.video.finalizeVideo.useMutation()
  const { mutateAsync: uploadThumbnail } =
    api.video.uploadThumbnail.useMutation()

  const { data: videoStatus } = api.video.getVideoStatus.useQuery(
    { videoId: videoId! },
    { enabled: !!videoId, refetchInterval: 5000 },
  )

  // Cleanup stream when dialog closes or mode changes
  useEffect(() => {
    if (!isOpen) {
      stopCamera()
      stopScreen()
    } else if (mode !== 'record') {
      stopCamera()
    } else if (mode !== 'screen') {
      stopScreen()
    }
  }, [isOpen, mode])

  // Timer for recording
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording, isPaused])

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1080 },
          height: { ideal: 1920 },
          facingMode: 'user',
        },
        audio: true,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.muted = true
        await videoRef.current.play()
      }

      toast.success('カメラに接続しました')
    } catch (error) {
      console.error('Camera access error:', error)
      toast.error(
        'カメラへのアクセスに失敗しました。ブラウザの設定を確認してください。',
      )
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  // Start screen recording
  const startScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.muted = true
        await videoRef.current.play()
      }

      // Listen for when user stops sharing via browser UI
      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        if (isRecording) {
          stopRecording()
        } else {
          stopScreen()
        }
      })

      toast.success('画面の共有を開始しました')
    } catch (error) {
      console.error('Screen capture error:', error)
      toast.error(
        '画面の共有に失敗しました。ブラウザの設定を確認してください。',
      )
    }
  }

  // Stop screen recording
  const stopScreen = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  // Start recording
  const startRecording = async () => {
    if (!streamRef.current) {
      if (mode === 'record') {
        await startCamera()
      } else if (mode === 'screen') {
        await startScreen()
      }
      // Wait a bit for stream to initialize
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    if (!streamRef.current) {
      toast.error(
        mode === 'record'
          ? 'カメラが利用できません'
          : '画面共有が利用できません',
      )
      return
    }

    try {
      const options = { mimeType: 'video/webm;codecs=vp9' }
      let mediaRecorder: MediaRecorder

      try {
        mediaRecorder = new MediaRecorder(streamRef.current, options)
      } catch (e) {
        // Fallback to default codec
        mediaRecorder = new MediaRecorder(streamRef.current)
      }

      const blobs: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          blobs.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(blobs, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        setRecordedBlobs(blobs)

        // Convert blob to file
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: 'video/webm',
        })
        setVideoFile(file)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(100) // Collect data every 100ms

      setIsRecording(true)
      setRecordingTime(0)
      toast.success('録画を開始しました')
    } catch (error) {
      console.error('Recording error:', error)
      toast.error('録画の開始に失敗しました')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)

      if (mode === 'record') {
        stopCamera()
      } else if (mode === 'screen') {
        stopScreen()
      }

      if (recordingTime >= MAX_RECORDING_TIME) {
        toast.info('最大録画時間（5分）に達したため、録画を停止しました')
      } else {
        toast.success('録画を停止しました')
      }
    }
  }

  // Pause/Resume recording
  const togglePause = () => {
    if (!mediaRecorderRef.current) return

    if (isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      toast.success('録画を再開しました')
    } else {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      toast.info('録画を一時停止しました')
    }
  }

  // Re-record
  const reRecord = () => {
    setRecordedBlobs([])
    setPreviewUrl(null)
    setVideoFile(null)
    setRecordingTime(0)
    toast.info('録画をやり直します')
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event?.target?.files?.[0]
    if (!file) return

    // Validate file type
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      toast.error(
        '対応していないファイル形式です。MP4、MOV、AVI、WebMのみアップロード可能です。',
        {
          position: 'top-center',
          duration: 3000,
        },
      )
      event.target.value = '' // Reset input
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        `ファイルサイズが大きすぎます。最大500MBまでアップロード可能です。`,
        {
          position: 'top-center',
          duration: 3000,
        },
      )
      event.target.value = '' // Reset input
      return
    }

    setVideoFile(file)

    // Check video dimensions and if conversion is needed
    try {
      const dimensions = await getVideoDimensions(file)
      const needs9x16Conversion = await needsConversion(file)

      setVideoInfo({
        ...dimensions,
        needsConversion: needs9x16Conversion,
      })

      if (needs9x16Conversion) {
        toast.info(
          '動画が9:16のアスペクト比ではありません。アップロード時に自動で調整します。',
          {
            position: 'top-center',
            duration: 4000,
          },
        )
      }
    } catch (error) {
      console.error('Error analyzing video:', error)
      // Continue anyway, conversion will be attempted
    }
  }

  const handleUpload = async () => {
    if (!videoFile) {
      toast.error('動画ファイルを選択してください')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      let fileToUpload = videoFile

      // Convert video to 9:16 if needed
      if (videoInfo?.needsConversion) {
        setIsConverting(true)
        setConversionProgress(0)

        toast.info('動画を9:16に変換しています...', {
          position: 'top-center',
          duration: 2000,
        })

        try {
          fileToUpload = await convertVideoTo9x16(videoFile, (progress) => {
            setConversionProgress(progress)
          })

          toast.success('動画の変換が完了しました！', {
            position: 'top-center',
            duration: 2000,
          })
        } catch (error) {
          console.error('Conversion error:', error)
          toast.error(
            '動画の変換に失敗しました。元の動画をアップロードします。',
            {
              position: 'top-center',
              duration: 3000,
            },
          )
          // Continue with original file
          fileToUpload = videoFile
        } finally {
          setIsConverting(false)
          setConversionProgress(0)
        }
      }

      // 1. Get signed upload URL from backend
      const { uploadUrl, filePath, token } = await getUploadUrl({
        filename: fileToUpload.name,
        fileType: fileToUpload.type,
        fileSize: fileToUpload.size,
      })

      // 2. Upload file directly to Supabase Storage using signed URL
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentage = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(percentage)
        }
      })

      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          try {
            // 3. Finalize video and save metadata
            const result = await finalizeVideo({
              filePath: filePath,
              title: fileToUpload.name,
            })

            setVideoId(result.videoId)
            setUploadProgress(100)
            toast.success('動画をアップロードしました！')

            // 4. Generate and upload thumbnail
            try {
              toast.info('サムネイルを生成中...', {
                position: 'top-center',
                duration: 2000,
              })

              const thumbnailBlob = await generateVideoThumbnail(
                fileToUpload,
                1,
              )

              // Convert blob to base64
              const reader = new FileReader()
              reader.readAsDataURL(thumbnailBlob)
              reader.onloadend = async () => {
                const base64data = reader.result as string

                try {
                  await uploadThumbnail({
                    videoId: result.videoId,
                    thumbnailBase64: base64data,
                  })

                  toast.success('サムネイルを生成しました！', {
                    position: 'top-center',
                    duration: 1500,
                  })
                } catch (thumbnailError) {
                  console.error('Error uploading thumbnail:', thumbnailError)
                  // Don't fail the whole upload if thumbnail fails
                }
              }
            } catch (thumbnailError) {
              console.error('Error generating thumbnail:', thumbnailError)
              // Don't fail the whole upload if thumbnail generation fails
            }

            // Callback with video info
            if (onVideoUploaded) {
              onVideoUploaded(result.videoId, result.url)
            }

            // Close dialog after short delay
            setTimeout(() => {
              setIsOpen(false)
              resetForm()
            }, 1500)
          } catch (error) {
            console.error('Error finalizing video:', error)
            toast.error('動画の処理に失敗しました')
            setIsUploading(false)
          }
        } else {
          console.error('Upload failed with status:', xhr.status)
          toast.error('アップロードに失敗しました。もう一度お試しください。')
          setIsUploading(false)
          setUploadProgress(0)
        }
      })

      xhr.addEventListener('error', () => {
        console.error('Upload error')
        toast.error('アップロードに失敗しました。もう一度お試しください。')
        setIsUploading(false)
        setUploadProgress(0)
      })

      xhr.open('PUT', uploadUrl)
      xhr.setRequestHeader('Content-Type', fileToUpload.type)
      xhr.send(fileToUpload)
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('アップロードを開始できませんでした')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const resetForm = () => {
    setVideoFile(null)
    setUploadProgress(0)
    setIsUploading(false)
    setVideoId(null)
    setIsConverting(false)
    setConversionProgress(0)
    setVideoInfo(null)
    // Reset recording states
    setIsRecording(false)
    setIsPaused(false)
    setRecordingTime(0)
    setRecordedBlobs([])
    setPreviewUrl(null)
    stopCamera()
  }

  const handleOnOpenChange = (open: boolean) => {
    if (!isUploading && !isConverting && !isRecording) {
      setIsOpen(open)
      if (!open) {
        resetForm()
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-4 p-4">
          <h2 className="text-xl font-semibold">動画を追加</h2>

          {/* Mode Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setMode('upload')}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                mode === 'upload'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                アップロード
              </div>
            </button>
            <button
              onClick={() => {
                setMode('record')
                if (!streamRef.current) {
                  startCamera()
                }
              }}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                mode === 'record'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                カメラ録画
              </div>
            </button>
            <button
              onClick={() => {
                setMode('screen')
                if (!streamRef.current) {
                  startScreen()
                }
              }}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                mode === 'screen'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                画面録画
              </div>
            </button>
          </div>

          {/* Upload Mode */}
          {mode === 'upload' && (
            <>
              {existingVideoUrl && !videoFile ? (
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden bg-black">
                    <video
                      src={existingVideoUrl}
                      controls
                      className="w-full"
                      style={{ maxHeight: '400px' }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    アップロード済みの動画
                  </p>
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setVideoId(null)
                      }}
                    >
                      別の動画をアップロード
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col gap-2 p-8 items-center">
                    <FileIcon className="w-12 h-12 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      動画ファイルを選択してください
                    </span>
                    <span className="text-xs text-gray-500">
                      対応形式: MP4, MOV, AVI, WebM（最大500MB）
                    </span>
                  </div>
                </>
              )}

              {(!existingVideoUrl || videoFile) && (
                <div className="space-y-2">
                  <Label htmlFor="file" className="text-sm font-medium">
                    動画ファイル
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,video/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  {videoFile && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        選択中: {videoFile.name} (
                        {(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                      {videoInfo && (
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>
                            解像度: {videoInfo.width} x {videoInfo.height}
                          </p>
                          <p>
                            アスペクト比:{' '}
                            {videoInfo.aspectRatio > 1
                              ? '横長'
                              : videoInfo.aspectRatio < 1
                                ? '縦長'
                                : '正方形'}{' '}
                            ({videoInfo.aspectRatio.toFixed(2)})
                          </p>
                          {videoInfo.needsConversion && (
                            <p className="text-orange-600 font-medium">
                              ⚠️ 9:16に自動変換されます
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Recording Mode (Camera) */}
          {mode === 'record' && (
            <div className="space-y-4">
              {!previewUrl ? (
                <>
                  {/* Camera Preview */}
                  <div className="relative rounded-lg overflow-hidden bg-black aspect-[9/16] max-h-[500px] mx-auto">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Recording Indicator */}
                    {isRecording && (
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-full">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                        <span className="font-mono font-bold">
                          {formatTime(recordingTime)} /{' '}
                          {formatTime(MAX_RECORDING_TIME)}
                        </span>
                      </div>
                    )}

                    {/* Pause Indicator */}
                    {isPaused && (
                      <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-2 rounded-full font-medium">
                        一時停止中
                      </div>
                    )}
                  </div>

                  {/* Recording Controls */}
                  <div className="flex justify-center items-center gap-4">
                    {!isRecording ? (
                      <Button
                        onClick={startRecording}
                        size="lg"
                        className="bg-red-600 hover:bg-red-700 text-white gap-2"
                      >
                        <Video className="w-5 h-5" />
                        録画開始
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={togglePause}
                          variant="outline"
                          size="lg"
                          className="gap-2"
                        >
                          {isPaused ? (
                            <>
                              <PlayCircle className="w-5 h-5" />
                              再開
                            </>
                          ) : (
                            <>
                              <StopCircle className="w-5 h-5" />
                              一時停止
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={stopRecording}
                          size="lg"
                          className="bg-red-600 hover:bg-red-700 text-white gap-2"
                        >
                          <StopCircle className="w-5 h-5" />
                          録画停止
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    最大録画時間: 5分
                  </div>
                </>
              ) : (
                <>
                  {/* Preview Recorded Video */}
                  <div className="rounded-lg overflow-hidden bg-black">
                    <video
                      src={previewUrl}
                      controls
                      className="w-full"
                      style={{ maxHeight: '500px' }}
                    />
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button
                      onClick={reRecord}
                      variant="outline"
                      className="gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      録画し直す
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      loading={isUploading}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      この動画を使用
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Screen Recording Mode */}
          {mode === 'screen' && (
            <div className="space-y-4">
              {!previewUrl ? (
                <>
                  {/* Screen Preview */}
                  <div className="relative rounded-lg overflow-hidden bg-black aspect-video max-h-[500px] mx-auto">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-contain"
                    />

                    {/* Recording Indicator */}
                    {isRecording && (
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-full">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                        <span className="font-mono font-bold">
                          {formatTime(recordingTime)} /{' '}
                          {formatTime(MAX_RECORDING_TIME)}
                        </span>
                      </div>
                    )}

                    {/* Pause Indicator */}
                    {isPaused && (
                      <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-2 rounded-full font-medium">
                        一時停止中
                      </div>
                    )}

                    {/* Not Recording - Show Instructions */}
                    {!isRecording && !streamRef.current && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                        <Monitor className="w-16 h-16 mb-4 text-violet-400" />
                        <h3 className="text-xl font-semibold mb-2">
                          画面を共有して録画
                        </h3>
                        <p className="text-gray-300 text-sm">
                          ブラウザのタブ、ウィンドウ、または画面全体を選択できます
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Recording Controls */}
                  <div className="flex justify-center items-center gap-4">
                    {!isRecording ? (
                      <Button
                        onClick={startRecording}
                        size="lg"
                        className="bg-red-600 hover:bg-red-700 text-white gap-2"
                      >
                        <Monitor className="w-5 h-5" />
                        画面共有して録画開始
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={togglePause}
                          variant="outline"
                          size="lg"
                          className="gap-2"
                        >
                          {isPaused ? (
                            <>
                              <PlayCircle className="w-5 h-5" />
                              再開
                            </>
                          ) : (
                            <>
                              <StopCircle className="w-5 h-5" />
                              一時停止
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={stopRecording}
                          size="lg"
                          className="bg-red-600 hover:bg-red-700 text-white gap-2"
                        >
                          <StopCircle className="w-5 h-5" />
                          録画停止
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-500">最大録画時間: 5分</p>
                    <p className="text-xs text-gray-400">
                      ※ ブラウザの「共有を停止」ボタンでも録画を終了できます
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Preview Recorded Video */}
                  <div className="rounded-lg overflow-hidden bg-black">
                    <video
                      src={previewUrl}
                      controls
                      className="w-full"
                      style={{ maxHeight: '500px' }}
                    />
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button
                      onClick={reRecord}
                      variant="outline"
                      className="gap-2"
                    >
                      <Monitor className="w-4 h-4" />
                      録画し直す
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      loading={isUploading}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      この動画を使用
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {isConverting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  動画を9:16に変換中...
                </span>
                <span className="text-sm text-gray-600">
                  {conversionProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-orange-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${conversionProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                この処理には数分かかる場合があります
              </p>
            </div>
          )}

          {uploadProgress > 0 && !isConverting && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                {uploadProgress}% アップロード中
              </p>
            </div>
          )}

          {uploadProgress === 100 && videoStatus && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 text-center">
                ✓ 動画をアップロードしました！
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOnOpenChange(false)}
            disabled={isUploading || isConverting || isRecording}
          >
            {isRecording ? '録画中...' : 'キャンセル'}
          </Button>
          {mode === 'upload' && !previewUrl && (
            <Button
              onClick={handleUpload}
              disabled={!videoFile || isUploading || isConverting}
              loading={isUploading || isConverting}
            >
              {isConverting
                ? '変換中...'
                : isUploading
                  ? 'アップロード中...'
                  : 'アップロード'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M8 12h8" />
      <path d="M8 16h8" />
    </svg>
  )
}

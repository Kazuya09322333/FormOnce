import { Icons } from '@components/ui'
import {
  Code,
  Eye,
  EyeOff,
  Monitor,
  RotateCcw,
  Smartphone,
  X,
} from 'lucide-react'
import type { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import VideoAskRenderer from '~/components/form-builder/videoask-renderer'
import { getServerAuthSessionSupabase } from '~/server/auth-supabase'
import type { TFormSchema } from '~/types/form.types'
import type { TQuestion } from '~/types/question.types'
import { api } from '~/utils/api'

type TProps = {
  formId: string
}

export default function FormPreview(props: TProps) {
  const router = useRouter()
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [showSuccess, setShowSuccess] = useState(false)
  const [resetSignal, setResetSignal] = useState(false)
  const [showAnswerData, setShowAnswerData] = useState(false)
  const [answerData, setAnswerData] = useState<Record<string, unknown>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const {
    data: formData,
    isLoading: isLoadingFormData,
    isError: isFormInvalid,
  } = api.form.getOne.useQuery(
    {
      id: props.formId,
    },
    {
      enabled: !!props.formId && props.formId !== 'new',
      refetchOnWindowFocus: false,
      retry: false,
    },
  )

  // Check if formId is valid
  useEffect(() => {
    if (props.formId === 'new') return

    if (isFormInvalid) {
      void router.push('/dashboard/forms/new')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormInvalid])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to close
      if (e.key === 'Escape') {
        handleClose()
      }
      // Ctrl/Cmd + R to reset
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault()
        handleReset()
      }
      // Ctrl/Cmd + D to toggle answer data
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        setShowAnswerData((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const onNext = () => {
    setCurrentQuestionIndex((prev) => prev + 1)
  }

  const onPrev = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
  }

  const onSubmit = async (values: Record<string, unknown>) => {
    console.log('Preview mode - Form data:', values)
    setAnswerData(values)
    // In preview mode, we don't actually submit
    setShowSuccess(true)
  }

  const handleClose = () => {
    if (window.opener) {
      window.close()
    } else {
      void router.push(`/dashboard/forms/${props.formId}`)
    }
  }

  const handleReset = () => {
    setShowSuccess(false)
    setAnswerData({})
    setCurrentQuestionIndex(0)
    setResetSignal(true)
    setTimeout(() => setResetSignal(false), 100)
  }

  const handleResetFromRenderer = () => {
    setResetSignal(false)
  }

  if (isLoadingFormData) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Icons.spinner className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (!formData?.form) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-xl">フォームが見つかりません</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-screen bg-gray-900">
      {/* Preview Controls Bar */}
      <div className="absolute top-0 left-0 right-0 z-[100] bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white">
              <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-sm font-semibold">プレビューモード</span>
            </div>
            <div className="text-gray-400 text-sm">※ 回答は保存されません</div>
            {!showSuccess && formData?.form && (
              <div className="text-gray-400 text-sm">
                質問 {currentQuestionIndex + 1} /{' '}
                {(formData.form.questions as TQuestion[]).length}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="リセット (Ctrl+R)"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Toggle Answer Data */}
            <button
              onClick={() => setShowAnswerData((prev) => !prev)}
              className={`p-2 transition-colors ${
                showAnswerData
                  ? 'text-violet-400 hover:text-violet-300'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="回答データを表示 (Ctrl+D)"
            >
              {showAnswerData ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>

            {/* Device Toggle */}
            <div className="flex gap-1 bg-black/50 rounded-lg p-1">
              <button
                onClick={() => setDevice('desktop')}
                className={`p-2 rounded transition-colors ${
                  device === 'desktop'
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="デスクトップ表示"
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={`p-2 rounded transition-colors ${
                  device === 'mobile'
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="モバイル表示"
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="閉じる (ESC)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Answer Data Panel */}
      {showAnswerData && Object.keys(answerData).length > 0 && (
        <div className="absolute top-20 right-4 z-[100] bg-black/90 backdrop-blur-sm rounded-lg p-4 max-w-md max-h-[60vh] overflow-y-auto border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Code className="h-4 w-4" />
              回答データ
            </h3>
            <button
              onClick={() => setShowAnswerData(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <pre className="text-xs text-gray-300 overflow-x-auto">
            {JSON.stringify(answerData, null, 2)}
          </pre>
        </div>
      )}

      {/* Preview Container */}
      <div className="h-full w-full flex items-center justify-center pt-16">
        {device === 'desktop' ? (
          <div className="w-full h-full">
            {showSuccess ? (
              <div className="fixed inset-0 bg-gradient-to-br from-violet-900 via-purple-900 to-black flex items-center justify-center">
                <div className="text-center px-6 space-y-6">
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icons.spinner className="w-16 h-16 text-white" />
                  </div>
                  <div className="text-white text-5xl font-bold">
                    プレビュー完了！
                  </div>
                  <div className="text-gray-300 text-xl font-light">
                    これはプレビューモードです。実際の回答は保存されていません。
                  </div>
                  <button
                    onClick={handleReset}
                    className="mt-8 bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all"
                  >
                    もう一度試す
                  </button>
                </div>
              </div>
            ) : (
              <VideoAskRenderer
                formSchema={formData.form.formSchema as TFormSchema}
                questions={formData.form.questions as TQuestion[]}
                onNext={onNext}
                onPrev={onPrev}
                onSubmit={onSubmit}
                currentQuestionIdx={currentQuestionIndex}
                resetSignal={resetSignal}
                onReset={handleResetFromRenderer}
              />
            )}
          </div>
        ) : (
          <div className="relative h-full bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
            {/* Mobile Frame */}
            <div
              className="h-full bg-black overflow-hidden"
              style={{
                width: '375px',
                maxHeight: 'calc(100vh - 100px)',
              }}
            >
              {showSuccess ? (
                <div className="h-full bg-gradient-to-br from-violet-900 via-purple-900 to-black flex items-center justify-center">
                  <div className="text-center px-6 space-y-4">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icons.spinner className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-white text-3xl font-bold">
                      プレビュー完了！
                    </div>
                    <div className="text-gray-300 text-sm font-light">
                      これはプレビューモードです
                    </div>
                    <button
                      onClick={handleReset}
                      className="mt-6 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-full text-sm font-semibold transition-all"
                    >
                      もう一度試す
                    </button>
                  </div>
                </div>
              ) : (
                <VideoAskRenderer
                  formSchema={formData.form.formSchema as TFormSchema}
                  questions={formData.form.questions as TQuestion[]}
                  onNext={onNext}
                  onPrev={onPrev}
                  onSubmit={onSubmit}
                  currentQuestionIdx={currentQuestionIndex}
                  resetSignal={resetSignal}
                  onReset={handleResetFromRenderer}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSessionSupabase(ctx)

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return {
    props: {
      formId: ctx.query.id,
    },
  }
}

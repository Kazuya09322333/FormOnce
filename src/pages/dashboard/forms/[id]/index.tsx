import { Button, Icons, Input } from '@components/ui'
import { FormStatus } from '@prisma/client'
import { ArrowLeft, Check, Edit, Eye, Split, X } from 'lucide-react'
import type { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { ReactFlowProvider } from 'reactflow'
import { toast } from 'sonner'
import { BasicBuilder } from '~/components/form-builder/basic-builder'
import { FlowBuilder } from '~/components/form-builder/flow-builder'
import { ShareDialog } from '~/components/form-builder/share-dialog'
import BuilderLayout from '~/layouts/builderLayout'
import { getServerAuthSessionSupabase } from '~/server/auth-supabase'
import { type TQuestion } from '~/types/question.types'
import { api } from '~/utils/api'

type TProps = {
  formId: string
}

export default function Form(props: TProps) {
  const router = useRouter()
  const {
    data: data,
    isLoading: isLoadingFormData,
    // isSuccess: formDataFetched,
    isError: isFormInvalid,
    refetch: refreshFormData,
  } = api.form.getOne.useQuery(
    {
      id: props.formId,
    },
    {
      enabled: !!props.formId && props.formId !== 'new',
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false,
    },
  )

  // Update questions when data changes
  useEffect(() => {
    if (data?.form?.questions) {
      setQuestions(data.form.questions as TQuestion[])
    }
  }, [data])

  const { mutateAsync: createForm, isLoading: isCreatingForm } =
    api.form.create.useMutation()
  const { mutateAsync: updateForm, isLoading: isUpdatingForm } =
    api.form.update.useMutation()
  const { mutateAsync: publishForm, isLoading: isPublishingForm } =
    api.form.publish.useMutation()
  const { mutateAsync: unpublishForm, isLoading: isUnpublishingForm } =
    api.form.unpublish.useMutation()

  const { mutateAsync: addQuestion, isLoading: isAddingQuestion } =
    api.form.addQuestion.useMutation()
  const { mutateAsync: editQuestion } = api.form.editQuestion.useMutation()
  const { mutateAsync: deleteQuestion } = api.form.deleteQuestion.useMutation()

  const [currentQuestion, setCurrentQuestion] = useState<number>(0)
  const [questions, setQuestions] = useState<TQuestion[]>([])
  const [isEditingFormName, setIsEditingFormName] = useState<boolean>(false)

  const [shareDialogOpen, setShareDialogOpen] = useState<boolean>(false)

  const [view, setView] = useState<'basic' | 'flow'>('flow')

  const formData = data?.form

  // check if formId is valid, if invalid redirect to dashboard
  useEffect(() => {
    if (props.formId === 'new') return

    if (isFormInvalid) {
      // invalid form id - redirect to forms list, not to /new to avoid loop
      console.log('Invalid form ID, redirecting to dashboard')
      void router.push('/dashboard/forms')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormInvalid])

  const onAddQuestion = async (values: TQuestion) => {
    // if formId is new, create form first
    if (props.formId === 'new') {
      await createForm({
        name: 'New Form',
        questions: [values],
      }).then((res) => {
        void router.push(`/dashboard/forms/${res.id}`)
      })
      return
    }

    // else add question to form
    void addQuestion({
      formId: props.formId,
      question: values,
      targetIdx: questions.length - 1,
      targetQuestionId: 'end',
    }).then(() => {
      void refreshFormData()
    })
  }

  const onEditQuestion = async (values: TQuestion) => {
    const question = questions[currentQuestion]!
    await editQuestion({
      formId: props.formId,
      question: {
        ...values,
        id: question.id!,
      },
    }).then(() => {
      void refreshFormData()
    })
  }

  const onDeleteQuestion = async (questionId: string) => {
    await deleteQuestion({
      formId: props.formId,
      questionId: questionId,
    }).then(() => {
      void refreshFormData()
    })
  }

  const reorderQuestions = async (reorderedQuestions: TQuestion[]) => {
    // check which questions have been swapped
    const swappedQuestions = reorderedQuestions.filter(
      (question, index) => question.id !== questions[index]!.id,
    )

    // if no questions have been swapped, return
    if (!swappedQuestions.length) return

    // it is assumed that only two questions have been swapped
    const [question1, question2] = swappedQuestions

    // swap positions of swapped questions
    const updatedQuestions = reorderedQuestions.map((question) => {
      if (question.id === question1!.id) {
        return {
          ...question,
          position: question2!.position,
        }
      }
      if (question.id === question2!.id) {
        return {
          ...question,
          position: question1!.position,
        }
      }
      return question
    })

    setQuestions(updatedQuestions)
    await updateForm({
      id: props.formId,
      questions: updatedQuestions,
    }).then(() => {
      void refreshFormData()
    })
  }

  const updateFormName = async (e: React.FormEvent) => {
    e.preventDefault()

    const formName = document.getElementById('form-name') as HTMLInputElement

    if (formName.value === formData?.name!) return setIsEditingFormName(false)

    if (formName.value === '')
      return toast.error('フォーム名を入力してください', {
        position: 'top-center',
        duration: 1500,
      })

    // if formId is new, create form
    if (props.formId === 'new') {
      await createForm({
        name: formName.value,
        questions: [],
      }).then((res) => {
        void router.push(`/dashboard/forms/${res.id}`)
      })
      return
    }

    // else update form name
    await updateForm({
      id: props.formId,
      name: formName.value,
    }).then(() => {
      void refreshFormData()
    })
    setIsEditingFormName(false)
  }

  const onTogglePublish = async () => {
    if (formData?.status === FormStatus.DRAFT) {
      await publishForm({
        id: props.formId,
      }).then(async () => {
        await refreshFormData()
      })
      setShareDialogOpen(true)
      toast.success('フォームを公開しました', {
        position: 'top-center',
        duration: 1500,
      })
    } else {
      await unpublishForm({
        id: props.formId,
      }).then(() => {
        void refreshFormData()
      })
      toast.success('フォームを非公開にしました', {
        position: 'top-center',
        duration: 1500,
      })
    }
  }

  const onToggleView = () => {
    setView(view === 'basic' ? 'flow' : 'basic')
    if (props.formId === 'new') return
    refreshFormData()
  }

  return (
    <BuilderLayout title="dashboard">
      {props.formId !== 'new' && isLoadingFormData ? (
        <div className="flex h-full items-center justify-center">
          <Icons.spinner className="mb-10 h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="flex h-full flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2 items-center min-w-0 flex-1">
              <Button
                size={'sm'}
                onClick={() => void router.push('/dashboard/forms')}
                variant={'secondary'}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              {isEditingFormName ? (
                isUpdatingForm ? (
                  <div className="flex items-center gap-1">
                    <Icons.spinner className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <form
                    onSubmit={updateFormName}
                    className="flex gap-2 items-center flex-1"
                  >
                    <Input
                      id="form-name"
                      className="max-w-xs"
                      placeholder="フォーム名"
                      defaultValue={formData?.name ?? 'New Form'}
                      onMouseEnter={() =>
                        document.getElementById('form-name')?.focus()
                      }
                    />
                    <div className="flex gap-0">
                      <Button size={'sm'} variant={'ghost'} type="submit">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size={'sm'}
                        variant={'ghost'}
                        type="button"
                        onClick={() => setIsEditingFormName(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                )
              ) : (
                <div className="flex gap-1 items-center min-w-0">
                  <h1 className="text-lg font-semibold truncate">
                    {formData?.name ?? 'New Form'}
                  </h1>
                  <Button
                    size={'sm'}
                    variant={'ghost'}
                    onClick={() => setIsEditingFormName(true)}
                    className="flex-shrink-0"
                  >
                    <Edit className="text-muted-foreground h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>

            <Button
              size={'sm'}
              onClick={onToggleView}
              variant={'outline'}
              className="gap-1 h-8 px-3 text-xs flex-shrink-0"
            >
              {view === 'basic' && <Split className="h-3.5 w-3.5" />}
              {view === 'basic' ? 'フロー' : 'ベーシック'}
            </Button>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                type="button"
                size={'sm'}
                onClick={() => {
                  if (!formData?.questions.length) {
                    toast.error('質問を追加してからプレビューしてください', {
                      position: 'top-center',
                      duration: 2000,
                    })
                    return
                  }
                  window.open(
                    `/dashboard/forms/${props.formId}/preview`,
                    '_blank',
                  )
                }}
                variant={'outline'}
                disabled={!formData?.questions.length}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size={'default'}
                onClick={() => void onTogglePublish()}
                variant={
                  formData?.status === FormStatus.PUBLISHED
                    ? 'destructive'
                    : 'default'
                }
                disabled={!formData?.questions.length}
                loading={isPublishingForm || isUnpublishingForm}
                className="min-w-[100px] font-semibold"
              >
                {formData?.status === FormStatus.PUBLISHED
                  ? '非公開にする'
                  : 'フォームを公開'}
              </Button>
              <ShareDialog
                disabled={formData?.status !== FormStatus.PUBLISHED}
                open={shareDialogOpen}
                onOpenChange={setShareDialogOpen}
                link={formData?.link ?? ''}
              />
            </div>
          </div>
          {view === 'flow' ? (
            <ReactFlowProvider>
              <FlowBuilder formId={props.formId} />
            </ReactFlowProvider>
          ) : (
            <BasicBuilder
              questions={questions}
              formData={formData}
              isAddingQuestion={isAddingQuestion}
              isCreatingForm={isCreatingForm}
              isUnpublishingForm={isUnpublishingForm}
              currentQuestion={currentQuestion}
              onAddQuestion={onAddQuestion}
              onEditQuestion={onEditQuestion}
              onDeleteQuestion={onDeleteQuestion}
              reorderQuestions={reorderQuestions}
              setCurrentQuestion={setCurrentQuestion}
              onTogglePublish={onTogglePublish}
            />
          )}
        </div>
      )}
    </BuilderLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {
      formId: ctx.query.id,
    },
  }
}

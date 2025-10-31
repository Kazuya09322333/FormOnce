import { Button, Input, Label, Textarea } from '@components/ui'
import { type Form, FormStatus } from '@prisma/client'
import type { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '~/hooks/useAuth'
import DashboardLayout from '~/layouts/dashboardLayout'
import { getServerAuthSessionSupabase } from '~/server/auth-supabase'
import { api } from '~/utils/api'

export default function NewForm() {
  const router = useRouter()
  const { user } = useAuth()
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const { mutateAsync: createForm } = api.form.create.useMutation({
    onSuccess: (form) => {
      toast.success('フォームが作成されました')
      void router.push(`/dashboard/forms/${form.id}`)
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`)
      setIsCreating(false)
    },
  })

  const handleCreateForm = async () => {
    if (!formName.trim()) {
      toast.error('フォーム名を入力してください')
      return
    }

    if (!user?.id) {
      toast.error('ユーザー情報が取得できません')
      return
    }

    setIsCreating(true)

    try {
      await createForm({
        workspaceId: user.id, // TODO: get workspaceId from Supabase user metadata
        name: formName,
        description: formDescription || undefined,
      })
    } catch (error) {
      // Error handling is done in onError callback
      console.error('Form creation failed:', error)
    }
  }

  const handleCancel = () => {
    void router.push('/dashboard/forms')
  }

  return (
    <DashboardLayout title="新規フォーム作成">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight mb-8">
          新規フォーム作成
        </h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="form-name">
              フォーム名 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="form-name"
              placeholder="例: お客様アンケート"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              disabled={isCreating}
              className="w-full"
            />
            <p className="text-sm text-gray-500">
              フォームの名前を入力してください（後で変更可能）
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-description">説明（任意）</Label>
            <Textarea
              id="form-description"
              placeholder="このフォームの目的や説明を入力してください"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              disabled={isCreating}
              className="w-full min-h-[100px]"
            />
            <p className="text-sm text-gray-500">
              フォームの目的や回答者への説明を記入できます
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleCreateForm}
              disabled={isCreating || !formName.trim()}
              className="min-w-[120px]"
            >
              {isCreating ? '作成中...' : 'フォームを作成'}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={isCreating}
            >
              キャンセル
            </Button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h3 className="font-semibold mb-2">💡 ヒント</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• フォーム名はわかりやすく、具体的なものにしましょう</li>
            <li>• フォーム作成後、質問を追加してカスタマイズできます</li>
            <li>• 動画による質問も追加可能です</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSessionSupabase(ctx)

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }
}

import {
  Button,
  Icons,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui'
import { type Form, FormStatus } from '@prisma/client'
import type { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useAuth } from '~/hooks/useAuth'
import DashboardLayout from '~/layouts/dashboardLayout'
import { getServerAuthSessionSupabase } from '~/server/auth-supabase'
import { api } from '~/utils/api'

export default function Forms() {
  const router = useRouter()

  const onCreateNewForm = () => {
    // Use the original form builder with id="new"
    // This will be handled by [id]/index.tsx
    void router.push('/dashboard/forms/new')
  }

  return (
    <DashboardLayout title="dashboard">
      <div className="flex justify-between">
        <h2 className="text-3xl font-bold tracking-tight">すべてのフォーム</h2>
        <Button onClick={onCreateNewForm}>
          <Icons.plus className="mr-2 h-4 w-4" />
          新しいフォームを作成
        </Button>
      </div>
      <div className="mt-8">
        <AllFormsTable />
      </div>
    </DashboardLayout>
  )
}

export function AllFormsTable() {
  const router = useRouter()
  const { user } = useAuth()

  const {
    data: forms,
    isLoading,
    refetch,
  } = api.form.getAll.useQuery({
    workspaceId: user?.id, // TODO: get workspaceId from Supabase user metadata
  })
  const {
    mutateAsync: deleteForm,
    isLoading: isDeletingForm,
    variables,
  } = api.form.delete.useMutation()

  const handleClick = (form: Form) => {
    // if form is not published, redirect to form editor
    if (form.status == FormStatus.DRAFT) {
      return void router.push(`/dashboard/forms/${form.id}`)
    }

    // if form is published, redirect to form summary
    return void router.push(`/dashboard/forms/${form.id}/summary`)
  }

  const [deletePopoverId, setDeletePopoverId] = useState<string | null>(null)

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setDeletePopoverId(null)
    }
  }

  const onDeleteForm = async (formId: string) => {
    await deleteForm({
      id: formId,
    })
    await refetch()
  }

  return (
    <Table>
      <TableCaption>最近のフォーム一覧</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>フォーム名</TableHead>
          <TableHead>ステータス</TableHead>
          <TableHead>作成日</TableHead>
          <TableHead>更新日</TableHead>
          <TableHead>回答数</TableHead>
          <TableHead>作成者</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              読み込み中...
            </TableCell>
          </TableRow>
        ) : null}
        {forms?.map((form) => (
          <TableRow
            key={form.id}
            className="cursor-pointer"
            onClick={() => handleClick(form)}
          >
            <TableCell className="font-medium">{form.name}</TableCell>
            <TableCell>
              {form.status === FormStatus.PUBLISHED ? '公開中' : '下書き'}
            </TableCell>
            <TableCell className="text-xs">
              {form.createdAt.toLocaleDateString('ja-JP')}
            </TableCell>
            <TableCell className="text-xs">
              {form.updatedAt.toLocaleDateString('ja-JP')}
            </TableCell>
            <TableCell className="text-xs">
              <div className="w-16 text-center">
                {Number(form.FormResponses?.length).toLocaleString()}
              </div>
            </TableCell>
            <TableCell className="text-xs">{form.author?.name}</TableCell>
            <TableCell className="text-xs">
              <Popover
                open={deletePopoverId === form.id}
                onOpenChange={onOpenChange}
              >
                <PopoverTrigger
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <Button
                    variant={'secondary'}
                    size={'icon'}
                    className="hover:bg-destructive/90 hover:text-destructive-foreground"
                    onClick={() => setDeletePopoverId(form.id)}
                  >
                    <Icons.trash className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  className="w-54 space-y-2"
                >
                  {form.status === FormStatus.DRAFT ? (
                    <p className="w-48 text-sm">この下書きを削除しますか？</p>
                  ) : (
                    <>
                      <p className="w-48 text-sm">
                        このフォームを削除しますか？
                      </p>
                      <span className="text-xs text-muted-foreground">
                        このフォームには {form.FormResponses.length}{' '}
                        件の回答があります
                      </span>{' '}
                    </>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => onDeleteForm(form.id)}
                      loading={isDeletingForm && variables?.id === form.id}
                      size={'sm'}
                    >
                      削除
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => onOpenChange(false)}
                      size={'sm'}
                    >
                      キャンセル
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// Server-side auth check removed - using client-side auth via useAuth hook

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui'
import {
  ECTAActionType,
  EQuestionType,
  type TCTAButtonQuestion,
} from '~/types/question.types'

const formSchema = z.object({
  title: z.string().min(1, '質問タイトルは必須です').max(500),
  description: z.string().max(500).optional(),
  buttonText: z.string().min(1, 'ボタンテキストは必須です').max(100),
  actionType: z.nativeEnum(ECTAActionType),
  redirectUrl: z
    .string()
    .url('有効なURLを入力してください')
    .optional()
    .or(z.literal('')),
})

type FormValues = z.infer<typeof formSchema>

type CTAButtonFormProps = {
  onSubmit: (data: Partial<TCTAButtonQuestion>) => void
  defaultValues?: Partial<TCTAButtonQuestion>
}

export function CTAButtonForm({ onSubmit, defaultValues }: CTAButtonFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      buttonText: defaultValues?.buttonText || '次へ',
      actionType: defaultValues?.actionType || ECTAActionType.NextStep,
      redirectUrl: defaultValues?.redirectUrl || '',
    },
  })

  const actionType = form.watch('actionType')

  const handleSubmit = (data: FormValues) => {
    onSubmit({
      ...data,
      type: EQuestionType.CTAButton,
      redirectUrl:
        data.actionType === ECTAActionType.URLRedirect
          ? data.redirectUrl
          : undefined,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>質問タイトル</FormLabel>
              <FormControl>
                <Input placeholder="例: 続行しますか？" {...field} />
              </FormControl>
              <FormDescription>
                回答者に表示されるメインタイトルです
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>説明（オプション）</FormLabel>
              <FormControl>
                <Input
                  placeholder="追加の説明やコンテキストを入力..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="buttonText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ボタンテキスト</FormLabel>
              <FormControl>
                <Input placeholder="例: 次へ進む" {...field} />
              </FormControl>
              <FormDescription>ボタンに表示されるテキストです</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="actionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>アクション</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="アクションを選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
              <FormDescription>
                ボタンをクリックした時の動作を選択します
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {actionType === ECTAActionType.URLRedirect && (
          <FormField
            control={form.control}
            name="redirectUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>リダイレクトURL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com"
                    type="url"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  回答者がリダイレクトされる完全なURLを入力してください
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit">保存</Button>
      </form>
    </Form>
  )
}

import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Icons,
  Input,
  RadioGroup,
  RadioGroupItem,
} from '@components/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { type z } from 'zod'
import {
  EQuestionType,
  ETextSubType,
  type TTextQuestion,
  ZTextQuestion,
} from '~/types/question.types'

const formSchema = ZTextQuestion

const questionSubTypes = Object.values(ETextSubType).map((type) => ({
  label: type,
  value: type,
  icon: Icons[type as keyof typeof Icons],
}))

type TTextQuestionProps =
  | {
      mode: 'add'
      onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>
    }
  | (TTextQuestion & {
      mode: 'edit'
      onEdit: (values: z.infer<typeof formSchema>) => Promise<void>
    })

const TextQuestionForm = (props: TTextQuestionProps) => {
  const [isLoading, setIsloading] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:
      props.mode === 'edit'
        ? {
            title: props.title,
            description: props.description,
            placeholder: props.placeholder,
            type: EQuestionType.Text,
            subType: props.subType,
          }
        : {
            title: '無題の質問',
            description: '',
            placeholder: '',
            type: EQuestionType.Text,
            subType: ETextSubType.FreeText,
          },
    mode: 'onTouched',
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsloading(true)
    // Ensure title is not empty
    const submittedValues = {
      ...values,
      title: values.title.trim() || '無題の質問',
    }
    // This will be type-safe and validated.
    if (props.mode === 'add') await props.onSubmit(submittedValues)
    else await props.onEdit(submittedValues)
    setIsloading(false)
    form.reset()
  }

  function onError(errors: unknown) {
    console.log(errors)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>タイトル</FormLabel>
              <FormDescription>
                ユーザーに表示される質問のタイトル
              </FormDescription>
              <FormControl>
                <Input
                  type="text"
                  placeholder="質問のタイトルを入力"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>説明</FormLabel>
              <FormDescription>
                ユーザーに表示される質問の説明文
              </FormDescription>
              <FormControl>
                <Input type="text" placeholder="質問の説明を入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="placeholder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>プレースホルダー</FormLabel>
              <FormDescription>
                入力欄に表示されるヒントテキスト
              </FormDescription>
              <FormControl>
                <Input
                  type="text"
                  placeholder="例: お名前を入力してください"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>入力タイプ</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-4 gap-4"
                >
                  {questionSubTypes.map((type) => (
                    <FormItem
                      key={type.label}
                      className="flex items-center justify-center rounded-md border border-muted bg-popover px-4 py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <FormLabel className="!mt-0 flex items-center justify-center gap-2 capitalize">
                        {type.icon && <type.icon className="h-4 w-4" />}
                        <p className="text-xs">{type.label}</p>
                      </FormLabel>
                      <FormControl>
                        <RadioGroupItem
                          className="sr-only"
                          value={type.value}
                        />
                      </FormControl>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {props.mode === 'add' ? (
          <Button type="submit" loading={isLoading}>
            質問を追加
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={!form.formState.isDirty}
            loading={isLoading}
          >
            質問を編集
          </Button>
        )}
      </form>
    </Form>
  )
}

export { TextQuestionForm }

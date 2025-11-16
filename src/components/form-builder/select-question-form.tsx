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
  Switch,
} from '@components/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { type z } from 'zod'
import {
  EQuestionType,
  ESelectSubType,
  type TSelectQuestion,
  ZSelectQuestion,
} from '~/types/question.types'

const formSchema = ZSelectQuestion

type TSelectQuestionForm =
  | {
      mode: 'add'
      onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>
    }
  | (TSelectQuestion & {
      mode: 'edit'
      onEdit: (values: z.infer<typeof formSchema>) => Promise<void>
    })

const SelectQuestionForm = (props: TSelectQuestionForm) => {
  const [isLoading, setIsloading] = React.useState(false)

  const defaultOptions = React.useMemo(() => {
    if (props.mode === 'edit') {
      return props.options && props.options.length > 0
        ? props.options
        : ['選択肢 1', '選択肢 2']
    }
    return ['選択肢 1', '選択肢 2']
  }, [props.mode, props.mode === 'edit' ? props.options : undefined])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:
      props.mode === 'edit'
        ? {
            title: props.title,
            description: props.description,
            placeholder: props.placeholder,
            type: EQuestionType.Select,
            subType: props.subType,
            options: defaultOptions,
          }
        : {
            title: '無題の質問',
            description: '',
            placeholder: '',
            type: EQuestionType.Select,
            subType: ESelectSubType.Single,
            options: defaultOptions,
          },
    mode: 'onTouched',
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
    rules: {
      minLength: {
        value: 2,
        message: 'You need to have at least 2 options',
      },
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsloading(true)
    // Ensure title is not empty
    const submittedValues = {
      ...values,
      title: values.title.trim() || '無題の質問',
      options:
        values.options && values.options.length > 0
          ? values.options
          : ['選択肢 1', '選択肢 2'],
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
              <FormLabel className="text-foreground">タイトル</FormLabel>
              <FormDescription className="text-muted-foreground">
                ユーザーに表示される質問のタイトル
              </FormDescription>
              <FormControl>
                <Input
                  type="text"
                  placeholder="質問のタイトルを入力"
                  {...field}
                  className="bg-background text-foreground"
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
              <FormLabel className="text-foreground">説明</FormLabel>
              <FormDescription className="text-muted-foreground">
                ユーザーに表示される質問の説明文
              </FormDescription>
              <FormControl>
                <Input
                  type="text"
                  placeholder="質問の説明を入力"
                  {...field}
                  className="bg-background text-foreground"
                />
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
              <FormLabel className="text-foreground">
                プレースホルダー
              </FormLabel>
              <FormDescription className="text-muted-foreground">
                入力欄に表示されるヒントテキスト
              </FormDescription>
              <FormControl>
                <Input
                  type="text"
                  placeholder="例: 選択してください"
                  {...field}
                  className="bg-background text-foreground"
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
              <div className="flex gap-3">
                <FormLabel className="text-foreground">
                  複数選択を許可
                </FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value === ESelectSubType.Multiple}
                    onCheckedChange={(b) =>
                      b
                        ? field.onChange(ESelectSubType.Multiple)
                        : field.onChange(ESelectSubType.Single)
                    }
                  />
                </FormControl>
              </div>
              <FormDescription className="text-muted-foreground">
                ユーザーが複数の選択肢を選べるようにします
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-foreground">選択肢</h3>
          {fields &&
            fields.length > 0 &&
            fields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`options.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="選択肢を入力"
                          {...field}
                          className="bg-background text-foreground"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        size="icon"
                        variant={'ghost'}
                        onClick={() => remove(index)}
                        className="text-foreground hover:bg-destructive/90 hover:text-destructive-foreground"
                      >
                        <Icons.trash className="h-5 w-5" />
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
            ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => append(`選択肢 ${(fields?.length ?? 0) + 1}`)}
            className="w-full text-foreground"
          >
            <Plus className="mr-2 h-4 w-4" />
            選択肢を追加
          </Button>
        </div>
        {props.mode === 'add' ? (
          <Button type="submit">質問を追加</Button>
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

export { SelectQuestionForm }

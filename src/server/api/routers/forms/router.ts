import { randomUUID } from 'crypto'
import {
  type Form,
  type FormResponse,
  type FormViews,
  type Prisma,
  WebhookTriggerEvent,
} from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '~/lib/supabase'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc'
import type { TFormSchema } from '~/types/form.types'
import { ELogicCondition, TLogic, type TQuestion } from '~/types/question.types'
import { ZAddQuestion } from './dtos/addQuestion'
import { ZCreateForm } from './dtos/createForm'
import { ZEditQuestion } from './dtos/editQuestion'
import { ZUpdateForm } from './dtos/updateForm'
import { questionToJsonSchema } from './helpers/questionToJsonSchema'

/** Index
 * getAll: protectedProcedure - get all forms for a workspace
 * getOne: protectedProcedure - get a single form by id
 * create: protectedProcedure - create a new form
 * update: protectedProcedure - update a form
 * addQuestion: protectedProcedure - add a question to a form
 * publish: protectedProcedure - publish a form
 * unpublish: protectedProcedure - unpublish a form
 * getPublicFormData: publicProcedure - get form data for a form
 * submitResponse: publicProcedure - submit a response to a form
 * duplicateQuestion: protectedProcedure - duplicate a question in a form
 **/

export const formRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ workspaceId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      try {
        const supabase = getSupabaseAdmin()

        let workspaceId = input.workspaceId

        // If workspaceId not provided, get it from user's workspace membership
        if (!workspaceId) {
          const { data: user, error: userError } = await supabase
            .from('User')
            .select('*, WorkspaceMember(Workspace(id))')
            .eq('id', ctx.session.user.id)
            .single()

          type UserWithWorkspaceMembers = {
            WorkspaceMember: Array<{ Workspace: { id: string } }>
          }

          if (userError || !user) {
            console.log('User not found:', userError)
            throw new TRPCError({
              code: 'UNAUTHORIZED',
              message: 'User not found',
            })
          }

          const typedUser = user as UserWithWorkspaceMembers
          if (
            typedUser.WorkspaceMember &&
            typedUser.WorkspaceMember.length > 0
          ) {
            workspaceId = typedUser.WorkspaceMember[0]!.Workspace.id
          }
        }

        if (!workspaceId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Workspace ID is required',
          })
        }

        const { data, error } = await supabase
          .from('Form')
          .select(
            '*, author:User!authorId(name, email, id), FormResponses:FormResponse(*)',
          )
          .eq('workspaceId', workspaceId)
          .order('createdAt', { ascending: false })

        if (error) {
          console.log(error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong',
          })
        }

        return data as (Form & {
          author?: { name: string | null; email: string; id: string } | null
          FormResponses?: FormResponse[]
        })[]
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        })
      }
    }),
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        includeResponses: z.boolean().optional(),
        includeViews: z.boolean().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const supabase = getSupabaseAdmin()

        type TResponse = {
          form?: Form
          FormResponses?: (FormResponse & {
            FormViews: FormViews
          })[]
          FormViews?: FormViews[]
        }

        const response: TResponse = {}

        const workspaceId = ctx.session?.user?.workspaceId

        if (!workspaceId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Workspace ID is required',
          })
        }

        const { data: form, error: formError } = await supabase
          .from('Form')
          .select('*, author:User!authorId(name, email, id)')
          .eq('id', input.id)
          .eq('workspaceId', workspaceId)
          .single()

        if (formError || !form) {
          console.log(formError)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Form not found',
          })
        }

        response.form = form as Form

        if (input.includeResponses) {
          const { data: formResponses, error: responsesError } = await supabase
            .from('FormResponse')
            .select('*, FormViews(*)')
            .eq('formId', input.id)
            .order('completed', { ascending: false })

          if (responsesError) {
            console.log(responsesError)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to fetch responses',
            })
          }

          response.FormResponses = formResponses as (FormResponse & {
            FormViews: FormViews
          })[]
        }

        if (input.includeViews) {
          const { data: formViews, error: viewsError } = await supabase
            .from('FormViews')
            .select('*')
            .eq('formId', input.id)
            .order('createdAt', { ascending: false })

          if (viewsError) {
            console.log(viewsError)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to fetch views',
            })
          }

          response.FormViews = formViews as FormViews[]
        }

        return response
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        })
      }
    }),
  create: protectedProcedure
    .input(ZCreateForm)
    .mutation(async ({ ctx, input }) => {
      try {
        const supabase = getSupabaseAdmin()

        const formSchema: TFormSchema = {
          type: 'object',
          properties: {},
          required: [],
        }

        const questions: TQuestion[] = []

        input.questions.forEach((question, i) => {
          // generate unique ID for each question to prevent overwrites
          const questionId = randomUUID()
          const jsonSchema = questionToJsonSchema(question)

          if (jsonSchema !== null) {
            formSchema.properties = {
              ...formSchema.properties,
              [questionId]: jsonSchema,
            }

            formSchema.required.push(questionId)

            questions.push({
              ...question,
              id: questionId,
              position: {
                x: 400 * i,
                y: 100,
              },
              logic: [
                {
                  questionId,
                  condition:
                    question.type === 'select'
                      ? ELogicCondition.IS_ONE_OF
                      : ELogicCondition.ALWAYS,
                  value: question.type === 'select' ? question.options : '',
                  skipTo: 'end',
                },
              ],
            })
          }
        })

        // Ensure user exists in database first
        const { data: existingUser, error: userError } = await supabase
          .from('User')
          .select('*, WorkspaceMember(Workspace(id))')
          .eq('id', ctx.session.user.id)
          .single()

        type UserWithWorkspaceMembers = {
          WorkspaceMember: Array<{ Workspace: { id: string } }>
        }

        let workspaceId: string

        if (userError && (userError as any).code === 'PGRST116') {
          // User doesn't exist - create user and workspace together
          const { data: newWorkspace, error: workspaceError } = await supabase
            .from('Workspace')
            .insert({
              name: `${
                ctx.session.user.name || ctx.session.user.email
              }'s Workspace`,
              isPersonal: true,
            } as any)
            .select('id')
            .single()

          if (workspaceError || !newWorkspace) {
            console.log(workspaceError)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to create workspace',
            })
          }

          // @ts-expect-error - Supabase type inference issue
          workspaceId = newWorkspace.id as string

          const { error: newUserError } = await supabase.from('User').insert({
            id: ctx.session.user.id,
            email: ctx.session.user.email!,
            name: ctx.session.user.name!,
          } as any)

          if (newUserError) {
            console.log(newUserError)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to create user',
            })
          }

          const { error: memberError } = await supabase
            .from('WorkspaceMember')
            .insert({
              userId: ctx.session.user.id,
              workspaceId: workspaceId,
              role: 'OWNER',
            } as any)

          if (memberError) {
            console.log(memberError)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to create workspace member',
            })
          }
        } else if (
          existingUser &&
          (existingUser as UserWithWorkspaceMembers).WorkspaceMember &&
          Array.isArray(
            (existingUser as UserWithWorkspaceMembers).WorkspaceMember,
          ) &&
          (existingUser as UserWithWorkspaceMembers).WorkspaceMember.length > 0
        ) {
          // User exists and has workspace
          workspaceId = (existingUser as UserWithWorkspaceMembers)
            .WorkspaceMember[0]!.Workspace.id
        } else {
          // User exists but no workspace - create one
          const { data: newWorkspace, error: workspaceError } = await supabase
            .from('Workspace')
            .insert({
              name: `${
                ctx.session.user.name || ctx.session.user.email
              }'s Workspace`,
              isPersonal: true,
            } as any)
            .select('id')
            .single()

          if (workspaceError || !newWorkspace) {
            console.log(workspaceError)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to create workspace',
            })
          }

          // @ts-expect-error - Supabase type inference issue
          workspaceId = newWorkspace.id as string

          const { error: memberError } = await supabase
            .from('WorkspaceMember')
            .insert({
              userId: ctx.session.user.id,
              workspaceId: workspaceId,
              role: 'OWNER',
            } as any)

          if (memberError) {
            console.log(memberError)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to create workspace member',
            })
          }
        }

        const { data: newForm, error: formError } = await supabase
          .from('Form')
          .insert({
            id: randomUUID(),
            workspaceId: workspaceId,
            authorId: ctx.session.user.id,
            name: input.name,
            formSchema: formSchema as any,
            questions: questions as any,
            updatedAt: new Date().toISOString(),
          } as any)
          .select()
          .single()

        if (formError || !newForm) {
          console.log(formError)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create form',
          })
        }

        return newForm as Form
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        })
      }
    }),

  update: protectedProcedure
    .input(ZUpdateForm)
    .mutation(async ({ ctx, input }) => {
      try {
        const supabase = getSupabaseAdmin()

        const updateData: {
          name?: string
          formSchema?: any
          questions?: any
        } = {}

        if (input.name !== undefined) updateData.name = input.name
        if (input.formSchema !== undefined)
          updateData.formSchema = input.formSchema as any
        if (input.questions !== undefined)
          updateData.questions = input.questions as any

        const { data, error } = await supabase
          .from('Form')
          // @ts-ignore - Supabase type inference issue
          .update(updateData as any)
          .eq('id', input.id)
          .select()
          .single()

        if (error || !data) {
          console.log(error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update form',
          })
        }

        return data as Form
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        })
      }
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = getSupabaseAdmin()

        const { data, error } = await supabase
          .from('Form')
          .delete()
          .eq('id', input.id)
          .select()
          .single()

        if (error || !data) {
          console.log(error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete form',
          })
        }

        return data as Form
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        })
      }
    }),

  addQuestion: protectedProcedure
    .input(ZAddQuestion)
    .mutation(async ({ ctx, input }) => {
      try {
        const supabase = getSupabaseAdmin()

        // Get form and verify ownership through authorId
        const { data: form, error: formError } = await supabase
          .from('Form')
          .select('*')
          .eq('id', input.formId)
          .eq('authorId', ctx.session.user.id)
          .single()

        if (formError || !form) {
          console.log(formError)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message:
              'Form not found or you do not have permission to edit this form',
          })
        }

        // generate a new question id - use UUID to ensure uniqueness
        const questionId = randomUUID()

        // 1. convert question to a jsonSchema object
        const jsonSchema = questionToJsonSchema(input.question)

        // 2. update formSchema & questions array
        const questions = (form as any).questions as TQuestion[]

        // 2.1 calculate the position of the new question
        const targetIdx = input.targetIdx ?? questions.length
        const newQuestion = {
          ...input.question,
          id: questionId,
          position: {
            x:
              questions[targetIdx]?.position?.x! ||
              questions[targetIdx - 1]?.position?.x! + 600 ||
              600,
            y: questions[targetIdx]?.position?.y!
              ? questions[targetIdx]?.position?.y! -
                (questions[targetIdx]?.logic?.length ?? 1) * 400
              : questions[targetIdx - 1]?.position?.y! || 100,
          },
          logic: [
            {
              questionId,
              condition:
                input.question.type === 'select'
                  ? ELogicCondition.IS_ONE_OF
                  : ELogicCondition.ALWAYS,
              value:
                input.question.type === 'select' ? input.question.options : '',
              skipTo: input.targetQuestionId,
            },
          ],
        }

        // 2.2 insert the new question at the targetIdx
        questions.splice(targetIdx, 0, newQuestion)

        // 3. shift the position of the questions after the targetIdx
        for (let i = targetIdx + 1; i < questions.length; i++) {
          questions[i]!.position = {
            x: questions[i]?.position?.x! + 600,
            y: questions[i]?.position?.y!,
          }
        }

        // update logic in the source question
        if (input.sourceLogic) {
          for (const question of questions) {
            if (question.id === input.sourceLogic.questionId) {
              console.log('[DEBUG] Source question found:', {
                questionId: question.id,
                questionType: question.type,
                logicCount: question.logic?.length,
                logic: question.logic,
              })

              if (question.type === 'select') {
                // remove the values that are in the sourceLogic from the existing logics
                const updatedLogic: TLogic[] = question.logic!.flatMap((l) => {
                  console.log('[DEBUG] Processing logic item:', {
                    value: l.value,
                    isArray: Array.isArray(l.value),
                    valueType: typeof l.value,
                  })

                  // Check if value is an array before filtering
                  if (!Array.isArray(l.value)) {
                    // If it's not an array (text question), keep the logic as-is
                    return l
                  }

                  const exisitingValues = l.value as string[]

                  const newValues = exisitingValues.filter(
                    (v) => !input.sourceLogic!.value.includes(v),
                  )

                  if (newValues.length === 0) {
                    return []
                  }

                  return {
                    ...l,
                    value: newValues,
                  }
                })

                updatedLogic.push({
                  ...input.sourceLogic,
                  skipTo: questionId,
                })

                question.logic = updatedLogic
              } else {
                question.logic = [
                  {
                    ...input.sourceLogic,
                    skipTo: questionId,
                  },
                ]
              }
            }
          }
        }

        const formSchema = (form as any).formSchema as TFormSchema
        if (jsonSchema !== null) {
          formSchema.properties = {
            ...formSchema.properties,
            [questionId]: jsonSchema,
          }
        }

        formSchema.required = [...formSchema.required, questionId]

        // 3. update the form with the new formSchema & updated questions
        const updateData: {
          formSchema?: any
          questions?: any
        } = {
          formSchema: formSchema as any,
          questions: questions as any,
        }

        const { data, error } = await supabase
          .from('Form')
          // @ts-ignore - Supabase type inference issue
          .update(updateData as any)
          .eq('id', input.formId)
          .eq('authorId', ctx.session.user.id)
          .select()
          .single()

        if (error || !data) {
          console.log(error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update form',
          })
        }

        return data as Form
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        })
      }
    }),

  editQuestion: protectedProcedure
    .input(ZEditQuestion)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = getSupabaseAdmin()

        // Get form and verify ownership through authorId instead of workspaceId
        const { data: form, error: formError } = await supabase
          .from('Form')
          .select('*')
          .eq('id', input.formId)
          .eq('authorId', ctx.session.user.id)
          .single()

        if (formError || !form) {
          console.log(formError)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message:
              "Form not found or you don't have permission to edit this form",
          })
        }

        const questions = (form as any).questions as TQuestion[]
        const questionIndex = questions.findIndex(
          (q) => q.id === input.question.id,
        )

        if (questionIndex === -1) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message:
              "Question not found or you don't have permission to edit this question",
          })
        }

        questions[questionIndex] = {
          ...questions[questionIndex],
          ...input.question,
        }

        // update formSchema
        const formSchema = (form as any).formSchema as TFormSchema
        const jsonSchema = questionToJsonSchema(input.question)

        if (jsonSchema !== null) {
          formSchema.properties = {
            ...formSchema.properties,
            [input.question.id]: jsonSchema,
          }
        } else {
          delete formSchema.properties?.[input.question.id]
          formSchema.required = formSchema.required.filter(
            (id) => id !== input.question.id,
          )
        }

        const updateData: {
          questions?: any
          formSchema?: any
        } = {
          questions: questions as any,
          formSchema: formSchema as any,
        }

        const { data, error } = await supabase
          .from('Form')
          // @ts-ignore - Supabase type inference issue
          .update(updateData as any)
          .eq('id', input.formId)
          .select()
          .single()

        if (error || !data) {
          console.log(error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update form',
          })
        }

        return data as Form
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        })
      }
    }),

  deleteQuestion: protectedProcedure
    .input(
      z.object({
        formId: z.string(),
        questionId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = getSupabaseAdmin()

        const workspaceId = ctx.session?.user?.workspaceId

        if (!workspaceId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Workspace ID is required',
          })
        }

        const { data: form, error: formError } = await supabase
          .from('Form')
          .select('*')
          .eq('id', input.formId)
          .eq('workspaceId', workspaceId)
          .single()

        if (formError || !form) {
          console.log(formError)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message:
              "Form not found or you don't have permission to edit this form",
          })
        }

        const questions = (form as any).questions as TQuestion[]
        const questionIndex = questions.findIndex(
          (q) => q.id === input.questionId,
        )

        if (questionIndex === -1) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message:
              "Question not found or you don't have permission to edit this question",
          })
        }

        questions.splice(questionIndex, 1)

        const formSchema = (form as any).formSchema as TFormSchema
        delete formSchema.properties![input.questionId]
        formSchema.required = formSchema.required.filter(
          (id) => id !== input.questionId,
        )

        const updateData: {
          questions?: any
          formSchema?: any
        } = {
          questions: questions as any,
          formSchema: formSchema as any,
        }

        const { data, error } = await supabase
          .from('Form')
          // @ts-ignore - Supabase type inference issue
          .update(updateData as any)
          .eq('id', input.formId)
          .select()
          .single()

        if (error || !data) {
          console.log(error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update form',
          })
        }

        return data as Form
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        })
      }
    }),

  publish: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = getSupabaseAdmin()
        const link = `https://formonce.in/forms/${input.id}`

        const updateData: {
          status?: string
          link?: string
        } = {
          status: 'PUBLISHED',
          link: link,
        }

        const { data, error } = await supabase
          .from('Form')
          // @ts-ignore - Supabase type inference issue
          .update(updateData as any)
          .eq('id', input.id)
          .select()
          .single()

        if (error || !data) {
          console.log(error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to publish form',
          })
        }

        return data as Form
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        })
      }
    }),
  unpublish: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = getSupabaseAdmin()

        const updateData: {
          status?: string
        } = {
          status: 'DRAFT',
        }

        const { data, error } = await supabase
          .from('Form')
          // @ts-ignore - Supabase type inference issue
          .update(updateData as any)
          .eq('id', input.id)
          .select()
          .single()

        if (error || !data) {
          console.log(error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to unpublish form',
          })
        }

        return data as Form
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        })
      }
    }),

  // public procedure to get formData for a form, used to render the live forms
  getPublicFormData: publicProcedure
    .input(
      z.object({
        id: z.string(),
        increaseViewCount: z.boolean().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const supabase = getSupabaseAdmin()

        const { data: form, error: formError } = await supabase
          .from('Form')
          .select('formSchema, questions, name')
          .eq('id', input.id)
          .eq('status', 'PUBLISHED')
          .single()

        if (formError) {
          console.log(formError)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Form not found',
          })
        }

        let formView: { id: string } | undefined = undefined
        if (input.increaseViewCount) {
          const ZIpSchema = z.string().ip()

          const parsedIp = ZIpSchema.safeParse(
            ctx.req.headers['x-forwarded-for'] ?? ctx.req.socket.remoteAddress,
          )

          const ip = parsedIp.success ? parsedIp.data : undefined
          const userAgent = ctx.req.headers['user-agent']

          const insertData: {
            formId: string
            ip?: string
            userAgent?: string
          } = {
            formId: input.id,
          }

          if (ip) insertData.ip = ip
          if (userAgent) insertData.userAgent = userAgent

          const { data: newFormView, error: viewError } = await supabase
            .from('FormViews')
            .insert(insertData as any)
            .select()
            .single()

          if (viewError) {
            console.log(viewError)
          } else if (newFormView) {
            formView = newFormView as { id: string }
          }
        }

        return { form, formViewId: formView?.id }
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        })
      }
    }),

  // public procedure to submit a response to a form
  submitResponse: publicProcedure
    .input(
      z.object({
        formId: z.string(),
        response: z.object({}).passthrough(),
        formViewId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = getSupabaseAdmin()

        const insertData: {
          formId: string
          response: any
          completed?: string
          formViewsId: string
        } = {
          formId: input.formId,
          response: input.response,
          completed: new Date().toISOString(),
          formViewsId: input.formViewId,
        }

        const { data: formresponse, error: responseError } = await supabase
          .from('FormResponse')
          .insert(insertData as any)
          .select('*, Forms:Form!formId(*)')
          .single()

        if (responseError || !formresponse) {
          console.log(responseError)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to submit response',
          })
        }

        type FormResponseWithForm = typeof formresponse & {
          completed: string | null
          Forms: { name: string }
        }

        const typedFormResponse = formresponse as FormResponseWithForm

        // execute webhook
        const workspaceId = ctx.session?.user?.workspaceId
        if (workspaceId) {
          const { data: webhooks, error: webhookError } = await supabase
            .from('Webhook')
            .select('*')
            .eq('workspaceId', workspaceId)
            .eq('enabled', true)
            .contains('events', [WebhookTriggerEvent.RESPONSE_SUBMITTED])

          if (webhookError) {
            console.log(webhookError)
          }

          if (webhooks && webhooks.length > 0) {
            const payload = {
              // @ts-ignore - Supabase type inference issue
              form: typedFormResponse.Forms.name,
              formId: input.formId,
              event: WebhookTriggerEvent.RESPONSE_SUBMITTED,
              response: input.response,
              // @ts-ignore - Supabase type inference issue
              submittedAt: typedFormResponse.completed,
            }

            type WebhookType = {
              id: string
              url: string
              secret: string
            }

            webhooks.forEach(async (webhook) => {
              const typedWebhook = webhook as WebhookType
              const response = await fetch(typedWebhook.url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-MovFlow-Secret': typedWebhook.secret,
                },
                body: JSON.stringify(payload),
              })

              if (response.ok) {
                console.log('Webhook sent successfully')
              } else {
                console.log('Webhook failed to send')
              }

              const responseText = await response.text()
              let responseBody: Prisma.InputJsonValue

              try {
                responseBody = JSON.parse(responseText) as Prisma.InputJsonValue
              } catch (error) {
                responseBody = responseText
              }

              // create WebhookRecord
              // @ts-ignore - Supabase type inference issue
              await supabase.from('WebhookRecord').insert({
                webhookId: typedWebhook.id,
                event: WebhookTriggerEvent.RESPONSE_SUBMITTED,
                payload: payload,
                responseBody: responseBody,
                responseStatus: response.status,
                responseHeaders: Object.fromEntries(response.headers.entries()),
              } as any)
            })
          }
        }

        return formresponse
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        })
      }
    }),

  duplicateQuestion: protectedProcedure
    .input(
      z.object({
        formId: z.string(),
        questionId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = getSupabaseAdmin()

        const workspaceId = ctx.session?.user?.workspaceId

        if (!workspaceId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Workspace ID is required',
          })
        }

        const { data: form, error: formError } = await supabase
          .from('Form')
          .select('*')
          .eq('id', input.formId)
          .eq('workspaceId', workspaceId)
          .single()

        if (formError || !form) {
          console.log(formError)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message:
              "Form not found or you don't have permission to edit this form",
          })
        }

        const questions = (form as any).questions as TQuestion[]
        const questionIndex = questions.findIndex(
          (q) => q.id === input.questionId,
        )

        if (questionIndex === -1) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message:
              "Question not found or you don't have permission to edit this question",
          })
        }

        const question = questions[questionIndex]!

        const newTitle = `${question.title} (copy)`

        // generate unique ID for the duplicated question to prevent overwrites
        const newQuestionId = randomUUID()

        const newQuestion = {
          ...question,
          title: newTitle,
          id: newQuestionId,
          position: {
            x: question.position?.x ?? 0,
            y: (question.position?.y ?? 0) + 400,
          },
        }

        questions.splice(questionIndex + 1, 0, newQuestion)

        const formSchema = (form as any).formSchema as TFormSchema
        const jsonSchema = questionToJsonSchema(question)

        if (jsonSchema !== null) {
          formSchema.properties = {
            ...formSchema.properties,
            [newQuestionId]: jsonSchema,
          }
        }

        formSchema.required = [...formSchema.required, newQuestionId]

        const updateData: {
          questions?: any
          formSchema?: any
        } = {
          questions: questions as any,
          formSchema: formSchema as any,
        }

        const { data, error } = await supabase
          .from('Form')
          // @ts-ignore - Supabase type inference issue
          .update(updateData as any)
          .eq('id', input.formId)
          .select()
          .single()

        if (error || !data) {
          console.log(error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update form',
          })
        }

        return data as Form
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        })
      }
    }),
  getAnalytics: protectedProcedure
    .input(
      z.object({
        formId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const supabase = getSupabaseAdmin()
        const workspaceId = ctx.session?.user?.workspaceId

        if (!workspaceId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Workspace ID is required',
          })
        }

        // フォームの存在確認
        const { data: form, error: formError } = await supabase
          .from('Form')
          .select('id')
          .eq('id', input.formId)
          .eq('workspaceId', workspaceId)
          .single()

        if (formError || !form) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Form not found',
          })
        }

        // ビュー数を取得
        const { data: views, error: viewsError } = await supabase
          .from('FormViews')
          .select('*')
          .eq('formId', input.formId)

        if (viewsError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch views',
          })
        }

        // 回答を取得
        const { data: responses, error: responsesError } = await supabase
          .from('FormResponse')
          .select('*')
          .eq('formId', input.formId)

        if (responsesError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch responses',
          })
        }

        return {
          views: views as FormViews[],
          responses: responses as FormResponse[],
        }
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        })
      }
    }),
})

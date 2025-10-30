import { Button, Icons, Input } from '@components/ui'
import { cn } from '@utils/cn'
import { useFormik } from 'formik'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { toast } from 'sonner'
import RootLayout from '~/layouts/rootLayout'
import { supabase } from '~/lib/supabase'

export interface UserAuthFormProps
  extends React.HTMLAttributes<HTMLDivElement> {
  role: 'signin' | 'signup'
}

export function UserAuthFormSupabase({
  className,
  ...props
}: UserAuthFormProps) {
  const [isGithubLoading, setisGithubLoading] = useState(false)
  const [isGoogleLoading, setisGoogleLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  function onSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    void formik.submitForm()
  }

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      name: '',
    },
    validate: (values) => {
      const errors: Record<string, string> = {}
      if (!values.email) {
        errors.email = 'Email is required'
      }
      if (!values.password) {
        errors.password = 'Password is required'
      }
      if (props.role === 'signup' && !values.name) {
        errors.name = 'Username is required'
      }
      return errors
    },
    onSubmit: async (values) => {
      setIsLoading(true)

      try {
        if (props.role === 'signup') {
          // サインアップ
          const { data, error } = await supabase.auth.signUp({
            email: values.email,
            password: values.password,
            options: {
              data: {
                name: values.name,
              },
            },
          })

          if (error) throw error

          toast.success('Confirmation email sent! Please check your inbox.', {
            position: 'top-center',
            duration: 4000,
            closeButton: true,
          })

          // サインインページにリダイレクト
          void router.push('/auth/signin')
        } else {
          // サインイン
          const { data, error } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
          })

          if (error) throw error

          toast.success('Signed in successfully!', {
            position: 'top-center',
            duration: 2000,
            closeButton: true,
          })

          // ダッシュボードにリダイレクト
          void router.push('/dashboard')
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message, {
            position: 'top-center',
            duration: 3000,
            closeButton: true,
          })
        }
      } finally {
        setIsLoading(false)
      }
    },
  })

  const handleGithubSignIn = async () => {
    setisGithubLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error(error.message, {
          position: 'top-center',
          duration: 3000,
          closeButton: true,
        })
      }
    } catch (error) {
      console.error('GitHub sign in error:', error)
    } finally {
      setisGithubLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setisGoogleLoading(true)
    const redirectUrl = `${window.location.origin}/auth/callback`
    console.log('[Google OAuth] Starting sign in with redirect:', redirectUrl)

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      })

      console.log('[Google OAuth] Response:', { data, error })

      if (error) {
        console.error('[Google OAuth] Error:', error)
        toast.error(error.message, {
          position: 'top-center',
          duration: 3000,
          closeButton: true,
        })
      } else {
        console.log('[Google OAuth] Success, should redirect to:', data.url)
      }
    } catch (error) {
      console.error('[Google OAuth] Exception:', error)
    } finally {
      setisGoogleLoading(false)
    }
  }

  return (
    <RootLayout title="Authentication">
      <div className={cn('grid gap-6', className)} {...props}>
        <form onSubmit={onSubmit}>
          <div className="grid gap-2">
            <div className="grid gap-4">
              <Input
                id="email"
                label="Email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                value={formik.values.email}
                onChange={formik.handleChange}
              />
              {props.role === 'signup' && (
                <Input
                  id="name"
                  label="Username"
                  placeholder="jhon doe"
                  type="text"
                  autoComplete="username"
                  autoCorrect="on"
                  disabled={isLoading}
                  value={formik.values.name}
                  onChange={formik.handleChange}
                />
              )}
              <Input
                id="password"
                label="Password"
                placeholder="********"
                type="password"
                pattern=".{6,}"
                title="Password must be at least 6 characters"
                autoComplete="password"
                disabled={isLoading}
                value={formik.values.password}
                onChange={formik.handleChange}
              />
            </div>
            <Button disabled={isLoading}>
              {(isLoading || formik.isSubmitting) && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              {props.role === 'signin' ? 'Sign in' : 'Sign up'} with Email
            </Button>
          </div>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2">
          <Button
            variant="outline"
            disabled={isLoading || isGithubLoading || isGoogleLoading}
            onClick={handleGithubSignIn}
          >
            {isGithubLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.gitHub className="mr-2 h-4 w-4" />
            )}{' '}
            Github
          </Button>
          <Button
            variant="outline"
            loading={isGoogleLoading}
            disabled={isLoading || isGoogleLoading || isGithubLoading}
            onClick={handleGoogleSignIn}
          >
            <Icons.google className="mr-2 h-4 w-4" /> Google
          </Button>
        </div>
      </div>
    </RootLayout>
  )
}

import { type Metadata } from 'next'
import Link from 'next/link'

import { UserAuthForm } from '~/components/auth'
import RootLayout from '~/layouts/rootLayout'

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.',
}

export default function AuthenticationPage() {
  return (
    <RootLayout title="ログイン">
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-zinc-950 text-zinc-50 selection:bg-zinc-800">
        
        {/* Animated Background - Business Growth Theme */}
        <div className="absolute inset-0 z-0 pointer-events-none">
           {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#3f3f46_1px,transparent_1px),linear-gradient(to_bottom,#3f3f46_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.2]" />
          
          {/* Rising Gradient Orbs - Symbolizing Growth */}
          <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-zinc-700/20 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
          
          {/* Rising Lines Animation */}
          <style dangerouslySetInnerHTML={{
              __html: `
                @keyframes rise {
                  0% { transform: translateY(100vh) scaleY(1); opacity: 0; }
                  20% { opacity: 0; }
                  50% { opacity: 0.6; }
                  80% { opacity: 0; }
                  100% { transform: translateY(-20vh) scaleY(1.5); opacity: 0; }
                }
                .growth-line {
                  position: absolute;
                  bottom: 0;
                  width: 1px;
                  background: linear-gradient(to top, transparent, rgba(255, 255, 255, 0.5), transparent);
                  animation: rise var(--duration) infinite linear;
                  animation-delay: var(--delay);
                  left: var(--left);
                  height: var(--height);
                  opacity: 0;
                }
              `
            }} />
            
            <div className="growth-line" style={{ '--duration': '7s', '--delay': '0s', '--left': '15%', '--height': '300px' } as React.CSSProperties} />
            <div className="growth-line" style={{ '--duration': '10s', '--delay': '2s', '--left': '35%', '--height': '400px' } as React.CSSProperties} />
            <div className="growth-line" style={{ '--duration': '8s', '--delay': '1s', '--left': '55%', '--height': '250px' } as React.CSSProperties} />
            <div className="growth-line" style={{ '--duration': '12s', '--delay': '3s', '--left': '75%', '--height': '350px' } as React.CSSProperties} />
            <div className="growth-line" style={{ '--duration': '9s', '--delay': '4s', '--left': '90%', '--height': '450px' } as React.CSSProperties} />
        </div>

        {/* Main Container */}
        <div className="relative z-10 w-full max-w-[350px] space-y-12 px-4 sm:px-0">
          
          {/* Header Section */}
          <div className="flex flex-col items-center space-y-6 text-center">
            {/* Minimal Logo */}
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-50 ring-1 ring-zinc-800/50 shadow-xl shadow-zinc-950/50">
               <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-medium tracking-tight text-zinc-100">
                おかえりなさい
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                アカウント情報を入力してログインしてください
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="space-y-8">
            <UserAuthForm role="signin" />
            
            <p className="text-center text-sm text-zinc-500">
              アカウントをお持ちでないですか？{' '}
              <Link 
                href="/auth/signup" 
                className="font-medium text-zinc-300 hover:text-white transition-colors underline underline-offset-4"
              >
                新規登録
              </Link>
            </p>
          </div>

        </div>
      </div>
    </RootLayout>
  )
}

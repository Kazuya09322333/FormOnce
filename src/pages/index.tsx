import { GitHubLogoIcon } from '@radix-ui/react-icons'
import {
  ArrowRight,
  BarChart,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cloud,
  Code,
  Crown,
  FileText,
  Gauge,
  Globe,
  HeartHandshake,
  Linkedin,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Palette,
  Phone,
  PlayCircle,
  Rocket,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Twitter,
  Users,
  Video,
  X,
  Youtube,
  Zap,
} from 'lucide-react'
import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui'
import RootLayout from '~/layouts/rootLayout'
import { supabase } from '~/lib/supabase'
import { getServerAuthSessionSupabase } from '~/server/auth-supabase'
import { cn } from '~/utils/cn'
import HeroImg from '../assets/hero.png'

// Animated Background with richer elements
const AnimatedBackground = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
    {/* Subtle colored spots */}
    <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-violet-600/10 blur-[120px]" />
    <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-fuchsia-600/10 blur-[120px]" />

    {/* Grid Pattern */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.2]" />

    <style
      dangerouslySetInnerHTML={{
        __html: `
        @keyframes rise {
          0% { transform: translateY(100vh) scaleY(1); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-20vh) scaleY(1.5); opacity: 0; }
        }
        .growth-line {
          position: absolute;
          bottom: 0;
          width: 1px;
          background: linear-gradient(to top, transparent, rgba(167, 139, 250, 0.5), transparent); /* Violet tint */
          animation: rise var(--duration) infinite linear;
          animation-delay: var(--delay);
          left: var(--left);
          height: var(--height);
          opacity: 0;
        }
      `,
      }}
    />
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="growth-line"
        style={
          {
            '--duration': `${8 + i * 2}s`,
            '--delay': `${i * 1.2}s`,
            '--left': `${10 + i * 12}%`,
            '--height': `${250 + i * 60}px`,
          } as React.CSSProperties
        }
      />
    ))}
  </div>
)

// Feature data with richer styling
const features = [
  {
    icon: Video,
    title: '動画フォーム',
    description:
      '質問を動画で伝えることで、より人間味のあるコミュニケーションを実現',
    bgGradient: 'from-violet-500/10 to-purple-500/10',
    iconColor: 'text-violet-400',
    details: ['最大500MBアップロード', 'マルチフォーマット対応', '自動変換'],
  },
  {
    icon: MessageSquare,
    title: 'インタラクティブ体験',
    description: '条件分岐やロジックを使って、最適な質問フローを自動生成',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
    iconColor: 'text-blue-400',
    details: ['条件分岐ロジック', 'スキップロジック', '動的表示'],
  },
  {
    icon: BarChart,
    title: 'リアルタイム分析',
    description: '回答データを即座に可視化し、インサイトを獲得',
    bgGradient: 'from-emerald-500/10 to-teal-500/10',
    iconColor: 'text-emerald-400',
    details: ['ダッシュボード', 'カスタムレポート', 'CSV出力'],
  },
  {
    icon: Shield,
    title: 'セキュリティ',
    description: 'エンタープライズグレードの堅牢なセキュリティ保護',
    bgGradient: 'from-orange-500/10 to-red-500/10',
    iconColor: 'text-orange-400',
    details: ['SSL暗号化', 'GDPR準拠', 'SOC2認証'],
  },
  {
    icon: Globe,
    title: '多言語対応',
    description: '世界中のユーザーに対応する多言語サポート機能',
    bgGradient: 'from-pink-500/10 to-rose-500/10',
    iconColor: 'text-pink-400',
    details: ['自動翻訳', '30+言語', 'RTL対応'],
  },
  {
    icon: Zap,
    title: 'AI機能',
    description: 'AIによる回答分析と感情解析で深い洞察を提供',
    bgGradient: 'from-yellow-500/10 to-amber-500/10',
    iconColor: 'text-yellow-400',
    details: ['感情分析', '自動タグ付け', 'トレンド予測'],
  },
]

const pricingPlans = [
  {
    name: 'Free',
    price: '0',
    description: '個人や小規模チームに',
    features: [
      { text: '月間100件の回答', included: true },
      { text: '3つのフォーム', included: true },
      { text: '基本分析', included: true },
      { text: 'APIアクセス', included: false },
    ],
    badge: 'Popular',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '2,980',
    description: '成長中のビジネスに',
    features: [
      { text: '月間10,000件の回答', included: true },
      { text: '無制限のフォーム', included: true },
      { text: '高度な分析', included: true },
      { text: 'APIアクセス', included: true },
    ],
    badge: 'Recommended',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: '大規模な組織向け',
    features: [
      { text: '無制限の回答', included: true },
      { text: '専任サポート', included: true },
      { text: 'カスタム契約', included: true },
      { text: 'SLA保証', included: true },
    ],
    badge: 'Custom',
    highlighted: false,
  },
]

export default function Home({ id }: { id: string }) {
  const router = useRouter()

  const handleSignout = async () => {
    await supabase.auth.signOut()
    void router.push('/auth/signin')
  }

  const handleGetStarted = () => {
    if (id) {
      void router.push('/dashboard/forms')
    } else {
      void router.push('/auth/signup')
    }
  }

  return (
    <RootLayout title="MovFlow - 次世代フォームビルダー">
      <Head>
        <title>MovFlow | 動画で伝える次世代フォーム</title>
      </Head>

      <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-violet-500/30">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/60 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/20">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-zinc-100">
                MovFlow
              </span>
            </Link>

            <div className="flex items-center gap-4">
              {id ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard/forms')}
                    className="text-zinc-400 hover:text-zinc-100"
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSignout}
                    className="border-zinc-800 bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/auth/signin')}
                    className="text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                  >
                    Log in
                  </Button>
                  <Button
                    onClick={() => router.push('/auth/signup')}
                    className="relative overflow-hidden bg-white text-zinc-950 hover:bg-zinc-200 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
          <AnimatedBackground />

          <div className="container relative z-10 mx-auto px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-8 inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 backdrop-blur-sm shadow-lg shadow-violet-500/10">
              <Sparkles className="mr-2 h-3 w-3 text-violet-400" />
              <span className="text-xs font-medium text-violet-300">
                Open Source & Free Forever
              </span>
            </div>

            <h1 className="mb-8 text-5xl font-bold tracking-tight text-zinc-50 sm:text-7xl">
              動画で伝える、
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                次世代フォーム体験
              </span>
            </h1>

            <p className="mx-auto mb-12 max-w-2xl text-lg text-zinc-400 leading-relaxed">
              従来のテキストフォームを超えて。
              <span className="text-zinc-200 font-medium">動画と音声</span>
              による対話的なコミュニケーションで、
              ユーザーの本当の声を聞きましょう。
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="h-12 px-8 text-base font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-xl shadow-violet-500/20 transition-all hover:scale-105"
              >
                無料で始める
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all backdrop-blur-sm"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                デモを見る
              </Button>
            </div>
          </div>
        </section>

        {/* Demo Preview with Glassmorphism */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950/50 pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <div className="group relative rounded-xl border border-white/10 bg-white/5 p-2 shadow-2xl shadow-violet-500/10 backdrop-blur-sm transition-transform duration-500 hover:scale-[1.01]">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 opacity-0 blur transition duration-500 group-hover:opacity-100" />
                <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-900">
                  <Image
                    src={HeroImg}
                    alt="Demo"
                    className="object-cover opacity-90 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
                    fill
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 backdrop-blur-md border border-white/20 text-white shadow-2xl font-medium">
                      <PlayCircle className="h-5 w-5" />
                      <span>Watch Demo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features with Colorful Gradients */}
        <section className="py-32 relative overflow-hidden">
          {/* Background Glows */}
          <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[100px]" />
          <div className="absolute left-0 bottom-1/4 h-[500px] w-[500px] rounded-full bg-purple-600/5 blur-[100px]" />

          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-20 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
                Powerful Features
              </h2>
              <p className="mt-4 text-zinc-400">
                シンプルさと高機能を両立した、モダンなツールセット
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="group relative border border-white/5 bg-zinc-900/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-zinc-900/60 hover:shadow-2xl hover:shadow-black/50"
                >
                  {/* Hover Gradient */}
                  <div
                    className={cn(
                      'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br pointer-events-none rounded-xl',
                      feature.bgGradient,
                    )}
                  />

                  <CardHeader>
                    <div
                      className={cn(
                        'mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-900 border border-white/10 shadow-lg transition-colors group-hover:border-white/20 group-hover:bg-zinc-800',
                        feature.iconColor,
                      )}
                    >
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl text-zinc-100 group-hover:text-white transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-zinc-400 mb-6 group-hover:text-zinc-300 transition-colors">
                      {feature.description}
                    </CardDescription>
                    <ul className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <li
                          key={idx}
                          className="flex items-center text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors"
                        >
                          <div
                            className={cn(
                              'mr-2 h-1.5 w-1.5 rounded-full bg-zinc-700 group-hover:bg-current transition-colors',
                              feature.iconColor,
                            )}
                          />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-32 border-t border-white/5 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-20 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-100">
                Simple Pricing
              </h2>
              <p className="mt-4 text-zinc-400">
                すべてのプランで基本機能をご利用いただけます
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <Card
                  key={index}
                  className={cn(
                    'relative border bg-zinc-900/30 backdrop-blur-sm transition-all duration-300',
                    plan.highlighted
                      ? 'border-violet-500/50 bg-zinc-900/50 shadow-2xl shadow-violet-500/10 scale-105 z-10'
                      : 'border-white/5 hover:border-white/10 hover:bg-zinc-900/50',
                  )}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1 text-xs font-medium text-white shadow-lg">
                      Recommended
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="text-2xl text-zinc-100">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-4 flex items-baseline text-zinc-100">
                      <span className="text-4xl font-bold">¥{plan.price}</span>
                      {plan.price !== 'Custom' && (
                        <span className="ml-1 text-zinc-500">/月</span>
                      )}
                    </div>
                    <CardDescription className="text-zinc-400 mt-2">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          {feature.included ? (
                            <Check
                              className={cn(
                                'mr-3 h-4 w-4',
                                plan.highlighted
                                  ? 'text-violet-400'
                                  : 'text-zinc-100',
                              )}
                            />
                          ) : (
                            <X className="mr-3 h-4 w-4 text-zinc-700" />
                          )}
                          <span
                            className={
                              feature.included
                                ? 'text-zinc-300'
                                : 'text-zinc-700'
                            }
                          >
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={cn(
                        'w-full transition-all',
                        plan.highlighted
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100',
                      )}
                      onClick={handleGetStarted}
                    >
                      選択する
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-zinc-950 py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.1),transparent_50%)]" />
          <div className="container relative z-10 mx-auto px-4 text-center text-zinc-600">
            <div className="flex items-center justify-center space-x-2 mb-8">
              <Sparkles className="h-5 w-5 text-violet-500" />
              <span className="text-lg font-bold text-zinc-400">MovFlow</span>
            </div>
            <p className="text-sm mb-8 max-w-md mx-auto">
              Next-generation form builder for the modern web.
              <br />
              Open source and free forever.
            </p>
            <div className="flex justify-center gap-6">
              <Link
                href="#"
                className="hover:text-violet-400 transition-colors"
              >
                <GitHubLogoIcon className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="hover:text-violet-400 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="hover:text-violet-400 transition-colors"
              >
                <Globe className="h-5 w-5" />
              </Link>
            </div>
            <p className="text-xs text-zinc-800 mt-8">
              © 2024 MovFlow. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </RootLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSessionSupabase(ctx)
  if (session?.user?.id) {
    return { props: { id: session.user.id, name: session.user.name } }
  }
  return { props: {} }
}

import { GitHubLogoIcon } from '@radix-ui/react-icons'
import {
  ArrowRight,
  BarChart,
  Building,
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
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/components/ui'
import { supabase } from '~/lib/supabase'
import { getServerAuthSessionSupabase } from '~/server/auth-supabase'
import { cn } from '~/utils/cn'

import { useEffect, useState } from 'react'
import RootLayout from '~/layouts/rootLayout'
import HeroImg from '../assets/hero.png'

// Feature data with icons and gradients
const features = [
  {
    icon: Video,
    title: '動画フォーム',
    description:
      '質問を動画で伝えることで、より人間味のあるコミュニケーションを実現',
    gradient: 'from-purple-500 to-pink-500',
    details: [
      '最大500MBの動画アップロード',
      'MP4, MOV, AVI, WebM対応',
      '自動トランスコーディング',
    ],
  },
  {
    icon: MessageSquare,
    title: 'インタラクティブな体験',
    description:
      '条件分岐やロジックを使って、回答者に最適な質問フローを自動生成',
    gradient: 'from-blue-500 to-cyan-500',
    details: ['条件分岐ロジック', 'スキップロジック', '動的な質問表示'],
  },
  {
    icon: BarChart,
    title: 'リアルタイム分析',
    description: '回答データをリアルタイムで可視化。インサイトを即座に獲得',
    gradient: 'from-orange-500 to-red-500',
    details: [
      'リアルタイムダッシュボード',
      'カスタムレポート',
      'CSVエクスポート',
    ],
  },
  {
    icon: Shield,
    title: 'エンタープライズセキュリティ',
    description: 'Supabaseによる堅牢なセキュリティとプライバシー保護',
    gradient: 'from-green-500 to-emerald-500',
    details: ['SSL暗号化', 'GDPR準拠', 'SOC2 Type II認証'],
  },
  {
    icon: Globe,
    title: '多言語対応',
    description: '日本語、英語、中国語など30以上の言語に対応',
    gradient: 'from-indigo-500 to-purple-500',
    details: ['自動翻訳機能', 'カスタム言語設定', 'RTL言語サポート'],
  },
  {
    icon: Zap,
    title: 'AI機能',
    description: 'AIによる回答分析と感情解析で深いインサイトを提供',
    gradient: 'from-yellow-500 to-orange-500',
    details: ['感情分析', '自動タグ付け', 'トレンド予測'],
  },
]

// Testimonial data
const testimonials = [
  {
    name: '田中 太郎',
    role: '株式会社Example CEO',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    content:
      'FormOnceを導入してから、採用面接の効率が3倍になりました。動画で応募者の人柄が分かるのが素晴らしいです。',
    rating: 5,
  },
  {
    name: '佐藤 花子',
    role: 'スタートアップCTO',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    content:
      'カスタマーフィードバックの質が劇的に向上しました。顧客の生の声を動画で聞けるのは本当に価値があります。',
    rating: 5,
  },
  {
    name: '鈴木 一郎',
    role: 'マーケティングマネージャー',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    content:
      'UIが直感的で、チーム全員がすぐに使いこなせました。サポートも迅速で助かっています。',
    rating: 5,
  },
  {
    name: '山田 美咲',
    role: 'HR責任者',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
    content:
      '従来のフォームツールとは一線を画す革新的なプロダクトです。もう他のツールには戻れません。',
    rating: 5,
  },
]

// Pricing plans
const pricingPlans = [
  {
    name: 'Free',
    price: '0',
    period: '永久無料',
    description: '個人や小規模チームに最適',
    features: [
      { text: '月間100件の回答', included: true },
      { text: '3つのアクティブフォーム', included: true },
      { text: '基本的な分析機能', included: true },
      { text: '7日間のデータ保持', included: true },
      { text: 'メールサポート', included: true },
      { text: 'カスタムブランディング', included: false },
      { text: 'API アクセス', included: false },
      { text: '優先サポート', included: false },
    ],
    badge: '人気',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '2980',
    period: '月額',
    description: '成長中のビジネスに最適',
    features: [
      { text: '月間10,000件の回答', included: true },
      { text: '無制限のフォーム', included: true },
      { text: '高度な分析機能', included: true },
      { text: '1年間のデータ保持', included: true },
      { text: 'チャットサポート', included: true },
      { text: 'カスタムブランディング', included: true },
      { text: 'API アクセス', included: true },
      { text: '優先サポート', included: false },
    ],
    badge: 'おすすめ',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'お問い合わせ',
    period: 'カスタム',
    description: '大企業向けのカスタムソリューション',
    features: [
      { text: '無制限の回答', included: true },
      { text: '無制限のフォーム', included: true },
      { text: 'エンタープライズ分析', included: true },
      { text: '無制限のデータ保持', included: true },
      { text: '専任サポート', included: true },
      { text: 'カスタムブランディング', included: true },
      { text: 'API アクセス', included: true },
      { text: '優先サポート', included: true },
    ],
    badge: 'カスタム',
    highlighted: false,
  },
]

// Use cases
const useCases = [
  {
    title: '採用面接',
    description: '動画による自己紹介で、履歴書だけでは伝わらない人柄を確認',
    icon: Users,
    metrics: '採用時間を50%短縮',
  },
  {
    title: 'カスタマーフィードバック',
    description: '顧客の生の声を動画で収集し、より深い洞察を獲得',
    icon: MessageSquare,
    metrics: '満足度スコア30%向上',
  },
  {
    title: '教育・研修',
    description: 'インタラクティブなクイズや課題提出で学習効果を最大化',
    icon: FileText,
    metrics: '学習定着率40%向上',
  },
]

// Stats
const stats = [
  { label: 'アクティブユーザー', value: '50,000+', icon: Users },
  { label: '作成されたフォーム', value: '1M+', icon: FileText },
  { label: '収集された回答', value: '10M+', icon: MessageSquare },
  { label: '満足度', value: '98%', icon: Star },
]

export default function Home({ id }: { id: string }) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>(
    'monthly',
  )
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSignout = async () => {
    setIsSigningOut(true)
    await supabase.auth.signOut()
    void router.push('/auth/signin')
    setIsSigningOut(false)
  }

  const handleGetStarted = () => {
    if (id) {
      void router.push('/dashboard/forms')
    } else {
      void router.push('/auth/signup')
    }
  }

  return (
    <RootLayout title="FormOnce - 動画で伝える、次世代フォームビルダー">
      <Head>
        <title>
          FormOnce - 動画で伝える、次世代フォームビルダー | 無料で始める
        </title>
        <meta
          name="description"
          content="動画と音声で質問を伝える革新的なフォームビルダー。採用面接、カスタマーフィードバック、教育など様々なシーンで活用。無料プランあり。"
        />
        <meta
          name="keywords"
          content="フォームビルダー,動画フォーム,アンケート,採用面接,カスタマーフィードバック,FormOnce"
        />
        <meta
          property="og:title"
          content="FormOnce - 動画で伝える、次世代フォームビルダー"
        />
        <meta
          property="og:description"
          content="動画と音声で質問を伝える革新的なフォームビルダー。無料で始められます。"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://formonce.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://formonce.com" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Navigation */}
        <nav
          className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl"
          role="navigation"
          aria-label="メインナビゲーション"
        >
          <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="flex items-center space-x-2"
              aria-label="FormOnce ホーム"
            >
              <Sparkles
                className="h-6 w-6 text-purple-600 dark:text-purple-400"
                aria-hidden="true"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                FormOnce
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="https://github.com/FormOnce/FormOnce"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                aria-label="GitHub"
              >
                <GitHubLogoIcon className="h-5 w-5" />
              </Link>

              {id ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard/forms')}
                  >
                    ダッシュボード
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSignout}
                    disabled={isSigningOut}
                  >
                    ログアウト
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/auth/signin')}
                  >
                    ログイン
                  </Button>
                  <Button
                    onClick={() => router.push('/auth/signup')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    無料で始める
                  </Button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section
          className="relative overflow-hidden"
          aria-labelledby="hero-heading"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20" />
          <div className="container relative mx-auto px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/30 px-4 py-1.5">
                <Sparkles className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  完全無料・オープンソース
                </span>
              </div>

              <h1
                id="hero-heading"
                className="mb-6 text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-6xl lg:text-7xl"
              >
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  動画で伝える
                </span>
                <br />
                次世代フォーム体験
              </h1>

              <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 dark:text-gray-400 sm:text-xl">
                FormOnceは、動画や音声で質問を伝えることができる次世代のフォームビルダーです。
                より人間味のあるコミュニケーションで、回答率と満足度を劇的に向上させます。
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
                >
                  無料で始める
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="group"
                  onClick={() => {
                    const demoSection = document.getElementById('demo')
                    demoSection?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  デモを見る
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>クレジットカード不要</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>永久無料プラン</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>5分で設定完了</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="mx-auto mb-3 h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section
          id="demo"
          className="py-20 bg-gray-50 dark:bg-gray-950"
          aria-labelledby="demo-heading"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2
                id="demo-heading"
                className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl"
              >
                実際の動作を確認
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                FormOnceで作成したフォームがどのように動作するか、実際にご覧ください
              </p>
            </div>

            <div className="mx-auto max-w-5xl">
              <div className="relative rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-1">
                <div className="rounded-xl bg-white dark:bg-gray-900 p-2">
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 shadow-2xl">
                    <Image
                      src={HeroImg}
                      alt="FormOnce デモ画面"
                      className="object-cover"
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <button
                        className="group flex items-center gap-3 rounded-full bg-white/90 px-6 py-3 text-sm font-medium text-gray-900 transition hover:bg-white"
                        aria-label="デモ動画を再生"
                      >
                        <PlayCircle className="h-5 w-5" />
                        デモを再生
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with Grid + Icons */}
        <section
          className="py-20 bg-white dark:bg-gray-900"
          aria-labelledby="features-heading"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2
                id="features-heading"
                className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl"
              >
                FormOnceの強力な機能
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                エンタープライズグレードの機能を、すべてのプランでご利用いただけます
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-gray-200 dark:border-gray-800 transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div
                    className={cn(
                      'absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity',
                      `bg-gradient-to-br ${feature.gradient}`,
                    )}
                  />
                  <CardHeader className="relative pb-3">
                    <div
                      className={cn(
                        'mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg',
                        `bg-gradient-to-br ${feature.gradient}`,
                      )}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CardDescription>{feature.description}</CardDescription>
                    <ul className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Features Grid */}
            <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Clock,
                  label: '24時間365日稼働',
                  desc: '99.99%の稼働率保証',
                },
                {
                  icon: Gauge,
                  label: '超高速',
                  desc: '50ms以下のレスポンスタイム',
                },
                {
                  icon: Lock,
                  label: 'プライバシー重視',
                  desc: 'GDPR & CCPA準拠',
                },
                {
                  icon: Palette,
                  label: 'カスタマイズ自在',
                  desc: '完全なブランディング対応',
                },
                {
                  icon: Code,
                  label: 'Developer Friendly',
                  desc: 'REST API & Webhooks',
                },
                {
                  icon: Smartphone,
                  label: 'モバイル最適化',
                  desc: 'レスポンシブデザイン',
                },
                {
                  icon: Cloud,
                  label: 'クラウドネイティブ',
                  desc: '自動スケーリング対応',
                },
                {
                  icon: HeartHandshake,
                  label: '24時間サポート',
                  desc: '日本語対応サポート',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center p-4"
                >
                  <item.icon className="h-10 w-10 text-purple-600 dark:text-purple-400 mb-3" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {item.label}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Carousel */}
        <section
          className="py-20 bg-gray-50 dark:bg-gray-950"
          aria-labelledby="testimonials-heading"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2
                id="testimonials-heading"
                className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl"
              >
                お客様の声
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                FormOnceを愛用していただいている企業様からのフィードバック
              </p>
            </div>

            <div className="mx-auto max-w-4xl">
              <div className="relative">
                <div className="overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-xl">
                  <div className="flex items-start gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-5 w-5',
                          i < testimonials[currentTestimonial].rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-300 text-gray-300',
                        )}
                      />
                    ))}
                  </div>

                  <blockquote className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                    "{testimonials[currentTestimonial].content}"
                  </blockquote>

                  <div className="flex items-center gap-4">
                    <Image
                      src={testimonials[currentTestimonial].avatar}
                      alt={testimonials[currentTestimonial].name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <div>
                      <cite className="not-italic font-semibold text-gray-900 dark:text-gray-100">
                        {testimonials[currentTestimonial].name}
                      </cite>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {testimonials[currentTestimonial].role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation buttons */}
                <button
                  onClick={() =>
                    setCurrentTestimonial(
                      (prev) =>
                        (prev - 1 + testimonials.length) % testimonials.length,
                    )
                  }
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 rounded-full bg-white dark:bg-gray-800 p-2 shadow-lg hover:shadow-xl transition-shadow"
                  aria-label="前の証言"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() =>
                    setCurrentTestimonial(
                      (prev) => (prev + 1) % testimonials.length,
                    )
                  }
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 rounded-full bg-white dark:bg-gray-800 p-2 shadow-lg hover:shadow-xl transition-shadow"
                  aria-label="次の証言"
                >
                  <ChevronRight className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </button>

                {/* Dots indicator */}
                <div className="flex justify-center gap-2 mt-6">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentTestimonial(idx)}
                      className={cn(
                        'h-2 w-2 rounded-full transition-all',
                        idx === currentTestimonial
                          ? 'w-8 bg-purple-600 dark:bg-purple-400'
                          : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400',
                      )}
                      aria-label={`証言 ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases with Metrics */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">
                実績のある活用例
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                FormOnceは、様々なビジネスシーンで成果を上げています
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {useCases.map((useCase, index) => (
                <div
                  key={index}
                  className="group relative rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30 p-8 transition-all hover:scale-105"
                >
                  <useCase.icon className="mb-4 h-12 w-12 text-purple-600 dark:text-purple-400" />
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {useCase.description}
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100"
                  >
                    {useCase.metrics}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section with Toggle */}
        <section
          className="py-20 bg-gray-50 dark:bg-gray-950"
          id="pricing"
          aria-labelledby="pricing-heading"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2
                id="pricing-heading"
                className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl"
              >
                シンプルで透明な料金プラン
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                すべてのプランで基本機能をご利用いただけます
              </p>

              {/* Billing Period Toggle */}
              <div className="mt-8 flex items-center justify-center gap-4">
                <span
                  className={cn(
                    'text-sm font-medium',
                    billingPeriod === 'monthly'
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-500',
                  )}
                >
                  月額払い
                </span>
                <button
                  onClick={() =>
                    setBillingPeriod((prev) =>
                      prev === 'monthly' ? 'yearly' : 'monthly',
                    )
                  }
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600 transition-colors"
                  aria-label="料金プラン切り替え"
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      billingPeriod === 'yearly'
                        ? 'translate-x-6'
                        : 'translate-x-1',
                    )}
                  />
                </button>
                <span
                  className={cn(
                    'text-sm font-medium',
                    billingPeriod === 'yearly'
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-500',
                  )}
                >
                  年額払い
                  <Badge className="ml-2" variant="secondary">
                    20%お得
                  </Badge>
                </span>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {pricingPlans.map((plan, index) => (
                <Card
                  key={index}
                  className={cn(
                    'relative overflow-hidden transition-all hover:shadow-xl',
                    plan.highlighted &&
                      'ring-2 ring-purple-600 dark:ring-purple-400 scale-105',
                  )}
                >
                  {plan.badge && (
                    <div className="absolute top-0 right-0">
                      <Badge
                        className={cn(
                          'rounded-none rounded-bl-lg rounded-tr-lg',
                          plan.highlighted
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700',
                        )}
                      >
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-8">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {plan.description}
                    </CardDescription>

                    <div className="mt-6">
                      {plan.price === 'お問い合わせ' ? (
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                          {plan.price}
                        </div>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                              ¥
                              {billingPeriod === 'yearly' && plan.price !== '0'
                                ? Math.floor(
                                    parseInt(plan.price) * 0.8,
                                  ).toLocaleString()
                                : parseInt(plan.price).toLocaleString()}
                            </span>
                            {plan.price !== '0' && (
                              <span className="text-gray-600 dark:text-gray-400">
                                /{billingPeriod === 'yearly' ? '月' : '月'}
                              </span>
                            )}
                          </div>
                          {billingPeriod === 'yearly' && plan.price !== '0' && (
                            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                              年額 ¥
                              {(
                                Math.floor(parseInt(plan.price) * 0.8) * 12
                              ).toLocaleString()}
                              （¥
                              {(
                                parseInt(plan.price) * 12 -
                                Math.floor(parseInt(plan.price) * 0.8) * 12
                              ).toLocaleString()}
                              お得）
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                          )}
                          <span
                            className={cn(
                              'text-sm',
                              feature.included
                                ? 'text-gray-700 dark:text-gray-300'
                                : 'text-gray-400 dark:text-gray-500 line-through',
                            )}
                          >
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={cn(
                        'w-full',
                        plan.highlighted
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                          : 'bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200',
                      )}
                      onClick={handleGetStarted}
                    >
                      {plan.name === 'Enterprise'
                        ? 'お問い合わせ'
                        : '今すぐ始める'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600" />
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="container relative mx-auto px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-8 text-4xl font-bold text-white sm:text-5xl">
              今すぐFormOnceを始めよう
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-purple-100">
              5分で設定完了。クレジットカード不要で、すべての機能を無料でお試しいただけます。
            </p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="group bg-white text-purple-600 hover:bg-gray-100 px-8"
            >
              無料でアカウント作成
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-3xl mx-auto text-white">
              <div className="flex flex-col items-center">
                <Rocket className="h-10 w-10 mb-3" />
                <h3 className="font-semibold mb-1">即座に開始</h3>
                <p className="text-sm text-purple-100">登録後すぐに利用可能</p>
              </div>
              <div className="flex flex-col items-center">
                <Zap className="h-10 w-10 mb-3" />
                <h3 className="font-semibold mb-1">無制限お試し</h3>
                <p className="text-sm text-purple-100">全機能を14日間無料</p>
              </div>
              <div className="flex flex-col items-center">
                <Crown className="h-10 w-10 mb-3" />
                <h3 className="font-semibold mb-1">プレミアムサポート</h3>
                <p className="text-sm text-purple-100">
                  日本語での手厚いサポート
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Multi-column Footer */}
        <footer
          className="border-t bg-white dark:bg-gray-950"
          role="contentinfo"
        >
          <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
              {/* Company Info */}
              <div className="col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    FormOnce
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  動画で伝える、次世代のフォーム体験。
                  より人間味のあるコミュニケーションを実現します。
                </p>
                <div className="flex gap-4">
                  <Link
                    href="https://github.com/FormOnce/FormOnce"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label="GitHub"
                  >
                    <GitHubLogoIcon className="h-5 w-5" />
                  </Link>
                  <Link
                    href="https://twitter.com/formonce"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </Link>
                  <Link
                    href="https://linkedin.com/company/formonce"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </Link>
                  <Link
                    href="https://youtube.com/@formonce"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              {/* Product */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  製品
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/features"
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      機能
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/pricing"
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      料金
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/templates"
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      テンプレート
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/integrations"
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      連携
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  リソース
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/docs"
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      ドキュメント
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/blog"
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      ブログ
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/api"
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      API
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/status"
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      ステータス
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  会社情報
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/about"
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      会社概要
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/careers"
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      採用情報
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy"
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      プライバシーポリシー
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      利用規約
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4" />
                  <a
                    href="mailto:support@formonce.com"
                    className="hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    support@formonce.com
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4" />
                  <a
                    href="tel:+81-3-1234-5678"
                    className="hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    03-1234-5678
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span>東京都渋谷区</span>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                © 2024 FormOnce. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </RootLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSessionSupabase(ctx)

  if (session?.user?.id) {
    return {
      props: {
        id: session.user.id,
        name: session.user.name,
      },
    }
  }

  return {
    props: {},
  }
}

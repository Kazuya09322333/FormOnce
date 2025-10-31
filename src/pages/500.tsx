import { Home, RefreshCcw, ServerCrash } from 'lucide-react'
import Head from 'next/head'
import Link from 'next/link'
import { Button } from '~/components/ui'

export default function Custom500() {
  return (
    <>
      <Head>
        <title>500 - サーバーエラー | FormOnce</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-950">
        <div className="text-center px-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 mb-8">
            <ServerCrash className="h-12 w-12 text-red-600 dark:text-red-400 animate-pulse" />
          </div>

          <h1 className="text-8xl font-bold bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent mb-4">
            500
          </h1>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            サーバーエラーが発生しました
          </h2>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            申し訳ございません。サーバー側で問題が発生しました。
            <br />
            しばらく時間をおいてから、もう一度お試しください。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="group"
            >
              <RefreshCcw className="mr-2 h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
              ページを再読み込み
            </Button>

            <Link href="/">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                <Home className="mr-2 h-4 w-4" />
                ホームページへ
              </Button>
            </Link>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-left">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              問題が続く場合は：
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400">•</span>
                ブラウザのキャッシュをクリアしてください
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400">•</span>
                別のブラウザでアクセスしてみてください
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400">•</span>
                <a
                  href="mailto:support@formonce.com"
                  className="underline hover:text-purple-600"
                >
                  support@formonce.com
                </a>{' '}
                までお問い合わせください
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

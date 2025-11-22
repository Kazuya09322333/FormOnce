import { ArrowLeft, FileQuestion, Home } from 'lucide-react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from '~/components/ui'

export default function Custom404() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>404 - ページが見つかりません | MovFlow</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-950">
        <div className="text-center px-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-8 animate-pulse">
            <FileQuestion className="h-12 w-12 text-purple-600 dark:text-purple-400" />
          </div>

          <h1 className="text-8xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-4">
            404
          </h1>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            ページが見つかりません
          </h2>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            申し訳ございません。お探しのページは存在しないか、
            <br />
            移動または削除された可能性があります。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              前のページに戻る
            </Button>

            <Link href="/">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                <Home className="mr-2 h-4 w-4" />
                ホームページへ
              </Button>
            </Link>
          </div>

          <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              よくアクセスされるページ：
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/dashboard/forms">
                <Button variant="ghost" size="sm">
                  ダッシュボード
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">
                  ログイン
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="ghost" size="sm">
                  新規登録
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

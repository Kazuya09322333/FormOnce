import { AlertTriangle, Home, RefreshCcw } from 'lucide-react'
import { NextPageContext } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { Button } from '~/components/ui'

interface ErrorProps {
  statusCode?: number
  title?: string
}

function Error({ statusCode, title }: ErrorProps) {
  const errorTitle =
    title ||
    (statusCode === 404 ? 'ページが見つかりません' : 'エラーが発生しました')
  const errorMessage =
    statusCode === 404
      ? 'お探しのページは存在しないか、移動した可能性があります。'
      : statusCode === 500
        ? 'サーバーエラーが発生しました。しばらくしてからもう一度お試しください。'
        : 'エラーが発生しました。しばらくしてからもう一度お試しください。'

  return (
    <>
      <Head>
        <title>{errorTitle} - MovFlow</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {statusCode || '???'}
          </h1>

          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            {errorTitle}
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {errorMessage}
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button variant="default">
                <Home className="mr-2 h-4 w-4" />
                ホームに戻る
              </Button>
            </Link>

            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              再読み込み
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error

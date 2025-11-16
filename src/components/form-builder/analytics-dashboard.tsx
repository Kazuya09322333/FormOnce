import { FormResponse, FormViews } from '@prisma/client'
import { CheckCircle, Clock, Eye, TrendingDown, Users } from 'lucide-react'
import { useMemo } from 'react'
import { FormAnalytics, calculateFormAnalytics } from '~/utils/analytics'

type AnalyticsDashboardProps = {
  views: FormViews[]
  responses: FormResponse[]
}

export function AnalyticsDashboard({
  views,
  responses,
}: AnalyticsDashboardProps) {
  const analytics = useMemo(
    () => calculateFormAnalytics(views, responses),
    [views, responses],
  )

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">アナリティクス</h2>
        <p className="text-sm text-gray-600 mt-1">
          フォームのパフォーマンスと統計情報
        </p>
      </div>

      {/* メトリクスカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 総閲覧数 */}
        <MetricCard
          icon={<Eye className="text-blue-600" size={24} />}
          title="総閲覧数"
          value={analytics.totalViews}
          subtitle={`今日: ${analytics.viewsToday}`}
          color="blue"
        />

        {/* 総回答数 */}
        <MetricCard
          icon={<Users className="text-purple-600" size={24} />}
          title="総回答数"
          value={analytics.totalResponses}
          subtitle={`今日: ${analytics.responsesToday}`}
          color="purple"
        />

        {/* 完了数 */}
        <MetricCard
          icon={<CheckCircle className="text-green-600" size={24} />}
          title="完了数"
          value={analytics.completedResponses}
          subtitle={`完了率: ${analytics.completionRate}%`}
          color="green"
        />

        {/* 離脱率 */}
        <MetricCard
          icon={<TrendingDown className="text-red-600" size={24} />}
          title="離脱率"
          value={`${analytics.abandonmentRate}%`}
          subtitle="閲覧から完了までの離脱"
          color="red"
        />

        {/* 平均完了時間 */}
        {analytics.averageTimeToComplete !== undefined && (
          <MetricCard
            icon={<Clock className="text-orange-600" size={24} />}
            title="平均完了時間"
            value={`${analytics.averageTimeToComplete}分`}
            subtitle="回答開始から完了まで"
            color="orange"
          />
        )}
      </div>

      {/* 完了率バー */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          完了率の詳細
        </h3>
        <div className="space-y-4">
          <CompletionBar
            label="閲覧"
            value={analytics.totalViews}
            percentage={100}
            color="blue"
          />
          <CompletionBar
            label="回答開始"
            value={analytics.totalResponses}
            percentage={
              analytics.totalViews > 0
                ? Math.round(
                    (analytics.totalResponses / analytics.totalViews) * 100,
                  )
                : 0
            }
            color="purple"
          />
          <CompletionBar
            label="回答完了"
            value={analytics.completedResponses}
            percentage={analytics.completionRate}
            color="green"
          />
        </div>
      </div>
    </div>
  )
}

type MetricCardProps = {
  icon: React.ReactNode
  title: string
  value: number | string
  subtitle: string
  color: 'blue' | 'purple' | 'green' | 'red' | 'orange'
}

function MetricCard({ icon, title, value, subtitle, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    orange: 'bg-orange-50 border-orange-200',
  }

  return (
    <div
      className={`${colorClasses[color]} border-2 rounded-lg p-6 transition-all hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
        </div>
        <div className="ml-4">{icon}</div>
      </div>
    </div>
  )
}

type CompletionBarProps = {
  label: string
  value: number
  percentage: number
  color: 'blue' | 'purple' | 'green'
}

function CompletionBar({
  label,
  value,
  percentage,
  color,
}: CompletionBarProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">
          {value} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`${colorClasses[color]} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

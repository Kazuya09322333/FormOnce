import { FormResponse, FormViews } from '@prisma/client'

export interface FormAnalytics {
  totalViews: number
  totalResponses: number
  completedResponses: number
  completionRate: number
  abandonmentRate: number
  viewsToday: number
  responsesToday: number
  averageTimeToComplete?: number
}

/**
 * フォームのアナリティクスデータを計算
 */
export function calculateFormAnalytics(
  views: FormViews[],
  responses: FormResponse[],
): FormAnalytics {
  const totalViews = views.length
  const totalResponses = responses.length
  const completedResponses = responses.filter(
    (r) => r.completed !== null,
  ).length

  const completionRate =
    totalViews > 0 ? Math.round((completedResponses / totalViews) * 100) : 0
  const abandonmentRate = totalViews > 0 ? 100 - completionRate : 0

  // 今日の日付（UTC）
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const viewsToday = views.filter(
    (v) => new Date(v.createdAt).getTime() >= today.getTime(),
  ).length
  const responsesToday = responses.filter(
    (r) => new Date(r.createdAt).getTime() >= today.getTime(),
  ).length

  // 平均完了時間（分）
  const completedWithTime = responses.filter((r) => r.completed && r.createdAt)
  let averageTimeToComplete: number | undefined

  if (completedWithTime.length > 0) {
    const totalTime = completedWithTime.reduce((sum, r) => {
      const startTime = new Date(r.createdAt).getTime()
      const endTime = new Date(r.completed!).getTime()
      return sum + (endTime - startTime)
    }, 0)

    // ミリ秒を分に変換
    averageTimeToComplete = Math.round(
      totalTime / completedWithTime.length / 1000 / 60,
    )
  }

  return {
    totalViews,
    totalResponses,
    completedResponses,
    completionRate,
    abandonmentRate,
    viewsToday,
    responsesToday,
    averageTimeToComplete,
  }
}

/**
 * 日別の統計データを計算
 */
export function calculateDailyStats(
  views: FormViews[],
  responses: FormResponse[],
  days = 7,
): Array<{
  date: string
  views: number
  responses: number
  completed: number
}> {
  const stats: Record<
    string,
    { views: number; responses: number; completed: number }
  > = {}

  // 過去N日分の日付を初期化
  const today = new Date()
  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]!
    stats[dateStr] = { views: 0, responses: 0, completed: 0 }
  }

  // ビュー数をカウント
  views.forEach((view) => {
    const dateStr = new Date(view.createdAt).toISOString().split('T')[0]!
    if (stats[dateStr]) {
      stats[dateStr]!.views++
    }
  })

  // 回答数をカウント
  responses.forEach((response) => {
    const dateStr = new Date(response.createdAt).toISOString().split('T')[0]!
    if (stats[dateStr]) {
      stats[dateStr]!.responses++
      if (response.completed) {
        stats[dateStr]!.completed++
      }
    }
  })

  // 配列に変換してソート
  return Object.entries(stats)
    .map(([date, data]) => ({
      date,
      ...data,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

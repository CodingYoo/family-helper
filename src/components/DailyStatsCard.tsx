'use client'

import React, { useRef } from 'react'
import { Family, Task, DailyStats, TaskStatus } from '@/lib/types'
import { formatDuration, formatDate } from '@/lib/utils'
import { generateDailyStats } from '@/lib/algorithms'
import { Button } from '@/components/ui/Button'

interface DailyStatsCardProps {
  family: Family
  tasks: Task[]
  dailyStats: DailyStats[]
  onShare?: () => void
}

export function DailyStatsCard({ family, tasks, dailyStats, onShare }: DailyStatsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  
  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter(task => 
    task.status === TaskStatus.COMPLETED &&
    task.completedAt &&
    new Date(task.completedAt).toISOString().split('T')[0] === today
  )

  // 计算每个成员今日统计
  const memberStats = family.members.map(member => {
    const memberTodayStats = generateDailyStats(member.id, tasks)
    return {
      member,
      stats: memberTodayStats
    }
  })

  const totalMinutes = memberStats.reduce((sum, ms) => sum + ms.stats.minutesWorked, 0)
  const totalTasks = memberStats.reduce((sum, ms) => sum + ms.stats.tasksCompleted, 0)

  // 生成分享图片
  const handleShare = async () => {
    if (!cardRef.current) return

    try {
      // 使用html2canvas生成图片（需要安装依赖）
      // const html2canvas = (await import('html2canvas')).default
      // const canvas = await html2canvas(cardRef.current)
      // const dataUrl = canvas.toDataURL('image/png')
      
      // 简化版：复制文本到剪贴板
      const shareText = `🏠 ${family.name} 今日战绩
📅 ${formatDate(new Date())}
⏱️ 总时长：${formatDuration(totalMinutes)}
✅ 完成任务：${totalTasks}项

${memberStats.map(ms => 
  `${ms.member.name}：${ms.stats.tasksCompleted}项 ${formatDuration(ms.stats.minutesWorked)}`
).join('\n')}

#家庭助手 #家务分工`

      await navigator.clipboard.writeText(shareText)
      alert('战绩已复制到剪贴板！')
    } catch (error) {
      console.error('分享失败:', error)
      alert('分享功能暂不可用')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 可分享的卡片内容 - 宫崎骏风格 */}
      <div ref={cardRef} className="relative bg-gradient-to-b from-sky-50 to-green-50 p-6 border-2 border-green-200">
        {/* 装饰性云朵和草地背景 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* 云朵装饰 */}
          <div className="absolute top-2 left-4 w-16 h-8 bg-white rounded-full opacity-60"></div>
          <div className="absolute top-4 left-8 w-12 h-6 bg-white rounded-full opacity-40"></div>
          <div className="absolute top-1 right-8 w-20 h-10 bg-white rounded-full opacity-50"></div>
          <div className="absolute top-6 right-12 w-14 h-7 bg-white rounded-full opacity-30"></div>

          {/* 草地装饰 */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-green-200 to-transparent"></div>
          <div className="absolute bottom-2 left-4 w-2 h-4 bg-green-300 rounded-t-full"></div>
          <div className="absolute bottom-1 left-8 w-1 h-3 bg-green-400 rounded-t-full"></div>
          <div className="absolute bottom-3 right-6 w-2 h-5 bg-green-300 rounded-t-full"></div>
          <div className="absolute bottom-1 right-12 w-1 h-2 bg-green-400 rounded-t-full"></div>
        </div>

        {/* 头部 - 手绘风格 */}
        <div className="relative text-center mb-8">
          <div className="inline-block bg-white rounded-full px-6 py-3 shadow-md border-2 border-green-300">
            <h2 className="text-2xl font-bold text-green-800 mb-1">🌱 今日家务小记 🌱</h2>
            <p className="text-green-600 text-sm">{formatDate(new Date())}</p>
          </div>
        </div>

        {/* 总体统计 - 手绘卡片风格 */}
        <div className="relative bg-white rounded-2xl p-6 mb-8 shadow-lg border-2 border-green-200">
          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="relative">
              <div className="bg-blue-50 rounded-full w-20 h-20 mx-auto flex items-center justify-center border-2 border-blue-200">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-700">{formatDuration(totalMinutes)}</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-green-700 font-medium">⏰ 总时长</div>
            </div>
            <div className="relative">
              <div className="bg-orange-50 rounded-full w-20 h-20 mx-auto flex items-center justify-center border-2 border-orange-200">
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-700">{totalTasks}</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-green-700 font-medium">✨ 完成任务</div>
            </div>
          </div>
        </div>

        {/* 成员统计 - 手绘人物卡片风格 */}
        <div className="space-y-4">
          {memberStats.map((ms, index) => {
            const percentage = totalMinutes > 0 ? (ms.stats.minutesWorked / totalMinutes) * 100 : 0
            const colors = [
              { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', avatar: 'bg-pink-100' },
              { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', avatar: 'bg-blue-100' },
              { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', avatar: 'bg-yellow-100' },
              { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', avatar: 'bg-purple-100' }
            ]
            const colorScheme = colors[index % colors.length]

            return (
              <div key={ms.member.id} className={`relative ${colorScheme.bg} rounded-2xl p-5 border-2 ${colorScheme.border} shadow-md`}>
                {/* 装饰性小花朵 */}
                <div className="absolute top-2 right-3 text-xs opacity-60">🌸</div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${colorScheme.avatar} rounded-full flex items-center justify-center text-lg font-bold ${colorScheme.text} border-2 ${colorScheme.border} shadow-sm`}>
                      {ms.member.name.charAt(0)}
                    </div>
                    <div>
                      <span className={`font-bold text-lg ${colorScheme.text}`}>{ms.member.name}</span>
                      <div className="text-xs text-gray-600">今日小助手</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg ${colorScheme.text}`}>{ms.stats.tasksCompleted}项</div>
                    <div className="text-sm text-gray-600">
                      {formatDuration(ms.stats.minutesWorked)}
                    </div>
                  </div>
                </div>

                {/* 手绘风格进度条 */}
                <div className="relative">
                  <div className="w-full bg-white rounded-full h-3 border border-gray-200 shadow-inner">
                    <div
                      className={`bg-gradient-to-r from-green-300 to-green-400 rounded-full h-full transition-all duration-1000 ease-out shadow-sm`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-xs text-gray-500">努力值</div>
                    <div className={`text-xs font-medium ${colorScheme.text}`}>
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 今日任务列表 - 手绘便签风格 */}
        {todayTasks.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl p-5 border-2 border-green-200 shadow-md">
              <h3 className="font-bold text-green-800 mb-4 text-center">📝 今日完成清单</h3>
              <div className="space-y-3">
                {todayTasks.slice(0, 5).map((task, index) => {
                  const assignedUser = family.members.find(m => m.id === task.assignedTo)
                  const taskEmojis = ['🌟', '✨', '🎯', '💫', '⭐']
                  return (
                    <div key={task.id} className="bg-green-50 rounded-xl p-3 border border-green-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{taskEmojis[index % taskEmojis.length]}</span>
                          <span className="font-medium text-green-800">{task.title}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-green-600 font-medium">
                            {assignedUser?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {task.actualMinutes ? formatDuration(task.actualMinutes) : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {todayTasks.length > 5 && (
                  <div className="text-center text-green-600 text-sm bg-green-50 rounded-lg p-2 border border-green-200">
                    还有 {todayTasks.length - 5} 项任务完成了呢~ 🌸
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 底部标识 - 手绘风格 */}
        <div className="text-center mt-8">
          <div className="inline-block bg-white rounded-full px-4 py-2 border-2 border-green-300 shadow-sm">
            <div className="text-green-700 text-sm font-medium">
              🏠 家庭助手 • 让家务可见可停机可议价
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 - 手绘风格 */}
      <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-t-2 border-green-200">
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex-1 bg-white border-2 border-green-300 text-green-700 hover:bg-green-50 rounded-xl shadow-md"
          >
            <span className="mr-2">📤</span>
            分享战绩
          </Button>
          {onShare && (
            <Button
              variant="primary"
              onClick={onShare}
              className="flex-1 bg-green-400 hover:bg-green-500 text-white rounded-xl shadow-md border-2 border-green-500"
            >
              <span className="mr-2">📊</span>
              查看详情
            </Button>
          )}
        </div>

        {/* 鼓励文字 - 宫崎骏风格 */}
        <div className="text-center mt-4">
          <div className="inline-block bg-white rounded-full px-6 py-3 border-2 border-green-300 shadow-sm">
            {totalMinutes > 0 ? (
              <p className="text-sm text-green-700 font-medium">
                � 今天辛苦了！{totalMinutes >= 60 ? '超棒的' : '不错的'}表现！继续加油哦~ 🌸
              </p>
            ) : (
              <p className="text-sm text-green-700 font-medium">
                🌱 今天还没有完成任务，一起加油吧！每一步都是成长~ ✨
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

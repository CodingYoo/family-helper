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
      {/* 可分享的卡片内容 */}
      <div ref={cardRef} className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6">
        {/* 头部 */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">今日家务战绩</h2>
          <p className="text-blue-100">{formatDate(new Date())}</p>
        </div>

        {/* 总体统计 */}
        <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold">{formatDuration(totalMinutes)}</div>
              <div className="text-sm text-blue-100">总时长</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{totalTasks}</div>
              <div className="text-sm text-blue-100">完成任务</div>
            </div>
          </div>
        </div>

        {/* 成员统计 */}
        <div className="space-y-4">
          {memberStats.map((ms, index) => {
            const percentage = totalMinutes > 0 ? (ms.stats.minutesWorked / totalMinutes) * 100 : 0
            
            return (
              <div key={ms.member.id} className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center text-lg font-bold">
                      {ms.member.name.charAt(0)}
                    </div>
                    <span className="font-medium">{ms.member.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{ms.stats.tasksCompleted}项</div>
                    <div className="text-sm text-blue-100">
                      {formatDuration(ms.stats.minutesWorked)}
                    </div>
                  </div>
                </div>
                
                {/* 进度条 */}
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-blue-100 mt-1 text-right">
                  {percentage.toFixed(1)}%
                </div>
              </div>
            )
          })}
        </div>

        {/* 今日任务列表 */}
        {todayTasks.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-3">今日完成任务：</h3>
            <div className="space-y-2">
              {todayTasks.slice(0, 5).map((task) => {
                const assignedUser = family.members.find(m => m.id === task.assignedTo)
                return (
                  <div key={task.id} className="bg-white bg-opacity-20 rounded p-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>✅ {task.title}</span>
                      <span className="text-blue-100">
                        {assignedUser?.name} • {task.actualMinutes ? formatDuration(task.actualMinutes) : ''}
                      </span>
                    </div>
                  </div>
                )
              })}
              {todayTasks.length > 5 && (
                <div className="text-center text-blue-100 text-sm">
                  还有 {todayTasks.length - 5} 项任务...
                </div>
              )}
            </div>
          </div>
        )}

        {/* 底部标识 */}
        <div className="text-center mt-6 text-blue-100 text-sm">
          🏠 家庭助手 • 让家务可见可停机可议价
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="p-4 bg-gray-50">
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleShare} className="flex-1">
            <span className="mr-2">📤</span>
            分享战绩
          </Button>
          {onShare && (
            <Button variant="primary" onClick={onShare} className="flex-1">
              <span className="mr-2">📊</span>
              查看详情
            </Button>
          )}
        </div>
        
        {/* 鼓励文字 */}
        <div className="text-center mt-3">
          {totalMinutes > 0 ? (
            <p className="text-sm text-gray-600">
              🎉 今天辛苦了！{totalMinutes >= 60 ? '超棒的' : '不错的'}表现！
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              😊 今天还没有完成任务，加油！
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

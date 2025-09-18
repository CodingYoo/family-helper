'use client'

import React, { useRef } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Family, DailyStats } from '@/lib/types'
import { generateWeeklyStats } from '@/lib/algorithms'
import { formatDuration } from '@/lib/utils'

// 注册Chart.js组件
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface WeeklyChartProps {
  family: Family
  dailyStats: DailyStats[]
}

export function WeeklyChart({ family, dailyStats }: WeeklyChartProps) {
  const chartRef = useRef<any>(null)
  
  const weeklyStats = generateWeeklyStats(family.members, dailyStats)
  
  // 生成图表数据
  const chartData = {
    labels: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    datasets: family.members.map((member, index) => {
      const colors = [
        { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgb(59, 130, 246)' },
        { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgb(16, 185, 129)' },
        { bg: 'rgba(245, 158, 11, 0.8)', border: 'rgb(245, 158, 11)' },
        { bg: 'rgba(239, 68, 68, 0.8)', border: 'rgb(239, 68, 68)' }
      ]
      
      const color = colors[index % colors.length]
      const userStats = weeklyStats.userStats[member.id]
      
      // 按星期几组织数据
      const weekData = Array(7).fill(0)
      if (userStats) {
        userStats.dailyBreakdown.forEach((stat: DailyStats) => {
          const date = new Date(stat.date)
          const dayOfWeek = date.getDay()
          weekData[dayOfWeek] = stat.minutesWorked
        })
      }
      
      return {
        label: member.name,
        data: weekData,
        backgroundColor: color.bg,
        borderColor: color.border,
        borderWidth: 1,
      }
    })
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '本周工作时长对比（分钟）',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const minutes = context.parsed.y
            return `${context.dataset.label}: ${formatDuration(minutes)}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatDuration(value)
          }
        },
        title: {
          display: true,
          text: '工作时长'
        }
      },
      x: {
        title: {
          display: true,
          text: '星期'
        }
      }
    },
  }

  // 导出图表为图片
  const exportChart = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image()
      const link = document.createElement('a')
      link.download = `家庭助手-周统计-${new Date().toISOString().split('T')[0]}.png`
      link.href = url
      link.click()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* 图表头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">本周统计</h3>
          <p className="text-sm text-gray-600">
            {weeklyStats.weekStart} 至 {weeklyStats.weekEnd}
          </p>
        </div>
        <button
          onClick={exportChart}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          📥 导出图片
        </button>
      </div>

      {/* 图表 */}
      <div className="mb-6">
        <Bar ref={chartRef} data={chartData} options={options} />
      </div>

      {/* 统计摘要 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {family.members.map((member) => {
          const userStats = weeklyStats.userStats[member.id]
          const totalMinutes = userStats?.minutesWorked || 0
          const totalTasks = userStats?.tasksCompleted || 0
          const avgMinutesPerDay = totalMinutes / 7
          
          return (
            <div key={member.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {member.name.charAt(0)}
                </div>
                <span className="font-medium text-gray-900">{member.name}</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">本周总时长：</span>
                  <span className="font-medium">{formatDuration(totalMinutes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">完成任务：</span>
                  <span className="font-medium">{totalTasks}项</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">日均时长：</span>
                  <span className="font-medium">{formatDuration(Math.round(avgMinutesPerDay))}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 工作平衡度 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">📊 工作平衡度分析</h4>
        <div className="text-sm text-blue-800">
          {(() => {
            const workMinutes = family.members.map(member => 
              weeklyStats.userStats[member.id]?.minutesWorked || 0
            )
            const maxMinutes = Math.max(...workMinutes)
            const minMinutes = Math.min(...workMinutes)
            const balance = maxMinutes > 0 ? 1 - (maxMinutes - minMinutes) / maxMinutes : 1
            
            if (balance >= 0.9) {
              return '🎯 工作分配非常均衡！继续保持！'
            } else if (balance >= 0.7) {
              return '👍 工作分配比较均衡，略有差异。'
            } else if (balance >= 0.5) {
              return '⚖️ 工作分配有一定差异，可以适当调整。'
            } else {
              return '⚠️ 工作分配差异较大，建议重新分配任务。'
            }
          })()}
        </div>
      </div>
    </div>
  )
}

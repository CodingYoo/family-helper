'use client'

import React, { useState } from 'react'
import { Family, Task, DailyStats } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { DailyStatsCard } from '@/components/DailyStatsCard'
import { WeeklyChart } from '@/components/WeeklyChart'

interface StatsModalProps {
  family: Family
  tasks: Task[]
  dailyStats: DailyStats[]
  onClose: () => void
}

export function StatsModal({ family, tasks, dailyStats, onClose }: StatsModalProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border-2 border-green-200">
        {/* 头部 - 宫崎骏风格 */}
        <div className="relative p-6 bg-gradient-to-r from-green-50 to-blue-50 border-b-2 border-green-200">
          {/* 装饰性元素 */}
          <div className="absolute top-2 left-4 w-8 h-4 bg-white rounded-full opacity-60"></div>
          <div className="absolute top-4 right-6 w-6 h-3 bg-white rounded-full opacity-40"></div>

          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-300">
                <span className="text-green-700 text-lg">📊</span>
              </div>
              <h2 className="text-xl font-bold text-green-800">
                🌟 家务战绩小册子 🌟
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-green-600 hover:text-green-800 hover:bg-green-50 border-2 border-green-300 shadow-sm transition-colors"
            >
              <span className="text-lg">×</span>
            </button>
          </div>

          {/* 标签页 - 手绘风格 */}
          <div className="mt-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('daily')}
                className={`px-6 py-3 text-sm font-medium rounded-xl border-2 transition-all ${
                  activeTab === 'daily'
                    ? 'bg-green-100 border-green-300 text-green-800 shadow-md'
                    : 'bg-white border-green-200 text-green-600 hover:bg-green-50'
                }`}
              >
                🌱 今日战绩
              </button>
              <button
                onClick={() => setActiveTab('weekly')}
                className={`px-6 py-3 text-sm font-medium rounded-xl border-2 transition-all ${
                  activeTab === 'weekly'
                    ? 'bg-green-100 border-green-300 text-green-800 shadow-md'
                    : 'bg-white border-green-200 text-green-600 hover:bg-green-50'
                }`}
              >
                📈 周统计
              </button>
            </div>
          </div>
        </div>

        {/* 内容区域 - 手绘背景 */}
        <div className="relative p-6 max-h-[70vh] overflow-y-auto bg-gradient-to-b from-white to-green-25">
          {/* 装饰性草地 */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-green-100 to-transparent pointer-events-none"></div>

          <div className="relative">
            {activeTab === 'daily' ? (
              <DailyStatsCard
                family={family}
                tasks={tasks}
                dailyStats={dailyStats}
              />
            ) : (
              <WeeklyChart
                family={family}
                dailyStats={dailyStats}
              />
            )}
          </div>
        </div>

        {/* 底部 - 手绘风格 */}
        <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-t-2 border-green-200">
          <div className="flex justify-center">
            <Button
              variant="primary"
              onClick={onClose}
              className="bg-green-400 hover:bg-green-500 text-white rounded-xl px-8 py-3 border-2 border-green-500 shadow-md font-medium"
            >
              🌸 关闭小册子
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

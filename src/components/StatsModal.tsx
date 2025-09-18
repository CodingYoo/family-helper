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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              家务战绩统计
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          {/* 标签页 */}
          <div className="mt-4 border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('daily')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'daily'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                今日战绩
              </button>
              <button
                onClick={() => setActiveTab('weekly')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'weekly'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                周统计
              </button>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
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

        {/* 底部 */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end">
            <Button variant="primary" onClick={onClose}>
              关闭
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

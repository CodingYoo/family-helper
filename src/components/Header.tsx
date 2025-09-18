'use client'

import React, { useState } from 'react'
import { Family } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { formatTime } from '@/lib/utils'

interface HeaderProps {
  family: Family
  onShowStats: () => void
  onShowTaskCreator: () => void
  onShowTaskGrab?: () => void
}

export function Header({ family, onShowStats, onShowTaskCreator, onShowTaskGrab }: HeaderProps) {
  const now = new Date()
  const currentTime = formatTime(now)

  // 计算今日完成任务数
  const todayCompletedTasks = 0 // TODO: 从实际数据计算
  const totalTodayTasks = 0 // TODO: 从实际数据计算

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 左侧：家庭信息 */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {family.name}
              </h1>
              <p className="text-sm text-gray-500">
                当前时间 {currentTime}
              </p>
            </div>


          </div>

          {/* 中间：今日进度 */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {todayCompletedTasks}/{totalTodayTasks}
              </div>
              <div className="text-xs text-gray-500">今日任务</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ¥{family.monthlyFund}
              </div>
              <div className="text-xs text-gray-500">月度基金</div>
            </div>
          </div>

          {/* 右侧：操作按钮 - 移动端优化 */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* 收工铃按钮 */}
            <Button
              variant="outline"
              size="sm"
              className="btn-touch min-w-[44px] min-h-[44px] px-2 sm:px-3"
              title={`收工时间：${family.workEndTime}`}
            >
              <span className="text-xl sm:text-lg">🔔</span>
              <span className="hidden sm:inline ml-1 text-sm">收工铃</span>
            </Button>

            {/* 抢单按钮 */}
            {onShowTaskGrab && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShowTaskGrab}
                className="btn-touch min-w-[44px] min-h-[44px] px-2 sm:px-3"
              >
                <span className="text-xl sm:text-lg">💪</span>
                <span className="hidden sm:inline ml-1 text-sm">抢单</span>
              </Button>
            )}

            {/* 统计按钮 */}
            <Button
              variant="outline"
              size="sm"
              onClick={onShowStats}
              className="btn-touch min-w-[44px] min-h-[44px] px-2 sm:px-3"
            >
              <span className="text-xl sm:text-lg">📊</span>
              <span className="hidden sm:inline ml-1 text-sm">战绩</span>
            </Button>

            {/* 添加任务按钮 */}
            <Button
              variant="primary"
              size="sm"
              onClick={onShowTaskCreator}
              className="btn-touch min-w-[44px] min-h-[44px] px-2 sm:px-3"
            >
              <span className="text-xl sm:text-lg">➕</span>
              <span className="hidden sm:inline ml-1 text-sm">添加任务</span>
            </Button>
          </div>
        </div>

        {/* 顶部统计信息 - 移动端优先显示 */}
        <div className="mt-3 sm:mt-4">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-3 sm:p-4 border border-blue-100">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg sm:text-xl font-bold text-blue-600">
                  {todayCompletedTasks}/{totalTodayTasks}
                </div>
                <div className="text-xs text-gray-600">今日任务</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-green-600">
                  ¥{family.monthlyFund}
                </div>
                <div className="text-xs text-gray-600">月度基金</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-orange-600">
                  {family.workEndTime}
                </div>
                <div className="text-xs text-gray-600">收工时间</div>
              </div>
            </div>
          </div>
        </div>

        {/* 家庭成员显示 - 移动端优化 */}
        <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-4">
          <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0">成员：</span>
          <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
            {family.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-gray-100 rounded-full flex-shrink-0"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {member.name.charAt(0)}
                </div>
                <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">{member.name}</span>
                <span className="text-xs text-gray-500">
                  {member.totalCompletedTasks}项
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>


    </header>
  )
}

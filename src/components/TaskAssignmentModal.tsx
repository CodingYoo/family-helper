'use client'

import React, { useState } from 'react'
import { Task, Family, DailyStats } from '@/lib/types'
import { useApp } from '@/contexts/AppContext'
import { Button } from '@/components/ui/Button'
import { getYesterdayWorkMinutes, assignTaskToUser, calculateWorkBalance } from '@/lib/algorithms'
import { formatDuration } from '@/lib/utils'

interface TaskAssignmentModalProps {
  task: Task
  family: Family
  dailyStats: DailyStats[]
  onClose: () => void
}

export function TaskAssignmentModal({ task, family, dailyStats, onClose }: TaskAssignmentModalProps) {
  const { actions } = useApp()
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [showRecommendation, setShowRecommendation] = useState(true)

  // 获取推荐分配
  const recommendedUserId = assignTaskToUser(family.members, dailyStats)
  
  // 计算每个成员的工作负载
  const memberWorkloads = family.members.map(member => {
    const yesterdayMinutes = getYesterdayWorkMinutes(member.id, dailyStats)
    const totalMinutes = member.totalMinutesWorked
    const totalTasks = member.totalCompletedTasks
    
    return {
      member,
      yesterdayMinutes,
      totalMinutes,
      totalTasks,
      isRecommended: member.id === recommendedUserId
    }
  })

  // 计算当前工作平衡度
  const currentBalance = calculateWorkBalance(family.members)

  const handleAssign = () => {
    if (!selectedUserId) {
      alert('请选择分配对象')
      return
    }

    actions.updateTask(task.id, { assignedTo: selectedUserId })
    onClose()
  }

  const handleAutoAssign = () => {
    actions.updateTask(task.id, { assignedTo: recommendedUserId })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              任务分配
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        {/* 任务信息 */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-start gap-4">
            <div className="text-2xl">{task.category === '清洁' ? '🧹' : '📋'}</div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
              {task.description && (
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
              )}
              <div className="flex gap-4 text-sm text-gray-500">
                <span>分类：{task.category}</span>
                {task.estimatedMinutes && (
                  <span>预估：{formatDuration(task.estimatedMinutes)}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 智能推荐 */}
        {showRecommendation && (
          <div className="p-6 bg-blue-50 border-b">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🤖</div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 mb-2">智能推荐</h3>
                <p className="text-sm text-blue-800 mb-3">
                  基于昨日工作时长分析，推荐分配给 
                  <span className="font-medium">
                    {family.members.find(m => m.id === recommendedUserId)?.name}
                  </span>
                </p>
                <div className="flex gap-3">
                  <Button variant="primary" size="sm" onClick={handleAutoAssign}>
                    采用推荐
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowRecommendation(false)}
                  >
                    手动选择
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 成员选择 */}
        <div className="p-6">
          <h3 className="font-medium text-gray-900 mb-4">选择分配对象：</h3>
          
          <div className="space-y-3">
            {memberWorkloads.map((workload) => (
              <div
                key={workload.member.id}
                onClick={() => setSelectedUserId(workload.member.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedUserId === workload.member.id
                    ? 'border-blue-500 bg-blue-50'
                    : workload.isRecommended
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {workload.member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {workload.member.name}
                        </span>
                        {workload.isRecommended && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                            推荐
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        总完成：{workload.totalTasks}项 • {formatDuration(workload.totalMinutes)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      昨日：{formatDuration(workload.yesterdayMinutes)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {workload.yesterdayMinutes === 0 ? '未工作' : '已工作'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 工作平衡度显示 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">当前工作平衡度</h4>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${currentBalance * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {(currentBalance * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {currentBalance >= 0.9 ? '非常均衡' : 
               currentBalance >= 0.7 ? '比较均衡' : 
               currentBalance >= 0.5 ? '有些不均' : '严重不均'}
            </p>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAssign}
              disabled={!selectedUserId}
            >
              确认分配
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { Task, Family, TaskStatus } from '@/lib/types'
import { useApp } from '@/contexts/AppContext'
import { Button } from '@/components/ui/Button'
import { formatDuration, formatTime } from '@/lib/utils'

interface TaskGrabModalProps {
  availableTasks: Task[]
  family: Family
  currentUserId: string
  onClose: () => void
}

export function TaskGrabModal({ availableTasks, family, currentUserId, onClose }: TaskGrabModalProps) {
  const { actions } = useApp()
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])

  const currentUser = family.members.find(m => m.id === currentUserId)
  
  // 过滤可抢单的任务（待做状态且未分配给当前用户）
  const grabbableTasks = availableTasks.filter(task => 
    task.status === TaskStatus.TODO && 
    task.assignedTo !== currentUserId
  )

  const handleTaskToggle = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const handleGrabTasks = () => {
    if (selectedTasks.length === 0) {
      alert('请选择要抢单的任务')
      return
    }

    // 批量更新任务分配
    selectedTasks.forEach(taskId => {
      actions.updateTask(taskId, { assignedTo: currentUserId })
    })

    alert(`成功抢单 ${selectedTasks.length} 个任务！`)
    onClose()
  }

  const getTotalEstimatedTime = () => {
    return selectedTasks.reduce((total, taskId) => {
      const task = grabbableTasks.find(t => t.id === taskId)
      return total + (task?.estimatedMinutes || 0)
    }, 0)
  }

  if (grabbableTasks.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">😊</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              暂无可抢单任务
            </h2>
            <p className="text-gray-600 mb-6">
              当前没有可以抢单的任务，或者所有任务都已分配给您
            </p>
            
            <Button variant="primary" onClick={onClose}>
              关闭
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                任务抢单
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {currentUser?.name}，选择您想要承接的任务
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        {/* 抢单说明 */}
        <div className="p-6 bg-blue-50 border-b">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💪</div>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">抢单规则</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 可以抢取其他成员的待办任务</li>
                <li>• 抢单后任务将重新分配给您</li>
                <li>• 建议根据个人时间和能力合理抢单</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 任务列表 */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          <div className="space-y-3">
            {grabbableTasks.map((task) => {
              const assignedUser = family.members.find(m => m.id === task.assignedTo)
              const isSelected = selectedTasks.includes(task.id)
              
              return (
                <div
                  key={task.id}
                  onClick={() => handleTaskToggle(task.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {isSelected ? (
                          <span className="text-blue-500 text-lg">✓</span>
                        ) : (
                          <span className="text-gray-300 text-lg">○</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{task.title}</h3>
                          {task.isUrgent && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                              加急
                            </span>
                          )}
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        )}
                        
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>分类：{task.category}</span>
                          {task.estimatedMinutes && (
                            <span>预估：{formatDuration(task.estimatedMinutes)}</span>
                          )}
                          <span>创建：{formatTime(new Date(task.createdAt))}</span>
                        </div>
                        
                        {assignedUser && (
                          <div className="mt-2 text-sm text-orange-600">
                            当前分配给：{assignedUser.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 选择摘要 */}
        {selectedTasks.length > 0 && (
          <div className="p-4 bg-green-50 border-t border-b">
            <div className="flex items-center justify-between">
              <div className="text-sm text-green-800">
                已选择 {selectedTasks.length} 个任务
              </div>
              <div className="text-sm font-medium text-green-900">
                预估总时长：{formatDuration(getTotalEstimatedTime())}
              </div>
            </div>
          </div>
        )}

        {/* 底部按钮 */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button 
              variant="primary" 
              onClick={handleGrabTasks}
              disabled={selectedTasks.length === 0}
            >
              抢单 ({selectedTasks.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

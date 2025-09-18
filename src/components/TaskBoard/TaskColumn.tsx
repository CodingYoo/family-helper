'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Task, TaskStatus, User } from '@/lib/types'
import { TaskCard } from '@/components/TaskCard/TaskCard'
import { cn } from '@/lib/utils'

interface TaskColumnProps {
  id: string
  title: string
  status: TaskStatus
  tasks: Task[]
  users: User[]
  onEditTask?: (task: Task) => void
  onDeleteTask?: (taskId: string) => void
}

export function TaskColumn({ 
  id, 
  title, 
  status, 
  tasks, 
  users, 
  onEditTask, 
  onDeleteTask 
}: TaskColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  const getColumnColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'bg-gray-50 border-gray-200'
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-50 border-blue-200'
      case TaskStatus.COMPLETED:
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getColumnIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return '📋'
      case TaskStatus.IN_PROGRESS:
        return '🔄'
      case TaskStatus.COMPLETED:
        return '✅'
      default:
        return '📋'
    }
  }

  const filteredTasks = tasks.filter(task => task.status === status)

  return (
    <div className="flex-1 min-w-0">
      {/* 移动端卡片式设计，桌面端传统边框设计 */}
      <div className={cn(
        // 移动端：卡片式设计
        'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden',
        // 桌面端：去掉卡片样式，使用传统边框
        'sm:bg-transparent sm:rounded-none sm:shadow-none sm:border-none sm:overflow-visible'
      )}>
        {/* 列头 */}
        <div className={cn(
          'p-3 sm:p-4',
          // 桌面端才应用颜色边框
          'sm:rounded-t-lg sm:border-2 sm:border-b-0',
          'sm:' + getColumnColor(status)
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-base sm:text-lg">{getColumnIcon(status)}</span>
              <h2 className="font-semibold text-gray-900 text-sm sm:text-base">{title}</h2>
            </div>
            <span className="px-2 py-1 text-xs bg-white rounded-full text-gray-600 font-medium">
              {filteredTasks.length}
            </span>
          </div>
        </div>

        {/* 任务列表区域 */}
        <div
          ref={setNodeRef}
          className={cn(
            'min-h-[200px] sm:min-h-[400px] p-3 sm:p-4 transition-colors task-board-column',
            // 移动端：简单的灰色背景
            'bg-gray-50',
            // 桌面端：传统边框和颜色
            'sm:border-2 sm:border-t-0 sm:rounded-b-lg sm:bg-transparent',
            'sm:' + getColumnColor(status),
            isOver && 'ring-2 ring-blue-400 ring-opacity-50'
          )}
        >
        <div className="space-y-2 sm:space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="flex items-center justify-center h-24 sm:h-32 text-gray-400">
              <div className="text-center">
                <div className="text-xl sm:text-2xl mb-1 sm:mb-2">
                  {status === TaskStatus.TODO && '🎯'}
                  {status === TaskStatus.IN_PROGRESS && '💪'}
                  {status === TaskStatus.COMPLETED && '🎉'}
                </div>
                <p className="text-xs sm:text-sm">
                  {status === TaskStatus.TODO && '暂无待办任务'}
                  {status === TaskStatus.IN_PROGRESS && '暂无进行中任务'}
                  {status === TaskStatus.COMPLETED && '暂无已完成任务'}
                </p>
              </div>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const assignedUser = users.find(user => user.id === task.assignedTo)
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  assignedUser={assignedUser}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              )
            })
          )}
        </div>

        {/* 拖拽提示 - 移动端优化 */}
        {isOver && (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50">
            <p className="text-center text-blue-600 text-xs sm:text-sm">
              松开以移动任务到 &quot;{title}&quot;
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

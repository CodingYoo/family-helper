'use client'

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Task, TaskStatus, User } from '@/lib/types'
import { formatTime, formatDuration, getRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  assignedUser?: User
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
}

export function TaskCard({ task, assignedUser, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'border-gray-200 bg-white'
      case TaskStatus.IN_PROGRESS:
        return 'border-blue-200 bg-blue-50'
      case TaskStatus.COMPLETED:
        return 'border-green-200 bg-green-50'
      default:
        return 'border-gray-200 bg-white'
    }
  }

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return '⏳'
      case TaskStatus.IN_PROGRESS:
        return '🔄'
      case TaskStatus.COMPLETED:
        return '✅'
      default:
        return '⏳'
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'p-3 sm:p-4 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all duration-200 task-card draggable-item',
        'touch-action-none select-none',
        getStatusColor(task.status),
        isDragging && 'opacity-50 scale-105 shadow-lg',
        task.isUrgent && 'ring-2 ring-red-400'
      )}
    >
      {/* 任务头部 - 移动端优化 */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
          <span className="text-base sm:text-lg flex-shrink-0">{getStatusIcon(task.status)}</span>
          <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{task.title}</h3>
        </div>

        {task.isUrgent && (
          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full flex-shrink-0 ml-2">
            加急
          </span>
        )}
      </div>

      {/* 任务描述 */}
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* 任务信息 */}
      <div className="space-y-2">
        {/* 分配给 */}
        {assignedUser && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">分配给:</span>
            <span className="text-xs font-medium text-gray-700">
              {assignedUser.name}
            </span>
          </div>
        )}

        {/* 预估时间 */}
        {task.estimatedMinutes && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">预估:</span>
            <span className="text-xs text-gray-700">
              {formatDuration(task.estimatedMinutes)}
            </span>
          </div>
        )}

        {/* 实际时间（已完成任务） */}
        {task.status === TaskStatus.COMPLETED && task.actualMinutes && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">实际:</span>
            <span className="text-xs text-green-700 font-medium">
              {formatDuration(task.actualMinutes)}
            </span>
          </div>
        )}

        {/* 开始时间 */}
        {task.startedAt && task.status === TaskStatus.IN_PROGRESS && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">开始:</span>
            <span className="text-xs text-blue-700">
              {formatTime(new Date(task.startedAt))}
            </span>
          </div>
        )}

        {/* 完成时间 */}
        {task.completedAt && task.status === TaskStatus.COMPLETED && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">完成:</span>
            <span className="text-xs text-green-700">
              {formatTime(new Date(task.completedAt))}
            </span>
          </div>
        )}

        {/* 加急价格 */}
        {task.isUrgent && task.urgentPrice && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">外包价:</span>
            <span className="text-xs text-red-700 font-medium">
              ¥{task.urgentPrice}
            </span>
          </div>
        )}
      </div>

      {/* 分类标签 */}
      <div className="mt-3 flex items-center justify-between">
        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
          {task.category}
        </span>
        
        <span className="text-xs text-gray-400">
          {getRelativeTime(new Date(task.createdAt))}
        </span>
      </div>

      {/* 操作按钮（仅在非拖拽状态显示） - 移动端优化 */}
      {!isDragging && (onEdit || onDelete) && (
        <div className="mt-3 flex gap-3 sm:gap-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(task)
              }}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 btn-touch min-h-[32px] px-2"
            >
              编辑
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(task.id)
              }}
              className="text-xs sm:text-sm text-red-600 hover:text-red-800 btn-touch min-h-[32px] px-2"
            >
              删除
            </button>
          )}
        </div>
      )}
    </div>
  )
}

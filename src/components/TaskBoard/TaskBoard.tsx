'use client'

import React, { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { Task, TaskStatus, Family } from '@/lib/types'
import { useApp } from '@/contexts/AppContext'
import { TaskColumn } from './TaskColumn'
import { TaskCard } from '@/components/TaskCard/TaskCard'
import { isAfterWorkEndTime } from '@/lib/algorithms'

interface TaskBoardProps {
  tasks: Task[]
  family: Family
}

export function TaskBoard({ tasks, family }: TaskBoardProps) {
  const { actions } = useApp()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 100, // 移动端延迟激活，避免误触
        tolerance: 5,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find(t => t.id === active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as TaskStatus

    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return

    // 检查是否在收工时间后尝试移动任务
    const isAfterWorkEnd = isAfterWorkEndTime(family.workEndTime)
    
    if (isAfterWorkEnd && task.status === TaskStatus.TODO && newStatus === TaskStatus.IN_PROGRESS) {
      // 收工时间后不能开始新任务，需要议价
      alert('收工时间已到！如需继续工作，请使用加急功能。')
      return
    }

    // 移动任务
    actions.moveTask(taskId, newStatus)
  }

  const handleEditTask = (task: Task) => {
    // TODO: 实现任务编辑功能
    console.log('Edit task:', task)
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm('确定要删除这个任务吗？')) {
      actions.deleteTask(taskId)
    }
  }

  const columns = [
    {
      id: TaskStatus.TODO,
      title: '待做',
      status: TaskStatus.TODO,
    },
    {
      id: TaskStatus.IN_PROGRESS,
      title: '进行中',
      status: TaskStatus.IN_PROGRESS,
    },
    {
      id: TaskStatus.COMPLETED,
      title: '已完成',
      status: TaskStatus.COMPLETED,
    },
  ]

  return (
    <div className="w-full">
      {/* 任务统计信息 - 置于看板上方 */}
      <div className="mb-4 sm:mb-6 grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-lg border shadow-sm">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-gray-900">
              {tasks.filter(t => t.status === TaskStatus.TODO).length}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">待办任务</div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-lg border shadow-sm">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">进行中</div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-lg border shadow-sm">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {tasks.filter(t => t.status === TaskStatus.COMPLETED).length}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">已完成</div>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* 看板列 - 移动端优化 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {columns.map((column) => (
            <TaskColumn
              key={column.id}
              id={column.id}
              title={column.title}
              status={column.status}
              tasks={tasks}
              users={family.members}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>

        {/* 拖拽覆盖层 */}
        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3 scale-105">
              <TaskCard
                task={activeTask}
                assignedUser={family.members.find(u => u.id === activeTask.assignedTo)}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* 收工时间提示 */}
      {isAfterWorkEndTime(family.workEndTime) && (
        <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-orange-500">⏰</span>
            <p className="text-orange-700 text-sm">
              收工时间已到（{family.workEndTime}）！新增任务需要议价确认。
            </p>
          </div>
        </div>
      )}


    </div>
  )
}

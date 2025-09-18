'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { TaskBoard } from '@/components/TaskBoard'
import { Header } from '@/components/Header'
import { WorkBell } from '@/components/WorkBell'
import { TaskCreator } from '@/components/TaskCreator'
import { StatsModal } from '@/components/StatsModal'
import { UrgentRequestModal } from '@/components/UrgentRequestModal'
import { TaskGrabModal } from '@/components/TaskGrabModal'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { ViewportOptimizer, KeyboardAdapter, PerformanceMonitor, NetworkMonitor } from '@/components/MobileOptimizations'
import RoomManagerComponent from '@/components/RoomManager'

export default function Home() {
  const { state, actions } = useApp()
  const { data, isLoading, isInRoom } = state
  const [showTaskCreator, setShowTaskCreator] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showWorkBell, setShowWorkBell] = useState(false)
  const [showUrgentRequests, setShowUrgentRequests] = useState(false)
  const [showTaskGrab, setShowTaskGrab] = useState(false)

  // 检查是否到了收工时间
  useEffect(() => {
    if (!data) return

    const checkWorkEndTime = () => {
      const now = new Date()
      const [hours, minutes] = data.family.workEndTime.split(':').map(Number)
      const workEndToday = new Date()
      workEndToday.setHours(hours, minutes, 0, 0)

      if (now >= workEndToday && !showWorkBell) {
        setShowWorkBell(true)
      }
    }

    const interval = setInterval(checkWorkEndTime, 60000) // 每分钟检查一次
    checkWorkEndTime() // 立即检查一次

    return () => clearInterval(interval)
  }, [data, showWorkBell])

  // 检查是否有待处理的加急请求
  useEffect(() => {
    if (!data) return

    const pendingRequests = data.urgentRequests.filter(req => req.status === 'pending')
    if (pendingRequests.length > 0 && !showUrgentRequests) {
      // 延迟显示，避免与收工铃冲突
      setTimeout(() => {
        setShowUrgentRequests(true)
      }, 1000)
    }
  }, [data, showUrgentRequests])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">数据加载失败，请刷新页面重试</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen-safe bg-gray-50">
      {/* 移动端优化组件 */}
      <ViewportOptimizer />
      <KeyboardAdapter />
      <PerformanceMonitor />
      <NetworkMonitor />

      {/* 房间管理 - 如果不在房间中则显示 */}
      {!isInRoom && (
        <div className="container mx-auto px-4 py-6">
          <RoomManagerComponent
            onRoomJoined={(roomId) => {
              // 房间加入成功后重新加载数据
              window.location.reload()
            }}
          />
        </div>
      )}

      {/* 主应用界面 - 只有在房间中才显示 */}
      {isInRoom && (
        <>
          <Header
            family={data.family}
            onShowStats={() => setShowStats(true)}
            onShowTaskCreator={() => setShowTaskCreator(true)}
            onShowTaskGrab={() => setShowTaskGrab(true)}
          />

          <main className="container mx-auto px-4 py-6">
            <TaskBoard
              tasks={data.tasks}
              family={data.family}
            />
          </main>
        </>
      )}

      {/* 任务创建弹窗 */}
      {showTaskCreator && (
        <TaskCreator
          family={data.family}
          onClose={() => setShowTaskCreator(false)}
        />
      )}

      {/* 统计弹窗 */}
      {showStats && (
        <StatsModal
          family={data.family}
          tasks={data.tasks}
          dailyStats={data.dailyStats}
          onClose={() => setShowStats(false)}
        />
      )}

      {/* 收工铃弹窗 */}
      {showWorkBell && (
        <WorkBell
          workEndTime={data.family.workEndTime}
          onClose={() => setShowWorkBell(false)}
          onContinue={() => {
            setShowWorkBell(false)
            setShowTaskCreator(true)
          }}
        />
      )}

      {/* 加急请求弹窗 */}
      {showUrgentRequests && (
        <UrgentRequestModal
          requests={data.urgentRequests}
          family={data.family}
          onClose={() => setShowUrgentRequests(false)}
        />
      )}

      {/* 抢单弹窗 */}
      {showTaskGrab && (
        <TaskGrabModal
          availableTasks={data.tasks}
          family={data.family}
          currentUserId={data.family.members[0].id} // TODO: 获取当前用户ID
          onClose={() => setShowTaskGrab(false)}
        />
      )}

      {/* PWA安装提示 */}
      <PWAInstallPrompt />
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { formatTime } from '@/lib/utils'

interface WorkBellProps {
  workEndTime: string
  onClose: () => void
  onContinue: () => void
}

export function WorkBell({ workEndTime, onClose, onContinue }: WorkBellProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showAnimation, setShowAnimation] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // 铃声动画
    const animationTimer = setTimeout(() => {
      setShowAnimation(false)
    }, 2000)

    return () => {
      clearInterval(timer)
      clearTimeout(animationTimer)
    }
  }, [])

  // 播放铃声（如果浏览器支持）
  useEffect(() => {
    const playBellSound = () => {
      try {
        // 创建简单的铃声
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      } catch (error) {
        console.log('无法播放铃声:', error)
      }
    }

    playBellSound()
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative overflow-hidden">
        {/* 背景动画 */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-yellow-50 opacity-50"></div>

        <div className="relative text-center">
          {/* 铃铛动画 */}
          <div className={`text-6xl mb-4 transition-transform duration-300 ${
            showAnimation ? 'animate-bounce' : ''
          }`}>
            🔔
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Time is up!
          </h2>

          <div className="mb-4">
            <p className="text-gray-600 mb-2">
              收工时间到了！（{workEndTime}）
            </p>
            <p className="text-sm text-gray-500">
              当前时间：{formatTime(currentTime)}
            </p>
          </div>

          {/* 收工说明 */}
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg text-left">
            <h3 className="font-medium text-orange-800 mb-2">收工规则：</h3>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• 新增任务默认延期到明天</li>
              <li>• 继续工作需要议价确认</li>
              <li>• 议价金额将加入月度基金</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              <span className="mr-2">😴</span>
              直接收工
            </Button>
            <Button variant="primary" onClick={onContinue} className="flex-1">
              <span className="mr-2">💪</span>
              仍要加急
            </Button>
          </div>

          {/* 温馨提示 */}
          <p className="text-xs text-gray-400 mt-4">
            💡 适当休息有助于提高工作效率
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useEffect, useState } from 'react'

// 移动端视口优化
export function ViewportOptimizer() {
  useEffect(() => {
    // 防止iOS Safari地址栏影响视口高度
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    setViewportHeight()
    window.addEventListener('resize', setViewportHeight)
    window.addEventListener('orientationchange', setViewportHeight)

    return () => {
      window.removeEventListener('resize', setViewportHeight)
      window.removeEventListener('orientationchange', setViewportHeight)
    }
  }, [])

  return null
}

// 触摸反馈组件
interface TouchFeedbackProps {
  children: React.ReactNode
  className?: string
  onTap?: () => void
  disabled?: boolean
}

export function TouchFeedback({ children, className = '', onTap, disabled = false }: TouchFeedbackProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleTouchStart = () => {
    if (!disabled) {
      setIsPressed(true)
    }
  }

  const handleTouchEnd = () => {
    setIsPressed(false)
    if (onTap && !disabled) {
      onTap()
    }
  }

  const handleTouchCancel = () => {
    setIsPressed(false)
  }

  return (
    <div
      className={`
        ${className}
        ${isPressed ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        transition-all duration-150 ease-out
        select-none
      `}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchCancel}
    >
      {children}
    </div>
  )
}

// 滑动手势检测
interface SwipeGestureProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  className?: string
}

export function SwipeGesture({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  className = ''
}: SwipeGestureProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isLeftSwipe = distanceX > threshold
    const isRightSwipe = distanceX < -threshold
    const isUpSwipe = distanceY > threshold
    const isDownSwipe = distanceY < -threshold

    // 优先处理水平滑动
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft()
      }
      if (isRightSwipe && onSwipeRight) {
        onSwipeRight()
      }
    } else {
      if (isUpSwipe && onSwipeUp) {
        onSwipeUp()
      }
      if (isDownSwipe && onSwipeDown) {
        onSwipeDown()
      }
    }
  }

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  )
}

// 长按手势检测
interface LongPressProps {
  children: React.ReactNode
  onLongPress: () => void
  delay?: number
  className?: string
}

export function LongPress({ children, onLongPress, delay = 500, className = '' }: LongPressProps) {
  const [isLongPress, setIsLongPress] = useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleStart = () => {
    setIsLongPress(false)
    timeoutRef.current = setTimeout(() => {
      setIsLongPress(true)
      onLongPress()
      
      // 触觉反馈（如果支持）
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }, delay)
  }

  const handleEnd = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsLongPress(false)
  }

  return (
    <div
      className={`${className} ${isLongPress ? 'ring-2 ring-blue-500' : ''}`}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      {children}
    </div>
  )
}

// 移动端键盘适配
export function KeyboardAdapter() {
  useEffect(() => {
    const handleResize = () => {
      // 检测虚拟键盘是否打开
      const isKeyboardOpen = window.innerHeight < window.screen.height * 0.75
      
      if (isKeyboardOpen) {
        document.body.classList.add('keyboard-open')
      } else {
        document.body.classList.remove('keyboard-open')
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return null
}

// 性能监控
export function PerformanceMonitor() {
  useEffect(() => {
    // 监控页面加载性能
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            console.log('[Performance] Page load time:', entry.duration)
          }
          if (entry.entryType === 'paint') {
            console.log(`[Performance] ${entry.name}:`, entry.startTime)
          }
        }
      })

      observer.observe({ entryTypes: ['navigation', 'paint'] })

      return () => observer.disconnect()
    }
  }, [])

  return null
}

// 网络状态监控
export function NetworkMonitor() {
  const [isOnline, setIsOnline] = useState(true)
  const [connectionType, setConnectionType] = useState<string>('')

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    const updateConnectionType = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection
      
      if (connection) {
        setConnectionType(connection.effectiveType || connection.type || 'unknown')
      }
    }

    updateOnlineStatus()
    updateConnectionType()

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', updateConnectionType)
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      if (connection) {
        connection.removeEventListener('change', updateConnectionType)
      }
    }
  }, [])

  // 显示离线提示
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm z-50">
        📡 网络连接已断开，正在离线模式下运行
      </div>
    )
  }

  // 显示慢网络提示
  if (connectionType === 'slow-2g' || connectionType === '2g') {
    return (
      <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 text-sm z-50">
        🐌 网络连接较慢，部分功能可能受影响
      </div>
    )
  }

  return null
}

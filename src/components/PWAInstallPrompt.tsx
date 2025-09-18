'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // 检测iOS设备
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // 检测是否已经是PWA模式
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone ||
                      document.referrer.includes('android-app://')
    setIsStandalone(standalone)

    // 监听PWA安装事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // 延迟显示安装提示
      setTimeout(() => {
        setShowInstallPrompt(true)
      }, 3000)
    }

    // 监听PWA安装完成事件
    const handleAppInstalled = () => {
      console.log('[PWA] App was installed')
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      console.log(`[PWA] User response to install prompt: ${outcome}`)
      
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    } catch (error) {
      console.error('[PWA] Install prompt failed:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // 24小时后再次显示
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // 检查是否在24小时内被拒绝过
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const now = Date.now()
      const hoursPassed = (now - dismissedTime) / (1000 * 60 * 60)
      
      if (hoursPassed < 24) {
        setShowInstallPrompt(false)
        return
      }
    }
  }, [])

  // 如果已经是PWA模式，不显示安装提示
  if (isStandalone) {
    return null
  }

  // iOS设备显示手动安装指引
  if (isIOS && showInstallPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📱</div>
          <div className="flex-1">
            <h3 className="font-bold mb-2">安装家庭助手到主屏幕</h3>
            <div className="text-sm space-y-1">
              <p>1. 点击浏览器底部的分享按钮 📤</p>
              <p>2. 选择"添加到主屏幕"</p>
              <p>3. 点击"添加"完成安装</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  // Android/桌面设备显示安装按钮
  if (deferredPrompt && showInstallPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-lg z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🏠</div>
            <div>
              <h3 className="font-bold">安装家庭助手</h3>
              <p className="text-sm text-blue-100">
                安装到设备，获得更好的使用体验
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              className="text-white border-white hover:bg-white hover:text-blue-600"
            >
              稍后
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleInstallClick}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              安装
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// PWA状态检测Hook
export function usePWAStatus() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    // 检测是否已安装
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone ||
                      document.referrer.includes('android-app://')
    setIsInstalled(standalone)

    // 监听安装提示事件
    const handleBeforeInstallPrompt = () => {
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  return { isInstalled, isInstallable }
}

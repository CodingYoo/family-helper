'use client'

import { useState, useEffect } from 'react'
import { RoomManager } from '@/lib/room'

interface ConnectionStatusProps {
  className?: string
}

export default function ConnectionStatus({ className = '' }: ConnectionStatusProps) {
  const [status, setStatus] = useState({
    localSync: false,
    webrtcSync: false,
    connectedDevices: 0
  })
  const [roomId, setRoomId] = useState<string | null>(null)

  useEffect(() => {
    const roomManager = RoomManager.getInstance()
    
    // 获取初始状态
    const updateStatus = () => {
      const connectionStatus = roomManager.getConnectionStatus()
      const currentRoomId = roomManager.getCurrentRoomId()
      
      setStatus(connectionStatus)
      setRoomId(currentRoomId)
    }

    // 立即更新一次
    updateStatus()

    // 定期更新状态
    const interval = setInterval(updateStatus, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  if (!roomId) {
    return null // 不在房间中时不显示
  }

  const getStatusColor = () => {
    if (status.connectedDevices > 0) {
      return 'text-green-600 bg-green-50 border-green-200'
    } else if (status.webrtcSync) {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    } else {
      return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusText = () => {
    if (status.connectedDevices > 0) {
      return `已连接 ${status.connectedDevices} 台设备`
    } else if (status.webrtcSync) {
      return '等待其他设备连接...'
    } else {
      return '仅本地同步'
    }
  }

  const getStatusIcon = () => {
    if (status.connectedDevices > 0) {
      return '🟢' // 绿色圆点表示已连接
    } else if (status.webrtcSync) {
      return '🟡' // 黄色圆点表示等待连接
    } else {
      return '⚪' // 白色圆点表示离线
    }
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor()} ${className}`}>
      <span className="text-base">{getStatusIcon()}</span>
      <span>{getStatusText()}</span>
      
      {/* 详细信息（可选显示） */}
      <div className="hidden sm:flex items-center gap-1 ml-2 text-xs opacity-75">
        <span title="房间ID">🏠 {roomId}</span>
        {status.localSync && (
          <span title="本地标签页同步">📱</span>
        )}
        {status.webrtcSync && (
          <span title="WebRTC跨设备同步">🌐</span>
        )}
      </div>
    </div>
  )
}

// 连接状态详情模态框组件
export function ConnectionStatusModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean
  onClose: () => void 
}) {
  const [status, setStatus] = useState({
    localSync: false,
    webrtcSync: false,
    connectedDevices: 0
  })
  const [roomId, setRoomId] = useState<string | null>(null)
  const [connectedDevices, setConnectedDevices] = useState<string[]>([])
  const [shareLink, setShareLink] = useState('')

  useEffect(() => {
    if (!isOpen) return

    const roomManager = RoomManager.getInstance()
    
    const updateStatus = () => {
      const connectionStatus = roomManager.getConnectionStatus()
      const currentRoomId = roomManager.getCurrentRoomId()
      const devices = roomManager.getConnectedDevices()
      const link = roomManager.getRoomShareLink()
      
      setStatus(connectionStatus)
      setRoomId(currentRoomId)
      setConnectedDevices(devices)
      setShareLink(link)
    }

    updateStatus()
    const interval = setInterval(updateStatus, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [isOpen])

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      alert('分享链接已复制到剪贴板！')
    } catch (error) {
      console.error('复制失败:', error)
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = shareLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('分享链接已复制到剪贴板！')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">连接状态</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* 房间信息 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">房间信息</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>房间ID: <span className="font-mono">{roomId}</span></div>
                <div>连接设备: {status.connectedDevices} 台</div>
              </div>
            </div>

            {/* 同步状态 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">同步状态</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={status.localSync ? 'text-green-600' : 'text-red-600'}>
                    {status.localSync ? '✅' : '❌'}
                  </span>
                  <span className="text-sm">本地标签页同步</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={status.webrtcSync ? 'text-green-600' : 'text-red-600'}>
                    {status.webrtcSync ? '✅' : '❌'}
                  </span>
                  <span className="text-sm">WebRTC跨设备同步</span>
                </div>
              </div>
            </div>

            {/* 连接的设备 */}
            {connectedDevices.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">连接的设备</h4>
                <div className="space-y-1">
                  {connectedDevices.map((deviceId, index) => (
                    <div key={deviceId} className="text-sm text-gray-600 font-mono">
                      设备 {index + 1}: {deviceId.substring(0, 8)}...
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 分享链接 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">邀请其他设备</h4>
              <p className="text-sm text-gray-600 mb-3">
                分享此链接给其他设备，即可实现实时数据同步
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                />
                <button
                  onClick={copyShareLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  复制
                </button>
              </div>
            </div>

            {/* 使用说明 */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">使用说明</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• 确保所有设备在同一局域网内</div>
                <div>• 第一个打开房间的设备将作为主机</div>
                <div>• 其他设备通过分享链接自动连接</div>
                <div>• 任何设备的操作都会实时同步</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { RoomManager, RoomInfo, RoomMember } from '@/lib/room'

interface RoomManagerProps {
  onRoomJoined: (roomId: string) => void
}

export default function RoomManagerComponent({ onRoomJoined }: RoomManagerProps) {
  const [roomManager] = useState(() => RoomManager.getInstance())
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null)
  const [members, setMembers] = useState<RoomMember[]>([])
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [showJoinRoom, setShowJoinRoom] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [joinRoomId, setJoinRoomId] = useState('')
  const [memberName, setMemberName] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    const roomId = roomManager.getCurrentRoomId()
    if (roomId) {
      setCurrentRoom(roomId)
      loadRoomData(roomId)
    }
  }, [roomManager])

  const loadRoomData = (roomId: string) => {
    const info = roomManager.getRoomInfo(roomId)
    setRoomInfo(info)
    
    const roomMembers = roomManager.getRoomMembers()
    setMembers(roomMembers)
  }

  const handleCreateRoom = () => {
    if (!roomName.trim() || !memberName.trim()) return
    
    const roomId = roomManager.createRoom(roomName.trim())
    roomManager.addMemberToRoom(memberName.trim())
    
    setCurrentRoom(roomId)
    loadRoomData(roomId)
    setShowCreateRoom(false)
    setRoomName('')
    setMemberName('')
    onRoomJoined(roomId)
  }

  const handleJoinRoom = () => {
    if (!joinRoomId.trim() || !memberName.trim()) return
    
    const success = roomManager.joinRoom(joinRoomId.trim().toUpperCase())
    if (success) {
      roomManager.addMemberToRoom(memberName.trim())
      setCurrentRoom(joinRoomId.trim().toUpperCase())
      loadRoomData(joinRoomId.trim().toUpperCase())
      setShowJoinRoom(false)
      setJoinRoomId('')
      setMemberName('')
      onRoomJoined(joinRoomId.trim().toUpperCase())
    } else {
      alert('房间不存在或已过期')
    }
  }

  const handleShare = () => {
    const shareLink = roomManager.getRoomShareLink()
    navigator.clipboard.writeText(shareLink).then(() => {
      alert('分享链接已复制到剪贴板！')
      setShowShareModal(false)
    }).catch(() => {
      setShowShareModal(true)
    })
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 如果已经在房间中，显示房间信息
  if (currentRoom && roomInfo) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{roomInfo.name}</h3>
            <p className="text-sm text-gray-500">房间ID: {currentRoom}</p>
          </div>
          <button
            onClick={handleShare}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            分享房间
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>👥 {members.length} 位成员</span>
          <span>🕒 创建于 {formatTime(roomInfo.createdAt)}</span>
        </div>
        
        {members.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
              >
                <div className={`w-2 h-2 rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span>{member.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* 分享模态框 */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">分享房间</h3>
              <p className="text-sm text-gray-600 mb-4">
                复制下面的链接分享给其他家庭成员：
              </p>
              <div className="bg-gray-100 p-3 rounded-lg mb-4 break-all text-sm">
                {roomManager.getRoomShareLink()}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(roomManager.getRoomShareLink())
                    alert('已复制到剪贴板！')
                    setShowShareModal(false)
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  复制链接
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // 如果没有房间，显示创建/加入选项
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">欢迎使用家庭助手</h2>
        <p className="text-gray-600">创建新的家庭房间或加入现有房间开始协作</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setShowCreateRoom(true)}
          className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <div className="text-center">
            <div className="text-2xl mb-2">🏠</div>
            <h3 className="font-medium text-gray-900">创建新房间</h3>
            <p className="text-sm text-gray-500 mt-1">建立一个新的家庭协作空间</p>
          </div>
        </button>

        <button
          onClick={() => setShowJoinRoom(true)}
          className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
        >
          <div className="text-center">
            <div className="text-2xl mb-2">🚪</div>
            <h3 className="font-medium text-gray-900">加入房间</h3>
            <p className="text-sm text-gray-500 mt-1">使用房间ID加入现有家庭</p>
          </div>
        </button>
      </div>

      {/* 创建房间模态框 */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">创建新房间</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  房间名称
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="例如：我们的家"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  您的昵称
                </label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="例如：小明"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreateRoom}
                disabled={!roomName.trim() || !memberName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                创建房间
              </button>
              <button
                onClick={() => {
                  setShowCreateRoom(false)
                  setRoomName('')
                  setMemberName('')
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 加入房间模态框 */}
      {showJoinRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">加入房间</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  房间ID
                </label>
                <input
                  type="text"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                  placeholder="例如：ABC12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  您的昵称
                </label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="例如：小红"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleJoinRoom}
                disabled={!joinRoomId.trim() || !memberName.trim()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                加入房间
              </button>
              <button
                onClick={() => {
                  setShowJoinRoom(false)
                  setJoinRoomId('')
                  setMemberName('')
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

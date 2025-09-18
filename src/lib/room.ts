/**
 * 房间系统 - 支持多用户数据共享
 * 基于URL参数和localStorage实现，无需数据库
 * 集成WebRTC实现跨设备实时同步
 */

import { WebRTCManager } from './webrtc'

export interface RoomInfo {
  id: string
  name: string
  createdAt: string
  lastActive: string
  memberCount: number
}

export interface RoomMember {
  id: string
  name: string
  joinedAt: string
  lastSeen: string
  isOnline: boolean
}

export class RoomManager {
  private static instance: RoomManager
  private currentRoomId: string | null = null
  private broadcastChannel: BroadcastChannel | null = null
  private syncInterval: NodeJS.Timeout | null = null
  private onDataChangeCallback: (() => void) | null = null
  private webrtcManager: WebRTCManager | null = null
  private connectedPeers: Set<string> = new Set()

  private constructor() {
    // 从URL获取房间ID
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      this.currentRoomId = urlParams.get('room')
      
      if (this.currentRoomId) {
        this.initializeRoom(this.currentRoomId)
      }
    }
  }

  static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager()
    }
    return RoomManager.instance
  }

  /**
   * 创建新房间
   */
  createRoom(roomName: string): string {
    const roomId = this.generateRoomId()
    const roomInfo: RoomInfo = {
      id: roomId,
      name: roomName,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      memberCount: 1
    }

    // 保存房间信息
    localStorage.setItem(`room:${roomId}:info`, JSON.stringify(roomInfo))

    // 标记当前设备为房间主机
    localStorage.setItem(`room:${roomId}:host`, this.getUserId())

    // 更新URL
    this.updateURL(roomId)

    // 初始化房间
    this.initializeRoom(roomId)

    return roomId
  }

  /**
   * 加入现有房间
   */
  joinRoom(roomId: string): boolean {
    const roomInfo = this.getRoomInfo(roomId)
    if (!roomInfo) {
      return false
    }

    // 更新房间活跃时间
    roomInfo.lastActive = new Date().toISOString()
    localStorage.setItem(`room:${roomId}:info`, JSON.stringify(roomInfo))

    // 更新URL
    this.updateURL(roomId)
    
    // 初始化房间
    this.initializeRoom(roomId)
    
    return true
  }

  /**
   * 获取房间信息
   */
  getRoomInfo(roomId: string): RoomInfo | null {
    const stored = localStorage.getItem(`room:${roomId}:info`)
    return stored ? JSON.parse(stored) : null
  }

  /**
   * 获取当前房间ID
   */
  getCurrentRoomId(): string | null {
    return this.currentRoomId
  }

  /**
   * 获取房间分享链接
   */
  getRoomShareLink(roomId?: string): string {
    const id = roomId || this.currentRoomId
    if (!id) return window.location.origin
    
    const url = new URL(window.location.origin)
    url.searchParams.set('room', id)
    return url.toString()
  }

  /**
   * 初始化房间
   */
  private async initializeRoom(roomId: string) {
    this.currentRoomId = roomId

    // 设置广播频道用于跨标签页同步
    if (this.broadcastChannel) {
      this.broadcastChannel.close()
    }

    this.broadcastChannel = new BroadcastChannel(`room:${roomId}`)
    this.broadcastChannel.onmessage = (event) => {
      if (event.data.type === 'data-sync') {
        // 收到其他标签页的数据更新通知
        if (this.onDataChangeCallback) {
          this.onDataChangeCallback()
        }
      }
    }

    // 初始化WebRTC连接
    await this.initializeWebRTC(roomId)

    // 设置定期同步（作为备用机制）
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = setInterval(() => {
      this.updateLastSeen()
    }, 30000) // 每30秒更新一次在线状态
  }

  /**
   * 初始化WebRTC连接
   */
  private async initializeWebRTC(roomId: string) {
    try {
      this.webrtcManager = WebRTCManager.getInstance()

      await this.webrtcManager.initialize({
        roomId: roomId,
        deviceId: this.getUserId(),
        onDataReceived: (data: any, senderId: string) => {
          console.log('[Room] 收到来自', senderId, '的数据同步')
          // 触发数据更新回调
          if (this.onDataChangeCallback) {
            this.onDataChangeCallback()
          }
        },
        onPeerConnected: (peerId: string) => {
          console.log('[Room] 设备连接:', peerId)
          this.connectedPeers.add(peerId)
          this.updateConnectedPeersStatus()
        },
        onPeerDisconnected: (peerId: string) => {
          console.log('[Room] 设备断开:', peerId)
          this.connectedPeers.delete(peerId)
          this.updateConnectedPeersStatus()
        }
      })

      console.log('[Room] WebRTC初始化完成')
    } catch (error) {
      console.error('[Room] WebRTC初始化失败:', error)
    }
  }

  /**
   * 更新连接设备状态
   */
  private updateConnectedPeersStatus() {
    // 更新房间信息中的在线设备数量
    if (this.currentRoomId) {
      const roomInfo = this.getRoomInfo(this.currentRoomId)
      if (roomInfo) {
        roomInfo.memberCount = this.connectedPeers.size + 1 // +1 包括当前设备
        roomInfo.lastActive = new Date().toISOString()
        localStorage.setItem(`room:${this.currentRoomId}:info`, JSON.stringify(roomInfo))
      }
    }
  }

  /**
   * 广播数据变更
   */
  broadcastDataChange() {
    // 本地标签页同步
    if (this.broadcastChannel && this.currentRoomId) {
      this.broadcastChannel.postMessage({
        type: 'data-sync',
        roomId: this.currentRoomId,
        timestamp: Date.now()
      })
    }

    // 跨设备WebRTC同步
    if (this.webrtcManager) {
      // 获取当前房间的所有数据
      const roomData = this.getRoomData()
      this.webrtcManager.syncData(roomData)
    }
  }

  /**
   * 获取房间数据
   */
  private getRoomData(): any {
    if (!this.currentRoomId) return null

    const dataKey = `room:${this.currentRoomId}:data`
    const stored = localStorage.getItem(dataKey)
    return stored ? JSON.parse(stored) : null
  }

  /**
   * 设置数据变更回调
   */
  onDataChange(callback: () => void) {
    this.onDataChangeCallback = callback
  }

  /**
   * 更新最后在线时间
   */
  private updateLastSeen() {
    if (!this.currentRoomId) return
    
    const memberKey = `room:${this.currentRoomId}:member:${this.getUserId()}`
    const member = this.getCurrentMember()
    if (member) {
      member.lastSeen = new Date().toISOString()
      member.isOnline = true
      localStorage.setItem(memberKey, JSON.stringify(member))
    }
  }

  /**
   * 获取当前用户成员信息
   */
  getCurrentMember(): RoomMember | null {
    if (!this.currentRoomId) return null
    
    const memberKey = `room:${this.currentRoomId}:member:${this.getUserId()}`
    const stored = localStorage.getItem(memberKey)
    return stored ? JSON.parse(stored) : null
  }

  /**
   * 添加成员到房间
   */
  addMemberToRoom(name: string): RoomMember {
    if (!this.currentRoomId) {
      throw new Error('No active room')
    }

    const member: RoomMember = {
      id: this.getUserId(),
      name,
      joinedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      isOnline: true
    }

    const memberKey = `room:${this.currentRoomId}:member:${member.id}`
    localStorage.setItem(memberKey, JSON.stringify(member))
    
    return member
  }

  /**
   * 获取房间所有成员
   */
  getRoomMembers(): RoomMember[] {
    if (!this.currentRoomId) return []
    
    const members: RoomMember[] = []
    const prefix = `room:${this.currentRoomId}:member:`
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) {
        const stored = localStorage.getItem(key)
        if (stored) {
          const member = JSON.parse(stored)
          // 检查是否在线（5分钟内活跃）
          const lastSeen = new Date(member.lastSeen)
          const now = new Date()
          member.isOnline = (now.getTime() - lastSeen.getTime()) < 5 * 60 * 1000
          members.push(member)
        }
      }
    }
    
    return members.sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime())
  }

  /**
   * 生成房间ID
   */
  private generateRoomId(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  /**
   * 获取用户ID（基于浏览器指纹）
   */
  private getUserId(): string {
    let userId = localStorage.getItem('user:id')
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substring(2, 15)
      localStorage.setItem('user:id', userId)
    }
    return userId
  }

  /**
   * 更新URL参数
   */
  private updateURL(roomId: string) {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('room', roomId)
      window.history.replaceState({}, '', url.toString())
    }
  }

  /**
   * 获取连接的设备列表
   */
  getConnectedDevices(): string[] {
    return this.webrtcManager ? this.webrtcManager.getConnectedPeers() : []
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus(): {
    localSync: boolean
    webrtcSync: boolean
    connectedDevices: number
  } {
    return {
      localSync: this.broadcastChannel !== null,
      webrtcSync: this.webrtcManager !== null,
      connectedDevices: this.connectedPeers.size
    }
  }

  /**
   * 清理资源
   */
  cleanup() {
    if (this.broadcastChannel) {
      this.broadcastChannel.close()
      this.broadcastChannel = null
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }

    if (this.webrtcManager) {
      this.webrtcManager.disconnect()
      this.webrtcManager = null
    }

    this.connectedPeers.clear()
  }
}

export default RoomManager

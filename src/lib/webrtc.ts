/**
 * WebRTC P2P 局域网同步管理器
 * 实现设备间直接通信，无需外部服务器
 */

export interface PeerMessage {
  type: 'data-sync' | 'ping' | 'pong' | 'offer' | 'answer' | 'ice-candidate'
  data?: any
  timestamp: number
  senderId: string
}

export interface WebRTCConfig {
  roomId: string
  deviceId: string
  onDataReceived: (data: any, senderId: string) => void
  onPeerConnected: (peerId: string) => void
  onPeerDisconnected: (peerId: string) => void
}

export class WebRTCManager {
  private static instance: WebRTCManager | null = null
  private config: WebRTCConfig | null = null
  private peers: Map<string, RTCPeerConnection> = new Map()
  private dataChannels: Map<string, RTCDataChannel> = new Map()
  private isHost: boolean = false
  private deviceId: string = ''
  private roomId: string = ''
  private connectionOffers: Map<string, any> = new Map()
  private signalingInterval: NodeJS.Timeout | null = null
  private lastSignalingCheck: number = 0

  private constructor() {}

  static getInstance(): WebRTCManager {
    if (!WebRTCManager.instance) {
      WebRTCManager.instance = new WebRTCManager()
    }
    return WebRTCManager.instance
  }

  /**
   * 初始化WebRTC管理器
   */
  async initialize(config: WebRTCConfig): Promise<void> {
    this.config = config
    this.roomId = config.roomId
    this.deviceId = config.deviceId

    // 检查是否为房间创建者（通过localStorage判断）
    const roomData = localStorage.getItem(`room:${this.roomId}:host`)
    this.isHost = roomData === this.deviceId

    // 启动信令轮询
    this.startSignalingPolling()

    if (this.isHost) {
      console.log('[WebRTC] 初始化为房间主机')
      await this.initializeAsHost()
    } else {
      console.log('[WebRTC] 初始化为客户端')
      await this.initializeAsClient()
    }
  }

  /**
   * 作为房间主机初始化
   */
  private async initializeAsHost(): Promise<void> {
    // 标记为房间主机
    localStorage.setItem(`room:${this.roomId}:host`, this.deviceId)
    
    // 监听连接请求
    this.startListeningForConnections()
  }

  /**
   * 作为客户端初始化
   */
  private async initializeAsClient(): Promise<void> {
    // 尝试连接到房间主机
    await this.connectToHost()
  }

  /**
   * 开始监听连接请求（主机模式）
   */
  private startListeningForConnections(): void {
    // 使用localStorage + 定时器模拟信令服务器
    const checkInterval = setInterval(() => {
      const connectionsKey = `room:${this.roomId}:connections`
      const connectionsData = localStorage.getItem(connectionsKey)
      
      if (connectionsData) {
        try {
          const connections = JSON.parse(connectionsData)
          for (const [peerId] of Object.entries(connections)) {
            if (peerId !== this.deviceId && !this.peers.has(peerId)) {
              this.handleConnectionRequest(peerId)
            }
          }
        } catch (error) {
          console.error('[WebRTC] 解析连接数据失败:', error)
        }
      }
    }, 1000)

    // 清理函数
    window.addEventListener('beforeunload', () => {
      clearInterval(checkInterval)
    })
  }

  /**
   * 连接到房间主机（客户端模式）
   */
  private async connectToHost(): Promise<void> {
    // 等待一下，让主机有时间设置
    await new Promise(resolve => setTimeout(resolve, 1000))

    const hostId = localStorage.getItem(`room:${this.roomId}:host`)
    if (!hostId) {
      console.error('[WebRTC] 未找到房间主机')
      return
    }

    if (hostId === this.deviceId) {
      console.log('[WebRTC] 当前设备就是主机，切换为主机模式')
      this.isHost = true
      await this.initializeAsHost()
      return
    }

    // 发送连接请求给主机
    this.sendSignalingMessage(hostId, {
      type: 'connection-request'
    })

    console.log('[WebRTC] 已发送连接请求给主机:', hostId)


  }

  /**
   * 监听主机的offer（客户端模式）
   */
  private startListeningForOffer(): void {
    const checkInterval = setInterval(async () => {
      const offerKey = `room:${this.roomId}:offer:${this.deviceId}`
      const offerData = localStorage.getItem(offerKey)

      if (offerData) {
        try {
          const { offer, hostId } = JSON.parse(offerData)
          console.log('[WebRTC] 收到主机offer')

          // 清理offer数据
          localStorage.removeItem(offerKey)
          clearInterval(checkInterval)

          // 处理offer
          await this.handleOffer(hostId, offer)

        } catch (error) {
          console.error('[WebRTC] 处理offer失败:', error)
        }
      }
    }, 1000)

    // 清理函数
    setTimeout(() => {
      clearInterval(checkInterval)
    }, 30000) // 30秒超时
  }



  /**
   * 监听ICE候选
   */
  private startListeningForIceCandidates(peerId: string): void {
    const checkInterval = setInterval(() => {
      const candidateKey = `room:${this.roomId}:ice:${peerId}:${this.deviceId}`
      const candidateData = localStorage.getItem(candidateKey)

      if (candidateData) {
        try {
          const { candidate } = JSON.parse(candidateData)
          const peerConnection = this.peers.get(peerId)

          if (peerConnection && candidate) {
            peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
            localStorage.removeItem(candidateKey)
          }
        } catch (error) {
          console.error('[WebRTC] 处理ICE候选失败:', error)
        }
      }
    }, 1000)

    // 清理函数
    window.addEventListener('beforeunload', () => {
      clearInterval(checkInterval)
    })
  }



  /**
   * 监听客户端的answer（主机模式）
   */
  private startListeningForAnswer(peerId: string): void {
    const checkInterval = setInterval(async () => {
      const answerKey = `room:${this.roomId}:answer:${peerId}`
      const answerData = localStorage.getItem(answerKey)

      if (answerData) {
        try {
          const { answer } = JSON.parse(answerData)
          console.log('[WebRTC] 收到客户端answer')

          // 清理answer数据
          localStorage.removeItem(answerKey)
          clearInterval(checkInterval)

          // 设置远程描述
          const peerConnection = this.peers.get(peerId)
          if (peerConnection) {
            await peerConnection.setRemoteDescription(answer)

            // 开始监听ICE候选
            this.startListeningForIceCandidates(peerId)
          }

        } catch (error) {
          console.error('[WebRTC] 处理answer失败:', error)
        }
      }
    }, 1000)

    // 清理函数
    setTimeout(() => {
      clearInterval(checkInterval)
    }, 30000) // 30秒超时
  }

  /**
   * 创建RTCPeerConnection
   */
  private async createPeerConnection(peerId: string): Promise<RTCPeerConnection> {
    const configuration: RTCConfiguration = {
      iceServers: [
        // 使用本地网络，不需要STUN服务器
        // { urls: 'stun:stun.l.google.com:19302' }
      ]
    }

    const peerConnection = new RTCPeerConnection(configuration)
    this.peers.set(peerId, peerConnection)

    // 处理ICE候选
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendIceCandidate(peerId, event.candidate)
      }
    }

    // 处理连接状态变化
    peerConnection.onconnectionstatechange = () => {
      console.log('[WebRTC] 连接状态:', peerConnection.connectionState)
      if (peerConnection.connectionState === 'connected') {
        this.config?.onPeerConnected(peerId)
      } else if (peerConnection.connectionState === 'disconnected' || 
                 peerConnection.connectionState === 'failed') {
        this.config?.onPeerDisconnected(peerId)
        this.cleanupPeer(peerId)
      }
    }

    // 处理数据通道（客户端接收）
    peerConnection.ondatachannel = (event) => {
      const dataChannel = event.channel
      this.setupDataChannel(dataChannel, peerId)
      this.dataChannels.set(peerId, dataChannel)
    }

    return peerConnection
  }

  /**
   * 设置peer连接
   */
  private setupPeerConnection(peerConnection: RTCPeerConnection, peerId: string): void {
    // 处理ICE候选
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage(peerId, {
          type: 'ice-candidate',
          candidate: event.candidate
        })
      }
    }

    // 处理连接状态变化
    peerConnection.onconnectionstatechange = () => {
      console.log('[WebRTC] 连接状态:', peerConnection.connectionState, 'with', peerId)
      if (peerConnection.connectionState === 'connected') {
        this.config?.onPeerConnected?.(peerId)
      } else if (peerConnection.connectionState === 'disconnected' ||
                 peerConnection.connectionState === 'failed') {
        this.config?.onPeerDisconnected?.(peerId)
        this.cleanupPeer(peerId)
      }
    }
  }

  /**
   * 设置数据通道
   */
  private setupDataChannel(dataChannel: RTCDataChannel, peerId: string): void {
    dataChannel.onopen = () => {
      console.log('[WebRTC] 数据通道已打开:', peerId)
    }

    dataChannel.onmessage = (event) => {
      try {
        const message: PeerMessage = JSON.parse(event.data)
        this.handlePeerMessage(message, peerId)
      } catch (error) {
        console.error('[WebRTC] 解析消息失败:', error)
      }
    }

    dataChannel.onerror = (error) => {
      console.error('[WebRTC] 数据通道错误:', error)
    }

    dataChannel.onclose = () => {
      console.log('[WebRTC] 数据通道已关闭:', peerId)
    }
  }

  /**
   * 处理对等消息
   */
  private handlePeerMessage(message: PeerMessage, senderId: string): void {
    switch (message.type) {
      case 'data-sync':
        this.config?.onDataReceived(message.data, senderId)
        break
      case 'ping':
        this.sendToPeer(senderId, { type: 'pong', timestamp: Date.now() })
        break
      case 'pong':
        // 处理pong响应
        break
      default:
        console.log('[WebRTC] 未知消息类型:', message.type)
    }
  }

  /**
   * 发送ICE候选
   */
  private sendIceCandidate(peerId: string, candidate: RTCIceCandidate): void {
    const candidateKey = `room:${this.roomId}:ice:${this.deviceId}:${peerId}`
    const candidateData = {
      candidate: candidate,
      timestamp: Date.now()
    }
    localStorage.setItem(candidateKey, JSON.stringify(candidateData))
  }

  /**
   * 向指定对等设备发送消息
   */
  sendToPeer(peerId: string, message: Omit<PeerMessage, 'senderId'>): void {
    const dataChannel = this.dataChannels.get(peerId)
    if (dataChannel && dataChannel.readyState === 'open') {
      const fullMessage: PeerMessage = {
        ...message,
        senderId: this.deviceId
      }
      dataChannel.send(JSON.stringify(fullMessage))
    }
  }

  /**
   * 广播消息到所有连接的设备
   */
  broadcast(message: Omit<PeerMessage, 'senderId'>): void {
    for (const [peerId] of this.dataChannels) {
      this.sendToPeer(peerId, message)
    }
  }

  /**
   * 同步数据到所有设备
   */
  syncData(data: any): void {
    this.broadcast({
      type: 'data-sync',
      data: data,
      timestamp: Date.now()
    })
  }

  /**
   * 清理对等连接
   */
  private cleanupPeer(peerId: string): void {
    const peerConnection = this.peers.get(peerId)
    if (peerConnection) {
      peerConnection.close()
      this.peers.delete(peerId)
    }
    
    const dataChannel = this.dataChannels.get(peerId)
    if (dataChannel) {
      dataChannel.close()
      this.dataChannels.delete(peerId)
    }
  }

  /**
   * 获取连接的设备列表
   */
  getConnectedPeers(): string[] {
    return Array.from(this.dataChannels.keys()).filter(
      peerId => this.dataChannels.get(peerId)?.readyState === 'open'
    )
  }

  /**
   * 断开所有连接
   */
  disconnect(): void {
    for (const [peerId] of this.peers) {
      this.cleanupPeer(peerId)
    }
    
    // 清理localStorage中的连接信息
    if (this.isHost) {
      localStorage.removeItem(`room:${this.roomId}:host`)
      localStorage.removeItem(`room:${this.roomId}:connections`)
    }

    // 停止信令轮询
    if (this.signalingInterval) {
      clearInterval(this.signalingInterval)
      this.signalingInterval = null
    }
  }

  /**
   * 启动信令轮询机制
   */
  private startSignalingPolling(): void {
    // 每秒检查一次信令消息
    this.signalingInterval = setInterval(() => {
      this.checkSignalingMessages()
    }, 1000)
  }

  /**
   * 检查信令消息
   */
  private checkSignalingMessages(): void {
    const now = Date.now()

    // 检查是否有新的连接请求
    const connectionsKey = `room:${this.roomId}:connections`
    const connectionsData = localStorage.getItem(connectionsKey)

    if (connectionsData) {
      try {
        const connections = JSON.parse(connectionsData)

        // 处理新的连接请求
        for (const [deviceId, connectionInfo] of Object.entries(connections)) {
          const info = connectionInfo as any
          // 检查消息是否是发给当前设备的，且是新消息
          if (deviceId !== this.deviceId &&
              (info.targetDevice === this.deviceId || info.targetDevice === 'all') &&
              info.timestamp > this.lastSignalingCheck) {
            this.handleSignalingMessage(deviceId, info)
          }
        }
      } catch (error) {
        console.error('[WebRTC] 解析连接信息失败:', error)
      }
    }

    this.lastSignalingCheck = now
  }

  /**
   * 处理信令消息
   */
  private async handleSignalingMessage(deviceId: string, message: any): Promise<void> {
    console.log('[WebRTC] 收到信令消息:', message.type, 'from', deviceId)

    switch (message.type) {
      case 'offer':
        await this.handleOffer(deviceId, message.offer)
        break
      case 'answer':
        await this.handleAnswer(deviceId, message.answer)
        break
      case 'ice-candidate':
        await this.handleIceCandidate(deviceId, message.candidate)
        break
      case 'connection-request':
        if (this.isHost) {
          await this.handleConnectionRequest(deviceId)
        }
        break
    }
  }

  /**
   * 发送信令消息
   */
  private sendSignalingMessage(targetDeviceId: string, message: any): void {
    const connectionsKey = `room:${this.roomId}:connections`
    const connectionsData = localStorage.getItem(connectionsKey)
    let connections: Record<string, any> = {}

    if (connectionsData) {
      try {
        connections = JSON.parse(connectionsData)
      } catch (error) {
        console.error('[WebRTC] 解析连接信息失败:', error)
      }
    }

    // 添加新的信令消息
    connections[this.deviceId] = {
      ...message,
      timestamp: Date.now(),
      targetDevice: targetDeviceId
    }

    localStorage.setItem(connectionsKey, JSON.stringify(connections))
  }

  /**
   * 处理连接请求
   */
  private async handleConnectionRequest(clientDeviceId: string): Promise<void> {
    console.log('[WebRTC] 处理连接请求 from', clientDeviceId)

    // 创建新的peer连接
    const peerConnection = new RTCPeerConnection({
      iceServers: [] // 局域网内不需要STUN服务器
    })

    // 创建数据通道
    const dataChannel = peerConnection.createDataChannel('data', {
      ordered: true
    })

    this.setupDataChannel(dataChannel, clientDeviceId)
    this.setupPeerConnection(peerConnection, clientDeviceId)

    // 保存连接
    this.peers.set(clientDeviceId, peerConnection)
    this.dataChannels.set(clientDeviceId, dataChannel)

    // 创建offer
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    // 发送offer给客户端
    this.sendSignalingMessage(clientDeviceId, {
      type: 'offer',
      offer: offer
    })
  }

  /**
   * 处理收到的offer
   */
  private async handleOffer(hostDeviceId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    console.log('[WebRTC] 处理offer from', hostDeviceId)

    // 创建peer连接
    const peerConnection = new RTCPeerConnection({
      iceServers: [] // 局域网内不需要STUN服务器
    })

    this.setupPeerConnection(peerConnection, hostDeviceId)

    // 监听数据通道
    peerConnection.ondatachannel = (event) => {
      const dataChannel = event.channel
      this.setupDataChannel(dataChannel, hostDeviceId)
      this.dataChannels.set(hostDeviceId, dataChannel)
    }

    // 保存连接
    this.peers.set(hostDeviceId, peerConnection)

    // 设置远程描述
    await peerConnection.setRemoteDescription(offer)

    // 创建answer
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    // 发送answer给主机
    this.sendSignalingMessage(hostDeviceId, {
      type: 'answer',
      answer: answer
    })
  }

  /**
   * 处理收到的answer
   */
  private async handleAnswer(clientDeviceId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    console.log('[WebRTC] 处理answer from', clientDeviceId)

    const peerConnection = this.peers.get(clientDeviceId)
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer)
    }
  }

  /**
   * 处理ICE candidate
   */
  private async handleIceCandidate(deviceId: string, candidate: RTCIceCandidateInit): Promise<void> {
    console.log('[WebRTC] 处理ICE candidate from', deviceId)

    const peerConnection = this.peers.get(deviceId)
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate)
    }
  }
}

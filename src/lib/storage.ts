import { LocalStorageData, Task, Family, DailyStats, UrgentRequest } from './types'
import { RoomManager } from './room'

const STORAGE_KEY = 'family-helper-data'

// 获取房间特定的存储键
function getRoomStorageKey(roomId?: string): string {
  const roomManager = RoomManager.getInstance()
  const currentRoomId = roomId || roomManager.getCurrentRoomId()

  if (currentRoomId) {
    return `room:${currentRoomId}:data`
  }

  return STORAGE_KEY // 回退到本地存储
}

// 获取本地存储数据
export function getLocalData(): LocalStorageData | null {
  if (typeof window === 'undefined') return null

  try {
    const storageKey = getRoomStorageKey()
    const data = localStorage.getItem(storageKey)
    if (!data) return null
    
    const parsed = JSON.parse(data)
    // 转换日期字符串回Date对象
    return {
      ...parsed,
      family: {
        ...parsed.family,
        createdAt: new Date(parsed.family.createdAt),
        members: parsed.family.members.map((member: any) => ({
          ...member,
          lastActiveDate: new Date(member.lastActiveDate)
        }))
      },
      tasks: parsed.tasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        startedAt: task.startedAt ? new Date(task.startedAt) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined
      })),
      dailyStats: parsed.dailyStats.map((stat: any) => ({
        ...stat,
        tasks: stat.tasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          startedAt: task.startedAt ? new Date(task.startedAt) : undefined,
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined
        }))
      })),
      urgentRequests: parsed.urgentRequests.map((req: any) => ({
        ...req,
        createdAt: new Date(req.createdAt)
      })),
      lastSyncDate: new Date(parsed.lastSyncDate)
    }
  } catch (error) {
    console.error('Error parsing local storage data:', error)
    return null
  }
}

// 保存数据到本地存储
export function saveLocalData(data: LocalStorageData): void {
  if (typeof window === 'undefined') return

  try {
    const storageKey = getRoomStorageKey()
    localStorage.setItem(storageKey, JSON.stringify(data))

    // 广播数据变更给其他标签页
    const roomManager = RoomManager.getInstance()
    roomManager.broadcastDataChange()
  } catch (error) {
    console.error('Error saving to local storage:', error)
  }
}

// 初始化默认数据
export function initializeDefaultData(): LocalStorageData {
  const defaultFamily: Family = {
    id: 'family-1',
    name: '胖虎之家',
    members: [
      {
        id: 'user-1',
        name: '小吕',
        totalCompletedTasks: 0,
        totalMinutesWorked: 0,
        lastActiveDate: new Date()
      },
      {
        id: 'user-2',
        name: '小王',
        totalCompletedTasks: 0,
        totalMinutesWorked: 0,
        lastActiveDate: new Date()
      }
    ],
    workEndTime: '20:30',
    monthlyFund: 0,
    createdAt: new Date()
  }

  const defaultData: LocalStorageData = {
    family: defaultFamily,
    tasks: [],
    dailyStats: [],
    urgentRequests: [],
    lastSyncDate: new Date()
  }

  saveLocalData(defaultData)
  return defaultData
}

// 清除所有数据
export function clearLocalData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

// 导出数据（用于备份）
export function exportData(): string {
  const data = getLocalData()
  return JSON.stringify(data, null, 2)
}

// 导入数据（用于恢复）
export function importData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData)
    saveLocalData(data)
    return true
  } catch (error) {
    console.error('Error importing data:', error)
    return false
  }
}

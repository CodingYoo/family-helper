// 任务状态枚举
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

// 任务接口
export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  assignedTo?: string
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  estimatedMinutes?: number
  actualMinutes?: number
  isUrgent?: boolean
  urgentPrice?: number
  category: string
  imageUrl?: string
}

// 用户接口
export interface User {
  id: string
  name: string
  avatar?: string
  totalCompletedTasks: number
  totalMinutesWorked: number
  lastActiveDate: Date
}

// 家庭组接口
export interface Family {
  id: string
  name: string
  members: User[]
  workEndTime: string // 收工时间，格式 "20:30"
  monthlyFund: number // 月度基金
  createdAt: Date
}

// 预设任务模板
export interface TaskTemplate {
  id: string
  title: string
  description: string
  estimatedMinutes: number
  category: string
  icon: string
}

// 议价请求
export interface UrgentRequest {
  id: string
  taskId: string
  requestedBy: string
  estimatedMinutes?: number
  price?: number
  message?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
}

// 战绩数据
export interface DailyStats {
  date: string
  userId: string
  tasksCompleted: number
  minutesWorked: number
  tasks: Task[]
}

// 周统计数据
export interface WeeklyStats {
  weekStart: string
  weekEnd: string
  userStats: {
    [userId: string]: {
      tasksCompleted: number
      minutesWorked: number
      dailyBreakdown: DailyStats[]
    }
  }
}

// 本地存储数据结构
export interface LocalStorageData {
  family: Family
  tasks: Task[]
  dailyStats: DailyStats[]
  urgentRequests: UrgentRequest[]
  lastSyncDate: Date
}

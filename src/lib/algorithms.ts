import { User, Task, DailyStats, TaskStatus } from './types'

// 计算昨日工作时长
export function getYesterdayWorkMinutes(userId: string, dailyStats: DailyStats[]): number {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  
  const yesterdayStats = dailyStats.find(
    stat => stat.userId === userId && stat.date === yesterdayStr
  )
  
  return yesterdayStats?.minutesWorked || 0
}

// 轮班算法：优先分配给昨日工作时长较少的人
export function assignTaskToUser(users: User[], dailyStats: DailyStats[]): string {
  if (users.length === 0) return ''
  if (users.length === 1) return users[0].id
  
  // 计算每个用户昨日的工作时长
  const userWorkMinutes = users.map(user => ({
    userId: user.id,
    yesterdayMinutes: getYesterdayWorkMinutes(user.id, dailyStats)
  }))
  
  // 找出昨日工作时长最少的用户
  const minMinutes = Math.min(...userWorkMinutes.map(u => u.yesterdayMinutes))
  const candidateUsers = userWorkMinutes.filter(u => u.yesterdayMinutes === minMinutes)
  
  // 如果有多个用户工作时长相同，随机选择
  const randomIndex = Math.floor(Math.random() * candidateUsers.length)
  return candidateUsers[randomIndex].userId
}

// 计算任务实际耗时
export function calculateTaskDuration(task: Task): number {
  if (!task.startedAt || !task.completedAt) return 0
  
  const startTime = new Date(task.startedAt).getTime()
  const endTime = new Date(task.completedAt).getTime()
  
  return Math.round((endTime - startTime) / (1000 * 60)) // 转换为分钟
}

// 更新用户统计数据
export function updateUserStats(user: User, completedTask: Task): User {
  const taskDuration = calculateTaskDuration(completedTask)
  
  return {
    ...user,
    totalCompletedTasks: user.totalCompletedTasks + 1,
    totalMinutesWorked: user.totalMinutesWorked + taskDuration,
    lastActiveDate: new Date()
  }
}

// 生成今日战绩数据
export function generateDailyStats(userId: string, tasks: Task[]): DailyStats {
  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter(task => 
    task.assignedTo === userId && 
    task.status === TaskStatus.COMPLETED &&
    task.completedAt &&
    new Date(task.completedAt).toISOString().split('T')[0] === today
  )
  
  const totalMinutes = todayTasks.reduce((sum, task) => sum + calculateTaskDuration(task), 0)
  
  return {
    date: today,
    userId,
    tasksCompleted: todayTasks.length,
    minutesWorked: totalMinutes,
    tasks: todayTasks
  }
}

// 检查是否在收工时间后
export function isAfterWorkEndTime(workEndTime: string): boolean {
  const now = new Date()
  const [hours, minutes] = workEndTime.split(':').map(Number)
  
  const workEndToday = new Date()
  workEndToday.setHours(hours, minutes, 0, 0)
  
  return now > workEndToday
}

// 计算工作负载平衡度（0-1，1表示完全平衡）
export function calculateWorkBalance(users: User[]): number {
  if (users.length < 2) return 1
  
  const workMinutes = users.map(u => u.totalMinutesWorked)
  const maxMinutes = Math.max(...workMinutes)
  const minMinutes = Math.min(...workMinutes)
  
  if (maxMinutes === 0) return 1
  
  return 1 - (maxMinutes - minMinutes) / maxMinutes
}

// 生成周统计数据
export function generateWeeklyStats(users: User[], dailyStats: DailyStats[]) {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay()) // 本周开始（周日）
  
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6) // 本周结束（周六）
  
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const weekEndStr = weekEnd.toISOString().split('T')[0]
  
  const userStats: any = {}
  
  users.forEach(user => {
    const userWeekStats = dailyStats.filter(stat => 
      stat.userId === user.id &&
      stat.date >= weekStartStr &&
      stat.date <= weekEndStr
    )
    
    userStats[user.id] = {
      tasksCompleted: userWeekStats.reduce((sum, stat) => sum + stat.tasksCompleted, 0),
      minutesWorked: userWeekStats.reduce((sum, stat) => sum + stat.minutesWorked, 0),
      dailyBreakdown: userWeekStats
    }
  })
  
  return {
    weekStart: weekStartStr,
    weekEnd: weekEndStr,
    userStats
  }
}

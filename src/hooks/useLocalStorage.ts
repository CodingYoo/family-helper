import { useState, useEffect } from 'react'
import { LocalStorageData } from '@/lib/types'
import { getLocalData, saveLocalData, initializeDefaultData } from '@/lib/storage'

export function useLocalStorage() {
  const [data, setData] = useState<LocalStorageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 初始化数据
    const loadData = () => {
      let localData = getLocalData()
      
      if (!localData) {
        localData = initializeDefaultData()
      }
      
      setData(localData)
      setIsLoading(false)
    }

    loadData()
  }, [])

  // 更新数据并保存到本地存储
  const updateData = (newData: LocalStorageData) => {
    setData(newData)
    saveLocalData(newData)
  }

  // 更新任务列表
  const updateTasks = (tasks: any[]) => {
    if (!data) return
    
    const newData = {
      ...data,
      tasks,
      lastSyncDate: new Date()
    }
    updateData(newData)
  }

  // 更新家庭信息
  const updateFamily = (family: any) => {
    if (!data) return
    
    const newData = {
      ...data,
      family,
      lastSyncDate: new Date()
    }
    updateData(newData)
  }

  // 添加每日统计
  const addDailyStats = (stats: any) => {
    if (!data) return
    
    const existingIndex = data.dailyStats.findIndex(
      s => s.date === stats.date && s.userId === stats.userId
    )
    
    let newDailyStats
    if (existingIndex >= 0) {
      // 更新现有统计
      newDailyStats = [...data.dailyStats]
      newDailyStats[existingIndex] = stats
    } else {
      // 添加新统计
      newDailyStats = [...data.dailyStats, stats]
    }
    
    const newData = {
      ...data,
      dailyStats: newDailyStats,
      lastSyncDate: new Date()
    }
    updateData(newData)
  }

  // 添加紧急请求
  const addUrgentRequest = (request: any) => {
    if (!data) return
    
    const newData = {
      ...data,
      urgentRequests: [...data.urgentRequests, request],
      lastSyncDate: new Date()
    }
    updateData(newData)
  }

  // 更新紧急请求状态
  const updateUrgentRequest = (requestId: string, status: 'approved' | 'rejected') => {
    if (!data) return
    
    const newUrgentRequests = data.urgentRequests.map(req =>
      req.id === requestId ? { ...req, status } : req
    )
    
    const newData = {
      ...data,
      urgentRequests: newUrgentRequests,
      lastSyncDate: new Date()
    }
    updateData(newData)
  }

  return {
    data,
    isLoading,
    updateData,
    updateTasks,
    updateFamily,
    addDailyStats,
    addUrgentRequest,
    updateUrgentRequest
  }
}

'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { LocalStorageData, Task, Family, DailyStats, UrgentRequest, TaskStatus } from '@/lib/types'
import { getLocalData, saveLocalData, initializeDefaultData } from '@/lib/storage'
import { assignTaskToUser, generateDailyStats, updateUserStats } from '@/lib/algorithms'
import { RoomManager } from '@/lib/room'

// Action types
type AppAction =
  | { type: 'LOAD_DATA'; payload: LocalStorageData }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'MOVE_TASK'; payload: { id: string; status: TaskStatus } }
  | { type: 'UPDATE_FAMILY'; payload: Partial<Family> }
  | { type: 'ADD_URGENT_REQUEST'; payload: UrgentRequest }
  | { type: 'UPDATE_URGENT_REQUEST'; payload: { id: string; status: 'approved' | 'rejected' } }
  | { type: 'SET_ROOM'; payload: { roomId: string; isInRoom: boolean } }
  | { type: 'LEAVE_ROOM' }

// State interface
interface AppState {
  data: LocalStorageData | null
  isLoading: boolean
  error: string | null
  roomId: string | null
  isInRoom: boolean
}

// Initial state
const initialState: AppState = {
  data: null,
  isLoading: true,
  error: null,
  roomId: null,
  isInRoom: false
}

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        error: null
      }

    case 'ADD_TASK': {
      if (!state.data) return state
      
      const newTasks = [...state.data.tasks, action.payload]
      const newData = {
        ...state.data,
        tasks: newTasks,
        lastSyncDate: new Date()
      }
      
      saveLocalData(newData)
      return { ...state, data: newData }
    }

    case 'UPDATE_TASK': {
      if (!state.data) return state
      
      const newTasks = state.data.tasks.map(task =>
        task.id === action.payload.id 
          ? { ...task, ...action.payload.updates }
          : task
      )
      
      const newData = {
        ...state.data,
        tasks: newTasks,
        lastSyncDate: new Date()
      }
      
      saveLocalData(newData)
      return { ...state, data: newData }
    }

    case 'DELETE_TASK': {
      if (!state.data) return state
      
      const newTasks = state.data.tasks.filter(task => task.id !== action.payload)
      const newData = {
        ...state.data,
        tasks: newTasks,
        lastSyncDate: new Date()
      }
      
      saveLocalData(newData)
      return { ...state, data: newData }
    }

    case 'MOVE_TASK': {
      if (!state.data) return state
      
      const task = state.data.tasks.find(t => t.id === action.payload.id)
      if (!task) return state
      
      const updates: Partial<Task> = { status: action.payload.status }
      
      // 更新时间戳
      if (action.payload.status === TaskStatus.IN_PROGRESS) {
        updates.startedAt = new Date()
      } else if (action.payload.status === TaskStatus.COMPLETED) {
        updates.completedAt = new Date()
        
        // 计算实际耗时
        if (task.startedAt) {
          const duration = Math.round((new Date().getTime() - new Date(task.startedAt).getTime()) / (1000 * 60))
          updates.actualMinutes = duration
        }
      }
      
      const newTasks = state.data.tasks.map(t =>
        t.id === action.payload.id ? { ...t, ...updates } : t
      )
      
      // 如果任务完成，更新用户统计和每日统计
      let newFamily = state.data.family
      let newDailyStats = state.data.dailyStats
      
      if (action.payload.status === TaskStatus.COMPLETED && task.assignedTo) {
        // 更新用户统计
        const updatedTask = { ...task, ...updates }
        newFamily = {
          ...state.data.family,
          members: state.data.family.members.map(member =>
            member.id === task.assignedTo 
              ? updateUserStats(member, updatedTask)
              : member
          )
        }
        
        // 更新每日统计
        const todayStats = generateDailyStats(task.assignedTo, newTasks)
        const existingIndex = newDailyStats.findIndex(
          s => s.date === todayStats.date && s.userId === todayStats.userId
        )
        
        if (existingIndex >= 0) {
          newDailyStats = [...newDailyStats]
          newDailyStats[existingIndex] = todayStats
        } else {
          newDailyStats = [...newDailyStats, todayStats]
        }
      }
      
      const newData = {
        ...state.data,
        tasks: newTasks,
        family: newFamily,
        dailyStats: newDailyStats,
        lastSyncDate: new Date()
      }
      
      saveLocalData(newData)
      return { ...state, data: newData }
    }

    case 'UPDATE_FAMILY': {
      if (!state.data) return state
      
      const newFamily = { ...state.data.family, ...action.payload }
      const newData = {
        ...state.data,
        family: newFamily,
        lastSyncDate: new Date()
      }
      
      saveLocalData(newData)
      return { ...state, data: newData }
    }

    case 'ADD_URGENT_REQUEST': {
      if (!state.data) return state
      
      const newData = {
        ...state.data,
        urgentRequests: [...state.data.urgentRequests, action.payload],
        lastSyncDate: new Date()
      }
      
      saveLocalData(newData)
      return { ...state, data: newData }
    }

    case 'UPDATE_URGENT_REQUEST': {
      if (!state.data) return state
      
      const newUrgentRequests = state.data.urgentRequests.map(req =>
        req.id === action.payload.id 
          ? { ...req, status: action.payload.status }
          : req
      )
      
      const newData = {
        ...state.data,
        urgentRequests: newUrgentRequests,
        lastSyncDate: new Date()
      }
      
      saveLocalData(newData)
      return { ...state, data: newData }
    }

    case 'SET_ROOM':
      return {
        ...state,
        roomId: action.payload.roomId,
        isInRoom: action.payload.isInRoom
      }

    case 'LEAVE_ROOM':
      return {
        ...state,
        roomId: null,
        isInRoom: false
      }

    default:
      return state
  }
}

// Context
const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
  actions: {
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
    updateTask: (id: string, updates: Partial<Task>) => void
    deleteTask: (id: string) => void
    moveTask: (id: string, status: TaskStatus) => void
    updateFamily: (updates: Partial<Family>) => void
    addUrgentRequest: (request: Omit<UrgentRequest, 'id' | 'createdAt'>) => void
    updateUrgentRequest: (id: string, status: 'approved' | 'rejected') => void
    assignTaskAutomatically: (task: Omit<Task, 'id' | 'createdAt' | 'assignedTo'>) => void
  }
} | null>(null)

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Initialize room manager and load data
  useEffect(() => {
    const roomManager = RoomManager.getInstance()
    const roomId = roomManager.getCurrentRoomId()

    if (roomId) {
      dispatch({ type: 'SET_ROOM', payload: { roomId, isInRoom: true } })
    }

    const loadData = () => {
      let data = getLocalData()
      if (!data) {
        data = initializeDefaultData()
      }
      dispatch({ type: 'LOAD_DATA', payload: data })
    }

    // Set up data change listener for room sync
    roomManager.onDataChange(() => {
      loadData()
    })

    loadData()

    // Cleanup on unmount
    return () => {
      roomManager.cleanup()
    }
  }, [])

  // Action creators
  const actions = {
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => {
      const newTask: Task = {
        ...task,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date()
      }
      dispatch({ type: 'ADD_TASK', payload: newTask })
    },

    updateTask: (id: string, updates: Partial<Task>) => {
      dispatch({ type: 'UPDATE_TASK', payload: { id, updates } })
    },

    deleteTask: (id: string) => {
      dispatch({ type: 'DELETE_TASK', payload: id })
    },

    moveTask: (id: string, status: TaskStatus) => {
      dispatch({ type: 'MOVE_TASK', payload: { id, status } })
    },

    updateFamily: (updates: Partial<Family>) => {
      dispatch({ type: 'UPDATE_FAMILY', payload: updates })
    },

    addUrgentRequest: (request: Omit<UrgentRequest, 'id' | 'createdAt'>) => {
      const newRequest: UrgentRequest = {
        ...request,
        id: `urgent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date()
      }
      dispatch({ type: 'ADD_URGENT_REQUEST', payload: newRequest })
    },

    updateUrgentRequest: (id: string, status: 'approved' | 'rejected') => {
      dispatch({ type: 'UPDATE_URGENT_REQUEST', payload: { id, status } })
    },

    assignTaskAutomatically: (task: Omit<Task, 'id' | 'createdAt' | 'assignedTo'>) => {
      if (!state.data) return
      
      const assignedTo = assignTaskToUser(state.data.family.members, state.data.dailyStats)
      actions.addTask({ ...task, assignedTo })
    }
  }

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  )
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

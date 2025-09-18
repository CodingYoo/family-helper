# 功能特性详解

## 🏠 房间系统

### 创建房间
- **一键创建**：输入房间名称即可创建专属空间
- **唯一标识**：每个房间都有独特的 8 位字符 ID
- **主机模式**：创建者自动成为房间主机
- **持久化存储**：房间信息保存在本地存储中

### 成员管理
- **邀请链接**：通过 URL 参数分享房间
- **自动加入**：点击链接自动加入房间
- **成员信息**：记录加入时间和在线状态
- **活跃检测**：5分钟内活跃视为在线

### 数据同步
- **本地存储**：基于 localStorage 的数据持久化
- **跨标签页同步**：使用 BroadcastChannel API
- **实时更新**：任何操作都会触发数据同步
- **冲突处理**：最后更新优先原则

## 📋 任务管理

### 任务创建
- **快速创建**：点击按钮快速添加任务
- **模板选择**：预设常见家务任务模板
- **自定义任务**：支持完全自定义任务内容
- **优先级设置**：普通、重要、紧急三个级别

### 任务分配
- **智能分配**：轮询算法自动分配给成员
- **手动指定**：可以指定特定成员执行
- **抢单功能**：成员可以主动认领任务
- **重新分配**：支持任务重新分配

### 状态管理
- **三状态流转**：待办 → 进行中 → 已完成
- **拖拽操作**：直观的拖拽改变状态
- **时间记录**：自动记录开始和完成时间
- **状态回退**：支持状态回退操作

### 任务属性
```typescript
interface Task {
  id: string              // 唯一标识
  title: string           // 任务标题
  description?: string    // 任务描述
  status: TaskStatus      // 任务状态
  assignedTo?: string     // 分配给谁
  priority: Priority      // 优先级
  estimatedMinutes: number // 预估时长
  isUrgent: boolean       // 是否紧急
  createdAt: Date         // 创建时间
  startedAt?: Date        // 开始时间
  completedAt?: Date      // 完成时间
  tags: string[]          // 标签
}
```

## 🎯 智能分配算法

### 轮询分配
```typescript
function assignTaskToMember(task: Task, members: Member[]): string {
  // 获取每个成员的任务数量
  const memberTaskCounts = members.map(member => ({
    id: member.id,
    count: getTaskCountForMember(member.id)
  }))
  
  // 找到任务最少的成员
  const leastBusyMember = memberTaskCounts.reduce((min, current) => 
    current.count < min.count ? current : min
  )
  
  return leastBusyMember.id
}
```

### 负载均衡
- **任务计数**：统计每个成员的当前任务数
- **时长考虑**：考虑任务预估时长进行分配
- **技能匹配**：根据任务类型匹配合适成员
- **历史表现**：参考历史完成情况

## 📊 数据统计

### 实时统计
- **任务分布**：各状态任务数量统计
- **成员负载**：每个成员的任务分配情况
- **完成率**：今日/本周/本月完成率
- **效率分析**：平均完成时间统计

### 可视化图表
- **饼图**：任务状态分布
- **柱状图**：成员完成情况对比
- **折线图**：完成趋势分析
- **环形图**：工作时长分布

### 数据导出
```typescript
interface DailyStats {
  date: string
  totalTasks: number
  completedTasks: number
  totalMinutes: number
  memberStats: MemberDailyStats[]
}

interface MemberDailyStats {
  memberId: string
  tasksCompleted: number
  minutesWorked: number
  efficiency: number
}
```

## 📱 PWA 特性

### 离线支持
- **Service Worker**：缓存关键资源
- **离线页面**：网络断开时的备用页面
- **数据缓存**：离线状态下数据可用
- **同步机制**：网络恢复时自动同步

### 安装体验
- **安装提示**：智能检测并提示安装
- **桌面图标**：安装后显示应用图标
- **启动画面**：原生应用般的启动体验
- **全屏模式**：隐藏浏览器地址栏

### 移动端优化
- **触摸友好**：44px 最小触摸目标
- **手势支持**：拖拽、滑动等手势操作
- **安全区域**：适配刘海屏和圆角屏
- **性能优化**：减少重绘和回流

## 🔔 通知系统

### 收工铃
- **时间检测**：自动检测收工时间
- **弹窗提醒**：收工时间到达时弹窗
- **继续工作**：可选择继续工作或结束
- **统计展示**：显示今日工作成果

### 加急请求
- **紧急标记**：任务可标记为紧急
- **优先显示**：紧急任务优先展示
- **通知提醒**：有紧急任务时弹窗提醒
- **快速响应**：支持快速接受或拒绝

## 🎨 用户界面

### 设计原则
- **简洁明了**：界面简洁，操作直观
- **一致性**：统一的设计语言和交互模式
- **可访问性**：支持键盘导航和屏幕阅读器
- **响应式**：适配各种设备和屏幕尺寸

### 主题系统
- **颜色方案**：基于蓝色的主色调
- **状态颜色**：不同状态使用不同颜色标识
- **深色模式**：计划支持深色主题
- **自定义主题**：未来支持主题自定义

### 动画效果
- **过渡动画**：平滑的状态转换动画
- **拖拽反馈**：拖拽时的视觉反馈
- **加载动画**：数据加载时的动画效果
- **微交互**：按钮点击等微交互动画

## 🔧 技术实现

### 状态管理
```typescript
// 使用 React Context + useReducer
const AppContext = createContext<AppContextType>()

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] }
    case 'UPDATE_TASK':
      return { 
        ...state, 
        tasks: state.tasks.map(task => 
          task.id === action.payload.id 
            ? { ...task, ...action.payload.updates }
            : task
        )
      }
    // ... 其他 action
  }
}
```

### 数据持久化
```typescript
// localStorage 封装
export function saveLocalData(data: LocalStorageData): void {
  try {
    const serialized = JSON.stringify(data, (key, value) => {
      if (value instanceof Date) {
        return { __type: 'Date', value: value.toISOString() }
      }
      return value
    })
    localStorage.setItem(STORAGE_KEY, serialized)
  } catch (error) {
    console.error('保存数据失败:', error)
  }
}
```

### 跨标签页同步
```typescript
// BroadcastChannel 实现
const broadcastChannel = new BroadcastChannel(`room:${roomId}`)

broadcastChannel.onmessage = (event) => {
  if (event.data.type === 'data-sync') {
    // 重新加载数据
    loadData()
  }
}

// 广播数据变更
function broadcastDataChange() {
  broadcastChannel.postMessage({
    type: 'data-sync',
    roomId: roomId,
    timestamp: Date.now()
  })
}
```

---

**这些特性让家庭助手成为一个功能完整、体验优秀的任务管理应用！** ✨

# 家庭助手 Wiki 文档

## 📖 目录

- [项目概述](#项目概述)
- [功能特性](#功能特性)
- [技术架构](#技术架构)
- [快速开始](#快速开始)
- [使用指南](#使用指南)
- [开发指南](#开发指南)
- [部署指南](#部署指南)
- [故障排除](#故障排除)

## 项目概述

家庭助手是一个现代化的家庭任务管理 PWA 应用，旨在让家务分配变得可见、可停机、可议价。通过直观的看板界面和智能分配算法，帮助家庭成员更好地协作完成日常任务。

### 核心理念

- **可见性**：所有任务状态一目了然
- **可停机**：支持暂停和恢复任务
- **可议价**：灵活的任务分配和调整机制

## 功能特性

### 🏠 房间系统

- **创建房间**：建立家庭协作空间
- **分享链接**：通过 URL 邀请家庭成员
- **本地同步**：基于 localStorage 的数据存储
- **跨标签页同步**：使用 BroadcastChannel API

### 📋 任务管理

- **拖拽操作**：直观的任务状态管理
- **智能分配**：轮询算法自动分配任务
- **预设模板**：常见家务任务模板
- **时间追踪**：任务开始和完成时间记录
- **紧急任务**：支持加急请求和抢单功能

### 📱 PWA 特性

- **离线支持**：Service Worker 缓存
- **安装到桌面**：原生应用体验
- **响应式设计**：完美适配各种设备
- **iOS 优化**：专门优化 iOS 14 Pro+

### 📊 数据可视化

- **任务统计**：实时任务分布统计
- **成员战绩**：个人完成情况展示
- **图表分析**：Chart.js 数据可视化
- **每日报告**：自动生成工作总结

## 技术架构

### 前端技术栈

```
Next.js 15      - React 全栈框架
TypeScript      - 类型安全
TailwindCSS     - 原子化 CSS
@dnd-kit        - 拖拽功能
Chart.js        - 数据可视化
```

### PWA 技术

```
Service Worker       - 离线缓存
Web App Manifest     - 应用安装
BroadcastChannel API - 跨标签页通信
localStorage         - 本地数据存储
```

### 数据存储结构

```typescript
// 房间数据存储格式
localStorage.setItem(`room:${roomId}:data`, JSON.stringify({
  family: FamilyData,
  tasks: Task[],
  dailyStats: DailyStats[],
  urgentRequests: UrgentRequest[]
}))

// 房间成员信息
localStorage.setItem(`room:${roomId}:member:${userId}`, JSON.stringify({
  id: string,
  name: string,
  joinedAt: string,
  lastSeen: string,
  isOnline: boolean
}))
```

## 快速开始

### 在线使用

直接访问：[https://lph.ink/family-helper/](https://lph.ink/family-helper/)

### 本地开发

```bash
# 克隆项目
git clone https://github.com/CodingYoo/family-helper.git
cd family-helper

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 使用指南

### 创建房间

1. 打开应用首页
2. 点击"创建新房间"
3. 输入房间名称和您的昵称
4. 点击"创建房间"

### 邀请成员

1. 在房间界面点击"分享房间"
2. 复制分享链接
3. 发送给其他家庭成员
4. 成员通过链接加入房间

### 任务管理

#### 创建任务
- 点击"添加任务"按钮
- 选择任务模板或自定义
- 设置任务详情和优先级
- 分配给家庭成员

#### 任务操作
- **拖拽移动**：在待办、进行中、已完成之间拖拽
- **编辑任务**：点击任务卡片进行编辑
- **删除任务**：长按或右键删除
- **抢单功能**：点击"抢单"快速认领任务

### 数据统计

- **实时统计**：查看当前任务分布
- **成员战绩**：个人完成情况
- **每日报告**：工作时长和完成任务数
- **图表分析**：可视化数据展示

## 开发指南

### 项目结构

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # 根布局
│   ├── page.tsx        # 首页
│   ├── manifest.ts     # PWA Manifest
│   └── globals.css     # 全局样式
├── components/         # React 组件
│   ├── ui/            # 基础 UI 组件
│   ├── TaskBoard/     # 任务看板
│   ├── TaskCard/      # 任务卡片
│   └── ...
├── contexts/          # React Context
├── hooks/             # 自定义 Hooks
└── lib/               # 工具库
    ├── types.ts       # 类型定义
    ├── storage.ts     # 数据存储
    ├── room.ts        # 房间管理
    └── algorithms.ts  # 算法实现
```

### 核心组件

#### AppContext
全局状态管理，处理数据加载和更新

#### RoomManager
房间系统管理，处理成员加入和数据同步

#### TaskBoard
任务看板，支持拖拽操作

#### PWAInstallPrompt
PWA 安装提示组件

### 开发规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 组件采用函数式编程
- 使用 Tailwind CSS 进行样式开发

## 部署指南

### GitHub Pages 部署

项目已配置自动部署到 GitHub Pages：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动构建和部署
3. 访问 `https://lph.ink/family-helper/`

### 手动部署

```bash
# 构建静态文件
npm run build

# 部署 out 目录到静态服务器
```

### 环境配置

- `NODE_ENV=production`：生产环境标识
- 自动配置 basePath 为 `/family-helper`

## 故障排除

### 常见问题

#### 1. 页面一直显示加载中
- **原因**：静态资源路径配置错误
- **解决**：检查 `next.config.ts` 中的 basePath 配置

#### 2. PWA 安装失败
- **原因**：Manifest 文件路径错误
- **解决**：确保 manifest.webmanifest 可访问

#### 3. 数据同步异常
- **原因**：localStorage 存储异常
- **解决**：清除浏览器缓存和 localStorage

#### 4. 拖拽功能失效
- **原因**：触摸事件冲突
- **解决**：检查 CSS touch-action 属性

### 调试步骤

1. **检查控制台错误**
   ```javascript
   // 打开浏览器开发者工具
   console.log('Debug info')
   ```

2. **验证数据存储**
   ```javascript
   // 检查 localStorage
   Object.keys(localStorage).filter(key => key.startsWith('room:'))
   ```

3. **测试网络连接**
   ```bash
   # 检查资源是否可访问
   curl -I https://lph.ink/family-helper/
   ```

### 性能优化

- 使用 React.memo 优化组件渲染
- 实现虚拟滚动处理大量任务
- 优化图片和静态资源加载
- 启用 Service Worker 缓存

## 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

### 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 编写单元测试
- 更新文档

---

**家庭助手 - 让家务管理更简单！** 🏠✨

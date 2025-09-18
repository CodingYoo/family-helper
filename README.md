# 家庭助手 - 任务分配小程序

一个现代化的家庭任务管理 PWA 应用，支持多用户实时协作，完美适配移动设备。

## ✨ 主要功能

### 🏠 房间系统

- **创建房间**：建立家庭协作空间
- **分享链接**：通过 URL 邀请家庭成员
- **实时同步**：跨设备、跨标签页数据同步
- **无需数据库**：基于 localStorage 的本地存储

### 📋 任务管理

- **拖拽操作**：直观的任务状态管理
- **智能分配**：轮询算法自动分配任务
- **预设模板**：常见家务任务模板
- **时间追踪**：任务开始和完成时间记录

### 📱 PWA 特性

- **离线支持**：Service Worker 缓存
- **安装到桌面**：原生应用体验
- **响应式设计**：完美适配各种设备
- **iOS 优化**：专门优化 iOS 14 Pro+

### 📊 数据可视化

- **任务统计**：实时任务分布统计
- **成员战绩**：个人完成情况展示
- **图表分析**：Chart.js 数据可视化

## 🚀 快速开始

### 在线使用

访问：[https://your-username.github.io/family-helper](https://your-username.github.io/family-helper)

### 本地开发

```bash
# 克隆项目
git clone https://github.com/your-username/family-helper.git
cd family-helper

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 🏠 房间使用指南

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

### 房间功能

- **实时同步**：所有成员的操作实时同步
- **跨设备**：手机、平板、电脑无缝切换
- **离线支持**：网络断开时数据保存在本地
- **自动恢复**：网络恢复时自动同步数据

## 🔧 技术架构

### 前端技术栈

- **Next.js 15**：React 全栈框架
- **TypeScript**：类型安全
- **TailwindCSS**：原子化 CSS
- **@dnd-kit**：拖拽功能
- **Chart.js**：数据可视化

### PWA 技术

- **Service Worker**：离线缓存
- **Web App Manifest**：应用安装
- **BroadcastChannel API**：跨标签页通信
- **localStorage**：本地数据存储

### 数据同步机制

```typescript
// 房间数据存储格式
localStorage.setItem(`room:${roomId}:data`, JSON.stringify(data))

// 跨标签页广播
broadcastChannel.postMessage({
  type: 'data-sync',
  roomId: roomId,
  timestamp: Date.now(),
})
```

## 📱 移动端优化

### iOS 适配

- **安全区域**：完美适配刘海屏
- **触摸优化**：44px 最小触摸目标
- **卡片设计**：移动端友好的界面
- **手势支持**：拖拽和滑动操作

### 性能优化

- **代码分割**：按需加载
- **图片优化**：WebP 格式支持
- **缓存策略**：智能缓存管理
- **懒加载**：组件延迟加载

## 🚀 部署到 GitHub Pages

### 自动部署

1. Fork 本项目到您的 GitHub 账户
2. 在仓库设置中启用 GitHub Pages
3. 选择 GitHub Actions 作为部署源
4. 推送代码到 main 分支自动部署

### 手动部署

```bash
# 构建静态文件
npm run build

# 部署到GitHub Pages
# 将out目录内容上传到gh-pages分支
```

## 🤝 贡献指南

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

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [TailwindCSS](https://tailwindcss.com/) - CSS 框架
- [@dnd-kit](https://dndkit.com/) - 拖拽库
- [Chart.js](https://www.chartjs.org/) - 图表库

---

**家庭助手** - 让家务分配更简单，让家庭生活更和谐！ 🏠✨

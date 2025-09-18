# 家庭助手 - 任务分配小程序

一个现代化的家庭任务管理 PWA 应用，让家务可见、可停机、可议价。支持多用户协作，完美适配移动设备。

[![部署状态](https://github.com/CodingYoo/family-helper/actions/workflows/deploy.yml/badge.svg)](https://github.com/CodingYoo/family-helper/actions/workflows/deploy.yml)
[![在线访问](https://img.shields.io/badge/在线访问-lph.ink/family--helper-blue)](https://lph.ink/family-helper/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

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

访问：[https://lph.ink/family-helper/](https://lph.ink/family-helper/)

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

- **本地同步**：基于 localStorage 的数据存储
- **跨标签页同步**：使用 BroadcastChannel API 实现实时同步
- **离线支持**：网络断开时数据保存在本地
- **分享协作**：通过链接邀请家庭成员加入

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

## 🚀 部署指南

### GitHub Pages 自动部署

项目已配置 GitHub Actions 自动部署：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动构建和部署
3. 访问 `https://lph.ink/family-helper/`

### 手动部署

```bash
# 构建静态文件
npm run build

# 使用部署脚本
./deploy.ps1  # Windows
./deploy.sh   # Linux/Mac
```

### 其他平台部署

支持部署到 Vercel、Netlify 等平台，详见 [DEPLOYMENT.md](DEPLOYMENT.md)

## 📚 文档

- [Wiki 文档](docs/WIKI.md) - 详细的使用和开发指南
- [部署指南](DEPLOYMENT.md) - 各种平台的部署方法
- [更新日志](CHANGELOG.md) - 版本更新记录

## 🔧 故障排除

### 常见问题

1. **页面一直显示加载中**

   - 检查网络连接
   - 清除浏览器缓存
   - 确认 JavaScript 已启用

2. **PWA 安装失败**

   - 使用 HTTPS 访问
   - 检查浏览器兼容性
   - 确认 manifest 文件可访问

3. **数据同步异常**
   - 清除 localStorage
   - 重新创建房间
   - 检查浏览器存储权限

更多问题请查看 [Wiki 故障排除](docs/WIKI.md#故障排除) 章节。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 编写清晰的提交信息
- 更新相关文档

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

## 📞 联系方式

- 项目地址：[GitHub](https://github.com/CodingYoo/family-helper)
- 在线体验：[https://lph.ink/family-helper/](https://lph.ink/family-helper/)
- 问题反馈：[Issues](https://github.com/CodingYoo/family-helper/issues)

- [Next.js](https://nextjs.org/) - React 框架
- [TailwindCSS](https://tailwindcss.com/) - CSS 框架
- [@dnd-kit](https://dndkit.com/) - 拖拽库
- [Chart.js](https://www.chartjs.org/) - 图表库

---

**家庭助手** - 让家务分配更简单，让家庭生活更和谐！ 🏠✨

# 部署指南

## GitHub Pages 部署

### 自动部署（推荐）

1. **Fork 项目**
   ```bash
   # 在 GitHub 上 Fork 本项目到您的账户
   ```

2. **启用 GitHub Pages**
   - 进入您的仓库设置页面
   - 找到 "Pages" 选项
   - 在 "Source" 中选择 "GitHub Actions"

3. **推送代码触发部署**
   ```bash
   git push origin main
   ```

4. **访问您的应用**
   ```
   https://your-username.github.io/family-helper
   ```

### 手动部署

1. **本地构建**
   ```bash
   # 设置环境变量
   export GITHUB_PAGES=true
   
   # 构建项目
   npm run build
   ```

2. **部署到 GitHub Pages**
   ```bash
   # 安装 gh-pages
   npm install -g gh-pages
   
   # 部署 out 目录
   gh-pages -d out
   ```

## 其他平台部署

### Vercel 部署

1. **连接 GitHub 仓库**
   - 访问 [Vercel](https://vercel.com)
   - 导入您的 GitHub 仓库

2. **配置环境变量**
   ```
   GITHUB_PAGES=false
   ```

3. **自动部署**
   - Vercel 会自动检测 Next.js 项目并部署

### Netlify 部署

1. **连接 GitHub 仓库**
   - 访问 [Netlify](https://netlify.com)
   - 连接您的 GitHub 仓库

2. **构建设置**
   ```
   Build command: npm run build
   Publish directory: out
   ```

3. **环境变量**
   ```
   GITHUB_PAGES=false
   ```

## 自定义域名

### GitHub Pages 自定义域名

1. **添加 CNAME 文件**
   ```bash
   echo "your-domain.com" > out/CNAME
   ```

2. **更新 GitHub Actions**
   ```yaml
   # 在 .github/workflows/deploy.yml 中
   cname: your-domain.com
   ```

3. **DNS 配置**
   ```
   # A 记录指向 GitHub Pages IP
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   
   # 或 CNAME 记录指向
   your-username.github.io
   ```

## 环境配置

### 开发环境
```bash
# 本地开发
npm run dev
# 访问 http://localhost:3000
```

### 生产环境
```bash
# 构建生产版本
npm run build

# 预览生产版本
npx serve out
# 访问 http://localhost:3000
```

### 环境变量说明

- `GITHUB_PAGES=true`: 启用 GitHub Pages 路径配置
- `NODE_ENV=production`: 生产环境标识

## 故障排除

### 常见问题

1. **404 错误**
   - 检查 `basePath` 配置是否正确
   - 确认 `GITHUB_PAGES` 环境变量设置

2. **资源加载失败**
   - 检查 `assetPrefix` 配置
   - 确认静态文件路径正确

3. **PWA 功能异常**
   - 检查 Service Worker 路径
   - 确认 manifest.json 可访问

### 调试步骤

1. **本地测试**
   ```bash
   # 模拟 GitHub Pages 环境
   GITHUB_PAGES=true npm run build
   npx serve out
   ```

2. **检查构建输出**
   ```bash
   # 查看生成的文件
   ls -la out/
   
   # 检查 HTML 中的路径
   cat out/index.html | grep -E "(href|src)="
   ```

3. **网络检查**
   ```bash
   # 检查资源是否可访问
   curl -I https://your-username.github.io/family-helper/
   ```

## 性能优化

### 构建优化

1. **代码分割**
   - Next.js 自动进行代码分割
   - 按路由和组件分割

2. **静态资源优化**
   - 图片压缩和格式优化
   - CSS 和 JS 压缩

3. **缓存策略**
   - Service Worker 缓存
   - CDN 缓存配置

### 运行时优化

1. **懒加载**
   - 组件懒加载
   - 图片懒加载

2. **预加载**
   - 关键资源预加载
   - 路由预加载

## 监控和分析

### 性能监控

1. **Web Vitals**
   - 使用 Google PageSpeed Insights
   - 监控 Core Web Vitals 指标

2. **用户分析**
   - 集成 Google Analytics
   - 监控用户行为

### 错误追踪

1. **前端错误**
   - 集成 Sentry 或类似服务
   - 监控 JavaScript 错误

2. **性能问题**
   - 使用浏览器开发者工具
   - 分析网络请求和渲染性能

---

**部署成功后，您的家庭助手应用就可以在线使用了！** 🚀

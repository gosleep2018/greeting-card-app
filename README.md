# 女神节祝福卡片生成器 🌸

一个基于H5的响应式女神节祝福卡片生成器，包含完整的前后端实现。用户输入姓名即可生成个性化的女神节祝福卡片，支持下载、分享和复制链接功能。

## ✨ 功能特性

### 前端功能
- 🎨 **精美UI设计**：紫色渐变主题，响应式布局
- 📱 **移动端优先**：完美适配手机、平板和桌面设备
- ✍️ **实时预览**：输入姓名实时预览祝福卡片
- 🎯 **交互体验**：流畅的动画和过渡效果
- 📤 **多方式分享**：支持下载、分享、复制链接
- 🔔 **智能通知**：操作反馈和错误提示

### 后端功能
- 🚀 **RESTful API**：完整的卡片生成API
- 🎭 **多种模板**：多个祝福卡片模板可选
- 📊 **数据统计**：生成历史和数据统计
- 🔒 **安全防护**：Helmet安全中间件
- 📝 **请求日志**：详细的API请求日志

## 🏗️ 项目结构

```
greeting-card-app/
├── frontend/                    # 前端代码
│   ├── index.html              # 主页面
│   ├── style.css               # 样式文件
│   └── script.js               # 交互逻辑
├── backend/                    # 后端代码
│   ├── server.js              # Express服务器
│   ├── package.json           # 依赖配置
│   └── package-lock.json      # 依赖锁文件
├── public/                     # 静态资源（预留）
├── README.md                  # 项目说明
├── .gitignore                 # Git忽略配置
└── deploy.sh                  # 部署脚本
```

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/yourusername/greeting-card-app.git
   cd greeting-card-app
   ```

2. **安装后端依赖**
   ```bash
   cd backend
   npm install
   ```

3. **启动后端服务器**
   ```bash
   npm start
   # 或使用开发模式
   npm run dev
   ```

4. **访问前端页面**
   - 打开浏览器访问：http://localhost:3000
   - API健康检查：http://localhost:3000/api/health

### 开发模式
```bash
# 后端热重载开发
cd backend
npm run dev

# 前端开发（需要配置开发服务器）
# 可以直接用浏览器打开 frontend/index.html
```

## 📡 API接口文档

### 健康检查
```
GET /api/health
```
返回服务器状态信息。

### 生成祝福卡片
```
POST /api/generate-card
Content-Type: application/json

{
  "name": "邱越"
}
```
生成个性化祝福卡片。

### 获取卡片模板
```
GET /api/templates
```
获取所有可用的卡片模板。

### 获取生成历史
```
GET /api/history?limit=20
```
获取最近的卡片生成历史。

### 获取统计数据
```
GET /api/stats
```
获取系统统计数据。

## 🎨 前端使用说明

1. **输入姓名**：在输入框中输入您的姓名（2-10个字符）
2. **生成卡片**：点击"解锁贺卡"按钮
3. **查看结果**：系统将生成个性化祝福卡片
4. **分享卡片**：支持下载、分享、复制链接

### 键盘快捷键
- `Ctrl/Cmd + Enter`：快速生成卡片
- `ESC`：关闭结果面板

## 🌐 部署指南

### 本地部署
```bash
# 1. 安装依赖
cd backend
npm install --production

# 2. 设置环境变量（可选）
export PORT=3000
export NODE_ENV=production

# 3. 启动服务器
npm start
```

### PM2进程管理
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start backend/server.js --name "greeting-card"

# 查看状态
pm2 status

# 设置开机自启
pm2 startup
pm2 save
```

### Docker部署
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./
COPY frontend/ ../frontend/
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# 构建镜像
docker build -t greeting-card-app .

# 运行容器
docker run -p 3000:3000 greeting-card-app
```

### 静态托管（仅前端）
如果只需要前端功能，可以直接将 `frontend/` 目录部署到：
- GitHub Pages
- Netlify
- Vercel
- 任何静态文件服务器

## 🔧 技术栈

### 前端技术
- **HTML5**：语义化标签，现代Web标准
- **CSS3**：Flexbox布局，CSS Grid，动画效果
- **JavaScript (ES6+)**：现代JavaScript语法
- **Font Awesome**：图标库
- **Google Fonts**：中文字体优化

### 后端技术
- **Node.js**：JavaScript运行时
- **Express.js**：Web应用框架
- **CORS**：跨域资源共享
- **Helmet**：安全HTTP头
- **Morgan**：HTTP请求日志

## 📱 响应式设计

- **移动端** (< 768px)：单列布局，优化触摸交互
- **平板端** (768px - 1024px)：自适应布局
- **桌面端** (> 1024px)：多列布局，充分利用空间

## 🔒 安全特性

1. **输入验证**：前端和后端双重验证
2. **XSS防护**：自动转义HTML内容
3. **CORS配置**：安全的跨域策略
4. **安全头**：Helmet中间件保护
5. **速率限制**：API请求限制（可扩展）

## 📊 性能优化

- **代码分割**：按需加载资源
- **图片优化**：使用CSS渐变代替图片
- **缓存策略**：浏览器缓存优化
- **懒加载**：延迟非关键资源加载
- **压缩传输**：Gzip压缩响应

## 🤝 贡献指南

1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- 设计灵感来自女神节祝福卡片应用
- 感谢所有贡献者和用户
- 特别感谢测试用户提供的反馈

## 📞 支持与反馈

如果您遇到问题或有改进建议：

1. 查看 [Issues](https://github.com/yourusername/greeting-card-app/issues)
2. 提交新的Issue
3. 或通过邮件联系我们

---

**祝您使用愉快！愿每一位女神都能收到最美好的祝福！** 💝

<div align="center">
  <sub>❤️ 用心制作每一份祝福 | 🚀 持续更新中</sub>
</div>
# Render 部署指南

本指南将帮助您将女神节祝福卡片应用部署到 Render 平台，并获得公开访问网址。

## 🌐 预期部署结果

成功部署后，您将获得一个公开访问网址：
```
https://greeting-card-app.onrender.com
```
（实际网址可能略有不同，取决于服务名称）

## 🚀 快速部署步骤（5分钟完成）

### 步骤 1: 访问 Render 并登录
1. 访问 https://render.com
2. 点击 "Sign Up" 注册，或使用 GitHub 账号登录（推荐）

### 步骤 2: 创建 Web 服务
1. 登录后，点击仪表板上的 "New +" 按钮
2. 选择 "Web Service"

### 步骤 3: 连接 GitHub 仓库
1. 点击 "Connect GitHub" 或 "Configure GitHub App"
2. 授权 Render 访问您的 GitHub 账户
3. 搜索并选择仓库: `gosleep2018/greeting-card-app`
4. 点击 "Connect"

### 步骤 4: 配置服务设置
Render 会自动检测 `render.yaml` 配置文件，大多数设置已预配置。确认以下设置：

- **Name**: `greeting-card-app`（可自定义）
- **Region**: 选择离您最近的区域（如 `Frankfurt`）
- **Branch**: `main`
- **Runtime**: `Node`
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`

### 步骤 5: 选择免费计划
- 在计划部分选择 **Free**
- 免费计划包括：
  - 512MB RAM
  - 共享 CPU
  - 每月 750 小时运行时间
  - 自动 SSL 证书
  - 自定义域名支持

### 步骤 6: 创建服务
1. 点击 "Create Web Service"
2. Render 将开始构建和部署您的应用
3. 构建过程需要 2-5 分钟

## 📊 部署状态监控

部署过程中，您可以查看实时日志：

1. **构建日志**: 显示 npm install 和依赖安装状态
2. **部署日志**: 显示应用启动状态
3. **健康检查**: Render 会自动检查 `/api/health` 端点

### 成功标志
- ✅ 构建状态: "Build successful"
- ✅ 部署状态: "Deploy successful"  
- ✅ 健康检查: "Healthy"
- ✅ 获得公开网址: `https://greeting-card-app-xxx.onrender.com`

## 🔗 访问您的应用

部署完成后：
- **前端页面**: `https://您的服务名.onrender.com`
- **API 健康检查**: `https://您的服务名.onrender.com/api/health`
- **API 文档**: `https://您的服务名.onrender.com/#api`

## ⚙️ 环境变量配置（可选）

如果需要在生产环境配置变量，在 Render 控制台添加：

1. 进入服务详情页
2. 点击 "Environment" 标签
3. 添加以下变量（如需）：
   ```
   NODE_ENV=production
   PORT=3000
   ```

## 📱 功能测试

部署后请测试以下功能：

1. ✅ **访问首页**: 打开部署网址，查看应用界面
2. ✅ **输入姓名**: 在输入框中输入测试姓名
3. ✅ **生成卡片**: 点击"解锁贺卡"按钮
4. ✅ **API 调用**: 检查卡片生成 API 是否正常工作
5. ✅ **响应式设计**: 在不同设备尺寸下测试布局

## ⚠️ 免费计划注意事项

Render 免费计划有以下限制：

1. **休眠机制**: 应用 15 分钟无流量会自动休眠，下次访问需要 30-60 秒唤醒
2. **月运行时间**: 每月 750 小时（约 31 天，单应用足够）
3. **自定义域名**: 支持，但需要验证所有权
4. **自动部署**: 推送代码到 GitHub 后自动重新部署

## 🔧 故障排除

### 常见问题 1: 构建失败
```
错误: 找不到模块 'express'
```
**解决方案**: 确保 `render.yaml` 中的构建命令正确指向 backend 目录

### 常见问题 2: 应用启动失败
```
错误: 端口 3000 已被占用
```
**解决方案**: 确保 `server.js` 使用 `process.env.PORT` 变量

### 常见问题 3: 健康检查失败
```
错误: /api/health 返回非 200 状态码
```
**解决方案**: 检查应用是否正常启动，API 端点是否正确

### 常见问题 4: 静态文件无法加载
```
错误: CSS/JS 文件 404
```
**解决方案**: 确保 `server.js` 正确配置了静态文件中间件

## 📞 技术支持

1. **Render 官方文档**: https://render.com/docs
2. **GitHub Issues**: https://github.com/gosleep2018/greeting-card-app/issues
3. **应用日志**: 在 Render 控制台查看实时日志

## 🎉 部署完成

成功部署后，您可以：
1. **分享网址**: 将应用分享给朋友使用
2. **嵌入网站**: 将应用嵌入到其他网站
3. **二次开发**: 基于部署的应用进行功能扩展
4. **监控流量**: 在 Render 控制台查看访问统计

---

**开始部署**: https://dashboard.render.com/select-repo?type=web

**预计时间**: 5-10 分钟  
**最终结果**: 获得公开可访问的网址 `https://greeting-card-app-xxx.onrender.com`
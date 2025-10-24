# AI Chat - ChatGPT 风格界面

## ✨ 特性

- 🎨 **ChatGPT 风格** - 精美的界面设计，仿照 ChatGPT
- 🌓 **深色/浅色主题** - 支持主题切换
- 💬 **流式对话** - 实时显示 AI 回复
- 📱 **响应式设计** - 完美适配移动端
- ⚡ **Vue 3 + Vite** - 极速开发体验
- 🎭 **流畅动画** - 精心设计的过渡效果

## 🚀 快速开始

### 安装依赖

```bash
cd frontend-vue
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问: http://localhost:3000

### 构建生产版本

```bash
npm run build
```

## 📦 技术栈

- Vue 3.4
- Vite 5
- Pinia
- SCSS

## 🎨 界面特点

### 侧边栏
- 新建对话
- 会话列表
- 重命名/删除会话
- 主题切换

### 主界面
- 简洁的顶部导航
- 中心对齐的消息流
- 优雅的消息气泡
- 流畅的输入体验

### 消息显示
- 用户消息：浅色背景
- AI消息：深色背景（深色模式相反）
- 加载动画：打字指示器
- 消息操作：复制、点赞

## 🎯 功能

- ✅ 创建/删除/重命名对话
- ✅ 发送消息并接收流式响应
- ✅ 清空对话历史
- ✅ 复制消息内容
- ✅ 深色/浅色主题切换
- ✅ 响应式布局

## ⌨️ 快捷键

- `Enter` - 发送消息
- `Shift + Enter` - 换行

## 🎨 主题颜色

### 浅色主题
- 背景：白色/浅灰
- 文本：深灰/黑色
- 强调色：绿色

### 深色主题
- 背景：深灰/黑色
- 文本：浅灰/白色
- 强调色：绿色

## 📱 响应式设计

- 桌面端：固定侧边栏
- 移动端：可折叠侧边栏

## 🔧 配置

后端 API 代理配置在 `vite.config.js`：

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

## 📝 开发说明

### 目录结构

```
src/
├── components/
│   └── ChatView.vue    # 主聊天组件
├── stores/
│   └── chat.js         # Pinia 状态管理
├── styles/
│   ├── main.scss       # 全局样式
│   └── chat.scss       # 聊天界面样式
├── App.vue
└── main.js
```

### 状态管理

使用 Pinia 管理：
- 会话列表
- 当前会话
- 消息列表
- 加载状态

### API 集成

所有 API 请求通过 `/api` 前缀代理到后端。

## 🐛 调试

打开浏览器开发者工具 (F12)：
- Console: 查看日志
- Network: 检查 API 请求
- Vue DevTools: 调试组件

## 📄 许可证

MIT License


# 🤖 Spring AI 智能聊天助手

一个基于 Spring AI 的现代化聊天应用，具有精美的界面设计和完整的会话管理功能。

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green)
![Java](https://img.shields.io/badge/Java-17+-orange)

## ✨ 核心特性

### 🎨 精美的 UI 设计
- **渐变主题**：蓝紫色渐变配色，现代科技感
- **毛玻璃效果**：精致的 backdrop-filter 模糊效果
- **流畅动画**：所有交互都有精心设计的过渡动画
- **响应式布局**：完美适配桌面端和移动端

### 💬 智能对话功能
- **流式响应**：AI 回复实时流式显示
- **消息状态**：发送中、已送达、失败等精美状态图标
- **消息操作**：复制、点赞、重试等便捷操作
- **打字指示**：优雅的打字中动画效果

### 📁 会话管理
- **多会话支持**：创建、切换、删除多个对话
- **自动命名**：根据第一条消息自动命名会话
- **会话持久化**：使用 localStorage 保存所有会话
- **会话预览**：显示最后一条消息预览

### 🎯 用户体验
- **消息气泡**：
  - 用户消息：蓝紫渐变背景 + 白色文字
  - AI 消息：浅灰背景 + 紫色装饰线
- **头像系统**：用户和 AI 头像带脉冲动画
- **悬停效果**：消息操作按钮悬停显示
- **状态提示**：Toast 通知系统

## 🚀 快速开始

### 环境要求

- Java 17+
- Maven 3.6+
- DeepSeek API Key

### 配置 API Key

在 `src/main/resources/application.properties` 中配置：

```properties
spring.ai.openai.api-key=your-deepseek-api-key
spring.ai.openai.base-url=https://api.deepseek.com
spring.ai.openai.chat.options.model=deepseek-chat
```

### 运行应用

```bash
# 克隆项目
git clone <repository-url>
cd springai项目演示

# 运行应用
mvn spring-boot:run
```

访问：http://localhost:8080

## 📖 功能说明

### 主界面布局

```
┌─────────────────────────────────────────────┐
│  💬 聊天列表         │  AI 智能助手       ┃│
│  ┌─────────────┐   │  ┌──────────────┐   ┃│
│  │ + 新建对话  │   │  │ 消息区域      │   ┃│
│  ├─────────────┤   │  │              │   ┃│
│  │ 📋 会话1    │   │  │  User: 你好  │   ┃│
│  │ 📋 会话2    │   │  │  AI: 你好！  │   ┃│
│  │ 📋 会话3    │   │  │              │   ┃│
│  └─────────────┘   │  └──────────────┘   ┃│
│                    │  ┌──────────────┐   ┃│
│                    │  │ 输入框 | 发送│   ┃│
│                    │  └──────────────┘   ┃│
└─────────────────────────────────────────────┘
```

### 操作指南

#### 发送消息
1. 在输入框输入消息
2. 按 `Enter` 或点击发送按钮
3. AI 会实时流式回复

#### 会话管理
- **新建会话**：点击左上角 ➕ 按钮
- **切换会话**：点击左侧会话列表中的任意会话
- **重命名会话**：
  - 方式1：悬停在会话上，点击 ✏️ 按钮
  - 方式2：点击顶部工具栏的重命名按钮
- **删除会话**：
  - 方式1：悬停在会话上，点击 🗑️ 按钮
  - 方式2：点击顶部工具栏的删除按钮

#### 消息操作
- **复制消息**：悬停在消息上，点击"复制"按钮
- **点赞消息**：悬停在消息上，点击"赞"按钮
- **重新生成**：对 AI 消息，点击"重试"按钮

#### 快捷键
- `Enter`：发送消息
- `Shift + Enter`：换行

## 🎨 界面特性详解

### 消息气泡样式

**用户消息**：
- 三色渐变背景（#667eea → #764ba2 → #a855f7）
- 多层阴影效果
- 悬停时的光泽动画
- 右对齐显示

**AI 消息**：
- 浅灰渐变背景
- 左侧紫色装饰线（带光晕动画）
- 左对齐显示

### 输入区域

- **悬浮卡片效果**：4层渐变阴影
- **焦点光晕**：获得焦点时蓝色光环脉冲
- **自动增高**：支持多行输入（最高 140px）
- **发送按钮**：渐变背景 + shimmer 闪光效果

### 会话列表

- **卡片设计**：每个会话都是独立的卡片
- **活跃状态**：当前会话高亮显示（渐变背景）
- **悬停效果**：上浮 + 操作按钮淡入
- **优雅滚动条**：细窄半透明设计

## 🏗️ 项目结构

```
springai项目演示/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/springaichat/
│   │   │       ├── config/
│   │   │       │   ├── ChatClientConfig.java      # AI 客户端配置
│   │   │       │   ├── EncodingConfig.java        # 编码配置
│   │   │       │   └── WebMvcConfig.java          # Web 配置
│   │   │       ├── controller/
│   │   │       │   └── AIController.java          # AI 聊天控制器
│   │   │       ├── service/
│   │   │       │   └── ChatService.java           # 聊天服务
│   │   │       └── SpringAiChatApplication.java   # 主程序
│   │   └── resources/
│   │       ├── application.properties             # 应用配置
│   │       └── static/
│   │           ├── index.html                     # 主页面
│   │           ├── chat.js                        # 前端逻辑
│   │           └── test-simple.html               # 测试页面
│   └── test/
├── pom.xml                                        # Maven 配置
└── README.md                                      # 本文档
```

## 🔧 技术栈

### 后端
- **Spring Boot 3.x**：应用框架
- **Spring AI**：AI 集成框架
- **DeepSeek API**：AI 模型服务
- **Server-Sent Events (SSE)**：流式响应

### 前端
- **原生 JavaScript**：无框架依赖
- **CSS3**：现代 CSS 特性
  - CSS Variables（主题系统）
  - CSS Grid & Flexbox（布局）
  - backdrop-filter（毛玻璃效果）
  - CSS Animations（动画效果）
- **LocalStorage**：会话持久化

## 💡 核心功能实现

### 流式响应处理

```javascript
// 使用 Fetch API + SSE 处理流式响应
const response = await fetch('/ai/chat', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
    },
    body: JSON.stringify({ message, sessionId })
});

// 逐块读取并实时显示
const reader = response.body.getReader();
const decoder = new TextDecoder('utf-8');
while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    // 解析并显示内容
    this.typeMessage(messageId, fullContent);
}
```

### 会话管理

```javascript
// 会话数据结构
{
    id: 'session_xxx',
    name: '会话名称',
    messages: [
        { id, role, content, timestamp, status }
    ],
    createdAt: timestamp,
    updatedAt: timestamp
}

// 保存到 localStorage
localStorage.setItem('chatSessions', JSON.stringify(sessions));
```

### 事件委托

```javascript
// 使用事件委托提高性能和可靠性
sessionList.addEventListener('click', (e) => {
    const chatItem = e.target.closest('.chat-item');
    const action = e.target.closest('[data-action]');
    
    switch(action?.getAttribute('data-action')) {
        case 'switch': this.switchSession(sessionId); break;
        case 'rename': this.renameSession(sessionId); break;
        case 'delete': this.deleteSession(sessionId); break;
    }
});
```

## 🎯 CSS 变量系统

### 主题颜色

```css
:root {
    /* 主题色 */
    --theme-primary: #6366f1;
    --theme-secondary: #8b5cf6;
    --theme-accent: #a855f7;
    
    /* 渐变 */
    --user-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #a855f7 100%);
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    /* 毛玻璃 */
    --glass-bg: rgba(255, 255, 255, 0.08);
    --glass-border: rgba(255, 255, 255, 0.12);
    
    /* 文本 */
    --text-primary: #f8fafc;
    --text-secondary: #e2e8f0;
    --text-muted: #94a3b8;
}
```

### 间距系统

```css
--spacing-2xs: 2px;
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;
```

### 圆角系统

```css
--border-radius-xs: 6px;
--border-radius-sm: 10px;
--border-radius-md: 14px;
--border-radius-lg: 18px;
--border-radius-xl: 24px;
--border-radius-xxl: 32px;
```

## 🐛 调试指南

### 查看控制台日志

应用提供了详细的控制台日志：

```
🔄 开始渲染会话列表，会话数量: 2
✅ 会话列表渲染完成
✅ 会话列表事件委托已设置

📌 会话列表被点击 <div>
🎯 点击的会话ID: session_xxx
🔧 执行操作: switch 会话ID: session_xxx
→ 切换会话
切换到会话: session_xxx
```

### 常见问题

**Q: AI 不回复？**
- 检查 API Key 是否配置正确
- 查看控制台是否有错误信息
- 确认网络连接正常

**Q: 会话无法切换？**
- 打开控制台查看是否有 "📌 会话列表被点击" 日志
- 确认事件委托已设置（有 "✅ 会话列表事件委托已设置" 日志）

**Q: 消息不显示？**
- 查看控制台是否有 "消息元素未找到" 错误
- 检查是否有 "接收到数据块" 日志

## 📱 响应式设计

### 桌面端（>768px）
- 左侧固定宽度侧边栏（280px）
- 右侧自适应聊天区域
- 完整的功能按钮

### 移动端（≤768px）
- 侧边栏隐藏，点击菜单展开
- 聊天区域全屏显示
- 优化的触摸交互

## 🔐 安全性

- **XSS 防护**：所有用户输入都经过 HTML 转义
- **CORS 配置**：仅允许指定源访问
- **API Key 保护**：不暴露在前端代码

## 🚧 未来计划

- [ ] 支持 Markdown 渲染
- [ ] 代码高亮显示
- [ ] 消息搜索功能
- [ ] 导出对话记录
- [ ] 深色/浅色主题切换
- [ ] 语音输入支持
- [ ] 图片上传功能
- [ ] 多语言支持

## 📄 许可证

本项目采用 MIT 许可证。

## 🙏 致谢

- [Spring AI](https://spring.io/projects/spring-ai) - AI 集成框架
- [DeepSeek](https://www.deepseek.com/) - AI 模型服务
- 设计灵感来自现代化的聊天应用界面

## 📞 联系方式

如有问题或建议，欢迎提交 Issue 或 Pull Request。

---

**享受与 AI 的智能对话！** 🎉


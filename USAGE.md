# 📚 Spring AI 聊天助手 - 使用手册

## 目录

1. [快速上手](#快速上手)
2. [界面介绍](#界面介绍)
3. [功能详解](#功能详解)
4. [快捷操作](#快捷操作)
5. [常见问题](#常见问题)
6. [技术说明](#技术说明)

---

## 🚀 快速上手

### 第一次使用

1. **启动应用**
   ```bash
   mvn spring-boot:run
   ```

2. **打开浏览器**
   ```
   访问：http://localhost:8080
   ```

3. **开始聊天**
   - 在底部输入框输入消息
   - 按 `Enter` 或点击发送按钮
   - 等待 AI 回复（实时流式显示）

### 基本流程

```
1. 输入消息 → 2. 发送 → 3. AI 处理 → 4. 实时显示回复
```

---

## 🖥️ 界面介绍

### 整体布局

应用界面分为三个主要区域：

```
┌────────────────────────────────────────────────────┐
│                                                    │
│   [左侧边栏]          [聊天区域]                   │
│                                                    │
│   💬 聊天列表         ┌──────────────────┐         │
│   ┌──────────┐       │  AI 智能助手      │         │
│   │ + 新建   │       ├──────────────────┤         │
│   ├──────────┤       │                  │         │
│   │ 会话1 ✏️🗑│       │  [消息显示区域]   │         │
│   │ 会话2 ✏️🗑│       │                  │         │
│   │ 会话3 ✏️🗑│       │  User: 你好       │         │
│   └──────────┘       │  AI: 你好！很...  │         │
│                      │                  │         │
│                      ├──────────────────┤         │
│                      │  [输入区域]      │         │
│                      │  输入框    | 📤  │         │
│                      └──────────────────┘         │
└────────────────────────────────────────────────────┘
```

### 区域说明

#### 1️⃣ 左侧边栏（会话管理）

**顶部**：
- 💬 **聊天列表** 标题
- ➕ **新建对话** 按钮（蓝紫渐变）

**会话列表**：
- 📋 会话名称
- 📝 最后一条消息预览
- 📅 更新时间
- ✏️ 重命名按钮（悬停显示）
- 🗑️ 删除按钮（悬停显示）

#### 2️⃣ 聊天区域

**顶部工具栏**：
- 💬 当前会话名称
- ✏️ 重命名当前会话
- 🗑️ 删除当前会话
- 🧹 清空所有消息
- 🧪 测试按钮

**消息显示区**：
- 👤 用户消息（右侧，蓝紫渐变）
- 🤖 AI 消息（左侧，浅灰背景 + 紫色装饰线）
- ⏱️ 消息时间
- ✓ 发送状态图标
- 📋 复制、❤️ 点赞、🔄 重试按钮（悬停显示）

**输入区域**：
- 📝 多行文本输入框（自动增高）
- 📤 发送按钮（渐变 + 光效）
- 💡 占位符提示

---

## 🎯 功能详解

### 1. 发送消息

#### 方式一：键盘发送
```
1. 在输入框输入内容
2. 按 Enter 键发送
3. 按 Shift + Enter 换行
```

#### 方式二：按钮发送
```
1. 在输入框输入内容
2. 点击发送按钮（📤）
```

#### 发送状态

消息发送后，右下角会显示状态图标：
- 🟡 **脉冲圆点**：发送中...
- ✓ **对勾图标**：已送达
- ✗ **叉号图标**：发送失败

### 2. 会话管理

#### 创建新会话

**方法1**：点击左上角 ➕ 按钮
```
点击后：
- 创建新的空白会话
- 自动切换到新会话
- 输入第一条消息后自动命名
```

**会话自动命名规则**：
- 第一条消息的前 20 个字符
- 超过 20 字符会添加 "..."

#### 切换会话

**操作**：点击左侧会话列表中的任意会话

**效果**：
- 当前会话高亮（蓝紫渐变背景）
- 消息区域显示该会话的所有消息
- 顶部标题更新为会话名称

#### 重命名会话

**方法1**：悬停在会话上，点击 ✏️ 按钮

**方法2**：点击顶部工具栏的重命名按钮

**流程**：
```
1. 点击重命名按钮
2. 弹出对话框，显示当前名称
3. 输入新名称
4. 确认后立即更新
```

#### 删除会话

**方法1**：悬停在会话上，点击 🗑️ 按钮

**方法2**：点击顶部工具栏的删除按钮

**保护机制**：
- ⚠️ 至少保留一个会话
- 删除前会弹出确认对话框
- 删除当前会话会自动切换到其他会话

#### 清空消息

**操作**：点击顶部 🧹 清空消息按钮

**效果**：
- 清空当前会话的所有消息
- 不删除会话本身
- 弹出确认对话框

### 3. 消息操作

#### 复制消息

**操作**：
```
1. 悬停在消息上
2. 点击"复制"按钮（📋 复制）
```

**反馈**：
- ✅ 右上角显示 Toast 提示
- 复制按钮短暂变绿
- 内容已复制到剪贴板

#### 点赞消息

**操作**：
```
1. 悬停在消息上
2. 点击"赞"按钮（❤️ 赞）
```

**效果**：
- 空心 ❤️ → 实心 ❤️
- 按钮变红色
- 心跳动画效果
- 再次点击取消点赞

#### 重新生成（AI 消息专属）

**操作**：
```
1. 悬停在 AI 消息上
2. 点击"重试"按钮（🔄 重试）
```

**效果**：
- 重新发送对应的用户问题
- 获取新的 AI 回复

---

## ⚡ 快捷操作

### 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Enter` | 发送消息 |
| `Shift + Enter` | 换行 |

### 鼠标操作

| 操作 | 功能 |
|------|------|
| 点击会话 | 切换会话 |
| 悬停消息 | 显示操作按钮 |
| 悬停会话 | 显示编辑/删除按钮 |
| 双击消息 | 选择文本 |

### 触摸操作（移动端）

| 操作 | 功能 |
|------|------|
| 点击会话 | 切换会话 |
| 长按消息 | 显示操作菜单 |
| 滑动侧边栏 | 展开/收起 |

---

## ❓ 常见问题

### Q1: 为什么消息不显示？

**可能原因**：
1. ❌ API Key 未配置或错误
2. ❌ 网络连接问题
3. ❌ 后端服务未启动

**解决方法**：
```
1. 检查 application.properties 配置
2. 查看浏览器控制台错误信息
3. 确认后端服务运行正常
```

### Q2: 如何清空所有会话？

**方法**：
```javascript
// 在浏览器控制台执行
localStorage.removeItem('chatSessions');
location.reload();
```

### Q3: 消息发送失败怎么办？

**步骤**：
1. 查看消息状态图标（✗ 表示失败）
2. 查看控制台错误信息
3. 点击"重试"按钮重新发送

### Q4: 如何导出聊天记录？

**方法**：
```javascript
// 在浏览器控制台执行
const sessions = JSON.parse(localStorage.getItem('chatSessions'));
console.log(JSON.stringify(sessions, null, 2));
// 复制控制台输出的 JSON
```

### Q5: 会话列表无法点击？

**检查步骤**：
```
1. 打开控制台（F12）
2. 刷新页面
3. 查看是否有 "✅ 会话列表事件委托已设置" 日志
4. 点击会话，查看是否有 "📌 会话列表被点击" 日志
5. 如果没有日志，请联系开发者
```

---

## 🔬 技术说明

### 流式响应原理

```
用户发送消息
    ↓
后端调用 DeepSeek API
    ↓
使用 Flux<ChatResponse> 流式返回
    ↓
SSE (Server-Sent Events) 推送到前端
    ↓
前端实时解析并显示
```

### 数据格式

**SSE 数据格式**：
```
data:data: {"content": "你好"}
data:
data:
data:data: {"content": "！"}
data:
data:[DONE]
```

**会话数据结构**：
```json
{
  "session_xxx": {
    "id": "session_xxx",
    "name": "会话名称",
    "messages": [
      {
        "id": "msg_xxx",
        "role": "user",
        "content": "你好",
        "timestamp": 1760963425973,
        "status": "success"
      }
    ],
    "createdAt": 1760963419607,
    "updatedAt": 1760963425973
  }
}
```

### 事件委托机制

使用事件委托提高性能和可靠性：

```javascript
// 在父元素上绑定一个事件监听器
sessionList.addEventListener('click', (e) => {
    // 查找被点击的会话项
    const chatItem = e.target.closest('.chat-item');
    const sessionId = chatItem.getAttribute('data-session-id');
    
    // 查找具体操作
    const action = e.target.closest('[data-action]');
    
    // 执行相应操作
    switch(action?.getAttribute('data-action')) {
        case 'switch': switchSession(sessionId); break;
        case 'rename': renameSession(sessionId); break;
        case 'delete': deleteSession(sessionId); break;
    }
});
```

**优点**：
- ✅ 只需绑定一次事件
- ✅ 动态添加的元素自动生效
- ✅ 性能更好
- ✅ 代码更简洁

### CSS 动画系统

#### 消息滑入动画
```css
@keyframes messageSlideIn {
    from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
```

#### 脉冲动画
```css
@keyframes statusPulse {
    0%, 100% {
        transform: scale(0.8);
        opacity: 0.6;
        box-shadow: 0 0 0 0 var(--warning-color);
    }
    50% {
        transform: scale(1.2);
        opacity: 1;
        box-shadow: 0 0 12px var(--warning-color);
    }
}
```

#### 光晕动画
```css
@keyframes accentGlow {
    0%, 100% {
        box-shadow: 0 0 12px rgba(168, 85, 247, 0.5);
        opacity: 0.8;
    }
    50% {
        box-shadow: 0 0 20px rgba(168, 85, 247, 0.8);
        opacity: 1;
    }
}
```

---

## 🎨 界面元素详解

### 消息气泡

#### 用户消息
- **背景**：三色渐变（蓝→紫→粉）
- **位置**：右对齐
- **头像**：蓝紫渐变圆形 + 脉冲动画
- **特效**：悬停时光泽移动效果

#### AI 消息
- **背景**：浅灰渐变
- **装饰**：左侧紫色装饰线 + 光晕动画
- **头像**：紫色渐变 + 呼吸动画
- **特效**：悬停时上浮 + 阴影扩散

### 输入区域

#### 悬浮卡片效果
- **默认**：浅色毛玻璃 + 多层阴影
- **悬停**：上浮 4px + 阴影加深
- **焦点**：上浮 6px + 蓝色光环脉冲

#### 发送按钮
- **默认**：蓝紫渐变 + 圆形
- **悬停**：缩放 1.08 + 弹跳动画 + shimmer 闪光
- **点击**：缩放 0.98
- **禁用**：灰色 + 不可点击

### 会话列表

#### 普通会话卡片
- **背景**：半透明毛玻璃
- **边框**：细窄透明边框
- **悬停**：上浮 2px + 操作按钮显示

#### 活跃会话卡片
- **背景**：蓝紫渐变
- **文字**：白色
- **特效**：强化阴影 + 上浮效果

---

## 🔧 高级功能

### 会话数据导出

在浏览器控制台执行：

```javascript
// 导出所有会话
const sessions = JSON.parse(localStorage.getItem('chatSessions'));
const dataStr = JSON.stringify(sessions, null, 2);
const dataBlob = new Blob([dataStr], {type: 'application/json'});
const url = URL.createObjectURL(dataBlob);
const link = document.createElement('a');
link.href = url;
link.download = 'chat-sessions-' + new Date().toISOString() + '.json';
link.click();
```

### 会话数据导入

```javascript
// 导入会话（需要先准备 JSON 数据）
const importData = { /* 粘贴导出的 JSON 数据 */ };
localStorage.setItem('chatSessions', JSON.stringify(importData));
location.reload();
```

### 清除所有数据

```javascript
// 清空所有会话和消息
localStorage.clear();
location.reload();
```

### 调试模式

在控制台执行这些命令进行调试：

```javascript
// 检查 DOM 元素
checkDOM()

// 测试消息显示
testMessageDisplay()

// 测试流式响应
testStreamingResponse()

// 测试错误响应
testErrorResponse()

// 查看当前会话
console.log(chatApp.sessions[chatApp.currentSessionId])

// 查看所有会话
console.log(chatApp.sessions)
```

---

## 🎨 自定义主题

### 修改主题颜色

在 `index.html` 的 CSS 中修改：

```css
:root {
    /* 修改主色调 */
    --theme-primary: #6366f1;     /* 主色 */
    --theme-secondary: #8b5cf6;   /* 辅色 */
    --theme-accent: #a855f7;      /* 强调色 */
    
    /* 修改渐变 */
    --user-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #a855f7 100%);
}
```

### 修改圆角大小

```css
:root {
    --border-radius-lg: 18px;  /* 改为 12px 更方正 */
    --border-radius-xl: 24px;  /* 改为 16px 更方正 */
}
```

### 修改间距

```css
:root {
    --spacing-md: 16px;  /* 改为 12px 更紧凑 */
    --spacing-lg: 24px;  /* 改为 20px 更紧凑 */
}
```

---

## 📊 性能优化建议

### 清理旧会话

定期清理不需要的会话：

```javascript
// 删除 7 天前的会话
const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
Object.keys(chatApp.sessions).forEach(sessionId => {
    if (chatApp.sessions[sessionId].updatedAt < sevenDaysAgo) {
        delete chatApp.sessions[sessionId];
    }
});
chatApp.saveSessions();
chatApp.renderSessionList();
```

### 限制消息历史

```javascript
// 每个会话最多保留 50 条消息
Object.values(chatApp.sessions).forEach(session => {
    if (session.messages.length > 50) {
        session.messages = session.messages.slice(-50);
    }
});
chatApp.saveSessions();
```

---

## 🔐 安全提示

### 数据保护

1. **本地存储**：会话数据存储在浏览器的 localStorage 中
2. **隐私**：清除浏览器数据会删除所有会话
3. **备份**：建议定期导出重要对话

### API Key 保护

⚠️ **永远不要**：
- 在前端代码中硬编码 API Key
- 将包含 API Key 的代码提交到公开仓库
- 与他人分享你的 API Key

✅ **正确做法**：
- API Key 仅配置在后端 `application.properties`
- 使用环境变量管理敏感信息
- 定期轮换 API Key

---

## 📞 获取帮助

### 查看日志

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 查看详细的运行日志

### 报告问题

提供以下信息：
- 🖥️ 操作系统和浏览器版本
- 📝 控制台错误信息（截图）
- 🔄 重现步骤
- 📊 应用版本

---

## 🎓 学习资源

### Spring AI 官方文档
https://spring.io/projects/spring-ai

### DeepSeek API 文档
https://platform.deepseek.com/docs

### MDN Web 文档
https://developer.mozilla.org/

---

## 🎉 更新日志

### Version 1.0.0 (2025-01-20)

**✨ 新功能**
- 精美的 UI 设计（蓝紫渐变主题）
- 流式响应显示
- 多会话管理
- 消息操作（复制、点赞、重试）
- 会话自动命名
- 事件委托优化

**🐛 修复**
- 修复消息不显示的问题（data: 格式解析）
- 修复会话列表无法点击的问题（事件委托）
- 修复状态图标显示
- 修复会话切换逻辑

**🎨 UI 优化**
- 消息气泡渐变背景
- AI 消息装饰线光晕效果
- 输入框焦点光环动画
- 发送按钮 shimmer 效果
- 头像脉冲/呼吸动画
- 会话卡片悬停效果

---

**祝您使用愉快！如有任何问题，欢迎反馈。** 🎈


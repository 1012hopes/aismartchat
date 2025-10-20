# 🛠️ Spring AI 聊天助手 - 开发文档

## 目录

1. [项目架构](#项目架构)
2. [后端开发](#后端开发)
3. [前端开发](#前端开发)
4. [API 文档](#api-文档)
5. [样式指南](#样式指南)
6. [调试技巧](#调试技巧)
7. [部署指南](#部署指南)

---

## 🏛️ 项目架构

### 技术选型

**后端**：
- Spring Boot 3.x
- Spring AI (DeepSeek 集成)
- WebFlux (流式响应)
- Maven (依赖管理)

**前端**：
- 原生 JavaScript (ES6+)
- CSS3 (变量、动画、毛玻璃效果)
- HTML5 (语义化标签)

**存储**：
- LocalStorage (前端会话存储)
- 无数据库依赖

### 分层架构

```
┌──────────────────────────────────────┐
│           前端层 (Front-end)          │
│  - index.html (UI)                   │
│  - chat.js (业务逻辑)                 │
│  - CSS (样式和动画)                   │
├──────────────────────────────────────┤
│           控制器层 (Controller)       │
│  - AIController.java                 │
│    → 处理 HTTP 请求                   │
│    → 返回 SSE 流式响应                │
├──────────────────────────────────────┤
│           服务层 (Service)            │
│  - ChatService.java                  │
│    → 调用 Spring AI                   │
│    → 管理会话历史                     │
│    → 流式数据处理                     │
├──────────────────────────────────────┤
│           配置层 (Config)             │
│  - ChatClientConfig.java             │
│  - EncodingConfig.java               │
│  - WebMvcConfig.java                 │
├──────────────────────────────────────┤
│           AI 层 (Spring AI)           │
│  - ChatClient                        │
│  - DeepSeek API                      │
└──────────────────────────────────────┘
```

---

## 💻 后端开发

### 核心类说明

#### 1. AIController.java

**职责**：处理聊天请求，返回流式响应

**关键方法**：
```java
@PostMapping("/chat")
public Flux<ServerSentEvent<String>> chat(@RequestBody ChatRequest request) {
    // 调用服务层
    return chatService.streamChat(request.getMessage(), request.getSessionId())
        .map(content -> ServerSentEvent.builder(content)
            .event("message")
            .build());
}
```

**特点**：
- 使用 `Flux` 实现流式响应
- 返回 `ServerSentEvent` 格式
- 支持会话 ID 管理

#### 2. ChatService.java

**职责**：封装 AI 调用逻辑

**关键方法**：
```java
public Flux<String> streamChat(String userMessage, String sessionId) {
    // 构建消息历史
    List<Message> messages = buildMessageHistory(sessionId, userMessage);
    
    // 调用 ChatClient
    return chatClient.prompt()
        .messages(messages)
        .stream()
        .content();
}
```

**特点**：
- 维护会话历史
- 流式返回内容
- 异常处理

#### 3. ChatClientConfig.java

**职责**：配置 ChatClient

```java
@Bean
public ChatClient chatClient(ChatClient.Builder builder) {
    return builder
        .defaultOptions(ChatOptions.builder()
            .model("deepseek-chat")
            .temperature(0.7)
            .maxTokens(2000)
            .build())
        .build();
}
```

### 添加新的 API 端点

#### 步骤 1：定义请求/响应类

```java
public record ChatHistoryRequest(String sessionId) {}
public record ChatHistoryResponse(List<Message> messages) {}
```

#### 步骤 2：在 Controller 中添加端点

```java
@GetMapping("/history")
public ResponseEntity<ChatHistoryResponse> getHistory(
    @RequestParam String sessionId) {
    
    List<Message> messages = chatService.getHistory(sessionId);
    return ResponseEntity.ok(new ChatHistoryResponse(messages));
}
```

#### 步骤 3：在 Service 中实现逻辑

```java
public List<Message> getHistory(String sessionId) {
    return sessionHistories.getOrDefault(sessionId, new ArrayList<>());
}
```

---

## 🎨 前端开发

### ChatApp 类结构

```javascript
class ChatApp {
    // 核心属性
    currentSessionId    // 当前会话 ID
    sessions           // 所有会话数据
    isLoading          // 加载状态
    
    // DOM 元素引用
    chatMessages       // 消息容器
    userInput          // 输入框
    sendButton         // 发送按钮
    
    // 核心方法
    sendMessage()          // 发送消息
    streamAIResponse()     // 处理流式响应
    typeMessage()          // 显示消息
    addMessageToChat()     // 添加消息到界面
    
    // 会话管理
    createNewSession()     // 创建会话
    switchSession()        // 切换会话
    deleteSession()        // 删除会话
    renameSession()        // 重命名会话
    
    // 工具方法
    formatMessage()        // 格式化消息
    escapeHtml()          // HTML 转义
    showToast()           // 显示提示
}
```

### 添加新功能

#### 示例：添加消息搜索

**步骤 1：添加 UI 元素**

```html
<!-- 在 chat-header 中添加搜索框 -->
<input type="text" id="searchInput" placeholder="搜索消息...">
```

**步骤 2：添加搜索方法**

```javascript
searchMessages(keyword) {
    const session = this.sessions[this.currentSessionId];
    if (!session) return [];
    
    return session.messages.filter(msg => 
        msg.content.toLowerCase().includes(keyword.toLowerCase())
    );
}
```

**步骤 3：绑定事件**

```javascript
document.getElementById('searchInput').addEventListener('input', (e) => {
    const results = this.searchMessages(e.target.value);
    this.displaySearchResults(results);
});
```

### 自定义消息渲染

#### 添加 Markdown 支持

```javascript
formatMessage(content) {
    // 1. 转义 HTML
    content = this.escapeHtml(content);
    
    // 2. 处理 Markdown
    content = content
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')  // 粗体
        .replace(/\*(.+?)\*/g, '<em>$1</em>')              // 斜体
        .replace(/`(.+?)`/g, '<code>$1</code>')            // 代码
        .replace(/\n/g, '<br>');                           // 换行
    
    return content;
}
```

#### 添加代码高亮

```javascript
// 引入 highlight.js
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js/styles/atom-one-dark.css">
<script src="https://cdn.jsdelivr.net/npm/highlight.js"></script>

// 在消息渲染后高亮代码
document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightBlock(block);
});
```

---

## 📡 API 文档

### POST /ai/chat

**描述**：发送消息并获取 AI 流式响应

**请求**：
```json
{
  "message": "你好",
  "sessionId": "session_1760963419607_7281meb9m"
}
```

**响应**：Server-Sent Events (SSE)

```
data:data: {"content": "你"}
data:
data:
data:data: {"content": "好"}
data:
data:
data:data: {"content": "！"}
data:
data:[DONE]
```

**响应格式说明**：
- 每行以 `data:` 开头
- 实际数据有双重前缀：`data:data:`
- JSON 格式：`{"content": "文本"}`
- 结束标记：`[DONE]`

**错误处理**：
```json
{
  "error": "错误信息",
  "status": 500
}
```

### 添加新的端点

#### 获取会话历史

```java
@GetMapping("/sessions/{sessionId}")
public ResponseEntity<Session> getSession(@PathVariable String sessionId) {
    Session session = chatService.getSession(sessionId);
    return ResponseEntity.ok(session);
}
```

#### 清空会话

```java
@DeleteMapping("/sessions/{sessionId}")
public ResponseEntity<Void> clearSession(@PathVariable String sessionId) {
    chatService.clearSession(sessionId);
    return ResponseEntity.noContent().build();
}
```

---

## 🎨 样式指南

### CSS 命名规范

**BEM 规范**：
```css
/* Block */
.message { }

/* Element */
.message-bubble { }
.message-avatar { }
.message-content { }

/* Modifier */
.message.user { }
.message.ai { }
.message-bubble.sending { }
```

### 颜色使用规范

**语义化颜色**：
```css
--success-color: #10b981;  /* 成功：绿色 */
--warning-color: #f59e0b;  /* 警告：橙色 */
--error-color: #ef4444;    /* 错误：红色 */
--info-color: #06b6d4;     /* 信息：青色 */
```

**状态颜色**：
```css
/* 发送中 */
.status-sending { color: var(--warning-color); }

/* 发送成功 */
.status-sent { color: var(--success-color); }

/* 发送失败 */
.status-error { color: var(--error-color); }
```

### 动画设计原则

1. **时长**：
   - 快速交互：150ms
   - 普通交互：300ms
   - 复杂动画：500ms+

2. **缓动函数**：
   ```css
   /* 标准 */
   cubic-bezier(0.4, 0, 0.2, 1)
   
   /* 弹性 */
   cubic-bezier(0.68, -0.55, 0.265, 1.55)
   ```

3. **性能优化**：
   - 优先使用 `transform` 和 `opacity`
   - 避免触发重排的属性（width、height、margin）
   - 使用 `will-change` 提示浏览器

---

## 🔍 调试技巧

### Chrome DevTools 使用

#### 1. 查看 SSE 流

```
1. 打开 DevTools (F12)
2. 切换到 Network 标签
3. 发送消息
4. 找到 /ai/chat 请求
5. 点击查看 EventStream 内容
```

#### 2. 调试 JavaScript

```javascript
// 在代码中添加断点
debugger;

// 或在 DevTools Sources 标签中设置断点
```

#### 3. 查看元素样式

```
1. 选择元素（Elements 标签）
2. 查看 Styles 面板
3. 实时修改样式
4. 复制生效的 CSS
```

### 控制台调试命令

```javascript
// 查看当前会话
chatApp.sessions[chatApp.currentSessionId]

// 查看所有会话
chatApp.sessions

// 强制重新渲染会话列表
chatApp.renderSessionList()

// 检查 DOM 元素
checkDOM()

// 测试消息显示
testMessageDisplay()

// 清空所有会话
localStorage.removeItem('chatSessions')
location.reload()
```

### 添加自定义日志

```javascript
// 在关键位置添加日志
console.log('🔍 调试信息:', variable);
console.warn('⚠️ 警告信息:', warning);
console.error('❌ 错误信息:', error);

// 使用表格显示复杂数据
console.table(sessions);

// 分组日志
console.group('会话管理');
console.log('会话 ID:', sessionId);
console.log('会话名称:', session.name);
console.groupEnd();
```

---

## 🧪 测试

### 前端测试

#### 测试流式响应

访问测试页面：
```
http://localhost:8080/test-simple.html
```

在控制台执行：
```javascript
// 测试流式响应
testStreamingResponse()

// 测试错误处理
testErrorResponse()

// 测试简单消息
testSimpleMessage()
```

#### 单元测试建议

```javascript
// 测试消息格式化
function testFormatMessage() {
    const input = 'Hello\nWorld';
    const expected = 'Hello<br>World';
    const result = chatApp.formatMessage(input);
    console.assert(result === expected, '格式化测试失败');
}

// 测试 HTML 转义
function testEscapeHtml() {
    const input = '<script>alert("xss")</script>';
    const result = chatApp.escapeHtml(input);
    console.assert(!result.includes('<script>'), 'XSS 防护失败');
}
```

### 后端测试

#### API 测试

使用 curl 测试：
```bash
# 测试聊天接口
curl -X POST http://localhost:8080/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"你好","sessionId":"test-session"}'
```

使用 Postman：
```
POST http://localhost:8080/ai/chat
Content-Type: application/json

{
  "message": "你好",
  "sessionId": "test-session"
}
```

---

## 📦 构建和部署

### Maven 构建

```bash
# 清理并打包
mvn clean package

# 跳过测试打包
mvn clean package -DskipTests

# 运行打包后的 jar
java -jar target/springai-chat-1.0.0.jar
```

### 配置文件

#### application.properties

```properties
# 服务器配置
server.port=8080
server.servlet.encoding.charset=UTF-8
server.servlet.encoding.force=true

# Spring AI 配置
spring.ai.openai.api-key=${DEEPSEEK_API_KEY}
spring.ai.openai.base-url=https://api.deepseek.com
spring.ai.openai.chat.options.model=deepseek-chat
spring.ai.openai.chat.options.temperature=0.7
spring.ai.openai.chat.options.max-tokens=2000

# 日志配置
logging.level.org.springframework.ai=DEBUG
```

#### 环境变量

```bash
# Linux/Mac
export DEEPSEEK_API_KEY=your-api-key
mvn spring-boot:run

# Windows PowerShell
$env:DEEPSEEK_API_KEY="your-api-key"
mvn spring-boot:run

# Windows CMD
set DEEPSEEK_API_KEY=your-api-key
mvn spring-boot:run
```

### Docker 部署

#### Dockerfile

```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### docker-compose.yml

```yaml
version: '3.8'
services:
  spring-ai-chat:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
    restart: unless-stopped
```

#### 构建和运行

```bash
# 构建镜像
docker build -t spring-ai-chat .

# 运行容器
docker run -d -p 8080:8080 \
  -e DEEPSEEK_API_KEY=your-key \
  --name spring-ai-chat \
  spring-ai-chat

# 或使用 docker-compose
docker-compose up -d
```

---

## 🎯 性能优化

### 前端优化

#### 1. 虚拟滚动（大量消息时）

```javascript
// 仅渲染可见区域的消息
class VirtualScroller {
    constructor(container, items, renderItem) {
        this.container = container;
        this.items = items;
        this.renderItem = renderItem;
        this.visibleStart = 0;
        this.visibleEnd = 50;
    }
    
    render() {
        const visibleItems = this.items.slice(
            this.visibleStart, 
            this.visibleEnd
        );
        this.container.innerHTML = '';
        visibleItems.forEach(item => {
            this.container.appendChild(this.renderItem(item));
        });
    }
}
```

#### 2. 防抖和节流

```javascript
// 防抖：延迟执行
function debounce(func, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

// 节流：限制频率
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 使用示例
const handleScroll = throttle(() => {
    this.loadMoreMessages();
}, 200);
```

#### 3. LazyLoad 图片

```javascript
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => observer.observe(img));
}
```

### 后端优化

#### 1. 限制会话历史长度

```java
private static final int MAX_HISTORY_SIZE = 20;

private List<Message> buildMessageHistory(String sessionId, String userMessage) {
    List<Message> history = sessionHistories.getOrDefault(
        sessionId, 
        new ArrayList<>()
    );
    
    // 只保留最近的消息
    if (history.size() > MAX_HISTORY_SIZE) {
        history = history.subList(
            history.size() - MAX_HISTORY_SIZE, 
            history.size()
        );
    }
    
    return history;
}
```

#### 2. 添加缓存

```java
@Cacheable(value = "chatResponses", key = "#message")
public String getCachedResponse(String message) {
    // 对常见问题使用缓存
}
```

#### 3. 异步处理

```java
@Async
public CompletableFuture<String> processAsync(String message) {
    String result = chatClient.call(message);
    return CompletableFuture.completedFuture(result);
}
```

---

## 🔒 安全性增强

### 前端安全

#### 1. XSS 防护

```javascript
// HTML 转义
escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 使用时
innerHTML = `<div>${this.escapeHtml(userInput)}</div>`;
```

#### 2. CSP 配置

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';">
```

### 后端安全

#### 1. CORS 配置

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/ai/**")
            .allowedOrigins("http://localhost:8080")
            .allowedMethods("POST", "GET")
            .maxAge(3600);
    }
}
```

#### 2. 请求限流

```java
@RateLimiter(name = "chatApi", fallbackMethod = "rateLimitFallback")
public Flux<String> streamChat(String message, String sessionId) {
    // ...
}

public Flux<String> rateLimitFallback(Exception e) {
    return Flux.just("请求过于频繁，请稍后再试");
}
```

#### 3. 输入验证

```java
@Valid
public record ChatRequest(
    @NotBlank(message = "消息不能为空")
    @Size(max = 2000, message = "消息长度不能超过2000字符")
    String message,
    
    @NotBlank(message = "会话ID不能为空")
    String sessionId
) {}
```

---

## 🐛 问题排查

### 常见问题和解决方案

#### 问题 1：消息不显示

**现象**：后端日志正常，但前端不显示

**排查步骤**：
```
1. 打开控制台查看是否有错误
2. 检查是否有 "typeMessage" 调用日志
3. 执行 checkDOM() 查看 DOM 结构
4. 检查 CSS 是否隐藏了元素
```

**解决方案**：
- 确保 `data:` 格式解析正确
- 检查 `.message-bubble` 元素选择器
- 验证 `formatMessage` 函数

#### 问题 2：事件不触发

**现象**：点击按钮无反应

**排查步骤**：
```
1. 检查事件监听器是否绑定
2. 查看控制台是否有点击日志
3. 使用 Elements 标签检查元素
4. 验证 z-index 是否被遮挡
```

**解决方案**：
- 使用事件委托代替直接绑定
- 确保在 DOM 加载后绑定事件
- 检查 `stopPropagation()` 调用

#### 问题 3：样式不生效

**排查步骤**：
```
1. 检查 CSS 选择器优先级
2. 查看是否有冲突的样式
3. 使用 DevTools 检查计算样式
4. 验证 CSS 变量是否定义
```

**解决方案**：
- 提高选择器优先级（增加类名）
- 使用 `!important`（谨慎使用）
- 检查 CSS 变量作用域

---

## 📈 监控和日志

### 添加性能监控

```javascript
// 测量响应时间
const startTime = performance.now();
await this.sendMessage();
const endTime = performance.now();
console.log(`响应时间: ${endTime - startTime}ms`);

// 测量渲染性能
performance.mark('render-start');
this.renderSessionList();
performance.mark('render-end');
performance.measure('render', 'render-start', 'render-end');
console.log(performance.getEntriesByName('render'));
```

### 添加错误追踪

```javascript
window.addEventListener('error', (event) => {
    // 发送错误到监控服务
    fetch('/api/log-error', {
        method: 'POST',
        body: JSON.stringify({
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        })
    });
});
```

---

## 🎓 最佳实践

### 代码组织

1. **单一职责**：每个函数只做一件事
2. **命名规范**：使用描述性的变量和函数名
3. **注释充分**：关键逻辑添加注释
4. **错误处理**：所有异步操作都要 try-catch

### Git 工作流

```bash
# 功能分支
git checkout -b feature/markdown-support

# 提交规范
git commit -m "feat: 添加 Markdown 渲染支持"
git commit -m "fix: 修复消息不显示的问题"
git commit -m "style: 优化消息气泡样式"

# 合并到主分支
git checkout main
git merge feature/markdown-support
```

### 版本管理

使用语义化版本：
```
主版本号.次版本号.修订号

1.0.0 → 初始版本
1.1.0 → 添加新功能
1.1.1 → 修复 bug
2.0.0 → 重大更新
```

---

## 🚢 发布流程

### 1. 准备发布

```bash
# 更新版本号
# 在 pom.xml 中修改 <version>

# 运行测试
mvn test

# 构建生产版本
mvn clean package -Pprod
```

### 2. 生成文档

```bash
# 生成 API 文档
mvn spring-boot:run -Dspring-boot.run.arguments="--springdoc.api-docs.enabled=true"

# 访问 Swagger UI
http://localhost:8080/swagger-ui.html
```

### 3. 部署到服务器

```bash
# 上传 jar 文件
scp target/app.jar user@server:/opt/app/

# SSH 到服务器
ssh user@server

# 运行应用
nohup java -jar /opt/app/app.jar > app.log 2>&1 &
```

---

## 💡 扩展开发

### 添加新的 AI 提供商

#### 步骤 1：添加配置

```properties
spring.ai.anthropic.api-key=your-key
spring.ai.anthropic.model=claude-3
```

#### 步骤 2：创建客户端

```java
@Bean
public ChatClient claudeChatClient(ChatClient.Builder builder) {
    return builder
        .defaultOptions(ChatOptions.builder()
            .model("claude-3-sonnet")
            .build())
        .build();
}
```

#### 步骤 3：修改服务层

```java
public Flux<String> streamChat(String message, String provider) {
    ChatClient client = getClientByProvider(provider);
    return client.prompt().user(message).stream().content();
}
```

### 添加插件系统

```javascript
class ChatPlugin {
    constructor(name, handler) {
        this.name = name;
        this.handler = handler;
    }
    
    execute(message) {
        return this.handler(message);
    }
}

// 注册插件
chatApp.registerPlugin(new ChatPlugin('translator', (msg) => {
    // 翻译插件逻辑
}));
```

---

## 📝 代码规范

### JavaScript 规范

```javascript
// 使用 const/let，避免 var
const API_URL = '/ai/chat';
let messageCount = 0;

// 使用箭头函数
const handleClick = () => { /* ... */ };

// 使用模板字符串
const html = `<div class="${className}">${content}</div>`;

// 使用解构赋值
const { id, name, messages } = session;

// 使用可选链
const preview = session?.messages?.[0]?.content;
```

### Java 规范

```java
// 使用 record 代替 class（Java 17+）
public record ChatRequest(String message, String sessionId) {}

// 使用 Stream API
messages.stream()
    .filter(m -> m.role().equals("user"))
    .map(Message::content)
    .collect(Collectors.toList());

// 使用 Optional 处理 null
Optional.ofNullable(session)
    .map(Session::getName)
    .orElse("默认会话");
```

### CSS 规范

```css
/* 使用 CSS 变量 */
color: var(--text-primary);

/* 避免魔法数字 */
padding: var(--spacing-md);  /* ✅ */
padding: 16px;               /* ❌ */

/* 使用语义化类名 */
.message-bubble { }   /* ✅ */
.blue-box { }        /* ❌ */
```

---

## 🎬 开发实战示例

### 示例 1：添加消息导出功能

```javascript
// 1. 添加导出按钮
<button onclick="chatApp.exportMessages()">导出对话</button>

// 2. 实现导出方法
exportMessages() {
    const session = this.sessions[this.currentSessionId];
    if (!session) return;
    
    let text = `${session.name}\n\n`;
    session.messages.forEach(msg => {
        const role = msg.role === 'user' ? '用户' : 'AI';
        const time = new Date(msg.timestamp).toLocaleString();
        text += `[${time}] ${role}:\n${msg.content}\n\n`;
    });
    
    const blob = new Blob([text], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.name}.txt`;
    a.click();
}
```

### 示例 2：添加语音输入

```javascript
// 1. 检查浏览器支持
if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'zh-CN';
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.userInput.value = transcript;
    };
    
    // 2. 绑定按钮
    voiceBtn.addEventListener('click', () => {
        recognition.start();
    });
}
```

### 示例 3：添加打字机效果

```javascript
typeMessage(messageId, fullContent) {
    const bubbleElement = document.querySelector(
        `[data-message-id="${messageId}"] .message-bubble`
    );
    
    let index = 0;
    const interval = setInterval(() => {
        if (index < fullContent.length) {
            bubbleElement.textContent = fullContent.slice(0, index + 1);
            index++;
            this.scrollToBottom();
        } else {
            clearInterval(interval);
        }
    }, 30);  // 30ms 每个字符
}
```

---

## 🎁 贡献指南

### 提交代码

1. **Fork 项目**
2. **创建功能分支**
3. **编写代码**
4. **编写测试**
5. **提交 Pull Request**

### 代码审查清单

- [ ] 代码遵循项目规范
- [ ] 添加了必要的注释
- [ ] 测试通过
- [ ] 没有 console.log（生产环境）
- [ ] 更新了文档

---

**Happy Coding!** 🚀


# 🔌 Spring AI 聊天助手 - API 接口文档

## 📋 接口概览

| 接口 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 聊天接口 | POST | /ai/chat | 发送消息获取 AI 回复（流式） |

---

## 📡 接口详情

### POST /ai/chat

发送消息并获取 AI 的流式响应。

#### 请求信息

**URL**：`/ai/chat`

**方法**：`POST`

**Content-Type**：`application/json;charset=UTF-8`

**Accept**：`text/event-stream`

#### 请求参数

**Request Body**：

```json
{
  "message": "你好",
  "sessionId": "session_1760963419607_7281meb9m"
}
```

**参数说明**：

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| message | String | ✅ | 用户消息内容 | "你好" |
| sessionId | String | ✅ | 会话唯一标识 | "session_xxx" |

**参数限制**：
- `message`：长度 1-2000 字符
- `sessionId`：格式 `session_时间戳_随机字符串`

#### 响应信息

**Content-Type**：`text/event-stream`

**响应格式**：Server-Sent Events (SSE)

#### 成功响应

**状态码**：`200 OK`

**响应体示例**：

```
data:data: {"content": ""}
data:
data:

data:data: {"content": "你好"}
data:
data:

data:data: {"content": "！"}
data:
data:

data:data: {"content": "很高兴"}
data:
data:

data:data: {"content": "为你"}
data:
data:

data:data: {"content": "提供"}
data:
data:

data:data: {"content": "帮助"}
data:
data:

data:data: {"content": "！"}
data:
data:

data:data: {"content": ""}
data:
data:

data:[DONE]
data:
data:
```

**数据流说明**：

1. **数据块格式**：
   ```
   data:data: {"content": "文本片段"}
   ```
   - 第一个 `data:`：SSE 协议标记（**无空格**）
   - 第二个 `data: `：应用层协议（**有空格**）
   - JSON 对象包含 `content` 字段

2. **空行**：
   ```
   data:
   ```
   - SSE 协议规定的空数据行
   - 用于维持连接

3. **结束标记**：
   ```
   data:[DONE]
   ```
   - 表示流式响应结束
   - 客户端收到后关闭连接

#### 错误响应

**状态码**：`4xx` 或 `5xx`

**错误示例**：

```json
{
  "timestamp": "2025-01-20T10:30:00.000+00:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "API 调用失败",
  "path": "/ai/chat"
}
```

**常见错误码**：

| 状态码 | 说明 | 原因 |
|--------|------|------|
| 400 | Bad Request | 参数错误或缺失 |
| 429 | Too Many Requests | 请求过于频繁 |
| 500 | Internal Server Error | 服务器内部错误 |
| 502 | Bad Gateway | AI API 连接失败 |
| 504 | Gateway Timeout | AI API 响应超时 |

---

## 🔄 请求示例

### cURL

```bash
curl -X POST http://localhost:8080/ai/chat \
  -H "Content-Type: application/json;charset=UTF-8" \
  -H "Accept: text/event-stream" \
  -d '{
    "message": "介绍一下 Spring AI",
    "sessionId": "session_test_123"
  }'
```

### JavaScript (Fetch API)

```javascript
const response = await fetch('http://localhost:8080/ai/chat', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Accept': 'text/event-stream'
    },
    body: JSON.stringify({
        message: '你好',
        sessionId: 'session_xxx'
    })
});

// 处理流式响应
const reader = response.body.getReader();
const decoder = new TextDecoder('utf-8');

while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    console.log('收到数据块:', chunk);
}
```

### Python (requests)

```python
import requests
import json

url = 'http://localhost:8080/ai/chat'
headers = {
    'Content-Type': 'application/json;charset=UTF-8',
    'Accept': 'text/event-stream'
}
data = {
    'message': '你好',
    'sessionId': 'session_python_test'
}

response = requests.post(url, headers=headers, json=data, stream=True)

for line in response.iter_lines():
    if line:
        decoded_line = line.decode('utf-8')
        print(decoded_line)
```

### Java (WebClient)

```java
WebClient client = WebClient.create("http://localhost:8080");

client.post()
    .uri("/ai/chat")
    .contentType(MediaType.APPLICATION_JSON)
    .accept(MediaType.TEXT_EVENT_STREAM)
    .bodyValue(new ChatRequest("你好", "session_java_test"))
    .retrieve()
    .bodyToFlux(String.class)
    .subscribe(chunk -> {
        System.out.println("收到数据块: " + chunk);
    });
```

---

## 🔧 SSE 数据解析

### 前端解析逻辑

```javascript
async function parseSSE(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let fullContent = '';
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // 解码数据块
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // 按行分割
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';  // 保留最后一行（可能不完整）
        
        for (const line of lines) {
            if (!line.trim()) continue;
            
            // 检查 data: 前缀
            if (line.trim().startsWith('data:')) {
                const data = line.trim().slice(5).trimStart();
                
                // 处理双重 data: 前缀
                if (data.startsWith('data:')) {
                    const actualData = data.slice(5).trimStart();
                    
                    // 检查结束标记
                    if (actualData === '[DONE]') {
                        console.log('流式响应完成');
                        return fullContent;
                    }
                    
                    // 解析 JSON
                    if (actualData && actualData.trim()) {
                        try {
                            const parsed = JSON.parse(actualData);
                            if (parsed.content) {
                                fullContent += parsed.content;
                                // 显示内容
                                updateDisplay(fullContent);
                            }
                        } catch (e) {
                            console.error('解析失败:', e);
                        }
                    }
                }
            }
        }
    }
    
    return fullContent;
}
```

### 数据流示意图

```
后端发送：
┌─────────────────────────────────────────┐
│ data:data: {"content": "你"}            │
│ data:                                   │
│ data:                                   │
│ data:data: {"content": "好"}            │
│ data:                                   │
│ data:[DONE]                             │
└─────────────────────────────────────────┘
        ↓
网络传输（分块）
        ↓
前端接收：
┌─────────────────────────────────────────┐
│ Chunk 1: "data:data: {\"content\": \"你\"}\ndata:\n"  │
│ Chunk 2: "data:\ndata:data: {\"content\": \"好\"}\n"  │
│ Chunk 3: "data:\ndata:[DONE]\n"         │
└─────────────────────────────────────────┘
        ↓
解析处理
        ↓
显示结果：
┌─────────────────────────────────────────┐
│ 你好                                    │
└─────────────────────────────────────────┘
```

---

## ⚠️ 注意事项

### 字符编码

**问题**：中文乱码

**解决**：
```java
// 后端配置
@Bean
public FilterRegistrationBean<CharacterEncodingFilter> characterEncodingFilter() {
    FilterRegistrationBean<CharacterEncodingFilter> registration = 
        new FilterRegistrationBean<>();
    CharacterEncodingFilter filter = new CharacterEncodingFilter();
    filter.setEncoding("UTF-8");
    filter.setForceEncoding(true);
    registration.setFilter(filter);
    return registration;
}
```

```javascript
// 前端解码
const decoder = new TextDecoder('utf-8');
const chunk = decoder.decode(value, { stream: true });
```

### CORS 跨域

**开发环境**：
```java
@CrossOrigin(origins = "*")
@PostMapping("/chat")
public Flux<ServerSentEvent<String>> chat(...) { }
```

**生产环境**：
```java
@CrossOrigin(origins = "https://yourdomain.com")
```

### 超时控制

**前端**：
```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 60000);

const response = await fetch('/ai/chat', {
    signal: controller.signal,
    // ...
});

clearTimeout(timeoutId);
```

**后端**：
```java
@Bean
public WebClient webClient() {
    return WebClient.builder()
        .clientConnector(new ReactorClientHttpConnector(
            HttpClient.create()
                .responseTimeout(Duration.ofSeconds(60))
        ))
        .build();
}
```

---

## 🧪 测试用例

### 单元测试

```java
@SpringBootTest
class ChatServiceTest {
    
    @Autowired
    private ChatService chatService;
    
    @Test
    void testStreamChat() {
        StepVerifier.create(
            chatService.streamChat("测试消息", "test-session")
        )
        .expectNextMatches(content -> content.length() > 0)
        .expectComplete()
        .verify(Duration.ofSeconds(30));
    }
}
```

### 集成测试

```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class AIControllerIntegrationTest {
    
    @Autowired
    private WebTestClient webTestClient;
    
    @Test
    void testChatEndpoint() {
        webTestClient.post()
            .uri("/ai/chat")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(new ChatRequest("你好", "test-session"))
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(MediaType.TEXT_EVENT_STREAM);
    }
}
```

---

## 📊 性能指标

### 目标性能

- **首次响应时间**：< 500ms
- **完整响应时间**：< 5s（取决于内容长度）
- **并发支持**：50+ 用户
- **内存占用**：< 512MB

### 监控指标

```java
@Component
public class PerformanceMonitor {
    
    private final MeterRegistry meterRegistry;
    
    public void recordChatLatency(long milliseconds) {
        meterRegistry.timer("chat.latency").record(
            milliseconds, 
            TimeUnit.MILLISECONDS
        );
    }
    
    public void recordActiveUsers(int count) {
        meterRegistry.gauge("chat.active.users", count);
    }
}
```

---

## 🔐 认证和授权（扩展功能）

### 添加 JWT 认证

#### 1. 添加依赖

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
```

#### 2. 创建过滤器

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain chain
    ) throws ServletException, IOException {
        
        String token = extractToken(request);
        if (token != null && validateToken(token)) {
            // 设置认证信息
            SecurityContextHolder.getContext()
                .setAuthentication(getAuthentication(token));
        }
        
        chain.doFilter(request, response);
    }
}
```

#### 3. 前端携带 Token

```javascript
const response = await fetch('/ai/chat', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ message, sessionId })
});
```

---

## 🌍 国际化支持

### 后端配置

```properties
# application.properties
spring.messages.basename=i18n/messages
spring.messages.encoding=UTF-8
```

### 消息文件

**i18n/messages_zh_CN.properties**:
```properties
chat.greeting=你好！很高兴为你提供帮助！
chat.error.network=网络连接失败，请检查网络设置
chat.error.timeout=请求超时，请稍后重试
```

**i18n/messages_en_US.properties**:
```properties
chat.greeting=Hello! How can I help you?
chat.error.network=Network connection failed
chat.error.timeout=Request timeout, please try again later
```

### 前端使用

```javascript
const i18n = {
    'zh-CN': {
        'send': '发送',
        'copy': '复制',
        'like': '点赞'
    },
    'en-US': {
        'send': 'Send',
        'copy': 'Copy',
        'like': 'Like'
    }
};

function t(key) {
    const lang = localStorage.getItem('language') || 'zh-CN';
    return i18n[lang][key] || key;
}
```

---

## 🚀 扩展 API

### 建议的新接口

#### 1. 获取会话列表

```java
@GetMapping("/sessions")
public ResponseEntity<List<Session>> getSessions(
    @RequestParam String userId
) {
    List<Session> sessions = sessionService.getUserSessions(userId);
    return ResponseEntity.ok(sessions);
}
```

#### 2. 删除会话

```java
@DeleteMapping("/sessions/{sessionId}")
public ResponseEntity<Void> deleteSession(
    @PathVariable String sessionId
) {
    sessionService.deleteSession(sessionId);
    return ResponseEntity.noContent().build();
}
```

#### 3. 导出会话

```java
@GetMapping("/sessions/{sessionId}/export")
public ResponseEntity<byte[]> exportSession(
    @PathVariable String sessionId
) {
    byte[] content = sessionService.exportAsJson(sessionId);
    
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, 
                "attachment; filename=session.json")
        .contentType(MediaType.APPLICATION_JSON)
        .body(content);
}
```

#### 4. 消息反馈

```java
@PostMapping("/messages/{messageId}/feedback")
public ResponseEntity<Void> submitFeedback(
    @PathVariable String messageId,
    @RequestBody Feedback feedback
) {
    feedbackService.save(messageId, feedback);
    return ResponseEntity.ok().build();
}
```

---

## 📝 Swagger 集成

### 添加依赖

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.2.0</version>
</dependency>
```

### 添加注解

```java
@RestController
@RequestMapping("/ai")
@Tag(name = "AI 聊天", description = "AI 聊天相关接口")
public class AIController {
    
    @PostMapping("/chat")
    @Operation(summary = "发送消息", description = "发送消息并获取 AI 流式响应")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "成功"),
        @ApiResponse(responseCode = "400", description = "参数错误"),
        @ApiResponse(responseCode = "500", description = "服务器错误")
    })
    public Flux<ServerSentEvent<String>> chat(
        @Parameter(description = "聊天请求") 
        @RequestBody ChatRequest request
    ) {
        // ...
    }
}
```

### 访问 Swagger UI

```
http://localhost:8080/swagger-ui.html
```

---

## 🔍 请求/响应详解

### Request Body 结构

```typescript
interface ChatRequest {
    message: string;      // 用户消息，1-2000字符
    sessionId: string;    // 会话ID，格式: session_{timestamp}_{random}
}
```

### SSE Event 结构

```typescript
interface SSEEvent {
    event?: string;       // 事件类型（可选）
    data: string;         // 数据内容
    id?: string;          // 事件ID（可选）
    retry?: number;       // 重连时间（可选）
}
```

### Content JSON 结构

```typescript
interface ContentChunk {
    content: string;      // 文本片段
    role?: string;        // 角色（可选）
    finish_reason?: string;  // 结束原因（可选）
}
```

---

## 🎯 最佳实践

### 1. 错误处理

**后端**：
```java
@ExceptionHandler(Exception.class)
public ResponseEntity<ErrorResponse> handleException(Exception e) {
    log.error("处理请求时发生错误", e);
    
    ErrorResponse error = new ErrorResponse(
        LocalDateTime.now(),
        500,
        "Internal Server Error",
        e.getMessage()
    );
    
    return ResponseEntity.status(500).body(error);
}
```

**前端**：
```javascript
try {
    await this.sendMessage();
} catch (error) {
    if (error.name === 'AbortError') {
        this.showToast('请求超时', 'error');
    } else if (error.message.includes('Failed to fetch')) {
        this.showToast('网络连接失败', 'error');
    } else {
        this.showToast('发送失败: ' + error.message, 'error');
    }
}
```

### 2. 日志规范

**级别使用**：
```java
log.debug("调试信息: {}", debugInfo);      // 开发环境
log.info("业务信息: {}", businessInfo);     // 正常业务
log.warn("警告信息: {}", warningInfo);      // 潜在问题
log.error("错误信息: {}", error);           // 错误异常
```

**日志内容**：
- ✅ 包含关键业务信息
- ✅ 包含时间戳
- ✅ 包含用户/会话标识
- ❌ 不包含敏感信息（密码、token）

### 3. 配置管理

```java
@ConfigurationProperties(prefix = "chat")
public class ChatProperties {
    private int maxHistorySize = 20;
    private int maxMessageLength = 2000;
    private int timeout = 60000;
    
    // getters and setters
}
```

```properties
chat.max-history-size=20
chat.max-message-length=2000
chat.timeout=60000
```

---

## 🔄 版本兼容性

### Spring AI 版本

| Spring AI | Spring Boot | Java |
|-----------|-------------|------|
| 1.0.0-M1  | 3.2.x       | 17+  |
| 1.0.0-M2  | 3.2.x       | 17+  |
| 1.0.0     | 3.2.x       | 17+  |

### 浏览器兼容性

| 浏览器 | 最低版本 | 说明 |
|--------|----------|------|
| Chrome | 90+ | 完全支持 |
| Firefox | 88+ | 完全支持 |
| Safari | 14+ | 需要前缀 |
| Edge | 90+ | 完全支持 |

**关键特性兼容性**：
- `TextDecoder`：所有现代浏览器
- `Fetch API`：所有现代浏览器
- `CSS backdrop-filter`：Chrome 76+, Safari 9+
- `CSS Variables`：所有现代浏览器

---

## 📞 技术支持

### 问题排查流程

```
1. 查看日志
   ↓
2. 检查配置
   ↓
3. 验证网络
   ↓
4. 测试 API
   ↓
5. 联系支持
```

### 提交 Issue 模板

```markdown
**环境信息**
- OS: Windows 10
- Java: 17.0.5
- Spring Boot: 3.2.0
- 浏览器: Chrome 120

**问题描述**
清晰描述遇到的问题

**重现步骤**
1. 打开应用
2. 发送消息
3. 观察到...

**预期行为**
应该显示 AI 回复

**实际行为**
没有显示任何内容

**日志信息**
```
[粘贴相关日志]
```

**截图**
[如果适用，添加截图]
```

---

**技术文档持续更新中...** 📚


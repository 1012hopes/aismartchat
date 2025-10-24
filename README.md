# Spring AI Chat - ChatGPT 风格聊天应用

一个基于 Spring Boot + Vue 3 的现代化 AI 聊天应用，采用 ChatGPT 风格的精美界面设计。

## ✨ 特性

### 前端
- 🎨 **ChatGPT 风格界面** - 精美的 UI 设计
- 🌓 **深色/浅色主题** - 自动保存主题偏好
- 💬 **流式对话** - 实时显示 AI 回复
- 📱 **响应式设计** - 完美适配移动端
- ⚡ **Vue 3 + Vite** - 现代化技术栈
- 🎭 **流畅动画** - 精心设计的过渡效果

### 后端
- 🚀 **Spring Boot 3.2** - 企业级Java框架
- 🤖 **Spring AI** - 集成 DeepSeek AI
- 💾 **MySQL 数据库** - 持久化存储
- 🔄 **流式响应** - SSE 实时推送
- 🎯 **RESTful API** - 标准化接口设计

## 🏗️ 项目结构

```
springai项目演示/
├── src/main/                    # 后端代码
│   ├── java/.../springaichat/
│   │   ├── config/             # 配置类
│   │   ├── controller/         # 控制器
│   │   ├── entity/             # 实体类
│   │   ├── repository/         # 数据访问层
│   │   └── service/            # 业务逻辑
│   └── resources/
│       └── application.properties
│
├── frontend-vue/                # 前端代码 (Vue 3)
│   ├── src/
│   │   ├── components/         # 组件
│   │   ├── stores/             # 状态管理
│   │   └── styles/             # 样式文件
│   ├── package.json
│   ├── vite.config.js
│   └── 启动.bat
│
├── pom.xml                      # Maven 配置
├── DATABASE_UPGRADE.md          # 数据库说明
├── MYSQL_SETUP.md               # MySQL 配置指南
└── README.md                    # 本文件
```

## 🚀 快速开始

### 前置要求

#### 后端
- JDK 17+
- Maven 3.6+
- MySQL 8.0+

#### 前端
- Node.js 16+
- npm 或 pnpm

### 1. 配置数据库

创建 MySQL 数据库：

```sql
CREATE DATABASE springai_chat 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

修改 `src/main/resources/application.properties`：

```properties
spring.datasource.password=your_mysql_password
```

### 2. 启动后端

```bash
# 方式1: Maven
mvn spring-boot:run

# 方式2: IDE
运行 SpringAiChatApplication.java
```

后端将启动在 http://localhost:8080

### 3. 启动前端

#### Windows (推荐)
双击运行 `frontend-vue/启动.bat`

#### 命令行
```bash
cd frontend-vue
npm install
npm run dev
```

前端将启动在 http://localhost:3000

## 📖 使用说明

1. 打开浏览器访问 http://localhost:3000
2. 点击左侧"新对话"按钮创建会话
3. 在底部输入框输入消息
4. 按 Enter 发送，Shift+Enter 换行
5. 查看 AI 的流式回复

## 🎯 功能列表

### 会话管理
- ✅ 创建新对话
- ✅ 切换会话
- ✅ 重命名会话
- ✅ 删除会话
- ✅ 清空对话历史

### 聊天功能
- ✅ 发送消息
- ✅ 接收流式 AI 回复
- ✅ 复制消息
- ✅ 消息状态显示
- ✅ 错误处理

### UI/UX
- ✅ ChatGPT 风格界面
- ✅ 深色/浅色主题
- ✅ 打字机动画效果
- ✅ 侧边栏折叠
- ✅ 响应式布局
- ✅ 流畅的过渡动画

## 🎨 界面预览

### 浅色主题
- 清爽简洁的白色背景
- 柔和的灰色边框
- 绿色强调色

### 深色主题
- 护眼的深色背景
- 优雅的配色方案
- 降低视觉疲劳

## 🔧 技术栈

### 前端
- **框架**: Vue 3.4
- **构建工具**: Vite 5
- **状态管理**: Pinia 2
- **样式**: SCSS
- **HTTP**: Fetch API

### 后端
- **框架**: Spring Boot 3.2.5
- **AI**: Spring AI 1.0.0-M2
- **ORM**: Spring Data JPA
- **数据库**: MySQL 8.0
- **连接池**: HikariCP

## 📦 API 接口

### 聊天
- `POST /ai/chat` - 发送消息（流式）

### 会话管理
- `GET /ai/sessions` - 获取会话列表
- `POST /ai/sessions` - 创建会话
- `DELETE /ai/sessions/{id}` - 删除会话
- `PUT /ai/sessions/{id}/rename` - 重命名会话
- `GET /ai/sessions/{id}/messages` - 获取消息
- `DELETE /ai/history/{id}` - 清空历史

## 🎓 开发说明

### 添加新功能

1. **后端**: 在相应的 Controller/Service 中添加
2. **前端**: 在 `stores/chat.js` 中添加状态和方法
3. **UI**: 在 `ChatView.vue` 中添加界面

### 修改样式

主要样式文件：
- `styles/main.scss` - 全局样式和主题
- `styles/chat.scss` - 聊天界面样式

### 调试技巧

**前端调试**:
- 浏览器 DevTools (F12)
- Vue DevTools 扩展

**后端调试**:
- IDE 断点调试
- 查看控制台日志

## 🔐 配置说明

### DeepSeek API

在 `application.properties` 中配置：

```properties
spring.ai.openai.api-key=your-deepseek-api-key
spring.ai.openai.base-url=https://api.deepseek.com
```

### CORS 配置

已配置允许跨域请求，见 `CorsConfig.java`

## 📝 常见问题

### 前端无法连接后端
1. 确认后端已启动在 8080 端口
2. 检查 `vite.config.js` 中的代理配置

### 数据库连接失败
1. 确认 MySQL 服务已启动
2. 检查用户名和密码
3. 确认数据库已创建

### 消息发送失败
1. 检查 DeepSeek API 密钥
2. 检查网络连接
3. 查看后端日志

## 📚 相关文档

- [数据库配置指南](MYSQL_SETUP.md)
- [数据库升级说明](DATABASE_UPGRADE.md)
- [Vue 前端文档](frontend-vue/README.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- Spring AI
- Vue.js
- DeepSeek AI
- ChatGPT (界面设计灵感)

---

**享受与 AI 的对话吧！** 🚀

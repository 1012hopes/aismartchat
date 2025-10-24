# 数据库持久化升级说明

## 概述

本次升级为Spring AI Chat项目添加了数据库持久化功能，解决了之前"不能多个对话"和"对话记录保存"的问题。

**当前使用数据库：MySQL**（推荐用于生产环境）

## 主要改进

### 1. **持久化存储**
- ✅ 使用MySQL数据库持久化存储所有对话数据
- ✅ 服务器重启后对话记录不会丢失
- ✅ 支持高并发和大数据量
- ✅ 数据库名称：`springai_chat`

### 2. **多会话支持**
- ✅ 支持创建多个独立的对话会话
- ✅ 每个会话有独立的ID、名称和消息历史
- ✅ 会话可以重命名、删除、清空

### 3. **完整的会话管理API**
- `GET /ai/sessions` - 获取所有会话列表
- `POST /ai/sessions` - 创建新会话
- `DELETE /ai/sessions/{sessionId}` - 删除会话
- `PUT /ai/sessions/{sessionId}/rename` - 重命名会话
- `GET /ai/sessions/{sessionId}/messages` - 获取会话的所有消息
- `DELETE /ai/history/{sessionId}` - 清空会话历史

## 新增文件

### 实体类 (Entity)
1. `src/main/java/com/example/springaichat/entity/ChatSession.java`
   - 会话实体，包含ID、名称、创建时间、更新时间
   
2. `src/main/java/com/example/springaichat/entity/ChatMessage.java`
   - 消息实体，包含ID、角色、内容、时间戳、状态

### 数据访问层 (Repository)
1. `src/main/java/com/example/springaichat/repository/ChatSessionRepository.java`
   - 会话数据访问接口
   
2. `src/main/java/com/example/springaichat/repository/ChatMessageRepository.java`
   - 消息数据访问接口

## 修改的文件

### 后端
1. **pom.xml**
   - 添加 Spring Data JPA 依赖
   - 添加 MySQL Connector 驱动

2. **application.properties**
   - 添加MySQL数据库配置
   - 配置连接池参数

3. **ChatService.java**
   - 移除内存存储（ConcurrentHashMap）
   - 使用Repository保存和读取数据
   - 添加会话管理方法

4. **AIController.java**
   - 添加会话管理API接口
   - 添加SessionRequest和RenameRequest DTO

### 前端
1. **chat.js**
   - 修改从后端API加载会话数据
   - 所有会话操作同步到服务器
   - 消息历史从服务器加载

## 如何使用

### 1. 配置MySQL数据库

**详细配置步骤请参考：[MYSQL_SETUP.md](MYSQL_SETUP.md)**

快速步骤：
```sql
-- 登录MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE springai_chat DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 退出
EXIT;
```

### 2. 修改数据库连接配置

编辑 `src/main/resources/application.properties`：
```properties
spring.datasource.username=root
spring.datasource.password=your_mysql_password  # 修改为您的MySQL密码
```

### 3. 重新构建项目

```bash
# Windows PowerShell
mvn clean install

# 或者在IDE中：Maven -> Reload Project
```

### 4. 启动应用

```bash
mvn spring-boot:run
```

首次启动时，Hibernate会自动创建表结构。

### 5. 访问应用

- **聊天界面**: http://localhost:8080

## 数据库架构

### CHAT_SESSIONS 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(100) | 会话ID（主键） |
| name | VARCHAR(200) | 会话名称 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 最后更新时间 |

### CHAT_MESSAGES 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(100) | 消息ID（主键） |
| session_id | VARCHAR(100) | 所属会话ID（外键） |
| role | VARCHAR(20) | 角色（user/assistant） |
| content | TEXT | 消息内容 |
| timestamp | TIMESTAMP | 时间戳 |
| status | VARCHAR(20) | 状态（sending/success/error） |

## 功能特性

### ✅ 已实现
- [x] 多会话管理
- [x] 对话历史持久化
- [x] 会话创建/删除/重命名
- [x] 消息持久化
- [x] 流式响应支持
- [x] 上下文记忆（每个会话独立）
- [x] 服务器重启后数据保留

### 🚀 数据流程

1. **创建会话**: 前端 → POST /ai/sessions → 数据库
2. **发送消息**: 前端 → POST /ai/chat → 保存到数据库 → AI响应 → 保存到数据库
3. **加载会话**: 前端 → GET /ai/sessions → 从数据库读取
4. **加载消息**: 前端 → GET /ai/sessions/{id}/messages → 从数据库读取

## 数据迁移

如果您之前使用localStorage存储了对话数据，这些数据不会自动迁移到数据库。启动升级后的应用时：
- 旧的localStorage数据仍然保留在浏览器中
- 新创建的会话将保存到MySQL数据库
- 建议清除浏览器localStorage以避免混淆

## MySQL数据库查看

您可以使用以下工具查看和管理MySQL数据：
- **MySQL Workbench** (官方GUI工具)
- **Navicat** (第三方商业工具)
- **DBeaver** (免费开源工具)
- **命令行**：`mysql -u root -p`

## 故障排查

### 问题1: 启动失败 - 找不到JPA相关类
**解决方案**: 执行 `mvn clean install` 重新下载依赖

### 问题2: 数据库连接失败
**解决方案**: 
- 确认MySQL服务正在运行
- 检查 `application.properties` 中的用户名和密码
- 确认数据库 `springai_chat` 已创建
- 详见 [MYSQL_SETUP.md](MYSQL_SETUP.md)

### 问题3: 表不存在错误
**解决方案**: 
- 确认 `spring.jpa.hibernate.ddl-auto=update` 配置正确
- 删除数据库重新创建：`DROP DATABASE springai_chat; CREATE DATABASE springai_chat;`
- 重启应用让Hibernate自动创建表

### 问题4: 前端加载会话失败
**解决方案**: 打开浏览器控制台检查网络请求，确认后端API正常响应

### 问题5: 中文乱码
**解决方案**:
- 确认数据库字符集为 `utf8mb4`
- 检查连接URL包含 `useUnicode=true&characterEncoding=utf8`

## 性能优化

1. **懒加载**: 会话列表只加载元数据，消息按需加载
2. **上下文限制**: 只使用最近20条对话作为AI上下文
3. **事务管理**: 使用Spring事务确保数据一致性
4. **索引优化**: 消息表按session_id和timestamp建立索引

## 备份和恢复

### 备份MySQL数据库
```bash
# 使用mysqldump备份
mysqldump -u root -p springai_chat > springai_chat_backup.sql

# 带时间戳的备份
mysqldump -u root -p springai_chat > springai_chat_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 恢复MySQL数据库
```bash
# 停止应用
# 恢复数据
mysql -u root -p springai_chat < springai_chat_backup.sql
# 重启应用
```

## 技术栈

- **Spring Boot 3.2.5**
- **Spring Data JPA**
- **MySQL 8.0+** (推荐)
- **Hibernate** (ORM)
- **Jakarta Persistence API**
- **HikariCP** (连接池)

## 后续可扩展功能

- [x] 使用MySQL生产数据库 ✅
- [ ] 添加用户认证和多用户支持
- [ ] 会话导出/导入功能
- [ ] 消息搜索功能
- [ ] 会话分组/标签功能
- [ ] 消息编辑功能
- [ ] 主从复制和读写分离
- [ ] 数据库分表分库


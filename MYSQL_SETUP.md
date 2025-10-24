# MySQL数据库配置说明

## 前置条件

1. ✅ 已安装MySQL 8.0或更高版本
2. ✅ MySQL服务正在运行
3. ✅ 知道MySQL的root密码

## 快速设置步骤

### 1. 创建数据库

登录MySQL并创建数据库：

```sql
-- 使用命令行登录MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE springai_chat DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 验证数据库创建成功
SHOW DATABASES;

-- 退出
EXIT;
```

### 2. 配置数据库连接

编辑 `src/main/resources/application.properties`，修改以下配置：

```properties
# MySQL数据库连接URL
spring.datasource.url=jdbc:mysql://localhost:3306/springai_chat?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true

# MySQL用户名
spring.datasource.username=root

# MySQL密码（请修改为您的实际密码）
spring.datasource.password=your_mysql_password
```

**重要**：将 `your_mysql_password` 替换为您的MySQL root密码。

### 3. 重新构建项目

```bash
# 清理并重新下载依赖
mvn clean install
```

### 4. 启动应用

```bash
mvn spring-boot:run
```

首次启动时，Hibernate会自动创建所需的表结构。

## 数据库表结构

应用启动后会自动创建以下表：

### CHAT_SESSIONS 表
```sql
CREATE TABLE chat_sessions (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### CHAT_MESSAGES 表
```sql
CREATE TABLE chat_messages (
    id VARCHAR(100) PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    status VARCHAR(20),
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
    INDEX idx_session_timestamp (session_id, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 验证安装

### 方法1：查看应用日志
启动应用后，查看控制台输出，应该看到类似信息：
```
Hibernate: create table chat_sessions ...
Hibernate: create table chat_messages ...
```

### 方法2：直接查询数据库
```sql
mysql -u root -p

USE springai_chat;

SHOW TABLES;
-- 应该显示：chat_messages, chat_sessions

DESCRIBE chat_sessions;
DESCRIBE chat_messages;

EXIT;
```

### 方法3：使用聊天应用
1. 访问 http://localhost:8080
2. 创建新对话并发送消息
3. 在MySQL中查询数据：
```sql
SELECT * FROM chat_sessions;
SELECT * FROM chat_messages;
```

## 高级配置

### 创建专用数据库用户（推荐）

出于安全考虑，建议创建专用用户而不是使用root：

```sql
-- 创建新用户
CREATE USER 'springai_user'@'localhost' IDENTIFIED BY 'strong_password_here';

-- 授予权限
GRANT ALL PRIVILEGES ON springai_chat.* TO 'springai_user'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

然后修改 `application.properties`：
```properties
spring.datasource.username=springai_user
spring.datasource.password=strong_password_here
```

### 远程数据库连接

如果MySQL在远程服务器上：

```properties
# 修改localhost为实际的服务器地址
spring.datasource.url=jdbc:mysql://192.168.1.100:3306/springai_chat?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
```

### 连接池优化

根据您的应用负载调整连接池大小：

```properties
# 最小空闲连接数
spring.datasource.hikari.minimum-idle=5

# 最大连接数
spring.datasource.hikari.maximum-pool-size=20

# 空闲超时（毫秒）
spring.datasource.hikari.idle-timeout=300000

# 连接超时（毫秒）
spring.datasource.hikari.connection-timeout=20000

# 连接最大生命周期（毫秒）
spring.datasource.hikari.max-lifetime=1200000
```

## 常见问题

### 问题1: 连接被拒绝
```
com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure
```

**解决方案**:
- 确认MySQL服务正在运行：`systemctl status mysql` (Linux) 或检查Windows服务
- 检查端口3306是否开放
- 验证连接URL中的主机名和端口

### 问题2: 认证失败
```
java.sql.SQLException: Access denied for user 'root'@'localhost'
```

**解决方案**:
- 验证用户名和密码是否正确
- 尝试在命令行登录MySQL测试：`mysql -u root -p`

### 问题3: 数据库不存在
```
java.sql.SQLSyntaxErrorException: Unknown database 'springai_chat'
```

**解决方案**:
```sql
CREATE DATABASE springai_chat DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 问题4: 时区错误
```
The server time zone value 'XXX' is unrecognized
```

**解决方案**:
在连接URL中添加 `serverTimezone=Asia/Shanghai`（已包含在配置中）

### 问题5: 中文乱码
**解决方案**:
- 确认数据库使用utf8mb4字符集
- 检查连接URL中包含 `useUnicode=true&characterEncoding=utf8`

## 数据备份

### 备份数据库
```bash
mysqldump -u root -p springai_chat > springai_chat_backup.sql
```

### 恢复数据库
```bash
mysql -u root -p springai_chat < springai_chat_backup.sql
```

### 定时备份（Linux/Mac）
添加到crontab：
```bash
# 每天凌晨2点备份
0 2 * * * mysqldump -u root -p'your_password' springai_chat > /backup/springai_chat_$(date +\%Y\%m\%d).sql
```

## 性能监控

### 查看表大小
```sql
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'springai_chat'
ORDER BY (data_length + index_length) DESC;
```

### 查看连接数
```sql
SHOW PROCESSLIST;
```

### 优化表
```sql
OPTIMIZE TABLE chat_sessions;
OPTIMIZE TABLE chat_messages;
```

## 安全建议

1. ✅ 不要在生产环境使用root用户
2. ✅ 使用强密码
3. ✅ 定期备份数据
4. ✅ 限制远程访问
5. ✅ 启用SSL连接（生产环境）
6. ✅ 定期更新MySQL版本

## MySQL版本兼容性

- ✅ MySQL 8.0+ (推荐)
- ✅ MySQL 5.7+
- ✅ MariaDB 10.3+

## 从H2迁移到MySQL

如果之前使用H2数据库，数据不会自动迁移。建议：
1. 导出H2数据（如果需要）
2. 清理并重启应用
3. MySQL会自动创建新表结构

## 技术支持

如遇到问题：
1. 检查MySQL错误日志：`/var/log/mysql/error.log` (Linux)
2. 查看应用日志中的详细错误信息
3. 验证MySQL配置是否正确


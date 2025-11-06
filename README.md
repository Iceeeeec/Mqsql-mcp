# MCP MySQL Server

[![npm version](https://img.shields.io/npm/v/@shuwu/mcp-mysql-server.svg)](https://www.npmjs.com/package/@shuwu/mcp-mysql-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Model Context Protocol (MCP) server for MySQL - 让 AI 助手（Cursor、Claude Desktop）能够安全地查询 MySQL 数据库。

[English](#english) | [中文](#chinese)

---

## <a name="chinese"></a>🇨🇳 中文文档

### 功能特性

- ✅ 支持 SQL 查询（SELECT、SHOW、DESCRIBE）
- ✅ 列出数据库所有表
- ✅ 查看表结构
- ✅ 安全检查（禁止 DDL 操作）
- ✅ 可选的写操作控制
- ✅ 连接池管理
- ✅ 环境变量配置

### 快速开始

#### 方法 1：通过 npm 全局安装（推荐）

```bash
# 全局安装
npm install -g @shuwu/mcp-mysql-server

# 或使用 npx（无需安装）
npx @shuwu/mcp-mysql-server
```

#### 方法 2：本地开发安装

```bash
# 克隆或下载项目
git clone https://github.com/your-username/mcp-mysql-server.git
cd mcp-mysql-server

# 安装依赖
npm install
```

### 配置数据库

创建 `.env` 文件：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
ALLOW_WRITE=false
```

### 测试运行

```bash
npm start
```

看到以下输出表示成功：
```
[MCP MySQL] 连接池已创建: localhost:3306/your_database
[MCP MySQL] 数据库连接成功 ✓
[MCP MySQL] 服务器已启动，等待请求...
[MCP MySQL] 写操作: 禁止
```

## 配置 Cursor AI

### 方法 1：使用全局安装的包（推荐）

如果你通过 `npm install -g` 全局安装了包，配置更简单：

**Windows 配置：**

编辑配置文件：`%APPDATA%\Cursor\User\globalStorage\settings.json`

```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["@shuwu/mcp-mysql-server"],
      "env": {
        "DB_HOST": "localhost",
        "DB_PORT": "3306",
        "DB_USER": "root",
        "DB_PASSWORD": "your_password",
        "DB_NAME": "your_database",
        "ALLOW_WRITE": "false"
      }
    }
  }
}
```

**macOS/Linux 配置：**

编辑配置文件：`~/.config/Cursor/User/globalStorage/settings.json`

```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["@shuwu/mcp-mysql-server"],
      "env": {
        "DB_HOST": "localhost",
        "DB_PORT": "3306",
        "DB_USER": "root",
        "DB_PASSWORD": "your_password",
        "DB_NAME": "your_database",
        "ALLOW_WRITE": "false"
      }
    }
  }
}
```

### 方法 2：使用本地项目路径

如果你是本地开发安装，需要指定完整路径：

**Windows 配置：**

```json
{
  "mcpServers": {
    "mysql": {
      "command": "node",
      "args": ["C:\\path\\to\\mcp-mysql-server\\index.js"],
      "env": {
        "DB_HOST": "localhost",
        "DB_PORT": "3306",
        "DB_USER": "root",
        "DB_PASSWORD": "your_password",
        "DB_NAME": "your_database"
      }
    }
  }
}
```

**macOS/Linux 配置：**

```json
{
  "mcpServers": {
    "mysql": {
      "command": "node",
      "args": ["/path/to/mcp-mysql-server/index.js"],
      "env": {
        "DB_HOST": "localhost",
        "DB_USER": "root",
        "DB_PASSWORD": "your_password",
        "DB_NAME": "your_database"
      }
    }
  }
}
```

### 重启 Cursor

配置完成后，重启 Cursor 使配置生效。

## 使用示例

配置完成后，在 Cursor 中可以直接询问 AI：

```
# 查询用户表
查询 sys_user 表的前 10 条数据

# 列出所有表
数据库有哪些表？

# 查看表结构
ai_character 表的结构是什么？

# 复杂查询
查询最近 7 天创建的角色，并按创建时间倒序排列
```

AI 助手会自动调用 MCP 服务查询数据库并返回结果。

## 可用工具

MCP 服务器提供以下工具：

### 1. `query` - 执行 SQL 查询

```javascript
{
  "name": "query",
  "arguments": {
    "sql": "SELECT * FROM sys_user LIMIT 10"
  }
}
```

### 2. `list_tables` - 列出所有表

```javascript
{
  "name": "list_tables"
}
```

### 3. `describe_table` - 查看表结构

```javascript
{
  "name": "describe_table",
  "arguments": {
    "table": "ai_character"
  }
}
```

## 安全说明

### 默认安全策略

- ✅ 允许：SELECT、SHOW、DESCRIBE（只读查询）
- ❌ 禁止：INSERT、UPDATE、DELETE（需手动开启）
- ❌ 禁止：CREATE、DROP、ALTER、TRUNCATE（DDL 操作）

### 开启写操作

如需允许 AI 执行写操作（谨慎使用），修改 `.env`：

```env
ALLOW_WRITE=true
```

### 推荐：创建只读用户

建议为 MCP 服务创建专用的只读数据库用户：

```sql
-- 创建只读用户
CREATE USER 'shuwu_readonly'@'localhost' IDENTIFIED BY 'your_password';

-- 授予只读权限
GRANT SELECT ON shuwu.* TO 'shuwu_readonly'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;
```

然后修改 `.env`：
```env
DB_USER=shuwu_readonly
DB_PASSWORD=your_password
```

## 故障排查

### 1. 连接失败

检查：
- MySQL 是否正在运行：`mysql -u root -p`
- `.env` 中的用户名密码是否正确
- 防火墙是否阻止连接

### 2. Cursor 无法识别

检查：
- 配置文件路径是否正确（使用绝对路径）
- Windows 路径使用双反斜杠 `\\`
- 是否重启了 Cursor

### 3. 权限错误

检查：
- 数据库用户是否有足够权限
- 是否需要开启 `ALLOW_WRITE`

## 开发模式

使用自动重载（修改代码自动重启）：

```bash
npm run dev
```

## 技术栈

- **Node.js**: 22+
- **@modelcontextprotocol/sdk**: MCP 协议实现
- **mysql2**: MySQL 数据库驱动
- **dotenv**: 环境变量管理

## 相关链接

- [Model Context Protocol 官方文档](https://modelcontextprotocol.io/)
- [MCP SDK GitHub](https://github.com/modelcontextprotocol/typescript-sdk)
- [MySQL2 文档](https://github.com/sidorares/node-mysql2)

## 许可证

MIT License

---

## <a name="english"></a>🇬🇧 English Documentation

### Features

- ✅ Support SQL queries (SELECT, SHOW, DESCRIBE)
- ✅ List all database tables
- ✅ View table structure
- ✅ Safety checks (prohibit DDL operations)
- ✅ Optional write operation control
- ✅ Connection pool management
- ✅ Environment variable configuration

### Quick Start

#### Method 1: Install via npm (Recommended)

```bash
# Global installation
npm install -g @shuwu/mcp-mysql-server

# Or use npx (no installation needed)
npx @shuwu/mcp-mysql-server
```

#### Method 2: Local Development

```bash
git clone https://github.com/your-username/mcp-mysql-server.git
cd mcp-mysql-server
npm install
```

### Database Configuration

Create a `.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
ALLOW_WRITE=false
```

### Configure Cursor AI

Edit configuration file and add:

**Windows:** `%APPDATA%\Cursor\User\globalStorage\settings.json`  
**macOS/Linux:** `~/.config/Cursor/User/globalStorage/settings.json`

```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["@shuwu/mcp-mysql-server"],
      "env": {
        "DB_HOST": "localhost",
        "DB_PORT": "3306",
        "DB_USER": "root",
        "DB_PASSWORD": "your_password",
        "DB_NAME": "your_database",
        "ALLOW_WRITE": "false"
      }
    }
  }
}
```

Restart Cursor after configuration.

### Usage Examples

After configuration, you can ask AI directly in Cursor:

```
# Query user table
Show me the first 10 rows from sys_user table

# List all tables
What tables are in the database?

# View table structure
What's the structure of the users table?

# Complex query
Find all active users created in the last 7 days
```

---

**Powered by Model Context Protocol**  
Built with ❤️ by shuwu Team


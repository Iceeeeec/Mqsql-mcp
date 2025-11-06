# 配置 Cursor AI 使用 MCP MySQL 服务

## ✅ 前置条件已完成

- [x] Node.js 环境（版本 22）
- [x] MySQL 数据库运行中
- [x] MCP 服务器测试通过
- [x] 依赖包已安装

## 📋 配置步骤

### Windows 系统

#### 方法 1：通过 Cursor 设置界面（推荐）

1. **打开 Cursor 设置**
   - 按 `Ctrl + Shift + P` 打开命令面板
   - 输入 `Preferences: Open User Settings (JSON)`
   - 或直接按 `Ctrl + ,` 进入设置，搜索 "mcp"

2. **添加 MCP 配置**
   
   在设置 JSON 中添加（如果文件为空，复制整个配置）：
   
   ```json
   {
     "mcpServers": {
       "shuwu-mysql": {
         "command": "node",
         "args": [
           "H:\\shuwu-virtual-human\\mcp-mysql-server\\index.js"
         ],
         "env": {
           "NODE_ENV": "production"
         }
       }
     }
   }
   ```
   
   **⚠️ 注意**：如果您的项目路径不是 `H:\shuwu-virtual-human`，请修改上面的路径。

3. **保存并重启 Cursor**
   - 保存配置文件（`Ctrl + S`）
   - 完全退出 Cursor（不是只关闭窗口）
   - 重新打开 Cursor

#### 方法 2：直接编辑配置文件

1. **找到配置文件**
   
   路径：`%APPDATA%\Cursor\User\globalStorage\settings.json`
   
   完整路径通常是：
   ```
   C:\Users\你的用户名\AppData\Roaming\Cursor\User\globalStorage\settings.json
   ```

2. **编辑配置**
   
   将 `cursor-config.json` 的内容复制到上述文件中

3. **重启 Cursor**

### macOS 系统

配置文件路径：`~/.config/Cursor/User/globalStorage/settings.json`

配置内容（注意路径格式不同）：
```json
{
  "mcpServers": {
    "shuwu-mysql": {
      "command": "node",
      "args": [
        "/Users/你的用户名/shuwu-virtual-human/mcp-mysql-server/index.js"
      ]
    }
  }
}
```

### Linux 系统

配置文件路径：`~/.config/Cursor/User/globalStorage/settings.json`

配置内容同 macOS。

## 🧪 验证配置

### 1. 检查 MCP 服务状态

重启 Cursor 后，打开开发者工具：
- 按 `Ctrl + Shift + I` (Windows) 或 `Cmd + Option + I` (macOS)
- 切换到 Console 标签
- 查找类似这样的日志：
  ```
  [MCP] Connected to server: shuwu-mysql
  ```

### 2. 测试查询

在 Cursor 的聊天窗口中，向 AI 提问：

```
列出 shuwu 数据库中的所有表
```

或者：

```
查询 sys_user 表的前 5 条数据
```

如果配置成功，AI 会自动调用 MCP 服务查询数据库并返回结果。

## 📝 使用示例

配置完成后，您可以直接向 AI 询问数据库相关的问题：

### 基础查询

```
# 列出所有表
数据库有哪些表？

# 查看表结构
ai_character 表的结构是什么？

# 简单查询
查询所有用户的用户名和邮箱

# 条件查询
查询状态为正常的角色列表
```

### 复杂查询

```
# 统计查询
统计每个部门的用户数量

# 关联查询
查询用户及其所属部门信息

# 时间范围查询
查询最近 7 天创建的角色

# 排序和分页
查询最热门的 10 个角色，按点赞数倒序
```

### 业务分析

```
# 数据分析
分析用户注册趋势

# 异常检测
找出没有关联部门的用户

# 数据校验
检查是否有重复的用户名
```

## 🔧 故障排查

### 问题 1：Cursor 提示找不到 MCP 服务

**解决方法**：
1. 检查配置文件路径是否正确（使用绝对路径）
2. Windows 路径使用双反斜杠 `\\`
3. 确保 Node.js 在系统 PATH 中
4. 重启 Cursor（完全退出后重新打开）

### 问题 2：AI 不会调用数据库查询

**可能原因**：
- MCP 服务未正确启动
- 配置文件格式错误（JSON 语法）
- 需要更明确的提问（例如："查询数据库" 而不是 "看一下数据"）

**解决方法**：
1. 在终端手动运行测试：
   ```bash
   cd mcp-mysql-server
   node test-connection.js
   ```
2. 检查 Cursor 开发者工具的 Console 是否有错误日志
3. 使用更明确的提问方式

### 问题 3：数据库连接失败

**解决方法**：
1. 确认 MySQL 正在运行
2. 检查 `.env` 文件中的数据库配置
3. 确认数据库用户权限

### 问题 4：权限错误

**解决方法**：
- 查看 `.env` 中的 `ALLOW_WRITE` 设置
- 检查数据库用户是否有足够权限

## 🔒 安全提示

### 默认安全策略

- ✅ **允许**：SELECT、SHOW、DESCRIBE（只读查询）
- ❌ **禁止**：INSERT、UPDATE、DELETE（默认禁止写操作）
- ❌ **禁止**：CREATE、DROP、ALTER、TRUNCATE（DDL 操作永久禁止）

### 开启写操作（谨慎使用）

如果需要让 AI 执行数据修改（例如批量更新、插入测试数据），可以在 `.env` 中设置：

```env
ALLOW_WRITE=true
```

**⚠️ 警告**：开启写操作前请确保：
1. 对数据库有完整备份
2. 了解 AI 可能执行的操作
3. 在开发环境中测试

### 推荐：创建只读用户

为了更安全，建议创建一个只读数据库用户专门给 MCP 使用：

```sql
-- 连接到 MySQL
mysql -u root -p

-- 创建只读用户
CREATE USER 'shuwu_readonly'@'localhost' IDENTIFIED BY 'your_secure_password';

-- 授予只读权限
GRANT SELECT, SHOW VIEW ON shuwu.* TO 'shuwu_readonly'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;
```

然后修改 `.env`：
```env
DB_USER=shuwu_readonly
DB_PASSWORD=your_secure_password
```

## 📚 相关资源

- [MCP 官方文档](https://modelcontextprotocol.io/)
- [项目 README](./README.md)
- [SQL 示例](../sql/)

## ✅ 完成清单

- [ ] 已添加 MCP 配置到 Cursor 设置
- [ ] 已重启 Cursor
- [ ] 已测试基础查询功能
- [ ] 已了解安全策略
- [ ] （可选）已创建只读数据库用户

---

**配置完成后，您就可以在 Cursor 中直接向 AI 询问数据库相关的问题了！** 🎉

如有问题，请参考 [故障排查](#-故障排查) 章节。


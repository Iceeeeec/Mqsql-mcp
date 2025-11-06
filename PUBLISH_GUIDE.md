# NPM 发布指南

本文档说明如何将 MCP MySQL Server 发布到 npm 仓库。

## 前置准备

### 1. 注册 npm 账号

如果还没有 npm 账号，访问 [https://www.npmjs.com/signup](https://www.npmjs.com/signup) 注册。

### 2. 登录 npm

在项目目录下执行：

```bash
npm login
```

输入你的：
- Username（用户名）
- Password（密码）
- Email（邮箱）
- One-time password（如果启用了 2FA）

验证登录状态：

```bash
npm whoami
```

### 3. 检查包名是否可用

```bash
npm view @shuwu/mcp-mysql-server
```

如果显示 404，说明包名可用。如果已被占用，需要修改 `package.json` 中的 `name` 字段。

**可选的包名格式：**
- `@your-username/mcp-mysql-server`（作用域包，推荐）
- `mcp-mysql-server-by-yourname`（无作用域包）

## 发布步骤

### 1. 更新版本号

编辑 `package.json`，根据语义化版本规范更新版本号：

- **补丁版本**（bug 修复）：`1.0.0` → `1.0.1`
- **次版本**（新功能）：`1.0.0` → `1.1.0`
- **主版本**（破坏性更新）：`1.0.0` → `2.0.0`

或使用命令：

```bash
# 补丁版本
npm version patch

# 次版本
npm version minor

# 主版本
npm version major
```

### 2. 更新 package.json 中的 repository

确保 `package.json` 中的 `repository`、`bugs`、`homepage` 字段正确：

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/mcp-mysql-server.git"
  },
  "bugs": {
    "url": "https://github.com/your-username/mcp-mysql-server/issues"
  },
  "homepage": "https://github.com/your-username/mcp-mysql-server#readme"
}
```

### 3. 检查要发布的文件

查看哪些文件会被发布：

```bash
npm pack --dry-run
```

确认只包含必要的文件（index.js、README.md、LICENSE 等）。

### 4. 发布到 npm

#### 发布公开包（免费）

```bash
npm publish --access public
```

#### 发布私有包（需要付费账号）

```bash
npm publish
```

### 5. 验证发布

访问你的包页面：

```
https://www.npmjs.com/package/@shuwu/mcp-mysql-server
```

或使用命令查看：

```bash
npm view @shuwu/mcp-mysql-server
```

### 6. 测试安装

在另一个目录测试安装：

```bash
# 全局安装测试
npm install -g @shuwu/mcp-mysql-server

# 或使用 npx 测试
npx @shuwu/mcp-mysql-server
```

## 更新已发布的包

### 1. 修改代码后提交 Git

```bash
git add .
git commit -m "feat: add new feature"
git push
```

### 2. 更新版本并发布

```bash
# 更新版本号
npm version patch  # 或 minor / major

# 发布新版本
npm publish --access public

# 推送版本标签到 Git
git push --tags
```

## 常见问题

### 1. 包名被占用

修改 `package.json` 中的 `name`：

```json
{
  "name": "@your-username/mcp-mysql-server"
}
```

作用域包（@username/package）需要在发布时添加 `--access public`。

### 2. 发布失败：403 Forbidden

可能原因：
- 未登录或登录过期：运行 `npm login` 重新登录
- 包名已被占用：更改包名
- 作用域包权限问题：添加 `--access public`

### 3. 撤销发布（慎用）

**注意**：只能撤销发布后 72 小时内的包。

```bash
npm unpublish @shuwu/mcp-mysql-server@1.0.0
```

撤销整个包：

```bash
npm unpublish @shuwu/mcp-mysql-server --force
```

**不推荐撤销**，应该发布新版本修复问题。

### 4. 弃用某个版本

不删除包，但标记为已弃用：

```bash
npm deprecate @shuwu/mcp-mysql-server@1.0.0 "该版本已弃用，请使用 1.0.1"
```

## 发布检查清单

发布前确认：

- [ ] 代码已充分测试
- [ ] README.md 文档完整
- [ ] LICENSE 文件存在
- [ ] package.json 信息正确（name、version、description、repository）
- [ ] .npmignore 正确配置
- [ ] 已登录 npm 账号
- [ ] 版本号已更新
- [ ] Git 代码已提交

## 发布后的推广

1. **在 README 中添加徽章**
   ```markdown
   [![npm version](https://img.shields.io/npm/v/@shuwu/mcp-mysql-server.svg)](https://www.npmjs.com/package/@shuwu/mcp-mysql-server)
   [![npm downloads](https://img.shields.io/npm/dm/@shuwu/mcp-mysql-server.svg)](https://www.npmjs.com/package/@shuwu/mcp-mysql-server)
   ```

2. **分享到社区**
   - GitHub Discussions
   - Twitter/X
   - Reddit (r/node, r/programming)
   - Dev.to
   - Hacker News

3. **提交到相关列表**
   - [Awesome MCP Servers](https://github.com/modelcontextprotocol/servers)
   - [Awesome Node.js](https://github.com/sindresorhus/awesome-nodejs)

## 维护建议

- 定期更新依赖：`npm outdated` → `npm update`
- 及时回复 Issues 和 PR
- 遵循语义化版本规范
- 编写 CHANGELOG.md 记录变更
- 设置 GitHub Actions 自动化测试

---

祝你发布顺利！🚀


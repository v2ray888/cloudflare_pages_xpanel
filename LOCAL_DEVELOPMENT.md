# 本地开发环境设置指南

## 环境要求

- Node.js 18+
- npm 或 yarn
- Wrangler CLI

## 启动开发环境

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

### 3. 启动前端开发服务器

在终端中运行：

```bash
npm run dev
```

前端服务将运行在：http://localhost:3000

### 4. 启动 API 开发服务器

在另一个终端中运行：

```bash
npm run dev:api
```

API 服务将运行在：http://127.0.0.1:8787

### 5. 访问应用

打开浏览器访问：http://localhost:3000

## 默认管理员账户

- 邮箱: `admin@xpanel.com`
- 密码: `admin123`

**⚠️ 请在首次登录后立即修改默认管理员密码！**

## 开发注意事项

1. 前端使用 Vite 构建，支持热重载
2. 后端使用 Cloudflare Wrangler 进行本地开发
3. 数据库使用 SQLite 进行本地开发
4. API 接口遵循 RESTful 设计规范

## 常用开发命令

```bash
# 启动前端开发服务器
npm run dev

# 启动 API 开发服务器
npm run dev:api

# 构建生产版本
npm run build

# 代码检查
npm run lint

# 修复代码问题
npm run lint:fix
```

## 调试技巧

1. 使用浏览器开发者工具调试前端代码
2. 查看终端输出以获取 API 错误信息
3. 使用 `console.log` 在代码中添加调试信息
4. 检查网络请求以验证 API 调用

## 常见问题

### 1. 端口冲突

如果默认端口被占用，可以修改 `vite.config.ts` 中的端口配置：

```javascript
server: {
  port: 3000, // 修改为其他端口
  host: true,
}
```

### 2. 数据库问题

如果遇到数据库问题，可以重新初始化数据库：

```bash
npm run db:generate
npm run db:seed
```
# XPanel 部署指南

## 部署前准备

### 1. 环境要求
- Node.js 18+
- npm 或 yarn
- Cloudflare 账户

### 2. 克隆项目
```bash
git clone <repository-url>
cd cloudflare-xpanel
```

### 3. 安装依赖
```bash
npm install
```

## 数据库配置

### 1. 创建 D1 数据库
```bash
# 创建生产环境数据库
npx wrangler d1 create xpanel-db

# 记录返回的 database_id
```

### 2. 更新 wrangler.toml
将上一步获得的 database_id 填入 wrangler.toml 文件：

```toml
name = "cloudflare-xpanel"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"

[env.production]
vars = { ENVIRONMENT = "production", JWT_SECRET = "your-secure-jwt-secret", PAYMENT_SECRET = "your-secure-payment-secret" }

[[env.production.d1_databases]]
binding = "DB"
database_name = "xpanel-db"
database_id = "替换成实际的 database_id"

[env.preview]
vars = { ENVIRONMENT = "preview", JWT_SECRET = "your-secure-jwt-secret", PAYMENT_SECRET = "your-secure-payment-secret" }

[[env.preview.d1_databases]]
binding = "DB"
database_name = "xpanel-db"
database_id = "替换成实际的 database_id"
```

### 3. 执行数据库迁移
```bash
# 生产环境
npx wrangler d1 execute xpanel-db --env production --file=./database/schema.sql
npx wrangler d1 execute xpanel-db --env production --file=./database/seed.sql

# 开发环境（如果需要）
npx wrangler d1 execute xpanel-db --env preview --file=./database/schema.sql
npx wrangler d1 execute xpanel-db --env preview --file=./database/seed.sql
```

## 部署步骤

### 1. 构建前端
```bash
npm run build
```

### 2. 部署前端到 Cloudflare Pages
```bash
npm run deploy
```

### 3. 部署后端 API 到 Cloudflare Workers
```bash
npm run deploy:api
```

## 本地开发

### 启动前端开发服务器
```bash
npm run dev
```

### 启动后端 API 服务
```bash
npm run dev:api
```

## 环境变量配置

确保在 wrangler.toml 中正确配置了以下环境变量：
- JWT_SECRET: 用于 JWT token 签名的密钥
- PAYMENT_SECRET: 用于支付相关操作的密钥

## 常见问题解决

### 1. 部署时 wrangler.toml 错误
确保 wrangler.toml 文件中没有 Pages 项目不支持的配置项，如 `[build]` 和 `[dev]`。

### 2. 数据库连接问题
检查 wrangler.toml 中的 database_id 是否正确，以及数据库是否已创建。

### 3. API 路由问题
确保 [_routes.json](file:///E:/webapp/cloudflare_xpanel/_routes.json) 文件正确配置，将 `/api/*` 请求路由到 Workers。

### 4. 环境变量未生效
确保在 wrangler.toml 的 `[env.production.vars]` 和 `[env.preview.vars]` 中正确配置了环境变量。
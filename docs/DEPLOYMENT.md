# 部署指南

## 环境要求

- Node.js 18+
- npm 或 yarn
- Cloudflare 账户
- Git

## 快速部署

### 1. 克隆项目
```bash
git clone <repository-url>
cd cloudflare-xpanel
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
vim .env
```

### 4. 初始化数据库
```bash
# 运行数据库初始化脚本
chmod +x scripts/init-db.sh
./scripts/init-db.sh
```

### 5. 配置 Wrangler
```bash
# 登录 Cloudflare
npx wrangler login

# 更新 wrangler.toml 中的数据库 ID
vim wrangler.toml
```

### 6. 部署
```bash
# 运行部署脚本
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## 详细部署步骤

### Cloudflare D1 数据库

1. **创建数据库**
```bash
npx wrangler d1 create xpanel-db
```

2. **更新配置**
将生成的数据库 ID 更新到 `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "xpanel-db"
database_id = "your-database-id-here"
```

3. **执行数据库迁移**
```bash
npx wrangler d1 execute xpanel-db --file=./database/schema.sql
npx wrangler d1 execute xpanel-db --file=./database/seed.sql
```

### Cloudflare Workers (API)

1. **配置环境变量**
```bash
# 设置 JWT 密钥
npx wrangler secret put JWT_SECRET

# 设置支付密钥
npx wrangler secret put PAYMENT_SECRET
```

2. **部署 Workers**
```bash
npm run deploy:api
```

### Cloudflare Pages (前端)

#### 方式一：通过 Git 连接

1. 在 Cloudflare Dashboard 中创建 Pages 项目
2. 连接 GitHub 仓库
3. 配置构建设置：
   - **构建命令**: `npm run build`
   - **输出目录**: `dist`
   - **Node.js 版本**: `18`

4. 设置环境变量：
   - `VITE_API_URL`: Workers API 地址
   - `VITE_APP_NAME`: 应用名称

#### 方式二：直接部署

```bash
npm run deploy
```

### 域名配置

1. **添加自定义域名**
   - 在 Cloudflare Pages 中添加自定义域名
   - 配置 DNS 记录

2. **SSL 证书**
   - Cloudflare 会自动配置 SSL 证书
   - 确保启用 "Always Use HTTPS"

## 环境变量配置

### 前端环境变量 (.env)
```env
VITE_API_URL=https://your-api.workers.dev
VITE_APP_NAME=XPanel
```

### Workers 环境变量
```bash
# JWT 密钥（用于用户认证）
npx wrangler secret put JWT_SECRET
# 输入: your-super-secret-jwt-key

# 支付密钥（用于支付回调验证）
npx wrangler secret put PAYMENT_SECRET
# 输入: your-payment-secret-key
```

## 数据库管理

### 查看数据库
```bash
npx wrangler d1 execute xpanel-db --command="SELECT * FROM users LIMIT 10"
```

### 备份数据库
```bash
npx wrangler d1 export xpanel-db --output=backup.sql
```

### 恢复数据库
```bash
npx wrangler d1 execute xpanel-db --file=backup.sql
```

## 监控和日志

### 查看 Workers 日志
```bash
npx wrangler tail
```

### 查看 Pages 部署日志
在 Cloudflare Dashboard 的 Pages 项目中查看部署历史和日志。

## 性能优化

### 1. 启用缓存
在 `wrangler.toml` 中配置缓存策略：
```toml
[env.production]
vars = { ENVIRONMENT = "production" }

[[env.production.routes]]
pattern = "api.yourdomain.com/*"
zone_name = "yourdomain.com"
```

### 2. 配置 CDN
Cloudflare 自动提供全球 CDN 加速。

### 3. 数据库优化
- 定期清理过期数据
- 添加适当的索引
- 监控查询性能

## 安全配置

### 1. CORS 设置
在 Workers 中已配置 CORS，确保只允许信任的域名访问。

### 2. 速率限制
考虑添加 API 速率限制：
```javascript
// 在 Workers 中添加
import { RateLimiter } from '@cloudflare/workers-rate-limiter'
```

### 3. 安全头
确保设置适当的安全头：
```javascript
response.headers.set('X-Content-Type-Options', 'nosniff')
response.headers.set('X-Frame-Options', 'DENY')
response.headers.set('X-XSS-Protection', '1; mode=block')
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 `wrangler.toml` 中的数据库 ID
   - 确保数据库已正确创建

2. **API 调用失败**
   - 检查 CORS 配置
   - 验证 API 地址是否正确

3. **认证失败**
   - 检查 JWT_SECRET 是否正确设置
   - 验证 Token 格式

4. **支付回调失败**
   - 检查 PAYMENT_SECRET 配置
   - 验证回调 URL 是否正确

### 调试技巧

1. **本地调试**
```bash
# 启动本地开发服务器
npm run dev
npm run dev:api
```

2. **查看实时日志**
```bash
npx wrangler tail --format=pretty
```

3. **测试 API**
```bash
curl -X GET https://your-api.workers.dev/health
```

## 更新部署

### 1. 更新代码
```bash
git pull origin main
npm install
```

### 2. 重新部署
```bash
npm run deploy:api
npm run deploy
```

### 3. 数据库迁移
如果有数据库结构变更：
```bash
npx wrangler d1 execute xpanel-db --file=./database/migrations/001_update.sql
```

## 备份策略

### 1. 代码备份
- 使用 Git 版本控制
- 定期推送到远程仓库

### 2. 数据库备份
```bash
# 每日备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d)
npx wrangler d1 export xpanel-db --output=backup_$DATE.sql
```

### 3. 配置备份
- 备份 `wrangler.toml`
- 备份环境变量配置

## 扩展部署

### 多环境部署

1. **开发环境**
```toml
[env.development]
vars = { ENVIRONMENT = "development" }
```

2. **生产环境**
```toml
[env.production]
vars = { ENVIRONMENT = "production" }
```

### 自动化部署

使用 GitHub Actions：
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run deploy
```

## 支持

如果在部署过程中遇到问题，请：

1. 查看 [故障排除](#故障排除) 部分
2. 检查 Cloudflare Dashboard 中的错误日志
3. 提交 Issue 到项目仓库

---

部署完成后，您的 XPanel 系统就可以正常使用了！🎉
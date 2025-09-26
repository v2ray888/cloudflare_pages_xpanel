# XPanel 部署指南

## 问题诊断

根据测试结果，您的前端页面可以正常访问，但API端点无法正常工作。这通常是由于Cloudflare Functions没有正确部署导致的。

## 解决方案

### 方案一：使用单独的Workers部署API（推荐）

1. 首先，为API创建一个独立的Worker：

```bash
# 部署API到独立的Worker
npx wrangler deploy functions/[[route]].ts --name xpanel-api --env production
```

2. 更新您的API客户端配置（src/lib/api.ts）：

将API基础URL更新为新部署的Worker URL：
```typescript
// 使用新部署的Worker URL
const API_BASE_URL = 'https://xpanel-api.your-subdomain.workers.dev/api'
// 或者使用环境变量
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://xpanel-api.your-subdomain.workers.dev/api'
```

3. 在Cloudflare Dashboard中为您的域名添加路由：
   - 进入Workers & Pages
   - 选择您的xpanel-api Worker
   - 添加自定义域名：api.xpanel.121858.xyz
   - 更新API客户端使用这个新域名

### 方案二：重新部署Pages项目

1. 确保您的_functions目录结构正确：
```
functions/
├── [[route]].ts          # 主API路由
├── api/
│   └── routes/
│       ├── auth.ts       # 认证路由
│       └── ...           # 其他路由
└── test.ts              # 测试端点
```

2. 重新部署Pages项目：
```bash
# 构建项目
npm run build

# 部署到Cloudflare Pages
npx wrangler pages deploy dist --project-name=cloudflare-xpanel
```

### 方案三：检查Pages项目设置

1. 登录Cloudflare Dashboard
2. 进入Workers & Pages
3. 选择您的cloudflare-xpanel项目
4. 检查以下设置：
   - 构建配置：
     - 构建命令：`npm run build`
     - 构建输出目录：`dist`
   - 环境变量：
     - JWT_SECRET: [您的JWT密钥]
     - PAYMENT_SECRET: [您的支付密钥]
   - D1数据库绑定：
     - 变量名：DB
     - 数据库：xpanel-db

## 验证部署

部署完成后，使用以下命令验证API是否正常工作：

```bash
# 测试健康检查端点
curl https://xpanel.121858.xyz/health

# 测试API健康检查端点
curl https://xpanel.121858.xyz/api/health

# 测试注册端点（应该返回400而不是405）
curl -X POST https://xpanel.121858.xyz/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 常见问题解决

### 1. 405 Method Not Allowed 错误

这表示请求的URL没有找到对应的处理函数。请检查：
- Functions目录结构是否正确
- _routes.json文件是否包含正确的路由规则
- 是否正确部署了Functions

### 2. 环境变量未设置

确保在Cloudflare Dashboard中正确设置了环境变量：
- JWT_SECRET
- PAYMENT_SECRET

### 3. 数据库绑定问题

确保在Pages项目设置中正确绑定了D1数据库：
- 变量名：DB
- 数据库名称：xpanel-db

## 进一步帮助

如果以上方法都无法解决问题，请提供以下信息以便进一步诊断：
1. Cloudflare Dashboard中Pages项目的设置截图
2. Workers项目的部署状态
3. 浏览器开发者工具中网络请求的详细信息
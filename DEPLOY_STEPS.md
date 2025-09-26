# XPanel 部署步骤

## 问题修复总结

我们已经修复了导致注册功能无法正常工作的问题：

1. **路由认证问题**：之前所有以`/api/*`开头的路由都被强制要求JWT认证，包括注册和登录端点，这些应该是公开的。

2. **修复方案**：修改了[functions/[[route]].ts](file:///e:/webapp/cloudflare_xpanel/functions/[[route]].ts)文件，排除了认证路由（登录、注册、兑换）的JWT验证要求。

## 部署步骤

### 步骤1：提交代码更改

```bash
# 添加更改的文件
git add .

# 提交更改
git commit -m "修复API路由认证问题"
```

### 步骤2：在Cloudflare Dashboard中创建Pages项目

1. 登录到 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 点击 **Create application**
4. 选择 **Pages**
5. 点击 **Connect to Git**
6. 连接到您的Git仓库
7. 配置项目设置：
   - Project name: `cloudflare-xpanel`
   - Production branch: `main` (或您的主分支)
   - Build settings:
     - Build command: `npm run build`
     - Build output directory: `dist`

### 步骤3：配置环境变量

在Pages项目设置中配置环境变量：

1. 进入您的Pages项目
2. 点击 **Settings**
3. 选择 **Environment variables**
4. 添加以下变量：
   - `JWT_SECRET`: [您的JWT密钥]
   - `PAYMENT_SECRET`: [您的支付密钥]

### 步骤4：配置D1数据库绑定

1. 在Pages项目设置中选择 **Functions**
2. 在 **D1 database bindings** 部分添加：
   - Variable name: `DB`
   - Database: 选择您的 `xpanel-db` 数据库

### 步骤5：手动部署（可选）

如果您希望通过命令行部署：

```bash
# 构建项目
npm run build

# 部署（首次部署时会提示创建项目）
npx wrangler pages deploy dist
```

按照提示操作，选择创建新项目并命名为 `cloudflare-xpanel`。

## 验证部署

部署完成后，您可以运行测试脚本验证修复：

```bash
node test-fixed-api.js
```

预期结果：
- 注册端点应该返回成功消息或"邮箱已被注册"（如果邮箱已存在）
- 登录端点应该返回成功消息或"邮箱或密码错误"
- 需要认证的端点应该返回401状态码

## 故障排除

如果仍然遇到问题：

1. 检查Cloudflare Dashboard中的部署日志
2. 确认环境变量已正确设置
3. 确认D1数据库已正确绑定
4. 检查浏览器开发者工具中的网络请求
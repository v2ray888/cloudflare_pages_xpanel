# 环境变量配置指南

## 问题分析

环境变量配置不正确可能导致以下问题：
1. API无法正常工作（405错误可能与此相关）
2. JWT认证失败
3. 数据库连接问题
4. 支付功能异常

## 必需的环境变量

### 1. Cloudflare Worker 环境变量

在 Cloudflare Dashboard 中配置：

| 变量名 | 用途 | 建议值 |
|--------|------|--------|
| JWT_SECRET | JWT签名密钥 | 强随机字符串，至少32字符 |
| PAYMENT_SECRET | 支付安全密钥 | 强随机字符串，至少32字符 |
| ENVIRONMENT | 环境标识 | production 或 preview |

### 2. 前端环境变量

在 `.env` 文件中配置（开发环境）：

| 变量名 | 用途 | 示例值 |
|--------|------|--------|
| VITE_API_URL | API基础URL | https://xpanel.121858.xyz |
| VITE_APP_NAME | 应用名称 | XPanel |

## 配置步骤

### 步骤1：生成安全密钥

```bash
# 生成JWT_SECRET（在Linux/Mac上）
openssl rand -base64 32

# 生成PAYMENT_SECRET（在Linux/Mac上）
openssl rand -base64 32

# Windows PowerShell
-join ((65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

### 步骤2：配置Cloudflare Dashboard

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 选择您的项目 **cloudflare-xpanel**
4. 点击 **Settings** 标签
5. 选择 **Environment variables**
6. 添加以下变量：
   - `JWT_SECRET`: [您生成的JWT密钥]
   - `PAYMENT_SECRET`: [您生成的支付密钥]
   - `ENVIRONMENT`: production

### 步骤3：配置本地开发环境

1. 复制 `.env.example` 到 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件：
   ```env
   # API Configuration
   VITE_API_URL=http://localhost:8787
   VITE_APP_NAME=XPanel

   # Cloudflare Configuration (仅用于本地开发)
   JWT_SECRET=your-local-dev-jwt-secret-key-here-min-32-chars
   PAYMENT_SECRET=your-local-dev-payment-secret-key-here-min-32-chars
   ```

### 步骤4：配置D1数据库绑定

1. 在 Cloudflare Dashboard 的 **Functions** 部分
2. 配置 D1 database bindings：
   - Variable name: `DB`
   - Database: 选择您的 `xpanel-db` 数据库

## 验证配置

### 1. 检查Cloudflare Dashboard配置

确保所有必需的环境变量已在Dashboard中正确设置。

### 2. 本地测试

```bash
# 启动开发服务器
npm run dev

# 检查环境变量是否正确加载
node scripts/check-env-variables.js
```

### 3. 部署后验证

部署完成后，访问以下URL验证API是否正常工作：
- https://xpanel.121858.xyz/api/health
- https://xpanel.121858.xyz/api/auth/register

## 常见问题

### 1. 环境变量未生效

- 确保在Cloudflare Dashboard中正确设置了环境变量
- 重新部署项目以应用更改
- 检查变量名是否正确（区分大小写）

### 2. JWT认证失败

- 确保JWT_SECRET已设置且长度足够
- 检查密钥在生产环境和开发环境中是否一致

### 3. 数据库连接问题

- 确保D1数据库已正确绑定
- 检查database_name和database_id是否正确

## 安全建议

1. **密钥强度**：
   - 使用强随机字符串
   - 长度至少32个字符
   - 定期轮换密钥

2. **密钥管理**：
   - 不要在代码中硬编码密钥
   - 不要将密钥提交到Git仓库
   - 为不同环境使用不同的密钥

3. **访问控制**：
   - 限制对环境变量设置的访问权限
   - 定期审查访问日志

## 故障排除

如果配置后仍然出现问题：

1. 检查Cloudflare部署日志
2. 确认所有必需的环境变量已设置
3. 验证数据库绑定是否正确
4. 重新部署项目以应用配置更改
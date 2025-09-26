# GitHub + Cloudflare Pages 自动化部署指南

## 🚀 完整部署流程

### 第一步：推送代码到GitHub

1. **初始化Git仓库**
```bash
git init
git add .
git commit -m "Initial commit: Complete VPN sales system"
```

2. **创建GitHub仓库**
- 访问 [GitHub](https://github.com)
- 点击 "New repository"
- 仓库名称：`cloudflare-xpanel`
- 设置为私有仓库（推荐）
- 不要初始化README（因为我们已有文件）

3. **推送到GitHub**
```bash
# 替换为您的GitHub用户名
git remote add origin https://github.com/YOUR_USERNAME/cloudflare-xpanel.git
git branch -M main
git push -u origin main
```

### 第二步：配置Cloudflare

1. **获取Cloudflare API Token**
- 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
- 进入 "My Profile" > "API Tokens"
- 点击 "Create Token"
- 使用 "Custom token" 模板
- 权限设置：
  - `Cloudflare Pages:Edit`
  - `Account:Read`
  - `Zone:Read`
- 账户资源：包含您的账户
- 区域资源：包含您的域名（如果有）

2. **获取Account ID**
- 在Cloudflare Dashboard右侧边栏找到 "Account ID"
- 复制保存

3. **创建D1数据库**
```bash
# 安装Wrangler CLI
npm install -g wrangler

# 登录Cloudflare
wrangler login

# 创建D1数据库
wrangler d1 create xpanel-db

# 记录返回的database_id，稍后需要用到
```

4. **初始化数据库**
```bash
# 执行数据库结构
wrangler d1 execute xpanel-db --file=./database/schema.sql

# 执行初始数据
wrangler d1 execute xpanel-db --file=./database/seed.sql
```

### 第三步：配置GitHub Secrets

在GitHub仓库中设置以下Secrets：

1. **进入仓库设置**
- 进入您的GitHub仓库
- 点击 "Settings" 标签
- 左侧菜单选择 "Secrets and variables" > "Actions"

2. **添加以下Secrets**
```
CLOUDFLARE_API_TOKEN=your_api_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
VITE_API_URL=https://your-domain.pages.dev/api
VITE_APP_NAME=XPanel
VITE_APP_DESCRIPTION=专业的VPN服务平台
```

### 第四步：配置wrangler.toml

更新 `wrangler.toml` 文件中的database_id：

```toml
name = "cloudflare-xpanel"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "DB"
database_name = "xpanel-db"
database_id = "your_database_id_here"  # 替换为实际的database_id
```

### 第五步：连接Cloudflare Pages

1. **在Cloudflare Dashboard中**
- 进入 "Pages"
- 点击 "Connect to Git"
- 选择 "GitHub"
- 授权Cloudflare访问您的GitHub账户
- 选择 `cloudflare-xpanel` 仓库

2. **配置构建设置**
- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`

3. **环境变量设置**
在Pages项目设置中添加环境变量：
```
VITE_API_URL=https://your-domain.pages.dev/api
VITE_APP_NAME=XPanel
VITE_APP_DESCRIPTION=专业的VPN服务平台
```

### 第六步：自动化部署

现在每次推送到main分支都会自动触发部署：

```bash
# 修改代码后
git add .
git commit -m "Update: 功能改进"
git push origin main
```

## 🔧 本地开发流程

1. **克隆仓库**
```bash
git clone https://github.com/YOUR_USERNAME/cloudflare-xpanel.git
cd cloudflare-xpanel
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑.env文件，填入正确的配置
```

4. **启动开发服务器**
```bash
npm run dev
```

5. **本地测试API**
```bash
npm run dev:api
```

## 📊 部署状态监控

### GitHub Actions
- 在仓库的 "Actions" 标签查看部署状态
- 每次推送都会触发自动构建和部署

### Cloudflare Pages
- 在Cloudflare Dashboard的Pages部分查看部署历史
- 可以看到构建日志和部署状态

## 🛠️ 故障排除

### 常见问题

1. **构建失败**
```bash
# 检查依赖是否正确安装
npm ci

# 本地测试构建
npm run build
```

2. **API连接失败**
- 检查环境变量是否正确设置
- 确认D1数据库已正确配置
- 验证API Token权限

3. **数据库连接问题**
```bash
# 测试数据库连接
wrangler d1 execute xpanel-db --command="SELECT 1"
```

### 调试技巧

1. **查看构建日志**
- GitHub Actions页面查看详细日志
- Cloudflare Pages部署日志

2. **本地调试**
```bash
# 启用详细日志
DEBUG=* npm run dev

# 检查API响应
curl -X GET https://your-domain.pages.dev/api/health
```

## 🎯 生产环境优化

### 性能优化
1. **启用Cloudflare缓存**
2. **配置CDN设置**
3. **优化图片资源**
4. **启用Gzip压缩**

### 安全设置
1. **配置WAF规则**
2. **设置访问限制**
3. **启用DDoS防护**
4. **配置SSL/TLS**

### 监控告警
1. **设置Uptime监控**
2. **配置错误告警**
3. **性能监控**
4. **用户行为分析**

## 🎉 部署完成！

恭喜！您的VPN销售系统现在已经：

✅ **代码托管在GitHub** - 版本控制和协作开发  
✅ **自动化部署** - 推送代码即自动部署  
✅ **全球CDN加速** - Cloudflare全球节点  
✅ **高可用性** - 99.9%+ 可用性保障  
✅ **安全防护** - DDoS防护和WAF  
✅ **无服务器架构** - 自动扩容，按需付费  

您的网站地址：`https://your-domain.pages.dev`

立即开始您的VPN业务吧！🚀

## 📞 技术支持

如遇到任何问题：
1. 查看GitHub Issues
2. 检查Cloudflare文档
3. 联系技术支持

祝您业务兴隆！💰
# Cloudflare Pages 部署配置指南

## 🚀 第一步：选择存储库

### 1. 访问Cloudflare Pages
- 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
- 在左侧菜单选择 **"Pages"**
- 点击 **"Connect to Git"** 按钮

### 2. 连接GitHub
- 选择 **"GitHub"** 作为Git提供商
- 如果首次使用，需要授权Cloudflare访问您的GitHub账户
- 点击 **"Install & Authorize"**

### 3. 选择仓库
- 在仓库列表中找到：**`v2ray888/cloudflare_pages_xpanel`**
- 点击仓库名称选择它
- 点击 **"Begin setup"**

---

## ⚙️ 第二步：设置构建和部署

### 构建配置设置
请按以下配置填写：

```
项目名称: xpanel
生产分支: main
```

### 构建设置
```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: / (保持默认)
```

### 环境变量设置
点击 **"Environment variables"** 展开，添加以下变量：

```
VITE_API_URL = https://xpanel.pages.dev/api
VITE_APP_NAME = XPanel
VITE_APP_DESCRIPTION = 专业的VPN服务平台
```

**注意：** `VITE_API_URL` 中的域名会在部署后自动分配，您可以稍后更新为实际域名。

### 高级设置（可选）
- **Node.js版本**: 18 (推荐)
- **兼容性日期**: 2024-01-01
- **兼容性标志**: 保持默认

---

## 🚀 第三步：部署站点

### 1. 开始部署
- 检查所有配置无误后
- 点击 **"Save and Deploy"** 按钮
- 系统将开始构建和部署过程

### 2. 监控部署进度
部署过程包括以下步骤：
1. **克隆仓库** - 从GitHub获取代码
2. **安装依赖** - 运行 `npm install`
3. **构建项目** - 运行 `npm run build`
4. **部署到边缘** - 分发到全球CDN节点

### 3. 部署状态
- ✅ **成功**: 绿色勾号，站点可访问
- ⏳ **进行中**: 黄色圆圈，正在构建
- ❌ **失败**: 红色叉号，需要检查日志

---

## 🔧 部署后配置

### 1. 获取站点URL
部署成功后，您将获得：
- **临时域名**: `https://xpanel-xxx.pages.dev`
- **自定义域名**: 可在设置中添加

### 2. 配置D1数据库绑定

#### 创建D1数据库
```bash
# 安装Wrangler CLI
npm install -g wrangler

# 登录Cloudflare
wrangler login

# 创建数据库
wrangler d1 create xpanel-db
```

#### 绑定数据库到Pages
1. 在Pages项目设置中
2. 进入 **"Functions"** 标签
3. 点击 **"D1 database bindings"**
4. 添加绑定：
   - **Variable name**: `DB`
   - **D1 database**: 选择 `xpanel-db`

#### 初始化数据库
```bash
# 执行数据库结构
wrangler d1 execute xpanel-db --file=./database/schema.sql

# 执行初始数据
wrangler d1 execute xpanel-db --file=./database/seed.sql
```

### 3. 更新环境变量
获得实际域名后，更新环境变量：
```
VITE_API_URL = https://your-actual-domain.pages.dev/api
```

---

## 🎯 验证部署

### 1. 访问网站
- 打开分配的域名
- 检查首页是否正常显示
- 测试用户注册/登录功能

### 2. 测试API
```bash
# 健康检查
curl https://your-domain.pages.dev/api/health

# 测试认证
curl -X POST https://your-domain.pages.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","username":"testuser"}'
```

### 3. 检查功能
- ✅ 用户注册/登录
- ✅ 套餐展示
- ✅ 兑换码功能
- ✅ 用户中心
- ✅ 管理后台

---

## 🚨 常见问题解决

### 构建失败
**问题**: Build failed with exit code 1
**解决**:
1. 检查 `package.json` 中的依赖
2. 确认Node.js版本兼容性
3. 查看构建日志详细错误

### API连接失败
**问题**: API请求返回404
**解决**:
1. 确认Functions已正确部署
2. 检查 `_routes.json` 配置
3. 验证D1数据库绑定

### 数据库连接错误
**问题**: Database binding not found
**解决**:
1. 确认D1数据库已创建
2. 检查绑定配置是否正确
3. 重新部署Functions

---

## 📊 部署完成检查清单

- [ ] GitHub仓库已连接
- [ ] 构建配置正确
- [ ] 环境变量已设置
- [ ] 站点部署成功
- [ ] D1数据库已创建并绑定
- [ ] 数据库已初始化
- [ ] API功能正常
- [ ] 前端页面可访问
- [ ] 用户功能测试通过
- [ ] 管理功能测试通过

---

## 🎉 恭喜！

您的VPN销售系统已成功部署到Cloudflare Pages！

**访问地址**: https://your-domain.pages.dev
**管理后台**: https://your-domain.pages.dev/admin
**用户中心**: https://your-domain.pages.dev/user

享受全球CDN加速、DDoS防护和99.9%可用性保障！🚀

---

## 📞 技术支持

如遇问题，请检查：
1. [Cloudflare Pages文档](https://developers.cloudflare.com/pages/)
2. [GitHub Actions日志](https://github.com/v2ray888/cloudflare_pages_xpanel/actions)
3. Cloudflare Pages部署日志

祝您业务兴隆！💰
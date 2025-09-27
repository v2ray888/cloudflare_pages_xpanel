# XPanel 部署指南

## 🚀 Cloudflare Pages 部署步骤

### 1. 准备工作

确保你已经：
- 拥有 Cloudflare 账户
- 安装了 Node.js 18+
- 安装了 Wrangler CLI: `npm install -g wrangler`
- 登录了 Cloudflare: `wrangler login`

### 2. 创建 D1 数据库

```bash
# 创建数据库
wrangler d1 create xpanel-db

# 记录返回的数据库 ID，更新到 wrangler.toml 文件中
```

### 3. 更新配置文件

在 `wrangler.toml` 中更新数据库 ID：

```toml
[[env.production.d1_databases]]
binding = "DB"
database_name = "xpanel-db"
database_id = "你的数据库ID"
```

### 4. 初始化数据库

```bash
# 创建表结构
wrangler d1 execute xpanel-db --env production --file=./database/schema.sql

# 插入初始数据
wrangler d1 execute xpanel-db --env production --file=./database/seed.sql
```

### 5. 构建项目

```bash
npm install
npm run build
```

### 6. 部署到 Cloudflare Pages

#### 方法一：使用 Wrangler CLI

```bash
wrangler pages deploy dist --project-name=xpanel
```

#### 方法二：通过 Cloudflare Dashboard

1. 登录 Cloudflare Dashboard
2. 进入 Pages 页面
3. 点击 "Create a project"
4. 连接你的 Git 仓库
5. 配置构建设置：
   - 构建命令: `npm run build`
   - 构建输出目录: `dist`
   - Node.js 版本: `18`

### 7. 配置环境变量

在 Cloudflare Pages 项目设置中添加以下环境变量：

```
JWT_SECRET=your-super-secret-jwt-key-here
PAYMENT_SECRET=your-payment-callback-secret
```

### 8. 绑定 D1 数据库

在 Cloudflare Pages 项目设置的 Functions 标签页中：
1. 添加 D1 数据库绑定
2. 变量名: `DB`
3. 选择你创建的 `xpanel-db` 数据库

## 🔧 构建配置

### Vite 配置优化

项目已配置了以下优化：
- 代码分割
- 资源压缩
- 现代浏览器支持
- TypeScript 支持

### Functions 配置

- TypeScript 编译
- 模块化路由
- 错误处理
- CORS 支持

## 🛡️ 安全配置

### 必须配置的安全项

1. **JWT Secret**: 生成强密码用于 JWT 签名
2. **数据库访问**: 确保只有授权的 Functions 可以访问
3. **CORS 设置**: 根据需要配置跨域访问
4. **默认管理员**: 部署后立即修改默认管理员密码

### 推荐的安全措施

1. 启用 Cloudflare 的安全功能：
   - Bot Fight Mode
   - Rate Limiting
   - DDoS Protection

2. 配置自定义域名和 SSL

3. 设置访问策略和防火墙规则

## 📊 监控和日志

### Cloudflare Analytics

- 启用 Web Analytics
- 监控 Functions 执行情况
- 查看错误日志

### 性能监控

- 使用 Cloudflare 的性能分析
- 监控数据库查询性能
- 设置告警规则

## 🔄 更新部署

### 自动部署

如果使用 Git 集成：
1. 推送代码到主分支
2. Cloudflare Pages 自动构建和部署

### 手动部署

```bash
npm run build
wrangler pages deploy dist --project-name=xpanel
```

## 🐛 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本
   - 确认所有依赖已安装
   - 查看构建日志

2. **Functions 错误**
   - 检查环境变量配置
   - 确认数据库绑定
   - 查看 Functions 日志

3. **数据库连接问题**
   - 验证数据库 ID
   - 检查绑定配置
   - 确认数据库已初始化

### 调试技巧

1. 使用 `wrangler pages dev` 本地调试
2. 查看 Cloudflare Dashboard 中的日志
3. 使用浏览器开发者工具检查网络请求

## 📝 部署检查清单

- [ ] 创建 D1 数据库
- [ ] 更新 wrangler.toml 配置
- [ ] 初始化数据库结构和数据
- [ ] 配置环境变量
- [ ] 绑定 D1 数据库
- [ ] 构建项目成功
- [ ] 部署到 Cloudflare Pages
- [ ] 测试网站功能
- [ ] 修改默认管理员密码
- [ ] 配置自定义域名（可选）
- [ ] 启用安全功能
- [ ] 设置监控和告警

## 🎯 性能优化建议

1. **代码分割**: 使用动态导入减少初始包大小
2. **缓存策略**: 配置适当的缓存头
3. **图片优化**: 使用 Cloudflare Images 或其他 CDN
4. **数据库优化**: 添加适当的索引
5. **API 优化**: 实现分页和数据过滤

## 📞 支持

如果遇到问题：
1. 查看 Cloudflare 文档
2. 检查项目 Issues
3. 联系开发团队
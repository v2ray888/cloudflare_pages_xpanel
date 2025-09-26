# XPanel - VPN销售管理系统

一个基于 Cloudflare Pages + D1 的现代化 VPN 销售管理系统，提供完整的用户管理、套餐销售、推广分销等功能。

## ✨ 功能特色

### 🎯 核心功能
- **多样化套餐系统** - 包月/包季/半年/包年/自定义套餐
- **完整用户系统** - 注册登录、用户中心、订阅管理
- **兑换码系统** - 免注册兑换功能，批量生成管理
- **推广分销系统** - 多级佣金、推广统计
- **节点API管理** - 支持多协议节点添加
- **双端管理** - 用户前台 + 管理员后台

### 🛡️ 安全特性
- JWT 身份认证
- 密码加密存储
- API 权限控制
- 支付安全保障

### 🎨 UI/UX 设计
- 响应式设计，支持移动端
- 现代化 UI 组件
- 流畅的用户体验
- 深色/浅色主题支持

## 🚀 技术栈

### 前端
- **React 18** - 现代化前端框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 原子化CSS框架
- **React Router** - 路由管理
- **React Query** - 数据状态管理
- **React Hook Form** - 表单处理
- **Zod** - 数据验证

### 后端
- **Cloudflare Workers** - 边缘计算
- **Hono.js** - 轻量级Web框架
- **Cloudflare D1** - SQLite数据库
- **JWT** - 身份认证
- **bcryptjs** - 密码加密

### 部署
- **Cloudflare Pages** - 静态网站托管
- **Wrangler** - Cloudflare开发工具

## 📦 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Cloudflare 账户

### 1. 克隆项目
```bash
git clone <repository-url>
cd cloudflare-xpanel
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
```bash
# 复制环境变量文件
cp .env.example .env

# 编辑环境变量
vim .env
```

### 4. 数据库初始化
```bash
# 创建 D1 数据库
npx wrangler d1 create xpanel-db

# 更新 wrangler.toml 中的数据库ID

# 执行数据库迁移
npx wrangler d1 execute xpanel-db --file=./database/schema.sql
npx wrangler d1 execute xpanel-db --file=./database/seed.sql
```

### 5. 本地开发
```bash
# 启动前端开发服务器
npm run dev

# 启动后端开发服务器（新终端）
npm run dev:api
```

### 6. 部署到 Cloudflare
```bash
# 部署 Workers API
npm run deploy:api

# 部署 Pages 前端
npm run deploy
```

## 📁 项目结构

```
cloudflare-xpanel/
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   │   ├── ui/            # UI 基础组件
│   │   └── layout/        # 布局组件
│   ├── pages/             # 页面组件
│   │   ├── user/          # 用户中心页面
│   │   └── admin/         # 管理后台页面
│   ├── contexts/          # React Context
│   ├── lib/               # 工具库
│   ├── types/             # TypeScript 类型
│   └── layouts/           # 页面布局
├── functions/             # Cloudflare Workers
│   └── api/               # API 路由
│       ├── routes/        # 路由处理
│       └── utils/         # 工具函数
├── database/              # 数据库文件
│   ├── schema.sql         # 数据库结构
│   └── seed.sql           # 初始数据
├── public/                # 静态资源
└── docs/                  # 文档
```

## 🗄️ 数据库设计

### 核心数据表
- `users` - 用户信息
- `plans` - 套餐管理
- `orders` - 订单记录
- `subscriptions` - 订阅管理
- `servers` - 节点服务器
- `redemption_codes` - 兑换码
- `referral_commissions` - 推广佣金
- `system_settings` - 系统设置

## 🔧 配置说明

### 环境变量
```env
# API 配置
VITE_API_URL=https://your-api.workers.dev
VITE_APP_NAME=XPanel

# Cloudflare Workers 环境变量
JWT_SECRET=your-jwt-secret-key
PAYMENT_SECRET=your-payment-secret-key
```

### Wrangler 配置
```toml
name = "cloudflare-xpanel"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "xpanel-db"
database_id = "your-database-id"
```

## 🎯 功能模块

### 用户前台
- 首页展示
- 套餐选购
- 用户注册/登录
- 兑换码兑换
- 用户中心
  - 仪表板
  - 订阅管理
  - 节点列表
  - 订单记录
  - 推广中心
  - 个人设置

### 管理后台
- 仪表板统计
- 用户管理
- 套餐管理
- 订单管理
- 节点管理
- 兑换码管理
- 推广管理
- 财务管理
- 系统设置

## 🔐 API 接口

### 认证接口
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `POST /auth/redeem` - 兑换码兑换
- `GET /auth/verify` - 验证Token

### 用户接口
- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息
- `PUT /api/users/password` - 修改密码
- `GET /api/users/subscription` - 获取订阅信息
- `GET /api/users/orders` - 获取订单列表

### 管理接口
- `GET /api/admin/stats` - 获取统计数据
- `GET /api/admin/users` - 用户管理
- `GET /api/admin/orders` - 订单管理
- `POST /api/admin/redemption` - 生成兑换码

## 🎨 UI 组件

### 基础组件
- Button - 按钮组件
- Input - 输入框组件
- Card - 卡片组件
- Modal - 模态框组件
- Badge - 标签组件
- LoadingSpinner - 加载动画

### 业务组件
- Header - 页面头部
- Footer - 页面底部
- Sidebar - 侧边栏
- PlanCard - 套餐卡片
- ServerList - 节点列表

## 🚀 部署指南

### Cloudflare Pages 部署
1. 连接 GitHub 仓库
2. 设置构建命令：`npm run build`
3. 设置输出目录：`dist`
4. 配置环境变量

### Cloudflare Workers 部署
1. 配置 wrangler.toml
2. 设置环境变量
3. 执行部署命令：`npm run deploy:api`

### 域名配置
1. 添加自定义域名
2. 配置 DNS 记录
3. 启用 SSL 证书

## 🔧 开发指南

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 使用 Prettier 格式化代码
- 组件采用函数式编程

### 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式
- refactor: 重构代码
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 📝 更新日志

### v1.0.0 (2024-01-01)
- 🎉 项目初始化
- ✨ 完成用户系统
- ✨ 完成套餐管理
- ✨ 完成订单系统
- ✨ 完成推广系统
- ✨ 完成管理后台
- 🎨 完成UI设计

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

## 📄 许可证

MIT License

## 🆘 支持

如有问题，请提交 Issue 或联系开发者。

---

**XPanel** - 让VPN销售管理更简单 🚀
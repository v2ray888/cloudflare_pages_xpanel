#!/bin/bash

# XPanel 部署脚本
# 用于自动化部署到 Cloudflare Pages

set -e

echo "🚀 开始部署 XPanel 到 Cloudflare Pages..."

# 检查必要的工具
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI 未安装，请先安装："
    echo "npm install -g wrangler"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查是否已登录 Cloudflare
echo "🔐 检查 Cloudflare 登录状态..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ 未登录 Cloudflare，请先登录："
    echo "wrangler login"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 编译 TypeScript Functions
echo "🔨 编译 Functions..."
npm run build

# 检查数据库连接
echo "🗄️ 检查数据库连接..."
if ! wrangler d1 list | grep -q "xpanel-db"; then
    echo "⚠️ 数据库 'xpanel-db' 不存在，请先创建："
    echo "wrangler d1 create xpanel-db"
    echo "然后更新 wrangler.toml 中的数据库 ID"
    exit 1
fi

# 部署到 Cloudflare Pages
echo "🚀 部署到 Cloudflare Pages..."
npm run deploy

echo "✅ 部署完成！"
echo ""
echo "📋 部署后检查清单："
echo "1. 检查 Cloudflare Pages 项目设置中的环境变量"
echo "2. 确认数据库绑定正确"
echo "3. 测试网站功能"
echo "4. 修改默认管理员密码"
echo ""
echo "🔗 管理员登录信息："
echo "邮箱: admin@xpanel.com"
echo "密码: admin123"
echo "⚠️ 请立即修改默认密码！"
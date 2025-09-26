#!/bin/bash

# XPanel 部署脚本

set -e

echo "🚀 开始部署 XPanel..."

# 检查环境
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

if ! command -v wrangler &> /dev/null; then
    echo "❌ wrangler 未安装，请运行: npm install -g wrangler"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建前端
echo "🔨 构建前端..."
npm run build

# 部署 Workers API
echo "🌐 部署 API..."
npm run deploy:api

# 部署 Pages
echo "📄 部署前端..."
npm run deploy

echo "✅ 部署完成！"
echo ""
echo "🎉 XPanel 已成功部署到 Cloudflare！"
echo ""
echo "📋 后续步骤："
echo "1. 在 Cloudflare Dashboard 中配置自定义域名"
echo "2. 设置环境变量 JWT_SECRET 和 PAYMENT_SECRET"
echo "3. 初始化数据库数据"
echo "4. 配置支付接口"
echo ""
echo "📚 更多信息请查看 README.md"
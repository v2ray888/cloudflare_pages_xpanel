#!/bin/bash

# XPanel 部署脚本

echo "🚀 开始部署 XPanel..."

# 1. 构建前端项目
echo "🔧 构建前端项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 前端构建失败"
    exit 1
fi

echo "✅ 前端构建完成"

# 2. 部署前端到 Cloudflare Pages
echo "🌐 部署前端到 Cloudflare Pages..."
npm run deploy

if [ $? -ne 0 ]; then
    echo "❌ 前端部署失败"
    exit 1
fi

echo "✅ 前端部署完成"

# 3. 部署后端 API 到 Cloudflare Workers
echo "⚙️  部署后端 API 到 Cloudflare Workers..."
npm run deploy:api

if [ $? -ne 0 ]; then
    echo "❌ 后端部署失败"
    exit 1
fi

echo "✅ 后端部署完成"

echo "🎉 XPanel 部署完成!"
echo "请确保已正确配置数据库并执行了数据库迁移脚本"
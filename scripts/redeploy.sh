#!/bin/bash

# 重新部署Cloudflare Pages项目的脚本

echo "开始重新部署Cloudflare Pages项目..."

# 构建项目
echo "正在构建项目..."
npm run build

if [ $? -ne 0 ]; then
  echo "构建失败，请检查代码错误"
  exit 1
fi

echo "构建成功"

# 部署到Cloudflare Pages
echo "正在部署到Cloudflare Pages..."
npx wrangler pages deploy dist --project-name=cloudflare-xpanel

if [ $? -ne 0 ]; then
  echo "部署失败"
  exit 1
fi

echo "部署成功！"
echo "您的网站应该在几分钟内更新"
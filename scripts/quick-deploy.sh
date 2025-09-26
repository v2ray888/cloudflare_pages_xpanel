#!/bin/bash

# 快速部署脚本
# 使用方法: ./scripts/quick-deploy.sh

set -e

echo "⚡ 快速部署到GitHub + Cloudflare..."

# 检查Git状态
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 发现未提交的更改，正在提交..."
    
    # 获取提交信息
    read -p "请输入提交信息 (默认: Update): " COMMIT_MSG
    COMMIT_MSG=${COMMIT_MSG:-Update}
    
    git add .
    git commit -m "$COMMIT_MSG"
    echo "✅ 更改已提交"
else
    echo "ℹ️ 没有新的更改需要提交"
fi

# 推送到GitHub
echo "⬆️ 推送到GitHub..."
git push origin main
echo "✅ 推送完成"

echo ""
echo "🎉 部署已触发！"
echo "📊 查看部署状态:"
echo "   - GitHub Actions: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
echo "   - Cloudflare Pages: https://dash.cloudflare.com/pages"
echo ""
echo "⏱️ 部署通常需要2-5分钟完成"
#!/bin/bash

# GitHub + Cloudflare 自动化部署脚本
# 使用方法: ./scripts/github-setup.sh

set -e

echo "🚀 开始设置GitHub + Cloudflare自动化部署..."

# 检查是否已安装必要工具
check_dependencies() {
    echo "📋 检查依赖..."
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git未安装，请先安装Git"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js未安装，请先安装Node.js"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm未安装，请先安装npm"
        exit 1
    fi
    
    echo "✅ 依赖检查完成"
}

# 安装项目依赖
install_dependencies() {
    echo "📦 安装项目依赖..."
    npm install
    echo "✅ 依赖安装完成"
}

# 初始化Git仓库
init_git() {
    echo "🔧 初始化Git仓库..."
    
    if [ ! -d ".git" ]; then
        git init
        echo "✅ Git仓库初始化完成"
    else
        echo "ℹ️ Git仓库已存在"
    fi
    
    # 添加所有文件
    git add .
    
    # 检查是否有提交
    if git diff --staged --quiet; then
        echo "ℹ️ 没有新的更改需要提交"
    else
        git commit -m "Initial commit: Complete VPN sales system"
        echo "✅ 初始提交完成"
    fi
}

# 获取GitHub仓库信息
get_github_info() {
    echo "📝 请输入GitHub仓库信息:"
    
    read -p "GitHub用户名: " GITHUB_USERNAME
    read -p "仓库名称 (默认: cloudflare-xpanel): " REPO_NAME
    REPO_NAME=${REPO_NAME:-cloudflare-xpanel}
    
    GITHUB_REPO="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    
    echo "📍 GitHub仓库地址: $GITHUB_REPO"
}

# 添加远程仓库
add_remote() {
    echo "🔗 配置远程仓库..."
    
    # 检查是否已有远程仓库
    if git remote get-url origin &> /dev/null; then
        echo "ℹ️ 远程仓库已存在，更新地址..."
        git remote set-url origin $GITHUB_REPO
    else
        git remote add origin $GITHUB_REPO
    fi
    
    echo "✅ 远程仓库配置完成"
}

# 推送到GitHub
push_to_github() {
    echo "⬆️ 推送代码到GitHub..."
    
    # 设置主分支
    git branch -M main
    
    # 推送代码
    if git push -u origin main; then
        echo "✅ 代码推送成功"
    else
        echo "❌ 代码推送失败，请检查："
        echo "   1. GitHub仓库是否已创建"
        echo "   2. 是否有推送权限"
        echo "   3. 网络连接是否正常"
        exit 1
    fi
}

# 安装Wrangler CLI
install_wrangler() {
    echo "🔧 安装Wrangler CLI..."
    
    if ! command -v wrangler &> /dev/null; then
        npm install -g wrangler
        echo "✅ Wrangler CLI安装完成"
    else
        echo "ℹ️ Wrangler CLI已安装"
    fi
}

# 创建D1数据库
create_database() {
    echo "🗄️ 创建D1数据库..."
    
    echo "请先登录Cloudflare:"
    wrangler login
    
    echo "创建数据库..."
    DB_OUTPUT=$(wrangler d1 create xpanel-db)
    
    # 提取database_id
    DATABASE_ID=$(echo "$DB_OUTPUT" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)
    
    if [ -n "$DATABASE_ID" ]; then
        echo "✅ 数据库创建成功"
        echo "📋 Database ID: $DATABASE_ID"
        
        # 更新wrangler.toml
        sed -i.bak "s/database_id = \".*\"/database_id = \"$DATABASE_ID\"/" wrangler.toml
        echo "✅ wrangler.toml已更新"
    else
        echo "❌ 无法获取Database ID，请手动更新wrangler.toml"
    fi
}

# 初始化数据库
init_database() {
    echo "🔄 初始化数据库..."
    
    # 执行数据库结构
    wrangler d1 execute xpanel-db --file=./database/schema.sql
    echo "✅ 数据库结构创建完成"
    
    # 执行初始数据
    wrangler d1 execute xpanel-db --file=./database/seed.sql
    echo "✅ 初始数据插入完成"
}

# 显示后续步骤
show_next_steps() {
    echo ""
    echo "🎉 自动化设置完成！"
    echo ""
    echo "📋 接下来请手动完成以下步骤："
    echo ""
    echo "1. 在GitHub仓库中设置Secrets:"
    echo "   - 进入仓库 Settings > Secrets and variables > Actions"
    echo "   - 添加以下Secrets:"
    echo "     * CLOUDFLARE_API_TOKEN (从Cloudflare获取)"
    echo "     * CLOUDFLARE_ACCOUNT_ID (从Cloudflare获取)"
    echo "     * VITE_API_URL=https://your-domain.pages.dev/api"
    echo "     * VITE_APP_NAME=XPanel"
    echo "     * VITE_APP_DESCRIPTION=专业的VPN服务平台"
    echo ""
    echo "2. 在Cloudflare Pages中连接GitHub仓库:"
    echo "   - 进入Cloudflare Dashboard > Pages"
    echo "   - 点击 'Connect to Git'"
    echo "   - 选择您的GitHub仓库"
    echo "   - 配置构建设置 (Framework: Vite, Build: npm run build, Output: dist)"
    echo ""
    echo "3. 获取Cloudflare API Token:"
    echo "   - 进入 Cloudflare Dashboard > My Profile > API Tokens"
    echo "   - 创建Custom Token，权限包括: Cloudflare Pages:Edit, Account:Read"
    echo ""
    echo "📖 详细步骤请参考: GITHUB_DEPLOYMENT.md"
    echo ""
    echo "🌐 部署完成后，您的网站将在: https://your-domain.pages.dev"
    echo ""
    echo "🚀 祝您业务兴隆！"
}

# 主函数
main() {
    echo "🎯 XPanel VPN销售系统 - GitHub自动化部署设置"
    echo "================================================"
    
    check_dependencies
    install_dependencies
    init_git
    get_github_info
    add_remote
    push_to_github
    install_wrangler
    
    echo ""
    read -p "是否现在创建Cloudflare D1数据库? (y/n): " CREATE_DB
    if [[ $CREATE_DB =~ ^[Yy]$ ]]; then
        create_database
        init_database
    else
        echo "ℹ️ 跳过数据库创建，请稍后手动执行"
    fi
    
    show_next_steps
}

# 运行主函数
main
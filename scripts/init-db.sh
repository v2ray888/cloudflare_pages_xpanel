#!/bin/bash

# 数据库初始化脚本

set -e

echo "🗄️ 初始化数据库..."

# 检查 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ wrangler 未安装，请运行: npm install -g wrangler"
    exit 1
fi

# 读取数据库名称
DB_NAME="xpanel-db"

echo "📋 创建数据库: $DB_NAME"
wrangler d1 create $DB_NAME

echo "🏗️ 执行数据库结构..."
wrangler d1 execute $DB_NAME --file=./database/schema.sql

echo "🌱 插入初始数据..."
wrangler d1 execute $DB_NAME --file=./database/seed.sql

echo "✅ 数据库初始化完成！"
echo ""
echo "📝 请将生成的数据库 ID 更新到 wrangler.toml 文件中"
echo ""
echo "示例："
echo "[[d1_databases]]"
echo "binding = \"DB\""
echo "database_name = \"$DB_NAME\""
echo "database_id = \"your-database-id-here\""
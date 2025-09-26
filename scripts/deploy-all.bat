@echo off
title XPanel 部署脚本

echo 🚀 开始部署 XPanel...

REM 1. 构建前端项目
echo 🔧 构建前端项目...
npm run build

if %errorlevel% neq 0 (
    echo ❌ 前端构建失败
    pause
    exit /b 1
)

echo ✅ 前端构建完成

REM 2. 部署前端到 Cloudflare Pages
echo 🌐 部署前端到 Cloudflare Pages...
npm run deploy

if %errorlevel% neq 0 (
    echo ❌ 前端部署失败
    pause
    exit /b 1
)

echo ✅ 前端部署完成

REM 3. 部署后端 API 到 Cloudflare Workers
echo ⚙️  部署后端 API 到 Cloudflare Workers...
npm run deploy:api

if %errorlevel% neq 0 (
    echo ❌ 后端部署失败
    pause
    exit /b 1
)

echo ✅ 后端部署完成

echo 🎉 XPanel 部署完成!
echo 请确保已正确配置数据库并执行了数据库迁移脚本

pause
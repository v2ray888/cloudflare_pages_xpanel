@echo off
REM 重新部署Cloudflare Pages项目的脚本

echo 开始重新部署Cloudflare Pages项目...

REM 构建项目
echo 正在构建项目...
npm run build

if %errorlevel% neq 0 (
  echo 构建失败，请检查代码错误
  exit /b 1
)

echo 构建成功

REM 部署到Cloudflare Pages
echo 正在部署到Cloudflare Pages...
npx wrangler pages deploy dist --project-name=cloudflare-xpanel

if %errorlevel% neq 0 (
  echo 部署失败
  exit /b 1
)

echo 部署成功！
echo 您的网站应该在几分钟内更新
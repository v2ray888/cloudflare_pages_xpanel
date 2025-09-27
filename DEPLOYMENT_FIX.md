# Cloudflare Pages 部署修复指南

## 问题分析

您遇到的 405 Method Not Allowed 错误表明您的 API 请求没有被正确路由到 Cloudflare Functions。这通常是由于以下原因之一：

1. Functions 没有正确部署
2. 路由配置不正确
3. 项目结构不符合 Cloudflare Pages 要求

## 解决方案

### 1. 确保正确的项目结构

确保您的项目结构如下：
```
your-project/
├── dist/                 # 构建后的前端文件
├── functions/            # Cloudflare Functions
│   ├── api/              # API 路由（可以有子目录）
│   │   ├── routes/       # 路由处理器
│   │   └── ...           # 其他 API 文件
│   └── _worker.js        # 入口文件
├── src/                  # 前端源码
├── package.json
├── wrangler.toml
└── _routes.json          # 路由配置（可选）
```

### 2. 修复部署脚本

更新您的 package.json 中的部署脚本：

```json
{
  "scripts": {
    "build": "tsc && vite build",
    "deploy": "wrangler pages deploy dist",
    "deploy:all": "npm run build && npm run deploy"
  }
}
```

### 3. 部署步骤

1. 构建前端应用：
   ```bash
   npm run build
   ```

2. 部署到 Cloudflare Pages：
   ```bash
   npm run deploy
   ```

### 4. 验证部署

部署完成后，测试以下端点：

1. 测试基本 API 端点：
   ```bash
   curl -X GET https://your-domain.com/api/health
   ```

2. 测试管理员端点：
   ```bash
   curl -X POST https://your-domain.com/api/admin/plans-test
   ```

### 5. 常见问题排查

如果仍然遇到 405 错误：

1. 检查 Cloudflare Pages 仪表板中的 Functions 部署状态
2. 确保 _routes.json 配置正确（如果存在）
3. 检查 wrangler.toml 配置
4. 确保所有 Functions 文件导出正确的处理函数

### 6. 通过 GitHub 部署

如果您使用 GitHub 部署：

1. 确保 GitHub 仓库中的文件结构正确
2. 在 Cloudflare Pages 仪表板中检查构建设置
3. 确保构建命令为：`npm run build`
4. 确保构建输出目录为：`dist`

## 注意事项

1. Cloudflare Pages 的 Functions 会自动包含在页面部署中
2. 不需要单独部署 Functions
3. 确保所有环境变量在 wrangler.toml 中正确配置
4. 部署后可能需要几分钟时间生效
# Cloudflare Pages 详细配置步骤（图文指南）

## 🎯 第一步：选择存储库

### 1.1 进入Cloudflare Pages
- 打开浏览器，访问：https://dash.cloudflare.com
- 登录您的Cloudflare账户
- 在左侧导航栏找到并点击 **"Pages"**

### 1.2 连接Git仓库
- 在Pages页面，点击蓝色按钮 **"Connect to Git"**
- 选择 **"GitHub"** 选项
- 如果是首次使用，会弹出授权窗口，点击 **"Install & Authorize"**

### 1.3 选择仓库
- 在仓库列表中找到：**`v2ray888/cloudflare_pages_xpanel`**
- 点击仓库名称旁边的 **"Begin setup"** 按钮

---

## ⚙️ 第二步：设置构建和部署

现在您会看到 **"Set up builds and deployments"** 页面，需要填写以下信息：

### 2.1 项目基本信息

**项目名称输入框**：
```
Project name: xpanel
```
*（这个名称会成为您的默认域名：xpanel.pages.dev）*

**生产分支下拉菜单**：
```
Production branch: main
```
*（选择main分支作为生产环境）*

### 2.2 构建配置

**Framework preset 下拉菜单**：
- 点击下拉菜单
- 选择 **"React (Vite)"** - 这是最佳选择！
- 如果没有React (Vite)选项，选择 **"None"**

**Build command 输入框**：
```
npm run build
```
*（这是构建命令，告诉系统如何编译项目）*

**Build output directory 输入框**：
```
dist
```
*（这是构建后文件的输出目录）*

**Root directory 输入框**：
```
/
```
*（保持默认，或者留空）*

### 2.3 环境变量设置

在页面下方找到 **"Environment variables (advanced)"** 部分：

1. 点击 **"Add variable"** 按钮
2. 添加第一个变量：
   - **Variable name**: `VITE_API_URL`
   - **Value**: `https://xpanel.pages.dev/api`

3. 再次点击 **"Add variable"** 添加第二个：
   - **Variable name**: `VITE_APP_NAME`
   - **Value**: `XPanel`

4. 再次点击 **"Add variable"** 添加第三个：
   - **Variable name**: `VITE_APP_DESCRIPTION`
   - **Value**: `专业的VPN服务平台`

---

## 🚀 第三步：部署站点

### 3.1 开始部署
- 检查所有配置信息无误
- 点击页面底部的蓝色按钮 **"Save and Deploy"**

### 3.2 监控部署过程
部署开始后，您会看到部署日志页面，显示以下步骤：

1. **Initializing build** - 初始化构建环境
2. **Cloning repository** - 克隆GitHub仓库
3. **Installing dependencies** - 安装npm依赖包
4. **Building application** - 执行构建命令
5. **Deploying to Cloudflare's global network** - 部署到全球网络

### 3.3 部署状态
- ✅ **Success** - 绿色勾号表示部署成功
- ⏳ **Building** - 黄色圆圈表示正在构建
- ❌ **Failed** - 红色叉号表示构建失败

---

## 📋 完整配置表格

| 配置项 | 输入内容 | 说明 |
|--------|----------|------|
| Project name | `xpanel` | 项目名称，影响默认域名 |
| Production branch | `main` | 生产分支 |
| Framework preset | `React (Vite)` | 完美匹配我们的技术栈 |
| Build command | `npm run build` | 构建命令 |
| Build output directory | `dist` | 输出目录 |
| Root directory | `/` | 根目录（默认） |

### 环境变量表格

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `VITE_API_URL` | `https://xpanel.pages.dev/api` | API接口地址 |
| `VITE_APP_NAME` | `XPanel` | 应用名称 |
| `VITE_APP_DESCRIPTION` | `专业的VPN服务平台` | 应用描述 |

---

## 🔧 部署后的下一步

### 1. 获取访问地址
部署成功后，您会获得：
- **默认域名**: `https://xpanel.pages.dev`
- **部署ID**: 每次部署的唯一标识

### 2. 测试网站
- 点击域名链接访问网站
- 检查首页是否正常显示
- 测试各个页面功能

### 3. 配置自定义域名（可选）
- 在Pages项目设置中
- 点击 **"Custom domains"**
- 添加您的域名

---

## ❗ 常见问题

### Q: 找不到Vite选项怎么办？
**A**: 如果Framework preset中没有Vite选项，按以下步骤操作：
1. 选择 **"None"** 或 **"Static"**
2. 确保Build command填写：`npm run build`
3. 确保Build output directory填写：`dist`
4. 这样配置完全可以正常工作

### Q: 只看到VitePress选项怎么办？
**A**: 不要选择VitePress，选择 **"None"** 即可，因为我们的项目是标准的Vite项目，不是VitePress文档站点。

### Q: 构建失败怎么办？
**A**: 
1. 检查构建日志中的错误信息
2. 确认Node.js版本兼容性
3. 检查package.json中的依赖

### Q: 环境变量在哪里添加？
**A**: 在"Set up builds and deployments"页面的底部，找到"Environment variables (advanced)"部分。

### Q: 部署成功但网站打不开？
**A**: 
1. 等待几分钟让CDN生效
2. 检查浏览器缓存
3. 尝试无痕模式访问

---

## 🎉 恭喜！

按照以上步骤，您的VPN销售系统就成功部署到Cloudflare Pages了！

**下一步**: 配置D1数据库和API功能，详见 `CLOUDFLARE_PAGES_SETUP.md`
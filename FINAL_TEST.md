# 最终测试指南

## 测试清单

### 1. 健康检查端点
```bash
# 使用默认域名测试
curl -X GET https://b5d46610.cloudflare-pages-xpanel.pages.dev/api/health

# 使用自定义域名测试
curl -X GET https://xpanel.121858.xyz/api/health
```

### 2. 管理员计划管理端点
```bash
# 获取所有计划
curl -X GET https://b5d46610.cloudflare-pages-xpanel.pages.dev/api/admin/plans

# 创建新计划
curl -X POST https://b5d46610.cloudflare-pages-xpanel.pages.dev/api/admin/plans \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Plan", "price": 10, "duration_days": 30, "traffic_gb": 100}'

# 更新计划
curl -X PUT https://b5d46610.cloudflare-pages-xpanel.pages.dev/api/admin/plans/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Test Plan", "price": 15, "duration_days": 30, "traffic_gb": 100}'

# 删除计划
curl -X DELETE https://b5d46610.cloudflare-pages-xpanel.pages.dev/api/admin/plans/1
```

### 3. 管理员统计端点
```bash
# 获取管理员统计信息
curl -X GET https://b5d46610.cloudflare-pages-xpanel.pages.dev/api/admin/stats
```

## 常见问题排查

### 1. 如果仍然遇到 405 错误
- 检查您的自定义域名配置
- 确保在 Cloudflare 仪表板中正确设置了 DNS 记录
- 确保 SSL/TLS 设置正确

### 2. 如果遇到 401 或 403 错误
- 确保您使用有效的管理员 JWT token
- 检查您的 JWT_SECRET 配置是否正确

### 3. 如果遇到 500 错误
- 检查 Cloudflare 仪表板中的 Functions 日志
- 确保您的 D1 数据库配置正确
- 检查数据库连接和查询语句

## 部署后检查清单

- [ ] 确认所有 Functions 都已正确部署
- [ ] 验证自定义域名配置
- [ ] 测试所有 API 端点
- [ ] 检查数据库连接
- [ ] 验证管理员权限
- [ ] 测试前端页面加载
- [ ] 检查 CORS 配置
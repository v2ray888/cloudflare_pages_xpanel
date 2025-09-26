# API 文档

## 基础信息

- **Base URL**: `https://your-api.workers.dev`
- **认证方式**: Bearer Token (JWT)
- **数据格式**: JSON

## 响应格式

### 成功响应
```json
{
  "success": true,
  "message": "操作成功",
  "data": {}
}
```

### 错误响应
```json
{
  "success": false,
  "message": "错误信息"
}
```

## 认证接口

### 用户注册
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "用户名",
  "referral_code": "ABCD1234"
}
```

### 用户登录
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 兑换码兑换
```http
POST /auth/redeem
Content-Type: application/json

{
  "code": "REDEMPTION_CODE",
  "email": "user@example.com"
}
```

### 验证Token
```http
GET /auth/verify
Authorization: Bearer <token>
```

## 用户接口

### 获取用户信息
```http
GET /api/users/profile
Authorization: Bearer <token>
```

### 更新用户信息
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "新用户名",
  "phone": "13800138000"
}
```

### 修改密码
```http
PUT /api/users/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "current_password": "旧密码",
  "new_password": "新密码"
}
```

### 获取订阅信息
```http
GET /api/users/subscription
Authorization: Bearer <token>
```

### 获取订单列表
```http
GET /api/users/orders?page=1&limit=10&status=1
Authorization: Bearer <token>
```

## 套餐接口

### 获取套餐列表
```http
GET /plans
```

### 获取套餐详情
```http
GET /plans/:id
```

## 订单接口

### 创建订单
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan_id": 1,
  "coupon_code": "DISCOUNT10"
}
```

### 获取订单详情
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

### 取消订单
```http
PUT /api/orders/:id/cancel
Authorization: Bearer <token>
```

## 服务器接口

### 获取服务器列表
```http
GET /api/servers
Authorization: Bearer <token>
```

### 获取服务器配置
```http
GET /api/servers/:id/config
Authorization: Bearer <token>
```

## 推广接口

### 获取推广统计
```http
GET /api/referrals/stats
Authorization: Bearer <token>
```

### 获取佣金记录
```http
GET /api/referrals/commissions?page=1&limit=20
Authorization: Bearer <token>
```

### 获取推荐用户
```http
GET /api/referrals/users?page=1&limit=20
Authorization: Bearer <token>
```

### 申请提现
```http
POST /api/referrals/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100,
  "payment_method": "alipay",
  "payment_account": "user@example.com"
}
```

## 管理员接口

### 获取统计数据
```http
GET /api/admin/stats
Authorization: Bearer <admin_token>
```

### 获取用户列表
```http
GET /api/admin/users?page=1&limit=20&search=keyword&status=1
Authorization: Bearer <admin_token>
```

### 更新用户状态
```http
PUT /api/admin/users/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": 1
}
```

### 获取订单列表
```http
GET /api/admin/orders?page=1&limit=20&status=1
Authorization: Bearer <admin_token>
```

### 生成兑换码
```http
POST /api/admin/redemption
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "plan_id": 1,
  "quantity": 10,
  "expires_at": "2024-12-31T23:59:59Z",
  "note": "活动兑换码"
}
```

### 获取兑换码列表
```http
GET /api/admin/redemption?page=1&limit=20&status=0
Authorization: Bearer <admin_token>
```

### 删除兑换码
```http
DELETE /api/admin/redemption/:id
Authorization: Bearer <admin_token>
```

## 支付接口

### 获取支付方式
```http
GET /payments/methods
```

### 支付回调
```http
POST /payments/callback
Content-Type: application/json

{
  "order_no": "ORD123456789",
  "status": "success",
  "transaction_id": "txn_123456",
  "payment_method": "alipay"
}
```

## 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 状态码

### 订单状态
- `0`: 待支付
- `1`: 已支付
- `2`: 已取消
- `3`: 已退款

### 用户状态
- `0`: 已禁用
- `1`: 正常

### 订阅状态
- `0`: 未激活
- `1`: 已激活
- `2`: 已过期

### 兑换码状态
- `0`: 未使用
- `1`: 已使用

### 服务器状态
- `0`: 已禁用
- `1`: 正常
- `2`: 维护中

### 佣金状态
- `0`: 待结算
- `1`: 已结算
- `2`: 已提现
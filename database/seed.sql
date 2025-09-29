-- 插入默认管理员用户 (密码: admin123)
INSERT OR REPLACE INTO users (id, email, password_hash, username, role, referral_code, created_at) VALUES
(1, 'admin@xpanel.com', '$2b$10$r80kFi4KQZ9wwu3kje/aPOFgkA6yjccMdeDDfnmH2yFKwt6ipxRam', 'Admin', 1, 'ADMIN001', datetime('now'));

-- 插入默认套餐
INSERT OR REPLACE INTO plans (id, name, price, duration_days, traffic_gb, is_active, is_public) VALUES
(1, '月付套餐', 10.00, 30, 100, 1, 1);

-- 为管理员用户添加订阅
INSERT OR REPLACE INTO user_subscriptions (id, user_id, plan_id, status, start_date, end_date, traffic_total) VALUES
(1, 1, 1, 1, datetime('now'), datetime('now', '+30 days'), 100 * 1024 * 1024 * 1024);

-- 插入更多用户
INSERT OR REPLACE INTO users (id, email, password_hash, username, role, referrer_id, referral_code, created_at) VALUES
(2, 'user1@example.com', '$2b$10$r80kFi4KQZ9wwu3kje/aPOFgkA6yjccMdeDDfnmH2yFKwt6ipxRam', 'User One', 0, 1, 'USER001', datetime('now', '-1 day')),
(3, 'user2@example.com', '$2b$10$r80kFi4KQZ9wwu3kje/aPOFgkA6yjccMdeDDfnmH2yFKwt6ipxRam', 'User Two', 0, null, 'USER002', datetime('now', '-2 days')),
(4, 'user3@example.com', '$2b$10$r80kFi4KQZ9wwu3kje/aPOFgkA6yjccMdeDDfnmH2yFKwt6ipxRam', 'User Three', 0, null, 'USER003', datetime('now', '-3 days'));

-- 插入更多套餐
INSERT OR REPLACE INTO plans (id, name, description, price, original_price, duration_days, traffic_gb, device_limit, is_active, is_public, is_popular) VALUES
(2, '季付套餐', '专为长期用户设计，更优惠', 27.00, 30.00, 90, 300, 5, 1, 1, 1),
(3, '年付套餐', '最大折扣，畅享全年', 99.00, 120.00, 365, 1200, 10, 1, 1, 0);

-- 插入服务器节点
INSERT OR REPLACE INTO servers (id, name, host, port, protocol, country, city, is_active) VALUES
(1, '日本-东京-高速专线', 'jp.example.com', 443, 'vless', '日本', '东京', 1),
(2, '美国-洛杉矶-优化网络', 'us.example.com', 443, 'vless', '美国', '洛杉矶', 1);

-- 插入订单
INSERT OR REPLACE INTO orders (id, order_no, user_id, plan_id, amount, final_amount, status, payment_method, paid_at) VALUES
(1, 'ORDER001', 2, 2, 27.00, 27.00, 1, 'alipay', datetime('now', '-1 day')),
(2, 'ORDER002', 3, 1, 10.00, 10.00, 0, null, null),
(3, 'ORDER003', 4, 3, 99.00, 99.00, 0, null, null);

-- 插入推广佣金
INSERT OR REPLACE INTO referral_commissions (id, referrer_id, referee_id, order_id, commission_rate, commission_amount, status) VALUES
(1, 1, 2, 1, 10.00, 2.70, 0);

-- 查询管理员用户
SELECT * FROM users WHERE email = 'admin@xpanel.com';

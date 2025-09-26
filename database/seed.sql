-- 插入系统设置
INSERT OR REPLACE INTO system_settings (key, value, description) VALUES
('site_name', 'XPanel', '网站名称'),
('site_description', '专业VPN服务提供商', '网站描述'),
('site_logo', '/logo.png', '网站Logo'),
('commission_rate', '0.10', '默认佣金比例'),
('min_withdrawal', '100.00', '最小提现金额'),
('currency', 'CNY', '货币单位'),
('payment_methods', '["alipay", "wechat"]', '支付方式'),
('smtp_host', '', 'SMTP服务器'),
('smtp_port', '587', 'SMTP端口'),
('smtp_user', '', 'SMTP用户名'),
('smtp_pass', '', 'SMTP密码');

-- 插入默认管理员用户 (密码: admin123)
INSERT OR REPLACE INTO users (id, email, password_hash, username, role, referral_code, created_at) VALUES
(1, 'admin@xpanel.com', '$2b$10$rQZ8kHWKQVnFnxjibfTxHOmKt6BvQVKQVnFnxjibfTxHOmKt6BvQV', 'Admin', 1, 'ADMIN001', datetime('now'));

-- 插入示例套餐
INSERT OR REPLACE INTO plans (name, description, price, original_price, duration_days, traffic_gb, device_limit, features, sort_order, is_popular) VALUES
('体验套餐', '适合轻度使用用户', 9.90, 19.90, 30, 50, 2, '["高速节点", "24小时客服"]', 1, 0),
('标准套餐', '最受欢迎的选择', 29.90, 39.90, 30, 200, 3, '["高速节点", "24小时客服", "多设备支持"]', 2, 1),
('专业套餐', '重度使用用户首选', 49.90, 69.90, 30, 500, 5, '["高速节点", "24小时客服", "多设备支持", "专线节点"]', 3, 0),
('季度套餐', '三个月超值优惠', 79.90, 119.90, 90, 600, 3, '["高速节点", "24小时客服", "多设备支持", "季度优惠"]', 4, 0),
('半年套餐', '半年期超值选择', 149.90, 239.90, 180, 1200, 5, '["高速节点", "24小时客服", "多设备支持", "半年优惠"]', 5, 0),
('年度套餐', '全年最优惠价格', 279.90, 479.90, 365, 2400, 8, '["高速节点", "24小时客服", "多设备支持", "年度优惠", "专属客服"]', 6, 1);

-- 插入示例服务器节点
INSERT OR REPLACE INTO servers (name, host, port, protocol, method, password, country, city, flag_emoji, load_balance, is_active) VALUES
('香港-01', 'hk01.example.com', 443, 'ss', 'aes-256-gcm', 'password123', 'Hong Kong', 'Hong Kong', '🇭🇰', 100, 1),
('日本-01', 'jp01.example.com', 443, 'v2ray', 'aes-128-gcm', '', 'Japan', 'Tokyo', '🇯🇵', 90, 1),
('美国-01', 'us01.example.com', 443, 'trojan', '', 'trojan123', 'United States', 'Los Angeles', '🇺🇸', 80, 1),
('新加坡-01', 'sg01.example.com', 443, 'ss', 'aes-256-gcm', 'password456', 'Singapore', 'Singapore', '🇸🇬', 95, 1),
('韩国-01', 'kr01.example.com', 443, 'v2ray', 'aes-128-gcm', '', 'South Korea', 'Seoul', '🇰🇷', 85, 1);

-- 插入示例公告
INSERT OR REPLACE INTO announcements (title, content, type, created_by) VALUES
('欢迎使用XPanel', '感谢您选择我们的VPN服务，我们将为您提供最优质的网络体验。', 0, 1),
('新节点上线通知', '我们新增了多个高速节点，包括香港、日本、美国等地区，欢迎体验。', 1, 1),
('系统维护通知', '系统将于今晚23:00-01:00进行维护升级，期间可能影响部分功能使用。', 2, 1);
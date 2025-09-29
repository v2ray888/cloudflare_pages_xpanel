INSERT OR REPLACE INTO announcements (title, content, type, is_active, created_by, created_at) VALUES
('欢迎使用XPanel', '感谢您选择我们的VPN服务，我们将为您提供最优质的网络体验。', 0, 1, 1, datetime('now', '-30 days')),
('新节点上线通知', '我们新增了多个高速节点，包括香港、日本、美国等地区，欢迎体验。', 1, 1, 1, datetime('now', '-15 days')),
('系统维护通知', '系统将于今晚23:00-01:00进行维护升级，期间可能影响部分功能使用。', 2, 1, 1, datetime('now', '-1 days')),
('五一优惠活动', '五一劳动节期间，所有套餐享受8折优惠，活动时间：5月1日-5月5日。', 1, 1, 1, datetime('now', '-5 days')),
('新增支付方式', '我们现已支持PayPal支付，为全球用户提供更多支付选择。', 0, 1, 1, datetime('now', '-10 days'));
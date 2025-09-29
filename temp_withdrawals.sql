INSERT OR REPLACE INTO withdrawals (user_id, amount, payment_method, payment_account, real_name, status, admin_note, processed_at, created_at) VALUES
(2, 50.00, 'alipay', 'user1@example.com', '用户1', 1, '已处理', datetime('now', '-5 days'), datetime('now', '-7 days')),
(3, 30.00, 'wechat', 'user2_wechat', '用户2', 1, '已处理', datetime('now', '-3 days'), datetime('now', '-5 days')),
(5, 20.00, 'alipay', 'user5@example.com', '用户5', 0, NULL, NULL, datetime('now', '-1 days')),
(1, 100.00, 'bank', '6222001234567890', 'Admin', 1, '已处理', datetime('now', '-2 days'), datetime('now', '-3 days'));
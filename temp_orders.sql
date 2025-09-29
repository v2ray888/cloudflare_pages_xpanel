INSERT OR REPLACE INTO orders (order_no, user_id, plan_id, amount, discount_amount, final_amount, status, payment_method, paid_at, created_at) VALUES
('ORD20230501001', 2, 2, 29.90, 0, 29.90, 1, 'alipay', datetime('now', '-10 days'), datetime('now', '-10 days')),
('ORD20230505001', 3, 3, 49.90, 0, 49.90, 1, 'wechat', datetime('now', '-5 days'), datetime('now', '-5 days')),
('ORD20230510001', 4, 1, 9.90, 0, 9.90, 1, 'alipay', datetime('now', '-2 days'), datetime('now', '-2 days')),
('ORD20230512001', 5, 4, 79.90, 0, 79.90, 1, 'wechat', datetime('now', '-1 days'), datetime('now', '-1 days')),
('ORD20230512002', 6, 2, 29.90, 0, 29.90, 0, 'alipay', NULL, datetime('now'));
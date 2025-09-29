INSERT OR REPLACE INTO redemption_codes (code, plan_id, status, used_by, used_at, expires_at, created_by, batch_id, created_at) VALUES
('REDEEM001', 1, 0, NULL, NULL, datetime('now', '+30 days'), 1, 'BATCH001', datetime('now')),
('REDEEM002', 2, 1, 2, datetime('now', '-5 days'), datetime('now', '+30 days'), 1, 'BATCH001', datetime('now', '-10 days')),
('REDEEM003', 3, 0, NULL, NULL, datetime('now', '+30 days'), 1, 'BATCH002', datetime('now')),
('REDEEM004', 1, 2, NULL, NULL, datetime('now', '-5 days'), 1, 'BATCH002', datetime('now', '-30 days')),
('REDEEM005', 4, 0, NULL, NULL, datetime('now', '+30 days'), 1, 'BATCH003', datetime('now')),
('REDEEM006', 2, 0, NULL, NULL, datetime('now', '+30 days'), 1, 'BATCH004', datetime('now')),
('REDEEM007', 5, 0, NULL, NULL, datetime('now', '+30 days'), 1, 'BATCH004', datetime('now')),
('REDEEM008', 6, 0, NULL, NULL, datetime('now', '+30 days'), 1, 'BATCH005', datetime('now'));
INSERT OR REPLACE INTO referral_commissions (referrer_id, referee_id, order_id, commission_rate, commission_amount, status, settled_at, created_at) VALUES
(1, 2, 1, 0.10, 2.99, 1, datetime('now', '-9 days'), datetime('now', '-10 days')),
(1, 3, 2, 0.10, 4.99, 1, datetime('now', '-4 days'), datetime('now', '-5 days')),
(1, 4, 3, 0.10, 0.99, 0, NULL, datetime('now', '-2 days')),
(1, 5, 4, 0.10, 7.99, 1, datetime('now', '-1 days'), datetime('now', '-1 days'));
INSERT OR REPLACE INTO user_subscriptions (user_id, plan_id, status, start_date, end_date, traffic_used, traffic_total, device_limit) VALUES
(2, 2, 1, datetime('now', '-10 days'), datetime('now', '+20 days'), 1073741824, 21474836480, 3),
(3, 3, 1, datetime('now', '-5 days'), datetime('now', '+25 days'), 2147483648, 53687091200, 5),
(4, 1, 0, datetime('now', '-40 days'), datetime('now', '-10 days'), 0, 5368709120, 2),
(5, 4, 1, datetime('now', '-2 days'), datetime('now', '+88 days'), 536870912, 64424509440, 3),
(6, 2, 1, datetime('now', '-1 days'), datetime('now', '+29 days'), 107374182, 21474836480, 3);
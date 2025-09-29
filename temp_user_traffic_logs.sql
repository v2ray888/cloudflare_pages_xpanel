INSERT OR REPLACE INTO user_traffic_logs (user_id, server_id, upload_bytes, download_bytes, total_bytes, recorded_at) VALUES
(2, 1, 107374182, 966367641, 1073741824, datetime('now', '-1 days')),
(2, 2, 53687091, 483183820, 536870912, datetime('now', '-2 days')),
(3, 3, 214748364, 1932735283, 2147483648, datetime('now', '-1 days')),
(4, 1, 10737418, 96636764, 107374182, datetime('now', '-1 days')),
(5, 4, 53687091, 483183820, 536870912, datetime('now', '-1 days')),
(6, 2, 107374182, 966367641, 1073741824, datetime('now', '-1 days')),
(2, 3, 75161927, 676367641, 75161927, datetime('now', '-3 days')),
(3, 1, 142606336, 1283741824, 142606336, datetime('now', '-2 days')),
(5, 2, 322122547, 2899102925, 322122547, datetime('now', '-1 days'));
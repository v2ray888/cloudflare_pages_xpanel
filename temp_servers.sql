INSERT OR REPLACE INTO servers (name, host, port, protocol, method, password, country, city, flag_emoji, load_balance, is_active, current_users, max_users, sort_order) VALUES
('香港-01', 'hk01.example.com', 443, 'ss', 'aes-256-gcm', 'password123', 'Hong Kong', 'Hong Kong', '🇭🇰', 100, 1, 150, 1000, 1),
('日本-01', 'jp01.example.com', 443, 'v2ray', 'aes-128-gcm', '', 'Japan', 'Tokyo', '🇯🇵', 90, 1, 120, 1000, 2),
('美国-01', 'us01.example.com', 443, 'trojan', '', 'trojan123', 'United States', 'Los Angeles', '🇺🇸', 80, 1, 90, 1000, 3),
('新加坡-01', 'sg01.example.com', 443, 'ss', 'aes-256-gcm', 'password456', 'Singapore', 'Singapore', '🇸🇬', 95, 1, 110, 1000, 4),
('韩国-01', 'kr01.example.com', 443, 'v2ray', 'aes-128-gcm', '', 'South Korea', 'Seoul', '🇰🇷', 85, 1, 80, 1000, 5),
('台湾-01', 'tw01.example.com', 443, 'ss', 'aes-128-gcm', 'password789', 'Taiwan', 'Taipei', '🇹🇼', 75, 1, 70, 1000, 6),
('英国-01', 'uk01.example.com', 443, 'v2ray', 'aes-256-gcm', '', 'United Kingdom', 'London', '🇬🇧', 70, 1, 60, 1000, 7),
('德国-01', 'de01.example.com', 443, 'trojan', '', 'trojan456', 'Germany', 'Frankfurt', '🇩🇪', 65, 1, 50, 1000, 8);
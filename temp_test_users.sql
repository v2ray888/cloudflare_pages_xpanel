INSERT OR REPLACE INTO users (id, email, password_hash, username, role, referral_code, balance, commission_balance, status, created_at) VALUES
(2, 'user1@example.com', '$2b$10$r80kFi4KQZ9wwu3kje/aPOFgkA6yjccMdeDDfnmH2yFKwt6ipxRam', '用户1', 0, 'USER001', 100.00, 50.00, 1, datetime('now', '-30 days')),
(3, 'user2@example.com', '$2b$10$r80kFi4KQZ9wwu3kje/aPOFgkA6yjccMdeDDfnmH2yFKwt6ipxRam', '用户2', 0, 'USER002', 200.00, 30.00, 1, datetime('now', '-25 days')),
(4, 'user3@example.com', '$2b$10$r80kFi4KQZ9wwu3kje/aPOFgkA6yjccMdeDDfnmH2yFKwt6ipxRam', '用户3', 0, 'USER003', 150.00, 20.00, 1, datetime('now', '-20 days')),
(5, 'user4@example.com', '$2b$10$r80kFi4KQZ9wwu3kje/aPOFgkA6yjccMdeDDfnmH2yFKwt6ipxRam', '用户4', 0, 'USER004', 75.00, 10.00, 1, datetime('now', '-15 days')),
(6, 'user5@example.com', '$2b$10$r80kFi4KQZ9wwu3kje/aPOFgkA6yjccMdeDDfnmH2yFKwt6ipxRam', '用户5', 0, 'USER005', 300.00, 80.00, 1, datetime('now', '-10 days'));
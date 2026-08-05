USE task_management_system;

SET @org_id = (SELECT id FROM organizations WHERE slug = 'pt-tenaga-kanggo-indonesia');

INSERT INTO tasks (id, organization_id, task_number, title, description, status, priority, deadline, user_id, created_by, created_at, updated_at) VALUES
(UUID(), @org_id, CONCAT('TSK-', @org_id, '-', LPAD(1, 12, '0')), 'Implement user authentication system', 'Need to ensure proper validation and security measures are in place', 'pending', 'high', DATE_ADD(NOW(), INTERVAL 15 DAY), FLOOR(1 + RAND() * 100), FLOOR(1 + RAND() * 100), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY), NOW()),
(UUID(), @org_id, CONCAT('TSK-', @org_id, '-', LPAD(2, 12, '0')), 'Fix bug in payment processing', 'This is blocking production deployment and needs immediate attention', 'in_progress', 'high', DATE_ADD(NOW(), INTERVAL 7 DAY), FLOOR(1 + RAND() * 100), FLOOR(1 + RAND() * 100), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY), NOW()),
(UUID(), @org_id, CONCAT('TSK-', @org_id, '-', LPAD(3, 12, '0')), 'Update API documentation', 'Users have reported issues with this functionality multiple times', 'pending', 'medium', DATE_ADD(NOW(), INTERVAL 10 DAY), FLOOR(1 + RAND() * 100), FLOOR(1 + RAND() * 100), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY), NOW()),
(UUID(), @org_id, CONCAT('TSK-', @org_id, '-', LPAD(4, 12, '0')), 'Refactor database queries', 'Current implementation is causing performance bottlenecks', 'in_progress', 'high', DATE_ADD(NOW(), INTERVAL 5 DAY), FLOOR(1 + RAND() * 100), FLOOR(1 + RAND() * 100), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY), NOW()),
(UUID(), @org_id, CONCAT('TSK-', @org_id, '-', LPAD(5, 12, '0')), 'Design new landing page', 'Stakeholders requested this feature for the next release', 'pending', 'medium', DATE_ADD(NOW(), INTERVAL 20 DAY), FLOOR(1 + RAND() * 100), FLOOR(1 + RAND() * 100), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY), NOW());

INSERT INTO task_number_sequences (organization_id, last_number) VALUES (@org_id, 500) ON DUPLICATE KEY UPDATE last_number = 500;

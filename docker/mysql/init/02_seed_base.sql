USE task_management_system;

INSERT INTO organizations (name, slug, status) VALUES
('PT. Tenaga Kanggo Indonesia', 'pt-tenaga-kanggo-indonesia', 'active');

SET @org_id = LAST_INSERT_ID();

INSERT INTO roles (organization_id, code, name, description, is_system) VALUES
(NULL, 'superadmin', 'Super Administrator', 'Full system access', 1),
(@org_id, 'admin', 'Administrator', 'Organization admin', 0),
(@org_id, 'manager', 'Manager', 'Team manager', 0),
(@org_id, 'user', 'User', 'Regular user', 0),
(@org_id, 'viewer', 'Viewer', 'Read-only access', 0);

SET @role_superadmin = (SELECT id FROM roles WHERE code = 'superadmin');
SET @role_admin = (SELECT id FROM roles WHERE code = 'admin' AND organization_id = @org_id);
SET @role_manager = (SELECT id FROM roles WHERE code = 'manager' AND organization_id = @org_id);
SET @role_user = (SELECT id FROM roles WHERE code = 'user' AND organization_id = @org_id);
SET @role_viewer = (SELECT id FROM roles WHERE code = 'viewer' AND organization_id = @org_id);

INSERT INTO permissions (code, module, description) VALUES
('task.read', 'task', 'Read tasks'),
('task.create', 'task', 'Create tasks'),
('task.update', 'task', 'Update tasks'),
('task.delete', 'task', 'Delete tasks'),
('task.assign', 'task', 'Assign tasks'),
('user.read', 'user', 'Read users'),
('user.create', 'user', 'Create users'),
('user.update', 'user', 'Update users'),
('user.delete', 'user', 'Delete users'),
('role.read', 'role', 'Read roles'),
('role.create', 'role', 'Create roles'),
('role.update', 'role', 'Update roles'),
('role.delete', 'role', 'Delete roles'),
('org.read', 'organization', 'Read organization'),
('org.update', 'organization', 'Update organization');

INSERT INTO role_permissions (role_id, permission_id)
SELECT @role_superadmin, id FROM permissions;

INSERT INTO role_permissions (role_id, permission_id)
SELECT @role_admin, id FROM permissions WHERE code IN ('task.read', 'task.create', 'task.update', 'task.delete', 'task.assign', 'user.read', 'user.create', 'user.update', 'role.read', 'org.read');

INSERT INTO role_permissions (role_id, permission_id)
SELECT @role_manager, id FROM permissions WHERE code IN ('task.read', 'task.create', 'task.update', 'task.assign', 'user.read');

INSERT INTO role_permissions (role_id, permission_id)
SELECT @role_user, id FROM permissions WHERE code IN ('task.read', 'task.create', 'task.update');

INSERT INTO role_permissions (role_id, permission_id)
SELECT @role_viewer, id FROM permissions WHERE code IN ('task.read', 'user.read');

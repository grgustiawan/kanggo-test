import { db, pool } from '../index';
import { organizations, roles, permissions, rolePermissions, users, userRoles } from '../schema';
import argon2 from 'argon2';

async function seedBase() {
    console.log('Starting base data seeding...');

    const org = await db.insert(organizations).values({
        name: 'PT. Tenaga Kanggo Indonesia',
        slug: 'pt-tenaga-kanggo-indonesia',
        status: 'active',
    });

    const organizationId = Number(org[0].insertId);
    console.log('✓ Organization created:', organizationId);

    const rolesData = [
        { organizationId: null, code: 'superadmin', name: 'Super Administrator', description: 'Full system access', isSystem: 1 },
        { organizationId, code: 'admin', name: 'Administrator', description: 'Organization admin', isSystem: 0 },
        { organizationId, code: 'manager', name: 'Manager', description: 'Team manager', isSystem: 0 },
        { organizationId, code: 'user', name: 'User', description: 'Regular user', isSystem: 0 },
        { organizationId, code: 'viewer', name: 'Viewer', description: 'Read-only access', isSystem: 0 },
    ];

    const roleInserts = await db.insert(roles).values(rolesData);
    const roleIds = {
        superadmin: Number(roleInserts[0].insertId),
        admin: Number(roleInserts[0].insertId) + 1,
        manager: Number(roleInserts[0].insertId) + 2,
        user: Number(roleInserts[0].insertId) + 3,
        viewer: Number(roleInserts[0].insertId) + 4,
    };
    console.log('✓ Roles created');

    const permissionsData = [
        { code: 'task.read', module: 'task', description: 'Read tasks' },
        { code: 'task.create', module: 'task', description: 'Create tasks' },
        { code: 'task.update', module: 'task', description: 'Update tasks' },
        { code: 'task.delete', module: 'task', description: 'Delete tasks' },
        { code: 'task.assign', module: 'task', description: 'Assign tasks' },
        { code: 'user.read', module: 'user', description: 'Read users' },
        { code: 'user.create', module: 'user', description: 'Create users' },
        { code: 'user.update', module: 'user', description: 'Update users' },
        { code: 'user.delete', module: 'user', description: 'Delete users' },
        { code: 'role.read', module: 'role', description: 'Read roles' },
        { code: 'role.create', module: 'role', description: 'Create roles' },
        { code: 'role.update', module: 'role', description: 'Update roles' },
        { code: 'role.delete', module: 'role', description: 'Delete roles' },
        { code: 'org.read', module: 'organization', description: 'Read organization' },
        { code: 'org.update', module: 'organization', description: 'Update organization' },
    ];

    const permInserts = await db.insert(permissions).values(permissionsData);
    const permissionIds: { [key: string]: number } = {};
    permissionsData.forEach((perm, idx) => {
        permissionIds[perm.code] = Number(permInserts[0].insertId) + idx;
    });
    console.log('✓ Permissions created');

    const rolePermissionsData = [
        ...['task.read', 'task.create', 'task.update', 'task.delete', 'task.assign', 'user.read', 'user.create', 'user.update', 'user.delete', 'role.read', 'role.create', 'role.update', 'role.delete', 'org.read', 'org.update'].map(p => ({ roleId: roleIds.superadmin, permissionId: permissionIds[p] })),
        ...['task.read', 'task.create', 'task.update', 'task.delete', 'task.assign', 'user.read', 'user.create', 'user.update', 'role.read', 'org.read'].map(p => ({ roleId: roleIds.admin, permissionId: permissionIds[p] })),
        ...['task.read', 'task.create', 'task.update', 'task.assign', 'user.read'].map(p => ({ roleId: roleIds.manager, permissionId: permissionIds[p] })),
        ...['task.read', 'task.create', 'task.update'].map(p => ({ roleId: roleIds.user, permissionId: permissionIds[p] })),
        ...['task.read', 'user.read'].map(p => ({ roleId: roleIds.viewer, permissionId: permissionIds[p] })),
    ];

    await db.insert(rolePermissions).values(rolePermissionsData);
    console.log('✓ Role permissions created');

    const passwordHash = await argon2.hash('testkanggo2026');
    const firstNames = ['Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hadi', 'Indah', 'Joko', 'Kartika', 'Lina', 'Made', 'Novi', 'Oki', 'Putra', 'Ratna', 'Sari', 'Tono', 'Udin', 'Vina', 'Wati', 'Yudi', 'Zaki'];
    const lastNames = ['Pratama', 'Wijaya', 'Santoso', 'Kusuma', 'Permata', 'Nugraha', 'Saputra', 'Utama', 'Wibowo', 'Setiawan', 'Hartono', 'Gunawan', 'Hidayat', 'Sudiro', 'Prabowo', 'Adiputra', 'Dharma', 'Kusnandar', 'Mahendra', 'Prasojo'];
    
    const usersData = [];
    for (let i = 1; i <= 100; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${firstName} ${lastName}`;
        const email = `user${i}@kanggo.test`;
        
        usersData.push({
            organizationId,
            email,
            passwordHash,
            name,
            status: 'active' as const,
            isEmailVerified: 1,
        });
    }

    const batchSize = 50;
    const userIds: number[] = [];
    
    for (let i = 0; i < usersData.length; i += batchSize) {
        const batch = usersData.slice(i, i + batchSize);
        const userInsert = await db.insert(users).values(batch);
        const startId = Number(userInsert[0].insertId);
        for (let j = 0; j < batch.length; j++) {
            userIds.push(startId + j);
        }
    }
    console.log('✓ 100 users created');

    const userRolesData = userIds.map((userId, idx) => ({
        userId,
        roleId: idx === 0 ? roleIds.admin : roleIds.user,
        organizationId,
    }));

    for (let i = 0; i < userRolesData.length; i += batchSize) {
        const batch = userRolesData.slice(i, i + batchSize);
        await db.insert(userRoles).values(batch);
    }
    console.log('✓ 100 user roles created');

    return { organizationId, userIds };
}

export { seedBase };

if (require.main === module) {
    seedBase()
        .then(() => {
            console.log('Base seeding completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Seeding failed:', error);
            process.exit(1);
        });
}

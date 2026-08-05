import { seedBase } from './seed-base';
import { seed1MTasks } from './seed-tasks';
import { pool } from '../index';

async function runFullSeed() {
    console.log('='.repeat(60));
    console.log('FULL DATABASE SEEDING - 1 MILLION TASKS');
    console.log('='.repeat(60));
    console.log('');

    try {
        console.log('Step 1: Seeding base data (organization, users, roles, permissions)...');
        console.log('-'.repeat(60));
        const { organizationId, userIds } = await seedBase();
        console.log('');

        console.log('Step 2: Seeding 1 million tasks...');
        console.log('-'.repeat(60));
        console.log(`Using Organization ID: ${organizationId}`);
        console.log(`Using ${userIds.length} users`);
        console.log('');

        await seed1MTasks(organizationId, userIds);

        console.log('');
        console.log('='.repeat(60));
        console.log('✓ FULL SEEDING COMPLETED SUCCESSFULLY');
        console.log('='.repeat(60));
        console.log('');
        console.log('Database ready for performance testing!');
        console.log('');

    } catch (error) {
        console.error('');
        console.error('='.repeat(60));
        console.error('✗ SEEDING FAILED');
        console.error('='.repeat(60));
        console.error(error);
        throw error;
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    runFullSeed()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

export { runFullSeed };

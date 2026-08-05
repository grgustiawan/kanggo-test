import { pool } from '../index';

async function seed1MTasks(organizationId: number, userIds: number[], totalTasks: number = 100000) {
    console.log(`Starting ${totalTasks.toLocaleString()} tasks seeding...`);
    console.log(`Organization ID: ${organizationId}`);
    console.log(`Users available: ${userIds.length}`);

    const verbsIndo = ['Membuat', 'Memperbaiki', 'Mengupdate', 'Mengoptimasi', 'Mendesain', 'Mengintegrasikan', 'Mengimplementasi', 'Menambahkan', 'Menghapus', 'Merefactor', 'Menganalisa', 'Menguji', 'Deploy', 'Setup', 'Konfigurasi', 'Migrasi', 'Review', 'Validasi', 'Monitoring', 'Backup'];

    const verbsEng = ['Create', 'Fix', 'Update', 'Optimize', 'Design', 'Integrate', 'Implement', 'Add', 'Remove', 'Refactor', 'Analyze', 'Test', 'Deploy', 'Setup', 'Configure', 'Migrate', 'Review', 'Validate', 'Monitor', 'Backup'];

    const objects = [
        'sistem autentikasi', 'halaman dashboard', 'API endpoint', 'database schema', 'user interface',
        'payment gateway', 'notifikasi email', 'fitur search', 'laporan penjualan', 'modul inventory',
        'sistem logging', 'cache strategy', 'file upload', 'export data', 'import data',
        'real-time chat', 'video call', 'push notification', 'dark mode', 'multi-language',
        'admin panel', 'user profile', 'settings page', 'landing page', 'checkout flow',
        'shopping cart', 'wishlist', 'review system', 'rating feature', 'comment section',
        'filter products', 'sort functionality', 'pagination', 'breadcrumb', 'sidebar menu',
        'mobile responsive', 'tablet view', 'PWA support', 'SEO optimization', 'analytics tracking',
        'social media login', 'OAuth integration', 'JWT token', 'session management', 'role permissions',
        'audit trail', 'error handling', 'validation rules', 'security patch', 'SSL certificate',
        'load balancer', 'CDN setup', 'backup automation', 'disaster recovery', 'scalability plan',
        'API documentation', 'user manual', 'technical spec', 'test cases', 'deployment guide',
        'invoice generator', 'receipt printer', 'barcode scanner', 'QR code', 'payment confirmation',
        'shipping integration', 'tracking number', 'delivery status', 'warehouse management', 'stock alert',
        'customer feedback', 'survey form', 'contact form', 'live chat support', 'ticket system',
        'knowledge base', 'FAQ section', 'help center', 'tutorial videos', 'onboarding wizard',
        'referral program', 'loyalty points', 'discount coupon', 'promo banner', 'flash sale'
    ];

    const contexts = [
        'untuk meningkatkan performa aplikasi',
        'sesuai request dari client',
        'berdasarkan feedback user',
        'untuk memenuhi deadline project',
        'sebagai bagian dari sprint ini',
        'mengikuti standar best practice',
        'untuk mengatasi technical debt',
        'sesuai hasil meeting dengan tim',
        'untuk keperluan demo ke stakeholder',
        'berdasarkan hasil testing',
        'untuk maintenance rutin',
        'sesuai roadmap Q3 2026',
        'mengikuti audit security',
        'untuk persiapan production',
        'mengatasi bug di production',
        'untuk integrasi dengan sistem lain',
        'meningkatkan user experience',
        'optimasi biaya server',
        'untuk compliance requirement',
        'berdasarkan analytics data'
    ];

    const details = [
        'Perlu koordinasi dengan tim backend dan frontend',
        'Estimasi pengerjaan 3-5 hari kerja',
        'Sudah ada mockup dari designer',
        'Butuh review dari tech lead sebelum deploy',
        'Database migration sudah disiapkan',
        'Memerlukan testing menyeluruh sebelum release',
        'Dokumentasi API perlu diupdate',
        'Blocking untuk fitur lain yang bergantung pada ini',
        'Perlu setup environment development dulu',
        'Ada dependency pada library external',
        'Code review wajib sebelum merge ke main branch',
        'Unit test dan integration test sudah disiapkan',
        'Performance benchmark perlu dilakukan',
        'Rollback plan sudah dipersiapkan',
        'Monitoring dan alerting perlu dikonfigurasi',
        'Customer support team perlu diberi training',
        'Marketing team sudah menunggu untuk campaign',
        'Legal team sudah approve dari sisi compliance',
        'Budget sudah disetujui oleh management',
        'Timeline cukup ketat, butuh focus full'
    ];

    const statuses = ['pending', 'in_progress', 'done'];
    const priorities = ['low', 'medium', 'high'];

    const totalTasks_target = totalTasks;
    const batchSize = 5000;

    const connection = await pool.getConnection();

    try {
        const [rows] = await connection.query(
            'SELECT last_number FROM task_number_sequences WHERE organization_id = ?',
            [organizationId]
        ) as any;
        const startOffset = rows.length > 0 ? rows[0].last_number : 0;

        if (startOffset >= totalTasks_target) {
            console.log(`Already have ${startOffset.toLocaleString()} tasks, target is ${totalTasks_target.toLocaleString()}. Nothing to do.`);
            return;
        }

        const tasksToCreate = totalTasks_target - startOffset;
        const totalBatches = Math.ceil(tasksToCreate / batchSize);

        console.log(`Existing tasks: ${startOffset.toLocaleString()}`);
        console.log(`Tasks to create: ${tasksToCreate.toLocaleString()}`);

        await connection.beginTransaction();

        let insertedCount = 0;
        const startTime = Date.now();

        for (let batch = 0; batch < totalBatches; batch++) {
            const currentBatchSize = Math.min(batchSize, tasksToCreate - insertedCount);
            const values: string[] = [];

            for (let i = 0; i < currentBatchSize; i++) {
                const taskIndex = startOffset + batch * batchSize + i + 1;
                const taskNumber = `TSK-${organizationId}-${String(taskIndex).padStart(12, '0')}`;

                const useIndonesian = Math.random() > 0.3;
                const verb = useIndonesian
                    ? verbsIndo[Math.floor(Math.random() * verbsIndo.length)]
                    : verbsEng[Math.floor(Math.random() * verbsEng.length)];
                const obj = objects[Math.floor(Math.random() * objects.length)];
                const context = contexts[Math.floor(Math.random() * contexts.length)];

                let title = `${verb} ${obj}`;
                if (Math.random() > 0.5) {
                    const extraDetail = [
                        'v2', 'dengan React', 'menggunakan TypeScript', 'untuk mobile',
                        'dengan validation', 'multi-step', 'responsive', 'dengan API',
                        'real-time', 'serverless', 'microservices', 'dengan Redis',
                        'GraphQL', 'REST API', 'menggunakan AWS', 'dengan Docker'
                    ];
                    title += ` ${extraDetail[Math.floor(Math.random() * extraDetail.length)]}`;
                }

                let description = `${context}. ${details[Math.floor(Math.random() * details.length)]}`;
                if (Math.random() > 0.6) {
                    description += ` ${details[Math.floor(Math.random() * details.length)]}`;
                }

                const status = statuses[Math.floor(Math.random() * statuses.length)];
                const priority = priorities[Math.floor(Math.random() * priorities.length)];
                const userId = userIds[Math.floor(Math.random() * userIds.length)];
                const createdBy = userIds[Math.floor(Math.random() * userIds.length)];

                const daysOffset = Math.floor(Math.random() * 180);
                const hoursOffset = Math.floor(Math.random() * 24);
                const minutesOffset = Math.floor(Math.random() * 60);
                const createdAt = new Date(Date.now() - (daysOffset * 24 * 60 * 60 * 1000) - (hoursOffset * 60 * 60 * 1000) - (minutesOffset * 60 * 1000));

                const updateHoursOffset = Math.floor(Math.random() * 48);
                const updatedAt = new Date(createdAt.getTime() + (updateHoursOffset * 60 * 60 * 1000));

                const deadlineOffset = Math.floor(Math.random() * 60) + 1;
                const deadlineDays = deadlineOffset;
                const deadline = new Date(createdAt.getTime() + deadlineDays * 24 * 60 * 60 * 1000);

                const createdAtStr = createdAt.toISOString().slice(0, 19).replace('T', ' ');
                const updatedAtStr = updatedAt.toISOString().slice(0, 19).replace('T', ' ');
                const deadlineStr = deadline ? `'${deadline.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL';

                values.push(`(UUID(),${organizationId},'${taskNumber}','${title.replace(/'/g, "''")}','${description.replace(/'/g, "''")}','${status}','${priority}',${deadlineStr},${userId},${createdBy},NULL,NULL,'${createdAtStr}','${updatedAtStr}',NULL)`);
            }

            const sql = `INSERT INTO tasks (id,organization_id,task_number,title,description,status,priority,deadline,user_id,created_by,updated_by,deleted_by,created_at,updated_at,deleted_at) VALUES ${values.join(',')}`;

            await connection.query(sql);
            insertedCount += currentBatchSize;

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
            const percentage = ((insertedCount / tasksToCreate) * 100).toFixed(2);
            const estimatedTotal = (tasksToCreate / insertedCount) * (Date.now() - startTime) / 1000;
            const remaining = (estimatedTotal - parseFloat(elapsed)).toFixed(0);

            console.log(`✓ Progress: ${insertedCount.toLocaleString()} / ${tasksToCreate.toLocaleString()} tasks (${percentage}%) | Elapsed: ${elapsed}s | ETA: ${remaining}s`);

            if (batch % 10 === 0 && batch > 0) {
                await connection.commit();
                await connection.beginTransaction();
            }
        }

        await connection.query(
            'INSERT INTO task_number_sequences (organization_id, last_number) VALUES (?, ?) ON DUPLICATE KEY UPDATE last_number = ?',
            [organizationId, totalTasks_target, totalTasks_target]
        );

        await connection.commit();

        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        const avgPerSecond = (tasksToCreate / parseFloat(totalTime)).toFixed(0);

        console.log('\n=================================');
        console.log(`✓ Successfully created ${tasksToCreate.toLocaleString()} tasks (total: ${totalTasks_target.toLocaleString()})`);
        console.log(`Total time: ${totalTime}s`);
        console.log(`Average: ${avgPerSecond} tasks/second`);
        console.log('=================================\n');

    } catch (error) {
        await connection.rollback();
        console.error('Error during seeding:', error);
        throw error;
    } finally {
        connection.release();
    }
}

export { seed1MTasks };

if (require.main === module) {
    const organizationId = parseInt(process.argv[2] || '1');
    const userIdsArg = process.argv[3] || '';
    const userIds = userIdsArg.split(',').map(Number).filter(n => !isNaN(n));
    const totalTasks = parseInt(process.argv[4] || '100000');

    if (userIds.length === 0) {
        console.error('Error: No user IDs provided');
        console.error('Usage: bun run src/infrastructure/db/seeds/seed-tasks.ts <organizationId> <userIds> [totalTasks]');
        console.error('Example: bun run src/infrastructure/db/seeds/seed-tasks.ts 1 "1,2,3,4,5" 1000000');
        process.exit(1);
    }

    seed1MTasks(organizationId, userIds, totalTasks)
        .then(() => {
            console.log(`Tasks seeding completed successfully (target: ${totalTasks.toLocaleString()})`);
            process.exit(0);
        })
        .catch((error) => {
            console.error('Tasks seeding failed:', error);
            process.exit(1);
        });
}

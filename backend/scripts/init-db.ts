import { pool } from '../src/infrastructure/db/index';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForDatabase(maxAttempts = 30, delayMs = 2000): Promise<void> {
    console.log('Waiting for database connection...');

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const connection = await pool.getConnection();
            await connection.query('SELECT 1');
            connection.release();
            console.log('Database connection established');
            return;
        } catch (error: any) {
            if (attempt === maxAttempts) {
                throw new Error(`Failed to connect to database after ${maxAttempts} attempts: ${error.message}`);
            }
            console.log(`Waiting for database... (attempt ${attempt}/${maxAttempts})`);
            await sleep(delayMs);
        }
    }
}

async function checkTablesExist(): Promise<boolean> {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query<any[]>(
            `SELECT COUNT(*) as count 
             FROM information_schema.tables 
             WHERE table_schema = DATABASE() 
             AND table_name = 'users'`
        );
        return rows[0].count > 0;
    } catch (error) {
        console.error('Error checking tables:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

async function checkDataExists(): Promise<boolean> {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query<any[]>(
            `SELECT COUNT(*) as count FROM users WHERE 1=1`
        );
        return rows[0].count > 0;
    } catch (error) {
        return false;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

async function initDatabase() {
    try {
        await waitForDatabase();

        console.log('Checking database status...');
        const tablesExist = await checkTablesExist();

        if (!tablesExist) {
            console.log('Database tables not found, running migrations...');
            const { stdout: pushStdout, stderr: pushStderr } = await execAsync('bun run db:push');
            if (pushStdout) console.log(pushStdout);
            if (pushStderr) console.error(pushStderr);
            console.log('Migrations completed');
        } else {
            console.log('Database tables already exist');
        }

        const dataExists = await checkDataExists();
        if (!dataExists) {
            console.log('Running database seeding...');
            const { stdout: seedStdout, stderr: seedStderr } = await execAsync('bun run db:seed');
            if (seedStdout) console.log(seedStdout);
            if (seedStderr) console.error(seedStderr);
            console.log('Seeding completed');
        } else {
            console.log('Database already has data, skipping seeding');
        }

        await pool.end();

    } catch (error) {
        try {
            await pool.end();
        } catch (e) {
        }
        throw error;
    }
}

initDatabase()
    .then(() => {
        console.log('✅ Database initialization complete\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    });

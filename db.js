import { Pool } from "pg"
import 'dotenv/config'

const isProduction = process.env.NODE_ENV === 'production';

// Log connection details (without sensitive info)
console.log('Database Configuration:', {
    host: process.env.DB_HOST || 'not set',
    database: process.env.DB_NAME || 'not set',
    port: process.env.DB_PORT || 'not set',
    user: process.env.DB_USERS || 'not set',
    ssl: isProduction
});

const pool = new Pool({
    user: process.env.DB_USERS,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: isProduction ? {
        rejectUnauthorized: false
    } : false,
    // Add connection pool settings
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    maxUses: 7500
});

// Keep connection alive
const keepAlive = async () => {
    try {
        await pool.query('SELECT 1');
        console.log('Connection keep-alive successful');
    } catch (err) {
        console.error('Keep-alive error:', err);
        console.error('Current connection details:', {
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            user: process.env.DB_USERS
        });
    }
};

// Run keep-alive every 60 seconds if in production
if (isProduction) {
    setInterval(keepAlive, 60000);
}

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    console.error('Connection details when error occurred:', {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        user: process.env.DB_USERS
    });
});

pool.on('connect', () => {
    console.log('Database connected successfully');
});

export const db = pool;
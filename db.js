import { Pool } from "pg"
import 'dotenv/config'

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  user: process.env.DB_USERS,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: isProduction ? {
    rejectUnauthorized: false
  } : false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  maxUses: 7500
})

// Keep connection alive
const keepAlive = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Connection keep-alive successful');
  } catch (err) {
    console.error('Keep-alive error:', err);
  }
};

// Run keep-alive every 60 seconds if in production
if (isProduction) {
  setInterval(keepAlive, 60000);
}

// Test the database connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
  console.log('Database connected successfully');
});

export const db = pool
import { Pool } from "pg"
import 'dotenv/config'

const pool = new Pool({
  user: process.env.DB_USERS,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 5000,
  max: 20
})

// Test the database connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

pool.on('connect', () => {
  console.log('Database connected successfully')
})

export const db = pool
import { Pool } from "pg"
import 'dotenv/config'

const db = new Pool({
  user: process.env.DB_USERS,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false, // Disable cert verification (fine for Neon/dev)
},
})
export default db;
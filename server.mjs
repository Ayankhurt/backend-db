import express from "express";
import { db } from "./db.js";
import 'dotenv/config'
import cors from 'cors';

const PORT = 3000;

const app = express();

app.use(express.json());
app.use(cors());

// Add test endpoint
app.get('/test-db', async (req, res) => {
    try {
        // Test the database connection
        const testResult = await db.query('SELECT NOW()');
        res.json({
            message: "Database connection successful",
            time: testResult.rows[0],
            dbConfig: {
                host: process.env.DB_HOST,
                database: process.env.DB_NAME,
                port: process.env.DB_PORT,
                user: process.env.DB_USERS,
            }
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            error: "Database connection failed",
            message: error.message,
            code: error.code
        });
    }
});

app.get('/', (req, res) => {
    res.json({ message: "Server is running" });
});

// Wrap database queries with timeout
const queryWithTimeout = async (queryFn, timeout = 5000) => {
    return Promise.race([
        queryFn(),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Database operation timed out')), timeout)
        )
    ]);
};

app.get('/products', async (req, res) => {
    try {
        const result = await queryWithTimeout(async () => {
            return await db.query('SELECT * FROM products ORDER BY created_at DESC');
        });
        res.json({ product_list: result.rows });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(error.message.includes('timed out') ? 504 : 500)
            .json({ error: error.message || "Database error" });
    }
});

app.post('/product', async (req, res) => {
    const { name, price, description } = req.body;
    try {
        const result = await queryWithTimeout(async () => {
            return await db.query(
                'INSERT INTO products (name, price, description, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
                [name, price, description]
            );
        });
        res.json({ 
            message: 'Product added',
            product: result.rows[0]
        });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(error.message.includes('timed out') ? 504 : 500)
            .json({ error: error.message || "Database error" });
    }
});

app.delete('/product/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await queryWithTimeout(async () => {
            return await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        });
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({ 
            message: 'Product deleted',
            product: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(error.message.includes('timed out') ? 504 : 500)
            .json({ error: error.message || "Database error" });
    }
});

app.put('/product/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, description } = req.body;
    try {
        const result = await queryWithTimeout(async () => {
            return await db.query(
                'UPDATE products SET name = $1, price = $2, description = $3 WHERE id = $4 RETURNING *',
                [name, price, description, id]
            );
        });
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({ 
            message: 'Product updated',
            product: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(error.message.includes('timed out') ? 504 : 500)
            .json({ error: error.message || "Database error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
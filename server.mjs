import express from 'express';
import { db } from './db.js';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Add error logging middleware
app.use((err, req, res, next) => {
    console.error('Error details:', err);
    res.status(500).send({ message: "Internal Server Error", error: err.message });
});

app.get('/', (req, res) => {
    res.json({ message: "Server is running" });
});

app.get('/products', async (req, res) => {
    try {
        console.log('Attempting to fetch products...');
        let result = await db.query('SELECT * FROM products ORDER BY created_at DESC');
        console.log('Products fetched successfully:', result.rows.length);
        res.status(200).send({ message: "Products Found", product_list: result.rows })
    } catch (error) {
        console.error("Database Error:", {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).send({ 
            message: "Internal Server Error",
            details: error.message
        });
    }
});

app.post('/product', async (req, res) => {
    let reqBody = req.body;
    if (!reqBody.name || !reqBody.price || !reqBody.description) {
        res.status(400).send({ message: "Required Parameter Missing" })
        return;
    }
    try {
        console.log('Attempting to add product:', reqBody);
        let result = await db.query(
            'INSERT INTO products (name, price, description, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [reqBody.name, reqBody.price, reqBody.description]
        );
        console.log('Product added successfully:', result.rows[0]);
        res.status(201).send({ message: "Product Added", product: result.rows[0] })
    } catch (error) {
        console.error("Database Error:", {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).send({ 
            message: "Internal Server Error",
            details: error.message
        });
    }
});

app.delete('/product/:id', async (req, res) => {
    const { id } = req.params;
    try {
        console.log('Attempting to delete product:', id);
        const result = await db.query(
            'DELETE FROM products WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            console.log('Product not found:', id);
            return res.status(404).send({ message: "Product not found" });
        }
        console.log('Product deleted successfully:', result.rows[0]);
        res.status(200).send({ message: "Product Deleted", product: result.rows[0] })
    } catch (error) {
        console.error("Database Error:", {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).send({ 
            message: "Internal Server Error",
            details: error.message
        });
    }
});

app.put('/product/:id', async (req, res) => {
    const { id } = req.params;
    let reqBody = req.body;
    if (!reqBody.name || !reqBody.price || !reqBody.description) {
        res.status(400).send({ message: "Required Parameter Missing" })
        return;
    }
    try {
        console.log('Attempting to update product:', { id, ...reqBody });
        const result = await db.query(
            'UPDATE products SET name = $1, price = $2, description = $3 WHERE id = $4 RETURNING *',
            [reqBody.name, reqBody.price, reqBody.description, id]
        );
        if (result.rows.length === 0) {
            console.log('Product not found:', id);
            return res.status(404).send({ message: "Product not found" });
        }
        console.log('Product updated successfully:', result.rows[0]);
        res.status(200).send({ message: "Product Updated", product: result.rows[0] })
    } catch (error) {
        console.error("Database Error:", {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).send({ 
            message: "Internal Server Error",
            details: error.message
        });
    }
});

app.get('/check-db', async (req, res) => {
    try {
        // Check if table exists
        const tableCheck = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'products'
            );
        `);
        
        if (!tableCheck.rows[0].exists) {
            // Create table if it doesn't exist
            await db.query(`
                CREATE TABLE IF NOT EXISTS products (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    price DECIMAL(10,2) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log('Products table created');
        }
        
        // Get table structure
        const tableInfo = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'products';
        `);
        
        res.json({
            message: 'Database check complete',
            tableExists: tableCheck.rows[0].exists,
            structure: tableInfo.rows
        });
    } catch (error) {
        console.error('Database check error:', error);
        res.status(500).json({
            error: 'Database check failed',
            details: error.message,
            code: error.code
        });
    }
});

app.listen(PORT, () => {
    console.log("Server is Running on port", PORT);
});
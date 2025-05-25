import express from 'express';
import db from "./db.js"
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: "Server is running" });
});

app.get('/products', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM products ORDER BY created_at DESC');
        res.status(200).json({ 
            message: "Products Found", 
            product_list: result.rows 
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            message: "Database Error", 
            error: error.message 
        });
    }
});

app.post('/product', async (req, res) => {
    const { name, price, description } = req.body;
    
    if (!name || !price || !description) {
        return res.status(400).json({ message: "Required Parameter Missing" });
    }

    try {
        const result = await db.query(
            'INSERT INTO products (name, price, description, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [name, price, description]
        );
        res.status(201).json({ 
            message: "Product Added", 
            product: result.rows[0] 
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            message: "Database Error", 
            error: error.message 
        });
    }
});

app.delete('/product/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            'DELETE FROM products WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ 
            message: "Product Deleted", 
            product: result.rows[0] 
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            message: "Database Error", 
            error: error.message 
        });
    }
});

app.put('/product/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, description } = req.body;

    if (!name || !price || !description) {
        return res.status(400).json({ message: "Required Parameter Missing" });
    }

    try {
        const result = await db.query(
            'UPDATE products SET name = $1, price = $2, description = $3 WHERE id = $4 RETURNING *',
            [name, price, description, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ 
            message: "Product Updated", 
            product: result.rows[0] 
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            message: "Database Error", 
            error: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is Running on port ${PORT}`);
});
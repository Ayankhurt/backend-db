import express from "express";
import { db } from "./db.js";
import 'dotenv/config'
import cors from 'cors';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cors({
    origin: '*',  // Be more specific in production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

// Add a health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res) => {
    res.json({ message: "Server is running" });
});

app.get('/products', async (req, res) => {
    try {
        const result = await Promise.race([
            db.query('SELECT * FROM products ORDER BY created_at DESC'),
        ]);
        res.json({ product_list: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Database error" });
    }
});

app.post('/product', async (req, res) => {
    const { name, price, description } = req.body;
    try {
        const result = await Promise.race([
            db.query(
                'INSERT INTO products (name, price, description, created_at) VALUES ($1, $2, $3, NOW())',
                [name, price, description]
            ),
        ]);
        res.json({ message: 'Product added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Database error" });
    }
});

app.delete('/product/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Promise.race([
            db.query('DELETE FROM products WHERE id = $1', [id]),
        ]);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Database error" });
    }
});

app.put('/product/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, description } = req.body;
    try {
        const result = await Promise.race([
            db.query(
                'UPDATE products SET name = $1, price = $2, description = $3 WHERE id = $4',
                [name, price, description, id]
            ),
        ]);
        res.json({ message: 'Product updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Database error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
import express from "express";
import { db } from "./db.js";
import 'dotenv/config'
import cors from 'cors';

const PORT = 3000;

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    console.log("Hello World")
});

app.get('/products', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM products ORDER BY created_at DESC');
        res.json({ product_list: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

app.post('/product', async (req, res) => {
    const { name, price, description } = req.body;
    try {
        await db.query(
            'INSERT INTO products (name, price, description, created_at) VALUES ($1, $2, $3, NOW())',
            [name, price, description]
        );
        res.json({ message: 'Product added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

app.delete('/product/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM products WHERE id = $1', [id]);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

app.put('/product/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, description } = req.body;
    try {
        await db.query(
            'UPDATE products SET name = $1, price = $2, description = $3 WHERE id = $4',
            [name, price, description, id]
        );
        res.json({ message: 'Product updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
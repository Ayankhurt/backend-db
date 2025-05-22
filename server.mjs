import express from 'express';
import { db } from './db.js';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json({ message: "Server is running" });
});

app.get('/products', async (req, res) => {
    try {
        let result = await db.query('SELECT * FROM products ORDER BY created_at DESC');
        res.status(200).send({ message: "Product Found", product_list: result.rows })
    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: "Internal Server Error" })
    }
})

app.post('/product', async (req, res) => {
    let reqBody = req.body;
    if (!reqBody.name || !reqBody.price || !reqBody.description) {
        res.status(400).send({ message: "Required Parameter Missing" })
        return;
    }
    try {
        let result = await db.query(
            'INSERT INTO products (name, price, description) VALUES ($1, $2, $3) RETURNING *',
            [reqBody.name, reqBody.price, reqBody.description]
        );
        res.status(201).send({ message: "Product Added", product: result.rows[0] })
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).send({ message: "Internal Server Error" })
    }
})

app.delete('/product/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            'DELETE FROM products WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send({ message: "Product not found" });
        }
        res.status(200).send({ message: "Product Deleted", product: result.rows[0] })
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).send({ message: "Internal Server Error" })
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
        const result = await db.query(
            'UPDATE products SET name = $1, price = $2, description = $3 WHERE id = $4 RETURNING *',
            [reqBody.name, reqBody.price, reqBody.description, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send({ message: "Product not found" });
        }
        res.status(200).send({ message: "Product Updated", product: result.rows[0] })
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send({ message: "Internal Server Error" })
    }
});

app.listen(PORT, () => {
    console.log("Server is Running")
});
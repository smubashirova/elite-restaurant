require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).send('All fields are required.');
  }
  try {
    const query = `INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)`;
    await pool.query(query, [name, email, message]);
    res.send('Message received! Thank you.');
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).send('Server error, please try again later.');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Optional catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.post('/api/orders', async (req, res) => {
  const { items, total } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0 || !total) {
    return res.status(400).json({ error: 'Invalid order data' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO orders (items, total_price, created_at)
       VALUES ($1, $2, NOW()) RETURNING id`,
      [JSON.stringify(items), total]
    );
    client.release();
    res.json({ success: true, orderId: result.rows[0].id });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

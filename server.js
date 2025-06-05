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

// Middleware to parse JSON
app.use(express.json());

// Serve static files if needed
app.use(express.static(path.join(__dirname, 'public')));

// POST /contact route
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

// Fallback route to serve frontend
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

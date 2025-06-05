require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Ensure the contacts table exists
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        createdAt TIMESTAMPTZ DEFAULT NOW()
      )`);
    console.log('✅ Connected to Postgres & ensured table');
  } catch (err) {
    console.error('Postgres init error:', err);
  }
})();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).send('All fields are required.');

  try {
    await pool.query(
      'INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)',
      [name, email, message]
    );
    res.send('Message received! Thank you.');
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).send('Server error – please try again later.');
  }
});

app.get('*', (_, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
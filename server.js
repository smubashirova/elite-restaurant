const express = require('express');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

/* ----------  PostgreSQL setup  ---------- */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to DB:', err.stack);
  } else {
    console.log('Connected to DB at:', res.rows[0].now);
  }
});

/* ----------  Middleware  ---------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ----------  Serve static files manually (if needed)  ---------- */
// For CSS or JS files you want to serve, if any:
// app.use('/assets', express.static(path.join(__dirname, 'assets')));

/* ----------  API Route  ---------- */
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).send('All fields are required.');
  }

  try {
    await pool.query(
      `INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)`,
      [name, email, message]
    );
    res.send('Message received! Thank you.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error.');
  }
});

/* ----------  Serve index.html explicitly  ---------- */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // adjust path if your HTML is elsewhere
});

/* ----------  Fallback for other routes  ---------- */
app.get('*', (req, res) => {
  res.status(404).send('Page not found');
});

/* ----------  Start Server  ---------- */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

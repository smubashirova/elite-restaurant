const express  = require('express');
const sqlite3  = require('sqlite3').verbose();
const path     = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ----------  SQLite setup  ---------- */
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error(err.message);
  else     console.log('Connected to SQLite.');
});

db.run(`
  CREATE TABLE IF NOT EXISTS contacts (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT NOT NULL,
    email     TEXT NOT NULL,
    message   TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

/* ----------  Middleware & static  ---------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

/* ----------  API route  ---------- */
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).send('All fields are required.');

  const sql = `INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)`;
  db.run(sql, [name, email, message], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Server error. Try again later.');
    }
    res.send('Message received! Thank you.');
  });
});

/* ----------  Fallback  ---------- */
app.get('*', (_, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

/* ----------  Start  ---------- */
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

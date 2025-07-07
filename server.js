/**
 * Backend server for Elite Restaurant
 * Only handles API + static files – no browser DOM code here.
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

/* ----------  PostgreSQL ---------- */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
});

/* ----------  Middleware ---------- */
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ----------  Health Check ---------- */
app.get("/health", (_req, res) => res.send("ok"));

/* ----------  Contact Form ---------- */
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: "Missing fields" });

  try {
    await pool.query(
      `INSERT INTO contacts (name, email, message) VALUES ($1,$2,$3)`,
      [name, email, message]
    );
    res.json({ success: true, message: "Thanks for reaching out! We'll reply soon." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

/* ----------  Orders API ---------- */
app.post("/api/orders", async (req, res) => {
  const { items, total } = req.body;
  if (!Array.isArray(items) || !items.length || !total)
    return res.status(400).json({ error: "Invalid order data" });

  try {
    const result = await pool.query(
      `INSERT INTO orders (items, total_price, created_at)
       VALUES ($1,$2,NOW()) RETURNING id`,
      [JSON.stringify(items), total]
    );
    res.json({ success: true, orderId: result.rows[0].id, message: "Order placed successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

/* ----------  SPA Fallback ---------- */
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ----------  Start Server ---------- */
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const compression = require("compression");
const path       = require("path");

const app  = express();
const PORT = process.env.PORT || 3000;

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

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Simulate success response
  console.log(`📩 New contact: ${name}, ${email}, ${message}`);
  res.json({ success: true, message: "Thanks! We’ll reply soon." });
});

/* ----------  Orders API ---------- */
app.post("/api/orders", async (req, res) => {
  const { items, total } = req.body;

  if (!Array.isArray(items) || !items.length || typeof total !== "number") {
    return res.status(400).json({ error: "Invalid order data" });
  }

  // Simulate order success response
  const fakeOrderId = Math.floor(Math.random() * 100000);
  console.log(`🛒 Order received: ${JSON.stringify(items)} Total: ${total}`);
  res.json({ success: true, orderId: fakeOrderId, message: "Order placed!" });
});

/* ----------  SPA Fallback ---------- */
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ----------  Start Server ---------- */
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

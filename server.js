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

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}


async function placeOrder() {
  if (!cart.length) return alert("Cart is empty.");
  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, total })
    });
    const data = await res.json();
    if (data.success) {
      alert("Order placed! ID: " + data.orderId);
      cart.length = 0;
      updateCart();
    } else throw new Error();
  } catch {
    alert("Failed to place order. Try again.");
  }
}

// Toggle cart open/close
const toggleCartBtn = document.getElementById("toggle-cart");
const cartSection = document.getElementById("cart");
const cartCount = document.getElementById("cart-count");

toggleCartBtn.addEventListener("click", () => {
  cartSection.classList.toggle("open");
});

// Update cart count in button
function updateCart() {
  cartList.innerHTML = '';
  let total = 0;
  let itemCount = 0;
  cart.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${item.name} x${item.qty}</span>
      <span>${item.price * item.qty} KZT 
        <button onclick="removeFromCart(${index})" style="margin-left:8px">❌</button>
      </span>
    `;
    cartList.appendChild(li);
    total += item.price * item.qty;
    itemCount += item.qty;
  });
  cartTotal.textContent = `Total: ${total} KZT`;
  cartCount.textContent = itemCount;
  saveCart();
}

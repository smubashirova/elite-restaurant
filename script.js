// --- Cart Logic ---
let cart = [];

const cartSection = document.getElementById("cart");
const cartList = document.getElementById("cart-list");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");
const toast = document.getElementById("toast");
const toggleCartBtn = document.getElementById("toggle-cart");

// Save/load from localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}
function loadCart() {
  const stored = localStorage.getItem("cart");
  if (stored) {
    cart = JSON.parse(stored);
    updateCart();
  }
}

// Add item to cart
function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  showToast(`${name} added to cart`);
  updateCart();
}

// Remove item
function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

// Update cart UI
function updateCart() {
  cartList.innerHTML = "";
  let total = 0;
  let count = 0;

  cart.forEach((item, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${item.name} x${item.qty}</span>
      <span>${item.price * item.qty} KZT 
        <button onclick="removeFromCart(${idx})">❌</button>
      </span>`;
    cartList.appendChild(li);

    total += item.price * item.qty;
    count += item.qty;
  });

  cartTotal.textContent = `Total: ${total} KZT`;
  cartCount.textContent = count;
  saveCart();
}

// Place order (POST to server)
async function placeOrder() {
  if (!cart.length) return alert("Cart is empty.");

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart, total }),
    });
    const data = await res.json();

    if (data.success) {
      alert(`Order placed! ID: ${data.orderId}`);
      cart = [];
      updateCart();
    } else {
      throw new Error("Server error");
    }
  } catch (err) {
    alert("Failed to place order. Try again.");
  }
}

// Show toast
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

// Toggle cart panel
toggleCartBtn.addEventListener("click", () => {
  cartSection.classList.toggle("open");
});

// Setup Add to Cart buttons
document.querySelectorAll(".add-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".card");
    const name = card.dataset.name;
    const price = parseFloat(card.dataset.price);
    addToCart(name, price);
  });
});

// Initialize cart on load
loadCart();

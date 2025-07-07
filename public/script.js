/* ------------------------------
   Elite Restaurant – Front‑end
------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  /* ==== DOM Refs ==== */
  const cartPanel   = document.getElementById("cart");
  const cartList    = document.getElementById("cart-list");
  const cartTotal   = document.getElementById("cart-total");
  const cartCount   = document.getElementById("cart-count");
  const toggleCart  = document.getElementById("toggle-cart");
  const toast       = document.getElementById("toast");
  const addButtons  = document.querySelectorAll(".add-btn");
  const placeOrder  = document.getElementById("place-order");
  const contactForm = document.getElementById("contact-form");

  /* ==== State ==== */
  let cart = [];

  /* ---- Local‑storage helpers ---- */
  const saveCart = () => localStorage.setItem("eliteCart", JSON.stringify(cart));
  const loadCart = () => {
    const saved = localStorage.getItem("eliteCart");
    if (saved) cart = JSON.parse(saved);
  };

  /* ---- Toast helper ---- */
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
  };

  /* ---- Render / Update Cart UI ---- */
  const renderCart = () => {
    cartList.innerHTML = "";
    let total = 0;
    let items = 0;

    cart.forEach((item, idx) => {
      total += item.price * item.qty;
      items += item.qty;

      const li = document.createElement("li");
      li.innerHTML = `
        <span>${item.name} ×${item.qty}</span>
        <span>${item.price * item.qty} KZT
          <button class="remove-btn" data-idx="${idx}">❌</button>
        </span>`;
      cartList.appendChild(li);
    });

    cartTotal.textContent = `Total: ${total} KZT`;
    cartCount.textContent = items;
    saveCart();
  };

  /* ---- Cart Mutations ---- */
  const addToCart = (name, price) => {
    const existing = cart.find((i) => i.name === name);
    existing ? (existing.qty += 1) : cart.push({ name, price, qty: 1 });
    showToast(`${name} added to cart`);
    renderCart();
  };
  const removeFromCart = (idx) => {
    cart.splice(idx, 1);
    renderCart();
  };

  /* ---- Event Listeners ---- */
  // Open / close cart
  toggleCart.addEventListener("click", () => {
    cartPanel.classList.toggle("open");      // slides in/out
    cartPanel.classList.toggle("hidden");    // makes it visible first time
  });

  // Add‑to‑cart buttons
  addButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      const card  = btn.closest(".card");
      const name  = card.dataset.name;
      const price = +card.dataset.price;
      addToCart(name, price);
    })
  );

  // Remove buttons (event‑delegation)
  cartList.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
      const idx = +e.target.dataset.idx;
      removeFromCart(idx);
    }
  });

  // Place Order (demo only – alerts on success)
  placeOrder.addEventListener("click", async () => {
    if (!cart.length) return alert("Cart is empty!");
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

    try {
      const res  = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, total }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Order placed! ID ${data.orderId}`);
        cart = [];
        renderCart();
      } else throw new Error();
    } catch {
      alert("Could not place order. Try again.");
    }
  });

  // Contact Form
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { name, email, message } = Object.fromEntries(new FormData(contactForm));

    try {
      const res  = await fetch("/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (data.success) {
        contactForm.reset();
        showToast("Thank you! We will get back to you soon.");
      } else throw new Error();
    } catch {
      showToast("Oops! Something went wrong.");
    }
  });

  /* ---- Init ---- */
  loadCart();
  renderCart();
});

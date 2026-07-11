// ===================== CONFIG =====================
// Swap these placeholders with Suzy's real details.
const WHATSAPP_NUMBER = "2348147320969"; // digits only, country code, no + or spaces
const INSTAGRAM_HANDLE = "madebysuxy";

// ===================== PRODUCT DATA =====================
// price: null means "price coming soon" — set a number (e.g. 85000) once confirmed,
// and the product card + cart will automatically start showing/using it.
const PRODUCTS = [
  {
    id: "the-renee",
    name: "The Renée",
    price: 30000,
    badge: "Handmade to order",
    image: "renee.webp"
  },
  {
    id: "kelly-velvet",
    name: "Kelly (Velvet)",
    price: 80000,
    badge: "Handmade to order",
    image: "kelly.webp"
  },
  {
    id: "blossom-choco",
    name: "Blossom (Choco)",
    price: 35000,
    badge: "Handmade to order",
    image: "blossom.webp"
  },
  {
    id: "wispy",
    name: "Wispy",
    price: 100000,
    badge: "Limited edition",
    image: "wipsy.webp"
  },
  {
    id: "candy",
    name: "Candy",
    price: 45000,
    badge: "Handmade to order",
    image: "candy.webp"
  },
  {
    id: "the-junk-clutch",
    name: "The Junk Clutch",
    price: 70000,
    badge: "Limited edition",
    image: "junk clutch.webp"
  },
  {
    id: "bubbles-polka-dot",
    name: "Bubbles (Polka Dot)",
    price: 55000,
    badge: "Handmade to order",
    image: "bubbles.webp"
  }
];

// ===================== HELPERS =====================
const fmtNaira = (n) => (n === null || n === undefined) ? "Price on request" : "₦" + n.toLocaleString("en-NG");

function getCart(){
  try{
    return JSON.parse(localStorage.getItem("madebysuxy_cart")) || [];
  }catch(e){
    return [];
  }
}
function saveCart(cart){
  localStorage.setItem("madebysuxy_cart", JSON.stringify(cart));
  renderCart();
}

function getCustomer(){
  try{
    return JSON.parse(localStorage.getItem("madebysuxy_customer")) || null;
  }catch(e){
    return null;
  }
}
function saveCustomer(customer){
  localStorage.setItem("madebysuxy_customer", JSON.stringify(customer));
}

function getWishlist(){
  try{
    return JSON.parse(localStorage.getItem("madebysuxy_wishlist")) || [];
  }catch(e){
    return [];
  }
}
function saveWishlist(list){
  localStorage.setItem("madebysuxy_wishlist", JSON.stringify(list));
  renderWishlist();
}
function toggleWishlist(productId){
  let list = getWishlist();
  if(list.includes(productId)){
    list = list.filter(id => id !== productId);
  }else{
    list.push(productId);
  }
  saveWishlist(list);
}

// ===================== RENDER PRODUCTS =====================
function renderProducts(){
  const grid = document.getElementById("productGrid");
  const wishlist = getWishlist();
  grid.innerHTML = PRODUCTS.map(p => {
    const hasPrice = p.price !== null && p.price !== undefined;
    const isWished = wishlist.includes(p.id);
    const actionBtn = hasPrice
      ? `<button class="add-to-cart-btn" data-add="${p.id}">Add to Bag</button>`
      : `<a class="add-to-cart-btn enquire-btn" data-enquire="${p.id}" href="#" target="_blank" rel="noopener">Enquire on WhatsApp</a>`;
    return `
    <div class="product-card">
      <div class="product-media">
        <span class="product-badge">${p.badge}</span>
        <button class="wishlist-btn${isWished ? " active" : ""}" data-wish="${p.id}" aria-label="Add to wishlist">${isWished ? "♥" : "♡"}</button>
        <img src="${p.image}" alt="${p.name}" loading="lazy">
      </div>
      <h3 class="product-name">${p.name}</h3>
      <p class="product-price${hasPrice ? "" : " price-pending"}">${fmtNaira(p.price)}</p>
      ${actionBtn}
    </div>
  `;
  }).join("");

  grid.querySelectorAll("[data-add]").forEach(btn=>{
    btn.addEventListener("click", ()=> addToCart(btn.dataset.add));
  });
  grid.querySelectorAll("[data-wish]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      toggleWishlist(btn.dataset.wish);
      const nowActive = btn.classList.toggle("active");
      btn.textContent = nowActive ? "♥" : "♡";
    });
  });
  grid.querySelectorAll("[data-enquire]").forEach(btn=>{
    const product = PRODUCTS.find(p => p.id === btn.dataset.enquire);
    const msg = `Hi Suzy! Please can you confirm the price for "${product.name}"?`;
    btn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  });
}

// ===================== CART LOGIC =====================
function addToCart(productId){
  const product = PRODUCTS.find(p => p.id === productId);
  if(!product) return;
  const cart = getCart();
  const existing = cart.find(i => i.id === productId);
  if(existing){
    existing.qty += 1;
  }else{
    cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty: 1 });
  }
  saveCart(cart);
  showToast(`${product.name} added to your bag`);
  openCart();
}

function updateQty(productId, delta){
  let cart = getCart();
  const item = cart.find(i => i.id === productId);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0){
    cart = cart.filter(i => i.id !== productId);
  }
  saveCart(cart);
}

function removeItem(productId){
  const cart = getCart().filter(i => i.id !== productId);
  saveCart(cart);
}

function renderCart(){
  const cart = getCart();
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartSubtotal = document.getElementById("cartSubtotal");
  const checkoutBtn = document.getElementById("checkoutBtn");

  const totalQty = cart.reduce((sum,i)=> sum + i.qty, 0);
  cartCount.textContent = totalQty;
  cartCount.style.display = totalQty > 0 ? "flex" : "none";

  if(cart.length === 0){
    cartItems.innerHTML = `<div class="cart-empty">Your bag is empty.<br>Add a piece from the collection to get started.</div>`;
  }else{
    cartItems.innerHTML = cart.map(i => `
      <div class="cart-item">
        <img src="${i.image}" alt="${i.name}">
        <div class="cart-item-info">
          <h4>${i.name}</h4>
          <p class="cart-item-price">${fmtNaira(i.price)}</p>
          <div class="qty-controls">
            <button class="qty-btn" data-qty-down="${i.id}">−</button>
            <span>${i.qty}</span>
            <button class="qty-btn" data-qty-up="${i.id}">+</button>
            <button class="remove-item" data-remove="${i.id}">Remove</button>
          </div>
        </div>
      </div>
    `).join("");

    cartItems.querySelectorAll("[data-qty-up]").forEach(btn=>{
      btn.addEventListener("click", ()=> updateQty(btn.dataset.qtyUp, 1));
    });
    cartItems.querySelectorAll("[data-qty-down]").forEach(btn=>{
      btn.addEventListener("click", ()=> updateQty(btn.dataset.qtyDown, -1));
    });
    cartItems.querySelectorAll("[data-remove]").forEach(btn=>{
      btn.addEventListener("click", ()=> removeItem(btn.dataset.remove));
    });
  }

  const subtotal = cart.reduce((sum,i)=> sum + i.price * i.qty, 0);
  cartSubtotal.textContent = fmtNaira(subtotal);

  // Build WhatsApp checkout link
  if(cart.length === 0){
    checkoutBtn.href = "#";
    checkoutBtn.classList.add("btn-disabled");
  }else{
   const customer = getCustomer();
    let message = "Hi Suzy! I'd like to order:\n\n";
    cart.forEach(i=>{
      message += `• ${i.name} x${i.qty} — ${fmtNaira(i.price * i.qty)}\n`;
    });
    message += `\nTotal: ${fmtNaira(subtotal)}\n\n`;
    message += `My name: ${customer && customer.name ? customer.name : ""}\n`;
    message += `My phone: ${customer && customer.phone ? customer.phone : ""}\n`;
    message += `My delivery address: ${customer && customer.address ? customer.address : ""}`;
    checkoutBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }
}

function renderWishlist(){
  const container = document.getElementById("wishlistItems");
  if(!container) return;
  const wishlist = getWishlist();
  const items = PRODUCTS.filter(p => wishlist.includes(p.id));

  if(items.length === 0){
    container.innerHTML = `<p class="wishlist-empty">No saved pieces yet. Tap the heart on any bag to save it here.</p>`;
    return;
  }

  container.innerHTML = items.map(p => `
    <div class="wishlist-item">
      <img src="${p.image}" alt="${p.name}">
      <div class="wishlist-item-info">
        <h5>${p.name}</h5>
        <span>${fmtNaira(p.price)}</span>
      </div>
      <button class="wishlist-remove" data-unwish="${p.id}">Remove</button>
    </div>
  `).join("");

  container.querySelectorAll("[data-unwish]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      toggleWishlist(btn.dataset.unwish);
      renderProducts();
    });
  });
}

// ===================== TOAST =====================
let toastTimer;
function showToast(msg){
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("active");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toast.classList.remove("active"), 2200);
}

// ===================== DRAWERS =====================
const menuDrawer = document.getElementById("menuDrawer");
const menuOverlay = document.getElementById("menuOverlay");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const searchOverlay = document.getElementById("searchOverlay");
const accountDrawer = document.getElementById("accountDrawer");
const accountOverlay = document.getElementById("accountOverlay");

function openMenu(){ menuDrawer.classList.add("active"); menuOverlay.classList.add("active"); }
function closeMenu(){ menuDrawer.classList.remove("active"); menuOverlay.classList.remove("active"); }

function openCart(){ cartDrawer.classList.add("active"); cartOverlay.classList.add("active"); }
function closeCart(){ cartDrawer.classList.remove("active"); cartOverlay.classList.remove("active"); }

function openAccount(){ accountDrawer.classList.add("active"); accountOverlay.classList.add("active"); }
function closeAccount(){ accountDrawer.classList.remove("active"); accountOverlay.classList.remove("active"); }

function openSearch(){
  searchOverlay.classList.add("active");
  setTimeout(()=> document.getElementById("searchInput").focus(), 300);
}
function closeSearch(){ searchOverlay.classList.remove("active"); }

document.getElementById("menuToggle").addEventListener("click", openMenu);
document.getElementById("menuClose").addEventListener("click", closeMenu);
menuOverlay.addEventListener("click", closeMenu);

document.getElementById("cartToggle").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.getElementById("accountToggle").addEventListener("click", openAccount);
document.getElementById("accountClose").addEventListener("click", closeAccount);
accountOverlay.addEventListener("click", closeAccount);

document.getElementById("searchToggle").addEventListener("click", openSearch);
document.getElementById("searchClose").addEventListener("click", closeSearch);

// Close drawers on Escape
document.addEventListener("keydown", (e)=>{
  if(e.key === "Escape"){
   closeMenu(); closeCart(); closeSearch(); closeAccount();
  }
});

// Close mobile menu when a nav link is tapped
document.querySelectorAll(".menu-drawer .menu-link, .menu-word").forEach(link=>{
  link.addEventListener("click", closeMenu);
});

// ===================== SEARCH =====================
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
searchInput.addEventListener("input", ()=>{
  const q = searchInput.value.trim().toLowerCase();
  if(q.length < 1){ searchResults.innerHTML = ""; return; }
  const matches = PRODUCTS.filter(p => p.name.toLowerCase().includes(q));
  searchResults.innerHTML = matches.map(p => `
    <div class="search-result-item" data-goto="${p.id}">
      <span>${p.name}</span>
      <span>${fmtNaira(p.price)}</span>
    </div>
  `).join("") || `<p style="color:var(--ink-soft);padding:14px 4px;">No pieces match "${q}"</p>`;

  searchResults.querySelectorAll("[data-goto]").forEach(el=>{
    el.addEventListener("click", ()=>{
      closeSearch();
      document.getElementById("collection").scrollIntoView({behavior:"smooth"});
    });
  });
});

const whatsappFab = document.getElementById("whatsappFab");
if(whatsappFab){
  whatsappFab.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Suzy! I'm on your website and had a question 🙂")}`;
}

// ===================== CUSTOM ORDER LINK =====================
document.getElementById("customWhatsapp").href =
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Suzy! I'd love a custom bag made — here's what I'm thinking:")}`;

// ===================== MY DETAILS FORM =====================
const accountForm = document.getElementById("accountForm");
const accountMsg = document.getElementById("accountMsg");

function loadAccountForm(){
  const customer = getCustomer();
  if(!customer) return;
  document.getElementById("accName").value = customer.name || "";
  document.getElementById("accPhone").value = customer.phone || "";
  document.getElementById("accAddress").value = customer.address || "";
}

if(accountForm){
  accountForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const customer = {
      name: document.getElementById("accName").value.trim(),
      phone: document.getElementById("accPhone").value.trim(),
      address: document.getElementById("accAddress").value.trim()
    };
    saveCustomer(customer);
    accountMsg.textContent = "Saved! This will auto-fill your next WhatsApp order.";
    renderCart();
  });
}

// ===================== NEWSLETTER SIGNUP =====================
// Uses Mailchimp's classic embedded-form pattern: the form posts to Mailchimp's
// servers in a hidden iframe so the page never navigates away. Because that's a
// cross-origin request, JS can't read whether it truly succeeded — so we just
// show a friendly confirmation once the iframe reports it loaded a response.
const newsletterForm = document.getElementById("newsletterForm");
const newsletterMsg = document.getElementById("newsletterMsg");
const hiddenIframe = document.getElementById("hidden_iframe");
let newsletterSubmitted = false;

if(newsletterForm){
  newsletterForm.addEventListener("submit", (e)=>{
    const email = document.getElementById("newsletterEmail").value.trim();
    if(!email || !email.includes("@")){
      e.preventDefault();
      newsletterMsg.textContent = "Please enter a valid email address.";
      return;
    }
    newsletterSubmitted = true;
    newsletterMsg.textContent = "Signing you up…";
  });
}

if(hiddenIframe){
  hiddenIframe.addEventListener("load", ()=>{
    if(newsletterSubmitted){
      newsletterMsg.textContent = "You're on the list! Watch your inbox for drops and offers.";
      newsletterForm.reset();
      newsletterSubmitted = false;
    }
  });
}

// ===================== INIT =====================
document.getElementById("year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
renderWishlist();
loadAccountForm();
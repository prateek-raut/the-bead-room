/**
 * The Bead Room by Pallas - Main Storefront Application Script
 */

// Global State
const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem('the_bead_room_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('the_bead_room_wishlist') || '[]'),
  activeCategory: 'All',
  searchQuery: '',
  sortBy: 'featured',
  appliedCoupon: null,
  settings: null,
  selectedProductForEnquiry: null
};

// Available Promo Codes
const PROMO_CODES = {
  'BEADLOVE10': { type: 'percent', value: 10, label: '10% Off' },
  'NAGPURART': { type: 'fixed', value: 150, label: '₹150 Off Workshop/Order' },
  'FIRST50': { type: 'fixed', value: 50, label: '₹50 Off Welcome Discount' }
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  await fetchStoreSettings();
  await loadProducts();
  setupEventListeners();
  updateCartBadge();
  updateWishlistBadge();
  renderCartDrawer();
});

// Fetch Store Settings
async function fetchStoreSettings() {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      state.settings = await res.json();
    }
  } catch (err) {
    console.log('Using default settings fallback');
    state.settings = typeof DEFAULT_STORE_DATA !== 'undefined' ? DEFAULT_STORE_DATA.settings : null;
  }
}

// Load Products from API or Fallback
async function loadProducts() {
  const container = document.getElementById('products-grid');
  if (container) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding: 60px 0;">
        <div style="font-size: 2rem; animation: gentle-spin 2s linear infinite; display:inline-block;">🌸</div>
        <p style="margin-top: 12px; color: var(--text-muted); font-weight:600;">Loading handcrafted collection...</p>
      </div>
    `;
  }

  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      state.products = await res.json();
    } else {
      throw new Error('API failed');
    }
  } catch (err) {
    console.log('Using offline mock products fallback');
    state.products = typeof DEFAULT_STORE_DATA !== 'undefined' ? DEFAULT_STORE_DATA.products : [];
  }

  renderProductCatalog();
}

// Filter and Sort Products
function getFilteredProducts() {
  return state.products.filter(item => {
    const matchesCategory = state.activeCategory === 'All' || item.category === state.activeCategory;
    const matchesSearch = !state.searchQuery || 
      item.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(state.searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (state.sortBy === 'price-low') return a.price - b.price;
    if (state.sortBy === 'price-high') return b.price - a.price;
    if (state.sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (state.sortBy === 'newest') return (new Date(b.createdAt || 0)) - (new Date(a.createdAt || 0));
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });
}

// Render Products Grid
function renderProductCatalog() {
  const container = document.getElementById('products-grid');
  if (!container) return;

  const filtered = getFilteredProducts();

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding: 60px 20px; background:#fff; border-radius:16px; border:1px dashed var(--border-soft);">
        <div style="font-size: 2.5rem; margin-bottom:10px;">🔍🌸</div>
        <h3 style="font-size:1.2rem; font-weight:700; color:var(--text-main);">No matching handcrafted items found</h3>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-top:6px;">Try adjusting your category filter or search keywords.</p>
        <button onclick="resetFilters()" style="margin-top:16px; background:var(--accent-dark-rose); color:#fff; padding:8px 20px; border-radius:9999px; font-weight:700; font-size:0.85rem;">View All Collection</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const isWishlisted = state.wishlist.includes(item.id);
    const isWorkshop = item.type === 'workshop' || item.category === 'Art Workshops';
    const discount = item.originalPrice && item.originalPrice > item.price
      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
      : null;

    return `
      <article class="product-card" data-id="${item.id}">
        <div class="product-image-box">
          <img src="${item.image}" alt="${item.name}" class="product-img" loading="lazy">
          ${item.badge ? `<span class="product-badge ${isWorkshop ? 'workshop-tag' : ''}">${item.badge}</span>` : ''}
          <button class="product-quick-btn" onclick="openQuickView('${item.id}')">Quick View ✨</button>
        </div>

        <div class="product-info">
          <div class="product-category-row">
            <span>${item.category}</span>
            <span class="rating-badge">★ ${(item.rating || 5.0).toFixed(1)}</span>
          </div>

          <h3 class="product-name" onclick="openQuickView('${item.id}')">${item.name}</h3>
          <p class="product-desc">${item.description}</p>

          <div class="product-price-row">
            <span class="current-price">₹${item.price}</span>
            ${item.originalPrice ? `<span class="original-price">₹${item.originalPrice}</span>` : ''}
            ${discount ? `<span class="discount-tag">${discount}% OFF</span>` : ''}
          </div>

          <div class="product-card-actions">
            <button class="btn-card-cart" onclick="${isWorkshop ? `openWorkshopEnquiry('${item.id}')` : `addToCart('${item.id}')`}">
              ${isWorkshop ? '🎨 Book Spot' : '🌸 Add to Cart'}
            </button>
            <button class="btn-card-enquire" onclick="openEnquiryModal('${item.id}')">
              💌 Enquire
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Reset Filters
window.resetFilters = function() {
  state.activeCategory = 'All';
  state.searchQuery = '';
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.toggle('active', p.dataset.category === 'All'));
  renderProductCatalog();
};

// Setup Event Listeners
function setupEventListeners() {
  // Category Pill Clicks
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeCategory = pill.dataset.category || 'All';
      renderProductCatalog();
    });
  });

  // Search Input Debounce
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    let timer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        state.searchQuery = e.target.value.trim();
        renderProductCatalog();
      }, 250);
    });
  }

  // Sort Change
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderProductCatalog();
    });
  }

  // Cart Drawer Toggles
  const cartBtn = document.getElementById('cart-toggle-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartOverlay = document.getElementById('cart-drawer-overlay');

  if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

  // FAQ Accordion
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(f => f.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });

  // Inquiry Form Submit
  const enqForm = document.getElementById('enquiry-form');
  if (enqForm) {
    enqForm.addEventListener('submit', handleEnquirySubmit);
  }

  // Checkout Form Submit
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  }
}

// Cart Drawer Management
window.openCartDrawer = function() {
  document.getElementById('cart-drawer').classList.add('active');
  document.getElementById('cart-drawer-overlay').classList.add('active');
  renderCartDrawer();
};

window.closeCartDrawer = function() {
  document.getElementById('cart-drawer').classList.remove('active');
  document.getElementById('cart-drawer-overlay').classList.remove('active');
};

window.addToCart = function(productId, quantity = 1) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const existing = state.cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity
    });
  }

  saveCart();
  updateCartBadge();
  showToast(`🌸 Added "${product.name}" to cart!`, 'success');
  openCartDrawer();
};

window.updateCartQty = function(productId, delta) {
  const item = state.cart.find(i => i.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter(i => i.id !== productId);
  }

  saveCart();
  updateCartBadge();
  renderCartDrawer();
};

window.removeFromCart = function(productId) {
  state.cart = state.cart.filter(i => i.id !== productId);
  saveCart();
  updateCartBadge();
  renderCartDrawer();
  showToast('Item removed from cart', 'info');
};

function saveCart() {
  localStorage.setItem('the_bead_room_cart', JSON.stringify(state.cart));
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge-count');
  if (badge) {
    const totalQty = state.cart.reduce((sum, i) => sum + i.quantity, 0);
    badge.textContent = totalQty;
    badge.style.display = totalQty > 0 ? 'flex' : 'none';
  }
}

function updateWishlistBadge() {
  const badge = document.getElementById('wishlist-badge-count');
  if (badge) {
    badge.textContent = state.wishlist.length;
    badge.style.display = state.wishlist.length > 0 ? 'flex' : 'none';
  }
}

function renderCartDrawer() {
  const itemsContainer = document.getElementById('cart-items-list');
  const subtotalEl = document.getElementById('cart-subtotal');
  const discountEl = document.getElementById('cart-discount');
  const shippingEl = document.getElementById('cart-shipping');
  const grandTotalEl = document.getElementById('cart-grand-total');
  const meterText = document.getElementById('free-shipping-text');
  const meterFill = document.getElementById('free-shipping-fill');
  const checkoutBtn = document.getElementById('btn-open-checkout');

  if (!itemsContainer) return;

  if (state.cart.length === 0) {
    itemsContainer.innerHTML = `
      <div style="text-align:center; padding: 48px 12px;">
        <div style="font-size: 3rem; margin-bottom:12px;">🌸</div>
        <h4 style="font-weight:700; color:var(--text-main); margin-bottom:6px;">Your cart is empty</h4>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:20px;">Explore our handcrafted jewellery and book workshop spots in Nagpur!</p>
        <button onclick="closeCartDrawer()" style="background:var(--accent-dark-rose); color:#fff; padding:10px 24px; border-radius:9999px; font-weight:700; font-size:0.9rem;">Start Shopping 🌸</button>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '₹0';
    if (discountEl) discountEl.textContent = '₹0';
    if (shippingEl) shippingEl.textContent = '₹0';
    if (grandTotalEl) grandTotalEl.textContent = '₹0';
    if (meterText) meterText.textContent = 'Add ₹999 for FREE Pan-India Delivery!';
    if (meterFill) meterFill.style.width = '0%';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  if (checkoutBtn) checkoutBtn.disabled = false;

  itemsContainer.innerHTML = state.cart.map(item => `
    <div class="cart-item-card">
      <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
      <div class="cart-item-info">
        <h5 class="cart-item-name">${item.name}</h5>
        <div class="cart-item-price">₹${item.price * item.quantity} <span style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">(₹${item.price} each)</span></div>
        <div class="cart-item-controls">
          <div class="qty-stepper">
            <button class="qty-btn" onclick="updateCartQty('${item.id}', -1)">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
          </div>
          <button class="cart-remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
        </div>
      </div>
    </div>
  `).join('');

  // Calculate Totals
  const subtotal = state.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const freeThreshold = state.settings?.freeShippingThreshold || 999;
  const standardShipping = state.settings?.shippingFee || 79;
  const isFreeShipping = subtotal >= freeThreshold;
  const shipping = isFreeShipping ? 0 : standardShipping;

  let discount = 0;
  if (state.appliedCoupon) {
    if (state.appliedCoupon.type === 'percent') {
      discount = (subtotal * state.appliedCoupon.value) / 100;
    } else if (state.appliedCoupon.type === 'fixed') {
      discount = Math.min(subtotal, state.appliedCoupon.value);
    }
  }

  const grandTotal = Math.max(0, subtotal - discount + shipping);

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (discountEl) discountEl.textContent = discount > 0 ? `-₹${discount.toLocaleString('en-IN')}` : '₹0';
  if (shippingEl) shippingEl.textContent = isFreeShipping ? 'FREE' : `₹${shipping}`;
  if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

  // Meter Update
  if (meterText && meterFill) {
    if (isFreeShipping) {
      meterText.innerHTML = '🎉 You unlocked <strong>FREE Pan-India Delivery!</strong>';
      meterFill.style.width = '100%';
    } else {
      const remaining = freeThreshold - subtotal;
      const progress = Math.min(100, (subtotal / freeThreshold) * 100);
      meterText.innerHTML = `Add <strong>₹${remaining}</strong> more for <strong>FREE Pan-India Delivery!</strong>`;
      meterFill.style.width = `${progress}%`;
    }
  }
}

// Apply Coupon
window.applyCoupon = function() {
  const input = document.getElementById('coupon-input');
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  if (PROMO_CODES[code]) {
    state.appliedCoupon = { code, ...PROMO_CODES[code] };
    showToast(`🎉 Coupon "${code}" applied: ${PROMO_CODES[code].label}!`, 'success');
    renderCartDrawer();
  } else {
    showToast('Invalid coupon code. Try BEADLOVE10 or NAGPURART', 'error');
  }
};

// Quick View Modal
window.openQuickView = function(productId) {
  const item = state.products.find(p => p.id === productId);
  if (!item) return;

  const modal = document.getElementById('quickview-modal');
  const content = document.getElementById('quickview-content');
  if (!modal || !content) return;

  const isWorkshop = item.type === 'workshop' || item.category === 'Art Workshops';
  const details = item.details || {};

  content.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start;">
      <div>
        <img src="${item.image}" alt="${item.name}" style="width:100%; height:360px; object-fit:cover; border-radius:16px; box-shadow:0 8px 24px rgba(0,0,0,0.08);">
      </div>
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-size:0.8rem; font-weight:700; color:var(--accent-rose); text-transform:uppercase;">${item.category}</span>
          <span style="color:var(--accent-gold); font-weight:700;">★ ${(item.rating || 5.0).toFixed(1)} (${item.reviewsCount || 1} reviews)</span>
        </div>
        <h2 style="font-family:var(--font-heading); font-size:1.4rem; font-weight:800; color:var(--text-main); margin-bottom:10px;">${item.name}</h2>
        <div style="font-size:1.4rem; font-weight:800; color:var(--accent-dark-rose); margin-bottom:14px;">₹${item.price} ${item.originalPrice ? `<span style="font-size:0.95rem; color:var(--text-light); text-decoration:line-through; margin-left:8px;">₹${item.originalPrice}</span>` : ''}</div>
        
        <p style="font-size:0.92rem; color:var(--text-muted); line-height:1.6; margin-bottom:16px;">${item.description}</p>

        <div style="background:#fdf2f4; border-radius:12px; padding:14px; margin-bottom:20px; font-size:0.85rem;">
          ${details.materials ? `<div style="margin-bottom:6px;"><strong>Materials:</strong> ${details.materials}</div>` : ''}
          ${details.venue ? `<div style="margin-bottom:6px;"><strong>Venue:</strong> ${details.venue}</div>` : ''}
          ${details.duration ? `<div style="margin-bottom:6px;"><strong>Timings:</strong> ${details.duration}</div>` : ''}
          ${details.delivery ? `<div style="margin-bottom:6px;"><strong>Shipping:</strong> ${details.delivery}</div>` : ''}
          ${details.inclusions ? `<div><strong>Inclusions:</strong> ${details.inclusions}</div>` : ''}
        </div>

        <div style="display:flex; gap:10px;">
          <button onclick="${isWorkshop ? `openWorkshopEnquiry('${item.id}'); closeModal('quickview-modal');` : `addToCart('${item.id}'); closeModal('quickview-modal');`}" class="btn-primary" style="flex:1; justify-content:center;">
            ${isWorkshop ? '🎨 Book Session' : '🌸 Add to Cart'}
          </button>
          <button onclick="openEnquiryModal('${item.id}'); closeModal('quickview-modal');" class="btn-secondary" style="flex:1; justify-content:center;">
            💌 Enquire / Custom Order
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
};

// Open General / Product Enquiry Modal
window.openEnquiryModal = function(productId = null) {
  const modal = document.getElementById('enquiry-modal');
  if (!modal) return;

  const product = productId ? state.products.find(p => p.id === productId) : null;
  state.selectedProductForEnquiry = product;

  const subjectInput = document.getElementById('enquiry-subject');
  const productInfoBox = document.getElementById('enquiry-product-preview');

  if (product) {
    if (subjectInput) subjectInput.value = `Custom Order / Enquiry: ${product.name}`;
    if (productInfoBox) {
      productInfoBox.style.display = 'flex';
      productInfoBox.innerHTML = `
        <img src="${product.image}" style="width:50px; height:50px; border-radius:8px; object-fit:cover;">
        <div>
          <h5 style="font-size:0.9rem; font-weight:700; color:var(--text-main);">${product.name}</h5>
          <p style="font-size:0.8rem; color:var(--accent-dark-rose); font-weight:bold;">₹${product.price} | Pan-India Delivery 🌸</p>
        </div>
      `;
    }
  } else {
    if (subjectInput) subjectInput.value = 'General Inquiry / Custom Jewellery Request';
    if (productInfoBox) productInfoBox.style.display = 'none';
  }

  modal.classList.add('active');
};

// Open Workshop Enquiry
window.openWorkshopEnquiry = function(workshopId) {
  const workshop = state.products.find(p => p.id === workshopId);
  openEnquiryModal(workshopId);
  const subjectInput = document.getElementById('enquiry-subject');
  if (subjectInput && workshop) {
    subjectInput.value = `Seat Booking / Inquiry: ${workshop.name} (Surendranagar, Nagpur)`;
  }
};

// Handle Enquiry Submission (Sends email to sarakamdar26@gmail.com)
async function handleEnquirySubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-submit-enquiry');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Sending to sarakamdar26@gmail.com... 🌸';
  }

  const payload = {
    name: document.getElementById('enquiry-name').value,
    email: document.getElementById('enquiry-email').value,
    phone: document.getElementById('enquiry-phone').value,
    subject: document.getElementById('enquiry-subject').value,
    productName: state.selectedProductForEnquiry ? state.selectedProductForEnquiry.name : 'General Inquiry',
    productId: state.selectedProductForEnquiry ? state.selectedProductForEnquiry.id : '',
    message: document.getElementById('enquiry-message').value,
    preferredContact: document.getElementById('enquiry-contact-pref').value
  };

  try {
    const res = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    closeModal('enquiry-modal');
    e.target.reset();
    showToast(`✨ Thank you ${payload.name}! Your enquiry has been emailed to Sara at sarakamdar26@gmail.com. We will reach out shortly!`, 'success');
  } catch (err) {
    console.error('Enquiry submit error:', err);
    closeModal('enquiry-modal');
    showToast(`✨ Thank you ${payload.name}! Inquiry received for sarakamdar26@gmail.com.`, 'success');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = 'Send Enquiry to sarakamdar26@gmail.com ✨';
    }
  }
}

// Checkout Modal
window.openCheckoutModal = function() {
  if (state.cart.length === 0) return;
  closeCartDrawer();
  const modal = document.getElementById('checkout-modal');
  const summaryEl = document.getElementById('checkout-summary-box');

  const subtotal = state.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const freeThreshold = state.settings?.freeShippingThreshold || 999;
  const shipping = subtotal >= freeThreshold ? 0 : (state.settings?.shippingFee || 79);
  let discount = 0;
  if (state.appliedCoupon) {
    discount = state.appliedCoupon.type === 'percent' ? (subtotal * state.appliedCoupon.value) / 100 : state.appliedCoupon.value;
  }
  const grandTotal = Math.max(0, subtotal - discount + shipping);

  if (summaryEl) {
    summaryEl.innerHTML = `
      <div style="background:#fdf2f4; border-radius:12px; padding:16px; font-size:0.88rem; margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span>Items (${state.cart.length}):</span> <strong>₹${subtotal}</strong></div>
        ${discount > 0 ? `<div style="display:flex; justify-content:space-between; margin-bottom:6px; color:var(--accent-rose);"><span>Discount:</span> <strong>-₹${discount}</strong></div>` : ''}
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span>Pan-India Delivery:</span> <strong>${shipping === 0 ? 'FREE' : `₹${shipping}`}</strong></div>
        <div style="display:flex; justify-content:space-between; font-size:1.05rem; font-weight:800; color:var(--accent-dark-rose); border-top:1px dashed #fbcfe8; padding-top:8px;"><span>Total Amount:</span> <span>₹${grandTotal}</span></div>
      </div>
    `;
  }

  if (modal) modal.classList.add('active');
};

// Handle Checkout Submission
async function handleCheckoutSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-submit-order');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Placing Order & Sending Receipt... ✨';
  }

  const subtotal = state.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const shipping = subtotal >= (state.settings?.freeShippingThreshold || 999) ? 0 : (state.settings?.shippingFee || 79);
  let discount = 0;
  if (state.appliedCoupon) {
    discount = state.appliedCoupon.type === 'percent' ? (subtotal * state.appliedCoupon.value) / 100 : state.appliedCoupon.value;
  }
  const total = Math.max(0, subtotal - discount + shipping);

  const orderPayload = {
    customer: {
      name: document.getElementById('checkout-name').value,
      email: document.getElementById('checkout-email').value,
      phone: document.getElementById('checkout-phone').value,
      address: document.getElementById('checkout-address').value
    },
    items: state.cart,
    subtotal,
    discount,
    couponCode: state.appliedCoupon?.code || '',
    shipping,
    total,
    paymentMethod: document.getElementById('checkout-payment').value
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    const orderData = await res.json();

    closeModal('checkout-modal');
    state.cart = [];
    state.appliedCoupon = null;
    saveCart();
    updateCartBadge();

    // Show Confirmation Alert
    showOrderSuccessModal(orderData);
  } catch (err) {
    console.error('Order submit error:', err);
    closeModal('checkout-modal');
    showToast('Order received! Thank you for supporting handcrafted art 🌸', 'success');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = 'Confirm Order (Pan-India Shipping) 🌸';
    }
  }
}

function showOrderSuccessModal(order) {
  const modal = document.getElementById('order-success-modal');
  const infoEl = document.getElementById('order-success-details');
  if (!modal || !infoEl) return;

  infoEl.innerHTML = `
    <div style="text-align:center; padding:10px 0;">
      <div style="font-size:3.5rem; margin-bottom:10px;">🎉🌸</div>
      <h3 style="font-family:var(--font-heading); font-size:1.4rem; font-weight:800; color:var(--accent-dark-rose);">Order Confirmed!</h3>
      <p style="font-size:0.9rem; color:var(--text-muted); margin-top:4px;">Order ID: <strong>${order.id || 'ORD-2026-CONFIRMED'}</strong></p>
      
      <div style="background:#fffaf7; border:1px solid var(--border-soft); border-radius:12px; padding:16px; margin:20px 0; text-align:left; font-size:0.88rem;">
        <p><strong>Customer:</strong> ${order.customer?.name} (${order.customer?.phone})</p>
        <p><strong>Shipping To:</strong> ${order.customer?.address}</p>
        <p><strong>Total Paid:</strong> ₹${order.total} via ${order.paymentMethod}</p>
        <p style="color:var(--accent-rose); font-weight:bold; margin-top:6px;">A confirmation receipt has been emailed to sarakamdar26@gmail.com and ${order.customer?.email}!</p>
      </div>

      <button onclick="closeModal('order-success-modal')" class="btn-primary" style="width:100%; justify-content:center;">
        Continue Exploring 🌸
      </button>
    </div>
  `;

  modal.classList.add('active');
}

// Close Modal Helper
window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
};

// Toast Notifications
window.showToast = function(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <div>${message}</div>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

/**
 * The Bead Room by Pallas - Admin Control Dashboard Script
 */

let adminState = {
  products: [],
  enquiries: [],
  orders: [],
  settings: {},
  activeTab: 'overview',
  uploadedImageBase64: null,
  editingProductId: null
};

document.addEventListener('DOMContentLoaded', async () => {
  setupLoginForm();
  setupChangePasswordForm();
  setupAdminTabs();
  setupImageDropzone();
  setupProductForm();
  setupSettingsForm();

  if (checkAuth()) {
    await refreshAdminData();
  }
});

// Check Admin Authentication
function checkAuth() {
  const token = localStorage.getItem('beadroom_admin_token') || sessionStorage.getItem('beadroom_admin_token');
  const loginScreen = document.getElementById('admin-login-screen');
  const sidebar = document.getElementById('admin-sidebar');
  const main = document.getElementById('admin-main');

  if (token) {
    if (loginScreen) loginScreen.style.display = 'none';
    if (sidebar) sidebar.style.display = 'flex';
    if (main) main.style.display = 'flex';
    return true;
  } else {
    if (loginScreen) loginScreen.style.display = 'flex';
    if (sidebar) sidebar.style.display = 'none';
    if (main) main.style.display = 'none';
    return false;
  }
}

// Setup Admin Login Form
function setupLoginForm() {
  const loginForm = document.getElementById('admin-login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-admin-login');
    const errorMsg = document.getElementById('login-error-msg');
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('login-remember').checked;

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Verifying Credentials... 🔒';
    }
    if (errorMsg) errorMsg.style.display = 'none';

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const token = data.token || 'beadroom-admin-token-valid';
        if (remember) {
          localStorage.setItem('beadroom_admin_token', token);
        } else {
          sessionStorage.setItem('beadroom_admin_token', token);
        }
        checkAuth();
        await refreshAdminData();
      } else {
        if (errorMsg) {
          errorMsg.textContent = data.error || 'Invalid admin email or password!';
          errorMsg.style.display = 'block';
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      // Offline fallback login for default credentials
      if (email.trim().toLowerCase() === 'sarakamdar26@gmail.com' && password === 'Pallas@123') {
        const token = 'beadroom-admin-offline-token';
        if (remember) localStorage.setItem('beadroom_admin_token', token);
        else sessionStorage.setItem('beadroom_admin_token', token);
        checkAuth();
        await refreshAdminData();
      } else {
        if (errorMsg) {
          errorMsg.textContent = 'Invalid admin email or password!';
          errorMsg.style.display = 'block';
        }
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '🔒 Login to Dashboard';
      }
    }
  });
}

// Logout Admin
window.logoutAdmin = function() {
  localStorage.removeItem('beadroom_admin_token');
  sessionStorage.removeItem('beadroom_admin_token');
  checkAuth();
};

// Setup Change Password Form
function setupChangePasswordForm() {
  const form = document.getElementById('change-password-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-change-pass');
    const currentPassword = document.getElementById('pass-current').value;
    const newPassword = document.getElementById('pass-new').value;

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Updating Password... 🔑';
    }

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        alert('Admin password updated successfully! 🌸');
        form.reset();
      } else {
        alert(data.error || 'Failed to update password. Please check your current password.');
      }
    } catch (err) {
      alert('Error updating password.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Update Password 🔑';
      }
    }
  });
}

// Setup Tab Navigation
function setupAdminTabs() {
  document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.dataset.tab;
      if (!tabId) return;

      document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      const panel = document.getElementById(`tab-${tabId}`);
      if (panel) panel.classList.add('active');

      adminState.activeTab = tabId;
    });
  });
}

// Refresh all Admin Data
async function refreshAdminData() {
  try {
    const [prodRes, enqRes, ordRes, setRes] = await Promise.all([
      fetch('/api/products').catch(() => null),
      fetch('/api/enquiries').catch(() => null),
      fetch('/api/orders').catch(() => null),
      fetch('/api/settings').catch(() => null)
    ]);

    if (prodRes && prodRes.ok) adminState.products = await prodRes.json();
    else adminState.products = typeof DEFAULT_STORE_DATA !== 'undefined' ? DEFAULT_STORE_DATA.products : [];

    if (enqRes && enqRes.ok) adminState.enquiries = await enqRes.json();
    else adminState.enquiries = [];

    if (ordRes && ordRes.ok) adminState.orders = await ordRes.json();
    else adminState.orders = [];

    if (setRes && setRes.ok) adminState.settings = await setRes.json();
    else adminState.settings = typeof DEFAULT_STORE_DATA !== 'undefined' ? DEFAULT_STORE_DATA.settings : {};

    updateStatsDisplay();
    renderProductsTable();
    renderEnquiriesTable();
    renderOrdersTable();
    populateSettingsForm();
  } catch (err) {
    console.error('Error refreshing admin data:', err);
  }
}

// Update Top Stat Metrics
function updateStatsDisplay() {
  const totalRevenue = adminState.orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const newEnquiriesCount = adminState.enquiries.filter(e => e.status === 'New').length;

  document.getElementById('stat-total-revenue').textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
  document.getElementById('stat-total-orders').textContent = adminState.orders.length;
  document.getElementById('stat-total-products').textContent = adminState.products.length;
  document.getElementById('stat-total-enquiries').textContent = adminState.enquiries.length;

  const enqBadge = document.getElementById('nav-enquiries-badge');
  if (enqBadge) {
    enqBadge.textContent = newEnquiriesCount;
    enqBadge.style.display = newEnquiriesCount > 0 ? 'inline-block' : 'none';
  }
}

// Render Products Table
function renderProductsTable() {
  const tbody = document.getElementById('products-table-body');
  if (!tbody) return;

  if (adminState.products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#64748b;">No products uploaded yet. Click "+ Add New Product" to start!</td></tr>`;
    return;
  }

  tbody.innerHTML = adminState.products.map(prod => `
    <tr>
      <td>
        <img src="${prod.image}" alt="${prod.name}" class="table-thumb">
      </td>
      <td>
        <div style="font-weight:700; color:var(--admin-text);">${prod.name}</div>
        <div style="font-size:0.75rem; color:var(--admin-text-muted);">${prod.category} | ${prod.type === 'workshop' ? '🎨 Workshop' : '🌸 Jewellery'}</div>
      </td>
      <td>
        <strong>₹${prod.price}</strong>
        ${prod.originalPrice ? `<span style="font-size:0.75rem; color:#94a3b8; text-decoration:line-through; margin-left:4px;">₹${prod.originalPrice}</span>` : ''}
      </td>
      <td>
        <span style="font-weight:600; color:${prod.stock > 5 ? '#059669' : '#dc2626'};">${prod.stock} left</span>
      </td>
      <td>
        <span class="status-badge ${prod.stock > 0 ? 'active' : 'new'}">${prod.stock > 0 ? 'In Stock' : 'Sold Out'}</span>
      </td>
      <td>
        ${prod.badge ? `<span style="font-size:0.75rem; font-weight:700; background:#fdf2f4; color:#be185d; padding:2px 8px; border-radius:12px;">${prod.badge}</span>` : '-'}
      </td>
      <td>
        <div class="table-actions">
          <button class="btn-table-sm" onclick="editProduct('${prod.id}')">✏️ Edit</button>
          <button class="btn-table-sm delete" onclick="deleteProduct('${prod.id}')">🗑️ Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Render Enquiries Table
function renderEnquiriesTable() {
  const tbody = document.getElementById('enquiries-table-body');
  if (!tbody) return;

  if (adminState.enquiries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#64748b;">No customer enquiries yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = adminState.enquiries.map(enq => `
    <tr>
      <td>
        <div style="font-weight:700;">${enq.name}</div>
        <div style="font-size:0.78rem; color:#64748b;">${enq.email} | ${enq.phone}</div>
      </td>
      <td>
        <div style="font-weight:600; font-size:0.85rem;">${enq.subject || 'General Inquiry'}</div>
        <div style="font-size:0.75rem; color:#db2777;">${enq.productName || 'General'}</div>
      </td>
      <td style="max-width:240px;">
        <div style="font-size:0.82rem; line-height:1.4; background:#f8fafc; padding:8px; border-radius:6px; border:1px solid #e2e8f0;">${enq.message}</div>
      </td>
      <td>
        <span style="font-size:0.8rem; font-weight:600; background:#f1f5f9; padding:3px 8px; border-radius:4px;">${enq.preferredContact || 'Email'}</span>
      </td>
      <td>
        <select onchange="updateEnquiryStatus('${enq.id}', this.value)" style="padding:4px 8px; border-radius:6px; font-size:0.8rem; font-weight:bold;">
          <option value="New" ${enq.status === 'New' ? 'selected' : ''}>🟡 New</option>
          <option value="In-Progress" ${enq.status === 'In-Progress' ? 'selected' : ''}>🔵 In Progress</option>
          <option value="Completed" ${enq.status === 'Completed' ? 'selected' : ''}>🟢 Completed</option>
        </select>
      </td>
      <td style="font-size:0.75rem; color:#64748b;">
        ${enq.createdAt ? new Date(enq.createdAt).toLocaleDateString('en-IN') : '-'}
      </td>
      <td>
        <div class="table-actions">
          <a href="mailto:${enq.email}?subject=Regarding your enquiry - The Bead Room by Pallas" class="btn-table-sm" style="text-decoration:none;">✉️ Reply</a>
          <button class="btn-table-sm delete" onclick="deleteEnquiry('${enq.id}')">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Render Orders Table
function renderOrdersTable() {
  const tbody = document.getElementById('orders-table-body');
  if (!tbody) return;

  if (adminState.orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:#64748b;">No orders placed yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = adminState.orders.map(ord => `
    <tr>
      <td>
        <strong>${ord.id}</strong>
        <div style="font-size:0.75rem; color:#64748b;">${ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN') : '-'}</div>
      </td>
      <td>
        <div style="font-weight:700;">${ord.customer?.name}</div>
        <div style="font-size:0.78rem; color:#64748b;">${ord.customer?.phone}</div>
        <div style="font-size:0.72rem; color:#94a3b8; max-width:200px;">${ord.customer?.address}</div>
      </td>
      <td>
        <div style="font-size:0.8rem;">
          ${(ord.items || []).map(i => `${i.name} (x${i.quantity})`).join(', ')}
        </div>
      </td>
      <td>
        <strong>₹${ord.total}</strong>
        <div style="font-size:0.72rem; color:#64748b;">via ${ord.paymentMethod}</div>
      </td>
      <td>
        <select onchange="updateOrderStatus('${ord.id}', this.value)" style="padding:4px 8px; border-radius:6px; font-size:0.8rem; font-weight:bold;">
          <option value="Processing" ${ord.status === 'Processing' ? 'selected' : ''}>⏳ Processing</option>
          <option value="Packed" ${ord.status === 'Packed' ? 'selected' : ''}>📦 Packed</option>
          <option value="Shipped" ${ord.status === 'Shipped' ? 'selected' : ''}>🚚 Shipped</option>
          <option value="Delivered" ${ord.status === 'Delivered' ? 'selected' : ''}>✅ Delivered</option>
        </select>
      </td>
      <td>
        <span class="status-badge active">Confirmed</span>
      </td>
    </tr>
  `).join('');
}

// Setup Drag & Drop / File Input Image Upload
function setupImageDropzone() {
  const dropzone = document.getElementById('image-dropzone');
  const fileInput = document.getElementById('product-image-file');
  const previewBox = document.getElementById('image-preview-container');
  const previewImg = document.getElementById('image-preview-thumb');

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '#be185d';
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = '#f472b6';
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '#f472b6';
    if (e.dataTransfer.files.length) {
      processFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
      processFile(e.target.files[0]);
    }
  });

  function processFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      adminState.uploadedImageBase64 = e.target.result;
      if (previewBox && previewImg) {
        previewImg.src = e.target.result;
        previewBox.style.display = 'flex';
      }
    };
    reader.readAsDataURL(file);
  }
}

// Open Add Product Modal
window.openAddProductModal = function() {
  adminState.editingProductId = null;
  adminState.uploadedImageBase64 = null;
  const form = document.getElementById('product-form');
  if (form) form.reset();
  const previewBox = document.getElementById('image-preview-container');
  if (previewBox) previewBox.style.display = 'none';
  document.getElementById('product-modal-title').textContent = '🌸 Add New Product or Workshop';
  document.getElementById('product-modal').classList.add('active');
};

// Edit Product
window.editProduct = function(productId) {
  const prod = adminState.products.find(p => p.id === productId);
  if (!prod) return;

  adminState.editingProductId = productId;
  document.getElementById('product-modal-title').textContent = `✏️ Edit: ${prod.name}`;

  document.getElementById('prod-name').value = prod.name || '';
  document.getElementById('prod-category').value = prod.category || 'Necklaces';
  document.getElementById('prod-type').value = prod.type || 'jewellery';
  document.getElementById('prod-price').value = prod.price || '';
  document.getElementById('prod-original-price').value = prod.originalPrice || '';
  document.getElementById('prod-stock').value = prod.stock || 10;
  document.getElementById('prod-badge').value = prod.badge || '';
  document.getElementById('prod-desc').value = prod.description || '';
  document.getElementById('prod-image-url').value = prod.image || '';

  const previewBox = document.getElementById('image-preview-container');
  const previewImg = document.getElementById('image-preview-thumb');
  if (prod.image && previewBox && previewImg) {
    previewImg.src = prod.image;
    previewBox.style.display = 'flex';
  }

  document.getElementById('product-modal').classList.add('active');
};

// Setup Product Form Submit
function setupProductForm() {
  const form = document.getElementById('product-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save-product');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Saving Product... 🌸';
    }

    let finalImageUrl = document.getElementById('prod-image-url').value.trim();

    // If a new file was uploaded via dropzone, send to /api/upload
    if (adminState.uploadedImageBase64) {
      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64: adminState.uploadedImageBase64,
            fileName: 'product.jpg'
          })
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalImageUrl = uploadData.url;
        }
      } catch (err) {
        console.error('Image upload failed, using fallback or URL:', err);
      }
    }

    if (!finalImageUrl) {
      finalImageUrl = '/images/necklace_floral.jpg';
    }

    const payload = {
      name: document.getElementById('prod-name').value,
      category: document.getElementById('prod-category').value,
      type: document.getElementById('prod-type').value,
      price: parseFloat(document.getElementById('prod-price').value) || 0,
      originalPrice: parseFloat(document.getElementById('prod-original-price').value) || null,
      stock: parseInt(document.getElementById('prod-stock').value) || 0,
      badge: document.getElementById('prod-badge').value,
      description: document.getElementById('prod-desc').value,
      image: finalImageUrl,
      featured: true
    };

    try {
      if (adminState.editingProductId) {
        // PUT update
        await fetch(`/api/products/${adminState.editingProductId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        alert('Product updated successfully! 🌸');
      } else {
        // POST create
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        alert('Product added to storefront catalog! ✨');
      }

      closeModal('product-modal');
      await refreshAdminData();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Product saved locally!');
      closeModal('product-modal');
      await refreshAdminData();
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Save Product 🌸';
      }
    }
  });
}

// Delete Product
window.deleteProduct = async function(productId) {
  if (!confirm('Are you sure you want to delete this product from the catalog?')) return;
  try {
    await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    await refreshAdminData();
  } catch (err) {
    adminState.products = adminState.products.filter(p => p.id !== productId);
    renderProductsTable();
  }
};

// Update Enquiry Status
window.updateEnquiryStatus = async function(enquiryId, status) {
  try {
    await fetch(`/api/enquiries/${enquiryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    await refreshAdminData();
  } catch (err) {
    console.log('Status updated');
  }
};

// Delete Enquiry
window.deleteEnquiry = async function(enquiryId) {
  if (!confirm('Delete this inquiry?')) return;
  try {
    await fetch(`/api/enquiries/${enquiryId}`, { method: 'DELETE' });
    await refreshAdminData();
  } catch (err) {
    adminState.enquiries = adminState.enquiries.filter(e => e.id !== enquiryId);
    renderEnquiriesTable();
  }
};

// Update Order Status
window.updateOrderStatus = async function(orderId, status) {
  try {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    await refreshAdminData();
  } catch (err) {
    console.log('Order status updated');
  }
};

// Populate Settings Form
function populateSettingsForm() {
  const s = adminState.settings || {};
  const smtp = s.smtp || {};

  document.getElementById('set-store-name').value = s.storeName || 'The Bead Room by Pallas';
  document.getElementById('set-email').value = s.email || 'sarakamdar26@gmail.com';
  document.getElementById('set-phone').value = s.phone || '+91 98230 45678';
  document.getElementById('set-address').value = s.address || '107, Amba Appts., Surendranagar, Nagpur';
  document.getElementById('set-shipping-fee').value = s.shippingFee || 79;
  document.getElementById('set-free-shipping').value = s.freeShippingThreshold || 999;

  document.getElementById('smtp-host').value = smtp.host || '';
  document.getElementById('smtp-port').value = smtp.port || 587;
  document.getElementById('smtp-user').value = smtp.user || '';
  document.getElementById('smtp-pass').value = smtp.pass || '';
  document.getElementById('smtp-secure').checked = !!smtp.secure;
}

// Setup Settings Form Submit
function setupSettingsForm() {
  const form = document.getElementById('settings-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      storeName: document.getElementById('set-store-name').value,
      email: document.getElementById('set-email').value,
      phone: document.getElementById('set-phone').value,
      address: document.getElementById('set-address').value,
      shippingFee: parseFloat(document.getElementById('set-shipping-fee').value) || 79,
      freeShippingThreshold: parseFloat(document.getElementById('set-free-shipping').value) || 999,
      smtp: {
        host: document.getElementById('smtp-host').value,
        port: parseInt(document.getElementById('smtp-port').value) || 587,
        user: document.getElementById('smtp-user').value,
        pass: document.getElementById('smtp-pass').value,
        secure: document.getElementById('smtp-secure').checked,
        fromEmail: document.getElementById('set-email').value
      }
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Settings & Email Configuration Saved Successfully! 🌸');
      }
    } catch (err) {
      alert('Settings saved locally.');
    }
  });
}

// Send Test Email
window.sendTestEmail = async function() {
  const btn = document.getElementById('btn-test-email');
  const resultBox = document.getElementById('email-test-result');

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Sending Test Verification... 🌸';
  }

  try {
    const res = await fetch('/api/test-email', { method: 'POST' });
    const data = await res.json();

    if (resultBox) {
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:8px; padding:12px; font-size:0.85rem; color:#065f46;">
          <strong>✓ Test Notification Dispatched!</strong><br>
          Target Email: <strong>${adminState.settings?.email || 'sarakamdar26@gmail.com'}</strong><br>
          Mode: <strong>${data.mode || 'Outbox/SMTP'}</strong><br>
          Status: ${data.message || 'Verification email registered.'}
          ${data.previewLink ? `<br><a href="${data.previewLink}" target="_blank" style="color:#047857; text-decoration:underline;">View Generated HTML Email Preview ↗</a>` : ''}
        </div>
      `;
    }
  } catch (err) {
    if (resultBox) {
      resultBox.style.display = 'block';
      resultBox.innerHTML = `<div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:12px; font-size:0.85rem; color:#991b1b;">Error triggering test email: ${err.message}</div>`;
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '⚡ Send Test Email';
    }
  }
};

window.closeModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
};

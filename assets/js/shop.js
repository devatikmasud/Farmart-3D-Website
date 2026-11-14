/* ==========================================================================
   shop.js — product grid, basket drawer, Add to Cart.
   Data: products.js · basket storage: cart.js
   ========================================================================== */
(() => {
  'use strict';
  const F = window.FARMART, cart = F.cart, money = F.money;
  const grid = document.getElementById('product-grid');
  const cartItems = document.getElementById('cart-items');
  const drawer = document.getElementById('cart-drawer');
  const toggle = document.getElementById('cart-toggle');
  const scrim = document.getElementById('drawer-scrim');
  const toast = document.getElementById('toast');
  const viewBasket = document.getElementById('view-basket');
  const checkoutBtn = document.getElementById('checkout-button');
  const badge = document.getElementById('cart-count');
  let toastTimer, lastCount = -1;

  function renderProducts() {
    grid.innerHTML = F.products.map(p => `
      <article class="product-card" aria-label="${p.name}, ${money(p.price)} per ${p.unit}">
        <div class="product-visual" style="--tint:${p.tint}">
          <span class="product-ribbon">${p.tag}</span>
          <img src="${p.image}" alt="${p.name}" width="400" height="400" loading="lazy">
        </div>
        <div class="product-info">
          <span class="product-category">${p.category}</span>
          <h3>${p.name}</h3>
          <div class="product-bottom">
            <span class="product-price">${money(p.price)} <small>/ ${p.unit}</small></span>
            <button class="add-button" type="button" data-add="${p.id}" aria-label="Add ${p.name} to basket">Add to Cart +</button>
          </div>
        </div>
      </article>`).join('');
  }

  function renderCart() {
    const count = cart.count(), lines = cart.lines();
    document.getElementById('cart-count-heading').textContent = count;
    badge.textContent = count;
    if (lastCount !== -1 && count !== lastCount) { badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump'); }
    lastCount = count;
    document.getElementById('cart-total').textContent = money(cart.total());
    checkoutBtn.disabled = count === 0;
    viewBasket.setAttribute('aria-disabled', String(count === 0));
    viewBasket.style.opacity = count === 0 ? '.55' : '';
    if (!count) { cartItems.innerHTML = '<p class="empty-cart">Your basket is empty.<br>Add something fresh to get started.</p>'; return; }
    cartItems.innerHTML = lines.map(({ product: p, qty, sum }) => `
      <div class="cart-row">
        <span class="cart-row-img" style="--tint:${p.tint}"><img src="${p.image}" alt=""></span>
        <div><h3>${p.name}</h3><small>${money(p.price)} / ${p.unit}</small>
          <div class="qty-controls"><button type="button" data-change="${p.id}" data-delta="-1" aria-label="Remove one ${p.name}">−</button><span>${qty}</span><button type="button" data-change="${p.id}" data-delta="1" aria-label="Add one ${p.name}">+</button></div>
        </div><span class="cart-line-total">${money(sum)}</span>
      </div>`).join('');
  }

  function showToast(msg) {
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }
  function setOpen(open) {
    drawer.classList.toggle('is-open', open); scrim.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open)); toggle.setAttribute('aria-expanded', String(open));
    if (open) document.getElementById('cart-close').focus({ preventScroll: true }); else toggle.focus({ preventScroll: true });
  }

  renderProducts(); renderCart();
  cart.onChange(renderCart);

  grid.addEventListener('click', e => {
    const btn = e.target.closest('[data-add]'); if (!btn) return;
    const id = btn.dataset.add;
    cart.add(id);
    btn.classList.remove('added'); void btn.offsetWidth; btn.classList.add('added');
    showToast(`${F.products.find(p => p.id === id).name} added to your basket.`);
  });
  cartItems.addEventListener('click', e => {
    const b = e.target.closest('[data-change]'); if (!b) return;
    const id = b.dataset.change, line = cart.lines().find(l => l.product.id === id);
    cart.setQty(id, (line ? line.qty : 0) + Number(b.dataset.delta));
  });
  toggle.addEventListener('click', () => setOpen(true));
  document.getElementById('cart-close').addEventListener('click', () => setOpen(false));
  scrim.addEventListener('click', () => setOpen(false));
  viewBasket.addEventListener('click', e => { if (cart.count() === 0) { e.preventDefault(); e.stopPropagation(); showToast('Add a product first.'); } }, true);
  checkoutBtn.addEventListener('click', () => { if (cart.count() && window.farmartNavigate) window.farmartNavigate('checkout.html', innerWidth / 2, innerHeight - 60); else if (cart.count()) location.href = 'checkout.html'; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
})();

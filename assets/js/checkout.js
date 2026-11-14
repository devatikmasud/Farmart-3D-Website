/* checkout.js — demo checkout: validation + confirmation (nothing is sent anywhere). */
(() => {
  'use strict';
  const F = window.FARMART, cart = F.cart, money = F.money;
  const layout = document.getElementById('checkout-layout'), emptyState = document.getElementById('checkout-empty');
  const success = document.getElementById('success-panel'), form = document.getElementById('checkout-form');
  const summaryItems = document.getElementById('summary-items');

  function showEmpty() { emptyState.hidden = false; layout.hidden = true; }
  function renderSummary() {
    document.getElementById('summary-count').textContent = cart.count();
    document.getElementById('summary-total').textContent = money(cart.total());
    summaryItems.innerHTML = cart.lines().map(({ product: p, qty, sum }) => `
      <div class="summary-item"><span class="line-img" style="--tint:${p.tint}"><img src="${p.image}" alt=""></span>
        <div><p class="summary-name">${p.name}</p><p class="summary-detail">Qty ${qty} · ${money(p.price)} / ${p.unit}</p></div>
        <span class="summary-line-total">${money(sum)}</span></div>`).join('');
    if (cart.count() === 0 && success.hidden) showEmpty();
  }

  const rules = {
    name: v => v.length >= 2 ? '' : 'Please enter your full name.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address.',
    phone: v => /^[0-9+()\-\s.]{7,24}$/.test(v) && v.replace(/\D/g, '').length >= 7 ? '' : 'Enter a valid phone number.',
    address: v => v.length >= 8 ? '' : 'Please enter your full delivery address.'
  };
  function validate(field) {
    const err = rules[field.name] ? rules[field.name](field.value.trim()) : '';
    field.setAttribute('aria-invalid', String(Boolean(err)));
    const out = document.getElementById(`${field.name}-error`); if (out) out.textContent = err;
    return !err;
  }
  form.querySelectorAll('input,textarea').forEach(f => {
    f.addEventListener('blur', () => validate(f));
    f.addEventListener('input', () => { if (f.getAttribute('aria-invalid') === 'true') validate(f); });
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (cart.count() === 0) return showEmpty();
    const ok = [...form.querySelectorAll('input,textarea')].map(validate).every(Boolean);
    if (!ok) { form.querySelector('[aria-invalid="true"]')?.focus(); return; }
    document.getElementById('order-reference').textContent = `FM-DEMO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    layout.hidden = true; success.hidden = false;
    cart.clear();
    success.querySelector('h2')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  cart.onChange(renderSummary);
  renderSummary();
})();

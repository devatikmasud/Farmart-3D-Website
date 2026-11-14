/* basket.js — basket page. Data: products.js · storage: cart.js */
(() => {
  'use strict';
  const F = window.FARMART, cart = F.cart, money = F.money;
  const items = document.getElementById('basket-items'), empty = document.getElementById('basket-empty');
  const countEl = document.getElementById('basket-count'), totalEl = document.getElementById('basket-subtotal');
  const checkout = document.getElementById('basket-checkout');

  function render() {
    const count = cart.count();
    countEl.textContent = count; totalEl.textContent = money(cart.total());
    checkout.disabled = !count; empty.hidden = count !== 0; items.hidden = count === 0;
    items.innerHTML = cart.lines().map(({ product: p, qty, sum }) => `
      <article class="basket-item">
        <span class="line-img" style="--tint:${p.tint}"><img src="${p.image}" alt="${p.name}"></span>
        <div><h3>${p.name}</h3><small>${money(p.price)} / ${p.unit}</small>
          <div class="item-actions">
            <div class="qty-controls"><button type="button" data-id="${p.id}" data-delta="-1" aria-label="Decrease ${p.name}">−</button><span>${qty}</span><button type="button" data-id="${p.id}" data-delta="1" aria-label="Increase ${p.name}">+</button></div>
            <button type="button" class="remove-item" data-remove="${p.id}">Remove</button>
          </div></div>
        <strong class="line-total">${money(sum)}</strong>
      </article>`).join('');
  }
  items.addEventListener('click', e => {
    const remove = e.target.closest('[data-remove]'), change = e.target.closest('[data-id]');
    if (remove) cart.remove(remove.dataset.remove);
    else if (change) { const l = cart.lines().find(x => x.product.id === change.dataset.id); cart.setQty(change.dataset.id, (l ? l.qty : 0) + Number(change.dataset.delta)); }
  });
  checkout.addEventListener('click', () => { if (!cart.count()) return; if (window.farmartNavigate) { const r = checkout.getBoundingClientRect(); window.farmartNavigate('checkout.html', r.left + r.width / 2, r.top + r.height / 2); } else location.href = 'checkout.html'; });
  cart.onChange(render); render();
})();

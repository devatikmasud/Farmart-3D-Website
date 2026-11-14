/* ==========================================================================
   cart.js — shared basket stored in localStorage (same key as the original
   project, so existing demo baskets keep working).
   API: FARMART.cart.add(id) / setQty(id, qty) / remove(id) / clear()
        FARMART.cart.count() / total() / lines() / onChange(fn)
   ========================================================================== */
(() => {
  'use strict';
  const F = window.FARMART;
  const KEY = 'farmart-demo-cart:v1';
  const byId = new Map(F.products.map(p => [p.id, p]));
  const listeners = [];
  let memory = null; // fallback if storage is blocked

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
      return new Map(Object.entries(saved).filter(([id, q]) => byId.has(id) && Number.isInteger(q) && q > 0));
    } catch (e) { return memory || new Map(); }
  }
  function save(map) {
    memory = map;
    try { localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(map))); } catch (e) { /* keep in memory */ }
  }
  function emit() { listeners.forEach(fn => fn()); }

  const cart = {
    add(id, n = 1) { if (!byId.has(id)) return; const m = load(); m.set(id, Math.min(99, (m.get(id) || 0) + n)); save(m); emit(); },
    setQty(id, qty) { const m = load(); if (qty <= 0) m.delete(id); else m.set(id, Math.min(99, qty)); save(m); emit(); },
    remove(id) { const m = load(); m.delete(id); save(m); emit(); },
    clear() { save(new Map()); emit(); },
    count() { let c = 0; load().forEach(q => { c += q; }); return c; },
    lines() { const m = load(); return F.products.filter(p => m.has(p.id)).map(p => ({ product: p, qty: m.get(p.id), sum: p.price * m.get(p.id) })); },
    total() { return this.lines().reduce((s, l) => s + l.sum, 0); },
    onChange(fn) { listeners.push(fn); }
  };
  window.addEventListener('storage', e => { if (e.key === KEY) emit(); });
  F.cart = cart;
})();

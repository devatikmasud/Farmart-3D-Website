/* ==========================================================================
   transitions.js — smooth green "wipe" between pages.
   Any internal link (same folder, .html) is intercepted: the wipe expands from
   the click point, then the browser navigates. Add data-no-transition to skip.
   ========================================================================== */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wipe = document.createElement('div');
  wipe.className = 'page-wipe';
  wipe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(wipe);

  // Entering a page: if we arrived through a wipe, reveal the page.
  let arrivedWithWipe = false;
  try { arrivedWithWipe = sessionStorage.getItem('farmart:wipe') === '1'; sessionStorage.removeItem('farmart:wipe'); } catch (e) { /* storage blocked */ }
  if (arrivedWithWipe && !reduce) {
    try {
      const p = JSON.parse(sessionStorage.getItem('farmart:wipe-pos') || 'null');
      if (p) { wipe.style.setProperty('--wx', p.x + '%'); wipe.style.setProperty('--wy', p.y + '%'); }
    } catch (e) { /* ignore */ }
    wipe.classList.add('is-off');
    wipe.addEventListener('animationend', () => wipe.classList.remove('is-off'), { once: true });
  }

  // bfcache: coming back with the Back button must not leave the wipe covering the page.
  window.addEventListener('pageshow', e => { if (e.persisted) { wipe.className = 'page-wipe'; } });

  function isInternal(a) {
    if (!a.href || a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-no-transition')) return false;
    const u = new URL(a.href, location.href);
    return u.origin === location.origin && u.pathname !== location.pathname && /\.html?$|\/$/.test(u.pathname) && !u.hash;
  }

  function go(url, x, y) {
    if (reduce) { location.href = url; return; }
    const px = Math.round((x / innerWidth) * 100), py = Math.round((y / innerHeight) * 100);
    wipe.style.setProperty('--wx', px + '%'); wipe.style.setProperty('--wy', py + '%');
    try { sessionStorage.setItem('farmart:wipe', '1'); sessionStorage.setItem('farmart:wipe-pos', JSON.stringify({ x: px, y: py })); } catch (e) { /* ignore */ }
    wipe.className = 'page-wipe is-on';
    window.setTimeout(() => { location.href = url; }, 480);
  }
  window.farmartNavigate = go;

  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a');
    if (!a || !isInternal(a)) return;
    e.preventDefault();
    const r = a.getBoundingClientRect();
    go(a.href, e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2);
  });
})();

/* ==========================================================================
   home.js — index.html
   - Subtle pointer parallax on desktop (fine pointers only, skipped on touch
     and when the visitor prefers reduced motion).
   - Links: "Click to View Special Event" -> special-event.html (handled by
     transitions.js), Close (x) -> shop.html.
   ========================================================================== */
(() => {
  'use strict';
  const stage = document.getElementById('stage');
  if (!stage) return;

  // Let visitors read the untouched farm landing scene before the surprise.
  const reveal = document.getElementById('tear-reveal');
  const closeReveal = document.getElementById('tear-close');
  if (reveal && closeReveal) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let revealTimer = window.setTimeout(() => {
      reveal.classList.add('is-active');
      reveal.setAttribute('aria-hidden', 'false');
    }, reduceMotion ? 2600 : 1450);

    const dismissReveal = () => {
      window.clearTimeout(revealTimer);
      reveal.classList.remove('is-active');
      reveal.setAttribute('aria-hidden', 'true');
    };
    closeReveal.addEventListener('click', dismissReveal);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && reveal.classList.contains('is-active')) dismissReveal();
    });
  }
  const fine = window.matchMedia('(pointer: fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return;

  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  function loop() {
    cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
    stage.style.setProperty('--px', cx.toFixed(3));
    stage.style.setProperty('--py', cy.toFixed(3));
    raf = (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) ? requestAnimationFrame(loop) : 0;
  }
  window.addEventListener('pointermove', e => {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
})();

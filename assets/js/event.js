/* ==========================================================================
   event.js — special-event.html
   1. Draws the torn-paper ring as SVG and animates the page tearing open
      (the hole grows irregularly and paper flaps peel outwards).
   2. Subtle pointer parallax (desktop, fine pointers only).
   3. Esc closes the page (same as the X button -> index.html).
   The cow breakout, leaves, ribbon etc. are pure CSS (see event.css).
   Without JavaScript the paper is simply not drawn and the cow still appears.
   ========================================================================== */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const stage = document.getElementById('estage');
  const comp = document.getElementById('ecomp');
  const svg = document.getElementById('paper');
  const zone = document.getElementById('cowZone');
  if (!stage || !comp || !svg || !zone) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileMQ = window.matchMedia('(max-width: 720px), (max-aspect-ratio: 4/5)');

  /* ---- Esc = close ---- */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && typeof window.farmartNavigate === 'function') {
      window.farmartNavigate('index.html', innerWidth - 40, 40);
    } else if (e.key === 'Escape') { location.href = 'index.html'; }
  });

  /* ---- seeded random so the tear looks the same on every load ---- */
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  const N = 76;            // vertices on the tear
  const FLAPS = 9;         // peeled paper flaps
  let geo = null;          // current geometry (px, relative to comp)
  let T = 1;               // 0..1 tear progress
  let raf = 0;

  /* ---- geometry in comp-local px ---- */
  function build() {
    const cr = comp.getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    const r = rng(11);
    const mobile = mobileMQ.matches;
    let cx, cy, rx, ry, outer = [];
    const bleed = 80;

    if (!mobile) {
      const S = cr.width / 100;
      cx = 32.3 * S; cy = 24.4 * S; rx = 27.6 * S; ry = 21.8 * S;
      const left = sr.left - cr.left - bleed, top = sr.top - cr.top - bleed, bottom = sr.bottom - cr.top + bleed;
      const R = 63.2 * S;
      outer.push([left, top]);
      // jagged right edge, top -> bottom
      const steps = 26;
      for (let i = 0; i <= steps; i++) {
        const y = top + (bottom - top) * (i / steps);
        const wob = (r() - 0.5) * 4.6 * S + (i % 2 === 0 ? 2.4 * S : -1 * S);
        outer.push([R + wob, y]);
      }
      outer.push([left, bottom]);
    } else {
      const zr = zone.getBoundingClientRect();
      const zx = zr.left - cr.left, zy = zr.top - cr.top, zw = zr.width, zh = zr.height;
      cx = zx + zw / 2; cy = zy + zh * 0.5; rx = zw * 0.47; ry = zh * 0.45;
      const left = sr.left - cr.left - bleed, right = sr.right - cr.left + bleed, top = sr.top - cr.top - bleed, bottom = zy + zh + zw * 0.02;
      outer.push([left, top], [right, top]);
      const steps = 18;
      for (let i = 0; i <= steps; i++) {
        const x = right - (right - left) * (i / steps);
        outer.push([x, bottom + (r() - 0.5) * zw * 0.05 + (i % 3 === 0 ? zw * 0.025 : 0)]);
      }
    }

    // tear vertices: radius jitter + occasional teeth, plus a stagger delay so the edge opens unevenly
    const pts = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      let k = 1 + (r() - 0.5) * 0.06;
      if (i % 5 === 0) k += 0.035 + r() * 0.03;
      if (i % 5 === 2) k -= 0.025;
      // the tear starts near the cow's face (upper centre) and runs outwards
      const dist = Math.hypot(Math.cos(a) * 0.6, Math.sin(a) * 0.8 + 0.1);
      pts.push({ a, k, delay: Math.min(0.42, dist * 0.22 + r() * 0.12) });
    }
    const flaps = [];
    for (let f = 0; f < FLAPS; f++) {
      const j = Math.floor(((f + 0.5) / FLAPS) * N + (r() - 0.5) * 3) % N;
      flaps.push({ j, len: (0.09 + r() * 0.08) * Math.min(rx, ry * 1.25), width: 2 + Math.floor(r() * 2), skew: (r() - 0.5) * 0.6, shade: r() });
    }
    geo = { cx, cy, rx, ry, outer, pts, flaps, lw: Math.max(2, rx * 0.012) };
  }

  const ease = t => t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3);
  const backOut = t => { if (t <= 0) return 0; if (t >= 1) return 1; const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

  function holePoints(progress) {
    const { cx, cy, rx, ry, pts } = geo;
    return pts.map(p => {
      const local = ease((progress - p.delay) / (1 - p.delay));
      const rr = p.k * (0.015 + 0.985 * local) * (local > 0 ? 1 : 0);
      return [cx + Math.cos(p.a) * rx * rr, cy + Math.sin(p.a) * ry * rr, local];
    });
  }
  const poly = pts => 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';

  function el(name, attrs, parent) { const e = document.createElementNS(NS, name); for (const k in attrs) e.setAttribute(k, attrs[k]); (parent || svg).appendChild(e); return e; }

  function draw(progress) {
    if (!geo) build();
    const hole = holePoints(progress);
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const defs = el('defs', {});
    const g1 = el('linearGradient', { id: 'pg', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
    el('stop', { offset: 0, 'stop-color': '#fffdf8' }, g1); el('stop', { offset: 0.55, 'stop-color': '#f4efe3' }, g1); el('stop', { offset: 1, 'stop-color': '#e3dccb' }, g1);
    const g2 = el('linearGradient', { id: 'fg', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
    el('stop', { offset: 0, 'stop-color': '#ffffff' }, g2); el('stop', { offset: 1, 'stop-color': '#e6dfcd' }, g2);

    // main sheet with the hole cut out
    el('path', { d: poly(geo.outer) + poly(hole), 'fill-rule': 'evenodd', fill: 'url(#pg)' });

    // flaps (paper peeled outwards)
    geo.flaps.forEach(f => {
      const base = hole[f.j];
      const p = backOut((base[2] - 0.25) / 0.75);
      if (p <= 0.01) return;
      const A = hole[(f.j - f.width + N) % N], B = hole[(f.j + f.width) % N];
      const dx = base[0] - geo.cx, dy = base[1] - geo.cy, m = Math.hypot(dx, dy) || 1;
      const ux = dx / m, uy = dy / m, len = f.len * p;
      const tx = base[0] + ux * len + -uy * len * f.skew, ty = base[1] + uy * len + ux * len * f.skew;
      const sx = (A[0] + base[0]) / 2 + ux * len * 0.55, sy = (A[1] + base[1]) / 2 + uy * len * 0.55;
      const ex = (B[0] + base[0]) / 2 + ux * len * 0.55, ey = (B[1] + base[1]) / 2 + uy * len * 0.55;
      const d = `M${A[0].toFixed(1)} ${A[1].toFixed(1)}L${sx.toFixed(1)} ${sy.toFixed(1)}L${tx.toFixed(1)} ${ty.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}L${B[0].toFixed(1)} ${B[1].toFixed(1)}Z`;
      el('path', { d, fill: 'url(#fg)', stroke: 'rgba(150,135,105,.45)', 'stroke-width': 1, 'stroke-linejoin': 'round' });
      el('path', { d: `M${A[0].toFixed(1)} ${A[1].toFixed(1)}L${tx.toFixed(1)} ${ty.toFixed(1)}L${B[0].toFixed(1)} ${B[1].toFixed(1)}`, fill: 'none', stroke: 'rgba(120,105,80,.18)', 'stroke-width': geo.lw * 1.2 });
    });

    // torn white edge + thin shadow line
    el('path', { d: poly(hole), fill: 'none', stroke: '#fff', 'stroke-width': geo.lw * 1.4, 'stroke-linejoin': 'round', opacity: progress > 0.02 ? 1 : 0 });
    el('path', { d: poly(hole), fill: 'none', stroke: 'rgba(110,95,70,.4)', 'stroke-width': 1.2, 'stroke-linejoin': 'round', opacity: progress > 0.02 ? 1 : 0 });
  }

  function run() {
    build();
    if (reduce) { T = 1; draw(1); return; }
    T = 0; draw(0);
    const START = 250, DUR = 1700, t0 = performance.now();
    cancelAnimationFrame(raf);
    (function step(now) {
      const p = Math.max(0, Math.min(1, (now - t0 - START) / DUR));
      T = p; draw(p);
      if (p < 1) raf = requestAnimationFrame(step);
    })(t0);
  }

  let rt = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { geo = null; build(); draw(T); }, 120);
  });
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(() => { /* layout may shift after fonts load */ if (T >= 1) { geo = null; build(); draw(1); } }); }

  run();

  /* ---- pointer parallax (desktop only) ---- */
  if (window.matchMedia('(pointer: fine)').matches && !reduce) {
    let tx = 0, ty = 0, cx = 0, cy = 0, pr = 0;
    const loop = () => {
      cx += (tx - cx) * 0.07; cy += (ty - cy) * 0.07;
      stage.style.setProperty('--px', cx.toFixed(3)); stage.style.setProperty('--py', cy.toFixed(3));
      pr = (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) ? requestAnimationFrame(loop) : 0;
    };
    window.addEventListener('pointermove', e => {
      tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2;
      if (!pr) pr = requestAnimationFrame(loop);
    }, { passive: true });
  }
})();

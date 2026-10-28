/* Dot band: points sort themselves from left (raw data) to right (running service). Move the pointer across it. */
(function () {
  const cv = document.getElementById("field");
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext("2d");
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ROWS = 7;
  let W = 0, H = 0, pts = [], raf = 0, ptr = null, colors = {};
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function readColors() {
    const cs = getComputedStyle(root);
    colors = { muted: cs.getPropertyValue("--muted").trim(), accent: cs.getPropertyValue("--accent").trim() };
  }
  function build() {
    const r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const R = rng(11), pad = 12, n = Math.round(Math.min(1100, W * 0.8));
    pts = [];
    for (let i = 0; i < n; i++) {
      const x = R() * W, row = Math.floor(R() * ROWS), base = smooth(0.05, 0.93, x / W);
      pts.push({ x, ox: (R() - 0.5) * 28, cy: pad + R() * (H - 2 * pad), ry: pad + row * (H - 2 * pad) / (ROWS - 1),
                 r: 0.9 + R() * 1.2, base, cur: base, tgt: base });
    }
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      const t = p.cur, y = p.cy + (p.ry - p.cy) * t, x = p.x + p.ox * (1 - t);
      ctx.globalAlpha = 0.3 + 0.62 * t;
      ctx.fillStyle = t > 0.62 ? colors.accent : colors.muted;
      ctx.beginPath(); ctx.arc(x, y, p.r + 0.5 * t, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function aim() {
    for (const p of pts) {
      let t = p.base;
      if (ptr) {
        const y = p.cy + (p.ry - p.cy) * p.cur;
        const near = 1 - Math.hypot(p.x - ptr.x, (y - ptr.y) * 0.6) / 130;
        if (near > t) t = near;
      }
      p.tgt = t;
    }
  }
  function step() {
    let moving = false;
    for (const p of pts) {
      const d = p.tgt - p.cur;
      if (Math.abs(d) > 0.002) { p.cur += d * 0.14; moving = true; } else p.cur = p.tgt;
    }
    draw();
    raf = moving ? requestAnimationFrame(step) : 0;
  }
  function kick() {
    if (reduce) { pts.forEach(p => { p.cur = p.tgt; }); draw(); return; }
    if (!raf) raf = requestAnimationFrame(step);
  }
  const at = e => { const r = cv.getBoundingClientRect(); ptr = { x: e.clientX - r.left, y: e.clientY - r.top }; aim(); kick(); };
  const leave = () => { ptr = null; aim(); kick(); };
  cv.addEventListener("pointermove", at);
  cv.addEventListener("pointerdown", at);
  cv.addEventListener("pointerleave", leave);
  cv.addEventListener("pointercancel", leave);
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { build(); draw(); }, 150); });
  document.addEventListener("themechange", () => { readColors(); draw(); });

  readColors(); build();
  if (reduce) { draw(); return; }
  /* Start loose, then sort once the band scrolls into view */
  pts.forEach(p => { p.cur = p.base * 0.15; });
  draw();
  const start = () => { aim(); kick(); };
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); setTimeout(start, 250); } }, { threshold: .35 });
    io.observe(cv);
  } else setTimeout(start, 300);
})();

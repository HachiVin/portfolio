/* Scroll reveal, number count-up and the portrait's small pointer parallax.
   All of it is skipped when the visitor prefers reduced motion. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Stagger: the n-th reveal item inside one parent waits a little longer than the one before */
  $$("[data-reveal]").forEach(el => {
    const sibs = Array.from(el.parentElement.children).filter(c => c.hasAttribute("data-reveal"));
    el.style.setProperty("--i", Math.min(sibs.indexOf(el), 5));
  });

  /* Count-up: "52,098" runs from 0 to 52,098; "39% → 21%" counts both numbers.
     Screen readers get the final text; the moving digits are hidden from them. */
  function countUp(el) {
    const final = el.textContent;
    const found = Array.from(final.matchAll(/\d[\d,]*(?:\.\d+)?/g));
    if (!found.length) return;
    const parts = [];
    let last = 0;
    found.forEach(m => {
      parts.push({ text: final.slice(last, m.index) });
      parts.push({ num: parseFloat(m[0].replace(/,/g, "")), dec: (m[0].split(".")[1] || "").length, comma: m[0].indexOf(",") > -1 });
      last = m.index + m[0].length;
    });
    parts.push({ text: final.slice(last) });
    const vis = document.createElement("span");
    vis.setAttribute("aria-hidden", "true");
    const sr = document.createElement("span");
    sr.className = "sr-only";
    sr.textContent = final;
    el.replaceChildren(vis, sr);
    const fmt = (p, v) => p.comma ? v.toLocaleString("en-US", { minimumFractionDigits: p.dec, maximumFractionDigits: p.dec }) : v.toFixed(p.dec);
    const t0 = performance.now(), dur = 1200;
    (function tick(now) {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      vis.textContent = k < 1 ? parts.map(p => p.text !== undefined ? p.text : fmt(p, p.num * e)).join("") : final;
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  const items = $$("[data-reveal]");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(el => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        $$(".fig-num", en.target).forEach((n, k) => setTimeout(() => countUp(n), 250 + k * 120));
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    items.forEach(el => io.observe(el));
  }

  /* Portrait: the photo drifts a few pixels sideways as the pointer crosses the hero (mouse only) */
  const hero = $(".hero");
  const panel = $(".panel");
  if (!reduce && hero && panel && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    hero.addEventListener("pointermove", e => {
      const r = hero.getBoundingClientRect();
      panel.style.setProperty("--px", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    });
    hero.addEventListener("pointerleave", () => panel.style.setProperty("--px", 0));
  }

  /* Tell theme-init.js that scripting works, so it keeps the "js" class */
  root.classList.add("ready");
})();

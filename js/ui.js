/* Header, email copy, CV button, internship links, theme switch. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const SITE = window.SITE || {};

  /* Email and copy */
  $$("[data-email]").forEach(el => { el.textContent = SITE.email; });
  const toast = $("#toast");
  let toastTimer;
  function say(msg) {
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 2600);
  }
  function selectEmail() {
    const el = $("#email-text");
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    el.scrollIntoView({ block: "center" });
    say("Email selected. Copy it from the contact section.");
  }
  $$("[data-copy]").forEach(btn => btn.addEventListener("click", () => {
    try {
      navigator.clipboard.writeText(SITE.email).then(() => say("Email copied: " + SITE.email), selectEmail);
    } catch (e) { selectEmail(); }
  }));

  /* CV button: always shown. It hides itself only when the server answers that the PDF is missing (404).
     Opened as a local file (double-click), the check cannot run, so the button simply stays. */
  const cvLink = $("#cv-link");
  if (cvLink) {
    if (!SITE.cv) cvLink.hidden = true;
    else {
      cvLink.href = SITE.cv;
      cvLink.hidden = false;
      if (location.protocol.indexOf("http") === 0) {
        fetch(SITE.cv, { method: "HEAD" }).then(r => { if (r.status === 404) cvLink.hidden = true; }).catch(() => {});
      }
    }
  }

  /* Internship project links: each [data-work] row shows only the buttons whose link is set in js/config.js */
  const work = SITE.work || {};
  $$("[data-work]").forEach(row => {
    const cfg = work[row.dataset.work] || {};
    $$("[data-link]", row).forEach(a => {
      const url = cfg[a.dataset.link];
      if (url) { a.href = url; a.hidden = false; }
    });
  });

  /* Header rule, reading progress and current section */
  const top = $(".top");
  const bar = $(".progress");
  let ticking = false;
  function onScroll() {
    top.classList.toggle("scrolled", window.scrollY > 8);
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.setProperty("--p", max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);
    ticking = false;
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  const navLinks = $$(".top nav a");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        navLinks.forEach(a => {
          if (a.getAttribute("href") === "#" + en.target.id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navLinks.forEach(a => { const s = document.getElementById(a.getAttribute("href").slice(1)); if (s) io.observe(s); });
  }

  /* Theme switch. Other scripts listen for "themechange" to redraw in the new colours. */
  const KEY = "kevin-theme";
  const mq = matchMedia("(prefers-color-scheme: dark)");
  const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : mq.matches;
  $("#theme").addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch (e) {}
    document.dispatchEvent(new Event("themechange"));
  });
  if (mq.addEventListener) mq.addEventListener("change", () => document.dispatchEvent(new Event("themechange")));
})();
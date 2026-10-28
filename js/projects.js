/* Stage strips on each project, and the case study side sheet. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;

  /* Stage strips: hover, focus or tap a stage to read how the project covers it */
  $$(".stages").forEach(box => {
    const out = $(".stage-detail", box);
    const fallback = out.textContent;
    const items = $$("li", box);
    items.forEach((li, k) => li.style.setProperty("--k", k));
    const show = li => {
      items.forEach(i => i.classList.toggle("active", i === li));
      out.textContent = li.textContent + ". " + li.dataset.detail;
    };
    const reset = () => { items.forEach(i => i.classList.remove("active")); out.textContent = fallback; };
    items.forEach(li => {
      li.addEventListener("mouseenter", () => show(li));
      li.addEventListener("focus", () => show(li));
      li.addEventListener("click", () => show(li));
    });
    box.addEventListener("mouseleave", () => { if (!box.contains(document.activeElement)) reset(); });
    box.addEventListener("focusout", e => { if (!box.contains(e.relatedTarget)) reset(); });
  });

  /* Case study sheet */
  const dlg = $("#case");
  const body = $("#case-body");
  let opener = null;
  function openCase(id, btn) {
    const tpl = document.getElementById("tpl-" + id);
    if (!tpl || !dlg.showModal) return;
    body.replaceChildren(tpl.content.cloneNode(true));
    opener = btn || null;
    dlg.showModal();
    dlg.scrollTop = 0;
    root.classList.add("locked");
    try { history.replaceState(null, "", "#case-" + id); } catch (e) {}
  }
  dlg.addEventListener("close", () => {
    root.classList.remove("locked");
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    if (opener) opener.focus();
  });
  $("#case-close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  $$("[data-case]").forEach(btn => btn.addEventListener("click", () => openCase(btn.dataset.case, btn)));
  const hash = location.hash.slice(1);
  if (hash.indexOf("case-") === 0) openCase(hash.slice(5));
})();

/* Runs in <head>, before the page paints: sets the saved theme (no flash) and marks the page as scripted.
   If js/motion.js has not started after 3 seconds, the "js" class is removed so nothing stays hidden. */
(function () {
  var r = document.documentElement;
  r.classList.add("js");
  try {
    var t = localStorage.getItem("kevin-theme");
    if (t === "dark" || t === "light") r.setAttribute("data-theme", t);
  } catch (e) {}
  setTimeout(function () { if (!r.classList.contains("ready")) r.classList.remove("js"); }, 3000);
})();

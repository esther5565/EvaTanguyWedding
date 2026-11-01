(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const body = document.body, page = body.dataset.page, KEY = "wedding-guest";
  const NAV = [["rsvp", "rsvp.html"], ["program", "program.html"], ["qa", "qa.html"], ["moments", "moments.html"], ["about-us", "about-us.html"]];
  const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const findGuest = (f, l) => GUESTS.find(g => norm(g.first) === norm(f) && norm(g.last) === norm(l));

  /* Who is logged in? Only first/last are stored; lang and program are read
     from GUESTS each time, so edits to the list apply immediately. */
  let guest = null;
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s) guest = findGuest(s.first, s.last) || null;
  } catch (_) {}

  /* Inner pages need a login */
  if (!guest && body.hasAttribute("data-guard")) { location.replace("index.html"); return; }
  body.classList.add("authed");

  /* Language */
  const guess = () => { const n = (navigator.language || "").slice(0, 2).toLowerCase(); return I18N[n] ? n : DEFAULT_LANG; };
  let lang = guest && I18N[guest.lang] ? guest.lang : guess();
  const t = k => (I18N[lang] && I18N[lang][k]) || I18N[DEFAULT_LANG][k] || k;

  function renderHeader() {
    const el = $("top"); if (!el) return;
    el.innerHTML = '<a class="brand" href="index.html">Eva &amp; Tanguy</a><nav aria-label="Main">' +
      NAV.map(([k, href]) => `<a href="${href}"${k === page ? ' aria-current="page"' : ""}>${t("nav." + k)}</a>`).join("") + "</nav>";
  }

  function renderProgram() {
    const ul = $("program-list"); if (!ul) return;
    const items = (guest && PROGRAMS[guest.program]) || [];
    ul.innerHTML = "";
    if (!items.length) {
      const li = document.createElement("li"); li.className = "empty"; li.textContent = t("program.empty"); ul.append(li); return;
    }
    items.forEach(i => {
      const li = document.createElement("li"), time = document.createElement("span"), ev = document.createElement("span");
      time.className = "time"; time.textContent = i.time;
      ev.className = "event"; ev.textContent = t("event." + i.event);
      li.append(time, ev); ul.append(li);
    });
  }

  function render() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = t(el.dataset.i18n));
    document.querySelectorAll("[data-i18n-ph]").forEach(el => el.placeholder = t(el.dataset.i18nPh));
    renderHeader(); renderProgram();
    if (page !== "home") document.title = t("nav." + page) + " – Eva & Tanguy";
    if (guest && $("welcome")) $("welcome").textContent = t("welcome") + ", " + guest.first;
  }
  render();

  /* ---------- Landing page only ---------- */
  const gate = $("gate"), site = $("site");
  if (!gate) return;

  function tick() {
    const s = Math.max(0, Math.floor((WEDDING - Date.now()) / 1000)), p = n => String(n).padStart(2, "0");
    $("cd-d").textContent = Math.floor(s / 86400);
    $("cd-h").textContent = p(Math.floor(s % 86400 / 3600));
    $("cd-m").textContent = p(Math.floor(s % 3600 / 60));
    $("cd-s").textContent = p(s % 60);
  }
  tick(); setInterval(tick, 1000);

  /* Background video: paused, it only moves while the page is scrolled */
  const videos = [...document.querySelectorAll(".bg video")];
  const END_AT = .9;            /* video reaches its last frame at 90% of the scroll */
  let target = 0, shown = 0, raf = 0;

  function prime() {            /* makes the browser load frames so seeking works everywhere (iOS) */
    videos.forEach(v => { v.currentTime = 0; const p = v.play(); if (p) p.then(() => v.pause()).catch(() => {}); });
  }
  function scrubLoop() {
    shown += (target - shown) * .28;                 /* easing = smooth, filmic movement */
    if (Math.abs(target - shown) < .001) shown = target;
    videos.forEach(v => {
      const d = v.duration || 5.8;
      const time = Math.min(d - .05, shown * d);
      if (Math.abs(v.currentTime - time) > .01) v.currentTime = time;
    });
    raf = shown === target ? 0 : requestAnimationFrame(scrubLoop);
  }
  function setProgress(p) {
    target = Math.min(1, p / END_AT);
    if (!raf) raf = requestAnimationFrame(scrubLoop);
  }

  function enter(animate) {
    lang = I18N[guest.lang] ? guest.lang : DEFAULT_LANG;
    render();
    site.classList.add("on");
    prime();
    if (!animate) {
      site.classList.add("instant", "reveal");
      gate.hidden = true; body.classList.add("entered"); return;
    }
    gate.classList.add("lift");
    requestAnimationFrame(() => requestAnimationFrame(() => site.classList.add("reveal")));
    setTimeout(() => { gate.hidden = true; body.classList.add("entered"); }, 1500);
  }

  $("login").addEventListener("submit", e => {
    e.preventDefault();
    const form = e.currentTarget, g = findGuest($("firstname").value, $("surname").value);
    if (!g) {
      $("error").hidden = false;
      form.classList.remove("shake"); void form.offsetWidth; form.classList.add("shake");
      return;
    }
    $("error").hidden = true;
    guest = g;
    try { localStorage.setItem(KEY, JSON.stringify({ first: g.first, last: g.last })); } catch (_) {}
    enter(true);
  });

  /* Scroll: the hero fades, the video zooms in, and at the end we go to RSVP */
  const track = $("track");
  let leaving = false;
  history.scrollRestoration = "manual";
  scrollTo(0, 0);

  function onScroll() {
    if (!body.classList.contains("entered")) return;
    const max = track.offsetHeight - innerHeight;
    const p = Math.min(1, Math.max(0, scrollY / max));
    site.style.setProperty("--p", p.toFixed(3));
    setProgress(p);
    if (p >= .985 && !leaving) {
      leaving = true;
      site.classList.add("leaving");
      setTimeout(() => { location.href = "rsvp.html"; }, 700);
    }
  }
  addEventListener("scroll", onScroll, { passive: true });
  $("cue").addEventListener("click", () => scrollTo({ top: track.offsetHeight, behavior: "smooth" }));

  /* Coming back with the browser's Back button */
  addEventListener("pageshow", e => {
    if (!e.persisted) return;
    leaving = false; site.classList.remove("leaving");
    scrollTo(0, 0); site.style.setProperty("--p", 0); shown = 0; setProgress(0);
  });

  if (guest) enter(false);
})();

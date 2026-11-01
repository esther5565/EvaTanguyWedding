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

  /* ---------- RSVP page ---------- */
  function initRsvp() {
    const form = $("rsvp-form"); if (!form) return;
    const thanks = $("rsvp-thanks"), qPlus = $("q-plus"), qNames = $("q-names");
    const submit = $("rsvp-submit"), err = $("rsvp-error"), first = $("plus-first"), last = $("plus-last");
    const SAVE = "wedding-rsvp:" + norm(guest.first + " " + guest.last);
    const s = { attend: "", plus: "" };
    const endpoint = typeof RSVP_ENDPOINT !== "undefined" ? RSVP_ENDPOINT : "";

    function update() {
      const canPlus = !!guest.plusOne && s.attend === "yes";
      qPlus.hidden = !canPlus;
      qNames.hidden = !(canPlus && s.plus === "yes");
      const namesOk = first.value.trim() && last.value.trim();
      const ready = s.attend === "no" ||
        (s.attend === "yes" && (!guest.plusOne || s.plus === "no" || (s.plus === "yes" && namesOk)));
      submit.hidden = !ready;
      form.querySelectorAll(".choice").forEach(b => b.setAttribute("aria-pressed", String(s[b.dataset.q] === b.dataset.value)));
    }

    function payload() {
      const coming = s.attend === "yes", bring = coming && !!guest.plusOne && s.plus === "yes";
      return {
        first: guest.first, last: guest.last, attending: coming ? "Yes" : "No",
        program: guest.program || "", lang,
        plusOneAllowed: guest.plusOne ? "Yes" : "No",
        plusOneComing: guest.plusOne && coming ? (bring ? "Yes" : "No") : "",
        plusOneFirst: bring ? first.value.trim() : "", plusOneLast: bring ? last.value.trim() : "",
      };
    }

    /* TEST MODE only: a CSV (opens in Excel) so you can see the format */
    function downloadCsv(d) {
      const cols = [["Received", new Date().toISOString()], ["Name", d.first], ["Surname", d.last], ["Attending", d.attending],
        ["Program", d.program], ["Language", d.lang], ["+1 allowed", d.plusOneAllowed], ["Bringing +1", d.plusOneComing],
        ["+1 name", d.plusOneFirst], ["+1 surname", d.plusOneLast]];
      const cell = v => '"' + (/^[=+\-@]/.test(v) ? "'" + v : v).replace(/"/g, '""') + '"';
      const csv = "\ufeff" + cols.map(c => cell(c[0])).join(",") + "\r\n" + cols.map(c => cell(String(c[1]))).join(",") + "\r\n";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      a.download = "rsvp-test.csv"; document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }

    async function send(d) {
      if (!endpoint) { console.warn("RSVP_ENDPOINT is empty: test mode, nothing was sent."); downloadCsv(d); return; }
      /* no-cors + plain text = a "simple" request that Google Apps Script accepts from any site */
      await fetch(endpoint, { method: "POST", mode: "no-cors", body: JSON.stringify(d) });
    }

    function showThanks(d) {
      form.hidden = true; thanks.hidden = false;
      $("thanks-text").textContent = t(d.attending === "Yes" ? "rsvp.thanks.yes" : "rsvp.thanks.no");
    }

    form.addEventListener("click", e => {
      const b = e.target.closest(".choice"); if (!b) return;
      s[b.dataset.q] = b.dataset.value; update();
    });
    form.addEventListener("input", update);

    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (submit.hidden || submit.disabled) return;
      const d = payload();
      err.hidden = true; submit.disabled = true; submit.textContent = t("rsvp.sending");
      try {
        await send(d);
        try { localStorage.setItem(SAVE, JSON.stringify(d)); } catch (_) {}
        showThanks(d);
      } catch (_) {
        err.hidden = false;
      } finally {
        submit.disabled = false; submit.textContent = t("rsvp.submit");
      }
    });

    /* Already answered on this device: show the thanks, with a way to change it */
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(SAVE)); } catch (_) {}
    if (saved) showThanks(saved);
    $("rsvp-edit").addEventListener("click", () => {
      if (saved) {
        s.attend = saved.attending === "Yes" ? "yes" : "no";
        s.plus = saved.plusOneComing === "Yes" ? "yes" : saved.plusOneComing === "No" ? "no" : "";
        first.value = saved.plusOneFirst; last.value = saved.plusOneLast;
      }
      thanks.hidden = true; form.hidden = false; update();
    });
    update();
  }
  if (page === "rsvp") initRsvp();

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

  /* Background: a sequence of pictures drawn on a canvas, driven by scroll.
     (Much smoother than seeking inside a video file, in both directions.) */
  const bg = $("bg"), cv = $("cv-main"), cb = $("cv-blur");
  const N = +bg.dataset.frames, END_AT = .9;     /* last frame reached at 90% of the scroll */
  const ctx = cv.getContext("2d"), ctxB = cb.getContext("2d");
  const frames = [];
  let target = 0, shown = 0, raf = 0;

  function draw() {
    const pos = shown * (N - 1), i = Math.floor(pos), f = pos - i;
    const a = frames[i], b = frames[Math.min(N - 1, i + 1)];
    if (!a || !a.complete || !a.naturalWidth) return;
    if (cv.width !== a.naturalWidth) { cv.width = a.naturalWidth; cv.height = a.naturalHeight; }
    ctx.globalAlpha = 1; ctx.drawImage(a, 0, 0);
    if (f > .02 && b.complete && b.naturalWidth) {   /* blend with the next frame = sub-frame smoothness */
      ctx.globalAlpha = f; ctx.drawImage(b, 0, 0); ctx.globalAlpha = 1;
    }
    ctxB.drawImage(cv, 0, 0, cb.width, cb.height);
  }
  for (let i = 0; i < N; i++) {
    const im = new Image();
    im.src = `media/frames/${String(i + 1).padStart(3, "0")}.webp`;
    im.onload = () => { if (i === 0 || i === Math.round(shown * (N - 1))) draw(); };
    frames.push(im);
  }

  function scrubLoop() {
    shown += (target - shown) * .28;                 /* easing */
    if (Math.abs(target - shown) < .0005) shown = target;
    draw();
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
      setTimeout(() => { location.href = "rsvp.html"; }, 500);
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

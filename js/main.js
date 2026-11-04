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

  /* Program page: wedding date + venue address, which opens Google Maps */
  function renderEvent() {
    const dateEl = $("event-date"), place = $("event-place");
    if (dateEl && typeof WEDDING !== "undefined") {
      const locale = { en: "en-GB", es: "es-ES", fr: "fr-FR" }[lang] || lang;
      const s = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(WEDDING);
      dateEl.textContent = s.charAt(0).toUpperCase() + s.slice(1);
    }
    if (place && typeof VENUE !== "undefined") {
      $("event-address").textContent = VENUE.address;
      place.href = VENUE.maps || "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(VENUE.address);
      place.title = t("program.maps");
    }
  }

  function render() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = t(el.dataset.i18n));
    document.querySelectorAll("[data-i18n-ph]").forEach(el => el.placeholder = t(el.dataset.i18nPh));
    document.querySelectorAll("[data-i18n-aria]").forEach(el => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
    renderHeader(); renderProgram(); renderEvent();
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

  /* ---------- ZIP (store only, no compression: photos are already compressed) ---------- */
  const CRC_TABLE = (() => {
    const tb = new Uint32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; tb[n] = c >>> 0; }
    return tb;
  })();
  function crc32(u8) { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function makeZip(entries) {                      /* entries: [{ name, data: Uint8Array }] */
    const enc = new TextEncoder(), parts = [], central = [], d = new Date();
    const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    let offset = 0, cdSize = 0;
    for (const e of entries) {
      const name = enc.encode(e.name), crc = crc32(e.data), size = e.data.length;
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
      lh.setUint16(10, time, true); lh.setUint16(12, date, true); lh.setUint32(14, crc, true);
      lh.setUint32(18, size, true); lh.setUint32(22, size, true); lh.setUint16(26, name.length, true);
      parts.push(lh.buffer, name, e.data);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true);
      ch.setUint16(12, time, true); ch.setUint16(14, date, true); ch.setUint32(16, crc, true);
      ch.setUint32(20, size, true); ch.setUint32(24, size, true); ch.setUint16(28, name.length, true); ch.setUint32(42, offset, true);
      central.push(ch.buffer, name);
      offset += 30 + name.length + size; cdSize += 46 + name.length;
    }
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, entries.length, true); end.setUint16(10, entries.length, true);
    end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
    return new Blob([...parts, ...central, end.buffer], { type: "application/zip" });
  }
  function saveBlob(blob, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  /* ---------- Moments page ---------- */
  function initMoments() {
    const grid = $("moments-grid"); if (!grid) return;
    const endpoint = typeof MOMENTS_ENDPOINT !== "undefined" ? MOMENTS_ENDPOINT : "";
    const fab = $("moments-add"), input = $("moments-file"), toast = $("moments-status");
    const lb = $("lightbox"), lbImg = $("lb-img"), lbCap = $("lb-cap"), shareBtn = $("lb-share"), dlAll = $("moments-dl");
    const canShareFiles = (() => { try { return !!(navigator.canShare && navigator.canShare({ files: [new File([""], "a.jpg", { type: "image/jpeg" })] })); } catch (_) { return false; } })();
    const MAX_SIDE = 1800, MAX_FILES = 10;
    const original = id => "https://lh3.googleusercontent.com/d/" + encodeURIComponent(id) + "=s2400";
    const thumb = (id, w) => "https://drive.google.com/thumbnail?id=" + encodeURIComponent(id) + "&sz=w" + w;
    let server = [], local = [], shown = [], folderUrl = "", loaded = false, failed = false, busy = false;
    let lastKey = "", toastTimer = 0, idx = 0, openFrom = null;

    const caption = p => p.by ? t("moments.by").replace("{name}", p.by) : t("moments.photo");
    const syncFab = () => { fab.disabled = busy || (!!endpoint && !loaded); };   /* live mode: wait until the script answers */

    /* Photos from Drive + my own uploads that Drive hasn't listed yet */
    function items() {
      const names = new Set(server.map(p => p.name));
      const mine = local.filter(p => !names.has(p.name)).map(p => ({ src: p.url, full: p.url, dl: p.url, blob: p.blob, name: p.name, by: p.by }));
      return mine.concat(server.map(p => ({ id: p.id, name: p.name, src: thumb(p.id, 600), full: thumb(p.id, 1600), dl: original(p.id), by: p.by })));
    }

    function render() {
      const list = items(); shown = list;
      dlAll.hidden = list.length === 0;
      const skeleton = !!endpoint && !loaded && !failed;
      const k = (skeleton ? "S" : "L") + list.map(p => p.src).join("|");
      $("moments-empty").hidden = !(list.length === 0 && !skeleton && (loaded || !endpoint));
      if (k === lastKey) return;
      lastKey = k;
      grid.replaceChildren();
      if (skeleton) for (let i = 0; i < 9; i++) { const d = document.createElement("div"); d.className = "tile skel"; grid.append(d); }
      list.forEach((p, i) => {
        const b = document.createElement("button"); b.type = "button"; b.className = "tile"; b.setAttribute("aria-label", caption(p));
        const im = new Image(); im.src = p.src; im.alt = ""; im.loading = "lazy"; im.decoding = "async";
        b.append(im); b.addEventListener("click", () => open(i)); grid.append(b);
      });
    }

    /* The list is read with JSONP (a <script> tag), which works from any website */
    function jsonp(url, query, timeout) {
      return new Promise((resolve, reject) => {
        const cb = "__moments" + Date.now() + Math.floor(Math.random() * 1e6), s = document.createElement("script");
        let timer;
        const done = () => { clearTimeout(timer); delete window[cb]; s.remove(); };
        timer = setTimeout(() => { done(); reject(new Error("timeout")); }, timeout || 15000);
        window[cb] = data => { done(); resolve(data); };
        s.onerror = () => { done(); reject(new Error("network")); };
        s.src = url + (url.includes("?") ? "&" : "?") + query + "&callback=" + cb;
        document.head.append(s);
      });
    }

    async function load() {
      if (!endpoint) { loaded = true; render(); syncFab(); return; }
      try {
        const r = await jsonp(endpoint, "action=photos");
        if (!r || !r.ok) throw new Error(r && r.error);
        server = r.photos || []; folderUrl = r.folder || ""; loaded = true; failed = false;
      } catch (_) { failed = true; }
      $("moments-loaderr").hidden = !(failed && !loaded);
      render(); syncFab();
    }

    /* ----- Lightbox ----- */
    function show(i) {
      if (!shown.length) return close();
      idx = (i + shown.length) % shown.length;
      const p = shown[idx];
      lbImg.src = p.full; lbImg.alt = caption(p); lbCap.textContent = p.by ? caption(p) : "";
      $("lb-prev").hidden = $("lb-next").hidden = shown.length < 2;
      shareBtn.disabled = false;
    }
    function open(i) { openFrom = document.activeElement; show(i); lb.hidden = false; body.classList.add("lb-open"); $("lb-close").focus(); }
    function close() { lb.hidden = true; lbImg.removeAttribute("src"); body.classList.remove("lb-open"); if (openFrom && openFrom.focus) openFrom.focus(); }
    $("lb-close").addEventListener("click", close);
    $("lb-prev").addEventListener("click", () => show(idx - 1));
    $("lb-next").addEventListener("click", () => show(idx + 1));
    lb.addEventListener("click", e => { if (e.target === lb) close(); });
    document.addEventListener("keydown", e => {
      if (lb.hidden) return;
      if (e.key === "Escape") close(); else if (e.key === "ArrowLeft") show(idx - 1); else if (e.key === "ArrowRight") show(idx + 1);
    });
    let x0 = null;
    lb.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", e => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    }, { passive: true });

    /* ----- Upload ----- */
    function status(msg, kind, ms, link) {
      clearTimeout(toastTimer);
      toast.textContent = msg; toast.className = "toast" + (kind ? " " + kind : ""); toast.hidden = false;
      if (link) { const a = document.createElement("a"); a.href = link.href; a.target = "_blank"; a.rel = "noopener"; a.textContent = link.text; toast.append(" ", a); }
      if (ms) toastTimer = setTimeout(() => { toast.hidden = true; }, ms);
    }

    /* Shrinks the photo (faster upload, and removes hidden data such as GPS location) */
    async function resize(file) {
      let img;
      try { img = await createImageBitmap(file, { imageOrientation: "from-image" }); }
      catch (_) {
        img = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = URL.createObjectURL(file); });
      }
      const w = img.width || img.naturalWidth, h = img.height || img.naturalHeight, k = Math.min(1, MAX_SIDE / Math.max(w, h));
      const cv = document.createElement("canvas"); cv.width = Math.round(w * k); cv.height = Math.round(h * k);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      if (img.close) img.close();
      const blob = await new Promise(r => cv.toBlob(r, "image/jpeg", .82));
      if (!blob) throw new Error("encode");
      return blob;
    }
    const toBase64 = blob => new Promise((res, rej) => {
      const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(",")[1]); fr.onerror = rej; fr.readAsDataURL(blob);
    });
    async function send(d) {
      if (!endpoint) return;                                  /* test mode: nothing leaves the browser */
      await fetch(endpoint, { method: "POST", mode: "no-cors", body: JSON.stringify(d) });
    }

    async function upload(files) {
      const images = [...files].filter(f => /^image\//.test(f.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name));
      files = images.slice(0, MAX_FILES);
      const skipped = images.length - files.length;              /* picked more than the limit */
      if (!files.length) return;
      busy = true; syncFab();
      let ok = 0, fail = 0;
      for (let i = 0; i < files.length; i++) {
        status(t("moments.uploading").replace("{n}", i + 1).replace("{total}", files.length));
        try {
          const blob = await resize(files[i]);
          const name = Date.now() + "-" + Math.random().toString(36).slice(2, 8) + ".jpg";
          await send({ type: "photo", name, mime: "image/jpeg", data: await toBase64(blob), who: guest.first + " " + guest.last });
          local.unshift({ name, blob, url: URL.createObjectURL(blob), by: guest.first });
          ok++; render();
        } catch (_) { fail++; }
      }
      busy = false; syncFab();
      if (fail) status(t("moments.error"), "err", 6000);
      else if (skipped) status(t("moments.limitLeft").replace("{max}", MAX_FILES).replace("{n}", skipped), "", 10000);   /* say what was left out */
      else status(t("moments.done"), "", 6000);
      if (ok && endpoint) [3000, 8000, 15000].forEach(ms => setTimeout(load, ms));   /* pick up the new photos from Drive */
    }


    /* ----- Share / download one photo ----- */
    async function photoBlob(p) {
      if (p.blob) return p.blob;                                  /* my own upload: already here */
      const r = await jsonp(endpoint, "action=photo&id=" + encodeURIComponent(p.id), 40000);
      if (!r || !r.ok) throw new Error(r && r.error);
      const bin = atob(r.data), u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      return new Blob([u8], { type: r.mime || "image/jpeg" });
    }
    async function shareCurrent() {
      const p = shown[idx]; if (!p || shareBtn.disabled) return;
      shareBtn.disabled = true;
      try {
        const blob = await photoBlob(p);
        const name = p.name && /\.\w+$/.test(p.name) ? p.name : "moment-" + Date.now() + ".jpg";
        const file = new File([blob], name, { type: blob.type || "image/jpeg" });
        if (canShareFiles && navigator.canShare({ files: [file] })) await navigator.share({ files: [file] });   /* phones: "Save image", WhatsApp... */
        else saveBlob(blob, name);                                                                              /* computers: straight to Downloads */
      } catch (err) {
        if (err && err.name === "AbortError") { /* closed the share sheet: nothing to do */ }
        else if (p.id) { const a = document.createElement("a"); a.href = "https://drive.google.com/uc?export=download&id=" + encodeURIComponent(p.id); document.body.append(a); a.click(); a.remove(); }
        else status(t("moments.photoerror"), "err", 5000);
      } finally { shareBtn.disabled = false; }
    }
    shareBtn.addEventListener("click", shareCurrent);

    /* ----- Download everything as one ZIP ----- */
    async function downloadAll() {
      const list = shown.slice().reverse();                       /* oldest first: 001 is the first photo of the day */
      if (!list.length || dlAll.disabled) return;
      dlAll.disabled = true;
      const entries = []; let done = 0, next = 0;
      const get = async url => { for (let tries = 0; ; tries++) { try { const r = await fetch(url); if (!r.ok) throw new Error("http"); return new Uint8Array(await r.arrayBuffer()); } catch (e) { if (tries) throw e; } } };
      const worker = async () => {
        while (next < list.length) {
          const i = next++, p = list[i];
          entries[i] = { name: String(i + 1).padStart(3, "0") + (p.by ? "-" + p.by.replace(/[^\w-]/g, "") : "") + ".jpg", data: await get(p.dl) };
          status(t("moments.preparing").replace("{n}", ++done).replace("{total}", list.length));
        }
      };
      try {
        await Promise.all([worker(), worker(), worker(), worker()]);
        saveBlob(makeZip(entries), "eva-tanguy-moments.zip");
        status(t("moments.zipdone"), "", 5000);
      } catch (_) {
        /* The browser may not be allowed to read the photos directly: send them to the Drive folder instead */
        status(t("moments.zipfallback"), "err", 15000, folderUrl ? { href: folderUrl, text: t("moments.openfolder") } : null);
      } finally { dlAll.disabled = false; }
    }
    dlAll.addEventListener("click", downloadAll);
    $("ic-share").hidden = !canShareFiles; $("ic-dl").hidden = canShareFiles;
    shareBtn.setAttribute("aria-label", t(canShareFiles ? "moments.share" : "moments.download"));

    fab.addEventListener("click", () => input.click());
    $("moments-hint").textContent = t("moments.limit").replace("{max}", MAX_FILES);   /* always visible under the button */
    input.addEventListener("change", () => { const f = input.files; upload(f).finally(() => { input.value = ""; }); });

    $("moments-note").hidden = !!endpoint;
    syncFab(); render(); load();
    setInterval(() => { if (!document.hidden && lb.hidden && !busy) load(); }, 45000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden && lb.hidden && !busy) load(); });
  }
  if (page === "moments") initMoments();

  /* ---------- FAQ page ---------- */
  function initFaq() {
    const tabs = $("faq-tabs"), panel = $("faq-panel");
    if (!tabs || typeof FAQ === "undefined") return;
    const pick = o => (o && (o[lang] || o[DEFAULT_LANG])) || "";
    const topics = FAQ.map(tp => ({
      id: tp.id, title: pick(tp.title),
      items: tp.items.filter(it => !it.programs || it.programs.includes(guest.program)),   /* optional per-invitation questions */
    })).filter(tp => tp.items.length);
    if (!topics.length) return;

    /* Text with [label](https://link) support, built with DOM nodes (nothing typed here can inject HTML) */
    function richText(el, text) {
      String(text).split(/\n+/).forEach(line => {
        const p = document.createElement("p"), re = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
        let last = 0, m;
        while ((m = re.exec(line))) {
          p.append(line.slice(last, m.index));
          const a = document.createElement("a"); a.href = m[2]; a.target = "_blank"; a.rel = "noopener"; a.textContent = m[1];
          p.append(a); last = re.lastIndex;
        }
        p.append(line.slice(last)); el.append(p);
      });
    }

    function show(id) {
      const tp = topics.find(x => x.id === id) || topics[0];
      tabs.querySelectorAll("[role=tab]").forEach(b => {
        const on = b.dataset.id === tp.id;
        b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1;
      });
      panel.setAttribute("aria-labelledby", "tab-" + tp.id);
      panel.replaceChildren();
      tp.items.forEach(it => {
        const row = document.createElement("div"), q = document.createElement("h3"), a = document.createElement("div");
        row.className = "faq-row"; q.className = "faq-q"; a.className = "faq-a";
        q.textContent = pick(it.q); richText(a, pick(it.a));
        row.append(q, a); panel.append(row);
      });
      panel.classList.remove("in"); void panel.offsetWidth; panel.classList.add("in");
    }

    topics.forEach(tp => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "faq-tab"; b.id = "tab-" + tp.id; b.dataset.id = tp.id;
      b.setAttribute("role", "tab"); b.setAttribute("aria-controls", "faq-panel"); b.textContent = tp.title;
      b.addEventListener("click", () => { history.replaceState(null, "", "#" + tp.id); show(tp.id); });
      tabs.append(b);
    });
    tabs.addEventListener("keydown", e => {                       /* arrow keys move between topics */
      const all = [...tabs.querySelectorAll("[role=tab]")], i = all.indexOf(document.activeElement);
      if (i < 0) return;
      const to = e.key === "ArrowRight" ? (i + 1) % all.length : e.key === "ArrowLeft" ? (i - 1 + all.length) % all.length
               : e.key === "Home" ? 0 : e.key === "End" ? all.length - 1 : -1;
      if (to < 0) return;
      e.preventDefault(); all[to].focus(); all[to].click();
    });
    addEventListener("hashchange", () => show(location.hash.slice(1)));
    show(location.hash.slice(1));                                  /* qa.html#gifts opens the Gifts topic */
  }
  if (page === "qa") initFaq();

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

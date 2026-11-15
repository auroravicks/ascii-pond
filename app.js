/*
 * The page around the pond: the clock and the day (or your own words) in
 * character cells, the date under them, the three waters, and the controls.
 *
 *   ?title=One%20Page&tag=is%20all%20you%20need   your own words instead of the clock
 *   ?ui=0                       no controls (for a wallpaper or a recording)
 *   keys: 1 2 3 or T for the water, space to pause
 */
(async () => {
  "use strict";
  const { createPond, AsciiMark, PondOccupant } = window.AsciiKoi;
  const root = document.documentElement;
  const q = new URLSearchParams(location.search);
  /* Resolve personal config beside app.js, not beside the current HTML page.
     This keeps index.html and themes/* on the same extension-local config. */
  const appUrl = document.currentScript?.src || location.href;
  /* The extension's personal config is deliberately dependency-free. This
     small YAML subset supports scalars, top-level lists and one-level maps. */
  const scalar = value => {
    const v = value.trim();
    if (v === "null" || v === "~") return null;
    if (v === "true" || v === "false") return v === "true";
    if (/^-?(?:\d+\.?\d*|\.\d+)$/.test(v)) return Number(v);
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
    if (v.startsWith("[") && v.endsWith("]")) return v.slice(1, -1).split(",").map(scalar).filter(v => v !== "");
    return v;
  };
  function parseConfig(text) {
    const out = {}; let parent = null;
    for (const raw of text.split(/\r?\n/)) {
      const clean = raw.replace(/\s+#.*$/, "");
      if (!clean.trim()) continue;
      const indent = clean.match(/^\s*/)[0].length, line = clean.trim();
      if (!indent) {
        const m = line.match(/^([A-Za-z][\w-]*):(?:\s*(.*))?$/);
        if (!m) continue;
        parent = m[1]; out[parent] = m[2] ? scalar(m[2]) : undefined;
      } else if (parent && line.startsWith("- ")) {
        if (!Array.isArray(out[parent])) out[parent] = [];
        out[parent].push(scalar(line.slice(2)));
      } else if (parent) {
        const m = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
        if (!m) continue;
        if (!out[parent] || Array.isArray(out[parent]) || typeof out[parent] !== "object") out[parent] = {};
        out[parent][m[1]] = scalar(m[2]);
      }
    }
    return out;
  }
  async function loadConfig() {
    try {
      const response = await fetch(new URL("config.yml", appUrl), { cache: "no-store" });
      return response.ok ? parseConfig(await response.text()) : null;
    } catch (e) { return null; }
  }
  const config = await loadConfig();
  const THEMES = ["pond", "black", "light"];
  const THEME_KEY = "ascii-koi-theme", OCCUPANTS_KEY = "ascii-koi-occupants";
  const knownOccupants = Object.values(PondOccupant);
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* private window: not remembered */ } }
  };
  const readOccupantPreference = () => {
    const raw = storage.get(OCCUPANTS_KEY);
    if (raw === null) return null;
    try {
      const value = JSON.parse(raw);
      return Array.isArray(value) ? [...new Set(value.filter(kind => knownOccupants.includes(kind)))] : null;
    } catch (e) { return null; }
  };
  /* Occupants are a list, not a combination enum. Browser choices override
     the extension-local config; URLs do not carry persistent preferences. */
  const localOccupants = config === null ? knownOccupants
    : Array.isArray(config.occupants) ? config.occupants : [];
  const browserOccupants = readOccupantPreference();
  const requestedOccupants = browserOccupants ?? localOccupants;
  /* Configuration belongs to each selected occupant. Unselected sections are
     deliberately ignored; "auto", null and absent values keep engine defaults. */
  const numericOccupantSetting = key => Object.fromEntries(requestedOccupants.flatMap(kind => {
    const value = config && config[kind] && config[kind][key];
    return typeof value === "number" && Number.isFinite(value) ? [[kind, value]] : [];
  }));
  const scaleSetting = Object.fromEntries(requestedOccupants.flatMap(kind => {
    const value = config && config[kind] && config[kind].scale;
    const valid = value === "random" || typeof value === "number" && Number.isFinite(value)
      || Array.isArray(value) && value.some(v => typeof v === "number" && Number.isFinite(v));
    return valid ? [[kind, value]] : [];
  }));
  const configuredSizes = numericOccupantSetting("size"), configuredVolumes = numericOccupantSetting("volume");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* the water: a page may fix it (light.html …), otherwise use the browser choice, then pond */
  const fixed = root.dataset.lock;
  const first = [fixed, storage.get(THEME_KEY), "pond"].find(v => THEMES.includes(v));
  root.dataset.theme = first;

  const pondCanvas = document.getElementById("pond");
  const box = document.getElementById("intro-box");
  const titleCanvas = document.getElementById("wordmark");
  const tagCanvas = document.getElementById("wordmark-tag");
  const srTitle = document.getElementById("sr-title");
  const dateLine = document.getElementById("intro-date");
  const ui = document.getElementById("ui");
  if (q.get("ui") === "0") ui.hidden = true;

  const cssVar = n => getComputedStyle(root).getPropertyValue(n).trim();
  const palette = () => ({
    water: cssVar("--pond"), ink: cssVar("--ink"), accent: cssVar("--accent"),
    koiLight: cssVar("--koi-light"), koiDark: cssVar("--koi-dark"),
    dark: cssVar("color-scheme").includes("dark")
  });

  const pond = createPond({
    canvas: pondCanvas, palette, reduce, occupants: requestedOccupants,
    occupantSize: configuredSizes, occupantScale: scaleSetting, occupantVolume: configuredVolumes,
    /* the title's box in pond pixels: the koi fade under it, so the letters can wear their colour */
    dim: () => { const r = box.getBoundingClientRect(); return r.width ? r : null; }
  });
  pond.size(innerWidth, innerHeight);
  window.AsciiKoi.pond = pond;

  /* ── compact browser preferences: intentionally only occupants for now ── */
  const settings = document.createElement("div");
  settings.className = "settings";
  settings.innerHTML = `
    <button class="settings-toggle" type="button" aria-expanded="false" aria-controls="pond-menu" aria-label="open pond controls"><i></i><i></i><i></i></button>
    <aside class="settings-menu" id="pond-menu" aria-label="pond controls" hidden>
      <header><span>pond controls</span></header>
      <section><p>water</p><div data-water-slot></div></section>
      <section><p>occupants</p>
        <div class="occupant-options">${knownOccupants.map(kind => `<label><input type="checkbox" value="${kind}"> <span>${kind}</span></label>`).join("")}</div>
      </section>
      <section><p>motion</p><button class="settings-pause" type="button">pause pond</button></section>
      <section class="settings-help"><p>interactions</p><div data-help-slot></div></section>
      <footer data-link-slot></footer>
    </aside>`;
  ui.append(settings);
  const settingsToggle = settings.querySelector(".settings-toggle");
  const settingsMenu = settings.querySelector(".settings-menu");
  const occupantInputs = [...settings.querySelectorAll('input[type="checkbox"]')];
  const settingsPause = settings.querySelector(".settings-pause");
  const themesControl = ui.querySelector(".themes"), hintControl = ui.querySelector(".hint"), githubLink = document.getElementById("gh");
  settings.querySelector("[data-water-slot]").append(themesControl);
  settings.querySelector("[data-help-slot]").append(hintControl);
  if (githubLink) settings.querySelector("[data-link-slot]").append(githubLink);
  const setMenuOpen = open => {
    settingsMenu.hidden = !open;
    settings.classList.toggle("open", open);
    settingsToggle.setAttribute("aria-expanded", String(open));
    settingsToggle.setAttribute("aria-label", open ? "close pond controls" : "open pond controls");
  };
  const markOccupants = list => {
    const selected = new Set(list);
    for (const input of occupantInputs) input.checked = selected.has(input.value);
  };
  const applyOccupants = list => {
    const selected = new Set(list), active = new Set(pond.occupants);
    for (const kind of active) if (!selected.has(kind)) pond.removeOccupant(kind);
    for (const kind of selected) if (!active.has(kind)) pond.addOccupant(kind);
  };
  markOccupants(requestedOccupants);
  settingsToggle.addEventListener("click", () => setMenuOpen(settingsMenu.hidden));
  for (const input of occupantInputs) input.addEventListener("change", () => {
    const selected = occupantInputs.filter(item => item.checked).map(item => item.value);
    storage.set(OCCUPANTS_KEY, JSON.stringify(selected));
    applyOccupants(selected);
  });
  const markPaused = paused => {
    settingsPause.textContent = paused ? "resume pond" : "pause pond";
    document.getElementById("pause-state").textContent = paused ? "paused" : "";
  };
  settingsPause.addEventListener("click", () => markPaused(pond.pause()));
  addEventListener("pointerdown", event => {
    if (!settingsMenu.hidden && !settings.contains(event.target)) {
      setMenuOpen(false);
      event.stopImmediatePropagation();
    }
  });
  addEventListener("keydown", event => {
    if (event.key === "Escape" && !settingsMenu.hidden) {
      setMenuOpen(false);
      settingsToggle.focus();
    }
  });

  /* ── the words: the time as the title, the day under it, then the date ── */
  const own = q.get("title");
  const narrow = () => innerWidth < 720;
  const words = () => {
    const now = new Date();
    const date = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    if (own) return { title: own, tag: q.get("tag") || "", date };
    const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    return { title: time, tag: now.toLocaleDateString("en-GB", { weekday: "long" }), date };
  };
  let current = words();
  const serif = `"Noto Serif Display", "Iowan Old Style", Georgia, serif`;
  /* the words take on the koi colour and the water's light in the pond under them */
  const look = { tint: pond.tint, light: pond.light };
  const title = AsciiMark(titleCanvas, () => ({
    text: current.title, font: `700 ${narrow() ? 120 : own ? 170 : 230}px ${serif}`,
    cw: narrow() ? 4 : 7, ch: narrow() ? 5 : 9, maxW: Math.min(innerWidth * (narrow() ? 0.9 : 0.8), own ? 700 : 820), edge: true, glow: 1
  }), look);
  /* the day, drawn the same way as the clock, smaller and a little fainter */
  const tag = AsciiMark(tagCanvas, () => ({
    text: current.tag || " ", font: `700 ${narrow() ? 64 : 84}px ${serif}`,
    cw: narrow() ? 3 : 4, ch: narrow() ? 4 : 5, maxW: Math.min(innerWidth * (narrow() ? 0.66 : 0.42), 420), tone: 0.88, edge: !narrow(), glow: 0.7
  }), look);
  const clock = () => performance.now() / 1000;
  const buildWords = () => {
    dateLine.textContent = current.date;
    return Promise.all([title.build(clock()), tag.build(clock() + 0.35)]);
  };
  srTitle.textContent = own ? `${current.title} ${current.tag}` : "ASCII Koi";

  let lastWords = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    /* the words redraw at about 15 fps, like a sign; the koi under them move at full rate */
    if (now - lastWords < 66) return;
    lastWords = now;
    const s = now / 1000;
    title.draw(s); tag.draw(s);
    if (!own) {
      const w = words();
      if (w.title !== current.title || w.tag !== current.tag || w.date !== current.date) { current = w; buildWords(); }
    }
  }

  /* ── the waters ── */
  const snap = document.getElementById("snap");
  const picks = [...document.querySelectorAll("[data-theme-pick]")];
  function mark() {
    for (const b of picks) b.setAttribute("aria-checked", String(b.dataset.themePick === root.dataset.theme));
  }
  /*
   * A new water spreads like a ripple from where you chose it: the old frame
   * (pond, words and their glow) is kept on a canvas on top, and a widening
   * hole in it shows the new water underneath.
   */
  function setTheme(name, at) {
    if (!THEMES.includes(name) || name === root.dataset.theme) return;
    const dpr = pondCanvas.width / innerWidth;
    if (!reduce) {
      snap.width = pondCanvas.width; snap.height = pondCanvas.height;
      const s = snap.getContext("2d");
      s.drawImage(pondCanvas, 0, 0);
      for (const m of [title, tag]) {
        for (const c of [m.glow, m === title ? titleCanvas : tagCanvas]) {
          const r = c && c.getBoundingClientRect();
          if (!r || !r.width || !c.width) continue;
          s.filter = c === m.glow ? `blur(${14 * dpr}px)` : "none";
          s.drawImage(c, r.left * dpr, r.top * dpr, r.width * dpr, r.height * dpr);
        }
      }
      s.filter = "none";
      const r = dateLine.getBoundingClientRect(), ds = getComputedStyle(dateLine);
      s.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.font = `${ds.fontWeight} ${ds.fontSize} ${ds.fontFamily}`; s.letterSpacing = ds.letterSpacing;
      s.fillStyle = ds.color; s.globalAlpha = +ds.opacity; s.textBaseline = "middle";
      s.fillText(dateLine.textContent.toUpperCase(), r.left, r.top + r.height / 2);
      s.setTransform(1, 0, 0, 1, 0, 0); s.globalAlpha = 1;
      const x = at ? at.x : innerWidth / 2, y = at ? at.y : innerHeight / 2;
      snap.style.setProperty("--x", x + "px");
      snap.style.setProperty("--y", y + "px");
      snap.classList.remove("wipe");
      snap.classList.add("show");
      void snap.offsetWidth;
      snap.classList.add("wipe");
    }
    root.dataset.theme = name;
    if (!fixed) storage.set(THEME_KEY, name);
    pond.colors();
    mark();
  }
  snap.addEventListener("transitionend", () => snap.classList.remove("show", "wipe"));
  for (const b of picks) b.addEventListener("click", e => {
    const r = b.getBoundingClientRect();
    setTheme(b.dataset.themePick, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
    e.stopPropagation();
  });
  mark();

  /* ── the hands ── */
  const onUi = e => e.target.closest && e.target.closest(".ui");
  let held = null, fedAt = 0;
  const feedAt = (x, y) => { const now = performance.now(); if (now - fedAt < 500) return; fedAt = now; pond.feed(x, y); };
  addEventListener("pointerdown", e => {
    if (e.button !== 0 || onUi(e)) return;
    /* a tap is a paw, a long press is food */
    if (e.pointerType === "touch" || e.pointerType === "pen") {
      clearTimeout(held?.timer);
      held = { x: e.clientX, y: e.clientY, at: performance.now(), timer: setTimeout(() => { if (held) { feedAt(held.x, held.y); held = null; } }, 450) };
      return;
    }
    pond.paw(e.clientX, e.clientY);
  });
  addEventListener("pointermove", e => { if (held && Math.hypot(e.clientX - held.x, e.clientY - held.y) > 14) { clearTimeout(held.timer); held = null; } });
  addEventListener("pointerup", () => { if (held) { clearTimeout(held.timer); pond.paw(held.x, held.y); held = null; } });
  addEventListener("pointercancel", () => { if (held) clearTimeout(held.timer); held = null; });
  addEventListener("contextmenu", e => {
    if (onUi(e)) return;
    e.preventDefault();
    if (held) { clearTimeout(held.timer); held = null; }
    feedAt(e.clientX, e.clientY);
  });
  addEventListener("keydown", e => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.("input, textarea")) return;
    const n = "123".indexOf(e.key);
    if (n >= 0) setTheme(THEMES[n]);
    else if (e.key === "t" || e.key === "T") setTheme(THEMES[(THEMES.indexOf(root.dataset.theme) + 1) % 3]);
    else if (e.key === " ") { e.preventDefault(); markPaused(pond.pause()); }
  });

  /* the controls fade out while you leave the mouse alone */
  let idle = 0;
  const wake = () => { ui.classList.remove("idle"); clearTimeout(idle); idle = setTimeout(() => ui.classList.add("idle"), 3500); };
  addEventListener("pointermove", wake);
  addEventListener("keydown", wake);
  wake();

  let resizeTimer = 0;
  addEventListener("resize", () => {
    pond.size(innerWidth, innerHeight);
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => buildWords(), 120);
  });

  pond.start();
  buildWords().then(() => { box.classList.add("go"); requestAnimationFrame(frame); });
  /* canvas text cannot trigger a webfont load; redraw once the mono face is in */
  document.fonts?.load(`600 12px "Geist Mono"`).then(() => pond.colors());
})();

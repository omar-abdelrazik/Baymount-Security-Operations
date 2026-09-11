/* =====================================================================
   BAYMOUNT SECURITY OPERATIONS — APPLICATION ENGINE
   All content is driven by BAYMOUNT_CONFIG (js/data.js).
   Nothing here hardcodes manpower totals — everything is computed.
   ===================================================================== */
(function () {
"use strict";

const C = BAYMOUNT_CONFIG;
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => [...(el || document).querySelectorAll(s)];
const body = document.body;
const stage = $("#stage"), camEl = $("#camera"), tiltEl = $("#tilt"), markersEl = $("#markers");
const overlay = $("#overlay");
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ------------------------------------------------------------------ */
/* 01 · COMPUTED TOTALS + VALIDATION ENGINE                            */
/* ------------------------------------------------------------------ */
function totals() {
  const day = C.securityPosts.reduce((s, p) => s + p.day, 0);
  const night = C.securityPosts.reduce((s, p) => s + p.night, 0);
  return {
    day, night, daily: day + night,
    supPerShift: C.supervisors.length,
    dailySup: C.supervisors.length * 2,
    points: C.securityPosts.length,
    dayOnly: C.securityPosts.filter(p => p.day > 0 && p.night === 0)
  };
}
function validation() {
  const t = totals(), e = C.shiftRules.expected, issues = [];
  if (t.day !== e.dayOfficers) issues.push({ ar: "نهاري", diff: t.day - e.dayOfficers });
  if (t.night !== e.nightOfficers) issues.push({ ar: "ليلي", diff: t.night - e.nightOfficers });
  if (t.daily !== e.dailyOfficers) issues.push({ ar: "الحضور اليومي", diff: t.daily - e.dailyOfficers });
  if (t.supPerShift !== e.supervisorsPerShift) issues.push({ ar: "مشرفو الخدمة", diff: t.supPerShift - e.supervisorsPerShift });
  return { t, e, ok: issues.length === 0, issues };
}
function renderValidation() {
  const v = validation(), el = $("#valState"), txt = $("#valText");
  el.classList.toggle("ok", v.ok); el.classList.toggle("bad", !v.ok);
  el.querySelector("use").setAttribute("href", v.ok ? "#i-check" : "#i-warn");
  txt.textContent = v.ok
    ? `توزيع الخدمات مطابق للقوة المعتمدة — نهاري ${v.t.day}/${v.e.dayOfficers} · ليلي ${v.t.night}/${v.e.nightOfficers}`
    : "فرق في توزيع القوة: " + v.issues.map(i => `${i.ar} ${i.diff > 0 ? "+" : ""}${i.diff}`).join(" · ");
  $("#sbDaily").textContent = v.t.daily;
  $("#sbDailySup").textContent = v.t.dailySup;
  $("#cntDay").textContent = v.t.day;
  $("#cntNight").textContent = v.t.night;
  /* Safari's download-preview exposes a stripped console — never assume console.table */
  try {
    const row = { "نهاري": v.t.day, "ليلي": v.t.night, "حضور يومي": v.t.daily, "مشرفون/خدمة": v.t.supPerShift, "مطابق": v.ok };
    (console.table ? console.table : console.log).call(console, row);
  } catch (e) { /* non-essential */ }
  return v;
}

/* ------------------------------------------------------------------ */
/* 02 · STATE                                                          */
/* ------------------------------------------------------------------ */
const S = {
  shift: "day", view: "2d", focus: "services",
  layers: { ...C.ui.defaultLayers },
  cam: { x: 0, y: 0, k: 1 }, fit: { w: 0, h: 0, bx: 0, by: 0 },
  sel: null, selSector: null,
  presenting: false, step: -1, saved: null,
  editing: false, camAnim: null, pulseTimer: null, aerialTimer: null
};

/* ------------------------------------------------------------------ */
/* 03 · SMALL HELPERS                                                  */
/* ------------------------------------------------------------------ */
const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function tween(dur, onU, onDone) {
  const t0 = performance.now();
  let raf;
  function f(now) {
    const p = clamp((now - t0) / dur, 0, 1);
    onU(easeIO(p), p);
    if (p < 1) raf = requestAnimationFrame(f); else if (onDone) onDone();
  }
  raf = requestAnimationFrame(f);
  return () => cancelAnimationFrame(raf);
}
function animNum(el, to, dur) {
  const from = parseInt(el.textContent, 10) || 0;
  if (from === to) { el.textContent = to; return; }
  tween(dur || 700, e => { el.textContent = Math.round(from + (to - from) * e); });
}
function icon(id, cls) { return `<svg class="ic ${cls || ""}"><use href="#${id}"/></svg>`; }
function eqChip(key, link) {
  const eq = C.equipmentTypes[key];
  return eq ? `<span class="chip">${icon(eq.icon)} ${eq.ar}</span>` : "";
}
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("on");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("on"), 2400);
}
const normAr = s => (s || "").replace(/[ً-ْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").toLowerCase();
function smoothPath(pts, closed) {
  if (pts.length < 3) return "M" + pts.map(p => p.join(",")).join(" L");
  const P = closed ? [...pts, pts[0], pts[1]] : pts;
  let d = `M${P[0][0]},${P[0][1]}`;
  for (let i = 1; i < P.length - 1; i++) {
    const mx = (P[i][0] + P[i + 1][0]) / 2, my = (P[i][1] + P[i + 1][1]) / 2;
    d += ` Q${P[i][0]},${P[i][1]} ${mx},${my}`;
  }
  if (!closed) d += ` L${P[P.length - 1][0]},${P[P.length - 1][1]}`;
  return d;
}
const supById = id => C.supervisors.find(s => s.id === id);
const postById = id => C.securityPosts.find(p => p.id === id);
const assetById = id => C.assets.find(a => a.id === id);
function supervisorName(id) {
  const s = supById(id); if (s) return s.nameAr;
  return (C.supervisorLabels && C.supervisorLabels[id]) || "—";
}

/* ------------------------------------------------------------------ */
/* 04 · BUILD — OVERLAY (sectors / routes / zones)                     */
/* ------------------------------------------------------------------ */
const NS = "http://www.w3.org/2000/svg";
function svgEl(tag, attrs, parent) {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(el);
  return el;
}
function buildOverlay() {
  const gS = $("#g-sectors"), gR = $("#g-routes"), gZr = $("#g-zoneres"), gZc = $("#g-zonecon");
  C.supervisors.forEach(sp => {
    const g = svgEl("g", { class: "sector", "data-id": sp.id }, gS);
    g.style.setProperty("--sc", sp.color);
    svgEl("polygon", { points: sp.polygon.map(p => p.join(",")).join(" ") }, g);
    g.addEventListener("click", () => selectSupervisor(sp.id));
  });
  for (const key in C.patrolRoutes) {
    const r = C.patrolRoutes[key];
    const sup = C.supervisors.find(s => s.route === key);
    const g = svgEl("g", { class: "route", "data-id": key }, gR);
    if (sup) g.style.setProperty("--rc", sup.color);
    const d = smoothPath(r.points, r.closed);
    svgEl("path", { d, class: "halo" }, g);
    svgEl("path", { d, class: "flow" }, g);
  }
  const s3 = supById("sup3"), s1 = supById("sup1");
  if (s3) svgEl("polygon", { points: s3.polygon.map(p => p.join(",")).join(" "), class: "zone-tint", fill: s3.color }, gZr);
  if (s1) svgEl("polygon", { points: s1.polygon.map(p => p.join(",")).join(" "), class: "zone-tint", fill: s1.color }, gZc);
}

/* ------------------------------------------------------------------ */
/* 05 · BUILD — MARKERS                                                */
/* ------------------------------------------------------------------ */
function markerShell(x, y, cls, id) {
  const m = document.createElement("div");
  m.className = "marker " + cls;
  m.dataset.id = id;
  m.style.setProperty("--x", x + "%");
  m.style.setProperty("--y", y + "%");
  return m;
}
function buildMarkers() {
  /* security posts */
  C.securityPosts.forEach(p => {
    const cat = C.categories[p.category];
    const isGate = p.category === "entrance";
    const m = markerShell(p.x, p.y, `cat-${p.category} cat-post-like lyr-${isGate ? "gates" : "services"}`, p.id);
    if (isGate || p.category === "residential" || p.category === "control") m.classList.add("lbl-key");
    if (p.labelPos === "top") m.classList.add("lbl-top");
    if (p.equipment.includes("radio")) m.classList.add("has-radio");
    m.innerHTML = `
      <button class="m-body" aria-label="${p.nameAr}">
        <span class="m-pin">
          <svg class="m-glyph-n"><use href="#${cat.icon}"/></svg>
          <span class="m-off-x">${icon("i-off")}</span>
          <span class="m-count num"></span>
          <span class="m-flag">${icon("i-radio")}</span>
        </span>
        <span class="m-label">${p.nameAr}</span>
        <span class="m-off-tag">${C.shiftRules.nightOffShort}</span>
      </button>`;
    m.querySelector(".m-body").addEventListener("click", e => { if (S.editing) return; e.stopPropagation(); selectPost(p.id); });
    markersEl.appendChild(m);
  });
  /* supervisors */
  C.supervisors.forEach(sp => {
    const m = markerShell(sp.anchor.x, sp.anchor.y, "cat-supervisor", sp.id);
    m.style.setProperty("--sc", sp.color);
    if (sp.mobility) m.classList.add("has-mob");
    m.innerHTML = `
      <button class="m-body" aria-label="${sp.nameAr}">
        <span class="m-pin"><span style="transform:rotate(-45deg);font-size:10px;font-weight:800" class="lat">${sp.code}</span>
          ${sp.mobility ? `<span class="m-mob">${icon(C.equipmentTypes[sp.mobility].icon)}</span>` : ""}
        </span>
        <span class="m-label">${sp.nameAr}</span>
      </button>`;
    m.querySelector(".m-body").addEventListener("click", e => { if (S.editing) return; e.stopPropagation(); selectSupervisor(sp.id); });
    markersEl.appendChild(m);
    /* sector chip */
    const cx = sp.polygon.reduce((s, p) => s + p[0], 0) / sp.polygon.length;
    const cy = sp.polygon.reduce((s, p) => s + p[1], 0) / sp.polygon.length;
    const ch = markerShell(cx, cy, "sector-chip", "chip-" + sp.id);
    ch.style.setProperty("--sc", sp.color);
    ch.innerHTML = `<button class="m-body"><span class="m-pin"><span class="sc-code lat">${sp.code}</span> ${sp.nameAr}</span></button>`;
    ch.querySelector(".m-body").addEventListener("click", e => { if (S.editing) return; e.stopPropagation(); selectSupervisor(sp.id); });
    markersEl.appendChild(ch);
  });
  /* assets */
  C.assets.forEach(a => {
    if (a.type !== "mastaba") {
      const m = markerShell(a.x, a.y, "cat-asset cat-industrial" + (a.quietLabel ? "" : " lbl-key"), a.id);
      m.innerHTML = `
        <button class="m-body" aria-label="${a.nameAr}">
          <span class="m-pin"><svg><use href="#${a.icon || "i-terrace"}"/></svg></span>
          <span class="m-label">${a.nameAr}</span>
        </button>`;
      m.querySelector(".m-body").addEventListener("click", e => { if (S.editing) return; e.stopPropagation(); selectAsset(a.id); });
      markersEl.appendChild(m);
    } else {
      const m = markerShell(a.x, a.y, "cat-asset cat-mastaba", a.id);
      const n = a.nameAr.replace(/\D/g, "");
      m.innerHTML = `
        <button class="m-body" aria-label="${a.nameAr}">
          <span class="m-pin"><span style="font-size:9.5px;font-weight:800" class="num">${n}</span></span>
          <span class="m-label">${a.nameAr}</span>
        </button>`;
      markersEl.appendChild(m);
    }
  });
}

/* ------------------------------------------------------------------ */
/* 06 · LAYERS + LEGEND                                                */
/* ------------------------------------------------------------------ */
function buildLayers() {
  const wrap = $("#layersBody");
  Object.keys(C.ui.layerLabels).forEach(key => {
    const b = document.createElement("button");
    b.className = "lyr"; b.dataset.layer = key;
    b.setAttribute("aria-pressed", S.layers[key] ? "true" : "false");
    b.innerHTML = `<span class="dot">${icon("i-check")}</span> ${C.ui.layerLabels[key]}`;
    b.addEventListener("click", () => setLayer(key, !S.layers[key]));
    wrap.appendChild(b);
  });
  $("#layersHead").addEventListener("click", () => $("#layersPanel").classList.toggle("closed"));
  /* small screens open with the layers panel collapsed to keep the map clear */
  if (window.innerWidth < 940) $("#layersPanel").classList.add("closed");
  applyLayers();
}
function setLayer(key, on) {
  S.layers[key] = on;
  const b = $(`.lyr[data-layer="${key}"]`); if (b) b.setAttribute("aria-pressed", on ? "true" : "false");
  applyLayers();
}
function applyLayers() {
  for (const k in S.layers) body.classList.toggle("layer-" + k, !!S.layers[k]);
  $("#g-sectors").classList.toggle("on", !!S.layers.sectors);
  $("#g-routes").classList.toggle("on", !!S.layers.routes);
  $("#g-zoneres").classList.toggle("on", !!S.layers.residential);
  $("#g-zonecon").classList.toggle("on", !!S.layers.construction && false); /* tint reserved; dots carry the layer */
  declutter();
}
function buildLegend() {
  const el = $("#legendBody");
  const mini = (ic, extra) => `<span class="lg-sym"><span class="mini ${extra || ""}"><svg class="ic"><use href="#${ic}"/></svg></span></span>`;
  el.innerHTML = `
    <div class="lg-h">العلامات</div>
    <div class="lg-row">${mini("i-gate")} مدخل / بوابة</div>
    <div class="lg-row">${mini("i-terrace")} نقطة أمن ثابتة</div>
    <div class="lg-row">${mini("i-house")} سكن عمال</div>
    <div class="lg-row">${mini("i-screens")} غرفة مراقبة وعمليات</div>
    <div class="lg-row">${mini("i-diamond", "dia")} مشرف قطاع</div>
    <div class="lg-row">${mini("i-crusher")} كسارة الحجارة</div>
    <div class="lg-h">الحالة</div>
    <div class="lg-row"><span class="lg-sym"><span class="mini" style="background:var(--accent)"><b style="font-size:9px">2</b></span></span> عدد الأفراد بالخدمة</div>
    <div class="lg-row"><span class="lg-sym"><span class="mini" style="opacity:.4"><svg class="ic"><use href="#i-off"/></svg></span></span> ${C.shiftRules.nightOffShort}</div>
    <div class="lg-h">نطاقات الإشراف</div>
    ${C.supervisors.map(s => `<div class="lg-row"><span class="lg-sym"><span class="lg-sec" style="background:${s.color}"></span></span> ${s.nameAr.replace("مشرف ", "")}</div>`).join("")}
    <div class="lg-h">التجهيزات</div>
    <div class="lg-row">${mini("i-radio")} جهاز لاسلكي &nbsp; ${mini("i-flash")} كشاف</div>
    <div class="lg-row">${mini("i-scooter")} سكوتر &nbsp; ${mini("i-moto")} موتوسيكل</div>
    <div class="lg-note">${C.meta.positionsNote}</div>`;
  $("#legendHead").addEventListener("click", () => $("#legend").classList.toggle("closed"));
}

/* ------------------------------------------------------------------ */
/* 07 · CAMERA                                                         */
/* ------------------------------------------------------------------ */
function computeFit() {
  const r = stage.getBoundingClientRect();
  const short = r.height < 520;
  const padX = short ? 10 : r.width < 640 ? 10 : r.width < 900 ? 18 : 34;
  const padT = short ? 8 : r.width < 640 ? 58 : 60;
  const padB = short ? 8 : r.width < 640 ? 52 : 50;
  let h = r.height - padT - padB;
  let w = h / C.meta.planAspect;
  if (w > r.width - padX * 2) { w = r.width - padX * 2; h = w * C.meta.planAspect; }
  const availH = r.height - padT - padB;
  S.fit = { w, h, bx: (r.width - w) / 2, by: padT + (availH - h) / 2, availH, slack: (availH - h) / availH };
  tiltEl.style.width = w + "px";
  tiltEl.style.height = h + "px";
}
function applyCam() {
  camEl.style.transform = `translate(${S.cam.x}px, ${S.cam.y}px) scale(${S.cam.k})`;
  const inv = 1 / clamp(S.cam.k, 0.85, 2.1);
  tiltEl.style.setProperty("--inv", inv.toFixed(3));
  stage.dataset.zoom = S.cam.k > 2.1 ? "near" : S.cam.k > 1.32 ? "mid" : "far";
  declutter();
}
function camHome(animate) {
  const r = stage.getBoundingClientRect();
  let target;
  if (r.height < 520 && r.width > r.height) {
    /* short landscape screens: open zoomed to a readable width-filling view */
    const k = clamp((r.width * 0.85) / S.fit.w, 1, 2.6);
    target = { x: r.width / 2 - k * (S.fit.w * 0.5), y: r.height / 2 - k * (S.fit.h * 0.4), k };
  } else if (r.width < 780 && S.fit.slack > 0.2) {
    /* portrait phones: the fit is width-bound, so use the spare height */
    const k = Math.min(1.18, (S.fit.availH * 0.9) / S.fit.h);
    const cy = S.fit.by + S.fit.h / 2;
    target = { x: r.width / 2 - k * S.fit.w / 2, y: cy - k * S.fit.h / 2, k };
  } else {
    target = { x: S.fit.bx, y: S.fit.by, k: 1 };
  }
  animate ? camTo(target, 900) : Object.assign(S.cam, target);
  if (!animate) applyCam();
}
function camTo(target, dur) {
  if (S.camAnim) S.camAnim();
  const from = { ...S.cam };
  S.camAnim = tween(dur || 1000, e => {
    S.cam.x = from.x + (target.x - from.x) * e;
    S.cam.y = from.y + (target.y - from.y) * e;
    S.cam.k = from.k + (target.k - from.k) * e;
    applyCam();
  }, () => { S.camAnim = null; });
}
function flyTo(xp, yp, k, dur) {
  const r = stage.getBoundingClientRect();
  const detailOpen = $("#detail").classList.contains("open");
  const cx = r.width / 2 + (detailOpen ? 165 : 0), cy = r.height / 2 - 6;
  const px = (xp / 100) * S.fit.w, py = (yp / 100) * S.fit.h;
  camTo({ x: cx - k * px, y: cy - k * py, k }, dur || 1100);
}
/* #tilt sits at the camera origin; the fitted base offset lives in cam.x/y */
function initCamera() {
  computeFit();
  tiltEl.style.position = "absolute";
  tiltEl.style.left = "0"; tiltEl.style.top = "0";
  camHome(false);

  /* wheel zoom to cursor */
  stage.addEventListener("wheel", e => {
    if (S.presenting) return;
    e.preventDefault();
    const r = stage.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const f = Math.exp(-e.deltaY * 0.0016);
    const nk = clamp(S.cam.k * f, 0.7, 6);
    const wx = (mx - S.cam.x) / S.cam.k, wy = (my - S.cam.y) / S.cam.k;
    S.cam.x = mx - wx * nk; S.cam.y = my - wy * nk; S.cam.k = nk;
    if (S.camAnim) { S.camAnim(); S.camAnim = null; }
    applyCam();
  }, { passive: false });

  /* drag pan + pinch */
  const pts = new Map();
  let lastMid = null, lastDist = 0, moved = false;
  stage.addEventListener("pointerdown", e => {
    if (e.target.closest(".float, #detail, #presentBar, #presentCard, #editBar, .m-body, #statusbar")) return;
    stage.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved = false;
    if (pts.size === 1) { lastMid = { x: e.clientX, y: e.clientY }; stage.classList.add("dragging"); }
    if (pts.size === 2) { const a = [...pts.values()]; lastDist = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); }
  });
  stage.addEventListener("pointermove", e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const a = [...pts.values()];
    if (pts.size === 1) {
      const dx = a[0].x - lastMid.x, dy = a[0].y - lastMid.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
      S.cam.x += dx; S.cam.y += dy; lastMid = { x: a[0].x, y: a[0].y };
      if (S.camAnim) { S.camAnim(); S.camAnim = null; }
      applyCam();
    } else if (pts.size === 2) {
      const mid = { x: (a[0].x + a[1].x) / 2, y: (a[0].y + a[1].y) / 2 };
      const dist = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
      const r = stage.getBoundingClientRect();
      const mx = mid.x - r.left, my = mid.y - r.top;
      const f = dist / (lastDist || dist);
      const nk = clamp(S.cam.k * f, 0.7, 6);
      const wx = (mx - S.cam.x) / S.cam.k, wy = (my - S.cam.y) / S.cam.k;
      S.cam.x = mx - wx * nk; S.cam.y = my - wy * nk; S.cam.k = nk;
      lastDist = dist; applyCam();
    }
  });
  const up = e => { pts.delete(e.pointerId); if (!pts.size) stage.classList.remove("dragging"); };
  stage.addEventListener("pointerup", up); stage.addEventListener("pointercancel", up);
  stage.addEventListener("dblclick", e => {
    if (e.target.closest(".float, #detail, .m-body")) return;
    const r = stage.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const nk = clamp(S.cam.k * 1.6, 0.7, 6);
    const wx = (mx - S.cam.x) / S.cam.k, wy = (my - S.cam.y) / S.cam.k;
    camTo({ x: mx - wx * nk, y: my - wy * nk, k: nk }, 650);
  });
  $("#zIn").addEventListener("click", () => zoomStep(1.45));
  $("#zOut").addEventListener("click", () => zoomStep(1 / 1.45));
  $("#zFit").addEventListener("click", () => camHome(true));
  window.addEventListener("resize", () => {
    const keep = worldCenter();
    computeFit(); camHome(false);
    if (keep) { /* stay home on resize for stability */ }
  });
}
function worldCenter() {
  const r = stage.getBoundingClientRect();
  return { x: (r.width / 2 - S.cam.x) / S.cam.k, y: (r.height / 2 - S.cam.y) / S.cam.k };
}
function zoomStep(f) {
  const r = stage.getBoundingClientRect();
  const mx = r.width / 2, my = r.height / 2;
  const nk = clamp(S.cam.k * f, 0.7, 6);
  const wx = (mx - S.cam.x) / S.cam.k, wy = (my - S.cam.y) / S.cam.k;
  camTo({ x: mx - wx * nk, y: my - wy * nk, k: nk }, 550);
}


/* ------------------------------------------------------------------ */
/* 07b · LABEL DECLUTTERING — map-engine style placement                */
/*    Labels are never allowed to cover another marker's pin or label.  */
/*    Each label tries below the pin, then above, otherwise it hides.   */
/* ------------------------------------------------------------------ */
const LABEL_RANK = { entrance: 1, control: 2, residential: 3, warehouse: 4, admin: 4, post: 5, industrial: 6, mastaba: 8 };
function markerRank(m) {
  if (m.classList.contains("cat-entrance")) return LABEL_RANK.entrance;
  if (m.classList.contains("cat-control")) return LABEL_RANK.control;
  if (m.classList.contains("cat-residential")) return LABEL_RANK.residential;
  if (m.classList.contains("cat-industrial")) return LABEL_RANK.industrial;
  if (m.classList.contains("cat-mastaba")) return LABEL_RANK.mastaba;
  if (m.classList.contains("cat-warehouse") || m.classList.contains("cat-admin")) return LABEL_RANK.admin;
  return LABEL_RANK.post;
}
const hits = (a, b, pad) => !(a.right + pad < b.left || a.left - pad > b.right || a.bottom + pad < b.top || a.top - pad > b.bottom);

let declutterT = null;
function declutter(delay) {
  clearTimeout(declutterT);
  declutterT = setTimeout(runDeclutter, delay === undefined ? 90 : delay);
}
function runDeclutter() {
  /* wait for the camera to settle so we measure final positions once */
  if (S.camAnim || stage.classList.contains("dragging")) { declutter(120); return; }
  const view = stage.getBoundingClientRect();
  const near = S.cam.k > 2.15;
  const all = $$(".marker", markersEl).filter(m => m.offsetParent !== null);

  /* pins and sector chips are sacred — a label may never sit on one */
  const pins = [];
  all.forEach(m => {
    const pin = m.querySelector(".m-pin");
    if (pin) pins.push({ id: m.dataset.id, r: pin.getBoundingClientRect() });
  });
  const taken = [];
  const supMode = body.dataset.focus === "supervision";

  const candidates = all.filter(m => {
    if (m.classList.contains("sector-chip")) return false;          /* the chip is its own label */
    if (supMode && !m.classList.contains("cat-asset")) return false;/* sector mode reads by chip */
    if (m.classList.contains("cat-supervisor")) return false;       /* identified by S1–S4 */
    if (m.classList.contains("off")) return false;                  /* carries its own night tag */
    if (m.classList.contains("cat-mastaba") && !near) return false; /* only once zoomed in */
    return !!m.querySelector(".m-label");
  }).sort((a, b) => markerRank(a) - markerRank(b));

  /* anything not in the running loses its label */
  const running = new Set(candidates);
  all.forEach(m => { if (!running.has(m)) m.classList.remove("lbl-on"); });

  candidates.forEach(m => {
    const label = m.querySelector(".m-label");
    const wasTop = m.classList.contains("lbl-top");
    m.classList.add("lbl-on");                 /* measure in its final geometry */
    let placed = false;
    for (const top of [wasTop, !wasTop]) {
      m.classList.toggle("lbl-top", top);
      const r = label.getBoundingClientRect();
      const inside = r.left > view.left + 2 && r.right < view.right - 2 && r.top > view.top + 2 && r.bottom < view.bottom - 2;
      const clearOfPins = !pins.some(p => p.id !== m.dataset.id && hits(r, p.r, 1));
      const clearOfLabels = !taken.some(t => hits(r, t, 3));
      if (inside && clearOfPins && clearOfLabels) { taken.push(r); placed = true; break; }
    }
    if (!placed) { m.classList.remove("lbl-on"); m.classList.toggle("lbl-top", wasTop); }
  });
}

/* ------------------------------------------------------------------ */
/* 08 · SHIFT ENGINE                                                   */
/* ------------------------------------------------------------------ */
function setShift(shift, opts) {
  if (S.shift === shift && !(opts && opts.force)) return;
  S.shift = shift;
  body.dataset.shift = shift;
  $("#btnDay").classList.toggle("active", shift === "day");
  $("#btnNight").classList.toggle("active", shift === "night");
  $("#btnDay").setAttribute("aria-pressed", shift === "day");
  $("#btnNight").setAttribute("aria-pressed", shift === "night");
  const t = totals();
  /* animated headline counter */
  animNum($("#sbOfficers"), shift === "day" ? t.day : t.night, 850);
  $("#sbSup").textContent = t.supPerShift;
  $("#sbShift").textContent = shift === "day" ? "الخدمة النهارية" : "الخدمة الليلية";
  /* markers: stagger the four services out/in */
  let stag = 0;
  C.securityPosts.forEach(p => {
    const m = markersEl.querySelector(`.marker[data-id="${p.id}"]`);
    if (!m) return;
    const n = p[shift];
    const off = n === 0;
    const bdy = m.querySelector(".m-body");
    if (off !== m.classList.contains("off")) { bdy.style.setProperty("--stag", (stag * 0.09) + "s"); stag++; }
    else bdy.style.setProperty("--stag", "0s");
    m.classList.toggle("off", off);
    m.querySelector(".m-count").textContent = off ? "0" : n;
    bdy.setAttribute("aria-label", p.nameAr + (off ? " — " + C.shiftRules.nightOffLabel : ` — ${n} فرد أمن`));
  });
  if (S.sel) renderDetail(S.sel);
  declutter();
}

/* ------------------------------------------------------------------ */
/* 09 · VIEW + FOCUS MODES                                             */
/* ------------------------------------------------------------------ */
function setView(v) {
  S.view = v; body.dataset.view = v;
  $("#btnView2d").setAttribute("aria-pressed", v === "2d");
  $("#btnView3d").setAttribute("aria-pressed", v === "3d");
  const deg = v === "3d" ? ($("#tiltRange").value || 54) : 0;
  applyTilt(deg);
  /* cinematic re-framing so the tilted plane is always well composed */
  if (v === "3d") flyTo(50, 47, clamp(S.cam.k, 1.18, 1.6), 1250);
  else if (S.cam.k <= 1.65) camHome(true);
}
function applyTilt(deg) {
  document.documentElement.style.setProperty("--tiltA", deg + "deg");
  document.documentElement.style.setProperty("--ctilt", (-deg) + "deg");
  document.documentElement.style.setProperty("--lift", deg > 0 ? "13px" : "0px");
  tiltEl.style.transform = `rotateX(${deg}deg)`;
}
function setFocus(f) {
  S.focus = f; body.dataset.focus = f;
  $("#btnFocusServices").setAttribute("aria-pressed", f === "services");
  $("#btnFocusSup").setAttribute("aria-pressed", f === "supervision");
  if (f === "services") clearSectorFocus();
  declutter();
}
function clearSectorFocus() {
  S.selSector = null;
  delete body.dataset.selsector;
  $$(".sector", overlay).forEach(g => g.classList.remove("hot", "dim"));
  $$(".route", overlay).forEach(r => r.classList.remove("dim"));
  $$(".marker.insec").forEach(m => m.classList.remove("insec"));
  $("#g-routes").classList.toggle("on", !!S.layers.routes);
}
function focusSector(supId) {
  S.selSector = supId;
  body.dataset.selsector = supId;
  $$(".sector", overlay).forEach(g => {
    g.classList.toggle("hot", g.dataset.id === supId);
    g.classList.toggle("dim", g.dataset.id !== supId);
  });
  const spr = supById(supId);
  $$(".route", overlay).forEach(r => r.classList.toggle("dim", !spr || spr.route !== r.dataset.id));
  $$(".marker.insec").forEach(m => m.classList.remove("insec"));
  const sp = supById(supId);
  const ids = new Set([supId, "chip-" + supId, ...(sp.coverageIds || [])]);
  C.securityPosts.filter(p => p.supervisor === supId).forEach(p => ids.add(p.id));
  ids.forEach(id => { const m = markersEl.querySelector(`.marker[data-id="${id}"]`); if (m) m.classList.add("insec"); });
}

/* ------------------------------------------------------------------ */
/* 10 · SELECTION + DETAIL PANEL                                       */
/* ------------------------------------------------------------------ */
function clearSelection() {
  S.sel = null;
  $$(".marker.selected").forEach(m => m.classList.remove("selected"));
  $("#detail").classList.remove("open");
  stage.classList.remove("has-detail");
  if (S.focus === "services") clearSectorFocus();
}
function openDetail() { $("#detail").classList.add("open"); stage.classList.add("has-detail"); }
function markSelected(id) {
  $$(".marker.selected").forEach(m => m.classList.remove("selected"));
  const m = markersEl.querySelector(`.marker[data-id="${id}"]`);
  if (m) m.classList.add("selected");
}
function selectPost(id) {
  const p = postById(id); if (!p) return;
  S.sel = { type: "post", id };
  markSelected(id);
  renderDetail(S.sel);
  openDetail();
  flyTo(p.x, p.y, Math.max(S.cam.k, 1.55), 900);
}
function selectSupervisor(id) {
  const sp = supById(id); if (!sp) return;
  S.sel = { type: "sup", id };
  markSelected(id);
  renderDetail(S.sel);
  openDetail();
  focusSector(id);
  const xs = sp.polygon.map(p => p[0]), ys = sp.polygon.map(p => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const spanX = (Math.max(...xs) - Math.min(...xs)) / 100 * S.fit.w;
  const r = stage.getBoundingClientRect();
  const k = clamp((r.width * 0.52) / spanX, 1.0, 2.4);
  flyTo(cx, cy, k, 1000);
  if (sp.route) $("#g-routes").classList.add("on"); /* movement range shown while the sector is focused */
}
function selectAsset(id) {
  const a = assetById(id); if (!a) return;
  S.sel = { type: "asset", id };
  markSelected(id);
  renderDetail(S.sel);
  openDetail();
  flyTo(a.x, a.y, Math.max(S.cam.k, 1.7), 900);
}
function renderDetail(sel) {
  const head = $("#detailHead"), bodyEl = $("#detailBody");
  if (sel.type === "post") {
    const p = postById(sel.id);
    const cat = C.categories[p.category];
    const active = p[S.shift] > 0;
    const both = p.day > 0 && p.night > 0;
    head.innerHTML = `
      <span class="dt-cat">${icon(cat.icon)} ${cat.ar}</span>
      <div class="dt-name">${p.nameAr}</div>
      <div class="dt-en lat">${p.nameEn || ""}</div>`;
    bodyEl.innerHTML = `
      <div class="dt-sec">
        <div class="dt-k">${icon("i-eye")} الحالة التشغيلية</div>
        <div class="dt-status">
          <span class="st-dot ${active ? "" : "off"}"></span>
          <span>${both ? "نشط نهاراً وليلاً" : C.shiftRules.nightOffShort}
            <span class="sub">${active ? (S.shift === "day" ? "في الخدمة — نهاراً" : "في الخدمة — ليلاً") : C.shiftRules.nightOffLabel}</span>
          </span>
        </div>
      </div>
      <div class="dt-sec">
        <div class="dt-k">${icon("i-users")} القوة</div>
        <div class="dt-force">
          <b class="num">${p[S.shift]}</b><span class="u">فرد أمن<br>بالخدمة الحالية</span>
          <span class="alt num-wrap">نهاري <b class="num" style="font-size:13px;font-weight:700">${p.day}</b> · ليلي <b class="num" style="font-size:13px;font-weight:700">${p.night}</b></span>
        </div>
      </div>
      <div class="dt-sec">
        <div class="dt-k">${icon("i-radio")} التجهيزات</div>
        ${p.equipment.length ? `<div class="chips">${p.equipment.map(eqChip).join("")}</div>` : `<div class="dt-note">—</div>`}
      </div>
      <div class="dt-sec">
        <div class="dt-k">${icon("i-diamond")} الإشراف</div>
        ${supById(p.supervisor)
          ? `<span class="chip sec link" data-sup="${p.supervisor}" style="--sc:${supById(p.supervisor).color}"><span class="swb"></span> ${supervisorName(p.supervisor)}</span>`
          : `<span class="chip">${icon("i-screens")} ${supervisorName(p.supervisor)}</span>`}
      </div>
      ${p.covers && p.covers.length ? `
      <div class="dt-sec">
        <div class="dt-k">${icon("i-target")} نطاق التغطية</div>
        <ul class="dt-list">${p.covers.map(cid => `<li>${(assetById(cid) || { nameAr: cid }).nameAr}</li>`).join("")}</ul>
      </div>` : ""}
      ${p.notes ? `<div class="dt-sec"><div class="dt-k">${icon("i-eye")} ملاحظات ميدانية</div><div class="dt-note">${p.notes}</div></div>` : ""}
    `;
  } else if (sel.type === "sup") {
    const sp = supById(sel.id);
    head.innerHTML = `
      <span class="dt-cat sup" style="--sc:${sp.color}">${icon("i-diamond")} قطاع إشراف · <span class="lat">${sp.code}</span></span>
      <div class="dt-name">${sp.nameAr}</div>
      <div class="dt-en lat">${sp.nameEn || ""}</div>`;
    bodyEl.innerHTML = `
      <div class="dt-sec"><div class="dt-note" style="color:var(--ink-2)">${sp.brief}</div></div>
      <div class="dt-sec">
        <div class="dt-k">${icon("i-target")} النطاق</div>
        <ul class="dt-list">${sp.coverage.map(cv => `<li>${cv}</li>`).join("")}</ul>
      </div>
      ${sp.mobility ? `
      <div class="dt-sec">
        <div class="dt-k">${icon(C.equipmentTypes[sp.mobility].icon)} وسيلة الانتقال</div>
        <div class="chips"><span class="chip" style="border-color:${sp.color};color:${sp.color}">${icon(C.equipmentTypes[sp.mobility].icon)} ${C.equipmentTypes[sp.mobility].ar}</span></div>
      </div>` : ""}
      <div class="dt-sec">
        <div class="dt-k">${icon("i-radio")} التجهيزات</div>
        ${sp.equipment.filter(e => e !== sp.mobility).length ? `<div class="chips">${sp.equipment.filter(e => e !== sp.mobility).map(eqChip).join("")}</div>` : `<div class="dt-note">—</div>`}
      </div>
      <div class="dt-sec">
        <div class="dt-k">${icon("i-sun")} الحضور</div>
        <div class="dt-note" style="color:var(--ink-2)">مشرف نهاراً ومشرف ليلاً لكل قطاع</div>
      </div>
      ${sp.route ? `
      <div class="dt-actions">
        <button class="dt-btn" id="dtRouteBtn">${icon("i-route")} نطاق حركة المشرف</button>
      </div>` : ""}
    `;
    const rb = $("#dtRouteBtn");
    if (rb) rb.addEventListener("click", () => { setLayer("routes", !S.layers.routes); });
  } else if (sel.type === "asset") {
    const a = assetById(sel.id);
    head.innerHTML = `
      <span class="dt-cat">${icon(a.icon || "i-terrace")} أصل تشغيلي</span>
      <div class="dt-name">${a.nameAr}</div>
      <div class="dt-en lat">${a.nameEn || ""}</div>`;
    bodyEl.innerHTML = `
      <div class="dt-sec">
        <div class="dt-k">${icon("i-diamond")} الإشراف والمتابعة</div>
        ${supById(a.supervisor) ? `<span class="chip sec link" data-sup="${a.supervisor}" style="--sc:${supById(a.supervisor).color}"><span class="swb"></span> ${supervisorName(a.supervisor)}</span>` : "—"}
      </div>
      ${a.notes ? `<div class="dt-sec"><div class="dt-k">${icon("i-eye")} ملاحظات</div><div class="dt-note">${a.notes}</div></div>` : ""}
    `;
  }
  $$(".chip.link[data-sup]", bodyEl).forEach(ch => ch.addEventListener("click", () => selectSupervisor(ch.dataset.sup)));
}

/* ------------------------------------------------------------------ */
/* 11 · SEARCH                                                         */
/* ------------------------------------------------------------------ */
function buildSearch() {
  const idx = [];
  C.securityPosts.forEach(p => idx.push({ type: "post", id: p.id, name: p.nameAr, extra: C.categories[p.category].ar, icon: C.categories[p.category].icon, keys: normAr([p.nameAr, p.nameEn, ...(p.aliases || [])].join(" ")) }));
  C.supervisors.forEach(s => idx.push({ type: "sup", id: s.id, name: s.nameAr, extra: "قطاع إشراف", icon: "i-diamond", keys: normAr([s.nameAr, s.code, ...(s.coverage || [])].join(" ")) }));
  C.assets.forEach(a => idx.push({ type: "asset", id: a.id, name: a.nameAr, extra: a.type === "mastaba" ? "مصطبة" : "أصل تشغيلي", icon: a.type === "mastaba" ? "i-terrace" : (a.icon || "i-terrace"), keys: normAr([a.nameAr, ...(a.aliases || [])].join(" ")) }));
  const input = $("#searchInput"), res = $("#searchResults");
  function run() {
    const q = normAr(input.value.trim());
    res.innerHTML = "";
    if (q.length < 1) return;
    const hits = idx.filter(i => i.keys.includes(q)).slice(0, 8);
    hits.forEach((h, n) => {
      const b = document.createElement("button");
      b.className = "sr" + (n === 0 ? " hot" : "");
      b.innerHTML = `${icon(h.icon)} ${h.name} <small>${h.extra}</small>`;
      b.addEventListener("click", () => { pick(h); });
      res.appendChild(b);
    });
  }
  function pick(h) {
    res.innerHTML = ""; input.value = "";
    if (h.type === "post") selectPost(h.id);
    else if (h.type === "sup") { if (S.focus !== "supervision") setFocus("supervision"); selectSupervisor(h.id); }
    else if (h.type === "asset") { const a = assetById(h.id); if (a.type === "mastaba") { flyTo(a.x, a.y, 2.2, 950); pulse([h.id]); } else selectAsset(h.id); }
  }
  input.addEventListener("input", run);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") { const f = res.querySelector(".sr"); if (f) f.click(); }
    if (e.key === "Escape") { res.innerHTML = ""; input.value = ""; input.blur(); }
  });
  document.addEventListener("click", e => { if (!e.target.closest("#searchWrap")) res.innerHTML = ""; });
}
function pulse(ids, dur) {
  if (S.pulseTimer) clearTimeout(S.pulseTimer);
  $$(".marker.pulse").forEach(m => m.classList.remove("pulse"));
  ids.forEach(id => { const m = markersEl.querySelector(`.marker[data-id="${id}"]`); if (m) m.classList.add("pulse"); });
  S.pulseTimer = setTimeout(() => $$(".marker.pulse").forEach(m => m.classList.remove("pulse")), dur || 5200);
}

/* ------------------------------------------------------------------ */
/* 12 · MATRIX SHEET                                                   */
/* ------------------------------------------------------------------ */
function renderMatrix() {
  const t = totals();
  const groups = [...new Set(C.securityPosts.map(p => p.group))];
  let rows = "";
  groups.forEach(g => {
    rows += `<tr class="grp"><td colspan="5">${g}</td></tr>`;
    C.securityPosts.filter(p => p.group === g).forEach(p => {
      const cat = C.categories[p.category];
      rows += `<tr>
        <td><span class="locname"><span class="lic"><svg><use href="#${cat.icon}"/></svg></span> ${p.nameAr}</span></td>
        <td>${p.day > 0 ? `<span class="okc">${icon("i-check")} <span class="num">${p.day}</span></span>` : `<span class="noc">—</span>`}</td>
        <td>${p.night > 0 ? `<span class="okc">${icon("i-check")} <span class="num">${p.night}</span></span>` : `<span class="noc">${icon("i-moon")} ${C.shiftRules.nightOffShort}</span>`}</td>
        <td><span class="eq">${p.equipment.length ? p.equipment.map(eqChip).join("") : "<span class='noc'>—</span>"}</span></td>
        <td>${supById(p.supervisor) ? `<span class="supcell"><span class="swb" style="background:${supById(p.supervisor).color}"></span>${supervisorName(p.supervisor)}</span>` : `<span class="supcell">${supervisorName(p.supervisor)}</span>`}</td>
      </tr>`;
    });
  });
  const supRows = C.supervisors.map(s => `
    <tr>
      <td><span class="locname"><span class="lic" style="color:${s.color}"><svg><use href="#i-diamond"/></svg></span> ${s.nameAr}</span></td>
      <td><span class="okc">${icon("i-check")} 1</span></td>
      <td><span class="okc">${icon("i-check")} 1</span></td>
      <td class="num" style="font-weight:700">2</td>
      <td><span class="eq">${[...(s.mobility ? [s.mobility] : []), ...s.equipment.filter(e => e !== s.mobility)].map(eqChip).join("") || "<span class='noc'>—</span>"}</span></td>
      <td><span class="supcell">${s.coverage.slice(0, 3).join(" · ")}${s.coverage.length > 3 ? " …" : ""}</span></td>
    </tr>`).join("");
  $("#matrixBody").innerHTML = `
    <table class="mx">
      <thead><tr>
        <th style="width:27%">الموقع</th><th>الخدمة النهارية</th><th>الخدمة الليلية</th><th style="width:19%">التجهيز</th><th style="width:24%">المشرف المسؤول</th>
      </tr></thead>
      <tbody>
        ${rows}
        <tr class="tot">
          <td>إجمالي أفراد الأمن</td>
          <td><span class="num">${t.day}</span> / ${C.shiftRules.expected.dayOfficers}</td>
          <td><span class="num">${t.night}</span> / ${C.shiftRules.expected.nightOfficers}</td>
          <td colspan="2">${validation().ok ? `<span class="okc">${icon("i-check")} توزيع مطابق للقوة المعتمدة — حضور يومي ${t.daily} فرد</span>` : `<span class="noc">${icon("i-warn")} راجع التوزيع</span>`}</td>
        </tr>
      </tbody>
    </table>
    <div class="mg-h" style="margin-top:26px">المشرفون — ${t.supPerShift} لكل خدمة · ${t.dailySup} حضور يومي</div>
    <table class="mx">
      <thead><tr><th style="width:26%">القطاع</th><th>نهاري</th><th>ليلي</th><th>حضور يومي</th><th style="width:18%">التجهيز والتنقل</th><th style="width:22%">النطاق</th></tr></thead>
      <tbody>${supRows}</tbody>
    </table>
    <div class="mx-note">${icon("i-moon")} الخدمات المعلَّمة «${C.shiftRules.nightOffShort}» تخرج من الخدمة آلياً في الخدمة الليلية وتعود نهاراً.</div>`;
}

/* ------------------------------------------------------------------ */
/* 13 · MANAGEMENT SHEET                                               */
/* ------------------------------------------------------------------ */
function renderMgmt() {
  const t = totals();
  const eqCount = C.equipmentInventory || {};
  const dir = C.managementTeam.find(m => m.id === "director");
  const ops = C.managementTeam.find(m => m.id === "ops");
  const ctrl = C.managementTeam.find(m => m.id === "controlRoom");
  const adm = C.managementTeam.find(m => m.id === "adminAffairs");
  const supT = C.managementTeam.find(m => m.id === "supervisorsTier");
  const offT = C.managementTeam.find(m => m.id === "officersTier");
  $("#mgmtBody").innerHTML = `
    <div class="mg-grid">
      <div class="mg-stat hot"><b class="num">${t.daily}</b><span>أفراد الأمن · حضور يومي</span></div>
      <div class="mg-stat"><b class="num">${t.dailySup}</b><span>مشرفون · حضور يومي</span></div>
      <div class="mg-stat"><b class="num">${t.day}</b><span>الخدمة النهارية · فرد أمن</span></div>
      <div class="mg-stat"><b class="num">${t.night}</b><span>الخدمة الليلية · فرد أمن</span></div>
      <div class="mg-stat"><b class="num">${t.points}</b><span>نقطة / نطاق أمني</span></div>
    </div>

    <div class="mg-h">${icon("i-org")} هيكل القيادة والسيطرة</div>
    <div class="org">
      <div class="org-node acc">
        <span class="on-ic"><svg><use href="#i-shield"/></svg></span>
        <span class="on-t"><b>${dir.roleAr}</b><small>${dir.duties}</small></span>
        <span class="org-cnt num">${dir.count}</span>
      </div>
      <span class="org-link"></span>
      <div class="org-node">
        <span class="on-ic"><svg><use href="#i-target"/></svg></span>
        <span class="on-t"><b>${ops.roleAr}</b><small>${ops.duties}</small>
          <span class="fn-chips">${ops.functions.map(f => `<span>${f}</span>`).join("")}</span>
        </span>
        <span class="org-cnt num">${ops.count}</span>
      </div>
      <span class="org-link"></span>
      <div class="org-side">
        <div class="org-node">
          <span class="on-ic"><svg><use href="#i-screens"/></svg></span>
          <span class="on-t"><b>${ctrl.roleAr}</b><small>${ctrl.duties}</small>
            <span class="fn-chips">${ctrl.functions.map(f => `<span>${f}</span>`).join("")}</span>
          </span>
        </div>
        <div class="org-node">
          <span class="on-ic"><svg><use href="#i-box"/></svg></span>
          <span class="on-t"><b>${adm.roleAr}</b><small>${adm.duties}</small>
            <span class="fn-chips">${adm.functions.map(f => `<span>${f}</span>`).join("")}</span>
          </span>
          <span class="org-cnt num">${adm.count}</span>
        </div>
      </div>
      <span class="org-link"></span>
      <div class="org-sups">
        ${C.supervisors.map(s => `
          <div class="org-sup" style="--sc:${s.color}">
            <b>${s.nameAr}</b>
            <small>${s.mobility ? icon(C.equipmentTypes[s.mobility].icon) + " " + C.equipmentTypes[s.mobility].ar + " · " : ""}${s.duty || supT.functions.slice(0, 2).join(" · ")}</small>
          </div>`).join("")}
      </div>
      <span class="org-link"></span>
      <div class="org-node">
        <span class="on-ic"><svg><use href="#i-users"/></svg></span>
        <span class="on-t"><b>${offT.roleAr}</b><small>${offT.duties}</small></span>
        <span class="org-cnt num">${offT.count}</span>
      </div>
    </div>

    <div class="mg-cols" style="margin-top:26px">
      <div>
        <div class="mg-h">${icon("i-radio")} حصر التجهيزات</div>
        <ul class="mg-list">
          ${Object.keys(eqCount).map(k => `<li>${icon(C.equipmentTypes[k].icon)} ${C.equipmentTypes[k].ar}<b class="num">${eqCount[k]}</b></li>`).join("")}
        </ul>
      </div>
    </div>`;
}

/* ------------------------------------------------------------------ */
/* 14 · SHEETS OPEN/CLOSE                                              */
/* ------------------------------------------------------------------ */
function openSheet(id) {
  if (id === "matrixSheet") renderMatrix();
  if (id === "mgmtSheet") renderMgmt();
  $("#" + id).classList.add("open");
}
function closeSheets() { $$(".sheet.open").forEach(s => s.classList.remove("open")); }

/* ------------------------------------------------------------------ */
/* 15 · PRESENTATION MODE                                              */
/* ------------------------------------------------------------------ */
function startPresent() {
  if (S.presenting) return;
  closeSheets(); clearSelection();
  S.saved = { shift: S.shift, focus: S.focus, view: S.view, layers: { ...S.layers }, cam: { ...S.cam } };
  S.presenting = true; body.classList.add("presenting");
  $("#presentBar").hidden = false; $("#presentCard").hidden = false;
  const dots = $("#pbDots"); dots.innerHTML = "";
  C.presentation.forEach((st, i) => {
    const d = document.createElement("i");
    d.addEventListener("click", () => goStep(i));
    dots.appendChild(d);
  });
  goStep(0);
}
function exitPresent() {
  if (!S.presenting) return;
  S.presenting = false; body.classList.remove("presenting");
  $("#presentBar").hidden = true; $("#presentCard").hidden = true;
  $("#aerialFx").classList.remove("on");
  if (S.aerialTimer) clearTimeout(S.aerialTimer);
  $$(".marker.pulse").forEach(m => m.classList.remove("pulse"));
  if (S.saved) {
    setShift(S.saved.shift); setFocus(S.saved.focus); setView(S.saved.view);
    S.layers = { ...S.saved.layers }; applyLayers();
    $$(".lyr").forEach(b => b.setAttribute("aria-pressed", S.layers[b.dataset.layer] ? "true" : "false"));
    camTo(S.saved.cam, 900);
  }
}
function goStep(i) {
  const steps = C.presentation;
  if (i < 0 || i >= steps.length) return;
  S.step = i;
  const st = steps[i];
  const card = $("#presentCard");
  card.classList.add("slide");
  if (S.aerialTimer) { clearTimeout(S.aerialTimer); S.aerialTimer = null; }
  /* aerial overlay only on steps that ask for it */
  const fx = $("#aerialFx");
  if (st.aerial) {
    fx.classList.add("on");
    S.aerialTimer = setTimeout(() => fx.classList.remove("on"), 2100);
  } else fx.classList.remove("on");

  setTimeout(() => {
    const t = totals();
    let inner = `
      <div class="pc-num"><b class="lat">${st.num} / ${String(steps.length).padStart(2, "0")}</b>
        <span class="track"><i style="width:${((i + 1) / steps.length) * 100}%"></i></span></div>
      <div class="pc-title">${st.title}</div>
      ${st.body ? `<div class="pc-body">${st.body}</div>` : ""}`;
    if (st.stat === "day") inner += `<div class="pc-stat"><b class="num" id="pcBig">${t.day}</b><span>فرد أمن<br>الخدمة النهارية</span></div>`;
    if (st.stat === "night") {
      const startVal = S.shift === "night" ? t.night : t.day;
      inner += `<div class="pc-stat"><b class="num" id="pcBig">${startVal}</b><span>فرد أمن<br>الخدمة الليلية</span></div>`;
    }
    if (st.summary) {
      const v = validation();
      inner += `
        <div class="pc-summary">
          <div class="cell"><b class="num">${t.daily}</b><span>فرد أمن · حضور يومي</span></div>
          <div class="cell"><b class="num">${t.dailySup}</b><span>مشرفون · حضور يومي</span></div>
          <div class="cell"><b class="num">${t.day}</b><span>الخدمة النهارية</span></div>
          <div class="cell"><b class="num">${t.night}</b><span>الخدمة الليلية</span></div>
          <div class="cell"><b class="num">${t.points}</b><span>نقطة / نطاق أمني</span></div>
          <div class="cell"><b class="num">${t.supPerShift}</b><span>قطاعات إشراف بكل خدمة</span></div>
        </div>
        <div class="pc-valid">${icon("i-check")} ${v.ok ? "توزيع الخدمات مطابق للقوة المعتمدة" : "راجع توزيع القوة"}</div>`;
    }
    card.innerHTML = inner;
    card.classList.remove("slide");
    /* apply scene */
    if (st.focus) setFocus(st.focus);
    if (st.shift) {
      if (st.stat === "night" && st.shift === "night" && S.shift !== "night") {
        /* animate 14 → 10 in the big number alongside the map transition */
        setTimeout(() => { setShift("night"); const big = $("#pcBig"); if (big) animNum(big, t.night, 1300); }, 650);
      } else setShift(st.shift);
    }
    /* deterministic per-step layers: presentation always starts from the defaults */
    S.layers = { ...C.ui.defaultLayers, ...(st.layers || {}) };
    $$(".lyr").forEach(b => b.setAttribute("aria-pressed", S.layers[b.dataset.layer] ? "true" : "false"));
    applyLayers();
    if (st.focus === "supervision") { clearSectorFocus(); }
    flyTo(st.cam.x, st.cam.y, st.cam.k, 1350);
    if (st.pulse) pulse(st.pulse, 6000);
    /* dots */
    $$("#pbDots i").forEach((d, n) => d.classList.toggle("on", n === i));
    $("#pbPrev").disabled = i === 0;
    $("#pbNext").textContent = "";
    $("#pbNext").innerHTML = (i === steps.length - 1 ? "إنهاء العرض " : "التالي ") + icon("i-arr-l");
  }, 260);
}
function nextStep() { S.step >= C.presentation.length - 1 ? exitPresent() : goStep(S.step + 1); }
function prevStep() { goStep(S.step - 1); }

/* ------------------------------------------------------------------ */
/* 16 · PRINT                                                          */
/* ------------------------------------------------------------------ */
function buildPrint() {
  const t = totals(), v = validation();
  const isDay = S.shift === "day";
  const shiftAr = isDay ? "الخدمة النهارية" : "الخدمة الليلية";
  const dateStr = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });

  /* supervision sectors as translucent zones on the printed map */
  const sectorsSvg = C.supervisors.map(sp =>
    `<polygon points="${sp.polygon.map(pt => pt.join(",")).join(" ")}" fill="${sp.color}" fill-opacity=".13" stroke="${sp.color}" stroke-opacity=".85" stroke-width=".33" stroke-dasharray="1 .8"/>`).join("");

  const pm = C.securityPosts.map(p => {
    const n = p[S.shift]; const off = n === 0;
    return `<span class="pm ${off ? "pm-off" : ""} ${p.category === "entrance" ? "pm-ent" : ""}" style="inset-inline-start:${100 - p.x}%;top:${p.y}%">
      <i class="pm-pin">${off ? "×" : n}</i><i class="pm-lbl">${p.nameAr}</i></span>`;
  }).join("");
  const sm = C.supervisors.map(sp =>
    `<span class="pm pm-sup" style="inset-inline-start:${100 - sp.anchor.x}%;top:${sp.anchor.y}%;--sc:${sp.color}"><i class="pm-dia"><b class="lat">${sp.code}</b></i></span>`).join("");
  const am = C.assets.map(a => a.type === "mastaba"
    ? `<span class="pm pm-mas" style="inset-inline-start:${100 - a.x}%;top:${a.y}%"><i>${a.nameAr.replace(/\D/g, "")}</i></span>`
    : `<span class="pm pm-ind" style="inset-inline-start:${100 - a.x}%;top:${a.y}%"><i class="pm-pin"><svg><use href="#${a.icon}"/></svg></i><i class="pm-lbl">${a.nameAr}</i></span>`).join("");

  const groups = [...new Set(C.securityPosts.map(p => p.group))];
  let rows = "";
  groups.forEach(g => {
    rows += `<tr class="pgrp"><td colspan="5">${g}</td></tr>`;
    C.securityPosts.filter(p => p.group === g).forEach(p => {
      rows += `<tr>
        <td style="font-weight:700">${p.nameAr}</td>
        <td>${p.day || "—"}</td>
        <td class="${p.night ? "" : "off-td"}">${p.night || C.shiftRules.nightOffShort}</td>
        <td>${p.equipment.map(e => C.equipmentTypes[e].ar).join("، ") || "—"}</td>
        <td>${supervisorName(p.supervisor).replace("القيادة المباشرة — ", "")}</td>
      </tr>`;
    });
  });

  $("#printRoot").innerHTML = `
  <section class="pr-page p1">
    <header class="pr-band">
      <span class="pr-mark"><svg viewBox="0 0 24 24"><use href="#i-shield"/></svg></span>
      <div>
        <h1>${C.meta.titleAr} — ${C.meta.projectAr}</h1>
        <div class="sub lat">${C.meta.projectEn} · ${C.meta.titleEn} · ${C.meta.developerEn}</div>
      </div>
      <div class="pr-band-meta">
        <span class="pr-shift">${shiftAr} · ${isDay ? t.day : t.night} فرد أمن · ${t.supPerShift} مشرفين</span>
        <span>${dateStr}</span>
        <span class="pr-conf">سري · لمراجعة الإدارة — <span class="lat">CONFIDENTIAL</span></span>
      </div>
    </header>
    <div class="pr-mapwrap"><div class="pr-canvas" style="aspect-ratio:1/${C.meta.planAspect}">
      <img src="${C.meta.planImage}" alt="">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">${sectorsSvg}</svg>
      ${pm}${sm}${am}
    </div></div>
    <footer class="pr-mapfoot">
      <span class="lgi"><i class="pm-pin">1</i> نقطة خدمة · عدد الأفراد</span>
      <span class="lgi"><i class="pm-pin" style="background:#d64a26">1</i> مدخل</span>
      <span class="lgi"><i class="pm-pin" style="background:#b3afa4">×</i> ${C.shiftRules.nightOffShort}</span>
      <span class="lgi"><i class="pm-dia" style="--sc:#181b20"></i> مشرف قطاع</span>
      ${C.supervisors.map(sp => `<span class="lgi"><span class="lgsw" style="background:${sp.color}"></span> ${sp.nameAr.replace("مشرف ", "")}</span>`).join("")}
      <span class="lg-ok">✓ ${v.ok ? `توزيع الخدمات مطابق للقوة المعتمدة — نهاري ${t.day}/${v.e.dayOfficers} · ليلي ${t.night}/${v.e.nightOfficers} · حضور يومي ${t.daily}` : "راجع توزيع القوة"}</span>
      <span class="pr-note">${C.meta.positionsNote}</span>
    </footer>
  </section>

  <section class="pr-page p2">
    <header class="pr-band">
      <span class="pr-mark"><svg viewBox="0 0 24 24"><use href="#i-shield"/></svg></span>
      <div>
        <h1>مصفوفة الانتشار والقوة</h1>
        <div class="sub lat">DEPLOYMENT MATRIX · ${C.meta.projectEn}</div>
      </div>
      <div class="pr-band-meta"><span class="pr-shift">${shiftAr}</span><span>${dateStr}</span></div>
    </header>
    <div class="pr-stats">
      <div class="pr-stat hot"><b class="num">${t.daily}</b><span>أفراد الأمن · حضور يومي</span></div>
      <div class="pr-stat"><b class="num">${t.dailySup}</b><span>مشرفون · حضور يومي</span></div>
      <div class="pr-stat"><b class="num">${t.day}</b><span>الخدمة النهارية</span></div>
      <div class="pr-stat"><b class="num">${t.night}</b><span>الخدمة الليلية</span></div>
      <div class="pr-stat"><b class="num">${t.points}</b><span>نقطة / نطاق أمني</span></div>
    </div>
    <table class="pr-mx">
      <thead><tr><th style="width:24%">الموقع</th><th>الخدمة النهارية</th><th>الخدمة الليلية</th><th style="width:22%">التجهيز</th><th style="width:26%">المشرف المسؤول</th></tr></thead>
      <tbody>
        ${rows}
        <tr class="ptot"><td>إجمالي أفراد الأمن</td><td>${t.day} / ${v.e.dayOfficers}</td><td>${t.night} / ${v.e.nightOfficers}</td>
        <td colspan="2">${v.ok ? "✓ توزيع الخدمات مطابق للقوة المعتمدة — حضور يومي " + t.daily + " فرد" : "⚠ راجع التوزيع"}</td></tr>
      </tbody>
    </table>
    <div class="pr-h">حصر التجهيزات</div>
    <div class="pr-eqrow">
      ${Object.keys(C.equipmentInventory).map(k => `<span class="pr-eq"><svg><use href="#${C.equipmentTypes[k].icon}"/></svg> ${C.equipmentTypes[k].ar} <b>${C.equipmentInventory[k]}</b></span>`).join("")}
    </div>
    <div class="pr-h">نطاقات الإشراف — ${t.supPerShift} مشرفون لكل خدمة · ${t.dailySup} حضور يومي</div>
    <div class="pr-sups">
      ${C.supervisors.map(sp => `
        <div class="pr-sup" style="--sc:${sp.color}">
          <b>${sp.nameAr}</b>
          <span class="dty">${sp.duty}${sp.mobility ? " · " + C.equipmentTypes[sp.mobility].ar : ""}</span>
          <span class="cov">${sp.coverage.join(" · ")}</span>
        </div>`).join("")}
    </div>
    <div class="pr-h">القيادة والسيطرة</div>
    <div class="pr-cmd">
      مدير الأمن ← مدير العمليات ← 4 مشرفي قطاعات ← أفراد الأمن (${t.daily})
      <small>الدعم الإداري: 2 شئون إدارية · غرفة مراقبة وعمليات تعمل نهاراً وليلاً</small>
    </div>
    <div class="pr-foot">
      <span>${C.meta.positionsNote}</span>
      <span class="l lat">BAYMOUNT SECURITY OPERATIONS · ${C.meta.confidentialEn}</span>
    </div>
  </section>`;
}
function doPrint() { buildPrint(); setTimeout(() => window.print(), 60); }

/* ------------------------------------------------------------------ */
/* 17 · EDIT MODE (hidden)                                             */
/* ------------------------------------------------------------------ */
function setEdit(on) {
  S.editing = on;
  body.classList.toggle("editing", on);
  $("#editBar").hidden = !on;
  if (on) {
    if (S.view === "3d") setView("2d");
    toast("وضع التحرير مفعّل — اسحب العلامات لتعديل المواقع");
    enableDrag();
  }
}
let dragBound = false;
function enableDrag() {
  if (dragBound) return; dragBound = true;
  let target = null;
  markersEl.addEventListener("pointerdown", e => {
    if (!S.editing) return;
    const mk = e.target.closest(".marker");
    if (!mk) return;
    e.preventDefault(); e.stopPropagation();
    target = mk;
    mk.setPointerCapture && e.target.setPointerCapture(e.pointerId);
  }, true);
  window.addEventListener("pointermove", e => {
    if (!S.editing || !target) return;
    const r = tiltEl.getBoundingClientRect();
    const x = clamp(((e.clientX - r.left) / r.width) * 100, 0, 100);
    const y = clamp(((e.clientY - r.top) / r.height) * 100, 0, 100);
    target.style.setProperty("--x", x.toFixed(1) + "%");
    target.style.setProperty("--y", y.toFixed(1) + "%");
    const id = target.dataset.id;
    $("#ebXY").textContent = `${id} · x:${x.toFixed(1)} y:${y.toFixed(1)}`;
    const p = postById(id); const a = assetById(id); const s = supById(id);
    if (p) { p.x = +x.toFixed(1); p.y = +y.toFixed(1); }
    else if (a) { a.x = +x.toFixed(1); a.y = +y.toFixed(1); }
    else if (s) { s.anchor.x = +x.toFixed(1); s.anchor.y = +y.toFixed(1); }
  });
  window.addEventListener("pointerup", () => { target = null; });
}
function coordsJSON() {
  const out = { securityPosts: {}, assets: {}, supervisorAnchors: {} };
  C.securityPosts.forEach(p => out.securityPosts[p.id] = { x: p.x, y: p.y });
  C.assets.forEach(a => out.assets[a.id] = { x: a.x, y: a.y });
  C.supervisors.forEach(s => out.supervisorAnchors[s.id] = { ...s.anchor });
  return JSON.stringify(out, null, 2);
}
function downloadData() {
  const txt = "/* BAYMOUNT SECURITY OPERATIONS — generated from edit mode */\n" +
    "const BAYMOUNT_CONFIG = " + JSON.stringify(C, null, 2) + ";\n" +
    'if (typeof module !== "undefined" && module.exports) { module.exports = BAYMOUNT_CONFIG; }\n';
  const url = URL.createObjectURL(new Blob([txt], { type: "text/javascript" }));
  const a = document.createElement("a");
  a.href = url; a.download = "data.js"; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  toast("تم تجهيز ملف data.js — استبدل به الملف داخل js/");
}
async function copyCoords() {
  const txt = coordsJSON();
  try { await navigator.clipboard.writeText(txt); toast("تم نسخ الإحداثيات إلى الحافظة"); }
  catch (e) {
    const ta = document.createElement("textarea");
    ta.value = txt; document.body.appendChild(ta); ta.select();
    document.execCommand("copy"); ta.remove(); toast("تم نسخ الإحداثيات");
  }
}

/* ------------------------------------------------------------------ */
/* 18 · INTRO                                                          */
/* ------------------------------------------------------------------ */
function runIntro(skip) {
  const intro = $("#intro");
  const t = totals();
  const vals = { dailyOfficers: t.daily, dailySupervisors: t.dailySup, day: t.day, night: t.night, perShiftSup: t.supPerShift };
  if (skip) { intro.remove(); $("#app").classList.add("on"); requestAnimationFrame(() => { computeFit(); camHome(false); }); return; }
  $$("#intro [data-count]").forEach(el => {
    setTimeout(() => animNum(el, vals[el.dataset.count], 1300), 500);
  });
  let entered = false;
  const enter = () => {
    if (entered) return; entered = true;
    intro.classList.add("leaving");
    $("#app").classList.add("on");
    computeFit(); camHome(false);
    /* gentle establishing move */
    S.cam.k = 0.94; S.cam.x += S.fit.w * 0.03; S.cam.y += S.fit.h * 0.02; applyCam();
    setTimeout(() => camHome(true), 120);
    setTimeout(() => intro.remove(), 1100);
  };
  /* enter ONLY on user action — a press anywhere, the button, or Enter */
  intro.addEventListener("click", enter);
  document.addEventListener("keydown", function onK(e) {
    if (e.key === "Enter" || e.key === " ") { document.removeEventListener("keydown", onK); enter(); }
  });
}

/* ------------------------------------------------------------------ */
/* 19 · WIRING + INIT                                                  */
/* ------------------------------------------------------------------ */
function wire() {
  $("#btnDay").addEventListener("click", () => setShift("day"));
  $("#btnNight").addEventListener("click", () => setShift("night"));
  $("#btnView2d").addEventListener("click", () => setView("2d"));
  $("#btnView3d").addEventListener("click", () => setView("3d"));
  $("#btnFocusServices").addEventListener("click", () => setFocus("services"));
  $("#btnFocusSup").addEventListener("click", () => setFocus("supervision"));
  $("#btnMatrix").addEventListener("click", () => openSheet("matrixSheet"));
  $("#btnMgmt").addEventListener("click", () => openSheet("mgmtSheet"));
  $("#btnPrint").addEventListener("click", doPrint);
  $("#btnPresent").addEventListener("click", startPresent);
  $("#detailClose").addEventListener("click", clearSelection);
  $$("[data-close]").forEach(b => b.addEventListener("click", () => $("#" + b.dataset.close).classList.remove("open")));
  $$(".sheet").forEach(sh => sh.addEventListener("click", e => { if (e.target === sh) sh.classList.remove("open"); }));
  $("#tiltRange").addEventListener("input", e => { if (S.view === "3d") applyTilt(+e.target.value); });
  $("#pbNext").addEventListener("click", nextStep);
  $("#pbPrev").addEventListener("click", prevStep);
  $("#pbExit").addEventListener("click", exitPresent);
  $("#ebExit").addEventListener("click", () => setEdit(false));
  $("#ebCopy").addEventListener("click", copyCoords);
  $("#ebDownload").addEventListener("click", downloadData);
  $("#posNote").innerHTML = icon("i-eye") + " " + C.meta.positionsNote;

  /* hidden edit mode: Ctrl+Shift+E or triple-click brand */
  let clicks = 0, clkT;
  $("#brand").addEventListener("click", () => {
    clicks++; clearTimeout(clkT); clkT = setTimeout(() => clicks = 0, 600);
    if (clicks >= 3) { clicks = 0; setEdit(!S.editing); }
  });
  document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.shiftKey && (e.key === "E" || e.key === "e")) { e.preventDefault(); setEdit(!S.editing); }
    if (S.presenting) {
      if (e.key === "ArrowLeft" || e.key === " ") { e.preventDefault(); nextStep(); }
      if (e.key === "ArrowRight") { e.preventDefault(); prevStep(); }
      if (e.key === "Escape") exitPresent();
      return;
    }
    if (e.key === "Escape") { closeSheets(); clearSelection(); $("#searchResults").innerHTML = ""; }
  });
  window.addEventListener("beforeprint", buildPrint);
  stage.addEventListener("click", e => {
    if (e.target.closest(".m-body, .float, #detail, .sector, #presentBar, #presentCard, #editBar")) return;
    if (!S.presenting && S.sel) clearSelection();
  });
}

function init() {
  /* hardened: whatever happens, the intro must never deadlock the app */
  try {
    $("#plan").src = C.meta.planImage;
    buildOverlay();
    buildMarkers();
    buildLayers();
    buildLegend();
    buildSearch();
    wire();
    initCamera();
    renderValidation();
    setShift("day", { force: true });
    setView("2d");
    setFocus("services");
  } catch (err) { try { console.error("BSO init:", err); } catch (e) {} }
  const hash = location.hash;
  const skip = hash === "#app" || hash === "#edit" || hash === "#present";
  try { runIntro(skip); }
  catch (err) { const i = $("#intro"); if (i) i.remove(); $("#app").classList.add("on"); }
  if (hash === "#edit") setEdit(true);
  if (hash === "#present") setTimeout(startPresent, 400);
}

document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();

/* Public API — used by tests and power users */
window.BSO = {
  config: C, state: S, totals, validation,
  setShift, setView, setFocus, setLayer, flyTo, camHome,
  selectPost, selectSupervisor, selectAsset,
  startPresent, exitPresent, goStep, nextStep,
  openSheet, closeSheets, setEdit, doPrint: () => { buildPrint(); }
};
})();

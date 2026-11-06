/* Stockton Pharmacy: cinematic home page scroll engine.
   Drives the pinned film captions, the word-by-word statement, the photos that
   open to full screen, the sideways services track and the count-ups.
   The 3D film itself (cinema3d.js) reads window.solaceFilm.p every frame. */
(function () {
  const root = document.documentElement;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  root.classList.add("cine");
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const prog = el => { const r = el.getBoundingClientRect(), span = r.height - innerHeight; return span > 0 ? clamp(-r.top / span) : clamp(1 - r.top / innerHeight); };
  const inView = el => { const r = el.getBoundingClientRect(); return r.bottom > -50 && r.top < innerHeight + 50; };
  window.solaceFilm = { p: 0 };

  /* ---------- film captions ---------- */
  const film = document.getElementById("film");
  const caps = film ? [...film.querySelectorAll(".cap")].map(el => ({ el, a: +el.dataset.in, b: +el.dataset.out })) : [];
  const FADE = 0.035;
  const fades = film ? [...film.querySelectorAll("[data-fade]")] : [];
  function drawFilm() {
    const p = prog(film); window.solaceFilm.p = p;
    film.style.setProperty("--fp", p.toFixed(4));
    film.classList.toggle("moving", p > 0.01);
    fades.forEach(el => { const v = 1 - ease(clamp(p / 0.07)); el.style.setProperty("--da", v.toFixed(3)); el.classList.toggle("gone", v < 0.3); });
    caps.forEach(({ el, a, b }, i) => {
      let v = i === 0 ? (p < b - FADE ? 1 : clamp((b - p) / FADE)) : Math.min(clamp((p - a) / FADE), b > 1 ? 1 : clamp((b - p) / FADE));
      v = ease(v);
      el.style.setProperty("--a", v.toFixed(3));
      el.classList.toggle("on", v > 0.6);
    });
  }

  /* ---------- statement: words light up in reading order ---------- */
  const statements = [...document.querySelectorAll("[data-words]")].map(el => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(" ");
    return { sec: el.closest(".statement"), words: [...el.querySelectorAll(".w")] };
  });
  function drawStatements() {
    statements.forEach(({ sec, words }) => {
      if (!inView(sec)) return;
      const p = clamp(prog(sec) * 1.25 - 0.05), n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle("lit", i < n));
    });
  }

  /* ---------- photos open from a card to (nearly) full screen ---------- */
  const unfolds = [...document.querySelectorAll(".unfold")].map(sec => ({ sec, stage: sec.querySelector(".unfold-stage") }));
  function drawUnfolds() {
    const vw = innerWidth, vh = innerHeight, mobile = vw < 760;
    const W1 = Math.min(vw - (mobile ? 0 : 2 * 24), 1600), H1 = mobile ? vh : vh - 2 * 24;
    unfolds.forEach(({ sec, stage }) => {
      if (!inView(sec)) return;
      const p = prog(sec), k = ease(clamp(p / 0.55));
      const w0 = mobile ? vw * 0.78 : Math.min(vw * 0.42, 620), h0 = mobile ? vh * 0.46 : vh * 0.5;
      const w = w0 + (W1 - w0) * k, h = h0 + (H1 - h0) * k;
      stage.style.setProperty("--cl", Math.max(0, (vw - w) / 2).toFixed(1) + "px");
      stage.style.setProperty("--ct", Math.max(0, (vh - h) / 2).toFixed(1) + "px");
      stage.style.setProperty("--ur", (32 - (mobile ? 32 : 8) * k).toFixed(1) + "px");
      stage.style.setProperty("--us", (1.28 - 0.26 * k + p * 0.06).toFixed(4));
      stage.style.setProperty("--ud", clamp((p - 0.3) / 0.3).toFixed(3));
      stage.style.setProperty("--uc", ease(clamp((p - 0.42) / 0.2)).toFixed(3));
    });
  }

  /* ---------- services slide sideways while you scroll down ---------- */
  const hs = [...document.querySelectorAll(".hscroll")].map(sec => ({ sec, stage: sec.querySelector(".hscroll-stage"), track: sec.querySelector(".hscroll-track") }));
  function sizeH() {
    hs.forEach(h => { h.dist = Math.max(0, h.track.scrollWidth - innerWidth); h.sec.style.height = (innerHeight + h.dist * 1.1 + innerHeight * 0.3) + "px"; });
  }
  function drawH() {
    hs.forEach(h => { if (!inView(h.sec)) return; const p = clamp((prog(h.sec) - 0.08) / 0.84); h.stage.style.setProperty("--hx", (ease(p) * h.dist).toFixed(1)); });
  }

  /* ---------- count-ups and gentle rises ---------- */
  const counts = [...document.querySelectorAll("[data-count]")];
  const cio = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; cio.unobserve(en.target);
    const el = en.target, end = +el.dataset.count, dec = +(el.dataset.dec || 0), t0 = performance.now();
    const step = t => { const k = ease(clamp((t - t0) / 1600)); el.textContent = (end * k).toFixed(dec); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  counts.forEach(el => cio.observe(el));
  const rises = [...document.querySelectorAll(".page-index .pack, .page-index .dock--float a, .page-index .fact, .page-index .form-tile, .page-index .faq details, .page-index .section-head, .closing-in > *")];
  rises.forEach((el, i) => { el.classList.add("rise"); el.style.setProperty("--d", ((i % 5) * 70) + "ms"); });
  const rio = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); rio.unobserve(en.target); } }), { rootMargin: "0px 0px -10% 0px" });
  rises.forEach(el => rio.observe(el));

  /* ---------- one frame loop for everything ---------- */
  let queued = false;
  const frame = () => { queued = false; if (film) drawFilm(); drawStatements(); drawUnfolds(); drawH(); };
  const req = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
  addEventListener("scroll", req, { passive: true });
  addEventListener("resize", () => { sizeH(); req(); });
  sizeH(); frame();
  if (document.fonts) document.fonts.ready.then(() => { sizeH(); req(); });
})();

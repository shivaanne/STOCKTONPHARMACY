/* Stockton Pharmacy — shared 3D building blocks (Three.js r160)
   Used by story3d.js (home hero) and page3d.js (inner page heroes). */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
export { THREE };
window.__solace3d = true;   // the 3D library loaded; photos stay hidden

export const clamp = (x, a = 0, b = 1) => Math.min(Math.max(x, a), b);
export const ease = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const range = (p, a, b) => ease((p - a) / (b - a));
export const lerp = (a, b, k) => a + (b - a) * k;
export const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
export function webglOK() {
  try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); }
  catch (e) { return false; }
}

/* Renderer + scene + cinematic lights */
export async function setup(stage, { fov = 32, exposure = 1.1 } = {}) {
  if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) {} }
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.domElement.setAttribute("aria-hidden", "true");
  stage.appendChild(renderer.domElement);
  stage.classList.add("has-3d");
  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 120);
  scene.add(new THREE.HemisphereLight(0xdfe9ff, 0x0b1a33, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.35); key.position.set(3, 7, 8); scene.add(key);
  const dawn = new THREE.DirectionalLight(0xffb45a, 2.0); dawn.position.set(-6, 1.5, -6); scene.add(dawn);   // warm rim from behind
  const leaf = new THREE.DirectionalLight(0x6fe39a, 0.9); leaf.position.set(7, -1, 4); scene.add(leaf);
  const fns = [];
  const resize = () => {
    const w = stage.clientWidth || 1, h = stage.clientHeight || 1;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    fns.forEach(f => f(w, h));
  };
  new ResizeObserver(resize).observe(stage);
  return { renderer, scene, camera, onResize: f => { fns.push(f); resize(); } };
}

export function run(watchEl, frame) {
  let visible = true, running = false;
  const clock = new THREE.Clock();
  const start = () => {
    if (running) return; running = true;
    const tick = () => { if (!visible || document.hidden) { running = false; return; } frame(clock.getElapsedTime()); requestAnimationFrame(tick); };
    tick();
  };
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) start(); }, { rootMargin: "120px" }).observe(watchEl);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) start(); });
  start();
}

export function pointer() {
  const p = { x: 0, y: 0, tx: 0, ty: 0, step() { this.x += (this.tx - this.x) * 0.05; this.y += (this.ty - this.y) * 0.05; } };
  addEventListener("pointermove", e => { p.tx = e.clientX / innerWidth - 0.5; p.ty = e.clientY / innerHeight - 0.5; }, { passive: true });
  return p;
}

/* ---------- Materials ---------- */
const pm = c => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.18 });
export const MAT = {
  navy: new THREE.MeshStandardMaterial({ color: 0x12284B, roughness: 0.38 }),
  capWhite: new THREE.MeshPhysicalMaterial({ color: 0xF6F8FA, roughness: 0.35, clearcoat: 0.6 }),
  amber: new THREE.MeshPhysicalMaterial({ color: 0xC0640E, roughness: 0.06, transmission: 0.55, thickness: 0.6, ior: 1.45, clearcoat: 1, clearcoatRoughness: 0.04, transparent: true, opacity: 0.94, attenuationColor: new THREE.Color(0x7A3A05), attenuationDistance: 1.2 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.03, transmission: 0.9, thickness: 0.3, ior: 1.5, transparent: true, opacity: 0.6, clearcoat: 1 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xCED6DE, metalness: 1, roughness: 0.18 }),
  board: new THREE.MeshStandardMaterial({ color: 0x8B5A2B, roughness: 0.7 }),
  green: pm(0x2E9E57), white: pm(0xF4F6F8), blue: pm(0x1F4E8C), sky: pm(0x8EC3EA), gold: pm(0xF2B45A), pink: pm(0xE79AA8), coral: pm(0xE9774E)
};

export function capsule(len, rad, a, b) {
  const g = new THREE.Group(), half = len / 2 - rad;
  const t = new THREE.Mesh(new THREE.CapsuleGeometry(rad, half, 8, 20), a); t.position.y = half / 2;
  const u = new THREE.Mesh(new THREE.CapsuleGeometry(rad * 0.97, half, 8, 20), b); u.position.y = -half / 2;
  g.add(t, u); return g;
}
export function tablet(rad, thick, m) {
  const g = new THREE.Group();
  const t = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, thick, 36), m); t.rotation.x = Math.PI / 2; g.add(t);
  const c = new THREE.Mesh(new THREE.SphereGeometry(rad, 36, 10, 0, Math.PI * 2, 0, Math.PI / 2), m);
  c.rotation.x = Math.PI / 2; c.scale.set(1, 1, 0.25); c.position.z = thick / 2; g.add(c);
  const c2 = c.clone(); c2.rotation.x = -Math.PI / 2; c2.position.z = -thick / 2; g.add(c2);
  return g;
}
const PILL_KINDS = [
  s => capsule(0.9 * s, 0.2 * s, MAT.green, MAT.white), s => capsule(0.8 * s, 0.18 * s, MAT.blue, MAT.sky),
  s => tablet(0.32 * s, 0.16 * s, MAT.white), s => capsule(0.75 * s, 0.17 * s, MAT.coral, MAT.gold),
  s => tablet(0.26 * s, 0.14 * s, MAT.pink), s => tablet(0.22 * s, 0.13 * s, MAT.gold)
];
export function randomPill(i, s = 1) { return PILL_KINDS[i % PILL_KINDS.length](s); }

/* Drifting pills; returns { group, items, step(t) } */
export function pillCloud(count = 10, spread = [10, 7, 5], seed = 1, scale = 1) {
  const g = new THREE.Group(); const items = [];
  let s = seed; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < count; i++) {
    const m = randomPill(i, scale);
    const b = new THREE.Vector3((rnd() - .5) * spread[0], (rnd() - .5) * spread[1], -rnd() * spread[2]);
    m.position.copy(b); m.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
    m.userData = { b, ph: rnd() * 6, sp: 0.3 + rnd() * 0.4 };
    g.add(m); items.push(m);
  }
  return { group: g, items, step(t) {
    items.forEach((m, i) => {
      const u = m.userData;
      m.position.y = u.b.y + Math.sin(t * u.sp + u.ph) * 0.35;
      m.position.x = u.b.x + Math.cos(t * u.sp * 0.6 + u.ph) * 0.2;
      m.rotation.x = t * 0.25 * u.sp + i; m.rotation.y = t * 0.3 * u.sp + i;
    });
  } };
}

/* ---------- Rx vial (amber, child-resistant cap, Stockton label) ---------- */
export function rxVial(lines = ["Stockton Pharmacy", "Take as directed", "Stockton, CA"]) {
  const g = new THREE.Group();
  const R = 0.9, H = 2.6;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 0.96, H, 64, 1, true), MAT.amber); body.position.y = H / 2; g.add(body);
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(R * 0.96, 64), MAT.amber); bottom.rotation.x = Math.PI / 2; g.add(bottom);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(R * 1.0, 0.05, 12, 64), MAT.amber); lip.rotation.x = Math.PI / 2; lip.position.y = H; g.add(lip);
  // label wraps ~2/3 of the vial
  const label = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.012, R * 0.975, H * 0.56, 64, 1, true, -1.9, 3.8),
    new THREE.MeshStandardMaterial({ map: vialLabel(lines), roughness: 0.6 }));
  label.position.y = H * 0.47; g.add(label);
  // cap with grip ridges
  const cap = new THREE.Group();
  const top = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.1, R * 1.1, 0.5, 64), MAT.capWhite); cap.add(top);
  const ridges = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.12, R * 1.12, 0.36, 64, 1, true),
    new THREE.MeshStandardMaterial({ map: ridgeTexture(), roughness: 0.5, color: 0xffffff })); cap.add(ridges);
  const crown = new THREE.Mesh(new THREE.CircleGeometry(R * 1.1, 64), new THREE.MeshStandardMaterial({ map: capTopTexture(), roughness: 0.4 }));
  crown.rotation.x = -Math.PI / 2; crown.position.y = 0.251; cap.add(crown);
  cap.position.y = H + 0.22; g.add(cap);
  // a few pills inside
  const inner = new THREE.Group();
  for (let i = 0; i < 9; i++) { const p = randomPill(i, 0.75); p.position.set(Math.cos(i * 2.1) * 0.45, 0.25 + i * 0.16, Math.sin(i * 2.1) * 0.45); p.rotation.set(i, i * 1.7, i * 0.6); inner.add(p); }
  g.add(inner);
  g.userData = { cap, H, inner };
  return g;
}
function vialLabel([a, b, c3]) {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 512;
  const g = c.getContext("2d");
  g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, 1024, 512);
  g.fillStyle = "#0F2147"; g.fillRect(0, 0, 1024, 120);
  g.fillStyle = "#3DAA4A"; g.beginPath(); g.ellipse(250, 60, 16, 30, 0.6, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#fff"; g.font = '900 54px "Arial Black", Arial, sans-serif'; g.textBaseline = "middle"; g.fillText(a, 280, 64);
  g.fillStyle = "#0F2147"; g.font = '700 30px Arial, sans-serif';
  g.fillText("Rx# 000000      Qty: 30      Refills: 3", 270, 180);
  g.font = '900 52px "Arial Black", Arial, sans-serif'; g.fillText(b, 270, 262);
  g.font = '700 28px Arial, sans-serif'; g.fillStyle = "#4E5D72"; g.fillText("Free local delivery · 209-868-1555", 270, 340);
  g.fillStyle = "#2E9E57"; g.fillRect(270, 390, 480, 8);
  g.fillStyle = "#4E5D72"; g.font = '700 26px Arial, sans-serif'; g.fillText(c3, 270, 440);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function ridgeTexture() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 32;
  const g = c.getContext("2d"); g.fillStyle = "#F3F5F8"; g.fillRect(0, 0, 512, 32);
  for (let x = 0; x < 512; x += 8) { g.fillStyle = "#C9D2DC"; g.fillRect(x, 0, 3, 32); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function capTopTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 512;
  const g = c.getContext("2d"); g.fillStyle = "#F6F8FA"; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "#C9D2DC"; g.lineWidth = 6; g.beginPath(); g.arc(256, 256, 200, 0, Math.PI * 2); g.stroke();
  g.fillStyle = "#0F2147"; g.font = '700 44px Arial, sans-serif'; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText("PUSH DOWN", 256, 216); g.fillText("& TURN", 256, 274);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ---------- Bubble (multi-dose) cards ---------- */
export const CARD = (() => {
  const W = 4.2, H = 6.0;
  const cols = ["Morning", "Noon", "Evening", "Bedtime"], days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const colX = i => -W / 2 + 1.18 + i * 0.8, rowY = j => H / 2 - 1.76 - j * 0.62;
  let shared = null;
  const lazy = () => {
    if (shared) return shared;
    const shape = roundedRect(W, H, 0.28);
    const tex = faceTexture({ W, H, cols, days, colX, rowY }); tex.repeat.set(1 / W, 1 / H); tex.offset.set(0.5, 0.5);
    const dome = new THREE.SphereGeometry(0.27, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2); dome.rotateX(Math.PI / 2); dome.scale(1, 1, 0.72);
    shared = {
      faceGeo: new THREE.ShapeGeometry(shape, 24),
      bodyGeo: new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 }),
      bodyMat: new THREE.MeshStandardMaterial({ color: 0xE6ECF2, roughness: 0.6 }),
      faceMat: new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }),
      dome, domeMat: new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, roughness: 0.04, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false })
    };
    return shared;
  };
  const shell = () => {
    const s = lazy(), g = new THREE.Group();
    const b = new THREE.Mesh(s.bodyGeo, s.bodyMat); b.position.z = -0.13; g.add(b);
    const f = new THREE.Mesh(s.faceGeo, s.faceMat); f.position.z = 0.002; g.add(f);
    return g;
  };
  const regimen = [
    () => [capsule(0.34, 0.075, MAT.green, MAT.white), tablet(0.1, 0.06, MAT.white)],
    () => [tablet(0.11, 0.07, MAT.gold)],
    () => [capsule(0.34, 0.075, MAT.blue, MAT.sky), tablet(0.085, 0.06, MAT.pink)],
    () => [tablet(0.09, 0.06, MAT.coral)]
  ];
  const filled = () => {
    const s = lazy(), card = shell(), pills = [], wells = [];
    for (let j = 0; j < days.length; j++) for (let i = 0; i < cols.length; i++) {
      const x = colX(i), y = rowY(j);
      wells.push(new THREE.Vector3(x, y, 0.1));
      const d = new THREE.Mesh(s.dome, s.domeMat); d.position.set(x, y, 0.01); d.renderOrder = 2; card.add(d);
      const set = regimen[i]();
      set.forEach((p, k) => {
        const n = set.length;
        p.position.set(x + (n > 1 ? (k ? 0.1 : -0.07) : 0), y + (n > 1 ? (k ? -0.06 : 0.03) : 0), 0.08);
        p.rotation.z = n > 1 && !k ? 0.9 : (j * 1.7 + i) % 3;
        p.userData.order = (j * 4 + i) / 28;
        card.add(p); pills.push(p);
      });
    }
    return { card, pills, wells };
  };
  return { W, H, shell, filled };
})();
function faceTexture({ W, H, cols, days, colX, rowY }) {
  const S = 220, cw = Math.round(W * S), ch = Math.round(H * S);
  const c = document.createElement("canvas"); c.width = cw; c.height = ch;
  const g = c.getContext("2d");
  const X = x => (x + W / 2) * S, Y = y => (H / 2 - y) * S;
  g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, cw, ch);
  g.fillStyle = "#0F2147"; g.fillRect(0, 0, cw, 0.85 * S);
  g.fillStyle = "#3DAA4A"; g.beginPath(); g.ellipse(0.42 * S, 0.42 * S, 0.1 * S, 0.2 * S, 0.6, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#FFFFFF"; g.font = `900 ${0.28 * S}px "Arial Black", Arial, sans-serif`; g.textBaseline = "middle";
  g.fillText("Stockton", 0.66 * S, 0.34 * S);
  g.font = `700 ${0.16 * S}px Arial, sans-serif`; g.fillStyle = "#99F6E4";
  g.fillText("Multi-dose pack  ·  Stockton, CA", 0.66 * S, 0.64 * S);
  g.fillStyle = "#E6F3EA"; g.fillRect(0, 0.85 * S, cw, 0.3 * S);
  g.fillStyle = "#1F7A3C"; g.font = `700 ${0.16 * S}px Arial, sans-serif`;
  g.fillText("Resident: ________     Week of: ________", 0.3 * S, 1.0 * S);
  g.textAlign = "center"; g.fillStyle = "#0F2147"; g.font = `700 ${0.14 * S}px Arial, sans-serif`;
  cols.forEach((n, i) => g.fillText(n, X(colX(i)), Y(rowY(0) + 0.45)));
  days.forEach((d, j) => {
    const y = Y(rowY(j));
    if (j % 2 === 0) { g.fillStyle = "#F3F6F9"; g.fillRect(0, y - 0.31 * S, cw, 0.62 * S); }
    g.fillStyle = "#4E5D72"; g.textAlign = "left"; g.font = `700 ${0.17 * S}px Arial, sans-serif`; g.fillText(d, 0.25 * S, y);
    cols.forEach((n, i) => {
      g.beginPath(); g.arc(X(colX(i)), y, 0.29 * S, 0, Math.PI * 2);
      g.fillStyle = "#FFFFFF"; g.fill(); g.lineWidth = 3; g.strokeStyle = i === 0 ? "#2E9E57" : i === 3 ? "#0F2147" : "#C9D4DF"; g.stroke();
    });
  });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
export function roundedRect(W, H, R) {
  const s = new THREE.Shape();
  s.moveTo(-W / 2 + R, -H / 2); s.lineTo(W / 2 - R, -H / 2); s.quadraticCurveTo(W / 2, -H / 2, W / 2, -H / 2 + R);
  s.lineTo(W / 2, H / 2 - R); s.quadraticCurveTo(W / 2, H / 2, W / 2 - R, H / 2); s.lineTo(-W / 2 + R, H / 2);
  s.quadraticCurveTo(-W / 2, H / 2, -W / 2, H / 2 - R); s.lineTo(-W / 2, -H / 2 + R); s.quadraticCurveTo(-W / 2, -H / 2, -W / 2 + R, -H / 2);
  return s;
}

/* ---------- Cloud floor: soft drifting mist under the product ---------- */
export function cloudFloor({ count = 260, width = 30, depth = 16, y = -2.8, color = 0xC9D6E6 } = {}) {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d"), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,.95)"); gr.addColorStop(0.4, "rgba(255,255,255,.45)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  const geo = new THREE.BufferGeometry(), pos = new Float32Array(count * 3), base = [];
  for (let i = 0; i < count; i++) {
    const b = [(Math.random() - .5) * width, y + Math.random() * 0.9 - (Math.random() < .3 ? 0.6 : 0), -Math.random() * depth + 4];
    base.push(b); pos.set(b, i * 3);
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ size: 3.4, map: tex, color, transparent: true, opacity: 0.32, depthWrite: false, sizeAttenuation: true });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false;
  return { points: pts, mat, step(t) {
    for (let i = 0; i < count; i++) {
      const b = base[i]; let x = b[0] + t * 0.18;
      x = ((x + width / 2) % width + width) % width - width / 2;
      pos[i * 3] = x; pos[i * 3 + 1] = b[1] + Math.sin(t * 0.3 + i) * 0.08;
    }
    geo.attributes.position.needsUpdate = true;
  } };
}

/* ---------- Vaccine: syringe + glass vial ---------- */
export function syringe() {
  const g = new THREE.Group();
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 3.2, 48, 1, true), MAT.glass); g.add(barrel);
  const fluid = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.5, 40), new THREE.MeshPhysicalMaterial({ color: 0x9FD8F2, transmission: 0.6, roughness: 0.1, transparent: true, opacity: 0.85 }));
  fluid.position.y = -0.8; g.add(fluid);
  const stopper = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.22, 40), MAT.navy); stopper.position.y = -0.02; g.add(stopper);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.0, 16), MAT.capWhite); rod.position.y = 1.0; g.add(rod);
  const thumb = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 40), MAT.capWhite); thumb.position.y = 2.0; g.add(thumb);
  const flange = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.5), MAT.capWhite); flange.position.y = 1.6; g.add(flange);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.32, 0.35, 32), MAT.green); hub.position.y = -1.77; g.add(hub);
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.4, 8), MAT.steel); needle.position.y = -2.64; g.add(needle);
  // printed scale on the barrel
  const sc = document.createElement("canvas"); sc.width = 256; sc.height = 512; const sg = sc.getContext("2d");
  sg.clearRect(0, 0, 256, 512); sg.fillStyle = "#0F2147";
  for (let i = 0; i <= 20; i++) { const y = 40 + i * 21; sg.fillRect(110, y, i % 5 ? 30 : 60, 4); }
  const st = new THREE.CanvasTexture(sc); st.colorSpace = THREE.SRGBColorSpace;
  const scale = new THREE.Mesh(new THREE.CylinderGeometry(0.325, 0.325, 2.6, 48, 1, true, -0.6, 1.2), new THREE.MeshBasicMaterial({ map: st, transparent: true, depthWrite: false }));
  scale.position.y = -0.2; g.add(scale);
  return g;
}
export function vaccineVial() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.3, 48), MAT.glass); body.position.y = 0.65; g.add(body);
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.8, 40), new THREE.MeshPhysicalMaterial({ color: 0xF4E7C8, transmission: 0.5, roughness: 0.15, transparent: true, opacity: 0.9 }));
  liquid.position.y = 0.45; g.add(liquid);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 0.25, 40), MAT.glass); neck.position.y = 1.42; g.add(neck);
  const crimp = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.2, 40), MAT.steel); crimp.position.y = 1.62; g.add(crimp);
  const flip = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 40), MAT.blue); flip.position.y = 1.78; g.add(flip);
  const lc = document.createElement("canvas"); lc.width = 512; lc.height = 256; const lg = lc.getContext("2d");
  lg.fillStyle = "#fff"; lg.fillRect(0, 0, 512, 256); lg.fillStyle = "#1F4E8C"; lg.fillRect(0, 0, 512, 60);
  lg.fillStyle = "#fff"; lg.font = '900 34px "Arial Black", Arial'; lg.fillText("VACCINE", 30, 42);
  lg.fillStyle = "#0F2147"; lg.font = '700 28px Arial'; lg.fillText("0.5 mL single dose", 30, 120); lg.fillText("Stockton Pharmacy", 30, 180);
  const lt = new THREE.CanvasTexture(lc); lt.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.7, 48, 1, true, -1.5, 3), new THREE.MeshStandardMaterial({ map: lt }));
  label.position.y = 0.7; g.add(label);
  return g;
}

/* ---------- Forms: clipboard with a filled form + pen ---------- */
export function clipboard() {
  const g = new THREE.Group();
  const board = new THREE.Mesh(new THREE.BoxGeometry(3.4, 4.6, 0.12), MAT.board); g.add(board);
  const pc = document.createElement("canvas"); pc.width = 600; pc.height = 800; const p = pc.getContext("2d");
  p.fillStyle = "#fff"; p.fillRect(0, 0, 600, 800);
  p.fillStyle = "#0F2147"; p.fillRect(0, 0, 600, 110);
  p.fillStyle = "#3DAA4A"; p.beginPath(); p.ellipse(52, 55, 12, 24, 0.6, 0, Math.PI * 2); p.fill();
  p.fillStyle = "#fff"; p.font = '900 34px "Arial Black", Arial'; p.fillText("Stockton", 78, 52); p.font = '700 22px Arial'; p.fillText("New patient registration", 80, 88);
  const rows = ["Full name", "Date of birth", "Phone", "Address", "Insurance", "Allergies", "Medications"];
  rows.forEach((r, i) => {
    const y = 170 + i * 80; p.fillStyle = "#4E5D72"; p.font = '700 20px Arial'; p.fillText(r, 40, y);
    p.strokeStyle = "#C9D4DF"; p.lineWidth = 2; p.beginPath(); p.moveTo(40, y + 30); p.lineTo(560, y + 30); p.stroke();
    p.fillStyle = "#2E9E57"; p.fillRect(40, y + 14, 120 + ((i * 97) % 260), 6);
  });
  p.strokeStyle = "#0F2147"; p.lineWidth = 3; p.beginPath(); p.moveTo(320, 760); p.bezierCurveTo(360, 700, 380, 790, 420, 730); p.bezierCurveTo(440, 700, 470, 780, 540, 740); p.stroke();
  const pt = new THREE.CanvasTexture(pc); pt.colorSpace = THREE.SRGBColorSpace; pt.anisotropy = 8;
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 4.0), new THREE.MeshStandardMaterial({ map: pt, roughness: 0.8 }));
  paper.position.set(0, -0.15, 0.065); g.add(paper);
  const clip = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 0.18), MAT.steel); clip.position.set(0, 2.15, 0.1); g.add(clip);
  const pen = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 24), MAT.navy); pen.add(shaft);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 24), MAT.steel); tip.position.y = -1.45; tip.rotation.x = Math.PI; pen.add(tip);
  const clipP = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.8, 0.06), MAT.green); clipP.position.set(0.08, 0.8, 0); pen.add(clipP);
  pen.position.set(1.9, -0.6, 0.6); pen.rotation.z = 0.5; g.add(pen);
  g.userData.pen = pen;
  return g;
}

/* ---------- Logo coin (for the contact page) ---------- */
export async function logoCoin(src) {
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const c = document.createElement("canvas"); c.width = 2048; c.height = 1280; const g = c.getContext("2d");
  g.fillStyle = "#fff"; g.beginPath(); g.ellipse(1024, 640, 1024, 640, 0, 0, Math.PI * 2); g.fill(); g.drawImage(img, 0, 0, 2048, 1280);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16;
  const grp = new THREE.Group(), AX = 1.6;
  const rimMat = new THREE.MeshPhysicalMaterial({ color: 0x1B3A6B, metalness: 0.85, roughness: 0.22, clearcoat: 1 });
  const edge = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.2, 128, 1, true), rimMat); edge.rotation.x = Math.PI / 2; edge.scale.set(AX, 1, 1); grp.add(edge);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.97, 128), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); face.scale.set(AX, 1, 1); face.position.z = 0.101; grp.add(face);
  const back = new THREE.Mesh(new THREE.CircleGeometry(0.97, 128), MAT.navy); back.scale.set(AX, 1, 1); back.position.z = -0.101; back.rotation.y = Math.PI; grp.add(back);
  return grp;
}

/* ---------- Rounded box helper ---------- */
export function rbox(w, h, d, r, mat) {
  const b = Math.max(0.001, Math.min(r, d / 2 - 0.001, w / 2 - 0.001, h / 2 - 0.001));
  const s = roundedRect(Math.max(w - 2 * b, 0.002), Math.max(h - 2 * b, 0.002), Math.max(Math.min(r - b, (w - 2 * b) / 2, (h - 2 * b) / 2), 0.0005));
  const geo = new THREE.ExtrudeGeometry(s, { depth: Math.max(d - 2 * b, 0.001), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 5, curveSegments: 12 });
  geo.center(); return new THREE.Mesh(geo, mat);
}
function canvasTex(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

/* ---------- Studio pieces: soft contact shadow + display plinth ---------- */
export function softShadow(w = 4, d = 2.4, strength = 0.32) {
  const t = canvasTex(256, 256, (c) => { const g = c.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, `rgba(19,41,75,${strength})`); g.addColorStop(0.55, `rgba(19,41,75,${strength * 0.35})`); g.addColorStop(1, "rgba(19,41,75,0)"); c.fillStyle = g; c.fillRect(0, 0, 256, 256); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false }));
  m.rotation.x = -Math.PI / 2; m.renderOrder = -1; return m;
}
export function plinth(r = 3, h = 0.32) {
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 96), new THREE.MeshPhysicalMaterial({ color: 0xFBFCFD, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.3 }));
  top.position.y = -h / 2; g.add(top);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.018, 8, 160), new THREE.MeshStandardMaterial({ color: 0x2EA35F, roughness: 0.3, metalness: 0.4 }));
  ring.rotation.x = Math.PI / 2; ring.position.y = -0.04; g.add(ring);
  const sh = softShadow(r * 2.9, r * 2.9, 0.22); sh.position.y = -h - 0.01; g.add(sh);
  return g;
}

/* ---------- Delivery van: one sleek pearl-white body, tinted glass, a single green line ---------- */
export function deliveryVan() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const pearl = new THREE.MeshPhysicalMaterial({ color: 0xF7F8FA, roughness: 0.2, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.05, sheen: 0.3, sheenColor: new THREE.Color(0xDCE8F5) });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x14243A, roughness: 0.02, metalness: 0.4, clearcoat: 1, clearcoatRoughness: 0.02 });
  const trim = new THREE.MeshStandardMaterial({ color: 0x2A3442, roughness: 0.55 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xE8ECF0, metalness: 1, roughness: 0.12 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x1A1F27, roughness: 0.8 });
  const green = new THREE.MeshPhysicalMaterial({ color: 0x1C8A4A, roughness: 0.25, clearcoat: 1 });
  // side profile (x = length, y = height), extruded across the width
  const W = 2.0, B = 0.14;
  const p = new THREE.Shape();
  p.moveTo(-3.0, 0.42); p.lineTo(-3.0, 2.35); p.quadraticCurveTo(-3.0, 2.55, -2.8, 2.55);
  p.lineTo(1.35, 2.55); p.quadraticCurveTo(1.65, 2.55, 1.85, 2.3);
  p.lineTo(2.55, 1.42); p.quadraticCurveTo(2.7, 1.25, 2.95, 1.2);
  p.quadraticCurveTo(3.2, 1.15, 3.2, 0.9); p.lineTo(3.2, 0.42); p.lineTo(-3.0, 0.42);
  // wheel arches
  [[2.05], [-1.75]].forEach(([x]) => { const h = new THREE.Path(); h.absarc(x, 0.42, 0.7, 0, Math.PI, false); p.holes.push(h); });
  const geo = new THREE.ExtrudeGeometry(p, { depth: W - 2 * B, bevelEnabled: true, bevelThickness: B, bevelSize: B, bevelSegments: 6, curveSegments: 24 });
  geo.translate(0, 0, -(W - 2 * B) / 2);
  const shell = new THREE.Mesh(geo, pearl); body.add(shell);
  // windscreen on the slope
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(1.2, W - 0.34), glass);
  ws.rotation.set(0, Math.PI / 2, 0); ws.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), 0.672); ws.position.set(2.33, 1.95, 0); body.add(ws);
  // side windows (cab) with a soft rounded shape
  const sw = new THREE.Shape(); sw.moveTo(0.95, 1.62); sw.lineTo(0.95, 2.32); sw.lineTo(1.6, 2.32); sw.quadraticCurveTo(1.72, 2.3, 1.8, 2.2); sw.lineTo(2.32, 1.62); sw.lineTo(0.95, 1.62);
  const swG = new THREE.ShapeGeometry(sw, 16);
  [1, -1].forEach(s => { const m = new THREE.Mesh(swG, glass); m.position.z = s * (W / 2 + 0.004); if (s < 0) m.scale.z = -1; body.add(m); });
  // green waistline, sill, bumpers
  [1, -1].forEach(s => { const l = rbox(5.6, 0.05, 0.02, 0.02, green); l.position.set(-0.05, 1.18, s * (W / 2 + 0.006)); body.add(l); });
  const bumperF = rbox(0.18, 0.28, W - 0.1, 0.08, trim); bumperF.position.set(3.22, 0.56, 0); body.add(bumperF);
  const bumperR = rbox(0.16, 0.26, W - 0.1, 0.08, trim); bumperR.position.set(-3.02, 0.56, 0); body.add(bumperR);
  const lampM = new THREE.MeshBasicMaterial({ color: 0xFFFFFF }), tailM = new THREE.MeshBasicMaterial({ color: 0xD8473A });
  [0.72, -0.72].forEach(z => { const h = rbox(0.05, 0.12, 0.4, 0.05, lampM); h.position.set(3.2, 1.02, z); body.add(h); const t = rbox(0.04, 0.55, 0.1, 0.04, tailM); t.position.set(-3.02, 1.5, z * 1.2); body.add(t); });
  // decal on the cargo sides
  const decal = canvasTex(1400, 700, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    c.fillStyle = "#1C8A4A"; c.beginPath(); c.ellipse(170, 300, 42, 86, 0.55, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#0D9488"; c.beginPath(); c.ellipse(236, 338, 30, 62, -0.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#0F2147"; c.font = '600 120px "Lexend", Arial, sans-serif'; c.fillText("Stockton", 300, 330);
    c.fillStyle = "#1C8A4A"; c.font = '600 52px "Lexend", Arial, sans-serif'; c.letterSpacing = "14px"; c.fillText("PHARMACY", 306, 410);
    c.fillStyle = "#5B6B82"; c.font = '500 44px "Figtree", Arial, sans-serif'; c.letterSpacing = "2px"; c.fillText("Free local delivery  ·  209-868-1555", 306, 500);
  });
  const dm = new THREE.MeshBasicMaterial({ map: decal, transparent: true, toneMapped: false });
  [1, -1].forEach(s => { const pl = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.7), dm); pl.position.set(-1.0, 1.62, s * (W / 2 + 0.008)); if (s < 0) pl.rotation.y = Math.PI; body.add(pl); });
  // wheels
  const wheels = [];
  const tireG = new THREE.TorusGeometry(0.34, 0.15, 20, 48); const rimG = new THREE.CylinderGeometry(0.27, 0.27, 0.28, 40); rimG.rotateX(Math.PI / 2);
  const spokeG = new THREE.BoxGeometry(0.46, 0.06, 0.04);
  [[2.05, 1], [2.05, -1], [-1.75, 1], [-1.75, -1]].forEach(([x, s]) => {
    const w = new THREE.Group(); w.add(new THREE.Mesh(tireG, rubber)); w.add(new THREE.Mesh(rimG, chrome));
    for (let k = 0; k < 5; k++) { const sp = new THREE.Mesh(spokeG, trim); sp.rotation.z = k * Math.PI / 5; sp.position.z = s * 0.15; w.add(sp); }
    w.position.set(x, 0.49, s * 0.84); g.add(w); wheels.push(w);
  });
  const sh = softShadow(7.4, 3.2, 0.42); sh.position.y = 0.01; g.add(sh);
  g.userData = { body, wheels };
  return g;
}

/* ---------- Care home: an architect's white maquette ---------- */
export function careHome() {
  const g = new THREE.Group();
  const white = new THREE.MeshPhysicalMaterial({ color: 0xF8F9FB, roughness: 0.55, clearcoat: 0.2 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xBFD9EE, roughness: 0.04, metalness: 0.1, clearcoat: 1, transparent: true, opacity: 0.92 });
  const green = new THREE.MeshPhysicalMaterial({ color: 0x1C8A4A, roughness: 0.35, clearcoat: 0.6 });
  const sage = new THREE.MeshPhysicalMaterial({ color: 0x8FC39F, roughness: 0.55, clearcoat: 0.3 });
  const wing = (w, h, d, x, z) => { const m = rbox(w, h, d, 0.06, white); m.position.set(x, h / 2, z); g.add(m); return m; };
  wing(4.2, 1.9, 1.8, 0, 0); wing(1.6, 1.3, 2.6, -2.6, 0.4); wing(1.6, 1.3, 2.6, 2.6, 0.4);
  const roof = rbox(4.4, 0.12, 2.0, 0.04, white); roof.position.set(0, 1.96, 0); g.add(roof);
  [-2.6, 2.6].forEach(x => { const r = rbox(1.75, 0.1, 2.75, 0.04, white); r.position.set(x, 1.35, 0.4); g.add(r); });
  const win = (x, y, z, w = 0.42, h = 0.5) => { const m = rbox(w, h, 0.05, 0.03, glass); m.position.set(x, y, z); g.add(m); };
  for (let k = -3; k <= 3; k++) { if (k === 0) continue; win(k * 0.55, 1.4, 0.92); win(k * 0.55, 0.6, 0.92); }
  [-2.6, 2.6].forEach(x => { win(x - 0.4, 0.75, 1.72); win(x + 0.4, 0.75, 1.72); });
  const door = rbox(0.6, 0.95, 0.06, 0.04, glass); door.position.set(0, 0.48, 0.93); g.add(door);
  const canopy = rbox(1.3, 0.06, 0.6, 0.03, green); canopy.position.set(0, 1.05, 1.15); g.add(canopy);
  [-0.55, 0.55].forEach(x => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.0, 12), white); p.position.set(x, 0.52, 1.38); g.add(p); });
  const walk = rbox(0.9, 0.02, 1.6, 0.01, new THREE.MeshStandardMaterial({ color: 0xE9EEF3 })); walk.position.set(0, 0.01, 1.9); g.add(walk);
  [[-3.6, 1.9, 0.42], [3.6, 1.9, 0.42], [-1.4, 2.2, 0.3], [1.4, 2.2, 0.3], [-3.9, -1.0, 0.36], [3.9, -1.1, 0.36]].forEach(([x, z, r]) => {
    const t = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), sage); t.position.set(x, r + 0.22, z); g.add(t);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), white); st.position.set(x, 0.15, z); g.add(st);
  });
  return g;
}

/* Drag-to-spin on any stage: returns { yaw, pitch, step() } */
export function dragSpin(el) {
  const s = { yaw: 0, pitch: 0, vy: 0, down: false, lx: 0, ly: 0, step() { if (!this.down) { this.yaw += this.vy; this.vy *= 0.94; this.yaw *= 0.985; this.pitch *= 0.9; } } };
  el.style.touchAction = "pan-y"; el.style.cursor = "grab";
  el.addEventListener("pointerdown", e => { s.down = true; s.lx = e.clientX; s.ly = e.clientY; el.style.cursor = "grabbing"; });
  addEventListener("pointermove", e => { if (!s.down) return; const dx = e.clientX - s.lx, dy = e.clientY - s.ly; s.lx = e.clientX; s.ly = e.clientY; s.yaw += dx * 0.01; s.vy = dx * 0.01; s.pitch = Math.max(-0.4, Math.min(0.4, s.pitch + dy * 0.004)); });
  addEventListener("pointerup", () => { s.down = false; el.style.cursor = "grab"; });
  return s;
}

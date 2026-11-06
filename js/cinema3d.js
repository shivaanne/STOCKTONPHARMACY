/* Stockton Pharmacy: the home page film.
   One continuous studio shot scrubbed by scroll (progress from cinema.js):
   the amber bottle turns in soft light, the cap unscrews and lifts away,
   the pills burst out and hang in the air, then land one by one into a
   bubble pack: Sunday to Saturday, morning to bedtime. */
import { THREE, webglOK, setup, run, rxVial, randomPill, CARD, clamp, ease, lerp } from "./sol3d.js";

const host = document.querySelector("[data-film]");
if (host && webglOK() && document.documentElement.classList.contains("cine")) init().catch(e => { console.warn("3D film disabled:", e); host.classList.add("fail-3d"); });

const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
function track(p, keys) {             // keys: [[p, value], ...] smooth between keyframes
  if (p <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (p <= keys[i][0]) { const [a, va] = keys[i - 1], [b, vb] = keys[i]; return lerp(va, vb, smooth((p - a) / (b - a))); }
  return keys[keys.length - 1][1];
}
function rng(seed) { let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }

function premiumLabel() {
  const c = document.createElement("canvas"); c.width = 1400; c.height = 640; const g = c.getContext("2d");
  g.fillStyle = "#FBFAF7"; g.fillRect(0, 0, 1400, 640);
  g.fillStyle = "#0F2147"; g.fillRect(0, 0, 1400, 150);
  g.fillStyle = "#0D9488"; g.beginPath(); g.ellipse(420, 76, 18, 36, 0.6, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#fff"; g.font = '600 66px "Lexend", Arial, sans-serif'; g.textBaseline = "middle"; g.fillText("Stockton", 460, 70);
  g.font = '500 26px "Figtree", Arial, sans-serif'; g.fillStyle = "#99F6E4"; g.fillText("P H A R M A C Y   ·   S T O C K T O N ,  C A", 462, 118);
  g.fillStyle = "#0F2147"; g.font = '600 40px "Figtree", Arial, sans-serif'; g.fillText("Take 1 capsule daily with food", 400, 250);
  g.fillStyle = "#5B6B82"; g.font = '500 28px "Figtree", Arial, sans-serif';
  g.fillText("Rx 1048 2219     Qty 30     Refills 3", 400, 320);
  g.fillStyle = "#E3DED3"; g.fillRect(400, 370, 620, 3);
  g.fillStyle = "#5B6B82"; g.fillText("Free local delivery  ·  209-868-1555", 400, 420);
  for (let i = 0; i < 46; i++) { g.fillStyle = "#0F2147"; g.fillRect(400 + i * 13, 480, (i * 7) % 3 + 2, 70); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; return t;
}

async function init() {
  const mobile = () => innerWidth < 760;
  const { renderer, scene, camera, onResize } = await setup(host, { fov: 30, exposure: 1.05 });
  let dpr = Math.min(devicePixelRatio, mobile() ? 1.25 : 1.5); renderer.setPixelRatio(dpr);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  // studio lighting: big soft key with real shadows, warm rim, cool fill
  scene.children.forEach(o => {
    if (o.isHemisphereLight) { o.color.set(0xFFFFFF); o.groundColor.set(0xE9E3D7); o.intensity = 0.85; }
    if (o.isDirectionalLight) {
      const hex = o.color.getHex();
      if (hex === 0xffffff) { o.intensity = 1.9; o.position.set(2.5, 12, 4); o.castShadow = true; o.shadow.mapSize.set(1024, 1024); o.shadow.radius = 4; o.shadow.bias = -0.0004;
        Object.assign(o.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 30 }); }
      if (hex === 0xffb45a) { o.intensity = 1.25; o.position.set(-7, 4, -5); }
      if (hex === 0x6fe39a) { o.intensity = 0.35; }
    }
  });
  const fill = new THREE.DirectionalLight(0xDDE8FF, 0.6); fill.position.set(-6, 2, 6); scene.add(fill);

  const rig = new THREE.Group(); scene.add(rig);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.09 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -2.3; floor.receiveShadow = true; scene.add(floor);

  /* the bottle */
  const S = 0.92;
  const vial = rxVial(); vial.scale.setScalar(S); rig.add(vial);
  vial.userData.inner.visible = false;
  // same amber look without the costly see-through (transmission) pass
  const amber = new THREE.MeshPhysicalMaterial({ color: 0xB4560B, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, opacity: 0.94, sheen: 0.4, sheenColor: new THREE.Color(0xFFB05A), side: THREE.DoubleSide });
  vial.traverse(o => { if (o.isMesh && o.material && o.material.transmission > 0) o.material = amber; });
  const label = vial.children.find(m => m.isMesh && m.material && m.material.map && m.geometry.parameters && m.geometry.parameters.thetaLength);
  if (label) { label.material.map = premiumLabel(); label.material.needsUpdate = true; }
  const cap = vial.userData.cap, capY = cap.position.y, H = vial.userData.H;
  const vialBaseY = -H * S / 2 - 0.15;

  /* the bubble pack (its own pills hidden: ours land in its wells) */
  const pack = CARD.filled(); const card = pack.card; card.scale.setScalar(0.6); rig.add(card);
  pack.pills.forEach(m => m.visible = false);

  /* 28 pills: one per well, colored by dose time like the real card */
  const KIND = [0, 5, 1, 3];   // morning green capsule, noon gold tablet, evening blue capsule, bedtime coral capsule
  const r = rng(7), pills = [];
  pack.wells.forEach((w, k) => {
    const col = k % 4, m = randomPill(KIND[col], 0.82);
    m.traverse(o => { if (o.isMesh) o.castShadow = true; });
    // a cloud position around the bottle mouth, kept clear of the bottle itself
    let x, y, z; do { x = (r() - .5) * 5.4; y = (r() - .5) * 3.4 + 0.5; z = (r() - .5) * 3.0; } while (Math.hypot(x, (y - 0.4) * 1.3) < 1.5);
    m.userData = { well: w, order: k / 27, cloud: new THREE.Vector3(x, y, z), spin: new THREE.Vector3(r() - .5, r() - .5, r() - .5).multiplyScalar(2.4),
      ph: r() * 6, delay: r() * 0.05, tz: (k * 1.7) % 3, q0: new THREE.Quaternion() };
    m.visible = false; rig.add(m); pills.push(m);
  });
  vial.traverse(o => { if (o.isMesh) o.castShadow = true; });
  card.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  const tmpV = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), wellQ = new THREE.Quaternion(), eul = new THREE.Euler(), mouth = new THREE.Vector3();
  let ps = 0, aspect = 1, lastT = 0, slow = 0;
  const qTmp = new THREE.Quaternion(), qA = new THREE.Quaternion(), eA = new THREE.Euler();
  onResize((w, h) => { aspect = w / h; });

  // drag the scene a little with the pointer for a hand-held feel
  let mx = 0, my = 0, sx = 0, sy = 0;
  addEventListener("pointermove", e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });

  run(host, time => {
    const target = (window.solaceFilm && window.solaceFilm.p) || 0;
    const dt = Math.min(0.1, time - (lastT || time)); lastT = time;
    ps += (target - ps) * (1 - Math.pow(0.002, dt));          // frame-rate independent, quick but silky
    if (Math.abs(target - ps) < 0.0002) ps = target;
    const p = ps, t = time;
    // adaptive quality: if frames run slow, drop resolution, then shadows
    if (time > 4 && dt < 0.2) slow = slow * 0.97 + (dt > 0.028 ? 1 : 0) * 0.03;   // ignore the load-time hiccup and one-off stalls
    if (slow > 0.5 && dpr > 1) { dpr = 1; renderer.setPixelRatio(1); slow = 0; }
    else if (slow > 0.5 && renderer.shadowMap.enabled) { renderer.shadowMap.enabled = false; floor.visible = false; scene.traverse(o => { if (o.material) o.material.needsUpdate = true; }); slow = 0; }
    sx += (mx - sx) * 0.04; sy += (my - sy) * 0.04;
    const mob = mobile();

    /* composition: the subject sits opposite the caption */
    const fx = mob ? 0 : track(p, [[0, 2.4], [0.13, 2.4], [0.2, -2.3], [0.33, -2.3], [0.4, 2.5], [0.52, 2.5], [0.6, -2.5], [0.84, -2.5], [0.9, 0], [1, 0]]);
    rig.position.x = fx; rig.position.y = mob ? track(p, [[0.86, 1.15], [0.95, 0.6]]) : (p > 0.86 ? track(p, [[0.86, 0], [0.96, -1.55]]) : 0);
    rig.scale.setScalar((mob ? 0.6 : (aspect < 1.25 ? 0.82 : 1)) * (1 - 0.14 * smooth((p - 0.86) / 0.1)));

    /* camera: a slow dolly in, a gentle orbit while the pills hang in the air, then settle on the pack */
    const orbit = track(p, [[0.18, 0], [0.5, 0.42], [0.6, 0], [1, 0]]);
    const dist = track(p, [[0, 13.4], [0.12, 12.2], [0.24, 13.2], [0.5, 13.2], [0.62, 12], [0.84, 11.4], [1, 12.2]]);
    camera.position.set(Math.sin(orbit + sx * 0.12) * dist, 0.9 + sy * -0.5 + track(p, [[0.55, 0], [0.7, 0.9], [1, 0.4]]), Math.cos(orbit + sx * 0.12) * dist);
    camera.lookAt(rig.position.x * 0.0, rig.position.y * 0.5, 0);

    /* the bottle: turns slowly, cap unscrews and lifts off, then the bottle sinks away */
    const unscrew = smooth((p - 0.08) / 0.09), lift = smooth((p - 0.15) / 0.1), exit = smooth((p - 0.31) / 0.08);
    vial.position.set(0, vialBaseY + Math.sin(t * 0.8) * 0.05 - exit * 11, -exit * 3);
    vial.rotation.set(Math.sin(t * 0.5) * 0.03 + exit * 0.6, -0.5 + t * 0.12 + p * 1.2, Math.sin(t * 0.4) * 0.02 - exit * 0.5);
    cap.position.set(lift * 1.2, capY + unscrew * 0.35 + lift * 7.5, lift * -4);
    cap.visible = lift < 0.98;
    cap.rotation.set(lift * 1.1, -unscrew * Math.PI * 2.5 - lift * 2, lift * 0.7);
    vial.visible = exit < 1;

    /* the pack rises into frame, tilted like a product shot */
    const rise = easeOut((p - 0.5) / 0.13), turn = smooth((p - 0.84) / 0.12);
    card.visible = p > 0.48;
    card.position.set(0, lerp(-7.5, -0.15, rise), lerp(-1.5, 0.3, rise));
    card.rotation.set(lerp(-1.25, -0.2, rise) + turn * 0.12 + Math.sin(t * 0.6) * 0.015, lerp(0.9, -0.38, rise) + turn * 0.38 + Math.sin(t * 0.4) * 0.02, lerp(0.4, 0.03, rise));
    card.updateMatrixWorld(true);

    /* the pills */
    vial.updateMatrixWorld(true);
    mouth.set(0, H + 0.05, 0); vial.localToWorld(mouth); rig.worldToLocal(mouth);
    card.getWorldQuaternion(wellQ); const rigQ = rig.getWorldQuaternion(tmpQ.clone()).invert(); wellQ.premultiply(rigQ);
    pills.forEach((m, k) => {
      const u = m.userData;
      const burst = easeOut((p - 0.155 - u.delay) / 0.13);
      const land = smooth((p - 0.6 - u.order * 0.17) / 0.07);
      m.visible = burst > 0.001;
      if (!m.visible) return;
      // hanging in the air: slow drift and tumble
      const hx = u.cloud.x + Math.sin(t * 0.5 + u.ph) * 0.12, hy = u.cloud.y + Math.sin(t * 0.7 + u.ph) * 0.16, hz = u.cloud.z + Math.cos(t * 0.45 + u.ph) * 0.1;
      if (land <= 0) {
        m.position.set(lerp(mouth.x, hx, burst), lerp(mouth.y, hy, burst) + Math.sin(burst * Math.PI) * 0.9, lerp(mouth.z, hz, burst));
        m.rotation.set(u.spin.x * (t * 0.35 + burst * 3), u.spin.y * (t * 0.35 + burst * 3), u.spin.z * (t * 0.25));
        m.scale.setScalar(0.4 + burst * 0.6);
        m.userData.q0.copy(m.quaternion);
      } else {
        tmpV.copy(u.well); card.localToWorld(tmpV); rig.worldToLocal(tmpV);
        const k2 = land;
        m.position.set(lerp(hx, tmpV.x, k2), lerp(hy, tmpV.y, k2) + Math.sin(k2 * Math.PI) * 0.5, lerp(hz, tmpV.z, k2) + Math.sin(k2 * Math.PI) * 0.6);
        eul.set(0, 0, u.tz); qTmp.setFromEuler(eul).premultiply(wellQ);
        eA.set(u.spin.x * t * 0.35, u.spin.y * t * 0.35, u.spin.z * t * 0.25); qA.setFromEuler(eA);
        m.quaternion.copy(qA).slerp(qTmp, k2);
        m.scale.setScalar(lerp(1, 0.235, k2));
      }
    });

    floor.position.x = rig.position.x;
    renderer.render(scene, camera);
  });
}

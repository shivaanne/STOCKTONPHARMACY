/* Stockton Pharmacy — 3D scenes for inner-page heroes.
   <div data-scene="patients|facilities|vaccines|forms|contact|ambient|packs|delivery|carehome"> */
import { THREE, webglOK, setup, run, pointer, reduceMotion, rxVial, CARD, pillCloud, syringe, vaccineVial, clipboard, logoCoin, cloudFloor, deliveryVan, careHome, plinth, softShadow, dragSpin, rbox, ease, clamp } from "./sol3d.js";

/* Build each scene only when it is about to scroll into view (saves GPU on long pages) */
const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { io.unobserve(en.target); build(en.target).catch(e => { console.warn("3D scene disabled:", e); en.target.classList.add("fail-3d"); }); } }), { rootMargin: "300px" });
document.querySelectorAll("[data-scene]").forEach(el => { if (webglOK()) io.observe(el); });

async function build(stage) {
  const kind = stage.dataset.scene, reduce = reduceMotion();
  const { renderer, scene, camera, onResize } = await setup(stage);
  const world = new THREE.Group(); scene.add(world);
  const ptr = pointer(), spin = kind === "ambient" ? null : dragSpin(stage);
  let step = () => {}, wide = true;
  const mist = stage.classList.contains("hero-3d") ? cloudFloor({ count: 90, width: 18, depth: 8, y: -3.2 }) : { step() {} };
  if (mist.points) { mist.mat.opacity = 0.3; scene.add(mist.points); }
  scene.children.forEach(o => { if (o.isHemisphereLight) { o.groundColor.set(0xDCE4EE); o.intensity = 0.7; } });
  scene.children.filter(o => o.isDirectionalLight && o.color.getHex() === 0xffb45a).forEach(l => { l.intensity = 1.1; });

  if (kind === "patients") {
    const v = rxVial(["Stockton Pharmacy", "Take 1 daily", "Free local delivery"]); v.position.y = -1.4; world.add(v);
    const cloud = pillCloud(4, [8, 6, 3], 3); world.add(cloud.group);
    camera.position.set(0, 0.6, 12);
    step = t => { v.rotation.set(0.15, -0.6 + t * 0.25, 0.12); v.position.y = -1.4 + Math.sin(t * 0.9) * 0.12; v.userData.cap.position.y = v.userData.H + 0.22 + 0.5 + Math.sin(t * 1.1) * 0.15; v.userData.cap.rotation.y = t * 0.4; cloud.step(t); camera.lookAt(0, 0, 0); };
  }
  if (kind === "facilities") {
    const { card } = CARD.filled(); card.scale.setScalar(0.62); world.add(card);
    const stack = Array.from({ length: 6 }, () => { const c = CARD.shell(); c.scale.setScalar(0.62); world.add(c); return c; });
    camera.position.set(0, 0.4, 13);
    step = t => {
      const fan = reduce ? 1 : 0.85 + Math.sin(t * 0.6) * 0.15;
      card.position.set(1.4, Math.sin(t * 0.8) * 0.08, 0.6); card.rotation.set(0.08, -0.42, -0.04);
      stack.forEach((c, i) => {
        c.position.set(card.position.x - (i + 1) * 0.5 * fan, card.position.y + (i + 1) * 0.06, card.position.z - (i + 1) * 0.5 * fan);
        c.rotation.set(0.08, -0.42 + (i + 1) * 0.06 * fan, -0.04 - (i + 1) * 0.04 * fan);
      });
      camera.lookAt(0, 0, 0);
    };
  }
  if (kind === "vaccines") {
    const s = syringe(); s.position.set(-0.6, 0.4, 0); s.rotation.z = -0.55; world.add(s);
    const v = vaccineVial(); v.position.set(1.7, -1.6, 0.4); world.add(v);
    const cloud = pillCloud(3, [9, 6, 3], 9, 0.8); world.add(cloud.group);
    camera.position.set(0, 0.3, stage.classList.contains("hero-3d") ? 11 : 14);
    step = t => { s.rotation.y = t * 0.35; s.position.y = 0.4 + Math.sin(t * 0.9) * 0.15; v.rotation.y = -t * 0.3; v.position.y = -1.6 + Math.sin(t * 0.8 + 1) * 0.1; cloud.step(t); camera.lookAt(0, 0, 0); };
  }
  if (kind === "forms") {
    const cb = clipboard(); world.add(cb);
    const cloud = pillCloud(3, [9, 6, 3], 4, 0.8); world.add(cloud.group);
    camera.position.set(0, 0.2, 10.5);
    step = t => { cb.rotation.set(-0.18 + Math.sin(t * 0.5) * 0.04, -0.35 + Math.sin(t * 0.35) * 0.18, 0.06); cb.position.y = Math.sin(t * 0.8) * 0.12; cb.userData.pen.rotation.z = 0.5 + Math.sin(t * 1.6) * 0.08; cloud.step(t); camera.lookAt(0, 0, 0); };
  }
  if (kind === "contact") {
    const coin = await logoCoin(stage.dataset.logo || "assets/img/solace-logo.svg"); coin.scale.setScalar(1.6); world.add(coin);
    const orbit = pillCloud(5, [0.1, 0.1, 0.1], 5);
    orbit.items.forEach((m, i) => { m.userData.r = 3.3 + (i % 3) * 0.5; m.userData.a = i / 5 * Math.PI * 2; m.userData.tilt = i % 2 ? 0.5 : -0.4; });
    world.add(orbit.group);
    camera.position.set(0, 0.4, 11);
    step = t => {
      coin.rotation.y = Math.sin(t * 0.6) * 0.3; coin.position.y = Math.sin(t * 0.9) * 0.1;
      orbit.items.forEach((m, i) => { const u = m.userData, a = u.a + t * 0.35; m.position.set(Math.cos(a) * u.r, Math.sin(a) * u.r * u.tilt, Math.sin(a) * u.r * 0.6); m.rotation.x = t * 0.4 + i; m.rotation.y = t * 0.3 + i; });
      camera.lookAt(0, 0, 0);
    };
  }
  if (kind === "packs") {
    // A multi-dose card filling itself: each dose drops into its well, Morning to Bedtime, Sunday to Saturday
    const { card, pills } = CARD.filled(); card.scale.setScalar(0.7); world.add(card); world.position.y = -0.35;
    const shells = [1, 2].map(i => { const c = CARD.shell(); c.scale.setScalar(0.78); c.position.set(-0.55 * i, 0.12 * i, -0.45 * i); c.rotation.z = 0.05 * i; world.add(c); return c; });
    pills.forEach(p => { p.userData.home = p.position.clone(); p.userData.r = p.rotation.clone(); });
    const sh = softShadow(5.5, 2.2, 0.28); sh.position.set(-0.3, -2.9, -0.3); world.add(sh);
    camera.position.set(0, 0, 12.2);
    const LOOP = 9;
    step = t => {
      card.rotation.set(-0.12 + Math.sin(t * 0.4) * 0.05, -0.38 + Math.sin(t * 0.3) * 0.12, 0.04);
      card.position.y = Math.sin(t * 0.7) * 0.1;
      shells.forEach((c, i) => { c.rotation.copy(card.rotation); c.rotation.z += 0.06 * (i + 1); c.position.y = card.position.y + 0.14 * (i + 1); });
      const ph = reduce ? 1 : (t % LOOP) / LOOP;
      pills.forEach(p => {
        const u = p.userData, k = clamp((ph * 1.25 - u.order * 0.75) * 4);
        const e = ease(k), out = ph > 0.92 ? ease((ph - 0.92) / 0.08) : 0;
        p.position.set(u.home.x, u.home.y + (1 - e) * 2.2 + out * 0.0, u.home.z + (1 - e) * 3.2);
        p.rotation.set(u.r.x + (1 - e) * 4, u.r.y + (1 - e) * 3, u.r.z);
        p.scale.setScalar(Math.max(0.001, (k > 0 ? 1 : 0) * (1 - out)));
      });
      camera.lookAt(0, 0, 0);
    };
  }
  if (kind === "delivery") {
    // Showroom turntable: the delivery van on a white display plinth
    const base = plinth(2.9); base.position.y = -1.6; world.add(base);
    const van = deliveryVan(); van.scale.setScalar(0.74); van.position.set(0, -1.6, 0); world.add(van);
    camera.position.set(0, 1.9, 10.5);
    step = t => {
      const a = reduce ? -0.6 : -0.6 + Math.sin(t * 0.22) * 0.85;
      van.rotation.y = a; base.rotation.y = a;
      van.userData.wheels.forEach(w => w.rotation.z = -t * 0.6);
      van.userData.body.position.y = Math.sin(t * 1.4) * 0.008;
      camera.lookAt(0, -0.35, 0);
    };
  }
  if (kind === "carehome") {
    const base = plinth(3.3); base.position.y = -1.7; world.add(base);
    const home = careHome(); home.scale.setScalar(0.74); home.position.set(0, -1.7, 0); world.add(home);
    const { card } = CARD.filled(); card.scale.setScalar(0.3); world.add(card);
    const shell = CARD.shell(); shell.scale.setScalar(0.27); world.add(shell);
    camera.position.set(0, 2.4, 11.5);
    step = t => {
      const a = reduce ? -0.45 : -0.45 + Math.sin(t * 0.2) * 0.5;
      home.rotation.y = a; base.rotation.y = a;
      card.position.set(2.35, 1.0 + Math.sin(t * 0.9) * 0.12, 0.8); card.rotation.set(-0.08, -0.35 + Math.sin(t * 0.5) * 0.12, 0.06);
      shell.position.set(-2.45, 0.8 + Math.sin(t * 0.9 + 2) * 0.12, 0.4); shell.rotation.set(-0.08, 0.4 + Math.sin(t * 0.5 + 1) * 0.12, -0.05);
      camera.lookAt(0, -0.1, 0);
    };
  }
  if (kind === "ambient") {
    // A few glossy pills drifting at the edges, behind the content
    const cloud = pillCloud(6, [18, 6, 4], 11, 0.9); world.add(cloud.group);
    cloud.items.forEach((m, i) => { const b = m.userData.b; b.x = (i % 2 ? 1 : -1) * (5.2 + (i % 3) * 0.7); b.z = -1.5 - (i % 3); });
    camera.position.set(0, 0, 12);
    step = t => { cloud.step(t); camera.lookAt(0, 0, 0); };
  }

  onResize((w, h) => { wide = w / h > 1.0; });
  run(stage, time => {
    const t = reduce ? 0 : time;
    ptr.step();
    if (spin) spin.step();
    world.rotation.y = ptr.x * 0.4 + (spin ? spin.yaw : 0); world.rotation.x = ptr.y * 0.18 + (spin ? spin.pitch : 0);
    world.scale.setScalar(wide ? 1 : 0.8);
    step(t); mist.step(t);
    renderer.render(scene, camera);
  });
}

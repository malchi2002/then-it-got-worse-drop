import * as L from '/lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, easeOut, lerp, setCam, rng, canvasTex, signTex, makeGuy, setFace, resetPose, effortPose, walkPose, blinkAt } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const A = {}; TL.tl.filter(x => x.type === 'act').forEach(x => A[x.n] = x.blast);
const line = H.line;

// ---------- assets ----------
function makeBus() {
  const g = new THREE.Group();
  const bt = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#f2b632'; c.fillRect(0, 0, w, h); c.fillStyle = '#20324a'; for (let x = 20; x < w - 40; x += 58) c.fillRect(x, 14, 46, 52); c.fillStyle = '#c0392b'; c.fillRect(0, 84, w, 10); c.fillStyle = '#20324a'; c.font = 'bold 24px Inter'; c.fillText('LINE 7', w - 100, 118); });
  const bm = new THREE.MeshStandardMaterial({ map: bt, roughness: 0.5 });
  const body = mesh(new THREE.BoxGeometry(10, 3, 2.6), [mat(0xf2b632), mat(0xf2b632), mat(0xe9e9e9), mat(0x333333), bm, bm]); body.position.y = 1.9; g.add(body);
  for (const x of [-3.3, 3.3]) for (const z of [-1.3, 1.3]) { const w = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16), mat(0x222222)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.5, z); g.add(w); }
  return g;
}
function makeCar(c = 0xd64545) {
  const g = new THREE.Group(); const b = box(4, 0.9, 1.8, c, { r: 0.35, m: 0.2 }); b.position.y = 0.75; g.add(b); const t = box(2.2, 0.7, 1.6, mat(0x9fd3f0, { r: 0.1, m: 0.3 })); t.position.set(-0.2, 1.5, 0); g.add(t);
  for (const x of [-1.3, 1.3]) for (const z of [-0.9, 0.9]) { const w = mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.25, 14), mat(0x1a1a1a)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.38, z); g.add(w); }
  return g;
}
function busStop() { const g = new THREE.Group(); const p = box(0.12, 2.6, 0.12, mat(0x555555)); p.position.y = 1.3; g.add(p); const s = mesh(new THREE.CircleGeometry(0.45, 24), new THREE.MeshStandardMaterial({ map: signTex([['BUS', "96px 'Archivo Black'", 160]], { w: 256, h: 256, bg: '#1d6fd6', border: false }), side: THREE.DoubleSide })); s.position.set(0, 2.7, 0.07); g.add(s); const roof = box(3, 0.1, 1.4, mat(0x2a3d5a)); roof.position.set(1.8, 2.5, -0.3); g.add(roof); const bench = box(2, 0.1, 0.5, mat(0x8a5a30)); bench.position.set(1.8, 0.5, -0.6); g.add(bench); const back = box(3, 2.4, 0.06, new THREE.MeshStandardMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.4 })); back.position.set(1.8, 1.25, -0.95); g.add(back); return g; }
function addCup(g) { const c = mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.13, 14), mat(0xf4f4f4, { r: 0.4 })); const sl = mesh(new THREE.CylinderGeometry(0.052, 0.048, 0.05, 14), mat(0x8a5a30)); sl.position.y = -0.01; c.add(sl); const lid = mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 14), mat(0x222222)); lid.position.y = 0.075; c.add(lid); c.position.set(0, -0.02, 0.04); g.aR.grip.add(c); }

// ---------- scenes ----------
const town = L.buildTown({ sky: 'day', seed: 12, skip: [[0, -1], [1, 0], [0, 0]] });
const T = town; const ts = town.scene;
const bus = makeBus(); bus.position.set(34, 0, 14.5); ts.add(bus);
const car = makeCar(); car.position.set(-12, 0, 9.8); ts.add(car);
const car2 = makeCar(0x3b7dd8); car2.position.set(10, 0, 9.8); ts.add(car2);
const stop = busStop(); stop.position.set(30, 0, 8.2); ts.add(stop);
const driver = makeGuy({ wood: 0x8c9bc0, cap: 0x20324a, shirt: 0x3a5f8a, sit: true }); driver.root.position.set(4.3, 1.0, 0.4); driver.root.rotation.y = -Math.PI / 2; bus.add(driver.root);
const dale = makeGuy({ ...L.DALE }); addCup(dale); ts.add(dale.root);
const nextSign = new THREE.Group(); { const sp = mesh(new THREE.PlaneGeometry(4, 2), new THREE.MeshStandardMaterial({ map: signTex([['WELCOME TO', '34px Inter', 90], ['NEXT TOWN', "64px 'Archivo Black'", 170], ['POP. 4,210', '26px Inter', 215]]), side: THREE.DoubleSide })); sp.position.y = 3; nextSign.add(sp); for (const x of [-1.6, 1.6]) { const p = box(0.15, 2.2, 0.15, mat(0x777777)); p.position.set(x, 1.1, 0); nextSign.add(p); } }
nextSign.position.set(80, 0, 7); ts.add(nextSign);
// trail line in town (for giant leaps)
const trailG = new THREE.BufferGeometry(); trailG.setAttribute('position', new THREE.Float32BufferAttribute(new Array(200 * 3).fill(0), 3));
const trail = new THREE.Line(trailG, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })); trail.frustumCulled = false; ts.add(trail);
const dust = L.makePuff(ts, 50, 0xd8cbb0, 0.6, 3);

// beach
const beach = new THREE.Scene(); beach.background = new THREE.Color(0x8fd0f2); beach.fog = new THREE.Fog(0x8fd0f2, 200, 6000);
beach.add(new THREE.HemisphereLight(0xe6f6ff, 0xc9a86a, 1.2)); const bsun = new THREE.DirectionalLight(0xfff0d0, 3); bsun.position.set(20, 40, 30); bsun.castShadow = true; bsun.shadow.mapSize.set(2048, 2048); Object.assign(bsun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40 }); beach.add(bsun);
const sand = mesh(new THREE.PlaneGeometry(1200, 400), mat(0xeed9a6, { r: 1 })); sand.rotation.x = -Math.PI / 2; sand.position.z = 150; beach.add(sand);
const seaM = new THREE.MeshStandardMaterial({ color: 0x1f8fc4, roughness: 0.25, metalness: 0.1 }); const sea = mesh(new THREE.PlaneGeometry(4000, 3000, 160, 60), seaM, false, true); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.05, -1550); beach.add(sea);
const foam = mesh(new THREE.PlaneGeometry(1200, 3), mat(0xffffff, { r: 0.6 }), false, true); foam.rotation.x = -Math.PI / 2; foam.position.set(0, 0.08, -48); beach.add(foam);
const br = rng(77);
for (let i = 0; i < 26; i++) { const p = new THREE.Group(); const tr = mesh(new THREE.CylinderGeometry(0.2, 0.3, 6, 6), mat(0x8a6a40)); tr.position.y = 3; tr.rotation.z = 0.15; p.add(tr); for (let k = 0; k < 6; k++) { const lf = mesh(new THREE.ConeGeometry(0.4, 3, 4), mat(0x3e9a4a)); lf.position.set(Math.cos(k) * 1.2, 6, Math.sin(k) * 1.2); lf.rotation.set(Math.sin(k) * 1.3, 0, Math.cos(k) * 1.3); p.add(lf); } p.position.set((br() - 0.5) * 300, 0, 10 + br() * 60); beach.add(p); }
for (let i = 0; i < 20; i++) { const u = new THREE.Group(); const pole = box(0.08, 2.4, 0.08, mat(0xffffff)); pole.position.y = 1.2; u.add(pole); const top = mesh(new THREE.ConeGeometry(1.4, 0.6, 8), mat([0xe74c3c, 0xf1c40f, 0x3498db, 0xffffff][i % 4])); top.position.y = 2.5; u.add(top); const towel = box(0.9, 0.02, 1.8, mat([0xff7aa2, 0x55c1ff, 0xffd24a][i % 3])); towel.position.set(0.8, 0.02, 0.3); u.add(towel); u.position.set((br() - 0.5) * 140, 0, -10 + br() * 30); beach.add(u); }
const daleB = makeGuy({ ...L.DALE }); addCup(daleB); beach.add(daleB.root);
const sandPuff = L.makePuff(beach, 60, 0xeed9a6, 0.75, 8);
const bTrailG = new THREE.BufferGeometry(); bTrailG.setAttribute('position', new THREE.Float32BufferAttribute(new Array(200 * 3).fill(0), 3));
const bTrail = new THREE.Line(bTrailG, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })); bTrail.frustumCulled = false; beach.add(bTrail);
const ship = new THREE.Group(); { const h = box(30, 6, 8, mat(0x222a35)); h.position.y = 3; ship.add(h); const c = box(10, 6, 7, mat(0xffffff)); c.position.set(-6, 9, 0); ship.add(c); const f = mesh(new THREE.CylinderGeometry(1.4, 1.4, 5, 12), mat(0xc0392b)); f.position.set(-4, 14, 0); ship.add(f); }
ship.position.set(-60, 0, -700); beach.add(ship);
const cloudsB = new THREE.Group(); beach.add(cloudsB); for (let i = 0; i < 40; i++) { const c = mesh(new THREE.IcosahedronGeometry(10 + br() * 14, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, roughness: 1 }), false, false); c.position.set((br() - 0.5) * 2000, 140 + br() * 60, -200 - br() * 2600); c.scale.set(2.5, 0.7, 1.4); cloudsB.add(c); }

// space
const S = L.buildSpace(); const daleS = makeGuy({ ...L.DALE }); addCup(daleS); S.scene.add(daleS.root);
// dark worse room
const worseSc = new THREE.Scene(); worseSc.background = new THREE.Color(0x14060a); const wl = new THREE.PointLight(0xff3020, 30, 12, 2); wl.position.set(1.5, 2.2, 2.5); worseSc.add(wl); worseSc.add(new THREE.AmbientLight(0x200810, 1.0)); const daleW = makeGuy({ ...L.DALE }); addCup(daleW); worseSc.add(daleW.root);
// lab
const lab = L.buildLab(); const tape = L.tapeMeasure(8, 'm'); tape.position.set(4.2, 0.01, 0.6); lab.scene.add(tape); const daleL = makeGuy({ ...L.DALE }); addCup(daleL); lab.scene.add(daleL.root);
const prints = L.makeInstanced(new THREE.BoxGeometry(0.12, 0.01, 0.26), mat(0x5a3b22), 12); prints.castShadow = false; lab.scene.add(prints);

function makeDots(scene, n = 160, color = 0xffffff) { const im = L.makeInstanced(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 }), n); im.castShadow = false; scene.add(im); L.hideAll(im); return im; }
function dotsAlong(im, f, k, size) { const n = im.count; for (let i = 0; i < n; i++) { const q = k * i / (n - 1); const p = f(q); const sz = k <= 0 ? 0 : size * (0.35 + 0.65 * i / (n - 1)); L._m.compose(p, L._q.identity(), L._s.setScalar(sz)); im.setMatrixAt(i, L._m); } im.instanceMatrix.needsUpdate = true; }
const tDots = makeDots(ts); const bDots = makeDots(beach);
// ---------- motion helpers ----------
function leapPose(g, k) { // k 0..1 through leap
  const s = Math.sin(Math.PI * clamp(k));
  g.lL.hip.rotation.x = -1.0 * s; g.lR.hip.rotation.x = 0.9 * s; g.lL.kn.rotation.x = 0.3 * s; g.lR.kn.rotation.x = 0.6 * s;
  g.aL.sh.rotation.x = 0.8 * s; g.aR.sh.rotation.x = -1.4 * s; g.aR.el.rotation.x = -0.6; g.aL.sh.rotation.z = 0.12 + 0.6 * s;
  setFace(g, { lid: 0.2, brow: 0.6 * s, mouth: 0.4 * s });
}
function arc(p0, p1, h, k) { const p = p0.clone().lerp(p1, clamp(k)); p.y += 4 * h * clamp(k) * (1 - clamp(k)); return p; }
function writeTrail(geo, f, k) { const pa = geo.attributes.position; for (let i = 0; i < 200; i++) { const p = f(Math.min(k, 1) * i / 199); pa.setXYZ(i, p.x, p.y, p.z); } pa.needsUpdate = true; }

function shots() {
  const L2 = H.LINES[1].t, drv = line('Leaving').t, land = line('He landed').t, next1 = line('Next one').t;
  return [['establish', 0, L2], ['setup', L2, A[1] - 0.25], ['step1', A[1] - 0.25, A[3] - 0.25], ['car', A[3] - 0.25, A[5] - 0.25], ['bus', A[5] - 0.25, A[7] - 0.25], ['aerial', A[7] - 0.25, A[9] - 0.25],
    ['nexttown', A[9] - 0.25, A[12] - 0.25], ['beach', A[12] - 0.25, A[15] - 0.25], ['ocean', A[15] - 0.25, H.worse.t], ['worse', H.worse.t, A[18] - 0.1], ['planet', A[18] - 0.1, land], ['back', land, H.fact.t], ['fact', H.fact.t, TL.dur + 1]];
}
function townReset() { ts.fog.far = 260; trail.visible = false; L.hideAll(tDots); dale.root.scale.setScalar(1); L.hideAll(dust); resetPose(dale); dale.root.rotation.set(0, Math.PI / 2, 0); bus.position.set(34, 0, 14.5); }
function renderShot(name, lt, dur, t) {
  switch (name) {
    case 'establish': { townReset(); dale.root.position.set(-20, 0, 8.6); walkPose(dale, t * 9, 1); const k = ease(lt / dur); setCam(V(lerp(-60, -45, k), lerp(34, 26, k), lerp(50, 40, k)), V(0, 2, 8), 40); return ts; }
    case 'setup': {
      townReset(); const k = lt / dur; dale.root.position.set(-20 + lt * 1.2, 0, 8.6); walkPose(dale, t * 9, 1); setFace(dale, { lid: 0.3, brow: 0.7, mouth: 0.2 });
      driver.neckG.rotation.y = 0.5; blinkAt(driver, t);
      if (t < line('Leaving').t - 0.1) setCam(V(-15 + lt, 1.6, 13), V(-19 + lt * 1.2, 1.4, 8.6), 38);
      else { setCam(V(-26, 1.3, 11.5), V(10, 2.2, 12), 40); }
      return ts;
    }
    case 'step1': { townReset(); const x0 = -40; const tt = t - A[1]; dale.root.position.set(x0 + Math.max(0, tt) * 0.9, 0, 8.6); walkPose(dale, Math.max(0, tt) * 9, 1); setFace(dale, { lid: 0.4, brow: 0.3 }); blinkAt(dale, t); setCam(V(x0 + 1.5 + lt * 0.8, 1.3, 14.5), V(x0 + 1 + lt * 0.8, 1.1, 8.6), 38); return ts; }
    case 'car': {
      townReset(); const tt = t - A[3]; const k = clamp(tt / 0.9); const p = arc(V(-15.4, 0, 9.8), V(-9.1, 0, 9.8), 2.6, k); dale.root.position.copy(p); dale.root.position.z = 9.8; leapPose(dale, k);
      if (tt > 0.9) { resetPose(dale); setFace(dale, { lid: 0.4, brow: 0.9, mouth: 0.3 }); L.puffAt(dust, V(-9.1, 0.1, 9.8), V(0, 0.2, 0), tt - 0.9, 0.6, 1.5); }
      setCam(V(-12.3, 2.4, 25), V(-12.3, 2.0, 9.8), 46); return ts;
    }
    case 'bus': {
      townReset(); const tt = t - A[5]; const k = clamp(tt / 1.6); const p0 = V(4, 0, 12), p1 = V(61, 0, 12);
      const p = arc(p0, p1, 16, k); dale.root.position.copy(p); leapPose(dale, k); bus.position.set(32 + lt * 2, 0, 14.5);
      dotsAlong(tDots, q => arc(p0, p1, 16, q).add(V(0, 1.2, 0)), k, 0.18);
      if (tt > 1.6) { resetPose(dale); setFace(dale, { lid: 0.3, brow: 0.9, mouth: 0.4 }); dale.root.rotation.y = -Math.PI / 2 + 0.3; L.puffAt(dust, V(61, 0.1, 12), V(0, 0.2, 0), tt - 1.6, 1.2, 1.5); }
      dale.root.scale.setScalar(1.6); setCam(V(32, 5, 52), V(lerp(20, 45, ease(k)), 8, 12), 50, tt > 1.55 && tt < 1.9 ? 0.15 : 0, t); return ts;
    }
    case 'aerial': {
      townReset(); const tt = t - A[7]; const k = clamp(tt / 2.4); const p0 = V(-60, 0, 12), p1 = V(450, 0, 12);
      const p = arc(p0, p1, 90, k); dale.root.position.copy(p); dale.root.scale.setScalar(9); leapPose(dale, k); dotsAlong(tDots, q => arc(p0, p1, 90, q).add(V(0, 8, 0)), k, 1.6);
      bus.position.set(34, 0, 14.5);
      ts.fog.far = 3000; setCam(V(lerp(-160, -110, lt / dur), 110, 170), dale.root.position, 52); return ts;
    }
    case 'nexttown': {
      townReset(); dale.root.scale.setScalar(1); const tt = t - A[9];
      if (tt < 0.25) { setCam(V(72, 1.2, 14), V(80, 4, 7), 50); dale.root.position.set(0, -50, 0); }
      else if (tt < 2.0) { const k = clamp((tt - 0.25) / 0.5); const p = arc(V(60, 60, 9.5), V(77, 0, 9.5), 2, ease(k)); dale.root.position.copy(p); if (k >= 1) { resetPose(dale); setFace(dale, { lid: 0.45, brow: 0.2 }); blinkAt(dale, t); dale.neckG.rotation.y = Math.sin(t * 3) * 0.4; L.puffAt(dust, V(77, 0.1, 9.5), V(0, 0.2, 0), tt - 0.75, 1.6, 2); } else leapPose(dale, 0.8); L.shockwave(T, V(77, 0, 9.5), tt - 0.75, 40, 1.5); setCam(V(72, 1.4, 16), V(78, 2.8, 8), 46, tt > 0.7 && tt < 1.1 ? 0.12 : 0, t); }
      else { T.ring.visible = T.dome.visible = false; const k = clamp((tt - 2.0) / 1.2); const p = arc(V(77, 0, 9.5), V(400, 0, 9.5), 120, k); dale.root.position.copy(p); dale.root.scale.setScalar(1 + k * 6); leapPose(dale, k); dotsAlong(tDots, q => arc(V(77, 0, 9.5), V(400, 0, 9.5), 120, q).add(V(0, 1.5, 0)), k, 0.6); setCam(V(62, 2.5, 13), dale.root.position.clone().add(V(0, 2, 0)), 52); }
      return ts;
    }
    case 'beach': {
      L.hideAll(bDots); daleB.root.scale.setScalar(1); resetPose(daleB); daleB.root.rotation.set(0, Math.PI, 0); const tt = t - A[12];
      if (tt < 1.3) { const k = clamp((tt + 0.25) / 1.1); const p = arc(V(0, 70, 120), V(0, 0, 4), 3, ease(k)); daleB.root.position.copy(p); leapPose(daleB, 0.7); if (k >= 1) { resetPose(daleB); setFace(daleB, { lid: 0.4, brow: 0.6 }); } L.puffAt(sandPuff, V(0, 0.2, 4), V(0, 0.4, 0), tt - 0.85, 2.2, 2.5); setCam(V(5, 1.6, 12), V(0, 1.4, 3), 44, tt > 0.8 && tt < 1.2 ? 0.1 : 0, t); bTrail.visible = false; }
      else { L.puffAt(sandPuff, V(0, 0.2, 4), V(0, 0.4, 0), tt - 0.85, 2.2, 2.5); const k = clamp((tt - 1.6) / 1.6); const p0 = V(0, 0, 4), p1 = V(0, 0, -3000); const p = arc(p0, p1, 700, k); daleB.root.position.copy(p); if (tt < 1.6) { setFace(daleB, { lid: 0.35, brow: 0.2 }); blinkAt(daleB, t); } else leapPose(daleB, k); bTrail.visible = false; daleB.root.scale.setScalar(1 + k * 70); if (tt > 1.6) dotsAlong(bDots, q => arc(p0, p1, 700, q).add(V(0, 1.5, 0)), k, 1.2 + k * 12); else L.hideAll(bDots); setCam(V(8, 2.4, 20), daleB.root.position.clone().add(V(0, 1.4 * (1 + k * 70), 0)), 50); }
      return beach;
    }
    case 'ocean': {
      const tt = t - A[15]; const k = clamp(tt / 4.5); const p0 = V(-400, 0, -400), p1 = V(3600, 0, -400); const p = arc(p0, p1, 420, k);
      daleB.root.position.copy(p); daleB.root.scale.setScalar(6); daleB.root.rotation.set(0, Math.PI / 2, 0); leapPose(daleB, k); bTrail.visible = false; dotsAlong(bDots, q => arc(p0, p1, 420, q).add(V(0, 8, 0)), k, 2.2);
      ship.position.set(lerp(200, 260, k), 0, -380);
      const c = p.clone(); setCam(V(c.x - 40, c.y + 12, c.z + 60), c.clone().add(V(10, 0, 0)), 42); return beach;
    }
    case 'worse': { daleB.root.scale.setScalar(1); resetPose(daleW); daleW.root.position.set(0, 0, 0); const k = lt / dur; leapPose(daleW, 0.5); setFace(daleW, { lid: 0.1, brow: 1, mouth: 0.6 }); daleW.root.rotation.set(0, 0.4, 0); setCam(V(0.4, 1.7, lerp(1.9, 1.5, k)), V(0, 1.75, 0), 34, 0.006, t); return worseSc; }
    case 'planet': {
      const tt = Math.max(0, t - A[18]); const k = clamp(tt / 3.6); S.earth.position.set(0, 0, 0); S.atmo.position.set(0, 0, 0); S.earth.rotation.y = t * 0.08;
      const loop = q => { const a = q * Math.PI * 2 * 2.26 - 1.2; const rr = 21.5 + Math.sin(q * Math.PI) * 1.5; return V(Math.cos(a) * rr, Math.sin(a * 0.5) * 3 + Math.sin(q * 40) * 0.0, Math.sin(a) * rr); };
      S.trail.visible = true; L.setTrail(S, i => loop(k * i / 399));
      daleS.root.position.copy(loop(k)); daleS.root.scale.setScalar(0.9); leapPose(daleS, (k * 9) % 1);
      if (lt < 2.8) setCam(V(0, 38, 62), V(0, 0, 0), 40); else { const p = daleS.root.position; setCam(V(p.x * 1.15, p.y + 2.2, p.z * 1.15 + 1), p, 46); }
      return S.scene;
    }
    case 'back': {
      townReset(); trail.visible = false; T.ring.visible = T.dome.visible = false; dale.root.scale.setScalar(1);
      const tt = lt; const k = clamp(tt / 0.6); const p = arc(V(26, 12, 8.6), V(27, 0, 8.6), 1, ease(k)); dale.root.position.copy(p); dale.root.rotation.y = Math.PI / 2 - 0.2;
      if (k < 1) leapPose(dale, 0.8); else { resetPose(dale); setFace(dale, { lid: 0.55, brow: -0.2 }); dale.aR.sh.rotation.x = -1.2; dale.aR.el.rotation.x = -0.9; }
      L.puffAt(dust, V(27, 0.1, 8.6), V(0, 0.2, 0), tt - 0.6, 1.2, 2);
      bus.position.set(34 + Math.max(0, tt - 1.2) * 3 + Math.max(0, tt - 1.2) ** 2, 0, 14.5);
      const nl = line('Next one').t;
      if (t < nl - 0.05) setCam(V(19.5, 2.0, 9.2), V(28, 1.6, 9.6), 44);
      else setCam(V(29.6, 1.65, 10.8), V(27, 1.55, 8.6), 40);
      return ts;
    }
    case 'fact': {
      resetPose(daleL); daleL.root.rotation.set(0, Math.PI / 2, 0); const x = Math.min(lt * 1.1, 7.4); daleL.root.position.set(x, 0, 0); if (x < 7.4) walkPose(daleL, lt * 6.3, 0.8); else { setFace(daleL, { lid: 0.45 }); blinkAt(daleL, t); }
      const nP = Math.min(12, Math.floor(x / 0.7) + 1); for (let i = 0; i < 12; i++) { L._m.compose(L._p.set(i * 0.7 + 0.1, 0.012, i % 2 ? 0.12 : -0.12), L._q.identity(), L._s.setScalar(i < nP ? 1 : 0)); prints.setMatrixAt(i, L._m); } prints.instanceMatrix.needsUpdate = true;
      setCam(V(lerp(1.5, 6, ease(lt / dur)), 3.2, 6.8), V(lerp(1.5, 6, ease(lt / dur)), 0.6, 0.3), 42); return lab.scene;
    }
  }
}
const rungs = [['0.7', 'm', 1, 'A NORMAL STEP', 0.7], ['6.3', 'm', 3, 'LONGER THAN A CAR', 6.3], ['57', 'm', 5, 'OVER A CITY BUS', 57], ['510', 'm', 7, 'FIVE FOOTBALL FIELDS', 510], ['4.6', 'km', 9, 'THE NEXT TOWN', 4593], ['124', 'km', 12, 'TO THE BEACH', 124002], ['3,348', 'km', 15, 'ACROSS AN OCEAN', 3348056], ['90,398', 'km', 18, '2.26× AROUND EARTH', 90397509]]
  .map(([v, unit, n, cmp, raw], i) => ({ v, unit, n, cmp, raw, at: A[n], gold: i === 7 }));
const overlay = L.makeOverlay({ lines: H.LINES, titleL1: 'What if every step you took was', titleHi: '3× longer', titleL2: ' than the last?', titleSize: 78, hudLabel: r => 'STEP ' + r.n + '   ·   LENGTH', rule: '×3 EVERY STEP', rungs, barMin: 0.5, barMax: 1.5e8, barMarks: [[4593, 'TOWN'], [40075000, 'EARTH']], fact: { big: '0.7', unit: 'm', sub: 'AVERAGE STEP · ~57 MILLION STEPS AROUND EARTH' }, hideHUD: ['worse', 'fact'], flashBig: [A[18]], flashSmall: [A[9] + 0.55, A[12] + 0.6] });
L.makeFrame(shots, renderShot, overlay);

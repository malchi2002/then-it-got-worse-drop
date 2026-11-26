import * as L from '/lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, easeOut, lerp, setCam, rng, makeGuy, setFace, resetPose, blinkAt } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const A = {}; TL.tl.filter(x => x.type === 'act').forEach(x => A[x.n] = x.blast);
const line = H.line;
const NS = [1, 3, 5, 7, 9, 11, 22];
const hN = n => 0.1 * Math.pow(3, n - 1);
// stalk height at time t (meters)
function stalkH(t) { let h = 0.0; for (const n of NS) { if (t > A[n]) { const q = easeOut(clamp((t - A[n]) / 0.9)); const prev = h; h = lerp(prev, hN(n), q); } } return h; }
// ---------- beanstalk builder: unit height 1 ----------
const stalkM = mat(0x3f9a3a, { r: 0.7 }), leafM = new THREE.MeshStandardMaterial({ color: 0x5cc24a, roughness: 0.6, side: THREE.DoubleSide });
function makeStalk(seed = 1) {
  const g = new THREE.Group(); const pts = []; for (let i = 0; i <= 60; i++) { const y = i / 60; pts.push(V(Math.sin(y * 9) * 0.05, y, Math.cos(y * 7) * 0.05)); }
  const curve = new THREE.CatmullRomCurve3(pts); const tube = mesh(new THREE.TubeGeometry(curve, 160, 0.028, 10), stalkM); g.add(tube);
  const vine = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p, i) => p.clone().add(V(Math.cos(i * 0.9) * 0.03, 0, Math.sin(i * 0.9) * 0.03)))), 200, 0.008, 6), mat(0x2f7a2a)); g.add(vine);
  const r = rng(seed); const lg = new THREE.SphereGeometry(0.06, 10, 6); lg.scale(1, 0.12, 0.55); lg.translate(0.06, 0, 0);
  for (let i = 0; i < 26; i++) { const y = 0.08 + i * 0.035; const p = curve.getPoint(y); const lf = mesh(lg, leafM); lf.position.copy(p); lf.rotation.set(0, i * 2.2, 0.4 + r() * 0.3); g.add(lf); }
  const top = mesh(new THREE.SphereGeometry(0.05, 10, 8), leafM); top.position.copy(curve.getPoint(1)); g.add(top);
  return g;
}
function sizeStalk(g, hgt, cap = 900) { g.visible = hgt > 0.005; const s = Math.max(hgt, 0.001); const w = Math.min(s, cap); g.scale.set(w, s, w); }
// ---------- garden ----------
const town = L.buildTown({ sky: 'day', seed: 77, low: true, skip: [[0, 0], [-1, 0], [0, -1], [-1, -1]] }); const ts = town.scene; L.cam.far = 5000;
town.buildings.forEach(B => { if (Math.abs(B.b.position.x) < 20 && Math.abs(B.b.position.z) < 16) B.b.visible = false; });
const grass = mesh(new THREE.PlaneGeometry(30, 22), mat(0x77c25e, { r: 1 })); grass.rotation.x = -Math.PI / 2; grass.position.set(0, 0.03, -2); ts.add(grass);
const house = new THREE.Group(); { const b = box(8, 5, 6, mat(0xf0e2c4)); b.position.y = 2.5; house.add(b); const roof = mesh(new THREE.ConeGeometry(6, 3, 4), mat(0xb5483a)); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.78); roof.position.y = 6.5; house.add(roof); const door = box(1.1, 2.1, 0.05, mat(0x6a3f22)); door.position.set(0, 1.05, 3.02); house.add(door); for (const x of [-2.6, 2.6]) { const w = box(1.4, 1.2, 0.05, mat(0x9fd6f0, { r: 0.1 })); w.position.set(x, 2.8, 3.02); house.add(w); } }
house.position.set(-2, 0, -9); ts.add(house);
const fenceM = mat(0xf6f1e6); for (let i = -14; i <= 14; i += 0.8) { const p = box(0.12, 1.1, 0.06, fenceM); p.position.set(i, 0.55, 5); ts.add(p); } { const rail = box(28.5, 0.1, 0.05, fenceM); rail.position.set(0, 0.85, 5); ts.add(rail); }
const pot = new THREE.Group(); { const p = mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.3, 18), mat(0xc4672f)); p.position.y = 0.15; pot.add(p); const soil = mesh(new THREE.CircleGeometry(0.2, 18), mat(0x4a3020)); soil.rotation.x = -Math.PI / 2; soil.position.y = 0.29; pot.add(soil); } pot.position.set(1.5, 0, 0); ts.add(pot);
const stalk = makeStalk(3); stalk.position.set(1.5, 0.28, 0); ts.add(stalk);
const dog = new THREE.Group(); { const dm = mat(0xc9924f); const b = box(0.6, 0.3, 0.28, dm); b.position.y = 0.45; dog.add(b); const hd = box(0.26, 0.24, 0.24, dm); hd.position.set(0.38, 0.65, 0); dog.add(hd); const sn = box(0.12, 0.1, 0.14, mat(0xa87540)); sn.position.set(0.55, 0.6, 0); dog.add(sn); for (const z of [-0.1, 0.1]) { const e = mesh(new THREE.SphereGeometry(0.025, 8, 6), mat(0x111111)); e.position.set(0.5, 0.7, z); dog.add(e); const ear = box(0.06, 0.12, 0.06, mat(0x7a5030)); ear.position.set(0.32, 0.8, z); dog.add(ear); } for (const [x, z] of [[-0.22, -0.1], [-0.22, 0.1], [0.22, -0.1], [0.22, 0.1]]) { const l = box(0.08, 0.3, 0.08, dm); l.position.set(x, 0.15, z); dog.add(l); } const tail = box(0.25, 0.05, 0.05, dm); tail.position.set(-0.4, 0.6, 0); tail.rotation.z = 0.6; dog.add(tail); dog.userData.tail = tail; }
dog.position.set(2.4, 0, 0.4); dog.rotation.y = 2.6; ts.add(dog);
const dale = makeGuy({ ...L.DALE }); ts.add(dale.root);
const can = new THREE.Group(); { const cm = mat(0x3f8fd0, { m: 0.4, r: 0.4 }); const b = mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.22, 16), cm); can.add(b); const sp = mesh(new THREE.CylinderGeometry(0.015, 0.025, 0.3, 8), cm); sp.rotation.z = -1.0; sp.position.set(0.18, 0.06, 0); can.add(sp); can.userData.tip = V(0.31, 0.14, 0); }
dale.aR.grip.add(can); can.position.set(0, -0.12, 0.08); can.rotation.y = -Math.PI / 2;
const neighbor = makeGuy({ wood: 0xd9b48a, cap: 0x3a6a3a, glasses: true }); neighbor.root.position.set(-1.2, 0, 6.2); neighbor.root.rotation.y = Math.PI; ts.add(neighbor.root);
const drops = L.makeInstanced(new THREE.SphereGeometry(0.015, 6, 5), new THREE.MeshStandardMaterial({ color: 0x8fd0ff, transparent: true, opacity: 0.85 }), 40); drops.castShadow = false; ts.add(drops);
// ---------- high sky ----------
const sky = new THREE.Scene(); sky.background = new THREE.Color(0x6fa8e8); sky.fog = new THREE.Fog(0x8fbcee, 3000, 14000);
sky.add(new THREE.HemisphereLight(0xeaf4ff, 0x8a9aa8, 1.2)); { const s = new THREE.DirectionalLight(0xfff4e0, 2.6); s.position.set(1, 1.2, 0.6); sky.add(s); }
const cloudM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true });
{ const r = rng(12); for (let i = 0; i < 160; i++) { const c = mesh(new THREE.IcosahedronGeometry(150 + r() * 250, 1), cloudM, false, false); c.scale.y = 0.35; c.position.set((r() - 0.5) * 9000, 2000 + r() * 150, (r() - 0.5) * 9000); sky.add(c); } }
const stalkS = makeStalk(3); sky.add(stalkS);
const plane = new THREE.Group(); { const pm = mat(0xf4f6f8, { r: 0.4 }); const f = mesh(new THREE.CylinderGeometry(2, 2, 30, 14), pm); f.rotation.z = Math.PI / 2; plane.add(f); const nose = mesh(new THREE.SphereGeometry(2, 14, 10), pm); nose.position.x = 15; plane.add(nose); const w = box(8, 0.4, 34, pm); plane.add(w); const tf = box(4, 6, 0.4, mat(0xd9301f)); tf.position.set(-13, 3.5, 0); plane.add(tf); const ts2 = box(4, 0.3, 12, pm); ts2.position.set(-13, 0.5, 0); plane.add(ts2); for (let i = 0; i < 8; i++) for (const z of [-2.01, 2.01]) { const wn = box(0.8, 0.6, 0.05, mat(0x223344)); wn.position.set(-8 + i * 2.6, 0.6, z); plane.add(wn); } }
sky.add(plane);
// ---------- space ----------
const S = L.buildSpace(); const SPACE_UNIT = 20 / 6.371e6; // scene units per meter
const stalkSp = new THREE.Group(); { const c = mesh(new THREE.CylinderGeometry(0.25, 0.6, 1, 10, 1, true), stalkM); c.position.y = 0.5; stalkSp.add(c); } S.scene.add(stalkSp);
const MOONP = V(140, 20, -160); const STDIR = MOONP.clone().normalize().add(V(0, 0.18, 0)).normalize();
stalkSp.quaternion.setFromUnitVectors(V(0, 1, 0), STDIR); stalkSp.position.copy(STDIR.clone().multiplyScalar(19.8));
// ---------- worse / lab ----------
const wsc = new THREE.Scene(); wsc.background = new THREE.Color(0x14060a); const wl = new THREE.PointLight(0xff3020, 30, 12, 2); wl.position.set(0.8, 2.0, 2.0); wsc.add(wl); wsc.add(new THREE.AmbientLight(0x200810, 1)); const daleW = makeGuy({ ...L.DALE }); wsc.add(daleW.root);
const canW = can.clone(); daleW.aR.grip.add(canW);
const lab = L.buildLab({ bg: 0xe6f0e0, floor: 0xd8e4d0 }); const daleL = makeGuy({ ...L.DALE }); daleL.root.position.set(-0.6, 0, 0); lab.scene.add(daleL.root);
const bamboo = new THREE.Group(); { const bm = mat(0x8fbf4a, { r: 0.5 }); for (let i = 0; i < 6; i++) { const seg = mesh(new THREE.CylinderGeometry(0.07, 0.075, 0.3, 14), bm); seg.position.y = 0.16 + i * 0.32; bamboo.add(seg); const ring = mesh(new THREE.TorusGeometry(0.075, 0.012, 6, 16), mat(0x6f9a38)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.32 + i * 0.32; bamboo.add(ring); } } bamboo.position.set(0.5, 0, -0.1); lab.scene.add(bamboo);
{ const tp = L.tapeMeasure(1, 'm', 1.1); tp.rotation.set(0, 0, Math.PI / 2); tp.position.set(0.78, 0.6, -0.1); lab.scene.add(tp); }

function shots() {
  const L2 = H.LINES[1].t, still = line('Dale still').t;
  return [['establish', 0, L2], ['setup', L2, A[1] - 0.7], ['g1', A[1] - 0.7, A[3] - 0.6], ['g3', A[3] - 0.6, A[5] - 0.6], ['g5', A[5] - 0.6, A[7] - 0.6], ['g7', A[7] - 0.6, A[9] - 0.6], ['g9', A[9] - 0.6, A[11] - 0.6], ['g11', A[11] - 0.6, H.worse.t], ['worse', H.worse.t, A[22] - 0.4], ['space', A[22] - 0.4, still], ['end', still, H.fact.t], ['fact', H.fact.t, TL.dur + 1]];
}
function gReset(t) { resetPose(dale); dale.root.position.set(1.0, 0, 0.75); dale.root.rotation.set(0, 2.5, 0); blinkAt(dale, t); ts.fog.near = 60; ts.fog.far = 260; L.hideAll(drops); house.visible = true; house.scale.set(1, 1, 1); dog.visible = true; neighbor.root.visible = true; resetPose(neighbor); }
function pour(t, act) { const dt = t - act; const on = dt > -0.6 && dt < 0.3; dale.aR.sh.rotation.set(on ? -1.0 : -0.3, 0, -0.15); dale.aR.el.rotation.x = on ? -0.3 : -0.2; can.rotation.z = on ? -0.6 : 0; if (!on) { L.hideAll(drops); return; }
  dale.root.updateMatrixWorld(true); const tip = can.localToWorld(can.userData.tip.clone()); for (let i = 0; i < 40; i++) { const q = ((t * 2.5 + i / 40) % 1); const p = tip.clone().lerp(V(1.5, 0.3, 0), q); p.y += Math.sin(q * Math.PI) * 0.05; L._m.compose(p, L._q.identity(), L._s.setScalar(1)); drops.setMatrixAt(i, L._m); } drops.instanceMatrix.needsUpdate = true; }
function lookUpFace(g, k) { g.neckG.rotation.x = -0.5 * k; setFace(g, { lid: 0.05, brow: 1, mouth: 0.4 * k }); }
function renderShot(name, lt, dur, t) {
  L.cam.far = 5000; const h = stalkH(t); sizeStalk(stalk, h);
  switch (name) {
    case 'establish': { gReset(t); const k = ease(lt / dur); setCam(V(lerp(9, 7, k), lerp(5, 3.6, k), lerp(11, 9, k)), V(0.5, 1.2, -1), 46); return ts; }
    case 'setup': { gReset(t); const bean = line('It'); const talk = t > bean.t && t < bean.end; setFace(neighbor, { lid: 0.5, brow: 0.2, mouth: talk ? Math.abs(Math.sin(t * 14)) * 0.5 : 0 }); setFace(dale, { lid: 0.3, brow: 0.6, browTilt: 0.2 });
      if (t < bean.t - 0.1) setCam(V(2.7, 1.55, -1.5), V(1.0, 1.25, 0.75), 42); else setCam(V(-0.2, 1.6, 3.6), V(-1.2, 1.5, 6.2), 40); return ts; }
    case 'g1': { gReset(t); pour(t, A[1]); setFace(dale, { lid: 0.3, brow: 0.5 }); setCam(V(2.6, 0.7, 1.6), V(1.4, 0.4, 0.1), 40); return ts; }
    case 'g3': { gReset(t); pour(t, A[3]); dog.userData.tail.rotation.z = 0.6 + Math.sin(t * 20) * 0.4; const k = clamp((t - A[3]) / 0.8); lookUpFace(dale, k * 0.4); setCam(V(3.6, 1.0, 3.2), V(1.7, 0.6, 0), 42); return ts; }
    case 'g5': { gReset(t); pour(t, A[5]); const k = clamp((t - A[5]) / 0.8); lookUpFace(dale, k); dog.rotation.y = 2.6 + k * 0.5; setCam(V(13, 2.2, 14), V(0, 4.2, -3), 48, (t - A[5]) > 0 && (t - A[5]) < 0.6 ? 0.02 : 0, t); return ts; }
    case 'g7': { gReset(t); pour(t, A[7]); lookUpFace(dale, 1); house.scale.y = 1 - 0.3 * clamp((t - A[7]) / 0.5); setCam(V(36, 2, 36), V(1.5, 34, 0), 60, (t - A[7]) > 0 && (t - A[7]) < 0.8 ? 0.03 : 0, t); return ts; }
    case 'g9': { gReset(t); pour(t, A[9]); lookUpFace(dale, 1); house.visible = false; ts.fog.near = 400; ts.fog.far = 3500; const k = ease(lt / dur); setCam(V(lerp(260, 420, k), lerp(60, 160, k), lerp(380, 600, k)), V(0, lerp(140, 300, k), 0), 50, (t - A[9]) > 0 && (t - A[9]) < 0.8 ? 1.0 : 0, t); return ts; }
    case 'g11': { sizeStalk(stalkS, h); stalkS.position.set(0, 0, 0); const dt = t - A[11]; plane.scale.setScalar(4); plane.position.set(lerp(-1100, 1300, clamp(lt / dur)), 5230, 650); plane.rotation.set(0, 0, 0.05);
      setCam(V(lerp(500, 800, lt / dur), 5300, 1700), V(lerp(-100, 300, lt / dur), 5150, 300), 50, 0.05, t); return sky; }
    case 'worse': { resetPose(daleW); daleW.root.rotation.set(0, 0.3, 0); daleW.aR.sh.rotation.set(-1.0, 0, -0.15); canW.rotation.z = -0.6; setFace(daleW, { lid: 0.3, brow: 0.2, mouth: 0.1 }); setCam(V(0.25, 1.65, lerp(1.8, 1.45, lt / dur)), V(0, 1.55, 0), 36, 0.005, t); return wsc; }
    case 'space': { S.earth.rotation.y = 0; S.moon.position.copy(MOONP); const len = Math.max(0.5, h * SPACE_UNIT); stalkSp.scale.set(1, len, 1); stalkSp.children[0].scale.set(1, 1, 1);
      const tip = STDIR.clone().multiplyScalar(19.8 + len);
      if (lt < 1.8) setCam(V(-30, 40, 70), V(0, 10, 0), 50, 0.02, t); else { const k = ease(clamp((lt - 1.8) / 2.2)); setCam(MOONP.clone().add(V(lerp(-20, 30, k), 12, lerp(30, 20, k))), MOONP.clone().lerp(tip, 0.25), 55); }
      return S.scene; }
    case 'end': { gReset(t); house.visible = false; dog.visible = false; neighbor.root.visible = false; sizeStalk(stalk, 1e9, 200); dale.root.position.set(8, 0, 8); dale.root.rotation.set(0, 0.52, 0); dale.aR.sh.rotation.set(-0.3, 0, -0.15); can.rotation.z = 0; const save = line("I'll"); const talk = t > save.t && t < save.end; setFace(dale, { lid: 0.45, brow: 0.3, mouth: talk ? Math.abs(Math.sin(t * 14)) * 0.5 : 0 });
      setCam(V(lerp(10.4, 10.0, lt / dur), 1.6, lerp(12.2, 11.6, lt / dur)), V(5.0, 2.6, 4.8), 48); return ts; }
    case 'fact': { resetPose(daleL); daleL.root.rotation.y = 0.3; setFace(daleL, { lid: 0.35, brow: 0.3 }); blinkAt(daleL, t); const k = ease(lt / dur); setCam(V(lerp(1.3, 1.0, k), 1.5, lerp(3.6, 3.2, k)), V(0.0, 1.25, 0), 46); return lab.scene; }
  }
}
const rungs = [['10', 'cm', 1, 'A SEEDLING', 0.1], ['90', 'cm', 3, 'TALLER THAN THE DOG', 0.9], ['8.1', 'm', 5, 'OVER THE HOUSE', 8.1], ['73', 'm', 7, 'A 20-STORY BUILDING', 72.9], ['656', 'm', 9, '2× EIFFEL TOWER', 656], ['5.9', 'km', 11, 'ABOVE THE CLOUDS', 5905], ['1.05 M', 'km', 22, 'PAST THE MOON', 1.046e9]]
  .map(([v, unit, n, cmp, raw], i) => ({ v, unit, n, cmp, raw, at: A[n], gold: i === 6 }));
const overlay = L.makeOverlay({ lines: H.LINES, titleL1: 'What if every watering made it', titleHi: '3× taller', titleL2: ' than before?', titleSize: 76, hudLabel: r => 'WATERING ' + r.n + '   ·   HEIGHT', rule: '×3 EVERY WATERING', rungs, barMin: 0.05, barMax: 3e9, barMarks: [[8848, 'EVEREST'], [3.844e8, 'MOON']], fact: { big: '91', unit: 'cm', sub: 'BAMBOO · IN ONE DAY' }, hideHUD: ['worse', 'fact', 'end', 'setup'], flashBig: [A[22]], flashSmall: [A[9] + 0.2] });
L.makeFrame(shots, renderShot, overlay);

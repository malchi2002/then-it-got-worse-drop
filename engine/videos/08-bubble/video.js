import * as L from '/lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, lerp, setCam, rng, canvasTex, makeGuy, setFace, resetPose, blinkAt } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const A = {}; TL.tl.filter(x => x.type === 'act').forEach(x => A[x.n] = x.blast);
const line = H.line;
const town = L.buildTown({ sky: 'day', seed: 88, low: true, skip: [[0, 0], [-1, 0], [0, -1], [-1, -1], [0, 1], [-1, 1]] }); const ts = town.scene;
town.buildings.forEach(B => { if (Math.abs(B.b.position.x) < 20 && B.b.position.z > -16 && B.b.position.z < 22) B.b.visible = false; });
const grass = mesh(new THREE.PlaneGeometry(40, 60), mat(0x6fbf5a, { r: 1 }), false, true); grass.rotation.x = -Math.PI / 2; grass.position.set(-4, 0.03, 0); ts.add(grass);
const pond = mesh(new THREE.CircleGeometry(4, 40), new THREE.MeshStandardMaterial({ color: 0x3f8fd0, roughness: 0.15 }), false, true); pond.rotation.x = -Math.PI / 2; pond.position.set(-6, 0.05, -2); ts.add(pond);
const ducks = []; for (let i = 0; i < 4; i++) { const d = new THREE.Group(); const b = mesh(new THREE.SphereGeometry(0.18, 12, 8), mat(i % 2 ? 0xffffff : 0xe8d070)); b.scale.set(1.3, 0.8, 1); d.add(b); const hd = mesh(new THREE.SphereGeometry(0.09, 10, 8), mat(0x2e8a4a)); hd.position.set(0.2, 0.15, 0); d.add(hd); const bk = mesh(new THREE.ConeGeometry(0.03, 0.08, 6), mat(0xf2a030)); bk.rotation.z = -Math.PI / 2; bk.position.set(0.31, 0.15, 0); d.add(bk); d.position.set(-6 + Math.cos(i * 1.6) * 2, 0.12, -2 + Math.sin(i * 1.6) * 2); ts.add(d); ducks.push(d); }
const bench = new THREE.Group(); { const s = box(1.6, 0.08, 0.45, mat(0x8a5a30)); s.position.y = 0.45; bench.add(s); const bk = box(1.6, 0.45, 0.06, mat(0x8a5a30)); bk.position.set(0, 0.75, -0.2); bench.add(bk); for (const x of [-0.7, 0.7]) { const l = box(0.06, 0.45, 0.4, mat(0x333333)); l.position.set(x, 0.22, 0); bench.add(l); } } bench.position.set(2.5, 0, 3.5); bench.rotation.y = -0.4; ts.add(bench);
const dale = makeGuy({ ...L.DALE }); dale.root.position.set(0, 0, 6); ts.add(dale.root);
const kid = makeGuy({ wood: 0xf0c8d8, hair: 0x7a3a1a, shirt: 0xff8a3d }); kid.root.scale.setScalar(0.72); kid.root.position.set(1.6, 0, 7.4); kid.root.rotation.y = -2.2; ts.add(kid.root);
const bubM = new THREE.MeshPhysicalMaterial({ color: 0xff7ac0, roughness: 0.25, clearcoat: 1, transparent: true, opacity: 0.88 });
const bub = mesh(new THREE.SphereGeometry(1, 48, 32), bubM, true, false); ts.add(bub);
const planes = []; for (let i = 0; i < 3; i++) { const p = new THREE.Group(); const f = mesh(new THREE.CylinderGeometry(2, 2, 40, 12), mat(0xffffff)); f.rotation.z = Math.PI / 2; p.add(f); const w = box(6, 0.4, 40, mat(0xdddddd)); p.add(w); const tl = box(3, 6, 0.4, mat(0x2d6ad9)); tl.position.set(-18, 4, 0); p.add(tl); ts.add(p); planes.push(p); p.visible = false; }
const cloudLayer = new THREE.Group(); ts.add(cloudLayer); { const r = rng(9); for (let i = 0; i < 60; i++) { const c = mesh(new THREE.IcosahedronGeometry(200 + r() * 300, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, roughness: 1 }), false, false); c.position.set((r() - 0.5) * 12000, 6000 + r() * 400, (r() - 0.5) * 12000); c.scale.y = 0.35; cloudLayer.add(c); } } cloudLayer.visible = false;
const S = L.buildSpace(); const daleS = makeGuy({ ...L.DALE }); S.scene.add(daleS.root); const bubS = mesh(new THREE.SphereGeometry(1, 64, 48), bubM.clone(), false, false); S.scene.add(bubS);
const shards = L.makeInstanced(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: 0xff7ac0, roughness: 0.4 }), 200); shards.castShadow = false; S.scene.add(shards);
const pinkEarth = new THREE.Color(0xff9ad0);
const wsc = new THREE.Scene(); wsc.background = new THREE.Color(0x14060a); const wl = new THREE.PointLight(0xff3020, 30, 12, 2); wl.position.set(0.8, 2.0, 2.0); wsc.add(wl); wsc.add(new THREE.AmbientLight(0x200810, 1)); const daleW = makeGuy({ ...L.DALE }); wsc.add(daleW.root);
const lab = L.buildLab({ bg: 0xf6e3ee, floor: 0xeed6e2 }); const daleL = makeGuy({ ...L.DALE }); lab.scene.add(daleL.root); const bubL = mesh(new THREE.SphereGeometry(0.254, 32, 24), bubM, true, false); lab.scene.add(bubL);
const ruler = L.tapeMeasure(5, 'dm', 1.6); ruler.rotation.set(0, 0, 0); ruler.position.set(0.95, 1.2, 0.9); ruler.scale.set(0.35, 0.5, 1); lab.scene.add(ruler);

const RAD = { 0: 0, 1: 0.1, 2: 0.3, 3: 0.9, 4: 2.7, 5: 8.1, 7: 73, 11: 5905 };
const order = [1, 2, 3, 4, 5, 7, 11];
function radiusAt(t) { let r = 0.02, prev = 0.02; for (const n of order) { const st = A[n] - 0.45; if (t >= st) { prev = r; r = RAD[n]; if (t < A[n]) return lerp(prev, r, ease((t - st) / 0.45)); } } return r; }
function altAt(t) { if (t < A[4]) return 0; if (t < A[5]) return clamp((t - A[4]) / 2.5) * 3; if (t < A[7]) return 3 + clamp((t - A[5]) / 3) * 25; if (t < A[11]) return 28 + clamp((t - A[7]) / 3) * 300; return 6800; }
const _mw = new THREE.Vector3();
function placeBubble(t, chew = true) {
  const R = radiusAt(t); const lift = t >= A[4] - 0.2; dale.root.position.set(0, altAt(t), 6); dale.root.scale.setScalar(1);
  dale.neckG.rotation.x = lift ? -0.9 : 0; dale.mouth.getWorldPosition(_mw);
  const dir = lift ? V(0, 0.8, 0.6).normalize() : V(0, 0, 1); bub.position.copy(_mw).addScaledVector(dir, R * 0.98); bub.scale.setScalar(Math.max(0.01, R)); bub.visible = R > 0.03;
  if (lift) { dale.aL.sh.rotation.set(0, 0, 0.5 + Math.sin(t * 3) * 0.2); dale.aR.sh.rotation.set(0, 0, -0.5 - Math.sin(t * 3 + 1) * 0.2); dale.lL.hip.rotation.x = Math.sin(t * 4) * 0.4; dale.lR.hip.rotation.x = -Math.sin(t * 4) * 0.4; }
  setFace(dale, { lid: 0.3, brow: 0.4, mouth: 0.25 });
  return R;
}
function shots() {
  const L2 = H.LINES[1].t, bet = line('Bet you').t, popped = line('Then it popped').t;
  return [['establish', 0, L2], ['setup', L2, bet], ['bet', bet, A[1] - 0.7], ['a1', A[1] - 0.7, A[2] - 0.7], ['a2', A[2] - 0.7, A[3] - 0.7], ['a3', A[3] - 0.7, A[4] - 0.7], ['a4', A[4] - 0.7, A[5] - 0.7], ['a5', A[5] - 0.7, A[7] - 0.7], ['a7', A[7] - 0.7, A[11] - 0.7], ['a11', A[11] - 0.7, H.worse.t], ['worse', H.worse.t, A[17] - 0.5], ['space', A[17] - 0.5, popped], ['pop', popped, H.fact.t], ['fact', H.fact.t, TL.dur + 1]];
}
const FRONT = (d, y, dx = 0.3, ly = 1.75) => [V(dx, y, 6 + d), V(0, ly, 6)];
function renderShot(name, lt, dur, t) {
  resetPose(dale); planes.forEach(p => p.visible = false); cloudLayer.visible = false; ts.fog.near = 60; ts.fog.far = 260; L.cam.far = 4000;
  ducks.forEach((d, i) => { d.position.y = 0.12 + Math.sin(t * 2 + i) * 0.02; d.rotation.y = t * 0.3 + i; });
  resetPose(kid); setFace(kid, { lid: 0.35, brow: 0.3 }); blinkAt(kid, t, 1);
  switch (name) {
    case 'establish': { placeBubble(t); const k = ease(lt / dur); setCam(V(lerp(-22, -16, k), lerp(14, 10, k), 22), V(-2, 1, 3), 46); return ts; }
    case 'setup': { placeBubble(t); dale.mouth.scale.y = 1 + Math.abs(Math.sin(t * 6)) * 2; blinkAt(dale, t); const [p, l] = FRONT(2.6, 1.9, 0.6, 1.6); setCam(p, l, 42); return ts; }
    case 'bet': { placeBubble(t); setFace(kid, { lid: 0.4, brow: -0.4, browTilt: 0.2, mouth: Math.abs(Math.sin(t * 13)) * 0.5 }); kid.aR.sh.rotation.set(-1.3, 0, -0.2); setCam(V(0.3, 1.15, 6.5), V(1.6, 1.0, 7.4), 42); return ts; }
    case 'a1': case 'a2': { placeBubble(t); setFace(dale, { lid: 0.2, brow: 0.6, mouth: 0.25 }); const [p, l] = FRONT(name === 'a1' ? 1.6 : 2.4, 1.95, 0.55, 1.8); setCam(p, l, 40); return ts; }
    case 'a3': { placeBubble(t); ducks.forEach((d, i) => { d.position.x -= clamp((t - A[3]) / 1) * 1.5; d.rotation.z = Math.sin(t * 20 + i) * 0.2; }); if (lt < 1.8) { const [p, l] = FRONT(4.2, 2.2, 1.0, 1.8); setCam(p, l, 46); } else setCam(V(-3, 1.0, 3), V(-6, 0.4, -2), 46); setFace(kid, { lid: 0.0, brow: 1, mouth: 0.8 }); return ts; }
    case 'a4': { const R = placeBubble(t); setFace(kid, { lid: 0.0, brow: 1, mouth: 0.9 }); kid.aL.sh.rotation.set(-2.6, 0, 0.2); setCam(V(3.5, 0.8, 14), V(0, 2.5 + dale.root.position.y, 6), 50); return ts; }
    case 'a5': { placeBubble(t); const y = dale.root.position.y; if (lt < 1.8) setCam(V(-6, 2, 22), V(0, y + 6, 6), 52); else setCam(V(10, y + 4, 22), V(0, y + 6, 6), 48); return ts; }
    case 'a7': { placeBubble(t); ts.fog.far = 1500; const y = dale.root.position.y; setCam(V(-180, y - 40, 260), V(0, y + 30, 6), 46); return ts; }
    case 'a11': { placeBubble(t); ts.fog.far = 60000; ts.fog.near = 5000; L.cam.far = 100000; cloudLayer.visible = true; const y = dale.root.position.y;
      planes.forEach((p, i) => { p.visible = true; p.position.set(lerp(-3000, 3000, ((lt * 0.25 + i * 0.33) % 1)), y - 1500 - i * 600, -800 + i * 900); });
      if (true) setCam(V(16000, y - 1500, 16000), V(0, y + 3000, 2000), 50); else setCam(V(900, y - 2600, 1500), V(0, y + 2500, 3000), 60); return ts; }
    case 'worse': { resetPose(daleW); daleW.root.rotation.set(0, 0.3, 0); const k = lt / dur; setFace(daleW, { lid: 0.1, brow: 1, mouth: 0.5 }); daleW.neckG.rotation.x = -0.3 * k; setCam(V(0.25, 1.7, lerp(1.8, 1.45, k)), V(0, 1.68, 0), 36, 0.004, t); return wsc; }
    case 'space': { S.earth.position.set(0, 0, 0); S.atmo.position.set(0, 0, 0); S.earth.material.color.set(0xffffff); S.earth.rotation.y = t * 0.05; L.hideAll(shards);
      const k = ease(clamp((t - A[17] + 0.5) / 1.0)); const Rb = lerp(1.85, 40.5, k); const mp = V(0, 21.2, 0); daleS.root.position.copy(mp).add(V(0, -1.8, 0)); daleS.root.scale.setScalar(1); daleS.neckG.rotation.x = -0.9;
      bubS.visible = true; bubS.scale.setScalar(Rb); bubS.position.copy(mp).add(V(0, Rb, 0));
      if (lt < 1.6) setCam(V(4, 22, 9), V(0, 24, 0), 50); else setCam(V(0, 60, 200), V(0, 35, 0), 48); return S.scene; }
    case 'pop': { S.earth.position.set(0, 0, 0); S.atmo.position.set(0, 0, 0); bubS.visible = false; const popT = A[17] + 4.8; const q = Math.max(0, t - popT);
      for (let i = 0; i < 200; i++) { const a = i * 2.39996, z = 1 - (i / 199) * 2, rr = Math.sqrt(1 - z * z); const dir = V(Math.cos(a) * rr, z, Math.sin(a) * rr); const p = V(0, 61.7, 0).add(dir.clone().multiplyScalar(40.5 + q * 30)); if (q > 0.6) p.copy(dir.clone().multiplyScalar(20.4)); L._m.compose(p, L._q.setFromEuler(L._e.set(i, i * 2, 0)), L._s.setScalar(t < popT ? 0 : (q > 0.6 ? 2.2 : 2.5))); shards.setMatrixAt(i, L._m); } shards.instanceMatrix.needsUpdate = true;
      S.earth.material.color.copy(new THREE.Color(0xffffff).lerp(pinkEarth, clamp((q - 0.6) / 0.6))); S.earth.rotation.y = t * 0.05;
      if (t < line('Earth is pink').t) setCam(V(0, 60, 220), V(0, 35, 0), 48, q > 0 && q < 0.4 ? 1.2 : 0, t); else setCam(V(30, 15, 70), V(0, 0, 0), 40); return S.scene; }
    case 'fact': { resetPose(daleL); daleL.root.rotation.y = 0.2; setFace(daleL, { lid: 0.3, brow: 0.5, mouth: 0.25 }); daleL.mouth.getWorldPosition(_mw); bubL.position.copy(_mw).add(V(0.05, 0, 0.24)); blinkAt(daleL, t); setCam(V(lerp(1.3, 1.0, ease(lt / dur)), 1.65, lerp(2.8, 2.4, ease(lt / dur))), V(0.2, 1.6, 0.2), 40); return lab.scene; }
  }
}
const rungs = [['20', 'cm', 1, 'A NORMAL BUBBLE', 0.2], ['60', 'cm', 2, 'BEATS THE WORLD RECORD', 0.6], ['1.8', 'm', 3, 'TALLER THAN DALE', 1.8], ['5.4', 'm', 4, 'LIFTOFF', 5.4], ['16', 'm', 5, 'A HOT AIR BALLOON', 16], ['146', 'm', 7, 'ABOVE THE CITY', 146], ['11.8', 'km', 11, 'CRUISING-JET ALTITUDE', 11810], ['25,800', 'km', 17, '2× EARTH’S WIDTH', 2.58e7]]
  .map(([v, unit, n, cmp, raw], i) => ({ v, unit, n, cmp, raw, at: A[n], gold: i === 7 }));
const overlay = L.makeOverlay({ lines: H.LINES, titleL1: 'What if every bubblegum bubble was', titleHi: '3× bigger', titleL2: ' than the last?', titleSize: 72, hudLabel: r => 'BUBBLE ' + r.n + '   ·   SIZE', rule: '×3 EVERY BUBBLE', rungs, barMin: 0.1, barMax: 5e7, barMarks: [[0.508, 'RECORD'], [1.27e7, 'EARTH']], fact: { big: '50.8', unit: 'cm', sub: 'BIGGEST HANDS-FREE BUBBLEGUM BUBBLE (2004)' }, hideHUD: ['worse', 'fact', 'bet', 'setup', 'pop'], flashBig: [A[17] + 4.8], flashSmall: [] });
L.makeFrame(shots, renderShot, overlay);

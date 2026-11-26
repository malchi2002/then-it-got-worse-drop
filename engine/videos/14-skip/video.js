import * as L from '/lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, easeOut, lerp, setCam, rng, makeGuy, setFace, resetPose, blinkAt } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const A = {}; TL.tl.filter(x => x.type === 'act').forEach(x => A[x.n] = x.blast);
const line = H.line;
const talk = (p, t) => { const l = line(p); return t > l.t && t < l.end ? Math.abs(Math.sin(t * 14)) * 0.5 : 0; };
const HIT = 38.05;
const stoneG = new THREE.SphereGeometry(0.05, 14, 10); stoneG.scale(1, 0.4, 0.8); const stoneM = mat(0x6a6e74, { r: 0.6 });
function hop(p0, p1, q, hgt) { const p = p0.clone().lerp(p1, q); p.y += Math.sin(q * Math.PI) * hgt; return p; }
// ---------- lake ----------
const lake = new THREE.Scene(); const SK = 0xf2a874; lake.background = new THREE.Color(SK); lake.fog = new THREE.Fog(SK, 80, 420);
lake.add(new THREE.HemisphereLight(0xffd2b0, 0x4a3a50, 0.9)); { const s = new THREE.DirectionalLight(0xff9a50, 3.0); s.position.set(-20, 12, -60); s.castShadow = true; Object.assign(s.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 }); s.shadow.mapSize.set(2048, 2048); lake.add(s); }
const sunD = mesh(new THREE.SphereGeometry(14, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffd08a, fog: false }), false, false); sunD.position.set(-60, 18, -380); lake.add(sunD);
const water = mesh(new THREE.PlaneGeometry(600, 400), new THREE.MeshStandardMaterial({ color: 0x3a5a8a, roughness: 0.15, metalness: 0.3 }), false, true); water.rotation.x = -Math.PI / 2; water.position.set(0, 0, -150); lake.add(water);
const shore = mesh(new THREE.PlaneGeometry(600, 60), mat(0x7a9a4a, { r: 1 })); shore.rotation.x = -Math.PI / 2; shore.position.set(0, 0.05, 30); lake.add(shore);
const far = mesh(new THREE.PlaneGeometry(600, 200), mat(0x5a7a3a, { r: 1 })); far.rotation.x = -Math.PI / 2; far.position.set(0, 0.05, -215); lake.add(far);
{ const r = rng(7); for (let i = 0; i < 80; i++) { const tr = new THREE.Group(); const tk = mesh(new THREE.CylinderGeometry(0.3, 0.4, 3, 6), mat(0x5a3a22)); tk.position.y = 1.5; tr.add(tk); const c = mesh(new THREE.ConeGeometry(2 + r() * 1.5, 6 + r() * 4, 7), mat(new THREE.Color().setHSL(0.28, 0.4, 0.22 + r() * 0.1))); c.position.y = 6; tr.add(c); const fz = i < 40; tr.position.set((r() - 0.5) * 300, 0, fz ? -120 - r() * 60 : 8 + r() * 30); if (!fz && Math.abs(tr.position.x) < 8) tr.position.x += 16; lake.add(tr); } }
{ const r = rng(2); for (let i = 0; i < 12; i++) { const h = mesh(new THREE.ConeGeometry(60 + r() * 60, 40 + r() * 50, 7), mat(0x6a5a7a, { r: 1 })); h.position.set(-300 + i * 55, 0, -330); lake.add(h); } }
const pebbles = L.makeInstanced(new THREE.DodecahedronGeometry(0.08, 0), mat(0x9a9088), 60); lake.add(pebbles); { const r = rng(3); for (let i = 0; i < 60; i++) { L._m.compose(V((r() - 0.5) * 6, 0.05, 0.3 + r() * 2), L._q.identity(), L._s.setScalar(0.5 + r())); pebbles.setMatrixAt(i, L._m); } pebbles.instanceMatrix.needsUpdate = true; }
const stone = mesh(stoneG, stoneM); stone.scale.setScalar(2.5); lake.add(stone);
const rings = L.makeInstanced(new THREE.RingGeometry(0.9, 1, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, side: THREE.DoubleSide }), 8); rings.castShadow = false; lake.add(rings);
const splash = L.makePuff(lake, 30, 0xdfefff, 0.8, 3);
const dale = makeGuy({ ...L.DALE }); lake.add(dale.root);
const pal = makeGuy({ wood: 0xc99a6a, cap: 0x2a5a9a, shirt: 0xe0a030 }); pal.root.position.set(1.6, 0, 2.2); pal.root.rotation.y = -0.6; lake.add(pal.root);
const stars = L.makeInstanced(new THREE.OctahedronGeometry(0.05, 0), new THREE.MeshBasicMaterial({ color: 0xffe14a }), 5); stars.castShadow = false; lake.add(stars);
const LZ = k => -(Math.pow(3, k) - 1) / 2; // landing z of skip k
function ringsAt(t) { const ks = [1, 2, 3, 4]; ks.forEach((k, i) => { const n = k; const tl = t - landT(n); if (tl < 0 || tl > 3) { L._m.makeScale(0, 0, 0); } else { const s = 0.1 + tl * (0.35 + k * 0.35); L._m.compose(V(0, 0.03, LZ(k)), L._q.setFromEuler(L._e.set(-Math.PI / 2, 0, 0)), L._s.setScalar(s)); } rings.setMatrixAt(i, L._m); }); for (let i = 4; i < 8; i++) { L._m.makeScale(0, 0, 0); rings.setMatrixAt(i, L._m); } rings.instanceMatrix.needsUpdate = true; }
function landT(k) { return { 1: A[1], 2: A[1] + 1.2, 3: A[3], 4: A[3] + 1.2, 5: A[5] }[k] ?? 1e9; }
function stoneLake(t) { // returns position along skips
  const seq = [[A[1] - 0.45, A[1], V(0.25, 1.2, 1.4), V(0, 0, LZ(1)), 0.4], [A[1], A[1] + 1.2, V(0, 0, LZ(1)), V(0, 0, LZ(2)), 0.6], [A[1] + 1.2, A[3], V(0, 0, LZ(2)), V(0, 0, LZ(3)), 1.6], [A[3], A[3] + 1.2, V(0, 0, LZ(3)), V(0, 0, LZ(4)), 4], [A[3] + 1.2, A[5], V(0, 0, LZ(4)), V(0, 0.2, LZ(5)), 12], [A[5], A[5] + 1.5, V(0, 0.2, LZ(5)), V(0, 0, LZ(6)), 40]];
  for (const [a, b, p0, p1, h] of seq) if (t >= a && t < b) return hop(p0, p1, (t - a) / (b - a), h);
  if (t < A[1] - 0.45) return null; return V(0, -10, 0);
}
function lakeReset(t) { resetPose(dale); dale.root.position.set(0, 0, 1.6); dale.root.rotation.set(0, Math.PI, 0); blinkAt(dale, t); resetPose(pal); setFace(pal, { lid: 0.4, brow: 0.3 }); L.hideAll(splash); L.hideAll(stars); ringsAt(t); const p = stoneLake(t); stone.visible = !!p; if (p) stone.position.copy(p); }
// ---------- town ----------
const town = L.buildTown({ sky: 'sunset', seed: 63, low: true }); const ts = town.scene; town.buildings.forEach(B => { const p = B.b.position; if (Math.abs(p.x - 12) < 26 && p.z > -10 && p.z < 30) B.b.visible = false; });
const carM = new THREE.Group(); { const b = box(4.2, 1.0, 1.9, mat(0xc0302a, { m: 0.4, r: 0.35 })); b.position.y = 0.75; carM.add(b); const c = box(2.2, 0.75, 1.75, mat(0xc0302a, { m: 0.4, r: 0.35 })); c.position.set(-0.2, 1.6, 0); carM.add(c); const w = box(2.25, 0.55, 1.78, mat(0x9fd6f0, { r: 0.05, m: 0.3 })); w.position.set(-0.2, 1.62, 0); carM.add(w); for (const [x, z] of [[-1.3, -0.95], [1.3, -0.95], [-1.3, 0.95], [1.3, 0.95]]) { const wh = mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 16), mat(0x1a1a1a)); wh.rotation.x = Math.PI / 2; wh.position.set(x, 0.38, z); carM.add(wh); } }
carM.position.set(12, 0, 6); ts.add(carM);
const lot = box(40, 0.02, 20, mat(0x4a4c52)); lot.position.set(12, 0.02, 6); ts.add(lot); for (let i = 0; i < 8; i++) { const l = box(0.15, 0.03, 4, mat(0xf2e9c9)); l.position.set(-4 + i * 4.4, 0.04, 2); ts.add(l); }
const stoneT = mesh(stoneG, stoneM); stoneT.scale.setScalar(4); ts.add(stoneT);
const sparks = L.makePuff(ts, 30, 0xfff0c0, 0.9, 5);
const glassBits = L.makeInstanced(new THREE.PlaneGeometry(0.15, 0.15), new THREE.MeshStandardMaterial({ color: 0xcfeeff, transparent: true, opacity: 0.85, side: THREE.DoubleSide }), 40); ts.add(glassBits);
const glassD = L.debrisData(5, 40, r => ({ p0: V(11.8 + (r() - 0.5) * 1.6, 1.9, 6 + (r() - 0.5) * 1.4), v: V((r() - 0.5) * 6, 2 + r() * 4, (r() - 0.5) * 6) }));
// ---------- sky ----------
const sky = new THREE.Scene(); sky.background = new THREE.Color(0xf0b080); sky.fog = new THREE.Fog(0xf0b080, 400, 6000); sky.add(new THREE.HemisphereLight(0xffe0c0, 0x8a7a90, 1.2)); { const s = new THREE.DirectionalLight(0xffb070, 2.6); s.position.set(-1, 0.5, -0.4); sky.add(s); }
{ const cm = new THREE.MeshStandardMaterial({ color: 0xfff0e8, roughness: 1, flatShading: true }); const r = rng(14); for (let i = 0; i < 260; i++) { const c = mesh(new THREE.IcosahedronGeometry(40 + r() * 80, 1), cm, false, false); c.scale.y = 0.35; c.position.set((r() - 0.5) * 4000, 2000 + r() * 30, (r() - 0.5) * 2000); sky.add(c); } }
const stoneS = mesh(stoneG, stoneM); stoneS.scale.setScalar(40); sky.add(stoneS);
const cpuff = L.makePuff(sky, 40, 0xffffff, 0.8, 8);
// ---------- space ----------
const S = L.buildSpace(); const stoneSp = mesh(new THREE.SphereGeometry(0.7, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffd25a })); S.scene.add(stoneSp);
const pin = mesh(new THREE.ConeGeometry(0.3, 1, 8), new THREE.MeshBasicMaterial({ color: 0xff3a2a })); S.scene.add(pin);
const AX = V(0.2, 1, 0.15).normalize(), START = V(0.4, 0.35, 1).normalize(); // orbit axis and start dir
const PIN = START.clone().multiplyScalar(20.4); pin.position.copy(PIN); pin.quaternion.setFromUnitVectors(V(0, -1, 0), START);
const gcPos = (ang, r = 21.2) => START.clone().applyAxisAngle(AX, ang).multiplyScalar(r);
// ---------- worse / lab ----------
const wsc = new THREE.Scene(); wsc.background = new THREE.Color(0x14060a); const wl = new THREE.PointLight(0xff3020, 30, 12, 2); wl.position.set(0.8, 2.0, 2.0); wsc.add(wl); wsc.add(new THREE.AmbientLight(0x200810, 1)); const daleW = makeGuy({ ...L.DALE }); wsc.add(daleW.root);
const lab = L.buildLab({ bg: 0xe8eef0, floor: 0xd8e0e2 }); const daleL = makeGuy({ ...L.DALE }); daleL.root.position.set(-0.6, 0, 0); lab.scene.add(daleL.root);
{ const r = rng(8); for (let i = 0; i < 7; i++) { const s = mesh(stoneG, mat(new THREE.Color().setHSL(0.08, 0.1, 0.35 + r() * 0.2))); s.scale.setScalar(2.2 - i * 0.2); s.position.set(0.55, 0.05 + i * 0.07, -0.1); s.rotation.y = r() * 3; lab.scene.add(s); } }

function shots() {
  const L2 = H.LINES[1].t, still = line('Dale is still').t;
  return [['establish', 0, L2], ['setup', L2, A[1] - 0.8], ['s1', A[1] - 0.8, A[3] - 0.8], ['s3', A[3] - 0.8, A[5] - 0.9], ['s5', A[5] - 0.9, A[7] - 0.5], ['s7', A[7] - 0.5, A[9] - 0.5], ['s9', A[9] - 0.5, A[11] - 0.5], ['s11', A[11] - 0.5, H.worse.t], ['worse', H.worse.t, A[17] - 0.4], ['earth', A[17] - 0.4, still], ['bonk', still, H.fact.t], ['fact', H.fact.t, TL.dur + 1]];
}
function throwPose(t) { const dt = t - (A[1] - 0.45); if (dt > -0.6 && dt < 0.4) { const k = dt < 0 ? -dt / 0.6 : 0; dale.aR.sh.rotation.set(-0.3, 0, -1.2 + k * 0.6); dale.aR.el.rotation.set(-0.3, -1.0 * k, 0); dale.body.rotation.y = 0.5 * k - 0.2; } }
function renderShot(name, lt, dur, t) {
  L.cam.far = 7000;
  switch (name) {
    case 'establish': { lakeReset(t); stone.visible = false; const k = ease(lt / dur); setCam(V(lerp(6, 4, k), lerp(3, 2.4, k), lerp(9, 7.5, k)), V(0, 1.2, -6), 48); return lake; }
    case 'setup': { lakeReset(t); stone.visible = false; setFace(dale, { lid: 0.35, brow: 0.6, browTilt: 0.2 }); setFace(pal, { lid: 0.4, brow: 0.5, mouth: talk('Flick', t) }); pal.aR.sh.rotation.set(-0.6, 0, -0.6); pal.aR.el.rotation.x = -0.6 * Math.abs(Math.sin(t * 6));
      setCam(V(-1.2, 1.55, -1.6), V(0.6, 1.3, 1.9), 46); return lake; }
    case 's1': { lakeReset(t); throwPose(t); setFace(dale, t > A[1] ? { lid: 0.2, brow: 0.6, mouth: 0.2 } : { lid: 0.3, brow: 0.5 }); setCam(V(0.9, 1.9, 4.2), V(0, 0.7, -3), 50); return lake; }
    case 's3': { lakeReset(t); setFace(dale, { lid: 0.1, brow: 0.9, mouth: 0.3 }); const p = stone.position; setCam(V(2.5, 1.6, 3.5), V(0, 0.4, lerp(-3, -12, clamp((t - A[3] + 1.2) / 1.6))), 44); return lake; }
    case 's5': { lakeReset(t); setFace(dale, { lid: 0, brow: 1, mouth: 0.5 }); setFace(pal, { lid: 0, brow: 1, mouth: 0.5 }); const k = ease(clamp(lt / 2.0)); setCam(V(lerp(4, 30, k), lerp(3, 30, k), lerp(5, 20, k)), V(0, 0, lerp(-20, -80, k)), 50); return lake; }
    case 's7': { const dt = t - A[7]; const P0 = V(-60, 0.3, 6), HITP = V(12, 2.1, 6), P1 = V(90, 0.3, 6); const p = dt < 0 ? hop(P0, HITP, clamp(1 + dt / 0.5), 6) : hop(HITP, P1, clamp(dt / 1.4), 10); stoneT.position.copy(p); stoneT.rotation.y = t * 20;
      L.puffAt(sparks, HITP, V(0, 1, 0), dt, 0.6, 1.2); L.debrisAt(glassBits, glassD, dt, 4.9, 0.05); carM.position.y = dt > 0 && dt < 0.3 ? -0.08 * Math.sin(dt * 30) : 0;
      setCam(V(20, 4.2, 15), V(12, 1.4, 6), 46, dt > 0 && dt < 0.4 ? 0.05 : 0, t); return ts; }
    case 's9': { const dt = t - A[9]; L.hideAll(sparks); L.hideAll(glassBits); const x0 = -160; const hopLen = 120; const q = (dt + 0.5) / 0.9; const i = Math.floor(q), f = q - i; const p = hop(V(x0 + i * hopLen, 0.3, 12), V(x0 + (i + 1) * hopLen, 0.3, 12), clamp(f), 14); stoneT.position.copy(p); stoneT.scale.setScalar(12);
      setCam(V(p.x - 25, 48, 22), V(p.x + 12, 0, 12), 52, f < 0.08 && dt > 0 ? 0.3 : 0, t); return ts; }
    case 's11': { const dt = t - A[11]; const P0 = V(-500, 2400, 0), HITP = V(0, 2040, 0), P1 = V(700, 2500, 0); const p = dt < 0 ? hop(P0, HITP, clamp(1 + dt / 0.5), 0) : hop(HITP, P1, clamp(dt / 2.4), 300); if (dt < 0) p.y = lerp(2400, 2040, clamp(1 + dt / 0.5)); stoneS.position.copy(p); stoneS.rotation.y = t * 15;
      L.puffAt(cpuff, HITP, V(0, 1, 0), dt, 60, 2.5); setCam(V(p.x - 40, p.y + 18, 75), p.clone(), 50, dt > 0 && dt < 0.4 ? 1 : 0, t); return sky; }
    case 'worse': { resetPose(daleW); daleW.root.rotation.set(0, 0.3, 0); daleW.aR.sh.rotation.set(-0.3, 0, -1.2); setFace(daleW, { lid: 0.1, brow: 1, mouth: 0.4 }); setCam(V(0.25, 1.65, lerp(1.8, 1.45, lt / dur)), V(0, 1.55, 0), 36, 0.005, t); return wsc; }
    case 'earth': { const dt = t - A[17]; S.earth.rotation.y = 0; S.moon.position.set(140, 20, -160); const ang = Math.PI * 2 * ease(clamp(dt / 3.6)); stoneSp.position.copy(gcPos(ang)); S.trail.visible = dt > 0; L.setTrail(S, i => gcPos(ang * i / 399));
      setCam(START.clone().multiplyScalar(75).add(V(0, 22, 0)), V(0, 0, 0), 46); return S.scene; }
    case 'bonk': { lakeReset(t); stone.visible = false; rings.visible = true; const dt = t - HIT; const p = hop(V(0.2, 40, 60), V(0.0, 1.85, 1.75), clamp(1 + dt / 0.6), 0); if (dt < 0.02 && dt > -0.6) { stone.visible = true; stone.position.copy(p); stone.scale.setScalar(3); } else stone.scale.setScalar(2.5);
      dale.root.rotation.y = Math.PI; if (dt > 0) { dale.neckG.rotation.x = 0.5 * Math.exp(-dt * 5) * Math.cos(dt * 18); setFace(dale, { lid: 0.6, brow: -0.3, mouth: talk('Ow', t) }); for (let i = 0; i < 5; i++) { const a = t * 4 + i * 1.256; L._m.compose(V(Math.cos(a) * 0.28, 2.25 + Math.sin(a * 2) * 0.03, 1.6 + Math.sin(a) * 0.28), L._q.setFromEuler(L._e.set(a, a, 0)), L._s.setScalar(dt < 2.2 ? 1 : 0)); stars.setMatrixAt(i, L._m); } stars.instanceMatrix.needsUpdate = true; } else setFace(dale, { lid: 0.3, brow: 0.4 });
      setCam(V(0.5, 1.75, lerp(-1.2, -0.9, lt / dur)), V(0, 1.6, 1.6), 44, dt > 0 && dt < 0.3 ? 0.03 : 0, t); return lake; }
    case 'fact': { resetPose(daleL); daleL.root.rotation.y = 0.3; setFace(daleL, { lid: 0.35, brow: 0.3 }); blinkAt(daleL, t); const k = ease(lt / dur); setCam(V(lerp(1.3, 1.0, k), 1.5, lerp(3.6, 3.2, k)), V(0.0, 1.25, 0), 46); return lab.scene; }
  }
}
const rungs = [['1', 'm', 1, 'A NORMAL SKIP', 1], ['9', 'm', 3, 'NOT BAD', 9], ['81', 'm', 5, 'ACROSS THE LAKE', 81], ['729', 'm', 7, 'OFF A CAR', 729], ['6.5', 'km', 9, 'DOWN THE HIGHWAY', 6561], ['59', 'km', 11, 'OFF THE CLOUDS', 59049], ['43,000', 'km', 17, 'AROUND THE EARTH', 4.3e7]]
  .map(([v, unit, n, cmp, raw], i) => ({ v, unit, n, cmp, raw, at: A[n], gold: i === 6 }));
const overlay = L.makeOverlay({ lines: H.LINES, titleL1: 'What if every skip went', titleHi: '3× farther', titleL2: ' than the last?', titleSize: 80, hudLabel: r => 'SKIP ' + r.n + '   ·   DISTANCE', rule: '×3 EVERY SKIP', rungs, barMin: 0.5, barMax: 1e8, barMarks: [[121.8, 'RECORD'], [4.0075e7, 'EARTH']], fact: { big: '88', unit: 'skips', sub: 'KURT STEINER · 2013' }, hideHUD: ['worse', 'fact', 'bonk', 'setup'], flashBig: [A[17]], flashSmall: [A[7]] });
L.makeFrame(shots, renderShot, overlay);

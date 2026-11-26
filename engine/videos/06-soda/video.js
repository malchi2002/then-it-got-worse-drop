import * as L from '/lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, lerp, setCam, rng, canvasTex, makeGuy, setFace, resetPose, blinkAt } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const A = {}; TL.tl.filter(x => x.type === 'act').forEach(x => A[x.n] = x.blast);
const line = H.line;
// ---------- kitchen ----------
const room = L.buildRoom({ wall: 0xf2e6c8, floor: 0xffffff, tiles: true, sky: 0xbfe0ff, seed: 15 }); const ks = room.scene;
const cabM = mat(0x5f8f7a, { r: 0.6 }), topM = mat(0xe8e2d8, { r: 0.3 });
for (let i = 0; i < 5; i++) { const c = box(0.9, 0.9, 0.6, cabM); c.position.set(-3.6 + i * 0.92, 0.45, -2.6); ks.add(c); const tp = box(0.92, 0.05, 0.64, topM); tp.position.set(-3.6 + i * 0.92, 0.92, -2.6); ks.add(tp); const up = box(0.9, 0.7, 0.35, cabM); up.position.set(-3.6 + i * 0.92 + (i > 2 ? 3.4 : 0), 2.3, -2.75); if (i < 3) ks.add(up); }
const fridge = box(0.9, 2.0, 0.75, mat(0xe9eef2, { r: 0.3, m: 0.2 })); fridge.position.set(3.6, 1.0, -2.5); ks.add(fridge);
const island = box(1.6, 0.92, 0.9, mat(0x7a5232)); island.position.set(0, 0.46, 0); ks.add(island); const islTop = box(1.7, 0.05, 1.0, topM); islTop.position.set(0, 0.945, 0); ks.add(islTop);
const canTex = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#d32f2f'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = "italic 46px 'Archivo Black'"; g.fillText('FIZZ', 70, 80); g.fillStyle = '#ffd23f'; g.fillRect(0, 100, w, 10); });
function makeCan() { const g = new THREE.Group(); const body = mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.122, 24), new THREE.MeshStandardMaterial({ map: canTex, roughness: 0.3, metalness: 0.4 })); g.add(body); const top = mesh(new THREE.CylinderGeometry(0.029, 0.033, 0.01, 24), mat(0xcccccc, { m: 0.8, r: 0.3 })); top.position.y = 0.066; g.add(top); const tab = box(0.016, 0.003, 0.026, mat(0xbbbbbb, { m: 0.8 })); tab.position.set(0, 0.072, 0.006); g.add(tab); g.userData.tab = tab; return g; }
const dale = makeGuy({ ...L.DALE }); dale.root.position.set(0, 0, 0.9); dale.root.rotation.y = Math.PI; ks.add(dale.root);
const can = makeCan(); can.position.set(0, -0.05, 0.03); can.rotation.x = Math.PI / 2; dale.aR.grip.add(can);
const cracks = mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: canvasTex(512, 512, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(20,20,20,0.85)'; g.lineWidth = 3; const r = rng(3); for (let i = 0; i < 16; i++) { let x = 256, y = 256; g.beginPath(); g.moveTo(x, y); const a0 = r() * 6.28; for (let k = 0; k < 9; k++) { const a = a0 + (r() - 0.5) * 0.9; x += Math.cos(a) * 26; y += Math.sin(a) * 26; g.lineTo(x, y); } g.stroke(); } }), transparent: true, depthWrite: false }), false, false);
cracks.rotation.x = -Math.PI / 2; cracks.position.set(0, 0.01, 0.9); ks.add(cracks);
const diamond = mesh(new THREE.OctahedronGeometry(0.06, 0), new THREE.MeshPhysicalMaterial({ color: 0xe8f6ff, roughness: 0, metalness: 0.1, transmission: 0.7, thickness: 0.1, clearcoat: 1, emissive: 0x6fb6ff, emissiveIntensity: 0.3 }), false, false); diamond.scale.set(1, 1.4, 1); ks.add(diamond); diamond.visible = false;
const sparkle = L.makeInstanced(new THREE.OctahedronGeometry(0.01, 0), new THREE.MeshBasicMaterial({ color: 0xffffff }), 20); sparkle.castShadow = false; ks.add(sparkle);
const sprayK = L.makeInstanced(new THREE.SphereGeometry(0.05, 6, 5), new THREE.MeshStandardMaterial({ color: 0x5a2a10, roughness: 0.2, transparent: true, opacity: 0.85 }), 200); sprayK.castShadow = false; ks.add(sprayK);
// ---------- exterior ----------
const town = L.buildTown({ sky: 'day', seed: 55, low: true, skip: [[0, -1], [0, 0], [-1, 0]] }); const ts = town.scene;
const house = new THREE.Group(); house.position.set(-3, 0, -2); ts.add(house);
{ const b = box(9, 5, 8, mat(0xe8d8b0)); b.position.y = 2.5; house.add(b); for (const [x, y] of [[-2.5, 3.2], [2.5, 3.2], [2.5, 1.4]]) { const w = box(1.4, 1.1, 0.05, mat(0x9fd3f0, { r: 0.1 })); w.position.set(x, y, 4.02); house.add(w); } const door = box(1.1, 2.1, 0.1, mat(0x8a3a2a)); door.position.set(-1, 1.05, 4.02); house.add(door); }
const hRoof = mesh(new THREE.ConeGeometry(6.8, 3, 4), mat(0x3a5f8a)); hRoof.rotation.y = Math.PI / 4; hRoof.scale.set(1, 1, 0.9); ts.add(hRoof);
const geyserM = new THREE.MeshStandardMaterial({ color: 0x6a3414, roughness: 0.2, transparent: true, opacity: 0.92 });
const geyser = mesh(new THREE.CylinderGeometry(2.2, 1.0, 1, 24, 1, true), geyserM, false, false); ts.add(geyser);
const foam = L.makePuff(ts, 80, 0xf0d8b0, 0.85, 22);
const drops = L.makeInstanced(new THREE.SphereGeometry(0.25, 6, 5), geyserM, 200); drops.castShadow = false; ts.add(drops);
const S = L.buildSpace(); const sodaBeam = mesh(new THREE.CylinderGeometry(0.15, 0.4, 1, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0x6a3414, roughness: 0.3 }), false, false); S.scene.add(sodaBeam);
// worse
const wsc = new THREE.Scene(); wsc.background = new THREE.Color(0x14060a); const wl = new THREE.PointLight(0xff3020, 30, 12, 2); wl.position.set(1.0, 2.0, 2.0); wsc.add(wl); wsc.add(new THREE.AmbientLight(0x200810, 1)); const daleW = makeGuy({ ...L.DALE }); wsc.add(daleW.root); const canW = makeCan(); canW.scale.set(1.25, 1.1, 1.25); canW.position.set(0, -0.05, 0.03); canW.rotation.x = Math.PI / 2; daleW.aR.grip.add(canW);
// lab
const lab = L.buildLab({ bg: 0xf3e4e4, floor: 0xe6d6d6 }); const daleL = makeGuy({ ...L.DALE }); lab.scene.add(daleL.root); const canL = makeCan(); canL.position.set(0, -0.05, 0.03); canL.rotation.x = Math.PI / 2; daleL.aR.grip.add(canL);
const hiss = L.makePuff(lab.scene, 40, 0xffffff, 0.5, 31);

function shakePose(g, t, dt, amp) { // shaking can for ~0.8s after start
  const sh = dt > -0.4 && dt < 0.6 ? Math.sin(t * 40) * amp : 0;
  g.aR.sh.rotation.set(-1.2 + sh * 0.4, 0, -0.2); g.aR.el.rotation.x = -1.0 + sh * 0.5; g.aL.sh.rotation.set(-0.3, 0, 0.12);
  return sh;
}
function holdPose(g) { g.aR.sh.rotation.set(-1.2, 0, -0.2); g.aR.el.rotation.x = -1.0; }
function canState(level) { const s = 1 + level * 0.045; can.scale.set(s, 1 + level * 0.02, s); can.position.x = 0; }
function shots() {
  const L2 = H.LINES[1].t, opened = line('He opened').t, sip = line('Dale finally').t;
  return [['establish', 0, L2], ['setup', L2, A[1] - 0.6], ['s1', A[1] - 0.6, A[3] - 0.6], ['s3', A[3] - 0.6, A[5] - 0.6], ['s5', A[5] - 0.6, A[7] - 0.6], ['s7', A[7] - 0.6, A[10] - 0.6], ['s10', A[10] - 0.6, H.worse.t], ['worse', H.worse.t, opened], ['open', opened, A[11] + 0.15], ['geyser', A[11] + 0.15, sip], ['sip', sip, H.fact.t], ['fact', H.fact.t, TL.dur + 1]];
}
function kReset(t) { resetPose(dale); dale.root.position.set(0, 0, 0.9); dale.root.rotation.set(0, Math.PI, 0); cracks.visible = false; diamond.visible = false; L.hideAll(sparkle); L.hideAll(sprayK); canState(0); room.roofOff(false); ks.background = room.sky; }
const lvlOf = t => { let l = 0; for (const [n, v] of [[1, 0], [3, 1], [5, 2], [7, 3.2], [10, 4.5]]) if (t >= A[n]) l = v; return l; };
function faceCam(d = 1.6, y = 1.75, dx = 0.35) { return [V(dx * 1.3, y - 0.12, 0.9 - d - 0.6), V(0, 1.5, 0.9)]; }
function renderShot(name, lt, dur, t) {
  switch (name) {
    case 'establish': { geyser.visible = false; L.hideAll(foam); L.hideAll(drops); hRoof.position.set(-3, 6.5, -2); hRoof.rotation.set(0, Math.PI / 4, 0); const k = ease(lt / dur); setCam(V(lerp(-12, -9, k), 3, 12), V(-3, 3, -2), 46); return ts; }
    case 'setup': { kReset(t); holdPose(dale); setFace(dale, { lid: 0.3, brow: 0.6 }); blinkAt(dale, t); const k = lt / dur; setCam(V(lerp(2.6, 2.2, k), 1.9, -1.0), V(0, 1.4, 0.9), 44); return ks; }
    case 's1': case 's3': case 's5': case 's7': case 's10': {
      kReset(t); const n = +name.slice(1); const dt = t - A[n]; const amp = { 1: 0.6, 3: 0.8, 5: 1, 7: 1.2, 10: 1.5 }[n]; const sh = shakePose(dale, t, dt, amp);
      const lv = lvlOf(t); canState(lv + (dt > 0 && dt < 0.6 ? 0.2 : 0)); setFace(dale, { lid: 0.2, brow: 0.6 + lv * 0.1, mouth: Math.abs(sh) * 0.3 });
      if (n >= 5) { cracks.visible = n >= 7; cracks.scale.setScalar(n >= 10 ? 1.6 : 1); }
      if (n === 5) { const k = lt / dur; ks.userData.shake = 0.004; return (lt < 1.6 ? setCam(...faceCam(1.4, 1.75, 0.3), 40, 0.004, t) : (() => { const wp = new THREE.Vector3(); can.getWorldPosition(wp); setCam(wp.clone().add(V(0.18, 0.1, -0.4)), wp, 34, 0.004, t); })()), ks; }
      if (n === 7) { if (lt < 1.4) setCam(V(1.6, 2.6, -0.6), V(0, 0.4, 0.9), 50, 0.02, t); else setCam(...faceCam(1.3, 1.75, 0.3), 40, 0.01, t); return ks; }
      if (n === 10) { const q = clamp((dt - 0.6) / 0.6); diamond.visible = dt > 0.6; const wp = new THREE.Vector3(); dale.aL.grip.getWorldPosition(wp); dale.aL.sh.rotation.set(-1.2, 0, 0.2); dale.aL.el.rotation.x = -1.0; diamond.position.copy(wp).add(V(0, 0.06, 0)); diamond.rotation.y = t * 2; diamond.scale.set(q, q * 1.4, q);
        for (let i = 0; i < 20; i++) { const a = i * 0.9 + t * 3; L._m.compose(L._p.copy(diamond.position).add(V(Math.cos(a) * 0.1, Math.sin(a * 1.3) * 0.08, Math.sin(a) * 0.1)), L._q.identity(), L._s.setScalar(q * (0.5 + 0.5 * Math.sin(t * 20 + i)))); sparkle.setMatrixAt(i, L._m); } sparkle.instanceMatrix.needsUpdate = true;
        setFace(dale, { lid: 0.1, brow: 1, mouth: 0.6 * q }); if (lt < 1.2) setCam(...faceCam(1.3, 1.75, 0.3), 40, 0.012, t); else setCam(wp.clone().add(V(0.2, 0.15, -0.5)), wp.clone().add(V(0, 0.05, 0)), 32, 0.004, t); return ks; }
      const fc = n === 1 ? faceCam(1.6, 1.75, 0.4) : faceCam(1.3, 1.7, -0.35); setCam(fc[0], fc[1], 40, n === 3 ? 0.004 : 0, t); return ks;
    }
    case 'worse': { resetPose(daleW); daleW.aR.sh.rotation.set(-1.2, 0, -0.2); daleW.aR.el.rotation.x = -1.0; daleW.aL.sh.rotation.set(-1.2, 0, 0.3); daleW.aL.el.rotation.x = -1.2; const k = lt / dur; setFace(daleW, { lid: 0.05, brow: 1, mouth: 0.3 }); daleW.root.rotation.y = 0.3; setCam(V(0.25, 1.65, lerp(1.8, 1.4, k)), V(0, 1.6, 0), 36, 0.005, t); return wsc; }
    case 'open': { kReset(t); cracks.visible = true; cracks.scale.setScalar(1.6); canState(4.5); holdPose(dale); dale.aL.sh.rotation.set(-1.1, 0, 0.2); dale.aL.el.rotation.x = -1.1; setFace(dale, { lid: 0.0, brow: 1, mouth: 0.2 }); const wp = new THREE.Vector3(); can.getWorldPosition(wp); can.userData.tab.rotation.x = -clamp(lt / 0.6) * 1.2; setCam(wp.clone().add(V(0.15, 0.12, -0.35)), wp, 34, 0.003, t); return ks; }
    case 'geyser': { const tt = t - A[11]; geyser.visible = true; const h = Math.min(400, tt * tt * 120 + tt * 25); geyser.scale.set(1 + tt * 0.3, h, 1 + tt * 0.3); geyser.position.set(-3, 5 + h / 2, -2);
      hRoof.position.set(-3 + tt * 3, 6.5 + tt * 40 + tt * tt * 30, -2); hRoof.rotation.set(tt * 2, tt * 3, tt);
      L.puffAt(foam, V(-3, 5, -2), V(0, 0.2, 0), tt, 5, 4);
      for (let i = 0; i < 200; i++) { const a = i * 2.4, sp = 6 + (i % 7) * 2; const q = ((tt * 0.8 + i / 200) % 1) * 2.2; L._m.compose(L._p.set(-3 + Math.cos(a) * sp * q, 5 + 22 * q - 9.8 * q * q * 0.5 * 2, -2 + Math.sin(a) * sp * q), L._q.identity(), L._s.setScalar(tt > 0 ? 1 : 0)); drops.setMatrixAt(i, L._m); } drops.instanceMatrix.needsUpdate = true;
      if (lt < 1.4) { setCam(V(-12, 2.2, 12), V(-3, 10, -2), 56, 0.15, t); return ts; }
      if (lt < 2.4) { setCam(V(-30, 60, 60), V(-3, 80, -2), 52, 0.05, t); return ts; }
      S.earth.position.set(0, 0, 0); S.atmo.position.set(0, 0, 0); S.earth.rotation.y = t * 0.05; const q = clamp((lt - 2.4) / 1.2); const top = 20 + 8 * q; sodaBeam.position.set(0, (20 + top) / 2, 0); sodaBeam.scale.set(1, Math.max(0.01, top - 20), 1);
      setCam(V(18, 26, 40), V(0, 22, 0), 46); return S.scene; }
    case 'sip': { kReset(t); room.roofOff(true); ks.background = new THREE.Color(0x9fd0f5); cracks.visible = true; cracks.scale.setScalar(1.6); can.userData.tab.rotation.x = -1.2;
      const k = clamp(lt / 0.8); dale.aR.sh.rotation.set(lerp(-1.2, -2.0, k), 0, -0.25); dale.aR.el.rotation.x = lerp(-1.0, -1.6, k); dale.neckG.rotation.x = -0.25 * k;
      const said = t > line("It's flat").t; setFace(dale, { lid: said ? 0.6 : 0.3, brow: said ? -0.5 : 0.2, mouth: said ? Math.abs(Math.sin(t * 12)) * 0.4 : 0 }); if (said) { dale.aR.sh.rotation.set(-1.2, 0, -0.2); dale.aR.el.rotation.x = -1.0; dale.neckG.rotation.x = 0; }
      const fc = faceCam(1.5, 1.75, 0.3); setCam(fc[0], fc[1], 40); return ks; }
    case 'fact': { resetPose(daleL); daleL.root.rotation.y = 0.3; daleL.aR.sh.rotation.set(-1.2, 0, -0.2); daleL.aR.el.rotation.x = -1.0; blinkAt(daleL, t); canL.userData.tab.rotation.x = lt > 0.8 ? -1.2 : 0; const wp = new THREE.Vector3(); canL.getWorldPosition(wp); L.puffAt(hiss, wp.clone().add(V(0, 0.08, 0)), V(0, 1, 0), lt - 0.8, 0.3, 3);
      setCam(V(lerp(1.3, 1.0, ease(lt / dur)), 1.6, lerp(2.4, 2.0, ease(lt / dur))), V(0.15, 1.4, 0.2), 40); return lab.scene; }
  }
}
const rungs = [['2.5', 'bar', 1, 'A NORMAL SODA', 2.5], ['22', 'bar', 3, '10 CAR TIRES', 22.5], ['202', 'bar', 5, 'A SCUBA TANK', 202], ['1,822', 'bar', 7, 'DEEPER THAN THE OCEAN FLOOR', 1822], ['49,207', 'bar', 10, 'DIAMOND-MAKING PRESSURE', 49207], ['OPEN', '', 11, 'SODA IN ORBIT', 1e6]]
  .map(([v, unit, n, cmp, raw], i) => ({ v, unit, n, cmp, raw, at: A[n], gold: i >= 4 }));
const overlay = L.makeOverlay({ lines: H.LINES, titleL1: 'What if every shake made a soda', titleHi: '3× more pressurized', titleL2: '?', titleSize: 72, hudLabel: r => r.n === 11 ? 'CAN STATUS' : 'SHAKE ' + r.n + '   ·   PRESSURE', rule: '×3 EVERY SHAKE', rungs, barMin: 1, barMax: 2e5, barMarks: [[1086, 'OCEAN'], [50000, 'DIAMOND']], fact: { big: '2–4', unit: 'atm', sub: 'INSIDE A SEALED SODA · THAT’S THE HISS' }, hideHUD: ['worse', 'fact', 'sip', 'open'], flashBig: [A[11]], flashSmall: [A[7] + 0.6, A[10] + 0.6] });
L.makeFrame(shots, renderShot, overlay);

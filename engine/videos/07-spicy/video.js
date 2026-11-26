import * as L from '/lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, lerp, setCam, rng, canvasTex, signTex, makeGuy, setFace, resetPose, blinkAt } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const A = {}; TL.tl.filter(x => x.type === 'act').forEach(x => A[x.n] = x.blast);
const line = H.line;
const town = L.buildTown({ sky: 'sunset', seed: 77, low: true, skip: [[0, -1], [0, 0], [-1, 0], [-1, -1]] }); const ts = town.scene;
// food truck facing +z at z=3
const truck = new THREE.Group(); truck.position.set(0, 0, 3); ts.add(truck);
{ const body = box(7, 3.2, 2.6, mat(0xf2c230, { r: 0.5 })); body.position.y = 2.0; truck.add(body); const cab = box(2, 2.4, 2.5, mat(0xf2c230)); cab.position.set(4.4, 1.6, 0); truck.add(cab); const win = box(3.2, 1.2, 0.1, mat(0x1a1a1a)); win.position.set(-0.4, 2.3, 1.31); truck.add(win); const counter = box(3.4, 0.12, 0.5, mat(0xc0c0c0, { m: 0.6 })); counter.position.set(-0.4, 1.66, 1.5); truck.add(counter);
  const aw = box(3.8, 0.08, 1.2, mat(0xd94f4f)); aw.position.set(-0.4, 3.15, 1.8); aw.rotation.x = 0.25; truck.add(aw);
  const sg = mesh(new THREE.PlaneGeometry(4.5, 0.9), new THREE.MeshStandardMaterial({ map: signTex([['TACO LOCO', "88px 'Archivo Black'", 100]], { w: 768, h: 140, bg: '#d94f4f', fg: '#fff3c4', border: false }) })); sg.position.set(-0.3, 3.45, 1.33); truck.add(sg);
  for (const x of [-2.4, 2.4, 4.4]) for (const z of [-1.3, 1.3]) { const w = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16), mat(0x1a1a1a)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.5, z); truck.add(w); } }
const vendor = makeGuy({ wood: 0x9ad0c8, cap: 0xd94f4f, shirt: 0xffffff }); vendor.root.position.set(-0.4, 0.5, 1.45); truck.add(vendor.root);
const dale = makeGuy({ ...L.DALE }); dale.root.position.set(-0.4, 0, 7.6); dale.root.rotation.y = Math.PI; ts.add(dale.root);
const taco = new THREE.Group(); { const sh = mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 20, 1, false, 0, Math.PI), mat(0xe8b85a)); sh.rotation.z = Math.PI / 2; taco.add(sh); const fill = box(0.04, 0.06, 0.16, mat(0x6a9a3a)); fill.position.y = 0.04; taco.add(fill); } taco.position.set(0, -0.02, 0.06); dale.aR.grip.add(taco);
const woodMat = dale.head.children.find(c => c.isMesh).material; const ORANGE = new THREE.Color(0xe8a65a), RED = new THREE.Color(0xff2a10);
const sweat = L.makeInstanced(new THREE.SphereGeometry(0.018, 8, 6), new THREE.MeshStandardMaterial({ color: 0x8fd3ff, roughness: 0.05, transparent: true, opacity: 0.85 }), 30); sweat.castShadow = false; ts.add(sweat);
const steamL = L.makePuff(ts, 30, 0xffffff, 0.6, 3), steamR = L.makePuff(ts, 30, 0xffffff, 0.6, 4);
const fireM = new THREE.MeshBasicMaterial({ color: 0xff7a20, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
const fire = mesh(new THREE.ConeGeometry(1, 1, 24, 1, true), fireM, false, false); ts.add(fire); fire.visible = false;
const fire2 = mesh(new THREE.ConeGeometry(1, 1, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), false, false); ts.add(fire2); fire2.visible = false;
const fLight = new THREE.PointLight(0xff7a20, 0, 40, 2); ts.add(fLight);
const rings = []; for (let i = 0; i < 5; i++) { const r = mesh(new THREE.TorusGeometry(0.3, 0.015, 6, 30), new THREE.MeshBasicMaterial({ color: [0xff4fd8, 0x4fd8ff, 0xffe14f, 0x7dff4f, 0xff8a4f][i], transparent: true, opacity: 0.8 }), false, false); ts.add(r); rings.push(r); }
const S = L.buildSpace(); const daleS = makeGuy({ ...L.DALE }); S.scene.add(daleS.root); const sFire = mesh(new THREE.ConeGeometry(1, 1, 24, 1, true), fireM, false, false); S.scene.add(sFire);
const wsc = new THREE.Scene(); wsc.background = new THREE.Color(0x14060a); const wl = new THREE.PointLight(0xff3020, 30, 12, 2); wl.position.set(0.8, 2.0, 2.0); wsc.add(wl); wsc.add(new THREE.AmbientLight(0x200810, 1)); const daleW = makeGuy({ ...L.DALE }); wsc.add(daleW.root); const tacoW = taco.clone(); daleW.aR.grip.add(tacoW);
const lab = L.buildLab({ bg: 0xf6e7d6, floor: 0xead6c0 }); const daleL = makeGuy({ ...L.DALE }); lab.scene.add(daleL.root);
const pepper = new THREE.Group(); { const p = mesh(new THREE.CapsuleGeometry(0.05, 0.16, 6, 12), mat(0xd9301f, { r: 0.3 })); p.rotation.z = 0.4; pepper.add(p); const st = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 6), mat(0x3e8a3a)); st.position.set(-0.05, 0.12, 0); st.rotation.z = 0.4; pepper.add(st); } pepper.position.set(0.55, 1.45, 0.3); lab.scene.add(pepper);

const heat = t => { let h = 0; for (const [n, v] of [[1, 0.02], [2, 0.08], [3, 0.2], [5, 0.38], [7, 0.58], [8, 0.78], [11, 1]]) if (t >= A[n]) h = v; return h; };
function biteAnim(t) { let b = 0; for (const n of [1, 2, 3, 5, 7, 8, 11]) { const d = t - A[n] + 0.3; if (d > 0 && d < 0.4) b = Math.sin(d / 0.4 * Math.PI); } dale.aR.sh.rotation.set(-1.0 - b * 0.9, 0, -0.25); dale.aR.el.rotation.x = -1.3 - b * 0.3; return b; }
const HEAD = new THREE.Vector3(); const _hp = () => { dale.head.getWorldPosition(HEAD); return HEAD.clone().add(V(0, 0.17, 0)); };
function fx(t, h) {
  woodMat.color.copy(ORANGE).lerp(RED, clamp(h * 1.4));
  const hp = _hp();
  for (let i = 0; i < 30; i++) { const q = ((t * 1.2 + i / 30) % 1); const a = i * 2.39; L._m.compose(L._p.set(hp.x + Math.cos(a) * 0.19, hp.y + 0.12 - q * 0.35, hp.z - 0.05 + Math.sin(a) * 0.12), L._q.identity(), L._s.setScalar(h >= 0.2 ? 1 : 0)); sweat.setMatrixAt(i, L._m); } sweat.instanceMatrix.needsUpdate = true;
  const st = h >= 0.38 ? (t % 1.5) : -1; L.puffAt(steamL, hp.clone().add(V(-0.2, 0, 0)), V(-0.5, 1, 0), st, 0.4, 1.5); L.puffAt(steamR, hp.clone().add(V(0.2, 0, 0)), V(0.5, 1, 0), st, 0.4, 1.5);
  rings.forEach((r, i) => { r.visible = h >= 0.58 && h < 1; const q = ((t * 0.8 + i / 5) % 1); r.position.copy(hp).add(V(Math.sin(i) * 0.3, 0.1, -0.2 - q)); r.scale.setScalar(0.3 + q * 1.5); r.material.opacity = 0.8 * (1 - q); r.rotation.y = 0; });
  const fireOn = h >= 0.78; fire.visible = fire2.visible = fireOn; fLight.intensity = fireOn ? 60 * h : 0;
  if (fireOn) { const len = h >= 1 ? 30 : 5; const mp = hp.clone().add(V(0, -0.08, -0.25)); fire.position.copy(mp).add(V(0, 0, -len / 2)); fire.scale.set(len * 0.18 * (1 + 0.1 * Math.sin(t * 40)), len, len * 0.18); fire.rotation.set(Math.PI / 2, 0, 0); fire2.position.copy(fire.position); fire2.scale.set(len * 0.09, len * 0.9, len * 0.09); fire2.rotation.copy(fire.rotation); fLight.position.copy(mp).add(V(0, 0, -1.5)); }
}
function shots() {
  const L2 = H.LINES[1].t, sure = line('You sure').t, mild = line('So...').t;
  return [['establish', 0, L2], ['setup', L2, sure], ['sure', sure, A[1] - 0.6], ['b1', A[1] - 0.6, A[2] - 0.6], ['b2', A[2] - 0.6, A[3] - 0.6], ['b3', A[3] - 0.6, A[5] - 0.6], ['b5', A[5] - 0.6, A[7] - 0.6], ['b7', A[7] - 0.6, A[8] - 0.6], ['b8', A[8] - 0.6, H.worse.t], ['worse', H.worse.t, A[11] - 0.25], ['rocket', A[11] - 0.25, mild], ['mild', mild, H.fact.t], ['fact', H.fact.t, TL.dur + 1]];
}
const FRONT = (d = 1.9, y = 1.7, dx = 0.35) => [V(-0.4 + dx * 1.4, y + 0.25, 7.6 - d - 0.9), V(-0.4, 1.95, 7.6)];
function renderShot(name, lt, dur, t) {
  resetPose(dale); dale.root.position.set(-0.4, 0, 7.6); dale.root.rotation.set(0, Math.PI, 0); const h = heat(t); const b = biteAnim(t); fx(t, h);
  setFace(dale, { lid: lerp(0.35, 0.0, clamp(h * 1.3)), brow: lerp(0.3, 1, h), mouth: b > 0 ? 0.6 : (h >= 0.78 ? 1 : h * 0.6) }); if (h < 0.2) blinkAt(dale, t);
  resetPose(vendor); vendor.root.position.set(-0.4, 0.5, 1.45); setFace(vendor, { lid: 0.45, brow: 0.2 });
  switch (name) {
    case 'establish': { setCam(V(lerp(-14, -10, lt / dur), 3.2, 12), V(-0.4, 2.2, 4), 46); return ts; }
    case 'setup': { dale.aL.sh.rotation.set(0, 0, 1.0); dale.aL.el.rotation.x = -1.4; setFace(dale, { lid: 0.2, brow: 0.7, mouth: 0.2 }); setCam(V(2.4, 2.0, 5.0), V(-0.4, 1.5, 7.4), 46); return ts; }
    case 'sure': { setFace(vendor, { lid: 0.5, brow: -0.3, browTilt: 0.2, mouth: Math.abs(Math.sin(t * 13)) * 0.5 }); vendor.aR.sh.rotation.set(-1.2, 0, -0.3); setCam(V(0.2, 2.1, 6.6), V(-0.4, 2.05, 4.45), 40); return ts; }
    case 'b1': case 'b2': case 'b3': { const [p, l] = FRONT(name === 'b3' ? 1.4 : 1.9, 1.75, name === 'b2' ? -0.3 : 0.35); setCam(p, l, 40); return ts; }
    case 'b5': { if (lt < 2.0) { const [p, l] = FRONT(1.5, 1.8, 0.3); setCam(p, l, 40, 0.004, t); } else setCam(V(2.4, 1.9, 7.2), V(-0.4, 1.7, 7.6), 40); return ts; }
    case 'b7': { const [p, l] = FRONT(1.3, 1.8, -0.25); setCam(p, l, 44, 0.008, t); return ts; }
    case 'b8': { setFace(vendor, { lid: 0.0, brow: 1, mouth: 0.8 }); vendor.aL.sh.rotation.set(-2.2, 0, 0.3); vendor.aR.sh.rotation.set(-2.2, 0, -0.3); if (lt < 1.8) setCam(V(4.5, 1.8, 9.5), V(-0.4, 1.8, 5.0), 48, 0.02, t); else setCam(V(-2.0, 2.4, 4.6), V(-0.4, 1.8, 7.2), 46, 0.02, t); return ts; }
    case 'worse': { resetPose(daleW); daleW.root.rotation.set(0, 0.3, 0); daleW.aR.sh.rotation.set(-1.9, 0, -0.25); daleW.aR.el.rotation.x = -1.6; daleW.head.children.find(c => c.isMesh).material.color.copy(RED); setFace(daleW, { lid: 0.0, brow: 1, mouth: 0.9 }); setCam(V(0.25, 1.7, lerp(1.8, 1.45, lt / dur)), V(0, 1.68, 0), 36, 0.006, t); return wsc; }
    case 'rocket': { const tt = t - A[11];
      if (lt < 2.0) { // fire blast, launches up
        const y = Math.max(0, tt) ** 2 * 18; dale.root.position.y = y; dale.root.rotation.x = -clamp(tt / 0.5) * Math.PI / 2 * 0; fire.visible = fire2.visible = true; const mp = _hp().add(V(0, -0.08, 0)); fire.rotation.set(0, 0, Math.PI); fire.scale.set(1.2, 6 + tt * 6, 1.2); fire.position.copy(mp).add(V(0, -(6 + tt * 6) / 2 - 0.2, 0)); fire2.rotation.copy(fire.rotation); fire2.scale.set(0.6, 5 + tt * 5, 0.6); fire2.position.copy(fire.position); dale.neckG.rotation.x = 1.0; fLight.intensity = 200;
        setCam(V(-10, 2, 16), V(-0.4, Math.min(y, 30) + 2, 7.6), 56, tt > 0 && tt < 1 ? 0.2 : 0.03, t); return ts; }
      S.earth.position.set(0, 0, 0); S.atmo.position.set(0, 0, 0); S.earth.rotation.y = t * 0.05; const q = (lt - 2.0) / (dur - 2.0); const d = 21 + q * 40; daleS.root.position.set(0, d, 0); daleS.root.rotation.set(Math.PI, 0, 0); daleS.root.scale.setScalar(1.2); setFace(daleS, { lid: 0.0, brow: 1, mouth: 1 }); daleS.head.children.find(c => c.isMesh).material.color.copy(RED);
      sFire.position.set(0, d - 0.2 - 4, 0); sFire.scale.set(1.2, 8, 1.2); sFire.rotation.set(0, 0, 0);
      setCam(V(8, d - 3, 12), V(0, d - 2, 0), 48); return S.scene; }
    case 'mild': { woodMat.color.copy(ORANGE).lerp(RED, 0.5); fire.visible = fire2.visible = false; fLight.intensity = 0; rings.forEach(r => r.visible = false); L.hideAll(sweat);
      if (t < line('So...').t + 0.05) { dale.root.position.set(-0.4, 0, 7.6); } setFace(vendor, { lid: 0.5, brow: 0.3, mouth: Math.abs(Math.sin(t * 12)) * 0.5 }); vendor.aR.sh.rotation.set(-1.4, 0, -0.2);
      // Dale crashes back down, smoking, nods
      const k = clamp(lt / 0.5); dale.root.position.y = lerp(12, 0, ease(k)); setFace(dale, { lid: 0.7, brow: -0.4, mouth: 0.1 }); dale.neckG.rotation.x = k >= 1 ? Math.abs(Math.sin(lt * 5)) * 0.2 : 0;
      L.puffAt(steamL, _hp().add(V(0, 0.2, 0)), V(0, 1, 0), lt % 1.5, 0.5, 1.5);
      setCam(V(1.6, 2.0, 4.6), V(-0.4, 1.8, 7.4), 46); return ts; }
    case 'fact': { resetPose(daleL); daleL.root.rotation.y = 0.3; blinkAt(daleL, t); setFace(daleL, { lid: 0.35, brow: 0.2 }); daleL.neckG.rotation.y = 0.4; pepper.rotation.y = t; setCam(V(lerp(1.2, 0.9, ease(lt / dur)), 1.55, lerp(2.6, 2.2, ease(lt / dur))), V(0.2, 1.45, 0.2), 40); return lab.scene; }
  }
}
const rungs = [['2,200', 'SHU', 1, 'SRIRACHA', 2200], ['6,600', 'SHU', 2, 'A JALAPEÑO', 6600], ['19,800', 'SHU', 3, 'A SERRANO', 19800], ['178,200', 'SHU', 5, 'A HABANERO', 178200], ['1.6 M', 'SHU', 7, 'HOTTER THAN A GHOST PEPPER', 1.6e6], ['4.8 M', 'SHU', 8, 'POLICE PEPPER SPRAY', 4.8e6], ['130 M', 'SHU', 11, '8× PURE CAPSAICIN', 1.3e8]]
  .map(([v, unit, n, cmp, raw], i) => ({ v, unit, n, cmp, raw, at: A[n], gold: i === 6 }));
const overlay = L.makeOverlay({ lines: H.LINES, titleL1: 'What if every bite of your taco was', titleHi: '3× spicier', titleL2: ' than the last?', titleSize: 72, hudLabel: r => 'BITE ' + r.n + '   ·   HEAT', rule: '×3 EVERY BITE', rungs, barMin: 1000, barMax: 2e8, barMarks: [[1e6, 'GHOST'], [1.6e7, 'PURE']], fact: { big: '16 M', unit: 'SHU', sub: 'PURE CAPSAICIN · GHOST PEPPER ≈ 1 MILLION' }, hideHUD: ['worse', 'fact', 'mild', 'sure', 'setup'], flashBig: [A[11]], flashSmall: [A[8]] });
L.makeFrame(shots, renderShot, overlay);

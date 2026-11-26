import * as L from '/lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, easeOut, lerp, setCam, rng, makeGuy, setFace, resetPose, blinkAt } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const A = {}; TL.tl.filter(x => x.type === 'act').forEach(x => A[x.n] = x.blast);
const line = H.line;
const NS = [1, 3, 5, 7, 9, 11, 23]; const FH = 3.5;
const flN = n => Math.pow(3, n - 1);
function floorAt(t) { let f = 0; for (const n of NS) if (t > A[n] - 0.3) { const q = ease(clamp((t - A[n] + 0.3) / 1.2)); f = lerp(f, flN(n), q); } return f; }
// floor display texture
const dCan = document.createElement('canvas'); dCan.width = 512; dCan.height = 160; const dTex = new THREE.CanvasTexture(dCan); dTex.colorSpace = THREE.SRGBColorSpace; let lastD = '';
function drawDisp(f) { const s = Math.round(f).toLocaleString('en-US'); if (s === lastD) return; lastD = s; const g = dCan.getContext('2d'); g.fillStyle = '#120806'; g.fillRect(0, 0, 512, 160); g.fillStyle = '#ff7a2a'; g.textAlign = 'center'; g.textBaseline = 'middle'; let fs = 120; g.font = `bold ${fs}px "Archivo Black"`; while (g.measureText(s).width > 470 && fs > 20) { fs -= 6; g.font = `bold ${fs}px "Archivo Black"`; } g.fillText('▲ ' + s, 256, 86); dTex.needsUpdate = true; }
const steel = mat(0xb8bcc4, { m: 0.7, r: 0.35 }), dark = mat(0x3a3d44, { m: 0.5, r: 0.5 });
// ---------- car interior ----------
const car = new THREE.Scene(); car.background = new THREE.Color(0x101014);
car.add(new THREE.HemisphereLight(0xfff4e6, 0x403830, 0.55)); { const l = new THREE.PointLight(0xfff0d8, 3, 6, 2); l.position.set(0, 2.5, 0.6); car.add(l); const l2 = new THREE.SpotLight(0xffe8c8, 9, 6, 0.9, 0.6); l2.position.set(0, 2.6, 0); l2.target.position.set(0, 0, 0); car.add(l2, l2.target); }
{ const shell = mesh(new THREE.BoxGeometry(2.2, 2.7, 2.6), new THREE.MeshStandardMaterial({ color: 0x9aa0a8, metalness: 0.5, roughness: 0.45, side: THREE.BackSide })); shell.position.y = 1.35; car.add(shell);
  const fl = mesh(new THREE.PlaneGeometry(2.18, 2.58), mat(0x2a2a30, { r: 0.8 })); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.01; car.add(fl);
  const lamp = box(1.2, 0.03, 1.2, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff4dc, emissiveIntensity: 1.4 })); lamp.position.y = 2.68; car.add(lamp);
  const rail = box(0.04, 0.04, 2.4, mat(0xd8c08a, { m: 0.8 })); rail.position.set(-1.06, 0.95, 0); car.add(rail);
  const panel = box(0.04, 0.9, 0.3, dark); panel.position.set(1.08, 1.3, 0.75); car.add(panel);
  for (let i = 0; i < 10; i++) { const b = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 12), new THREE.MeshStandardMaterial({ color: 0xeeeeee, emissive: i === 8 ? 0xffaa44 : 0x000000 })); b.rotation.z = Math.PI / 2; b.position.set(1.055, 1.0 + (i % 5) * 0.12, 0.69 + Math.floor(i / 5) * 0.12); car.add(b); }
  const disp = mesh(new THREE.PlaneGeometry(0.62, 0.2), new THREE.MeshBasicMaterial({ map: dTex })); disp.position.set(0, 2.4, -1.28); car.add(disp);
  for (const x of [-0.47, 0.47]) { const d = box(0.92, 2.2, 0.04, steel); d.position.set(x, 1.1, 1.28); car.add(d); } }
const daleC = makeGuy({ ...L.DALE }); car.add(daleC.root);
// ---------- lobby ----------
const lob = new THREE.Scene(); lob.background = new THREE.Color(0xe8e2d6); lob.add(new THREE.HemisphereLight(0xfff6e8, 0x8a7a66, 1.2)); { const s = new THREE.DirectionalLight(0xfff0d8, 2.2); s.position.set(3, 6, 5); s.castShadow = true; Object.assign(s.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 }); s.shadow.mapSize.set(2048, 2048); lob.add(s); }
{ const fl = mesh(new THREE.PlaneGeometry(20, 20), mat(0xd8cdb8, { r: 0.35 })); fl.rotation.x = -Math.PI / 2; lob.add(fl); const wall = box(14, 4, 0.2, mat(0xe9e4da)); wall.position.set(0, 2, -2); lob.add(wall);
  for (const x of [-1.4, 1.4]) { const fr = box(1.3, 2.5, 0.08, mat(0x9a9ca2, { m: 0.8, r: 0.3 })); fr.position.set(x, 1.25, -1.86); lob.add(fr); for (const dx of [-0.31, 0.31]) { const d = box(0.6, 2.3, 0.04, steel); d.position.set(x + dx, 1.17, -1.8); lob.add(d); } const ind = mesh(new THREE.PlaneGeometry(0.5, 0.16), new THREE.MeshBasicMaterial({ map: dTex })); ind.position.set(x, 2.75, -1.88); lob.add(ind); }
  const btn = box(0.12, 0.25, 0.04, dark); btn.position.set(0, 1.2, -1.86); lob.add(btn); const plant = mesh(new THREE.IcosahedronGeometry(0.4, 0), mat(0x4f9a45)); plant.position.set(-3.2, 0.9, -1.4); lob.add(plant); const potL = mesh(new THREE.CylinderGeometry(0.25, 0.2, 0.5, 14), mat(0xf4f4f4)); potL.position.set(-3.2, 0.25, -1.4); lob.add(potL); }
const daleB = makeGuy({ ...L.DALE }); daleB.root.position.set(-0.9, 0, -0.9); lob.add(daleB.root);
const cow = makeGuy({ wood: 0xe8c9a0, hair: 0x6a3a1a, shirt: 0x7a4ab0, glasses: true }); cow.root.position.set(0.7, 0, -0.5); cow.root.rotation.y = -0.9; lob.add(cow.root);
// ---------- exterior car model ----------
function makeCarExt() { const g = new THREE.Group(); const fr = mat(0xd0d4da, { m: 0.8, r: 0.3 }); for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const p = box(0.15, 3, 0.15, fr); p.position.set(x * 1.2, 1.5, z * 1.2); g.add(p); } for (const y of [0, 3]) { const p = box(2.6, 0.2, 2.6, fr); p.position.y = y; g.add(p); } const gl = mesh(new THREE.BoxGeometry(2.4, 2.8, 2.4), new THREE.MeshStandardMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.2 }), false, false); gl.position.y = 1.5; g.add(gl); const lit = new THREE.PointLight(0xfff0d0, 4, 6, 2); lit.position.y = 2.6; g.add(lit); const d = makeGuy({ ...L.DALE }); d.root.scale.setScalar(1.2); d.root.position.y = 0.1; g.add(d.root); g.userData.dale = d; return g; }
// ---------- town / tower ----------
const town = L.buildTown({ sky: 'day', seed: 55, skip: [[0, 0], [-1, 0], [0, -1], [-1, -1]] }); const ts = town.scene;
town.buildings.forEach(B => { if (Math.abs(B.b.position.x) < 16 && Math.abs(B.b.position.z) < 16) B.b.visible = false; });
const tower = new THREE.Group(); { const tt = L.canvasTex(256, 512, (g, w, h) => { g.fillStyle = '#5a7f9a'; g.fillRect(0, 0, w, h); for (let y = 0; y < 20; y++) for (let x = 0; x < 6; x++) { g.fillStyle = (x * 7 + y * 3) % 5 ? '#a8d4ec' : '#ffe9b0'; g.fillRect(8 + x * 41, 6 + y * 25.4, 34, 18); } }); const m = new THREE.MeshStandardMaterial({ map: tt, roughness: 0.4, metalness: 0.2 }); const b = mesh(new THREE.BoxGeometry(16, 70, 16), [m, m, mat(0x6a6e74), m, m, m]); b.position.y = 35; tower.add(b); const shaft = box(0.4, 72, 0.4, steel); shaft.position.set(-1.6, 36, 8.3); tower.add(shaft); const shaft2 = shaft.clone(); shaft2.position.x = 1.6; tower.add(shaft2); }
tower.position.set(0, 0, -6); ts.add(tower);
const carT = makeCarExt(); ts.add(carT); const cableT = box(0.08, 1, 0.08, dark); ts.add(cableT);
const roofPuff = L.makePuff(ts, 60, 0xb8b0a0, 0.7, 4);
const chunks = L.makeInstanced(new THREE.BoxGeometry(1, 0.6, 1), mat(0x8a8e94), 40); ts.add(chunks);
const chunkD = L.debrisData(8, 40, (r) => ({ p0: V((r() - 0.5) * 4, 70, 3 + (r() - 0.5) * 3), v: V((r() - 0.5) * 30, 10 + r() * 25, (r() - 0.5) * 30), spin: r() * 10 }));
// ---------- high sky ----------
const sky = new THREE.Scene(); sky.background = new THREE.Color(0x6fa8e8); sky.add(new THREE.HemisphereLight(0xeaf4ff, 0x8a9aa8, 1.3)); { const s = new THREE.DirectionalLight(0xfff4e0, 2.6); s.position.set(1, 1.2, 0.6); sky.add(s); }
{ const cm = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true }); const r = rng(12); for (let i = 0; i < 220; i++) { const c = mesh(new THREE.IcosahedronGeometry(60 + r() * 120, 1), cm, false, false); c.scale.y = 0.4; c.position.set((r() - 0.5) * 5000, 2000 + r() * 120, (r() - 0.5) * 5000); sky.add(c); } }
const carS = makeCarExt(); sky.add(carS); const cableS = box(0.08, 1, 0.08, dark); sky.add(cableS);
const plane = new THREE.Group(); { const pm = mat(0xf4f6f8, { r: 0.4 }); const f = mesh(new THREE.CylinderGeometry(2, 2, 30, 14), pm); f.rotation.z = Math.PI / 2; plane.add(f); const nose = mesh(new THREE.SphereGeometry(2, 14, 10), pm); nose.position.x = 15; plane.add(nose); plane.add(box(8, 0.4, 34, pm)); const tf = box(4, 6, 0.4, mat(0xd9301f)); tf.position.set(-13, 3.5, 0); plane.add(tf); } sky.add(plane);
// ---------- space ----------
const S = L.buildSpace(); const carSp = makeCarExt(); S.scene.add(carSp); const cableSp = mesh(new THREE.CylinderGeometry(1, 1, 1, 6), dark); S.scene.add(cableSp);
const venus = mesh(new THREE.SphereGeometry(19, 48, 32), new THREE.MeshStandardMaterial({ map: L.canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#e8c47a'; g.fillRect(0, 0, w, h); const r = rng(3); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${200 + r() * 50},${150 + r() * 50},90,0.5)`; g.fillRect(0, r() * h, w, 4 + r() * 14); } }), roughness: 1 }), false, false); venus.visible = false; S.scene.add(venus);
// ---------- worse / lab ----------
const wsc = new THREE.Scene(); wsc.background = new THREE.Color(0x14060a); const wl = new THREE.PointLight(0xff3020, 30, 12, 2); wl.position.set(0.8, 2.0, 2.0); wsc.add(wl); wsc.add(new THREE.AmbientLight(0x200810, 1)); const daleW = makeGuy({ ...L.DALE }); wsc.add(daleW.root);
const lab = L.buildLab({ bg: 0xe6eaf0, floor: 0xd6dbe2 }); const daleL = makeGuy({ ...L.DALE }); daleL.root.position.set(-0.7, 0, 0); lab.scene.add(daleL.root);
const mini = makeCarExt(); mini.scale.setScalar(0.32); mini.position.set(0.55, 0, -0.2); mini.userData.dale.root.visible = false; lab.scene.add(mini);

function shots() {
  const L2 = H.LINES[1].t, music = line('The elevator music').t;
  return [['establish', 0, L2], ['setup', L2, A[1] - 0.7], ['e1', A[1] - 0.7, A[3] - 0.6], ['e3', A[3] - 0.6, A[5] - 0.5], ['e5', A[5] - 0.5, A[7] - 0.5], ['e7', A[7] - 0.5, A[9] - 0.5], ['e9', A[9] - 0.5, A[11] - 0.5], ['e11', A[11] - 0.5, H.worse.t], ['worse', H.worse.t, A[23] - 0.4], ['venus', A[23] - 0.4, music], ['end', music, H.fact.t], ['fact', H.fact.t, TL.dur + 1]];
}
function talkMouth(g, prefix, t) { const l = line(prefix); return t > l.t && t < l.end ? Math.abs(Math.sin(t * 14)) * 0.5 : 0; }
function inCar(t, mood) { resetPose(daleC); daleC.root.position.set(-0.15, 0, -0.7); daleC.root.rotation.set(0, 0, 0); blinkAt(daleC, t); setFace(daleC, mood); }
function placeCar(g, cable, y, base) { g.position.set(0, y, 0); cable.scale.set(1, Math.max(0.01, y - base), 1); cable.position.set(0, base + (y - base) / 2, 0); }
function renderShot(name, lt, dur, t) {
  L.cam.far = 6000; const f = floorAt(t); drawDisp(Math.max(1, f));
  switch (name) {
    case 'establish': { carT.position.set(0, 0.2, 2.6); carT.userData.dale.root.visible = false; cableT.visible = false; L.hideAll(roofPuff); L.hideAll(chunks); const k = ease(lt / dur); setCam(V(lerp(46, 38, k), lerp(12, 18, k), lerp(70, 62, k)), V(0, 30, -6), 46); return ts; }
    case 'setup': { resetPose(daleB); daleB.root.rotation.y = 0.5; blinkAt(daleB, t); setFace(daleB, { lid: 0.25, brow: 0.6, browTilt: 0.2 }); setFace(cow, { lid: 0.5, brow: 0.2, mouth: talkMouth(cow, 'Just', t) }); const press = line('Just'); if (t > press.end) { daleB.aR.sh.rotation.set(-1.2, 0, 0.3); }
      setCam(V(1.4, 1.6, 3.5), V(0.0, 1.3, -1), 44); return lob; }
    case 'e1': { inCar(t, { lid: 0.3, brow: 0.4 }); if (t < A[1] + 0.3) { daleC.aR.sh.rotation.set(-0.9, 0, 0.9); daleC.root.rotation.y = -0.7; } setCam(V(0.5, 1.6, 1.15), V(-0.1, 1.45, -0.7), 66, t > A[1] && t < A[1] + 0.4 ? 0.01 : 0, t); return car; }
    case 'e3': { inCar(t, { lid: 0.1, brow: 0.9, mouth: 0.3 }); const dt = t - A[3]; if (dt > 1.6) { daleC.root.rotation.y = Math.PI * 0.85; } setCam(V(-0.55, 1.6, 1.15), V(0.0, 1.5, -0.8), 66, dt > 0 && dt < 1.4 ? 0.02 : 0, t); return car; }
    case 'e5': { const dt = t - A[5]; carT.userData.dale.root.visible = true; cableT.visible = true; const y = Math.max(0, lerp(9 * FH, 81 * FH, ease(clamp(dt / 1.4)))); carT.position.set(0, y, 2.6); cableT.scale.set(1, Math.max(0.1, y), 1); cableT.position.set(0, y / 2, 2.6);
      const br = dt - 0.55; L.puffAt(roofPuff, V(0, 70, 2.6), V(0, 1, 0.3), br, 8, 3); L.debrisAt(chunks, chunkD, br, 9.8, 0);
      setFace(carT.userData.dale, { lid: 0, brow: 1, mouth: 0.6 }); carT.userData.dale.root.rotation.y = 0.4;
      if (lt < 1.2) setCam(V(38, 14, 62), V(0, 30, -6), 48); else setCam(V(16, y + 4, 26), V(0, y + 0.5, 0), 56, br > 0 && br < 0.6 ? 0.2 : 0, t); return ts; }
    case 'e7': { sky.background.set(0x6fa8e8); const dt = t - A[7]; const y = lerp(81 * FH, 729 * FH, ease(clamp(dt / 1.6))); placeCar(carS, cableS, y + 1400, 0); const Y = carS.position.y; plane.visible = false; setFace(carS.userData.dale, { lid: 0, brow: 1, mouth: 0.6 }); carS.userData.dale.root.rotation.y = 0.5;
      setCam(V(16, Y + 4, 26), V(0, Y + 0.5, 0), 56, 0.03, t); return sky; }
    case 'e9': { const dt = t - A[9]; const k = clamp(dt / 1.6); sky.background.setRGB(lerp(0.44, 0.1, k), lerp(0.66, 0.2, k), lerp(0.91, 0.5, k)); const y = lerp(3950, 23000, ease(k)); placeCar(carS, cableS, y, 0); plane.visible = true; plane.scale.setScalar(1.5); plane.position.set(lerp(-120, 120, clamp((y - 9000) / 4000)), 11000, 40); carS.userData.dale.root.rotation.y = 0.5;
      setCam(V(16, y + 4, 26), V(0, y + 0.5, 0), 56, 0.02, t); return sky; }
    case 'e11': { venus.visible = false; S.earth.rotation.y = 0.3; const dt = t - A[11]; const alt = lerp(0.9, 1.6, ease(clamp(dt / 1.6))); const dir = V(0.2, 1, 0.4).normalize(); carSp.scale.setScalar(0.15); carSp.position.copy(dir.clone().multiplyScalar(20 + alt)); carSp.quaternion.setFromUnitVectors(V(0, 1, 0), dir); cableSp.scale.set(0.004, alt, 0.004); cableSp.position.copy(dir.clone().multiplyScalar(20 + alt / 2)); cableSp.quaternion.copy(carSp.quaternion);
      const side = V(1, 0, -0.4).normalize(); setCam(carSp.position.clone().add(side.multiplyScalar(2.2)).add(dir.clone().multiplyScalar(1.6)), carSp.position.clone().add(dir.clone().multiplyScalar(-0.6)), 50); return S.scene; }
    case 'worse': { resetPose(daleW); daleW.root.rotation.set(0, 0.3, 0); setFace(daleW, { lid: 0.0, brow: 1, mouth: 0.5 }); setCam(V(0.25, 1.65, lerp(1.8, 1.45, lt / dur)), V(0, 1.55, 0), 36, 0.006, t); return wsc; }
    case 'venus': { venus.visible = true; const dt = t - A[23]; const k = ease(clamp(dt / 2.4)); const VP = V(-180, 40, -260); venus.position.copy(VP); const dir = VP.clone().normalize(); const P = dir.clone().multiplyScalar(26).lerp(VP.clone().add(V(10, 30, 26)), k); carSp.scale.setScalar(0.4); carSp.position.copy(P); carSp.quaternion.setFromUnitVectors(V(0, 1, 0), dir); const mid = P.clone().multiplyScalar(0.5); cableSp.scale.set(0.05, P.length(), 0.05); cableSp.position.copy(mid); cableSp.quaternion.setFromUnitVectors(V(0, 1, 0), P.clone().normalize());
      if (lt < 1.4) setCam(V(-20, 30, 60), V(0, 5, 0), 50, 0.3, t); else setCam(P.clone().add(V(6, 4, 10)), P.clone().lerp(VP, 0.55), 55); return S.scene; }
    case 'end': { inCar(t, { lid: 0.45, brow: 0.3, mouth: talkMouth(daleC, "I'm", t) }); daleC.root.rotation.y = 0.15; setCam(V(0.35, 1.6, lerp(1.15, 0.95, lt / dur)), V(-0.1, 1.5, -0.7), 62); return car; }
    case 'fact': { resetPose(daleL); daleL.root.rotation.y = 0.3; setFace(daleL, { lid: 0.35, brow: 0.3 }); blinkAt(daleL, t); const k = ease(lt / dur); setCam(V(lerp(1.3, 1.0, k), 1.5, lerp(3.6, 3.2, k)), V(0.0, 1.25, 0), 46); return lab.scene; }
  }
}
const rungs = [['1', 'floor', 1, '3.5 METERS', 3.5], ['9', 'floors', 3, 'HIS FLOOR', 31.5], ['81', 'floors', 5, 'THROUGH THE ROOF', 283], ['729', 'floors', 7, '3× BURJ KHALIFA', 2551], ['23', 'km', 9, 'ABOVE EVERY PLANE', 22963], ['207', 'km', 11, 'PAST THE EDGE OF SPACE', 206671], ['110 M', 'km', 23, 'PAST VENUS', 1.098e11]]
  .map(([v, unit, n, cmp, raw], i) => ({ v, unit, n, cmp, raw, at: A[n], gold: i === 6 }));
const overlay = L.makeOverlay({ lines: H.LINES, titleL1: 'What if every elevator ride went', titleHi: '3× higher', titleL2: ' than the last?', titleSize: 74, hudLabel: r => 'RIDE ' + r.n + '   ·   HEIGHT', rule: '×3 EVERY RIDE', rungs, barMin: 1, barMax: 3e11, barMarks: [[1e5, 'SPACE'], [3.844e8, 'MOON']], fact: { big: '20.5', unit: 'm/s', sub: 'SHANGHAI TOWER · ~74 KM/H' }, hideHUD: ['worse', 'fact', 'end', 'setup'], flashBig: [A[23]], flashSmall: [A[5] + 0.6] });
L.makeFrame(shots, renderShot, overlay);

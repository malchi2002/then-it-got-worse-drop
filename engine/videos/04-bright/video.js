import * as L from '/lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, lerp, setCam, rng, canvasTex, makeGuy, setFace, resetPose, blinkAt } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const A = {}; TL.tl.filter(x => x.type === 'act').forEach(x => A[x.n] = x.blast);
const line = H.line;
const NIGHT = new THREE.Color(0x0b1026), DAY = new THREE.Color(0x9fd0f5);
const lvl = (t) => { let v = 0; for (const [n, b] of [[1, 0.02], [7, 0.35], [9, 0.8], [11, 1.4], [13, 2.2], [17, 3.2], [21, 5]]) if (t >= A[n]) v = b; return v; };

function makePhone(screenText) {
  const g = new THREE.Group(); const body = box(0.075, 0.15, 0.009, mat(0x111318, { r: 0.3, m: 0.4 })); g.add(body);
  const tex = canvasTex(128, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.fillStyle = '#2b7cff'; c.fillRect(14, 150, 100, 40); c.fillStyle = '#fff'; c.font = 'bold 26px Inter'; c.fillText(screenText || 'u up?', 26, 178); c.fillStyle = '#ccc'; c.fillRect(14, 30, 70, 14); });
  const scrM = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 1 }); const scr = mesh(new THREE.PlaneGeometry(0.068, 0.14), scrM, false, false); scr.position.z = 0.0051; g.add(scr);
  g.userData.scr = scrM; return g;
}
// ---------- bedroom ----------
const room = L.buildRoom({ wall: 0x5b6fa8, floor: 0x6b4a34, sky: 0x0b1026, sunI: 0, seed: 9 });
const rs = room.scene; room.sun.intensity = 0.0; room.hemi.intensity = 0.06; room.fill.intensity = 0; room.ceilLamp.visible = false;
room.skyline.children.forEach(b => { b.material = new THREE.MeshStandardMaterial({ color: 0x1a2340, emissive: 0x3a3010, emissiveIntensity: 0.4 }); });
const bed = new THREE.Group(); { const frame = box(1.2, 0.35, 2.1, mat(0x7a5232)); frame.position.y = 0.2; bed.add(frame); const matt = box(1.1, 0.2, 2.0, mat(0xe8eef6)); matt.position.y = 0.47; bed.add(matt); const blanket = box(1.15, 0.12, 1.3, mat(0x3a8a6a)); blanket.position.set(0, 0.6, 0.35); bed.add(blanket); const pillow = box(0.7, 0.14, 0.35, mat(0xffffff)); pillow.position.set(0, 0.62, -0.75); bed.add(pillow); const hb = box(1.2, 0.9, 0.08, mat(0x7a5232)); hb.position.set(0, 0.6, -1.06); bed.add(hb); }
bed.position.set(0.4, 0, 0.2); rs.add(bed);
const night = box(0.45, 0.5, 0.4, mat(0x7a5232)); night.position.set(-0.55, 0.25, -0.6); rs.add(night);
const poster = mesh(new THREE.PlaneGeometry(0.7, 1.0), new THREE.MeshStandardMaterial({ map: canvasTex(256, 360, (g, w, h) => { g.fillStyle = '#1b1b2b'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff5a3c'; g.beginPath(); g.arc(128, 150, 70, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = "40px 'Archivo Black'"; g.textAlign = 'center'; g.fillText('SPACE', 128, 300); }) })); poster.position.set(-4.88, 1.8, 0.2); poster.rotation.y = Math.PI / 2; rs.add(poster);
const dale = makeGuy({ ...L.DALE, sit: true }); dale.root.position.set(0.4, 0.45, 0.25); dale.root.rotation.y = 0; rs.add(dale.root);
dale.lL.hip.rotation.x = -Math.PI / 2; dale.lR.hip.rotation.x = -Math.PI / 2; dale.lL.kn.rotation.x = 0; dale.lR.kn.rotation.x = 0;
const phone = makePhone(); phone.rotation.set(-0.3, Math.PI, 0); phone.position.set(0, -0.02, 0.03); dale.aR.grip.add(phone);
const pLight = new THREE.PointLight(0xdfe9ff, 0, 30, 2); pLight.castShadow = true; pLight.shadow.mapSize.set(1024, 1024); pLight.shadow.bias = -0.002; rs.add(pLight);
const beamM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
const beam = mesh(new THREE.ConeGeometry(1.2, 3, 32, 1, true), beamM, false, false); rs.add(beam);
function phonePose(t) { dale.aR.sh.rotation.set(-1.1, 0, -0.15); dale.aR.el.rotation.set(-1.0, 0, 0); dale.aL.sh.rotation.set(-1.0, 0, 0.2); dale.aL.el.rotation.x = -1.2; dale.neckG.rotation.x = 0.3; }
function tapAnim(t) { let tap = 0; for (const n of [1, 7, 9, 11, 13, 17, 21]) { const d = t - A[n] + 0.12; if (d > 0 && d < 0.2) tap = Math.sin(d / 0.2 * Math.PI); } dale.aL.el.rotation.x = -1.2 - tap * 0.25; }
function lightRoom(t, v) {
  const I = v <= 0 ? 0 : Math.pow(10, v) * 0.8; const wp = new THREE.Vector3(); phone.getWorldPosition(wp); pLight.position.copy(wp).add(V(0, 0.05, 0.15)); pLight.intensity = I; pLight.distance = 6 + v * 8;
  phone.userData.scr.emissiveIntensity = 1 + v * 2; room.hemi.intensity = 0.06 + clamp(v / 3) * 0.6;
  R_exposure(v);
  beam.visible = v > 1.0; beam.position.copy(wp).add(V(0, 0.05, 1.5)); beam.rotation.set(Math.PI / 2, 0, 0); beamM.opacity = clamp((v - 1) / 3) * 0.25;
}
function R_exposure(v) { L.R.toneMappingExposure = 1.05 + clamp(v / 5) * 0.6; }
// ---------- night town ----------
const town = L.buildTown({ sky: 'night', seed: 21, low: true, skip: [[0, -1], [-1, -1], [0, 0]] });
const ts = town.scene;
const house = new THREE.Group(); house.position.set(0, 0, -6); ts.add(house);
{ const wallM = mat(0xd8c4a0); const b = box(8, 5, 7, wallM); b.position.y = 2.5; house.add(b); const roof = mesh(new THREE.ConeGeometry(6.2, 3, 4), mat(0x6a2e2a)); roof.position.y = 6.5; roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.85); house.add(roof); const door = box(1.1, 2.1, 0.1, mat(0x5a3a22)); door.position.set(-2, 1.05, 3.52); house.add(door); }
const winM = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xdfe9ff, emissiveIntensity: 0.05 }); const wins = [];
for (const [x, y, z, ry] of [[1.6, 3.4, 3.52, 0], [-1.6, 3.6, 3.52, 0], [2.2, 1.6, 3.52, 0], [4.02, 3.4, 0, Math.PI / 2], [-4.02, 3.4, 0, -Math.PI / 2]]) { const w = mesh(new THREE.PlaneGeometry(1.3, 1.1), winM, false, false); w.position.set(x, y, z); w.rotation.y = ry; house.add(w); wins.push(w); }
const hLight = new THREE.PointLight(0xdfe9ff, 0, 200, 1.5); hLight.position.set(1.6, 3.4, -1.5); ts.add(hLight);
const winBeams = []; for (const w of wins) { const b = mesh(new THREE.CylinderGeometry(0.75, 3, 14, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }), false, false); const wp = w.position.clone(); const dir = V(Math.sin(w.rotation.y), 0, Math.cos(w.rotation.y)); b.position.copy(wp.clone().add(dir.clone().multiplyScalar(7))).add(house.position); b.rotation.set(dir.z !== 0 ? Math.PI / 2 : 0, 0, dir.x !== 0 ? Math.PI / 2 * -Math.sign(dir.x) : 0); ts.add(b); winBeams.push(b); }
const birds = L.makeInstanced(new THREE.ConeGeometry(0.15, 0.5, 4), mat(0x222222), 30); ts.add(birds);
const nbrs = []; for (let i = 0; i < 6; i++) { const g = makeGuy({ wood: [0xd9b48a, 0xa8c3e8, 0xc9e8a8, 0xf0c8d8, 0xb8a0e0, 0xe8d090][i], hair: 0x333333 }); g.root.position.set(-18 + i * 7, 0, 7.5); g.root.rotation.y = Math.PI; ts.add(g.root); nbrs.push(g); }
function townLight(v) {
  const k = clamp((v - 1.2) / 1.6);
  ts.background = NIGHT.clone().lerp(DAY, k); ts.fog.color.copy(ts.background); town.hemi.intensity = 0.45 + k * 0.9; town.hemi.color.set(0x30406a).lerp(new THREE.Color(0xdbefff), k);
  winM.emissiveIntensity = v <= 0 ? 0.05 : Math.pow(10, v * 0.6); hLight.intensity = v > 1 ? Math.pow(10, v) * 0.6 : 0;
  winBeams.forEach(b => b.material.opacity = clamp((v - 1.2) / 1.5) * 0.45);
  L.R.toneMappingExposure = 1.05;
}
// ---------- space (night side) ----------
const S = L.buildSpace(); S.sun.position.set(-60, 5, -60); S.sunDisk.position.set(-900, 40, -900);
const glowDot = mesh(new THREE.SphereGeometry(0.25, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }), false, false); S.scene.add(glowDot);
const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(220,235,255,0.8)'); gr.addColorStop(1, 'rgba(180,210,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); S.scene.add(glowSprite);
const spot = V(Math.cos(0.9) * 20 * 0.75, Math.sin(0.5) * 20 * 0.7, Math.sin(0.9) * 20 * 0.75).normalize().multiplyScalar(20.05);
const earthLight = new THREE.PointLight(0xdfe9ff, 0, 0, 0); S.scene.add(earthLight);
// lab
const lab = L.buildLab({ bg: 0xe9e4f2, floor: 0xd8d2e6 }); const daleL = makeGuy({ ...L.DALE }); lab.scene.add(daleL.root); const phoneL = makePhone('1,000'); phoneL.rotation.set(-0.2, Math.PI, 0); daleL.aR.grip.add(phoneL);

function shots() {
  const L2 = H.LINES[1].t, said = line('The text said').t, upL = line('u up').t, mom = line('Dale! Go').t;
  return [['establish', 0, L2], ['bed', L2, A[1] - 0.3], ['tap1', A[1] - 0.3, A[7] - 0.3], ['tap7', A[7] - 0.3, A[9] - 0.3], ['tap9', A[9] - 0.3, A[11] - 0.3], ['house', A[11] - 0.3, A[13] - 0.3], ['hood', A[13] - 0.3, A[17] - 0.3], ['orbit', A[17] - 0.3, H.worse.t],
    ['worse', H.worse.t, A[21] - 0.2], ['sun', A[21] - 0.2, said], ['text', said, mom], ['mom', mom, H.fact.t], ['fact', H.fact.t, TL.dur + 1]];
}
function bedReset(t) { resetPose(dale); phonePose(t); tapAnim(t); dale.lL.hip.rotation.x = -Math.PI / 2; dale.lR.hip.rotation.x = -Math.PI / 2; dale.lL.kn.rotation.x = 0; dale.lR.kn.rotation.x = 0; L.hideAll(birds); }
function renderShot(name, lt, dur, t) {
  const v = lvl(t);
  switch (name) {
    case 'establish': { townLight(0); setCam(V(lerp(-16, -12, lt / dur), 3.5, 12), V(0, 3.4, -6), 46); return ts; }
    case 'bed': { bedReset(t); lightRoom(t, 0.01); setFace(dale, { lid: 0.6, brow: -0.1 }); blinkAt(dale, t); setCam(V(lerp(3.2, 2.8, lt / dur), 2.0, 3.6), V(0.4, 1.0, 0.2), 42); return rs; }
    case 'tap1': { bedReset(t); lightRoom(t, Math.max(0.02, v)); setFace(dale, { lid: 0.55 }); blinkAt(dale, t); setCam(V(0.6, 2.05, 1.75), V(0.4, 1.8, 0.25), 40); return rs; }
    case 'tap7': { bedReset(t); lightRoom(t, v); setFace(dale, { lid: 0.3, brow: 0.3 }); setCam(V(2.6, 1.8, 2.8), V(0.4, 1.1, 0.2), 44); return rs; }
    case 'tap9': { bedReset(t); lightRoom(t, v); setFace(dale, { lid: 0.85, brow: -0.6, mouth: 0.2 }); dale.aL.sh.rotation.set(-2.0, 0, 0.6); if (lt < 1.4) setCam(V(0.6, 2.05, 1.7), V(0.4, 1.85, 0.25), 40); else setCam(V(-2.8, 1.3, 2.4), V(0.6, 2.4, -0.6), 56); return rs; }
    case 'house': { townLight(v); if (lt < 1.5) setCam(V(-4, 2.2, 5), V(0, 3.2, -6), 55); else setCam(V(lerp(-5, -3, lt / dur), 1.6, 6), V(1, 5, -6), 64); return ts; }
    case 'hood': { townLight(v); const tt = t - A[13];
      for (let i = 0; i < 30; i++) { const a = i * 0.7 + tt * 1.5; L._m.compose(L._p.set(Math.cos(a) * (8 + i % 5), 12 + (i % 7) + Math.sin(tt * 6 + i) * 0.3, -6 + Math.sin(a) * (8 + i % 4)), L._q.setFromEuler(L._e.set(Math.PI / 2, -a, Math.sin(tt * 20 + i) * 0.5)), L._s.setScalar(tt > 1.5 ? 1 : 0)); birds.setMatrixAt(i, L._m); } birds.instanceMatrix.needsUpdate = true;
      nbrs.forEach((g, i) => { resetPose(g); g.aL.sh.rotation.x = -2.6 * clamp((tt - 0.3 * i) / 0.5); setFace(g, { lid: 0.8, brow: -0.5 }); });
      if (lt < 2.2) setCam(V(-40, 30, 50), V(0, 0, -10), 46); else setCam(V(-3, 1.8, 2.5), V(-5, 1.7, 7.5), 52); return ts; }
    case 'orbit': { const k = lt / dur; S.earth.position.set(0, 0, 0); S.atmo.position.set(0, 0, 0); S.earth.rotation.y = 0.2; glowDot.position.copy(spot); glowSprite.position.copy(spot.clone().multiplyScalar(1.02)); glowSprite.scale.setScalar(4 + Math.sin(t * 30) * 0.2); earthLight.position.copy(spot.clone().multiplyScalar(1.1)); earthLight.intensity = 40; earthLight.distance = 30; earthLight.decay = 2; L.R.toneMappingExposure = 1.05;
      setCam(spot.clone().normalize().multiplyScalar(lerp(70, 55, k)).add(V(10, 8, 0)), V(0, 0, 0), 40); return S.scene; }
    case 'worse': { bedReset(t); lightRoom(t, 2.4); room.hemi.intensity = 0.02; pLight.color.set(0xff3020); L.R.toneMappingExposure = 1.0; setFace(dale, { lid: 0.0, brow: 1, mouth: 0.5 }); dale.aL.el.rotation.x = -1.45; setCam(V(0.5, 2.05, lerp(1.7, 1.45, lt / dur)), V(0.4, 1.85, 0.25), 38, 0.004, t); return rs; }
    case 'sun': { pLight.color.set(0xdfe9ff); const tt = t - A[21]; const k = clamp(tt / 1.2); S.earth.position.set(0, 0, 0); S.atmo.position.set(0, 0, 0); glowDot.position.copy(spot); glowSprite.position.copy(spot.clone().multiplyScalar(1.02)); glowSprite.scale.setScalar(lerp(4, 260, ease(k))); earthLight.position.copy(spot.clone().multiplyScalar(1.3)); earthLight.intensity = lerp(40, 20000, k); earthLight.distance = 0; earthLight.decay = 2; L.R.toneMappingExposure = 1.05 + k * 0.5;
      if (lt < 2.6) setCam(spot.clone().normalize().multiplyScalar(120).add(V(30, 20, 0)), V(0, 0, 0), 40, tt > 0 && tt < 0.8 ? 1.0 : 0, t);
      else setCam(V(-300, 30, -260), V(0, 0, 0), 55); return S.scene; }
    case 'text': { bedReset(t); lightRoom(t, 1.2); setFace(dale, { lid: 0.2, brow: 0.6 }); const wp = new THREE.Vector3(); phone.getWorldPosition(wp); setCam(V(0.6, 2.05, 1.7), V(0.4, 1.85, 0.25), 40); return rs; }
    case 'mom': { bedReset(t); lightRoom(t, 1.2); setFace(dale, { lid: 0.1, brow: 1, mouth: 0.4 }); dale.neckG.rotation.y = 0.6; setCam(V(0.6, 2.05, 1.7), V(0.4, 1.85, 0.25), 40, 0.004, t); return rs; }
    case 'fact': { L.R.toneMappingExposure = 1.05; resetPose(daleL); daleL.aR.sh.rotation.set(-1.0, 0, -0.1); daleL.aR.el.rotation.x = -1.1; daleL.neckG.rotation.x = 0.25; daleL.root.rotation.y = 0.3; blinkAt(daleL, t); setCam(V(lerp(1.6, 1.2, ease(lt / dur)), 1.6, lerp(2.4, 2.0, ease(lt / dur))), V(0.1, 1.35, 0.1), 40); return lab.scene; }
  }
}
const rungs = [['1', 'nit', 1, 'NIGHT MODE', 1], ['729', 'nits', 7, 'A PHONE AT NOON', 729], ['6,561', 'nits', 9, 'A STADIUM SCREEN', 6561], ['59,049', 'nits', 11, 'A HOUSE-SIZED FLASHLIGHT', 59049], ['531,441', 'nits', 13, 'FAKE SUNRISE', 531441], ['43 M', 'nits', 17, 'VISIBLE FROM SPACE', 4.3e7], ['3.5 B', 'nits', 21, '2× THE SUN’S SURFACE', 3.49e9]]
  .map(([v, unit, n, cmp, raw], i) => ({ v, unit, n, cmp, raw, at: A[n], gold: i === 6 }));
const overlay = L.makeOverlay({ lines: H.LINES, titleL1: 'What if every tap made your phone', titleHi: '3× brighter', titleL2: '?', titleSize: 76, hudLabel: r => 'TAP ' + r.n + '   ·   BRIGHTNESS', rule: '×3 EVERY TAP', rungs, barMin: 0.5, barMax: 5e9, barMarks: [[1000, 'PHONE'], [1.6e9, 'SUN']], fact: { big: '~1,000', unit: 'nits', sub: 'TYPICAL PHONE MAX · SUN’S SURFACE ≈ 1.6 BILLION' }, hideHUD: ['worse', 'fact', 'text', 'mom'], flashBig: [A[21]], flashSmall: [A[11], A[13], A[17]] });
const baseOverlay = overlay;
L.makeFrame(shots, renderShot, (t, shot, lt) => { baseOverlay(t, shot, lt); if (shot === 'text') { const c = L.ctx; const a = clamp(lt / 0.2); c.globalAlpha = a; c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(0, 0, L.W, L.H); const x = 290, y = 380, w = 500, h = 960; c.fillStyle = '#111318'; c.beginPath(); c.roundRect(x - 18, y - 18, w + 36, h + 36, 60); c.fill(); c.fillStyle = '#f4f6fb'; c.beginPath(); c.roundRect(x, y, w, h, 44); c.fill(); c.fillStyle = '#222'; c.font = "600 34px Inter"; c.textAlign = 'center'; c.fillText('Unknown Number', x + w / 2, y + 90); c.fillStyle = '#9aa'; c.font = '600 24px Inter'; c.fillText('12:03 AM', x + w / 2, y + 130); c.fillStyle = '#e4e6eb'; c.beginPath(); c.roundRect(x + 40, y + 200, 220, 90, 40); c.fill(); c.fillStyle = '#111'; c.font = "48px 'Archivo Black'"; c.textAlign = 'left'; c.fillText('u up?', x + 70, y + 262); c.globalAlpha = 1; }
  if (shot === 'sun') { const k = clamp((t - A[21]) / 1.0); L.ctx.fillStyle = `rgba(255,255,255,${0.35 * k})`; L.ctx.fillRect(0, 0, L.W, L.H); } });

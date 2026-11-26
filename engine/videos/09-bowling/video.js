import * as L from '/lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, lerp, setCam, rng, canvasTex, signTex, makeGuy, setFace, resetPose, blinkAt } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const A = {}; TL.tl.filter(x => x.type === 'act').forEach(x => A[x.n] = x.blast);
const line = H.line;
// ---------- bowling alley (lane runs toward -z) ----------
const al = new THREE.Scene(); al.background = new THREE.Color(0x120a24); al.fog = new THREE.Fog(0x120a24, 20, 60);
al.add(new THREE.HemisphereLight(0xb0a4e8, 0x302040, 1.4)); const front = new THREE.PointLight(0xffe0c0, 14, 10, 2); front.position.set(0.5, 3, 0.5); al.add(front); const key = new THREE.DirectionalLight(0xfff0e0, 1.2); key.position.set(3, 8, 6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -10, right: 10, top: 25, bottom: -25 }); al.add(key);
const plank = canvasTex(128, 1024, (g, w, h) => { for (let x = 0; x < w; x += 8) { g.fillStyle = `hsl(32,${45 + (x % 24)}%,${58 + ((x * 7) % 10)}%)`; g.fillRect(x, 0, 8, h); } g.fillStyle = 'rgba(80,40,10,0.6)'; for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(w / 2 + (i - 3) * 12, 260); g.lineTo(w / 2 + (i - 3) * 12 - 5, 280); g.lineTo(w / 2 + (i - 3) * 12 + 5, 280); g.fill(); } }); plank.wrapT = THREE.RepeatWrapping; plank.repeat.set(1, 2);
const laneM = new THREE.MeshStandardMaterial({ map: plank, roughness: 0.15, metalness: 0.1 });
for (let i = -3; i <= 3; i++) { const ln = mesh(new THREE.BoxGeometry(1.06, 0.05, 19), laneM); ln.position.set(i * 1.9, 0, -9.5); al.add(ln); for (const s of [-1, 1]) { const gt = mesh(new THREE.CylinderGeometry(0.12, 0.12, 19, 10, 1, true, 0, Math.PI), mat(0x333344, { m: 0.6, r: 0.3 })); gt.rotation.x = Math.PI / 2; gt.rotation.z = Math.PI; gt.position.set(i * 1.9 + s * 0.65, 0.02, -9.5); al.add(gt); } const div = box(0.3, 0.4, 19, mat(0x2a2040)); div.position.set(i * 1.9 + 0.95, 0.2, -9.5); al.add(div); }
const approach = box(16, 0.05, 6, mat(0x3a2a5a, { r: 0.6 })); approach.position.set(0, -0.01, 3); al.add(approach);
const backWall = new THREE.Group(); al.add(backWall); const wallPieces = [];
for (let x = -7; x <= 7; x++) for (let y = 0; y < 4; y++) { const p = box(1, 1, 0.4, mat(y === 3 ? 0x1a1030 : 0x2a2050)); p.position.set(x, y + 0.5, -20.2); backWall.add(p); wallPieces.push({ m: p, p0: p.position.clone() }); }
const neonCols = [0xff4fd8, 0x4fd8ff, 0xffe14f]; for (let i = 0; i < 3; i++) { const n = box(16, 0.08, 0.08, new THREE.MeshBasicMaterial({ color: neonCols[i] })); n.position.set(0, 3.6 - i * 0.15, -19.9); al.add(n); const pl = new THREE.PointLight(neonCols[i], 8, 14, 2); pl.position.set(-6 + i * 6, 3, -17); al.add(pl); }
const masking = box(16, 1.2, 0.3, mat(0x101020)); masking.position.set(0, 2.9, -17.5); al.add(masking);
const scoreT = (txt, col) => canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#0b0b1a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#4fd8ff'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = col; g.textAlign = 'center'; g.font = "34px 'Archivo Black'"; g.fillText('FRAME 10 · DALE', w / 2, 70); g.font = "86px 'Archivo Black'"; g.fillText(txt, w / 2, 180); });
const sbTexA = scoreT('NEED X', '#ffe14f'), sbTexB = scoreT('STRIKE!', '#ff4fd8');
const sbM = new THREE.MeshBasicMaterial({ map: sbTexA }); const sb = mesh(new THREE.PlaneGeometry(2.4, 1.2), sbM, false, false); sb.position.set(0, 3.2, -2); al.add(sb);
const pinGeo = new THREE.LatheGeometry([[0, 0], [0.06, 0], [0.06, 0.05], [0.1, 0.12], [0.11, 0.18], [0.08, 0.27], [0.045, 0.32], [0.05, 0.36], [0.06, 0.4], [0.04, 0.44], [0, 0.45]].map(([x, y]) => new THREE.Vector2(x, y)), 16);
const pinM = mat(0xffffff, { r: 0.25 }); const PINS = []; const pinPos = []; for (let r = 0; r < 4; r++) for (let k = 0; k <= r; k++) pinPos.push(V((k - r / 2) * 0.3, 0.03, -17.3 - r * 0.26));
pinPos.forEach(p => { const pn = mesh(pinGeo, pinM); const strip = mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.025, 12), mat(0xd9301f)); strip.position.y = 0.36; pn.add(strip); pn.position.copy(p); al.add(pn); PINS.push(pn); });
const ball = mesh(new THREE.SphereGeometry(0.11, 24, 16), new THREE.MeshPhysicalMaterial({ color: 0x1f6fd8, roughness: 0.1, clearcoat: 1 })); al.add(ball);
const trailM = new THREE.MeshBasicMaterial({ color: 0x9fe0ff, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }); const trail = mesh(new THREE.CylinderGeometry(0.11, 0.0, 1, 12, 1, true), trailM, false, false); trail.rotation.x = Math.PI / 2; al.add(trail);
const dale = makeGuy({ ...L.DALE }); al.add(dale.root);
const friend = makeGuy({ wood: 0xa8c3e8, cap: 0x2d8a4e, shirt: 0xd94f4f, sit: true }); friend.root.position.set(-2.6, 0, 3.2); friend.root.rotation.y = 2.4; al.add(friend.root);
const bench = box(1.4, 0.5, 0.5, mat(0x5a3a8a)); bench.position.set(-2.6, 0.25, 3.3); al.add(bench);
const dust = L.makePuff(al, 50, 0x8a7aa0, 0.7, 4);
// ---------- exterior: street run ----------
const town = L.buildTown({ sky: 'night', seed: 99, skip: [[0, 0]] }); const ts = town.scene;
const ballT = mesh(new THREE.SphereGeometry(0.11, 16, 12), ball.material); ts.add(ballT);
const trailT = mesh(new THREE.CylinderGeometry(0.4, 0, 1, 12, 1, true), trailM, false, false); trailT.rotation.z = Math.PI / 2; ts.add(trailT);
const mall = new THREE.Group(); { const b = box(30, 10, 20, mat(0xc9b8e0)); b.position.y = 5; mall.add(b); const sg = mesh(new THREE.PlaneGeometry(14, 2.5), new THREE.MeshBasicMaterial({ map: signTex([['MEGA MALL', "86px 'Archivo Black'", 100]], { w: 768, h: 140, bg: '#ff4fd8', fg: '#fff', border: false }) })); sg.position.set(0, 8.5, -10.02); sg.rotation.y = Math.PI; mall.add(sg); } mall.position.set(-60, 0, 12); mall.rotation.y = Math.PI / 2; ts.add(mall);
const holeFx = L.makePuff(ts, 60, 0xd8c8f0, 0.8, 7);
// ---------- space ----------
const S = L.buildSpace(); const ballS = mesh(new THREE.SphereGeometry(0.6, 16, 12), ball.material); S.scene.add(ballS);
// ---------- worse ----------
const wsc = new THREE.Scene(); wsc.background = new THREE.Color(0x14060a); const wl = new THREE.PointLight(0xff3020, 30, 12, 2); wl.position.set(0.8, 2.0, 2.0); wsc.add(wl); wsc.add(new THREE.AmbientLight(0x200810, 1)); const daleW = makeGuy({ ...L.DALE }); wsc.add(daleW.root); const ballW = mesh(new THREE.SphereGeometry(0.11, 24, 16), ball.material); daleW.aR.grip.add(ballW); ballW.position.y = -0.08;
// ---------- lab ----------
const lab = L.buildLab({ bg: 0xe6e2f4, floor: 0xd8d2ec }); const daleL = makeGuy({ ...L.DALE }); lab.scene.add(daleL.root); const ballL = mesh(new THREE.SphereGeometry(0.11, 24, 16), ball.material); lab.scene.add(ballL);
const laneL = mesh(new THREE.BoxGeometry(1.06, 0.05, 19), laneM); laneL.position.set(0.6, 0, -8); lab.scene.add(laneL);

function rollPose(g, dt) { // dt relative to release (0)
  const k = clamp((dt + 0.7) / 0.7); g.aR.sh.rotation.set(lerp(0.9, -1.2, ease(k)), 0, -0.1); g.aR.el.rotation.x = -0.1; g.body.rotation.x = 0.35 * Math.sin(Math.PI * k); g.lL.hip.rotation.x = -0.5 * Math.sin(Math.PI * k); g.lL.kn.rotation.x = 0.6 * Math.sin(Math.PI * k); g.lR.hip.rotation.x = 0.6 * Math.sin(Math.PI * k);
  setFace(g, { lid: 0.2, brow: 0.6, mouth: 0.2 });
}
function laneT(dt, speed) { const z = 0.2 - Math.max(0, dt) * speed; return z; } // m/s along -z
function pinsFly(tt, strength, count) { PINS.forEach((p, i) => { p.position.copy(pinPos[i]); p.rotation.set(0, 0, 0); if (i >= count || tt <= 0) return; const r = rng(i * 13 + Math.round(strength)); const v = V((r() - 0.5) * strength, 1 + r() * strength * 0.6, -strength * (0.5 + r())); p.position.addScaledVector(v, tt); p.position.y = Math.max(0.03, p.position.y - 4.9 * tt * tt); p.rotation.set(tt * r() * 20, 0, tt * r() * 20); }); }
function wallBreak(tt) { wallPieces.forEach((w, i) => { w.m.position.copy(w.p0); w.m.rotation.set(0, 0, 0); if (tt <= 0) return; const d = Math.hypot(w.p0.x, w.p0.y - 0.5); if (d > 2.2) return; const r = rng(i * 7); w.m.position.add(V((r() - 0.5) * 6 * tt, 3 * tt - 4.9 * tt * tt + (r() * 2) * tt, -12 * tt)); w.m.rotation.set(tt * r() * 9, tt * r() * 9, 0); }); }
function shots() {
  const L2 = H.LINES[1].t, emb = line('Just don').t, score = line('The scoreboard').t;
  return [['establish', 0, L2], ['setup', L2, emb], ['emb', emb, A[1] - 0.9], ['r1', A[1] - 0.9, A[2] - 0.9], ['r2', A[2] - 0.9, A[3] - 0.9], ['r3', A[3] - 0.9, A[4] - 0.9], ['r4', A[4] - 0.9, A[5] - 0.9], ['r5', A[5] - 0.9, A[6] - 0.9], ['r6', A[6] - 0.9, H.worse.t], ['worse', H.worse.t, A[8] - 0.4], ['space', A[8] - 0.4, score], ['score', score, H.fact.t], ['fact', H.fact.t, TL.dur + 1]];
}
function aReset(t) { resetPose(dale); dale.root.position.set(0, 0, 1.2); dale.root.rotation.set(0, Math.PI, 0); ball.position.set(0.25, 0.11, 1.0); trail.visible = false; pinsFly(0); wallBreak(0); sbM.map = sbTexA; resetPose(friend); setFace(friend, { lid: 0.4 }); blinkAt(friend, t, 2); L.hideAll(dust); }
function laneShot(n, lt, dur, t, speed, count, strength, camMode) {
  aReset(t); const dt = t - A[n]; rollPose(dale, dt); dale.root.position.z = 1.2 - clamp((dt + 0.7) / 0.7) * 0.6;
  if (dt < 0) { const g = new THREE.Vector3(); dale.aR.grip.getWorldPosition(g); ball.position.copy(g); }
  else { const z = 0.4 - dt * speed; const zz = Math.max(z, -17.1); ball.position.set(0, 0.11, zz); ball.rotation.x -= 0.3; trail.visible = speed > 20; const len = Math.min(8, speed * 0.04); trail.scale.set(1, len, 1); trail.position.set(0, 0.11, zz + len / 2); }
  const hitT = dt - (17.5 / speed); pinsFly(hitT, strength, count);
  return dt;
}
function renderShot(name, lt, dur, t) {
  L.cam.far = 4000;
  switch (name) {
    case 'establish': { aReset(t); const k = ease(lt / dur); setCam(V(lerp(5, 3.5, k), lerp(4.5, 3.5, k), lerp(8, 6, k)), V(0, 0.5, -10), 50); return al; }
    case 'setup': { aReset(t); const g = new THREE.Vector3(); dale.aR.sh.rotation.set(-0.3, 0, -0.1); dale.aR.grip.getWorldPosition(g); ball.position.copy(g); setFace(dale, { lid: 0.25, brow: 0.6 }); blinkAt(dale, t); setCam(V(0.6, 1.9, -1.3), V(0, 1.6, 1.2), 44); return al; }
    case 'emb': { aReset(t); setFace(friend, { lid: 0.45, brow: -0.3, mouth: Math.abs(Math.sin(t * 13)) * 0.5 }); friend.aR.sh.rotation.set(-1.4, 0, -0.3); setCam(V(-1.2, 1.4, 1.3), V(-2.6, 1.1, 3.2), 46); return al; }
    case 'r1': { const dt = laneShot(1, lt, dur, t, 8, 1, 1.5); if (lt < 1.4) setCam(V(3.4, 1.4, -0.4), V(0, 1.0, 0.6), 46); else setCam(V(0.9, 0.8, -14.5), V(0, 0.2, -17.4), 40); return al; }
    case 'r2': { const dt = laneShot(2, lt, dur, t, 24, 10, 6); if (lt < 1.2) setCam(V(1.3, 0.35, -1.5), V(0, 0.2, -10), 45); else setCam(V(1.2, 1.0, -14.5), V(0, 0.4, -17.6), 46, dt > 0.7 && dt < 1.2 ? 0.03 : 0, t); return al; }
    case 'r3': { const dt = laneShot(3, lt, dur, t, 72, 10, 15); const hitW = dt - 20 / 72; wallBreak(hitW); L.puffAt(dust, V(0, 1, -20.2), V(0, 0.3, 1), hitW, 2, 2.5); setCam(V(2.4, 1.6, -12), V(0, 1.0, -20), 52, hitW > 0 && hitW < 0.6 ? 0.08 : 0, t); return al; }
    case 'r4': case 'r5': case 'r6': { const n = +name.slice(1); const tt = t - A[n]; const spd = { 4: 217, 5: 652, 6: 1957 }[n]; ballT.position.set(40 - tt * spd * 0.25, 0.3, 12); ballT.scale.setScalar(2.5); trailT.position.set(ballT.position.x + 6, 0.3, 12); trailT.scale.set(1, 12, 1);
      L.puffAt(holeFx, V(-60 + 10, 4, 12), V(-1, 0.3, 0), n === 4 ? tt - 0.4 : -1, 4, 3);
      if (n === 5) { L.shockwave(town, V(ballT.position.x, 0, 12), tt, 80, 3); L.glassBurst(town, V(-20, 0, 12), tt - 0.2, 70); } else { town.ring.visible = town.dome.visible = false; L.hideAll(town.glass); }
      if (n === 4) setCam(ballT.position.clone().add(V(10, 2.5, 9)), ballT.position, 48); else if (n === 5) setCam(V(-10, 40, 60), V(-30, 0, 12), 52, tt > 0 && tt < 0.8 ? 0.3 : 0, t); else setCam(ballT.position.clone().add(V(12, 1.5, 6)), ballT.position, 44, 0.05, t);
      return ts; }
    case 'worse': { resetPose(daleW); daleW.root.rotation.set(0, 0.3, 0); daleW.aR.sh.rotation.set(0.6 + Math.sin(t * 2) * 0.1, 0, -0.1); setFace(daleW, { lid: 0.1, brow: 1, mouth: 0.3 }); setCam(V(0.25, 1.65, lerp(1.8, 1.45, lt / dur)), V(0, 1.6, 0), 36, 0.005, t); return wsc; }
    case 'space': { S.earth.position.set(0, 0, 0); S.atmo.position.set(0, 0, 0); S.earth.rotation.y = t * 0.05; S.moon.position.set(120, 20, -200); const q = Math.max(0, t - A[8]);
      const p = V(18, 8, 8).add(V(1, 0.15, -1.2).normalize().multiplyScalar(q * 60)); ballS.position.copy(p); S.trail.visible = true; L.setTrail(S, i => V(18, 8, 8).add(V(1, 0.15, -1.2).normalize().multiplyScalar(q * 60 * i / 399)));
      if (lt < 2.2) setCam(V(40, 25, 60), V(10, 5, 0), 46); else setCam(p.clone().add(V(-6, 2, 8)), p, 50); return S.scene; }
    case 'score': { aReset(t); sbM.map = sbTexB; PINS.forEach(p => p.visible = false); wallBreak(5); setFace(friend, { lid: 0.5, brow: 0.3, mouth: t > line('Technically').t ? Math.abs(Math.sin(t * 12)) * 0.5 : 0 }); setFace(dale, { lid: 0.3, brow: 0.8, mouth: 0.4 }); dale.aL.sh.rotation.set(0, 0, 2.6); dale.aR.sh.rotation.set(0, 0, -2.6);
      if (t < line('Technically').t) setCam(V(0.3, 2.4, 2.8), V(0, 3.1, -2), 44); else setCam(V(-1.2, 1.4, 1.3), V(-2.6, 1.1, 3.2), 46); return al; }
    case 'fact': { resetPose(daleL); daleL.root.position.set(0, 0, 0.8); daleL.root.rotation.y = Math.PI; const q = clamp((lt - 1.0) / 2.5); ballL.position.set(0.6, 0.13, lerp(0.4, -17, q)); setFace(daleL, { lid: 0.35, brow: 0.3 }); blinkAt(daleL, t); setCam(V(2.2, 1.6, 2.6), V(0.4, 0.8, -3), 46); return lab.scene; }
  }
}
const rungs = [['29', 'km/h', 1, 'A NORMAL ROLL', 29], ['87', 'km/h', 2, 'HIGHWAY SPEED', 87], ['261', 'km/h', 3, 'A SUPERCAR', 261], ['783', 'km/h', 4, 'NEARLY AN AIRLINER', 783], ['2,349', 'km/h', 5, '~2× THE SPEED OF SOUND', 2349], ['7,047', 'km/h', 6, 'FASTER THAN A BULLET', 7047], ['63,423', 'km/h', 8, 'LEAVES THE SOLAR SYSTEM', 63423]]
  .map(([v, unit, n, cmp, raw], i) => ({ v, unit, n, cmp, raw, at: A[n], gold: i === 6 }));
const overlay = L.makeOverlay({ lines: H.LINES, titleL1: 'What if every bowling ball went', titleHi: '3× faster', titleL2: ' than the last?', titleSize: 76, hudLabel: r => 'ROLL ' + r.n + '   ·   SPEED', rule: '×3 EVERY ROLL', rungs, barMin: 10, barMax: 1e5, barMarks: [[1235, 'SOUND'], [40270, 'ESCAPE']], fact: { big: '29', unit: 'km/h', sub: 'TYPICAL BALL SPEED · ~2.5 S TO THE PINS' }, hideHUD: ['worse', 'fact', 'score', 'emb', 'setup'], flashBig: [A[8]], flashSmall: [A[5], A[3] + 0.3] });
L.makeFrame(shots, renderShot, overlay);

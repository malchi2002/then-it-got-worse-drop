import * as L from '/lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, easeOut, lerp, setCam, rng, makeGuy, setFace, resetPose, blinkAt } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const A = {}; TL.tl.filter(x => x.type === 'act').forEach(x => A[x.n] = x.blast);
const line = H.line;
const talk = (p, t) => { const l = line(p); return t > l.t && t < l.end ? Math.abs(Math.sin(t * 14)) * 0.5 : 0; };
const hN = n => 0.5 * Math.pow(3, n - 1);
function armsUp(g, k = 1) { g.aL.sh.rotation.set(-3.05 * k, 0, 0.5 * k + 0.12); g.aR.sh.rotation.set(-3.05 * k, 0, -0.5 * k - 0.12); g.lL.hip.rotation.x = -0.3 * k; g.lL.kn.rotation.x = 0.6 * k; }
function rise(t, n, T = 1.6) { const dt = t - A[n]; return dt < 0 ? 0 : hN(n) * easeOut(clamp(dt / T)); }
// ---------- indoor park ----------
const park = new THREE.Scene(); park.background = new THREE.Color(0x1a1a2a);
park.add(new THREE.HemisphereLight(0xdfe8ff, 0x3a3040, 1.0)); { for (const x of [-6, 0, 6]) { const l = new THREE.PointLight(0xfff0dc, 18, 16, 1.4); l.position.set(x, 5.2, 0); park.add(l); } const s = new THREE.DirectionalLight(0xffffff, 1.2); s.position.set(3, 8, 6); s.castShadow = true; Object.assign(s.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 }); park.add(s); }
const hall = mesh(new THREE.BoxGeometry(24, 5.6, 16), new THREE.MeshStandardMaterial({ color: 0x2a3a6a, roughness: 0.9, side: THREE.BackSide }), false, true); hall.position.y = 2.8; park.add(hall);
{ const fl = mesh(new THREE.PlaneGeometry(24, 16), mat(0x3a3a46)); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.01; park.add(fl); for (let i = 0; i < 12; i++) { const b = box(0.15, 0.15, 16, mat(0xffd23f)); b.position.set(-11 + i * 2, 5.5, 0); park.add(b); } const wallPads = [0xe8402a, 0x2ab0e8, 0x3ad06a, 0xffc02a]; for (let i = 0; i < 12; i++) { const p = box(1.9, 1.2, 0.2, mat(wallPads[i % 4])); p.position.set(-11 + i * 2, 0.6, -7.85); park.add(p); } }
const sign = mesh(new THREE.PlaneGeometry(6, 1.2), new THREE.MeshBasicMaterial({ map: L.canvasTex(512, 102, (g, w, h) => { g.fillStyle = '#ffd23f'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a2a'; g.font = 'bold 56px "Archivo Black"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('BOUNCE ZONE', w / 2, h / 2 + 4); }) })); sign.position.set(0, 3.8, -7.9); park.add(sign);
const mats = []; const matM = mat(0x1a1a1a, { r: 0.6 });
for (let x = -2; x <= 2; x++) for (let z = -1; z <= 1; z++) { const g = new THREE.Group(); const pad = [[2.2, 0.15, 0.3, 0, 1.1], [2.2, 0.15, 0.3, 0, -1.1], [0.3, 0.15, 2.2, 1.1, 0], [0.3, 0.15, 2.2, -1.1, 0]]; pad.forEach(([w, h, d, px, pz]) => { const p = box(w, h, d, mat((x + z) % 2 ? 0x2ab0e8 : 0xe8402a)); p.position.set(px, 0.45, pz); g.add(p); }); const m = box(1.9, 0.02, 1.9, matM); m.position.y = 0.45; g.add(m); g.userData.m = m; const base = box(2.2, 0.38, 2.2, mat(0x22222a)); base.position.y = 0.19; g.add(base); g.position.set(x * 2.3, 0, z * 2.3); park.add(g); mats.push(g); }
const myMat = mats[7]; // center
const dale = makeGuy({ ...L.DALE }); park.add(dale.root);
const att = makeGuy({ wood: 0xc9a07a, cap: 0xe8402a, shirt: 0xffd23f }); att.root.position.set(-5.4, 0, 2.6); att.root.rotation.y = 0.9; park.add(att.root);
const ceilBits = L.makeInstanced(new THREE.BoxGeometry(0.5, 0.08, 0.5), mat(0x2a3a6a), 30); park.add(ceilBits);
const ceilD = L.debrisData(3, 30, r => ({ p0: V((r() - 0.5) * 1.2, 5.5, (r() - 0.5) * 1.2), v: V((r() - 0.5) * 4, -1 - r() * 2, (r() - 0.5) * 4) }));
// ---------- exterior ----------
const town = L.buildTown({ sky: 'day', seed: 202, skip: [[0, 0], [-1, 0], [0, -1], [-1, -1]] }); const ts = town.scene;
town.buildings.forEach(B => { const p = B.b.position; if (Math.abs(p.x) < 16 && Math.abs(p.z) < 14) B.b.visible = false; });
const bld = new THREE.Group(); { const b = box(24, 6, 16, mat(0x2a3a6a)); b.position.y = 3; bld.add(b); const s2 = sign.clone(); s2.position.set(0, 4.5, 8.02); bld.add(s2); } bld.position.set(0, 0, -2); ts.add(bld);
const hole = mesh(new THREE.CircleGeometry(1.4, 20), new THREE.MeshBasicMaterial({ color: 0x0a0a10 })); hole.rotation.x = -Math.PI / 2; hole.position.set(0, 6.02, 0); ts.add(hole);
const roofPuff = L.makePuff(ts, 40, 0x9aa0b0, 0.8, 3);
const daleT = makeGuy({ ...L.DALE }); ts.add(daleT.root);
// ---------- sky ----------
const sky = new THREE.Scene(); sky.background = new THREE.Color(0x6fa8e8); sky.add(new THREE.HemisphereLight(0xeaf4ff, 0x8a9aa8, 1.3)); { const s = new THREE.DirectionalLight(0xfff4e0, 2.6); s.position.set(1, 1.2, 0.6); sky.add(s); }
{ const cm = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true }); const r = rng(5); for (let i = 0; i < 220; i++) { const c = mesh(new THREE.IcosahedronGeometry(40 + r() * 90, 1), cm, false, false); c.scale.y = 0.4; c.position.set((r() - 0.5) * 4000, 2000 + r() * 80, (r() - 0.5) * 4000); sky.add(c); } }
const daleS = makeGuy({ ...L.DALE }); daleS.root.scale.setScalar(3); sky.add(daleS.root);
const plane = new THREE.Group(); { const pm = mat(0xf4f6f8, { r: 0.4 }); const f = mesh(new THREE.CylinderGeometry(2, 2, 30, 14), pm); f.rotation.z = Math.PI / 2; plane.add(f); plane.add(box(8, 0.4, 34, pm)); const tf = box(4, 6, 0.4, mat(0xd9301f)); tf.position.set(-13, 3.5, 0); plane.add(tf); } plane.scale.setScalar(6); sky.add(plane);
// ---------- space ----------
const S = L.buildSpace(); const daleSp = makeGuy({ ...L.DALE }); S.scene.add(daleSp.root);
const jup = mesh(new THREE.SphereGeometry(60, 64, 40), new THREE.MeshStandardMaterial({ map: L.canvasTex(1024, 512, (g, w, h) => { const cols = ['#d8b48a', '#b8865a', '#e8d2b0', '#a8704a', '#e0c098', '#c09068']; for (let i = 0; i < 24; i++) { g.fillStyle = cols[i % cols.length]; g.fillRect(0, i * h / 24, w, h / 24 + 1); } g.fillStyle = '#c0583a'; g.beginPath(); g.ellipse(w * 0.62, h * 0.64, 60, 30, 0, 0, 7); g.fill(); }), roughness: 1 }), false, false); jup.visible = false; S.scene.add(jup);
// ---------- worse / lab ----------
const wsc = new THREE.Scene(); wsc.background = new THREE.Color(0x14060a); const wl = new THREE.PointLight(0xff3020, 30, 12, 2); wl.position.set(0.8, 2.0, 2.0); wsc.add(wl); wsc.add(new THREE.AmbientLight(0x200810, 1)); const daleW = makeGuy({ ...L.DALE }); wsc.add(daleW.root);
const lab = L.buildLab({ bg: 0xe8eef8, floor: 0xd8dee8 }); const daleL = makeGuy({ ...L.DALE }); daleL.root.position.set(-0.6, 0, 0); lab.scene.add(daleL.root);
const mini = new THREE.Group(); { const m = mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.04, 24), mat(0x1a1a1a)); m.position.y = 0.25; mini.add(m); const r = mesh(new THREE.TorusGeometry(0.47, 0.04, 8, 32), mat(0x2ab0e8)); r.rotation.x = Math.PI / 2; r.position.y = 0.26; mini.add(r); for (let i = 0; i < 6; i++) { const l = box(0.03, 0.25, 0.03, mat(0x444444)); const a = i / 6 * Math.PI * 2; l.position.set(Math.cos(a) * 0.42, 0.125, Math.sin(a) * 0.42); mini.add(l); } } mini.position.set(0.6, 0, -0.1); lab.scene.add(mini);

function parkReset(t) { resetPose(dale); dale.root.rotation.set(0, 0, 0); blinkAt(dale, t); resetPose(att); att.root.rotation.y = 0.9; mats.forEach(m => m.userData.m.position.y = 0.45); hall.visible = true; L.hideAll(ceilBits); }
function bounceAt(t, n, base = 0.46) { const dt = t - A[n]; // dip before launch
  if (dt < 0 && dt > -0.5) { const k = Math.sin((dt + 0.5) / 0.5 * Math.PI); myMat.userData.m.position.y = 0.45 - 0.25 * k; return base - 0.25 * k; }
  return base + rise(t, n); }
function shots() {
  const L2 = H.LINES[1].t, back = line('Back at').t;
  return [['establish', 0, L2], ['setup', L2, A[1] - 0.8], ['b1', A[1] - 0.8, A[3] - 0.8], ['b3', A[3] - 0.8, A[5] - 0.6], ['b5', A[5] - 0.6, A[7] - 0.5], ['b7', A[7] - 0.5, A[9] - 0.5], ['b9', A[9] - 0.5, A[11] - 0.5], ['b11', A[11] - 0.5, A[13] - 0.5], ['b13', A[13] - 0.5, H.worse.t], ['worse', H.worse.t, A[20] - 0.4], ['jup', A[20] - 0.4, back], ['end', back, H.fact.t], ['fact', H.fact.t, TL.dur + 1]];
}
const MP = V(0, 0, 0);
function renderShot(name, lt, dur, t) {
  L.cam.far = 6000;
  switch (name) {
    case 'establish': { parkReset(t); const ph = (t * 1.6) % 1; dale.root.position.set(0, 0.46 + Math.sin(ph * Math.PI) * 0.35, 0); armsUp(dale, 0.4); setFace(dale, { lid: 0.3, brow: 0.5, mouth: 0.2 }); const k = ease(lt / dur); setCam(V(lerp(7, 6, k), lerp(3.4, 2.8, k), lerp(10, 8.5, k)), V(0, 1.2, 0), 50); return park; }
    case 'setup': { parkReset(t); dale.root.position.set(0, 0.46, 0); dale.root.rotation.y = -0.4; setFace(dale, { lid: 0.3, brow: 0.6, browTilt: 0.2 }); setFace(att, { lid: 0.5, brow: 0.6, browTilt: -0.3, mouth: talk('No flips', t) }); att.aR.sh.rotation.set(-1.4, 0, -0.2);
      const nf = line('No flips'); if (t > nf.t - 0.2) setCam(V(-3.2, 1.7, 5.2), V(-5.4, 1.5, 2.6), 44); else setCam(V(1.2, 1.9, 4.0), V(0, 1.4, 0), 44); return park; }
    case 'b1': case 'b3': { parkReset(t); const n = +name.slice(1); const y = bounceAt(t, n); dale.root.position.set(0, Math.min(y, 5.6 - 1.85), 0); armsUp(dale, t > A[n] ? 1 : 0.3); setFace(dale, n === 1 ? { lid: 0.3, brow: 0.6, mouth: 0.3 } : { lid: 0.0, brow: 1, mouth: 0.5 });
      if (n === 3) { const hitT = A[3] + 0.5; if (t > hitT) { dale.root.position.y = 5.6 - 1.85 - 0.1 * Math.exp(-(t - hitT) * 6); setFace(dale, { lid: 0.7, brow: -0.2, mouth: 0.3 }); } L.debrisAt(ceilBits, ceilD, t - hitT, 9.8, 0); }
      if (n === 1) setCam(V(2.0, 2.2, 6.8), V(0, 1.6, 0), 48, 0, t); else setCam(V(2.2, 1.4, 6.5), V(0, lerp(1.5, 3.8, clamp((t - A[3]) / 0.6)), 0), 54, t > A[3] + 0.5 && t < A[3] + 0.9 ? 0.03 : 0, t); return park; }
    case 'b5': { const dt = t - A[5]; resetPose(daleT); armsUp(daleT); setFace(daleT, { lid: 0, brow: 1, mouth: 0.6 }); daleT.root.scale.setScalar(1.6); const y = dt < 0.3 ? 4 : 4 + (hN(5) - 4) * easeOut(clamp((dt - 0.3) / 1.4)); daleT.root.position.set(0, y, 0); hole.visible = dt > 0.3; L.puffAt(roofPuff, V(0, 6, 0), V(0, 1, 0), dt - 0.3, 6, 2.5);
      if (dt > 0.3) setCam(V(12, y + 2, 24), V(0, y - 3, 0), 52, dt < 0.8 ? 0.2 : 0, t); else setCam(V(22, 10, 34), V(0, 6, 0), 50, dt > 0.3 && dt < 0.8 ? 0.2 : 0, t); return ts; }
    case 'b7': { const dt = t - A[7]; resetPose(daleT); armsUp(daleT); setFace(daleT, { lid: 0.1, brow: 0.9, mouth: 0.3 }); daleT.root.scale.setScalar(6); const y = 40 + (hN(7) - 40) * easeOut(clamp(dt / 1.6)); daleT.root.position.set(0, y, 0); hole.visible = true; L.hideAll(roofPuff);
      setCam(V(25, y + 8, 45), V(0, y + 2, 0), 54, 0.02, t); return ts; }
    case 'b9': case 'b11': { const n = +name.slice(1); const dt = t - A[n]; resetPose(daleS); armsUp(daleS); setFace(daleS, { lid: 0.1, brow: 0.9, mouth: 0.4 }); const y0 = n === 9 ? 1000 : hN(9), y1 = hN(n); const y = y0 + (y1 - y0) * easeOut(clamp(dt / 1.6)); daleS.root.position.set(0, y, 0);
      const k = n === 11 ? clamp(dt / 1.4) : 0; sky.background.setRGB(lerp(0.44, 0.06, k), lerp(0.66, 0.12, k), lerp(0.91, 0.36, k)); plane.visible = n === 11; plane.position.set(lerp(-1500, 1500, lt / dur), 10000, -200);
      setCam(V(18, y + 6, 26), V(0, y + 1, 0), 52, 0.02, t); if (n === 11 && lt > 1.6) setCam(V(14, y + 4, 20), V(0, y - 900, -60), 70); return sky; }
    case 'b13': { S.earth.rotation.y = 0.3; jup.visible = false; const dt = t - A[13]; const alt = lerp(0.95, 1.6, easeOut(clamp(dt / 1.6))); const dir = V(0.2, 1, 0.4).normalize(); resetPose(daleSp); armsUp(daleSp); setFace(daleSp, { lid: 0.3, brow: 0.6, mouth: 0.1 }); daleSp.root.scale.setScalar(0.06); daleSp.root.position.copy(dir.clone().multiplyScalar(20 + alt)); daleSp.root.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
      const side = V(1, 0, -0.4).normalize(); const P = daleSp.root.position; setCam(P.clone().add(side.multiplyScalar(0.35)).add(dir.clone().multiplyScalar(0.1)), P.clone().add(dir.clone().multiplyScalar(0.03)), 50); return S.scene; }
    case 'worse': { resetPose(daleW); daleW.root.rotation.set(0, 0.3, 0); armsUp(daleW, 0.8); setFace(daleW, { lid: 0.1, brow: 1, mouth: 0.4 }); setCam(V(0.25, 1.65, lerp(1.8, 1.45, lt / dur)), V(0, 1.55, 0), 36, 0.006, t); return wsc; }
    case 'jup': { const dt = t - A[20]; jup.visible = true; const JP = V(-260, 30, -380); jup.position.copy(JP); jup.rotation.y = t * 0.1; resetPose(daleSp); armsUp(daleSp); setFace(daleSp, { lid: 0.0, brow: 1, mouth: 0.5 }); daleSp.root.scale.setScalar(15); daleSp.root.quaternion.identity(); daleSp.root.rotation.set(0.3, 0.8, 0.2);
      const P = V(0, 24, 0).lerp(JP.clone().add(V(70, 20, 60)), ease(clamp(dt / 3))); daleSp.root.position.copy(P);
      const k = ease(clamp(lt / dur)); setCam(V(lerp(30, -40, k), lerp(60, 70, k), lerp(90, 40, k)), P.clone().lerp(JP, 0.35), 50, lt < 1 ? 0.3 : 0, t); return S.scene; }
    case 'end': { parkReset(t); const ph = ((t - lt) * 0 + t * 2.2) % 1; dale.root.position.set(0, 0.46 + Math.sin(ph * Math.PI) * 0.3, 0); dale.root.rotation.y = 0.2; armsUp(dale, 0.3); setFace(dale, { lid: 0.3, brow: 0.7, browTilt: 0.2, mouth: talk('Five more', t) }); setFace(att, { lid: 0.6, brow: 0.2 }); att.aR.sh.rotation.set(-1.6, 0, 0.2); att.aR.el.rotation.set(-1.4, 0, 0); att.root.position.set(-2.2, 0, 2.2); att.root.rotation.y = 0.8;
      setCam(V(0.3, 1.9, 6.4), V(-0.6, 1.4, 1.0), 50); return park; }
    case 'fact': { resetPose(daleL); daleL.root.rotation.y = 0.3; setFace(daleL, { lid: 0.35, brow: 0.3 }); blinkAt(daleL, t); const k = ease(lt / dur); setCam(V(lerp(1.3, 1.0, k), 1.5, lerp(3.6, 3.2, k)), V(0.0, 1.25, 0), 46); return lab.scene; }
  }
}
const rungs = [['0.5', 'm', 1, 'A NORMAL BOUNCE', 0.5], ['4.5', 'm', 3, 'HELLO, CEILING', 4.5], ['40', 'm', 5, 'THROUGH THE ROOF', 40.5], ['364', 'm', 7, 'NEARLY THE EMPIRE STATE', 364], ['3.3', 'km', 9, 'ABOVE THE CLOUDS', 3280], ['30', 'km', 11, '3× HIGHER THAN PLANES', 29524], ['266', 'km', 13, 'SPACE', 265720], ['581 M', 'km', 20, 'ALMOST TO JUPITER', 5.81e11]]
  .map(([v, unit, n, cmp, raw], i) => ({ v, unit, n, cmp, raw, at: A[n], gold: i === 7 }));
const overlay = L.makeOverlay({ lines: H.LINES, titleL1: 'What if every bounce went', titleHi: '3× higher', titleL2: ' than the last?', titleSize: 80, hudLabel: r => 'BOUNCE ' + r.n + '   ·   HEIGHT', rule: '×3 EVERY BOUNCE', rungs, barMin: 0.2, barMax: 2e12, barMarks: [[1e5, 'SPACE'], [3.844e8, 'MOON']], fact: { big: '68', unit: '%', sub: 'NASA · BETTER WORKOUT THAN JOGGING' }, hideHUD: ['worse', 'fact', 'end', 'setup'], flashBig: [A[20]], flashSmall: [A[5] + 0.3] });
L.makeFrame(shots, renderShot, overlay);

import * as L from '/lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, easeOut, lerp, setCam, rng, canvasTex, signTex, makeGuy, setFace, resetPose, blinkAt } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const A = {}; TL.tl.filter(x => x.type === 'act').forEach(x => A[x.n] = x.blast);
const line = H.line;

// ---------- classroom ----------
const room = L.buildRoom({ wall: 0xd7e3cf, floor: 0xb88a5a, sky: 0xbfe0ff, seed: 4 });
const cs = room.scene;
const boardT = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = '#244a3a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a5a3a'; g.lineWidth = 24; g.strokeRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.88)'; g.font = "64px 'Instrument Serif'"; g.fillText('x² + 5x + 6 = 0', 80, 150); g.fillText('(x + 2)(x + 3) = 0', 80, 260); g.fillText('x = −2,  x = −3', 80, 370); g.font = "40px 'Instrument Serif'"; g.fillText('HOMEWORK: p. 212, #1–40', 80, 460); });
const board = mesh(new THREE.PlaneGeometry(4.2, 2.1), new THREE.MeshStandardMaterial({ map: boardT, roughness: 0.9 }), false, true); board.position.set(-4.88, 1.75, 0.6); board.rotation.y = Math.PI / 2; cs.add(board);
const clock = mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 24), new THREE.MeshStandardMaterial({ map: canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.strokeStyle = '#111'; g.lineWidth = 5; g.beginPath(); g.moveTo(64, 64); g.lineTo(64, 20); g.moveTo(64, 64); g.lineTo(96, 70); g.stroke(); }) }), false, false); clock.rotation.x = Math.PI / 2; clock.position.set(2.2, 2.6, -2.88); cs.add(clock);
const deskM = mat(0xc8a070, { r: 0.6 }), legM = mat(0x555555, { m: 0.5, r: 0.4 });
function desk() { const g = new THREE.Group(); const top = box(0.7, 0.05, 0.55, deskM); top.position.y = 0.74; g.add(top); for (const [x, z] of [[-0.3, -0.22], [0.3, -0.22], [-0.3, 0.22], [0.3, 0.22]]) { const l = box(0.04, 0.72, 0.04, legM); l.position.set(x, 0.36, z); g.add(l); } const seat = box(0.45, 0.04, 0.42, mat(0x3a6ea5)); seat.position.set(0.55, 0.48, 0); g.add(seat); return g; }
const DESKS = []; const STU = []; const r = rng(23); const looks = [{ wood: 0xd9b48a, hair: 0x3a2a1a, shirt: 0xd94f4f }, { wood: 0xa8c3e8, cap: 0x2d8a4e, shirt: 0xf2c14e }, { wood: 0xc9e8a8, hair: 0x7a3a8a, shirt: 0x5a7dd9 }, { wood: 0xf0c8d8, hair: 0xe0b040, shirt: 0x2e9c8f }, { wood: 0xb8a0e0, cap: 0xd94f4f, shirt: 0x444444 }, { wood: 0xe8d090, hair: 0x222222, shirt: 0xff8a3d }, { wood: 0x9ad0c8, hair: 0xa05a2a, shirt: 0x8a5ad9 }, { wood: 0xd0a0a0, cap: 0x1f4e8a, shirt: 0x6ac46a }];
let si = 0;
for (const x of [-1.4, 0.2, 1.8]) for (const z of [-1.9, 0, 1.9]) {
  const d = desk(); d.position.set(x, 0, z); d.rotation.y = 0; cs.add(d); d.userData.p0 = d.position.clone(); DESKS.push(d);
  const isDale = (x === 0.2 && z === 0);
  const g = makeGuy(isDale ? { ...L.DALE, sit: true } : { ...looks[si++ % looks.length], sit: true }); g.root.position.set(x + 0.55, 0, z); g.root.rotation.y = -Math.PI / 2; cs.add(g.root); g.root.userData.p0 = g.root.position.clone();
  if (isDale) { var dale = g; var daleDesk = d; } else STU.push(g);
}
const teacher = makeGuy({ wood: 0x8c9bc0, glasses: true, tie: true, shirt: 0xf3f3f3, pants: 0x3a3a48 }); teacher.root.position.set(-4.3, 0, 0.6); teacher.root.rotation.y = -Math.PI / 2; cs.add(teacher.root);
const tDesk = box(1.4, 0.75, 0.7, mat(0x6a4a30)); tDesk.position.set(-3.2, 0.375, -1.8); cs.add(tDesk);
const mug = mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.11, 16), mat(0xd94f4f, { r: 0.3 })); mug.position.set(-3.0, 0.81, -1.7); cs.add(mug);
// suction items
const PAPERS = L.makeInstanced(new THREE.BoxGeometry(0.21, 0.004, 0.297), mat(0xfbfbf5, { r: 0.9 }), 40); cs.add(PAPERS);
const PENCILS = L.makeInstanced(new THREE.CylinderGeometry(0.008, 0.008, 0.18, 6), mat(0xf2c230), 30); cs.add(PENCILS);
const ERASERS = L.makeInstanced(new THREE.BoxGeometry(0.06, 0.025, 0.035), mat(0xf28aa8), 20); cs.add(ERASERS);
const BAGS = L.makeInstanced(new THREE.BoxGeometry(0.32, 0.4, 0.18), mat(0x4a6ab8), 10); cs.add(BAGS);
const DUST = L.makeInstanced(new THREE.SphereGeometry(0.03, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }), 160); DUST.castShadow = false; cs.add(DUST);
function itemData(seed, n, f) { const rr = rng(seed); const a = []; for (let i = 0; i < n; i++) a.push(f(rr, i)); return a; }
const deskTop = (d, rr) => V(d.x + (rr() - 0.5) * 0.4, 0.78, d.z + (rr() - 0.5) * 0.3);
const deskPos = DESKS.map(d => d.position.clone());
const paperD = itemData(1, 40, (rr, i) => ({ p0: i < 3 ? V(0.2 + (rr() - 0.5) * 0.2, 0.78 + i * 0.004, (rr() - 0.5) * 0.2) : deskTop(deskPos[i % 9], rr), delay: rr() * 1.4, fly: 0.5 + rr() * 0.4, sp: rr() * 10, ang: rr() * 6.28, rad: 0.3 + rr() * 0.8 }));
const pencilD = itemData(2, 30, (rr, i) => ({ p0: deskTop(deskPos[i % 9], rr), delay: rr() * 1.5, fly: 0.4 + rr() * 0.4, sp: rr() * 14, ang: rr() * 6.28, rad: 0.2 + rr() * 0.6 }));
const eraserD = itemData(3, 20, (rr, i) => ({ p0: deskTop(deskPos[i % 9], rr), delay: rr() * 1.5, fly: 0.4 + rr() * 0.3, sp: rr() * 12, ang: rr() * 6.28, rad: 0.2 + rr() * 0.5 }));
const bagD = itemData(4, 10, (rr, i) => ({ p0: V(deskPos[i % 9].x - 0.3, 0.2, deskPos[i % 9].z + 0.35), delay: rr() * 1.2, fly: 0.7 + rr() * 0.4, sp: rr() * 6, ang: rr() * 6.28, rad: 0.4 + rr() * 0.8 }));
const dustD = itemData(5, 160, (rr) => ({ p0: V((rr() - 0.5) * 9, 0.2 + rr() * 2.8, (rr() - 0.5) * 6), delay: rr() * 1.2, fly: 0.6 + rr() * 0.8, sp: 0, ang: rr() * 6.28, rad: 0.5 + rr() * 1.5, loop: true }));
const _mw = new THREE.Vector3();
function mouthPos() { dale.mouth.getWorldPosition(_mw); return _mw.clone(); }
function suck(im, data, mouth, tt, size = 1, loop = false) {
  for (let i = 0; i < data.length; i++) {
    const d = data[i]; let u = (tt - d.delay) / d.fly; if (loop || d.loop) u = u > 0 ? u % 1 : u;
    if (tt <= 0 || u < 0) { L._m.compose(d.p0, L._q.setFromEuler(L._e.set(0, d.ang, 0)), L._s.setScalar(size)); im.setMatrixAt(i, L._m); continue; }
    if (u >= 1) { L._m.makeScale(0, 0, 0); im.setMatrixAt(i, L._m); continue; }
    const k = u * u; const p = d.p0.clone().lerp(mouth, k); const a = d.ang + u * 8; const rr = d.rad * (1 - k);
    p.x += Math.cos(a) * rr * 0.5; p.y += Math.sin(a) * rr * 0.3; p.z += Math.sin(a) * rr * 0.5;
    L._m.compose(p, L._q.setFromEuler(L._e.set(d.sp * u, d.sp * u * 0.7, d.sp * u * 0.3)), L._s.setScalar(size * (1 - k * 0.85))); im.setMatrixAt(i, L._m);
  }
  im.instanceMatrix.needsUpdate = true;
}
function restItems() { for (const [im, d] of [[PAPERS, paperD], [PENCILS, pencilD], [ERASERS, eraserD], [BAGS, bagD]]) suck(im, d, V(0, 0, 0), -1); L.hideAll(DUST); }
function yawnPose(g, dt, k = 1) { // dt relative to blast; yawn holds ~1.4s
  let open = 0;
  if (dt > -0.5 && dt < 0) open = (dt + 0.5) / 0.5; else if (dt >= 0 && dt < 1.6) open = 1; else if (dt >= 1.6 && dt < 2.1) open = 1 - (dt - 1.6) / 0.5;
  open = ease(open);
  g.neckG.rotation.x = -0.45 * open * k; setFace(g, { lid: lerp(0.4, 1, open), brow: 0.5 * open, mouth: 1.6 * open });
  g.aL.sh.rotation.set(lerp(-0.5, -0.2, open), 0, lerp(0.12, 2.5, open)); g.aR.sh.rotation.set(lerp(-0.5, -0.2, open), 0, lerp(-0.12, -2.5, open));
  g.aL.el.rotation.x = lerp(-0.9, -0.2, open); g.aR.el.rotation.x = lerp(-0.9, -0.2, open);
  return open;
}
function teacherWrite(t) { resetPose(teacher); teacher.aR.sh.rotation.x = -1.9 + Math.sin(t * 6) * 0.15; teacher.aR.sh.rotation.z = -0.2 + Math.cos(t * 5) * 0.1; teacher.aR.el.rotation.x = -0.3; }
function roomReset() {
  room.roofOff(false); cs.background = room.sky; room.sun.intensity = 3.2; room.hemi.intensity = 1; room.fill.intensity = 6;
  DESKS.forEach(d => { d.position.copy(d.userData.p0); d.rotation.set(0, 0, 0); });
  [dale, ...STU].forEach(g => { g.root.position.copy(g.root.userData.p0); resetPose(g); g.root.rotation.set(0, -Math.PI / 2, 0); });
  STU.forEach((g, i) => { setFace(g, { lid: 0.55 + (i % 3) * 0.1, brow: -0.1 }); g.neckG.rotation.x = 0.1 + (i % 2) * 0.1; });
  mug.position.set(-3.0, 0.81, -1.7); restItems(); teacherWrite(0);
}
// ---------- exterior school ----------
const town = L.buildTown({ sky: 'day', seed: 31, low: true, skip: [[0, -1], [-1, -1], [0, 0], [-1, 0]] });
const ts = town.scene;
const school = new THREE.Group(); school.position.set(-6, 0, -12); ts.add(school);
const sWall = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#c0583a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(0,0,0,0.12)'; for (let y = 0; y < h; y += 8) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.fillStyle = '#cfe8f7'; for (let x = 12; x < w; x += 40) { g.fillRect(x, 20, 26, 30); g.fillRect(x, 74, 26, 30); } }); sWall.wrapS = THREE.RepeatWrapping; sWall.repeat.set(3, 1);
const sm = new THREE.MeshStandardMaterial({ map: sWall, roughness: 0.85 });
const sBody = mesh(new THREE.BoxGeometry(26, 8, 14), [sm, sm, mat(0xb0a898), mat(0x777777), sm, sm]); sBody.position.y = 4; school.add(sBody);
const sSign = mesh(new THREE.PlaneGeometry(9, 1.6), new THREE.MeshStandardMaterial({ map: signTex([['NORTHVIEW SCHOOL', "54px 'Archivo Black'", 82]], { w: 768, h: 128, bg: '#16213a', fg: '#ffd166', border: false }) })); sSign.position.set(0, 6.6, 7.02); school.add(sSign);
const sRoof = new THREE.Group(); school.add(sRoof); const roofPieces = [];
for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { const p = box(4.4, 0.5, 4.7, mat(0x7a7f88)); p.position.set(-11 + i * 4.4, 8.25, -4.7 + j * 4.7); sRoof.add(p); roofPieces.push({ m: p, p0: p.position.clone(), sp: (i * 3 + j) % 5 }); }
const flag = new THREE.Group(); { const pole = box(0.15, 10, 0.15, mat(0xcccccc, { m: 0.6 })); pole.position.y = 5; flag.add(pole); const f = box(2.2, 1.3, 0.04, mat(0x2d6ad9)); f.position.set(1.1, 9.2, 0); flag.add(f); flag.userData.f = f; } flag.position.set(8, 0, -2); ts.add(flag);
const tornadoT = canvasTex(256, 512, (g, w, h) => { g.fillStyle = '#7b8494'; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(${i % 2 ? 230 : 60},${i % 2 ? 235 : 66},${i % 2 ? 240 : 80},0.35)`; g.lineWidth = 6 + (i % 5) * 4; g.beginPath(); g.moveTo(0, i * 14); g.lineTo(w, i * 14 + 120); g.stroke(); } }); tornadoT.wrapS = tornadoT.wrapT = THREE.RepeatWrapping;
const tornado = mesh(new THREE.CylinderGeometry(70, 4, 180, 48, 20, true), new THREE.MeshStandardMaterial({ map: tornadoT, transparent: true, opacity: 0.92, side: THREE.DoubleSide, roughness: 1 }), false, false); ts.add(tornado); tornado.visible = false;
const stormCloud = new THREE.Group(); ts.add(stormCloud); { const rr = rng(8); for (let i = 0; i < 40; i++) { const c = mesh(new THREE.IcosahedronGeometry(14 + rr() * 16, 1), new THREE.MeshStandardMaterial({ color: 0x5a606c, flatShading: true, roughness: 1 }), false, false); const a = rr() * 6.28, d = rr() * 160; c.position.set(Math.cos(a) * d, 175 + rr() * 15, Math.sin(a) * d); c.scale.y = 0.4; stormCloud.add(c); } } stormCloud.visible = false;
const debT = L.makeInstanced(new THREE.BoxGeometry(1, 0.6, 0.8), mat(0x8a7a6a), 150); ts.add(debT);
const debTD = itemData(9, 150, (rr) => ({ a0: rr() * 6.28, r0: 20 + rr() * 90, h0: rr() * 6, sp: 0.6 + rr() * 0.8, s: 0.4 + rr() * 1.6 }));
const dustT = L.makePuff(ts, 60, 0xb8a890, 0.7, 12);
// ---------- lab ----------
const lab = L.buildLab({ bg: 0xe8eef6, floor: 0xd6dde6 }); const daleL = makeGuy({ ...L.DALE }); daleL.root.position.set(0, 0, 0); lab.scene.add(daleL.root);
const balloon = mesh(new THREE.SphereGeometry(0.0492, 24, 16), new THREE.MeshPhysicalMaterial({ color: 0xff4a5a, roughness: 0.25, clearcoat: 0.6 }), true, false); balloon.position.set(0.45, 1.45, 0.3); lab.scene.add(balloon);
const bString = box(0.004, 0.5, 0.004, mat(0xffffff)); bString.position.set(0.45, 1.15, 0.3); lab.scene.add(bString);

function shots() {
  const L2 = H.LINES[1].t, turn = line('The teacher finally').t, boring = line('Am I').t;
  return [['establish', 0, L2], ['class', L2, A[1] - 0.5], ['y1', A[1] - 0.5, A[3] - 0.5], ['y3', A[3] - 0.5, A[5] - 0.5], ['y5', A[5] - 0.5, A[9] - 0.5], ['y9', A[9] - 0.5, A[13] - 0.5], ['y13', A[13] - 0.5, A[16] - 0.5], ['roof', A[16] - 0.5, H.worse.t],
    ['worse', H.worse.t, A[20] - 0.45], ['tornado', A[20] - 0.45, turn], ['turn', turn, H.fact.t], ['fact', H.fact.t, TL.dur + 1]];
}
function extReset() { tornado.visible = false; stormCloud.visible = false; L.hideAll(debT); L.hideAll(dustT); roofPieces.forEach(p => { p.m.position.copy(p.p0); p.m.rotation.set(0, 0, 0); }); ts.background = new THREE.Color(0x9fd0f5); ts.fog.color.set(0x9fd0f5); town.sun.intensity = 3; town.hemi.intensity = 1.1; }
function renderShot(name, lt, dur, t) {
  switch (name) {
    case 'establish': { extReset(); const k = ease(lt / dur); flag.userData.f.rotation.y = Math.sin(t * 3) * 0.2; setCam(V(lerp(-18, -12, k), lerp(4, 5, k), 12), V(-6, 5, -12), 50); return ts; }
    case 'class': {
      roomReset(); teacherWrite(t); blinkAt(teacher, t); const k = lt / dur;
      setFace(dale, { lid: 0.75, brow: -0.3 }); dale.neckG.rotation.x = 0.25 + Math.sin(t * 1.5) * 0.05; dale.aL.sh.rotation.x = -1.4; dale.aL.el.rotation.x = -1.9;
      if (t < line('And that').t) setCam(V(lerp(3.8, 3.4, k), 2.1, 3.6), V(0, 1.1, 0), 44);
      else setCam(V(-1.6, 1.7, 2.6), V(-4.3, 1.7, 0.6), 40);
      if (t > line('And that').t) setFace(teacher, { lid: 0.5, mouth: Math.abs(Math.sin(t * 12)) * 0.5 });
      return cs;
    }
    case 'y1': { roomReset(); teacherWrite(t); const dt = t - A[1]; yawnPose(dale, dt, 0.8); const m = mouthPos(); suck(PAPERS, paperD.slice(0, 1), m, -1);
      // tiny breeze: top paper flutters
      L._m.compose(V(0.2, 0.79 + Math.max(0, Math.sin(dt * 9)) * 0.02 * (dt > 0 && dt < 1.5), 0), L._q.setFromEuler(L._e.set(Math.sin(t * 20) * 0.08 * (dt > 0 && dt < 1.5), 0, 0)), L._s.setScalar(1)); PAPERS.setMatrixAt(0, L._m); PAPERS.instanceMatrix.needsUpdate = true;
      setCam(V(-0.55, 1.55, 0.55), V(0.75, 1.5, 0), 40); return cs; }
    case 'y3': { roomReset(); teacherWrite(t); const dt = t - A[3]; yawnPose(dale, dt, 0.9); const m = mouthPos();
      suck(PAPERS, paperD.slice(0, 3).map((d, i) => ({ ...d, delay: 0.2 + i * 0.15, fly: 0.5 })), m, dt);
      if (lt < 1.3) setCam(V(-0.45, 1.55, 0.6), V(0.6, 1.25, 0), 40); else setCam(V(-0.9, 2.0, 1.1), V(0.5, 1.15, 0), 46); return cs; }
    case 'y5': { roomReset(); teacherWrite(t); const dt = t - A[5]; yawnPose(dale, dt, 1); const m = mouthPos();
      suck(PAPERS, paperD, m, dt * 0.6); suck(PENCILS, pencilD, m, dt); suck(ERASERS, eraserD, m, dt);
      mug.position.copy(dt > 0.8 ? V(-3.0, 0.81, -1.7).lerp(m, clamp((dt - 0.8) / 0.6) ** 2) : V(-3.0, 0.81, -1.7)); mug.rotation.z = Math.max(0, dt - 0.8) * 6;
      STU.forEach((g, i) => { setFace(g, { lid: 0.2, brow: 0.8, mouth: 0.3 }); g.neckG.rotation.y = 0.5 * Math.sign(g.root.position.z - 0.001); });
      if (lt < 1.6) setCam(V(-1.0, 2.3, 1.2), V(0.6, 1.2, 0), 48); else setCam(V(-1.9, 1.7, 1.7), V(-1.3, 1.1, -0.9), 48);
      return cs; }
    case 'y9': { roomReset(); teacherWrite(t); const dt = t - A[9]; yawnPose(dale, dt, 1.1); const m = mouthPos(); const k = clamp(dt / 1.6);
      suck(PAPERS, paperD, m, 9); suck(PENCILS, pencilD, m, 9); suck(ERASERS, eraserD, m, 9); suck(BAGS, bagD, m, dt);
      DESKS.forEach((d, i) => { if (d === daleDesk) return; const toward = V(0.2, 0, 0).sub(d.userData.p0); d.position.copy(d.userData.p0).addScaledVector(toward, 0.45 * ease(k)); d.position.x += Math.sin(t * 40 + i) * 0.01 * (k > 0 && k < 1); d.rotation.y = 0.2 * k * Math.sin(i); });
      STU.forEach((g, i) => { const toward = V(0.75, 0, 0).sub(g.root.userData.p0); g.root.position.copy(g.root.userData.p0).addScaledVector(toward, 0.45 * ease(k)); setFace(g, { lid: 0.1, brow: 1, mouth: 0.5 }); g.aL.sh.rotation.x = -1.5; g.aR.sh.rotation.x = -1.5; });
      setCam(V(lerp(-1.2, -1.0, k), 3.0, 0.4), V(0.4, 0.3, 0), 70, 0.01, t); return cs; }
    case 'y13': { roomReset(); const dt = t - A[13]; yawnPose(dale, dt, 1.2); const m = mouthPos();
      suck(PAPERS, paperD, m, dt * 0.8 + 0.3, 1, true); suck(PENCILS, pencilD, m, dt + 0.3, 1, true); suck(ERASERS, eraserD, m, dt, 1, true); suck(BAGS, bagD, m, dt * 0.7, 1, true); suck(DUST, dustD, m, dt, 1, true);
      DESKS.forEach((d, i) => { if (d === daleDesk) return; const toward = V(0.2, 0, 0).sub(d.userData.p0); d.position.copy(d.userData.p0).addScaledVector(toward, 0.55); d.position.y = 0.05 * Math.abs(Math.sin(t * 9 + i)); d.rotation.z = Math.sin(t * 7 + i) * 0.08; });
      STU.forEach((g, i) => { const toward = V(0.75, 0, 0).sub(g.root.userData.p0); g.root.position.copy(g.root.userData.p0).addScaledVector(toward, 0.55); setFace(g, { lid: 0, brow: 1, mouth: 1 }); g.aL.sh.rotation.x = -2.4; g.aR.sh.rotation.x = -2.4; g.root.position.y = 0.03 * Math.sin(t * 20 + i); });
      teacherWrite(t); setFace(teacher, { lid: 0.5, mouth: Math.abs(Math.sin(t * 12)) * 0.5 }); if (teacher.tie) teacher.tie.rotation.x = -1.2 + Math.sin(t * 30) * 0.1;
      const k = lt / dur;
      if (lt < 2.6) setCam(V(3.6, 2.2, 3.2), V(0.2, 1.1, 0), 48, 0.02, t);
      else if (lt < 4.6) setCam(V(-2.6, 1.75, -0.6), V(-4.3, 1.65, 0.6), 40, 0.006, t);
      else setCam(V(-0.3, 1.5, 0.5), V(0.75, 1.5, 0), 38, 0.015, t);
      return cs; }
    case 'roof': { extReset(); const dt = t - A[16]; const k = clamp((dt - 0.4) / 1.4);
      roofPieces.forEach((p, i) => { const q = clamp(k - p.sp * 0.06); p.m.position.set(p.p0.x * (1 - q * 0.6), p.p0.y - 7.6 * q * q, p.p0.z * (1 - q * 0.6)); p.m.rotation.set(q * (p.sp - 2) * 0.4, 0, q * (2 - p.sp) * 0.5); });
      L.puffAt(dustT, V(-6, 5, -12), V(0, 1, 0), dt - 0.9, 6, 3);
      if (lt < dur * 0.55) setCam(V(-6, 26, 20), V(-6, 6, -12), 50, dt > 0.8 && dt < 1.6 ? 0.25 : 0, t);
      else setCam(V(10, 2.5, 16), V(-6, 7, -12), 52, 0.05, t);
      return ts; }
    case 'worse': { roomReset(); room.roofOff(true); cs.background = new THREE.Color(0x14060a); room.sun.intensity = 0.1; room.hemi.intensity = 0.12; room.fill.intensity = 0; room.red.intensity = 16; room.red.position.set(1.4, 1.8, 1.2);
      const k = lt / dur; yawnPose(dale, -0.5 + k * 0.45, 1.2); room.red.position.set(-0.4, 1.8, 0.6); setCam(V(-0.25, 1.5, lerp(0.5, 0.35, k)), V(0.75, 1.5, 0), 34, 0.004 * k, t); return cs; }
    case 'tornado': { extReset(); roofPieces.forEach(p => { p.m.position.set(0, -30, 0); }); const dt = t - A[20]; const k = clamp(dt / 1.5);
      ts.background = new THREE.Color(0x5e6878); ts.fog.color.set(0x5e6878); town.sun.intensity = 0.9; town.hemi.intensity = 0.7;
      stormCloud.visible = true; stormCloud.rotation.y = t * 0.3; tornado.visible = dt > 0; tornado.position.set(-6, 90 + 90 * (1 - k), -12); tornado.scale.set(1, Math.max(0.02, k), 1); tornado.rotation.y = -t * 2.5; tornadoT.offset.x = t * 0.6;
      for (let i = 0; i < 150; i++) { const d = debTD[i]; const a = d.a0 + t * d.sp * 3; const rr = d.r0 * (0.4 + 0.6 * (1 - ((t * 0.2 + d.h0) % 1))); const y = ((t * 12 * d.sp + d.h0 * 30) % 170); L._m.compose(L._p.set(-6 + Math.cos(a) * rr * (y / 170 + 0.1), y, -12 + Math.sin(a) * rr * (y / 170 + 0.1)), L._q.setFromEuler(L._e.set(t * 3 + i, t * 2, 0)), L._s.setScalar(dt > 0.5 ? d.s : 0)); debT.setMatrixAt(i, L._m); } debT.instanceMatrix.needsUpdate = true;
      flag.userData.f.rotation.y = Math.sin(t * 20) * 0.6;
      if (lt < 3.0) setCam(V(-40, 6, 90), V(-6, 70, -12), 55, 0.04, t);
      else setCam(V(14, 3, 22), V(-6, 30, -12), 60, 0.06, t);
      return ts; }
    case 'turn': { roomReset(); room.roofOff(true); cs.background = new THREE.Color(0x6a7484);
      DESKS.forEach((d, i) => { if (d === daleDesk) return; const toward = V(0.2, 0, 0).sub(d.userData.p0); d.position.copy(d.userData.p0).addScaledVector(toward, 0.6); d.rotation.set(0.3 * Math.sin(i), i, 0.2 * Math.cos(i)); d.position.y = 0.1; });
      STU.forEach((g, i) => { g.root.position.y = -10; });
      suck(PAPERS, paperD, V(0, 0, 0), 99); suck(PENCILS, pencilD, V(0, 0, 0), 99); suck(ERASERS, eraserD, V(0, 0, 0), 99); suck(BAGS, bagD, V(0, 0, 0), 99);
      yawnPose(dale, 0.5, 1.0); setFace(dale, { lid: 0.0, brow: 1, mouth: 1.6 });
      const tt = lt; teacher.root.rotation.y = lerp(-Math.PI / 2, Math.PI / 2 - 0.1, ease(tt / 0.35)); resetPose(teacher); setFace(teacher, { lid: 0.55, brow: -0.4, browTilt: 0.15, mouth: t > line('Am I').t ? Math.abs(Math.sin(t * 12)) * 0.5 : 0 });
      if (t < line('Am I').t - 0.05) setCam(V(-1.8, 1.75, 0.9), V(-4.3, 1.6, 0.6), 44);
      else if (t < line('Am I').t + 0.9) setCam(V(-2.8, 1.72, 0.85), V(-4.3, 1.75, 0.6), 34);
      else setCam(V(-0.25, 1.5, 0.45), V(0.75, 1.45, 0), 36);
      return cs; }
    case 'fact': { resetPose(daleL); daleL.root.rotation.set(0, 0.3, 0); blinkAt(daleL, t); const br = 0.5 + 0.5 * Math.sin(lt * 1.8); daleL.body.scale.set(1 + br * 0.03, 1, 1 + br * 0.05); balloon.scale.setScalar(0.4 + 0.6 * ease(clamp(lt / 1.5))); setFace(daleL, { lid: 0.45 });
      setCam(V(lerp(1.6, 1.3, ease(lt / dur)), 1.5, lerp(2.6, 2.2, ease(lt / dur))), V(0.2, 1.35, 0.15), 40); return lab.scene; }
  }
}
const rungs = [['0.5', 'L', 1, 'A NORMAL BREATH', 0.5], ['4.5', 'L', 3, 'A BEACH BALL', 4.5], ['40', 'L', 5, 'A BIG TRASH BAG', 40.5], ['3,280', 'L', 9, 'A HOT TUB', 3280], ['265,720', 'L', 13, 'ALL THE AIR IN THE ROOM', 265720], ['7.2 M', 'L', 16, '~3 OLYMPIC POOLS', 7.17e6], ['581 M', 'L', 20, 'A TORNADO', 5.81e8]]
  .map(([v, unit, n, cmp, raw], i) => ({ v, unit, n, cmp, raw, at: A[n], gold: i === 6 }));
const overlay = L.makeOverlay({ lines: H.LINES, titleL1: 'What if every yawn sucked in', titleHi: '3× more air', titleL2: ' than the last?', titleSize: 80, hudLabel: r => 'YAWN ' + r.n + '   ·   AIR', rule: '×3 EVERY YAWN', rungs, barMin: 0.3, barMax: 1e9, barMarks: [[265720, 'ROOM'], [2.5e6, 'POOL']], fact: { big: '0.5', unit: 'L', sub: 'ONE NORMAL BREATH · WHY WE YAWN IS STILL DEBATED' }, hideHUD: ['worse', 'fact', 'turn'], flashBig: [A[20]], flashSmall: [A[16] + 0.9] });
L.makeFrame(shots, renderShot, overlay);

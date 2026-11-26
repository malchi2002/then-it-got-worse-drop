import * as L from '/lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, easeOut, lerp, setCam, rng, makeGuy, setFace, resetPose, blinkAt } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const A = {}; TL.tl.filter(x => x.type === 'act').forEach(x => A[x.n] = x.blast);
const line = H.line;
const talk = (p, t) => { const l = line(p); return t > l.t && t < l.end ? Math.abs(Math.sin(t * 14)) * 0.5 : 0; };
const NS = [1, 3, 5, 7, 9, 11, 13, 20];
const hN = n => 0.1 * Math.pow(3, n - 1);
function hairLen(t) { let h = 0.02; for (const n of NS) if (t > A[n] - 0.2) h = lerp(h, hN(n), easeOut(clamp((t - A[n] + 0.2) / 0.8))); return h; }
const HAIR = 0x6a3a1a; const hairM = mat(HAIR, { r: 0.85 });
// polyline helper: returns fn(dist)->Vector3 and total length
function poly(pts) { const seg = []; let tot = 0; for (let i = 0; i < pts.length - 1; i++) { const l = pts[i].distanceTo(pts[i + 1]); seg.push([tot, l, pts[i], pts[i + 1]]); tot += l; } return { tot, at(d) { d = clamp(d, 0, tot); for (const [s0, l, a, b] of seg) if (d <= s0 + l) return a.clone().lerp(b, l ? (d - s0) / l : 0); return pts[pts.length - 1].clone(); } }; }
function hairStrand(scene, n, r, step) { const im = L.makeInstanced(new THREE.SphereGeometry(r, 8, 6), hairM, n); scene.add(im); return { im, n, step }; }
function drawStrand(S, P, len, wob = 0) { for (let i = 0; i < S.n; i++) { const d = i * S.step; if (d >= len) { L._m.makeScale(0, 0, 0); } else { const p = P.at(d); if (wob) { p.x += Math.sin(d * 3.1) * wob; } L._m.compose(p, L._q.identity(), L._s.set(1, 1, 1)); } S.im.setMatrixAt(i, L._m); } S.im.instanceMatrix.needsUpdate = true; }
// ---------- barbershop ----------
const room = L.buildRoom({ wall: 0x6ab0a8, floor: 0xffffff, tiles: true, sky: 0xcfe8ff, seed: 31 }); const bs = room.scene;
const chair = new THREE.Group(); { const base = mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.35, 16), mat(0x888c94, { m: 0.8 })); base.position.y = 0.17; chair.add(base); const seat = box(0.6, 0.12, 0.55, mat(0x8a1a1a, { r: 0.4 })); seat.position.y = 0.48; chair.add(seat); const back = box(0.6, 0.7, 0.1, mat(0x8a1a1a, { r: 0.4 })); back.position.set(0, 0.85, -0.25); chair.add(back); for (const x of [-0.33, 0.33]) { const a = box(0.06, 0.06, 0.5, mat(0xc0c4ca, { m: 0.8 })); a.position.set(x, 0.68, 0); chair.add(a); } } chair.position.set(0, 0, -1.2); bs.add(chair);
const pole = new THREE.Group(); { const t = L.canvasTex(64, 256, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); for (let i = -4; i < 12; i++) { g.fillStyle = i % 2 ? '#d9301f' : '#2a5ab0'; g.beginPath(); g.moveTo(0, i * 32); g.lineTo(w, i * 32 + 40); g.lineTo(w, i * 32 + 56); g.lineTo(0, i * 32 + 16); g.fill(); } }); t.wrapT = THREE.RepeatWrapping; const c = mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 16), new THREE.MeshStandardMaterial({ map: t, roughness: 0.3 })); pole.add(c); pole.userData.t = t; } pole.position.set(2.2, 1.6, -2.75); bs.add(pole);
const mirror = box(1.6, 1.0, 0.03, mat(0xd8ecf4, { r: 0.05, m: 0.7 })); mirror.position.set(-2.6, 1.6, -2.85); bs.add(mirror);
const dale = makeGuy({ ...L.DALE, sit: true }); dale.root.position.set(0, 0.04, -1.15); bs.add(dale.root);
const cap = mesh(new THREE.SphereGeometry(0.215, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2.4), hairM); cap.scale.set(1.02, 1.1, 1.08); dale.head.add(cap); cap.position.y = 0.24;
const barber = makeGuy({ wood: 0xc99a6a, hair: 0x222222, shirt: 0xf4f4f4, glasses: false }); barber.root.position.set(0.9, 0, -0.6); barber.root.rotation.y = -2.2; bs.add(barber.root);
const scis = new THREE.Group(); for (const s of [-1, 1]) { const b = box(0.012, 0.004, 0.16, mat(0xd0d4da, { m: 0.9, r: 0.2 })); b.position.z = 0.07; const g = new THREE.Group(); g.add(b); const ring = mesh(new THREE.TorusGeometry(0.02, 0.006, 6, 12), mat(0x222222)); ring.rotation.x = Math.PI / 2; ring.position.set(s * 0.015, 0, -0.03); g.add(ring); g.userData.s = s; scis.add(g); } barber.aR.grip.add(scis);
// hair path in room: head back -> floor -> snake
const roomPts = [V(0, 1.55, -1.3), V(0, 1.0, -1.45), V(0, 0.05, -1.6)]; { let z = -1.6; let dir = 1; for (let row = 0; row < 18; row++) { roomPts.push(V(dir * 3.8, 0.05 + row * 0.0, z)); z += 0.28; dir *= -1; roomPts.push(V(dir * 3.8, 0.05, z)); } }
const roomP = poly(roomPts); const roomH = hairStrand(bs, 1400, 0.07, 0.06);
// ---------- street ----------
const town = L.buildTown({ sky: 'day', seed: 404, low: true }); const ts = town.scene;
town.buildings.forEach(B => { const p = B.b.position; if (Math.abs(p.z - 12) < 9 || (p.x > -30 && p.x < 40 && p.z > -12 && p.z < 45)) B.b.visible = false; });
const shop = new THREE.Group(); { const b = box(8, 4, 6, mat(0x6ab0a8)); b.position.y = 2; shop.add(b); const door = box(1.2, 2.2, 0.05, mat(0x2a2a2a)); door.position.set(0, 1.1, 3.02); shop.add(door); const p2 = pole.clone(); p2.position.set(1.4, 1.6, 3.15); shop.add(p2); } shop.position.set(0, 0, 3); ts.add(shop);
const streetPts = [V(0, 0.2, 6.1), V(0, 0.2, 10), V(4, 0.2, 12)]; for (let i = 1; i < 60; i++) streetPts.push(V(4 + i * 400, 0.2, 12)); const streetP = poly(streetPts);
const stH = hairStrand(ts, 1400, 0.35, 0.5); const stH2 = hairStrand(ts, 1400, 8, 12);
const cars = []; { const r = rng(4); const cols = [0xd9301f, 0x2a5ab0, 0xf2c230, 0x3a9a5a, 0xeeeeee]; for (let i = 0; i < 24; i++) { const c = new THREE.Group(); const b = box(4, 1.2, 1.9, mat(cols[i % 5], { m: 0.3, r: 0.4 })); b.position.y = 0.8; c.add(b); const top = box(2.2, 0.7, 1.7, mat(0x9fd6f0, { r: 0.1 })); top.position.set(-0.2, 1.7, 0); c.add(top); c.position.set(30 + i * 26 + r() * 6, 0, i % 2 ? 14 : 10); ts.add(c); cars.push(c); } }
const birds = L.makeInstanced(new THREE.ConeGeometry(2, 6, 3), mat(0x222222), 20); birds.castShadow = false; ts.add(birds);
// ---------- space ----------
const S = L.buildSpace(); const wrapPts = []; for (let i = 0; i <= 900; i++) { const a = i / 900 * Math.PI * 2 * 2.9; const tilt = 0.25 + i / 900 * 0.5; wrapPts.push(V(Math.cos(a) * 20.4, Math.sin(a) * 20.4 * Math.sin(tilt) * 0.5 + (i / 900 - 0.5) * 6, Math.sin(a) * 20.4 * Math.cos(tilt * 0.3))); }
const wrapP = poly(wrapPts); const spH = hairStrand(S.scene, 1800, 0.35, wrapP.tot / 1800);
// ---------- worse / lab ----------
const wsc = new THREE.Scene(); wsc.background = new THREE.Color(0x14060a); const wl = new THREE.PointLight(0xff3020, 30, 12, 2); wl.position.set(0.8, 2.0, 2.0); wsc.add(wl); wsc.add(new THREE.AmbientLight(0x200810, 1)); const daleW = makeGuy({ ...L.DALE, sit: true }); wsc.add(daleW.root); { const c2 = cap.clone(); daleW.head.add(c2); }
const lab = L.buildLab({ bg: 0xeef0e8, floor: 0xdee0d8 }); const daleL = makeGuy({ ...L.DALE }); daleL.root.position.set(-0.6, 0, 0); lab.scene.add(daleL.root); { const c3 = cap.clone(); daleL.head.add(c3); }
{ const comb = new THREE.Group(); const b = box(0.5, 0.06, 0.02, mat(0x2a2a2a)); comb.add(b); for (let i = 0; i < 18; i++) { const tt = box(0.012, 0.1, 0.015, mat(0x2a2a2a)); tt.position.set(-0.23 + i * 0.027, -0.07, 0); comb.add(tt); } comb.position.set(0.55, 1.2, -0.1); lab.scene.add(comb); const tp = L.tapeMeasure(0.15, 'cm', 0.9); tp.position.set(0.55, 0.8, -0.1); lab.scene.add(tp); }

function shopReset(t) { room.roofOff(false); room.walls.visible = true; resetPose(dale); dale.root.rotation.set(0, 0, 0); blinkAt(dale, t); resetPose(barber); blinkAt(barber, t + 1); pole.userData.t.offset.y = -t * 0.6; scis.children.forEach(g => g.rotation.y = g.userData.s * 0.05); }
function shots() {
  const L2 = H.LINES[1].t, sc = line('The barber opens').t;
  return [['establish', 0, L2], ['setup', L2, A[1] - 0.7], ['h1', A[1] - 0.7, A[3] - 0.6], ['h3', A[3] - 0.6, A[5] - 0.6], ['h5', A[5] - 0.6, A[7] - 0.5], ['h7', A[7] - 0.5, A[9] - 0.5], ['h9', A[9] - 0.5, A[11] - 0.5], ['h11', A[11] - 0.5, A[13] - 0.5], ['h13', A[13] - 0.5, H.worse.t], ['worse', H.worse.t, A[20] - 0.4], ['space', A[20] - 0.4, sc], ['end', sc, H.fact.t], ['fact', H.fact.t, TL.dur + 1]];
}
function renderShot(name, lt, dur, t) {
  L.cam.far = 8000; const len = hairLen(t); ts.fog.near = 60; ts.fog.far = 260;
  switch (name) {
    case 'establish': { drawStrand(stH, streetP, 0); drawStrand(stH2, streetP, 0); L.hideAll(birds); pole.userData.t.offset.y = -t * 0.6; const k = ease(lt / dur); setCam(V(lerp(9, 7, k), lerp(3, 2.5, k), lerp(16, 14, k)), V(0, 2.2, 3), 48); return ts; }
    case 'setup': { shopReset(t); drawStrand(roomH, roomP, len); setFace(dale, { lid: 0.35, brow: 0.5 }); setFace(barber, { lid: 0.45, brow: 0.4, mouth: talk('The usual', t) }); barber.aR.sh.rotation.set(-0.9, 0, -0.2); setCam(V(0.3, 1.5, 1.4), V(0.4, 1.2, -1.0), 46); return bs; }
    case 'h1': case 'h3': case 'h5': { shopReset(t); const n = +name.slice(1); drawStrand(roomH, roomP, len); barber.aR.sh.rotation.set(-1.2, 0, -0.2); const dt = t - A[n];
      setFace(dale, n === 1 ? { lid: 0.35, brow: 0.4 } : { lid: 0.05, brow: 0.9, mouth: 0.3 }); setFace(barber, n >= 3 ? { lid: 0, brow: 1, mouth: 0.5 } : { lid: 0.45, brow: 0.3 });
      if (n === 1) setCam(V(-0.8, 1.6, 0.4), V(0, 1.4, -1.3), 44); else if (n === 3) setCam(V(-1.2, 1.4, -0.2), V(0, 1.0, -1.4), 46); else setCam(V(3.2, 2.8, 2.4), V(0, 0.4, -0.6), 52, dt > 0 && dt < 0.5 ? 0.01 : 0, t); return bs; }
    case 'h7': case 'h9': { const n = +name.slice(1); drawStrand(stH, streetP, len, 0.3); drawStrand(stH2, streetP, 0); L.hideAll(birds); const dt = t - A[n];
      if (n === 7) setCam(V(-10, 4, 22), V(20, 1, 11), 52, 0, t); else { ts.fog.near = 400; ts.fog.far = 3000; const k = ease(clamp(lt / dur)); setCam(V(lerp(40, 120, k), lerp(30, 60, k), 60), V(lerp(80, 300, k), 0, 12), 52); } return ts; }
    case 'h11': case 'h13': { const n = +name.slice(1); drawStrand(stH, streetP, 0); drawStrand(stH2, streetP, len); const dt = t - A[n]; ts.fog.near = 1000; ts.fog.far = 9000;
      if (n === 11) { for (let i = 0; i < 20; i++) { const a = t * 1.5 + i; L._m.compose(V(600 + Math.cos(a) * 40 + i * 30, 30 + Math.sin(a * 2) * 6, 12 + Math.sin(a) * 40), L._q.setFromEuler(L._e.set(Math.PI / 2, 0, a)), L._s.setScalar(1)); birds.setMatrixAt(i, L._m); } birds.instanceMatrix.needsUpdate = true; setCam(V(500, 120, 260), V(1200, 0, 12), 50); }
      else { L.hideAll(birds); const k = ease(clamp(lt / dur)); setCam(V(-400, lerp(900, 1600, k), 1400), V(4000, 0, 12), 55); } return ts; }
    case 'worse': { resetPose(daleW); daleW.root.rotation.set(0, 0.2, 0); setFace(daleW, { lid: 0.1, brow: 1, mouth: 0.4 }); setCam(V(0.2, 1.3, lerp(1.6, 1.3, lt / dur)), V(0, 1.2, 0), 36, 0.006, t); return wsc; }
    case 'space': { const dt = t - A[20]; S.earth.rotation.y = 0; S.moon.position.set(140, 20, -160); const f = easeOut(clamp(dt / 3.6)); drawStrand(spH, wrapP, f * wrapP.tot); const k = ease(clamp(lt / dur)); setCam(V(lerp(30, 45, k), lerp(25, 30, k), lerp(55, 50, k)), V(0, 0, 0), 46); return S.scene; }
    case 'end': { shopReset(t); drawStrand(roomH, roomP, 999); setFace(dale, { lid: 0.4, brow: 0.6, browTilt: 0.2, mouth: talk('Just a trim', t) }); setFace(barber, { lid: 0.2, brow: 0.8, browTilt: -0.3 }); barber.aR.sh.rotation.set(-1.6, 0, -0.3); barber.aR.el.rotation.set(-0.4, 0, 0); const op = line('The barber opens'); const o = t > op.t + 0.8 ? 0.6 : 0.05; scis.children.forEach(g => g.rotation.y = g.userData.s * o); scis.scale.setScalar(3);
      setCam(V(-0.6, 1.55, 1.2), V(0.4, 1.3, -0.9), 50); return bs; }
    case 'fact': { resetPose(daleL); daleL.root.rotation.y = 0.3; setFace(daleL, { lid: 0.35, brow: 0.3 }); blinkAt(daleL, t); const k = ease(lt / dur); setCam(V(lerp(1.3, 1.0, k), 1.5, lerp(3.6, 3.2, k)), V(0.0, 1.25, 0), 46); return lab.scene; }
  }
}
const rungs = [['10', 'cm', 1, 'TOTALLY NORMAL', 0.1], ['90', 'cm', 3, 'PAST HIS SHOULDERS', 0.9], ['8.1', 'm', 5, 'NEEDS MORE SCISSORS', 8.1], ['73', 'm', 7, 'DOWN THE BLOCK', 72.9], ['656', 'm', 9, 'TRAFFIC STOPPED', 656], ['5.9', 'km', 11, 'BIRDS NESTING', 5905], ['53', 'km', 13, 'LONGER THAN A MARATHON', 53144], ['116,000', 'km', 20, '~3× AROUND THE EARTH', 1.16e8]]
  .map(([v, unit, n, cmp, raw], i) => ({ v, unit, n, cmp, raw, at: A[n], gold: i === 7 }));
const overlay = L.makeOverlay({ lines: H.LINES, titleL1: 'What if your hair grew', titleHi: '3× longer', titleL2: ' every night?', titleSize: 80, hudLabel: r => 'NIGHT ' + r.n + '   ·   HAIR LENGTH', rule: '×3 EVERY NIGHT', rungs, barMin: 0.05, barMax: 5e8, barMarks: [[42195, 'MARATHON'], [4.0075e7, 'EARTH']], fact: { big: '~1', unit: 'cm', sub: 'PER MONTH · ~15 CM A YEAR' }, hideHUD: ['worse', 'fact', 'end', 'setup'], flashBig: [A[20]], flashSmall: [A[9]] });
L.makeFrame(shots, renderShot, overlay);

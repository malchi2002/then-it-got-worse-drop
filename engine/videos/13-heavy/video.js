import * as L from '/lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, easeOut, lerp, setCam, rng, makeGuy, setFace, resetPose, blinkAt } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const A = {}; TL.tl.filter(x => x.type === 'act').forEach(x => A[x.n] = x.blast);
const line = H.line;
const talk = (p, t) => { const l = line(p); return t > l.t && t < l.end ? Math.abs(Math.sin(t * 14)) * 0.5 : 0; };
// ---------- theater ----------
const th = new THREE.Scene(); th.background = new THREE.Color(0x0a0708); th.fog = new THREE.Fog(0x0a0708, 10, 30);
th.add(new THREE.HemisphereLight(0x8a7aa0, 0x2a1818, 0.9));
const scrT = L.canvasTex(1024, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2a6fd6'); gr.addColorStop(0.6, '#f2a04a'); gr.addColorStop(1, '#d9402a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.arc(w * 0.62, h * 0.55, 120, 0, 7); g.fill(); g.fillRect(0, h * 0.8, w, h * 0.2); });
const screen = mesh(new THREE.PlaneGeometry(10, 5), new THREE.MeshBasicMaterial({ map: scrT })); screen.position.set(0, 3.6, -9); th.add(screen);
const scrL = new THREE.RectAreaLight ? null : null; const sl = new THREE.PointLight(0x9ab8ff, 30, 22, 1.6); sl.position.set(0, 3.5, -7); th.add(sl);
const warm = new THREE.SpotLight(0xffd8a8, 14, 10, 0.5, 0.7); warm.position.set(1.5, 5, 3); warm.target.position.set(0, 0.5, 0); th.add(warm, warm.target);
const floorTiles = []; { const fm = mat(0x3a1a22, { r: 0.9 }); for (let x = -8; x < 8; x++) for (let z = -8; z < 8; z++) { const b = box(1, 0.2, 1, fm); b.position.set(x + 0.5, -0.1, z + 0.5); th.add(b); floorTiles.push(b); } }
const seatM = mat(0xb0222e, { r: 0.7 }), armM = mat(0x221a1a);
function seat() { const g = new THREE.Group(); const s = box(0.5, 0.12, 0.48, seatM); s.position.y = 0.42; g.add(s); const b = box(0.5, 0.6, 0.1, seatM); b.position.set(0, 0.75, -0.24); g.add(b); for (const x of [-0.28, 0.28]) { const a = box(0.06, 0.55, 0.5, armM); a.position.set(x, 0.3, 0); g.add(a); } g.userData.s = s; g.userData.b = b; return g; }
const SEATS = []; for (let r = 0; r < 6; r++) for (let c = -5; c <= 5; c++) { const s = seat(); s.position.set(c * 0.62 + 0.31, 0, r * 1.0 - 2); s.rotation.y = Math.PI; th.add(s); SEATS.push(s); }
const dSeat = SEATS.find(s => Math.abs(s.position.x - 0.31) < 0.01 && Math.abs(s.position.z + 2) < 0.01);
const dale = makeGuy({ ...L.DALE, sit: true }); th.add(dale.root);
const gal = makeGuy({ wood: 0xe0bf94, hair: 0x2a1a10, shirt: 0x2f8a7a, sit: true }); gal.root.position.set(0.93, 0.0, -1.95); th.add(gal.root);
const bucket = new THREE.Group(); { const b = mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.2, 12, 1, true), mat(0xffffff)); bucket.add(b); for (let i = 0; i < 5; i++) { const s = box(0.02, 0.2, 0.002, mat(0xd9301f)); const a = i / 5 * Math.PI * 2; s.position.set(Math.cos(a) * 0.082, 0, Math.sin(a) * 0.082); s.rotation.y = -a; bucket.add(s); } const top = mesh(new THREE.SphereGeometry(0.09, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xfff0b0)); top.position.y = 0.08; bucket.add(top); }
dale.aL.grip.add(bucket); bucket.position.set(0, 0.06, 0.05);
const shaft = mesh(new THREE.CylinderGeometry(0.9, 0.9, 120, 20, 1, true), new THREE.MeshStandardMaterial({ color: 0x6a4a30, roughness: 1, side: THREE.BackSide })); shaft.position.set(0.31, -60, -1.95); th.add(shaft);
const dust = L.makePuff(th, 60, 0x9a8070, 0.7, 6);
// ---------- exterior ----------
const town = L.buildTown({ sky: 'sunset', seed: 41, skip: [[0, 0], [-1, 0], [0, -1], [-1, -1]] }); const ts = town.scene;
town.buildings.forEach(B => { const p = B.b.position; if ((Math.abs(p.x) < 14 && Math.abs(p.z) < 14) || (p.x > -8 && p.z > -2 && p.x < 70 && p.z < 90)) B.b.visible = false; });
const cinema = new THREE.Group(); { const b = box(18, 9, 16, mat(0x4a3a5a)); b.position.y = 4.5; cinema.add(b); const sign = mesh(new THREE.PlaneGeometry(10, 2.2), new THREE.MeshBasicMaterial({ map: L.canvasTex(512, 112, (g, w, h) => { g.fillStyle = '#1a0a10'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd25a'; g.font = 'bold 78px "Archivo Black"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CINEMA', w / 2, h / 2 + 4); }) })); sign.position.set(0, 7, 8.02); cinema.add(sign); for (let i = -4; i <= 4; i++) { const bulb = mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: 0xfff0a0 })); bulb.position.set(i * 1.2, 5.6, 8.1); cinema.add(bulb); } }
cinema.position.set(0, 0, -4); ts.add(cinema);
const crater = mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: 0x050303 })); crater.rotation.x = -Math.PI / 2; crater.position.set(0, 0.05, -4); ts.add(crater);
const rim = mesh(new THREE.TorusGeometry(1, 0.08, 6, 48), new THREE.MeshBasicMaterial({ color: 0xff7a2a })); rim.rotation.x = -Math.PI / 2; rim.position.set(0, 0.06, -4); ts.add(rim);
const cracks = new THREE.Group(); { const r = rng(4); for (let i = 0; i < 26; i++) { const len = 20 + r() * 60; const c = box(len, 0.06, 0.6 + r() * 0.8, mat(0x050303)); const a = r() * Math.PI * 2; c.position.set(Math.cos(a) * len / 2, 0.07, Math.sin(a) * len / 2); c.rotation.y = -a; cracks.add(c); } } cracks.position.set(0, 0, -4); ts.add(cracks);
const tdust = L.makePuff(ts, 80, 0x8a7a70, 0.75, 9);
// ---------- space ----------
const S = L.buildSpace(); const moonP0 = V(140, 20, -160);
// ---------- core (popcorn orbit) ----------
const core = new THREE.Scene(); core.background = new THREE.Color(0x1a0a06); core.add(new THREE.HemisphereLight(0xffb070, 0x301008, 0.8)); { const l = new THREE.PointLight(0xff8a30, 20, 10, 1.5); l.position.set(0, -0.5, 1.5); core.add(l); const l2 = new THREE.DirectionalLight(0xffe0c0, 1.2); l2.position.set(2, 4, 3); core.add(l2); }
{ const r = rng(21); for (let i = 0; i < 60; i++) { const rk = mesh(new THREE.DodecahedronGeometry(0.5 + r() * 1.5, 0), mat(new THREE.Color().setHSL(0.06, 0.4, 0.15 + r() * 0.1))); const a = r() * Math.PI * 2, d = 5 + r() * 6; rk.position.set(Math.cos(a) * d, (r() - 0.5) * 10, Math.sin(a) * d - 3); core.add(rk); } }
const daleK = makeGuy({ ...L.DALE, sit: true }); core.add(daleK.root); const seatK = seat(); core.add(seatK); seatK.userData.s.scale.y = 0.3; seatK.userData.s.position.y = 0.35;
const bucketK = bucket.clone(); daleK.aL.grip.add(bucketK);
const corn = L.makeInstanced(new THREE.IcosahedronGeometry(0.035, 0), mat(0xfff2c0, { r: 0.8 }), 90); corn.castShadow = false; core.add(corn);
// ---------- worse / lab ----------
const wsc = new THREE.Scene(); wsc.background = new THREE.Color(0x14060a); const wl = new THREE.PointLight(0xff3020, 30, 12, 2); wl.position.set(0.8, 2.0, 2.0); wsc.add(wl); wsc.add(new THREE.AmbientLight(0x200810, 1)); const daleW = makeGuy({ ...L.DALE, sit: true }); wsc.add(daleW.root);
const lab = L.buildLab({ bg: 0xeae6f0, floor: 0xdcd8e4 }); const daleL = makeGuy({ ...L.DALE }); daleL.root.position.set(-0.6, 0, 0); lab.scene.add(daleL.root);
const globe = mesh(new THREE.SphereGeometry(0.32, 32, 24), S.earth.material); globe.position.set(0.55, 0.95, -0.1); lab.scene.add(globe); { const st = mesh(new THREE.CylinderGeometry(0.03, 0.12, 0.62, 10), mat(0x8a6a3a)); st.position.set(0.55, 0.31, -0.1); lab.scene.add(st); }

// Dale depth below floor over time
const DEPTH = [[7, -4.5], [9, -18], [11, -60]];
function daleDepth(t) { let y = 0; for (const [n, d] of DEPTH) if (t > A[n]) y = lerp(y, d, easeOut(clamp((t - A[n]) / 0.6))); return y; }
function sitDrop(t) { return 0; let k = 0; for (const n of [1, 3, 5, 7, 9, 11]) { const dt = t - A[n]; if (dt > -0.5 && dt < 0) k = Math.max(k, 1 - (dt + 0.5) / 0.5) * 0 + (0.5 + dt) * 0; if (dt > -0.55 && dt <= 0) k = Math.max(k, 0.35 * Math.sin((dt + 0.55) / 0.55 * Math.PI / 2 + Math.PI / 2)); } return k; }
function theaterState(t) {
  const n = [1, 3, 5, 7, 9, 11].filter(n => t > A[n]).pop() || 0;
  // seat squash
  const sq = n >= 5 ? 0.25 : n >= 3 ? 0.85 : 1; dSeat.userData.s.scale.y = sq; dSeat.userData.b.rotation.x = n >= 5 ? -0.9 : n >= 3 ? -0.15 : 0; dSeat.visible = n < 7;
  const hole = n >= 7; floorTiles.forEach(b => { b.visible = !(hole && Math.abs(b.position.x - 0.5) < 0.6 && Math.abs(b.position.z + 2) < 0.6); }); shaft.visible = hole;
  resetPose(dale); blinkAt(dale, t); const y = daleDepth(t); const lift = sitDrop(t); dale.root.position.set(0.31, (n >= 5 && n < 7 ? -0.25 : 0) + y + lift, -1.95); dale.root.rotation.set(0, Math.PI, 0);
  dale.aL.sh.rotation.set(-0.7, 0, 0.1); dale.aL.el.rotation.set(-0.9, 0, 0);
  resetPose(gal); gal.root.rotation.y = Math.PI + (n >= 3 ? 0.5 : 0); L.hideAll(dust);
  return n;
}
function shots() {
  const L2 = H.LINES[1].t, pop = line('The popcorn').t;
  return [['establish', 0, L2], ['setup', L2, A[1] - 0.7], ['h1', A[1] - 0.7, A[3] - 0.6], ['h3', A[3] - 0.6, A[5] - 0.6], ['h5', A[5] - 0.6, A[7] - 0.6], ['h7', A[7] - 0.6, A[9] - 0.5], ['h9', A[9] - 0.5, A[11] - 0.5], ['h11', A[11] - 0.5, H.worse.t], ['worse', H.worse.t, A[45] - 0.4], ['moon', A[45] - 0.4, pop], ['orbit', pop, H.fact.t], ['fact', H.fact.t, TL.dur + 1]];
}
function renderShot(name, lt, dur, t) {
  L.cam.far = 4000;
  switch (name) {
    case 'establish': { crater.visible = rim.visible = cracks.visible = false; cinema.visible = true; L.hideAll(tdust); const k = ease(lt / dur); setCam(V(lerp(30, 24, k), lerp(8, 6, k), lerp(42, 36, k)), V(0, 5, -4), 46); return ts; }
    case 'setup': { theaterState(t); setFace(dale, { lid: 0.3, brow: 0.5 }); setFace(gal, { lid: 0.5, brow: 0.6, browTilt: -0.2, mouth: talk('Shh', t) }); const sh = line('Shh'); if (t > sh.t - 0.2) gal.root.rotation.y = Math.PI + 0.6;
      setCam(V(0.7, 1.5, -5.6), V(0.6, 1.05, -2), 38); return th; }
    case 'h1': case 'h3': case 'h5': { const n = theaterState(t); const dt = t - A[+name.slice(1)]; setFace(dale, n >= 5 ? { lid: 0, brow: 1, mouth: 0.5 } : n >= 3 ? { lid: 0.15, brow: 0.8, mouth: 0.2 } : { lid: 0.35, brow: 0.3 }); if (n >= 3) setFace(gal, { lid: 0.1, brow: 0.9, mouth: 0.3 });
      const sh = dt > 0 && dt < 0.5 ? 0.008 * (+name.slice(1)) : 0;
      if (name === 'h1') setCam(V(0.3, 1.4, -5.3), V(0.3, 1.0, -2), 34, sh, t); else if (name === 'h3') setCam(V(2.0, 1.45, -5.0), V(0.45, 0.95, -2), 38, sh, t); else setCam(V(-1.2, 1.7, -5.2), V(0.4, 0.8, -2), 40, sh, t);
      return th; }
    case 'h7': { const n = theaterState(t); const dt = t - A[7]; setFace(dale, { lid: 0, brow: 1, mouth: 0.6 }); setFace(gal, { lid: 0, brow: 1, mouth: 0.6 }); L.puffAt(dust, V(0.31, 0.1, -1.95), V(0, 1, 0), dt, 1.2, 2.5);
      if (lt < 1.0) setCam(V(-1.2, 1.7, -5.2), V(0.4, 0.8, -2), 40, 0.02, t); else setCam(V(0.6, 0.6, -1.6), V(0.31, -4.5, -1.95), 62, dt < 1.2 ? 0.02 : 0, t); return th; }
    case 'h9': case 'h11': { const n = +name.slice(1); const dt = t - A[n]; cinema.visible = !(n === 9 && dt > 0.2) && n !== 11; crater.visible = rim.visible = n === 11 || dt > 0.2; const cr = n === 9 ? 6 : lerp(6, 22, easeOut(clamp(dt / 0.8))); crater.scale.setScalar(cr); rim.scale.setScalar(cr); cracks.visible = n === 11 && dt > 0; cracks.scale.setScalar(clamp(dt / 0.6));
      L.puffAt(tdust, V(0, 1, -4), V(0, 1, 0), n === 9 ? dt - 0.1 : dt, n === 9 ? 10 : 25, 3); L.shockwave(town, V(0, 0, -4), n === 11 ? dt : -1, 60, 2.5);
      if (n === 9) setCam(V(30, 22, 40), V(0, 2, -4), 46, dt > 0 && dt < 0.8 ? 0.5 : 0, t); else setCam(V(80, 90, 120), V(0, 0, -4), 46, dt > 0 && dt < 1 ? 1.2 : 0, t); return ts; }
    case 'worse': { resetPose(daleW); daleW.root.rotation.set(0, 0.2, 0); setFace(daleW, { lid: 0.1, brow: 1, mouth: 0.4 }); setCam(V(0.2, 1.3, lerp(1.6, 1.3, lt / dur)), V(0, 1.2, 0), 36, 0.006, t); return wsc; }
    case 'moon': { const dt = t - A[45]; const k = clamp(dt / 3.2); S.earth.rotation.y = 0.6; const spot = V(0.5, 0.6, 0.62).normalize().multiplyScalar(20); const M = moonP0.clone().lerp(spot.clone().multiplyScalar(2.2), ease(k)); S.moon.position.copy(M);
      if (lt < 1.6) setCam(V(10, 50, 150), V(60, 15, -60), 50); else setCam(V(lerp(50, 40, k), lerp(55, 45, k), lerp(80, 70, k)), V(10, 12, 5), 50, dt > 0 && dt < 1 ? 0.3 : 0, t); return S.scene; }
    case 'orbit': { resetPose(daleK); daleK.root.position.set(0, 0, 0); seatK.position.set(0, -0.1, 0); daleK.aL.sh.rotation.set(-0.7, 0, 0.1); daleK.aL.el.rotation.set(-0.9, 0, 0); daleK.aR.sh.rotation.set(-1.1, 0, -0.4); blinkAt(daleK, t); setFace(daleK, { lid: 0.45, brow: 0.3, mouth: talk('Could', t) });
      for (let i = 0; i < 90; i++) { const ring = i % 3; const a = t * (1.6 - ring * 0.3) + i * 2.399; const r = 0.75 + ring * 0.28; const tilt = 0.3 + ring * 0.25; L._p.set(Math.cos(a) * r, 0.9 + Math.sin(a) * r * Math.sin(tilt) + (i % 7) * 0.02, Math.sin(a) * r * Math.cos(tilt)); L._m.compose(L._p, L._q.setFromEuler(L._e.set(a, a * 0.7, 0)), L._s.setScalar(1)); corn.setMatrixAt(i, L._m); } corn.instanceMatrix.needsUpdate = true;
      setCam(V(lerp(0.9, 0.7, lt / dur), 1.25, lerp(2.5, 2.2, lt / dur)), V(0, 0.95, 0), 46); return core; }
    case 'fact': { resetPose(daleL); daleL.root.rotation.y = 0.3; setFace(daleL, { lid: 0.35, brow: 0.3 }); blinkAt(daleL, t); globe.rotation.y = t * 0.8; const k = ease(lt / dur); setCam(V(lerp(1.3, 1.0, k), 1.5, lerp(3.6, 3.2, k)), V(0.0, 1.25, 0), 46); return lab.scene; }
  }
}
const rungs = [['80', 'kg', 1, 'NORMAL DALE', 80], ['720', 'kg', 3, 'A WHOLE COW', 720], ['6.5', 't', 5, 'AN ELEPHANT', 6480], ['58', 't', 7, 'A TANK', 58320], ['525', 't', 9, 'A LOADED JUMBO JET', 524880], ['4,724', 't', 11, 'HALF THE EIFFEL TOWER', 4.72e6], ['78 QUINTILLION', 't', 45, 'HEAVIER THAN THE MOON', 7.88e22]]
  .map(([v, unit, n, cmp, raw], i) => ({ v, unit, n, cmp, raw, at: A[n], gold: i === 6 }));
const overlay = L.makeOverlay({ lines: H.LINES, titleL1: 'What if every time you sat down', titleHi: 'you got 3× heavier', titleL2: '?', titleSize: 74, hudLabel: r => 'SIT ' + r.n + '   ·   WEIGHT', rule: '×3 EVERY SIT', rungs, barMin: 50, barMax: 2e23, barMarks: [[1.01e7, 'EIFFEL'], [7.35e22, 'MOON']], fact: { big: '0.5', unit: '%', sub: 'LIGHTER AT THE EQUATOR' }, hideHUD: ['worse', 'fact', 'orbit', 'setup'], flashBig: [A[45]], flashSmall: [A[9] + 0.1] });
L.makeFrame(shots, renderShot, overlay);

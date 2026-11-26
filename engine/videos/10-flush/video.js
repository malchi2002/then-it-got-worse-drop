import * as L from '/lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, lerp, setCam, rng, canvasTex, makeGuy, setFace, resetPose, blinkAt } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const A = {}; TL.tl.filter(x => x.type === 'act').forEach(x => A[x.n] = x.blast);
const line = H.line;
const swirlT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#1f7fc0'; g.fillRect(0, 0, w, h); for (let i = 0; i < 30; i++) { g.strokeStyle = `rgba(255,255,255,${0.15 + (i % 3) * 0.1})`; g.lineWidth = 4 + (i % 4) * 3; g.beginPath(); g.moveTo(0, i * 9); g.lineTo(w, i * 9 + 80); g.stroke(); } }); swirlT.wrapS = swirlT.wrapT = THREE.RepeatWrapping;
function whirl(r, h) { const m = mesh(new THREE.ConeGeometry(r, h, 48, 8, true), new THREE.MeshStandardMaterial({ map: swirlT, roughness: 0.2, transparent: true, opacity: 0.9, side: THREE.DoubleSide }), false, false); m.rotation.x = Math.PI; return m; }
// ---------- bathroom ----------
const room = L.buildRoom({ wall: 0xbfe3e8, floor: 0xffffff, tiles: true, sky: 0xcfe8ff, seed: 21 }); const bs = room.scene;
const white = mat(0xf6f8fa, { r: 0.2 });
const toilet = new THREE.Group(); { const base = mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.4, 20), white); base.position.y = 0.2; toilet.add(base); const bowl = mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.12, 24), white); bowl.position.set(0, 0.42, 0.05); bowl.scale.z = 1.3; toilet.add(bowl); const water = mesh(new THREE.CircleGeometry(0.19, 24), new THREE.MeshStandardMaterial({ color: 0x4fa8e0, roughness: 0.1 })); water.rotation.x = -Math.PI / 2; water.position.set(0, 0.47, 0.06); water.scale.y = 1.25; toilet.add(water); toilet.userData.water = water; const tank = box(0.42, 0.42, 0.2, white); tank.position.set(0, 0.7, -0.25); toilet.add(tank); const lid = box(0.44, 0.04, 0.22, white); lid.position.set(0, 0.93, -0.25); toilet.add(lid); const handle = box(0.08, 0.02, 0.02, mat(0xc0c0c0, { m: 0.8 })); handle.position.set(-0.2, 0.85, -0.14); toilet.add(handle); toilet.userData.handle = handle; }
toilet.position.set(0, 0, -2.3); bs.add(toilet);
const tub = new THREE.Group(); { const outer = box(1.7, 0.55, 0.8, white); outer.position.y = 0.275; tub.add(outer); const inner = box(1.55, 0.5, 0.65, mat(0xe8f0f4, { r: 0.2 })); inner.position.y = 0.33; tub.add(inner); const tw = box(1.5, 0.02, 0.6, new THREE.MeshStandardMaterial({ color: 0x6fc0f0, transparent: true, opacity: 0.8, roughness: 0.05 })); tw.position.y = 0.5; tub.add(tw); tub.userData.water = tw; }
tub.position.set(-2.4, 0, -2.2); bs.add(tub);
const sink = new THREE.Group(); { const ped = mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.8, 12), white); ped.position.y = 0.4; sink.add(ped); const basin = box(0.55, 0.15, 0.4, white); basin.position.y = 0.85; sink.add(basin); const mirror = box(0.6, 0.8, 0.03, mat(0xcfe8f4, { r: 0.05, m: 0.6 })); mirror.position.set(0, 1.55, -0.15); sink.add(mirror); } sink.position.set(1.6, 0, -2.6); bs.add(sink);
function duckMesh(s = 1) { const d = new THREE.Group(); const b = mesh(new THREE.SphereGeometry(0.07 * s, 12, 8), mat(0xffd23f)); b.scale.set(1.3, 0.85, 1); d.add(b); const hd = mesh(new THREE.SphereGeometry(0.045 * s, 10, 8), mat(0xffd23f)); hd.position.set(0.06 * s, 0.07 * s, 0); d.add(hd); const bk = mesh(new THREE.ConeGeometry(0.018 * s, 0.04 * s, 6), mat(0xf28a20)); bk.rotation.z = -Math.PI / 2; bk.position.set(0.11 * s, 0.065 * s, 0); d.add(bk); return d; }
const duck = duckMesh(); bs.add(duck);
const drops = L.makeInstanced(new THREE.SphereGeometry(0.02, 6, 5), new THREE.MeshStandardMaterial({ color: 0x6fc0f0, roughness: 0.1, transparent: true, opacity: 0.8 }), 200); drops.castShadow = false; bs.add(drops);
const items = L.makeInstanced(new THREE.BoxGeometry(0.15, 0.05, 0.1), mat(0xd94f8a), 20); bs.add(items);
const dale = makeGuy({ ...L.DALE }); bs.add(dale.root);
const BOWL = V(0, 0.47, -2.24);
function swirlTo(im, src, tt, n, spread, life = 1.2) { for (let i = 0; i < im.count; i++) { if (i >= n || tt <= 0) { L._m.makeScale(0, 0, 0); im.setMatrixAt(i, L._m); continue; } const q = ((tt / life) + i / n) % 1; const s0 = src(i); const p = s0.clone().lerp(BOWL, q * q); const a = q * 12 + i; const rr = (1 - q) * spread; p.x += Math.cos(a) * rr; p.z += Math.sin(a) * rr; L._m.compose(p, L._q.identity(), L._s.setScalar(1)); im.setMatrixAt(i, L._m); } im.instanceMatrix.needsUpdate = true; }
// ---------- backyard/neighborhood ----------
const town = L.buildTown({ sky: 'day', seed: 101, low: true, skip: [[0, 0], [-1, 0], [0, -1], [-1, -1]] }); const ts = town.scene;
town.buildings.forEach(B => { if (Math.abs(B.b.position.x) < 22 && Math.abs(B.b.position.z) < 18) B.b.visible = false; });
const lawn = mesh(new THREE.PlaneGeometry(60, 40), mat(0x6fbf5a, { r: 1 }), false, true); lawn.rotation.x = -Math.PI / 2; lawn.position.y = 0.03; ts.add(lawn);
const hotTub = new THREE.Group(); { const shell = mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.9, 32, 1, true), mat(0x8a5a30)); shell.position.y = 0.45; hotTub.add(shell); const fl = mesh(new THREE.CircleGeometry(1.15, 32), mat(0xe0e8ee)); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.05; hotTub.add(fl); const w = mesh(new THREE.CircleGeometry(1.15, 32), new THREE.MeshStandardMaterial({ color: 0x4fc0e8, roughness: 0.05, transparent: true, opacity: 0.85 }), false, false); w.rotation.x = -Math.PI / 2; w.position.y = 0.8; hotTub.add(w); hotTub.userData.w = w; const wh = whirl(1.0, 0.8); wh.position.y = 0.4; hotTub.add(wh); hotTub.userData.wh = wh; }
hotTub.position.set(-6, 0, 2); ts.add(hotTub);
const neighbor = makeGuy({ wood: 0xd9b48a, hair: 0x222222, sit: true }); neighbor.root.position.set(-6, 0.2, 2); ts.add(neighbor.root);
const pool = new THREE.Group(); { const rim = box(14, 0.3, 7, mat(0xe8e0d0)); rim.position.y = 0.15; pool.add(rim); const hole = box(13, 0.32, 6, mat(0x2f8fd0)); hole.position.y = 0.16; pool.add(hole); const w = mesh(new THREE.PlaneGeometry(13, 6), new THREE.MeshStandardMaterial({ color: 0x4fc0e8, roughness: 0.05, transparent: true, opacity: 0.9 }), false, false); w.rotation.x = -Math.PI / 2; w.position.y = 0.33; pool.add(w); pool.userData.w = w; const wh = whirl(2.8, 3); wh.position.y = 0.33 - 1.5; pool.add(wh); pool.userData.wh = wh; for (let i = -2; i <= 2; i++) { const ln = box(12, 0.02, 0.08, mat(0x1a4a8a)); ln.position.set(0, 0.2, i * 1.1); pool.add(ln); } }
pool.position.set(8, 0, -4); ts.add(pool);
// ---------- Loch ----------
const loch = new THREE.Scene(); loch.background = new THREE.Color(0x9fb8c8); loch.fog = new THREE.Fog(0x9fb8c8, 200, 3000);
loch.add(new THREE.HemisphereLight(0xdfe8f0, 0x4a5a3a, 1.1)); const ls = new THREE.DirectionalLight(0xfff0d8, 2.4); ls.position.set(200, 300, 100); loch.add(ls);
const lochW = mesh(new THREE.PlaneGeometry(4000, 1200), new THREE.MeshStandardMaterial({ color: 0x2a4a5a, roughness: 0.15 }), false, false); lochW.rotation.x = -Math.PI / 2; loch.add(lochW);
const lochBed = mesh(new THREE.PlaneGeometry(4000, 1200), mat(0x5a4a3a, { r: 1 }), false, false); lochBed.rotation.x = -Math.PI / 2; lochBed.position.y = -200; loch.add(lochBed);
{ const r = rng(5); for (let i = 0; i < 40; i++) { const m = mesh(new THREE.ConeGeometry(150 + r() * 200, 200 + r() * 250, 6), mat(new THREE.Color().setHSL(0.25 + r() * 0.05, 0.35, 0.3 + r() * 0.1), { r: 1 })); m.position.set(-2000 + i * 100 + r() * 50, 50, (i % 2 ? 700 : -700) + (r() - 0.5) * 200); loch.add(m); } }
const lochWhirl = whirl(400, 600); loch.add(lochWhirl);
const nessie = new THREE.Group(); { const nm = mat(0x3f7a4a, { r: 0.6 }); for (let i = 0; i < 3; i++) { const hump = mesh(new THREE.SphereGeometry(6, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), nm); hump.position.set(i * 14, 0, 0); nessie.add(hump); } const neck = mesh(new THREE.CylinderGeometry(2.2, 3, 22, 12), nm); neck.position.set(-10, 9, 0); neck.rotation.z = 0.35; nessie.add(neck); const head = mesh(new THREE.SphereGeometry(3.4, 16, 12), nm); head.scale.set(1.5, 1, 1); head.position.set(-15, 20, 0); nessie.add(head); for (const z of [-1.4, 1.4]) { const e = mesh(new THREE.SphereGeometry(0.6, 10, 8), mat(0x111111)); e.position.set(-17.5, 21, z); nessie.add(e); } nessie.userData.head = head; }
loch.add(nessie);
// ---------- worse / lab ----------
const wsc = new THREE.Scene(); wsc.background = new THREE.Color(0x14060a); const wl = new THREE.PointLight(0xff3020, 30, 12, 2); wl.position.set(0.8, 2.0, 2.0); wsc.add(wl); wsc.add(new THREE.AmbientLight(0x200810, 1)); const daleW = makeGuy({ ...L.DALE }); wsc.add(daleW.root);
const lab = L.buildLab({ bg: 0xe3eef2, floor: 0xd6e2e8 }); const daleL = makeGuy({ ...L.DALE }); daleL.root.position.set(-0.6, 0, 0); lab.scene.add(daleL.root); const toiletL = toilet.clone(); toiletL.position.set(0.4, 0, -0.3); lab.scene.add(toiletL);
const jug = mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.3, 16), new THREE.MeshStandardMaterial({ color: 0x6fc0f0, transparent: true, opacity: 0.6 })); jug.position.set(0.95, 0.15, 0.1); lab.scene.add(jug);

function flushPose(g, dt) { const k = dt > -0.4 && dt < 0.2 ? 1 : 0; g.aL.sh.rotation.set(-0.6 * k - 0.1, 0, 0.3 + 0.3 * k); g.aL.el.rotation.x = -0.4 * k; setFace(g, { lid: 0.35, brow: 0.2 }); }
function shots() {
  const L2 = H.LINES[1].t, scot = line('Somewhere').t;
  return [['establish', 0, L2], ['setup', L2, A[1] - 0.6], ['f1', A[1] - 0.6, A[3] - 0.6], ['f3', A[3] - 0.6, A[5] - 0.6], ['f5', A[5] - 0.6, A[7] - 0.6], ['f7', A[7] - 0.6, A[10] - 0.6], ['f10', A[10] - 0.6, A[13] - 0.6], ['f13', A[13] - 0.6, H.worse.t], ['worse', H.worse.t, A[27] - 0.4], ['loch', A[27] - 0.4, scot], ['nessie', scot, H.fact.t], ['fact', H.fact.t, TL.dur + 1]];
}
function bReset(t) { resetPose(dale); dale.root.position.set(0.55, 0, -1.6); dale.root.rotation.set(0, -0.35, 0); duck.position.set(-2.2, 0.53, -2.2); duck.rotation.set(0, 0.5, 0); duck.visible = true; tub.userData.water.position.y = 0.5; tub.userData.water.visible = true; L.hideAll(drops); L.hideAll(items); room.roofOff(false); bs.background = room.sky; toilet.userData.water.rotation.z = 0; }
const FRONT = (d = 2.2, y = 1.7, dx = 0.5) => [V(0.55 + dx, y + 0.25, -1.6 + d + 0.9), V(0.35, 1.35, -1.8)];
function renderShot(name, lt, dur, t) {
  L.cam.far = 4000;
  switch (name) {
    case 'establish': { hotTub.userData.wh.visible = false; pool.userData.wh.visible = false; hotTub.userData.w.position.y = 0.8; pool.userData.w.position.y = 0.33; resetPose(neighbor); neighbor.root.position.set(-6, 0.2, 2); const k = ease(lt / dur); setCam(V(lerp(-20, -14, k), lerp(14, 10, k), 22), V(0, 1, -1), 46); return ts; }
    case 'setup': { bReset(t); setFace(dale, { lid: 0.3, brow: 0.6, browTilt: 0.15 }); blinkAt(dale, t); const [p, l] = FRONT(2.4, 1.75, 0.6); setCam(p, l, 44); return bs; }
    case 'f1': case 'f3': case 'f5': { bReset(t); const n = +name.slice(1); const dt = t - A[n]; flushPose(dale, dt); toilet.userData.water.rotation.z = Math.max(0, dt) * 8;
      if (n === 1) { const [p, l] = FRONT(1.6, 1.4, 0.2); setCam(V(0.5, 1.2, -1.2), BOWL, 40); }
      if (n === 3) { const q = clamp((dt - 0.2) / 1.0); const p = V(-2.2, 0.53, -2.2).lerp(BOWL, q * q); const a = q * 10; p.x += Math.cos(a) * (1 - q) * 0.4; p.z += Math.sin(a) * (1 - q) * 0.4; p.y += Math.sin(q * Math.PI) * 0.6; duck.position.copy(p); duck.rotation.y = q * 20; duck.visible = q < 0.98; setFace(dale, { lid: 0.1, brow: 0.9, mouth: 0.4 });
        setCam(V(-0.6, 1.6, 0.6), V(-1.0, 0.6, -2.2), 50); }
      if (n === 5) { duck.visible = false; const q = clamp(dt / 2.2); tub.userData.water.position.y = lerp(0.5, 0.1, q); tub.userData.water.visible = q < 0.98; swirlTo(drops, i => V(-2.4 + ((i * 37) % 140) / 100 - 0.7, 0.5, -2.2 + ((i * 53) % 60) / 100 - 0.3), dt, 200, 0.5, 0.9); setFace(dale, { lid: 0.0, brow: 1, mouth: 0.6 });
        if (lt < 1.8) setCam(V(-0.6, 2.0, 0.4), V(-1.2, 0.5, -2.2), 52, 0.01, t); else { const [p, l] = FRONT(2.0, 1.7, -0.4); setCam(p, l, 44, 0.01, t); } }
      return bs; }
    case 'f7': { const dt = t - A[7]; const q = clamp(dt / 2.4); pool.userData.wh.visible = false; pool.userData.w.position.y = 0.33; hotTub.userData.w.position.y = lerp(0.8, 0.08, q); hotTub.userData.wh.visible = dt > 0; hotTub.userData.wh.rotation.y = -t * 6; swirlT.offset.x = t * 0.8;
      resetPose(neighbor); neighbor.root.position.set(-6 + Math.cos(t * 6) * 0.4 * q, 0.2 - q * 0.6, 2 + Math.sin(t * 6) * 0.4 * q); neighbor.root.rotation.y = t * 6 * q; setFace(neighbor, { lid: 0.0, brow: 1, mouth: 0.8 });
      setCam(V(-3.4, 2.6, 6.6), V(-6, 0.6, 2), 46); return ts; }
    case 'f10': { const dt = t - A[10]; const q = clamp(dt / 2.6); hotTub.userData.w.position.y = 0.08; hotTub.userData.wh.visible = false; neighbor.root.position.y = -5; pool.userData.w.position.y = lerp(0.33, -1.2, q); pool.userData.wh.visible = dt > 0; pool.userData.wh.rotation.y = -t * 4; swirlT.offset.x = t * 0.8;
      setCam(V(8, 16, 12), V(8, 0, -4), 50, 0.01, t); return ts; }
    case 'f13': { const dt = t - A[13]; const q = clamp(dt / 2.4); pool.userData.w.position.y = -1.2; pool.userData.wh.visible = false; L.shockwave(town, V(0, 0, -2), dt - 0.4, 40, 2.5);
      hotTub.position.y = 0; setCam(V(-60, 70, 80), V(0, 0, -2), 46, dt > 0.3 && dt < 1 ? 0.3 : 0, t); return ts; }
    case 'worse': { town.ring.visible = town.dome.visible = false; resetPose(daleW); daleW.root.rotation.set(0, 0.3, 0); daleW.aL.sh.rotation.set(-0.8, 0, 0.6); setFace(daleW, { lid: 0.1, brow: 1, mouth: 0.4 }); setCam(V(0.25, 1.65, lerp(1.8, 1.45, lt / dur)), V(0, 1.6, 0), 36, 0.005, t); return wsc; }
    case 'loch': { const dt = t - A[27]; const q = clamp(dt / 3.0); lochW.position.y = lerp(0, -190, q * q); lochWhirl.visible = dt > 0; lochWhirl.position.set(0, lochW.position.y - 300, 0); lochWhirl.scale.set(1 + q, 1, 1 + q); lochWhirl.rotation.y = -t * 1.5; swirlT.offset.x = t * 0.5;
      nessie.position.set(Math.cos(t * 2) * 220 * (1 - q * 0.6), lochW.position.y, Math.sin(t * 2) * 220 * (1 - q * 0.6)); nessie.rotation.y = -t * 2;
      if (lt < 2.2) setCam(V(-900, 300, 900), V(0, -50, 0), 48, dt > 0 && dt < 1 ? 1.5 : 0.2, t); else setCam(V(500, 120, 500), V(0, -150, 0), 52, 0.3, t); return loch; }
    case 'nessie': { lochW.position.y = -199; lochWhirl.visible = false; nessie.position.set(0, -200, 0); nessie.rotation.set(0, Math.sin(t * 1.5) * 0.4, 0); nessie.userData.head.rotation.z = Math.sin(t * 3) * 0.1;
      setCam(V(-90, -170, 70), V(-12, -185, 0), 44); return loch; }
    case 'fact': { resetPose(daleL); daleL.root.rotation.y = 0.3; setFace(daleL, { lid: 0.35, brow: 0.3 }); blinkAt(daleL, t); setCam(V(lerp(1.2, 0.9, ease(lt / dur)), 1.5, lerp(2.8, 2.4, ease(lt / dur))), V(-0.15, 1.05, 0), 44); return lab.scene; }
  }
}
const rungs = [['6', 'L', 1, 'A NORMAL FLUSH', 6], ['54', 'L', 3, 'A RUBBER DUCK’S WORST DAY', 54], ['486', 'L', 5, 'A FULL BATHTUB+', 486], ['4,374', 'L', 7, 'A HOT TUB', 4374], ['118,098', 'L', 10, 'A SWIMMING POOL', 118098], ['3.2 M', 'L', 13, 'MORE THAN AN OLYMPIC POOL', 3.19e6], ['15', 'km³', 27, '2× LOCH NESS', 1.52e13]]
  .map(([v, unit, n, cmp, raw], i) => ({ v, unit, n, cmp, raw, at: A[n], gold: i === 6 }));
const overlay = L.makeOverlay({ lines: H.LINES, titleL1: 'What if every flush pulled', titleHi: '3× more water', titleL2: ' than the last?', titleSize: 78, hudLabel: r => 'FLUSH ' + r.n + '   ·   WATER', rule: '×3 EVERY FLUSH', rungs, barMin: 1, barMax: 5e13, barMarks: [[2.5e6, 'OLYMPIC'], [7.4e12, 'LOCH NESS']], fact: { big: '~6', unit: 'L', sub: 'MODERN FLUSH · OLDER TOILETS: 13+ L' }, hideHUD: ['worse', 'fact', 'nessie', 'setup'], flashBig: [A[27]], flashSmall: [A[13] + 0.4] });
L.makeFrame(shots, renderShot, overlay);

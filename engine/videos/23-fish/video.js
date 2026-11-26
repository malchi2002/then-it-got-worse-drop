import * as L from '/lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, easeOut, lerp, setCam, rng, makeGuy, setFace, resetPose, blinkAt } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const A = {}; TL.tl.filter(x => x.type === 'act').forEach(x => A[x.n] = x.blast);
const line = H.line;
const talk = (p, t) => { const l = line(p); return t > l.t && t < l.end ? Math.abs(Math.sin(t * 14)) * 0.5 : 0; };
const NS = [1, 3, 5, 7, 9, 11, 13, 20];
const wN = n => 0.5 * Math.pow(3, n - 1); const lenN = n => 0.35 * Math.cbrt(wN(n) / 0.5);
// ---------- scene ----------
const sc = new THREE.Scene(); const SKY = 0xf6c08a; sc.background = new THREE.Color(SKY); sc.fog = new THREE.Fog(SKY, 300, 9000);
sc.add(new THREE.HemisphereLight(0xffe4c8, 0x2a4a6a, 1.1)); const sun = new THREE.DirectionalLight(0xffb070, 3.0); sun.position.set(-30, 18, -60); sun.castShadow = true; Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20 }); sun.shadow.mapSize.set(2048, 2048); sc.add(sun);
const sunD = mesh(new THREE.SphereGeometry(60, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffe0a0, fog: false }), false, false); sunD.position.set(-800, 120, -3000); sc.add(sunD);
const wT = L.canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(140,180,220,0.8)'; g.lineWidth = 3; for (let i = 0; i < 16; i++) { g.beginPath(); for (let x = 0; x <= w; x += 8) g.lineTo(x, i * 16 + Math.sin(x * 0.1 + i) * 4); g.stroke(); } }); wT.wrapS = wT.wrapT = THREE.RepeatWrapping; wT.repeat.set(600, 600);
const sea = mesh(new THREE.PlaneGeometry(40000, 40000), new THREE.MeshStandardMaterial({ color: 0x3a7ab8, map: wT, roughness: 0.3, metalness: 0.2 }), false, true); sea.rotation.x = -Math.PI / 2; sc.add(sea);
const beach = mesh(new THREE.PlaneGeometry(40000, 400), mat(0xe0c898, { r: 1 })); beach.rotation.x = -Math.PI / 2; beach.position.set(0, 0.3, 220); sc.add(beach);
const pier = new THREE.Group(); const planks = []; { const pm = mat(0x8a5a3a, { r: 0.9 }); for (let i = 0; i < 60; i++) { const p = box(3, 0.12, 0.45, pm); p.position.set(0, 3, 20 - i * 0.7); pier.add(p); planks.push(p); } for (let i = 0; i < 12; i++) for (const x of [-1.4, 1.4]) { const post = mesh(new THREE.CylinderGeometry(0.15, 0.15, 6, 8), mat(0x5a3a22)); post.position.set(x, 1.0, 20 - i * 3.6); pier.add(post); planks.push(post); } for (const x of [-1.45, 1.45]) { const rail = box(0.1, 0.1, 42, mat(0x6a4a2a)); rail.position.set(x, 4, -1); pier.add(rail); } } sc.add(pier);
const dale = makeGuy({ ...L.DALE, cap: 0x2a6a4a }); dale.root.position.set(0.3, 3.06, -19.2); dale.root.rotation.y = Math.PI; sc.add(dale.root);
const old = makeGuy({ wood: 0xc9a07a, hat: 0x6a5a3a, shirt: 0x6a7a5a, glasses: false }); old.root.position.set(-0.9, 3.06, -18.4); old.root.rotation.y = Math.PI - 0.5; sc.add(old.root);
const rod = mesh(new THREE.CylinderGeometry(0.012, 0.025, 2.2, 8), mat(0x2a2a2a)); rod.position.y = 1.0; const rodG = new THREE.Group(); rodG.add(rod); dale.aR.grip.add(rodG);
const fishLine = mesh(new THREE.CylinderGeometry(1, 1, 1, 4), new THREE.MeshBasicMaterial({ color: 0xffffff })); sc.add(fishLine);
function setLine(m, a, b, r) { const d = b.clone().sub(a); m.position.copy(a).addScaledVector(d, 0.5); m.scale.set(r, d.length(), r); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); }
function makeFish() { const g = new THREE.Group(); const body = mesh(new THREE.SphereGeometry(0.5, 24, 16), mat(0x3a7aa0, { r: 0.4 })); body.scale.set(0.38, 0.32, 1); g.add(body); const belly = mesh(new THREE.SphereGeometry(0.5, 20, 12), mat(0xe8eef0, { r: 0.5 })); belly.scale.set(0.3, 0.22, 0.9); belly.position.y = -0.05; g.add(belly); const tail = mesh(new THREE.ConeGeometry(0.22, 0.35, 4), mat(0x2a6a90)); tail.rotation.x = -Math.PI / 2; tail.scale.set(0.2, 1, 1); tail.position.z = 0.6; g.add(tail); for (const x of [-0.16, 0.16]) { const e = mesh(new THREE.SphereGeometry(0.05, 10, 8), mat(0xffffff)); e.position.set(x, 0.06, -0.33); g.add(e); const p = mesh(new THREE.SphereGeometry(0.028, 8, 6), mat(0x111111)); p.position.set(x * 1.12, 0.06, -0.37); g.add(p); } const fin = mesh(new THREE.ConeGeometry(0.12, 0.25, 4), mat(0x2a6a90)); fin.scale.set(0.15, 1, 1); fin.position.set(0, 0.2, 0.05); g.add(fin); g.userData.tail = tail; return g; }
const fish = makeFish(); sc.add(fish);
const splash = L.makePuff(sc, 60, 0xffffff, 0.85, 7);
const ship = new THREE.Group(); { const hull = box(65, 30, 458, mat(0x8a2a2a)); hull.position.y = 5; ship.add(hull); const deck = box(64, 2, 456, mat(0x5a6a5a)); deck.position.y = 21; ship.add(deck); const br = box(50, 30, 30, mat(0xf2f2f2)); br.position.set(0, 37, 200); ship.add(br); } ship.position.set(520, 0, -520); ship.rotation.y = 0.35; sc.add(ship);
// ---------- worse / lab ----------
const wsc = new THREE.Scene(); wsc.background = new THREE.Color(0x14060a); const wl = new THREE.PointLight(0xff3020, 30, 12, 2); wl.position.set(0.8, 2.0, 2.0); wsc.add(wl); wsc.add(new THREE.AmbientLight(0x200810, 1)); const daleW = makeGuy({ ...L.DALE, cap: 0x2a6a4a }); wsc.add(daleW.root);
const lab = L.buildLab({ bg: 0xe6eef4, floor: 0xd6dee4 }); const daleL = makeGuy({ ...L.DALE, cap: 0x2a6a4a }); daleL.root.position.set(-0.6, 0, 0); lab.scene.add(daleL.root); { const f = makeFish(); f.scale.setScalar(0.9); f.position.set(0.6, 1.1, -0.1); f.rotation.y = 0.6; lab.scene.add(f); const st = box(0.5, 0.75, 0.5, mat(0xd8d8d8)); st.position.set(0.6, 0.375, -0.1); lab.scene.add(st); }

function base(t) { resetPose(dale); dale.root.position.set(0.3, 3.06, -19.2); dale.root.rotation.set(0, Math.PI, 0); blinkAt(dale, t); dale.aR.sh.rotation.set(-1.1, 0, -0.1); dale.aL.sh.rotation.set(-1.0, 0, 0.3); rodG.rotation.set(-0.6, 0, 0); resetPose(old); blinkAt(old, t + 1); old.root.visible = true; planks.forEach(p => p.visible = true); L.hideAll(splash); fish.visible = false; ship.visible = false; }
function catchAt(t, n) { const dt = t - A[n]; const Lf = lenN(n); fish.visible = dt > -0.1 && dt < 2.6; const D = 6 + Lf * 1.2; const q = clamp((dt + 0.1) / 1.8); const p = V(0.3, -Lf * 0.3 + Math.sin(q * Math.PI) * (Lf * 1.4 + 1.5), -19.2 - D + q * Lf * 0.4); fish.position.copy(p); fish.scale.setScalar(Lf / 1.2); fish.rotation.set(lerp(-0.7, 0.9, q), 0, Math.sin(t * 10) * 0.15); fish.userData.tail.rotation.y = Math.sin(t * 20) * 0.4;
  L.puffAt(splash, V(0.3, 0, -19.2 - D), V(0, 1, 0), dt + 0.1, Math.max(0.6, Lf * 0.5), 1.6);
  dale.root.updateMatrixWorld(true); const tip = rod.localToWorld(V(0, 1.1, 0)); setLine(fishLine, tip, fish.visible ? p : V(0.3, 0, -26), 0.006); const bend = clamp(Lf / 3); rodG.rotation.x = -0.6 + bend * 0.9; return { Lf, D, p }; }
function shots() {
  const L2 = H.LINES[1].t, put = line('The old fisherman').t;
  return [['establish', 0, L2], ['setup', L2, A[1] - 0.8], ['f1', A[1] - 0.8, A[3] - 0.6], ['f3', A[3] - 0.6, A[5] - 0.6], ['f5', A[5] - 0.6, A[7] - 0.6], ['f7', A[7] - 0.6, A[9] - 0.6], ['f9', A[9] - 0.6, A[11] - 0.6], ['f11', A[11] - 0.6, A[13] - 0.5], ['f13', A[13] - 0.5, H.worse.t], ['worse', H.worse.t, A[20] - 0.4], ['f20', A[20] - 0.4, put], ['end', put, H.fact.t], ['fact', H.fact.t, TL.dur + 1]];
}
function renderShot(name, lt, dur, t) {
  L.cam.far = 20000;
  switch (name) {
    case 'establish': { base(t); dale.root.position.set(0.3, 3.06, -19.2); setLine(fishLine, V(0, -9, 0), V(0, -10, 0), 0.001); const k = ease(lt / dur); setCam(V(lerp(16, 12, k), lerp(8, 7, k), lerp(12, 4, k)), V(0, 3, -16), 48); return sc; }
    case 'setup': { base(t); setLine(fishLine, V(0, -9, 0), V(0, -10, 0), 0.001); setFace(dale, { lid: 0.35, brow: 0.6, browTilt: 0.2 }); setFace(old, { lid: 0.6, brow: 0.2, mouth: talk("Nothing's", t) }); const nb = line("Nothing's"); if (t > nb.t - 0.2) setCam(V(-1.5, 4.6, -20.8), V(-0.9, 4.4, -18.4), 46); else setCam(V(1.4, 4.6, -21.8), V(0.3, 4.3, -19.2), 46); return sc; }
    default: { if (!name.startsWith('f')) break; base(t); const n = +name.slice(1); const { Lf, D, p } = catchAt(t, n); const dt = t - A[n];
      setFace(dale, n <= 3 ? { lid: 0.2, brow: 0.6, mouth: 0.4 } : { lid: 0, brow: 1, mouth: 0.6 }); setFace(old, n >= 5 ? { lid: 0, brow: 1, mouth: 0.5 } : { lid: 0.5, brow: 0.3 });
      if (n >= 9) planks.forEach((pl, i) => { if (pl.position.z < -8 && pl.position.z > -16 && dt > 0.3) pl.visible = false; });
      if (n === 20) { ship.visible = true; old.root.visible = true; }
      if (n === 1 || n === 3) setCam(V(1.6, 4.4, -21.5 - (n === 3 ? 0.5 : 0)), V(0.3, 2.6, -24.5), 50);
      else { setCam(V(9 + Lf * 0.9, 5 + Lf * 0.45, -8 + Lf * 0.5), V(0.3, 2 + Lf * 0.45, -19.2 - D * 0.55), 58, dt > 0 && dt < 0.6 ? 0.02 + 0.003 * Lf : 0, t); if (n === 20) setCam(V(1300, 450, 700), V(260, 120, -450), 50, dt > 0 && dt < 1 ? 3 : 0, t); }
      return sc; }
    case 'worse': { resetPose(daleW); daleW.root.rotation.set(0, 0.3, 0); daleW.aR.sh.rotation.set(-1.1, 0, -0.1); setFace(daleW, { lid: 0.1, brow: 1, mouth: 0.4 }); setCam(V(0.25, 1.65, lerp(1.8, 1.45, lt / dur)), V(0, 1.55, 0), 36, 0.006, t); return wsc; }
    case 'end': { base(t); setLine(fishLine, V(0, -9, 0), V(0, -10, 0), 0.001); rodG.rotation.x = 0.4; setFace(dale, { lid: 0.4, brow: 0.6, browTilt: 0.2, mouth: talk('Catch and', t) }); old.aR.sh.rotation.set(-0.2, 0, -0.3); setFace(old, { lid: 0, brow: 1, mouth: 0.5 }); planks.forEach((pl) => { if (pl.position.z < -8 && pl.position.z > -16) pl.visible = false; });
      setCam(V(0.4, 4.7, -22.6), V(-0.2, 4.2, -18.8), 46); return sc; }
    case 'fact': { resetPose(daleL); daleL.root.rotation.y = 0.3; setFace(daleL, { lid: 0.35, brow: 0.3 }); blinkAt(daleL, t); const k = ease(lt / dur); setCam(V(lerp(1.3, 1.0, k), 1.5, lerp(3.6, 3.2, k)), V(0.0, 1.25, 0), 46); return lab.scene; }
  }
}
const rungs = [['0.5', 'kg', 1, 'A NICE LITTLE FISH', 0.5], ['4.5', 'kg', 3, 'DINNER FOR THE FAMILY', 4.5], ['40', 'kg', 5, 'A TUNA', 40.5], ['364', 'kg', 7, 'A SHARK', 364], ['3.3', 't', 9, 'AN ORCA', 3280], ['30', 't', 11, 'A HUMPBACK WHALE', 29524], ['266', 't', 13, 'BIGGER THAN A BLUE WHALE', 265720], ['581,000', 't', 20, 'HEAVIER THAN THE BIGGEST SHIP', 5.81e8]]
  .map(([v, unit, n, cmp, raw], i) => ({ v, unit, n, cmp, raw, at: A[n], gold: i === 7 }));
const overlay = L.makeOverlay({ lines: H.LINES, titleL1: 'What if every fish you caught was', titleHi: '3× heavier', titleL2: '?', titleSize: 72, hudLabel: r => 'CATCH ' + r.n + '   ·   WEIGHT', rule: '×3 EVERY CATCH', rungs, barMin: 0.2, barMax: 2e9, barMarks: [[1208, 'RECORD'], [1.9e5, 'BLUE WHALE']], fact: { big: '1,208', unit: 'kg', sub: 'GREAT WHITE ON A ROD · 1959' }, hideHUD: ['worse', 'fact', 'end', 'setup'], flashBig: [A[20]], flashSmall: [A[9] + 0.3] });
L.makeFrame(shots, renderShot, overlay);

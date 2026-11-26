import * as L from '/lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, easeOut, lerp, setCam, rng, makeGuy, setFace, resetPose, blinkAt } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const A = {}; TL.tl.filter(x => x.type === 'act').forEach(x => A[x.n] = x.blast);
const line = H.line;
const talk = (p, t) => { const l = line(p); return t > l.t && t < l.end ? Math.abs(Math.sin(t * 14)) * 0.5 : 0; };
const NS = [1, 3, 5, 7, 9, 11, 13];
// ---------- dining room ----------
const room = L.buildRoom({ wall: 0xc9a27a, floor: 0x7a4a2a, sky: 0x9fc8ee, seed: 13, sunI: 2.0 }); const ds = room.scene;
room.fill.intensity = 9;
const table = new THREE.Group(); { const top = box(1.3, 0.06, 2.6, mat(0xf4efe6, { r: 0.6 })); top.position.y = 0.76; table.add(top); for (const [x, z] of [[-0.55, -1.2], [0.55, -1.2], [-0.55, 1.2], [0.55, 1.2]]) { const l = box(0.06, 0.74, 0.06, mat(0x5a3a22)); l.position.set(x, 0.37, z); table.add(l); } } table.position.set(0, 0, -1.0); ds.add(table);
const plates = []; for (const [x, z] of [[0, -2.05], [-0.42, -1.2], [0.42, -0.9], [-0.42, -0.3]]) { const p = mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.02, 20), mat(0xffffff)); p.position.set(x, 0.8, z); ds.add(p); plates.push(p); }
const glassesM = new THREE.MeshStandardMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.5, roughness: 0.05 }); const glasses = []; for (const [x, z] of [[0.18, -1.95], [-0.25, -1.05], [0.25, -0.75], [-0.25, -0.15]]) { const g = mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.13, 12), glassesM); g.position.set(x, 0.86, z); ds.add(g); glasses.push(g); }
const turkey = new THREE.Group(); { const b = mesh(new THREE.SphereGeometry(0.2, 18, 12), mat(0xb8702a, { r: 0.5 })); b.scale.set(1, 0.7, 1.3); turkey.add(b); for (const x of [-0.13, 0.13]) { const lg = mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.2, 10), mat(0xc8803a)); lg.rotation.x = -0.9; lg.position.set(x, 0.05, 0.24); turkey.add(lg); const bn = mesh(new THREE.SphereGeometry(0.03, 8, 6), mat(0xffffff)); bn.position.set(x, 0.12, 0.31); turkey.add(bn); } const pl = mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.03, 24), mat(0xe8e0d0)); pl.position.y = -0.13; turkey.add(pl); }
const T0 = V(0, 0.92, -1.1); turkey.position.copy(T0); ds.add(turkey);
const gravyM = new THREE.MeshStandardMaterial({ color: 0x6a3a1a, roughness: 0.2 }); const gravy = new THREE.Group(); { const b = mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.07, 16), mat(0xffffff)); gravy.add(b); const s = mesh(new THREE.CircleGeometry(0.075, 24), gravyM); s.rotation.x = -Math.PI / 2; s.position.y = 0.036; gravy.add(s); gravy.userData.s = s; } gravy.position.set(0.3, 0.83, -1.5); ds.add(gravy);
const dale = makeGuy({ ...L.DALE, sit: true }); dale.root.position.set(0, 0, -2.4); ds.add(dale.root);
const gma = makeGuy({ wood: 0xe8d0b8, glasses: true, shirt: 0x8a4a7a, sit: true }); gma.root.position.set(-0.85, 0, -1.2); gma.root.rotation.y = 2.3; ds.add(gma.root);
const wig = mesh(new THREE.SphereGeometry(0.235, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xdedede, { r: 1 })); wig.scale.set(1.05, 0.9, 1.1); gma.head.add(wig); wig.position.y = 0.3; const wigHome = wig.position.clone();
const mom = makeGuy({ wood: 0xd9b08a, hair: 0x5a2a10, shirt: 0x3a8a6a, sit: true }); mom.root.position.set(0.85, 0, -0.8); mom.root.rotation.y = -Math.PI / 2 + 0.3; ds.add(mom.root);
const ringTex = L.canvasTex(256, 256, (g, w, h) => { g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 110, 0, 7); g.stroke(); g.strokeStyle = 'rgba(200,230,255,0.5)'; g.lineWidth = 22; g.beginPath(); g.arc(128, 128, 90, 0, 7); g.stroke(); });
const rings = []; for (let i = 0; i < 4; i++) { const r = mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, depthWrite: false, side: THREE.DoubleSide })); ds.add(r); rings.push(r); }
const MOUTH = V(0, 1.18, -2.2);
function burpRings(t, n, maxS) { const dt = t - A[n]; rings.forEach((r, i) => { const q = dt - i * 0.12; r.visible = q > 0 && q < 1.0; const s = 0.1 + q * maxS; r.scale.set(s, s, 1); r.position.copy(MOUTH).add(V(0, 0, q * maxS * 0.6)); r.material.opacity = clamp(1 - q); }); }
const crumbs = L.makeInstanced(new THREE.BoxGeometry(0.04, 0.04, 0.04), mat(0xd8a050), 40); ds.add(crumbs); const crumbD = L.debrisData(2, 40, r => ({ p0: V((r() - 0.5) * 1.0, 0.85, -1.6 + r() * 1.4), v: V((r() - 0.5) * 2, 1 + r() * 2, 3 + r() * 4) }));
const shardsR = L.makeInstanced(new THREE.PlaneGeometry(0.05, 0.05), glassesM, 60); ds.add(shardsR); const shardRD = L.debrisData(6, 60, r => ({ p0: V((r() - 0.5) * 0.6, 0.9, -1.9 + r() * 1.8), v: V((r() - 0.5) * 3, 1 + r() * 2, 2 + r() * 3) }));
// ---------- street ----------
const town = L.buildTown({ sky: 'day', seed: 303, low: true, skip: [[0, 0], [-1, 0], [0, -1], [-1, -1]] }); const ts = town.scene;
town.buildings.forEach(B => { const p = B.b.position; if (Math.abs(p.x) < 12 && Math.abs(p.z) < 12) B.b.visible = false; });
const house = new THREE.Group(); { const b = box(8, 4.5, 7, mat(0xf0e0c4)); b.position.y = 2.25; house.add(b); const roof = mesh(new THREE.ConeGeometry(6, 3, 4), mat(0x5a3a5a)); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.85); roof.position.y = 6; house.add(roof); for (const x of [-2.2, 2.2]) { const w = mesh(new THREE.PlaneGeometry(1.6, 1.4), new THREE.MeshStandardMaterial({ color: 0xfff0c0, emissive: 0xffd080, emissiveIntensity: 0.6 })); w.position.set(x, 2.5, 3.52); house.add(w); } const door = box(1.1, 2.1, 0.05, mat(0x6a3a22)); door.position.set(0, 1.05, 3.52); house.add(door); } house.position.set(0, 0, -3); ts.add(house);
const roofP = house.children[1]; const dust = L.makePuff(ts, 60, 0xc0b0a0, 0.7, 5);
// ---------- space ----------
const S = L.buildSpace(); const SPOT = V(0.3, 0.55, 0.78).normalize();
const wave = mesh(new THREE.TorusGeometry(1, 0.05, 6, 64), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true })); S.scene.add(wave);
// ---------- worse / lab ----------
const wsc = new THREE.Scene(); wsc.background = new THREE.Color(0x14060a); const wl = new THREE.PointLight(0xff3020, 30, 12, 2); wl.position.set(0.8, 2.0, 2.0); wsc.add(wl); wsc.add(new THREE.AmbientLight(0x200810, 1)); const daleW = makeGuy({ ...L.DALE, sit: true }); wsc.add(daleW.root);
const lab = L.buildLab({ bg: 0xf0ece4, floor: 0xe0dcd2 }); const daleL = makeGuy({ ...L.DALE }); daleL.root.position.set(-0.6, 0, 0); lab.scene.add(daleL.root);
const volc = new THREE.Group(); { const c = mesh(new THREE.ConeGeometry(0.45, 0.6, 16, 1, true), mat(0x6a5a4a)); c.position.y = 0.3; volc.add(c); const lava = mesh(new THREE.CircleGeometry(0.08, 12), new THREE.MeshBasicMaterial({ color: 0xff6a20 })); lava.rotation.x = -Math.PI / 2; lava.position.y = 0.55; volc.add(lava); const smoke = mesh(new THREE.SphereGeometry(0.12, 10, 8), mat(0x9a9a9a)); smoke.position.y = 0.72; volc.add(smoke); } volc.position.set(0.6, 0.8, -0.1); lab.scene.add(volc); { const st = box(0.9, 0.8, 0.6, mat(0xd8d8d8)); st.position.set(0.6, 0.4, -0.1); lab.scene.add(st); }

function burpPose(t) { const n = NS.find(n => t > A[n] - 0.5 && t < A[n] + 0.9); if (n === undefined) return 0; const dt = t - A[n]; const k = dt < 0 ? clamp(1 + dt / 0.5) : clamp(1 - (dt - 0.6) / 0.3); dale.neckG.rotation.x = -0.25 * k; setFace(dale, { lid: 0.4, brow: 0.2, mouth: 0.9 * k }); return k; }
function roomReset(t) { room.roofOff(false); room.walls.visible = true; resetPose(dale); dale.root.rotation.set(0, 0, 0); blinkAt(dale, t); resetPose(gma); resetPose(mom); blinkAt(gma, t + 0.4); blinkAt(mom, t + 0.9); setFace(dale, { lid: 0.35, brow: 0.4 }); setFace(gma, { lid: 0.5, brow: 0.3, browTilt: -0.2 }); setFace(mom, { lid: 0.4, brow: 0.4 });
  rings.forEach(r => r.visible = false); turkey.position.copy(T0); turkey.rotation.set(0, 0, 0); turkey.visible = true; wig.position.copy(wigHome); wig.visible = true; glasses.forEach(g => g.visible = true); L.hideAll(crumbs); L.hideAll(shardsR); gravy.userData.s.position.y = 0.036; gma.root.rotation.z = 0; mom.root.rotation.z = 0; }
function shots() {
  const L2 = H.LINES[1].t, still = line('Grandma is still').t;
  return [['establish', 0, L2], ['setup', L2, A[1] - 0.7], ['r1', A[1] - 0.7, A[3] - 0.7], ['r3', A[3] - 0.7, A[5] - 0.7], ['r5', A[5] - 0.7, A[7] - 0.7], ['r7', A[7] - 0.7, A[9] - 0.5], ['r9', A[9] - 0.5, A[11] - 0.5], ['r11', A[11] - 0.5, H.worse.t], ['worse', H.worse.t, A[13] - 0.4], ['space', A[13] - 0.4, still], ['end', still, H.fact.t], ['fact', H.fact.t, TL.dur + 1]];
}
const WIDE = () => setCam(V(0.9, 1.75, 1.6), V(0, 1.0, -1.6), 46);
function renderShot(name, lt, dur, t) {
  L.cam.far = 4000;
  switch (name) {
    case 'establish': { L.hideAll(dust); L.glassBurst(town, V(0, 0, 0), -1); town.ring.visible = town.dome.visible = false; house.visible = true; const k = ease(lt / dur); setCam(V(lerp(12, 9, k), lerp(4, 3.2, k), lerp(16, 13, k)), V(0, 2.5, -3), 48); return ts; }
    case 'setup': { roomReset(t); setFace(gma, { lid: 0.55, brow: 0.6, browTilt: -0.4, mouth: talk('Excuse yourself', t) }); const ex = line('Excuse yourself'); if (t > ex.t - 0.2) setCam(V(-0.3, 1.6, -2.85), V(-0.85, 1.3, -1.2), 38); else WIDE(); return ds; }
    case 'r1': case 'r3': case 'r5': { roomReset(t); const n = +name.slice(1); burpPose(t); const dt = t - A[n]; burpRings(t, n, n === 1 ? 0.6 : n === 3 ? 1.2 : 2.4);
      if (n >= 3) { gravy.userData.s.position.y = 0.036 + (dt > 0 ? 0.01 * Math.sin(dt * 30) * Math.exp(-dt * 2) : 0); setFace(mom, { lid: 0.2, brow: 0.8, mouth: 0.3 }); }
      if (n === 5 && dt > 0.15) { const q = dt - 0.15; wig.visible = q < 2.2; wig.position.set(wigHome.x - q * 0.3, wigHome.y + q * 1.2 - q * q * 0.6, wigHome.z + 0); setFace(gma, { lid: 0, brow: 1, mouth: 0.5 }); }
      if (n === 1) setFace(gma, { lid: 0.6, brow: 0.5, browTilt: -0.4 });
      if (n === 1) WIDE(); else if (n === 3) setCam(V(0.6, 1.1, -1.0), V(0.3, 0.86, -1.5), 40, 0.004, t); else setCam(V(-0.3, 1.65, -2.85), V(-0.85, 1.45, -1.2), 44, dt > 0 && dt < 0.5 ? 0.02 : 0, t); return ds; }
    case 'r7': { roomReset(t); burpPose(t); burpRings(t, 7, 4); const dt = t - A[7]; if (dt > 0.1) { const q = dt - 0.1; turkey.position.set(T0.x, T0.y + q * 1.5 - q * q * 1.0, T0.z + q * 6); turkey.rotation.set(q * 6, q * 3, 0); } L.debrisAt(crumbs, crumbD, dt, 4.9, 0.05); setFace(gma, { lid: 0, brow: 1, mouth: 0.6 }); setFace(mom, { lid: 0, brow: 1, mouth: 0.6 }); wig.visible = false; gma.root.rotation.z = dt > 0 ? 0.15 : 0; mom.root.rotation.z = dt > 0 ? -0.15 : 0;
      setCam(V(0.8, 1.6, 1.8), V(0, 1.0, -1.2), 50, dt > 0 && dt < 0.6 ? 0.03 : 0, t); return ds; }
    case 'r9': case 'r11': { const n = +name.slice(1); const dt = t - A[n]; const C = V(0, 1, -3);
      if (n === 9) { L.glassBurst(town, C, dt, 40); town.ring.visible = town.dome.visible = false; house.visible = true; roofP.position.y = 6; setCam(V(26, 9, 30), V(0, 3, -3), 50, dt > 0 && dt < 0.6 ? 0.15 : 0, t); }
      else { L.glassBurst(town, C, dt + 3, 40); L.shockwave(town, C, dt, 70, 3); roofP.position.y = 6 + (dt > 0 ? dt * 30 : 0); roofP.rotation.x = dt > 0 ? dt * 3 : 0; L.puffAt(dust, V(0, 4, -3), V(0, 1, 0), dt, 15, 3); setCam(V(70, 50, 90), V(0, 5, -3), 48, dt > 0 && dt < 1 ? 0.8 : 0, t); }
      return ts; }
    case 'worse': { resetPose(daleW); daleW.root.rotation.set(0, 0.2, 0); setFace(daleW, { lid: 0.3, brow: 0.4, mouth: 0.7 }); daleW.neckG.rotation.x = -0.2; setCam(V(0.2, 1.3, lerp(1.6, 1.3, lt / dur)), V(0, 1.2, 0), 36, 0.006, t); return wsc; }
    case 'space': { const dt = t - A[13]; S.earth.rotation.y = 0; S.moon.position.set(140, 20, -160); const ang = clamp(dt / 3.0) * 1.4; const R = 20.2; wave.visible = dt > 0 && ang < 1.39; wave.position.copy(SPOT.clone().multiplyScalar(R * Math.cos(ang))); wave.scale.setScalar(Math.max(0.01, R * Math.sin(ang))); wave.quaternion.setFromUnitVectors(V(0, 0, 1), SPOT); wave.material.opacity = 1 - ang / 1.4;
      setCam(SPOT.clone().multiplyScalar(62).add(V(-10, 12, 0)), V(0, 0, 0), 46, dt > 0 && dt < 0.8 ? 0.3 : 0, t); return S.scene; }
    case 'end': { roomReset(t); room.walls.visible = false; room.roofOff(true); ds.background.set(0x9fc8ee); wig.visible = false; turkey.visible = false; glasses.forEach(g => g.visible = false); setFace(gma, { lid: 0.0, brow: 1, mouth: 0.5 }); gma.root.rotation.z = 0.15; setFace(dale, { lid: 0.4, brow: 0.6, browTilt: 0.2, mouth: talk('Excuse me', t) });
      setCam(V(0.7, 1.65, lerp(0.6, 0.3, lt / dur)), V(-0.4, 1.1, -1.8), 54); return ds; }
    case 'fact': { resetPose(daleL); daleL.root.rotation.y = 0.3; setFace(daleL, { lid: 0.35, brow: 0.3 }); blinkAt(daleL, t); const k = ease(lt / dur); setCam(V(lerp(1.3, 1.0, k), 1.5, lerp(3.6, 3.2, k)), V(0.0, 1.25, 0), 46); return lab.scene; }
  }
}
const rungs = [['80', 'dB', 1, 'A NORMAL BURP', 80], ['99', 'dB', 3, 'A MOTORCYCLE', 99], ['118', 'dB', 5, 'A ROCK CONCERT', 118], ['137', 'dB', 7, 'A JET ENGINE', 137], ['156', 'dB', 9, 'WINDOWS SHATTER', 156], ['175', 'dB', 11, 'LOUDER THAN A VOLCANO', 175], ['194', 'dB', 13, 'THE LOUDEST SOUND POSSIBLE', 194]]
  .map(([v, unit, n, cmp, raw], i) => ({ v, unit, n, cmp, raw: Math.pow(10, raw / 20), at: A[n], gold: i === 6 }));
const overlay = L.makeOverlay({ lines: H.LINES, titleL1: 'What if every burp was', titleHi: '3× more powerful', titleL2: ' than the last?', titleSize: 78, hudLabel: r => 'BURP ' + r.n + '   ·   LOUDNESS', rule: '×3 EVERY BURP', rungs, barMin: Math.pow(10, 70 / 20), barMax: Math.pow(10, 200 / 20), barMarks: [[Math.pow(10, 120 / 20), 'PAIN'], [Math.pow(10, 172 / 20), 'KRAKATOA']], fact: { big: '4,800', unit: 'km', sub: 'KRAKATOA 1883 · HEARD THIS FAR AWAY' }, hideHUD: ['worse', 'fact', 'end', 'setup'], flashBig: [A[13]], flashSmall: [A[9]] });
L.makeFrame(shots, renderShot, overlay);

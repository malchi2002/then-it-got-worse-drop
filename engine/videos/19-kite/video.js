import * as L from '/lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, easeOut, lerp, setCam, rng, makeGuy, setFace, resetPose, blinkAt } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const A = {}; TL.tl.filter(x => x.type === 'act').forEach(x => A[x.n] = x.blast);
const line = H.line;
const KID = H.LINES.find(l => l.text.startsWith('Mine') && l.who === 'X'), DL = H.LINES.find(l => l.text.startsWith('Mine') && l.who === 'I');
const tk = (l, t) => t > l.t && t < l.end ? Math.abs(Math.sin(t * 14)) * 0.5 : 0;
const NS = [1, 3, 5, 7, 9, 11, 16];
const hN = n => 10 * Math.pow(3, n - 1);
function kiteH(t) { let h = 4; for (const n of NS) if (t > A[n] - 0.1) h = lerp(h, hN(n), easeOut(clamp((t - A[n] + 0.1) / 1.0))); return h; }
function makeKite(col = 0xff7a2a) { const g = new THREE.Group(); const sh = new THREE.Shape(); sh.moveTo(0, 0.6); sh.lineTo(0.35, 0); sh.lineTo(0, -0.5); sh.lineTo(-0.35, 0); sh.lineTo(0, 0.6); const body = mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({ color: col, side: THREE.DoubleSide, roughness: 0.6 })); g.add(body); const eye = mesh(new THREE.CircleGeometry(0.06, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })); eye.position.set(0, 0.25, 0.01); g.add(eye); const pup = mesh(new THREE.CircleGeometry(0.03, 10), new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide })); pup.position.set(0, 0.25, 0.02); g.add(pup); const fin = new THREE.Shape(); fin.moveTo(0, -0.5); fin.lineTo(0.2, -0.75); fin.lineTo(-0.2, -0.75); fin.lineTo(0, -0.5); g.add(mesh(new THREE.ShapeGeometry(fin), new THREE.MeshStandardMaterial({ color: 0xffd23f, side: THREE.DoubleSide }))); for (let i = 0; i < 5; i++) { const b = box(0.06, 0.04, 0.01, mat([0xd9301f, 0x2ab0e8, 0xffd23f][i % 3])); b.position.set(Math.sin(i) * 0.05, -0.85 - i * 0.18, 0); g.add(b); g.userData['b' + i] = b; } return g; }
function strLine(scene, col = 0xf4f4f4) { const m = mesh(new THREE.CylinderGeometry(1, 1, 1, 5), new THREE.MeshBasicMaterial({ color: col })); scene.add(m); return m; }
function setLine(m, a, b, r) { const d = b.clone().sub(a); m.position.copy(a).addScaledVector(d, 0.5); m.scale.set(r, d.length(), r); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); }
// ---------- beach ----------
const beach = new THREE.Scene(); beach.background = new THREE.Color(0x8fcaf2); beach.fog = new THREE.Fog(0x8fcaf2, 200, 3000);
beach.add(new THREE.HemisphereLight(0xeaf6ff, 0xd8c08a, 1.2)); { const s = new THREE.DirectionalLight(0xfff4e0, 2.8); s.position.set(-10, 20, 12); s.castShadow = true; Object.assign(s.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 }); s.shadow.mapSize.set(2048, 2048); beach.add(s); }
const sand = mesh(new THREE.PlaneGeometry(6000, 3000), mat(0xe8d4a0, { r: 1 })); sand.rotation.x = -Math.PI / 2; sand.position.z = 1400; beach.add(sand);
const sea = mesh(new THREE.PlaneGeometry(6000, 3000), new THREE.MeshStandardMaterial({ color: 0x2a8ac8, roughness: 0.15, metalness: 0.2 }), false, true); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.02, -1500 - 6); beach.add(sea);
const foam = mesh(new THREE.PlaneGeometry(6000, 1.2), new THREE.MeshBasicMaterial({ color: 0xffffff })); foam.rotation.x = -Math.PI / 2; foam.position.set(0, 0.04, -6); beach.add(foam);
{ const r = rng(3); const cols = [0xd9301f, 0x2ab0e8, 0xffd23f, 0x3ad06a]; for (let i = 0; i < 9; i++) { const u = new THREE.Group(); const p = mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 6), mat(0xffffff)); p.position.y = 1.1; u.add(p); const c = mesh(new THREE.ConeGeometry(1.1, 0.5, 8), mat(cols[i % 4])); c.position.y = 2.2; u.add(c); u.position.set(-30 + i * 7 + r() * 3, 0, 4 + r() * 10); beach.add(u); const tw = box(1.6, 0.02, 0.8, mat(cols[(i + 1) % 4])); tw.position.set(u.position.x + 1.2, 0.02, u.position.z + 0.5); beach.add(tw); } }
const dale = makeGuy({ ...L.DALE }); dale.root.position.set(0, 0, 2); dale.root.rotation.y = Math.PI; beach.add(dale.root);
const kid = makeGuy({ wood: 0xc99a6a, cap: 0xd9301f, shirt: 0x2ab0e8 }); kid.root.scale.setScalar(0.7); kid.root.position.set(1.6, 0, 2.3); kid.root.rotation.y = Math.PI - 0.3; beach.add(kid.root);
const kite = makeKite(); kite.scale.setScalar(1.4); beach.add(kite); const kid_k = makeKite(0x8a4ad0); beach.add(kid_k);
const str = strLine(beach), str2 = strLine(beach);
const gulls = L.makeInstanced(new THREE.ConeGeometry(0.2, 0.7, 3), mat(0xffffff), 6); beach.add(gulls);
const KDIR = V(0.15, 0, -1).normalize(); // kite downwind direction (out over sea)
const kitePos = h => V(0, 0, 2).addScaledVector(KDIR, h * 0.55).add(V(0, h, 0));
// ---------- sky ----------
const sky = new THREE.Scene(); sky.background = new THREE.Color(0x6fa8e8); sky.add(new THREE.HemisphereLight(0xeaf4ff, 0x8a9aa8, 1.3)); { const s = new THREE.DirectionalLight(0xfff4e0, 2.6); s.position.set(1, 1.2, 0.6); sky.add(s); }
{ const cm = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true }); const r = rng(9); for (let i = 0; i < 200; i++) { const c = mesh(new THREE.IcosahedronGeometry(60 + r() * 120, 1), cm, false, false); c.scale.y = 0.4; c.position.set((r() - 0.5) * 6000, 1800 + r() * 120, (r() - 0.5) * 6000); sky.add(c); } }
const ever = mesh(new THREE.ConeGeometry(4000, 8800, 7), mat(0x8a8a9a, { r: 1 }), false, false); ever.position.set(-3000, 4400 - 400, -5000); sky.add(ever); const cap = mesh(new THREE.ConeGeometry(1400, 3000, 7), mat(0xffffff, { r: 1 }), false, false); cap.position.set(-3000, 8800 - 1500 - 400 + 1, -5000); sky.add(cap);
const burj = new THREE.Group(); { for (let i = 0; i < 6; i++) { const s = box(60 - i * 9, 140, 60 - i * 9, mat(0xc0ccd8, { m: 0.5, r: 0.3 })); s.position.y = 70 + i * 135; burj.add(s); } const sp = mesh(new THREE.CylinderGeometry(1, 4, 80, 8), mat(0xc0ccd8)); sp.position.y = 860; burj.add(sp); } burj.position.set(300, 0, -400); sky.add(burj);
const ground = mesh(new THREE.PlaneGeometry(40000, 40000), mat(0xc8b890, { r: 1 }), false, false); ground.rotation.x = -Math.PI / 2; sky.add(ground);
const kiteS = makeKite(); sky.add(kiteS); const strS = strLine(sky);
// ---------- space ----------
const S = L.buildSpace(); const kiteSp = makeKite(); S.scene.add(kiteSp); const strSp = strLine(S.scene);
const fireTex = L.canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,220,1)'); gr.addColorStop(0.4, 'rgba(255,160,40,0.8)'); gr.addColorStop(1, 'rgba(255,40,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const fire = new THREE.Sprite(new THREE.SpriteMaterial({ map: fireTex, blending: THREE.AdditiveBlending, depthWrite: false })); kiteSp.add(fire);
// ---------- worse / lab ----------
const wsc = new THREE.Scene(); wsc.background = new THREE.Color(0x14060a); const wl = new THREE.PointLight(0xff3020, 30, 12, 2); wl.position.set(0.8, 2.0, 2.0); wsc.add(wl); wsc.add(new THREE.AmbientLight(0x200810, 1)); const daleW = makeGuy({ ...L.DALE }); wsc.add(daleW.root);
const lab = L.buildLab({ bg: 0xe6f2f8, floor: 0xd6e2e8 }); const daleL = makeGuy({ ...L.DALE }); daleL.root.position.set(-0.6, 0, 0); lab.scene.add(daleL.root); { const kk = makeKite(); kk.scale.setScalar(0.9); kk.position.set(0.6, 1.4, -0.3); lab.scene.add(kk); }

function holdPose(g, k = 1) { g.aR.sh.rotation.set(-1.6 * k, 0, -0.1); g.aR.el.rotation.set(-0.3, 0, 0); g.aL.sh.rotation.set(-1.4 * k, 0, 0.2); }
function beachState(t, h) { resetPose(dale); dale.root.rotation.set(0, Math.PI, 0); holdPose(dale); blinkAt(dale, t); resetPose(kid); kid.root.rotation.y = Math.PI - 0.3; holdPose(kid, 0.9); blinkAt(kid, t + 1);
  const hand = V(0.15, 1.35, 1.4); const kp = kitePos(h); kp.x += Math.sin(t * 1.3) * Math.min(h * 0.05, 3); kite.position.copy(kp); kite.lookAt(hand); kite.rotateZ(Math.sin(t * 2) * 0.2); kite.scale.setScalar(1.4 + Math.max(0, h - 10) * 0.05); setLine(str, hand, kp, 0.008 + h * 0.0004);
  const kk = V(1.6, 7 + Math.sin(t * 1.7) * 0.4, -2); kid_k.position.copy(kk); kid_k.lookAt(V(1.6, 1, 2.3)); const kh = V(1.62, 0.95, 1.9); setLine(str2, kh, kk, 0.008);
  for (let i = 0; i < 6; i++) { const a = t * 1.2 + i; L._m.compose(V(Math.cos(a) * 6 + (i - 3) * 2, 60 + Math.sin(a * 2) * 4 + i, -40 + Math.sin(a) * 6), L._q.setFromEuler(L._e.set(Math.PI / 2, 0, a)), L._s.setScalar(1.8)); gulls.setMatrixAt(i, L._m); } gulls.instanceMatrix.needsUpdate = true; }
function shots() {
  const L2 = H.LINES[1].t, still = line('Dale is still').t;
  return [['establish', 0, L2], ['setup', L2, A[1] - 0.7], ['k1', A[1] - 0.7, A[3] - 0.6], ['k3', A[3] - 0.6, A[5] - 0.5], ['k5', A[5] - 0.5, A[7] - 0.5], ['k7', A[7] - 0.5, A[9] - 0.5], ['k9', A[9] - 0.5, A[11] - 0.5], ['k11', A[11] - 0.5, H.worse.t], ['worse', H.worse.t, A[16] - 0.4], ['sun', A[16] - 0.4, still], ['end', still, H.fact.t], ['fact', H.fact.t, TL.dur + 1]];
}
function renderShot(name, lt, dur, t) {
  L.cam.far = 60000; const h = kiteH(t);
  switch (name) {
    case 'establish': { beachState(t, 6); const k = ease(lt / dur); setCam(V(lerp(6, 5, k), lerp(2.2, 1.9, k), lerp(9, 8, k)), V(0, 2.5, -2), 50); return beach; }
    case 'setup': { beachState(t, 6); setFace(dale, { lid: 0.35, brow: 0.6, browTilt: 0.2 }); setFace(kid, { lid: 0.5, brow: 0.5, browTilt: -0.3, mouth: tk(KID, t) }); if (t > KID.t - 0.2) setCam(V(2.4, 1.1, -0.6), V(1.6, 0.9, 2.3), 44); else setCam(V(0.6, 1.6, -1.4), V(0, 1.5, 2), 44); return beach; }
    case 'k1': case 'k3': { beachState(t, h); const n = +name.slice(1); setFace(dale, n === 1 ? { lid: 0.3, brow: 0.5, mouth: 0.2 } : { lid: 0.1, brow: 0.8, mouth: 0.4 }); setFace(kid, n === 3 ? { lid: 0, brow: 1, mouth: 0.5 } : { lid: 0.5, brow: 0.3 }); dale.neckG.rotation.x = -0.5;
      if (n === 1) setCam(V(2.2, 1.0, 5.5), V(0, 4.5, -2), 54); else setCam(V(8, 3, 14), V(0, lerp(10, 40, clamp((t - A[3]) / 1)), -15), 56); return beach; }
    case 'k5': case 'k7': case 'k9': { const n = +name.slice(1); const kp = V(0, h, -h * 0.55); kiteS.position.copy(kp); kiteS.scale.setScalar(Math.max(1.4, h * 0.02)); kiteS.lookAt(V(0, 0, 0)); setLine(strS, V(0, 0, 0), kp, Math.max(0.05, h * 0.0012)); const k = n === 9 ? clamp((t - A[9]) / 1.4) : 0; sky.background.setRGB(lerp(0.44, 0.04, k), lerp(0.66, 0.08, k), lerp(0.91, 0.25, k));
      if (n === 5) setCam(kp.clone().add(V(-260, -60, 200)), kp.clone().add(V(80, -80, 0)), 52, 0.02, t); else if (n === 7) setCam(kp.clone().add(V(2600, -600, 3400)), kp.clone().lerp(V(-3000, 7000, -5000), 0.35), 52, 0.02, t); else { const off = Math.max(12, h * 0.06); setCam(kp.clone().add(V(off * 0.9, off * 0.3, off * 1.6)), kp.clone().add(V(0, -off * 0.25, 0)), 52, 0.02, t); } return sky; }
    case 'k11': { S.earth.rotation.y = 0.3; const dt = t - A[11]; const alt = lerp(0.5, 1.85, easeOut(clamp(dt / 1.4))); const dir = V(0.2, 1, 0.4).normalize(); kiteSp.scale.setScalar(0.05); fire.visible = false; kiteSp.position.copy(dir.clone().multiplyScalar(20 + alt)); kiteSp.lookAt(V(0, 0, 0)); setLine(strSp, dir.clone().multiplyScalar(20), kiteSp.position, 0.002);
      const side = V(1, 0, -0.4).normalize(); const P = kiteSp.position; setCam(P.clone().add(side.multiplyScalar(0.5)).add(dir.clone().multiplyScalar(0.18)), P.clone().add(dir.clone().multiplyScalar(-0.1)), 50); return S.scene; }
    case 'worse': { resetPose(daleW); daleW.root.rotation.set(0, 0.3, 0); holdPose(daleW); daleW.neckG.rotation.x = -0.4; setFace(daleW, { lid: 0.1, brow: 1, mouth: 0.4 }); setCam(V(0.25, 1.65, lerp(1.8, 1.45, lt / dur)), V(0, 1.6, 0), 36, 0.006, t); return wsc; }
    case 'sun': { const dt = t - A[16]; S.earth.rotation.y = 0.3; const SUN = S.sunDisk.position.clone(); const from = V(0.2, 1, 0.4).normalize().multiplyScalar(22); const P = from.clone().lerp(SUN.clone().add(V(60, 10, -40)), easeOut(clamp(dt / 3.2))); kiteSp.position.copy(P); kiteSp.scale.setScalar(25); kiteSp.lookAt(V(0, 0, 0)); fire.visible = dt > 1.2; fire.scale.setScalar(lerp(0.5, 3, clamp((dt - 1.2) / 1.5))); setLine(strSp, from, P, 0.15);
      if (lt < 1.6) setCam(V(40, 40, 90), V(-100, 40, 60), 55, 0.2, t); else setCam(P.clone().add(V(30, 15, 60)), P.clone(), 55, 0.02, t); return S.scene; }
    case 'end': { beachState(t, 60); kite.visible = false; setLine(str, V(0.15, 1.35, 1.4), V(0.15, 400, -200), 0.008); setFace(dale, { lid: 0.45, brow: 0.6, browTilt: 0.25, mouth: tk(DL, t) }); setFace(kid, { lid: 0, brow: 1, mouth: 0.6 }); kid.neckG.rotation.x = -0.5; dale.root.rotation.y = Math.PI - 0.6;
      setCam(V(0.8, 1.5, -2.6), V(0.7, 1.2, 2.1), 50); return beach; }
    case 'fact': { resetPose(daleL); daleL.root.rotation.y = 0.3; setFace(daleL, { lid: 0.35, brow: 0.3 }); blinkAt(daleL, t); const k = ease(lt / dur); setCam(V(lerp(1.3, 1.0, k), 1.5, lerp(3.6, 3.2, k)), V(0.0, 1.25, 0), 46); return lab.scene; }
  }
}
const rungs = [['10', 'm', 1, 'A NORMAL KITE', 10], ['90', 'm', 3, 'CONFUSED SEAGULLS', 90], ['810', 'm', 5, 'ALMOST THE BURJ KHALIFA', 810], ['7.3', 'km', 7, 'ALMOST EVEREST', 7290], ['66', 'km', 9, 'ABOVE EVERY PLANE', 65610], ['590', 'km', 11, 'ABOVE THE SPACE STATION', 590490], ['143 M', 'km', 16, 'ALMOST TO THE SUN', 1.43e11]]
  .map(([v, unit, n, cmp, raw], i) => ({ v, unit, n, cmp, raw, at: A[n], gold: i === 6 }));
const overlay = L.makeOverlay({ lines: H.LINES, titleL1: 'What if your kite flew', titleHi: '3× higher', titleL2: ' every time?', titleSize: 80, hudLabel: r => 'STRING ' + r.n + '   ·   HEIGHT', rule: '×3 EVERY PULL', rungs, barMin: 2, barMax: 5e11, barMarks: [[4880, 'RECORD'], [1.5e11, 'SUN']], fact: { big: '4,880', unit: 'm', sub: 'HIGHEST SINGLE KITE · 2014' }, hideHUD: ['worse', 'fact', 'end', 'setup'], flashBig: [A[16]], flashSmall: [A[5]] });
L.makeFrame(shots, renderShot, overlay);

import * as L from '/lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, easeOut, lerp, setCam, rng, makeGuy, setFace, resetPose, blinkAt } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const A = {}; TL.tl.filter(x => x.type === 'act').forEach(x => A[x.n] = x.blast);
const line = H.line;
const talk = (p, t) => { const l = line(p); return t > l.t && t < l.end ? Math.abs(Math.sin(t * 14)) * 0.5 : 0; };
const ballM = mat(0xffffff, { r: 0.5 });
function arc(D, q, hk = 0.35) { return V(0, 1 + Math.sin(q * Math.PI) * D * hk, -D * q); }
// ---------- stadium ----------
const st = new THREE.Scene(); st.background = new THREE.Color(0x0e1630); st.fog = new THREE.Fog(0x0e1630, 260, 1800);
st.add(new THREE.HemisphereLight(0xdfe8ff, 0x2a4a2a, 1.1)); { const s = new THREE.DirectionalLight(0xffffff, 2.2); s.position.set(40, 80, 30); s.castShadow = true; Object.assign(s.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20 }); s.shadow.mapSize.set(2048, 2048); st.add(s); }
{ const g = mesh(new THREE.CircleGeometry(135, 64), mat(0x3a9a3a, { r: 1 })); g.rotation.x = -Math.PI / 2; st.add(g); const dirt = mesh(new THREE.CircleGeometry(30, 4), mat(0xb8804a, { r: 1 })); dirt.rotation.x = -Math.PI / 2; dirt.rotation.z = Math.PI / 4; dirt.position.set(0, 0.02, -19); st.add(dirt); const infield = mesh(new THREE.PlaneGeometry(27, 27), mat(0x4aaa4a, { r: 1 })); infield.rotation.x = -Math.PI / 2; infield.rotation.z = Math.PI / 4; infield.position.set(0, 0.03, -19); st.add(infield);
  const plate = mesh(new THREE.CircleGeometry(0.3, 5), mat(0xffffff)); plate.rotation.x = -Math.PI / 2; plate.position.y = 0.04; st.add(plate); for (const [x, z] of [[19, -19], [0, -38], [-19, -19]]) { const b = box(0.4, 0.08, 0.4, mat(0xffffff)); b.position.set(x * 0.707 + 0, 0.04, z * 0.707 + (z === -19 ? -5.6 : -11.1)); st.add(b); }
  const mound = mesh(new THREE.CylinderGeometry(2.7, 2.9, 0.25, 20), mat(0xb8804a)); mound.position.set(0, 0.12, -18.4); st.add(mound);
  const fence = mesh(new THREE.CylinderGeometry(122, 122, 3, 64, 1, true, Math.PI * 0.75, Math.PI * 0.5), new THREE.MeshStandardMaterial({ color: 0x1a4a2a, side: THREE.DoubleSide })); fence.position.y = 1.5; st.add(fence);
  for (let tier = 0; tier < 6; tier++) { const r0 = 125 + tier * 6; const s = mesh(new THREE.CylinderGeometry(r0 + 6, r0, 4, 64, 1, true, Math.PI * 0.6, Math.PI * 0.8), new THREE.MeshStandardMaterial({ color: tier % 2 ? 0x2a3a6a : 0x34447a, side: THREE.DoubleSide })); s.position.y = 4 + tier * 4; st.add(s); }
  for (const a of [-0.6, 0.6]) { const p = mesh(new THREE.CylinderGeometry(0.6, 0.8, 50, 8), mat(0x888888)); p.position.set(Math.sin(a) * 150, 25, -Math.cos(a) * 150 + 40); st.add(p); const lamp = box(10, 4, 1, new THREE.MeshBasicMaterial({ color: 0xfffbe8 })); lamp.position.set(Math.sin(a) * 150, 52, -Math.cos(a) * 150 + 40); lamp.lookAt(0, 0, -40); st.add(lamp); } }
const crowd = L.makeInstanced(new THREE.BoxGeometry(0.6, 0.9, 0.5), mat(0xffffff), 3000); crowd.castShadow = false; st.add(crowd); { const r = rng(4); const c = new THREE.Color(); for (let i = 0; i < 3000; i++) { const tier = Math.floor(r() * 6); const rr = 126 + tier * 6 + r() * 4; const a = Math.PI * 0.6 + r() * Math.PI * 0.8; L._m.compose(V(Math.sin(a) * rr, 4.5 + tier * 4 + 1, Math.cos(a) * rr), L._q.identity(), L._s.setScalar(1)); crowd.setMatrixAt(i, L._m); crowd.setColorAt(i, c.setHSL(r(), 0.6, 0.55)); } crowd.instanceMatrix.needsUpdate = true; }
const dale = makeGuy({ ...L.DALE, cap: 0xd9301f }); st.add(dale.root);
const bat = mesh(new THREE.CylinderGeometry(0.035, 0.02, 0.85, 10), mat(0xc8a070)); bat.position.y = 0.42; const batG = new THREE.Group(); batG.add(bat); dale.aR.grip.add(batG);
const catcher = makeGuy({ wood: 0xc99a6a, cap: 0x2a2a2a, shirt: 0x5a5a6a, sit: true }); catcher.root.position.set(0, -0.15, 1.3); catcher.root.rotation.y = Math.PI; st.add(catcher.root);
const pitcher = makeGuy({ wood: 0xd9b08a, cap: 0x2a5ab0, shirt: 0xeeeeee }); pitcher.root.position.set(0, 0.25, -18.4); st.add(pitcher.root);
const ball = mesh(new THREE.SphereGeometry(0.12, 12, 8), ballM); st.add(ball);
const trailT = L.makeInstanced(new THREE.SphereGeometry(0.1, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }), 40); trailT.castShadow = false; st.add(trailT);
// ---------- town ----------
const town = L.buildTown({ sky: 'night', seed: 606, low: true }); const ts = town.scene; const ballT = mesh(new THREE.SphereGeometry(0.6, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); ts.add(ballT);
// ---------- ocean / sky ----------
const oc = new THREE.Scene(); oc.background = new THREE.Color(0x1a2a50); oc.fog = new THREE.Fog(0x1a2a50, 2000, 40000); oc.add(new THREE.HemisphereLight(0xaac0ff, 0x10203a, 1.1)); { const s = new THREE.DirectionalLight(0xffe0c0, 1.4); s.position.set(1, 0.6, -0.4); oc.add(s); }
const water = mesh(new THREE.PlaneGeometry(200000, 200000), new THREE.MeshStandardMaterial({ color: 0x2a7ac8, roughness: 0.5, map: (() => { const t = L.canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,170,230,0.9)'; g.lineWidth = 3; for (let i = 0; i < 16; i++) { g.beginPath(); for (let x = 0; x <= w; x += 8) g.lineTo(x, i * 16 + Math.sin(x * 0.1 + i) * 4); g.stroke(); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(400, 400); return t; })() }), false, false); water.rotation.x = -Math.PI / 2; oc.add(water);
const coast = mesh(new THREE.PlaneGeometry(200000, 100000), mat(0x2a4a2a), false, false); coast.rotation.x = -Math.PI / 2; coast.position.set(0, 2, 50000); oc.add(coast);
const ballO = mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); oc.add(ballO); const streak = mesh(new THREE.CylinderGeometry(1, 0.1, 1, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })); oc.add(streak);
const plane = new THREE.Group(); { const pm = mat(0xf4f6f8, { r: 0.4 }); const f = mesh(new THREE.CylinderGeometry(2, 2, 30, 14), pm); f.rotation.z = Math.PI / 2; plane.add(f); plane.add(box(8, 0.4, 34, pm)); const tf = box(4, 6, 0.4, mat(0xd9301f)); tf.position.set(-13, 3.5, 0); plane.add(tf); } oc.add(plane);
// ---------- space ----------
const S = L.buildSpace(); const ballS = mesh(new THREE.SphereGeometry(0.4, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); S.scene.add(ballS);
const START = V(-0.55, 0.45, 0.7).normalize();
// ---------- worse / lab ----------
const wsc = new THREE.Scene(); wsc.background = new THREE.Color(0x14060a); const wl = new THREE.PointLight(0xff3020, 30, 12, 2); wl.position.set(0.8, 2.0, 2.0); wsc.add(wl); wsc.add(new THREE.AmbientLight(0x200810, 1)); const daleW = makeGuy({ ...L.DALE, cap: 0xd9301f }); wsc.add(daleW.root);
const lab = L.buildLab({ bg: 0xe8eef4, floor: 0xd8dee4 }); const daleL = makeGuy({ ...L.DALE, cap: 0xd9301f }); daleL.root.position.set(-0.6, 0, 0); lab.scene.add(daleL.root); { const b = mesh(new THREE.SphereGeometry(0.2, 20, 14), ballM); b.position.set(0.6, 1.0, -0.1); lab.scene.add(b); const st2 = box(0.5, 0.8, 0.5, mat(0xd8d8d8)); st2.position.set(0.6, 0.4, -0.1); lab.scene.add(st2); }

function batter(t, n) { resetPose(dale); dale.root.position.set(0.75, 0, 0.1); dale.root.rotation.set(0, -Math.PI / 2 - 0.2, 0); blinkAt(dale, t); const dt = n ? t - A[n] : -9; let sw;
  if (dt < -0.35) sw = 0; else if (dt < 0.05) sw = ease(clamp((dt + 0.35) / 0.4)); else sw = 1;
  dale.aR.sh.rotation.set(-1.2 - sw * 0.4, lerp(0.9, -1.6, sw), 0); dale.aL.sh.rotation.set(-1.2 - sw * 0.4, lerp(0.9, -1.6, sw), 0); dale.body.rotation.y = lerp(0.5, -1.2, sw); batG.rotation.set(lerp(-0.5, 1.4, sw), 0, 0); setFace(dale, { lid: 0.2, brow: 0.7, mouth: sw > 0.5 ? 0.4 : 0 }); }
function stReset(t) { ball.scale.setScalar(1); resetPose(catcher); setFace(catcher, { lid: 0.5, brow: 0.4 }); blinkAt(catcher, t + 0.5); resetPose(pitcher); blinkAt(pitcher, t + 1.4); L.hideAll(trailT); ball.visible = false; }
function pitchBall(t, n) { const dt = t - A[n]; if (dt < -0.5 || dt > 0) return null; return V(0, 1.6 - 0.6 * (dt + 0.5) * 2, -18 * (-dt / 0.5)); }
function shots() {
  const L2 = H.LINES[1].t, run = line('Dale is still').t;
  return [['establish', 0, L2], ['setup', L2, A[1] - 0.9], ['b1', A[1] - 0.9, A[3] - 0.8], ['b3', A[3] - 0.8, A[5] - 0.8], ['b5', A[5] - 0.8, A[7] - 0.5], ['b7', A[7] - 0.5, A[9] - 0.5], ['b9', A[9] - 0.5, A[11] - 0.5], ['b11', A[11] - 0.5, H.worse.t], ['worse', H.worse.t, A[15] - 0.4], ['space', A[15] - 0.4, run], ['end', run, H.fact.t], ['fact', H.fact.t, TL.dur + 1]];
}
function renderShot(name, lt, dur, t) {
  L.cam.far = 300000;
  switch (name) {
    case 'establish': { stReset(t); batter(t, 0); const k = ease(lt / dur); setCam(V(lerp(-60, -40, k), lerp(40, 25, k), lerp(70, 50, k)), V(0, 0, -30), 50); return st; }
    case 'setup': { stReset(t); batter(t, 0); setFace(catcher, { lid: 0.6, brow: 0.3, browTilt: -0.3, mouth: talk('Easy out', t) }); const e = line('Easy out'); if (t > e.t - 0.2) setCam(V(-1.2, 1.1, -1.4), V(0, 0.8, 1.3), 46); else setCam(V(-1.6, 1.5, -2.6), V(0.6, 1.2, 0.1), 44); return st; }
    case 'b1': case 'b3': case 'b5': case 'b7': case 'b9': case 'b11': { stReset(t); const n = +name.slice(1); batter(t, n); const dt = t - A[n]; const pb = pitchBall(t, n);
      if (pb) { ball.visible = true; ball.position.copy(pb); }
      if (n === 1 && dt > 0) { const q = clamp(dt / 2.6); ball.visible = true; ball.scale.setScalar(3); ball.position.copy(arc(120, q)).add(V(dt * 3, 0, 0)); for (let i = 0; i < 40; i++) { const qq = Math.max(0, q - i * 0.006); L._m.compose(arc(120, qq).add(V(Math.max(0, dt - i * 0.015) * 3, 0, 0)), L._q.identity(), L._s.setScalar(1 - i / 40)); trailT.setMatrixAt(i, L._m); } trailT.instanceMatrix.needsUpdate = true; setCam(V(0, 8, 16), ball.position.clone().lerp(V(0, 5, -60), 0.5), 56); return st; }
      if (n === 3 && dt > 0) { const q = clamp(dt / 1.8); ball.visible = true; ball.scale.setScalar(12); ball.position.copy(arc(1000, q, 0.25)); setCam(V(120, 80, 160), V(0, 30, -lerp(30, 400, q)), 54); return st; }
      if (dt > 0 && n === 5) { const k = clamp((dt) / 1.0); const p = V(lerp(-200, 0, k), lerp(60, 8, k), lerp(-200, -6, k)); ballT.visible = k < 1; ballT.position.copy(p); L.glassBurst(town, V(0, 0, -6), dt - 1.0, 30); setCam(V(30, 14, 30), V(0, 6, -6), 50, dt > 1 && dt < 1.4 ? 0.3 : 0, t); return ts; }
      if (dt > 0 && (n === 7 || n === 9)) { const D = n === 7 ? 87000 : 787000; const q = clamp(dt / 3.0); const alt = n === 7 ? 300 : 3000; const p = V(0, 60 + Math.sin(q * Math.PI) * alt, -D * q); ballO.position.copy(p); ballO.scale.setScalar(n === 7 ? 4 : 30); const dir = V(0, 0, -1); streak.position.copy(p).add(V(0, 0, n === 7 ? 120 : 900)); streak.scale.set(n === 7 ? 3 : 25, n === 7 ? 240 : 1800, n === 7 ? 3 : 25); streak.rotation.x = Math.PI / 2; plane.visible = n === 9; plane.scale.setScalar(4); plane.position.copy(p).add(V(300, -2000, -800)); oc.background.set(n === 9 ? 0x0a1230 : 0x1a2a50);
        const off = n === 7 ? 60 : 500; setCam(p.clone().add(V(off, off * 0.6, off * 1.4)), p.clone().add(V(0, -off * 0.7, -off * 0.4)), 62, 0.02, t); return oc; }
      if (dt > 0 && n === 11) { S.earth.rotation.y = 0; S.moon.position.set(140, 20, -160); const ang = 1.1 * ease(clamp(dt / 2.6)); const AX = V(0.3, 1, -0.2).normalize(); const pos = a => START.clone().applyAxisAngle(AX, a).multiplyScalar(20.2 + Math.sin(a / 1.1 * Math.PI) * 1.5); ballS.position.copy(pos(ang)); ballS.scale.setScalar(0.6); S.trail.visible = true; L.setTrail(S, i => pos(ang * i / 399)); setCam(START.clone().applyAxisAngle(AX, 0.55).multiplyScalar(58).add(V(0, 15, 0)), V(0, 0, 0), 46); return S.scene; }
      // pre-hit / generic batter shot
      const close = n === 1 || n === 5 || n === 9; if (close) setCam(V(-1.6, 1.5, -2.6), V(0.6, 1.2, 0.1), 44, 0, t); else setCam(V(2.6, 1.5, -2.9), V(0.6, 1.2, 0.1), 46, 0, t); setFace(catcher, { lid: 0.3, brow: 0.6 }); return st; }
    case 'worse': { resetPose(daleW); daleW.root.rotation.set(0, 0.3, 0); setFace(daleW, { lid: 0.1, brow: 1, mouth: 0.4 }); daleW.neckG.rotation.x = -0.3; setCam(V(0.25, 1.65, lerp(1.8, 1.45, lt / dur)), V(0, 1.6, 0), 36, 0.006, t); return wsc; }
    case 'space': { const dt = t - A[15]; S.earth.rotation.y = 0; S.moon.position.set(140, 20, -160); const P0 = START.clone().multiplyScalar(21); const P1 = V(330, 60, -420); const q = easeOut(clamp(dt / 3.6)); const p = P0.clone().lerp(P1, q); ballS.position.copy(p); ballS.scale.setScalar(1.5); S.trail.visible = true; L.setTrail(S, i => P0.clone().lerp(p, i / 399));
      ballS.scale.setScalar(3); setCam(START.clone().multiplyScalar(80).add(V(0, 20, 0)), V(60, 10, -60), 55, dt > 0 && dt < 0.6 ? 0.3 : 0, t); return S.scene; }
    case 'end': { stReset(t); resetPose(dale); const ph = t * 9; L.walkPose(dale, ph, 1.2); const q = (t - lt) * 0 + lt * 0.12; const base1 = V(13.4, 0, -13.4); const p = V(0.6, 0, 0).lerp(base1, clamp(q)); dale.root.position.copy(p); dale.root.rotation.set(0, Math.atan2(base1.x, base1.z), 0); batG.rotation.set(0, 0, 0); dale.aR.grip.visible = false; setFace(dale, { lid: 0.3, brow: 0.6, browTilt: 0.2, mouth: talk('Is that', t) }); setFace(catcher, { lid: 0, brow: 1, mouth: 0.6 }); catcher.root.rotation.y = 2.4;
      setCam(p.clone().add(V(3.5, 1.6, 2.5)), p.clone().add(V(0, 1.2, 0)), 46); return st; }
    case 'fact': { resetPose(daleL); daleL.root.rotation.y = 0.3; setFace(daleL, { lid: 0.35, brow: 0.3 }); blinkAt(daleL, t); const k = ease(lt / dur); setCam(V(lerp(1.3, 1.0, k), 1.5, lerp(3.6, 3.2, k)), V(0.0, 1.25, 0), 46); return lab.scene; }
  }
}
const rungs = [['120', 'm', 1, 'A NORMAL HOME RUN', 120], ['1', 'km', 3, 'OUT OF THE STADIUM', 1080], ['10', 'km', 5, 'THE NEXT TOWN', 9720], ['87', 'km', 7, 'OVER THE OCEAN', 87480], ['787', 'km', 9, 'AIR TRAFFIC CONTROL', 787320], ['7,086', 'km', 11, 'ACROSS THE OCEAN', 7.09e6], ['574,000', 'km', 15, 'NOT COMING BACK', 5.74e8]]
  .map(([v, unit, n, cmp, raw], i) => ({ v, unit, n, cmp, raw, at: A[n], gold: i === 6 }));
const overlay = L.makeOverlay({ lines: H.LINES, titleL1: 'What if every home run went', titleHi: '3× farther', titleL2: ' than the last?', titleSize: 76, hudLabel: r => 'HIT ' + r.n + '   ·   DISTANCE', rule: '×3 EVERY HIT', rungs, barMin: 50, barMax: 2e9, barMarks: [[4.0075e7, 'EARTH'], [3.844e8, 'MOON']], fact: { big: '0.4', unit: 's', sub: '100 MPH FASTBALL · MOUND TO PLATE' }, hideHUD: ['worse', 'fact', 'end', 'setup'], flashBig: [A[15]], flashSmall: [A[5] + 1.0] });
L.makeFrame(shots, renderShot, overlay);

import * as L from '/lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, lerp, setCam, rng, canvasTex, makeGuy, setFace, resetPose, blinkAt } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const A = {}; TL.tl.filter(x => x.type === 'act').forEach(x => A[x.n] = x.blast);
const line = H.line;

const town = L.buildTown({ sky: 'snow', seed: 41, low: true, skip: [[0, -1], [0, 0]] }); const ts = town.scene;
// snow cover on roads (white blanket)
const blanket = mesh(new THREE.PlaneGeometry(600, 600), mat(0xf4f7fb, { r: 1 }), false, true); blanket.rotation.x = -Math.PI / 2; blanket.position.y = 0.04; blanket.material.transparent = true; blanket.material.opacity = 0.7; ts.add(blanket);
const flakes = L.makeInstanced(new THREE.SphereGeometry(0.03, 5, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }), 400); flakes.castShadow = false; ts.add(flakes);
const fr = rng(4); const flD = []; for (let i = 0; i < 400; i++) flD.push(V((fr() - 0.5) * 40, fr() * 14, (fr() - 0.5) * 30));
function snowfall(t, cx = 0, cz = 12) { for (let i = 0; i < 400; i++) { const d = flD[i]; L._m.compose(L._p.set(cx + d.x + Math.sin(t + i) * 0.3, (d.y - t * 1.2) % 14 + (d.y - t * 1.2 < 0 ? 14 : 0), cz + d.z), L._q.identity(), L._s.setScalar(1)); flakes.setMatrixAt(i, L._m); } flakes.instanceMatrix.needsUpdate = true; }
const dale = makeGuy({ ...L.DALE, cap: 0xd94f4f }); dale.root.position.set(-8, 0, 12); dale.root.rotation.y = Math.PI / 2; ts.add(dale.root);
const benny = makeGuy({ wood: 0xf0c8a0, cap: 0x2d6ad9, shirt: 0x2e9c8f }); benny.root.scale.setScalar(0.72); benny.root.position.set(6, 0, 12); benny.root.rotation.y = -Math.PI / 2; ts.add(benny.root);
const scarf = mesh(new THREE.TorusGeometry(0.11, 0.04, 8, 16), mat(0xf2c230)); scarf.rotation.x = Math.PI / 2; scarf.position.y = 0.74; benny.body.add(scarf);
const van = new THREE.Group(); { const b = box(4.8, 1.8, 2.0, mat(0x6a9fd8, { r: 0.4, m: 0.2 })); b.position.y = 1.2; van.add(b); const w = box(4.2, 0.6, 2.05, mat(0x9fd3f0, { r: 0.1 })); w.position.y = 1.65; van.add(w); for (const x of [-1.6, 1.6]) for (const z of [-1, 1]) { const wh = mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.25, 14), mat(0x1a1a1a)); wh.rotation.x = Math.PI / 2; wh.position.set(x, 0.4, z); van.add(wh); } }
van.position.set(10.5, 0, 14.2); ts.add(van);
const snowM = new THREE.MeshStandardMaterial({ color: 0xf8fbff, roughness: 0.9, flatShading: true });
const ball = mesh(new THREE.IcosahedronGeometry(1, 3), snowM); ts.add(ball); ball.visible = false;
const hit = L.makePuff(ts, 60, 0xffffff, 0.8, 6);
const plane = new THREE.Group(); { const f = mesh(new THREE.CylinderGeometry(1.2, 1.2, 14, 12), mat(0xffffff)); f.rotation.z = Math.PI / 2; plane.add(f); const w = box(3, 0.2, 18, mat(0xdddddd)); plane.add(w); const tl = box(1.5, 3, 0.2, mat(0xd94f4f)); tl.position.set(-6.5, 1.8, 0); plane.add(tl); }
plane.scale.setScalar(2); ts.add(plane); plane.visible = false;
const skiers = L.makeInstanced(new THREE.BoxGeometry(1, 2, 1), mat(0xd94f4f), 60); skiers.castShadow = false; ts.add(skiers); L.hideAll(skiers);
// space
const S = L.buildSpace(); const snowMoon = mesh(new THREE.IcosahedronGeometry(5.3, 4), new THREE.MeshStandardMaterial({ color: 0xf8fbff, roughness: 0.85, flatShading: true }), false, false); S.scene.add(snowMoon);
const daleS = makeGuy({ ...L.DALE, cap: 0xd94f4f }); S.scene.add(daleS.root);
// worse
const wsc = new THREE.Scene(); wsc.background = new THREE.Color(0x14060a); const wl = new THREE.PointLight(0xff3020, 30, 12, 2); wl.position.set(1.2, 2.2, 2.0); wsc.add(wl); wsc.add(new THREE.AmbientLight(0x200810, 1)); const daleW = makeGuy({ ...L.DALE, cap: 0xd94f4f }); wsc.add(daleW.root);
const wBall = mesh(new THREE.IcosahedronGeometry(0.06, 2), snowM); daleW.aR.grip.add(wBall);
// lab
const lab = L.buildLab({ bg: 0xdfeaf5, floor: 0xe8eef5 }); const daleL = makeGuy({ ...L.DALE, cap: 0xd94f4f }); daleL.root.position.set(-0.6, 0, 0); daleL.root.rotation.y = 0.4; lab.scene.add(daleL.root);
const flake = new THREE.Group(); const fm = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.6, roughness: 0.1, transparent: true, opacity: 0.85, thickness: 0.05 });
for (let i = 0; i < 6; i++) { const arm = box(0.03, 0.6, 0.01, fm); arm.position.y = 0.3; const g = new THREE.Group(); g.add(arm); for (const s of [-1, 1]) { const br = box(0.02, 0.16, 0.01, fm); br.position.set(s * 0.05, 0.38, 0); br.rotation.z = -s * 0.8; g.add(br); } g.rotation.z = i * Math.PI / 3; flake.add(g); }
flake.position.set(0.7, 1.6, 0.5); flake.scale.setScalar(0.6); lab.scene.add(flake);

function throwPose(g, dt) { // dt relative to release
  let wind = 0, rel = 0; if (dt > -0.5 && dt < 0) wind = (dt + 0.5) / 0.5; else if (dt >= 0 && dt < 0.4) rel = 1 - dt / 0.4;
  g.aR.sh.rotation.set(lerp(0, -2.6, ease(wind)) + (dt >= 0 && dt < 0.4 ? lerp(-1.2, -2.6, rel) + 2.6 - 1.2 : 0), 0, -0.2); g.aR.el.rotation.x = -0.8 * wind;
  g.body.rotation.y = 0.4 * wind - (dt >= 0 && dt < 0.4 ? 0.3 * rel : 0); setFace(g, { lid: 0.2, brow: 0.9 * Math.max(wind, rel), mouth: 0.3 * rel });
}
function flight(p0, p1, h, k) { const p = p0.clone().lerp(p1, clamp(k)); p.y += 4 * h * clamp(k) * (1 - clamp(k)); return p; }
function shots() {
  const L2 = H.LINES[1].t, taunt = line('You throw').t, truce = line('Okay!').t;
  return [['establish', 0, L2], ['setup', L2, taunt], ['taunt', taunt, A[1] - 0.6], ['t1', A[1] - 0.6, A[3] - 0.6], ['t3', A[3] - 0.6, A[5] - 0.6], ['t5', A[5] - 0.6, A[7] - 0.6], ['t7', A[7] - 0.6, A[9] - 0.6], ['t9', A[9] - 0.6, A[12] - 0.6], ['t12', A[12] - 0.6, H.worse.t],
    ['worse', H.worse.t, A[17] - 0.2], ['moon', A[17] - 0.2, truce], ['truce', truce, H.fact.t], ['fact', H.fact.t, TL.dur + 1]];
}
function reset(t) { resetPose(dale); resetPose(benny); dale.root.rotation.set(0, Math.PI / 2, 0); benny.root.position.set(6, 0, 12); benny.root.rotation.set(0, -Math.PI / 2, 0); ball.visible = false; L.hideAll(hit); van.scale.set(1, 1, 1); van.position.y = 0; plane.visible = false; L.hideAll(skiers); snowfall(t); ts.fog.far = 200; ts.fog.near = 40; }
function bennySnowman(on) { if (on) { benny.root.position.set(6, 1.15, 12); benny.lL.hip.rotation.x = 0; } }
function renderShot(name, lt, dur, t) {
  switch (name) {
    case 'establish': { reset(t); const k = ease(lt / dur); setCam(V(lerp(-30, -22, k), lerp(16, 12, k), 12.5), V(0, 1, 12), 44); return ts; }
    case 'setup': { reset(t); setFace(dale, { lid: 0.3, brow: 0.5 }); setFace(benny, { lid: 0.3, brow: -0.5, browTilt: 0.2 }); blinkAt(dale, t); setCam(V(-1, 1.7, 17), V(-1, 1.0, 12), 46); return ts; }
    case 'taunt': { reset(t); setFace(benny, { lid: 0.4, brow: -0.6, browTilt: 0.25, mouth: Math.abs(Math.sin(t * 13)) * 0.6 }); benny.aR.sh.rotation.set(-1.2, 0, 0.3); benny.aR.el.rotation.x = -0.4; setCam(V(3.4, 1.0, 13), V(6, 0.95, 12), 40); return ts; }
    case 't1': { reset(t); const dt = t - A[1]; throwPose(dale, dt); const k = clamp(dt / 0.45); const p = flight(V(-7.6, 1.8, 12.2), V(6, 0.75, 12), 1.0, k); ball.visible = dt > 0 && k < 1; ball.position.copy(p); ball.scale.setScalar(0.04);
      L.puffAt(hit, V(6, 0.8, 12), V(1, 0.2, 0), dt - 0.45, 0.2, 1.5); if (dt > 0.45) { benny.neckG.rotation.x = -0.3; setFace(benny, { lid: 0.1, brow: 1, mouth: 0.6 }); }
      if (lt < 0.9) setCam(V(-9.5, 1.7, 14), V(-7, 1.6, 12), 40); else setCam(V(4.5, 1.0, 14.5), V(6, 0.9, 12), 44); return ts; }
    case 't3': { reset(t); const dt = t - A[3]; throwPose(dale, dt); const k = clamp(dt / 0.6); const r = 0.35; const p = flight(V(-7.6, 1.8, 12.2), V(6, r, 12), 1.6, k); ball.visible = dt > 0; ball.position.copy(p); ball.scale.setScalar(r);
      if (k >= 1) { bennySnowman(true); benny.root.position.y = 0.22; setFace(benny, { lid: 0.6, brow: -0.6, mouth: 0 }); benny.aL.sh.rotation.z = 1.2; benny.aR.sh.rotation.z = -1.2; ball.position.set(6, r, 12); }
      L.puffAt(hit, V(6, 0.5, 12), V(1, 0.3, 0), dt - 0.6, 0.8, 1.6); setCam(V(1.5, 1.4, 16.5), V(5, 0.7, 12), 44); return ts; }
    case 't5': { reset(t); bennySnowman(true); benny.root.position.y = 0.22; benny.aL.sh.rotation.z = 1.2; benny.aR.sh.rotation.z = -1.2; const dt = t - A[5]; throwPose(dale, dt); const k = clamp(dt / 0.9); const r = 3.25;
      const sb = mesh; ball.visible = true; ball.position.set(6, 0.35, 12); ball.scale.setScalar(0.35);
      const p = flight(V(-7.6, 3.5, 12.2), V(10.5, r - 0.6, 14.2), 6, k);
      if (!ts.userData.big) { ts.userData.big = mesh(new THREE.IcosahedronGeometry(1, 3), snowM); ts.add(ts.userData.big); } const big = ts.userData.big; big.visible = dt > 0; big.position.copy(p); big.scale.setScalar(r);
      if (k >= 1) { van.scale.y = 0.35; }
      L.puffAt(hit, V(10.5, 1, 14.2), V(0, 0.5, 1), dt - 0.9, 3, 2);
      setCam(V(-2, 5, 17.8), V(7, 2.2, 13), 58, dt > 0.85 && dt < 1.3 ? 0.2 : 0, t); return ts; }
    case 't7': { reset(t); van.scale.y = 0.35; const dt = t - A[7]; const k = clamp(dt / 1.4); const r = 29; const big = ts.userData.big; big.visible = true; big.position.set(10.5, 2.65, 14.2); big.scale.setScalar(3.25);
      if (!ts.userData.huge) { ts.userData.huge = mesh(new THREE.IcosahedronGeometry(1, 4), snowM); ts.add(ts.userData.huge); } const hg = ts.userData.huge; hg.visible = dt > 0; hg.position.copy(flight(V(-8, 30, 12), V(40, r - 3, 12), 30, k)); hg.scale.setScalar(r); hg.rotation.z = -k * 2;
      L.puffAt(hit, V(40, 3, 12), V(0, 1, 0), dt - 1.4, 12, 2.5); ts.fog.far = 600;
      if (lt < 1.2) setCam(V(-12, 2.0, 18), V(-4, 6, 12), 60); else setCam(V(-60, 70, 90), V(30, 10, 10), 46, dt > 1.35 && dt < 1.8 ? 0.5 : 0, t); return ts; }
    case 't9': { reset(t); ts.fog.far = 4000; ts.fog.near = 300; const dt = t - A[9]; const k = clamp(dt / 2.6); const r = 262; const hg = ts.userData.huge; hg.visible = true; hg.position.set(40, 26, 12); hg.scale.setScalar(29);
      if (!ts.userData.giant) { ts.userData.giant = mesh(new THREE.IcosahedronGeometry(1, 4), snowM); ts.add(ts.userData.giant); } const gi = ts.userData.giant; gi.visible = dt > 0; gi.position.copy(flight(V(-20, 50, 12), V(900, r, -200), 500, k)); gi.scale.setScalar(r * clamp(dt * 3, 0.2, 1));
      plane.visible = true; plane.position.set(lerp(-600, 600, lt / dur), 520, -300); plane.rotation.y = 0;
      setCam(V(-80, 30, 400), V(200, 380, -150), 55); return ts; }
    case 't12': { reset(t); L.cam.far = 200000; ts.fog.far = 40000; ts.fog.near = 2000; const dt = t - A[12]; const r = 7085; const k = clamp(dt / 1.6);
      if (!ts.userData.mtn) { ts.userData.mtn = mesh(new THREE.IcosahedronGeometry(1, 5), snowM, false, false); ts.add(ts.userData.mtn); } const mt = ts.userData.mtn; mt.visible = dt > 0; mt.position.set(2000, lerp(r + 20000, r - 600, ease(k)), -14000); mt.scale.setScalar(r);
      for (let i = 0; i < 60; i++) { const a = -0.5 + (i % 12) * 0.08; const q = ((t * 0.05 + i / 60) % 1); L._m.compose(L._p.set(2000 + Math.sin(a) * r * 1.001 * (0.3 + q * 0.6), r - 600 + Math.cos(a) * r * (1 - q * 0.8) * 1.001, -14000 + r * 0.95), L._q.identity(), L._s.setScalar(dt > 1.8 ? 30 : 0)); skiers.setMatrixAt(i, L._m); } skiers.instanceMatrix.needsUpdate = true;
      if (lt < 2.2) setCam(V(-20, 4, 12), V(500, 900, -5000), 52, dt > 1.2 && dt < 2.0 ? 0.4 : 0, t); else setCam(V(-1500, 2500, 6000), V(2000, 6000, -14000), 50); return ts; }
    case 'worse': { L.cam.far = 4000; resetPose(daleW); daleW.root.rotation.set(0, 0.5, 0); const k = lt / dur; throwPose(daleW, -0.5 + k * 0.45); setFace(daleW, { lid: 0.05, brow: 1, mouth: 0.4 }); setCam(V(0.3, 1.75, lerp(1.9, 1.6, k)), V(0, 1.75, 0), 34, 0.004, t); return wsc; }
    case 'moon': { const dt = t - A[17]; const k = clamp(dt / 2.5); S.earth.position.set(0, 0, 0); S.atmo.position.set(0, 0, 0); S.earth.rotation.y = t * 0.05; daleS.root.visible = false;
      snowMoon.position.copy(V(0, 21, 0).lerp(V(-120, 30, 60), ease(k))); snowMoon.scale.setScalar(clamp(dt * 2, 0.05, 1)); snowMoon.rotation.set(t * 0.2, t * 0.3, 0);
      if (lt < 2.6) setCam(V(30, 30, 70), V(-20, 15, 20), 48, dt > 0 && dt < 0.6 ? 0.8 : 0, t); else setCam(V(-60, 40, 330), V(-60, 15, 30), 50); return S.scene; }
    case 'truce': { reset(t); van.scale.y = 0.35; ts.userData.big.visible = true; ts.userData.big.position.set(10.5, 2.65, 14.2); ts.userData.big.scale.setScalar(3.25); ball.visible = true; ball.position.set(6, 0.35, 12); ball.scale.setScalar(0.35);
      bennySnowman(true); benny.root.position.y = 0.22; setFace(benny, { lid: 0.2, brow: 1, browTilt: -0.2, mouth: Math.abs(Math.sin(t * 12)) * 0.6 }); benny.aR.sh.rotation.set(0, 0, -2.6 + Math.sin(t * 12) * 0.3);
      if (!ts.userData.flag) { const f = box(0.35, 0.25, 0.01, mat(0xffffff)); f.position.set(0, -0.35, 0); benny.aR.grip.add(f); ts.userData.flag = f; }
      setCam(V(3.6, 1.2, 13.4), V(6, 1.25, 12), 40); return ts; }
    case 'fact': { resetPose(daleL); blinkAt(daleL, t); setFace(daleL, { lid: 0.35, brow: 0.4 }); daleL.neckG.rotation.y = 0.5; flake.rotation.set(0.3, t * 0.8, 0); setCam(V(lerp(1.2, 0.9, ease(lt / dur)), 1.6, lerp(3.2, 2.7, ease(lt / dur))), V(0.1, 1.45, 0.2), 40); return lab.scene; }
  }
}
const rungs = [['8', 'cm', 1, 'A NORMAL SNOWBALL', 0.08], ['72', 'cm', 3, 'A KID-SIZED SNOWBALL', 0.72], ['6.5', 'm', 5, 'BIGGER THAN A MINIVAN', 6.5], ['58', 'm', 7, 'A WHOLE STREET', 58], ['525', 'm', 9, 'TALLER THAN SKYSCRAPERS', 525], ['14', 'km', 12, 'TALLER THAN EVEREST', 14171], ['3,444', 'km', 17, 'THE SIZE OF THE MOON', 3443770]]
  .map(([v, unit, n, cmp, raw], i) => ({ v, unit, n, cmp, raw, at: A[n] + 0.2, gold: i === 6 }));
const overlay = L.makeOverlay({ lines: H.LINES, titleL1: 'What if every snowball you threw was', titleHi: '3× bigger', titleL2: ' than the last?', titleSize: 72, hudLabel: r => 'THROW ' + r.n + '   ·   SIZE', rule: '×3 EVERY THROW', rungs, barMin: 0.05, barMax: 5e6, barMarks: [[8849, 'EVEREST'], [3474000, 'MOON']], fact: { big: 'CLEAR', unit: '', sub: 'SNOW LOOKS WHITE: IT SCATTERS ALL COLORS OF LIGHT' }, hideHUD: ['worse', 'fact', 'truce', 'taunt', 'setup'], flashBig: [A[17]], flashSmall: [A[7] + 1.4, A[12] + 1.5] });
L.makeFrame(shots, renderShot, overlay);

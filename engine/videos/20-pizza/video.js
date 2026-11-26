import * as L from '/lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, easeOut, lerp, setCam, rng, makeGuy, setFace, resetPose, blinkAt } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const A = {}; TL.tl.filter(x => x.type === 'act').forEach(x => A[x.n] = x.blast);
const line = H.line;
const talk = (p, t) => { const l = line(p); return t > l.t && t < l.end ? Math.abs(Math.sin(t * 14)) * 0.5 : 0; };
const NS = [1, 3, 5, 7, 9, 11, 17];
const dN = n => 0.3 * Math.pow(3, n - 1);
function diam(t) { let d = 0.3; for (const n of NS) if (t > A[n] - 0.1) d = lerp(d, dN(n), easeOut(clamp((t - A[n] + 0.1) / 0.7))); return d; }
const pizT = L.canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#c8782a'; g.beginPath(); g.arc(256, 256, 256, 0, 7); g.fill(); g.fillStyle = '#d9402a'; g.beginPath(); g.arc(256, 256, 232, 0, 7); g.fill(); g.fillStyle = '#f6d27a'; g.beginPath(); g.arc(256, 256, 222, 0, 7); g.fill(); const r = rng(6); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,240,180,0.6)'; g.beginPath(); g.arc(40 + r() * 432, 40 + r() * 432, 6 + r() * 14, 0, 7); g.fill(); } for (let i = 0; i < 22; i++) { const a = r() * 6.28, d = r() * 180; g.fillStyle = '#b8281e'; g.beginPath(); g.arc(256 + Math.cos(a) * d, 256 + Math.sin(a) * d, 22, 0, 7); g.fill(); g.fillStyle = '#8a1a14'; g.beginPath(); g.arc(256 + Math.cos(a) * d + 4, 256 + Math.sin(a) * d + 4, 6, 0, 7); g.fill(); } });
function makePizza() { const g = new THREE.Group(); const top = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.03, 48), [new THREE.MeshStandardMaterial({ color: 0xc8782a, roughness: 0.8 }), new THREE.MeshStandardMaterial({ map: pizT, roughness: 0.7 }), new THREE.MeshStandardMaterial({ color: 0xb8702a })]); top.position.y = 0.015; g.add(top); return g; } // unit diameter 1
function sizeP(p, d, thick = 1) { p.scale.set(d, Math.max(1, d * 0.02) * thick, d); }
// ---------- pizzeria ----------
const room = L.buildRoom({ wall: 0xf2e6d0, floor: 0xffffff, tiles: true, sky: 0x2a3050, seed: 17, sunI: 0.6 }); const ps = room.scene; room.fill.intensity = 10; room.hemi.intensity = 1.2;
const table = new THREE.Group(); { const top = box(1.2, 0.05, 0.9, mat(0xffffff)); top.position.y = 0.76; table.add(top); const cloth = L.canvasTex(128, 128, (g, w, h) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#ffffff' : '#d9301f'; g.fillRect(x * 16, y * 16, 16, 16); } }); top.material = new THREE.MeshStandardMaterial({ map: cloth }); for (const [x, z] of [[-0.55, -0.4], [0.55, -0.4], [-0.55, 0.4], [0.55, 0.4]]) { const l = box(0.05, 0.74, 0.05, mat(0x3a2a1a)); l.position.set(x, 0.37, z); table.add(l); } } table.position.set(0, 0, -1.2); ps.add(table);
const oven = new THREE.Group(); { const b = mesh(new THREE.SphereGeometry(1.1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xb8582a, { r: 0.9 })); b.position.y = 1.0; oven.add(b); const base = box(2.4, 1.0, 2.0, mat(0x8a8a8a)); base.position.y = 0.5; oven.add(base); const mouth = mesh(new THREE.CircleGeometry(0.4, 16, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0xff8a2a })); mouth.position.set(0, 1.02, 1.05); oven.add(mouth); } oven.position.set(-3.6, 0, -1.8); oven.rotation.y = 0.6; ps.add(oven);
const dale = makeGuy({ ...L.DALE, sit: true }); dale.root.position.set(0, 0.0, -1.85); ps.add(dale.root);
const chef = makeGuy({ wood: 0xd9b08a, shirt: 0xffffff }); chef.root.position.set(-1.2, 0, -0.7); chef.root.rotation.y = 2.4; ps.add(chef.root); { const hat = mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.3, 16), mat(0xffffff)); hat.position.y = 0.45; chef.head.add(hat); const puff = mesh(new THREE.SphereGeometry(0.22, 14, 10), mat(0xffffff)); puff.position.y = 0.62; chef.head.add(puff); }
const pz = makePizza(); ps.add(pz);
// ---------- town ----------
const town = L.buildTown({ sky: 'sunset', seed: 505, low: true, skip: [[0, 0], [-1, 0], [0, -1], [-1, -1]] }); const ts = town.scene;
town.buildings.forEach(B => { const p = B.b.position; if ((Math.abs(p.x) < 14 && Math.abs(p.z) < 14) || (p.x > -5 && p.x < 40 && p.z > -5 && p.z < 45)) B.b.visible = false; });
const shop = new THREE.Group(); { const b = box(10, 4.5, 8, mat(0xf2e6d0)); b.position.y = 2.25; shop.add(b); const aw = box(9.4, 0.15, 1.4, mat(0xd9301f)); aw.position.set(0, 3.3, 4.5); aw.rotation.x = 0.25; shop.add(aw); const sign = mesh(new THREE.PlaneGeometry(5, 1), new THREE.MeshBasicMaterial({ map: L.canvasTex(512, 102, (g, w, h) => { g.fillStyle = '#2a8a3a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.font = 'bold 64px "Archivo Black"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PIZZA', w / 2, h / 2 + 4); }) })); sign.position.set(0, 4.0, 4.02); shop.add(sign); } shop.position.set(0, 0, -2); ts.add(shop);
const pzT = makePizza(); ts.add(pzT);
const dust = L.makePuff(ts, 60, 0xd8c090, 0.7, 5);
// ---------- space ----------
const S = L.buildSpace(); const pzS = makePizza(); S.scene.add(pzS);
// ---------- worse / lab ----------
const wsc = new THREE.Scene(); wsc.background = new THREE.Color(0x14060a); const wl = new THREE.PointLight(0xff3020, 30, 12, 2); wl.position.set(0.8, 2.0, 2.0); wsc.add(wl); wsc.add(new THREE.AmbientLight(0x200810, 1)); const daleW = makeGuy({ ...L.DALE, sit: true }); wsc.add(daleW.root);
const lab = L.buildLab({ bg: 0xf4ece0, floor: 0xe4dcd0 }); const daleL = makeGuy({ ...L.DALE }); daleL.root.position.set(-0.6, 0, 0); lab.scene.add(daleL.root); { const p = makePizza(); p.scale.set(0.9, 1, 0.9); p.position.set(0.6, 0.82, -0.1); p.rotation.x = 0.5; lab.scene.add(p); const st = box(0.6, 0.8, 0.5, mat(0xd8d8d8)); st.position.set(0.6, 0.4, -0.2); lab.scene.add(st); }

function roomReset(t) { room.roofOff(false); room.walls.visible = true; resetPose(dale); dale.root.rotation.set(0, 0, 0); blinkAt(dale, t); resetPose(chef); blinkAt(chef, t + 1); chef.root.position.set(-1.2, 0, -0.7); chef.root.rotation.y = 2.4; table.visible = true; }
function shots() {
  const L2 = H.LINES[1].t, del = line('Delivery').t;
  return [['establish', 0, L2], ['setup', L2, A[1] - 0.7], ['p1', A[1] - 0.7, A[3] - 0.6], ['p3', A[3] - 0.6, A[5] - 0.5], ['p5', A[5] - 0.5, A[7] - 0.5], ['p7', A[7] - 0.5, A[9] - 0.5], ['p9', A[9] - 0.5, A[11] - 0.5], ['p11', A[11] - 0.5, H.worse.t], ['worse', H.worse.t, A[17] - 0.4], ['space', A[17] - 0.4, del], ['end', del, H.fact.t], ['fact', H.fact.t, TL.dur + 1]];
}
function renderShot(name, lt, dur, t) {
  L.cam.far = 60000; const d = diam(t);
  switch (name) {
    case 'establish': { pzT.visible = false; L.hideAll(dust); shop.visible = true; ts.fog.near = 60; ts.fog.far = 260; const k = ease(lt / dur); setCam(V(lerp(17, 14, k), lerp(5, 4, k), lerp(26, 22, k)), V(0, 2.6, -2), 46); return ts; }
    case 'setup': { roomReset(t); pz.visible = false; setFace(dale, { lid: 0.3, brow: 0.6, browTilt: 0.2, mouth: 0.1 }); setFace(chef, { lid: 0.4, brow: 0.5, mouth: talk('One large', t) }); const o = line('One large'); if (t > o.t - 0.2) setCam(V(-0.45, 1.85, -2.6), V(-1.2, 1.65, -0.7), 44); else setCam(V(0.5, 1.4, 1.2), V(0, 1.0, -1.6), 46); return ps; }
    case 'p1': case 'p3': { roomReset(t); const n = +name.slice(1); pz.visible = t > A[1] - 0.2; const dd = n === 1 ? Math.min(d, 0.3) : d; sizeP(pz, dd); pz.position.set(0, 0.785, -1.2 + Math.max(0, dd - 0.9) * 0.25); setFace(dale, n === 1 ? { lid: 0.2, brow: 0.6, mouth: 0.4 } : { lid: 0.0, brow: 1, mouth: 0.5 }); dale.aR.sh.rotation.set(-1.0, 0, -0.1);
      if (n === 1) setCam(V(0.5, 1.5, 1.2), V(0, 1.0, -1.5), 44); else setCam(V(1.8, 2.2, 1.6), V(0, 0.8, -1.2), 50, t > A[3] && t < A[3] + 0.3 ? 0.01 : 0, t); return ps; }
    case 'p5': { const dt = t - A[5]; pzT.visible = true; sizeP(pzT, d, 0.6); pzT.position.set(0, 4.5 + 0.2, -2); shop.visible = true; L.puffAt(dust, V(0, 4.5, -2), V(0, 1, 0), dt - 0.2, 8, 2.5); ts.fog.near = 60; ts.fog.far = 260; setCam(V(18, 6, 28), V(0, 4, -2), 50, dt > 0.2 && dt < 0.6 ? 0.1 : 0, t); return ts; }
    case 'p7': case 'p9': case 'p11': { const n = +name.slice(1); const dt = t - A[n]; pzT.visible = true; sizeP(pzT, d, 0.4); pzT.position.set(0, n === 7 ? 4.8 : 10, -2); shop.visible = n === 7 ? d < 60 : false; ts.fog.near = 400; ts.fog.far = n === 11 ? 30000 : 6000; L.puffAt(dust, V(0, 5, -2), V(0, 1, 0), dt - 0.2, n === 7 ? 30 : 200, 2.5);
      const D = dN(n); setCam(V(D * 0.55, D * 0.42, D * 0.85), V(0, 0, -2), 50, dt > 0.2 && dt < 0.8 ? D * 0.003 : 0, t); return ts; }
    case 'worse': { resetPose(daleW); daleW.root.rotation.set(0, 0.2, 0); setFace(daleW, { lid: 0.1, brow: 1, mouth: 0.6 }); setCam(V(0.2, 1.3, lerp(1.6, 1.3, lt / dur)), V(0, 1.2, 0), 36, 0.006, t); return wsc; }
    case 'space': { const dt = t - A[17]; S.earth.rotation.y = 0.3; S.moon.position.set(140, 20, -160); const k = easeOut(clamp(dt / 1.4)); const dS = lerp(2, 41, k); pzS.scale.set(dS, Math.max(0.5, dS * 0.02), dS); pzS.position.set(48, 0, -10); pzS.rotation.set(0.9, 0, 0.3);
      setCam(V(lerp(30, 20, k), lerp(30, 40, k), lerp(110, 130, k)), V(24, 0, -5), 50, dt > 0 && dt < 0.8 ? 0.3 : 0, t); return S.scene; }
    case 'end': { roomReset(t); pz.visible = true; sizeP(pz, 0.3); pz.position.set(0, 0.785, -1.2); room.walls.visible = false; ps.background.set(0xf6d27a); setFace(dale, { lid: 0.3, brow: 0.6, browTilt: 0.2, mouth: talk('Can I get', t) }); dale.aR.sh.rotation.set(-1.7, 0, -0.2);
      setCam(V(0.4, 1.4, 0.6), V(0, 1.05, -1.6), 46); return ps; }
    case 'fact': { resetPose(daleL); daleL.root.rotation.y = 0.3; setFace(daleL, { lid: 0.35, brow: 0.3 }); blinkAt(daleL, t); const k = ease(lt / dur); setCam(V(lerp(1.3, 1.0, k), 1.5, lerp(3.6, 3.2, k)), V(0.0, 1.25, 0), 46); return lab.scene; }
  }
}
const rungs = [['30', 'cm', 1, 'A NORMAL PIZZA', 0.3], ['2.7', 'm', 3, 'BIGGER THAN THE TABLE', 2.7], ['24', 'm', 5, 'DOESN’T FIT THE DOOR', 24.3], ['219', 'm', 7, '2 FOOTBALL FIELDS', 219], ['2', 'km', 9, 'A WHOLE NEIGHBORHOOD', 1968], ['18', 'km', 11, 'THE WHOLE CITY', 17714], ['12,900', 'km', 17, 'WIDER THAN THE EARTH', 1.29e7]]
  .map(([v, unit, n, cmp, raw], i) => ({ v, unit, n, cmp, raw, at: A[n], gold: i === 6 }));
const overlay = L.makeOverlay({ lines: H.LINES, titleL1: 'What if every pizza was', titleHi: '3× bigger', titleL2: ' than the last?', titleSize: 80, hudLabel: r => 'ORDER ' + r.n + '   ·   DIAMETER', rule: '×3 EVERY ORDER', rungs, barMin: 0.1, barMax: 5e7, barMarks: [[40, 'RECORD'], [1.274e7, 'EARTH']], fact: { big: '~40', unit: 'm', sub: 'ROME · 2012' }, hideHUD: ['worse', 'fact', 'end', 'setup'], flashBig: [A[17]], flashSmall: [A[5]] });
L.makeFrame(shots, renderShot, overlay);

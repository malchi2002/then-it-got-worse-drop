import * as L from '/lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, easeOut, lerp, setCam, rng, makeGuy, setFace, resetPose, blinkAt } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const A = {}; TL.tl.filter(x => x.type === 'act').forEach(x => A[x.n] = x.blast);
const line = H.line;
const talk = (p, t) => { const l = line(p); return t > l.t && t < l.end ? Math.abs(Math.sin(t * 14)) * 0.5 : 0; };
const NS = [1, 3, 4, 5, 6, 7, 13];
const lvl = t => NS.filter(n => t > A[n]).length; // 0..7
// heat 0..1 by level
const HEAT = [0, 0, 0.25, 0.45, 0.65, 0.8, 0.9, 1];
const heatAt = t => { const l = lvl(t); const n = NS[l - 1]; const k = n ? easeOut(clamp((t - A[n]) / 0.6)) : 1; return lerp(HEAT[Math.max(0, l - 1)] ?? 0, HEAT[l], k); };
const glowTex = L.canvasTex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,230,160,0.8)'); gr.addColorStop(0.6, 'rgba(255,140,40,0.25)'); gr.addColorStop(1, 'rgba(255,80,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
function glowSprite(s) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); sp.scale.setScalar(s); return sp; }
function heatColor(h) { const c = new THREE.Color(); if (h < 0.5) c.setRGB(lerp(0.25, 1, h * 2), lerp(0.12, 0.45, h * 2), 0.05); else c.setRGB(1, lerp(0.45, 1, (h - 0.5) * 2), lerp(0.05, 1, (h - 0.5) * 2)); return c; }
// ---------- café ----------
const room = L.buildRoom({ wall: 0x6a4a3a, floor: 0x8a5a3a, sky: 0xbfe0ff, seed: 9 }); const cs = room.scene;
const counter = box(0.7, 1.05, 4, mat(0x3a2a22)); counter.position.set(-3.8, 0.525, 0.5); cs.add(counter); const ctop = box(0.8, 0.06, 4.1, mat(0xd8d0c4, { r: 0.3 })); ctop.position.set(-3.8, 1.08, 0.5); cs.add(ctop);
const machine = new THREE.Group(); { const b = box(0.6, 0.5, 0.45, mat(0xb8bcc4, { m: 0.8, r: 0.3 })); b.position.y = 0.25; machine.add(b); for (const z of [-0.1, 0.1]) { const g = box(0.06, 0.12, 0.06, mat(0x222222)); g.position.set(0.25, 0.1, z); machine.add(g); } } machine.position.set(-3.8, 1.11, -0.6); cs.add(machine);
const menu = mesh(new THREE.PlaneGeometry(2.2, 1.0), new THREE.MeshStandardMaterial({ map: L.canvasTex(512, 232, (g, w, h) => { g.fillStyle = '#1c1a18'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2ead8'; g.font = 'bold 40px "Archivo Black"'; g.fillText('COFFEE', 30, 60); g.font = '600 26px Inter'; ['ESPRESSO ...... 3', 'LATTE ......... 4', 'MOCHA ......... 4'].forEach((s, i) => g.fillText(s, 30, 110 + i * 40)); }) })); menu.position.set(-4.88, 2.3, 0.5); menu.rotation.y = Math.PI / 2; cs.add(menu);
const table = new THREE.Group(); { const top = mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.04, 24), mat(0xe8e0d4, { r: 0.4 })); top.position.y = 0.74; table.add(top); const leg = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.72, 10), mat(0x222222)); leg.position.y = 0.36; table.add(leg); const base = mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.03, 16), mat(0x222222)); table.add(base); } table.position.set(0.3, 0, -1.2); cs.add(table);
const chair = new THREE.Group(); { const s = box(0.45, 0.05, 0.45, mat(0x4a2a1a)); s.position.y = 0.45; chair.add(s); const b = box(0.45, 0.5, 0.05, mat(0x4a2a1a)); b.position.set(0, 0.72, -0.22); chair.add(b); for (const [x, z] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) { const l = box(0.04, 0.45, 0.04, mat(0x2a1a10)); l.position.set(x, 0.225, z); chair.add(l); } } chair.position.set(0.3, 0, -1.85); cs.add(chair);
const dale = makeGuy({ ...L.DALE, sit: true }); dale.root.position.set(0.3, 0, -1.8); cs.add(dale.root);
const mug = new THREE.Group(); const mugM = new THREE.MeshStandardMaterial({ color: 0xf4f0ea, roughness: 0.4, emissive: 0x000000 }); { const b = mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.11, 18, 1, true), mugM); mug.add(b); const bot = mesh(new THREE.CircleGeometry(0.05, 18), mugM); bot.rotation.x = -Math.PI / 2; bot.position.y = -0.055; mug.add(bot); const h = mesh(new THREE.TorusGeometry(0.03, 0.01, 6, 12, Math.PI), mugM); h.position.x = 0.06; h.rotation.z = -Math.PI / 2; mug.add(h); }
const coffeeM = new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 0.2, emissive: 0x000000 }); const cof = mesh(new THREE.CircleGeometry(0.052, 18), coffeeM); cof.rotation.x = -Math.PI / 2; cof.position.y = 0.04; mug.add(cof);
const mugGlow = glowSprite(0.5); mug.add(mugGlow); const mugLight = new THREE.PointLight(0xffa040, 0, 8, 1.6); mug.add(mugLight);
dale.aR.grip.add(mug); mug.position.set(0, -0.02, 0.06);
const spoon = new THREE.Group(); { const s = box(0.012, 0.004, 0.14, mat(0xd0d4da, { m: 0.9, r: 0.2 })); spoon.add(s); } spoon.position.set(0.55, 0.765, -1.15); cs.add(spoon);
const drip = L.makeInstanced(new THREE.SphereGeometry(0.012, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffb060 }), 8); cs.add(drip);
const steam = L.makePuff(cs, 30, 0xffffff, 0.45, 4);
const barista = makeGuy({ wood: 0xd9b08a, hair: 0x1a1010, shirt: 0x2a5a4a }); barista.root.position.set(-4.4, 0, 0.4); barista.root.rotation.y = Math.PI / 2; cs.add(barista.root);
const roomGlow = glowSprite(4); roomGlow.position.set(0.3, 1.2, -1.6); cs.add(roomGlow);
const shards = L.makeInstanced(new THREE.PlaneGeometry(0.12, 0.12), new THREE.MeshStandardMaterial({ color: 0xcfeeff, transparent: true, opacity: 0.8, side: THREE.DoubleSide }), 60); cs.add(shards);
const shardD = L.debrisData(4, 60, r => ({ p0: V((r() - 0.5) * 3.2, 0.9 + r() * 1.7, -3), v: V((r() - 0.5) * 3, 1 + r() * 2, -3 - r() * 5) }));
// ---------- street ----------
const town = L.buildTown({ sky: 'day', seed: 88, low: true, skip: [[0, 0], [-1, 0], [0, -1], [-1, -1]] }); const ts = town.scene;
town.buildings.forEach(B => { const p = B.b.position; if (Math.abs(p.x) < 14 && Math.abs(p.z) < 14) B.b.visible = false; });
const cafe = new THREE.Group(); { const b = box(10, 5, 8, mat(0x8a4a32)); b.position.y = 2.5; cafe.add(b); const aw = box(9, 0.15, 1.6, mat(0x2a7a5a)); aw.position.set(0, 3.2, 4.6); aw.rotation.x = 0.25; cafe.add(aw); const sign = mesh(new THREE.PlaneGeometry(5, 1), new THREE.MeshBasicMaterial({ map: L.canvasTex(512, 102, (g, w, h) => { g.fillStyle = '#f2ead8'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a2010'; g.font = 'bold 64px "Archivo Black"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CAFÉ', w / 2, h / 2 + 4); }) })); sign.position.set(0, 4.2, 4.02); cafe.add(sign); }
cafe.position.set(0, 0, -4); ts.add(cafe);
const winM = new THREE.MeshBasicMaterial({ color: 0xfff0c0 }); const wins = []; for (const x of [-3, 0, 3]) { const w = mesh(new THREE.PlaneGeometry(2.2, 1.6), winM); w.position.set(x, 1.6, 0.03); ts.add(w); wins.push(w); }
const cafeGlow = glowSprite(30); cafeGlow.position.set(0, 2, 1); ts.add(cafeGlow);
const glassT = L.makeInstanced(new THREE.PlaneGeometry(0.3, 0.3), new THREE.MeshStandardMaterial({ color: 0xcfeeff, transparent: true, opacity: 0.85, side: THREE.DoubleSide }), 80); ts.add(glassT);
const glassTD = L.debrisData(6, 80, r => ({ p0: V((r() - 0.5) * 9, 1 + r() * 1.5, 0.2), v: V((r() - 0.5) * 10, 2 + r() * 5, 6 + r() * 10) }));
// ---------- storm ----------
const town2 = L.buildTown({ sky: 'night', seed: 12, low: true }); const st = town2.scene; st.fog = new THREE.Fog(0x101828, 40, 500);
const bolt = new THREE.Group(); { const pts = []; const r = rng(4); let p = V(0, 300, 0); for (let i = 0; i < 14; i++) { pts.push(p.clone()); p = p.clone().add(V((r() - 0.5) * 30, -300 / 14, (r() - 0.5) * 30)); } pts.push(V(0, 0, 0)); for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; const len = a.distanceTo(b); const c = mesh(new THREE.CylinderGeometry(0.8, 0.8, len, 6), new THREE.MeshBasicMaterial({ color: 0xdfe8ff }), false, false); c.position.copy(a).lerp(b, 0.5); c.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()); bolt.add(c); } } st.add(bolt);
const stormGlow = glowSprite(60); stormGlow.position.set(40, 4, -20); st.add(stormGlow); const stormLight = new THREE.PointLight(0xfff4e0, 0, 300, 1.2); stormLight.position.set(40, 6, -20); st.add(stormLight);
// ---------- space ----------
const S = L.buildSpace(); const earthGlow = glowSprite(26); S.scene.add(earthGlow); const SPOT = V(0.35, 0.5, 0.8).normalize().multiplyScalar(20.3); earthGlow.position.copy(SPOT);
// ---------- worse / lab ----------
const wsc = new THREE.Scene(); wsc.background = new THREE.Color(0x14060a); const wl = new THREE.PointLight(0xff3020, 30, 12, 2); wl.position.set(0.8, 2.0, 2.0); wsc.add(wl); wsc.add(new THREE.AmbientLight(0x200810, 1)); const daleW = makeGuy({ ...L.DALE, sit: true }); wsc.add(daleW.root);
const lab = L.buildLab({ bg: 0xf0e8e0, floor: 0xe2d8cc }); const daleL = makeGuy({ ...L.DALE }); daleL.root.position.set(-0.6, 0, 0); lab.scene.add(daleL.root);
const mugL = mug.clone(); mugL.scale.setScalar(3); mugL.position.set(0.5, 0.95, -0.1); lab.scene.add(mugL); { const st2 = box(0.4, 0.8, 0.4, mat(0xd8d8d8)); st2.position.set(0.5, 0.4, -0.1); lab.scene.add(st2); }
const therm = new THREE.Group(); { const t = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 10), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })); t.position.y = 0.25; therm.add(t); const red = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 8), mat(0xd9301f)); red.position.y = 0.21; therm.add(red); const b = mesh(new THREE.SphereGeometry(0.03, 10, 8), mat(0xd9301f)); therm.add(b); } therm.position.set(0.53, 1.05, -0.1); therm.rotation.z = -0.25; lab.scene.add(therm);

function heatScene(t) { const h = heatAt(t); const c = heatColor(h); mugM.emissive.copy(c).multiplyScalar(h); coffeeM.emissive.copy(c).multiplyScalar(h * 1.5); mugGlow.visible = h > 0.05; mugGlow.scale.setScalar(0.2 + h * 1.6); mugLight.intensity = h * h * 40; mugLight.color.copy(c);
  roomGlow.visible = h > 0.55; roomGlow.scale.setScalar(lerp(1, 9, clamp((h - 0.55) / 0.35))); return h; }
function cafeReset(t) { room.roofOff(false); resetPose(dale); dale.root.rotation.set(0, 0, 0); blinkAt(dale, t); dale.aR.sh.rotation.set(-0.9, 0, -0.15); dale.aR.el.rotation.set(-1.1, 0, 0); resetPose(barista); L.hideAll(drip); L.hideAll(shards); L.puffAt(steam, V(0.3, 1.15, -1.45), V(0, 1, 0), (t % 1.5), 0.3, 1.5); room.walls.visible = true; cs.background.set(0xbfe0ff); spoon.scale.set(1, 1, 1); spoon.visible = true; }
function sip(t) { const n = NS.find(n => t > A[n] - 0.7 && t < A[n] + 0.15); if (n !== undefined) { const k = Math.sin(clamp((t - A[n] + 0.7) / 0.85) * Math.PI); dale.aR.sh.rotation.x = -0.9 - 0.7 * k; dale.aR.el.rotation.x = -1.1 - 0.6 * k; dale.neckG.rotation.x = -0.25 * k; } }
function shots() {
  const L2 = H.LINES[1].t, blow = line('Dale blows').t;
  return [['establish', 0, L2], ['setup', L2, A[1] - 0.9], ['c1', A[1] - 0.9, A[3] - 0.8], ['c3', A[3] - 0.8, A[4] - 0.8], ['c4', A[4] - 0.8, A[5] - 0.8], ['c5', A[5] - 0.8, A[6] - 0.4], ['c6', A[6] - 0.4, A[7] - 0.4], ['c7', A[7] - 0.4, H.worse.t], ['worse', H.worse.t, A[13] - 0.4], ['space', A[13] - 0.4, blow], ['end', blow, H.fact.t], ['fact', H.fact.t, TL.dur + 1]];
}
const FRONT = (d, y, x = 0) => [V(0.3 + x, y + 0.1, -1.8 + d * 2), V(0.3, 1.0, -1.8)];
function renderShot(name, lt, dur, t) {
  L.cam.far = 4000;
  switch (name) {
    case 'establish': { winM.color.set(0xfff0c0); cafeGlow.visible = false; L.hideAll(glassT); cafe.visible = true; const k = ease(lt / dur); setCam(V(lerp(10, 7, k), lerp(4, 3, k), lerp(20, 16, k)), V(0, 2.4, -3), 48); return ts; }
    case 'setup': { cafeReset(t); heatScene(t); setFace(dale, { lid: 0.3, brow: 0.6, browTilt: 0.2 }); setFace(barista, { lid: 0.45, brow: 0.3, mouth: talk('Careful', t) }); const c = line('Careful'); if (t > c.t - 0.3) { barista.root.rotation.y = Math.PI / 2 - 0.5; setCam(V(-2.0, 1.6, 1.0), V(-4.4, 1.45, 0.4), 44); } else setCam(...FRONT(1.6, 1.45, 0.4), 44); return cs; }
    case 'c1': case 'c3': case 'c4': { cafeReset(t); sip(t); const h = heatScene(t); const n = +name.slice(1);
      if (n === 1) setFace(dale, t > A[1] ? { lid: 0.6, brow: 0.2, mouth: 0.1 } : { lid: 0.3, brow: 0.5 });
      if (n === 3) setFace(dale, { lid: 0.15, brow: 0.8, mouth: 0.2 });
      if (n === 4) { setFace(dale, { lid: 0.0, brow: 1, mouth: 0.4 }); const q = clamp((t - A[4] - 0.3) / 1.2); spoon.scale.set(1 + q * 0.5, 1, 1 - q * 0.6); for (let i = 0; i < 8; i++) { const f = ((t * 1.5 + i / 8) % 1); L._m.compose(V(0.55 + (i % 3 - 1) * 0.03, 0.74 - f * 0.7, -1.15 + (i % 2) * 0.03), L._q.identity(), L._s.setScalar(q > 0.2 ? 1 : 0)); drip.setMatrixAt(i, L._m); } drip.instanceMatrix.needsUpdate = true; }
      if (n === 4) setCam(V(1.3, 1.25, -0.5), V(0.45, 0.85, -1.4), 44); else setCam(...FRONT(n === 1 ? 1.5 : 1.3, 1.4, n === 3 ? -0.4 : 0.3), 44, t > A[n] && t < A[n] + 0.4 ? 0.006 : 0, t); return cs; }
    case 'c5': { cafeReset(t); sip(t); const h = heatScene(t); spoon.visible = false; setFace(dale, { lid: 0.0, brow: 1, mouth: 0.6 }); setFace(barista, { lid: 0, brow: 1, mouth: 0.6 }); barista.aL.sh.rotation.set(-2.2, 0, 0.3); barista.root.rotation.y = Math.PI / 2 - 0.5;
      cs.background.setRGB(1, 0.95, 0.85); setCam(V(1.8, 1.6, 1.8), V(-0.6, 1.1, -1.2), 54, 0.01, t); return cs; }
    case 'c6': { const dt = t - A[6]; winM.color.set(0xffffff); cafeGlow.visible = true; cafeGlow.scale.setScalar(lerp(8, 20, clamp(dt / 0.6))); wins.forEach(w => w.visible = dt < 0); L.debrisAt(glassT, glassTD, dt, 9.8, 0.2); setCam(V(9, 2.6, 18), V(0, 2.2, -1), 46, dt > 0 && dt < 0.6 ? 0.25 : 0, t); return ts; }
    case 'c7': { const dt = t - A[7]; bolt.visible = dt > -0.05 && dt < 0.5 && Math.floor(dt * 20) % 3 !== 2; bolt.position.set(40, 0, -20); stormLight.intensity = dt > 0 ? 400 * Math.exp(-dt * 3) + 60 : 60; stormGlow.scale.setScalar(dt > 0 ? lerp(40, 80, clamp(dt)) : 40); L.shockwave(town2, V(40, 0, -20), dt, 50, 2);
      st.background = new THREE.Color(dt > 0 && dt < 0.15 ? 0xbfc8ff : 0x101828); setCam(V(120, 30, 120), V(40, 40, -20), 52, dt > 0 && dt < 0.6 ? 0.6 : 0, t); return st; }
    case 'worse': { resetPose(daleW); daleW.root.rotation.set(0, 0.2, 0); daleW.aR.sh.rotation.set(-1.2, 0, -0.15); daleW.aR.el.rotation.set(-1.2, 0, 0); setFace(daleW, { lid: 0.2, brow: 0.6, mouth: 0.1 }); setCam(V(0.2, 1.3, lerp(1.6, 1.3, lt / dur)), V(0, 1.2, 0), 36, 0.006, t); return wsc; }
    case 'space': { const dt = t - A[13]; S.earth.rotation.y = 0; S.moon.position.set(140, 20, -160); earthGlow.scale.setScalar(dt > 0 ? lerp(4, 40, easeOut(clamp(dt / 1.2))) : 2); earthGlow.material.opacity = 1;
      if (lt < 1.6) setCam(SPOT.clone().normalize().multiplyScalar(70).add(V(-20, 10, 0)), V(0, 0, 0), 46, dt > 0 && dt < 0.8 ? 0.4 : 0, t); else { const k = ease(clamp((lt - 1.6) / 2)); setCam(V(lerp(-80, -60, k), 40, lerp(160, 120, k)), V(40, 10, -40), 50); } return S.scene; }
    case 'end': { cafeReset(t); L.hideAll(steam); heatScene(A[7] + 1); roomGlow.visible = false; mugGlow.scale.setScalar(0.5); mugLight.intensity = 6; room.walls.visible = false; cs.background.set(0x2a2a30); dale.aR.sh.rotation.set(-1.5, 0, -0.15); dale.aR.el.rotation.set(-1.6, 0, 0); const b = line('Dale blows'); const blowing = t > b.t + 0.3 && t < b.end + 0.4; setFace(dale, { lid: 0.4, brow: 0.3, mouth: blowing ? 0.15 : talk('Still', t) }); dale.neckG.rotation.x = blowing ? 0.1 : 0;
      setCam(...FRONT(1.4, 1.4, 0.2), 46); return cs; }
    case 'fact': { resetPose(daleL); daleL.root.rotation.y = 0.3; setFace(daleL, { lid: 0.35, brow: 0.3 }); blinkAt(daleL, t); const k = ease(lt / dur); setCam(V(lerp(1.3, 1.0, k), 1.5, lerp(3.6, 3.2, k)), V(0.0, 1.25, 0), 46); return lab.scene; }
  }
}
const rungs = [['60', '°C', 1, 'PERFECT', 60], ['540', '°C', 3, 'HOTTER THAN A PIZZA OVEN', 540], ['1,620', '°C', 4, 'MELTS STEEL', 1620], ['4,860', '°C', 5, 'ALMOST THE SUN’S SURFACE', 4860], ['14,580', '°C', 6, '2.5× THE SUN’S SURFACE', 14580], ['43,740', '°C', 7, 'HOTTER THAN LIGHTNING', 43740], ['31.9 M', '°C', 13, '2× THE SUN’S CORE', 3.19e7]]
  .map(([v, unit, n, cmp, raw], i) => ({ v, unit, n, cmp, raw, at: A[n], gold: i === 6 }));
const overlay = L.makeOverlay({ lines: H.LINES, titleL1: 'What if every sip made your coffee', titleHi: '3× hotter', titleL2: '?', titleSize: 74, hudLabel: r => 'SIP ' + r.n + '   ·   TEMPERATURE', rule: '×3 EVERY SIP', rungs, barMin: 20, barMax: 1e8, barMarks: [[5500, 'SUN'], [1.5e7, 'CORE']], fact: { big: '90–96', unit: '°C', sub: 'BEST BREWING TEMPERATURE' }, hideHUD: ['worse', 'fact', 'end', 'setup'], flashBig: [A[13]], flashSmall: [A[6]] });
L.makeFrame(shots, renderShot, overlay);

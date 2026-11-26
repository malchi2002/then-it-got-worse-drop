import * as L from '/lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, easeOut, lerp, setCam, rng, makeGuy, setFace, resetPose, blinkAt } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const A = {}; TL.tl.filter(x => x.type === 'act').forEach(x => A[x.n] = x.blast);
const line = H.line;
const talk = (p, t) => { const l = line(p); return t > l.t && t < l.end ? Math.abs(Math.sin(t * 14)) * 0.5 : 0; };
const NS = [1, 3, 5, 7, 9, 11, 13, 17];
const lvl = t => NS.filter(n => t > A[n]).length;
const LABELS = ['MON 6:00', '+9 MIN', '+81 MIN', '+12 HRS', '+4.5 DAYS', '+41 DAYS', '+1 YEAR', '+9 YEARS', 'YEAR 2762'];
// clock texture
const cc = document.createElement('canvas'); cc.width = 512; cc.height = 200; const cT = new THREE.CanvasTexture(cc); cT.colorSpace = THREE.SRGBColorSpace; let lastL = '';
function drawClock(s, blink) { const k = s + (blink ? '1' : '0'); if (k === lastL) return; lastL = k; const g = cc.getContext('2d'); g.fillStyle = '#100808'; g.fillRect(0, 0, 512, 200); g.fillStyle = blink ? '#ff3a2a' : '#5a1a14'; let fs = 110; g.font = `bold ${fs}px "Archivo Black"`; while (g.measureText(s).width > 480) { fs -= 6; g.font = `bold ${fs}px "Archivo Black"`; } g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, 256, 104); cT.needsUpdate = true; }
// ---------- bedroom ----------
const room = L.buildRoom({ wall: 0x8aa0c8, floor: 0x9b6b45, sky: 0xbfe0ff, seed: 25, sunI: 2.4 }); const bs = room.scene;
const bed = new THREE.Group(); { const fr = box(1.3, 0.35, 2.2, mat(0x6a4a2a)); fr.position.y = 0.2; bed.add(fr); const mt = box(1.25, 0.2, 2.1, mat(0xf4f4f4)); mt.position.y = 0.47; bed.add(mt); const hb = box(1.3, 0.9, 0.08, mat(0x6a4a2a)); hb.position.set(0, 0.65, -1.1); bed.add(hb); const pil = box(0.7, 0.14, 0.4, mat(0xffffff)); pil.position.set(0, 0.62, -0.85); bed.add(pil); const bl = box(1.3, 0.12, 1.5, mat(0x3a6ab0)); bl.position.set(0, 0.62, 0.25); bed.add(bl); bed.userData.blanket = bl; } bed.position.set(0, 0, -1.4); bed.rotation.y = Math.PI / 2; bs.add(bed);
const dale = makeGuy({ ...L.DALE }); bs.add(dale.root);
const stand = box(0.5, 0.55, 0.45, mat(0x5a3a22)); stand.position.set(-0.85, 0.275, -2.4); bs.add(stand);
const clock = new THREE.Group(); { const b = box(0.3, 0.14, 0.12, mat(0x1a1a1a)); clock.add(b); const sc = mesh(new THREE.PlaneGeometry(0.26, 0.1), new THREE.MeshBasicMaterial({ map: cT })); sc.position.z = 0.061; clock.add(sc); } clock.position.set(-0.85, 0.62, -2.3); bs.add(clock);
const phone = new THREE.Group(); { const p = box(0.08, 0.01, 0.16, mat(0x111111)); phone.add(p); const badge = mesh(new THREE.CircleGeometry(0.03, 16), new THREE.MeshBasicMaterial({ color: 0xff2a2a })); badge.rotation.x = -Math.PI / 2; badge.position.set(0.03, 0.007, -0.06); phone.add(badge); } phone.position.set(-0.68, 0.555, -2.45); bs.add(phone);
const vines = L.makeInstanced(new THREE.IcosahedronGeometry(0.12, 0), mat(0x3a8a3a), 400); bs.add(vines); const vineD = []; { const r = rng(7); for (let i = 0; i < 400; i++) { const wall = r(); let p; if (wall < 0.4) p = V((r() - 0.5) * 9, r() * 3.1, -2.85); else if (wall < 0.7) p = V(-4.85, r() * 3.1, -2.5 + r() * 6); else p = V((r() - 0.5) * 9, 0.05, -2.5 + r() * 5); vineD.push([p, r()]); } }
const party = new THREE.Group(); { const cols = [0xd9301f, 0xffd23f, 0x2ab0e8, 0x3ad06a]; for (let i = 0; i < 6; i++) { const b = mesh(new THREE.SphereGeometry(0.18, 14, 10), mat(cols[i % 4], { r: 0.3 })); b.scale.y = 1.2; b.position.set(1.6 + (i % 3) * 0.35, 2.2 + Math.floor(i / 3) * 0.4, -2.2 + (i % 2) * 0.3); party.add(b); } const cake = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.18, 20), mat(0xf6e0c0)); cake.position.set(-0.95, 0.64, -2.5); party.add(cake); const cand = mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.08, 6), mat(0x2ab0e8)); cand.position.set(-0.95, 0.77, -2.5); party.add(cand); } bs.add(party);
const tree = new THREE.Group(); { const tk = mesh(new THREE.CylinderGeometry(0.25, 0.4, 3.4, 10), mat(0x5a3a22)); tk.position.y = 1.7; tree.add(tk); for (let i = 0; i < 5; i++) { const br = mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.2, 6), mat(0x5a3a22)); br.position.set(Math.cos(i) * 0.4, 2.2 + i * 0.2, Math.sin(i) * 0.4); br.rotation.set(Math.sin(i) * 0.9, 0, Math.cos(i) * 0.9); tree.add(br); } const crown = mesh(new THREE.IcosahedronGeometry(1.3, 1), mat(0x3a7a2a)); crown.position.y = 3.3; crown.scale.y = 0.4; tree.add(crown); } tree.position.set(0.6, 0, -1.4); bs.add(tree);
const dust = L.makeInstanced(new THREE.PlaneGeometry(0.4, 0.4), new THREE.MeshBasicMaterial({ color: 0xcfcfcf, transparent: true, opacity: 0.35, side: THREE.DoubleSide }), 30); bs.add(dust); { const r = rng(2); for (let i = 0; i < 30; i++) { L._m.compose(V((r() - 0.5) * 8, 0.6 + r() * 2.4, -2.8 + r() * 4), L._q.setFromEuler(L._e.set(r() * 3, r() * 3, 0)), L._s.setScalar(1)); dust.setMatrixAt(i, L._m); } dust.instanceMatrix.needsUpdate = true; }
const future = new THREE.Group(); { const r = rng(12); for (let i = 0; i < 26; i++) { const h = 6 + r() * 26; const b = box(1.2 + r() * 1.5, h, 1.2, new THREE.MeshStandardMaterial({ color: 0x2a2a4a, emissive: new THREE.Color().setHSL(0.5 + r() * 0.35, 0.9, 0.35), emissiveIntensity: 0.6 })); b.position.set(-14 + i * 1.15, h / 2 - 1, -14 - r() * 10); future.add(b); } for (let i = 0; i < 6; i++) { const car = box(1.2, 0.3, 0.6, new THREE.MeshBasicMaterial({ color: 0x9ff0ff })); car.position.set(-6 + i * 2.5, 4 + (i % 3), -10); future.add(car); } } bs.add(future);
const robot = makeGuy({ wood: 0xc8ccd4, nose: 0x2ab0e8 }); robot.root.position.set(1.6, 0, 0.2); robot.root.rotation.y = -1.9; bs.add(robot.root); { const ant = mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.25, 6), mat(0x888888)); ant.position.y = 0.5; robot.head.add(ant); const tip = mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff3a2a })); tip.position.y = 0.63; robot.head.add(tip); }
const mom = makeGuy({ wood: 0xd9b08a, hair: 0x4a2a10, shirt: 0xd94a7a }); mom.root.position.set(2.3, 0, 1.0); mom.root.rotation.y = -2.2; bs.add(mom.root);
// ---------- worse / lab ----------
const wsc = new THREE.Scene(); wsc.background = new THREE.Color(0x14060a); const wl = new THREE.PointLight(0xff3020, 30, 12, 2); wl.position.set(0.8, 2.0, 2.0); wsc.add(wl); wsc.add(new THREE.AmbientLight(0x200810, 1)); const daleW = makeGuy({ ...L.DALE }); wsc.add(daleW.root);
const lab = L.buildLab({ bg: 0xf0ecf6, floor: 0xe0dce6 }); const daleL = makeGuy({ ...L.DALE }); daleL.root.position.set(-0.6, 0, 0); lab.scene.add(daleL.root); { const c2 = clock.clone(); c2.scale.setScalar(2.4); c2.position.set(0.6, 0.98, -0.1); lab.scene.add(c2); const st = box(0.6, 0.8, 0.5, mat(0xd8d8d8)); st.position.set(0.6, 0.4, -0.1); lab.scene.add(st); }

const DAY = new THREE.Color(0xbfe0ff), NIGHT = new THREE.Color(0x0a1030), DUSK = new THREE.Color(0xf2a070);
const LIEQ = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(V(0, 0, -1), V(-1, 0, 0), V(0, 1, 0)));
function lying(g, t) { resetPose(g); g.root.position.set(0.85, 0.72, -1.4); g.root.quaternion.copy(LIEQ); blinkAt(g, t); setFace(g, { lid: 1, brow: 0 }); }
function roomState(t) { const l = lvl(t); room.roofOff(false); room.walls.visible = true;
  // sky: time-lapse flicker for 0.8s after acts >=5
  const n = NS[l - 1]; const dt = n ? t - A[n] : 9; let c = DAY.clone(); if (l === 3) c = NIGHT.clone(); if (l >= 5) c = DAY.clone(); if (n && dt < 1.0 && l >= 3) c = (Math.floor(dt * (6 + l * 3)) % 2) ? NIGHT.clone() : DAY.clone(); bs.background.copy(c); room.sun.intensity = c.equals(NIGHT) ? 0.1 : 2.4; room.hemi.intensity = c.equals(NIGHT) ? 0.35 : 1.0; room.fill.intensity = 6;
  lying(dale, t); drawClock(LABELS[l], (t % 1) < 0.5);
  phone.visible = l >= 4 && l < 8; vines.visible = l >= 5 && l < 8; const vk = l >= 5 ? clamp((t - A[9]) / 1.2) : 0; for (let i = 0; i < 400; i++) { const [p, r] = vineD[i]; const s = (r < vk * (l >= 6 ? 1 : 0.6)) ? 1 + r : 0; L._m.compose(p, L._q.identity(), L._s.setScalar(s)); vines.setMatrixAt(i, L._m); } vines.instanceMatrix.needsUpdate = true;
  party.visible = l >= 6 && l < 8; tree.visible = l >= 7; tree.scale.set(1, l === 7 ? easeOut(clamp((t - A[13]) / 1.2)) : 1, 1); dust.visible = l >= 4; future.visible = l >= 8; room.skyline.visible = l < 8; robot.root.visible = l >= 8; resetPose(robot); mom.root.visible = l === 0; resetPose(mom); return l; }
function shots() {
  const L2 = H.LINES[1].t, rob = line('The robots').t;
  return [['establish', 0, L2], ['setup', L2, A[1] - 0.8], ['z1', A[1] - 0.8, A[3] - 0.6], ['z3', A[3] - 0.6, A[5] - 0.5], ['z5', A[5] - 0.5, A[7] - 0.5], ['z7', A[7] - 0.5, A[9] - 0.5], ['z9', A[9] - 0.5, A[11] - 0.5], ['z11', A[11] - 0.5, A[13] - 0.5], ['z13', A[13] - 0.5, H.worse.t], ['worse', H.worse.t, A[17] - 0.4], ['z17', A[17] - 0.4, rob], ['end', rob, H.fact.t], ['fact', H.fact.t, TL.dur + 1]];
}
function hitSnooze(t, n) { const dt = t - A[n]; if (dt > -0.6 && dt < 0.1) { const k = Math.sin(clamp((dt + 0.6) / 0.7) * Math.PI); dale.aL.sh.rotation.set(-2.2 * k, 0, 0.3); setFace(dale, { lid: 0.8, brow: 0.2 }); } }
function renderShot(name, lt, dur, t) {
  L.cam.far = 400;
  switch (name) {
    case 'establish': { roomState(t); const k = ease(lt / dur); setCam(V(lerp(2.6, 2.2, k), lerp(2.4, 2.0, k), lerp(2.2, 1.6, k)), V(-0.2, 0.7, -1.6), 50); return bs; }
    case 'setup': { roomState(t); mom.root.visible = true; setFace(mom, { lid: 0.3, brow: 0.8, browTilt: -0.3, mouth: talk("Dale!", t) }); mom.aR.sh.rotation.set(-1.5, 0, -0.4); const d = line('Dale!'); if (t > d.t - 0.2) setCam(V(0.6, 1.7, -0.2), V(2.3, 1.5, 1.0), 46); else setCam(V(0.9, 1.2, -0.6), V(-0.2, 0.7, -2.2), 48); return bs; }
    case 'worse': { resetPose(daleW); daleW.root.rotation.set(0, 0.3, 0); setFace(daleW, { lid: 0.7, brow: 0.2, mouth: 0.1 }); setCam(V(0.25, 1.65, lerp(1.8, 1.45, lt / dur)), V(0, 1.55, 0), 36, 0.006, t); return wsc; }
    case 'end': { roomState(A[17] + 2); resetPose(robot); robot.aR.sh.rotation.set(-1.2, 0, -0.2); setFace(robot, { lid: 0.3, brow: 0.5 }); lying(dale, t); setFace(dale, { lid: 0.7, brow: 0.2, mouth: talk('Five more', t) }); bed.userData.blanket.position.z = 0.25 + (t > line('Five more').end ? -0.25 : 0); tree.visible = false; robot.root.position.set(-1.9, 0, -0.5); robot.root.rotation.y = 2.4; setCam(V(1.0, 2.0, 1.8), V(-0.9, 1.0, -1.2), 60); return bs; }
    case 'fact': { resetPose(daleL); daleL.root.rotation.y = 0.3; setFace(daleL, { lid: 0.35, brow: 0.3 }); blinkAt(daleL, t); const k = ease(lt / dur); setCam(V(lerp(1.3, 1.0, k), 1.5, lerp(3.6, 3.2, k)), V(0.0, 1.25, 0), 46); return lab.scene; }
    default: { const n = +name.slice(1); const l = roomState(t); hitSnooze(t, n); const dt = t - A[n];
      if (n === 1) setCam(V(-0.15, 0.95, -1.55), V(-0.85, 0.62, -2.3), 44);
      else if (n === 3) setCam(V(1.0, 1.4, 0.3), V(-0.2, 0.7, -1.6), 50);
      else if (n === 5) setCam(V(2.2, 1.6, 1.4), V(-0.6, 1.4, -2.9), 52);
      else if (n === 7) setCam(V(-0.2, 1.0, -1.75), V(-0.68, 0.56, -2.45), 46);
      else if (n === 9) setCam(V(3.0, 2.2, 2.4), V(-0.6, 1.0, -1.6), 56);
      else if (n === 11) setCam(V(1.4, 1.5, 0.6), V(0.2, 1.0, -1.8), 52);
      else if (n === 13) setCam(V(2.8, 1.6, 2.2), V(0.4, 1.8, -1.4), 56, dt > 0.3 && dt < 0.8 ? 0.02 : 0, t);
      else { setFace(robot, { lid: 0.4, brow: 0.6 }); setCam(V(2.6, 1.8, 2.6), V(-0.2, 1.4, -2.0), 54); }
      return bs; }
  }
}
const rungs = [['9', 'min', 1, 'A NORMAL SNOOZE', 9], ['81', 'min', 3, 'MISSED THE BUS', 81], ['12', 'hrs', 5, 'DARK AGAIN', 729], ['4.5', 'days', 7, '200 MISSED CALLS', 6561], ['41', 'days', 9, 'PLANTS TOOK OVER', 59049], ['1', 'year', 11, 'MISSED HIS BIRTHDAY', 531441], ['9', 'years', 13, 'A TREE IN THE BED', 4.78e6], ['736', 'years', 17, 'THE YEAR 2762', 3.87e8]]
  .map(([v, unit, n, cmp, raw], i) => ({ v, unit, n, cmp, raw, at: A[n], gold: i === 7 }));
const overlay = L.makeOverlay({ lines: H.LINES, titleL1: 'What if every snooze made you sleep', titleHi: '3× longer', titleL2: '?', titleSize: 70, hudLabel: r => 'SNOOZE ' + r.n + '   ·   TIME ASLEEP', rule: '×3 EVERY SNOOZE', rungs, barMin: 3, barMax: 1e9, barMarks: [[525600, '1 YEAR'], [5.256e7, '100 YRS']], fact: { big: '~11', unit: 'days', sub: 'LONGEST TIME AWAKE · 1964' }, hideHUD: ['worse', 'fact', 'end', 'setup'], flashBig: [A[17]], flashSmall: [A[13] + 0.3] });
L.makeFrame(shots, renderShot, overlay);

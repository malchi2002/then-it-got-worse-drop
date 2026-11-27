import * as X from '/vox.js';
const { L } = X; const { THREE, V, setCam, box, mat, ease, easeOut, clamp } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const line = H.line; const T = p => line(p).t; const E = p => line(p).end;
const MOM = { skin: '#c99063', hoodie: '#e86fa8', pants: '#3a3046', hair: 'bun', hairC: '#3a2418', seed: 21 };
const CRUSH = { skin: '#f0c29a', hoodie: '#8a5cf0', pants: '#2b2f3a', hair: 'bun', hairC: '#b5651d', seed: 33 };
const YOUL = { ...X.YOU, hoodie: '#f2b632', seed: 12 };
const POPS = [[T('You say yes') + 0.55, 1.35], [E('Day five') + 0.1, 1.7], [E("You haven't") + 0.05, 2.1], [T('Day twenty'), 3.0], [T('Day thirty'), 3.6], [T('You say no') + 0.75, 7.5]];
function bulk(t) { let k = 1; for (const [pt, v] of POPS) { if (t < pt) break; const q = clamp((t - pt) / 0.28); const prev = k; k = prev + (v - prev) * (easeOut(q) + Math.sin(q * Math.PI) * 0.15); } return k; }
const room = X.voxBedroom({ night: false, wall: 0xa9c7e8, blanket: 0x2f64d8 }); const you = X.makeVox(YOUL); room.scene.add(you.root);
const mom = X.makeVox(MOM); room.scene.add(mom.root);
const door = new THREE.Group(); { const fm = L.mat(0xf2f2f2); const a = box(0.12, 2.2, 0.2, fm); a.position.set(-0.55, 1.1, 0); door.add(a); const b = a.clone(); b.position.x = 0.55; door.add(b); const c = box(1.22, 0.12, 0.2, fm); c.position.set(0, 2.2, 0); door.add(c); const w1 = box(2.5, 2.8, 0.18, L.mat(0xa9c7e8)); w1.position.set(-1.86, 1.4, 0); door.add(w1); const w2 = w1.clone(); w2.position.x = 1.86; door.add(w2); door.traverse(m => { if (m.isMesh) { m.castShadow = m.receiveShadow = true; } }); } door.position.set(0, 0, 1.2); room.scene.add(door);
const phone = X.makePhone(); you.armR.tip.add(phone); phone.rotation.set(-0.5, Math.PI, 0);
const st = X.voxStreet({ seed: 11 }); const you2 = X.makeVox(YOUL); const crush = X.makeVox(CRUSH); st.scene.add(you2.root, crush.root);
const SH = () => [['q', 0, T('Day one')], ['d1', T('Day one'), T('Day five')], ['d5', T('Day five'), T('Day ten')], ['d10', T('Day ten'), T('Day twenty')], ['d20', T('Day twenty'), T('Day thirty')], ['d30', T('Day thirty'), T('Did you')], ['momq', T('Did you'), T('You say no') + 0.6], ['boom', T('You say no') + 0.6, 99]];
function render(n, lt, d, t) {
  for (const g of [you, you2, mom, crush]) g.reset(); you.root.visible = true; const k = bulk(t); you.bulk(k); you2.bulk(k); door.visible = false; mom.root.visible = false; phone.visible = false; you.root.rotation.set(0, 0, 0);
  const pk = 1 - 0.1 * ease(lt / d);
  if (n === 'q') { you.root.position.set(0.3, 0, -0.3); you.face('smug', you.blinkAt(t)); setCam(V(0.3, 1.45, 2.0 + 0.8 * pk), V(0.3, 1.2, -0.3), 40); return room.scene; }
  if (n === 'd1') { mom.root.visible = true; mom.root.position.set(-0.7, 0, 0.1); mom.root.rotation.y = 0.9; mom.face('mad', mom.blinkAt(t)); mom.armL.sh.rotation.z = 0.5; mom.armR.sh.rotation.z = -0.5;
    you.root.position.set(0.6, 0, 0); you.root.rotation.y = -0.7; you.face(t > T('You say yes') ? (t > POPS[0][0] ? 'shock' : 'grin') : 'neutral', you.blinkAt(t)); setCam(V(0.1, 1.6, 4.3), V(0, 1.25, 0), 40); return room.scene; }
  if (n === 'd5') { you2.root.position.set(0.4, 0, 0); you2.root.rotation.y = -1.2; crush.root.position.set(-0.6, 0, 0); crush.root.rotation.y = 1.2; crush.face('smile', crush.blinkAt(t)); you2.face(t > POPS[1][0] ? 'shock' : 'smug', you2.blinkAt(t));
    you2.root.position.y = t < POPS[1][0] ? 0.1 : 0; setCam(V(0, 1.6, 4.4 - 0.4 * ease(lt / d)), V(-0.1, 1.25, 0), 40); return st.scene; }
  if (n === 'd10') { phone.visible = true; you.root.position.set(0.6, 0.6, -0.5); you.root.rotation.set(-Math.PI / 2, 0, 0); you.phonePose(-1); you.face(t > POPS[2][0] ? 'shock' : 'smug', you.blinkAt(t)); setCam(V(1.4, 2.4, -0.7), V(0.6, 0.7, -1.9), 42); return room.scene; }
  if (n === 'd20') { you.root.position.set(0.3, 0, -0.3); you.face('sad', you.blinkAt(t)); setCam(V(0.3, 1.5, 3.2), V(0.3, 1.1, -0.3), 42); return room.scene; }
  if (n === 'd30') { door.visible = true; you.root.position.set(0, 0, 1.2 + Math.sin(t * 6) * 0.03); you.root.rotation.y = Math.PI; you.face('mad'); you.walk(t * 0.5, 10); setCam(V(0.8, 1.7, 5.6), V(0, 1.3, 1.2), 46); you.root.rotation.y = 0; return room.scene; }
  if (n === 'momq') { you.root.visible = false; mom.root.visible = true; mom.root.position.set(0, 0, 0); mom.root.rotation.y = 0; mom.face(lt < 2 ? 'mad' : 'smug', mom.blinkAt(t)); mom.armL.sh.rotation.x = -1.4; setCam(V(0, 1.55, 2.1), V(0, 1.35, 0), 40); return room.scene; }
  if (n === 'boom') { you.root.position.set(0.3, 0, -0.6); you.face('shock'); const sh = Math.sin(t * 60) * 0.03 * (1 - clamp(lt / 0.6)); setCam(V(0.3 + sh, 1.6, 3.4), V(0.3, 1.2, -0.6), 48); return room.scene; }
}
const CFG = {
  q1: 'WHAT IF EVERY LIE', qHi: 'GREW YOUR HOODIE?', c1: 'WHAT IF EVERY LIE', c2: 'GREW YOUR HOODIE?',
  days: [[T('Day one'), 'DAY 1', '6:00 PM'], [T('Day five'), 'DAY 5', '3:20 PM'], [T('Day ten'), 'DAY 10', '9:00 AM'], [T('Day twenty'), 'DAY 20', '7:45 PM'], [T('Day thirty'), 'DAY 30', '12:00 PM']].map(([t, label, time]) => ({ t, label, time })),
  texts: [{ t: T('Day ten') + 1.6, end: T('Day twenty') - 0.1, from: 'Bro', msg: "5 min away bro", me: 1 }],
  cta: { t: T('Tag the'), l1: 'TAG THE BIGGEST', l2: 'LIAR YOU KNOW' },
};
const ov = X.voxOverlay(CFG, TL); L.makeFrame(SH, render, ov);

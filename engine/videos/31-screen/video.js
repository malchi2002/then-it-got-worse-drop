import * as X from '/vox.js';
const { L } = X; const { THREE, V, setCam, box, mat, ease, easeOut, clamp } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const line = H.line; const T = p => line(p).t; const E = p => line(p).end;
const MOM = { skin: '#c99063', hoodie: '#e86fa8', pants: '#3a3046', hair: 'bun', hairC: '#3a2418', seed: 21 };
const YOU2 = { ...X.YOU, hoodie: '#2fa86a', seed: 6 };
// bedroom (you)
const bed = X.voxBedroom({ night: true, blanket: 0x2f64d8 }); const you = X.makeVox(YOU2); bed.scene.add(you.root);
const ph = X.makePhone(); you.armR.tip.add(ph); ph.rotation.set(-0.5, Math.PI, 0);
const blanket = box(1.2, 0.5, 1.6, L.mat(0x2f64d8)); blanket.position.set(0.6, 0.75, -1.3); blanket.castShadow = true; bed.scene.add(blanket);
const glow = new THREE.PointLight(0x7fb0ff, 0, 2, 2); glow.position.set(0.6, 0.9, -1.0); bed.scene.add(glow);
// couch (mom)
const lr = X.voxRoom({ night: false, couch: 0x7a4b2a, wall: 0xe8d9b8 }); const mom = X.makeVox(MOM); lr.scene.add(mom.root); mom.root.position.set(0.3, 0, -1.55);
const mph = X.makePhone(); mom.armR.tip.add(mph); mph.rotation.set(-0.5, Math.PI, 0);
// street (you outside)
const st = X.voxStreet({ seed: 8 }); const you3 = X.makeVox(YOU2); st.scene.add(you3.root);
// calculator: you at desk on couch room night
const lr2 = X.voxRoom({ night: true }); const you2 = X.makeVox(YOU2); lr2.scene.add(you2.root); you2.root.position.set(-0.25, 0, -1.55);
const ph2 = X.makePhone('#ff9a3b'); you2.armR.tip.add(ph2); ph2.rotation.set(-0.5, Math.PI, 0);
const SH = () => [['q', 0, T('Day one')], ['d1', T('Day one'), T('Mom texts')], ['mom1', T('Mom texts'), T('Day four')], ['d4', T('Day four'), T('Day nine')], ['d9', T('Day nine'), T('Day fifteen')], ['d15', T('Day fifteen'), T('Mom panics')], ['mom2', T('Mom panics'), T('Day thirty')], ['d30', T('Day thirty'), T('So you')], ['momEnd', T('So you'), 99]];
function render(n, lt, d, t) {
  for (const g of [you, you2, you3, mom]) g.reset(); const k = 1 - 0.12 * ease(lt / d);
  if (n === 'q' || n === 'd1' || n === 'd30') {
    blanket.visible = false; glow.intensity = 0; you.sit(); you.root.position.set(0.6, 0.06, -0.55); you.phonePose(-1); you.head.rotation.x = 0.2; ph.visible = n !== 'd30';
    you.face(n === 'q' ? 'smile' : n === 'd30' ? 'smug' : 'neutral', you.blinkAt(t));
    if (n === 'd30') { you.armL.sh.rotation.z = 2.5; you.armR.sh.rotation.z = -2.5; }
    setCam(V(0.6, 1.45, 1.3 + 0.9 * k), V(0.6, 1.2, -0.6), 40); return bed.scene;
  }
  if (n === 'd4') { blanket.visible = true; glow.intensity = 3 + Math.sin(t * 9) * 0.5; blanket.material.emissive.set(0x6f9bff); blanket.material.emissiveIntensity = 0.35 + 0.15 * Math.sin(t * 7); you.root.position.set(0.6, 0.6, -0.45); you.root.rotation.set(-Math.PI / 2, 0, 0); ph.visible = false;
    const busted = t > T('She still'); bed.lamp.intensity = busted ? 6 : 1; setCam(V(2.2, 2.3, 1.4), V(0.5, 0.7, -1.3), 42); return bed.scene; }
  if (n === 'mom1' || n === 'mom2' || n === 'momEnd') {
    mom.sit(); mom.phonePose(-1); mom.head.rotation.x = 0.2;
    if (n === 'mom1') { mom.face('mad', mom.blinkAt(t)); setCam(V(0.3, 1.4, 0.5 + 0.7 * k), V(0.3, 1.25, -1.55), 40); }
    if (n === 'mom2') { mom.root.position.y = Math.abs(Math.sin(lt * 9)) * 0.05; mom.face('shock'); mom.armL.sh.rotation.z = 2.6; setCam(V(0.3 + Math.sin(t * 50) * 0.01, 1.4, 1.0), V(0.3, 1.2, -1.55), 42); }
    if (n === 'momEnd') { mom.face(t > T('Eleven') ? 'grin' : 'smile', mom.blinkAt(t)); setCam(V(0.3, 1.4, 0.6 + 0.9 * k), V(0.3, 1.2, -1.55), 40); }
    return lr.scene;
  }
  if (n === 'd9') { you2.sit(); you2.phonePose(-1); you2.head.rotation.x = 0.25; you2.face(t > T("She's") ? 'shock' : 'smug', you2.blinkAt(t)); setCam(V(-0.25, 1.4, 0.4 + 0.7 * k), V(-0.25, 1.2, -1.55), 40); return lr2.scene; }
  if (n === 'd15') { you3.root.position.set(0, 0, 6 - lt * 1.4); you3.root.rotation.y = Math.PI; you3.walk(t); you3.face('smile', you3.blinkAt(t)); you3.root.rotation.y = 0; you3.root.position.z = -2 + lt * 1.2;
    setCam(V(1.6, 1.5, you3.root.position.z + 4.2), V(0, 1.0, you3.root.position.z), 40); return st.scene; }
}
const CFG = {
  q1: 'WHAT IF YOUR MOM SAW', qHi: 'YOUR SCREEN TIME LIVE?', c1: 'WHAT IF YOUR MOM SAW', c2: 'YOUR SCREEN TIME LIVE?',
  days: [[T('Day one'), 'DAY 1', '9:00 PM'], [T('Day four'), 'DAY 4', '1:12 AM'], [T('Day nine'), 'DAY 9', '4:30 PM'], [T('Day fifteen'), 'DAY 15', '10:00 AM'], [T('Day thirty'), 'DAY 30', '8:00 PM']].map(([t, label, time]) => ({ t, label, time })),
  texts: [
    { t: T('Mom texts') + 0.3, end: T('Day four') - 0.1, from: 'Mom', msg: 'GET OFF YOUR PHONE' },
    { t: T('She still') + 0.2, end: T('Day nine') - 0.1, from: 'Mom', msg: 'i can see the blanket glowing' },
    { t: T("She's") + 0.2, end: T('Day fifteen') - 0.1, from: 'Mom', msg: 'since when do u do math??' },
    { t: T('Mom panics') + 0.1, end: T('Day thirty') - 0.1, from: 'Mom', msg: 'WHERE ARE YOU\nwhy is it 0 minutes\nANSWER ME', y: 900 },
    { t: T('So you') + 0.9, end: T('Send this') - 0.05, from: 'Screen Time', msg: 'Mom: 11 hrs 42 min\nCat videos: 11 hrs', sub: 'today', y: 900 },
  ],
  cta: { t: T('Send this'), l1: 'SEND THIS TO SOMEONE', l2: 'WHOSE MOM WOULD DO THIS' },
};
const ov = X.voxOverlay(CFG, TL); L.makeFrame(SH, render, ov);

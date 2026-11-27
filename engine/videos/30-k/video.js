import * as X from '/vox.js';
const { L } = X; const { THREE, V, setCam, box, mat, ease, easeOut, clamp, lerp } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const line = H.line; const T = p => line(p).t; const E = p => line(p).end;
const talkN = 0;
// ---- scenes
const couch = X.voxRoom({ night: true }); const you1 = X.makeVox(X.YOU); couch.scene.add(you1.root); you1.root.position.set(-0.25, 0, -1.55);
const ph1 = X.makePhone(); you1.armR.tip.add(ph1); ph1.rotation.set(-0.5, Math.PI, 0); ph1.position.set(0, -0.02, 0.05);
const street = X.voxStreet({ seed: 3 }); const you2 = X.makeVox(X.YOU); street.scene.add(you2.root); you2.root.position.set(0, 0, 0);
const ph2 = X.makePhone(); you2.armR.tip.add(ph2); ph2.rotation.set(-0.5, Math.PI, 0);
const bed = X.voxBedroom({ night: true }); const you3 = X.makeVox(X.YOU); bed.scene.add(you3.root);
const ph3 = X.makePhone(); you3.armR.tip.add(ph3); ph3.rotation.set(-0.5, Math.PI, 0);
const boxes = new THREE.Group(); { const bm = L.mat(0xb88a52); [[-1.4, 0.25, -0.6, 0.5], [-1.0, 0.25, -0.9, 0.5], [-1.2, 0.7, -0.75, 0.4], [1.9, 0.3, 0.2, 0.6], [1.6, 0.85, 0.2, 0.45]].forEach(([x, y, z, sz]) => { const b = box(sz, sz, sz, bm); b.position.set(x, y, z); b.rotation.y = x; b.castShadow = true; boxes.add(b); const tp = box(sz + 0.01, 0.04, 0.08, L.mat(0xd9c49a)); tp.position.set(x, y + sz / 2, z); tp.rotation.y = x; boxes.add(tp); }); } bed.scene.add(boxes);
const nphone = X.makePhone('#202020'); nphone.rotation.x = -Math.PI / 2; nphone.position.set(-0.25, 0.56, -0.5); bed.scene.add(nphone);
const stand = box(0.4, 0.5, 0.4, L.mat(0x5a3a22)); stand.position.set(-0.25, 0.25, -0.5); bed.scene.add(stand);
const broRoom = X.voxBedroom({ night: true, wall: 0x3c2a4a, blanket: 0xd8342c }); const bro = X.makeVox(X.BRO); broRoom.scene.add(bro.root);
const ph4 = X.makePhone(); bro.armR.tip.add(ph4); ph4.rotation.set(-0.5, Math.PI, 0);
// ---- shots
const SH = () => [['q', 0, T('Day one')], ['d1', T('Day one'), T('Day three')], ['d3', T('Day three'), T('Day seven')], ['d7', T('Day seven'), T('Day twelve')], ['d12', T('Day twelve'), T('He reads')], ['bro', T('He reads'), T('Day twenty.')], ['d20', T('Day twenty.'), T('Day twenty nine')], ['d29', T('Day twenty nine'), T('So you')], ['rep', T('So you'), E('So you') + 1.3], ['broShock', E('So you') + 1.3, 99]];
const KS = TL.tl.filter(x => x.type === 'line' && x.text === 'K.').map(x => x.t);
const pushIn = (lt, d, a = 0.12) => 1 - a * ease(lt / d);
function render(n, lt, d, t) {
  for (const g of [you1, you2, you3, bro]) g.reset();
  if (n === 'q' || n === 'd1' || n === 'd12' || n === 'rep') {
    you1.sit(); you1.phonePose(-1); you1.root.rotation.y = 0;
    const kHit = KS.some(k => t > k && t < k + 1.2);
    let f = 'smile'; if (n === 'd1') f = t > T('He replies') ? 'neutral' : 'grin'; if (n === 'd12') f = 'mad'; if (n === 'q') f = 'smug'; if (n === 'rep') f = t > T('K.', 0) ? 'smug' : 'smug';
    you1.face(f, you1.blinkAt(t)); you1.head.rotation.x = 0.25;
    if (n === 'd12') { you1.armL.sh.rotation.x = -0.9; you1.armL.el.rotation.x = -1.1 + Math.sin(t * 30) * 0.08; you1.armR.el.rotation.x = -1.2 + Math.cos(t * 30) * 0.08; }
    const k = pushIn(lt, d);
    if (n === 'q') setCam(V(0.1 + 0.5 * k, 1.35, 1.2 + 1.6 * k), V(-0.25, 1.15, -1.55), 40);
    else if (n === 'rep') setCam(V(-0.15, 1.35, 0.7 - 0.25 * ease(lt / d)), V(-0.25, 1.22, -1.55), 40);
    else setCam(V(0.5 * k, 1.4, 1.0 + 1.4 * k), V(-0.25, 1.1, -1.55), 40);
    return couch.scene;
  }
  if (n === 'd3') {
    const jump = Math.abs(Math.sin(lt * 5)) * 0.5 * (t < T('K.', 0) ? 1 : 0); const kk = t > KS[0];
    you2.root.position.y = kk ? 0 : jump; you2.armL.sh.rotation.z = kk ? 0 : 2.6; you2.armR.sh.rotation.x = -1.1; you2.armR.el.rotation.x = -0.8; you2.face(kk ? 'neutral' : 'grin', you2.blinkAt(t));
    setCam(V(1.4, 1.4, 4.4 - 0.6 * ease(lt / d)), V(0, 1.05, 0), 40); return street.scene;
  }
  if (n === 'd7' || n === 'd20' || n === 'd29') {
    boxes.visible = n === 'd7'; nphone.visible = n !== 'd7'; ph3.visible = n === 'd7';
    if (n === 'd7') { you3.root.position.set(-0.4, 0, 0.2); you3.root.rotation.y = 0.3; you3.phonePose(-1); you3.face(t > KS[1] ? 'neutral' : 'smile', you3.blinkAt(t)); setCam(V(0.6, 1.4, 3.4 - 0.5 * ease(lt / d)), V(-0.3, 1.05, 0.2), 40); }
    else { // lying in bed
      you3.root.position.set(0.6, 0.6, -0.5); you3.root.rotation.set(-Math.PI / 2, 0, 0); const buzz = n === 'd29' && t > T('Day twenty nine') + 2.2;
      nphone.userData.scr.emissiveIntensity = buzz ? 2.5 : 0; nphone.userData.scr.color.set(buzz ? 0x6fa0ff : 0x111111); nphone.position.x = -0.25 + (buzz ? Math.sin(t * 60) * 0.006 : 0);
      if (n === 'd29' && t > T("It's him")) { you3.root.rotation.x = -Math.PI / 2 + 1.2 * easeOut((t - T("It's him")) / 0.3); you3.face('shock'); } else you3.face(n === 'd29' ? 'sleep' : 'sad', false);
      bed.lamp.intensity = n === 'd29' ? 1 : 6;
      setCam(V(1.3, 2.3, -0.9), V(0.6, 0.7, -1.95), 42);
    }
    return bed.scene;
  }
  if (n === 'bro' || n === 'broShock') {
    bro.sit(); bro.root.position.set(0.6, 0.06, -0.6); bro.phonePose(-1); bro.head.rotation.x = 0.2;
    if (n === 'bro') { bro.face(t > KS[2] - 0.2 ? 'smug' : 'neutral', bro.blinkAt(t)); setCam(V(0.6, 1.45, 1.5 + 0.8 * pushIn(lt, d)), V(0.6, 1.25, -0.6), 40); }
    else { const s = clamp(lt / 0.15); bro.face('shock'); bro.head.rotation.x = -0.1; ph4.visible = lt < 0.6; bro.armR.sh.rotation.x = lt < 0.6 ? -0.9 : 0.2; setCam(V(0.6 + Math.sin(lt * 40) * 0.01 * (1 - clamp(lt)), 1.42, 1.3 - 0.25 * s), V(0.6, 1.3, -0.6), 40); }
    return broRoom.scene;
  }
}
const CFG = {
  q1: 'WHAT IF YOUR BRO', qHi: 'ONLY REPLIED "K"?', c1: 'WHAT IF YOUR BRO', c2: 'ONLY REPLIED "K"?',
  days: [[T('Day one'), 'DAY 1', '9:41 PM'], [T('Day three'), 'DAY 3', '12:15 PM'], [T('Day seven'), 'DAY 7', '6:30 PM'], [T('Day twelve'), 'DAY 12', '2:03 AM'], [T('Day twenty.'), 'DAY 20', '11:58 PM'], [T('Day twenty nine'), 'DAY 29', '12:00 AM']].map(([t, label, time]) => ({ t, label, time })),
  texts: [
    { t: T('Day one') + 1.2, end: T('Day three') - 0.1, from: 'Bro', msg: 'LMAOOO LOOK AT THIS', me: 1 },
    { t: T('He replies') + 0.6, end: T('Day three') - 0.1, from: 'Bro', msg: 'k', y: 1220 },
    { t: T('Day three') + 1, end: T('Day seven') - 0.1, from: 'Bro', msg: 'BRO I GOT THE JOB!!!', me: 1 },
    { t: KS[0], end: T('Day seven') - 0.1, from: 'Bro', msg: 'k', y: 1220 },
    { t: T('Day seven') + 1.3, end: T('Day twelve') - 0.1, from: 'Bro', msg: "i'm moving to japan", me: 1 },
    { t: KS[1], end: T('Day twelve') - 0.1, from: 'Bro', msg: 'k', y: 1220 },
    { t: T('Day twelve') + 1.3, end: T('Day twenty.') - 0.1, from: 'Bro', msg: "bro we need to talk. i've\nbeen thinking a lot lately\nabout our friendship and\nhonestly i feel like...", me: 1, y: 880 },
    { t: KS[2], end: T('Day twenty.') - 0.1, from: 'Bro', msg: 'k', y: 1180 },
    { t: T("It's him"), end: T('So you') + 0.6, from: 'Bro', msg: 'u good?' },
    { t: KS[3], end: E('So you') + 1.3, from: 'Bro', msg: 'k', me: 1 },
  ],
  cta: { t: T('Send this'), l1: 'SEND THIS TO YOUR BRO', l2: 'WHO ONLY REPLIES "K"' },
};
const ov = X.voxOverlay(CFG, TL);
L.makeFrame(SH, render, ov);
window.__coverOv = ov.cover;

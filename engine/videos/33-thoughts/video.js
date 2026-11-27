import * as X from '/vox.js';
const { L } = X; const { THREE, V, setCam, box, mat, ease, easeOut, clamp } = L;
const TL = window.TL; const H = L.tlHelpers(TL); const line = H.line; const T = p => line(p).t; const E = p => line(p).end;
const XL = H.LINES.filter(l => l.who === 'X'); const talk = t => XL.some(l => t > l.t && t < l.end) ? Math.abs(Math.sin(t * 15)) * 0.5 : 0;
const MOM = { skin: '#8d5a3b', hoodie: '#e86fa8', pants: '#3a3046', hair: 'bun', hairC: '#1d1410', seed: 22 };
const CRUSH = { skin: '#f0c29a', hoodie: '#8a5cf0', hair: 'bun', hairC: '#b5651d', seed: 33 };
const BOSS = { skin: '#f0c29a', hoodie: '#3a3d44', pants: '#2b2b30', hair: 'short', hairC: '#7a7a7a', seed: 41 };
function cast(scene, list) { return list.map(o => { const g = X.makeVox(o); scene.add(g.root); return g; }); }
const day = X.voxRoom({ night: false, wall: 0xd9cbb0, couch: 0x2d3f8f }); const [you1, bro1] = cast(day.scene, [X.YOU, X.BRO]);
const bald = box(0.16, 0.03, 0.16, L.mat(X.YOU.skin)); bald.position.set(0.05, 0.665, -0.05); you1.head.add(bald);
const chair = box(0.5, 0.45, 0.5, L.mat(0x333333)); chair.position.set(-0.3, 0.225, 0.4); day.scene.add(chair);
const dining = X.voxRoom({ night: false, wall: 0xe7d6a8, couch: 0x6b4426 }); dining.couch.visible = false; dining.table.visible = false; const [bro2, mom] = cast(dining.scene, [X.BRO, MOM]);
const dt = new THREE.Group(); { const top = box(1.6, 0.08, 0.9, L.mat(0x8a5a32)); top.position.y = 0.75; dt.add(top); for (const [x, z] of [[-0.7, -0.35], [0.7, -0.35], [-0.7, 0.35], [0.7, 0.35]]) { const lg = box(0.08, 0.75, 0.08, L.mat(0x6b4426)); lg.position.set(x, 0.375, z); dt.add(lg); } const pl = box(0.3, 0.03, 0.3, L.mat(0xffffff)); pl.position.set(0, 0.8, 0.2); dt.add(pl); const food = box(0.18, 0.06, 0.14, L.mat(0x7a4a2a)); food.position.set(0, 0.84, 0.2); dt.add(food); dt.traverse(m => { if (m.isMesh) m.castShadow = m.receiveShadow = true; }); } dt.position.set(0, 0, -0.4); dining.scene.add(dt);
const st = X.voxStreet({ seed: 14 }); const [you3, bro3, crush] = cast(st.scene, [X.YOU, X.BRO, CRUSH]);
const office = X.voxRoom({ night: false, wall: 0xc9d3dc, couch: 0x555555 }); office.couch.visible = false; office.table.visible = false; const [bro4, boss] = cast(office.scene, [X.BRO, BOSS]);
const desk = box(1.5, 0.75, 0.7, L.mat(0x4a3a2a)); desk.position.set(0, 0.375, -0.6); office.scene.add(desk);
const night = X.voxRoom({ night: true }); const [you5, bro5] = cast(night.scene, [X.YOU, X.BRO]);
const SH = () => [['q', 0, T('Day one')], ['d1', T('Day one'), T('Day three')], ['d3', T('Day three'), T('Day seven')], ['d7', T('Day seven'), T('Day twelve')], ['d12', T('Day twelve'), T('Day thirty')], ['d30', T('Day thirty'), T('Also')], ['chips', T('Also'), 99]];
function render(n, lt, d, t) {
  const tk = talk(t); const pk = 1 - 0.1 * ease(lt / d);
  for (const g of [you1, bro1, bro2, mom, you3, bro3, crush, bro4, boss, you5, bro5]) g.reset();
  if (n === 'q') { bro5.sit(); bro5.root.position.set(0.3, 0, -1.55); bro5.face('smug', bro5.blinkAt(t)); you5.root.visible = false; setCam(V(0.3, 1.4, 0.6 + 0.8 * pk), V(0.3, 1.25, -1.55), 40); return night.scene; }
  if (n === 'd1') { you1.sit(); you1.root.position.set(-0.3, 0.0, 0.15); you1.face(t > T('Bro. Is') + 0.6 ? 'shock' : 'smile', you1.blinkAt(t)); bro1.root.position.set(0.5, 0, 0.1); bro1.root.rotation.y = -0.6; bro1.armR.sh.rotation.x = -1.6; bro1.armR.sh.rotation.z = 0.5; bro1.face(tk ? 'shock' : 'neutral', bro1.blinkAt(t), tk);
    setCam(V(0.2, 1.7, 2.9 * pk + 0.4), V(0, 1.2, 0.1), 40); return day.scene; }
  if (n === 'd3') { bro2.sit(); bro2.root.position.set(0, 0.0, 0.35); bro2.root.rotation.y = Math.PI; bro2.root.rotation.y = 0; bro2.root.position.z = -1.0; bro2.face(tk ? 'mad' : 'neutral', bro2.blinkAt(t), tk); mom.root.position.set(0.95, 0, -0.9); mom.root.rotation.y = -0.4; mom.face(t > T('This tastes') + 0.5 ? 'shock' : 'smile', mom.blinkAt(t)); mom.armR.sh.rotation.x = -0.7;
    setCam(V(0.4, 1.7, 2.6 * pk + 0.4), V(0.4, 1.15, -0.9), 42); return dining.scene; }
  if (n === 'd7') { you3.root.position.set(0.1, 0, 0); crush.root.position.set(-0.7, 0, 0.1); crush.root.rotation.y = 0.5; bro3.root.position.set(0.9, 0, 0.2); bro3.root.rotation.y = -0.4; crush.face(t > T("She's") ? 'smug' : 'smile', crush.blinkAt(t)); you3.face(t > T("She's") ? 'shock' : 'grin', you3.blinkAt(t)); bro3.face(tk ? 'smug' : 'neutral', bro3.blinkAt(t), tk);
    setCam(V(0.1, 1.6, 5.2 * pk + 0.3), V(0.1, 1.25, 0), 40); return st.scene; }
  if (n === 'd12') { bro4.sit(); bro4.root.position.set(0, 0, 0.3); bro4.root.rotation.y = Math.PI; boss.sit(); boss.root.position.set(0, 0, -1.3); boss.face(t > T('I only') + 0.8 ? 'shock' : 'neutral', boss.blinkAt(t)); bro4.face('smile', false, tk);
    setCam(V(2.4, 1.55, 1.6), V(0, 1.15, -0.5), 44); return office.scene; }
  if (n === 'd30' || n === 'chips') { you5.root.visible = true; you5.sit(); bro5.sit(); you5.root.position.set(-0.25, 0, -1.55); bro5.root.position.set(0.85, 0, -1.55); you5.root.rotation.y = 0.3; bro5.root.rotation.y = -0.3;
    if (n === 'd30') { you5.face('smile', you5.blinkAt(t)); bro5.face(t > T('Honestly') ? 'smile' : 'neutral', bro5.blinkAt(t), tk); setCam(V(0.3, 1.35, 0.9 + 0.6 * pk), V(0.3, 1.2, -1.55), 42); }
    else { you5.face(lt > 1 ? 'mad' : 'smile', you5.blinkAt(t)); bro5.face('smug', bro5.blinkAt(t), tk); setCam(V(0.0, 1.38, 0.5), V(0.1, 1.25, -1.55), 40); }
    return night.scene; }
}
const CFG = {
  q1: 'WHAT IF YOUR BRO', qHi: 'SAID EVERY THOUGHT?', c1: 'WHAT IF YOUR BRO', c2: 'SAID EVERY THOUGHT?',
  days: [[T('Day one'), 'DAY 1', '2:00 PM'], [T('Day three'), 'DAY 3', '6:30 PM'], [T('Day seven'), 'DAY 7', '4:15 PM'], [T('Day twelve'), 'DAY 12', '10:00 AM'], [T('Day thirty'), 'DAY 30', '11:40 PM']].map(([t, label, time]) => ({ t, label, time })),
  texts: [], cta: { t: T('Send this'), l1: 'SEND THIS TO YOUR BRO', l2: 'WITH NO FILTER' },
};
const ov = X.voxOverlay(CFG, TL); L.makeFrame(SH, render, ov);

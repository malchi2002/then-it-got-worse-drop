// "What if" voxel style: blocky characters, Day-N countdown overlay, phone pop-ups
import * as L from './lib.js';
const { THREE, V, mat, mesh, box, clamp, ease, easeOut, lerp, rng, canvasTex, ctx, W, H, strokeText } = L;

// ---------- pixel face ----------
const FACES = {
  neutral: { brow: 0, mouth: 'line', eye: 'open' },
  smile: { brow: 0, mouth: 'smile', eye: 'open' },
  grin: { brow: -1, mouth: 'grin', eye: 'open' },
  shock: { brow: -2, mouth: 'o', eye: 'wide' },
  sad: { brow: 2, mouth: 'frown', eye: 'open' },
  mad: { brow: 3, mouth: 'frown', eye: 'squint' },
  smug: { brow: 1, mouth: 'smirk', eye: 'half' },
  sleep: { brow: 0, mouth: 'line', eye: 'closed' },
};
function px(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x * 16, y * 16, w * 16, h * 16); }
function drawFace(g, o, f, blink, talk) {
  const S = o.skin, D = shade(S, -0.18), E = '#ffffff', P = '#1b1b22', B = o.hairC || '#1d1410';
  px(g, 0, 0, 8, 8, S); // base
  for (let i = 0; i < 6; i++) { const r = o._r; px(g, (r() * 8) | 0, (r() * 8) | 0, 1, 1, r() < 0.5 ? shade(S, -0.06) : shade(S, 0.05)); }
  // eyes (row 3-4)
  const eye = blink ? 'closed' : f.eye;
  for (const ex of [1, 5]) {
    if (eye === 'closed') px(g, ex, 4, 2, 0.4, P);
    else if (eye === 'half') { px(g, ex, 3.6, 2, 0.9, E); px(g, ex + (ex === 1 ? 1 : 0), 3.6, 1, 0.9, P); px(g, ex, 3.3, 2, 0.4, D); }
    else if (eye === 'squint') { px(g, ex, 3.7, 2, 0.7, E); px(g, ex + (ex === 1 ? 1 : 0), 3.7, 1, 0.7, P); }
    else if (eye === 'wide') { px(g, ex, 2.8, 2, 1.8, E); px(g, ex + 0.5, 3.3, 1, 1, P); }
    else { px(g, ex, 3, 2, 1.3, E); px(g, ex + (ex === 1 ? 1 : 0), 3, 1, 1.3, P); }
  }
  // brows
  const bb = f.brow; px(g, 1, 2.2 - (bb < 0 ? 0.5 : 0), 2, 0.5, B); px(g, 5, 2.2 - (bb < 0 ? 0.5 : 0), 2, 0.5, B);
  if (bb >= 2) { px(g, bb === 3 ? 2.5 : 1, 2.5, 0.6, 0.4, B); px(g, bb === 3 ? 5 : 6.4, 2.5, 0.6, 0.4, B); }
  // nose
  px(g, 3.5, 4.6, 1, 0.8, D);
  // mouth (row 6)
  const M = '#5a2a22', T = '#f2f2f2'; let m = f.mouth; if (talk) m = talk > 0.25 ? 'o' : 'grin';
  if (m === 'line') px(g, 2.5, 6.2, 3, 0.4, M);
  if (m === 'smile') { px(g, 2.5, 6.3, 3, 0.4, M); px(g, 2, 5.9, 0.5, 0.5, M); px(g, 5.5, 5.9, 0.5, 0.5, M); }
  if (m === 'grin') { px(g, 2, 5.9, 4, 0.9, M); px(g, 2.3, 5.9, 3.4, 0.35, T); }
  if (m === 'o') { px(g, 3, 5.7, 2, 1.3, M); }
  if (m === 'frown') { px(g, 2.5, 6.1, 3, 0.4, M); px(g, 2, 6.5, 0.5, 0.5, M); px(g, 5.5, 6.5, 0.5, 0.5, M); }
  if (m === 'smirk') { px(g, 3, 6.2, 2.5, 0.4, M); px(g, 5.5, 5.9, 0.5, 0.4, M); }
}
export function shade(hex, k) { const c = new THREE.Color(hex); const h = {}; c.getHSL(h); c.setHSL(h.h, h.s, clamp(h.l + k)); return '#' + c.getHexString(); }

// ---------- voxel guy ----------
// o: { skin, hoodie, pants, shoes, hair:'afro'|'short'|'cap'|'bun', hairC, seed }
export function makeVox(o) {
  o = { skin: '#8d5a3b', hoodie: '#d8342c', pants: '#2b2f3a', shoes: '#f2f2f2', hair: 'afro', hairC: '#1d1410', seed: 3, ...o };
  const root = new THREE.Group(); const G = { root, o };
  o._r = rng(o.seed);
  // face texture
  const fc = document.createElement('canvas'); fc.width = fc.height = 128; const ft = new THREE.CanvasTexture(fc); ft.magFilter = THREE.NearestFilter; ft.colorSpace = THREE.SRGBColorSpace;
  let lastKey = '';
  G.face = (name = 'neutral', blink = false, talk = 0) => { const k = name + blink + (talk > 0.25 ? 2 : talk > 0 ? 1 : 0); if (k === lastKey) return; lastKey = k; o._r = rng(o.seed); drawFace(fc.getContext('2d'), o, FACES[name] || FACES.neutral, blink, talk); ft.needsUpdate = true; };
  G.face('neutral');
  const skinM = mat(o.skin, { r: 0.9 }), hoodM = mat(o.hoodie, { r: 0.95 }), pantM = mat(o.pants, { r: 0.95 }), shoeM = mat(o.shoes, { r: 0.8 }), hairM = mat(o.hairC, { r: 1 });
  const faceM = new THREE.MeshStandardMaterial({ map: ft, roughness: 0.9 });
  // proportions (Minecraft-ish, 1 unit ~ 1 m; total ~1.8)
  G.hips = new THREE.Group(); G.hips.position.y = 0.78; root.add(G.hips);
  G.torso = new THREE.Group(); G.hips.add(G.torso);
  const body = box(0.52, 0.62, 0.3, hoodM); body.position.y = 0.31; G.torso.add(body); G.body = body;
  const pocket = box(0.3, 0.12, 0.02, mat(shade(o.hoodie, -0.08))); pocket.position.set(0, 0.12, 0.16); G.torso.add(pocket);
  const hood = box(0.5, 0.12, 0.12, mat(shade(o.hoodie, -0.06))); hood.position.set(0, 0.6, -0.15); G.torso.add(hood);
  const str1 = box(0.02, 0.16, 0.02, mat('#ffffff')); str1.position.set(-0.07, 0.48, 0.16); G.torso.add(str1); const str2 = str1.clone(); str2.position.x = 0.07; G.torso.add(str2);
  G.neck = new THREE.Group(); G.neck.position.y = 0.62; G.torso.add(G.neck);
  G.head = new THREE.Group(); G.neck.add(G.head);
  const hs = 0.5; const headMs = [skinM, skinM, skinM, skinM, faceM, skinM];
  const head = mesh(new THREE.BoxGeometry(hs, hs, hs), headMs); head.position.y = hs / 2 + 0.02; G.head.add(head);
  // hair
  const hr = rng(o.seed + 11);
  const hb = (w, h, d, x, y, z, m = hairM) => { const b = box(w, h, d, m); b.position.set(x, y, z); G.head.add(b); return b; };
  if (o.hair === 'afro') { hb(0.56, 0.16, 0.56, 0, 0.56, -0.01); for (let i = 0; i < 14; i++) hb(0.12 + hr() * 0.08, 0.1 + hr() * 0.08, 0.12 + hr() * 0.08, (hr() - 0.5) * 0.5, 0.6 + hr() * 0.08, (hr() - 0.5) * 0.5); hb(0.56, 0.22, 0.08, 0, 0.4, -0.25); hb(0.06, 0.16, 0.5, -0.27, 0.44, -0.01); hb(0.06, 0.16, 0.5, 0.27, 0.44, -0.01); }
  else if (o.hair === 'short') { hb(0.53, 0.08, 0.53, 0, 0.55, 0); hb(0.53, 0.1, 0.06, 0, 0.47, 0.24); hb(0.53, 0.3, 0.06, 0, 0.38, -0.25); hb(0.04, 0.12, 0.5, -0.26, 0.46, 0); hb(0.04, 0.12, 0.5, 0.26, 0.46, 0); }
  else if (o.hair === 'cap') { const cm = mat(o.capC || '#1f4fb4'); hb(0.54, 0.12, 0.54, 0, 0.56, 0, cm); hb(0.5, 0.03, 0.22, 0, 0.5, 0.34, cm); hb(0.53, 0.1, 0.05, 0, 0.44, -0.25); }
  else if (o.hair === 'bun') { hb(0.54, 0.1, 0.54, 0, 0.55, 0); hb(0.54, 0.4, 0.06, 0, 0.32, -0.25); hb(0.18, 0.16, 0.18, 0, 0.66, -0.12); hb(0.05, 0.36, 0.5, -0.265, 0.34, -0.01); hb(0.05, 0.36, 0.5, 0.265, 0.34, -0.01); }
  // arms
  const arm = (side) => { const sh = new THREE.Group(); sh.position.set(side * 0.34, 0.56, 0); G.torso.add(sh); const up = box(0.16, 0.36, 0.16, hoodM); up.position.y = -0.18; sh.add(up); (G.sleeves = G.sleeves || []).push(up); const el = new THREE.Group(); el.position.y = -0.36; sh.add(el); const lo = box(0.15, 0.24, 0.15, hoodM); lo.position.y = -0.1; el.add(lo); G.sleeves.push(lo); const hand = box(0.13, 0.11, 0.13, skinM); hand.position.y = -0.27; el.add(hand); const tip = new THREE.Group(); tip.position.y = -0.3; el.add(tip); return { sh, el, tip }; };
  G.armL = arm(1); G.armR = arm(-1);
  const leg = (side) => { const hp = new THREE.Group(); hp.position.set(side * 0.13, 0, 0); G.hips.add(hp); const up = box(0.22, 0.4, 0.24, pantM); up.position.y = -0.2; hp.add(up); const kn = new THREE.Group(); kn.position.y = -0.4; hp.add(kn); const lo = box(0.21, 0.3, 0.23, pantM); lo.position.y = -0.15; kn.add(lo); const sh = box(0.23, 0.09, 0.3, shoeM); sh.position.set(0, -0.33, 0.03); kn.add(sh); return { hp, kn }; };
  G.bulk = (k) => { G.body.scale.set(k, 1 + (k - 1) * 0.25, k); G.body.position.y = 0.31 - (k - 1) * 0.06; for (const m of G.sleeves) m.scale.set(1 + (k - 1) * 0.7, 1 + (k - 1) * 0.3, 1 + (k - 1) * 0.7); G.armL.sh.position.x = 0.34 + (k - 1) * 0.26; G.armR.sh.position.x = -0.34 - (k - 1) * 0.26; };
  G.legL = leg(1); G.legR = leg(-1);
  root.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  G.reset = () => { for (const a of [G.armL, G.armR]) { a.sh.rotation.set(0, 0, 0); a.el.rotation.set(0, 0, 0); } for (const l of [G.legL, G.legR]) { l.hp.rotation.set(0, 0, 0); l.kn.rotation.set(0, 0, 0); } G.hips.position.y = 0.78; G.hips.rotation.set(0, 0, 0); G.torso.rotation.set(0, 0, 0); G.head.rotation.set(0, 0, 0); root.rotation.set(0, root.rotation.y, 0); };
  G.sit = () => { G.reset(); G.hips.position.y = 0.5; for (const l of [G.legL, G.legR]) { l.hp.rotation.x = -1.5; l.kn.rotation.x = 1.5; } };
  G.phonePose = (side = -1) => { const a = side < 0 ? G.armR : G.armL; a.sh.rotation.x = -0.9; a.sh.rotation.z = side * -0.15; a.el.rotation.x = -1.2; };
  G.idle = (t) => { G.torso.rotation.z = Math.sin(t * 1.3 + o.seed) * 0.015; G.head.rotation.y += Math.sin(t * 0.7 + o.seed) * 0.04; };
  G.walk = (t, sp = 7) => { const s = Math.sin(t * sp); G.legL.hp.rotation.x = s * 0.6; G.legR.hp.rotation.x = -s * 0.6; G.legL.kn.rotation.x = Math.max(0, -s) * 0.6; G.legR.kn.rotation.x = Math.max(0, s) * 0.6; G.armL.sh.rotation.x = -s * 0.5; G.armR.sh.rotation.x = s * 0.5; G.hips.position.y = 0.78 + Math.abs(Math.cos(t * sp)) * 0.03; };
  G.blinkAt = (t) => (t * 1000 % 3700) < 110;
  return G;
}
export const YOU = { skin: '#8d5a3b', hoodie: '#d8342c', hair: 'afro', seed: 4 };
export const BRO = { skin: '#c99063', hoodie: '#2f64d8', hair: 'short', hairC: '#2a1b12', pants: '#1f2330', seed: 9 };

// a phone you can hold
export function makePhone(screenColor = '#3b6bff') {
  const g = new THREE.Group(); const b = box(0.1, 0.19, 0.015, mat('#141418', { r: 0.4 })); g.add(b);
  const scr = new THREE.MeshStandardMaterial({ color: screenColor, emissive: screenColor, emissiveIntensity: 1.4 }); const s = mesh(new THREE.PlaneGeometry(0.088, 0.172), scr, false, false); s.position.z = 0.009; g.add(s); g.userData.scr = scr; return g;
}

// ---------- voxel rooms ----------
export function voxRoom(o = {}) {
  const s = new THREE.Scene(); s.background = new THREE.Color(o.bg ?? 0x0d1120); const Rm = { scene: s };
  Rm.hemi = new THREE.HemisphereLight(o.night ? 0x6a7cff : 0xfff4e0, 0x2a1e18, o.night ? 0.55 : 1.1); s.add(Rm.hemi);
  Rm.key = new THREE.DirectionalLight(o.night ? 0x8fa2ff : 0xfff0d0, o.night ? 0.9 : 2.6); Rm.key.position.set(-2.5, 4, 3); Rm.key.castShadow = true; Rm.key.shadow.mapSize.set(2048, 2048); Object.assign(Rm.key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 }); s.add(Rm.key);
  Rm.lamp = new THREE.PointLight(0xffb070, o.night ? 9 : 3, 7, 2); Rm.lamp.position.set(1.8, 1.9, 0.5); s.add(Rm.lamp);
  const floorT = canvasTex(256, 256, (g) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 4; x++) { const r = Math.random(); g.fillStyle = `hsl(28,${35 + r * 10}%,${o.night ? 22 + r * 6 : 38 + r * 8}%)`; g.fillRect(x * 64 + (y % 2) * 32, y * 32, 62, 30); } });
  floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(3, 3); floorT.magFilter = THREE.NearestFilter;
  const fl = mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ map: floorT, roughness: 0.9 })); fl.rotation.x = -Math.PI / 2; s.add(fl);
  const wallC = o.wall ?? (o.night ? 0x2a3350 : 0xd9cbb0); const wm = mat(wallC, { r: 1 });
  const back = box(10, 4, 0.2, wm); back.position.set(0, 2, -2.6); s.add(back); const side = box(0.2, 4, 10, wm); side.position.set(-3.6, 2, 2); s.add(side);
  // window
  const win = mesh(new THREE.PlaneGeometry(1.4, 1.1), new THREE.MeshBasicMaterial({ color: o.night ? 0x0b1430 : 0xbfe4ff })); win.position.set(-1.2, 2.1, -2.48); s.add(win);
  if (o.night) for (let i = 0; i < 12; i++) { const st = box(0.03, 0.03, 0.01, new THREE.MeshBasicMaterial({ color: 0xffffff })); st.position.set(-1.8 + Math.random() * 1.2, 1.7 + Math.random() * 0.8, -2.46); s.add(st); }
  const wf = mat(0xf2f2f2); [[1.5, 0.08, -1.2, 2.66], [1.5, 0.08, -1.2, 1.54], [0.08, 1.2, -1.94, 2.1], [0.08, 1.2, -0.46, 2.1], [0.05, 1.1, -1.2, 2.1]].forEach(([w, h, x, y]) => { const b = box(w, h, 0.08, wf); b.position.set(x, y, -2.45); s.add(b); });
  // couch
  Rm.couch = new THREE.Group(); const cm = mat(o.couch ?? 0x2d3f8f, { r: 1 }); const cb = box(2.2, 0.42, 0.85, cm); cb.position.y = 0.21; Rm.couch.add(cb); const cbk = box(2.2, 0.6, 0.22, cm); cbk.position.set(0, 0.6, -0.33); Rm.couch.add(cbk); for (const x of [-1.15, 1.15]) { const a = box(0.2, 0.62, 0.85, cm); a.position.set(x, 0.31, 0); Rm.couch.add(a); }
  for (const x of [-0.53, 0.53]) { const c = box(1.0, 0.12, 0.7, mat(shade('#' + new THREE.Color(o.couch ?? 0x2d3f8f).getHexString(), 0.06))); c.position.set(x, 0.48, 0.05); Rm.couch.add(c); }
  Rm.couch.position.set(0.3, 0, -1.6); s.add(Rm.couch);
  // coffee table + lamp
  const tb = box(1.1, 0.35, 0.55, mat(0x6b4426)); tb.position.set(0.3, 0.175, -0.2); s.add(tb); Rm.table = tb;
  const lb = box(0.12, 1.3, 0.12, mat(0x222222)); lb.position.set(1.9, 0.65, -2.1); s.add(lb); const ls = box(0.4, 0.3, 0.4, new THREE.MeshStandardMaterial({ color: 0xffd9a0, emissive: 0xffb060, emissiveIntensity: o.night ? 1.2 : 0.3 })); ls.position.set(1.9, 1.4, -2.1); s.add(ls);
  // poster + shelf
  const pt = canvasTex(64, 96, (g) => { g.fillStyle = '#ff4fa3'; g.fillRect(0, 0, 64, 96); g.fillStyle = '#ffe14a'; g.fillRect(8, 10, 48, 48); g.fillStyle = '#111'; g.fillRect(8, 66, 48, 8); g.fillRect(8, 80, 30, 6); }); pt.magFilter = THREE.NearestFilter;
  const pm = mesh(new THREE.PlaneGeometry(0.6, 0.9), new THREE.MeshStandardMaterial({ map: pt })); pm.position.set(1.2, 2.2, -2.48); s.add(pm);
  s.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return Rm;
}
export function voxBedroom(o = {}) {
  const Rm = voxRoom({ ...o, couch: 0x3a3a46 }); Rm.couch.visible = false; Rm.table.visible = false;
  const bed = new THREE.Group(); const fr = box(1.2, 0.35, 2.1, mat(0x5a3a22)); fr.position.y = 0.175; bed.add(fr); const mt = box(1.12, 0.18, 2.0, mat(0xf0f0f0)); mt.position.y = 0.44; bed.add(mt); const bl = box(1.18, 0.1, 1.3, mat(o.blanket ?? 0x2f64d8)); bl.position.set(0, 0.56, 0.35); bed.add(bl); const pl = box(0.7, 0.12, 0.35, mat(0xffffff)); pl.position.set(0, 0.6, -0.78); bed.add(pl); const hbd = box(1.2, 0.8, 0.1, mat(0x5a3a22)); hbd.position.set(0, 0.6, -1.03); bed.add(hbd);
  bed.position.set(0.6, 0, -1.4); Rm.scene.add(bed); Rm.bed = bed; bed.traverse(m => { if (m.isMesh) { m.castShadow = m.receiveShadow = true; } });
  return Rm;
}
export function voxStreet(o = {}) {
  const s = new THREE.Scene(); s.background = new THREE.Color(o.sky ?? 0x9fd3ff); s.fog = new THREE.Fog(o.sky ?? 0x9fd3ff, 18, 60); const St = { scene: s };
  s.add(new THREE.HemisphereLight(0xffffff, 0x445533, 1.2)); const sun = new THREE.DirectionalLight(0xfff2d8, 2.6); sun.position.set(-6, 10, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, far: 40 }); s.add(sun);
  const gr = box(80, 0.2, 80, mat(0x5fae4a)); gr.position.y = -0.1; s.add(gr); const side = box(3, 0.22, 80, mat(0xc9c9c9)); side.position.set(0, 0, 0); s.add(side); const road = box(6, 0.21, 80, mat(0x3a3a40)); road.position.set(5, 0, 0); s.add(road);
  const r = rng(o.seed || 5);
  for (let i = 0; i < 16; i++) { const tr = new THREE.Group(); const tk = box(0.35, 1.6, 0.35, mat(0x6b4426)); tk.position.y = 0.8; tr.add(tk); const lf = box(1.8, 1.6, 1.8, mat(new THREE.Color().setHSL(0.3, 0.5, 0.32 + r() * 0.1))); lf.position.y = 2.2; tr.add(lf); const lf2 = box(1.1, 0.9, 1.1, lf.material); lf2.position.y = 3.2; tr.add(lf2); tr.position.set(-2.6 - r() * 1.5, 0, -30 + i * 4 + r()); s.add(tr); }
  for (let i = 0; i < 8; i++) { const h = 3 + r() * 2; const hs = box(5, h, 5, mat(new THREE.Color().setHSL(r(), 0.35, 0.65))); hs.position.set(-9, h / 2, -28 + i * 8); s.add(hs); const rf = box(5.4, 0.6, 5.4, mat(0x7a3a2a)); rf.position.set(-9, h + 0.3, -28 + i * 8); s.add(rf); }
  s.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return St;
}

// ---------- overlay (Day N style) ----------
// CFG: { q1, qHi (pink), days:[{t,label,time}], texts:[{t,end,from,msg,me}], cta:{t, l1, l2}, words (from TL lines) }
export function voxOverlay(CFG, TL) {
  const LINES = TL.tl.filter(x => x.type === 'line');
  function fit(txt, maxW, start, font = "'Archivo Black'") { let fs = start; for (;;) { ctx.font = `${fs}px ${font}`; if (ctx.measureText(txt).width <= maxW || fs < 30) return fs; fs -= 3; } }
  function question(t) {
    const end = CFG.qEnd ?? (LINES[1] ? LINES[1].t : 4); if (t > end + 0.3) return; const a = clamp((end + 0.3 - t) / 0.3);
    ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    const fs1 = fit(CFG.q1, W - 140, 74); strokeText(CFG.q1, W / 2, 360, `${fs1}px 'Archivo Black'`, '#ffffff', '#000', 12);
    const fs2 = Math.min(fit(CFG.qHi, W - 120, 92), 92);
    ctx.save(); ctx.shadowColor = '#ff2fa0'; ctx.shadowBlur = 30; strokeText(CFG.qHi, W / 2, 360 + fs1 * 0.6 + fs2, `${fs2}px 'Archivo Black'`, '#ff4fb3', '#3a0020', 12); ctx.restore();
    ctx.globalAlpha = 1;
  }
  function day(t) {
    const d = [...(CFG.days || [])].reverse().find(x => t >= x.t); if (!d) return; const lt = t - d.t; const pop = 1 + 0.25 * clamp(1 - lt / 0.15);
    ctx.save(); ctx.translate(70, 170); ctx.scale(pop, pop); ctx.textAlign = 'left'; strokeText(d.label, 0, 0, "78px 'Archivo Black'", '#ffcf3a', '#000', 12);
    if (d.time) { ctx.font = "78px 'Archivo Black'"; const w = ctx.measureText(d.label).width; strokeText(' · ' + d.time, w, -6, "44px 'Archivo Black'", '#ffffff', '#000', 9); } ctx.restore();
  }
  function caption(t) {
    const l = LINES.find(x => t >= x.t && t < x.end + 0.15); if (!l || l.title) return; const w = l.words; let i = w.findIndex(x => t < x.e); if (i < 0) i = w.length - 1;
    const st = Math.floor(i / 3) * 3; const grp = w.slice(st, st + 3); ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    const txt = grp.map(x => x.w).join(' '); const fs = fit(txt, W - 160, 70); ctx.font = `${fs}px 'Archivo Black'`; let x0 = W / 2 - ctx.measureText(txt).width / 2; ctx.textAlign = 'left';
    grp.forEach((x, k) => { const s = x.w + (k < grp.length - 1 ? ' ' : ''); const on = st + k === i; strokeText(s, x0, 1460, `${fs}px 'Archivo Black'`, on ? '#ffcf3a' : '#ffffff', '#000', 12); ctx.font = `${fs}px 'Archivo Black'`; x0 += ctx.measureText(s).width; });
  }
  function rr(x, y, w, h, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); }
  function texts(t) {
    for (const m of (CFG.texts || [])) {
      if (t < m.t || t > m.end) continue; const lt = t - m.t, out = m.end - t; const a = clamp(lt / 0.12) * clamp(out / 0.15); const dy = (1 - easeOut(lt / 0.2)) * -60;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(0, dy + (m.y ?? 1000));
      rr(90, 0, W - 180, 230 + (m.msg.split('\n').length - 1) * 54, 34, 'rgba(255,255,255,0.96)'); ctx.textAlign = 'left';
      ctx.fillStyle = '#2f6bff'; ctx.beginPath(); ctx.arc(150, 62, 30, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = "800 32px Inter"; ctx.textAlign = 'center'; ctx.fillText(m.from[0], 150, 74);
      ctx.textAlign = 'left'; ctx.fillStyle = '#111'; ctx.font = "800 40px Inter"; ctx.fillText(m.from, 196, 76); ctx.fillStyle = '#888'; ctx.font = "600 28px Inter"; ctx.fillText(m.sub || 'iMessage · now', W - 380, 74);
      ctx.font = "800 44px Inter"; const ml = m.msg.split('\n'); const tw = Math.min(W - 300, Math.max(...ml.map(x => ctx.measureText(x).width)) + 70); const bx = m.me ? W - 120 - tw : 130; const bh = 82 + (ml.length - 1) * 54;
      rr(bx, 112, tw, bh, 41, m.me ? '#2f6bff' : '#e8e8ee'); ctx.fillStyle = m.me ? '#fff' : '#111'; ml.forEach((x, k) => ctx.fillText(x, bx + 35, 168 + k * 54));
      ctx.restore();
    }
  }
  function cta(t) {
    const c = CFG.cta; if (!c || t < c.t) return; const lt = t - c.t; const a = clamp(lt / 0.2);
    ctx.fillStyle = `rgba(0,0,0,${0.55 * a})`; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = a; ctx.textAlign = 'center';
    const f1 = fit(c.l1, W - 140, 70); strokeText(c.l1, W / 2, 820, `${f1}px 'Archivo Black'`, '#ffffff', '#000', 12);
    const f2 = fit(c.l2, W - 120, 84); ctx.save(); ctx.shadowColor = '#ff2fa0'; ctx.shadowBlur = 26; strokeText(c.l2, W / 2, 820 + f1 + 30, `${f2}px 'Archivo Black'`, '#ff4fb3', '#3a0020', 12); ctx.restore(); ctx.globalAlpha = 1;
  }
  const ov = (t, shot, lt) => { if (window.__cover) { ov.cover(); return; } question(t); day(t); texts(t); caption(t); cta(t); const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, H * 0.8); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.3)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); };
  ov.cover = () => { ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(0, 0, W, H); ctx.textAlign = 'center'; ctx.font = "60px 'Archivo Black'"; const bw = ctx.measureText('3D WHAT IF').width + 70; rr(W / 2 - bw / 2, 240, bw, 96, 18, '#ffcf3a'); ctx.fillStyle = '#111'; ctx.fillText('3D WHAT IF', W / 2, 310);
    const f1 = fit(CFG.c1 || CFG.q1, W - 100, 110); strokeText(CFG.c1 || CFG.q1, W / 2, 470, `${f1}px 'Archivo Black'`, '#ffffff', '#000', 16);
    const f2 = fit(CFG.c2 || CFG.qHi, W - 90, 130); ctx.save(); ctx.shadowColor = '#ff2fa0'; ctx.shadowBlur = 36; strokeText(CFG.c2 || CFG.qHi, W / 2, 470 + f1 * 0.25 + f2, `${f2}px 'Archivo Black'`, '#ff4fb3', '#3a0020', 16); ctx.restore(); };
  return ov;
}
export { L };

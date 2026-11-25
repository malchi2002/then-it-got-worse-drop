// Then It Got Worse — shared 3D + overlay library
import * as THREE from './three.module.js';
export { THREE };
export const W = 1080, H = 1920;
export const glc = document.createElement('canvas'); glc.width = W; glc.height = H;
export const out = document.getElementById('out'); out.width = W; out.height = H;
export const ctx = out.getContext('2d');
export const R = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true });
R.setSize(W, H, false);
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
R.outputColorSpace = THREE.SRGBColorSpace;

// ---------- utils ----------
export function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
export const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
export const lerp = (a, b, k) => a + (b - a) * k;
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
export function mat(c, o = {}) { return new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? 0.75, metalness: o.m ?? 0, ...(o.extra || {}) }); }
export function mesh(geo, m, cast = true, recv = true) { const x = new THREE.Mesh(geo, m); x.castShadow = cast; x.receiveShadow = recv; return x; }
export function box(w, h, d, c, o) { return mesh(new THREE.BoxGeometry(w, h, d), (c && c.isMaterial) ? c : mat(c, o)); }
export function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
export function signTex(lines, o = {}) { return canvasTex(o.w || 512, o.h || 256, (g, w, h) => { g.fillStyle = o.bg || '#2f7d4a'; g.fillRect(0, 0, w, h); if (o.border !== false) { g.strokeStyle = o.fg || '#fff'; g.lineWidth = 10; g.strokeRect(12, 12, w - 24, h - 24); } g.fillStyle = o.fg || '#fff'; g.textAlign = 'center'; lines.forEach(([txt, font, y]) => { g.font = font; g.fillText(txt, w / 2, y); }); }); }
export const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _p = new THREE.Vector3();
export function makeInstanced(geo, m, n) { const im = new THREE.InstancedMesh(geo, m, n); im.castShadow = true; im.frustumCulled = false; return im; }
export function hideAll(im) { _m.makeScale(0, 0, 0); for (let i = 0; i < im.count; i++) im.setMatrixAt(i, _m); im.instanceMatrix.needsUpdate = true; }

// ---------- character ----------
export const DALE = { wood: 0xe8a65a, nose: true, shirt: 0x3d5a80 };
export function makeGuy(o) {
  const wood = mat(o.wood, { r: 0.55 }), dark = mat(0x2a1a12, { r: 0.6 });
  const root = new THREE.Group();
  const pelvisY = o.sit ? 0.55 : 0.95;
  const body = new THREE.Group(); body.position.y = pelvisY; root.add(body); body.userData.y0 = pelvisY;
  const pelvis = mesh(new THREE.SphereGeometry(0.17, 20, 14), o.pants ? mat(o.pants) : wood); pelvis.scale.set(1.25, 0.8, 0.9); body.add(pelvis);
  const torso = mesh(new THREE.CapsuleGeometry(0.2, 0.38, 6, 16), wood); torso.position.y = 0.38; torso.scale.set(1.2, 1, 0.85); body.add(torso);
  const neckG = new THREE.Group(); neckG.position.y = 0.72; body.add(neckG);
  const neck = mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.14, 12), wood); neck.position.y = 0.05; neckG.add(neck);
  const head = new THREE.Group(); head.position.y = 0.12; neckG.add(head);
  const skull = mesh(new THREE.SphereGeometry(0.2, 28, 20), wood); skull.scale.set(0.95, 1.12, 0.98); skull.position.y = 0.17; head.add(skull);
  const face = new THREE.Group(); face.position.set(0, 0.17, 0); head.add(face);
  const eyeG = new THREE.SphereGeometry(0.026, 12, 10);
  const eL = mesh(eyeG, dark, false); eL.position.set(-0.07, 0.03, 0.185); eL.scale.set(1, 1.15, 0.5); face.add(eL);
  const eR = eL.clone(); eR.position.x = 0.07; face.add(eR);
  const lidM = mat(o.wood, { r: 0.55 });
  const lidL = mesh(new THREE.SphereGeometry(0.03, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), lidM, false); lidL.position.set(-0.07, 0.052, 0.186); lidL.scale.set(1.15, 0.6, 0.55); face.add(lidL);
  const lidR = lidL.clone(); lidR.position.x = 0.07; face.add(lidR);
  const browG = new THREE.BoxGeometry(0.075, 0.014, 0.02);
  const bL = mesh(browG, dark, false); bL.position.set(-0.07, 0.095, 0.18); face.add(bL);
  const bR = mesh(browG, dark, false); bR.position.set(0.07, 0.095, 0.18); face.add(bR);
  const mouth = mesh(new THREE.BoxGeometry(0.075, 0.012, 0.02), dark, false); mouth.position.set(0, -0.085, 0.18); face.add(mouth);
  if (o.nose) { const n = mesh(new THREE.SphereGeometry(0.036, 14, 10), mat(0xd9432f, { r: 0.4 }), false); n.position.set(0, -0.015, 0.205); face.add(n); }
  if (o.glasses) { const gm = mat(0x151515, { r: 0.3, m: 0.4 }); for (const sx of [-1, 1]) { const r = mesh(new THREE.TorusGeometry(0.045, 0.008, 6, 20), gm, false); r.position.set(sx * 0.072, 0.03, 0.2); face.add(r); } const br = mesh(new THREE.BoxGeometry(0.05, 0.008, 0.008), gm, false); br.position.set(0, 0.035, 0.205); face.add(br); }
  if (o.hat) { const hm = mat(o.hat); const brim = mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.02, 20), hm); brim.position.y = 0.33; head.add(brim); const cr = mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.18, 20), hm); cr.position.y = 0.42; head.add(cr); }
  if (o.cap) { const cm = mat(o.cap); const c = mesh(new THREE.SphereGeometry(0.205, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), cm); c.position.y = 0.24; head.add(c); const v = mesh(new THREE.BoxGeometry(0.2, 0.02, 0.16), cm); v.position.set(0, 0.25, 0.22); head.add(v); }
  if (o.hair) { const hm = mat(o.hair, { r: 0.9 }); const c = mesh(new THREE.SphereGeometry(0.21, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2.2), hm); c.position.y = 0.22; c.scale.set(1, 0.9, 1.05); head.add(c); }
  let tie = null;
  if (o.tie) { tie = new THREE.Group(); tie.position.set(0, 0.66, 0.17); body.add(tie); const tm = mesh(new THREE.BoxGeometry(0.07, 0.34, 0.02), mat(0xc8302a, { r: 0.5 })); tm.position.y = -0.17; tie.add(tm); }
  if (o.shirt) { const s = mesh(new THREE.CapsuleGeometry(0.205, 0.3, 6, 16), mat(o.shirt, { r: 0.8 })); s.position.y = 0.4; s.scale.set(1.22, 0.95, 0.87); body.add(s); }
  const arm = (side) => {
    const sh = new THREE.Group(); sh.position.set(side * 0.29, 0.6, 0); body.add(sh);
    const up = mesh(new THREE.CapsuleGeometry(0.058, 0.24, 4, 10), o.shirt ? mat(o.shirt, { r: 0.8 }) : wood); up.position.y = -0.16; sh.add(up);
    const el = new THREE.Group(); el.position.y = -0.33; sh.add(el);
    const fo = mesh(new THREE.CapsuleGeometry(0.05, 0.22, 4, 10), wood); fo.position.y = -0.15; el.add(fo);
    const hand = mesh(new THREE.SphereGeometry(0.06, 12, 10), wood); hand.position.y = -0.31; hand.scale.set(0.9, 1.1, 0.7); el.add(hand);
    const grip = new THREE.Group(); grip.position.y = -0.33; el.add(grip);
    return { sh, el, grip };
  };
  const aL = arm(-1), aR = arm(1);
  const leg = (side) => {
    const hip = new THREE.Group(); hip.position.set(side * 0.11, -0.05, 0); body.add(hip);
    const th = mesh(new THREE.CapsuleGeometry(0.075, 0.33, 4, 10), o.pants ? mat(o.pants) : wood); th.position.y = -0.22; hip.add(th);
    const kn = new THREE.Group(); kn.position.y = -0.44; hip.add(kn);
    const sh = mesh(new THREE.CapsuleGeometry(0.062, 0.32, 4, 10), o.pants ? mat(o.pants) : wood); sh.position.y = -0.2; kn.add(sh);
    const ft = mesh(new THREE.BoxGeometry(0.1, 0.07, 0.22), dark); ft.position.set(0, -0.42, 0.06); kn.add(ft);
    if (o.sit) { hip.rotation.x = -Math.PI / 2; kn.rotation.x = Math.PI / 2; }
    return { hip, kn };
  };
  const lL = leg(-1), lR = leg(1);
  aL.sh.rotation.z = 0.12; aR.sh.rotation.z = -0.12;
  if (o.sit) { aL.sh.rotation.x = -0.5; aR.sh.rotation.x = -0.5; aL.el.rotation.x = -0.9; aR.el.rotation.x = -0.9; }
  const g = { root, body, neckG, head, face, lidL, lidR, bL, bR, mouth, aL, aR, lL, lR, tie, eL, eR, sit: !!o.sit };
  return g;
}
export function setFace(g, e) {
  const lid = e.lid ?? 0.35;
  g.lidL.position.y = g.lidR.position.y = 0.075 - lid * 0.05; g.lidL.scale.y = g.lidR.scale.y = 0.6 + lid * 1.2;
  const brow = e.brow ?? 0;
  g.bL.position.y = g.bR.position.y = 0.095 + brow * 0.02;
  g.bL.rotation.z = (e.browTilt ?? 0); g.bR.rotation.z = -(e.browTilt ?? 0);
  const m = e.mouth ?? 0; g.mouth.scale.set(1 - m * 0.3, 1 + m * 4, 1);
}
export function resetPose(g) {
  g.neckG.rotation.set(0, 0, 0); g.body.rotation.set(0, 0, 0); g.body.position.y = g.body.userData.y0;
  for (const a of [g.aL, g.aR]) { a.sh.rotation.set(g.sit ? -0.5 : 0, 0, a === g.aL ? 0.12 : -0.12); a.el.rotation.set(g.sit ? -0.9 : 0, 0, 0); }
  for (const l of [g.lL, g.lR]) { l.hip.rotation.set(g.sit ? -Math.PI / 2 : 0, 0, 0); l.kn.rotation.set(g.sit ? Math.PI / 2 : 0, 0, 0); }
  setFace(g, { lid: 0.4 });
}
// generic "big effort" pose: wind-up (dt<0) then release
export function effortPose(g, dt, k = 1) {
  let pitch = 0, face = { lid: 0.35 };
  if (dt > -0.7 && dt < 0) { const a = (dt + 0.7) / 0.7; pitch = -0.38 * ease(a) * k; face = { lid: 0.2, brow: 0.8 * a, mouth: 0.6 * a }; }
  else if (dt >= 0 && dt < 0.12) { pitch = lerp(-0.38 * k, 0.55 * k, dt / 0.12); face = { lid: 1, brow: -0.5, mouth: 0.9 }; }
  else if (dt >= 0.12 && dt < 1.2) { pitch = 0.55 * k * (1 - easeOut((dt - 0.12) / 1.08)); face = { lid: lerp(1, 0.4, (dt - 0.12) / 1.08), brow: -0.2, mouth: lerp(0.8, 0, clamp((dt - 0.12) / 0.4)) }; }
  g.neckG.rotation.x = pitch; setFace(g, face); return pitch;
}
// walk / run cycle (phase in radians), amplitude 0..1
export function walkPose(g, ph, amp = 1) {
  const s = Math.sin(ph) * 0.6 * amp;
  g.lL.hip.rotation.x = s; g.lR.hip.rotation.x = -s;
  g.lL.kn.rotation.x = Math.max(0, -Math.sin(ph)) * 0.9 * amp; g.lR.kn.rotation.x = Math.max(0, Math.sin(ph)) * 0.9 * amp;
  g.aL.sh.rotation.x = -s * 0.9; g.aR.sh.rotation.x = s * 0.9; g.aL.el.rotation.x = -0.5 * amp; g.aR.el.rotation.x = -0.5 * amp;
  g.body.position.y = g.body.userData.y0 + Math.abs(Math.cos(ph)) * 0.04 * amp;
}
export function blinkAt(g, t, ph = 0) { if (((t + ph) % 3.7) < 0.12) setFace(g, { lid: 1 }); }

// ---------- camera ----------
export const cam = new THREE.PerspectiveCamera(40, W / H, 0.05, 4000);
export function setCam(p, look, fov = 40, shake = 0, t = 0) {
  cam.fov = fov; cam.updateProjectionMatrix(); cam.position.copy(p);
  if (shake > 0) { cam.position.x += Math.sin(t * 91) * shake * 0.6 + Math.sin(t * 37) * shake; cam.position.y += Math.cos(t * 77) * shake * 0.8; }
  cam.lookAt(look);
}

// ---------- environments ----------
const winTex = (hue, light) => canvasTex(128, 256, (g, w, h) => { g.fillStyle = `hsl(${hue},35%,${light}%)`; g.fillRect(0, 0, w, h); for (let y = 10; y < h; y += 32) for (let x = 10; x < w; x += 30) { g.fillStyle = '#bfe3f7'; g.fillRect(x, y, 18, 20); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x, y, 6, 20); } });
const nightWinTex = (hue, light) => canvasTex(128, 256, (g, w, h) => { const r = rng(hue * 7 + light); g.fillStyle = `hsl(${hue},25%,${light * 0.35}%)`; g.fillRect(0, 0, w, h); for (let y = 10; y < h; y += 32) for (let x = 10; x < w; x += 30) { g.fillStyle = r() < 0.55 ? '#ffd98a' : '#1d2433'; g.fillRect(x, y, 18, 20); } });
export const SKIES = {
  day: { sky: 0x9fd0f5, fog: [60, 260], hemi: [0xdbefff, 0x7a6a50, 1.1], sun: [0xfff0d6, 3.0], sunPos: [30, 50, 20], ground: 0x8fbf6a },
  sunset: { sky: 0xf2a874, fog: [50, 240], hemi: [0xffd2b0, 0x5a4060, 0.8], sun: [0xff9a50, 3.0], sunPos: [-60, 18, -30], ground: 0x8a9a5a },
  night: { sky: 0x0e1430, fog: [40, 220], hemi: [0x30406a, 0x101018, 0.45], sun: [0x8fa8ff, 0.8], sunPos: [-20, 50, 10], ground: 0x2c3a2a, night: true },
  desert: { sky: 0xbfe0f5, fog: [80, 320], hemi: [0xfff2dc, 0xb08a5a, 1.2], sun: [0xfff2d0, 3.2], sunPos: [30, 60, 10], ground: 0xe0c48a },
  snow: { sky: 0xc9dcec, fog: [40, 200], hemi: [0xffffff, 0x9aa8b8, 1.2], sun: [0xf4f6ff, 2.4], sunPos: [30, 40, 30], ground: 0xf1f4f8 },
};
export function buildTown(o = {}) {
  const P = SKIES[o.sky || 'day'];
  const s = new THREE.Scene(); s.background = new THREE.Color(P.sky); s.fog = new THREE.Fog(P.sky, P.fog[0], P.fog[1]);
  const T = { scene: s };
  T.hemi = new THREE.HemisphereLight(P.hemi[0], P.hemi[1], P.hemi[2]); s.add(T.hemi);
  T.sun = new THREE.DirectionalLight(P.sun[0], P.sun[1]); T.sun.position.set(...P.sunPos); T.sun.castShadow = true; T.sun.shadow.mapSize.set(2048, 2048);
  Object.assign(T.sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 1, far: 300 }); T.sun.shadow.bias = -0.0008; s.add(T.sun);
  T.sunTarget = new THREE.Object3D(); s.add(T.sunTarget); T.sun.target = T.sunTarget;
  const ground = mesh(new THREE.PlaneGeometry(1600, 1600), mat(P.ground, { r: 1 })); ground.rotation.x = -Math.PI / 2; s.add(ground);
  const roadM = mat(o.sky === 'night' ? 0x2d2f36 : 0x55575e, { r: 0.9 }), lineM = mat(0xf2e9c9);
  for (let i = -5; i <= 5; i++) { const a = box(500, 0.02, 7, roadM); a.position.set(0, 0.01, i * 24 + 12); a.castShadow = false; s.add(a); const b = box(7, 0.02, 500, roadM); b.position.set(i * 24 + 12, 0.012, 0); b.castShadow = false; s.add(b); }
  for (let i = -240; i < 240; i += 4) { const d = box(1.8, 0.03, 0.18, lineM); d.position.set(i, 0.03, 12); d.castShadow = false; s.add(d); }
  const palettes = [[28, 72], [200, 70], [12, 66], [45, 75], [330, 74], [160, 62], [215, 60]];
  const texes = palettes.map(([h, l]) => P.night ? nightWinTex(h, l) : winTex(h, l));
  T.buildings = []; const r = rng(o.seed || 3);
  const skip = o.skip || [[0, -1]];
  for (let gx = -5; gx < 5; gx++) for (let gz = -5; gz < 5; gz++) for (let k = 0; k < 2; k++) {
    if (k === 0 && skip.some(([a, b]) => a === gx && b === gz)) continue;
    const w = 6 + r() * 6, d = 6 + r() * 6, h = (o.low ? 4 : 6) + r() * (o.low ? 8 : 22) * (1 - Math.min(1, Math.hypot(gx, gz) / 6) * 0.6);
    const t = texes[Math.floor(r() * texes.length)].clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(Math.max(1, Math.round(w / 4)), Math.max(1, Math.round(h / 8)));
    const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.8, ...(P.night ? { emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.6 } : {}) });
    const b = mesh(new THREE.BoxGeometry(w, h, d), [m, m, mat(0xb8b0a0), mat(0x777777), m, m]);
    b.position.set(gx * 24 + (k ? 4 : -4) + (r() - 0.5) * 2, h / 2, gz * 24 + (r() - 0.5) * 4); s.add(b); T.buildings.push({ b, w, h, d });
  }
  for (let i = 0; i < 110; i++) { const tr = new THREE.Group(); const trunk = mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.6, 6), mat(0x7a5232)); trunk.position.y = 0.8; tr.add(trunk); const c = mesh(new THREE.IcosahedronGeometry(1.4, 0), mat(o.sky === 'snow' ? 0xe8eef4 : new THREE.Color().setHSL(0.27 + r() * 0.06, 0.45, P.night ? 0.2 : 0.42))); c.position.y = 2.6; tr.add(c); tr.position.set((r() - 0.5) * 230, 0, ((r() * 10) | 0) * 24 + 12 + (r() < 0.5 ? -5 : 5) - 120); s.add(tr); }
  if (P.night) { for (let i = -10; i <= 10; i++) { const l = new THREE.PointLight(0xffc070, 30, 18, 2); l.position.set(i * 12, 5, 7); s.add(l); const pole = box(0.15, 5, 0.15, mat(0x333333)); pole.position.set(i * 12, 2.5, 7.5); s.add(pole); } }
  T.clouds = new THREE.Group(); s.add(T.clouds);
  if (!P.night) for (let i = 0; i < 18; i++) { const c = new THREE.Group(); for (let j = 0; j < 5; j++) { const p = mesh(new THREE.IcosahedronGeometry(3 + r() * 3, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true }), false, false); p.position.set(j * 4 - 8, r() * 2, r() * 3); c.add(p); } c.position.set((r() - 0.5) * 300, 60 + r() * 40, -60 - r() * 120); T.clouds.add(c); }
  // FX available in every town
  T.glass = makeInstanced(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshStandardMaterial({ color: 0xcfeeff, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.85, side: THREE.DoubleSide }), 1400); T.glass.castShadow = false; s.add(T.glass);
  const gr = rng(9); T.glassData = [];
  for (let i = 0; i < 1400; i++) { const B = T.buildings[Math.floor(gr() * T.buildings.length)]; const face = Math.floor(gr() * 4); const nx = [1, -1, 0, 0][face], nz = [0, 0, 1, -1][face]; const px = B.b.position.x + nx * B.w / 2 + (nz ? (gr() - 0.5) * B.w : 0); const pz = B.b.position.z + nz * B.d / 2 + (nx ? (gr() - 0.5) * B.d : 0); T.glassData.push({ p0: V(px, 1 + gr() * (B.h - 1), pz), v: V(nx * (4 + gr() * 10) + (gr() - .5) * 4, 2 + gr() * 6, nz * (4 + gr() * 10) + (gr() - .5) * 4), spin: gr() * 12, dist: 0 }); }
  T.ring = mesh(new THREE.RingGeometry(0.92, 1, 96), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, side: THREE.DoubleSide }), false, false); T.ring.rotation.x = -Math.PI / 2; s.add(T.ring);
  T.dome = mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false }), false, false); s.add(T.dome);
  T.ring.visible = T.dome.visible = false; hideAll(T.glass);
  return T;
}
export function shockwave(T, center, tt, speed = 60, life = 3) {
  T.ring.visible = T.dome.visible = tt > 0 && tt < life;
  const R0 = speed * tt; T.ring.scale.setScalar(R0 + 0.01); T.ring.position.set(center.x, 0.5, center.z); T.ring.material.opacity = 0.85 * clamp(1 - tt / life);
  T.dome.scale.setScalar(R0 * 0.95 + 0.01); T.dome.position.set(center.x, 0, center.z); T.dome.material.opacity = 0.22 * clamp(1 - tt / (life * 0.8));
}
export function glassBurst(T, center, tt, speed = 60) {
  for (let i = 0; i < T.glassData.length; i++) { const d = T.glassData[i]; const st = Math.hypot(d.p0.x - center.x, d.p0.z - center.z) / speed; const q = tt - st; if (q < 0 || tt <= 0) { _m.makeScale(0, 0, 0); } else { _p.copy(d.p0).addScaledVector(d.v, q); _p.y -= 4.9 * q * q; if (_p.y < 0.05) _p.y = 0.05; _m.compose(_p, _q.setFromEuler(_e.set(d.spin * q, d.spin * q * .6, 0)), _s.setScalar(0.6 + (i % 5) * 0.2)); } T.glass.setMatrixAt(i, _m); }
  T.glass.instanceMatrix.needsUpdate = true;
}
export function buildSpace() {
  const s = new THREE.Scene(); s.background = new THREE.Color(0x03040b); const S = { scene: s };
  const starG = new THREE.BufferGeometry(); const sr = rng(31); const pos = [];
  for (let i = 0; i < 3000; i++) { const u = sr() * 2 - 1, a = sr() * Math.PI * 2, rr = 1200; const q = Math.sqrt(1 - u * u); pos.push(Math.cos(a) * q * rr, u * rr, Math.sin(a) * q * rr); }
  starG.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  S.stars = new THREE.Points(starG, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false })); s.add(S.stars);
  S.sun = new THREE.DirectionalLight(0xffffff, 3.2); S.sun.position.set(-50, 20, 40); s.add(S.sun); s.add(new THREE.AmbientLight(0x334466, 0.35));
  const et = canvasTex(2048, 1024, (g, w, h) => {
    g.fillStyle = '#1f5fb3'; g.fillRect(0, 0, w, h); const r = rng(41);
    for (let i = 0; i < 70; i++) { const x = r() * w, y = h * 0.15 + r() * h * 0.7, rad = 30 + r() * 140; g.fillStyle = r() < 0.7 ? '#4f9a55' : '#c9a86a'; g.beginPath(); for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, rr = rad * (0.6 + r() * 0.5); g.lineTo(x + Math.cos(a) * rr * 1.4, y + Math.sin(a) * rr); } g.fill(); }
    g.fillStyle = '#eef6ff'; g.fillRect(0, 0, w, 60); g.fillRect(0, h - 60, w, 60);
    g.globalAlpha = 0.55; g.fillStyle = '#ffffff'; for (let i = 0; i < 120; i++) { const x = r() * w, y = r() * h; g.beginPath(); g.ellipse(x, y, 40 + r() * 120, 8 + r() * 20, 0, 0, 7); g.fill(); }
  });
  S.earth = mesh(new THREE.SphereGeometry(20, 64, 48), new THREE.MeshStandardMaterial({ map: et, roughness: 0.8 }), false, false); s.add(S.earth);
  S.atmo = mesh(new THREE.SphereGeometry(20.9, 64, 48), new THREE.MeshBasicMaterial({ color: 0x6fb6ff, transparent: true, opacity: 0.22, side: THREE.BackSide, depthWrite: false }), false, false); s.add(S.atmo);
  const mt = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#b9b9b4'; g.fillRect(0, 0, w, h); const r = rng(5); for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(90,90,90,${0.2 + r() * 0.3})`; g.beginPath(); g.arc(r() * w, r() * h, 3 + r() * 18, 0, 7); g.fill(); } });
  S.moon = mesh(new THREE.SphereGeometry(5.4, 48, 32), new THREE.MeshStandardMaterial({ map: mt, roughness: 1 }), false, false); S.moon.position.set(140, 20, -160); s.add(S.moon);
  S.sunDisk = mesh(new THREE.SphereGeometry(40, 32, 16), new THREE.MeshBasicMaterial({ color: 0xffe9a8 }), false, false); S.sunDisk.position.set(-900, 300, 600); s.add(S.sunDisk);
  S.trailGeo = new THREE.BufferGeometry(); S.trailGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Array(400 * 3).fill(0), 3));
  S.trail = new THREE.Line(S.trailGeo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 })); S.trail.frustumCulled = false; s.add(S.trail); S.trail.visible = false;
  S.streak = mesh(new THREE.ConeGeometry(0.5, 1, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }), false, false); s.add(S.streak); S.streak.visible = false;
  return S;
}
export function setTrail(S, fn, n = 400) { const pa = S.trailGeo.attributes.position; for (let i = 0; i < 400; i++) { const p = fn(Math.min(i, n - 1)); pa.setXYZ(i, p.x, p.y, p.z); } pa.needsUpdate = true; }
export function buildLab(o = {}) {
  const s = new THREE.Scene(); const bg = o.bg ?? 0xf3e9d6; s.background = new THREE.Color(bg); s.fog = new THREE.Fog(bg, 14, 40); const L = { scene: s };
  s.add(new THREE.HemisphereLight(0xffffff, 0xb89c7a, 1.2));
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.6); sun.position.set(4, 8, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 }); s.add(sun);
  const fl = mesh(new THREE.PlaneGeometry(80, 80), mat(o.floor ?? 0xe2d2b6, { r: 0.95 })); fl.rotation.x = -Math.PI / 2; s.add(fl);
  return L;
}
export function tapeMeasure(maxLabel = 8, unit = 'm', len = 8.5) {
  const tape = canvasTex(2048, 128, (g, w, h) => { g.fillStyle = '#f2c230'; g.fillRect(0, 0, w, h); g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; for (let m = 0; m <= maxLabel; m++) { const x = 30 + m * (w - 60) / maxLabel; g.fillRect(x - 3, 0, 6, 60); g.font = 'bold 44px Inter'; g.fillText(m + ' ' + unit, x + (m === maxLabel ? -40 : 0), 112); } });
  const t = mesh(new THREE.PlaneGeometry(len, 0.55), new THREE.MeshStandardMaterial({ map: tape, roughness: 0.6 }), false, true); t.rotation.x = -Math.PI / 2; return t;
}
// interior room shell (office/kitchen/classroom etc.)
export function buildRoom(o = {}) {
  const s = new THREE.Scene(); const sky = new THREE.Color(o.sky ?? 0xbfe0ff); s.background = sky; const Rm = { scene: s, sky };
  Rm.hemi = new THREE.HemisphereLight(0xe8f2ff, 0x6b5440, 1.0); s.add(Rm.hemi);
  Rm.sun = new THREE.DirectionalLight(o.sunColor ?? 0xffe2b0, o.sunI ?? 3.2); Rm.sun.position.set(-3, 6, -6); Rm.sun.castShadow = true; Rm.sun.shadow.mapSize.set(2048, 2048);
  Object.assign(Rm.sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 0.5, far: 30 }); Rm.sun.shadow.bias = -0.0005; s.add(Rm.sun);
  Rm.fill = new THREE.PointLight(0xffc98a, 6, 8, 2); Rm.fill.position.set(1.6, 2.4, 1.5); s.add(Rm.fill);
  Rm.red = new THREE.PointLight(0xff2a1a, 0, 6, 2); Rm.red.position.set(0.8, 1.6, 2.2); s.add(Rm.red);
  const floor = mesh(new THREE.PlaneGeometry(14, 14), mat(o.floor ?? 0x9b6b45, { r: 0.6 })); floor.rotation.x = -Math.PI / 2; s.add(floor);
  if (o.tiles) { const tt = canvasTex(256, 256, (g, w, h) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#f4f4f4' : '#2b2b33'; g.fillRect(x * 32, y * 32, 32, 32); } }); tt.wrapS = tt.wrapT = THREE.RepeatWrapping; tt.repeat.set(5, 5); floor.material = new THREE.MeshStandardMaterial({ map: tt, roughness: 0.4 }); }
  const wallM = mat(o.wall ?? 0xe9dcc4, { r: 0.9 });
  Rm.walls = new THREE.Group(); s.add(Rm.walls);
  const wb = (w, h, x, y) => { const b = box(w, h, 0.2, wallM); b.position.set(x, y, -3); Rm.walls.add(b); };
  wb(3.4, 3.2, -3.3, 1.6); wb(3.4, 3.2, 3.3, 1.6); wb(3.2, 0.9, 0, 0.45); wb(3.2, 0.6, 0, 2.9);
  const frameM = mat(0xffffff, { r: 0.5 });
  [[3.3, 0.08, 0, 0.92], [3.3, 0.08, 0, 2.6], [0.08, 1.75, -1.62, 1.76], [0.08, 1.75, 1.62, 1.76], [0.06, 1.7, 0, 1.76]].forEach(([w, h, x, y]) => { const b = box(w, h, 0.26, frameM); b.position.set(x, y, -3); Rm.walls.add(b); });
  const side = box(0.2, 3.2, 8, wallM); side.position.set(-5, 1.6, 1); Rm.walls.add(side);
  const side2 = side.clone(); side2.position.x = 5; Rm.walls.add(side2);
  Rm.ceiling = box(10.2, 0.15, 8.2, mat(0xf2ece0, { r: 0.9 })); Rm.ceiling.position.set(0, 3.25, 1); s.add(Rm.ceiling);
  Rm.ceilLamp = box(1.4, 0.05, 0.3, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2d0, emissiveIntensity: 1.2 })); Rm.ceilLamp.position.set(0, 3.15, 0); s.add(Rm.ceilLamp);
  Rm.skyline = new THREE.Group(); s.add(Rm.skyline);
  const r = rng(o.seed || 7);
  for (let i = 0; i < 26; i++) { const h = 2 + r() * 9; const b = box(1 + r() * 1.6, h, 1.2, new THREE.Color().setHSL(0.55 + r() * 0.1, 0.25, 0.62 + r() * 0.15)); b.position.set(-14 + i * 1.15 + r() * 0.4, h / 2 - 1, -12 - r() * 10); b.castShadow = false; Rm.skyline.add(b); }
  if (o.poster) { const pm = mesh(new THREE.PlaneGeometry(0.8, 1.0), new THREE.MeshStandardMaterial({ map: o.poster, roughness: 0.8 })); pm.position.set(2.6, 1.9, -2.88); Rm.walls.add(pm); }
  Rm.roofOff = (on) => { Rm.ceiling.visible = !on; Rm.ceilLamp.visible = !on; };
  return Rm;
}
// puff cloud (pure function of time)
export function puffData(seed, n) { const ur = rng(seed); const d = []; for (let i = 0; i < n; i++) d.push({ d: V((ur() - 0.5) * 0.5, (ur() - 0.5) * 0.35, (ur() - 0.5) * 0.5), sp: 0.6 + ur() * 0.8, sz: 0.5 + ur() }); return d; }
export function makePuff(scene, n = 60, color = 0xffffff, op = 0.55, seed = 5) { const im = makeInstanced(new THREE.SphereGeometry(0.1, 10, 8), new THREE.MeshStandardMaterial({ color, transparent: true, opacity: op, roughness: 1 }), n); im.castShadow = false; im.userData = { data: puffData(seed, n), op }; scene.add(im); hideAll(im); return im; }
export function puffAt(im, origin, dir, tau, k = 1, life = 3) {
  const data = im.userData.data; if (tau < 0 || tau > life) { hideAll(im); return; }
  for (let i = 0; i < data.length; i++) {
    const d = data[i]; const dist = k * d.sp * 1.8 * (1 - Math.exp(-tau * 2.5));
    _p.set(origin.x + dir.x * dist + d.d.x * dist * 0.6, origin.y + dir.y * dist + d.d.y * dist * 0.6 + tau * 0.05, origin.z + dir.z * dist + d.d.z * dist * 0.6);
    const sc = (0.3 + tau * 1.2) * d.sz * (0.6 + k * 0.4) * (tau < life - 1 ? 1 : life - tau);
    _m.compose(_p, _q.identity(), _s.set(sc, sc, sc)); im.setMatrixAt(i, _m);
  }
  im.instanceMatrix.needsUpdate = true; im.material.opacity = im.userData.op * clamp(1 - tau / life);
}
// generic flying debris: objects launched from p0 with v
export function debrisData(seed, n, f) { const r = rng(seed); const a = []; for (let i = 0; i < n; i++) a.push(f(r, i)); return a; }
export function debrisAt(im, data, tt, g = 4.9, floor = 0.05) { for (let i = 0; i < data.length; i++) { const d = data[i]; const q = tt - (d.delay || 0); if (tt <= 0 || q < 0) { _m.makeScale(0, 0, 0); } else { _p.copy(d.p0).addScaledVector(d.v, q); _p.y -= g * q * q; if (_p.y < floor) _p.y = floor; _m.compose(_p, _q.setFromEuler(_e.set(d.spin * q, d.spin * q * 0.7, 0)), _s.setScalar(d.s || 1)); } im.setMatrixAt(i, _m); } im.instanceMatrix.needsUpdate = true; }

// ---------- overlay ----------
export function strokeText(txt, x, y, font, fill, stroke = '#000', sw = 14) { ctx.font = font; ctx.lineJoin = 'round'; ctx.lineWidth = sw; ctx.strokeStyle = stroke; ctx.strokeText(txt, x, y); ctx.fillStyle = fill; ctx.fillText(txt, x, y); }
export function makeOverlay(CFG) {
  // CFG: {lines, titleL1, titleHi, titleL2, hudLabel(r), rule, rungs:[{v,unit,n,cmp,at,gold}], barMax, barMarks:[[val,label]], fact:{label,big,unit,sub}, hideHUD:[shots], numRe, flashBig:[t], flashSmall:[t]}
  const chunks = [];
  for (const l of CFG.lines) { if (l.title) continue; let cur = []; for (const w of l.words) { cur.push(w); if (/[.,?!:]$/.test(w.w) || cur.length >= 2) { chunks.push({ who: l.who, words: cur, t: cur[0].t, e: cur[cur.length - 1].e, worse: l.worse }); cur = []; } } if (cur.length) chunks.push({ who: l.who, words: cur, t: cur[0].t, e: cur[cur.length - 1].e, worse: l.worse }); }
  const numRe = CFG.numRe || /^(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|trillion|twice|half|\d[\d,.]*)$/i;
  function caption(t) {
    const c = chunks.find(c => t >= c.t - 0.02 && t < c.e + 0.06); if (!c || c.worse) return;
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const font = "92px 'Archivo Black'"; ctx.font = font; const sp = ctx.measureText(' ').width;
    const words = c.words.map(w => w.w.toUpperCase()); const widths = words.map(w => ctx.measureText(w).width); const total = widths.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
    const pop = 1 + 0.12 * clamp(1 - (t - c.t) / 0.08); const fit = Math.min(1, 940 / total);
    ctx.save(); ctx.translate(W / 2, 1230); ctx.scale(pop * fit, pop * fit);
    let x = -total / 2; const isI = c.who !== 'N';
    words.forEach((w, i) => { const hl = numRe.test(w.replace(/[^\w.,]/g, '').replace(/[.,]$/, '')); strokeText(w, x, 0, font, isI ? '#9fd6ff' : (hl ? '#ffd23f' : '#ffffff'), '#0b0b12', 16); x += widths[i] + sp; });
    ctx.restore();
  }
  function hud(t, shot) {
    let ri = -1; CFG.rungs.forEach((r, i) => { if (t >= r.at - 0.05) ri = i; });
    if ((CFG.hideHUD || []).includes(shot) || ri < 0) return;
    const r = CFG.rungs[ri]; const since = t - r.at; const pop = 1 + 0.25 * clamp(1 - since / 0.15);
    const x0 = 70, y0 = 150;
    const g = ctx.createLinearGradient(0, 0, 0, 520); g.addColorStop(0, 'rgba(0,0,0,0.42)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 520);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = "600 34px Inter"; ctx.fillStyle = 'rgba(255,255,255,0.88)'; ctx.fillText(CFG.hudLabel(r), x0, y0);
    const gold = !!r.gold; ctx.font = "150px 'Archivo Black'"; let nw = ctx.measureText(r.v).width; const fs = Math.min(1, 760 / (nw + 200));
    ctx.save(); ctx.translate(x0, y0 + 150); ctx.scale(pop * fs, pop * fs);
    strokeText(r.v, 0, 0, "150px 'Archivo Black'", gold ? '#ffcf4a' : '#ffffff', 'rgba(0,0,0,0.6)', 10);
    strokeText(' ' + r.unit, nw, 0, "56px 'Archivo Black'", gold ? '#ffcf4a' : '#ffffff', 'rgba(0,0,0,0.6)', 8);
    ctx.restore();
    ctx.font = "600 34px Inter"; ctx.fillStyle = '#ffffff'; ctx.fillText(r.cmp, x0, y0 + 212);
    ctx.font = "30px 'Archivo Black'"; const pw = ctx.measureText(CFG.rule).width + 44, ph = 52;
    ctx.fillStyle = '#e63b2e'; ctx.beginPath(); ctx.roundRect(x0, y0 + 240, pw, ph, 26); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(CFG.rule, x0 + 22, y0 + 277);
    if (CFG.barMax) {
      const bx = x0 + pw + 30, by = y0 + 258, bw = W - bx - 70; ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.roundRect(bx, by, bw, 16, 8); ctx.fill();
      const val = r.raw ?? parseFloat(r.v.replace(/,/g, '')); const lmin = Math.log10(CFG.barMin || 1); const f = clamp((Math.log10(Math.max(val, 1e-9)) - lmin) / (Math.log10(CFG.barMax) - lmin)); const grd = ctx.createLinearGradient(bx, 0, bx + bw, 0); grd.addColorStop(0, '#ffffff'); grd.addColorStop(0.5, '#ffb347'); grd.addColorStop(1, '#ff3b2e'); ctx.fillStyle = grd; ctx.beginPath(); ctx.roundRect(bx, by, Math.max(16, bw * f), 16, 8); ctx.fill();
      ctx.font = "600 22px Inter"; ctx.fillStyle = 'rgba(255,255,255,0.8)'; for (const [v, lab] of (CFG.barMarks || [])) { const fx = clamp((Math.log10(v) - lmin) / (Math.log10(CFG.barMax) - lmin)); ctx.fillText(lab, bx + bw * fx - 30, by + 46); }
    }
  }
  function title(t) {
    const end = CFG.lines[1].t; if (t >= end) return;
    const a = clamp(t / 0.25) * clamp((end - t) / 0.25); ctx.globalAlpha = a;
    const g = ctx.createLinearGradient(0, 0, 0, 700); g.addColorStop(0, 'rgba(0,0,0,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 700);
    ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineJoin = 'round';
    const fsz = CFG.titleSize || 84;
    ctx.font = `${fsz}px 'Instrument Serif'`; ctx.textAlign = 'center'; ctx.strokeText(CFG.titleL1, W / 2, 300); ctx.fillStyle = '#fff'; ctx.fillText(CFG.titleL1, W / 2, 300);
    ctx.font = `italic ${fsz}px 'Instrument Serif'`; const wa = ctx.measureText(CFG.titleHi).width; ctx.font = `${fsz}px 'Instrument Serif'`; const wb = ctx.measureText(CFG.titleL2).width; const sx = W / 2 - (wa + wb) / 2; ctx.textAlign = 'left';
    ctx.font = `italic ${fsz}px 'Instrument Serif'`; ctx.strokeText(CFG.titleHi, sx, 300 + fsz * 1.13); ctx.fillStyle = '#ffcf4a'; ctx.fillText(CFG.titleHi, sx, 300 + fsz * 1.13);
    ctx.font = `${fsz}px 'Instrument Serif'`; ctx.strokeText(CFG.titleL2, sx + wa, 300 + fsz * 1.13); ctx.fillStyle = '#fff'; ctx.fillText(CFG.titleL2, sx + wa, 300 + fsz * 1.13);
    ctx.globalAlpha = 1;
  }
  function worseCard(lt) {
    const a = clamp(lt / 0.15); ctx.globalAlpha = a; ctx.textAlign = 'center';
    const s = 1 + 0.06 * clamp(1 - lt / 0.25); ctx.save(); ctx.translate(W / 2, 1100); ctx.scale(s, s);
    strokeText('THEN IT', 0, -70, "150px 'Archivo Black'", '#ffffff', '#000', 18); strokeText('GOT WORSE.', 0, 90, "150px 'Archivo Black'", '#ff3b2e', '#000', 18);
    ctx.restore(); ctx.globalAlpha = 1;
  }
  function factHud(lt) {
    const F = CFG.fact; const a = clamp(lt / 0.3); ctx.globalAlpha = a; ctx.textAlign = 'left';
    const g = ctx.createLinearGradient(0, 0, 0, 480); g.addColorStop(0, 'rgba(0,0,0,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 480);
    ctx.font = "600 34px Inter"; ctx.fillStyle = '#fff'; ctx.fillText('THE REAL PART', 70, 150);
    ctx.font = "150px 'Archivo Black'"; const nw = ctx.measureText(F.big).width; const fs = Math.min(1, 900 / (nw + 220));
    ctx.save(); ctx.translate(70, 300); ctx.scale(fs, fs); strokeText(F.big, 0, 0, "150px 'Archivo Black'", '#ffffff', 'rgba(0,0,0,0.5)', 10); strokeText(' ' + F.unit, nw, 0, "56px 'Archivo Black'", '#fff', 'rgba(0,0,0,0.5)', 8); ctx.restore();
    ctx.font = "600 32px Inter"; ctx.fillStyle = '#fff'; ctx.fillText(F.sub, 70, 362); ctx.globalAlpha = 1;
  }
  return function overlay(t, shot, lt) {
    title(t); hud(t, shot);
    if (shot === 'worse') worseCard(lt);
    if (shot === 'fact' && CFG.fact) factHud(lt);
    caption(t);
    for (const b of (CFG.flashBig || [])) { const d = t - b; if (d >= 0 && d < 0.25) { ctx.fillStyle = `rgba(255,255,255,${0.9 * (1 - d / 0.25)})`; ctx.fillRect(0, 0, W, H); } }
    for (const b of (CFG.flashSmall || [])) { const d = t - b; if (d >= 0 && d < 0.1) { ctx.fillStyle = `rgba(255,255,255,${0.45 * (1 - d / 0.1)})`; ctx.fillRect(0, 0, W, H); } }
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.35)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  };
}
// timeline helpers
export function tlHelpers(tl) {
  const LINES = tl.tl.filter(x => x.type === 'line'); const ACT = {}; tl.tl.filter(x => x.type === 'act').forEach(x => { ACT[x.n] = x.t; });
  const line = (prefix) => LINES.find(l => l.text.startsWith(prefix));
  return { LINES, ACT, line, worse: LINES.find(l => l.worse), fact: LINES.find(l => l.fact) };
}
export function makeFrame(shots, renderShot, overlay) {
  window.frame = (t) => {
    const sh = shots(); const cur = sh.find(s => t >= s[1] && t < s[2]) || sh[sh.length - 1];
    const lt = t - cur[1], dur = cur[2] - cur[1];
    const sc = renderShot(cur[0], lt, dur, t);
    R.render(sc, cam); ctx.drawImage(glc, 0, 0); overlay(t, cur[0], lt);
    return out.toDataURL('image/jpeg', 0.9);
  };
  window.shotList = () => shots().map(s => [s[0], +s[1].toFixed(2), +s[2].toFixed(2)]);
}

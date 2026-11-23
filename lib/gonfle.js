// Génération de lettres gonflées : glyphe -> champ de distance -> gonflement -> maillage fermé.
// Partagé par l'outil d'atelier (lettres-gonflees/) et le configurateur client (configurateur/).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const BED = 256, TOL = 0.5;
export const QUAL = { std: 170, fine: 250 };

function dt1(f, n, d, v, z) {
  let k = 0; v[0] = 0; z[0] = -1e20; z[1] = 1e20;
  for (let q = 1; q < n; q++) {
    let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
    k++; v[k] = q; z[k] = s; z[k + 1] = 1e20;
  }
  k = 0;
  for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; const r = v[k]; d[q] = (q - r) * (q - r) + f[r]; }
}
function edt(f, W, H) {
  const m = Math.max(W, H), t = new Float64Array(m), d = new Float64Array(m), v = new Int32Array(m), z = new Float64Array(m + 1);
  for (let x = 0; x < W; x++) { for (let y = 0; y < H; y++) t[y] = f[y * W + x]; dt1(t, H, d, v, z); for (let y = 0; y < H; y++) f[y * W + x] = d[y]; }
  for (let y = 0; y < H; y++) { for (let x = 0; x < W; x++) t[x] = f[y * W + x]; dt1(t, W, d, v, z); for (let x = 0; x < W; x++) f[y * W + x] = d[x]; }
}
function blur(s, W, H, sig) {
  const r = Math.ceil(sig * 3), k = []; let sum = 0;
  for (let i = -r; i <= r; i++) { const w = Math.exp(-i * i / (2 * sig * sig)); k.push(w); sum += w; }
  for (let i = 0; i < k.length; i++) k[i] /= sum;
  const tmp = new Float32Array(W * H), out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let a = 0; for (let i = -r; i <= r; i++) { const xx = Math.min(W - 1, Math.max(0, x + i)); a += k[i + r] * s[y * W + xx]; } tmp[y * W + x] = a; }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let a = 0; for (let i = -r; i <= r; i++) { const yy = Math.min(H - 1, Math.max(0, y + i)); a += k[i + r] * tmp[yy * W + x]; } out[y * W + x] = a; }
  return out;
}
function raster(ch, font, N, fatFrac) {
  const px = Math.round(N / 0.7);
  const fontStr = `${font.w} ${px}px "${font.f}"`;
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = fontStr;
  const m = probe.measureText(ch);
  const L = Math.ceil(m.actualBoundingBoxLeft), R = Math.ceil(m.actualBoundingBoxRight), A = Math.ceil(m.actualBoundingBoxAscent), D = Math.ceil(m.actualBoundingBoxDescent);
  const gh = A + D, g = fatFrac * gh, pad = Math.ceil(g) + 6;
  const W = L + R + 2 * pad, H = gh + 2 * pad;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.font = fontStr; ctx.fillStyle = '#000'; ctx.fillText(ch, pad + L, pad + A);
  const px4 = ctx.getImageData(0, 0, W, H).data, a = new Float32Array(W * H);
  for (let i = 0; i < a.length; i++) a[i] = px4[i * 4 + 3] / 255;
  return { a, W, H, g };
}
function countPieces(inside, W, H) {
  const seen = new Uint8Array(W * H), st = []; let n = 0;
  for (let i = 0; i < W * H; i++) {
    if (!inside[i] || seen[i]) continue;
    n++; seen[i] = 1; st.push(i);
    while (st.length) {
      const p = st.pop(), x = p % W, y = (p / W) | 0;
      for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1])
        if (q >= 0 && inside[q] && !seen[q]) { seen[q] = 1; st.push(q); }
    }
  }
  return n;
}
// Surface nets sur F(x,y,z) = max(-z, z - H(x,y)) : dos plat à z=0, face bombée au-dessus.
function surfaceNets(Hf, nx, ny, nz) {
  const z0 = -0.5, cx = nx - 1, cy = ny - 1, cz = nz - 1;
  const F = (i, j, k) => { const z = z0 + k, a = -z, b = z - Hf[j * nx + i]; return a > b ? a : b; };
  const idx = new Int32Array(cx * cy * cz).fill(-1), P = [], T = [], val = new Float64Array(8);
  const E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const id = (i, j, k) => idx[(k * cy + j) * cx + i];
  const quad = (a, b, c, d, ins) => { if (ins) T.push(a, b, c, a, c, d); else T.push(a, c, b, a, d, c); };
  for (let k = 0; k < cz; k++) for (let j = 0; j < cy; j++) for (let i = 0; i < cx; i++) {
    let mask = 0;
    for (let c = 0; c < 8; c++) { const v = F(i + (c & 1), j + ((c >> 1) & 1), k + ((c >> 2) & 1)); val[c] = v; if (v < 0) mask |= 1 << c; }
    if (mask === 0 || mask === 255) continue;
    let sx = 0, sy = 0, sz = 0, n = 0;
    for (const [a, b] of E) {
      if (((mask >> a) & 1) === ((mask >> b) & 1)) continue;
      const t = val[a] / (val[a] - val[b]);
      const ax = a & 1, ay = (a >> 1) & 1, az = (a >> 2) & 1;
      sx += ax + t * ((b & 1) - ax); sy += ay + t * (((b >> 1) & 1) - ay); sz += az + t * (((b >> 2) & 1) - az); n++;
    }
    const vi = P.length / 3; P.push(i + sx / n, j + sy / n, z0 + k + sz / n);
    idx[(k * cy + j) * cx + i] = vi;
    const in0 = mask & 1;
    if (in0 !== ((mask >> 1) & 1) && j > 0 && k > 0) quad(vi, id(i, j - 1, k), id(i, j - 1, k - 1), id(i, j, k - 1), in0);
    if (in0 !== ((mask >> 2) & 1) && i > 0 && k > 0) quad(vi, id(i, j, k - 1), id(i - 1, j, k - 1), id(i - 1, j, k), in0);
    if (in0 !== ((mask >> 4) & 1) && i > 0 && j > 0) quad(vi, id(i - 1, j, k), id(i - 1, j - 1, k), id(i, j - 1, k), in0);
  }
  return { P: new Float32Array(P), T: new Uint32Array(T) };
}
function meshStats(P, T) {
  let vol = 0, area = 0;
  for (let t = 0; t < T.length; t += 3) {
    const a = T[t] * 3, b = T[t + 1] * 3, c = T[t + 2] * 3;
    const ax = P[a], ay = P[a + 1], az = P[a + 2], bx = P[b] - ax, by = P[b + 1] - ay, bz = P[b + 2] - az, cx = P[c] - ax, cy = P[c + 1] - ay, cz = P[c + 2] - az;
    area += Math.hypot(by * cz - bz * cy, bz * cx - bx * cz, bx * cy - by * cx) / 2;
    vol += (P[a] * (P[b + 1] * P[c + 2] - P[b + 2] * P[c + 1]) - P[a + 1] * (P[b] * P[c + 2] - P[b + 2] * P[c]) + P[a + 2] * (P[b] * P[c + 1] - P[b + 1] * P[c])) / 6;
  }
  return { vol, area };
}

// opt : { h: hauteur mm, puff: épaisseur en % de h, fat: dilatation en %, q: 'std' | 'fine' }
// issues : [{code:'height', got} | {code:'bed'} | {code:'pieces', n}]
export function genLetter(ch, font, opt) {
  const { a, W, H, g } = raster(ch, font, QUAL[opt.q] || QUAL.std, opt.fat / 100);
  const n = W * H, fin = new Float64Array(n), fout = new Float64Array(n);
  for (let i = 0; i < n; i++) { const ins = a[i] >= 0.5; fout[i] = ins ? 0 : 1e20; fin[i] = ins ? 1e20 : 0; }
  edt(fout, W, H); edt(fin, W, H);
  let sd = new Float32Array(n);
  for (let i = 0; i < n; i++) sd[i] = a[i] >= 0.5 ? -(Math.sqrt(fin[i]) - 0.5) : (Math.sqrt(fout[i]) - 0.5);
  sd = blur(sd, W, H, 1.2);
  const d = new Float32Array(n), inside = new Uint8Array(n); let R = 0;
  for (let i = 0; i < n; i++) { d[i] = g - sd[i]; if (d[i] > 0) inside[i] = 1; if (d[i] > R) R = d[i]; }
  if (R <= 0) return null;
  const pieces = countPieces(inside, W, H);
  const Hf = new Float32Array(n);
  for (let i = 0; i < n; i++) { const v = d[i]; Hf[i] = v <= 0 ? v : (v >= R ? R : Math.sqrt(v * (2 * R - v))); }
  const { P, T } = surfaceNets(Hf, W, H, Math.ceil(R) + 3);
  let xmin = 1e9, ymin = 1e9, ymax = -1e9, zmax = 0;
  for (let i = 0; i < P.length; i += 3) { P[i + 1] = -P[i + 1]; xmin = Math.min(xmin, P[i]); ymin = Math.min(ymin, P[i + 1]); ymax = Math.max(ymax, P[i + 1]); zmax = Math.max(zmax, P[i + 2]); }
  const s = opt.h / (ymax - ymin), zs = (opt.h * opt.puff / 100) / zmax;
  for (let i = 0; i < P.length; i += 3) { P[i] = (P[i] - xmin) * s; P[i + 1] = (P[i + 1] - ymin) * s; P[i + 2] = Math.max(0, P[i + 2] * zs); }
  const st = meshStats(P, T);
  if (st.vol < 0) { for (let t = 0; t < T.length; t += 3) { const x = T[t + 1]; T[t + 1] = T[t + 2]; T[t + 2] = x; } st.vol = -st.vol; }
  // contrôle : on remesure le maillage final
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], P[i + k]); hi[k] = Math.max(hi[k], P[i + k]); }
  const w = hi[0] - lo[0], h = hi[1] - lo[1], t = hi[2] - lo[2];
  const shell = st.area * 1.0, infill = Math.max(0, st.vol - shell) * 0.10, grams = (shell + infill) / 1000 * 1.24;
  const issues = [];
  if (Math.abs(h - opt.h) > TOL) issues.push({ code: 'height', got: h });
  if (w > BED || h > BED || t > BED) issues.push({ code: 'bed' });
  if (pieces > 1) issues.push({ code: 'pieces', n: pieces });
  return { ch, P, T, w, h, t, grams, pieces, issues };
}

export async function ensureFont(font, text) { await document.fonts.load(`${font.w} 120px "${font.f}"`, text || 'A'); }

const cache = new Map();
// Génère les lettres en cédant la main entre chacune ; isStale() permet d'abandonner un calcul dépassé.
export async function buildLetters(chars, font, opt, isStale) {
  await ensureFont(font, chars.join(''));
  const out = [];
  for (const ch of chars) {
    const key = [ch, font.f, font.w, opt.h, opt.puff, opt.fat, opt.q].join('|');
    if (!cache.has(key)) {
      await new Promise(r => setTimeout(r, 0));
      if (isStale()) return null;
      cache.set(key, genLetter(ch, font, opt));
      if (cache.size > 80) cache.delete(cache.keys().next().value);
    }
    const l = cache.get(key); if (l) out.push(l);
  }
  return isStale() ? null : out;
}

/* ---------- Aperçu 3D ---------- */
export function createViewer(el) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  el.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(35, 1, 1, 5000);
  const ctl = new OrbitControls(cam, renderer.domElement); ctl.enableDamping = true;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 1.1));
  const d1 = new THREE.DirectionalLight(0xffffff, 1.6); d1.position.set(-0.6, 1, 1.4); scene.add(d1);
  const d2 = new THREE.DirectionalLight(0xffffff, 0.5); d2.position.set(1, -0.4, 0.6); scene.add(d2);
  const group = new THREE.Group(); scene.add(group);
  const mats = new Map();
  let rough = 0.5;
  const mat = hex => { const k = hex + rough; if (!mats.has(k)) mats.set(k, new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: 0 })); return mats.get(k); };
  const geos = new Map(); // un BufferGeometry par lettre générée (réutilisé)
  const geoFor = l => { if (!geos.has(l)) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(l.P, 3)); g.setIndex(new THREE.BufferAttribute(l.T, 1)); g.computeVertexNormals(); geos.set(l, g); } return geos.get(l); };
  function resize() { const r = el.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); cam.aspect = r.width / Math.max(1, r.height); cam.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(el); resize();
  (function loop() { requestAnimationFrame(loop); ctl.update(); renderer.render(scene, cam); })();
  let fitKey = '';
  function show(L, hexes, opts = {}) {
    rough = opts.textured ? 0.95 : 0.5;
    group.clear();
    const gap = (L[0]?.h || 100) * 0.08; let x = 0;
    L.forEach((l, i) => { const m = new THREE.Mesh(geoFor(l), mat(hexes[i] || '#888888')); m.position.x = x; m.userData.i = i; group.add(m); x += l.w + gap; });
    group.position.set(0, 0, 0);
    const box = new THREE.Box3().setFromObject(group), c = box.getCenter(new THREE.Vector3()), sz = box.getSize(new THREE.Vector3());
    group.position.sub(c);
    for (const [l, g] of geos) if (!L.includes(l)) { g.dispose(); geos.delete(l); }
    const key = L.map(l => l.ch).join('') + '|' + Math.round(sz.x) + '|' + Math.round(sz.y);
    if (key !== fitKey && L.length) {
      fitKey = key;
      const dist = Math.max(sz.x / cam.aspect, sz.y) * 1.25 / (2 * Math.tan(cam.fov * Math.PI / 360)) + sz.z;
      cam.position.set(sz.x * 0.12, -sz.y * 0.25, dist); ctl.target.set(0, 0, 0); cam.near = dist / 100; cam.far = dist * 10; cam.updateProjectionMatrix();
    }
  }
  return { show, renderer };
}

/* ---------- Export : STL binaire et 3MF ---------- */
export function stl(l) {
  const nt = l.T.length / 3, buf = new ArrayBuffer(84 + nt * 50), dv = new DataView(buf); dv.setUint32(80, nt, true);
  let o = 84; const P = l.P, T = l.T;
  for (let t = 0; t < T.length; t += 3) { o += 12; for (let k = 0; k < 3; k++) { const i = T[t + k] * 3; dv.setFloat32(o, P[i], true); dv.setFloat32(o + 4, P[i + 1], true); dv.setFloat32(o + 8, P[i + 2], true); o += 12; } o += 2; }
  return new Blob([buf], { type: 'model/stl' });
}
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
const deflate = async data => new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
async function zip(files) {
  const enc = new TextEncoder(), parts = [], cd = []; let off = 0;
  for (const [name, data] of files) {
    const nm = enc.encode(name), crc = crc32(data), z = await deflate(data), h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(8, 8, true); h.setUint16(12, 33, true); h.setUint32(14, crc, true); h.setUint32(18, z.length, true); h.setUint32(22, data.length, true); h.setUint16(26, nm.length, true);
    parts.push(h, nm, z);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(10, 8, true); c.setUint16(14, 33, true); c.setUint32(16, crc, true); c.setUint32(20, z.length, true); c.setUint32(24, data.length, true); c.setUint16(28, nm.length, true); c.setUint32(42, off, true);
    cd.push(c, nm); off += 30 + nm.length + z.length;
  }
  const cdSize = cd.reduce((s, p) => s + p.byteLength, 0), e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, cdSize, true); e.setUint32(16, off, true);
  return new Blob([...parts, ...cd, e], { type: 'model/3mf' });
}
const xmlEsc = s => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
// names[i] : nom de l'objet dans Bambu Studio (ex. « L 15cm Rose »)
export async function threeMF(L, names) {
  const enc = new TextEncoder(), objs = [], items = [];
  let x = 10, y = 10, rowH = 0;
  L.forEach((l, n) => {
    if (x + l.w > BED - 5 && x > 10) { x = 10; y += rowH + 8; rowH = 0; }
    const v = [], t = [], P = l.P, T = l.T;
    for (let i = 0; i < P.length; i += 3) v.push(`<vertex x="${P[i].toFixed(3)}" y="${P[i + 1].toFixed(3)}" z="${P[i + 2].toFixed(3)}"/>`);
    for (let i = 0; i < T.length; i += 3) t.push(`<triangle v1="${T[i]}" v2="${T[i + 1]}" v3="${T[i + 2]}"/>`);
    objs.push(`<object id="${n + 1}" name="${xmlEsc(names[n] || l.ch)}" type="model"><mesh><vertices>${v.join('')}</vertices><triangles>${t.join('')}</triangles></mesh></object>`);
    items.push(`<item objectid="${n + 1}" transform="1 0 0 0 1 0 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} 0"/>`);
    x += l.w + 8; rowH = Math.max(rowH, l.h);
  });
  const model = `<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="fr-CA" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><metadata name="Application">Eklo lettres gonflees</metadata><resources>${objs.join('')}</resources><build>${items.join('')}</build></model>`;
  return zip([
    ['[Content_Types].xml', enc.encode('<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>')],
    ['_rels/.rels', enc.encode('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>')],
    ['3D/3dmodel.model', enc.encode(model)],
  ]);
}
export function save(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }

// Catalogue des lettres gonflées : la même source pour le configurateur client et l'outil d'atelier.
// PRIX, COULEURS ET POLICE SONT DES VALEURS D'EXEMPLE en attendant les données d'Éklo.
export const CATALOGUE = {
  // Style Éklo : police Coiny (A en arche avec contre-forme rectangulaire arrondie, comme leurs lettres),
  // épaisseur 25 % de la hauteur (STL « M » reçu le 24-11-2026 : 115 × 120 × 30 mm).
  // Largeur d'origine de la police : la A obtenue (≈ 0,94 largeur/hauteur) correspond à la capture Bambu du client.
  font: { f: 'Coiny', w: 400 },
  puff: 25, fat: 4, wide: 100, smooth: 0, q: 'std',
  maxLetters: 15,
  currency: 'CAD',
  sizes: [
    { h: 100, price: 12 },
    { h: 150, price: 16 },
    { h: 200, price: 22 },
    { h: 250, price: 28 },
  ],
  colors: [
    { id: 'blanc',   hex: '#f4f1ea', fr: 'Blanc',   en: 'White',    es: 'Blanco' },
    { id: 'noir',    hex: '#2a2a2a', fr: 'Noir',    en: 'Black',    es: 'Negro' },
    { id: 'marine',  hex: '#1f2f6b', fr: 'Marine',  en: 'Navy',     es: 'Azul marino' },
    { id: 'ciel',    hex: '#7ec3e6', fr: 'Ciel',    en: 'Sky blue', es: 'Celeste' },
    { id: 'rouge',   hex: '#d93a33', fr: 'Rouge',   en: 'Red',      es: 'Rojo' },
    { id: 'rose',    hex: '#f2a7bd', fr: 'Rose',    en: 'Pink',     es: 'Rosado' },
    { id: 'lavande', hex: '#b9a3e3', fr: 'Lavande', en: 'Lavender', es: 'Lavanda' },
    { id: 'jaune',   hex: '#f5d547', fr: 'Jaune',   en: 'Yellow',   es: 'Amarillo' },
    { id: 'or',      hex: '#d8a93a', fr: 'Or',      en: 'Gold',     es: 'Dorado' },
    { id: 'vert',    hex: '#2e8b57', fr: 'Vert',    en: 'Green',    es: 'Verde' },
  ],
  textures: [
    { id: 'lisse',   fr: 'Lisse',    en: 'Smooth',   es: 'Liso' },
    { id: 'texture', fr: 'Texturée', en: 'Textured', es: 'Texturizado' },
  ],
  defaultColor: 'marine',
};

// Lettres majuscules avec les accents du français et de l'espagnol (Á Í Ó Ú Ñ), chiffres, & ! ?
const ALLOWED = /^[A-Z0-9ÀÂÄÇÉÈÊËÎÏÔÖÙÛÜÁÍÓÚÑ&!?]$/;
export const isAllowed = c => ALLOWED.test(c);
export const lettersOf = text => [...String(text).toUpperCase()].filter(c => c.trim());
// Pour l'aperçu : pour chaque lettre disponible, y a-t-il un espace juste avant (« SOFÍA MUÑOZ ») ?
export function spacesBefore(text, max = Infinity) {
  const out = []; let sp = false;
  for (const c of String(text).toUpperCase()) {
    if (!c.trim()) { sp = out.length > 0; continue; }
    if (!isAllowed(c)) continue;
    if (out.length >= max) break;
    out.push(sp); sp = false;
  }
  return out;
}
export const colorById = id => CATALOGUE.colors.find(c => c.id === id) || CATALOGUE.colors.find(c => c.id === CATALOGUE.defaultColor);

// Une commande : { text, h, colors: [id par lettre], tex }
// Lien : ?t=LÉA&h=150&c=rose.ciel.or&x=lisse   (c avec une seule couleur = toutes les lettres)
export function parseOrder(search) {
  const p = new URLSearchParams(search);
  const text = (p.get('t') || '').toUpperCase().slice(0, 40);
  const size = CATALOGUE.sizes.find(s => s.h === +p.get('h')) || CATALOGUE.sizes[1];
  const tex = CATALOGUE.textures.find(x => x.id === p.get('x'))?.id || 'lisse';
  const order = { text, h: size.h, colors: (p.get('c') || '').split('.').filter(Boolean), tex };
  return fitColors(order);
}
export function fitColors(order) {
  const n = lettersOf(order.text).length, cs = order.colors.filter(id => CATALOGUE.colors.some(c => c.id === id));
  const fill = cs.length ? cs[cs.length - 1] : CATALOGUE.defaultColor;
  order.colors = Array.from({ length: n }, (_, i) => cs.length === 1 ? cs[0] : (cs[i] || fill));
  return order;
}
export function orderQuery(o) {
  const same = o.colors.every(c => c === o.colors[0]);
  return new URLSearchParams({ t: o.text, h: o.h, c: same ? (o.colors[0] || CATALOGUE.defaultColor) : o.colors.join('.'), x: o.tex }).toString();
}
export function priceOf(o) {
  const n = lettersOf(o.text).filter(isAllowed).length, unit = CATALOGUE.sizes.find(s => s.h === o.h)?.price || 0;
  return { n, unit, total: n * unit };
}

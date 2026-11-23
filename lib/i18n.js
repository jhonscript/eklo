// Langues du site : français, anglais, espagnol. Ordre de priorité : ?lang= > choix mémorisé > navigateur.
export const LANGS = ['fr', 'en', 'es'];
const KEY = 'eklo-lang';

export function detectLang() {
  const p = new URLSearchParams(location.search).get('lang');
  if (LANGS.includes(p)) return p;
  try { const s = localStorage.getItem(KEY); if (LANGS.includes(s)) return s; } catch {}
  const n = (navigator.language || 'fr').slice(0, 2);
  return LANGS.includes(n) ? n : 'en';
}
export function storeLang(l) { try { localStorage.setItem(KEY, l); } catch {} }
export const locale = l => ({ fr: 'fr-CA', en: 'en-CA', es: 'es' }[l] || 'fr-CA');

// Boutons FR / EN / ES dans el ; onChange(lang) est appelé au changement.
export function langSwitcher(el, cur, onChange) {
  const draw = c => { el.innerHTML = LANGS.map(l => `<button type="button" data-l="${l}" aria-pressed="${l === c}" lang="${l}">${l.toUpperCase()}</button>`).join(''); };
  draw(cur);
  el.onclick = e => { const b = e.target.closest('button'); if (!b) return; storeLang(b.dataset.l); draw(b.dataset.l); onChange(b.dataset.l); };
}
// data-t : texte, data-th : HTML de confiance (nos propres chaînes), data-tp : placeholder
export function applyTexts(dict, lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-t]').forEach(el => { const v = dict[el.dataset.t]; if (typeof v === 'string') el.textContent = v; });
  document.querySelectorAll('[data-th]').forEach(el => { const v = dict[el.dataset.th]; if (typeof v === 'string') el.innerHTML = v; });
  document.querySelectorAll('[data-tp]').forEach(el => { const v = dict[el.dataset.tp]; if (typeof v === 'string') el.placeholder = v; });
}
// Garde ?lang= à jour dans l'adresse sans toucher aux autres paramètres
export function setLangParam(lang) { const u = new URL(location.href); u.searchParams.set('lang', lang); history.replaceState(null, '', u); }

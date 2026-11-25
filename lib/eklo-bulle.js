// « Éklo Bulle » — alphabet original d'Éklo Atelier Créatif (2026).
// Chaque caractère est un trait central (chemin SVG) tracé avec une plume ronde épaisse, puis gonflé par lib/gonfle.js.
// Repère : y vers le bas, hauteur de capitale extérieure 0 → 100 ; les traits de 32 d'épaisseur vont donc de 16 à 84.
// Conçu de zéro : aucune police ni aucun modèle 3D de tiers n'a servi de base.

const S = 28;   // épaisseur du trait principal (28 : les contre-formes de B, A, P, R restent ouvertes)
const M = 22;   // épaisseur des accents

// [chemin, largeur extérieure]
const G = {
  A: ['M16 84 V50 C16 6 78 6 78 50 V84 M16 64 H78', 94],
  B: ['M18 84 V16 H46 C72 16 72 50 46 50 H18 M46 50 H50 C80 50 80 84 50 84 H18', 90],
  C: ['M76 30 C66 10 16 10 16 50 C16 90 66 90 76 70', 92],
  D: ['M18 16 V84 H40 C84 84 84 16 40 16 Z', 90],
  E: ['M72 16 H18 V84 H72 M18 50 H64', 88],
  F: ['M72 16 H18 V84 M18 50 H64', 88],
  G: ['M76 30 C66 10 16 10 16 50 C16 90 74 92 78 60 H50', 94],
  H: ['M16 16 V84 M78 16 V84 M16 50 H78', 94],
  I: ['M16 16 V84', 32],
  J: ['M66 16 V56 C66 94 18 92 16 66', 82],
  K: ['M18 16 V84 M72 18 L24 54 M40 44 L74 84', 90],
  L: ['M18 16 V84 H70', 86],
  M: ['M16 84 V26 C16 8 34 8 40 24 L50 50 L60 24 C66 8 84 8 84 26 V84', 100],
  N: ['M16 84 V20 L78 80 V16', 94],
  O: ['M50 16 C80 16 84 34 84 50 C84 66 80 84 50 84 C20 84 16 66 16 50 C16 34 20 16 50 16 Z', 100],
  P: ['M18 84 V16 H48 C78 16 78 56 48 56 H18', 88],
  Q: ['M50 16 C80 16 84 34 84 50 C84 66 80 84 50 84 C20 84 16 66 16 50 C16 34 20 16 50 16 Z M60 66 L84 88', 100],
  R: ['M18 84 V16 H48 C78 16 78 54 48 54 H18 M44 54 L74 84', 90],
  S: ['M76 28 C66 10 20 10 20 32 C20 54 78 44 78 68 C78 94 24 92 16 74', 94],
  T: ['M14 16 H80 M47 16 V84', 96],
  U: ['M16 16 V54 C16 94 78 94 78 54 V16', 94],
  V: ['M14 16 L47 84 L80 16', 96],
  W: ['M14 16 L32 84 L52 36 L72 84 L90 16', 106],
  X: ['M16 16 L78 84 M78 16 L16 84', 94],
  Y: ['M14 16 L47 50 L80 16 M47 50 V84', 96],
  Z: ['M16 16 H78 L18 84 H80', 96],
  0: ['M46 16 C72 16 76 34 76 50 C76 66 72 84 46 84 C20 84 16 66 16 50 C16 34 20 16 46 16 Z', 92],
  1: ['M18 32 L42 16 V84', 58],
  2: ['M18 32 C22 10 74 8 74 36 C74 58 24 64 16 84 H76', 92],
  3: ['M18 26 C28 8 72 10 72 33 C72 48 56 50 42 50 C58 50 76 54 76 70 C76 94 26 92 16 76', 92],
  4: ['M60 84 V16 L16 64 H82', 98],
  5: ['M72 16 H26 L20 48 C36 38 76 38 76 64 C76 94 28 92 16 76', 92],
  6: ['M68 20 C42 10 16 24 16 56 C16 90 76 90 76 62 C76 36 28 34 16 56', 92],
  7: ['M16 16 H76 L38 84', 92],
  8: ['M46 50 C18 50 18 16 46 16 C74 16 74 50 46 50 C14 50 14 84 46 84 C78 84 78 50 46 50 Z', 92],
  9: ['M24 80 C50 90 76 76 76 44 C76 10 16 10 16 38 C16 64 64 64 76 44', 92],
  '!': ['M16 16 V50 M16 86 L16 86.1', 32],
  '?': ['M16 30 C20 6 76 6 76 32 C76 50 48 48 48 62 M48 88 L48 88.1', 92],
};

// Accents (cx = centre de la lettre). Placés pour toucher la lettre : une seule pièce imprimable.
// Le haut extérieur des lettres est à y = 2 (trait de 28 centré sur 16) ; les accents descendent juste au contact.
// Sur les lettres où l'accent tombe sur un creux (U, N, I étroit) ou pour les points (Ë, Ï, !, ?), l'accent est une petite
// pièce à part, imprimée à côté de la lettre et collée : c'est voulu (voir multiPiece()).
const MARK = {
  acute: cx => `M${cx - 6} -4 L${cx + 10} -20`,
  grave: cx => `M${cx + 6} -4 L${cx - 10} -20`,
  circ:  cx => `M${cx - 16} -2 L${cx} -18 L${cx + 16} -2`,
  diaer: cx => `M${cx - 16} -10 L${cx - 16} -9.9 M${cx + 16} -10 L${cx + 16} -9.9`,
  tilde: cx => `M${cx - 22} -4 C${cx - 14} -20 ${cx - 4} -14 ${cx} -10 C${cx + 4} -6 ${cx + 14} 0 ${cx + 22} -16`,
  cedil: cx => `M${cx} 92 L${cx + 2} 104 C${cx + 16} 104 ${cx + 16} 120 ${cx - 6} 118`,
};
const COMPOSED = {
  'É': ['E', 'acute'], 'È': ['E', 'grave'], 'Ê': ['E', 'circ'], 'Ë': ['E', 'diaer'],
  'À': ['A', 'grave'], 'Â': ['A', 'circ'], 'Ä': ['A', 'diaer'], 'Á': ['A', 'acute'],
  'Î': ['I', 'circ'], 'Ï': ['I', 'diaer'], 'Í': ['I', 'acute'],
  'Ô': ['O', 'circ'], 'Ö': ['O', 'diaer'], 'Ó': ['O', 'acute'],
  'Ù': ['U', 'grave'], 'Û': ['U', 'circ'], 'Ü': ['U', 'diaer'], 'Ú': ['U', 'acute'],
  'Ç': ['C', 'cedil'], 'Ñ': ['N', 'tilde'],
};

// Interface attendue par lib/gonfle.js pour une police « à traits ».
// stroke : épaisseur du trait (28 = Bulle, plus = plus dodu). Les accents remontent d'autant pour rester au contact.
// style  : réglages de gonflement conseillés pour cette graisse (repris par le catalogue et l'atelier).
function makeBulle(name, stroke, style) {
  const dy = -(stroke - S) / 2, mw = M * Math.sqrt(stroke / S);
  const shift = d => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, x, y) => `${x} ${+y + (y < 0 || +y < 10 ? dy : 0)}`);
  return {
    type: 'skel', f: name, w: 0, stroke, style,
    // { parts: [{ d, width }], adv } ou null si le caractère n'existe pas
    glyph(ch) {
      if (G[ch]) return { parts: [{ d: G[ch][0], width: stroke }], adv: G[ch][1] };
      const c = COMPOSED[ch]; if (!c) return null;
      const [d, adv] = G[c[0]];
      const mark = MARK[c[1]](adv / 2);
      return { parts: [{ d, width: stroke }, { d: c[1] === 'cedil' ? mark : shift(mark), width: mw }], adv };
    },
    // lettre de base d'un caractère accentué (pour garder le corps à la hauteur exacte)
    base(ch) { return COMPOSED[ch]?.[0] || null; },
    // caractères qui peuvent légitimement sortir en plusieurs pièces (accent ou point à coller)
    multiPiece(ch) { return !!COMPOSED[ch] || ch === '!' || ch === '?'; },
    chars: [...Object.keys(G), ...Object.keys(COMPOSED)],
  };
}
// profile 'dome' : gonflement type ballon (dessus arrondi continu) ; round 0.7 : « dernière couche plus arrondie »
// (demande du client, 25-11-2026). 0.5 = dessus plat sur paroi verticale ; 0.9 = bord trop fin pour bien imprimer.
// Mise à jour 25-11-2026 (« ce dénivelé ne devrait pas rester ainsi, les lettres sont type bulle ») : profil 'tube',
// chaque section du trait a la même hauteur et la même courbe ronde ; le profil 'dome' faisait monter les zones larges.
export const EKLO_BULLE = makeBulle('Éklo Bulle', 28, { puff: 20, fat: 0, wide: 100, smooth: 0, profile: 'tube', round: 0.5 });
// Variante dodue : trait plus épais, lettres un peu plus larges pour garder des contre-formes, plus gonflée, jonctions adoucies.
// (au-delà de ~31, les trois barres de E, B, S ne tiennent plus dans la hauteur : le côté dodu vient du gonflement)
export const EKLO_BULLE_GONFLEE = makeBulle('Éklo Bulle Gonflée', 29, { puff: 24, fat: 0, wide: 112, smooth: 1, profile: 'tube', round: 0.5 });

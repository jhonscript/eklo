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
  // G : barre courte (éperon) pour garder la contre-forme ouverte même en graisse lourde
  G: ['M70 20 C60 6 16 10 16 50 C16 90 74 92 78 66 V56 H62', 94],
  H: ['M16 16 V84 M78 16 V84 M16 50 H78', 94],
  I: ['M16 16 V84', 32],
  J: ['M66 16 V56 C66 94 18 92 16 66', 82],
  K: ['M18 16 V84 M72 18 L24 54 M40 44 L74 84', 90],
  L: ['M18 16 V84 H70', 86],
  M: ['M16 84 V26 C16 8 34 8 40 24 L50 58 L60 24 C66 8 84 8 84 26 V84', 100],
  N: ['M16 84 V20 L78 80 V16', 94],
  O: ['M50 16 C80 16 84 34 84 50 C84 66 80 84 50 84 C20 84 16 66 16 50 C16 34 20 16 50 16 Z', 100],
  P: ['M18 84 V16 H48 C78 16 78 56 48 56 H18', 88],
  Q: ['M50 16 C80 16 84 34 84 50 C84 66 80 84 50 84 C20 84 16 66 16 50 C16 34 20 16 50 16 Z M60 66 L84 88', 100],
  R: ['M18 84 V16 H48 C78 16 78 54 48 54 H18 M44 54 L74 84', 90],
  // pointes de S et 5 écartées du trait voisin : sinon elles enferment un faux trou
  S: ['M74 24 C64 8 20 10 20 32 C20 54 78 44 78 68 C78 94 26 96 16 80', 94],
  T: ['M14 16 H80 M47 16 V84', 96],
  U: ['M16 16 V54 C16 94 78 94 78 54 V16', 94],
  V: ['M14 16 L47 84 L80 16', 96],
  W: ['M14 16 L32 84 L52 30 L72 84 L90 16', 106],
  X: ['M16 16 L78 84 M78 16 L16 84', 94],
  Y: ['M14 16 L47 50 L80 16 M47 50 V84', 96],
  Z: ['M16 16 H78 L18 84 H80', 96],
  // Chiffres v3 (25-11-2026) : structure classique des chiffres arrondis, même chasse pour tous (centre x = 45),
  // 4 « ouvert » à diagonale (un 4 fermé perd son triangle en graisse lourde), panses construites en ellipses.
  0: ['M47 16 C70 16 78 32 78 50 C78 68 70 84 47 84 C24 84 16 68 16 50 C16 32 24 16 47 16 Z', 94],
  1: ['M22 32 L44 16 V84', 62],
  2: ['M20 32 C20 22 30 16 45 16 C60 16 70 24 70 35 C70 50 54 58 20 84 H72', 90],
  3: ['M21 24 C27 19 35 16 45 16 C59 16 68 23 68 33 C68 43 59 49 44 49 C60 49 72 56 72 67 C72 78 61 84 45 84 C34 84 25 81 18 75', 90],
  4: ['M42 16 L16 62 H72 M60 46 V84', 88],
  5: ['M70 16 H30 L27 45 C33 41 40 39 47 39 C62 39 72 49 72 62 C72 75 62 84 46 84 C34 84 25 81 18 75', 90],
  // 6 et 9 : panse ovale bien dessinée + crochet / queue longue et nettement détachée (le 9 = 6 tourné de 180°)
  6: ['M18 58 C18 46 30 42 45 42 C60 42 72 50 72 63 C72 76 60 84 45 84 C30 84 18 75 18 58 C18 34 28 16 48 16 C57 16 64 19 70 23', 90],
  7: ['M18 16 H72 L36 84', 90],
  8: ['M45 49 C31 49 23 42 23 33 C23 23 32 16 45 16 C58 16 67 23 67 33 C67 42 59 49 45 49 C30 49 19 56 19 67 C19 77 30 84 45 84 C60 84 71 77 71 67 C71 56 60 49 45 49 Z', 90],
  9: ['M72 42 C72 54 60 58 45 58 C30 58 18 50 18 37 C18 24 30 16 45 16 C60 16 72 25 72 42 C72 66 62 84 42 84 C33 84 26 81 20 77', 90],
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
  // circonflexe fermé (rempli par le trait) : un chevron ouvert enfermait un petit trou avec le haut arrondi de A et O
  circ:  cx => `M${cx - 16} -2 L${cx} -18 L${cx + 16} -2 Z`,
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

// Trous (contre-formes fermées) que chaque caractère DOIT avoir ; tous les autres : 0.
// Le 4 est dessiné ouvert (pas de trou) : un 4 fermé perd son triangle dès que le trait est épais.
const HOLES = { A: 1, B: 2, D: 1, O: 1, P: 1, Q: 1, R: 1, 0: 1, 6: 1, 8: 2, 9: 1 };
const DIGIT_FONT = { f: 'Fredoka', w: 700 };

// Interface attendue par lib/gonfle.js pour une police « à traits ».
// stroke : épaisseur du trait (28 = Bulle, plus = plus dodu). Les accents remontent d'autant pour rester au contact.
// style  : réglages de gonflement conseillés pour cette graisse (repris par le catalogue et l'atelier).
// over : { caractère: [[chemin, épaisseur], …] } — parties d'épaisseurs différentes pour une graisse donnée
function makeBulle(name, stroke, style, over = {}) {
  const dy = -(stroke - S) / 2, mw = M * Math.sqrt(stroke / S);
  const shift = d => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, x, y) => `${x} ${+y + (y < 0 || +y < 10 ? dy : 0)}`);
  const body = ch => over[ch] ? over[ch].map(([d, width]) => ({ d, width })) : [{ d: G[ch][0], width: stroke }];
  const adv = ch => over[ch]?.adv || G[ch][1]; // une variante peut élargir une lettre (M, W de Ronde)
  return {
    type: 'skel', f: name, w: 0, stroke, style,
    // Chiffres : dessinés par une police professionnelle (Fredoka, licence OFL) puis gonflés comme les lettres.
    // Nos chiffres dessinés à la main ne tenaient pas la comparaison en graisse lourde (25-11-2026).
    textFonts: [DIGIT_FONT],
    // { parts: [{ d, width }], adv } | { textFont } | null si le caractère n'existe pas
    glyph(ch) {
      if (/[0-9]/.test(ch)) return { textFont: DIGIT_FONT };
      if (G[ch]) return { parts: body(ch), adv: adv(ch) };
      const c = COMPOSED[ch]; if (!c) return null;
      const advC = adv(c[0]);
      // sur U et N, l'accent toucherait les deux branches et fermerait le haut : on le monte (pièce à part, à coller)
      const lift = (c[0] === 'U' || c[0] === 'N') ? -12 : 0;
      const mark = MARK[c[1]](advC / 2);
      const placed = c[1] === 'cedil' ? mark : shift(mark).replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, x, y) => `${x} ${+y + lift}`);
      return { parts: [...body(c[0]), { d: placed, width: mw }], adv: advC };
    },
    // lettre de base d'un caractère accentué (pour garder le corps à la hauteur exacte)
    base(ch) { return COMPOSED[ch]?.[0] || null; },
    // nombre de trous attendus (contrôlé par lib/gonfle.js sur chaque pièce générée)
    holes(ch) { return HOLES[COMPOSED[ch]?.[0] || ch] || 0; },
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
export const EKLO_BULLE_GONFLEE = makeBulle('Éklo Bulle Gonflée', 29, { puff: 24, fat: 0, wide: 112, smooth: 1, profile: 'tube', round: 0.5, digitFat: 0.4 },
  { S: [[G.S[0], 26]] }); // S un peu plus fine : avec le lissage, sa pointe touchait le trait central et fermait un trou

// Variante « Ronde » (25-11-2026) : graisse lourde et petites contre-formes, façon lettres céramique.
// Fûts et courbes à 36 ; les barres horizontales (B, E, F, P, R) et les formes en S sont plus fines (28–30)
// pour garder des trous petits mais ouverts. Gonflement tube + léger renflement (swell) aux jonctions et rondeurs.
const RB = 36, BAR = 25, CURVE = 30;
const RONDE_OVER = {
  // A : barre plus fine et plus basse → le triangle intérieur se voit (revue 3D du 25-11-2026)
  A: [['M16 84 V50 C16 6 78 6 78 50 V84', RB], ['M16 66 H78', 26]],
  // B, P, R : panses plus fines que le fût pour que les trous soient des yeux, pas des fentes
  B: [['M18 84 V16', RB], ['M18 16 H48 C76 16 76 49 48 49 H18 M48 49 H52 C82 49 82 84 52 84 H18', 21]],
  E: [['M18 16 V84', RB], ['M72 16 H18 M18 84 H72 M18 50 H62', BAR]],
  F: [['M18 16 V84', RB], ['M72 16 H18 M18 50 H62', BAR]],
  // M, W : la V centrale plus fine que les jambages, sinon elle se remplit et la lettre devient une masse
  M: [['M16 84 V26 C16 6 38 6 44 24 M68 24 C74 6 96 6 96 26 V84', RB], ['M44 24 L56 62 L68 24', 24]],
  W: [['M14 16 L30 84 M78 84 L94 16', RB], ['M30 84 L54 26 L78 84', 24]],
  // (largeur : voir RONDE_ADV plus bas)
  P: [['M18 84 V16', RB], ['M18 16 H48 C80 16 80 62 48 62 H18', 24]],
  R: [['M18 84 V16', RB], ['M18 16 H48 C80 16 80 58 48 58 H18', 24], ['M44 58 L74 84', RB]],
  ...Object.fromEntries(['2', 'G'].map(c => [c, [[G[c][0], CURVE]]])),
  // chiffres : panses sur la moitié de la hauteur → trait plus fin pour que les trous restent ronds, pas des fentes
  ...Object.fromEntries(['3', '4', '5', '6', '9'].map(c => [c, [[G[c][0], 28]]])),
  8: [[G[8][0], 24]], 0: [[G[0][0], 32]],
  S: [[G.S[0], 26]], // trois passages horizontaux : un trait plus fin garde les ouvertures visibles
};
// RONDE_ADV : M et W plus larges en Ronde pour que la V centrale ait de la place
RONDE_OVER.M.adv = 112; RONDE_OVER.W.adv = 108;
export const EKLO_BULLE_RONDE = makeBulle('Éklo Bulle Ronde', RB, { puff: 27, fat: 0, wide: 106, smooth: 1, profile: 'tube', round: 0.5, swell: 0.3, digitFat: 0.8 }, RONDE_OVER);

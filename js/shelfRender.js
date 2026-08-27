/**
 * shelfRender.js — Polish Pass v2 & Decorative Expansion
 * Shared rendering used by room.js and share.js.
 */

// Fixed title color — NEVER derived from item data (Bug #2 prevention)
export const SVG_PLANT = `<svg width="80" height="130" viewBox="0 0 80 130" style="overflow:visible;" xmlns="http://www.w3.org/2000/svg"><path d="M40,70 C15,30 5,50 15,20 C30,0 40,40 40,70" fill="#5C6B59"/><path d="M40,70 C30,30 40,5 40,0 C50,5 50,30 40,70" fill="#758B6D"/><path d="M40,70 C65,30 75,50 65,20 C50,0 40,40 40,70" fill="#5C6B59"/><rect x="10" y="70" width="60" height="10" rx="3" fill="#C4705A"/><polygon points="15,80 65,80 55,130 25,130" fill="#9C523F"/></svg>`;

export const SVG_CACTUS = `<svg width="75" height="120" viewBox="0 0 75 120" style="overflow:visible;" xmlns="http://www.w3.org/2000/svg">
  <!-- Clay Pot -->
  <polygon points="15,75 60,75 52,118 23,118" fill="#B36B52"/>
  <rect x="11" y="68" width="53" height="10" rx="3" fill="#C87D64"/>
  <line x1="16" y1="88" x2="59" y2="88" stroke="#9C5740" stroke-width="1.5" stroke-dasharray="3,3"/>
  <!-- Soil -->
  <ellipse cx="37.5" cy="71" rx="22" ry="4" fill="#5A3825"/>
  <!-- Main stem -->
  <rect x="27" y="16" width="21" height="56" rx="10" fill="#4B6E4A"/>
  <!-- Left arm -->
  <path d="M29,48 H17 C12,48 10,44 10,39 V28 C10,24 13,22 17,22 C21,22 24,25 24,29 V38 H29" fill="#527850"/>
  <!-- Right arm -->
  <path d="M46,42 H58 C63,42 65,38 65,33 V20 C65,16 62,14 58,14 C54,14 51,17 51,21 V32 H46" fill="#436342"/>
  <!-- Rib highlights -->
  <line x1="37.5" y1="18" x2="37.5" y2="70" stroke="#688F67" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="32" y1="20" x2="32" y2="70" stroke="#3D5A3C" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="43" y1="20" x2="43" y2="70" stroke="#3D5A3C" stroke-width="1.2" stroke-linecap="round"/>
  <!-- Desert Flower -->
  <circle cx="37.5" cy="14" r="5" fill="#E86A7A"/>
  <circle cx="35" cy="12" r="3.5" fill="#F293A0"/>
  <circle cx="40" cy="12" r="3.5" fill="#F293A0"/>
  <circle cx="37.5" cy="14" r="2" fill="#FFE57F"/>
</svg>`;

export const SVG_BONSAI = `<svg width="110" height="105" viewBox="0 0 110 105" style="overflow:visible;" xmlns="http://www.w3.org/2000/svg">
  <!-- Ceramic shallow dish -->
  <rect x="18" y="80" width="74" height="15" rx="3" fill="#2E3C48"/>
  <rect x="15" y="76" width="80" height="6" rx="2" fill="#3D4F5E"/>
  <!-- Feet -->
  <rect x="24" y="95" width="8" height="4" rx="1" fill="#232E38"/>
  <rect x="78" y="95" width="8" height="4" rx="1" fill="#232E38"/>
  <!-- Moss mound -->
  <ellipse cx="55" cy="76" rx="32" ry="6" fill="#586E4B"/>
  <ellipse cx="44" cy="74" rx="12" ry="4" fill="#6A855A"/>
  <!-- Gnarled wood trunk -->
  <path d="M52,75 Q46,55 58,45 T48,28 Q43,26 38,28" fill="none" stroke="#5E432E" stroke-width="8" stroke-linecap="round"/>
  <path d="M52,75 Q46,55 58,45 T48,28 Q43,26 38,28" fill="none" stroke="#7A583E" stroke-width="4.5" stroke-linecap="round"/>
  <!-- Branches -->
  <path d="M57,48 Q72,42 82,34" fill="none" stroke="#5E432E" stroke-width="4" stroke-linecap="round"/>
  <path d="M49,38 Q35,36 24,34" fill="none" stroke="#5E432E" stroke-width="3.5" stroke-linecap="round"/>
  <!-- Foliage clusters (layered pine pads) -->
  <!-- Top pad -->
  <ellipse cx="38" cy="22" rx="18" ry="8" fill="#365039"/>
  <ellipse cx="38" cy="20" rx="14" ry="6" fill="#446447"/>
  <ellipse cx="40" cy="18" rx="9" ry="4" fill="#587E5C"/>
  <!-- Right pad -->
  <ellipse cx="82" cy="30" rx="20" ry="9" fill="#2B402E"/>
  <ellipse cx="83" cy="28" rx="16" ry="7" fill="#365039"/>
  <ellipse cx="85" cy="26" rx="11" ry="5" fill="#4B6E4E"/>
  <!-- Left pad -->
  <ellipse cx="23" cy="31" rx="16" ry="8" fill="#2B402E"/>
  <ellipse cx="22" cy="29" rx="12" ry="6" fill="#39543C"/>
  <ellipse cx="24" cy="27" rx="8" ry="4" fill="#4D7051"/>
</svg>`;

export const SVG_VINE = `<svg width="85" height="135" viewBox="0 0 85 135" style="overflow:visible;" xmlns="http://www.w3.org/2000/svg">
  <!-- Minimalist cream ceramic pot -->
  <polygon points="25,35 60,35 55,70 30,70" fill="#E8E1D5"/>
  <rect x="23" y="30" width="39" height="7" rx="2" fill="#F4EFE6"/>
  <!-- Soil -->
  <ellipse cx="42.5" cy="33" rx="16" ry="3.5" fill="#4A3425"/>
  <!-- Trailing ivy vines -->
  <path d="M34,34 Q20,55 24,78 T18,108 T22,130" fill="none" stroke="#526E46" stroke-width="2" stroke-linecap="round"/>
  <path d="M42,34 Q48,60 42,88 T46,122" fill="none" stroke="#607F52" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M52,34 Q66,58 58,82 T65,115" fill="none" stroke="#48613D" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Leaves on vines -->
  <circle cx="21" cy="52" r="6" fill="#6A8C5B"/>
  <circle cx="28" cy="65" r="5.5" fill="#58764B"/>
  <circle cx="17" cy="80" r="6.5" fill="#759A65"/>
  <circle cx="23" cy="96" r="6" fill="#58764B"/>
  <circle cx="16" cy="112" r="5" fill="#6A8C5B"/>
  <circle cx="21" cy="126" r="4" fill="#7CAB6C"/>
  <circle cx="46" cy="54" r="6" fill="#759A65"/>
  <circle cx="39" cy="72" r="5.5" fill="#58764B"/>
  <circle cx="45" cy="94" r="6" fill="#6A8C5B"/>
  <circle cx="43" cy="115" r="4.5" fill="#7CAB6C"/>
  <circle cx="62" cy="50" r="5.5" fill="#58764B"/>
  <circle cx="56" cy="68" r="6.5" fill="#6A8C5B"/>
  <circle cx="63" cy="88" r="5" fill="#759A65"/>
  <circle cx="61" cy="108" r="4.5" fill="#58764B"/>
</svg>`;

// FULL DUCK WITH UNCLIPPED MOUTH (105x90 viewBox, generous right-side clearance
// for the beak tip at x=92, plus overflow="visible" as a redundant safety net so
// the bill is never clipped by the SVG element's bounding box.)
export const SVG_DUCK = `<svg width="105" height="90" viewBox="0 0 105 90" overflow="visible" style="overflow:visible;" xmlns="http://www.w3.org/2000/svg">
  <!-- Tail feathers -->
  <path d="M25,52 L8,47 Q12,60 25,67 Z" fill="#D9A05B"/>
  <!-- Body -->
  <ellipse cx="42" cy="55" rx="30" ry="22" fill="#D9A05B"/>
  <!-- Underbelly shading -->
  <path d="M17,66 Q42,83 67,66 Q42,76 17,66 Z" fill="#C48E4D"/>
  <!-- Chest -->
  <path d="M47,42 L52,27 L70,40 Z" fill="#D9A05B"/>
  <!-- Head -->
  <circle cx="62" cy="26" r="14" fill="#D9A05B"/>
  <!-- Full, complete duck bill / mouth -->
  <path d="M72,21 Q92,20 88,27 Q75,28 72,27 Z" fill="#D46A52"/>
  <path d="M73,27 Q87,27 84,32 Q74,33 73,27 Z" fill="#A85240"/>
  <circle cx="77" cy="23" r="1.2" fill="#8C3A27"/>
  <!-- Eye -->
  <circle cx="65" cy="21" r="2.5" fill="#29292E"/>
  <circle cx="65.6" cy="20" r="1" fill="#FFFFFF"/>
  <!-- Wing -->
  <path d="M28,50 Q47,42 58,54 Q47,66 28,50 Z" fill="#D9A05B" stroke="#C48E4D" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M36,53 Q44,52 50,57" fill="none" stroke="#C48E4D" stroke-width="2" stroke-linecap="round"/>
</svg>`;

export const SVG_MALLARD = `<svg width="110" height="90" viewBox="0 0 110 90" overflow="visible" style="overflow:visible;" xmlns="http://www.w3.org/2000/svg">
  <!-- Tail feathers -->
  <path d="M22,50 L5,46 Q10,58 22,64 Z" fill="#424B54"/>
  <path d="M12,48 Q18,44 20,49" stroke="#2A2F35" stroke-width="2" fill="none"/>
  <!-- Body -->
  <ellipse cx="44" cy="54" rx="31" ry="21" fill="#8C8880"/>
  <!-- Flank belly -->
  <path d="M20,63 Q44,78 68,63 Q44,73 20,63 Z" fill="#6E6A63"/>
  <!-- Chestnut breast -->
  <path d="M46,45 Q58,42 68,54 Q58,66 46,60 Z" fill="#753527"/>
  <!-- Wing & blue speculum -->
  <path d="M27,48 Q46,40 58,53 Q46,63 27,48 Z" fill="#706C64" stroke="#5A5750" stroke-width="2"/>
  <rect x="38" y="50" width="14" height="6" rx="2" fill="#2B4C7E" transform="rotate(-15 38 50)"/>
  <line x1="36" y1="49" x2="50" y2="45" stroke="#FFFFFF" stroke-width="1.5"/>
  <!-- Neck and head -->
  <path d="M49,42 L54,26 L72,39 Z" fill="#1C5940"/>
  <!-- White neck ring -->
  <path d="M52,33 Q58,36 64,33" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>
  <!-- Emerald Head -->
  <circle cx="64" cy="23" r="14" fill="#1C5940"/>
  <ellipse cx="63" cy="18" rx="8" ry="4" fill="#2E7D5B"/>
  <!-- Full, complete Bill (generous right margin so the beak tip is never clipped) -->
  <path d="M74,18 Q96,17 91,25 Q75,25 74,25 Z" fill="#CBB638"/>
  <path d="M74,24 Q92,24 90,29 Q75,30 74,25 Z" fill="#A89425"/>
  <circle cx="83" cy="22" r="1.5" fill="#222"/>
  <!-- Eye -->
  <circle cx="68" cy="19" r="2.5" fill="#1A1A1A"/>
  <circle cx="68.6" cy="18.2" r="1" fill="#FFFFFF"/>
</svg>`;

export const SVG_DETECTIVE_DUCK = `<svg width="108" height="95" viewBox="0 0 108 95" overflow="visible" style="overflow:visible;" xmlns="http://www.w3.org/2000/svg">
  <!-- Tail -->
  <path d="M25,55 L8,50 Q12,63 25,70 Z" fill="#D9A05B"/>
  <!-- Body -->
  <ellipse cx="42" cy="58" rx="30" ry="22" fill="#D9A05B"/>
  <path d="M17,69 Q42,86 67,69 Q42,79 17,69 Z" fill="#C48E4D"/>
  <!-- Trenchcoat collar & tie -->
  <polygon points="48,46 60,62 44,56" fill="#3D2B1F"/>
  <polygon points="52,48 59,60 50,58" fill="#8C3B3B"/>
  <!-- Wing -->
  <path d="M28,53 Q47,45 58,57 Q47,69 28,53 Z" fill="#D9A05B" stroke="#C48E4D" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Neck & head -->
  <path d="M47,45 L52,30 L70,43 Z" fill="#D9A05B"/>
  <circle cx="62" cy="29" r="14" fill="#D9A05B"/>
  <!-- Full Bill / Beak (plenty of right clearance for the tip) -->
  <path d="M72,24 Q94,23 88,30 Q73,30 72,30 Z" fill="#D46A52"/>
  <path d="M72,30 Q90,30 87,35 Q73,36 72,30 Z" fill="#A85240"/>
  <!-- Eye & Monocle -->
  <circle cx="66" cy="24" r="2.5" fill="#29292E"/>
  <circle cx="66.5" cy="23" r="1" fill="#FFFFFF"/>
  <circle cx="66" cy="24" r="5.5" fill="none" stroke="#D4AF37" stroke-width="1.8"/>
  <line x1="66" y1="29.5" x2="62" y2="44" stroke="#D4AF37" stroke-width="1.2"/>
  <!-- Deerstalker detective hat -->
  <path d="M46,22 Q54,19 62,20" stroke="#5A412F" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M62,19 Q74,17 78,23" stroke="#5A412F" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M50,22 C50,10 74,9 74,21 Z" fill="#73533C"/>
  <path d="M52,21 C54,12 70,11 72,20 Z" fill="#8A654A"/>
  <line x1="62" y1="10" x2="62" y2="21" stroke="#3D2A1C" stroke-width="2"/>
  <circle cx="62" cy="10" r="2.5" fill="#3D2A1C"/>
</svg>`;

export const SVG_WHITE_DUCK = `<svg width="105" height="90" viewBox="0 0 105 90" overflow="visible" style="overflow:visible;" xmlns="http://www.w3.org/2000/svg">
  <!-- Tail -->
  <path d="M25,50 L8,45 Q12,58 25,65 Z" fill="#F4EFEA"/>
  <!-- Body -->
  <ellipse cx="42" cy="53" rx="30" ry="22" fill="#FAF6F0"/>
  <path d="M17,64 Q42,81 67,64 Q42,74 17,64 Z" fill="#E2DDD5"/>
  <!-- Neck & head -->
  <path d="M47,40 L52,25 L70,38 Z" fill="#FAF6F0"/>
  <circle cx="62" cy="24" r="14" fill="#FAF6F0"/>
  <ellipse cx="60" cy="20" rx="9" ry="5" fill="#FFFFFF"/>
  <!-- Full Orange Beak (well clear of the right edge) -->
  <path d="M72,19 Q94,18 88,25 Q73,25 72,25 Z" fill="#E86E2A"/>
  <path d="M72,25 Q90,25 87,30 Q73,31 72,25 Z" fill="#C45618"/>
  <circle cx="78" cy="21" r="1" fill="#73320B"/>
  <!-- Wing with feather lines -->
  <path d="M28,48 Q47,40 58,52 Q47,64 28,48 Z" fill="#FFFFFF" stroke="#DDD7CE" stroke-width="2" stroke-linejoin="round"/>
  <path d="M36,51 Q44,50 50,55" fill="none" stroke="#DDD7CE" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M34,56 Q42,55 48,60" fill="none" stroke="#DDD7CE" stroke-width="1.5" stroke-linecap="round"/>
  <!-- Eye -->
  <circle cx="66" cy="19" r="2.5" fill="#1C1C1E"/>
  <circle cx="66.5" cy="18" r="1" fill="#FFFFFF"/>
</svg>`;

export function getPhotoSvg(url) {
  if (url) {
    const safeUrl = String(url).replace(/["<>\r\n]/g, '');
    return `<svg width="100" height="120" viewBox="0 0 100 120" style="overflow:visible;" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="120" rx="4" fill="#5E3821"/>
      <rect x="8" y="8" width="84" height="104" fill="#F0E6D8"/>
      <image href="${safeUrl}" x="18" y="22" width="64" height="76" preserveAspectRatio="xMidYMid slice" />
    </svg>`;
  }
  return `<svg width="100" height="120" viewBox="0 0 100 120" style="overflow:visible;" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="120" rx="4" fill="#5E3821"/>
    <rect x="8" y="8" width="84" height="104" fill="#F0E6D8"/>
    <rect x="18" y="22" width="64" height="76" fill="#E6DACA"/>
    <circle cx="65" cy="40" r="10" fill="#D9A05B"/>
    <polygon points="18,98 42,65 65,98" fill="#8C616B"/>
    <polygon points="40,98 62,75 82,98" fill="#66424A"/>
  </svg>`;
}

export const DECO_SIZES = {
  'Plant':           { w: 80,  h: 130 },
  'Potted Plant':    { w: 80,  h: 130 },
  'Monstera':        { w: 80,  h: 130 },
  'Cactus':          { w: 75,  h: 120 },
  'Bonsai':          { w: 110, h: 105 },
  'Vine Plant':      { w: 85,  h: 135 },
  'Ivy':             { w: 85,  h: 135 },
  'Duck':            { w: 105, h: 90  },
  'Classic Duck':    { w: 105, h: 90  },
  'Yellow Duck':     { w: 105, h: 90  },
  'Mallard Duck':    { w: 110, h: 90  },
  'Detective Duck':  { w: 108, h: 95  },
  'White Duck':      { w: 105, h: 90  },
  'Framed Photo':    { w: 100, h: 120 },
};

/**
 * Default descriptions for decorative items. Used in the inspect card when
 * the user hasn't supplied their own notes, and as a fallback everywhere the
 * item name is shown (so the picker feels like a catalog).
 */
export const DECO_DESCRIPTIONS = {
  'Plant':          'Classic lush potted houseplant in a terracotta pot',
  'Potted Plant':   'Classic lush potted houseplant in a terracotta pot',
  'Monstera':       'Classic lush potted houseplant in a terracotta pot',
  'Cactus':         'Saguaro desert cactus with spines and a blooming coral flower',
  'Bonsai':         'Japanese miniature pine bonsai with a gnarled wood trunk in a ceramic planter',
  'Vine Plant':     'Cascading English ivy tendrils trailing over a minimalist cream pot',
  'Ivy':            'Cascading English ivy tendrils trailing over a minimalist cream pot',
  'Duck':           'The classic golden rubber duck',
  'Classic Duck':   'The classic golden rubber duck',
  'Yellow Duck':    'The classic golden rubber duck',
  'Mallard Duck':   'Wild mallard with emerald-green head, white collar, chestnut breast, and wing speculum',
  'Detective Duck': 'Vintage duck wearing a Sherlock-style tweed deerstalker hat and a golden monocle',
  'White Duck':     'Porcelain-white duck with a bright orange bill and subtle feather shading',
};

/** Returns the default description for a deco item, or '' if none. */
export function getDecoDescription(name) {
  if (!name) return '';
  if (DECO_DESCRIPTIONS[name]) return DECO_DESCRIPTIONS[name];
  const lower = name.toLowerCase();
  if (lower.includes('monstera') || lower === 'plant' || lower.includes('potted plant')) {
    return DECO_DESCRIPTIONS['Plant'];
  }
  if (lower.includes('cactus')) {
    return DECO_DESCRIPTIONS['Cactus'];
  }
  if (lower.includes('bonsai')) {
    return DECO_DESCRIPTIONS['Bonsai'];
  }
  if (lower.includes('vine') || lower.includes('ivy')) {
    return DECO_DESCRIPTIONS['Vine Plant'];
  }
  if (lower.includes('mallard')) {
    return DECO_DESCRIPTIONS['Mallard Duck'];
  }
  if (lower.includes('detective')) {
    return DECO_DESCRIPTIONS['Detective Duck'];
  }
  if (lower.includes('white duck')) {
    return DECO_DESCRIPTIONS['White Duck'];
  }
  if (lower.includes('duck')) {
    return DECO_DESCRIPTIONS['Duck'];
  }
  return '';
}

export function getDecoSize(item) {
  const name = item.name || '';
  if (DECO_SIZES[name]) return DECO_SIZES[name];
  const lower = name.toLowerCase();
  if (lower.includes('mallard')) return { w: 110, h: 90 };
  if (lower.includes('detective')) return { w: 108, h: 95 };
  if (lower.includes('duck')) return { w: 105, h: 90 };
  if (lower.includes('cactus')) return { w: 75, h: 120 };
  if (lower.includes('bonsai')) return { w: 110, h: 105 };
  if (lower.includes('vine') || lower.includes('ivy')) return { w: 85, h: 135 };
  if (lower.includes('plant')) return { w: 80, h: 130 };
  return { w: 100, h: 120 };
}

export function getDecoSvg(item) {
  const name = item.name || '';
  if (name === 'Framed Photo') return getPhotoSvg(item.cover_url);
  if (name === 'Plant' || name === 'Potted Plant' || name === 'Monstera') return SVG_PLANT;
  if (name === 'Cactus') return SVG_CACTUS;
  if (name === 'Bonsai') return SVG_BONSAI;
  if (name === 'Vine Plant' || name === 'Ivy') return SVG_VINE;
  if (name === 'Duck' || name === 'Classic Duck' || name === 'Yellow Duck') return SVG_DUCK;
  if (name === 'Mallard Duck') return SVG_MALLARD;
  if (name === 'Detective Duck') return SVG_DETECTIVE_DUCK;
  if (name === 'White Duck') return SVG_WHITE_DUCK;

  // Fallback matching by keyword
  const lower = name.toLowerCase();
  if (lower.includes('mallard')) return SVG_MALLARD;
  if (lower.includes('detective')) return SVG_DETECTIVE_DUCK;
  if (lower.includes('white duck')) return SVG_WHITE_DUCK;
  if (lower.includes('duck')) return SVG_DUCK;
  if (lower.includes('cactus')) return SVG_CACTUS;
  if (lower.includes('bonsai')) return SVG_BONSAI;
  if (lower.includes('vine') || lower.includes('ivy')) return SVG_VINE;
  if (lower.includes('plant')) return SVG_PLANT;
  return getPhotoSvg(item.cover_url);
}

const TITLE_COLOR = '#F5F0E8';

const BOOK_PALETTES = [
  { bg: 'linear-gradient(to bottom, #B5543D, #8F3D2B)', label: 'terracotta' },
  { bg: 'linear-gradient(to bottom, #4A5C70, #304052)', label: 'navy'       },
  { bg: 'linear-gradient(to bottom, #9E8C4D, #7A6933)', label: 'mustard'    },
  { bg: 'linear-gradient(to bottom, #6B7557, #4D573B)', label: 'olive'      },
  { bg: 'linear-gradient(to bottom, #8C616B, #66424A)', label: 'rose'       },
];
const MOVIE_BG = 'linear-gradient(to bottom, #29292E, #17171C)';
const MUSIC_BG = 'linear-gradient(to bottom, #5C6B59, #3D4A3D)';

// Noise texture SVG — cloth/cardboard feel on spines
const NOISE_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.22'/%3E%3C/svg%3E`;

/** Deterministic palette: same item name always gets same colour */
function bookPalette(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return BOOK_PALETTES[h % BOOK_PALETTES.length];
}

/**
 * Build the DOM element for one shelf item.
 * @param {object}  item        - DB row from items table
 * @param {boolean} interactive - false = share page (no drag / inspect)
 */
export function buildItemEl(item, interactive = true) {
  const el = document.createElement('div');
  el.className = 'shelf-item';
  el.dataset.itemId = item.id;
  el.dataset.type   = item.type;

  // Sizing — books narrow/tall, movies DVD proportions, music square sleeve, deco specific
  let w, h;
  if      (item.type === 'book')       { w = 36;  h = 180; }
  else if (item.type === 'movie')      { w = 50;  h = 160; }
  else if (item.type === 'music')      { w = 140; h = 140; }
  else if (item.type === 'decorative') { 
    const size = getDecoSize(item);
    w = size.w;
    h = size.h;
  }
  else                                 { w = 120; h = 120; }

  const rot = item.rotation || 0;
  const isDeco = item.type === 'decorative';

  el.style.cssText = `
    position: absolute;
    width: ${w}px;
    height: ${h}px;
    bottom: 0;
    left: ${item.position_x || 0}px;
    transform: rotate(${rot}deg);
    transform-origin: bottom center;
    cursor: ${interactive ? 'pointer' : 'default'};
    user-select: none;
    touch-action: none;
    outline: none;
    -webkit-tap-highlight-color: transparent;
    flex-shrink: 0;
    will-change: transform;
    /* Animate only transform (GPU-cheap). Filter/box-shadow snap on hover
       so we don't pay the cost of re-rasterising drop-shadows every frame. */
    transition: transform 0.18s cubic-bezier(0.22,1,0.36,1);
  `;

  // Expose the item's base rotation to CSS keyframes (duckQuackWobble, itemDrop)
  // so animated transforms keep the tilt instead of snapping back to 0deg.
  el.style.setProperty('--r', `${rot}deg`);

  if (isDeco) {
    el.style.filter = 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))';
    el.style.overflow = 'visible';
    el.style.background = 'none';
  } else {
    el.style.borderRadius = '2px';
    el.style.overflow = 'hidden';
    el.style.boxShadow = `
      0 1px 3px rgba(0,0,0,0.7),
      0 8px 16px rgba(0,0,0,0.5)
    `;
  }

  // Spine background
  if (!isDeco) {
    let spineBg;
    if      (item.type === 'book')  spineBg = bookPalette(item.name).bg;
    else if (item.type === 'movie') spineBg = MOVIE_BG;
    else if (item.type === 'music') spineBg = MUSIC_BG;
    el.style.background = spineBg;
  }

  // ── Inner wrapper ──
  // For decorative items the SVG must fill the el exactly so its bill tip
  // isn't shifted by the wrapper's padding; books/movies/music keep the
  // padding so the title label has breathing room.
  const inner = document.createElement('div');
  inner.style.cssText = isDeco ? `
    position: relative; width: 100%; height: 100%;
    display: flex; flex-direction: column;
    align-items: stretch; justify-content: flex-end;
    padding: 0; box-sizing: border-box;
  ` : `
    position: relative; width: 100%; height: 100%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: flex-end;
    padding: 6px 4px; box-sizing: border-box;
  `;

  // ── Inject Deco SVG ──
  if (isDeco) {
    const svgStr = getDecoSvg(item);
    const svgWrap = document.createElement('div');
    svgWrap.style.cssText = `width: 100%; height: 100%; display: flex; align-items: flex-end; justify-content: center; pointer-events: none; overflow: visible;`;
    svgWrap.innerHTML = svgStr;
    inner.appendChild(svgWrap);
  }

  // ── Noise texture overlay (cloth/cardboard feel) ──
  if (!isDeco) {
    const noise = document.createElement('div');
    noise.style.cssText = `
      position: absolute; inset: 0; pointer-events: none;
      background-image: url("${NOISE_SVG}");
      background-size: 100px 100px;
      mix-blend-mode: overlay;
      opacity: 0.40;
      border-radius: inherit;
    `;
    inner.appendChild(noise);
  }

  // ── Cover image (Media TYPES) ──
  if (!isDeco && item.cover_url) {
    const coverWrap = document.createElement('div');
    let wrapCss = `position: absolute; overflow: hidden; border-radius: inherit; z-index: 0; pointer-events: none;`;
    if (item.type === 'music' || item.type === 'movie') {
      wrapCss += ` inset: 0;`;
    } else if (item.type === 'book') {
      wrapCss += ` top: 0; left: 0; right: 0; height: 45%; border-bottom: 2px solid rgba(0,0,0,0.3);`;
    }
    coverWrap.style.cssText = wrapCss;

    const img = document.createElement('img');
    img.src = item.cover_url;
    img.alt = item.name || '';
    
    let imgCss = `width: 100%; height: 100%; object-fit: cover; opacity: 0.85; mix-blend-mode: multiply;`;
    img.style.cssText = imgCss;
    img.onerror = () => coverWrap.remove();
    coverWrap.appendChild(img);

    if (item.type === 'movie') {
      const grad = document.createElement('div');
      grad.style.cssText = `
        position: absolute; bottom: 0; left: 0; right: 0; height: 35%;
        background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%);
      `;
      coverWrap.appendChild(grad);
    }

    inner.appendChild(coverWrap);
  }

  // ── Movie: accent band + diagonal gloss ──
  if (item.type === 'movie') {
    const band = document.createElement('div');
    band.style.cssText = `
      position: absolute; top: 0; left: 0; right: 0; height: 33%;
      background: linear-gradient(to bottom, #AD783D 0%, rgba(173,120,61,0) 100%);
      opacity: 0.75; pointer-events: none;
    `;
    inner.appendChild(band);
    const gloss = document.createElement('div');
    gloss.style.cssText = `
      position: absolute; inset: 0; pointer-events: none;
      background: linear-gradient(
        18deg,
        transparent         35%,
        rgba(255,255,255,0.14) 52%,
        rgba(255,255,255,0.04) 60%,
        transparent         72%
      );
    `;
    inner.appendChild(gloss);
  }

  // ── Music: subtle inner shadow at bottom ──
  if (item.type === 'music') {
    const shadow = document.createElement('div');
    shadow.style.cssText = `
      position: absolute; bottom: 0; left: 0; right: 0; height: 40px;
      background: linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%);
      pointer-events: none;
    `;
    inner.appendChild(shadow);
  }

  if (!isDeco) {
    // ── Title label ──
    const titleEl = document.createElement('span');
    titleEl.className = 'item-title';
    titleEl.textContent = item.name;

    if (item.type === 'music') {
      titleEl.style.cssText = `
        position: relative; z-index: 3;
        color: ${TITLE_COLOR};
        font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600;
        text-align: center; max-width: 100%;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        text-shadow: 0 1px 4px rgba(0,0,0,0.9);
        letter-spacing: 0.02em; padding: 4px;
      `;
    } else {
      titleEl.style.cssText = `
        position: absolute; z-index: 2;
        color: ${TITLE_COLOR};
        font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600;
        writing-mode: vertical-rl; text-orientation: mixed;
        transform: rotate(180deg);
        white-space: nowrap; max-height: 90%;
        overflow: hidden; text-overflow: ellipsis;
        text-shadow: 0 1px 4px rgba(0,0,0,0.95);
        letter-spacing: 0.05em; bottom: 8px;
      `;
    }
    inner.appendChild(titleEl);
  }

  el.appendChild(inner);

  // ── Hover / drag state management (interactive only) ──
  if (interactive) {
    el.addEventListener('mouseenter', () => {
      if (el.dataset.dragging === 'true') return;
      el.style.transform = `rotate(${rot}deg) translateY(-8px) scale(1.02)`;
      if (isDeco) {
        el.style.filter = `drop-shadow(0 14px 28px rgba(0,0,0,0.6))`;
      } else {
        el.style.boxShadow = `
          0 4px 8px rgba(0,0,0,0.4),
          0 14px 28px rgba(0,0,0,0.6)
        `;
      }
    });
    el.addEventListener('mouseleave', () => {
      if (el.dataset.dragging === 'true') return;
      el.style.transform = `rotate(${rot}deg)`;
      if (isDeco) {
        el.style.filter = `drop-shadow(0 8px 16px rgba(0,0,0,0.5))`;
      } else {
        el.style.boxShadow = `
          0 1px 3px rgba(0,0,0,0.7),
          0 8px 16px rgba(0,0,0,0.5)
        `;
      }
    });
  }

  return el;
}

/**
 * Render shelf items into a container (used by share.js).
 * room.js uses buildItemEl directly for finer control.
 */
export function renderShelf(container, shelf, items, {
  interactive = true,
  onItemClick = null,
} = {}) {
  container.innerHTML = '';

  const sorted = [...items].sort((a, b) =>
    (a.sort_order - b.sort_order) || (a.position_x - b.position_x)
  );

  sorted.forEach((item) => {
    const el = buildItemEl(item, interactive);
    if (interactive && onItemClick) {
      el.addEventListener('click', () => {
        if (el.dataset.dragging === 'true') return;
        onItemClick(item, el);
      });
    }
    container.appendChild(el);
  });
}

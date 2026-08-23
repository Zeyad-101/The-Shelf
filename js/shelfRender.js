/**
 * shelfRender.js — Polish Pass v2
 * Shared rendering used by room.js and share.js.
 */

// Fixed title color — NEVER derived from item data (Bug #2 prevention)
export const SVG_PLANT = `<svg width="80" height="130" viewBox="0 0 80 130" xmlns="http://www.w3.org/2000/svg"><path d="M40,70 C15,30 5,50 15,20 C30,0 40,40 40,70" fill="#5C6B59"/><path d="M40,70 C30,30 40,5 40,0 C50,5 50,30 40,70" fill="#758B6D"/><path d="M40,70 C65,30 75,50 65,20 C50,0 40,40 40,70" fill="#5C6B59"/><rect x="10" y="70" width="60" height="10" rx="3" fill="#C4705A"/><polygon points="15,80 65,80 55,130 25,130" fill="#9C523F"/></svg>`;

export function getPhotoSvg(url) {
  if (url) {
    const safeUrl = String(url).replace(/["<>\r\n]/g, '');
    return `<svg width="100" height="120" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="120" rx="4" fill="#5E3821"/>
      <rect x="8" y="8" width="84" height="104" fill="#F0E6D8"/>
      <image href="${safeUrl}" x="18" y="22" width="64" height="76" preserveAspectRatio="xMidYMid slice" />
    </svg>`;
  }
  return `<svg width="100" height="120" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="120" rx="4" fill="#5E3821"/>
    <rect x="8" y="8" width="84" height="104" fill="#F0E6D8"/>
    <rect x="18" y="22" width="64" height="76" fill="#E6DACA"/>
    <circle cx="65" cy="40" r="10" fill="#D9A05B"/>
    <polygon points="18,98 42,65 65,98" fill="#8C616B"/>
    <polygon points="40,98 62,75 82,98" fill="#66424A"/>
  </svg>`;
}

export const SVG_DUCK = `<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><path d="M25,50 L8,45 Q12,58 25,65 Z" fill="#D9A05B"/><ellipse cx="40" cy="53" rx="30" ry="22" fill="#D9A05B"/><path d="M15,64 Q40,81 65,64 Q40,74 15,64 Z" fill="#C48E4D"/><path d="M45,40 L50,25 L68,38 Z" fill="#D9A05B"/><circle cx="60" cy="24" r="14" fill="#D9A05B"/><path d="M72,19 Q86,18 80,25 Q73,25 72,25 Z" fill="#D46A52"/><path d="M72,25 Q82,25 79,30 Q73,31 72,25 Z" fill="#A85240"/><circle cx="64" cy="19" r="2.5" fill="#29292E"/><circle cx="64.5" cy="18" r="1" fill="#FFFFFF"/><path d="M26,48 Q45,40 56,52 Q45,64 26,48 Z" fill="#D9A05B" stroke="#C48E4D" stroke-width="2.5" stroke-linejoin="round"/><path d="M34,51 Q42,50 48,55" fill="none" stroke="#C48E4D" stroke-width="2" stroke-linecap="round"/></svg>`;
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
// baseFrequency 0.75 = fine grain; opacity 0.22 = visible without washing out colour
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
    if (item.name === 'Plant') { w = 80; h = 130; }
    else if (item.name === 'Duck') { w = 80; h = 80; }
    else { w = 100; h = 120; }
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
    transition: transform 0.18s cubic-bezier(0.22,1,0.36,1),
                filter 0.18s ease, box-shadow 0.18s ease;
  `;

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
  const inner = document.createElement('div');
  inner.style.cssText = `
    position: relative; width: 100%; height: 100%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: flex-end;
    padding: 6px 4px; box-sizing: border-box;
  `;

  // ── Inject Deco SVG ──
  if (isDeco) {
    let svgStr = getPhotoSvg(item.cover_url);
    if (item.name === 'Plant') svgStr = SVG_PLANT;
    else if (item.name === 'Duck') svgStr = SVG_DUCK;
    
    const svgWrap = document.createElement('div');
    svgWrap.style.cssText = `width: 100%; height: 100%; display: flex; align-items: flex-end; justify-content: center; pointer-events: none;`;
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
    
    // z-index: 0 so depth overlays (caps, stitches, spine highlight) sit on top of the cover
    let wrapCss = `position: absolute; overflow: hidden; border-radius: inherit; z-index: 0; pointer-events: none;`;
    if (item.type === 'music' || item.type === 'movie') {
      wrapCss += ` inset: 0;`;
    } else if (item.type === 'book') {
      // Books: cover on top 45% of spine
      wrapCss += ` top: 0; left: 0; right: 0; height: 45%; border-bottom: 2px solid rgba(0,0,0,0.3);`;
    }
    coverWrap.style.cssText = wrapCss;

    const img = document.createElement('img');
    img.src = item.cover_url;
    img.alt = item.name || '';
    
    let imgCss = `width: 100%; height: 100%; object-fit: cover; opacity: 0.85; mix-blend-mode: multiply;`;
    img.style.cssText = imgCss;
    img.onerror = () => coverWrap.remove(); // fallback gracefully
    coverWrap.appendChild(img);

    // Text legibility gradient for movies
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
    // Diagonal gloss — raised from 0.07 to 0.14 so it's actually visible
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
    // ── Title label — ALWAYS #F5F0E8 ──
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
      // Don't lift if actively dragging
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
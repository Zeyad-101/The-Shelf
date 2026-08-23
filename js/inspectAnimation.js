/**
 * inspectAnimation.js — with Delete feature
 *
 * openInspect(item, itemEl, options)
 *   options.showDelete  {boolean} — true only in room.html (owner view)
 *   options.onDeleted   {function(itemId)} — called after successful DB delete
 *
 * The confirmation dialog is rendered *inside* the inspect card so:
 *  - Cancel restores the inspect view (activeItem / firstRect untouched)
 *  - No extra overlay z-index juggling needed
 *  - FLIP close still works normally after delete
 */

import { supabase } from './supabaseClient.js';
import { SVG_PLANT, getPhotoSvg, SVG_DUCK } from './shelfRender.js';

let activeOverlay = null;
let activeItem    = null;   // the shelf-item DOM element (hidden while card is open)
let firstRect     = null;   // captured before card opens, used for FLIP close
const TITLE_COLOR = '#F5F0E8';

/* ─── Public API ─────────────────────────────────────────────────────────────── */

/**
 * @param {object}   item
 * @param {Element}  itemEl
 * @param {object}   [options]
 * @param {boolean}  [options.showDelete=false]   show Delete button
 * @param {function} [options.onDeleted]           called with itemId on success
 */
export function openInspect(item, itemEl, { showDelete = false, onDeleted = null } = {}) {
  if (activeOverlay) closeInspect();

  // FLIP — FIRST
  firstRect = itemEl.getBoundingClientRect();

  // Hide the original element (preserve layout space)
  itemEl.style.opacity      = '0';
  itemEl.style.pointerEvents = 'none';
  activeItem = itemEl;

  // Build card
  const card = buildInspectCard(item, { showDelete, onDeleted });
  card.style.cssText += `
    position: fixed;
    z-index: 1000;
  `;

  // Backdrop
  const backdrop = document.createElement('div');
  backdrop.style.cssText = `
    position: fixed; inset: 0; z-index: 999;
    background: rgba(34,20,10,0.65);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  backdrop.addEventListener('click', closeInspect);

  document.body.appendChild(backdrop);
  document.body.appendChild(card);

  // FLIP — LAST: settle position (centred)
  const targetW     = Math.min(440, window.innerWidth - 40);
  card.style.width  = targetW + 'px';
  card.style.left   = ((window.innerWidth - targetW) / 2) + 'px';
  card.style.top    = '50%';
  card.style.transform = 'translateY(-50%)';

  const lastRect = card.getBoundingClientRect();

  // FLIP — INVERT
  const dx     = firstRect.left   - lastRect.left;
  const dy     = firstRect.top    - lastRect.top;
  const scaleX = firstRect.width  / lastRect.width;
  const scaleY = firstRect.height / lastRect.height;

  // FLIP — PLAY (open)
  card.animate([
    { transform: `translateY(-50%) translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`, opacity: 0 },
    { transform: 'translateY(-50%) translate(0,0) scale(1)',                                  opacity: 1 },
  ], { duration: 450, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' });

  requestAnimationFrame(() => { backdrop.style.opacity = '1'; });

  activeOverlay = { backdrop, card };
  document.addEventListener('keydown', handleEsc);
}

/** Reverse-FLIP close — returns item to exact original screen position */
export function closeInspect() {
  if (!activeOverlay) return;

  const { backdrop, card } = activeOverlay;
  const lastRect = card.getBoundingClientRect();

  // Guard: if firstRect is null (shouldn't happen) just remove immediately
  if (!firstRect) {
    card.remove(); backdrop.remove();
    _resetState();
    return;
  }

  const dx     = firstRect.left   - lastRect.left;
  const dy     = firstRect.top    - lastRect.top;
  const scaleX = firstRect.width  / lastRect.width;
  const scaleY = firstRect.height / lastRect.height;

  const anim = card.animate([
    { transform: 'translateY(-50%) translate(0,0) scale(1)',                                  opacity: 1 },
    { transform: `translateY(-50%) translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`, opacity: 0 },
  ], { duration: 350, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' });

  backdrop.style.opacity = '0';

  anim.onfinish = () => {
    card.remove();
    backdrop.remove();
    // Restore original shelf item
    if (activeItem) {
      activeItem.style.opacity      = '1';
      activeItem.style.pointerEvents = 'auto';
    }
    _resetState();
  };

  document.removeEventListener('keydown', handleEsc);
}

/* ─── Private helpers ────────────────────────────────────────────────────────── */

function _resetState() {
  activeOverlay = null;
  activeItem    = null;
  firstRect     = null;
}

function handleEsc(e) {
  if (e.key === 'Escape') closeInspect();
}

/* ─── Inspect card builder ───────────────────────────────────────────────────── */

function buildInspectCard(item, { showDelete, onDeleted }) {
  const card = document.createElement('div');
  card.className = 'inspect-card';
  const isDeco = item.type === 'decorative';
  card.style.cssText = isDeco ? `
    background: transparent;
    border-radius: 0;
    padding: 0;
    box-shadow: none;
    color: ${TITLE_COLOR};
    font-family: 'Inter', sans-serif;
    overflow: visible;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
  ` : `
    background: linear-gradient(160deg, #2C1A0E 0%, #1A0E06 100%);
    border-radius: 12px;
    padding: 28px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.6);
    color: ${TITLE_COLOR};
    font-family: 'Inter', sans-serif;
    overflow: hidden;
    box-sizing: border-box;
  `;

  // ── Content area (what gets hidden when confirm dialog shows) ──
  const contentArea = document.createElement('div');
  contentArea.className = 'inspect-content';

  if (isDeco) {
    contentArea.style.display = 'flex';
    contentArea.style.flexDirection = 'column';
    contentArea.style.alignItems = 'center';
    contentArea.style.padding = '20px 0';
    
    let svgStr = getPhotoSvg(item.cover_url);
    if (item.name === 'Plant') svgStr = SVG_PLANT;
    else if (item.name === 'Duck') svgStr = SVG_DUCK;
    
    const svgWrap = document.createElement('div');
    svgWrap.style.cssText = `margin-bottom: 24px; filter: drop-shadow(0 12px 30px rgba(0,0,0,0.6)); transform: scale(1.5);`;
    svgWrap.innerHTML = svgStr;
    contentArea.appendChild(svgWrap);

    const title = document.createElement('h2');
    title.textContent = item.name;
    title.style.cssText = `
      font-family: 'Fraunces', serif; font-size: 24px; font-weight: 600;
      color: ${TITLE_COLOR}; margin: 0;
    `;
    contentArea.appendChild(title);
  } else {
    // Type badge
    const badge = document.createElement('div');
    badge.textContent = item.type.toUpperCase();
    badge.style.cssText = `
      font-size: 10px; font-weight: 700; letter-spacing: 0.15em;
      color: #D9AD80; margin-bottom: 12px; opacity: 0.8;
    `;
    contentArea.appendChild(badge);

    // Cover + title row
    const topRow = document.createElement('div');
    topRow.style.cssText = `display: flex; gap: 16px; align-items: flex-start; margin-bottom: 16px;`;

    if (item.cover_url) {
      const img = document.createElement('img');
      img.src = item.cover_url;
      img.style.cssText = `
        width: 80px; height: 120px; object-fit: cover; border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      `;
      img.onerror = () => img.remove();
      topRow.appendChild(img);
    }

    const textCol = document.createElement('div');
    textCol.style.cssText = `flex: 1; min-width: 0;`;

    const title = document.createElement('h2');
    title.textContent = item.name;
    title.style.cssText = `
      font-family: 'Fraunces', serif; font-size: 22px; font-weight: 600;
      color: ${TITLE_COLOR}; margin: 0 0 8px 0; line-height: 1.2;
    `;
    textCol.appendChild(title);

    if (item.rating != null) {
      const stars = document.createElement('div');
      stars.style.cssText = `font-size: 14px; color: #D9AD80; margin-bottom: 6px;`;
      const filled = Math.round(item.rating / 2);
      stars.textContent = '★'.repeat(filled) + '☆'.repeat(5 - filled) + ` ${item.rating}/10`;
      textCol.appendChild(stars);
    }

    topRow.appendChild(textCol);
    contentArea.appendChild(topRow);

    if (item.description) {
      const desc = document.createElement('p');
      desc.textContent = item.description;
      desc.style.cssText = `
        font-size: 14px; line-height: 1.6; color: rgba(245,240,232,0.8);
        margin: 0; padding-top: 12px;
        border-top: 1px solid rgba(255,255,255,0.1);
      `;
      contentArea.appendChild(desc);
    }
  }

  // ── Button row ──
  const btnRow = document.createElement('div');
  btnRow.style.cssText = `
    display: flex; align-items: center; gap: 10px; margin-top: 20px;
  `;

  // Close button
  const exitBtn = _makeBtn('Close', {
    border: '1px solid rgba(217,173,128,0.5)',
    color:  '#D9AD80',
    hoverBg: 'rgba(217,173,128,0.15)',
  });
  exitBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeInspect();
  });
  btnRow.appendChild(exitBtn);

  // Delete button — only in owner context
  if (showDelete) {
    const deleteBtn = _makeBtn('Delete', {
      border:   '1px solid rgba(180,80,60,0.45)',
      color:    '#C4705A',     // warm rust — consistent with palette, not harsh pure red
      hoverBg:  'rgba(180,80,60,0.15)',
      fontSize: '12px',
      marginLeft: 'auto',     // push to far right so it's separate from Close
    });
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Swap content area for confirm dialog (doesn't close the card/backdrop)
      showConfirmDelete(card, contentArea, item, { onDeleted });
    });
    btnRow.appendChild(deleteBtn);
  }

  contentArea.appendChild(btnRow);
  card.appendChild(contentArea);
  return card;
}

/* ─── Shared confirm dialog (standalone overlay) ─────────────────────────────── */

/**
 * Generic in-theme confirmation dialog — a standalone fixed overlay.
 * Used for shelf deletion (and any future destructive action that doesn't
 * have an inspect card to embed inside).
 *
 * @param {object}   opts
 * @param {string}   opts.heading       - Main question (Fraunces serif)
 * @param {string}   opts.subtext       - Secondary warning line
 * @param {string}   [opts.confirmLabel='Delete'] - Label for the destructive button
 * @param {Function} opts.onConfirm     - async fn(); must return { error } or null
 * @param {Function} [opts.onCancel]    - called when user cancels
 */
export function showConfirmDialog({ heading, subtext, confirmLabel = 'Delete', onConfirm, onCancel }) {
  const backdrop = document.createElement('div');
  backdrop.style.cssText = `
    position: fixed; inset: 0; z-index: 1100;
    background: rgba(30,16,6,0.70);
    backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
    opacity: 0; transition: opacity 0.2s ease;
  `;

  const card = document.createElement('div');
  card.style.cssText = `
    position: fixed; z-index: 1101;
    left: 50%; top: 50%;
    transform: translate(-50%, -50%) scale(0.93);
    width: min(400px, calc(100vw - 40px));
    background: linear-gradient(160deg, #2C1A0E 0%, #1A0E06 100%);
    border-radius: 12px; padding: 28px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.65);
    color: #F5F0E8; font-family: 'Inter', sans-serif;
    box-sizing: border-box;
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.22,1,0.36,1);
  `;

  const headEl = document.createElement('p');
  headEl.style.cssText = `
    font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600;
    color: #F5F0E8; margin: 0 0 8px 0; line-height: 1.35;
  `;
  headEl.textContent = heading;
  card.appendChild(headEl);

  const subEl = document.createElement('p');
  subEl.style.cssText = `font-size: 13px; color: rgba(245,240,232,0.5); margin: 0 0 20px 0;`;
  subEl.textContent = subtext;
  card.appendChild(subEl);

  const errEl = document.createElement('div');
  errEl.style.cssText = `color: #C4705A; font-size: 13px; margin-bottom: 14px; display: none;`;
  card.appendChild(errEl);

  const btnRow = document.createElement('div');
  btnRow.style.cssText = `display: flex; align-items: center; gap: 10px;`;

  const _close = () => {
    card.style.opacity   = '0';
    card.style.transform = 'translate(-50%, -50%) scale(0.93)';
    backdrop.style.opacity = '0';
    setTimeout(() => { card.remove(); backdrop.remove(); }, 220);
    document.removeEventListener('keydown', _escHandler);
  };

  const cancelBtn = _makeBtn('Cancel', {
    border:  '1px solid rgba(217,173,128,0.5)',
    color:   '#D9AD80',
    hoverBg: 'rgba(217,173,128,0.15)',
  });
  cancelBtn.addEventListener('click', () => {
    _close();
    if (typeof onCancel === 'function') onCancel();
  });
  btnRow.appendChild(cancelBtn);

  const confirmBtn = _makeBtn(confirmLabel, {
    border:     '1px solid rgba(180,80,60,0.6)',
    color:      '#F5F0E8',
    background: 'rgba(160,65,45,0.75)',
    hoverBg:    'rgba(180,80,60,0.9)',
    marginLeft: 'auto',
  });
  confirmBtn.addEventListener('click', async () => {
    confirmBtn.disabled    = true;
    confirmBtn.textContent = 'Deleting…';
    cancelBtn.disabled     = true;
    errEl.style.display    = 'none';

    const result = await onConfirm();
    const error  = result?.error ?? null;

    if (error) {
      errEl.textContent   = 'Delete failed: ' + error.message;
      errEl.style.display = 'block';
      confirmBtn.disabled    = false;
      confirmBtn.textContent = confirmLabel;
      cancelBtn.disabled     = false;
      return;
    }
    _close();
  });
  btnRow.appendChild(confirmBtn);
  card.appendChild(btnRow);

  document.body.appendChild(backdrop);
  document.body.appendChild(card);

  requestAnimationFrame(() => {
    backdrop.style.opacity = '1';
    card.style.opacity     = '1';
    card.style.transform   = 'translate(-50%, -50%) scale(1)';
  });

  const _escHandler = (e) => { if (e.key === 'Escape') { _close(); if (typeof onCancel === 'function') onCancel(); } };
  document.addEventListener('keydown', _escHandler);
  backdrop.addEventListener('click', () => { _close(); if (typeof onCancel === 'function') onCancel(); });
}

/* ─── Confirm dialog embedded inside inspect card (item delete) ──────────────── */

/**
 * Replaces contentArea with an in-theme confirmation dialog.
 * Cancel restores contentArea. Confirm deletes and cleans up.
 */
function showConfirmDelete(card, contentArea, item, { onDeleted }) {
  // Hide main content with a quick fade
  contentArea.style.transition = 'opacity 0.15s ease';
  contentArea.style.opacity    = '0';

  setTimeout(() => {
    contentArea.style.display = 'none';

    const dialog = document.createElement('div');
    dialog.className = 'inspect-confirm';

    // Heading
    const heading = document.createElement('p');
    heading.style.cssText = `
      font-family: 'Fraunces', serif;
      font-size: 17px; font-weight: 600;
      color: ${TITLE_COLOR};
      margin: 0 0 8px 0; line-height: 1.35;
    `;
    // Truncate very long names to keep dialog tidy
    const displayName = item.name.length > 40
      ? item.name.slice(0, 38) + '…'
      : item.name;
    heading.textContent = `Remove "${displayName}" from your shelf?`;
    dialog.appendChild(heading);

    const sub = document.createElement('p');
    sub.textContent = `This can't be undone.`;
    sub.style.cssText = `
      font-size: 13px; color: rgba(245,240,232,0.5);
      margin: 0 0 20px 0;
    `;
    dialog.appendChild(sub);

    // Error area (hidden until a failure occurs)
    const errEl = document.createElement('div');
    errEl.style.cssText = `
      color: #C4705A; font-size: 13px;
      margin-bottom: 14px; min-height: 0;
      display: none;
    `;
    dialog.appendChild(errEl);

    // Buttons
    const btnRow = document.createElement('div');
    btnRow.style.cssText = `display: flex; align-items: center; gap: 10px;`;

    // Cancel
    const cancelBtn = _makeBtn('Cancel', {
      border:  '1px solid rgba(217,173,128,0.5)',
      color:   '#D9AD80',
      hoverBg: 'rgba(217,173,128,0.15)',
    });
    cancelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Remove dialog, restore content area
      dialog.remove();
      contentArea.style.display  = '';
      contentArea.style.opacity  = '0';
      requestAnimationFrame(() => {
        contentArea.style.transition = 'opacity 0.15s ease';
        contentArea.style.opacity    = '1';
      });
    });
    btnRow.appendChild(cancelBtn);

    // Confirm delete
    const confirmBtn = _makeBtn('Delete', {
      border:      '1px solid rgba(180,80,60,0.6)',
      color:       '#F5F0E8',
      background:  'rgba(160,65,45,0.75)',  // filled rust to signal irreversibility
      hoverBg:     'rgba(180,80,60,0.9)',
      marginLeft:  'auto',
    });
    confirmBtn.addEventListener('click', async (e) => {
      e.stopPropagation();

      confirmBtn.disabled   = true;
      confirmBtn.textContent = 'Deleting…';
      cancelBtn.disabled    = true;
      errEl.style.display   = 'none';

      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', item.id);

      if (error) {
        // Show inline error, let user retry — do NOT close anything
        console.error('[inspect] delete failed:', error.message);
        errEl.textContent   = 'Delete failed: ' + error.message;
        errEl.style.display = 'block';
        confirmBtn.disabled   = false;
        confirmBtn.textContent = 'Delete';
        cancelBtn.disabled    = false;
        return;
      }

      // ── Success: fade out the shelf item, then close ──
      if (activeItem) {
        activeItem.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        activeItem.style.opacity    = '0';
        activeItem.style.transform  = 'scale(0.85)';
      }

      // Close the inspect card without the FLIP-back (item is gone, nowhere to return to)
      _closeAfterDelete();

      // Notify room.js so it can remove from its currentItems array
      if (typeof onDeleted === 'function') {
        onDeleted(item.id);
      }
    });
    btnRow.appendChild(confirmBtn);

    dialog.appendChild(btnRow);
    card.appendChild(dialog);

    // Fade dialog in
    dialog.style.opacity    = '0';
    dialog.style.transition = 'opacity 0.15s ease';
    requestAnimationFrame(() => { dialog.style.opacity = '1'; });
  }, 150); // wait for contentArea fade-out before swapping
}

/**
 * Close the inspect card without FLIP-back — used after delete
 * (the original shelf element is gone or fading out, so we can't return to it).
 */
function _closeAfterDelete() {
  if (!activeOverlay) return;
  document.removeEventListener('keydown', handleEsc);

  const { backdrop, card } = activeOverlay;

  card.animate([
    { opacity: 1, transform: 'translateY(-50%) scale(1)'    },
    { opacity: 0, transform: 'translateY(-50%) scale(0.94)' },
  ], { duration: 220, easing: 'ease-in', fill: 'forwards' })
    .onfinish = () => {
      card.remove();
      backdrop.remove();
      // activeItem is already fading via CSS; after its transition remove it from DOM
      if (activeItem) {
        const el = activeItem;
        setTimeout(() => el.remove(), 220);
      }
      _resetState();
    };

  backdrop.style.transition = 'opacity 0.22s ease';
  backdrop.style.opacity    = '0';
}

/* ─── Shared button factory ──────────────────────────────────────────────────── */

function _makeBtn(label, { border, color, background = 'transparent', hoverBg, fontSize = '13px', marginLeft = '' }) {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.style.cssText = `
    padding: 8px 20px;
    background: ${background};
    border: ${border};
    border-radius: 999px;
    color: ${color};
    font-family: 'Inter', sans-serif;
    font-size: ${fontSize};
    font-weight: 500;
    cursor: pointer;
    letter-spacing: 0.05em;
    transition: background 0.15s ease, transform 0.1s ease, opacity 0.12s ease;
    ${marginLeft ? `margin-left: ${marginLeft};` : ''}
  `;
  btn.addEventListener('mouseenter', () => { btn.style.background = hoverBg; });
  btn.addEventListener('mouseleave', () => { btn.style.background = background; });
  btn.addEventListener('mousedown',  () => { btn.style.transform = 'scale(0.96)'; });
  btn.addEventListener('mouseup',    () => { btn.style.transform = 'scale(1)'; });
  return btn;
}
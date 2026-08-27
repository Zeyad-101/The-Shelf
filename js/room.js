/**
 * room.js — Polish Pass v2
 * Main authenticated room page logic.
 */
import { supabase } from './supabaseClient.js';
import { requireAuth, signOut } from './auth.js';
import { buildItemEl } from './shelfRender.js';
import { attachDrag } from './dragReposition.js';
import { openInspect, showConfirmDialog } from './inspectAnimation.js';
import { initAddItemModal, updateShelfId } from './addItem.js';
import { playDuckQuack, triggerDuckWobble, isDuckItem } from './audio.js';

let session      = null;
let shelves      = [];
let currentShelf = null;
let currentItems = [];

// ─── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  session = await requireAuth();
  if (!session) return;

  const emailEl = document.getElementById('user-email');
  if (emailEl) emailEl.textContent = session.user.email;

  // Set avatar initial from email
  const avatarBtn = document.getElementById('avatar-btn');
  if (avatarBtn && session.user.email) {
    avatarBtn.textContent = session.user.email[0].toUpperCase();
  }

  document.getElementById('sign-out-btn')?.addEventListener('click', () => {
    signOut();
  });

  const avatarMenu = document.getElementById('avatar-menu');
  avatarBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    avatarMenu?.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!avatarBtn?.contains(e.target) && !avatarMenu?.contains(e.target)) {
      avatarMenu?.classList.remove('open');
    }
  });

  await loadShelves();
  initShareToggle();
}

// ─── Shelves ───────────────────────────────────────────────────────────────────
async function loadShelves() {
  if (session.user.id === 'demo-user-123') {
    shelves = [{ id: 'demo-shelf', name: 'FAVORITES', is_public: true, sort_order: 0 }];
    renderTabs();
    await activateShelf(shelves[0]);
    return;
  }

  const { data, error } = await supabase
    .from('shelves')
    .select('id, user_id, name, is_public, share_slug, sort_order')
    .eq('user_id', session.user.id)
    .order('sort_order', { ascending: true });

  if (error) { showError('Failed to load shelves: ' + error.message); return; }

  shelves = data || [];

  if (shelves.length === 0) {
    const { data: newShelf, error: createErr } = await supabase
      .from('shelves')
      .insert({ user_id: session.user.id, name: 'FAVORITES', sort_order: 0 })
      .select('id, user_id, name, is_public, share_slug, sort_order').single();
    if (createErr) { showError('Could not create shelf: ' + createErr.message); return; }
    shelves = [newShelf];
  }

  renderTabs();
  await activateShelf(shelves[0]);
}

function renderTabs() {
  const tabsEl = document.getElementById('shelf-tabs');
  if (!tabsEl) return;
  tabsEl.innerHTML = '';

  const onlyOne = shelves.length === 1;

  shelves.forEach((shelf) => {
    const tab = document.createElement('button');
    tab.className = 'shelf-tab' + (shelf.id === currentShelf?.id ? ' active' : '')
                  + (onlyOne ? ' tab-only-shelf' : '');
    tab.dataset.shelfId = shelf.id;

    // Name span — carries the text, inherits all tab styles
    const nameSpan = document.createElement('span');
    nameSpan.className = 'tab-name';
    nameSpan.textContent = shelf.name;
    tab.appendChild(nameSpan);

    // × close span — subtle at rest, emphasised on tab hover
    const closeSpan = document.createElement('span');
    closeSpan.className = 'tab-close';
    closeSpan.textContent = '×';
    closeSpan.setAttribute('aria-label', `Delete shelf ${shelf.name}`);
    closeSpan.addEventListener('click', (e) => {
      e.stopPropagation(); // must NOT switch shelf
      deleteShelf(shelf);
    });
    tab.appendChild(closeSpan);

    // Clicking the tab body (not the ×) still switches shelves
    tab.addEventListener('click', () => {
      activateShelf(shelf);
    });

    tabsEl.appendChild(tab);
  });

  if (shelves.length < 5) {
    const addTab = document.createElement('button');
    addTab.className = 'shelf-tab shelf-tab--add';
    addTab.textContent = '+';
    addTab.title = 'Add a new shelf';
    addTab.addEventListener('click', () => {
      addShelf();
    });
    tabsEl.appendChild(addTab);
  }
}

async function activateShelf(shelf) {
  currentShelf = shelf;

  document.querySelectorAll('.shelf-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.shelfId === shelf.id);
  });

  document.title = `${shelf.name} — The Shelf`;
  renderShelfName(shelf.name);
  updateShareUI();
  await loadItems(shelf.id);
  updateShelfId(shelf.id);
}

// ─── Shelf name & rename ───────────────────────────────────────────────────────
function renderShelfName(name, animate = false) {
  const nameEl    = document.getElementById('shelf-name-display');
  const nameInput = document.getElementById('shelf-name-input');
  if (nameEl) {
    nameEl.textContent = name;
    nameEl.style.display = 'block';
    if (animate) {
      // Brief fade on commit (Part 2 — rename settle transition)
      nameEl.classList.remove('name-updated');
      // Force reflow so re-adding class re-triggers animation
      void nameEl.offsetWidth;
      nameEl.classList.add('name-updated');
    }
  }
  if (nameInput) nameInput.style.display = 'none';
}

function initRename() {
  const nameEl    = document.getElementById('shelf-name-display');
  const nameInput = document.getElementById('shelf-name-input');
  const nameWrap  = document.querySelector('.shelf-name-wrap');
  if (!nameEl || !nameInput || !nameWrap) return;

  // ── Trash icon button (only visible in rename/edit state) ──
  const trashBtn = document.createElement('button');
  trashBtn.id = 'shelf-delete-btn';
  trashBtn.title = 'Delete this shelf';
  trashBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>`;
  trashBtn.style.cssText = `
    display: none;
    align-items: center; justify-content: center;
    margin-left: 8px;
    width: 26px; height: 26px;
    background: transparent;
    border: 1px solid rgba(180,80,60,0.5);
    border-radius: 6px;
    color: #C4705A;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    transition: background 0.15s ease, transform 0.1s ease;
  `;
  trashBtn.addEventListener('mouseenter', () => { trashBtn.style.background = 'rgba(180,80,60,0.18)'; });
  trashBtn.addEventListener('mouseleave', () => { trashBtn.style.background = 'transparent'; });
  trashBtn.addEventListener('mousedown',  () => { trashBtn.style.transform  = 'scale(0.92)'; });
  trashBtn.addEventListener('mouseup',    () => { trashBtn.style.transform  = 'scale(1)'; });

  trashBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // don't let click bubble to nameInput and trigger blur→commitRename
    deleteShelf();
  });

  nameWrap.appendChild(trashBtn);

  // ── Show / hide trash icon with rename state ──
  const _enterRenameMode = () => {
    nameEl.style.display    = 'none';
    nameInput.value          = currentShelf.name;
    nameInput.style.display  = 'block';
    nameInput.focus();
    nameInput.select();

    // Show trash icon; style as disabled if only one shelf left
    trashBtn.style.display = 'flex';
    const isOnlyShelf = shelves.length <= 1;
    trashBtn.disabled      = isOnlyShelf;
    trashBtn.title         = isOnlyShelf
      ? 'You need at least one shelf'
      : 'Delete this shelf and all its items';
    trashBtn.style.opacity  = isOnlyShelf ? '0.38' : '1';
    trashBtn.style.cursor   = isOnlyShelf ? 'not-allowed' : 'pointer';
  };

  const _exitRenameMode = () => {
    trashBtn.style.display = 'none';
  };

  nameEl.addEventListener('click', () => {
    _enterRenameMode();
  });

  const commitRename = async () => {
    const newName = nameInput.value.trim().toUpperCase();
    _exitRenameMode();
    if (!newName || newName === currentShelf.name) {
      renderShelfName(currentShelf.name);
      return;
    }
    const { error } = await supabase
      .from('shelves')
      .update({ name: newName })
      .eq('id', currentShelf.id);

    if (error) {
      showError('Could not rename shelf: ' + error.message);
      renderShelfName(currentShelf.name);
    } else {
      currentShelf.name = newName;
      const s = shelves.find(s => s.id === currentShelf.id);
      if (s) s.name = newName;
      document.title = `${newName} — The Shelf`;
      renderShelfName(newName, true);
      renderTabs();
    }
  };

  // Delay blur handler so the trash-icon click fires BEFORE blur triggers commitRename
  nameInput.addEventListener('blur', () => setTimeout(commitRename, 80));
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')  { e.preventDefault(); nameInput.blur(); }
    if (e.key === 'Escape') { _exitRenameMode(); renderShelfName(currentShelf.name); }
  });
}

// ─── Delete shelf ───────────────────────────────────────────────────────────────
// Called from:
//   1. initRename() trash icon  → deleteShelf()         (deletes currentShelf)
//   2. renderTabs() × button   → deleteShelf(shelf)     (deletes specific shelf)
async function deleteShelf(targetShelf = currentShelf) {
  if (!targetShelf) return;

  // Guard: never delete the last shelf
  if (shelves.length <= 1) {
    showError('You need at least one shelf.');
    return;
  }

  const displayName = targetShelf.name.length > 36
    ? targetShelf.name.slice(0, 34) + '…'
    : targetShelf.name;

  // If we're deleting the currently active shelf and rename mode is open,
  // close it so the input doesn't blur-commit a rename during the dialog
  if (targetShelf.id === currentShelf?.id) {
    renderShelfName(currentShelf.name);
  }

  showConfirmDialog({
    heading:      `Delete "${displayName}" and everything on it?`,
    subtext:      `All items on this shelf will be permanently deleted. This can't be undone.`,
    confirmLabel: 'Delete',
    onConfirm: async () => {
      const { error } = await supabase
        .from('shelves')
        .delete()
        .eq('id', targetShelf.id);

      if (error) {
        console.error('[room] shelf delete failed:', error.message);
        return { error };
      }

      const deletedId       = targetShelf.id;
      const wasActive       = currentShelf?.id === deletedId;

      shelves = shelves.filter(s => s.id !== deletedId);

      if (wasActive) {
        // Deleted the shelf we were viewing — switch to next available
        currentShelf = null;
        currentItems = [];
        renderTabs();
        if (shelves.length > 0) await activateShelf(shelves[0]);
      } else {
        // Deleted a background shelf — just remove its tab, keep current view
        renderTabs();
      }

      return { error: null };
    },
    onCancel: () => {},
  });
}

// ─── Items ─────────────────────────────────────────────────────────────────────
async function loadItems(shelfId) {
  const layer = document.getElementById('items-layer-inner');

  // Part 2 — smooth cross-fade between shelves
  // Phase 1: fade out (double-rAF ensures transition fires after display change)
  if (layer) {
    layer.style.transition = 'opacity 0.15s ease';
    layer.style.opacity    = '0';
  }

  if (session.user.id === 'demo-user-123') {
    currentItems = [
      { id: 'item-plant-1', shelf_id: shelfId, type: 'decorative', name: 'Plant', position_x: 40, rotation: 0, sort_order: 1 },
      { id: 'item-plant-2', shelf_id: shelfId, type: 'decorative', name: 'Cactus', position_x: 160, rotation: 1, sort_order: 2 },
      { id: 'item-plant-3', shelf_id: shelfId, type: 'decorative', name: 'Bonsai', position_x: 280, rotation: -1, sort_order: 3 },
      { id: 'item-plant-4', shelf_id: shelfId, type: 'decorative', name: 'Vine Plant', position_x: 420, rotation: 0, sort_order: 4 },
      { id: 'item-duck-1', shelf_id: shelfId, type: 'decorative', name: 'Duck', position_x: 550, rotation: -2, sort_order: 5 },
      { id: 'item-duck-2', shelf_id: shelfId, type: 'decorative', name: 'Mallard Duck', position_x: 690, rotation: 2, sort_order: 6 },
      { id: 'item-duck-3', shelf_id: shelfId, type: 'decorative', name: 'Detective Duck', position_x: 830, rotation: -1, sort_order: 7 },
      { id: 'item-duck-4', shelf_id: shelfId, type: 'decorative', name: 'White Duck', position_x: 970, rotation: 1, sort_order: 8 }
    ];
    renderItems();
    if (layer) {
      layer.style.transition = 'opacity 0.18s ease';
      layer.style.opacity    = '1';
    }
    return;
  }

  const { data, error } = await supabase
    .from('items')
    .select('id, shelf_id, type, name, cover_url, rating, description, position_x, rotation, sort_order')
    .eq('shelf_id', shelfId)
    .order('sort_order', { ascending: true });

  if (error) { showError('Failed to load items: ' + error.message); return; }

  currentItems = data || [];
  renderItems();

  // Phase 2: fade in — two rAFs so browser paints the new DOM before transitioning
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (layer) {
      layer.style.transition = 'opacity 0.18s ease';
      layer.style.opacity    = '1';
    }
  }));
}

function inspectItem(item, el) {
  openInspect(item, el, {
    showDelete: true,
    onDeleted: (deletedId) => onItemDeleted(deletedId),
  });
}

/**
 * Wire up click behaviour for one shelf item.
 * Ducks quack + wobble on a single press and open the inspect card on
 * double-click (desktop) or long-press (touch); everything else opens
 * inspect on a single click.
 */
function wireItemInteractions(el, item) {
  if (!isDuckItem(item)) {
    el.addEventListener('click', () => {
      if (el.dataset.dragging === 'true') return;
      inspectItem(item, el);
    });
    return;
  }

  el.setAttribute('title', 'Press to quack! 🦆 (Double-click to view/delete)');

  let lastQuackTime = 0;
  function triggerQuack() {
    const now = Date.now();
    if (now - lastQuackTime < 80) return;
    lastQuackTime = now;
    playDuckQuack();
    triggerDuckWobble(el);
  }

  el.addEventListener('click', () => {
    if (el.dataset.dragging === 'true') return;
    triggerQuack();
  });
  el.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    inspectItem(item, el);
  });

  let pressTimer = null;
  let touchStartTime = 0;
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') {
      touchStartTime = Date.now();
      pressTimer = setTimeout(() => {
        if (el.dataset.dragging !== 'true') inspectItem(item, el);
      }, 600);
    }
  });
  el.addEventListener('pointerup', (e) => {
    clearTimeout(pressTimer);
    if (e.pointerType === 'touch' && el.dataset.dragging !== 'true') {
      const elapsed = Date.now() - touchStartTime;
      if (elapsed < 400) {
        triggerQuack();
      }
    }
  });
  el.addEventListener('pointercancel', () => clearTimeout(pressTimer));
}

function renderItems() {
  const container = document.getElementById('items-layer-inner');
  if (!container) return;
  container.innerHTML = '';

  const sorted = [...currentItems].sort((a, b) =>
    (a.sort_order - b.sort_order) || (a.position_x - b.position_x)
  );

  sorted.forEach((item) => {
    const el = buildItemEl(item, true);
    attachDrag(el, item, container);
    wireItemInteractions(el, item);
    container.appendChild(el);
  });
}

/** Called by inspectAnimation.js after a confirmed successful DB delete */
function onItemDeleted(deletedId) {
  currentItems = currentItems.filter(i => i.id !== deletedId);
  // DOM element is already being removed by _closeAfterDelete in inspectAnimation.js
}

// Called by addItem.js after successful insert
function onItemAdded(newItem) {
  currentItems.push(newItem);

  const container = document.getElementById('items-layer-inner');
  if (!container) return;

  const el = buildItemEl(newItem, true);
  attachDrag(el, newItem, container);
  wireItemInteractions(el, newItem);
  container.appendChild(el);

  // Part 2 — settle/bounce animation using Web Animations API
  // Uses the item's actual rotation value so the bounce axis is correct
  const rot  = newItem.rotation || 0;
  const rotS = `${rot}deg`;
  const dropAnim = el.animate([
    { transform: `rotate(${rotS}) translateY(-22px)`, opacity: '0', offset: 0    },
    { transform: `rotate(${rotS}) translateY(5px)`,   opacity: '1', offset: 0.55 },
    { transform: `rotate(${rotS}) translateY(-4px)`,  opacity: '1', offset: 0.75 },
    { transform: `rotate(${rotS}) translateY(1px)`,   opacity: '1', offset: 0.88 },
    { transform: `rotate(${rotS}) translateY(0px)`,   opacity: '1', offset: 1    },
  ], {
    duration: 480,
    easing:   'cubic-bezier(0.22, 1, 0.36, 1)',
    fill:     'forwards',
  });
  // A forwards-filling WAAPI animation outranks CSS animations forever, which
  // would swallow the duck's quack wobble on a freshly added duck. Its end state
  // already matches the element's inline transform, so drop it once it lands.
  dropAnim.finished.then(() => dropAnim.cancel()).catch(() => {});
}

// ─── Add shelf ─────────────────────────────────────────────────────────────────
async function addShelf() {
  if (shelves.length >= 5) return;
  const name = prompt('Shelf name (max 20 chars):', 'NEW SHELF');
  if (!name) return;

  const { data, error } = await supabase
    .from('shelves')
    .insert({
      user_id:    session.user.id,
      name:       name.trim().toUpperCase(),
      sort_order: shelves.length,
    })
    .select('id, user_id, name, is_public, share_slug, sort_order').single();

  if (error) { showError('Could not add shelf: ' + error.message); return; }
  shelves.push(data);
  renderTabs();
  await activateShelf(data);
}

// ─── Sharing ───────────────────────────────────────────────────────────────────
function initShareToggle() {
  const shareBtn = document.getElementById('share-btn');
  if (!shareBtn) return;
  shareBtn.addEventListener('click', async () => {
    if (!currentShelf) return;

    const newPublic = !currentShelf.is_public;
    const { data, error } = await supabase
      .from('shelves')
      .update({ is_public: newPublic })
      .eq('id', currentShelf.id)
      .select('id, is_public, share_slug').single();

    if (error) { showError('Share toggle failed: ' + error.message); return; }
    currentShelf.is_public   = data.is_public;
    currentShelf.share_slug  = data.share_slug;
    const s = shelves.find(s => s.id === currentShelf.id);
    if (s) { s.is_public = data.is_public; s.share_slug = data.share_slug; }
    updateShareUI();
  });
}

function updateShareUI() {
  const shareBtn      = document.getElementById('share-btn');
  const shareLink     = document.getElementById('share-link-wrap');
  const shareLinkText = document.getElementById('share-link-text');
  const copyBtn       = document.getElementById('copy-link-btn');
  if (!currentShelf) return;

  if (shareBtn) {
    shareBtn.textContent = currentShelf.is_public ? 'Shared ✓' : 'Share';
    shareBtn.classList.toggle('is-public', currentShelf.is_public);
  }
  if (shareLink) {
    shareLink.style.display = currentShelf.is_public ? 'flex' : 'none';
  }
  if (shareLinkText && currentShelf.share_slug) {
    const url = `${window.location.origin}/s/${currentShelf.share_slug}`;
    shareLinkText.textContent = url;
    shareLinkText.href = url;
  }
  if (copyBtn) {
    copyBtn.onclick = () => {
      const url = `${window.location.origin}/s/${currentShelf.share_slug}`;
      navigator.clipboard.writeText(url).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
      });
    };
  }
}

// ─── Error display ─────────────────────────────────────────────────────────────
function showError(msg) {
  console.error('[room]', msg);
  const el = document.getElementById('error-banner');
  if (el) {
    el.textContent   = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 6000);
  }
}

// ─── Bootstrap ─────────────────────────────────────────────────────────────────
// Each phase is individually try/caught so a bug in one feature fails loudly
// in the console and error banner without silently killing unrelated UI.
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await init();
  } catch (err) {
    console.error('[room] FATAL — init() threw unexpectedly:', err);
    showError('Page failed to initialise: ' + (err.message || err));
    return; // can't proceed without a session / shelves
  }

  try {
    initRename();
  } catch (err) {
    console.error('[room] initRename() threw:', err);
    // Non-fatal — rename won't work but the rest of the page is fine
  }

  try {
    initAddItemModal(currentShelf?.id || '', onItemAdded);
  } catch (err) {
    console.error('[room] initAddItemModal() threw:', err);
    // Non-fatal — add item won't work but drag/inspect/share still will
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const lamp = document.querySelector('.lamp-wrap');
  if (lamp) lamp.addEventListener('click', () => document.body.classList.toggle('lamp-off'));
});


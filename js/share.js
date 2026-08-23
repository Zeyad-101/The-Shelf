/**
 * share.js
 * Public read-only shelf view.
 * Reads slug from URL path, fetches public shelf + items, renders via shelfRender.js
 * No auth required.
 */
import { supabase } from './supabaseClient.js';
import { buildItemEl } from './shelfRender.js';

async function init() {
  // Read slug from URL path (e.g. /s/abc123 -> 'abc123')
  const slug = window.location.pathname.split('/').pop();

  if (!slug) {
    showError('No shelf found at this URL.');
    return;
  }

  // Fetch shelf by share_slug (RLS allows public read when is_public = true)
  const { data: shelf, error: shelfErr } = await supabase
    .from('shelves')
    .select('id, name, is_public, share_slug')
    .eq('share_slug', slug)
    .eq('is_public', true)
    .single();

  if (shelfErr || !shelf) {
    showError("This shelf doesn't exist or isn't public.");
    return;
  }

  // Fetch items for this shelf
  const { data: items, error: itemsErr } = await supabase
    .from('items')
    .select('id, shelf_id, type, name, cover_url, rating, description, position_x, rotation, sort_order')
    .eq('shelf_id', shelf.id)
    .order('sort_order', { ascending: true });

  if (itemsErr) {
    showError('Could not load shelf items: ' + itemsErr.message);
    return;
  }

  // Render shelf name
  const nameEl = document.getElementById('shelf-name-display');
  if (nameEl) nameEl.textContent = shelf.name;

  // Render items (read-only — no drag, no inspect)
  const container = document.getElementById('items-layer-inner');
  if (container) {
    container.innerHTML = '';
    const sorted = [...(items || [])].sort((a, b) =>
      (a.sort_order - b.sort_order) || (a.position_x - b.position_x)
    );
    sorted.forEach((item) => {
      // interactive=false: no drag handlers, cursor:default
      const el = buildItemEl(item, false);
      container.appendChild(el);
    });
  }

  // Update page title
  document.title = `${shelf.name} — The Shelf`;
}

function showError(msg) {
  console.error('[share]', msg);
  const el = document.getElementById('error-banner');
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
  }
  // Also hide the shelf chrome
  const shelfArea = document.getElementById('shelf-area');
  if (shelfArea) shelfArea.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', init);

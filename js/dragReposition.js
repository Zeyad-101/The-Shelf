/**
 * dragReposition.js - Polish Pass v2
 * Pointer-based horizontal drag with visual lift feedback.
 */
import { supabase } from './supabaseClient.js';

let dragState    = null;
let debounceTimer = null;

export function attachDrag(el, item, shelfContainer) {
  let startX    = 0;
  let startLeft = 0;
  let isDragging = false;
  // Cached at drag start so pointermove never reads layout (getBoundingClientRect
  // / offsetWidth) in the same frame it writes el.style.left — that read-write
  // interleave forces a synchronous reflow on every single move event.
  let scale = 1, maxLeft = 0;

  const rot = item.rotation || 0; // base rotation, used to restore on drop
  const isDeco = item.type === 'decorative';

  el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    startX     = e.clientX;
    startLeft  = parseFloat(el.style.left) || 0;
    isDragging = false;
    el.dataset.dragging = 'false';

    // One layout read per gesture, before any style writes.
    const rect  = shelfContainer.getBoundingClientRect();
    const contW = shelfContainer.offsetWidth;
    scale   = (rect.width / contW) || 1;
    maxLeft = Math.max(0, contW - el.offsetWidth);

    dragState = { el, item, startX, startLeft };
  });

  el.addEventListener('pointermove', (e) => {
    if (!dragState || dragState.el !== el) return;
    const dx = e.clientX - startX;

    if (!isDragging && Math.abs(dx) > 4) {
      isDragging = true;
      el.dataset.dragging = 'true';
      try { el.setPointerCapture(e.pointerId); } catch (_) {}

      // ── Drag lift feedback ──
      // Override the CSS transition momentarily so the lift feels instant
      if (isDeco) {
        el.style.transition = 'filter 0.12s ease, transform 0.12s cubic-bezier(0.22,1,0.36,1)';
        el.style.filter = 'drop-shadow(0 16px 36px rgba(0,0,0,0.7))';
        el.style.boxShadow = 'none';
      } else {
        el.style.transition = 'box-shadow 0.12s ease, transform 0.12s cubic-bezier(0.22,1,0.36,1)';
        el.style.boxShadow = '8px 16px 36px rgba(0,0,0,0.7)';
      }
      
      el.style.transform  = `rotate(${rot}deg) translateY(-10px) scale(1.05)`;
      el.style.zIndex     = '50';
      el.classList.add('shelf-item--dragging');
    }
    if (!isDragging) return;

    // Pure write — geometry was measured once at pointerdown.
    const newLeft = Math.max(0, Math.min(maxLeft, startLeft + dx / scale));
    el.style.left = newLeft + 'px';
  });

  el.addEventListener('pointerup', (e) => {
    if (!dragState || dragState.el !== el) return;

    const finalLeft = parseFloat(el.style.left) || 0;

    if (isDragging) {
      // ── Drop settle: restore normal appearance ──
      el.classList.remove('shelf-item--dragging');
      
      if (isDeco) {
        el.style.transition = 'filter 0.2s ease, transform 0.2s cubic-bezier(0.22,1,0.36,1)';
        el.style.filter = 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))';
      } else {
        el.style.transition = 'box-shadow 0.2s ease, transform 0.2s cubic-bezier(0.22,1,0.36,1)';
        el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.7), 0 8px 16px rgba(0,0,0,0.5)';
      }
      
      el.style.transform  = `rotate(${rot}deg)`;
      el.style.zIndex     = '';

      // Debounced Supabase write - 500ms after drag ends
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        const { error } = await supabase
          .from('items')
          .update({ position_x: finalLeft, updated_at: new Date().toISOString() })
          .eq('id', item.id);
        if (error) {
          console.error('[drag] failed to save position:', error.message);
        } else {
          item.position_x = finalLeft;
        }
      }, 500);
    }

    // Delay clearing drag flag so click handler won't fire
    setTimeout(() => {
      el.dataset.dragging = 'false';
      // Restore normal transition for hover effects
      el.style.transition = isDeco 
        ? 'transform 0.18s cubic-bezier(0.22,1,0.36,1), filter 0.18s ease'
        : 'transform 0.18s cubic-bezier(0.22,1,0.36,1), box-shadow 0.18s ease';
    }, 60);

    dragState  = null;
    isDragging = false;
  });

  el.addEventListener('pointercancel', () => {
    if (isDragging) {
      el.classList.remove('shelf-item--dragging');
      el.style.transform  = `rotate(${rot}deg)`;
      if (isDeco) {
        el.style.filter = 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))';
        el.style.transition = 'transform 0.18s cubic-bezier(0.22,1,0.36,1), filter 0.18s ease';
      } else {
        el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.7), 0 8px 16px rgba(0,0,0,0.5)';
        el.style.transition = 'transform 0.18s cubic-bezier(0.22,1,0.36,1), box-shadow 0.18s ease';
      }
      el.style.zIndex     = '';
    }
    dragState  = null;
    isDragging = false;
    el.dataset.dragging = 'false';
  });
}
/**
 * addItem.js
 * Add Item modal — 2-step flow: type selector → form → insert + Storage upload
 */
import { supabase } from './supabaseClient.js';
import { getDecoDescription } from './shelfRender.js';

let currentShelfId = null;
let onItemAdded = null; // callback after successful insert

export function initAddItemModal(shelfId, addedCallback) {
  currentShelfId = shelfId;
  onItemAdded = addedCallback;

  const btn = document.getElementById('add-item-btn');
  const modal = document.getElementById('add-item-modal');
  const closeBtn = document.getElementById('modal-close');

  if (!btn || !modal) {
    console.error('[addItem] Missing #add-item-btn or #add-item-modal in DOM');
    return;
  }

  // Button click opens modal
  btn.addEventListener('click', () => {
    openModal();
  });

  closeBtn?.addEventListener('click', () => {
    closeModal();
  });

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });

  // Type selector buttons
  document.querySelectorAll('.type-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      selectType(type);
    });
  });

  // Form submit
  const form = document.getElementById('add-item-form');
  form?.addEventListener('submit', handleSubmit);
}

export function updateShelfId(shelfId) {
  currentShelfId = shelfId;
}

function openModal() {
  const modal = document.getElementById('add-item-modal');
  modal.classList.add('active');
  // Reset to step 1
  showStep(1);
  document.getElementById('selected-type').value = '';
  document.getElementById('add-item-form')?.reset();
  document.getElementById('form-error').textContent = '';
  const ratingErr = document.getElementById('rating-error');
  if (ratingErr) ratingErr.style.display = 'none';

  // Reset deco category to plant default
  const plantCat = document.querySelector('input[name="deco-category"][value="plant"]');
  if (plantCat) plantCat.checked = true;
  const plantPreset = document.querySelector('input[name="deco-preset"][value="Plant"]');
  if (plantPreset) plantPreset.checked = true;
}

function closeModal() {
  const modal = document.getElementById('add-item-modal');
  modal.classList.remove('active');
}

function showStep(n) {
  document.getElementById('step-1').style.display = n === 1 ? 'block' : 'none';
  document.getElementById('step-2').style.display = n === 2 ? 'block' : 'none';
}

function selectType(type) {
  document.getElementById('selected-type').value = type;
  document.getElementById('step2-type-label').textContent =
    type.charAt(0).toUpperCase() + type.slice(1);

  const isDeco = type === 'decorative';
  const nameInput = document.getElementById('item-name');
  
  document.getElementById('field-name').style.display = isDeco ? 'none' : 'block';
  nameInput.required = !isDeco;
  
  if (type === 'movie') {
    nameInput.placeholder = 'e.g. Fight Club';
  } else if (type === 'music') {
    nameInput.placeholder = 'e.g. Stan';
  } else {
    nameInput.placeholder = 'e.g. The Odyssey';
  }

  document.getElementById('field-rating').style.display = isDeco ? 'none' : 'block';
  document.getElementById('field-desc').style.display = isDeco ? 'none' : 'block';
  
  // Show presets for decorative only
  const decoPresets = document.getElementById('field-deco-presets');
  if (decoPresets) decoPresets.style.display = isDeco ? 'block' : 'none';

  function syncDecoUI() {
    if (!isDeco) {
      document.getElementById('field-cover').style.display = 'block';
      document.getElementById('item-cover').required = false;
      return;
    }

    const cat = document.querySelector('input[name="deco-category"]:checked')?.value || 'plant';
    const plantSub = document.getElementById('deco-sub-plant');
    const duckSub = document.getElementById('deco-sub-duck');
    const coverField = document.getElementById('field-cover');
    const photoRadio = document.getElementById('deco-preset-photo');

    if (cat === 'plant') {
      if (plantSub) plantSub.style.display = 'block';
      if (duckSub) duckSub.style.display = 'none';
      if (coverField) coverField.style.display = 'none';
      // Ensure one plant radio is selected
      const checkedPlant = document.querySelector('#deco-sub-plant input[name="deco-preset"]:checked');
      if (!checkedPlant) {
        const firstPlant = document.querySelector('#deco-sub-plant input[name="deco-preset"]');
        if (firstPlant) firstPlant.checked = true;
      }
    } else if (cat === 'duck') {
      if (plantSub) plantSub.style.display = 'none';
      if (duckSub) duckSub.style.display = 'block';
      if (coverField) coverField.style.display = 'none';
      // Ensure one duck radio is selected
      const checkedDuck = document.querySelector('#deco-sub-duck input[name="deco-preset"]:checked');
      if (!checkedDuck) {
        const firstDuck = document.querySelector('#deco-sub-duck input[name="deco-preset"]');
        if (firstDuck) firstDuck.checked = true;
      }
    } else if (cat === 'photo') {
      if (plantSub) plantSub.style.display = 'none';
      if (duckSub) duckSub.style.display = 'none';
      if (coverField) coverField.style.display = 'block';
      if (photoRadio) photoRadio.checked = true;
    }

    // Update description for the currently checked preset
    const currentPreset = document.querySelector('input[name="deco-preset"]:checked');
    const descField = document.getElementById('item-description');
    if (descField && currentPreset) {
      const defaultDesc = getDecoDescription(currentPreset.value);
      descField.value = defaultDesc;
      descField.placeholder = defaultDesc
        ? 'Edit description or leave as-is'
        : 'What made it special?';
    }
  }

  // Attach change and click listeners once
  if (isDeco && !window._decoListenersAdded) {
    document.querySelectorAll('input[name="deco-category"]').forEach(r => {
      r.addEventListener('change', syncDecoUI);
    });
    document.querySelectorAll('.deco-cat-option').forEach(label => {
      label.addEventListener('click', () => {
        const radio = label.querySelector('input[name="deco-category"]');
        if (radio) {
          radio.checked = true;
          syncDecoUI();
        }
      });
    });
    document.querySelectorAll('input[name="deco-preset"]').forEach(r => {
      r.addEventListener('change', () => {
        const descField = document.getElementById('item-description');
        if (descField) {
          const defaultDesc = getDecoDescription(r.value);
          descField.value = defaultDesc;
          descField.placeholder = defaultDesc
            ? 'Edit description or leave as-is'
            : 'What made it special?';
        }
      });
    });
    document.querySelectorAll('.deco-option').forEach(label => {
      label.addEventListener('click', () => {
        const radio = label.querySelector('input[name="deco-preset"]');
        if (radio) {
          radio.checked = true;
          const descField = document.getElementById('item-description');
          if (descField) {
            const defaultDesc = getDecoDescription(radio.value);
            descField.value = defaultDesc;
            descField.placeholder = defaultDesc
              ? 'Edit description or leave as-is'
              : 'What made it special?';
          }
        }
      });
    });
    window._decoListenersAdded = true;
  }

  syncDecoUI();
  showStep(2);
}

async function handleSubmit(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('submit-item-btn');
  const errorEl = document.getElementById('form-error');
  errorEl.textContent = '';
  
  const ratingErr = document.getElementById('rating-error');
  if (ratingErr) ratingErr.style.display = 'none';

  const type = document.getElementById('selected-type').value;
  let name = document.getElementById('item-name').value.trim();
  const ratingRaw = document.getElementById('item-rating').value;
  const description = document.getElementById('item-description').value.trim();
  let coverFile = document.getElementById('item-cover').files[0];

  const isDeco = type === 'decorative';

  // Validate rating range early
  if (!isDeco && ratingRaw) {
    const r = parseFloat(ratingRaw);
    if (isNaN(r) || r < 0 || r > 10) {
      if (ratingErr) {
        ratingErr.textContent = 'Enter a number between 0 and 10';
        ratingErr.style.display = 'block';
      } else {
        errorEl.textContent = 'Rating must be between 0 and 10.';
      }
      return;
    }
  }

  // Validate cover file if provided
  if (coverFile) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(coverFile.type) && !coverFile.type.startsWith('image/')) {
      errorEl.textContent = 'Please select a valid image file (JPG, PNG, WebP, GIF).';
      return;
    }
    if (coverFile.size > 5 * 1024 * 1024) {
      errorEl.textContent = 'Image size must be less than 5MB.';
      return;
    }
  }

  if (isDeco) {
    const selectedPreset = document.querySelector('input[name="deco-preset"]:checked');
    if (!selectedPreset) {
      errorEl.textContent = 'Please select an object preset.';
      return;
    }
    name = selectedPreset.value;
    
    if (name === 'Framed Photo') {
      if (!coverFile) {
        errorEl.textContent = 'Please upload a photo for the frame.';
        return;
      }
    } else {
      coverFile = null; // No uploads for Plant or Duck
    }
  } else {
    if (!name) {
      errorEl.textContent = 'Title is required.';
      return;
    }
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Adding…';

  try {
    if (window.location.search.includes('demo=1') || localStorage.getItem('shelf_dev_mode') === 'true') {
      const inserted = {
        id: 'item-' + Date.now(),
        shelf_id: currentShelfId,
        type,
        name,
        cover_url: null,
        rating: ratingRaw ? parseFloat(ratingRaw) : null,
        description: description || (isDeco ? getDecoDescription(name) : null),
        position_x: 60 + Math.random() * 300,
        rotation: (Math.random() * 6 - 3),
        sort_order: Math.floor(Date.now() / 1000),
      };
      closeModal();
      if (onItemAdded) onItemAdded(inserted);
      return;
    }

    // Get current user for Storage path
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Upload cover if provided
    let cover_url = null;
    if (coverFile) {
      const ext = coverFile.name.split('.').pop().toLowerCase();
      // Path is RELATIVE to the bucket root — do NOT include 'covers/' prefix.
      // The SDK scopes to the bucket via .from('covers'), so storage.objects.name
      // will be `${user.id}/filename`, making foldername(name)[1] = user.id,
      // which satisfies the RLS WITH CHECK: (storage.foldername(name))[1] = auth.uid()::text
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('covers')
        .upload(path, coverFile, { upsert: false });
      if (uploadErr) throw new Error('Cover upload failed: ' + uploadErr.message);

      const { data: urlData } = supabase.storage.from('covers').getPublicUrl(path);
      cover_url = urlData.publicUrl;
    }

    // Compute a default position (spread across 60–80% of shelf width)
    const position_x = 60 + Math.random() * 300;
    // Slight random rotation (-3 to +3 degrees)
    const rotation = (Math.random() * 6 - 3);

    const { data: inserted, error: insertErr } = await supabase
      .from('items')
      .insert({
        shelf_id: currentShelfId,
        type,
        name,
        cover_url,
        rating: ratingRaw ? parseFloat(ratingRaw) : null,
        description: description || null,
        position_x,
        rotation,
        sort_order: Math.floor(Date.now() / 1000), // epoch seconds — fits Postgres integer (max ~2.1B), still monotonically increasing
      })
      .select()
      .single();

    if (insertErr) throw new Error(insertErr.message);

    closeModal();
    if (onItemAdded) onItemAdded(inserted);

  } catch (err) {
    console.error('[addItem] error:', err);
    errorEl.textContent = err.message || 'Something went wrong. Please try again.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Add to Shelf';
  }
}

// posterApp.js — the editor: loads photos, wires every control to the
// poster state, draws the live preview and exports PNGs in the three
// post sizes. Photos stay on this machine: uploads are read with
// FileReader into memory and never sent anywhere.

import { renderPoster, POSTER_SIZES, LAYOUTS, GRADES } from './posterEngine.js';
import {
  defaultPoster, panelsForLayout, PRESETS, applyPreset, surprisePreset,
  makeHistory, historyPush, historyUndo, historyRedo, clonePoster,
  SAMPLE_PHOTOS, LAYOUT_IDS, GRADE_IDS,
} from './posterState.js';

const $ = (id) => document.getElementById(id);
const preview = $('preview');
const pctx = preview.getContext('2d');

let poster = defaultPoster();
let history = makeHistory(poster);
let library = { ...SAMPLE_PHOTOS }; // id -> {label, src} ; uploads add data: URLs
let images = {}; // id -> HTMLImageElement
let selectedPanel = 0;
let previewSize = 'square';

function loadImage(id, src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { images[id] = img; resolve(true); };
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

async function loadLibrary() {
  await Promise.all(Object.entries(library).map(([id, p]) => loadImage(id, p.src)));
}

function drawPreview() {
  const size = POSTER_SIZES[previewSize];
  renderPoster(preview, poster, images, size);
  $('sizeLabel').textContent = `${size.label} — live preview`;
  refreshPanelList();
}

function refreshPanelList() {
  const list = $('panelList');
  list.innerHTML = '';
  poster.panels.forEach((p, i) => {
    const b = document.createElement('button');
    b.className = 'panelRow' + (i === selectedPanel ? ' selected' : '');
    b.textContent = `${i + 1}. ${p.caption || 'Panel'} — ${library[p.photo]?.label || p.photo}`;
    b.addEventListener('click', () => { selectedPanel = i; syncPanelControls(); drawPreview(); });
    list.appendChild(b);
  });
}

function commit(next) {
  poster = next;
  historyPush(history, poster);
  syncControls();
  drawPreview();
}

function syncControls() {
  $('caption').value = poster.caption;
  $('subtitle').value = poster.subtitle;
  $('quote').value = poster.quote;
  $('badge').value = poster.badge;
  $('stars').value = String(poster.stars);
  $('tags').value = poster.tags.join(', ');
  $('layout').value = poster.layout;
  $('grade').value = poster.grade;
  syncPanelControls();
}

function syncPanelControls() {
  const p = poster.panels[selectedPanel];
  if (!p) return;
  $('panelPhoto').value = p.photo;
  $('panelZoom').value = String(p.zoom);
  $('panelZoomVal').textContent = `${Math.round(p.zoom * 100)}%`;
  $('panelFx').value = String(p.focus.x);
  $('panelFy').value = String(p.focus.y);
  $('panelCaption').value = p.caption || '';
  $('panelTitle').textContent = `Panel ${selectedPanel + 1} of ${poster.panels.length}`;
}

function buildSelects() {
  const layoutSel = $('layout');
  LAYOUT_IDS.forEach((id) => {
    const o = document.createElement('option');
    o.value = id;
    o.textContent = LAYOUTS[id];
    layoutSel.appendChild(o);
  });
  const gradeSel = $('grade');
  GRADE_IDS.forEach((id) => {
    const o = document.createElement('option');
    o.value = id;
    o.textContent = GRADES[id].name;
    gradeSel.appendChild(o);
  });
  const presetRow = $('presetRow');
  Object.entries(PRESETS).forEach(([id, p]) => {
    const b = document.createElement('button');
    b.className = 'presetBtn';
    b.textContent = p.name;
    b.addEventListener('click', () => commit(applyPreset(poster, id)));
    presetRow.appendChild(b);
  });
  const photoSel = $('panelPhoto');
  const refreshPhotos = () => {
    photoSel.innerHTML = '';
    Object.entries(library).forEach(([id, p]) => {
      const o = document.createElement('option');
      o.value = id;
      o.textContent = p.label;
      photoSel.appendChild(o);
    });
  };
  refreshPhotos();
  $('photoLibrary').addEventListener('change', (ev) => {
    photoSel.innerHTML = '';
    Object.entries(library).forEach(([id, p]) => {
      const o = document.createElement('option');
      o.value = id;
      o.textContent = p.label;
      photoSel.appendChild(o);
    });
    photoSel.value = ev.target.value;
  });
  window.__refreshLibraryOptions = refreshPhotos;
}

function bindControls() {
  $('caption').addEventListener('input', (e) => commit({ ...poster, caption: e.target.value }));
  $('subtitle').addEventListener('input', (e) => commit({ ...poster, subtitle: e.target.value }));
  $('quote').addEventListener('input', (e) => commit({ ...poster, quote: e.target.value }));
  $('badge').addEventListener('input', (e) => commit({ ...poster, badge: e.target.value }));
  $('stars').addEventListener('change', (e) => commit({ ...poster, stars: Number(e.target.value) }));
  $('tags').addEventListener('input', (e) => commit({
    ...poster, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
  }));
  $('layout').addEventListener('change', (e) => {
    const next = clonePoster(poster);
    next.layout = e.target.value;
    next.panels = panelsForLayout(next.layout);
    selectedPanel = 0;
    commit(next);
  });
  $('grade').addEventListener('change', (e) => commit({ ...poster, grade: e.target.value }));
  document.querySelectorAll('input[name="previewSize"]').forEach((r) => {
    r.addEventListener('change', (e) => { previewSize = e.target.value; drawPreview(); });
  });
  $('surprise').addEventListener('click', () => commit(surprisePreset(poster)));
  $('undoBtn').addEventListener('click', () => {
    const prev = historyUndo(history);
    if (prev) { poster = prev; syncControls(); drawPreview(); }
  });
  $('redoBtn').addEventListener('click', () => {
    const next = historyRedo(history);
    if (next) { poster = next; syncControls(); drawPreview(); }
  });
  // Per-panel controls.
  $('panelPhoto').addEventListener('change', (e) => {
    const next = clonePoster(poster);
    next.panels[selectedPanel].photo = e.target.value;
    commit(next);
  });
  $('panelZoom').addEventListener('input', (e) => {
    const next = clonePoster(poster);
    next.panels[selectedPanel].zoom = Number(e.target.value);
    poster = next;
    drawPreview();
    syncPanelControls();
  });
  $('panelZoom').addEventListener('change', () => historyPush(history, poster));
  $('panelFx').addEventListener('input', (e) => {
    const next = clonePoster(poster);
    next.panels[selectedPanel].focus.x = Number(e.target.value);
    poster = next;
    drawPreview();
  });
  $('panelFx').addEventListener('change', () => historyPush(history, poster));
  $('panelFy').addEventListener('input', (e) => {
    const next = clonePoster(poster);
    next.panels[selectedPanel].focus.y = Number(e.target.value);
    poster = next;
    drawPreview();
  });
  $('panelFy').addEventListener('change', () => historyPush(history, poster));
  $('panelCaption').addEventListener('input', (e) => {
    const next = clonePoster(poster);
    next.panels[selectedPanel].caption = e.target.value;
    poster = next;
    drawPreview();
    refreshPanelList();
  });
  $('panelCaption').addEventListener('change', () => historyPush(history, poster));

  // Photo library: pick a sample or upload your own.
  $('photoLibrary').addEventListener('change', async (e) => {
    const id = e.target.value;
    if (!images[id]) await loadImage(id, library[id].src);
    const next = clonePoster(poster);
    next.panels[selectedPanel].photo = id;
    commit(next);
  });
  $('uploadPhoto').addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const dataUrl = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    const id = `upload-${Date.now()}`;
    library[id] = { label: file.name.replace(/\.[^.]+$/, '').slice(0, 24) || 'My photo', src: dataUrl };
    await loadImage(id, dataUrl);
    window.__refreshLibraryOptions();
    const lib = $('photoLibrary');
    const o = document.createElement('option');
    o.value = id;
    o.textContent = library[id].label;
    lib.appendChild(o);
    lib.value = id;
    const next = clonePoster(poster);
    next.panels[selectedPanel].photo = id;
    commit(next);
  });
  $('fillAll').addEventListener('click', () => {
    const id = $('photoLibrary').value;
    const next = clonePoster(poster);
    next.panels.forEach((p) => { p.photo = id; });
    commit(next);
  });

  // Export: one size, or all three at once.
  document.querySelectorAll('[data-export]').forEach((btn) => {
    btn.addEventListener('click', () => exportSize(btn.dataset.export));
  });
  $('exportAll').addEventListener('click', () => {
    Object.keys(POSTER_SIZES).forEach((key, i) => {
      setTimeout(() => exportSize(key), i * 250);
    });
  });
}

function exportSize(key) {
  const size = POSTER_SIZES[key];
  const off = document.createElement('canvas');
  renderPoster(off, poster, images, size);
  off.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `neon-shores-${poster.caption.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${size.w}x${size.h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    $('exportNote').textContent = `Exported ${size.label} PNG.`;
  }, 'image/png');
}

// Exposed for the shot scenes and for debugging in the console.
window.__posterApp = {
  get poster() { return poster; },
  setPoster(next) { commit(next); },
  get images() { return images; },
  drawPreview,
  exportSize,
};

async function boot() {
  buildSelects();
  await loadLibrary();
  // Fonts must be ready before the first draw, or the title falls back.
  try {
    await Promise.race([
      document.fonts.ready,
      new Promise((r) => setTimeout(r, 3000)),
    ]);
  } catch { /* fonts are local; a miss still draws with fallback */ }
  bindControls();
  syncControls();
  drawPreview();
  document.body.classList.add('ready');
}

boot();

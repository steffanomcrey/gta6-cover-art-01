// Vice Heat studio: wires the editor UI to the key-art engine.
import { drawCover, distinctPhotoCount, livePanels, LAYOUTS, GRADES, SIZES } from './keyart.js';
import { SAMPLES, PRESETS, freshState, applyPreset, refillPhotos, makeHistory, cloneState } from './state.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const ctx = canvas.getContext('2d');

let library = SAMPLES.map((s) => ({ ...s, kind: 'sample' })); // uploaded photos append here
let images = new Array(library.length).fill(null); // loaded HTMLImageElement per library index
let history = makeHistory(freshState('vice-heat'));
let state = history.get();

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function ensureImages() {
  await Promise.all(library.map(async (entry, i) => {
    if (!images[i]) images[i] = await loadImage(entry.src);
  }));
}

function previewSize() {
  const size = SIZES[state.size];
  const max = 720;
  const scale = Math.min(max / size.w, max / size.h);
  return { w: Math.round(size.w * scale), h: Math.round(size.h * scale) };
}

function redraw() {
  const { w, h } = previewSize();
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  drawCover(ctx, w, h, state, images);
  const { distinct, panels } = distinctPhotoCount(state);
  $('distinct').textContent = `${distinct} distinct photo${distinct === 1 ? '' : 's'} in ${panels} panels`;
  $('undo').disabled = !history.canUndo();
  $('redo').disabled = !history.canRedo();
  renderPanelList();
}

function commit(next) {
  history.push(next);
  state = history.get();
  syncControls();
  redraw();
}

function syncControls() {
  $('layout').value = state.layout;
  $('grade').value = state.grade;
  $('title').value = state.title;
  $('tagline').value = state.tagline;
  document.querySelectorAll('#presets button').forEach((b) => {
    b.classList.toggle('active', b.dataset.preset === state.preset);
  });
  document.querySelectorAll('#sizes button').forEach((b) => {
    b.classList.toggle('active', b.dataset.size === state.size);
  });
  const slot = state.panels[state.selectedPanel] || {};
  $('zoom').value = slot.zoom ?? 1;
  $('fx').value = slot.fx ?? 0.5;
  $('fy').value = slot.fy ?? 0.5;
  $('panelPhoto').value = slot.photo ?? '';
  $('panelLabel').textContent = `Panel ${state.selectedPanel + 1} of ${livePanels(state.layout).length}`;
}

function renderPanelList() {
  const list = $('panels');
  list.innerHTML = '';
  livePanels(state.layout).forEach((p) => {
    const slot = state.panels[p.index] || {};
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'panel-chip' + (state.selectedPanel === p.index ? ' active' : '');
    const entry = library[slot.photo];
    b.textContent = `Panel ${p.index + 1}: ${entry ? entry.label : 'empty'}`;
    b.addEventListener('click', () => {
      state = { ...state, selectedPanel: p.index };
      syncControls();
      redraw();
    });
    list.appendChild(b);
  });
}

function renderLibrary() {
  const lib = $('library');
  lib.innerHTML = '';
  library.forEach((entry, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'thumb';
    b.title = entry.label;
    const img = document.createElement('img');
    img.src = entry.src;
    img.alt = entry.label;
    b.appendChild(img);
    b.addEventListener('click', () => {
      const next = cloneState(state);
      next.panels[state.selectedPanel] = { ...(next.panels[state.selectedPanel] || {}), photo: i };
      commit(next);
    });
    lib.appendChild(b);
  });
}

function renderPresets() {
  const box = $('presets');
  PRESETS.forEach((p) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.preset = p.id;
    b.textContent = p.name;
    b.addEventListener('click', () => commit(applyPreset(state, p.id)));
    box.appendChild(b);
  });
}

function renderSelects() {
  const layout = $('layout');
  Object.entries(LAYOUTS).forEach(([id, l]) => {
    const o = document.createElement('option');
    o.value = id; o.textContent = l.label;
    layout.appendChild(o);
  });
  const grade = $('grade');
  Object.entries(GRADES).forEach(([id, g]) => {
    const o = document.createElement('option');
    o.value = id; o.textContent = g.label;
    grade.appendChild(o);
  });
  const sizes = $('sizes');
  Object.entries(SIZES).forEach(([id, s]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.size = id;
    b.textContent = s.label;
    b.addEventListener('click', () => {
      state = { ...state, size: id };
      syncControls();
      redraw();
    });
    sizes.appendChild(b);
  });
  const panelPhoto = $('panelPhoto');
  library.forEach((entry, i) => {
    const o = document.createElement('option');
    o.value = String(i); o.textContent = entry.label;
    panelPhoto.appendChild(o);
  });
}

function renderToCanvas(sizeId) {
  const size = SIZES[sizeId];
  const c = document.createElement('canvas');
  c.width = size.w; c.height = size.h;
  drawCover(c.getContext('2d'), size.w, size.h, state, images);
  return c;
}

function download(canvasEl, name) {
  canvasEl.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    $('status').textContent = `Saved ${name}`;
  }, 'image/png');
}

$('export').addEventListener('click', () => {
  download(renderToCanvas(state.size), `vice-heat-${state.size}-${SIZES[state.size].w}x${SIZES[state.size].h}.png`);
});
$('exportAll').addEventListener('click', () => {
  Object.keys(SIZES).forEach((id, k) => {
    setTimeout(() => download(renderToCanvas(id), `vice-heat-${id}-${SIZES[id].w}x${SIZES[id].h}.png`), k * 250);
  });
  $('status').textContent = 'Exported all 3 sizes';
});
$('surprise').addEventListener('click', () => {
  const order = [...library.keys()];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const preset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
  let next = applyPreset(state, preset.id);
  next = refillPhotos(next, order);
  commit(next);
});
$('shuffle').addEventListener('click', () => {
  const order = [...library.keys()];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  commit(refillPhotos(state, order));
});
$('undo').addEventListener('click', () => { state = history.undo(); syncControls(); redraw(); });
$('redo').addEventListener('click', () => { state = history.redo(); syncControls(); redraw(); });
$('layout').addEventListener('change', (e) => {
  const next = cloneState(state);
  next.layout = e.target.value;
  next.panels = refillPhotos(next, PRESETS.find((p) => p.id === next.preset)?.photos ?? [...library.keys()]).panels;
  next.selectedPanel = 0;
  commit(next);
});
$('grade').addEventListener('change', (e) => {
  const next = cloneState(state);
  next.grade = e.target.value;
  commit(next);
});
$('title').addEventListener('input', (e) => { state = { ...state, title: e.target.value }; redraw(); });
$('title').addEventListener('change', () => commit(state));
$('tagline').addEventListener('input', (e) => { state = { ...state, tagline: e.target.value }; redraw(); });
$('tagline').addEventListener('change', () => commit(state));
$('zoom').addEventListener('input', (e) => {
  const next = cloneState(state);
  next.panels[state.selectedPanel].zoom = Number(e.target.value);
  state = next; redraw();
});
$('zoom').addEventListener('change', () => commit(state));
$('fx').addEventListener('input', (e) => {
  const next = cloneState(state);
  next.panels[state.selectedPanel].fx = Number(e.target.value);
  state = next; redraw();
});
$('fx').addEventListener('change', () => commit(state));
$('fy').addEventListener('input', (e) => {
  const next = cloneState(state);
  next.panels[state.selectedPanel].fy = Number(e.target.value);
  state = next; redraw();
});
$('fy').addEventListener('change', () => commit(state));
$('panelPhoto').addEventListener('change', (e) => {
  const next = cloneState(state);
  next.panels[state.selectedPanel].photo = Number(e.target.value);
  commit(next);
});
$('upload').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  for (const file of files) {
    const url = URL.createObjectURL(file);
    const img = await loadImage(url);
    library.push({ id: `upload-${library.length}`, label: file.name.replace(/\.[^.]+$/, ''), src: url, kind: 'upload' });
    images.push(img);
  }
  renderLibrary();
  renderPanelPhotoOptions();
  $('status').textContent = `${files.length} photo${files.length === 1 ? '' : 's'} added to the library`;
  redraw();
});

function renderPanelPhotoOptions() {
  const sel = $('panelPhoto');
  sel.innerHTML = '';
  library.forEach((entry, i) => {
    const o = document.createElement('option');
    o.value = String(i); o.textContent = entry.label;
    sel.appendChild(o);
  });
  syncControls();
}

// Click a panel on the canvas to select it.
canvas.addEventListener('click', (e) => {
  const r = canvas.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width;
  const py = (e.clientY - r.top) / r.height;
  const bandH = 0.22;
  if (py > 1 - bandH) return;
  const artY = py / (1 - bandH);
  const hit = livePanels(state.layout).find((p) =>
    px >= p.x && px <= p.x + p.w && artY >= p.y && artY <= p.y + p.h);
  if (hit) {
    state = { ...state, selectedPanel: hit.index };
    syncControls();
    redraw();
  }
});

renderPresets();
renderSelects();
renderLibrary();

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, { ensureImages, library, images, state, setState: (s) => { state = s; }, redraw, renderToCanvas, loadImage });
} else {
  document.fonts.load('400 100px Anton').catch(() => {});
  document.fonts.load('400 40px Pacifico').catch(() => {});
  ensureImages().then(() => document.fonts.ready.then(redraw)).catch((err) => {
    $('status').textContent = `Could not load a sample photo: ${err.message}`;
  });
  redraw();
}

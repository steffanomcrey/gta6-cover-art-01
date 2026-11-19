// Neon Shores editor: wires the controls to the cover engine, loads photos
// from the user's machine or the bundled samples, and exports PNGs in the
// three post sizes. Runs fully offline; nothing leaves the machine.
import { COVER_LAYOUTS, COVER_GRADES, COVER_SIZES, drawCoverArt } from './coverEngine.js';
import { defaultState, defaultPanels, COVER_PRESETS, applyPreset, CoverHistory } from './editorState.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const state = defaultState();
const history = new CoverHistory(state);
let photos = []; // { img, name } ; slots 0 and 1 are the bundled samples
let currentSize = 'square';

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadSample(name) {
  const img = await loadImage(`samples/${name}.jpg`);
  return { img, name };
}

function stateWithPhotos() {
  return { ...state, photos: photos.map((p) => p.img) };
}

function redraw() {
  const size = COVER_SIZES[currentSize];
  if (canvas.width !== size.w || canvas.height !== size.h) {
    canvas.width = size.w;
    canvas.height = size.h;
  }
  drawCoverArt(canvas, stateWithPhotos());
  document.getElementById('undo').disabled = !history.canUndo;
  document.getElementById('redo').disabled = !history.canRedo;
}

function setStatus(text) { status.textContent = text; }

/** Rebuilds the layout and grade picker buttons from the engine tables. */
function buildPickers() {
  const layoutBox = document.getElementById('layouts');
  layoutBox.innerHTML = '';
  for (const [key, layout] of Object.entries(COVER_LAYOUTS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (key === state.layout ? ' active' : '');
    b.textContent = layout.name;
    b.title = layout.blurb;
    b.addEventListener('click', () => {
      history.commit();
      state.layout = key;
      state.panels = defaultPanels(key);
      state.selectedPanel = 0;
      buildPickers(); buildPanelList(); syncInputs(); redraw();
      setStatus(`Layout: ${layout.name}. ${layout.blurb}.`);
    });
    layoutBox.appendChild(b);
  }
  const gradeBox = document.getElementById('grades');
  gradeBox.innerHTML = '';
  for (const [key, grade] of Object.entries(COVER_GRADES)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (key === state.grade ? ' active' : '');
    b.textContent = grade.name;
    b.addEventListener('click', () => {
      history.commit();
      state.grade = key;
      buildPickers(); redraw();
      setStatus(`Grade: ${grade.name}.`);
    });
    gradeBox.appendChild(b);
  }
  const presetBox = document.getElementById('presets');
  presetBox.innerHTML = '';
  for (const preset of COVER_PRESETS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip preset';
    b.textContent = preset.name;
    b.addEventListener('click', () => {
      history.commit();
      applyPreset(state, preset);
      buildPickers(); buildPanelList(); syncInputs(); redraw();
      setStatus(`Preset: ${preset.name}.`);
    });
    presetBox.appendChild(b);
  }
}

function syncInputs() {
  document.getElementById('title').value = state.title;
  document.getElementById('subtitle').value = state.subtitle;
  document.getElementById('tagline').value = state.tagline;
  document.getElementById('badge').value = state.badge;
  document.getElementById('heat').value = String(state.heat);
}

/** The per-panel list: pick a panel, its photo, zoom and focal point. */
function buildPanelList() {
  const box = document.getElementById('panels');
  box.innerHTML = '';
  const layout = COVER_LAYOUTS[state.layout];
  state.panels.forEach((panel, i) => {
    const row = document.createElement('div');
    row.className = 'panel-row' + (i === state.selectedPanel ? ' selected' : '');
    const head = document.createElement('button');
    head.type = 'button';
    head.className = 'panel-head';
    head.textContent = `${i + 1}. ${panel.label || layout.panels[i].label}`;
    head.addEventListener('click', () => { state.selectedPanel = i; buildPanelList(); syncPanelControls(); redraw(); });
    row.appendChild(head);
    box.appendChild(row);
  });
  syncPanelControls();
}

function syncPanelControls() {
  const panel = state.panels[state.selectedPanel];
  if (!panel) return;
  const photoSel = document.getElementById('panelPhoto');
  photoSel.innerHTML = '';
  photos.forEach((p, i) => {
    const o = document.createElement('option');
    o.value = String(i);
    o.textContent = `${i + 1}. ${p.name}`;
    photoSel.appendChild(o);
  });
  photoSel.value = String(panel.photo);
  document.getElementById('panelZoom').value = String(panel.zoom);
  document.getElementById('panelZoomVal').textContent = `${Math.round(panel.zoom * 100)}%`;
  document.getElementById('panelX').value = String(panel.fx);
  document.getElementById('panelY').value = String(panel.fy);
  document.getElementById('panelLabel').value = panel.label || '';
}

function bindControls() {
  document.getElementById('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
  document.getElementById('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
  document.getElementById('tagline').addEventListener('input', (e) => { state.tagline = e.target.value; redraw(); });
  document.getElementById('badge').addEventListener('input', (e) => { state.badge = e.target.value; redraw(); });
  document.getElementById('heat').addEventListener('input', (e) => { state.heat = Number(e.target.value); redraw(); });
  for (const id of ['title', 'subtitle', 'tagline', 'badge']) {
    document.getElementById(id).addEventListener('change', () => history.commit());
  }
  document.getElementById('panelPhoto').addEventListener('change', (e) => {
    history.commit();
    state.panels[state.selectedPanel].photo = Number(e.target.value);
    redraw();
  });
  document.getElementById('panelZoom').addEventListener('input', (e) => {
    state.panels[state.selectedPanel].zoom = Number(e.target.value);
    document.getElementById('panelZoomVal').textContent = `${Math.round(Number(e.target.value) * 100)}%`;
    redraw();
  });
  document.getElementById('panelZoom').addEventListener('change', () => history.commit());
  document.getElementById('panelX').addEventListener('input', (e) => {
    state.panels[state.selectedPanel].fx = Number(e.target.value); redraw();
  });
  document.getElementById('panelY').addEventListener('input', (e) => {
    state.panels[state.selectedPanel].fy = Number(e.target.value); redraw();
  });
  for (const id of ['panelX', 'panelY']) {
    document.getElementById(id).addEventListener('change', () => history.commit());
  }
  document.getElementById('panelLabel').addEventListener('input', (e) => {
    state.panels[state.selectedPanel].label = e.target.value; buildPanelList(); redraw();
  });
  document.getElementById('undo').addEventListener('click', () => {
    if (history.undo()) { buildPickers(); buildPanelList(); syncInputs(); redraw(); setStatus('Undid the last change.'); }
  });
  document.getElementById('redo').addEventListener('click', () => {
    if (history.redo()) { buildPickers(); buildPanelList(); syncInputs(); redraw(); setStatus('Redid the change.'); }
  });
  document.getElementById('size').addEventListener('change', (e) => {
    currentSize = e.target.value;
    redraw();
    setStatus(`Preview size: ${COVER_SIZES[currentSize].name} ${COVER_SIZES[currentSize].w} x ${COVER_SIZES[currentSize].h}.`);
  });
  document.getElementById('addPhotos').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    for (const file of files) {
      const img = await loadImage(URL.createObjectURL(file));
      photos.push({ img, name: file.name.replace(/\.[^.]+$/, '') });
    }
    buildPanelList();
    setStatus(`Added ${files.length} photo${files.length === 1 ? '' : 's'}. Pick one per panel below.`);
    redraw();
  });
  document.getElementById('useSample1').addEventListener('click', async () => {
    photos[0] = await loadSample('boulevard');
    state.panels.forEach((p) => { if (p.photo === 0) p.photo = 0; });
    buildPanelList(); redraw(); setStatus('Sample photo 1 loaded: boulevard.');
  });
  document.getElementById('useSample2').addEventListener('click', async () => {
    photos[1] = await loadSample('pier');
    buildPanelList(); redraw(); setStatus('Sample photo 2 loaded: pier.');
  });
  document.getElementById('exportOne').addEventListener('click', () => exportCover(currentSize));
  document.getElementById('exportAll').addEventListener('click', exportAllSizes);
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const layout = COVER_LAYOUTS[state.layout];
    // Panels are drawn compressed into the region above the title band.
    const pyPanels = py / (1 - layout.titleBand);
    const hit = layout.panels.findIndex((p) => px >= p.x && px < p.x + p.w && pyPanels >= p.y && pyPanels < p.y + p.h);
    if (hit >= 0) { state.selectedPanel = hit; buildPanelList(); setStatus(`Panel ${hit + 1} selected. Adjust its photo, zoom and position below.`); }
  });
}

/** Renders the cover at a post size on an offscreen canvas. */
export function renderCover(sizeKey) {
  const size = COVER_SIZES[sizeKey];
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCoverArt(off, stateWithPhotos());
  return off;
}

function downloadCanvas(off, filename) {
  return new Promise((resolve) => {
    off.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      resolve(blob ? blob.size : 0);
    }, 'image/png');
  });
}

async function exportCover(sizeKey) {
  const size = COVER_SIZES[sizeKey];
  const bytes = await downloadCanvas(renderCover(sizeKey), `neon-shores-${size.w}x${size.h}.png`);
  setStatus(`Saved neon-shores-${size.w}x${size.h}.png (${Math.round(bytes / 1024)} KiB).`);
}

async function exportAllSizes() {
  for (const key of Object.keys(COVER_SIZES)) {
    await exportCover(key);
    await new Promise((r) => setTimeout(r, 150));
  }
  setStatus('Saved all three sizes: 1080 x 1080, 1080 x 1350, 1920 x 1080.');
}

// Renders every post size and records the PNG byte lengths, for checks.
async function exportCheck() {
  const out = {};
  for (const key of Object.keys(COVER_SIZES)) {
    const off = renderCover(key);
    const url = off.toDataURL('image/png');
    out[key] = { w: off.width, h: off.height, bytes: Math.round(url.length * 0.75) };
  }
  window.__exportCheck = out;
  document.title = 'export-check ' + JSON.stringify(out);
}

async function boot() {
  photos = [await loadSample('boulevard'), await loadSample('pier')];
  buildPickers();
  buildPanelList();
  syncInputs();
  bindControls();
  const query = new URLSearchParams(location.search);
  const shot = query.get('shot');
  if (shot === 'exportcheck') {
    await document.fonts.load('120px Anton').catch(() => {});
    await document.fonts.load('40px Pacifico').catch(() => {});
    redraw();
    await exportCheck();
    window.__shotReady = true;
    return;
  }
  if (shot) {
    window.__coverRedraw = redraw;
    await runShot(shot, query, async (scene) => {
      state.layout = scene.layout;
      state.grade = scene.grade;
      state.title = scene.title;
      state.subtitle = scene.subtitle;
      state.tagline = scene.tagline;
      state.badge = scene.badge;
      state.panels = defaultPanels(scene.layout);
      state.selectedPanel = 0;
      const aspect = window.innerWidth / window.innerHeight;
      currentSize = aspect > 1.25 ? 'wide' : aspect < 0.85 ? 'portrait' : 'square';
      document.getElementById('size').value = currentSize;
      buildPickers(); buildPanelList(); syncInputs();
      const want = scene.photo === 'pier' ? 1 : 0;
      state.panels.forEach((p, i) => { p.photo = i % 2 === 0 ? want : 1 - want; });
      redraw();
    });
    // runShot's setup.redraw hook: redraw once more after fonts settle.
    runShotRedrawFix();
    return;
  }
  redraw();
}

function runShotRedrawFix() {
  // shots.js already redrew after the fonts loaded; keep the preview fresh.
  redraw();
}

boot();

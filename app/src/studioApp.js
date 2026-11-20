// studioApp.js — the cover studio editor: live preview canvas, panel
// controls, caption editing, and PNG export in the three post sizes.
// Photos never leave the machine: uploads are read with FileReader and
// drawn locally, nothing is sent anywhere.

import { drawKeyCover, KEYART_LAYOUTS, KEYART_GRADES, keyDefaultFocal } from './keyartEngine.js';
import { keyDefaultState, keyCloneState, keyHistory, KEY_PRESETS, KEY_SIZES, keySurprise, SAMPLE_PHOTOS } from './studioState.js';

const $ = (id) => document.getElementById(id);

function keyLoadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not load ' + src));
    img.src = src;
  });
}

export async function keyStartStudio() {
  const photos = {};
  for (const s of SAMPLE_PHOTOS) {
    try {
      photos[s.id] = await keyLoadImage(s.file);
    } catch {
      photos[s.id] = null;
    }
  }
  const uploads = {}; // id -> image, for photos the user adds
  const history = keyHistory(keyDefaultState());
  const preview = $('preview');
  const status = $('status');

  // Build the layout, grade and size pickers from the engine's own tables.
  const layoutSel = $('layout');
  for (const [id, def] of Object.entries(KEYART_LAYOUTS)) {
    const o = document.createElement('option');
    o.value = id;
    o.textContent = def.label + ' — ' + def.blurb;
    layoutSel.appendChild(o);
  }
  const gradeSel = $('grade');
  for (const [id, def] of Object.entries(KEYART_GRADES)) {
    const o = document.createElement('option');
    o.value = id;
    o.textContent = def.label;
    gradeSel.appendChild(o);
  }
  const sizeSel = $('size');
  for (const [id, def] of Object.entries(KEY_SIZES)) {
    const o = document.createElement('option');
    o.value = id;
    o.textContent = def.label;
    sizeSel.appendChild(o);
  }

  // Preset buttons: the three candidates plus two more looks.
  const presetRow = $('presets');
  for (const p of KEY_PRESETS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = p.name;
    b.addEventListener('click', () => {
      const next = keyCloneState(p.state);
      next.size = history.get().size;
      history.push(next);
      keyRender();
      keySetStatus('Preset applied: ' + p.name);
    });
    presetRow.appendChild(b);
  }

  // Per-panel controls: one card per panel with photo, zoom and focal.
  const panelBox = $('panels');
  const panelCards = [];
  for (let i = 0; i < 4; i++) {
    const card = document.createElement('div');
    card.className = 'panel-card';
    card.innerHTML =
      `<h3>Panel ${i + 1}</h3>` +
      `<label>Photo <select data-k="photo"></select></label>` +
      `<label>Zoom <input data-k="zoom" type="range" min="1" max="2.2" step="0.05" value="1"></label>` +
      `<label>Across <input data-k="fx" type="range" min="0" max="1" step="0.02" value="0.5"></label>` +
      `<label>Down <input data-k="fy" type="range" min="0" max="1" step="0.02" value="0.2"></label>`;
    const sel = card.querySelector('[data-k="photo"]');
    for (const s of SAMPLE_PHOTOS) {
      const o = document.createElement('option');
      o.value = s.id;
      o.textContent = s.label;
      sel.appendChild(o);
    }
    panelBox.appendChild(card);
    panelCards.push(card);
    card.addEventListener('input', () => {
      const st = keyCloneState(history.get());
      const p = st.panels[i];
      p.photo = sel.value;
      p.zoom = Number(card.querySelector('[data-k="zoom"]').value);
      p.fx = Number(card.querySelector('[data-k="fx"]').value);
      p.fy = Number(card.querySelector('[data-k="fy"]').value);
      history.push(st);
      keyRender();
    });
  }

  function keyAllPhotos() {
    return { ...photos, ...uploads };
  }

  function keyRender() {
    const st = history.get();
    const size = KEY_SIZES[st.size] || KEY_SIZES.square;
    preview.width = size.w;
    preview.height = size.h;
    drawKeyCover(preview, keyAllPhotos(), st);
    layoutSel.value = st.layout;
    gradeSel.value = st.grade;
    sizeSel.value = st.size;
    $('title').value = st.title;
    $('tagline').value = st.tagline;
    st.panels.forEach((p, i) => {
      const card = panelCards[i];
      const sel = card.querySelector('[data-k="photo"]');
      if (![...sel.options].some((o) => o.value === p.photo)) {
        const o = document.createElement('option');
        o.value = p.photo;
        o.textContent = 'Your photo ' + (i + 1);
        sel.appendChild(o);
      }
      sel.value = p.photo;
      card.querySelector('[data-k="zoom"]').value = String(p.zoom);
      card.querySelector('[data-k="fx"]').value = String(p.fx);
      card.querySelector('[data-k="fy"]').value = String(p.fy);
    });
    $('undo').disabled = !history.canUndo();
    $('redo').disabled = !history.canRedo();
  }

  function keySetStatus(text) {
    status.textContent = text;
  }

  function keyEdit(mutator, note) {
    const st = keyCloneState(history.get());
    mutator(st);
    history.push(st);
    keyRender();
    if (note) keySetStatus(note);
  }

  layoutSel.addEventListener('change', () => keyEdit((s) => { s.layout = layoutSel.value; }, 'Layout: ' + layoutSel.value));
  gradeSel.addEventListener('change', () => keyEdit((s) => { s.grade = gradeSel.value; }, 'Grade: ' + gradeSel.value));
  sizeSel.addEventListener('change', () => keyEdit((s) => { s.size = sizeSel.value; }, 'Size: ' + sizeSel.value));
  $('title').addEventListener('input', () => keyEdit((s) => { s.title = $('title').value; }));
  $('tagline').addEventListener('input', () => keyEdit((s) => { s.tagline = $('tagline').value; }));
  $('undo').addEventListener('click', () => { if (history.undo()) keyRender(); });
  $('redo').addEventListener('click', () => { if (history.redo()) keyRender(); });
  $('surprise').addEventListener('click', () => {
    const next = keySurprise();
    next.size = history.get().size;
    history.push(next);
    keyRender();
    keySetStatus('Surprise cover: ' + next.title);
  });

  // Add your own photo: read locally, never uploaded. It becomes a choice
  // in every panel's photo picker.
  $('upload').addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('read failed'));
        reader.readAsDataURL(file);
      });
      const img = await keyLoadImage(dataUrl);
      const id = 'upload-' + Date.now();
      uploads[id] = img;
      keyEdit((s) => {
        s.panels[0] = { photo: id, ...keyDefaultFocal(''), zoom: 1 };
        s.panels[0].fx = 0.5;
        s.panels[0].fy = 0.3;
      }, 'Your photo is in panel 1. Pick it in any panel.');
    } catch {
      keySetStatus('That photo could not be read. Try another file.');
    }
    event.target.value = '';
  });

  function keyDownload(canvas, name) {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = name;
    a.click();
  }

  function keyExportCanvas(st, size) {
    const c = document.createElement('canvas');
    c.width = size.w;
    c.height = size.h;
    drawKeyCover(c, keyAllPhotos(), st);
    return c;
  }

  $('export').addEventListener('click', () => {
    const st = history.get();
    const size = KEY_SIZES[st.size] || KEY_SIZES.square;
    keyDownload(keyExportCanvas(st, size), `vice-heat-${st.size}.png`);
    keySetStatus(`Exported ${size.w} x ${size.h} PNG.`);
  });
  $('exportAll').addEventListener('click', () => {
    const st = history.get();
    for (const [id, size] of Object.entries(KEY_SIZES)) {
      keyDownload(keyExportCanvas(st, size), `vice-heat-${id}.png`);
    }
    keySetStatus('Exported all three sizes: 1080x1080, 1080x1350, 1920x1080.');
  });

  // Exposed for the screenshot scenes: render any state offscreen.
  window.__keyStudio = {
    history,
    photos: keyAllPhotos,
    render: keyRender,
    exportCanvas: keyExportCanvas,
  };
  await document.fonts.ready;
  keyRender();
  window.__studioReady = true;
}

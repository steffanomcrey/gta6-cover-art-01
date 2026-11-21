// Fixed scenes for screenshots: ?shot=editor shows the page with a sample
// photo loaded; ?shot=cover shows the cover alone at its true export size;
// ?shot=exportcheck renders all three export sizes and reports them.
// window.__shotReady is set once the scene is painted.
import { drawCover, SIZES } from './keyart.js';
import { applyPreset, freshState } from './state.js';

const PRESET_FOR_SHOT = {
  cover: 'vice-heat',
  'cover-story': 'night-shift',
  'cover-wide': 'pier-pressure',
};

const SIZE_FOR_SHOT = {
  cover: 'square',
  'cover-story': 'story',
  'cover-wide': 'wide',
};

export async function runShot(shot, query, api) {
  const { ensureImages, images, setState, redraw, renderToCanvas } = api;
  await document.fonts.load('400 100px Anton').catch(() => {});
  await document.fonts.load('400 40px Pacifico').catch(() => {});
  await ensureImages();
  await document.fonts.ready;

  if (shot === 'exportcheck') {
    const results = Object.entries(SIZES).map(([id, s]) => {
      const c = renderToCanvas(id);
      return { id, w: c.width, h: c.height, ok: c.width === s.w && c.height === s.h };
    });
    const pre = document.createElement('pre');
    pre.id = 'exportcheck';
    pre.textContent = JSON.stringify(results);
    document.body.appendChild(pre);
    window.__exportSizes = results;
    window.__shotReady = true;
    return;
  }

  if (shot === 'editor') {
    const preset = query.get('preset') || 'vice-heat';
    setState(applyPreset(freshState(preset), preset));
    redraw();
    requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
    return;
  }

  if (shot === 'cover' || shot === 'cover-story' || shot === 'cover-wide') {
    const preset = query.get('preset') || PRESET_FOR_SHOT[shot] || 'vice-heat';
    const sizeId = query.get('size') || SIZE_FOR_SHOT[shot] || 'square';
    const size = SIZES[sizeId];
    let st = applyPreset(freshState(preset), preset);
    st = { ...st, size: sizeId };
    if (query.get('title')) st.title = query.get('title');
    if (query.get('tagline')) st.tagline = query.get('tagline');
    if (query.get('grade')) st.grade = query.get('grade');
    setState(st);
    document.body.classList.add('shot-cover');
    const canvas = document.getElementById('cover');
    canvas.width = size.w;
    canvas.height = size.h;
    drawCover(canvas.getContext('2d'), size.w, size.h, st, images);
    requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
    return;
  }

  // Unknown shot: fall back to the editor with the default state.
  redraw();
  window.__shotReady = true;
}

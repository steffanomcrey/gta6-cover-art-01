// studioShots.js — fixed screenshot scenes, driven by the URL query:
//   ?shot=cover&layout=heroTop&grade=viceSunset&photo=boulevard
//       &caption=VICE%20HEAT&tagline=One%20last%20ride&size=square
//     draws one exported cover full-frame on its own canvas.
//   ?shot=editor&layout=...&photo=...&caption=...
//     shows the editor with a sample photo loaded.
//   ?shot=exportcheck  renders all three post sizes offscreen and records
//     their exact pixel sizes on window.__exportSizes.
// window.__shotReady is set once the scene has painted.

import { drawKeyCover, KEYART_LAYOUTS, KEYART_GRADES } from './keyartEngine.js';
import { keyDefaultState, keyCloneState, KEY_PRESETS, KEY_SIZES } from './studioState.js';
import { keyStartStudio } from './studioApp.js';

function keyShotState(query) {
  let st = keyDefaultState();
  const presetId = query.get('preset');
  if (presetId) {
    const p = KEY_PRESETS.find((x) => x.id === presetId);
    if (p) st = keyCloneState(p.state);
  }
  if (query.get('layout') && KEYART_LAYOUTS[query.get('layout')]) st.layout = query.get('layout');
  if (query.get('grade') && KEYART_GRADES[query.get('grade')]) st.grade = query.get('grade');
  if (query.get('caption')) st.title = query.get('caption');
  if (query.get('tagline')) st.tagline = query.get('tagline');
  if (query.get('size') && KEY_SIZES[query.get('size')]) st.size = query.get('size');
  const photo = query.get('photo') || 'boulevard';
  st.panels[0].photo = photo;
  return st;
}

async function keyLoadSample(id) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('sample ' + id + ' failed'));
    img.src = 'samples/' + id + '.jpg';
  });
}

export async function keyRunShot(shot, query) {
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    const st = keyShotState(query);
    const size = KEY_SIZES[st.size] || KEY_SIZES.square;
    const canvas = document.getElementById('shotCanvas');
    canvas.width = size.w;
    canvas.height = size.h;
    const photos = {
      boulevard: await keyLoadSample('boulevard'),
      pier: await keyLoadSample('pier'),
    };
    await document.fonts.ready;
    drawKeyCover(canvas, photos, st);
    window.__shotReady = true;
    return;
  }
  if (shot === 'exportcheck') {
    await keyStartStudio();
    const studio = window.__keyStudio;
    const st = keyCloneState(studio.history.get());
    const sizes = {};
    for (const [id, size] of Object.entries(KEY_SIZES)) {
      const c = studio.exportCanvas(st, size);
      sizes[id] = [c.width, c.height];
    }
    window.__exportSizes = sizes;
    window.__shotReady = true;
    return;
  }
  // Default: the editor, with the requested cover loaded as its state.
  await keyStartStudio();
  const studio = window.__keyStudio;
  const st = keyShotState(query);
  st.size = studio.history.get().size;
  studio.history.push(st);
  studio.render();
  window.__shotReady = true;
}

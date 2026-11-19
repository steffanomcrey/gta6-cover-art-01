// posterShots.js — fixed screenshot scenes for the entry's screenshots.
// ?shot=cover draws one exported cover full-frame at an exact post size.
// ?shot=editor shows the editor with a photo loaded.
// ?shot=exportcheck renders all three post sizes and reports their exact
// pixel sizes into #shotReport for the local validation script.

import { renderPoster, POSTER_SIZES } from './posterEngine.js';
import { defaultPoster, applyPreset, panelsForLayout, clonePoster } from './posterState.js';

const params = new URLSearchParams(location.search);
const shot = params.get('shot') || '';

function paramPoster() {
  let poster = defaultPoster();
  const preset = params.get('preset');
  if (preset) poster = applyPreset(poster, preset);
  if (params.get('layout')) {
    poster = clonePoster(poster);
    poster.layout = params.get('layout');
    poster.panels = panelsForLayout(poster.layout);
  }
  if (params.get('grade')) poster.grade = params.get('grade');
  if (params.get('caption')) poster.caption = decodeURIComponent(params.get('caption'));
  if (params.get('subtitle')) poster.subtitle = decodeURIComponent(params.get('subtitle'));
  if (params.get('quote')) poster.quote = decodeURIComponent(params.get('quote'));
  if (params.get('photo')) poster.defaultPhoto = params.get('photo');
  return poster;
}

function loadSample(id) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = `samples/${id}.jpg`;
  });
}

async function waitFonts() {
  try {
    await document.fonts.load('40px Anton');
    await document.fonts.load('20px Pacifico');
    await document.fonts.ready;
  } catch { /* fallbacks still draw */ }
}

async function shotCover() {
  const poster = paramPoster();
  const sizeKey = params.get('size') || 'square';
  const size = POSTER_SIZES[sizeKey] || POSTER_SIZES.square;
  const [boulevard, pier] = await Promise.all([loadSample('boulevard'), loadSample('pier')]);
  const images = { boulevard, pier };
  await waitFonts();
  const canvas = document.createElement('canvas');
  document.body.innerHTML = '';
  document.body.style.margin = '0';
  document.body.style.background = '#0b0616';
  canvas.style.display = 'block';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.objectFit = 'contain';
  document.body.appendChild(canvas);
  renderPoster(canvas, poster, images, size);
  document.title = `cover ${size.w}x${size.h}`;
  const report = document.createElement('div');
  report.id = 'shotReport';
  report.textContent = `cover ${canvas.width}x${canvas.height}`;
  report.style.display = 'none';
  document.body.appendChild(report);
}

async function shotExportCheck() {
  const poster = paramPoster();
  const [boulevard, pier] = await Promise.all([loadSample('boulevard'), loadSample('pier')]);
  const images = { boulevard, pier };
  await waitFonts();
  const lines = [];
  for (const [key, size] of Object.entries(POSTER_SIZES)) {
    const canvas = document.createElement('canvas');
    renderPoster(canvas, poster, images, size);
    lines.push(`${key} ${canvas.width}x${canvas.height}`);
  }
  const report = document.createElement('div');
  report.id = 'shotReport';
  report.textContent = lines.join(' | ');
  document.body.appendChild(report);
  document.title = lines.join(' | ');
}

async function shotEditor() {
  // The editor boots itself from posterApp.js; the shot only pre-selects
  // the requested preset/layout so the screenshot shows a loaded photo
  // and a finished-looking cover.
  const preset = params.get('preset') || 'neonShores';
  const app = window.__posterApp;
  if (!app) return;
  const poster = paramPoster();
  app.setPoster(poster);
  document.title = 'editor';
}

if (shot === 'cover') shotCover();
else if (shot === 'exportcheck') shotExportCheck();
else if (shot === 'editor') {
  // posterApp.js boots async; wait for it, then apply the shot preset.
  const tick = setInterval(() => {
    if (window.__posterApp && document.body.classList.contains('ready')) {
      clearInterval(tick);
      shotEditor();
    }
  }, 100);
  setTimeout(() => clearInterval(tick), 10000);
}

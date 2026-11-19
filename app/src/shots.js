// Fixed scenes for screenshots: ?shot=cover draws one exported cover full
// frame, ?shot=editor shows the editor with a sample photo loaded.
// Query knobs: layout, grade, caption, subtitle, tagline, badge, photo.
// window.__shotReady is set once the fonts are in and the cover is painted.
import { COVER_PRESETS, applyPreset } from './editorState.js';

export async function runShot(shot, query, setup) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  if (shot === 'editor') document.body.classList.add('shot-editor');
  const presetName = query.get('preset');
  const preset = COVER_PRESETS.find((p) => p.name.toLowerCase().replace(/\s+/g, '-') === (presetName || '').toLowerCase());
  await setup({
    layout: query.get('layout') || (preset ? preset.layout : 'ninePanel'),
    grade: query.get('grade') || (preset ? preset.grade : 'sunset'),
    title: query.get('caption') || (preset ? preset.title : 'NEON SHORES'),
    subtitle: query.get('subtitle') || (preset ? preset.subtitle : 'one last ride in Leonida'),
    tagline: query.get('tagline') || (preset ? preset.tagline : 'Welcome to Leonida'),
    badge: query.get('badge') || (preset ? preset.badge : 'EST. HEAT - VICE SHORES'),
    photo: query.get('photo') || 'boulevard',
  });
  try {
    await document.fonts.load('120px Anton');
    await document.fonts.load('40px Pacifico');
    await document.fonts.ready;
  } catch { /* fonts fall back to system faces; the cover still draws */ }
  if (typeof window.__coverRedraw === 'function') window.__coverRedraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

export { applyPreset };

// Studio state: presets (the judged candidates), sizes, undo/redo.
// A preset only seeds the state; layout/grade/caption/size overrides apply
// after it, so a preset never locks the editor into one size.
import { LAYOUTS, GRADES, SIZES, autoFillPanels } from './keyart.js';

export const SAMPLES = [
  { id: 'boulevard', label: 'Boulevard', src: 'samples/boulevard.jpg' },
  { id: 'pier', label: 'Pier', src: 'samples/pier.jpg' },
  { id: 'beach', label: 'Beach', src: 'samples/beach.jpg' },
  { id: 'skyline', label: 'Skyline', src: 'samples/skyline.jpg' },
  { id: 'street', label: 'Neon Street', src: 'samples/street.jpg' },
  { id: 'palms', label: 'Palms', src: 'samples/palms.jpg' },
];

// The three judged candidates plus two further looks. Each preset names a
// distinct layout + grade + title + tagline and a distinct photo order, so
// every exported cover shows different photos in different places.
export const PRESETS = [
  {
    id: 'vice-heat',
    name: 'A · Vice Heat',
    layout: 'vice-heat',
    grade: 'vice-sunset',
    title: 'VICE HEAT',
    tagline: 'one last ride in Leonida',
    photos: [0, 1, 2, 3],
  },
  {
    id: 'hero-close',
    name: 'B · Hero Close-Up',
    layout: 'hero-close',
    grade: 'neon-night',
    title: 'NEON SHORE',
    tagline: 'the summer job',
    photos: [4, 5, 0, 1],
  },
  {
    id: 'quad-asym',
    name: 'C · Quad Asymmetric',
    layout: 'quad-asym',
    grade: 'golden-hour',
    title: 'GOLDEN MILE',
    tagline: 'chase the sunset',
    photos: [2, 3, 4, 5],
  },
  {
    id: 'night-shift',
    name: 'Night Shift',
    layout: 'night-shift',
    grade: 'neon-night',
    title: 'NIGHT SHIFT',
    tagline: 'the city never sleeps',
    photos: [4, 1, 5, 0],
  },
  {
    id: 'pier-pressure',
    name: 'Pier Pressure',
    layout: 'pier-pressure',
    grade: 'palm-noir',
    title: 'PIER PRESSURE',
    tagline: 'high tide, high stakes',
    photos: [1, 3, 2, 5],
  },
];

export function freshState(presetId = 'vice-heat') {
  const preset = PRESETS.find((p) => p.id === presetId) || PRESETS[0];
  const panels = autoFillPanels(preset.layout, preset.photos);
  return {
    preset: preset.id,
    layout: preset.layout,
    grade: preset.grade,
    title: preset.title,
    tagline: preset.tagline,
    size: 'square',
    panels,
    selectedPanel: 0,
  };
}

export function applyPreset(state, presetId) {
  const next = freshState(presetId);
  next.size = state.size; // keep the chosen export size across presets
  return next;
}

/** Re-assign distinct photos to the live panels from a photo order. */
export function refillPhotos(state, order) {
  const panels = autoFillPanels(state.layout, order);
  // Preserve the user's per-panel crop on matching slots.
  panels.forEach((p, i) => {
    const old = state.panels[i];
    if (old) { p.zoom = old.zoom; p.fx = old.fx; p.fy = old.fy; }
  });
  return { ...state, panels };
}

export function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

export function makeHistory(initial) {
  let past = [];
  let future = [];
  let current = cloneState(initial);
  return {
    get() { return current; },
    push(next) {
      past.push(current);
      if (past.length > 50) past.shift();
      future = [];
      current = cloneState(next);
    },
    undo() {
      if (!past.length) return current;
      future.push(current);
      current = past.pop();
      return current;
    },
    redo() {
      if (!future.length) return current;
      past.push(current);
      current = future.pop();
      return current;
    },
    canUndo() { return past.length > 0; },
    canRedo() { return future.length > 0; },
  };
}

export { LAYOUTS, GRADES, SIZES };

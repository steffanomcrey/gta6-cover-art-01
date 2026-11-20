// studioState.js — the cover studio's state: one cover, four panels, one
// giant title. A panel is { photo, fx, fy, zoom }; the title and tagline
// are the only text on the cover. No per-panel captions, no badge.

import { keyDefaultFocal } from './keyartEngine.js';

export const SAMPLE_PHOTOS = [
  { id: 'boulevard', label: 'Boulevard', file: 'samples/boulevard.jpg' },
  { id: 'pier', label: 'Pier', file: 'samples/pier.jpg' },
];

export function keyPanel(photo, zoom) {
  const f = keyDefaultFocal(photo);
  return { photo, fx: f.fx, fy: f.fy, zoom: zoom || 1 };
}

export function keyDefaultState() {
  return {
    layout: 'heroTop',
    grade: 'viceSunset',
    title: 'VICE HEAT',
    tagline: 'One last ride in Leonida',
    size: 'square',
    panels: [
      keyPanel('boulevard', 1),
      keyPanel('pier', 1),
      keyPanel('boulevard', 1.15),
      keyPanel('pier', 1.1),
    ],
  };
}

// The three candidates, each a full state: same photos, different key-art
// composition. The editor's presets are built from these.
export const KEY_PRESETS = [
  {
    id: 'candidate-a',
    name: 'A — Hero Top',
    state: {
      layout: 'heroTop', grade: 'viceSunset', title: 'VICE HEAT',
      tagline: 'One last ride in Leonida', size: 'square',
      panels: [keyPanel('boulevard', 1), keyPanel('pier', 1), keyPanel('boulevard', 1.15), { photo: 'pier', fx: 0.30, fy: 0.28, zoom: 1.5 }],
    },
  },
  {
    id: 'candidate-b',
    name: 'B — Split Key',
    state: {
      layout: 'splitLeft', grade: 'neonNights', title: 'NEON SHORES',
      tagline: 'Vice nights, golden hour', size: 'square',
      panels: [keyPanel('pier', 1), keyPanel('boulevard', 1), keyPanel('pier', 1.15), keyPanel('boulevard', 1.1)],
    },
  },
  {
    id: 'candidate-c',
    name: 'C — Quad Banner',
    state: {
      layout: 'quadBanner', grade: 'goldenHour', title: 'LEONIDA',
      tagline: 'Welcome to Leonida', size: 'square',
      panels: [keyPanel('boulevard', 1), keyPanel('pier', 1), keyPanel('pier', 1.15), keyPanel('boulevard', 1.1)],
    },
  },
  {
    id: 'preset-dusk',
    name: 'Dusk Stack',
    state: {
      layout: 'stackRight', grade: 'palmDusk', title: 'PALM DUSK',
      tagline: 'Chasing the last light', size: 'square',
      panels: [keyPanel('boulevard', 1), keyPanel('pier', 1), keyPanel('boulevard', 1.1), keyPanel('pier', 1.05)],
    },
  },
  {
    id: 'preset-mono',
    name: 'Mono Heat',
    state: {
      layout: 'heroTop', grade: 'monoHeat', title: 'HEATWAVE',
      tagline: 'One city, no brakes', size: 'square',
      panels: [keyPanel('pier', 1), keyPanel('boulevard', 1), keyPanel('pier', 1.15), keyPanel('boulevard', 1.1)],
    },
  },
];

export const KEY_SIZES = {
  square: { label: 'Square 1080 x 1080', w: 1080, h: 1080 },
  story: { label: 'Story 1080 x 1350', w: 1080, h: 1350 },
  wide: { label: 'Wide 1920 x 1080', w: 1920, h: 1080 },
};

// Small undo/redo history over whole states.
export function keyHistory(initial) {
  let past = [];
  let future = [];
  let current = initial;
  return {
    get() { return current; },
    push(next) {
      past.push(current);
      if (past.length > 40) past.shift();
      future = [];
      current = next;
    },
    undo() {
      if (!past.length) return null;
      future.push(current);
      current = past.pop();
      return current;
    },
    redo() {
      if (!future.length) return null;
      past.push(current);
      current = future.pop();
      return current;
    },
    canUndo() { return past.length > 0; },
    canRedo() { return future.length > 0; },
  };
}

export function keyCloneState(st) {
  return JSON.parse(JSON.stringify(st));
}

// One-tap shuffle: random layout, grade, title and panel photos, keeping
// the faces visible by re-deriving focals from the new photo choice.
export function keySurprise(random) {
  const rnd = random || Math.random;
  const layouts = ['heroTop', 'splitLeft', 'quadBanner', 'stackRight'];
  const grades = ['viceSunset', 'neonNights', 'goldenHour', 'palmDusk', 'monoHeat'];
  const titles = [
    ['VICE HEAT', 'One last ride in Leonida'],
    ['NEON SHORES', 'Vice nights, golden hour'],
    ['LEONIDA', 'Welcome to Leonida'],
    ['SUNSET HEIST', 'One city, no brakes'],
    ['PALM DUSK', 'Chasing the last light'],
  ];
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const [title, tagline] = pick(titles);
  const photos = ['boulevard', 'pier'];
  return {
    layout: pick(layouts),
    grade: pick(grades),
    title,
    tagline,
    size: 'square',
    panels: [0, 1, 2, 3].map(() => keyPanel(pick(photos), 1 + rnd() * 0.2)),
  };
}

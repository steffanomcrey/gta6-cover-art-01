// posterState.js — the poster's state: layout, grade, lettering, panels,
// presets, the photo library and undo/redo history. No DOM here, so the
// shot scenes and the editor share the same state shape.

import { LAYOUTS, GRADES } from './posterEngine.js';

export const LAYOUT_IDS = Object.keys(LAYOUTS);
export const GRADE_IDS = Object.keys(GRADES);

export const SAMPLE_PHOTOS = {
  boulevard: { label: 'Boulevard', src: 'samples/boulevard.jpg' },
  pier: { label: 'Pier 9', src: 'samples/pier.jpg' },
};

function panel(photo, fx, fy, zoom, caption) {
  return { photo, focus: { x: fx, y: fy }, zoom, caption };
}

// Panel photo + focal defaults per layout, tuned so faces stay visible.
// Measured from the samples: the boulevard woman's face sits at about
// (0.52, 0.16) of her portrait (544x720), the pier man's face at about
// (0.38, 0.20) of his square (720x720). Wide panels show only a thin
// vertical slice, so their focal y must stay low (0.16-0.26) or the face
// slides out of the slice; variety comes from zoom and focal x instead
// of pushing the focal down the photo.
export function panelsForLayout(layout) {
  const B = (fx, fy, z, c) => panel('boulevard', fx, fy, z, c);
  const P = (fx, fy, z, c) => panel('pier', fx, fy, z, c);
  switch (layout) {
    case 'ninePanel':
      return [
        B(0.52, 0.16, 1.15, '01 Boulevard'), P(0.38, 0.20, 1.15, '02 Pier 9'),
        B(0.55, 0.22, 1.35, '03 Golden Hour'), P(0.42, 0.24, 1.25, '04 Rooftop'),
        B(0.50, 0.18, 1.30, '05 Convertible'), P(0.38, 0.22, 1.30, '06 Harbor'),
        B(0.55, 0.22, 1.35, '07 Palm Court'), P(0.40, 0.20, 1.20, '08 Night Street'),
        B(0.52, 0.20, 1.45, '09 Vice Shores'),
      ];
    case 'heroTrio':
      return [B(0.52, 0.18, 1.10, '01 Boulevard'), P(0.38, 0.20, 1.20, '02 Pier 9'),
        B(0.55, 0.24, 1.20, '03 Palm Court'), P(0.40, 0.22, 1.20, '04 Night Street')];
    case 'heroDuo':
      return [B(0.52, 0.18, 1.10, '01 Boulevard'), P(0.38, 0.20, 1.25, '02 Pier 9'),
        B(0.55, 0.24, 1.20, '03 Palm Court')];
    case 'keyArtSlash':
      return [B(0.52, 0.18, 1.05, '01 Key Art'), P(0.38, 0.20, 1.20, '02 Pier 9'),
        B(0.55, 0.22, 1.20, '03 Palm Court')];
    case 'inkedPanels':
      return [B(0.52, 0.18, 1.10, '01 Inked'), P(0.38, 0.20, 1.15, '02 Pier 9'),
        B(0.55, 0.22, 1.20, '03 Palm Court'), P(0.40, 0.22, 1.15, '04 Night Street')];
    case 'tiltSnap':
      return [B(0.52, 0.18, 1.15, '01 Boulevard'), P(0.38, 0.20, 1.15, '02 Pier 9'),
        B(0.55, 0.24, 1.20, '03 Palm Court'), P(0.40, 0.22, 1.15, '04 Night Street')];
    case 'stripHero':
      return [P(0.38, 0.20, 1.00, '01 Pier 9'), B(0.52, 0.20, 1.20, '02 Boulevard'),
        P(0.40, 0.22, 1.20, '03 Harbor'), B(0.55, 0.24, 1.20, '04 Palm Court')];
    case 'comicSix':
      return [B(0.52, 0.18, 1.15, '01 Boulevard'), P(0.38, 0.20, 1.15, '02 Pier 9'),
        B(0.55, 0.24, 1.20, '03 Palm Court'), P(0.40, 0.22, 1.15, '04 Night Street'),
        B(0.52, 0.20, 1.20, '05 Convertible'), P(0.38, 0.22, 1.15, '06 Harbor')];
    case 'fullBleed':
    default:
      return [B(0.52, 0.18, 1.05, '01 Boulevard')];
  }
}

export function defaultPoster() {
  return {
    layout: 'ninePanel',
    grade: 'sunset',
    caption: 'Neon Shores',
    subtitle: 'one last ride in Leonida',
    quote: 'Welcome to Leonida. One city, no brakes.',
    badge: 'EST. HEAT - VICE SHORES',
    stars: 5,
    tags: ['neonshores', 'leonida', 'vicecity', 'gta6style'],
    defaultPhoto: 'boulevard',
    panels: panelsForLayout('ninePanel'),
  };
}

// Cover ideas: one click fills layout, grade, lettering and panels.
export const PRESETS = {
  neonShores: {
    name: 'Neon Shores', layout: 'ninePanel', grade: 'sunset',
    caption: 'Neon Shores', subtitle: 'one last ride in Leonida',
    quote: 'Welcome to Leonida. One city, no brakes.',
    badge: 'EST. HEAT - VICE SHORES', stars: 5,
    tags: ['neonshores', 'leonida', 'vicecity', 'gta6style'],
  },
  viceHeat: {
    name: 'Vice Heat', layout: 'keyArtSlash', grade: 'neon',
    caption: 'Vice Heat', subtitle: 'one city, no brakes',
    quote: 'The heat never leaves the boulevard.',
    badge: 'VICE HEAT - EST. 2026', stars: 5,
    tags: ['viceheat', 'neonnights', 'leonida'],
  },
  goldenHour: {
    name: 'Golden Hour', layout: 'stripHero', grade: 'gold',
    caption: 'Golden Hour', subtitle: 'chasing the last light',
    quote: 'Golden hour, and the city is ours.',
    badge: 'GOLDEN HOUR CLUB', stars: 4,
    tags: ['goldenhour', 'sunset', 'pier9'],
  },
  inkwave: {
    name: 'Inkwave Press', layout: 'inkedPanels', grade: 'ink',
    caption: 'Inkwave', subtitle: 'inked in the neon rain',
    quote: 'Drawn in ink, lit in neon.',
    badge: 'INKWAVE POSTER PRESS', stars: 5,
    tags: ['inkwave', 'posterpress', 'neon'],
  },
  palmwave: {
    name: 'Palmwave', layout: 'heroTrio', grade: 'palm',
    caption: 'Palmwave', subtitle: 'salt air and palm shade',
    quote: 'Palms up, worries down.',
    badge: 'PALMWAVE - VICE SHORES', stars: 4,
    tags: ['palmwave', 'beach', 'vice'],
  },
  sunsetHeist: {
    name: 'Sunset Heist', layout: 'heroDuo', grade: 'vice',
    caption: 'Sunset Heist', subtitle: 'one last score at dusk',
    quote: 'We go at sunset. No one follows.',
    badge: 'SUNSET HEIST - CREW 6', stars: 5,
    tags: ['sunsetheist', 'crew6', 'leonida'],
  },
};

export function applyPreset(state, presetId) {
  const p = PRESETS[presetId];
  if (!p) return state;
  return {
    ...state,
    layout: p.layout,
    grade: p.grade,
    caption: p.caption,
    subtitle: p.subtitle,
    quote: p.quote,
    badge: p.badge,
    stars: p.stars,
    tags: [...p.tags],
    panels: panelsForLayout(p.layout),
  };
}

// Surprise me: a random preset + a random grade shuffle, for the
// one-click cover idea the top entries show.
export function surprisePreset(state) {
  const ids = Object.keys(PRESETS);
  const pick = ids[Math.floor(Math.random() * ids.length)];
  const next = applyPreset(state, pick);
  const grades = GRADE_IDS.filter((g) => g !== next.grade);
  if (Math.random() < 0.5) next.grade = grades[Math.floor(Math.random() * grades.length)];
  return next;
}

// Undo/redo: a plain stack of JSON snapshots, capped at 60.
export function makeHistory(initial) {
  return { past: [], future: [], current: JSON.stringify(initial) };
}

export function historyPush(history, state) {
  const snap = JSON.stringify(state);
  if (snap === history.current) return history;
  history.past.push(history.current);
  if (history.past.length > 60) history.past.shift();
  history.future = [];
  history.current = snap;
  return history;
}

export function historyUndo(history) {
  if (!history.past.length) return null;
  history.future.push(history.current);
  history.current = history.past.pop();
  return JSON.parse(history.current);
}

export function historyRedo(history) {
  if (!history.future.length) return null;
  history.past.push(history.current);
  history.current = history.future.pop();
  return JSON.parse(history.current);
}

export function clonePoster(state) {
  return JSON.parse(JSON.stringify(state));
}

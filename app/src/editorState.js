// Editor state for Neon Shores: the cover settings, the per-panel tweaks,
// and a small undo/redo history so every change can be stepped back.
// State is plain data; the engine draws it, main.js wires the controls.

import { COVER_LAYOUTS } from './coverEngine.js';

export function defaultPanels(layoutKey) {
  const layout = COVER_LAYOUTS[layoutKey] || COVER_LAYOUTS.ninePanel;
  return layout.panels.map((p) => ({
    photo: p.photo,
    zoom: 1,
    fx: p.fx,
    fy: p.fy,
    label: p.label,
  }));
}

export function defaultState() {
  return {
    layout: 'ninePanel',
    grade: 'sunset',
    title: 'NEON SHORES',
    subtitle: 'one last ride in Leonida',
    tagline: 'Welcome to Leonida',
    badge: 'EST. HEAT - VICE SHORES',
    heat: 5,
    panels: defaultPanels('ninePanel'),
    selectedPanel: 0,
  };
}

/** Three one-click cover ideas: layout, grade and words that work together. */
export const COVER_PRESETS = [
  { name: 'Sunset Heist', layout: 'ninePanel', grade: 'sunset', title: 'SUNSET HEIST', subtitle: 'neon nights, golden hour', tagline: 'One last ride', badge: 'EST. HEAT - VICE SHORES', heat: 5 },
  { name: 'Vice Heat', layout: 'heroAndTwo', grade: 'neon', title: 'VICE HEAT', subtitle: 'one city, no brakes', tagline: 'Welcome to Leonida', badge: 'PANEL POP', heat: 4 },
  { name: 'Neon Harbor', layout: 'tiltedSnapshot', grade: 'vice', title: 'NEON HARBOR', subtitle: 'vice nights', tagline: 'Harbor lights', badge: 'VICE SUNSET', heat: 5 },
  { name: 'Golden Hour', layout: 'stripHero', grade: 'gold', title: 'GOLDEN HOUR', subtitle: 'chasing the last light', tagline: 'Ocean Drive', badge: 'GOLDEN HOUR', heat: 4 },
  { name: 'Teal Dusk', layout: 'comicSix', grade: 'teal', title: 'TEAL DUSK', subtitle: 'the pier at midnight', tagline: 'Pier 9', badge: 'TEAL DUSK', heat: 3 },
];

export function applyPreset(state, preset) {
  state.layout = preset.layout;
  state.grade = preset.grade;
  state.title = preset.title;
  state.subtitle = preset.subtitle;
  state.tagline = preset.tagline;
  state.badge = preset.badge;
  state.heat = preset.heat;
  state.panels = defaultPanels(preset.layout);
  state.selectedPanel = 0;
}

/** Deep copy of the settings (photos are images and stay shared). */
export function snapshotState(state) {
  return JSON.parse(JSON.stringify({ ...state, photos: undefined }));
}

export function restoreSnapshot(state, snap) {
  for (const key of Object.keys(snap)) state[key] = snap[key];
}

/** Undo/redo history over snapshots. */
export class CoverHistory {
  constructor(state) {
    this.past = [];
    this.future = [];
    this.state = state;
  }
  commit() {
    this.past.push(snapshotState(this.state));
    if (this.past.length > 60) this.past.shift();
    this.future = [];
  }
  undo() {
    if (!this.past.length) return false;
    this.future.push(snapshotState(this.state));
    restoreSnapshot(this.state, this.past.pop());
    return true;
  }
  redo() {
    if (!this.future.length) return false;
    this.past.push(snapshotState(this.state));
    restoreSnapshot(this.state, this.future.pop());
    return true;
  }
  get canUndo() { return this.past.length > 0; }
  get canRedo() { return this.future.length > 0; }
}

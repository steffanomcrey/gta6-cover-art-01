// Neon Shores cover engine: turns photos plus a caption into multi-panel
// GTA-style poster art on a 2D canvas. Everything here is drawn by hand:
// panel geometry, gradient-map grades, ink outlines, halftone dots,
// sunburst rays, film grain and vignette. No image is fetched from the
// network; photos come from the user's machine or the bundled samples.

export const COVER_TITLE_FONT = 'Anton, "Arial Narrow", sans-serif';
export const COVER_SCRIPT_FONT = 'Pacifico, cursive';

// Each layout is a list of panels in unit space (0..1 across the cover).
// A panel names its photo slot, its label chip and its focal point, so a
// face can be kept clear of the title band and of every panel edge.
export const COVER_LAYOUTS = {
  ninePanel: {
    name: 'Nine Panel',
    blurb: '3 x 3 poster grid, title band across the bottom row',
    titleBand: 0.24,
    panels: [
      { photo: 0, label: '01 - OCEAN DRIVE', fx: 0.5, fy: 0.5, x: 0, y: 0, w: 1 / 3, h: 0.38 },
      { photo: 1, label: '02 - PIER 9', fx: 0.5, fy: 0.48, x: 1 / 3, y: 0, w: 1 / 3, h: 0.38 },
      { photo: 0, label: '03 - NEON ROW', fx: 0.5, fy: 0.5, x: 2 / 3, y: 0, w: 1 / 3, h: 0.38 },
      { photo: 1, label: '04 - PALM COURT', fx: 0.5, fy: 0.48, x: 0, y: 0.38, w: 1 / 3, h: 0.38 },
      { photo: 0, label: '05 - GOLDEN HOUR', fx: 0.5, fy: 0.5, x: 1 / 3, y: 0.38, w: 1 / 3, h: 0.38 },
      { photo: 1, label: '06 - HARBOR LIGHTS', fx: 0.5, fy: 0.48, x: 2 / 3, y: 0.38, w: 1 / 3, h: 0.38 },
      { photo: 0, label: '07 - BOULEVARD', fx: 0.5, fy: 0.82, x: 0, y: 0.76, w: 1 / 3, h: 0.24 },
      { photo: 1, label: '08 - LAST RIDE', fx: 0.5, fy: 0.78, x: 1 / 3, y: 0.76, w: 1 / 3, h: 0.24 },
      { photo: 0, label: '09 - VICE SHORES', fx: 0.5, fy: 0.82, x: 2 / 3, y: 0.76, w: 1 / 3, h: 0.24 },
    ],
  },
  heroAndThree: {
    name: 'Hero and Three',
    blurb: 'One tall hero, three stacked panels, title across the foot',
    titleBand: 0.22,
    panels: [
      { photo: 0, label: '01 - HERO SHOT', fx: 0.5, fy: 0.7, x: 0, y: 0, w: 0.62, h: 1 },
      { photo: 1, label: '02 - PIER 9', fx: 0.5, fy: 1.1, x: 0.62, y: 0, w: 0.38, h: 1 / 3 },
      { photo: 0, label: '03 - NEON ROW', fx: 0.5, fy: 1.35, x: 0.62, y: 1 / 3, w: 0.38, h: 1 / 3 },
      { photo: 1, label: '04 - PALM COURT', fx: 0.5, fy: 0.9, x: 0.62, y: 2 / 3, w: 0.38, h: 1 / 3 },
    ],
  },
  heroAndTwo: {
    name: 'Hero and Two',
    blurb: 'Wide hero with two stacked panels, title over the hero',
    titleBand: 0.2,
    panels: [
      { photo: 0, label: '01 - HERO SHOT', fx: 0.5, fy: 0.7, x: 0, y: 0, w: 0.66, h: 1 },
      { photo: 1, label: '02 - PIER 9', fx: 0.5, fy: 1.1, x: 0.66, y: 0, w: 0.34, h: 0.5 },
      { photo: 0, label: '03 - NEON ROW', fx: 0.5, fy: 1.35, x: 0.66, y: 0.5, w: 0.34, h: 0.5 },
    ],
  },
  tiltedSnapshot: {
    name: 'Tilted Snapshot',
    blurb: 'Four panels with a diagonal white split, title tilted to match',
    titleBand: 0.22,
    tilt: -0.06,
    panels: [
      { photo: 1, label: '01 - PIER 9', fx: 0.5, fy: 0.62, x: 0, y: 0, w: 0.5, h: 0.5 },
      { photo: 0, label: '02 - OCEAN DRIVE', fx: 0.5, fy: 0.72, x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { photo: 0, label: '03 - GOLDEN HOUR', fx: 0.5, fy: 0.6, x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { photo: 1, label: '04 - HARBOR LIGHTS', fx: 0.5, fy: 0.6, x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  fullBleed: {
    name: 'Full Bleed',
    blurb: 'One photo edge to edge, title band at the foot',
    titleBand: 0.24,
    panels: [
      { photo: 0, label: '01 - FULL FRAME', fx: 0.5, fy: 0.5, x: 0, y: 0, w: 1, h: 1 },
    ],
  },
  comicSix: {
    name: 'Comic Six',
    blurb: 'Six equal panels, two rows of three, title across the foot',
    titleBand: 0.22,
    panels: [
      { photo: 0, label: '01 - OCEAN DRIVE', fx: 0.5, fy: 0.42, x: 0, y: 0, w: 1 / 3, h: 0.39 },
      { photo: 1, label: '02 - PIER 9', fx: 0.5, fy: 0.35, x: 1 / 3, y: 0, w: 1 / 3, h: 0.39 },
      { photo: 0, label: '03 - NEON ROW', fx: 0.5, fy: 0.55, x: 2 / 3, y: 0, w: 1 / 3, h: 0.39 },
      { photo: 1, label: '04 - PALM COURT', fx: 0.5, fy: 0.62, x: 0, y: 0.39, w: 1 / 3, h: 0.39 },
      { photo: 0, label: '05 - GOLDEN HOUR', fx: 0.5, fy: 0.64, x: 1 / 3, y: 0.39, w: 1 / 3, h: 0.39 },
      { photo: 1, label: '06 - HARBOR LIGHTS', fx: 0.5, fy: 0.62, x: 2 / 3, y: 0.39, w: 1 / 3, h: 0.39 },
    ],
  },
  stripHero: {
    name: 'Strip Hero',
    blurb: 'Wide hero strip on top, three panels below, title in the middle',
    titleBand: 0.2,
    panels: [
      { photo: 1, label: '01 - HERO SHOT', fx: 0.5, fy: 1.7, x: 0, y: 0, w: 1, h: 0.56 },
      { photo: 1, label: '02 - PIER 9', fx: 0.5, fy: 0.75, x: 0, y: 0.56, w: 1 / 3, h: 0.44 },
      { photo: 0, label: '03 - NEON ROW', fx: 0.5, fy: 0.8, x: 1 / 3, y: 0.56, w: 1 / 3, h: 0.44 },
      { photo: 1, label: '04 - PALM COURT', fx: 0.5, fy: 0.75, x: 2 / 3, y: 0.56, w: 1 / 3, h: 0.44 },
    ],
  },
};

// A grade is a sunset or neon colour map laid over the photo: a top wash,
// a bottom wash, and an overlay gradient that pushes shadows toward teal
// and highlights toward pink, gold or violet.
export const COVER_GRADES = {
  sunset: {
    name: 'Vice Sunset', top: 'rgba(255, 170, 60, 0.16)', bottom: 'rgba(214, 48, 120, 0.34)',
    overlay: ['rgba(20, 160, 190, 0)', 'rgba(255, 110, 80, 0.22)', 'rgba(190, 30, 110, 0.30)'],
  },
  neon: {
    name: 'Neon Nights', top: 'rgba(40, 220, 230, 0.14)', bottom: 'rgba(150, 30, 200, 0.36)',
    overlay: ['rgba(0, 200, 220, 0.10)', 'rgba(255, 40, 150, 0.20)', 'rgba(90, 20, 160, 0.32)'],
  },
  gold: {
    name: 'Golden Hour', top: 'rgba(255, 200, 90, 0.22)', bottom: 'rgba(180, 80, 20, 0.30)',
    overlay: ['rgba(255, 190, 80, 0.12)', 'rgba(255, 140, 40, 0.18)', 'rgba(140, 50, 10, 0.26)'],
  },
  magenta: {
    name: 'Magenta Heat', top: 'rgba(255, 90, 160, 0.16)', bottom: 'rgba(160, 10, 90, 0.38)',
    overlay: ['rgba(255, 60, 140, 0.10)', 'rgba(220, 40, 130, 0.22)', 'rgba(120, 10, 80, 0.30)'],
  },
  teal: {
    name: 'Teal Dusk', top: 'rgba(30, 200, 200, 0.16)', bottom: 'rgba(10, 60, 110, 0.36)',
    overlay: ['rgba(0, 180, 200, 0.12)', 'rgba(20, 120, 190, 0.20)', 'rgba(10, 40, 100, 0.30)'],
  },
  vice: {
    name: 'Vice City', top: 'rgba(255, 120, 200, 0.14)', bottom: 'rgba(255, 90, 40, 0.32)',
    overlay: ['rgba(255, 80, 180, 0.10)', 'rgba(255, 120, 60, 0.20)', 'rgba(200, 40, 120, 0.28)'],
  },
};

export const COVER_SIZES = {
  square: { name: 'Square post', w: 1080, h: 1080 },
  portrait: { name: 'Portrait post', w: 1080, h: 1350 },
  wide: { name: 'Wide post', w: 1920, h: 1080 },
};

const GUTTER = 6;

function fitSize(text, font, maxWidth, start, floor, ctx) {
  let size = start;
  ctx.font = font(size);
  while (ctx.measureText(text).width > maxWidth && size > floor) {
    size -= 2;
    ctx.font = font(size);
  }
  return size;
}

/** Draws one photo into a panel rect, cover-fit around its focal point.
 *  The draw position is clamped so the photo always covers the whole
 *  rect, however far the focal point sits from the centre. */
export function paintPanelPhoto(ctx, img, rect, panel, zoom) {
  const scale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * zoom;
  const pw = img.naturalWidth * scale;
  const ph = img.naturalHeight * scale;
  const cx = rect.x + rect.w * panel.fx;
  const cy = rect.y + rect.h * panel.fy;
  let dx = cx - pw / 2;
  let dy = cy - ph / 2;
  dx = Math.min(rect.x, Math.max(rect.x + rect.w - pw, dx));
  dy = Math.min(rect.y, Math.max(rect.y + rect.h - ph, dy));
  ctx.drawImage(img, dx, dy, pw, ph);
}

/** Lays a grade's colour map over a panel rect. */
export function paintGrade(ctx, rect, grade) {
  const wash = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
  wash.addColorStop(0, grade.top);
  wash.addColorStop(1, grade.bottom);
  ctx.fillStyle = wash;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.globalCompositeOperation = 'overlay';
  const over = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
  over.addColorStop(0, grade.overlay[0]);
  over.addColorStop(0.55, grade.overlay[1]);
  over.addColorStop(1, grade.overlay[2]);
  ctx.fillStyle = over;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.globalCompositeOperation = 'source-over';
}

/** A small dark chip with the panel's label, bottom-left inside the panel. */
export function paintPanelChip(ctx, rect, label) {
  if (!label) return;
  const h = Math.max(18, rect.h * 0.055);
  ctx.font = `700 ${Math.round(h * 0.52)}px system-ui, sans-serif`;
  const pad = h * 0.45;
  const w = ctx.measureText(label).width + pad * 2;
  const x = rect.x + 8;
  const y = rect.y + rect.h - h - 8;
  ctx.fillStyle = 'rgba(10, 8, 18, 0.78)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(x, y, 3, h);
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(label, x + pad, y + h / 2 + 1);
}

/** A tilted badge ribbon, top-left of the cover. */
export function paintBadge(ctx, w, h, text) {
  const size = Math.max(16, w * 0.016);
  ctx.save();
  ctx.translate(w * 0.02, h * 0.02);
  ctx.rotate(-0.05);
  ctx.font = `700 ${Math.round(size)}px system-ui, sans-serif`;
  const tw = ctx.measureText(text).width;
  const bw = tw + size * 1.6;
  const bh = size * 1.9;
  ctx.fillStyle = '#ffcf3d';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(bw, 0);
  ctx.lineTo(bw - 8, bh);
  ctx.lineTo(0, bh);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#14081c';
  ctx.lineWidth = Math.max(2, size * 0.12);
  ctx.stroke();
  ctx.fillStyle = '#14081c';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, bw / 2, bh / 2 + 1);
  ctx.restore();
}

/** Five stars centred just above the title inside the title band. */
export function paintHeatStars(ctx, w, h, heat, bandTop, band) {
  const r = Math.max(9, w * 0.014);
  const gap = r * 2.6;
  const total = gap * 4 + r * 2;
  let x = w / 2 - total / 2;
  const y = bandTop + h * band * 0.14;
  for (let i = 0; i < 5; i++) {
    drawStar(ctx, x + r, y, r, i < heat ? '#ffcf3d' : 'rgba(255,255,255,0.35)');
    x += gap;
  }
}

function drawStar(ctx, cx, cy, r, fill) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = cx + Math.cos(a) * rad;
    const py = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = 'rgba(10, 8, 18, 0.8)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

/** Halftone dots fading upward inside the title band. */
export function paintHalftone(ctx, x, y, w, h) {
  const step = Math.max(14, w * 0.018);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
  for (let row = 0; row * step < h; row++) {
    for (let col = 0; col * step < w; col++) {
      const fade = 1 - row * step / h;
      const r = Math.max(0.6, step * 0.16 * fade);
      ctx.beginPath();
      ctx.arc(x + col * step + step / 2, y + row * step + step / 2, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** Sunburst rays behind the title, fanning from the band's centre. */
export function paintSunburst(ctx, cx, cy, w, h) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = 'rgba(255, 190, 80, 0.10)';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, -h * 0.03);
    ctx.lineTo(w, h * 0.03);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/** Film grain: sparse light and dark specks over the whole cover. */
export function paintGrain(ctx, w, h, seed) {
  let s = seed || 7;
  const next = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  const count = Math.floor((w * h) / 9000);
  for (let i = 0; i < count; i++) {
    const v = next();
    ctx.fillStyle = v > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(next() * w, next() * h, 1.6, 1.6);
  }
}

/** A soft dark vignette around the cover's edges. */
export function paintVignette(ctx, w, h) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.72);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(8, 4, 16, 0.42)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** The title block: scrim, halftone, gradient title, script subtitle. */
export function paintTitleBlock(ctx, state, w, h, band) {
  const bandTop = h * (1 - band);
  const scrim = ctx.createLinearGradient(0, bandTop - h * 0.06, 0, h);
  scrim.addColorStop(0, 'rgba(12, 6, 20, 0)');
  scrim.addColorStop(0.45, 'rgba(12, 6, 20, 0.55)');
  scrim.addColorStop(1, 'rgba(12, 6, 20, 0.82)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, bandTop - h * 0.06, w, h * band + h * 0.06);
  paintHalftone(ctx, 0, bandTop, w, h * band * 0.5);
  paintSunburst(ctx, w / 2, h, w, h * band);

  const title = (state.title || 'NEON SHORES').trim().toUpperCase();
  const sub = (state.subtitle || '').trim();
  const tag = (state.tagline || '').trim();

  const titleSize = fitSize(title, (s) => `${s}px ${COVER_TITLE_FONT}`, w * 0.92, h * 0.115, 24, ctx);
  const grad = ctx.createLinearGradient(0, bandTop + h * 0.02, 0, bandTop + h * band * 0.8);
  grad.addColorStop(0, '#ffe259');
  grad.addColorStop(0.5, '#ff9a3d');
  grad.addColorStop(1, '#ff2e88');
  ctx.font = `${titleSize}px ${COVER_TITLE_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#160818';
  ctx.lineWidth = Math.max(4, titleSize * 0.09);
  ctx.shadowColor = 'rgba(255, 46, 136, 0.55)';
  ctx.shadowBlur = titleSize * 0.16;
  const titleY = bandTop + h * band * (sub ? 0.52 : 0.55);
  ctx.strokeText(title, w / 2, titleY);
  ctx.fillStyle = grad;
  ctx.fillText(title, w / 2, titleY);
  ctx.shadowBlur = 0;

  if (sub) {
    const subSize = fitSize(sub, (s) => `${s}px ${COVER_SCRIPT_FONT}`, w * 0.7, h * 0.042, 16, ctx);
    ctx.font = `${subSize}px ${COVER_SCRIPT_FONT}`;
    ctx.fillStyle = '#ffe9f4';
    ctx.shadowColor = '#ff2e88';
    ctx.shadowBlur = subSize * 0.5;
    ctx.fillText(sub, w / 2, bandTop + h * band * 0.8);
    ctx.shadowBlur = 0;
  }
  if (tag) {
    const tagSize = Math.max(13, h * 0.016);
    ctx.font = `700 ${Math.round(tagSize)}px system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillText(tag.toUpperCase(), w / 2, h - tagSize * 1.1);
  }
}

/**
 * Draws the whole cover for `state` onto `canvas` at its own size.
 * state: { layout, grade, title, subtitle, tagline, badge, heat, photos,
 *   panels: [{ photo, zoom, fx, fy, label }] } where photos are images.
 */
export function drawCoverArt(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const layout = COVER_LAYOUTS[state.layout] || COVER_LAYOUTS.ninePanel;
  const grade = COVER_GRADES[state.grade] || COVER_GRADES.sunset;
  const band = layout.titleBand;

  ctx.fillStyle = '#14081c';
  ctx.fillRect(0, 0, w, h);

  const panels = layout.panels.map((base, i) => {
    const over = (state.panels && state.panels[i]) || {};
    return { ...base, ...over };
  });

  for (const panel of panels) {
    // Panels live in the region above the title band; the band is its own
    // strip at the foot, so the title never covers a face or a chip.
    const rect = {
      x: panel.x * w + (panel.x > 0 ? GUTTER / 2 : 0),
      y: panel.y * h * (1 - band) + (panel.y > 0 ? GUTTER / 2 : 0),
      w: panel.w * w - GUTTER,
      h: panel.h * h * (1 - band) - GUTTER,
    };
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    const img = state.photos[panel.photo];
    if (img) paintPanelPhoto(ctx, img, rect, panel, panel.zoom || 1);
    else { ctx.fillStyle = '#3a2340'; ctx.fillRect(rect.x, rect.y, rect.w, rect.h); }
    paintGrade(ctx, rect, grade);
    ctx.restore();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    paintPanelChip(ctx, rect, panel.label);
  }

  // Tilted Snapshot: one diagonal white split across the panel region.
  if (layout.tilt) {
    const regionH = h * (1 - band);
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(w * 0.54, 0);
    ctx.lineTo(w * 0.46, regionH);
    ctx.stroke();
    ctx.restore();
  }

  paintTitleBlock(ctx, state, w, h, band);
  if (state.badge) paintBadge(ctx, w, h, state.badge);
  paintHeatStars(ctx, w, h, state.heat || 5, h * (1 - band), band);
  paintGrain(ctx, w, h, 1234567);
  paintVignette(ctx, w, h);
}

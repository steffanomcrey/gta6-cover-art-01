// Vice Heat key-art engine: draws a multi-panel GTA-style poster cover.
// Layouts are defined in relative coordinates (0..1) of the art area above
// the title band. Every panel gets its own photo; the engine never repeats
// a photo while distinct photos remain (the caller assigns distinct photos).
// No Rockstar assets, no real people in the bundled samples.

export const SIZES = {
  square: { w: 1080, h: 1080, label: 'Square 1080 x 1080' },
  story: { w: 1080, h: 1350, label: 'Story 1080 x 1350' },
  wide: { w: 1920, h: 1080, label: 'Wide 1920 x 1080' },
};

// Four LARGE panels with varied sizes inside every layout. Coordinates are
// fractions of the art area (the part above the title band).
export const LAYOUTS = {
  'vice-heat': {
    label: 'Vice Heat',
    panels: [
      { x: 0.0, y: 0.0, w: 0.52, h: 1.0 },   // tall hero panel, left
      { x: 0.52, y: 0.0, w: 0.48, h: 0.46 }, // top right
      { x: 0.52, y: 0.46, w: 0.24, h: 0.54 }, // mid right, narrow
      { x: 0.76, y: 0.46, w: 0.24, h: 0.54 }, // bottom right
    ],
  },
  'hero-close': {
    label: 'Hero Close-Up',
    panels: [
      { x: 0.0, y: 0.0, w: 1.0, h: 0.66 },   // full-bleed hero
      { x: 0.0, y: 0.66, w: 0.4, h: 0.34 },  // supporting panel, wide
      { x: 0.4, y: 0.66, w: 0.3, h: 0.34 },  // supporting panel
      { x: 0.7, y: 0.66, w: 0.3, h: 0.34 },  // supporting panel
    ],
  },
  'quad-asym': {
    label: 'Quad Asymmetric',
    panels: [
      { x: 0.0, y: 0.0, w: 0.58, h: 0.55 },  // big top-left
      { x: 0.58, y: 0.0, w: 0.42, h: 0.55 }, // tall top-right
      { x: 0.0, y: 0.55, w: 0.36, h: 0.45 }, // bottom-left, narrow
      { x: 0.36, y: 0.55, w: 0.64, h: 0.45 }, // bottom-right, wide
    ],
  },
  'night-shift': {
    label: 'Night Shift',
    panels: [
      { x: 0.0, y: 0.0, w: 0.62, h: 0.5 },   // top-left, wide
      { x: 0.62, y: 0.0, w: 0.38, h: 0.5 },  // top-right
      { x: 0.0, y: 0.5, w: 0.38, h: 0.5 },   // bottom-left
      { x: 0.38, y: 0.5, w: 0.62, h: 0.5 },  // bottom-right, wide
    ],
  },
  'pier-pressure': {
    label: 'Pier Pressure',
    panels: [
      { x: 0.0, y: 0.0, w: 0.34, h: 0.5 },   // left column top
      { x: 0.0, y: 0.5, w: 0.34, h: 0.5 },   // left column bottom
      { x: 0.34, y: 0.0, w: 0.66, h: 0.52 }, // right hero, tall
      { x: 0.34, y: 0.52, w: 0.66, h: 0.48 }, // right footer panel
    ],
  },
};

// A layout's live panels are the ones with positive area.
export function livePanels(layoutId) {
  return LAYOUTS[layoutId].panels
    .map((p, i) => ({ ...p, index: i }))
    .filter((p) => p.w > 0 && p.h > 0);
}

export const GRADES = {
  'vice-sunset': {
    label: 'Vice Sunset',
    sky: ['rgba(255,110,60,0.30)', 'rgba(255,40,130,0.34)', 'rgba(90,20,120,0.30)'],
    tint: 'rgba(255,80,140,0.10)',
    neon: '#ff5fa2',
  },
  'neon-night': {
    label: 'Neon Night',
    sky: ['rgba(120,60,255,0.34)', 'rgba(255,40,180,0.30)', 'rgba(20,10,70,0.42)'],
    tint: 'rgba(90,40,255,0.12)',
    neon: '#37e6ff',
  },
  'golden-hour': {
    label: 'Golden Hour',
    sky: ['rgba(255,190,80,0.32)', 'rgba(255,120,40,0.26)', 'rgba(120,50,20,0.26)'],
    tint: 'rgba(255,170,60,0.10)',
    neon: '#ffd23f',
  },
  'palm-noir': {
    label: 'Palm Noir',
    sky: ['rgba(40,220,190,0.26)', 'rgba(255,60,160,0.28)', 'rgba(10,20,50,0.40)'],
    tint: 'rgba(40,200,180,0.10)',
    neon: '#3affc8',
  },
  original: {
    label: 'Original',
    sky: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)'],
    tint: 'rgba(0,0,0,0)',
    neon: '#ffffff',
  },
};

const GAP = 0.008; // panel gap as a fraction of the art width

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// Deterministic pseudo-random from a seed, for grain and halftone dots.
function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Paint one photo into a panel rect with cover fit, clamped so the
 *  subject (photo centre by default) never leaves the frame. */
export function paintPanel(ctx, photo, rect, crop) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (!photo) {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#3a1c52');
    g.addColorStop(1, '#160a24');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
    return;
  }
  const zoom = crop?.zoom ?? 1;
  const fx = clamp(crop?.fx ?? 0.5, 0, 1);
  const fy = clamp(crop?.fy ?? 0.5, 0, 1);
  const iw = photo.naturalWidth || photo.width;
  const ih = photo.naturalHeight || photo.height;
  const scale = Math.max(w / iw, h / ih) * zoom;
  const pw = iw * scale;
  const ph = ih * scale;
  // Centre the focal point (fx, fy of the photo) in the panel, clamped so
  // the photo always covers the panel.
  let dx = x + w / 2 - fx * pw;
  let dy = y + h / 2 - fy * ph;
  dx = clamp(dx, x + w - pw, x);
  dy = clamp(dy, y + h - ph, y);
  ctx.drawImage(photo, dx, dy, pw, ph);
  ctx.restore();
}

function fitFont(ctx, text, maxWidth, startSize, family, weight) {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (size > 10 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

function drawTrackedText(ctx, text, cx, y, tracking) {
  const widths = [...text].map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (text.length - 1);
  let px = cx - total / 2;
  ctx.textAlign = 'left';
  [...text].forEach((ch, i) => {
    ctx.fillText(ch, px, y);
    px += widths[i] + tracking;
  });
  return total;
}

function drawTrackedTextStroke(ctx, text, cx, y, tracking) {
  const widths = [...text].map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (text.length - 1);
  let px = cx - total / 2;
  ctx.textAlign = 'left';
  [...text].forEach((ch, i) => {
    ctx.strokeText(ch, px, y);
    px += widths[i] + tracking;
  });
}

/**
 * Draw the whole cover.
 * state: { layout, grade, title, tagline, panels: [{photo, zoom, fx, fy}] }
 * photos: array of loaded images, indexed by panel.photo.
 */
export function drawCover(ctx, W, H, state, photos) {
  const grade = GRADES[state.grade] || GRADES['vice-sunset'];
  const bandH = Math.round(H * 0.22);
  const artH = H - bandH;
  const gap = Math.max(2, Math.round(W * GAP));

  ctx.fillStyle = '#160a24';
  ctx.fillRect(0, 0, W, H);

  // Panels.
  const layout = LAYOUTS[state.layout] || LAYOUTS['vice-heat'];
  layout.panels.forEach((p, i) => {
    if (p.w <= 0 || p.h <= 0) return;
    const rect = {
      x: Math.round(p.x * W) + gap / 2,
      y: Math.round(p.y * artH) + gap / 2,
      w: Math.round(p.w * W) - gap,
      h: Math.round(p.h * artH) - gap,
    };
    const slot = state.panels[i];
    const photo = slot && slot.photo != null ? photos[slot.photo] ?? null : null;
    paintPanel(ctx, photo, rect, slot);
    // Thin light hairline so each panel reads as its own poster frame.
    ctx.strokeStyle = 'rgba(255,255,255,0.20)';
    ctx.lineWidth = Math.max(1, W * 0.0015);
    ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1);
  });

  // Sunset / neon grade wash over the art area.
  const wash = ctx.createLinearGradient(0, 0, 0, artH);
  grade.sky.forEach((c, i) => wash.addColorStop(i / (grade.sky.length - 1), c));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, artH);
  // Diagonal neon streak for extra energy.
  const streak = ctx.createLinearGradient(0, artH, W, 0);
  streak.addColorStop(0, 'rgba(0,0,0,0)');
  streak.addColorStop(0.5, grade.neon);
  streak.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.10;
  ctx.fillStyle = streak;
  ctx.fillRect(0, 0, W, artH);
  ctx.globalAlpha = 1;
  if (grade.tint !== 'rgba(0,0,0,0)') {
    ctx.fillStyle = grade.tint;
    ctx.fillRect(0, 0, W, artH);
  }

  // Neon edge glow on the art area.
  ctx.strokeStyle = grade.neon;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = Math.max(2, W * 0.004);
  ctx.strokeRect(gap / 2, gap / 2, W - gap, artH - gap);
  ctx.globalAlpha = 1;

  // Grain over the art area.
  const rnd = mulberry(1337 + W + H);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let i = 0; i < 900; i++) {
    ctx.fillRect(rnd() * W, rnd() * artH, 1.6, 1.6);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  for (let i = 0; i < 500; i++) {
    ctx.fillRect(rnd() * W, rnd() * artH, 1.6, 1.6);
  }

  // Vignette.
  const vg = ctx.createRadialGradient(W / 2, artH / 2, Math.min(W, artH) * 0.42, W / 2, artH / 2, Math.max(W, artH) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(10,0,20,0.45)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, artH);

  // ---- Title band ----
  const bandY = artH;
  const bandGrad = ctx.createLinearGradient(0, bandY, 0, H);
  bandGrad.addColorStop(0, '#2a0f3d');
  bandGrad.addColorStop(1, '#12061f');
  ctx.fillStyle = bandGrad;
  ctx.fillRect(0, bandY, W, bandH);
  ctx.fillStyle = grade.neon;
  ctx.globalAlpha = 0.8;
  ctx.fillRect(0, bandY, W, Math.max(2, H * 0.004));
  ctx.globalAlpha = 1;

  // Star row at the very top of the band.
  const starY = bandY + bandH * 0.10;
  const starSize = bandH * 0.13;
  ctx.fillStyle = '#ffd23f';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${starSize}px sans-serif`;
  const stars = '★ ★ ★ ★ ★';
  ctx.fillText(stars, W / 2, starY);
  // Halftone dots flanking the star row, as poster furniture.
  const dotR = Math.max(1.5, bandH * 0.012);
  const starW = ctx.measureText(stars).width;
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (let k = 0; k < 5; k++) {
    const dx = starW / 2 + W * 0.03 + k * dotR * 4;
    ctx.beginPath(); ctx.arc(W / 2 - dx, starY, dotR * (1 - k * 0.12), 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W / 2 + dx, starY, dotR * (1 - k * 0.12), 0, Math.PI * 2); ctx.fill();
  }
  ctx.textBaseline = 'alphabetic';

  // Giant gradient title, letter-spaced to fill the band.
  const title = (state.title || 'VICE HEAT').trim().toUpperCase() || 'VICE HEAT';
  const titleMaxW = W * 0.92;
  const titleSize = fitFont(ctx, title, titleMaxW, bandH * 0.48, 'Anton, "Arial Black", sans-serif', 400);
  const tracking = Math.max(0, (titleMaxW - ctx.measureText(title).width) / Math.max(1, title.length - 1)) * 0.35;
  const titleY = bandY + bandH * 0.58;
  const tg = ctx.createLinearGradient(0, titleY - titleSize, 0, titleY + titleSize * 0.25);
  tg.addColorStop(0, '#ffe259');
  tg.addColorStop(0.45, '#ff7e5f');
  tg.addColorStop(1, '#ff2e88');
  ctx.lineWidth = Math.max(2, titleSize * 0.06);
  ctx.strokeStyle = 'rgba(20,2,30,0.9)';
  ctx.lineJoin = 'round';
  drawTrackedTextStroke(ctx, title, W / 2, titleY, tracking);
  ctx.fillStyle = tg;
  drawTrackedText(ctx, title, W / 2, titleY, tracking);

  // Neon script subtitle.
  const tagline = (state.tagline || '').trim();
  if (tagline) {
    const subSize = fitFont(ctx, tagline, W * 0.8, bandH * 0.15, 'Pacifico, cursive', 400);
    ctx.font = `${subSize}px Pacifico, cursive`;
    ctx.textAlign = 'center';
    ctx.fillStyle = grade.neon;
    ctx.shadowColor = grade.neon;
    ctx.shadowBlur = subSize * 0.55;
    ctx.fillText(tagline, W / 2, bandY + bandH * 0.82);
    ctx.shadowBlur = 0;
  }

  // Billing micro-line along the foot of the band.
  ctx.fillStyle = 'rgba(255,255,255,0.62)';
  ctx.font = `${Math.max(9, Math.round(bandH * 0.055))}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('A VICE HEAT PRODUCTION  •  SQUARE 1080 × 1080  •  STORY 1080 × 1350  •  WIDE 1920 × 1080', W / 2, H - bandH * 0.06);
}

/** Count distinct photos used across the live panels of a layout. */
export function distinctPhotoCount(state) {
  const live = livePanels(state.layout);
  const used = new Set();
  live.forEach((p) => {
    const slot = state.panels[p.index];
    if (slot && slot.photo != null) used.add(slot.photo);
  });
  return { distinct: used.size, panels: live.length };
}

/**
 * Assign photos to panels: distinct photos first, never repeating while
 * distinct photos remain; only cycles once every photo is used.
 * `library` is the ordered list of photo indices available.
 */
export function autoFillPanels(layoutId, library) {
  const live = livePanels(layoutId);
  const panels = [];
  live.forEach((p, k) => {
    const photo = library.length ? library[k % library.length] : null;
    panels[p.index] = { photo, zoom: 1, fx: 0.5, fy: 0.5 };
  });
  // Keep slot array aligned with the layout's panel count.
  const total = LAYOUTS[layoutId].panels.length;
  for (let i = 0; i < total; i++) {
    if (!panels[i]) panels[i] = { photo: null, zoom: 1, fx: 0.5, fy: 0.5 };
  }
  return panels;
}

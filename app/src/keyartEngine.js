// keyartEngine.js — draws 4-panel key-art covers for the Vice Heat studio.
// Every cover is four LARGE panels plus one giant title: no busy grid, no
// per-panel tags, no badge. Photos are painted with a clamped cover fit so
// a face can never be pushed out of its panel by a focal point or a zoom.
//
// Panel focals are fractions of the photo itself (fx, fy in 0..1). The two
// bundled sample photos have their faces near the top: boulevard woman
// about (0.52, 0.16), pier man about (0.38, 0.20).

export const KEYART_LAYOUTS = {
  heroTop: {
    label: 'Hero Top',
    blurb: 'One giant hero photo over three wide panels, title band below.',
  },
  splitLeft: {
    label: 'Split Key',
    blurb: 'Giant left key panel, two stacked panels right, title across the foot.',
  },
  quadBanner: {
    label: 'Quad Banner',
    blurb: 'Four equal panels with a giant title band across the middle.',
  },
  stackRight: {
    label: 'Hero Stack',
    blurb: 'Giant hero left, three stacked panels right, title band below.',
  },
};

export const KEYART_GRADES = {
  viceSunset: {
    label: 'Vice Sunset',
    titleTop: '#ffe45c', titleBottom: '#ff2e88',
    washTop: 'rgba(255, 110, 60, 0.20)', washBottom: 'rgba(190, 20, 110, 0.34)',
    band: '#160a24', bandEdge: '#ffb347', ink: '#1c0b22',
  },
  neonNights: {
    label: 'Neon Nights',
    titleTop: '#7df9ff', titleBottom: '#ff2e88',
    washTop: 'rgba(0, 220, 255, 0.16)', washBottom: 'rgba(255, 30, 140, 0.32)',
    band: '#0a1226', bandEdge: '#37e6ff', ink: '#0a0f24',
  },
  goldenHour: {
    label: 'Golden Hour',
    titleTop: '#fff3b0', titleBottom: '#ff7a1a',
    washTop: 'rgba(255, 190, 60, 0.22)', washBottom: 'rgba(200, 90, 10, 0.30)',
    band: '#221204', bandEdge: '#ffd166', ink: '#241300',
  },
  palmDusk: {
    label: 'Palm Dusk',
    titleTop: '#e9b6ff', titleBottom: '#7a3cff',
    washTop: 'rgba(150, 80, 255, 0.18)', washBottom: 'rgba(10, 180, 160, 0.30)',
    band: '#120a26', bandEdge: '#b78bff', ink: '#14082a',
  },
  monoHeat: {
    label: 'Mono Heat',
    titleTop: '#ffffff', titleBottom: '#ff4d2e',
    washTop: 'rgba(255, 60, 30, 0.16)', washBottom: 'rgba(120, 0, 20, 0.34)',
    band: '#160606', bandEdge: '#ff6b4a', ink: '#1c0505',
  },
};

// Panel rectangles as fractions of the canvas [x, y, w, h]. The title band
// is returned separately so the engine can paint it after the photos.
export function keyPanelRects(layoutId, W, H) {
  const g = 6 / Math.max(W, H); // thin white gutter, scales with the cover
  switch (layoutId) {
    case 'splitLeft':
      return {
        panels: [
          [0, 0, 0.60, 0.80],
          [0.60 + g, 0, 0.40 - g, 0.26 - g / 2],
          [0.60 + g, 0.26 + g / 2, 0.40 - g, 0.26 - g / 2],
          [0.60 + g, 0.53 + g / 2, 0.40 - g, 0.27 - g / 2],
        ].map((r) => [r[0] * W, r[1] * H, r[2] * W, r[3] * H]),
        band: [0, 0.80 * H, W, 0.20 * H],
        bandCount: 4,
      };
    case 'quadBanner':
      return {
        panels: [
          [0, 0, 0.50 - g / 2, 0.40], [0.50 + g / 2, 0, 0.50 - g / 2, 0.40],
          [0, 0.60, 0.50 - g / 2, 0.40], [0.50 + g / 2, 0.60, 0.50 - g / 2, 0.40],
        ].map((r) => [r[0] * W, r[1] * H, r[2] * W, r[3] * H]),
        band: [0, 0.40 * H, W, 0.20 * H],
        bandCount: 4,
      };
    case 'stackRight':
      return {
        panels: [
          [0, 0, 0.58, 0.78],
          [0.58 + g, 0, 0.42 - g, 0.26 - g / 2],
          [0.58 + g, 0.26 + g / 2, 0.42 - g, 0.26 - g / 2],
          [0.58 + g, 0.52 + g / 2, 0.42 - g, 0.26 - g / 2],
        ].map((r) => [r[0] * W, r[1] * H, r[2] * W, r[3] * H]),
        band: [0, 0.78 * H, W, 0.22 * H],
        bandCount: 4,
      };
    case 'heroTop':
    default:
      return {
        panels: [
          [0, 0, 1, 0.58],
          [0, 0.58 + g, 1 / 3 - g / 2, 0.20 - g],
          [1 / 3 + g / 2, 0.58 + g, 1 / 3 - g, 0.20 - g],
          [2 / 3 + g / 2, 0.58 + g, 1 / 3 - g / 2, 0.20 - g],
        ].map((r) => [r[0] * W, r[1] * H, r[2] * W, r[3] * H]),
        band: [0, 0.78 * H, W, 0.22 * H],
        bandCount: 4,
      };
  }
}

// Default focal point for a bundled sample photo: the face sits near the
// top of the frame, so fy stays low and the face is never cropped away.
export function keyDefaultFocal(photoId) {
  if (photoId === 'pier') return { fx: 0.38, fy: 0.20 };
  if (photoId === 'boulevard') return { fx: 0.52, fy: 0.16 };
  return { fx: 0.5, fy: 0.30 };
}

// Paint one photo into one panel with a clamped cover fit: the photo is
// scaled to cover the panel, centred on its focal point, then clamped so
// no edge of the panel ever shows empty background.
export function keyPaintPanel(ctx, img, panel, focal, zoom) {
  const [px, py, pw, ph] = panel;
  if (!img) {
    ctx.fillStyle = '#241430';
    ctx.fillRect(px, py, pw, ph);
    return;
  }
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(pw / iw, ph / ih) * (zoom || 1);
  const dw = iw * scale;
  const dh = ih * scale;
  let dx = px + pw / 2 - (focal.fx || 0.5) * dw;
  let dy = py + ph / 2 - (focal.fy || 0.5) * dh;
  dx = Math.min(px, Math.max(px + pw - dw, dx));
  dy = Math.min(py, Math.max(py + ph - dh, dy));
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

// Warm sunset / neon wash over one painted panel. Kept light so faces stay
// readable: the grade is a tint, never a mask.
export function keyGradePanel(ctx, panel, grade) {
  const [px, py, pw, ph] = panel;
  const wash = ctx.createLinearGradient(px, py, px, py + ph);
  wash.addColorStop(0, grade.washTop);
  wash.addColorStop(1, grade.washBottom);
  ctx.fillStyle = wash;
  ctx.fillRect(px, py, pw, ph);
}

function keyFitFont(ctx, text, maxWidth, startSize, family) {
  let size = startSize;
  ctx.font = `${size}px ${family}`;
  while (size > 12 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${size}px ${family}`;
  }
  return size;
}

function keyDrawStars(ctx, cx, y, size, color) {
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${size}px sans-serif`;
  ctx.fillText('★ ★ ★ ★ ★', cx, y);
}

// The giant title: one line, Anton, sunset gradient fill, dark outline.
// Size is fitted to 94% of the band width and capped by the band height.
export function keyDrawTitleBlock(ctx, band, title, tagline, grade, W) {
  const [bx, by, bw, bh] = band;
  ctx.fillStyle = grade.band;
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = grade.bandEdge;
  ctx.fillRect(bx, by, bw, Math.max(3, bh * 0.03));
  // Star row at the very top of the band, clear of the title.
  keyDrawStars(ctx, bx + bw / 2, by + bh * 0.10, Math.max(11, bh * 0.06), '#ffd166');
  // Halftone dots along the top edge, kept out of the star row's middle.
  ctx.fillStyle = grade.bandEdge;
  const dotGap = Math.max(14, W * 0.02);
  for (let x = bx + dotGap; x < bx + bw - dotGap; x += dotGap) {
    if (x > bx + bw * 0.38 && x < bx + bw * 0.62) continue;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.arc(x, by + bh * 0.10, Math.max(2, W * 0.0035), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const text = (title || 'VICE HEAT').toUpperCase();
  const grad = ctx.createLinearGradient(0, by + bh * 0.18, 0, by + bh * 0.72);
  grad.addColorStop(0, grade.titleTop);
  grad.addColorStop(1, grade.titleBottom);
  // Letter-spaced so a short title still spans the band like a poster masthead.
  // Fit is measured with the final spacing applied, so it can never overflow.
  let size = keyFitFont(ctx, text, bw * 0.94, bh * 0.48, 'Anton, sans-serif');
  ctx.letterSpacing = `${Math.max(2, Math.round(size * 0.05))}px`;
  ctx.font = `${size}px Anton, sans-serif`;
  while (size > 12 && ctx.measureText(text).width > bw * 0.94) {
    size -= 2;
    ctx.font = `${size}px Anton, sans-serif`;
    ctx.letterSpacing = `${Math.max(2, Math.round(size * 0.05))}px`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = grade.ink;
  ctx.lineWidth = Math.max(3, size / 12);
  ctx.strokeText(text, bx + bw / 2, by + bh * 0.48);
  ctx.fillStyle = grad;
  ctx.fillText(text, bx + bw / 2, by + bh * 0.48);
  ctx.letterSpacing = '0px';
  const line = (tagline || '').trim();
  if (line) {
    const ls = keyFitFont(ctx, line.toUpperCase(), bw * 0.86, bh * 0.115, 'Anton, sans-serif');
    ctx.fillStyle = '#f5ead6';
    ctx.globalAlpha = 0.92;
    ctx.fillText(line.toUpperCase(), bx + bw / 2, by + bh * 0.80);
    ctx.globalAlpha = 1;
    void ls;
  }
  // One billing micro-line along the foot of the band: poster furniture
  // that names the export sizes, not a tag on any panel.
  ctx.fillStyle = '#c9b3e0';
  ctx.globalAlpha = 0.65;
  ctx.font = `${Math.max(9, bh * 0.055)}px Anton, sans-serif`;
  ctx.fillText('A KEY ART POSTER  •  MADE FROM YOUR PHOTOS  •  1080 × 1080  •  1080 × 1350  •  1920 × 1080', bx + bw / 2, by + bh * 0.93);
  ctx.globalAlpha = 1;
}

// Grain + vignette over the whole cover, drawn last and kept subtle.
export function keyFinishCover(ctx, W, H, seed) {
  let s = seed || 7;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#000000';
  const n = Math.floor((W * H) / 2600);
  for (let i = 0; i < n; i++) {
    const d = 1 + rnd() * 2;
    ctx.fillRect(rnd() * W, rnd() * H, d, d);
  }
  ctx.restore();
  const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.72);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}

// Draws the whole cover. `photos` maps photo id -> image element.
// `st` is the studio state: { layout, grade, title, tagline, panels: [{photo, fx, fy, zoom}] }.
export function drawKeyCover(canvas, photos, st) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const grade = KEYART_GRADES[st.grade] || KEYART_GRADES.viceSunset;
  const geo = keyPanelRects(st.layout || 'heroTop', W, H);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  const panels = st.panels || [];
  geo.panels.forEach((panel, i) => {
    const p = panels[i] || {};
    const img = photos[p.photo || 'boulevard'] || photos.boulevard || null;
    const focal = { fx: p.fx ?? 0.5, fy: p.fy ?? 0.3 };
    keyPaintPanel(ctx, img, panel, focal, p.zoom || 1);
    keyGradePanel(ctx, panel, grade);
  });
  keyDrawTitleBlock(ctx, geo.band, st.title, st.tagline, grade, W);
  keyFinishCover(ctx, W, H, 11);
}

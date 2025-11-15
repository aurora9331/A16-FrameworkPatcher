// theme-switcher.js
// Automatically detect browser/OS accent (best-effort) and generate tonal palette.
// Applies CSS vars used by style.css: --accent, --accent-dark, --accent-rgb,
// --bg, --bg-alt, --panel-bg, --panel-alt, --glass-bg, --glass-bg-alt, etc.
//
// Behavior:
// - Use prefers-color-scheme to decide light/dark base.
// - Try to detect system accent using CSS system keywords (support varies).
// - Convert detected RGB -> HSL and generate lighter/darker tones appropriate for the base.
// - Set CSS variables on :root so style.css picks them up.
// - Re-run on prefers-color-scheme changes, tab focus, visibilitychange.

(function () {
  const prefersDarkMQ = window.matchMedia('(prefers-color-scheme: dark)');

  // --- helpers ---
  function clamp(v, a = 0, b = 255) { return Math.min(b, Math.max(a, Math.round(v))); }

  function rgbStringToObj(rgbStr) {
    const m = rgbStr && rgbStr.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3] };
  }

  function rgbToHsl({ r, g, b }) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: +(s * 100).toFixed(1), l: +(l * 100).toFixed(1) };
  }

  function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    if (s === 0) {
      const v = Math.round(l * 255);
      return { r: v, g: v, b: v };
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const r = clamp(Math.round(hue2rgb(p, q, h + 1 / 3) * 255));
    const g = clamp(Math.round(hue2rgb(p, q, h) * 255));
    const b = clamp(Math.round(hue2rgb(p, q, h - 1 / 3) * 255));
    return { r, g, b };
  }

  function rgbObjToHex(o) {
    if (!o) return '#7fb8ff';
    return '#' + [o.r, o.g, o.b].map(x => clamp(x).toString(16).padStart(2, '0')).join('');
  }

  function hexFromHsl(h, s, l) {
    return rgbObjToHex(hslToRgb(h, s, l));
  }

  function rgbaFromHsl(h, s, l, a) {
    const rgb = hslToRgb(h, s, l);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
  }

  // Slightly adjust saturation/lightness safely
  function clampPercent(v, min = 0, max = 100) { return Math.min(max, Math.max(min, v)); }

  // --- system accent detection (best-effort) ---
  function detectSystemAccentColor() {
    // Try several system color keywords; supported mapping varies by browser/OS
    const keywords = ['AccentColor', 'AccentColorText', 'Highlight', 'HighlightText', 'CanvasText', 'ButtonText'];
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    el.style.top = '-9999px';
    el.style.width = '1px';
    el.style.height = '1px';
    document.body.appendChild(el);

    let best = null;
    for (const k of keywords) {
      try {
        el.style.color = k;
        const cs = getComputedStyle(el).color;
        const obj = rgbStringToObj(cs);
        if (!obj) continue;
        const isBlack = (obj.r === 0 && obj.g === 0 && obj.b === 0);
        const isWhite = (obj.r === 255 && obj.g === 255 && obj.b === 255);
        if (!isBlack && !isWhite) { best = obj; break; }
        else if (!best) best = obj;
      } catch (e) {
        // ignore
      }
    }
    document.body.removeChild(el);
    return best; // may be null
  }

  // --- Palette generation ---
  function generatePaletteFromAccent(rgb) {
    // rgb: {r,g,b}
    // Convert to HSL
    const hsl = rgb ? rgbToHsl(rgb) : { h: 214, s: 55, l: 55 }; // fallback blue-ish
    const h = hsl.h, s = clampPercent(hsl.s), l = clampPercent(hsl.l);

    // Decide base (dark or light)
    const isDarkBase = prefersDarkMQ.matches;

    // Accent (original, maybe increase saturation)
    const accentS = clampPercent(s * 1.05, 35, 100);
    const accentL = clampPercent(l * 1.0, 30, 70);
    const accentHex = hexFromHsl(h, accentS, accentL);

    // Accent dark
    const accentDarkL = clampPercent(accentL * 0.66, 10, 50);
    const accentDarkHex = hexFromHsl(h, clampPercent(accentS * 0.85), accentDarkL);

    // Build backgrounds/panels depending on base
    let bgHex, bgAltHex, panelHex, panelAltHex, glassBg, glassBgAlt;
    if (isDarkBase) {
      // Dark: produce deep, low-light backgrounds based on accent hue
      // Use low lightness and low saturation for large areas so text remains legible
      bgHex = hexFromHsl(h, clampPercent(accentS * 0.05, 0, 20), 6);       // very dark tint
      bgAltHex = hexFromHsl(h, clampPercent(accentS * 0.06, 0, 24), 10);    // slightly lighter
      panelHex = hexFromHsl(h, clampPercent(accentS * 0.18, 0, 40), 12);    // panel base
      panelAltHex = hexFromHsl(h, clampPercent(accentS * 0.22, 0, 44), 16); // panel alt
      glassBg = rgbaFromHsl(h, clampPercent(accentS * 0.08, 0, 40), 10, 0.50);
      glassBgAlt = rgbaFromHsl(h, clampPercent(accentS * 0.08, 0, 40), 14, 0.42);
    } else {
      // Light: produce very light backgrounds using accent hue with high lightness + low sat
      bgHex = hexFromHsl(h, clampPercent(accentS * 0.08, 0, 40), 98);       // almost white tint
      bgAltHex = hexFromHsl(h, clampPercent(accentS * 0.10, 0, 48), 96);    // slight difference
      panelHex = hexFromHsl(h, clampPercent(accentS * 0.28, 0, 60), 96);    // panel base
      panelAltHex = hexFromHsl(h, clampPercent(accentS * 0.40, 0, 70), 92); // panel alt
      glassBg = rgbaFromHsl(h, clampPercent(accentS * 0.20, 0, 60), 96, 0.72);
      glassBgAlt = rgbaFromHsl(h, clampPercent(accentS * 0.22, 0, 64), 98, 0.88);
    }

    // Provide accent rgb string
    const accentRgbStr = `${clamp(rgb ? rgb.r : Math.round(hsl.l * 2.55))},${clamp(rgb ? rgb.g : Math.round(hsl.l * 2.55))},${clamp(rgb ? rgb.b : Math.round(hsl.l * 2.55))}`;

    return {
      accentHex, accentDarkHex, accentRgbStr,
      bgHex, bgAltHex, panelHex, panelAltHex, glassBg, glassBgAlt
    };
  }

  // Apply palette to CSS variables
  function applyPalette(p) {
    const root = document.documentElement;
    if (!p) return;
    root.style.setProperty('--accent', p.accentHex);
    root.style.setProperty('--accent-dark', p.accentDarkHex);
    root.style.setProperty('--accent-rgb', p.accentRgbStr);

    // main backgrounds + panels
    root.style.setProperty('--bg', p.bgHex);
    root.style.setProperty('--bg-alt', p.bgAltHex);
    // panel/panel alt (you can reference these in style.css if desired)
    root.style.setProperty('--panel-bg', p.panelHex);
    root.style.setProperty('--panel-alt', p.panelAltHex);

    // glass variants (rgba)
    root.style.setProperty('--glass-bg', p.glassBg);
    root.style.setProperty('--glass-bg-alt', p.glassBgAlt);
    // ensure glass-border contrasts against glass background
    const glassBorder = (prefersDarkMQ.matches) ? 'rgba(255,255,255,0.06)' : 'rgba(11,19,48,0.06)';
    root.style.setProperty('--glass-border', glassBorder);
  }

  // --- detection + apply flow ---
  function applyAutoAccentAndTones() {
    // Determine base theme and enable glass class for frosted panels
    if (prefersDarkMQ.matches) {
      document.documentElement.classList.add('dark-glass');
      document.body.classList.add('glass');
      // remove opposite if present
      document.documentElement.classList.remove('light-glass');
    } else {
      document.documentElement.classList.add('light-glass');
      document.body.classList.add('glass');
      document.documentElement.classList.remove('dark-glass');
    }

    // Wait a tiny bit for computed styles to stabilize, then detect accent
    setTimeout(() => {
      const sysRgb = detectSystemAccentColor(); // may be null
      const palette = generatePaletteFromAccent(sysRgb);
      applyPalette(palette);
    }, 25);
  }

  // Run on load / ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    applyAutoAccentAndTones();
  } else {
    window.addEventListener('DOMContentLoaded', applyAutoAccentAndTones, { once: true });
  }

  // Re-run on system theme change
  try {
    const onPrefChange = () => applyAutoAccentAndTones();
    if (prefersDarkMQ.addEventListener) prefersDarkMQ.addEventListener('change', onPrefChange);
    else if (prefersDarkMQ.addListener) prefersDarkMQ.addListener(onPrefChange);
  } catch (e) {}

  // Re-run when tab regains focus or becomes visible (user might change OS theme while tab unfocused)
  window.addEventListener('focus', applyAutoAccentAndTones);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') applyAutoAccentAndTones();
  });

})();

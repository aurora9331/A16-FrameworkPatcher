// theme-switcher.js (debuggable)
// Automatically detect browser/OS accent and generate tones.
// Exposes helpers for debugging on window.__themeDebug

(function () {
  const prefersDarkMQ = window.matchMedia('(prefers-color-scheme: dark)');

  function clamp(v, a = 0, b = 255) { return Math.min(b, Math.max(a, Math.round(v))); }
  function rgbStringToObj(rgbStr) {
    const m = rgbStr && rgbStr.match(/rgba?\\(\\s*(\\d+)[,\\s]+(\\d+)[,\\s]+(\\d+)/i);
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3] };
  }
  function rgbToHsl({ r, g, b }) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
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
    if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v }; }
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
    return {
      r: clamp(Math.round(hue2rgb(p, q, h + 1 / 3) * 255)),
      g: clamp(Math.round(hue2rgb(p, q, h) * 255)),
      b: clamp(Math.round(hue2rgb(p, q, h - 1 / 3) * 255))
    };
  }
  function rgbObjToHex(o) {
    if (!o) return '#7fb8ff';
    return '#' + [o.r, o.g, o.b].map(x => clamp(x).toString(16).padStart(2, '0')).join('');
  }

  function detectSystemAccentColor() {
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
      } catch (e) {}
    }
    document.body.removeChild(el);
    return best;
  }

  function generatePaletteFromAccent(rgb) {
    const hsl = rgb ? rgbToHsl(rgb) : { h: 214, s: 55, l: 55 };
    const h = hsl.h, s = Math.min(100, Math.max(0, hsl.s)), l = Math.min(100, Math.max(0, hsl.l));
    const accentHex = rgbObjToHex(rgb || { r: 127, g: 184, b: 255 });
    const accentDarkHex = rgbObjToHex({ r: Math.round((rgb ? rgb.r : 127) * 0.7), g: Math.round((rgb ? rgb.g : 184) * 0.7), b: Math.round((rgb ? rgb.b : 255) * 0.7) });
    const isDarkBase = prefersDarkMQ.matches;

    if (isDarkBase) {
      const bgHex = hexFromHsl(h, Math.max(2, s * 0.05), 6);
      const bgAltHex = hexFromHsl(h, Math.max(3, s * 0.06), 10);
      const panelHex = hexFromHsl(h, Math.max(6, s * 0.18), 12);
      const panelAltHex = hexFromHsl(h, Math.max(8, s * 0.22), 16);
      const glassBg = rgbaFromHsl(h, Math.max(4, s * 0.08), 10, 0.50);
      const glassBgAlt = rgbaFromHsl(h, Math.max(5, s * 0.08), 14, 0.42);
      return { accentHex, accentDarkHex, accentRgb: `${rgb ? rgb.r : 127},${rgb ? rgb.g : 184},${rgb ? rgb.b : 255}`, bgHex, bgAltHex, panelHex, panelAltHex, glassBg, glassBgAlt };
    } else {
      const bgHex = hexFromHsl(h, Math.max(6, s * 0.08), 98);
      const bgAltHex = hexFromHsl(h, Math.max(8, s * 0.10), 96);
      const panelHex = hexFromHsl(h, Math.max(12, s * 0.28), 96);
      const panelAltHex = hexFromHsl(h, Math.max(16, s * 0.40), 92);
      const glassBg = rgbaFromHsl(h, Math.max(20, s * 0.20), 96, 0.72);
      const glassBgAlt = rgbaFromHsl(h, Math.max(22, s * 0.22), 98, 0.88);
      return { accentHex, accentDarkHex, accentRgb: `${rgb ? rgb.r : 127},${rgb ? rgb.g : 184},${rgb ? rgb.b : 255}`, bgHex, bgAltHex, panelHex, panelAltHex, glassBg, glassBgAlt };
    }

    // helpers inside
    function hexFromHsl(h, sVal, lVal) { return rgbObjToHex(hslToRgb(h, sVal, lVal)); }
    function rgbaFromHsl(h, sVal, lVal, a) { const rgb = hslToRgb(h, sVal, lVal); return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`; }
  }

  // Expose debug helpers so you can call them from the console
  window.__themeDebug = {
    detectSystemAccentColor,
    generatePaletteFromAccent,
    rgbToHsl,
    hslToRgb
  };

  function applyPalette(p) {
    if (!p) { console.warn('[theme-switcher] no palette to apply'); return; }
    const root = document.documentElement;
    root.style.setProperty('--accent', p.accentHex);
    root.style.setProperty('--accent-dark', p.accentDarkHex || p.accentDarkHex);
    root.style.setProperty('--accent-rgb', p.accentRgb);
    root.style.setProperty('--bg', p.bgHex);
    root.style.setProperty('--bg-alt', p.bgAltHex);
    root.style.setProperty('--panel-bg', p.panelHex);
    root.style.setProperty('--panel-alt', p.panelAltHex);
    root.style.setProperty('--glass-bg', p.glassBg);
    root.style.setProperty('--glass-bg-alt', p.glassBgAlt);
    root.style.setProperty('--glass-border', prefersDarkMQ.matches ? 'rgba(255,255,255,0.06)' : 'rgba(11,19,48,0.06)');
    console.log('[theme-switcher] applied palette', p);
  }

  function applyAutoAccentAndTones() {
    // base classes for CSS selectors that rely on them
    if (prefersDarkMQ.matches) {
      document.documentElement.classList.add('dark-glass');
      document.body.classList.add('glass');
      document.documentElement.classList.remove('light-glass');
    } else {
      document.documentElement.classList.add('light-glass');
      document.body.classList.add('glass');
      document.documentElement.classList.remove('dark-glass');
    }

    setTimeout(() => {
      const sysRgb = detectSystemAccentColor();
      console.log('[theme-switcher] detected system accent:', sysRgb);
      const palette = generatePaletteFromAccent(sysRgb);
      applyPalette(palette);
    }, 35);
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') applyAutoAccentAndTones();
  else window.addEventListener('DOMContentLoaded', applyAutoAccentAndTones, { once: true });

  try {
    const onPref = () => applyAutoAccentAndTones();
    if (prefersDarkMQ.addEventListener) prefersDarkMQ.addEventListener('change', onPref);
    else if (prefersDarkMQ.addListener) prefersDarkMQ.addListener(onPref);
  } catch (e) {}

  window.addEventListener('focus', applyAutoAccentAndTones);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') applyAutoAccentAndTones(); });

})();

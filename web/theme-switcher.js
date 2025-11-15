// theme-switcher.js
// Purpose: remove manual theme selection and automatically apply theme + accent color
// from the user's browser / OS when possible.
//
// Behavior:
// - On load (and when window gains focus or system color-scheme changes), detect
//   prefers-color-scheme and pick either dark-glass or light-glass as base.
// - Attempt to detect the system/browser accent color using CSS system keywords
//   (support varies by browser/OS). If detected, set --accent, --accent-dark and --accent-rgb CSS variables.
// - If detection fails, fall back to sensible defaults already defined in style.css.
// - Re-runs detection on focus/visibilitychange so changes in OS settings can reflect.

(function () {
  const prefersDarkMQ = window.matchMedia('(prefers-color-scheme: dark)');

  // helpers
  function clamp(v, a=0, b=255) { return Math.min(b, Math.max(a, Math.round(v))); }
  function rgbStringToObj(rgbStr) {
    // parse rgb(a) strings like "rgb(12, 34, 56)" or "rgba(12,34,56,1)"
    const m = rgbStr && rgbStr.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3] };
  }
  function rgbObjToHex(o) {
    if (!o) return '#7fb8ff';
    return '#' + [o.r, o.g, o.b].map(x => clamp(x).toString(16).padStart(2, '0')).join('');
  }
  function darkenRgbObj(o, factor = 0.7) {
    if (!o) return { r: 51, g: 85, b: 168 };
    return { r: clamp(o.r * factor), g: clamp(o.g * factor), b: clamp(o.b * factor) };
  }

  // Try to detect the system/browser accent color by assigning system CSS keywords.
  // Support varies; some browsers map these keywords to real accent/highlight colors.
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
        // ignore pure black or pure white unless nothing better found
        const isBlack = (obj.r === 0 && obj.g === 0 && obj.b === 0);
        const isWhite = (obj.r === 255 && obj.g === 255 && obj.b === 255);
        if (!isBlack && !isWhite) {
          best = obj;
          break;
        } else if (!best) {
          best = obj;
        }
      } catch (e) {
        // ignore invalid CSS keyword browser errors
      }
    }

    document.body.removeChild(el);
    return best; // may be null
  }

  function applyAccentObj(obj) {
    const root = document.documentElement;
    if (!obj) {
      // leave existing CSS var defaults (style.css) if detection fails
      return;
    }
    const hex = rgbObjToHex(obj);
    const dark = darkenRgbObj(obj, 0.72);
    root.style.setProperty('--accent', hex);
    root.style.setProperty('--accent-dark', rgbObjToHex(dark));
    root.style.setProperty('--accent-rgb', `${clamp(obj.r)},${clamp(obj.g)},${clamp(obj.b)}`);
  }

  function clearThemeClasses() {
    ['dark-blue','dark-green','dark-purple','dark-red','dark-glass',
     'light-blue','light-green','light-purple','light-red','light-glass'
    ].forEach(cls => document.documentElement.classList.remove(cls));
    document.body.classList.remove('glass');
  }

  function applyAutoThemeAndAccent() {
    clearThemeClasses();
    // choose base theme by prefers-color-scheme
    if (prefersDarkMQ.matches) {
      document.documentElement.classList.add('dark-glass');
      document.body.classList.add('glass');
    } else {
      document.documentElement.classList.add('light-glass');
      document.body.classList.add('glass');
    }

    // attempt accent detection shortly after DOM ready
    setTimeout(() => {
      const sysAccent = detectSystemAccentColor();
      applyAccentObj(sysAccent);
    }, 30);
  }

  // run on load
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    applyAutoThemeAndAccent();
  } else {
    window.addEventListener('DOMContentLoaded', applyAutoThemeAndAccent, { once: true });
  }

  // re-run when user switches system theme
  try {
    const handlePrefChange = () => applyAutoThemeAndAccent();
    if (prefersDarkMQ.addEventListener) prefersDarkMQ.addEventListener('change', handlePrefChange);
    else if (prefersDarkMQ.addListener) prefersDarkMQ.addListener(handlePrefChange);
  } catch (e) {}

  // re-run when tab gains focus (user might have changed OS accent/settings)
  window.addEventListener('focus', () => {
    applyAutoThemeAndAccent();
  });

  // also on visibilitychange when tab becomes visible
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') applyAutoThemeAndAccent();
  });

})();

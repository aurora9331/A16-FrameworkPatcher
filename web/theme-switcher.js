// theme-switcher.js
// Otomatik olarak tarayıcı/OS vurgusunu (mümkünse) alır ve tema değişkenlerine atar.
// Kullanım: sayfa açıldığında localStorage'daki 'selectedTheme' okunur.
// - 'system' seçiliyse prefers-color-scheme'e göre dark-glass veya light-glass uygulanır
//   ve ayrıca tarayıcı/OS vurgusu tespit edilirse --accent değişkeni ona göre güncellenir.
// - dark-glass / light-glass seçildiğinde body'ye 'glass' sınıfı eklenir.

(function () {
  const THEME_OPTIONS = [
    'system',
    'dark-blue','dark-green','dark-purple','dark-red','dark-glass',
    'light-blue','light-green','light-purple','light-red','light-glass'
  ];
  const prefersDarkMQ = window.matchMedia('(prefers-color-scheme: dark)');

  // UTILS ---------------------------------------------------------
  function clamp(v, a=0, b=255) { return Math.min(b, Math.max(a, Math.round(v))); }

  function rgbStringToObj(rgbStr) {
    // expects "rgb(r, g, b)" or "rgba(r, g, b, a)"
    const m = rgbStr.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3] };
  }

  function rgbObjToHex(o) {
    if (!o) return '#7fb8ff';
    return '#' + [o.r, o.g, o.b].map(x => clamp(x).toString(16).padStart(2, '0')).join('');
  }

  function darkenRgbObj(o, factor = 0.78) {
    if (!o) return { r: 51, g: 85, b: 168 };
    return { r: clamp(o.r * factor), g: clamp(o.g * factor), b: clamp(o.b * factor) };
  }

  // Tarayıcı/OS sistem rengini test eden fonksiyon
  function detectSystemAccentColor() {
    // Try several system color keywords. Support varies by browser/OS.
    const tests = [ 'Highlight', 'AccentColor', 'accent-color', 'ButtonText', 'CanvasText' ];
    // create off-screen element
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    el.style.top = '-9999px';
    el.style.width = '1px';
    el.style.height = '1px';
    document.body.appendChild(el);

    let detected = null;
    for (const t of tests) {
      try {
        el.style.color = t;
        const cs = getComputedStyle(el).color;
        const obj = rgbStringToObj(cs);
        // sanity check: some browsers return 'rgb(0, 0, 0)' as default mapping; ignore that unless it's real
        if (obj) {
          // Basic filter: ignore pure black/white placeholders unless nothing else found
          const isBlack = (obj.r === 0 && obj.g === 0 && obj.b === 0);
          const isWhite = (obj.r === 255 && obj.g === 255 && obj.b === 255);
          if (!isBlack && !isWhite) {
            detected = obj;
            break;
          } else if (!detected) {
            // keep last seen even if black/white as fallback if nothing better
            detected = obj;
          }
        }
      } catch (e) {
        // ignore invalid css keyword errors
      }
    }

    document.body.removeChild(el);
    return detected; // may be null
  }

  // Apply accent color into CSS vars
  function applyAccentObj(obj) {
    const root = document.documentElement;
    if (!obj) {
      // fallback accent if detection failed
      root.style.setProperty('--accent', '#7fb8ff');
      root.style.setProperty('--accent-dark', '#2d5f86');
      root.style.setProperty('--accent-rgb', '127,184,255');
      return;
    }
    const hex = rgbObjToHex(obj);
    const dark = darkenRgbObj(obj, 0.72);
    root.style.setProperty('--accent', hex);
    root.style.setProperty('--accent-dark', rgbObjToHex(dark));
    root.style.setProperty('--accent-rgb', `${clamp(obj.r)},${clamp(obj.g)},${clamp(obj.b)}`);
  }

  // Tema uygulama
  function clearAllThemeClasses() {
    ['dark-blue','dark-green','dark-purple','dark-red','dark-glass',
     'light-blue','light-green','light-purple','light-red','light-glass'
    ].forEach(cls => document.documentElement.classList.remove(cls));
    document.body.classList.remove('glass');
  }

  function applySystemThemeAndAccent() {
    clearAllThemeClasses();
    // use prefers-color-scheme to choose dark-glass or light-glass
    if (prefersDarkMQ.matches) {
      document.documentElement.classList.add('dark-glass');
      document.body.classList.add('glass');
    } else {
      document.documentElement.classList.add('light-glass');
      document.body.classList.add('glass');
    }

    // attempt to detect accent color and apply
    // delay slightly to ensure DOM/fonts/styles loaded on some browsers
    setTimeout(() => {
      const sysAccent = detectSystemAccentColor();
      applyAccentObj(sysAccent);
    }, 30);
  }

  function applyThemeByName(name) {
    clearAllThemeClasses();
    if (!name) return;
    if (name === 'system') {
      applySystemThemeAndAccent();
      return;
    }
    // if user selected a glass theme, enable glass class on body
    if (name === 'dark-glass') {
      document.documentElement.classList.add('dark-glass');
      document.body.classList.add('glass');
      // try to detect accent and override
      setTimeout(() => applyAccentObj(detectSystemAccentColor()), 30);
      return;
    }
    if (name === 'light-glass') {
      document.documentElement.classList.add('light-glass');
      document.body.classList.add('glass');
      setTimeout(() => applyAccentObj(detectSystemAccentColor()), 30);
      return;
    }
    // plain named theme
    document.documentElement.classList.add(name);
    // optionally detect and apply accent for all themes if you want, uncomment next line:
    // setTimeout(() => applyAccentObj(detectSystemAccentColor()), 30);
  }

  // initialize: read saved pref, apply, and wire up listener
  const saved = (function() { try { return localStorage.getItem('selectedTheme'); } catch (e) { return null; } })() || 'system';
  const select = document.getElementById('themeColor');
  if (select) {
    // make sure select value matches saved (if option present)
    if (Array.from(select.options).some(o => o.value === saved)) select.value = saved;
  }

  // initial apply
  applyThemeByName(saved);

  // if select changed by user
  if (select) {
    select.addEventListener('change', function () {
      const val = this.value;
      try { localStorage.setItem('selectedTheme', val); } catch (e) {}
      applyThemeByName(val);
    });
  }

  // react to system theme changes only when user chose 'system'
  try {
    const handlePrefChange = (e) => {
      const cur = (function(){ try { return localStorage.getItem('selectedTheme'); } catch (e) { return null; } })() || 'system';
      if (cur === 'system') applySystemThemeAndAccent();
    };
    if (prefersDarkMQ.addEventListener) prefersDarkMQ.addEventListener('change', handlePrefChange);
    else if (prefersDarkMQ.addListener) prefersDarkMQ.addListener(handlePrefChange);
  } catch (e) {
    // ignore
  }

})();

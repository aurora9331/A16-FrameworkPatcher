// theme-switcher.js
// Tema seçimini yönetir. Varsayılan tema localStorage'dan yüklenir.
// Eğer "dark-glass" seçilirse body'ye hem "dark-glass" hem "glass" sınıfı eklenir.

(function () {
  const THEMES = ['dark-blue','dark-green','dark-purple','dark-red','dark-glass'];
  const select = document.getElementById('themeSelect');

  function clearThemeClasses() {
    THEMES.forEach(t => document.body.classList.remove(t));
    document.body.classList.remove('glass');
  }

  function applyTheme(theme) {
    clearThemeClasses();
    if (!theme) return;
    if (theme === 'dark-glass') {
      document.body.classList.add('dark-glass');
      document.body.classList.add('glass');
    } else {
      document.body.classList.add(theme);
    }
  }

  if (select) {
    select.addEventListener('change', (e) => {
      const t = e.target.value;
      applyTheme(t);
      try { localStorage.setItem('selectedTheme', t); } catch (err) { /* ignore */ }
    });

    // sayfa yüklenince saklanmış tema varsa uygula
    try {
      const saved = localStorage.getItem('selectedTheme');
      if (saved) {
        if (Array.from(select.options).some(o => o.value === saved)) {
          select.value = saved;
          applyTheme(saved);
        } else {
          // geçersiz kayıt temizlenebilir
          localStorage.removeItem('selectedTheme');
        }
      } else {
        // eğer hiç kayıt yoksa select'te body sınıfına uyumlu bir default varsa uygula
        // (örnek: <body class="dark-red"> bulunduysa onu saklamaz, yalnızca localStorage bazlı kontrol)
      }
    } catch (err) {
      // ignore storage errors
    }
  } else {
    // Eğer select bulunmuyorsa yine de localStorage'dan tema uygula
    try {
      const saved = localStorage.getItem('selectedTheme');
      if (saved) applyTheme(saved);
    } catch (err) {}
  }

  // Hızlı debug: konsola "applyTheme('dark-glass')" yazarak test edebilirsiniz.
})();

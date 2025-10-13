const patchForm = document.getElementById('patchForm');
const modal = document.getElementById('modalResult');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalLoading = document.getElementById('modalLoading');
const modalSuccess = document.getElementById('modalSuccess');
const modalError = document.getElementById('modalError');
const modalClose = document.getElementById('modalClose');
const modalWorkflow = document.getElementById('modalWorkflow');

// Tema değiştirici fonksiyonları
document.addEventListener('DOMContentLoaded', function () {
    const themeSelect = document.getElementById('themeColor');
    const theme = localStorage.getItem('selectedTheme') || 'dark-blue';
    document.documentElement.classList.add(theme);
    if (themeSelect) themeSelect.value = theme;

    if (themeSelect) {
        themeSelect.addEventListener('change', function() {
            document.documentElement.classList.remove('dark-blue', 'dark-green', 'dark-purple', 'dark-red');
            document.documentElement.classList.add(this.value);
            localStorage.setItem('selectedTheme', this.value);
        });
    }
});

patchForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    modal.style.display = 'flex';
    modalTitle.textContent = 'İşlem Yapılıyor...';
    modalMessage.textContent = 'Patchleme iş akışı başlatılıyor, lütfen bekleyin.';
    modalLoading.style.display = 'block';
    modalSuccess.style.display = 'none';
    modalError.style.display = 'none';
    modalClose.style.display = 'none';
    modalWorkflow.style.display = 'none';

    const formData = new FormData(patchForm);
    const inputs = Object.fromEntries(formData);

    try {
        const response = await fetch("https://a16-framework-patcher.vercel.app/api/trigger-patch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(inputs)
        });
        const result = await response.json();

        modalLoading.style.display = 'none';
        if (response.ok) {
            modalSuccess.style.display = 'inline-block';
            modalTitle.textContent = 'Başarılı!';
            modalMessage.textContent = result.message || 'Patchleme iş akışı başarıyla başlatıldı.';
            modalWorkflow.style.display = 'inline-block';
        } else {
            modalError.style.display = 'inline-block';
            modalTitle.textContent = 'Hata!';
            modalMessage.textContent = result.message || 'Patchleme başlatılamadı.' + (result.error ? ' (' + JSON.stringify(result.error) + ')' : '');
            modalWorkflow.style.display = 'none';
        }
        modalClose.style.display = 'inline-block';
    } catch (err) {
        modalLoading.style.display = 'none';
        modalError.style.display = 'inline-block';
        modalTitle.textContent = 'Bağlantı Hatası!';
        modalMessage.textContent = err.message || 'Patchleme başlatılamadı.';
        modalClose.style.display = 'inline-block';
        modalWorkflow.style.display = 'none';
    }
});

modalClose.addEventListener('click', function() {
    modal.style.display = 'none';
});

modalWorkflow.onclick = function() {
    window.open('https://github.com/aurora9331/A16-FrameworkPatcher/actions', '_blank');
};

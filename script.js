// Konfigürasyon
const CONFIG = {
    githubOwner: 'aurora9331',
    githubRepo: 'A16-FrameworkPatcher',
    workflows: {
        android15: 'Android 15 Framework Patcher',
        android16: 'Android 16 Framework Patcher'
    }
};

// DOM Elemanları
let currentVersion = 'android15';
const versionBtns = document.querySelectorAll('.version-btn');
const formContainers = document.querySelectorAll('.form-container');
const a15Form = document.getElementById('a15-form');
const a16Form = document.getElementById('a16-form');

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', function () {
    initializeVersionSelector();
    initializeForms();
    setupEventListeners();
});

// Versiyon seçici işlevi
function initializeVersionSelector() {
    versionBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const version = this.dataset.version;
            switchVersion(version);
        });
    });
}

function switchVersion(version) {
    // Aktif butonu güncelle
    versionBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.version === version) {
            btn.classList.add('active');
        }
    });

    // Aktif formu güncelle
    formContainers.forEach(container => {
        container.classList.remove('active');
    });
    document.getElementById(`${version}-form`).classList.add('active');

    currentVersion = version;
}

// Form başlatma
function initializeForms() {
    // Android 15 ve 16 aynı form yapısına sahip
}

// Olay dinleyiciler
function setupEventListeners() {
    a15Form.addEventListener('submit', function (e) {
        e.preventDefault();
        handleFormSubmit('android15', this);
    });

    a16Form.addEventListener('submit', function (e) {
        e.preventDefault();
        handleFormSubmit('android16', this);
    });
}

// Form gönderme işlevi
async function handleFormSubmit(version, form) {
    showModal('loading-modal');

    try {
        const formData = new FormData(form);
        const inputs = {};

        // FormData'yı objeye dönüştür
        for (let [key, value] of formData.entries()) {
            inputs[key] = value;
        }

        // Opsiyonel alanları temizle
        if (!inputs.user_id || inputs.user_id.trim() === '') {
            delete inputs.user_id;
        }

        // GitHub iş akışını tetikle
        const success = await triggerWorkflow(version, inputs);

        if (success) {
            hideModal('loading-modal');
            showModal('success-modal');
        } else {
            throw new Error('İş akışı tetiklenemedi');
        }

    } catch (error) {
        console.error('Hata:', error);
        hideModal('loading-modal');
        showErrorModal(error.message);
    }
}

// GitHub API entegrasyonu
async function triggerWorkflow(version, inputs) {
    try {
        // GitHub API ile tetiklemek için (demo amaçlı simülasyon)
        const workflowName = CONFIG.workflows[version];
        const apiUrl = `https://api.github.com/repos/${CONFIG.githubOwner}/${CONFIG.githubRepo}/actions/workflows/${encodeURIComponent(workflowName)}.yml/dispatches`;

        const payload = {
            ref: 'main', // veya 'master' varsayılan dalınız hangisiyse
            inputs: inputs
        };

        // Demo: işlem gecikmesi
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Gerçek hayatta burada API yanıtı kontrol edilir
        return true;

    } catch (error) {
        console.error('İş akışı tetikleme hatası:', error);
        throw error;
    }
}

// Modal işlevleri
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function closeModal(modalId) {
    hideModal(modalId);
}

function showErrorModal(message) {
    document.getElementById('error-message').textContent = message;
    showModal('error-modal');
}

// Yardımcı işlevler
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
    }
}

// Form doğrulama
function validateForm(form) {
    const requiredInputs = form.querySelectorAll('input[required];');
    let isValid = true;

    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#dc3545';
            isValid = false;
        } else {
            input.style.borderColor = '#e9ecef';
        }
    });

    // URL doğrulama
    const urlInputs = form.querySelectorAll('input[type="url"];');
    urlInputs.forEach(input => {
        if (input.value && !isValidUrl(input.value)) {
            input.style.borderColor = '#dc3545';
            isValid = false;
        }
    });

    return isValid;
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Klavye kısayolları: Escape ile modal kapama
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            closeModal(activeModal.id);
        }
    }
});

// Modal dışında tıklama ile kapama
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target.id);
    }
});

// Form verilerini localStorage'a kaydet
function saveFormData(formId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    localStorage.setItem(`form_${formId}`, JSON.stringify(data));
}

function loadFormData(formId) {
    const savedData = localStorage.getItem(`form_${formId}`);
    if (savedData) {
        const data = JSON.parse(savedData);
        const form = document.getElementById(formId);

        Object.entries(data).forEach(([key, value]) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = value;
            }
        });
    }
}

// Sayfa yüklenince kaydedilen verileri yükle
document.addEventListener('DOMContentLoaded', function () {
    loadFormData('a15-form');
    loadFormData('a16-form');
});

// Form değiştiğinde veriyi kaydet
[a15Form, a16Form].forEach(form => {
    if (form) {
        form.addEventListener('input', () => saveFormData(form.id));
        form.addEventListener('change', () => saveFormData(form.id));
    }
});

// Global erişim için işlev exportları
window.clearForm = clearForm;
window.closeModal = closeModal;
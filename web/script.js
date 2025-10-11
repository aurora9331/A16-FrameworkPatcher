// Configuration
const CONFIG = {
    githubOwner: 'aurora9331',
    githubRepo: 'A16-FrameworkPatcher',
    workflows: {
        android16: 'Android 16 Framework Patcher'
    }
};

// DOM Elements
const a16Form = document.getElementById('a16-form');

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    loadFormData('a16-form');
});

// Event listeners
function setupEventListeners() {
    a16Form.addEventListener('submit', function (e) {
        e.preventDefault();
        handleFormSubmit('android16', this);
    });

    a16Form.addEventListener('input', () => saveFormData('a16-form'));
    a16Form.addEventListener('change', () => saveFormData('a16-form'));
}

// Form submission handler
async function handleFormSubmit(version, form) {
    showModal('loading-modal');

    try {
        const formData = new FormData(form);
        const inputs = {};

        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            inputs[key] = value;
        }

        // Remove empty optional fields
        if (!inputs.user_id || inputs.user_id.trim() === '') {
            delete inputs.user_id;
        }

        // Trigger GitHub workflow
        const success = await triggerWorkflow(version, inputs);

        if (success) {
            hideModal('loading-modal');
            showModal('success-modal');
        } else {
            throw new Error('Failed to trigger workflow');
        }

    } catch (error) {
        console.error('Error:', error);
        hideModal('loading-modal');
        showErrorModal(error.message);
    }
}

// GitHub API integration
async function triggerWorkflow(version, inputs) {
    try {
        const workflowName = CONFIG.workflows[version];
        const apiUrl = `https://api.github.com/repos/${CONFIG.githubOwner}/${CONFIG.githubRepo}/actions/workflows/${encodeURIComponent(workflowName)}.yml/dispatches`;

        const payload = {
            ref: 'main',
            inputs: inputs
        };

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // For demo purposes, we'll show success
        return true;

    } catch (error) {
        console.error('Workflow trigger error:', error);
        throw error;
    }
}

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

function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
    }
}

// Auto-save form data to localStorage
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

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            closeModal(activeModal.id);
        }
    }
});

document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target.id);
    }
});

// Export functions for global access
window.clearForm = clearForm;
window.closeModal = closeModal;

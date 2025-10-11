// Dikkat: Token'ın client tarafında olması güvenlik açısından önerilmez!
// Sadece test amaçlıdır. Gerçek kullanımda backend proxy gerekir.

async function triggerWorkflow(inputs) {
    const token = "GITHUB_PERSONAL_ACCESS_TOKEN"; // Buraya kendi tokenını yazmalısın
    const url = "https://api.github.com/repos/aurora9331/A16-FrameworkPatcher/actions/workflows/patcher.yml/dispatches";
    const body = {
        ref: "main",
        inputs: inputs
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (response.ok) {
        document.getElementById("success-modal").style.display = "block";
    } else {
        document.getElementById("error-modal").style.display = "block";
        document.getElementById("error-message").innerText = await response.text();
    }
}

// index.html'deki form submit edildiğinde tetiklenmesi için:
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('a16-form');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const inputs = {
                framework_jar_url: document.getElementById('a16-framework-url').value,
                services_jar_url: document.getElementById('a16-services-url').value,
                miui_services_jar_url: document.getElementById('a16-miui-services-url').value,
                android_api_level: document.getElementById('a16-api-level').value,
                custom_device_name: document.getElementById('a16-device-name').value,
                custom_version: document.getElementById('a16-version-name').value
            };
            await triggerWorkflow(inputs);
        });
    }
});

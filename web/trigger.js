async function triggerWorkflow(inputs) {
    const token = "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"; // Kendi tokenını buraya ekle
    const url = "https://api.github.com/repos/aurora9331/A16-FrameworkPatcher/actions/workflows/patcher.yml/dispatches";
    const body = {
        ref: "main",
        inputs: {
            framework_jar_url: inputs.framework_jar_url,
            services_jar_url: inputs.services_jar_url,
            miui_services_jar_url: inputs.miui_services_jar_url,
            android_api_level: inputs.android_api_level,
            custom_device_name: inputs.custom_device_name,
            custom_version: inputs.custom_version
        }
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
        document.getElementById("error-modal").style.display = "none";
    } else {
        document.getElementById("success-modal").style.display = "none";
        document.getElementById("error-modal").style.display = "block";
        document.getElementById("error-message").innerText = await response.text();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('a16-form');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const inputs = {
                framework_jar_url: document.getElementById('framework_jar_url').value,
                services_jar_url: document.getElementById('services_jar_url').value,
                miui_services_jar_url: document.getElementById('miui_services_jar_url').value,
                android_api_level: document.getElementById('android_api_level').value,
                custom_device_name: document.getElementById('custom_device_name').value,
                custom_version: document.getElementById('custom_version').value
            };
            await triggerWorkflow(inputs);
        });
    }
});

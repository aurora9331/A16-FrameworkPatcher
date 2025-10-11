// Sadece kendin için, private repoda ve paylaşmadan kullan!
async function triggerWorkflow(inputs) {
    const token = "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"; // Kendi GitHub tokenını buraya ekle
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

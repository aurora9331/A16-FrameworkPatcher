// Octokit ile workflow tetikleme scripti
const { Octokit } = require("octokit");

// GITHUB_TOKEN'ı güvenli şekilde .env'den veya ortamdan alın
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function triggerWorkflow(inputs) {
  const octokit = new Octokit({ auth: GITHUB_TOKEN });
  await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
    owner: "aurora9331",
    repo: "A16-FrameworkPatcher",
    workflow_id: "patcher.yml",
    ref: "main",
    inputs: {
      framework_jar_url: inputs.frameworkJarUrl,
      services_jar_url: inputs.servicesJarUrl,
      miui_services_jar_url: inputs.miuiServicesJarUrl,
      android_api_level: inputs.androidApiLevel,
      custom_device_name: inputs.customDeviceName,
      custom_version: inputs.customVersion
    }
  });
}

// Örnek kullanım: CLI veya web'den inputları alıp tetikleyebilirsiniz
// triggerWorkflow({
//   frameworkJarUrl: "...",
//   servicesJarUrl: "...",
//   miuiServicesJarUrl: "...",
//   androidApiLevel: "...",
//   customDeviceName: "...",
//   customVersion: "..."
// });

module.exports = { triggerWorkflow };
const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Yalnızca POST desteklenir." })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Geçersiz JSON." })
    };
  }

  const {
    framework_jar_url,
    services_jar_url,
    miui_services_jar_url,
    android_api_level,
    custom_device_name,
    custom_version
  } = body;

  if (
    !framework_jar_url ||
    !services_jar_url ||
    !miui_services_jar_url ||
    !android_api_level ||
    !custom_device_name ||
    !custom_version
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Tüm alanlar zorunlu!" })
    };
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const owner = "aurora9331";
  const repo = "A16-FrameworkPatcher";
  const workflow_id = ".github/workflows/patcher.yml";

  const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${encodeURIComponent(workflow_id)}/dispatches`;

  const response = await fetch(githubApiUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GITHUB_TOKEN}`,
      "Accept": "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ref: "main",
      inputs: {
        framework_jar_url,
        services_jar_url,
        miui_services_jar_url,
        android_api_level,
        custom_device_name,
        custom_version
      }
    })
  });

  if (response.ok) {
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Workflow başlatıldı!" })
    };
  } else {
    const err = await response.text();
    return {
      statusCode: response.status,
      body: JSON.stringify({ error: "GitHub API Hatası", details: err })
    };
  }
};

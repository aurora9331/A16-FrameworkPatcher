const { Octokit } = require("octokit");

module.exports = async (req, res) => {
  // Sadece POST isteklerini kabul et
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  // Bilgileri body'den al
  const {
    frameworkJarUrl,
    servicesJarUrl,
    miuiServicesJarUrl,
    androidApiLevel,
    customDeviceName,
    customVersion
  } = req.body;

  // Token'ı Vercel ortam değişkeninden al
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  if (!GITHUB_TOKEN) {
    res.status(500).json({ message: "GitHub token not set in environment." });
    return;
  }

  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  try {
    await octokit.request('POST /repos/aurora9331/A16-FrameworkPatcher/actions/workflows/patcher.yml/dispatches', {
      ref: "main",
      inputs: {
        framework_jar_url: frameworkJarUrl,
        services_jar_url: servicesJarUrl,
        miui_services_jar_url: miuiServicesJarUrl,
        android_api_level: androidApiLevel,
        custom_device_name: customDeviceName,
        custom_version: customVersion
      }
    });
    res.status(200).json({ message: "Patchleme başarılı şekilde başlatıldı!" });
  } catch (error) {
    res.status(500).json({ message: "Hata oluştu: " + error.message });
  }
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) {
    res.status(500).json({ message: 'GitHub token not set in environment.' });
    return;
  }

  // GÖNDERİLEN input anahtarlarını workflow ile birebir al!
  const {
    framework_jar_url,
    services_jar_url,
    miui_services_jar_url,
    android_api_level,
    custom_device_name,
    custom_version
  } = req.body;

  if (
    !framework_jar_url ||
    !services_jar_url ||
    !miui_services_jar_url ||
    !android_api_level ||
    !custom_device_name ||
    !custom_version
  ) {
    res.status(400).json({ message: 'Eksik veri, lütfen tüm alanları doldurun.' });
    return;
  }

  const owner = 'aurora9331';
  const repo = 'A16-FrameworkPatcher';
  const workflow_id = 'patcher.yml';

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            framework_jar_url,
            services_jar_url,
            miui_services_jar_url,
            android_api_level,
            custom_device_name,
            custom_version
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      res.status(500).json({ message: 'GitHub Actions tetiklenemedi.', error });
      return;
    }

    res.status(200).json({ message: 'Patchleme iş akışı başarıyla başlatıldı!' });
  } catch (err) {
    res.status(500).json({ message: 'İç sunucu hatası.', error: err.message });
  }
};

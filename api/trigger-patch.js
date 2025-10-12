module.exports = async (req, res) => {
  // CORS headers ekle
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight (OPTIONS) isteğine yanıt ver
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Sadece POST isteği kabul edilsin
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  // GITHUB_TOKEN ortam değişkeni kontrolü
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) {
    res.status(500).json({ message: 'GitHub token not set in environment.' });
    return;
  }

  // Gönderilen datayı al
  const {
    frameworkJarUrl,
    servicesJarUrl,
    miuiServicesJarUrl,
    androidApiLevel,
    customDeviceName,
    customVersion
  } = req.body;

  // Zorunlu alanlar kontrolü
  if (
    !frameworkJarUrl ||
    !servicesJarUrl ||
    !miuiServicesJarUrl ||
    !androidApiLevel ||
    !customDeviceName ||
    !customVersion
  ) {
    res.status(400).json({ message: 'Eksik veri, lütfen tüm alanları doldurun.' });
    return;
  }

  // Github Actions workflow tetikleme
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
            frameworkJarUrl,
            servicesJarUrl,
            miuiServicesJarUrl,
            androidApiLevel,
            customDeviceName,
            customVersion
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

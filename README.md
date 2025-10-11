# Framework Patcher Web Sitesi

Bu GitHub Pages web sitesi, Android framework patchleme iş akışlarını kolayca tetiklemek için kullanıcı dostu bir arayüz sunar.

## Özellikler

- **Çift Versiyon Desteği**: Android 15 ve Android 16 için ayrı arayüzler
- **Basitleştirilmiş Formlar**: Her iki Android sürümü için 3 JAR URL'si gerekir (framework.jar, services.jar, miui-services.jar)
- **Dinamik Form Doğrulama**: Giriş alanları için anlık doğrulama
- **Responsive Tasarım**: Masaüstü ve mobil cihazlarda çalışır
- **Otomatik Kayıt**: Form verileri otomatik olarak tarayıcı localStorage'a kaydedilir
- **Modern Arayüz**: Temiz ve profesyonel görünüm, animasyonlarla birlikte

## Nasıl Kullanılır

### Android 15 için:
1. "Android 15" sekmesini seçin
2. Gerekli alanları doldurun:
    - **API Seviyesi**: Varsayılan 35
    - **Cihaz Kod Adı**: Cihazınızın kod adı (örn: rothko)
    - **Sürüm Adı**: MIUI/ROM sürümü (örn: OS2.0.200.33)
    - **Telegram Kullanıcı ID**: Opsiyonel, bildirimler için
3. Üç JAR dosyasının URL'lerini girin:
    - Framework.jar Linki
    - Services.jar Linki
    - MIUI Services.jar Linki
4. "Patchlemeyi Başlat" butonuna tıklayın

### Android 16 için:
1. "Android 16" sekmesini seçin
2. Gerekli alanları doldurun:
    - **API Seviyesi**: Varsayılan 36
    - **Cihaz Kod Adı**: Cihazınızın kod adı
    - **Sürüm Adı**: ROM/firmware sürümü
    - **Telegram Kullanıcı ID**: Opsiyonel, bildirimler için
3. Üç JAR dosyasının URL'lerini girin:
    - Framework.jar Linki
    - Services.jar Linki
    - MIUI Services.jar Linki
4. "Patchlemeyi Başlat" butonuna tıklayın

## Temel Değişiklikler

- **Android 16 Basitleştirildi**: Artık her iki sürümde de 3 JAR dosyası gerekli
- **Tutarlı Deneyim**: Her iki Android sürümünde aynı form yapısı
- **Tüm JAR'lar Zorunlu**: Her iki iş akışı için üç JAR linki gereklidir

## Yayınlama

Bu site, `main` dalına `web/` klasörüne yapılan değişiklikler ile otomatik olarak GitHub Pages'da yayınlanır.

### Manuel Yayınlama

1. `web/` klasörüne değişiklikleri pushlayın
2. GitHub Actions workflow otomatik olarak yayına alacak
3. Site adresi: `https://aurora9331.github.io/A16-FrameworkPatcher/`

## Teknik Detaylar

### Dosya Yapısı
```
web/
├── index.html          # Ana HTML sayfası
├── styles.css          # CSS dosyası
├── script.js           # JavaScript fonksiyonları
└── README.md           # Bu dosya
```

### Ana Özellikler
- **Versiyon Geçişi**: Android 15 ve 16 arayüzleri arasında geçiş
- **Form Doğrulama**: Gerekli alanlar ve URL formatı için kontrol
- **Responsive Tasarım**: Mobil uyumlu
- **Modal Diyaloglar**: Yükleme, başarı ve hata durumları
- **Local Storage**: Kullanıcı kolaylığı için otomatik veri kaydı

### Tarayıcı Uyumluluğu
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Geliştirme

Web sitesini değiştirmek için:
1. `web/` klasöründeki dosyaları düzenleyin
2. Yerel olarak `index.html` dosyasını tarayıcıda açarak test edin
3. Değişiklikleri commitleyip pushlayın, yayın tetiklenecektir

### Yerel Test
```bash
# Yerel test için basit HTTP sunucusu
python3 -m http.server 8000
# veya
npx serve web
```

## Workflow Entegrasyonu

Website aşağıdaki GitHub Actions iş akışları ile çalışır:
- `android15.yml` - Android 15 Framework Patcher
- `android16.yml` - Android 16 Framework Patcher

Her iki iş akışı da:
- Telegram bildirimleri için opsiyonel `user_id` parametresi içerir
- Üç JAR linki gerektirir
- Tüm JAR dosyalarını otomatik olarak patchler

## Destek

Sorularınız ve sorunlarınız için:
- GitHub Issues: [A16-FrameworkPatcher Issues](https://github.com/aurora9331/A16-FrameworkPatcher/issues)
- Destek: [Buy Me a Coffee](https://buymeacoffee.com/jefino)

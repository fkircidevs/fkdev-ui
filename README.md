<div align="center">

# fkdev *UI*

**Monokrom, Liquid Glass görünümlü tasarım sistemi.**
37 bileşen, 95 ikon, form doğrulama ve hareket: tek CSS + tek JS dosyası, bağımlılık yok.

[![Belgeler](https://img.shields.io/badge/belgeler-ui.fkdev.sbs-0a0a0a?style=for-the-badge)](https://ui.fkdev.sbs)
[![Sürüm](https://img.shields.io/badge/s%C3%BCr%C3%BCm-v2.4.1-0a0a0a?style=for-the-badge)](https://ui.fkdev.sbs/surumler/)
[![Boyut](https://img.shields.io/badge/brotli-10%2C6%20KB%20CSS%20%C2%B7%206%2C1%20KB%20JS-0a0a0a?style=for-the-badge)](https://ui.fkdev.sbs/cdn/)
[![Lisans](https://img.shields.io/badge/lisans-MIT-0a0a0a?style=for-the-badge)](LICENSE)

[Belgeler](https://ui.fkdev.sbs) · [Başlangıç](https://ui.fkdev.sbs/baslangic/) · [Bileşenler](https://ui.fkdev.sbs/bilesenler/) · [CDN](https://ui.fkdev.sbs/cdn/) · [Admin demo](https://admin.fkdev.sbs)

</div>

---

## Tek satırda bağlan

```html
<link rel="stylesheet" href="https://ui.fkdev.sbs/v2.4.1/fkdev-ui.min.css" integrity="sha384-ywbvrnvLBhspdz061sb4+HVmL4bAnbhyuwKyDq0qCBVdEeLw2Le+aT+M0XhiumnM" crossorigin="anonymous">
<link rel="stylesheet" href="https://ui.fkdev.sbs/v2.4.1/fkdev-icons.css" integrity="sha384-7yUKhYWWrNB988JPR7B5hWqmWKk50ryeZ/b688YUSNn02PjgfTkhgNDnoRUX0w4V" crossorigin="anonymous">
<script src="https://ui.fkdev.sbs/v2.4.1/fkdev-ui.min.js" integrity="sha384-M00Zh34vyulzgDN4UvQcDJteSAYjql+zh1KP3B8lMfPikmAoJLDzbKnjWiFHPsvT" crossorigin="anonymous" defer></script>
```

```html
<button class="fk-btn fk-btn-primary" data-fk-toast="Kaydedildi" data-fk-type="success">
  <i class="fk-i fk-i-check" aria-hidden="true"></i>Kaydet
</button>
```

Hepsi bu. Derleme yok, npm yok, framework yok.

## Neden fkdev UI?

|  |  |
|---|---|
| **Liquid Glass** | Cam yüzeyler, yumuşak gölgeler, monokrom palet; açık ve koyu temada aynı zarafet. |
| **Hafif** | `fkdev-ui.min.css` 10,6 KB, `fkdev-ui.min.js` 6,1 KB (brotli). |
| **37 bileşen** | Accordion'dan Tooltip'e: modal, drawer, tablo, sekmeler, toast, zaman çizelgesi, fiyat kartı… |
| **Formlar** | Doğrulama, şifre göster/gizle, OTP, stepper, etiket girişi, karakter sayacı, dosya yükleme. |
| **Hareket** | Belirme, kelime kelime başlık, sayaç, mıknatıs buton; `prefers-reduced-motion` saygılı. |
| **Erişilebilir** | ARIA rolleri, klavye gezinmesi, odak halkaları, ekran okuyucu metinleri. |
| **Güvenli CDN** | Sürüm sabitli adresler ve SRI imzaları; CDN düşerse yerel kopyaya geçiş örneği. |
| **Her yerde** | Saf HTML, PHP, Node/Express, React/Next, Vue, Laravel Blade, WordPress. |

## Bileşenler

Accordion · Alert · Avatar · Badge · Banner · Breadcrumb · Button · Button group · Card · Code · Confirm · Description list · Divider · Drawer · Dropdown · Empty state · Eyebrow & pill · List · Loader · Modal · Navbar · Notification count · Pagination · Pricing · Progress ring · Quote · Read bar · Segmented control · Stats · Status · Steps · Table · Tabs · Tag · Timeline · Toast · Tooltip

## JavaScript API

```js
FK.toast('Kaydedildi', 'success');                 // success · warning · danger · info
FK.confirm({ title: 'Silinsin mi?', danger: true }) // Promise<boolean>
  .then(ok => ok && sil());
FK.open('#modal');  FK.close('#modal');
FK.setTheme('dark'); FK.theme();                    // 'dark' | 'light'
FK.copy('metin');                                   // Promise
FK.init(yeniEklenenAlan);                           // dinamik içeriği bağla
```

Olaylar `fk:` önekiyle yayılır: `fk:theme`, `fk:tab`, `fk:open`, `fk:close`, `fk:sort`, `fk:complete`, `fk:ready`. Tüm `data-fk-*` öznitelikleri: [Hareket ve JS API](https://ui.fkdev.sbs/hareket/).

## Belgeler

| Bölüm | İçerik |
|---|---|
| [Başlangıç](https://ui.fkdev.sbs/baslangic/) | Kurulum, ilk sayfa şablonu, klasör yapısı, tarayıcı desteği |
| [Temeller](https://ui.fkdev.sbs/temeller/) | Renkler, tema, tipografi, boşluk, Liquid Glass, ızgara, ikonlar |
| [Bileşenler](https://ui.fkdev.sbs/bilesenler/) | 37 bileşen, canlı örnek ve kopyalanabilir kod |
| [Formlar](https://ui.fkdev.sbs/formlar/) | Alanlar, doğrulama, OTP, dosya yükleme, sunucuya gönderme |
| [Hareket](https://ui.fkdev.sbs/hareket/) | Animasyon ilkeleri ve JavaScript API |
| [Kalıplar](https://ui.fkdev.sbs/kaliplar/) | Hero, CTA, footer, 404, sohbet arayüzü, KPI parçaları |
| [Entegrasyon](https://ui.fkdev.sbs/entegrasyon/) | PHP, Node, Vercel, React, Vue, Laravel, WordPress |
| [Veritabanı](https://ui.fkdev.sbs/veritabani/) | ER diyagramı, MySQL şeması, PDO, migration |
| [Yapay zekâ](https://ui.fkdev.sbs/yapay-zeka/) | Claude API ile sunucu taraflı sohbet ve akış |
| [Yayın](https://ui.fkdev.sbs/yayin/) | SEO, erişilebilirlik, performans, güvenlik başlıkları, deploy |
| [CDN](https://ui.fkdev.sbs/cdn/) | Sürümlü adresler, SRI doğrulama, önbellek, Cloudflare |
| [Sözlük](https://ui.fkdev.sbs/sozluk/) | Terimler ve tüm CSS sınıfları |

## CDN adresleri

| Adres | Ne zaman |
|---|---|
| `/v2.4.1/` | **Üretim.** Sabit sürüm, SRI ile kullan. |
| `/v2/` | 2.x içinde otomatik güncelleme. |
| `/latest/` | Deneme ve prototip. |
| `/indir/fkdev-ui-2.4.1.zip` | Kendi sunucunda barındırmak için. |

Makine okunur dosyalar: [`manifest.json`](dist/manifest.json) (boyutlar ve imzalar), [`fkdev-tokens.json`](dist/fkdev-tokens.json) (tasarım tokenları), [`icons.json`](dist/icons.json) (95 ikon), [`versions.json`](versions.json).

## Yerelde çalıştır

```bash
git clone https://github.com/fkircidevs/fkdev-ui.git
cd fkdev-ui
npx http-server -p 5182 -c-1 --cors
```

## Klasör yapısı

```
fkdev-ui/
├── index.html                 Belgeler ana sayfası
├── baslangic/ temeller/ bilesenler/ formlar/ hareket/ kaliplar/
├── entegrasyon/ veritabani/ yapay-zeka/ yayin/ cdn/ sozluk/ surumler/
├── dist/                      Kaynak dağıtım: css, js, ikonlar, tokenlar
├── v2.4.1/ v2/ latest/        CDN sürüm takma adları
├── indir/                     ZIP paketi
├── assets/                    Belgeler sitesinin kendi stil, script ve arama dizini
├── .htaccess · _headers       CORS, önbellek, güvenlik başlıkları
└── LICENSE                    MIT
```

## Ailesi

| Proje | Ne |
|---|---|
| [fkdev.sbs](https://www.fkdev.sbs) | Kişisel site |
| [ui.fkdev.sbs](https://ui.fkdev.sbs) | Bu tasarım sistemi |
| [admin.fkdev.sbs](https://admin.fkdev.sbs) | fkdev UI ile yapılmış ücretsiz admin dashboard ([repo](https://github.com/fkircidevs/fkdev-admin)) |

## Lisans

[MIT](LICENSE) © 2026 Furkan Kırcı. Kullan, değiştir, geliştir, sat.

<div align="center">

---

**fkdev** · Bursa · Nerede isterseniz

</div>

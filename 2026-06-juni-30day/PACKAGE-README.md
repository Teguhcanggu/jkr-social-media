# JKR Content Package — Juni 2026 (30 Hari)

> Paket konten organik lengkap & **siap-publish** untuk Jiwa Karya Rental, dibuat dari **bahan yang ada** (14 hero foto real JKR + design-system brand). Semua di-render lokal di VPS — brand-consistent, tanpa biaya tool eksternal.

**Dibuat:** 2026-06-01 · **Periode:** 1–30 Juni 2026 · **Owner:** Teguh Budiana
**Goal:** Awareness + reach ≥ 50K (per `09-next-actions/content-plan-30day-juni-2026-FINAL.md`)

---

## 📦 Inventory (yang sudah jadi)

| Aset | Jumlah | Format | Lokasi | Status |
|---|---|---|---|---|
| **Carousel** | 8 set · 53 slide | PNG 1080×1350 | `out/C01..C08/slide-NN.png` | ✅ siap publish |
| **Stories / WA Status** | 30 | PNG 1080×1920 | `out/S01..S30/SNN.png` | ✅ siap publish |
| **Reels** | 12 video (9–11s) | MP4 1080×1920 H.264 | `out/R01..R12/RNN.mp4` (+poster.jpg) | ✅ siap publish |
| **Outro brand** | 1 | PNG 1080×1920 | `out/OUTRO/OUTRO.png` | ✅ |

**Total: 95 still + 12 video = 107 aset jadi.** Semua pakai **foto fleet asli JKR** (SANY / Kubota U30 / Dump Truk / borpile / tim) — bukan stock, bukan AI generik.

---

## 🎨 Cara dibuat (pipeline reusable)

Render lokal di VPS — **tidak butuh Canva Pro / Wavespeed / internet**:

```
lib/gen.mjs        Generator data-driven: brand CSS + tipe slide
                   (cover / photo / photoFull / text / list / cta / testimonial / poll / reelOverlay)
lib/shoot.mjs      Chrome headless --screenshot → PNG (exact 1080×1350 / 1080×1920)
lib/build-reels.mjs ffmpeg Ken Burns (zoompan) + overlay brand + outro → MP4
content/pieces.mjs   8 carousel
content/stories.mjs  30 story
content/reels.mjs    12 reel
```

**Re-render semua:**
```bash
cd ~/WORK_WITH_AI/IKLAN-JKR-EXCAVATOR/11-creative-output/2026-06-juni-30day
node lib/run.mjs && node lib/shoot.mjs   # semua PNG
node lib/build-reels.mjs                  # semua MP4
```

Edit teks/caption → ubah `content/*.mjs` → jalankan ulang. Ganti foto → taruh di `assets/photos/` + update ref.

**Brand system:** navy `#0D2241` · merah `#E80016` · kuning `#FFD400` · font Ubuntu Sans + emoji warna. Identik dengan creative set Kubota 30 Mei.

---

## 📅 Jadwal & caption

➡️ **[CALENDAR-CAPTIONS.md](./CALENDAR-CAPTIONS.md)** — mapping per-hari: piece → file aset → channel → slot → caption siap copy-paste → status.

Tema mingguan (per plan FINAL): W1 Fleet Showcase · W2 Service Spesialis · W3 Use Case Bali · W4 Trust + Community.

---

## 🚀 Cara publish

### Sudah bisa via MCP (dari VPS ini)
- **IG Feed / Carousel** → `mcp__jk-meta__ig_publish_carousel` / `ig_publish_photo`
- **IG Reels / video** → `mcp__jk-meta__ig_publish_video`
- **FB Page** → `mcp__jk-meta__fb_post_photo` / `fb_post_video` / `fb_post_text`
- **WA Status** → `mcp__jk-komunikasi__wa-jkr__send_status`
- **Insight** → `fb_get_post_insights` / `ig_get_media_insights`

> Publish butuh URL gambar yang bisa diakses Meta. Opsi hosting: upload ke GitHub repo `Teguhcanggu/jkr-social-media` (cara terbukti 31 Mei), atau Cloudflare R2. Lihat CALENDAR untuk detail per-piece.

### ⚠️ Blocker / catatan
1. **IG Stories belum bisa auto-publish dari VPS** — tool `ig_publish_story`/`fb_post_story` cuma ada di build Mac, tidak di `jk-meta` VPS. → post Stories manual dari HP (PNG sudah jadi), **atau** deploy story-tool ke VPS (sekali setup). WA Status TETAP bisa otomatis.
2. **Reels = Ken Burns dari foto real** (gerak zoom/pan halus). Untuk video sinematik penuh (gerak alat berat nyata), opsional upgrade Wavespeed Seedance — top-up ~$15-20. Versi sekarang sudah publish-ready & profesional.
3. Reels **tanpa audio** — tambahkan trending sound di app IG saat upload (boost algoritma).

---

## 📂 Struktur folder
```
2026-06-juni-30day/
├── README.md                 file ini
├── CALENDAR-CAPTIONS.md       jadwal 30 hari + caption
├── assets/photos/             14 hero foto real (sumber)
├── assets/logo/               logo JKR
├── lib/                       generator + render scripts
├── content/                   spec konten (pieces/stories/reels)
└── out/                       OUTPUT — PNG + MP4 siap publish
    ├── C01..C08/  S01..S30/  R01..R12/  OUTRO/
```

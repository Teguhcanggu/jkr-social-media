// Generate a browsable GitHub gallery README.md for the pushed content folder.
// Usage: node lib/gallery.mjs <destDir>
import { readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DEST = process.argv[2];
if (!DEST) { console.error('need destDir'); process.exit(1); }

const CTITLE = {
  C01: 'Kenal 3 Unit JKR', C02: 'Spec Compare — PC30 vs PC75', C03: 'Breaker vs Bucket',
  C04: '5 Hal Sebelum Sewa Breaker', C05: 'Renovasi Villa? Checklist Alat',
  C06: 'Project Canggu Wrap-Up', C07: 'Tim JKR — Kenapa Beda', C08: 'Why JKR — 5 Alasan',
};
const RTITLE = {
  R01: 'Gang sempit 1,55m', R02: 'SANY breaker', R03: 'Kubota galian timelapse', R04: 'Borpile drill ⭐',
  R05: 'Bucket presisi', R06: 'Hand-signal teamwork', R07: 'Teaser villa', R08: 'Kubota gang 1,55m (USP)',
  R09: 'Before → after villa', R10: 'Expat testimonial (EN)', R11: 'BTS tim JKR', R12: 'Brand story',
};
const STITLE = {
  S01: 'Kickoff Juni', S02: 'Poll unit', S05: 'SANY breaker', S07: 'Quiz villa', S13: 'Testimoni Dana',
  S16: 'USP gang sempit', S20: 'Testimoni expat', S26: 'Numbers 4,9★', S27: 'Testimoni villa', S30: 'Booking Juli',
};

const sorted = (p) => existsSync(p) ? readdirSync(p).sort() : [];
let md = `# JKR — Konten Organik Juni 2026 (30 Hari)

> Paket konten lengkap Jiwa Karya Rental: **8 carousel (53 slide) · 30 stories · 12 reels**. Semua pakai foto fleet asli JKR, brand-consistent. Dirender otomatis (HTML→PNG + ffmpeg).

**Periode:** 1–30 Juni 2026 · Goal: awareness + reach ≥ 50K · WA 0877-8766-9088
Jadwal & caption lengkap: [\`CALENDAR-CAPTIONS.md\`](./CALENDAR-CAPTIONS.md) · Cara pakai: [\`PACKAGE-README.md\`](./PACKAGE-README.md)

---

## 🎬 Reels (12 video)

`;
// reels grid
md += `<table>\n`;
const reels = sorted(join(DEST, 'reels')).filter(f => f.endsWith('-poster.jpg')).map(f => f.replace('-poster.jpg', ''));
for (let i = 0; i < reels.length; i += 3) {
  md += '<tr>';
  for (const id of reels.slice(i, i + 3)) {
    md += `<td align="center"><a href="reels/${id}.mp4"><img src="reels/${id}-poster.jpg" width="230"></a><br><b>${id}</b> · ${RTITLE[id] || ''}<br><a href="reels/${id}.mp4">▶ play mp4</a></td>`;
  }
  md += '</tr>\n';
}
md += `</table>\n\n---\n\n## 🖼️ Carousels (8 set · IG Feed)\n\n`;
// carousels: per set, heading + slide grid
for (const c of sorted(join(DEST, 'carousel'))) {
  const slides = sorted(join(DEST, 'carousel', c)).filter(f => f.endsWith('.png'));
  md += `### ${c} — ${CTITLE[c] || ''}  \`(${slides.length} slide)\`\n\n<table><tr>`;
  slides.forEach((s, i) => {
    md += `<td align="center"><img src="carousel/${c}/${s}" width="150"><br><sub>${i + 1}</sub></td>`;
    if ((i + 1) % 4 === 0 && i + 1 < slides.length) md += `</tr><tr>`;
  });
  md += `</tr></table>\n\n`;
}
md += `---\n\n## 📱 Stories & WA Status (30)\n\n<table>\n`;
const stories = sorted(join(DEST, 'stories')).filter(f => f.endsWith('.png'));
for (let i = 0; i < stories.length; i += 5) {
  md += '<tr>';
  for (const s of stories.slice(i, i + 5)) {
    const id = s.replace('.png', '');
    md += `<td align="center"><img src="stories/${s}" width="130"><br><sub><b>${id}</b>${STITLE[id] ? '<br>' + STITLE[id] : ''}</sub></td>`;
  }
  md += '</tr>\n';
}
md += `</table>\n\n---\n\n_Dibuat 2026-06-01 · render lokal VPS (Chrome headless + ffmpeg) · design-system brand JKR._\n`;

writeFileSync(join(DEST, 'README.md'), md);
console.log('gallery README written:', join(DEST, 'README.md'), `(${md.length} chars)`);

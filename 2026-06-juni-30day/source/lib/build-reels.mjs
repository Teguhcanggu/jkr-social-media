// Build R01-R12 mp4: Ken Burns zoompan on real photo + brand overlay PNG + brand outro.
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { reels } from '../content/reels.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = join(__dirname, '..');
const PHOTOS = join(BASE, 'assets', 'photos');
const OUT = join(BASE, 'out');
const FPS = 30, OUTRO_S = 2;
const ff = (args) => execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'pipe', timeout: 180000 });

let ok = 0, fail = 0;
for (const r of reels) {
  const dir = join(OUT, r.id);
  const durF = r.dur * FPS;
  const photo = join(PHOTOS, r.photo);
  const overlay = join(dir, `${r.id}.png`);      // transparent brand overlay (rendered in main pass)
  const outroPng = join(OUT, 'OUTRO', 'OUTRO.png');
  const mainMp4 = join(dir, '_main.mp4');
  const outroMp4 = join(dir, '_outro.mp4');
  const finalMp4 = join(dir, `${r.id}.mp4`);
  try {
    // main: cover-scale -> ken burns zoom -> overlay brand text
    ff(['-loop', '1', '-i', photo, '-i', overlay, '-filter_complex',
      `[0:v]scale=1620:2880:force_original_aspect_ratio=increase,crop=1620:2880,` +
      `zoompan=z='min(zoom+0.0006,1.12)':d=${durF}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=${FPS},setsar=1[bg];` +
      `[bg][1:v]overlay=0:0,format=yuv420p[v]`,
      '-map', '[v]', '-frames:v', String(durF), '-r', String(FPS),
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', mainMp4]);
    // outro: static brand card
    ff(['-loop', '1', '-i', outroPng, '-filter_complex',
      `[0:v]scale=1080:1920,fps=${FPS},format=yuv420p[v]`,
      '-map', '[v]', '-frames:v', String(OUTRO_S * FPS), '-r', String(FPS),
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', outroMp4]);
    // concat
    const list = join(dir, '_concat.txt');
    writeFileSync(list, `file '${mainMp4}'\nfile '${outroMp4}'\n`);
    ff(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', finalMp4]);
    ok++; console.log(`✓ ${r.id}  ${r.dur + OUTRO_S}s`);
  } catch (e) {
    fail++; console.error(`✗ ${r.id}`, String(e.stderr || e.message || e).slice(0, 300));
  }
}
console.log(`reels: ${ok} ok, ${fail} fail`);

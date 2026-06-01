// Screenshot each slide HTML -> PNG via Chrome headless, reading out/manifest.json
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MAN = join(__dirname, '..', 'out', 'manifest.json');
const CHROME = process.env.HOME + '/.agent-browser/browsers/chrome-148.0.7778.167/chrome';

const items = JSON.parse(readFileSync(MAN, 'utf8'));
let ok = 0, fail = 0;
for (const it of items) {
  try {
    execFileSync(CHROME, [
      '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
      '--allow-file-access-from-files', '--force-device-scale-factor=1',
      '--default-background-color=00000000',
      `--window-size=${it.w},${it.h}`,
      `--screenshot=${it.png}`, `file://${it.html}`,
    ], { stdio: 'pipe', timeout: 60000 });
    ok++;
  } catch (e) {
    fail++; console.error('FAIL', it.html, String(e.message || e).slice(0, 200));
  }
}
console.log(`shot ${ok} ok, ${fail} fail`);

// JKR 30-Day Content Generator — data-driven HTML slide builder
// Reuses JKR brand design system (navy #0D2241 / red #E80016 / yellow #FFD400).
// Each slide -> standalone HTML sized exactly to format, screenshot by Chrome headless.
import { readdir } from 'node:fs/promises';
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = join(__dirname, '..');
const ASSETS = join(BASE, 'assets');
const OUT = join(BASE, 'out');

const PHOTO = (f) => `file://${join(ASSETS, 'photos', f)}`;
const LOGO = `file://${join(ASSETS, 'logo', 'jkr-logo.png')}`;
const DIMS = { carousel: [1080, 1350], story: [1080, 1920], square: [1080, 1080] };

// ---- text helpers --------------------------------------------------------
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// inline markup: [[box]] -> yellow box; **mark** -> yellow underline highlight; \n -> <br>
function inl(s = '') {
  let t = esc(s);
  t = t.replace(/\[\[(.+?)\]\]/g, '<span class="box">$1</span>');
  t = t.replace(/\*\*(.+?)\*\*/g, '<span class="cv-marker">$1</span>');
  t = t.replace(/\n/g, '<br>');
  return t;
}

// ---- brand CSS (inlined per slide) --------------------------------------
const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
@font-face{font-family:'Disp';src:local('Ubuntu Sans'),local('Liberation Sans');font-weight:400 800}
html,body{width:var(--W);height:var(--H);overflow:hidden}
:root{
  --navy:#0D2241; --navy2:#13315c; --red:#E80016; --redsoft:#FFE5E8;
  --yellow:#FFD400; --amber:#FFB800; --bg:#ffffff; --bgalt:#F4F2EE;
  --fg:#0D2241; --mute:#475569; --soft:#94A3B8; --rule:rgba(13,34,65,0.12);
  --disp:'Ubuntu Sans','Liberation Sans','DejaVu Sans',system-ui,sans-serif;
  --mono:'DejaVu Sans Mono','Ubuntu Sans Mono',monospace;
  --emoji:'Noto Color Emoji';
}
body{font-family:var(--disp),var(--emoji);background:var(--bg);color:var(--fg);
  -webkit-font-smoothing:antialiased;position:relative;display:flex;flex-direction:column}
.slide{width:var(--W);height:var(--H);position:relative;overflow:hidden;display:flex;flex-direction:column}
.pad{padding:var(--pad)}
.fill{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.grad{position:absolute;inset:0}
.cv-marker{background:linear-gradient(180deg,transparent 56%,var(--yellow) 56%,var(--yellow) 92%,transparent 92%);padding:0 6px;margin:0 -4px;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.box{background:var(--yellow);color:var(--navy);padding:2px 14px;border-radius:8px;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.eyebrow{font-family:var(--mono);font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--red);display:inline-flex;align-items:center;gap:12px;font-size:var(--fEye)}
.eyebrow::before{content:"//";color:var(--soft);font-weight:400}
.counter{font-family:var(--mono);letter-spacing:.08em;color:var(--soft);font-variant-numeric:tabular-nums;font-size:var(--fEye)}
.top{display:flex;justify-content:space-between;align-items:center;gap:16px}
.h1{font-family:var(--disp);font-weight:800;letter-spacing:-.025em;line-height:1.02;text-wrap:balance}
.h2{font-family:var(--disp);font-weight:800;letter-spacing:-.02em;line-height:1.06;text-wrap:balance}
.body{font-family:var(--disp);line-height:1.45;color:var(--mute);text-wrap:pretty}
.numeral{font-family:var(--disp);font-weight:800;font-variant-numeric:tabular-nums;line-height:.82;letter-spacing:-.05em;color:var(--red)}
.tag{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:999px;font-family:var(--mono);font-size:var(--fTag);font-weight:700;letter-spacing:.06em;text-transform:uppercase;background:var(--redsoft);color:var(--red);white-space:nowrap}
.tag.ghost{background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(8px)}
.tag.solid{background:var(--red);color:#fff}
.tag.navy{background:var(--navy);color:#fff}
.bar{width:120px;height:10px;background:var(--red);border-radius:3px}
.aside{font-family:var(--mono);line-height:1.5;color:var(--soft);border-left:3px solid var(--red);padding-left:18px;font-size:var(--fAside)}
.footer{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-top:22px;margin-top:auto;border-top:1px solid var(--rule);font-family:var(--mono);font-size:var(--fFoot);font-weight:600;letter-spacing:.1em;text-transform:uppercase}
.footer .l{color:var(--fg)} .footer .m{color:var(--soft);font-variant-numeric:tabular-nums} .footer .r{color:var(--red);font-weight:700}
.list{display:flex;flex-direction:column;gap:var(--gap)}
.li{display:flex;gap:20px;align-items:flex-start}
.li .ic{font-size:var(--fLiIc);line-height:1;flex:none}
.li .tx{font-family:var(--disp);font-weight:600;line-height:1.25;color:var(--fg)}
.li .sub{font-family:var(--disp);font-weight:400;color:var(--mute);line-height:1.35;margin-top:4px}
.invert{background:var(--navy);color:#fff}
.invert .h1,.invert .h2{color:#fff}
.invert .body{color:rgba(255,255,255,.82)}
.invert .li .tx{color:#fff} .invert .li .sub{color:rgba(255,255,255,.7)}
.invert .counter,.invert .footer .m{color:rgba(255,255,255,.45)}
.invert .footer{border-color:rgba(255,255,255,.18)} .invert .footer .l{color:#fff}
.stars{color:var(--amber);font-size:var(--fStars);letter-spacing:4px}
.quote{font-family:var(--disp);font-weight:700;line-height:1.22;letter-spacing:-.01em;text-wrap:balance}
.brandrow{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-top:22px;margin-top:30px;border-top:1px solid rgba(255,255,255,.22);font-family:var(--mono);font-size:var(--fFoot);font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#fff}
.logo{height:var(--fLogo);width:auto;display:block;align-self:flex-start;object-fit:contain;flex:none}
.logo.white{filter:brightness(0) invert(1) drop-shadow(0 2px 8px rgba(0,0,0,.45))}
.wa{display:inline-flex;align-items:center;gap:14px;font-family:var(--mono);font-weight:700;letter-spacing:.04em;font-size:var(--fWA);color:#fff;background:var(--red);padding:18px 30px;border-radius:14px}
`;

// scale tokens per format
function tokens(kind) {
  const story = kind === 'story';
  return story
    ? { pad: '90px', fEye: '24px', fTag: '20px', fAside: '22px', fFoot: '20px', fLiIc: '46px', fStars: '40px', fFoot2: '20px', fWA: '34px', fLogo: '60px', gap: '30px' }
    : { pad: '80px', fEye: '22px', fTag: '18px', fAside: '18px', fFoot: '17px', fLiIc: '40px', fStars: '34px', fFoot2: '17px', fWA: '30px', fLogo: '56px', gap: '26px' };
}

// ---- slide renderers -----------------------------------------------------
function footer(p) {
  return `<div class="footer"><span class="l">JIWA KARYA RENTAL</span><span class="m">${p.counter || ''}</span><span class="r">${esc(p.footerR || 'WA · 0877-8766-9088')}</span></div>`;
}
function tags(arr, cls = '') { return (arr || []).map(t => `<span class="tag ${cls}">${inl(t)}</span>`).join(''); }

const R = {
  cover(p, kind) {
    const big = kind === 'story' ? '128px' : '104px';
    const sub = kind === 'story' ? '34px' : '30px';
    return `<div class="slide" style="background:var(--navy)">
      <img class="fill" src="${PHOTO(p.photo)}">
      <div class="grad" style="background:linear-gradient(180deg,rgba(13,34,65,.82)0%,rgba(13,34,65,.32)24%,rgba(13,34,65,.20)52%,rgba(13,34,65,.60)80%,rgba(13,34,65,.97)100%)"></div>
      <div style="position:relative;display:flex;justify-content:space-between;align-items:flex-start;padding:64px var(--pad) 0">
        <img class="logo white" src="${LOGO}">
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
          <span class="eyebrow" style="color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.5)">${esc(p.badge || 'JUNI 2026')}</span>
        </div>
      </div>
      <div style="flex:1"></div>
      <div style="position:relative;padding:0 var(--pad) var(--pad)">
        <div class="bar" style="margin-bottom:34px"></div>
        <h1 class="h1" style="font-size:${big};color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.4)">${inl(p.title)}</h1>
        ${p.subtitle ? `<p style="margin-top:30px;max-width:900px;font-size:${sub};line-height:1.4;color:rgba(255,255,255,.9);text-shadow:0 1px 6px rgba(0,0,0,.4)">${inl(p.subtitle)}</p>` : ''}
        <div style="display:flex;gap:12px;align-items:center;margin-top:34px;flex-wrap:wrap">${tags(p.tags, 'ghost')}${p.tagSolid ? `<span class="tag solid">${inl(p.tagSolid)}</span>` : ''}</div>
        <div class="brandrow"><span>JIWA KARYA RENTAL</span><span style="color:rgba(255,255,255,.55)">${p.counter || ''}</span><span style="color:var(--yellow)">${esc(p.swipe || 'GESER →')}</span></div>
      </div>
    </div>`;
  },
  text(p, kind) {
    const h = kind === 'story' ? (p.numeral ? '76px' : '88px') : (p.numeral ? '78px' : '80px');
    return `<div class="slide pad ${p.invert ? 'invert' : ''}">
      <div class="top"><span class="eyebrow">${esc(p.eyebrow || '')}</span><span class="counter">${p.counter || ''}</span></div>
      <div style="flex:1;display:flex;flex-direction:column;justify-content:${p.center ? 'center' : 'flex-end'};margin-bottom:26px">
        ${p.numeral ? `<div style="display:flex;align-items:baseline;gap:24px;margin-bottom:28px"><span class="numeral" style="font-size:${kind === 'story' ? '220px' : '190px'}">${esc(p.numeral)}</span><div style="flex:1;height:2px;background:var(--rule)"></div></div>` : ''}
        ${p.kicker ? `<div style="font-family:var(--mono);font-weight:700;color:var(--red);letter-spacing:.08em;text-transform:uppercase;font-size:24px;margin-bottom:18px">${inl(p.kicker)}</div>` : ''}
        <h2 class="h2" style="font-size:${h};max-width:920px">${inl(p.title)}</h2>
        ${p.body ? `<p class="body" style="margin-top:26px;max-width:880px;font-size:${kind === 'story' ? '36px' : '34px'}">${inl(p.body)}</p>` : ''}
        ${p.aside ? `<div class="aside" style="margin-top:32px;max-width:820px">${inl(p.aside)}</div>` : ''}
        ${p.tags ? `<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:34px">${tags(p.tags)}</div>` : ''}
      </div>
      ${footer(p)}
    </div>`;
  },
  photo(p, kind) {
    const ph = kind === 'story' ? '760px' : '520px';
    return `<div class="slide ${p.invert ? 'invert' : ''}">
      <div class="pad" style="padding-bottom:24px"><div class="top"><span class="eyebrow">${esc(p.eyebrow || '')}</span><span class="counter">${p.counter || ''}</span></div></div>
      <div style="position:relative;height:${ph};margin:0 var(--pad);border-radius:18px;overflow:hidden;background:var(--navy)">
        <img class="fill" src="${PHOTO(p.photo)}">
        <div class="grad" style="background:linear-gradient(180deg,rgba(0,0,0,0)45%,rgba(0,0,0,.5)100%)"></div>
        ${p.numeralBadge ? `<div style="position:absolute;top:24px;left:24px"><span class="numeral" style="font-size:96px;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.45)">${esc(p.numeralBadge)}</span></div>` : ''}
        <div style="position:absolute;bottom:24px;left:24px;right:24px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">${tags(p.photoTags, 'ghost')}</div>
      </div>
      <div class="pad" style="padding-top:30px;flex:1;display:flex;flex-direction:column">
        <h2 class="h2" style="font-size:${kind === 'story' ? '66px' : '60px'};max-width:920px">${inl(p.title)}</h2>
        ${p.body ? `<p class="body" style="margin-top:22px;max-width:880px;font-size:${kind === 'story' ? '34px' : '30px'}">${inl(p.body)}</p>` : ''}
        ${p.aside ? `<div class="aside" style="margin-top:22px;max-width:820px">${inl(p.aside)}</div>` : ''}
        <div style="margin-top:auto">${footer(p)}</div>
      </div>
    </div>`;
  },
  photoFull(p, kind) {
    return `<div class="slide" style="background:var(--navy)">
      <img class="fill" src="${PHOTO(p.photo)}">
      <div class="grad" style="background:linear-gradient(180deg,rgba(13,34,65,.55)0%,rgba(13,34,65,.12)35%,rgba(13,34,65,.30)62%,rgba(13,34,65,.95)100%)"></div>
      <div style="position:relative;display:flex;justify-content:space-between;padding:60px var(--pad) 0"><img class="logo white" src="${LOGO}">${p.badge ? `<span class="eyebrow" style="color:#fff">${esc(p.badge)}</span>` : ''}</div>
      <div style="flex:1"></div>
      <div style="position:relative;padding:0 var(--pad) var(--pad)">
        ${p.eyebrow ? `<div style="font-family:var(--mono);font-weight:700;color:var(--yellow);letter-spacing:.08em;text-transform:uppercase;font-size:24px;margin-bottom:20px">${inl(p.eyebrow)}</div>` : ''}
        <h2 class="h2" style="font-size:${kind === 'story' ? '88px' : '76px'};color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.4);max-width:920px">${inl(p.title)}</h2>
        ${p.body ? `<p class="body" style="margin-top:24px;max-width:900px;font-size:${kind === 'story' ? '36px' : '32px'};color:rgba(255,255,255,.9);text-shadow:0 1px 6px rgba(0,0,0,.4)">${inl(p.body)}</p>` : ''}
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:30px">${tags(p.tags, 'ghost')}</div>
        ${p.counter ? `<div class="brandrow"><span>JIWA KARYA RENTAL</span><span style="color:rgba(255,255,255,.55)">${p.counter}</span><span style="color:var(--yellow)">${esc(p.swipe || 'GESER →')}</span></div>` : ''}
      </div>
    </div>`;
  },
  list(p, kind) {
    return `<div class="slide pad ${p.invert ? 'invert' : ''}">
      <div class="top"><span class="eyebrow">${esc(p.eyebrow || '')}</span><span class="counter">${p.counter || ''}</span></div>
      <h2 class="h2" style="font-size:${kind === 'story' ? '66px' : '58px'};max-width:920px;margin-top:30px">${inl(p.title)}</h2>
      <div class="list" style="margin-top:44px;flex:1;justify-content:center">
        ${(p.items || []).map(it => `<div class="li"><span class="ic">${it.icon || '✓'}</span><div><div class="tx" style="font-size:${kind === 'story' ? '38px' : '34px'}">${inl(it.text)}</div>${it.sub ? `<div class="sub" style="font-size:${kind === 'story' ? '28px' : '25px'}">${inl(it.sub)}</div>` : ''}</div></div>`).join('')}
      </div>
      ${p.aside ? `<div class="aside" style="margin-bottom:26px;max-width:820px">${inl(p.aside)}</div>` : ''}
      ${footer(p)}
    </div>`;
  },
  cta(p, kind) {
    return `<div class="slide pad invert" style="justify-content:center;text-align:left">
      <div style="display:flex;flex-direction:column;justify-content:center;flex:1">
        <img class="logo white" src="${LOGO}" style="margin-bottom:40px">
        <div class="bar" style="margin-bottom:34px"></div>
        <h2 class="h2" style="font-size:${kind === 'story' ? '92px' : '82px'};max-width:920px">${inl(p.title)}</h2>
        ${p.body ? `<p class="body" style="margin-top:26px;max-width:880px;font-size:${kind === 'story' ? '38px' : '34px'}">${inl(p.body)}</p>` : ''}
        <div style="margin-top:46px"><span class="wa">📲 ${esc(p.wa || '0877-8766-9088')}</span></div>
        ${p.note ? `<div style="margin-top:28px;font-family:var(--mono);color:rgba(255,255,255,.6);font-size:24px">${inl(p.note)}</div>` : ''}
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:34px">${tags(p.tags, 'ghost')}</div>
      </div>
      <div class="footer"><span class="l">JIWA KARYA RENTAL</span><span class="m">${p.counter || ''}</span><span class="r" style="color:var(--yellow)">${esc(p.footerR || 'SEWA ALAT BERAT · BALI')}</span></div>
    </div>`;
  },
  testimonial(p, kind) {
    return `<div class="slide pad ${p.invert ? 'invert' : ''}" style="justify-content:center">
      <div class="top"><span class="eyebrow">${esc(p.eyebrow || 'TESTIMONI')}</span><span class="counter">${p.counter || ''}</span></div>
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center">
        <div class="stars">★★★★★</div>
        <blockquote class="quote" style="font-size:${kind === 'story' ? '52px' : '46px'};margin-top:30px;max-width:920px">“${inl(p.quote)}”</blockquote>
        <div style="margin-top:40px;display:flex;align-items:center;gap:18px">
          <div style="width:8px;height:64px;background:var(--red);border-radius:3px"></div>
          <div><div style="font-family:var(--disp);font-weight:800;font-size:${kind === 'story' ? '36px' : '32px'};color:${p.invert ? '#fff' : 'var(--navy)'}">${esc(p.name)}</div><div style="font-family:var(--mono);color:var(--soft);font-size:23px;margin-top:4px">${esc(p.role || '')}</div></div>
        </div>
      </div>
      ${footer(p)}
    </div>`;
  },
  reelOverlay(p) {
    // transparent 9:16 overlay for ffmpeg: bottom scrim + hook + sub + tags, logo top
    return `<style>html,body{background:transparent!important}</style>
    <div class="slide" style="background:transparent">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(13,34,65,.45)0%,rgba(13,34,65,0)22%,rgba(13,34,65,0)50%,rgba(13,34,65,.55)78%,rgba(13,34,65,.92)100%)"></div>
      <div style="position:relative;display:flex;justify-content:space-between;padding:64px var(--pad) 0">
        <img class="logo white" src="${LOGO}"><span class="eyebrow" style="color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.6)">${esc(p.badge || 'JKR')}</span>
      </div>
      <div style="flex:1"></div>
      <div style="position:relative;padding:0 var(--pad) 120px">
        ${p.eyebrow ? `<div style="font-family:var(--mono);font-weight:700;color:var(--yellow);letter-spacing:.08em;text-transform:uppercase;font-size:26px;margin-bottom:18px;text-shadow:0 1px 6px rgba(0,0,0,.6)">${inl(p.eyebrow)}</div>` : ''}
        <h2 class="h2" style="font-size:96px;color:#fff;text-shadow:0 2px 14px rgba(0,0,0,.55);max-width:920px">${inl(p.title)}</h2>
        ${p.body ? `<p class="body" style="margin-top:24px;max-width:900px;font-size:38px;color:rgba(255,255,255,.92);text-shadow:0 1px 8px rgba(0,0,0,.55)">${inl(p.body)}</p>` : ''}
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:30px">${tags(p.tags, 'ghost')}</div>
      </div>
    </div>`;
  },
  poll(p, kind) {
    return `<div class="slide pad" style="background:var(--bgalt);justify-content:center">
      <div class="top"><span class="eyebrow">${esc(p.eyebrow || 'TANYA KAMI')}</span><span class="counter">${p.counter || ''}</span></div>
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center">
        <h2 class="h2" style="font-size:${kind === 'story' ? '78px' : '64px'};max-width:920px">${inl(p.title)}</h2>
        <div style="display:flex;flex-direction:column;gap:22px;margin-top:48px">
          ${(p.options || []).map(o => `<div style="background:#fff;border:2px solid var(--rule);border-radius:18px;padding:30px 34px;display:flex;align-items:center;gap:22px;box-shadow:0 4px 16px rgba(13,34,65,.06)"><span style="font-size:46px">${o.icon || '▶'}</span><span style="font-family:var(--disp);font-weight:700;font-size:${kind === 'story' ? '40px' : '34px'};color:var(--navy)">${inl(o.text)}</span></div>`).join('')}
        </div>
      </div>
      ${footer(p)}
    </div>`;
  },
};

// ---- page wrapper --------------------------------------------------------
function page(kind, innerHtml) {
  const [W, H] = DIMS[kind] || DIMS.carousel;
  const tk = tokens(kind === 'story' ? 'story' : 'carousel');
  const vars = Object.entries(tk).map(([k, v]) => `--${k}:${v}`).join(';');
  return `<!DOCTYPE html><html lang="id"><head><meta charset="utf-8">
<style>:root{--W:${W}px;--H:${H}px;${vars}}${CSS}</style></head>
<body>${innerHtml}</body></html>`;
}

// ---- build ---------------------------------------------------------------
export function build(pieces) {
  if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  const manifest = [];
  for (const piece of pieces) {
    const kind = piece.kind || 'carousel';
    const dir = join(OUT, piece.id);
    mkdirSync(dir, { recursive: true });
    piece.slides.forEach((s, i) => {
      const n = String(i + 1).padStart(2, '0');
      const total = String(piece.slides.length).padStart(2, '0');
      if (s.counter === undefined && kind === 'carousel') s.counter = `${n} / ${total}`;
      const fn = R[s.type];
      if (!fn) throw new Error(`unknown slide type "${s.type}" in ${piece.id}`);
      const html = page(kind, fn(s, kind));
      const base = piece.slides.length > 1 ? `slide-${n}` : `${piece.id}`;
      const htmlPath = join(dir, base + '.html');
      writeFileSync(htmlPath, html);
      const [W, H] = DIMS[kind] || DIMS.carousel;
      manifest.push({ html: htmlPath, png: join(dir, base + '.png'), w: W, h: H });
    });
  }
  writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`built ${manifest.length} slide(s) across ${pieces.length} piece(s)`);
  return manifest;
}

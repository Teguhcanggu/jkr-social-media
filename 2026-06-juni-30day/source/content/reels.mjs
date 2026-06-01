// JKR Reels R01-R12 — 9:16 video via ffmpeg Ken Burns on real hero photos + brand text overlay + outro.
// (Available-materials build; cinematic AI video = optional Wavespeed upgrade, see index.)
const PH = {
  H1: 'H1-SANY-breaker-Canggu-perbekel-action.jpg', H3: 'H3-SANY-fullside-branded-Bali.jpg',
  H4: 'H4-SANY-borpile-auger.jpg', H5: 'H5-Kubota-orange-clean-brand.jpg',
  H6: 'H6-Kubota-orange-portrait-clearing.jpg', H7: 'H7-Kubota-galian-fondasi-deep.jpg',
  H12: 'H12-SANY-workers-ocean-graffiti.jpg', H14: 'H14-Kubota-worker-drainage.jpg',
};
const WA = '0877-8766-9088';

// each reel: photo (ken-burns base) + overlay (brand text card, transparent) + dur seconds
export const reels = [
  { id: 'R01', photo: PH.H6, dur: 8, overlay: { badge: 'USP · D1', eyebrow: 'GANG SEMPIT 1,55 M?', title: 'Kubota U30 [[lewat.]] 🚜', body: 'Lebar 1,6m + zero tail swing. Kompetitor jarang punya unit ini di Bali Selatan.', tags: ['KUBOTA U30', 'SURVEY GRATIS'] } },
  { id: 'R02', photo: PH.H1, dur: 8, overlay: { badge: 'SANY BREAKER', eyebrow: 'VOLUME ON 🔊', title: 'Hancurkan beton, [[cepat & bersih.]]', body: 'SANY SY75C + hydraulic breaker — bongkar struktur lama tanpa drama.', tags: ['BREAKER', 'DEMOLISI'] } },
  { id: 'R03', photo: PH.H7, dur: 7, overlay: { badge: 'TIMELAPSE', eyebrow: 'GALIAN FONDASI', title: 'Dalam, rapi, [[presisi.]]', body: 'Kubota U30 gali fondasi & septic di lahan terbatas — dinding aman.', tags: ['BUCKET', 'KUBOTA U30'] } },
  { id: 'R04', photo: PH.H4, dur: 9, overlay: { badge: 'RARE SERVICE', eyebrow: 'BORPILE 🌀', title: 'Drill fondasi [[tiang dalam.]]', body: 'Auger attachment SANY — layanan langka yang jarang ada di kompetitor Bali.', tags: ['BORPILE', 'AUGER'] } },
  { id: 'R05', photo: PH.H7, dur: 7, overlay: { badge: 'CLOSE-UP', eyebrow: 'BUCKET PRESISI', title: 'Galian rapi, [[hasil bersih.]]', body: 'Kontrol operator berpengalaman — fondasi & saluran sesuai garis.', tags: ['PRESISI', 'SIO OPERATOR'] } },
  { id: 'R06', photo: PH.H14, dur: 8, overlay: { badge: 'TEAMWORK', eyebrow: 'SAFETY FIRST', title: 'Hand-signal = [[kerja aman.]]', body: 'Operator & ground crew satu komando — presisi tanpa kompromi keselamatan.', tags: ['TIM JKR', 'SAFETY'] } },
  { id: 'R07', photo: PH.H6, dur: 7, overlay: { badge: 'TEASER', eyebrow: 'MINGGU DEPAN', title: 'Use case [[villa Bali.]]', body: 'Renovasi, gang sempit, proyek Canggu — pekan depan di feed JKR.', tags: ['VILLA', 'CANGGU'] } },
  { id: 'R08', photo: PH.H5, dur: 8, overlay: { badge: 'USP', eyebrow: 'AKSES 1,55 M', title: 'Masuk gang villa [[tanpa bongkar pagar.]]', body: 'Kubota U30 — zero risiko tembok rusak. PAS untuk villa Canggu.', tags: ['LEBAR 1,6 M', 'VILLA'] } },
  { id: 'R09', photo: PH.H7, dur: 8, overlay: { badge: 'BEFORE → AFTER', eyebrow: 'VILLA RENOVATION', title: 'Dari bongkaran ke [[lahan siap cor.]]', body: 'Demolish → excavate → cut & fill. Hand-over ke tim konstruksi.', tags: ['VILLA', 'CANGGU'] } },
  { id: 'R10', photo: PH.H3, dur: 9, overlay: { badge: 'EXPAT VILLA', eyebrow: 'CANGGU-BASED', title: 'Excavator rental, [[done right.]]', body: 'No need to mobilize from far. Reliable operator, reasonable price. — Google Review 4.9★', tags: ['ENGLISH OK', 'EXPAT FRIENDLY'] } },
  { id: 'R11', photo: PH.H12, dur: 9, overlay: { badge: 'BTS', eyebrow: 'TIM JKR', title: 'Di balik [[setiap proyek.]]', body: 'Land clearing dekat pantai Canggu — tim & unit di lapangan.', tags: ['TIM JKR', 'ON-SITE'] } },
  { id: 'R12', photo: PH.H3, dur: 8, overlay: { badge: 'BRAND STORY', eyebrow: 'DARI CANGGU UNTUK BALI', title: 'Alat berat yang [[bisa diandalkan.]]', body: 'Dikelola pemilik langsung. 4,9★ dari 68 ulasan, 9 kabupaten Bali.', tags: ['JKR', 'SINCE BALI'] } },
];

// brand outro card (opaque) appended to every reel
export const outro = { id: 'OUTRO', kind: 'story', slides: [{ type: 'cta', title: 'Sewa alat berat Bali? JKR siap.', body: 'Excavator · mini gang-sempit · dump truk · operator. Survey lokasi gratis, konsultasi dulu.', wa: WA, tags: ['SURVEY GRATIS', '9 KAB. BALI'], footerR: 'JIWAKARYARENTAL.COM' }] };

// expose as story pieces (overlay PNGs) for the main render pass
export const reelOverlayPieces = reels.map(r => ({ id: r.id, kind: 'story', slides: [{ type: 'reelOverlay', ...r.overlay }] }));

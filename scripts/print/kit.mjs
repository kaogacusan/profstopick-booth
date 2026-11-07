// Shared look for the print files in /assets/print: brand colors, the facts, fonts, logos, drawings, QR.
// Every size is in millimetres. A design is plain HTML + CSS that build.mjs prints to PDF and photographs to JPG.
// The brand comes from profstopick.com/kitchen-sink (files in assets/kit).
import { readFileSync } from 'node:fs';
import QRCode from 'qrcode';

const root = (p) => new URL(`../../${p}`, import.meta.url);

// Colors from the live site (Ateneo theme, light). navy + sky are the share card (og-home.png).
export const C = {
  navy: '#0d3b7a',      // --color-school, the share card ground
  accent: '#416ea8',    // --color-accent
  deep: '#31567f',      // --color-accent-deep
  sky: '#9ac0f4',       // the light blue word on the share card
  tint: '#eaeff6',      // --color-accent-tint
  paper: '#f7f8fa',     // --color-paper
  well: '#eff1f5',      // --color-well
  ink: '#16181d',       // --color-ink
  ink2: '#5a6170',      // --color-ink-soft
  ink3: '#9aa1ad',      // --color-ink-faint
  line: '#e5e8ee',      // --color-line
  great: '#1f9d55', good: '#84cc16', okay: '#eab308', poor: '#f97316', bad: '#ef4444',   // score bands
  warn: '#b4530a',
};

// The facts. Prices and pass words are from the live site (/pass, the tier cards). The rest is from the
// marketing plan and the All Info file (~/Downloads/ADVO/PROFS2PICK/marketing-plan.html,
// ~/Downloads/ADVO/PROFS2PICK/Marketing Plan/all-info.html). Change them here and rebuild.
export const F = {
  name: 'profstopick',
  site: 'profstopick.com',
  headline: ['Pick the right', 'prof.'],                    // site hero + share card
  tagline: 'Enlist smarter with ProfstoPick.',              // plan: "Use this line on posts, flyers, and the booth."
  what: 'Real student reviews, live section schedules and an advisor for enlistment.',   // share card
  features: ['Prof reviews', 'Grading statistics', 'Schedule builder', 'AI advisor'],    // plan
  schools: 'Ateneo · UP Diliman · De La Salle · Mapúa',
  free: { name: 'Free', price: '₱0', lines: ['Prof reviews and ratings', 'Basic schedule builder', '3 advisor asks a week'] },
  passes: [
    { id: 'semester', name: 'Semester Pass', price: '₱99', per: '/ semester', about: 'One enlistment and the semester after it.', month: 'about ₱20 a month' },
    // main: the pass the booth pushes (plan: "MAIN SALE"). It is first and biggest on every print.
    { id: 'year', name: 'Year Pass', price: '₱150', per: '/ year', about: 'Two enlistments and everything between.', month: '₱15 a month', main: true },
    { id: 'graduation', name: 'Graduation Pass', price: '₱250', per: '/ 4 years', about: 'Pay once. Every enlistment until you graduate.', month: 'about ₱6 a month' },
  ],
  pick: 'Our pick',                                         // the tag on the main pass
  every: ['Unlimited advisor asks', 'Works on 2 devices', 'Full refund within 7 days'],
  // Online payment (Xendit or PayMongo) is not on yet. At the booth: cash, GCash, or Maya, then a voucher code.
  pay: 'cash, GCash, or Maya',
  booth: 'Buy at our booth on Red Brick Road, Nov 9–13. Pay with cash, GCash, or Maya.',
  redeem: 'We give you a code. Redeem it at profstopick.com/pass.',
  // Not on the prints: Sir Ingco does not like it (Oct 30). Put it back on the flyer only if the team keeps it.
  referral: 'Refer a friend who buys a paid pass. Get 50% off your own pass.',
  ig: '@profs.to.pick',
  email: 'ateneoprofstopick@gmail.com',
  bazaar: 'Nov 9–13',
  // The pass card: the front is the pass, the back prints the voucher code. The public files show this sample.
  // Real codes never go in assets/ (the site is public): `npm run cards -- <codes.txt>` makes a private PDF.
  sampleCode: 'XXXX-XXXX',
};

// Real links. Every QR on every print goes to `home` (one QR for the whole booth). Test it on 2 phones before you print.
export const URLS = {
  signup: 'https://profstopick.com/signin',
  pass: 'https://profstopick.com/pass',
  ig: 'https://www.instagram.com/profs.to.pick/',
  home: 'https://profstopick.com',
};

// Six looks. Every asset has one version in each look, so the team can pick one look for the whole set.
// v4–v6 are v1–v3 with less: no drawings, no sparkles, no extra lines. Only the words that sell.
export const LOOKS = [
  { id: 'v1', label: 'Navy card', about: 'Like the share card: navy ground, white type, one light-blue word, the line drawings.' },
  { id: 'v2', label: 'Paper', about: 'Like the app: light paper, dark type, blue accents, hairline boxes.' },
  { id: 'v3', label: 'Big type', about: 'Fewest words, biggest type. Solid brand blue. Built to read from far away.' },
  { id: 'v4', label: 'Navy, simple', about: 'V1 with less: navy and white, one light-blue word. No drawings, no sparkles, no boxes.' },
  { id: 'v5', label: 'Paper, simple', about: 'V2 with less: light paper and dark type. No drawings, no cards, no extra lines.' },
  { id: 'v6', label: 'Big type, simple', about: 'V3 with less: solid blue, only the headline, the QR, and the site.' },
];

// Colors per look. bg = page, ink = main text, sub = second text, hi = the one accent word,
// rule = thin lines, card = boxes, word = wordmark color, tile = what a QR sits on,
// draw = drawing set ('' = dark lines; '-fill' = navy lines, people filled white, so skin is not blue on a dark ground),
// block = mid-blue ground: prices and small type stay white (navy is only for the big accent word).
export const LOOK = {
  v1: { bg: C.navy, ink: '#fff', sub: '#c9dbf7', hi: C.sky, rule: 'rgba(154,192,244,0.35)', card: 'rgba(255,255,255,0.07)', word: '#fff', tile: '#fff', draw: '-fill' },
  v2: { bg: C.paper, ink: C.ink, sub: C.ink2, hi: C.accent, rule: C.line, card: '#fff', word: C.ink, tile: '#fff', draw: '' },
  v3: { bg: C.accent, ink: '#fff', sub: '#e3ecf9', hi: C.navy, rule: 'rgba(255,255,255,0.4)', card: 'rgba(255,255,255,0.1)', word: '#fff', tile: '#fff', draw: '-fill', block: true },
};
LOOK.v4 = { ...LOOK.v1 };
LOOK.v5 = { ...LOOK.v2 };
LOOK.v6 = { ...LOOK.v3 };
// One margin for a whole piece: 8% of its short edge, in mm.
export const margin = (w, h) => Math.round(Math.min(w, h) * 0.08);

// ---------- logos ----------
// wordmark.svg = the word (255 wide) + the badge (45 wide) in one 300 × 51 box. We split them so each can take any color.
const WORD_SVG = readFileSync(root('assets/kit/brand/wordmark.svg'), 'utf8');
const WORD_INNER = WORD_SVG.slice(WORD_SVG.indexOf('>') + 1, WORD_SVG.lastIndexOf('</svg>'));
const WORD_ONLY = WORD_INNER.slice(0, WORD_INNER.indexOf('</svg>') + 6);   // the first nested <svg>: the letters
export const WORD_RATIO = 255 / 51;
const BADGE_SVG = readFileSync(root('assets/kit/brand/badge.svg'), 'utf8');

// The badge (blue rounded square, white star with a face). bg = square color, fg = star color.
// Colors swap through placeholders, so fg can be any color (even the brand blue).
export const badge = (h, { bg = C.accent, fg = '#fff', style = '' } = {}) =>
  `<svg class="lg" style="height:${h}mm;width:${h}mm;${style}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">${
    BADGE_SVG.slice(BADGE_SVG.indexOf('>') + 1, BADGE_SVG.lastIndexOf('</svg>'))
      .replace(/#ffffff/g, '@FG@')
      .replace(/#416ea8/g, '@BG@')
      .replace(/@FG@/g, fg)
      .replace(/@BG@/g, bg)}</svg>`;

// The word "profstopick" alone, any flat color. h = letter box height in mm.
export const word = (h, color = C.ink, style = '') =>
  `<svg class="lg" style="height:${h}mm;width:${(h * WORD_RATIO).toFixed(2)}mm;${style}" viewBox="0 0 255 51" xmlns="http://www.w3.org/2000/svg">${
    WORD_ONLY.replace(/fill="#16181d"/g, `fill="${color}"`)}</svg>`;

// Word + badge, like the site header. h = height of the whole lockup.
export const lockup = (h, { color = C.ink, badgeBg = C.accent, badgeFg = '#fff', style = '' } = {}) =>
  `<div class="lockup" style="gap:${(h * 0.16).toFixed(2)}mm;${style}">${word(h, color)}${badge(h * 0.9, { bg: badgeBg, fg: badgeFg })}</div>`;

// ---------- drawings (line art from the site, joined by scripts/drawings.py) ----------
// group = spot | scene | object | avatar | nav. set = '' (dark lines, blue fill) or '-navy' (white lines, light-blue fill).
const drawCache = new Map();
export function drawing(group, name, set = '') {
  const k = `${group}/${name}${set}`;
  if (!drawCache.has(k)) drawCache.set(k, `data:image/png;base64,${readFileSync(root(`assets/kit/ready/${k}.png`)).toString('base64')}`);
  return drawCache.get(k);
}
// An <img> of a drawing, w mm wide (drawings are square).
export const art = (group, name, w, { set = '', style = '' } = {}) =>
  `<img class="lg" style="width:${w}mm;height:${w}mm;${style}" src="${drawing(group, name, set)}" alt="" />`;

// Confetti motif (small shapes from the site: sparkle-four, sparkle-small, asterisk, squiggle-long ...). Any color.
const cfCache = new Map();
export const confetti = (name, w, color = C.sky, style = '') => {
  if (!cfCache.has(name)) {
    const svg = readFileSync(root(`assets/kit/motif/confetti/${name}.svg`), 'utf8');
    cfCache.set(name, svg.slice(svg.indexOf('<svg')).replace(/width="[^"]*" height="[^"]*"/, 'width="100%" height="100%"').replace(/fill="#[0-9a-fA-F]{6}"/g, 'fill="currentColor"'));
  }
  return `<span class="cf" style="width:${w}mm;height:${w}mm;color:${color};${style}">${cfCache.get(name)}</span>`;
};

// ---------- QR ----------
const qrCache = new Map();
// A real QR code. Default: the sign-in page (make an account).
export async function qr(text = URLS.signup, size = 40, { color = C.ink, style = '' } = {}) {
  if (!qrCache.has(text)) qrCache.set(text, await QRCode.toString(text, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#000000ff', light: '#00000000' } }));
  const svg = qrCache.get(text).replace(/stroke="#000000"/g, `stroke="${color}"`).replace(/fill="#000000"/g, `fill="${color}"`);
  return `<div class="qr" style="width:${size}mm;height:${size}mm;${style}">${svg}</div>`;
}

// ---------- fonts + base CSS for every print page ----------
// Onest (body) and Red Hat Mono (code) are the site's two fonts.
// Onest and Red Hat Mono have no peso sign (₱, U+20B1), so the ₱ alone comes from Inter (see peso()).
export const FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@400..900&family=Onest:wght@400..900&family=Red+Hat+Mono:wght@400..700&display=block';

// Wrap every ₱ so it renders in Inter on purpose, not in a random system font.
export const peso = (text) => String(text).replace(/₱/g, '<span class="peso">₱</span>');

export const BASE_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:Onest,sans-serif;color:${C.ink};background:#fff}
.pg{position:relative;overflow:hidden;break-after:page;page-break-after:always}
.pg:last-child{break-after:auto;page-break-after:auto}
.fill{position:absolute;inset:0;width:100%;height:100%}
.abs{position:absolute}
.lg{display:block;flex:none}
.lockup{display:flex;align-items:center}
.d{font-weight:800;letter-spacing:-0.035em;line-height:0.98}
.t{font-weight:500;letter-spacing:-0.01em;line-height:1.3}
.m{font-family:"Red Hat Mono",monospace;font-weight:500;letter-spacing:0.02em;line-height:1.2}
.nw{white-space:nowrap}
.qr{position:relative;flex:none}
.qr svg{display:block;width:100%;height:100%}
.cf{display:block;position:absolute}
.cf svg{display:block}
.peso{font-family:Inter,sans-serif;font-weight:inherit;letter-spacing:0;margin-right:0.02em}
`;

// ---------- QR on its own tile (added for booth.mjs) ----------
// A QR with the white quiet zone built in: a `bg` tile w mm wide, the code in the middle with `quiet` modules
// of space on every side (4 is the QR rule). ecl 'H' fixes up to 30% damage. A higher `version` gives more,
// smaller modules, so the same code can be bigger inside a tile of the same width.
// foot = html shown under the code, inside the tile, after the quiet zone; footH = its height in mm.
// Returns { html, mm: size of the code, zone: quiet zone in mm, modules, version }.
export function qrTile(text, w, { color = C.ink, bg = '#fff', ecl = 'H', version, quiet = 4, radius = 0, foot = '', footH = 0, style = '' } = {}) {
  const code = QRCode.create(text, { errorCorrectionLevel: ecl, ...(version ? { version } : {}) });
  const n = code.modules.size, total = n + 2 * quiet, u = w / total;
  let d = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!code.modules.get(r, c)) continue;
      let e = c; while (e + 1 < n && code.modules.get(r, e + 1)) e++;
      d += `M${c + quiet} ${r + quiet}h${e - c + 1}v1h-${e - c + 1}z`;
      c = e;
    }
  }
  const svg = `<svg style="display:block;width:${w}mm;height:${w}mm" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><path fill="${color}" d="${d}"/></svg>`;
  const html = `<div class="qrt" style="width:${w}mm;height:${(w + footH).toFixed(2)}mm;background:${bg};border-radius:${radius}mm;overflow:hidden;${style}">${svg}${
    foot ? `<div style="height:${footH}mm;display:flex;align-items:flex-start;justify-content:center">${foot}</div>` : ''}</div>`;
  return { html, mm: +(n * u).toFixed(2), zone: +(quiet * u).toFixed(2), modules: n, version: code.version };
}

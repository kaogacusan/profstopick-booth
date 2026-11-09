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
  blue: '#2c5092',      // v3 + v6 ground: between accent and navy, so the light-blue word reads on it (4.2:1)
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
    // span: how long the pass lasts, as the card front says it ("1 year of profstopick")
    { id: 'semester', name: 'Semester Pass', price: '₱99', per: '/ semester', span: '1 semester', about: 'One enlistment and the semester after it.', month: 'about ₱20 a month' },
    // main: the pass the booth pushes (plan: "MAIN SALE"). It is first and biggest on every print.
    { id: 'year', name: 'Year Pass', price: '₱150', per: '/ year', span: '1 year', about: 'Two enlistments and everything between.', month: '₱15 a month', main: true },
    { id: 'graduation', name: 'Graduation Pass', price: '₱250', per: '/ 4 years', span: '4 years', about: 'Pay once. Every enlistment until you graduate.', month: 'about ₱6 a month' },
  ],
  pick: 'Our pick',                                         // the tag on the main pass
  every: ['Unlimited advisor asks', 'Full refund within 7 days'],
  // Online payment (Xendit or PayMongo) is not on yet. At the booth: cash, GCash, or Maya, then a voucher code.
  pay: 'cash, GCash, or Maya',
  booth: 'Buy at our booth on Red Brick Road, Nov 9–13. Pay with cash, GCash, or Maya.',
  redeem: 'We give you a code. Redeem it at profstopick.com/pass.',
  // Not on the prints: Sir Ingco does not like it (Oct 30). Put it back on the flyer only if the team keeps it.
  referral: 'Refer a friend who buys a paid pass. Get 50% off your own pass.',
  ig: '@profs.to.pick',
  email: 'ateneoprofstopick@gmail.com',
  bazaar: 'Nov 9–13',
  // The pass card: the front says "1 year of profstopick" with the pass name, like a paid plan. The back prints the
  // voucher code. The public files show this sample.
  // Real codes never go in assets/ (the site is public): `npm run cards -- <codes.txt>` makes a private PDF.
  sampleCode: 'XXXX-XXXX',
};

// Hook flyers: one question a student already asks, big, then the site headline (F.headline) under it on every one.
// q: \n = new line, *word* = the accent word. size = question type size in mm on v1–v3 (v4–v6 have no drawing, so
// they set it 2 mm bigger). The longest line must fit 89 mm.
// art = the drawing on the rich looks (v1–v3), [group, name] in assets/kit/ready.
export const HOOKS = [
  { id: 'easy-a', q: 'Want an\n*easy A?*', size: 20, art: ['object', 'exam-paper'] },
  { id: 'workload', q: 'Don’t want\na *heavy*\nworkload?', size: 16, art: ['object', 'workload-gauge'] },
  { id: 'chill', q: 'Want your\nnext sem to\nbe *chill*?', size: 15, art: ['spot', 'paint-free-hour-spot'] },
  { id: 'strict', q: 'Don’t like\n*strict*\nprofs?', size: 16, art: ['spot', 'compare-professor-spot'] },
  { id: 'worried', q: 'Worried\nabout a\n*subject*?', size: 17, art: ['object', 'difficulty-stair'] },
  { id: 'eight-am', q: 'Hate\n*8 AM*\nclasses?', size: 17, art: ['spot', 'enlistment-rush-spot'] },
];

// Staff FAQ (A4, two pages, for the team, not for visitors): what people ask at the booth, and what to say.
// From the live site (/pass, /help, /about, /privacy, /terms), the All Info file, and the Business Preparation
// Report pt. 2 (pricing matrix, Challenge 01 account sharing, Challenge 02 data privacy and scraping).
// [section, [[question, answer], ...], page]  page 0 = front, 1 = back.
const P = Object.fromEntries(F.passes.map((p) => [p.id, p]));
export const FAQ = [
  ['The site', [
    ['What is profstopick?', 'A site for enlistment. Prof reviews, grading statistics, live section schedules, a schedule builder, and an AI advisor.'],
    // source: the team (Nov 9)
    ['Who made it?', 'Gelo, a software developer who works at a software technology company with one of our members.'],
    ['Is it from Ateneo?', 'No. Students run it. It is not part of any school.'],
    ['Which schools?', 'Ateneo, UPD, DLSU, and Mapúa.'],
    ['What does a score mean?', 'It sums up how students feel about the prof. It is not a grade. Few comments: read the comments. No comments: no score.'],
    ['How do I find my prof?', 'Search a surname or a course code, like MATH 30.23. Always check section times in the official enlistment system.'],
  ], 0],
  // Report pt. 2, Challenge 02: Data Privacy and Scraping. /privacy: "we do not sell anything". /terms: take down while we look.
  ['Reviews and privacy', [
    ['Where do the reviews come from?', 'Mostly the Profs to Pick Facebook group, where students post about their profs. Students can also post reviews on the site.'],
    // source: the team (Nov 9)
    ['Why not just use the Facebook group?', 'The group is slow. You scroll through so many posts and read so many comments just to get a feel for one prof. We collected all of it and built statistics for each prof, so you see right away if they give easy A’s, if the workload is heavy, if they are strict, and more.'],
    ['Are you just copying the Facebook posts?', 'No. We do not republish Facebook posts, and we do not build profiles on the students who wrote them. We turn the reviews into information about the prof: workload, grading fairness, and whether a 4.0 is attainable.'],
    ['What about data privacy? Is it anonymous?', 'Yes. Every review is de-identified before it goes up. No one can see who wrote it, and nothing on the site links back to the person.'],
    ['What do you remove?', 'Reviewer names and usernames, profile links, phone numbers and emails, student IDs and tags, any mention that could identify the reviewer, unrelated personal details, and outside links.'],
    ['How is it cleaned?', 'Every review goes through automated cleaning, then a manual check, before it is published. Then it is scored on workload, grading fairness, and 4.0 attainability.'],
    ['Is that legal? Do you sell data?', 'We follow the Data Privacy Act of 2012 (RA 10173). We keep only what we need to describe the prof and strip out personal information. We sell no data, to anyone.'],
    ['I wrote a review, or one is about me.', `Message ${F.email} or ${F.ig}. We take it down while we check.`],
  ], 0],
  ['Free or paid', [
    ['Is it free?', `Yes. Reviews, ratings, and the basic schedule builder are free. Free gets ${F.free.lines[2]}.`],
    ['What does a pass add?', 'Unlimited AI advisor asks. Ask who to take for a course. It answers from the reviews and the sections.'],
    ['Which pass should I get?', `“If you want to try it out, get the ${P.semester.name}. But we recommend the ${P.year.name}, or the ${P.graduation.name}, which lasts your entire 4 years in Ateneo.”`],
    ['Can I get my money back?', `Yes. Full refund within 7 days. Message ${F.email} or ${F.ig}.`],
  ], 1],
  // source: the team (Nov 9). The advisor is a locally hosted AI on the team's own PC, at home, reached remotely.
  ['The AI advisor', [
    ['Why is there AI?', 'It is one part of the site. Reviews, grading statistics, and the schedule builder work without it. The advisor only answers when you ask it.'],
    ['Isn’t AI bad for the environment?', 'Our AI is hosted locally. It runs on our own PC at home, which we reach remotely, not in a data center. It uses no data center resources, only our own PC’s.'],
    ['Where do my questions go?', 'To our own PC at home. Not to a big AI company’s servers.'],
  ], 1],
  ['Paying and the code', [
    ['How do I pay?', `${F.pay[0].toUpperCase()}${F.pay.slice(1)}, here at the booth. Online payment is not on yet. For GCash or Maya, check that the payment came in before you write the code.`],
    ['How do I use my code?', 'The code is written on the back of the pass card. Scan the QR or type profstopick.com, make an account, then go to profstopick.com/pass, type the code under “Have a code”, and tap Redeem.'],
    ['The QR or code does not work.', '“Give us your email, the one you use to sign up on profstopick, and we’ll add the pass to your account.”'],
  ], 1],
];

// How to make a sale, in four steps (the team, Nov 9). On the staff FAQ and the sales script.
export const SALE_STEPS = [
  ['Talk to them.', 'Show them why profstopick is good for them this enlistment.'],
  ['Bring them to the booth.', 'Ask them to come with you to the booth. If you let them go, they will not come back to pay.'],
  ['Get them to pay.', 'Cash, or they scan the GCash QR. Try to not let them go easily.'],
  ['Give them the voucher.', 'Write the code on the back of the pass card for their pass. No code? Ask Prince.'],
];

// The sales script (onboarding for the team). Short on purpose: people walking by do not want a speech.
// Ask 1 or 2 questions, then bring them to the booth. The laptop does the selling.
// Each step: [title, what it is for, [lines], tip]. A line is [who, words]; who = 'you' or 'do'.
export const SCRIPT = [
  ['Ask 1 or 2 questions', 'Keep it short. They are walking by. Pick from these.', [
    ['you', 'Did you know it’s enlistment season na on Thursday?'],
    ['you', 'Are you in the Profs to Pick Facebook group?'],
    ['you', 'Are you gonna choose your profs?'],
  ], 'Smile. If they stop and answer, go to step 2.'],
  ['Bring them to the booth', 'That is the whole goal. Do not explain everything.', [
    ['you', 'We have a website with stats for every prof: easy A’s, workload, if they’re strict. Come check out our booth, we’ll show you how it works!'],
    ['do', 'Walk with them to the booth.'],
  ], 'If you let them go, they will not come back.'],
  ['At the booth', 'Let them see their own prof, then ask them to pay.', [
    ['do', 'Let them search their prof on the laptop.'],
    ['you', '₱99 for a semester, ₱150 for a year, or ₱250 until you graduate. Cash or GCash?'],
    ['do', 'Write the code on the back of their pass card and give it. No code? Ask Prince.'],
  ], 'Try to not let them go easily. Help them redeem the code right there.'],
];

// What to say back, short. [what they say, what you say]. Anything else: the Booth FAQ.
export const OBJECTIONS = [
  ['I’ll come back later.', 'It only takes a minute. This can literally decide if you get good grades for your next sem.'],
  ['Is it free?', 'Reviews are free. The pass adds unlimited AI advisor asks.'],
  ['I don’t like AI.', 'It runs on our own PC at home, not in a data center, so it doesn’t harm the environment.'],
  ['Is my data safe? What about the Facebook posts?', 'Yes. Every review is anonymous. We remove names and anything that could identify who wrote it.'],
];

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
  { id: 'v3', label: 'Blue', about: 'V2 in blue: the same layout as V2, on solid blue with white type, light-blue accents, and see-through boxes.' },
  { id: 'v4', label: 'Navy, simple', about: 'V1 with less: navy and white, one light-blue word. No drawings, no sparkles, no boxes.' },
  { id: 'v5', label: 'Paper, simple', about: 'V2 with less: light paper and dark type. No drawings, no cards, no extra lines.' },
  { id: 'v6', label: 'Blue, simple', about: 'V3 with less: solid blue, one light-blue word, only the headline, the QR, and the site.' },
];

// Colors per look. bg = page, ink = main text, sub = second text, hi = the one accent word,
// rule = thin lines, card = boxes, word = wordmark color, tile = what a QR sits on,
// draw = drawing set ('' = dark lines; '-fill' = navy lines, people filled white, so skin is not blue on a dark ground),
// tagBg = the pill behind the "Our pick" tag, link = small blue text, well = a box with no line (v2 and v3 only).
export const LOOK = {
  v1: { bg: C.navy, ink: '#fff', sub: '#c9dbf7', hi: C.sky, rule: 'rgba(154,192,244,0.35)', card: 'rgba(255,255,255,0.07)', word: '#fff', tile: '#fff', draw: '-fill' },
  v2: { bg: C.paper, ink: C.ink, sub: C.ink2, hi: C.accent, rule: C.line, card: '#fff', word: C.ink, tile: '#fff', draw: '', tagBg: C.tint, link: C.deep, well: C.well },
  // v3 = v2's layout in blue: the same tokens, so one function draws both
  v3: { bg: C.blue, ink: '#fff', sub: '#e3ecf9', hi: C.sky, rule: 'rgba(255,255,255,0.4)', card: 'rgba(255,255,255,0.1)', word: '#fff', tile: '#fff', draw: '-fill',
    tagBg: 'rgba(154,192,244,0.2)', link: C.sky, well: 'rgba(13,59,122,0.5)' },
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

// "profstopick.com" in the logo's letters. The wordmark is Quicksand Bold, so ".com" is set in Quicksand 700,
// sized and spaced to sit on the same baseline (checked by laying one over the other).
export const wordCom = (h, color = C.ink, style = '') =>
  `<div class="nw" style="display:inline-flex;align-items:flex-start;${style}">${word(h, color)}<span style="font-family:Quicksand,sans-serif;font-weight:700;font-size:${(h * 0.912).toFixed(2)}mm;line-height:1;letter-spacing:-0.012em;margin-top:${(-h * 0.03).toFixed(2)}mm;margin-left:${(h * 0.02).toFixed(2)}mm;color:${color}">.com</span></div>`;

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
export const FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@400..900&family=Onest:wght@400..900&family=Red+Hat+Mono:wght@400..700&family=Quicksand:wght@700&display=block';

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

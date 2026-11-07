// Print files for the profstopick booth (Nov 9–13, Red Brick Road): every printed piece, in six looks.
// Sizes in mm. `piece` is the id the 3D model uses. A version's html(i) returns page i.
// Words come from F in kit.mjs only. Looks: v1 Navy card, v2 Paper, v3 Big type, and v4–v6, the same three
// with less (LOOK in kit.mjs). One QR on every print: profstopick.com.
// Every ₱ goes through peso() at the end (Onest has no ₱, so it is set in Inter on purpose).
import { C, F, URLS, LOOK, margin, word, badge, lockup, art, confetti, qrTile, peso } from './kit.mjs';

// ---------- small helpers ----------
const at = (x, y, inner, style = '', cls = '') => `<div class="abs ${cls}" style="left:${x}mm;top:${y}mm;${style}">${inner}</div>`;
// like at(), but y is the space under the block
const atb = (x, y, inner, style = '', cls = '') => `<div class="abs ${cls}" style="left:${x}mm;bottom:${y}mm;${style}">${inner}</div>`;
// a column that fills the margin box; its children spread out evenly from top to bottom
const column = (m, w, h, inner, style = '') => `<div class="abs" style="left:${m}mm;top:${m}mm;width:${w - 2 * m}mm;height:${h - 2 * m}mm;display:flex;flex-direction:column;justify-content:space-between;${style}">${inner}</div>`;
const ground = (v) => `<div class="fill" style="background:${LOOK[v].bg}"></div>`;

// the logo per look: on navy and blue the badge turns white with a colored star, like the share card
const LOGO = {
  v1: { color: '#fff', badgeBg: '#fff', badgeFg: C.navy },
  v2: { color: C.ink, badgeBg: C.accent, badgeFg: '#fff' },
  // v3 star is navy, not accent: badge() in kit.mjs turns an accent star white (its fill replace runs twice)
  v3: { color: '#fff', badgeBg: '#fff', badgeFg: C.navy },
};
LOGO.v4 = LOGO.v1; LOGO.v5 = LOGO.v2; LOGO.v6 = LOGO.v3;
const logo = (v, h) => lockup(h, LOGO[v]);
const mark = (v, h) => badge(h, { bg: LOGO[v].badgeBg, fg: LOGO[v].badgeFg });

// The one accent word, in the look's accent color (v3 + v6: navy on the blue ground). No box behind it.
const hi = (v, t) => `<span style="color:${LOOK[v].hi}">${t}</span>`;
// a small label in a navy block (v3 only), for the main pass tag (F.pick)
const tag3 = (t, size) => `<span class="nw" style="display:inline-block;background:${C.navy};color:#fff;font-size:${size}mm;font-weight:700;letter-spacing:-0.005em;line-height:1;padding:${(size * 0.32).toFixed(2)}mm ${(size * 0.55).toFixed(2)}mm;border-radius:${(size * 0.18).toFixed(2)}mm">${t}</span>`;

// faint sparkles like the share card. list = [name, w, x, y, opacity?]
const CF = { v1: [C.sky, 0.32], v2: [C.accent, 0.22], v3: ['#fff', 0.28] };
const stars = (v, list) => list.map(([n, w, x, y, op]) => confetti(n, w, CF[v][0], `left:${x}mm;top:${y}mm;opacity:${op ?? CF[v][1]}`)).join('');

// a check mark, like the site's icons
const tick = (w, color, style = '') => `<svg class="lg" style="width:${w}mm;height:${w}mm;${style}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 12.8l4.6 4.6L19.6 6.9" fill="none" stroke="${color}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
// lines with checks (F.every, F.features)
const checks = (list, { size, tickSize, color, tickColor, gap, row = false }) =>
  list.map((e) => `<div class="nw" style="display:flex;gap:${(size * 0.5).toFixed(2)}mm;align-items:center;font-size:${size}mm;font-weight:600;line-height:1.2;color:${color}">${tick(tickSize, tickColor)}<span>${e}</span></div>`)
    .join('')
    .replace(/^/, `<div style="display:flex;${row ? 'justify-content:space-between' : 'flex-direction:column'};gap:${gap}mm">`) + '</div>';
const everyList = (o) => checks(F.every, o);

// the short link under the QR (types fine if the QR does not scan), and the words that ask for the scan
const SHORT = { home: 'profstopick.com', pass: 'profstopick.com/pass' };
const CTA = ['Scan to', 'try it free.'];
// v4–v6 are the simple looks
const simple = (v) => +v.slice(1) > 3;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// passes: the main sale first (plan: the Year Pass), then the rest by price
const [SEM, , GRAD] = F.passes;
const MAIN = F.passes.find((p) => p.main);
const ORDER = [MAIN, ...F.passes.filter((p) => !p.main)];
const FREE = { name: F.free.name, price: F.free.price, per: '', about: `${F.free.lines.map((l, i) => (i ? l[0].toLowerCase() + l.slice(1) : l)).join(', ')}.` };

// ======================================================================
// Standing banner, 0.6 × 1.6 m. Seen from 2–4 m. No prices: the price list and the flyer have them.
// People may hide the lower third, so the logo and the headline stay in the top two thirds (above 1067 mm).
// Sizes: wordmark 400+ mm wide, headline caps 59 mm or more.
// ======================================================================
const BW = 600, BH = 1600, BM = margin(BW, BH), BCW = BW - 2 * BM;

// v4–v6: logo, the headline on four lines as big as it fits, one more thing (v4, v5), the site. Nothing else.
const simpleBanner = (v) => {
  const k = LOOK[v], big = v === 'v6' ? 196 : 190;
  const more = v === 'v4' ? at(BM, 1030, F.what, `width:${BCW}mm;font-size:36mm;line-height:1.3;color:${k.sub}`, 't')
    : v === 'v5' ? at(BM, 1030, F.features.join('<br>'), `font-size:38mm;font-weight:600;line-height:1.35;color:${k.sub}`, 'nw')
    : '';
  return `
    ${ground(v)}
    ${at(BM, 60, v === 'v6' ? word(86, k.word) : logo(v, 80))}
    ${at(BM - 6, 206, `Pick<br>the<br>right<br>${hi(v, 'prof.')}`, `font-size:${big}mm;color:${k.ink}`, 'd nw')}
    ${more}
    ${atb(BM - 2, BM, F.site, `font-size:${v === 'v6' ? 62 : 56}mm;color:${v === 'v5' ? C.accent : k.ink}`, 'd nw')}`;
};

// v1 + v2: the share card layout. v1 on navy, v2 the same on light paper.
const shareBanner = (v) => {
  const k = LOOK[v];
  return `
    ${ground(v)}
    ${stars(v, [['sparkle-four', 40, 452, 332], ['sparkle-small', 20, 372, 372], ['circle', 10, 330, 188], ['sparkle-four', 26, 66, 1060], ['circle', 9, 92, 1488], ['sparkle-small', 22, 528, 1028]])}
    ${at(BM, 60, logo(v, 80))}
    ${at(BM - 3, 236, `Pick the right<br>${hi(v, 'prof.')}`, `font-size:84mm;color:${k.ink}`, 'd nw')}
    ${at(BM, 446, F.what, `width:${BCW}mm;font-size:31mm;line-height:1.3;color:${k.sub}`, 't')}
    ${at(BM, 628, `<div style="border-top:1.6mm solid ${k.rule};padding-top:40mm">
      ${checks(F.features, { size: 36, tickSize: 34, color: k.ink, tickColor: k.hi, gap: 20 })}</div>`, `width:${BCW}mm`)}
    ${at(BW - BM - 440, 990, art('scene', 'landing-compare', 440, { set: k.draw }))}
    ${atb(BM - 2, BM, F.site, `font-size:52mm;color:${k.ink}`, 'd nw')}`;
};

const banner = {
  id: 'banner', piece: 'banner', name: 'Standing banner', size: '0.6 m × 1.6 m', mm: [BW, BH], pages: ['Banner'],
  print: 'Tarp or banner cloth. Print at 100 dpi or more. Check the size against the stand before you print.',
  versions: [
    { id: 'v1', note: 'Like the share card: navy, “prof.” in light blue, what the site does, the four features, and the drawing.', html: () => shareBanner('v1') },
    { id: 'v2', note: 'V1 on light paper: dark type, “prof.” in brand blue, the same features and drawing. No box.', html: () => shareBanner('v2') },
    {
      id: 'v3',
      note: 'Fewest words: the name, the headline as big as it fits, the four features, and the site in big type at the bottom.',
      html: () => {
        const k = LOOK.v3;
        return `
        ${ground('v3')}
        ${at(BM, 60, word(86, k.word))}
        ${at(BM - 5, 222, `Pick<br>the right<br>${hi('v3', 'prof.')}`, `font-size:132mm;color:${k.ink}`, 'd nw')}
        ${at(BM, 690, F.features.join('<br>'), `font-size:44mm;font-weight:700;letter-spacing:-0.02em;line-height:1.25;color:${k.ink}`, 'nw')}
        ${at(BW - BM - 400, 1040, art('scene', 'landing-schedule', 400, { set: k.draw }))}
        ${atb(BM - 2, BM, F.site, `font-size:62mm;color:${k.ink}`, 'd nw')}`;
      },
    },
    { id: 'v4', note: 'V1 with less: the logo, the headline, one line on what it does, and the site. No drawing, no sparkles.', html: () => simpleBanner('v4') },
    { id: 'v5', note: 'V2 with less: the logo, the headline, the four features as plain lines, and the site. No card, no drawing.', html: () => simpleBanner('v5') },
    { id: 'v6', note: 'V3 with less: the name, the headline, and the site. Three things, read from across the road.', html: () => simpleBanner('v6') },
  ],
};

// ======================================================================
// QR sign, A5. One sign, one QR: the website, profstopick.com. One stand.
// The QR fills the 124 mm text column, with a 4-module white quiet zone and high error fix.
// ======================================================================
const AW = 148, AH = 210, AM = margin(AW, AH), ACW = AW - 2 * AM;
const signTile = (opts = {}) => qrTile(URLS.home, ACW, opts);

const qrSign = {
  id: 'qr', piece: 'qr', name: 'QR sign', size: 'A5, 148 × 210 mm', mm: [AW, AH], pages: ['Sign'],
  print: 'Paper or photo paper, cut to A5. Fits the A5 acrylic stand. Print 1. Scan the QR with 2 phones before you print.',
  versions: [
    {
      id: 'v1',
      note: 'Navy with the QR on a white tile and one light-blue line, like the share card.',
      html: () => {
        const k = LOOK.v1;
        return `
        ${ground('v1')}
        ${stars('v1', [['sparkle-four', 8, 120, 13], ['sparkle-small', 4.6, 108, 22], ['circle', 1.8, 96, 15]])}
        ${at(AM, AM, `${CTA[0]}<br>${hi('v1', CTA[1])}`, `font-size:20mm;color:${k.ink}`, 'd nw')}
        ${at(AM, 62, signTile({ radius: 2.4 }).html)}
        ${atb(AM, AM, `<span>${SHORT.home}</span>${logo('v1', 5.6)}`, `width:${ACW}mm;display:flex;justify-content:space-between;align-items:center;font-size:4.4mm;color:${k.ink}`, 'm nw')}`;
      },
    },
    {
      id: 'v2',
      note: 'Like the app: the QR sits in a white card with a thin line, and the link is inside the card.',
      html: () => {
        const k = LOOK.v2;
        const t = signTile({
          footH: 13,
          foot: `<div class="m nw" style="width:100%;border-top:0.3mm solid ${C.line};padding-top:3.4mm;text-align:center;font-size:4.4mm;color:${C.deep}">${SHORT.home}</div>`,
        });
        return `
        ${ground('v2')}
        ${at(AM, AM, logo('v2', 7))}
        ${at(AM - 0.6, 27, `Try it ${hi('v2', 'free.')}`, `font-size:17mm;color:${k.ink}`, 'd nw')}
        ${at(AM, 46, 'Prof reviews, schedules, and an AI advisor.', `font-size:5mm;font-weight:500;color:${k.sub}`, 'nw')}
        ${at(AM, 57, `<div style="border:0.3mm solid ${C.line};border-radius:1.4mm;overflow:hidden;background:#fff">${t.html}</div>`)}`;
      },
    },
    {
      id: 'v3',
      note: 'Solid blue, three words in big type, and the QR as wide as the sign allows.',
      html: () => {
        const k = LOOK.v3;
        return `
        ${ground('v3')}
        ${at(AM - 1, AM + 1, `Try it ${hi('v3', 'free.')}`, `font-size:19.5mm;color:${k.ink}`, 'd nw')}
        ${at(AM, 51, signTile({ radius: 2.4 }).html)}
        ${atb(AM, AM, `<span>${SHORT.home}</span>${word(4.6, k.word)}`, `width:${ACW}mm;display:flex;justify-content:space-between;align-items:center;font-size:4.6mm;font-weight:600;color:${k.ink}`, 'nw')}`;
      },
    },
    {
      id: 'v4',
      note: 'V1 with less: the ask, the QR, the site. No sparkles, no logo row.',
      html: () => {
        const k = LOOK.v4;
        return `
        ${ground('v4')}
        ${at(AM, AM, `${CTA[0]}<br>${hi('v4', CTA[1])}`, `font-size:20mm;color:${k.ink}`, 'd nw')}
        ${at(AM, 62, signTile({ radius: 2.4 }).html)}
        ${atb(AM, AM, SHORT.home, `font-size:6mm;font-weight:600;color:${k.ink}`, 'm nw')}`;
      },
    },
    {
      id: 'v5',
      note: 'V2 with less: the logo, two words, the QR, the site. No card, no extra line.',
      html: () => {
        const k = LOOK.v5;
        return `
        ${ground('v5')}
        ${at(AM, AM, logo('v5', 7))}
        ${at(AM - 0.6, 30, `Try it ${hi('v5', 'free.')}`, `font-size:19mm;color:${k.ink}`, 'd nw')}
        ${at(AM, 58, signTile({ radius: 2.4 }).html)}
        ${atb(AM, AM, SHORT.home, `font-size:5.4mm;color:${k.sub}`, 'm nw')}`;
      },
    },
    {
      id: 'v6',
      note: 'V3 with less: three words, the QR, and the site in big type.',
      html: () => {
        const k = LOOK.v6;
        return `
        ${ground('v6')}
        ${at(AM - 1, AM + 1, `Try it ${hi('v6', 'free.')}`, `font-size:19.5mm;color:${k.ink}`, 'd nw')}
        ${at(AM, 51, signTile({ radius: 2.4 }).html)}
        ${atb(AM - 0.5, AM, SHORT.home, `font-size:12mm;color:${k.ink}`, 'd nw')}`;
      },
    },
  ],
};

// ======================================================================
// Price list, A4, on the table. The Year Pass first and biggest: it is the main sale (plan).
// ======================================================================
const PW = 210, PH = 297, PM = margin(PW, PH), PCW = PW - 2 * PM;

const priceRow = (v, p) => {
  const k = LOOK[v];
  return `<div style="display:flex;justify-content:space-between;align-items:center;gap:10mm;padding:5mm 0;border-top:0.35mm solid ${k.rule}">
    <div><div class="nw" style="font-size:6.4mm;font-weight:700;letter-spacing:-0.015em;color:${k.ink}">${p.name}</div>
      <div style="font-size:4.2mm;font-weight:500;line-height:1.35;margin-top:1.4mm;color:${k.sub}">${p.about}</div></div>
    <div class="nw" style="text-align:right"><span class="d" style="font-size:13mm;color:${k.ink}">${p.price}</span>${p.per ? `<div style="font-size:4mm;font-weight:600;margin-top:1mm;color:${k.sub}">${p.per}</div>` : ''}</div>
  </div>`;
};

// v4–v6: the passes and their prices. No boxes, no drawing, no small print.
const simplePrices = (v) => {
  const k = LOOK[v];
  const row = (p) => `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:5mm 0 3.6mm;border-top:0.35mm solid ${k.rule}">
    <span class="nw" style="font-size:8.4mm;font-weight:700;letter-spacing:-0.02em;color:${k.ink}">${p.name}</span>
    <span class="d nw" style="font-size:20mm;color:${k.ink}">${p.price}</span></div>`;
  return `
    ${ground(v)}
    ${column(PM, PW, PH, `
      <div>${v === 'v6' ? word(9, k.word) : logo(v, 9)}<div class="d nw" style="font-size:19mm;margin:12mm 0 0 -1mm;color:${k.ink}">Pick a ${hi(v, 'pass.')}</div></div>
      <div>
        <div class="nw" style="font-size:10mm;font-weight:700;letter-spacing:-0.02em;color:${k.ink}">${MAIN.name}</div>
        <div class="d nw" style="font-size:64mm;line-height:0.8;margin:9mm 0 0 -1.5mm;color:${k.block ? k.ink : k.hi}">${MAIN.price}</div>
      </div>
      <div>${row(GRAD)}${row(SEM)}${row(FREE)}</div>
      <div class="nw" style="font-size:5.6mm;font-weight:600;color:${k.ink}">Pay with ${F.pay}.</div>`)}`;
};

const prices = {
  id: 'prices', piece: 'prices', name: 'Price list', size: 'A4, 210 × 297 mm', mm: [PW, PH], pages: ['Price list'],
  print: 'Paper or photo paper, A4. Print at 100% (no fit to page).',
  versions: [
    {
      id: 'v1',
      note: 'Navy. The Year Pass sits in its own box with the price in light blue; the rest are plain rows.',
      html: () => {
        const k = LOOK.v1;
        return `
        ${ground('v1')}
        ${stars('v1', [['sparkle-four', 8, 176, 22], ['sparkle-small', 5, 164, 40], ['circle', 2.6, 150, 26]])}
        ${column(PM, PW, PH, `
          <div>${logo('v1', 9)}<div class="d nw" style="font-size:19mm;margin:12mm 0 0 -1mm;color:${k.ink}">Pick a pass.</div></div>
          <div style="background:${k.card};border:0.35mm solid ${k.rule};border-radius:2mm;padding:8mm 9mm 9mm;display:flex;justify-content:space-between;align-items:flex-end">
            <div>
              <div class="nw" style="display:flex;gap:3.4mm;align-items:center">
                <span style="font-size:8mm;font-weight:700;letter-spacing:-0.02em;color:${k.ink}">${MAIN.name}</span>
                <span class="m" style="font-size:3.4mm;color:${k.sub};border:0.35mm solid ${k.rule};padding:1.2mm 2.8mm;border-radius:10mm">${F.pick}</span></div>
              <div class="d nw" style="font-size:34mm;line-height:0.86;margin-top:6mm;color:${k.hi}">${MAIN.price}</div>
              <div class="nw" style="font-size:5mm;font-weight:600;margin-top:5mm;color:${k.sub}">${MAIN.per} · ${MAIN.month}</div>
              <div class="nw" style="font-size:5mm;font-weight:500;margin-top:2.4mm;color:${k.ink}">${MAIN.about}</div>
            </div>
            ${art('object', 'season-ticket', 38, { set: k.draw, style: 'margin:0 -2mm 6mm 0' })}
          </div>
          <div>${priceRow('v1', GRAD)}${priceRow('v1', SEM)}${priceRow('v1', FREE)}</div>
          <div>
            <div class="m" style="font-size:3.6mm;color:${k.sub};margin-bottom:3.4mm">Every pass</div>
            ${everyList({ size: 4.4, tickSize: 4.4, color: k.ink, tickColor: k.sub, gap: 4, row: true })}
          </div>
          <div>
            <div style="font-size:4.4mm;font-weight:600;color:${k.ink}">Pay with ${F.pay}.</div>
            <div class="m" style="display:flex;justify-content:space-between;margin-top:4mm;padding-top:3.4mm;border-top:0.35mm solid ${k.rule};font-size:3.6mm;color:${k.sub}"><span>${F.site}</span><span>${F.ig}</span></div>
          </div>`)}`;
      },
    },
    {
      id: 'v2',
      note: 'Like the /pass page: white cards with thin lines, the Year Pass card in a blue ring.',
      html: () => {
        const k = LOOK.v2;
        const small = (p) => `<div style="background:#fff;border:0.3mm solid ${C.line};border-radius:1.4mm;padding:5mm 5mm 5.5mm;display:flex;flex-direction:column">
          <div class="nw" style="font-size:5mm;font-weight:700;letter-spacing:-0.015em;color:${k.ink}">${p.name}</div>
          <div class="nw" style="margin-top:3mm"><span class="d" style="font-size:13mm;color:${k.ink}">${p.price}</span>${p.per ? `<span style="font-size:3.6mm;font-weight:600;margin-left:1.4mm;color:${k.sub}">${p.per}</span>` : ''}</div>
          <div style="font-size:3.8mm;font-weight:500;line-height:1.35;margin-top:3mm;color:${k.sub}">${p.about}</div>
          ${p.month ? `<div style="font-size:3.6mm;font-weight:600;margin-top:auto;padding-top:3mm;color:${C.deep}">${p.month}</div>` : ''}
        </div>`;
        return `
        ${ground('v2')}
        ${column(PM, PW, PH, `
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center">${logo('v2', 9)}<span class="m" style="font-size:3.6mm;color:${k.sub}">${F.site}</span></div>
            <div class="d nw" style="font-size:19mm;margin:12mm 0 0 -1mm;color:${k.ink}">Pick a ${hi('v2', 'pass.')}</div></div>
          <div style="background:#fff;border:0.6mm solid ${C.accent};border-radius:1.6mm;padding:7mm 8mm 8mm;display:flex;justify-content:space-between;align-items:flex-end">
            <div>
              <div class="nw" style="display:flex;gap:3mm;align-items:center">
                <span style="font-size:7.4mm;font-weight:700;letter-spacing:-0.02em;color:${k.ink}">${MAIN.name}</span>
                <span class="m" style="font-size:3.4mm;color:${C.accent};background:${C.tint};padding:1.2mm 2.8mm;border-radius:10mm">${F.pick}</span></div>
              <div class="nw" style="display:flex;align-items:baseline;gap:2.4mm;margin-top:5mm">
                <span class="d" style="font-size:30mm;line-height:0.86;color:${k.ink}">${MAIN.price}</span>
                <span style="font-size:5.6mm;font-weight:600;color:${k.sub}">${MAIN.per}</span></div>
              <div class="nw" style="font-size:4.6mm;font-weight:500;margin-top:5mm;color:${k.ink}">${MAIN.about}</div>
              <div class="nw" style="font-size:4.2mm;font-weight:600;margin-top:1.6mm;color:${C.deep}">${MAIN.month}</div>
            </div>
            ${art('object', 'season-ticket', 38, { set: k.draw, style: 'margin:0 -1mm 4mm 0' })}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4mm;align-items:stretch">${small(GRAD)}${small(SEM)}${small(FREE)}</div>
          <div style="background:${C.well};border-radius:1.4mm;padding:5mm 6mm 5.4mm">
            <div class="m" style="font-size:3.4mm;color:${k.sub};margin-bottom:3mm">Every pass</div>
            ${everyList({ size: 4.1, tickSize: 4.2, color: k.ink, tickColor: C.accent, gap: 3, row: true })}
          </div>
          <div class="nw" style="display:flex;gap:3mm;align-items:baseline;border-top:0.3mm solid ${C.line};padding-top:4mm">
            <span class="m" style="font-size:3.4mm;color:${k.sub}">Pay with</span><span style="font-size:4.4mm;font-weight:600;color:${k.ink}">${F.pay}</span></div>`)}`;
      },
    },
    {
      id: 'v3',
      note: 'Solid blue, prices only, as big as they fit. The Year Pass price fills the top half.',
      html: () => {
        const k = LOOK.v3;
        const line = (p) => `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:4mm 0 3mm;border-top:0.5mm solid ${k.rule}">
          <span class="nw" style="font-size:8mm;font-weight:700;letter-spacing:-0.02em;color:${k.ink}">${p.name}</span>
          <span class="d nw" style="font-size:20mm;color:${k.ink}">${p.price}</span></div>`;
        return `
        ${ground('v3')}
        ${column(PM, PW, PH, `
          <div>${word(9, k.word)}</div>
          <div>
            <div class="nw" style="display:flex;gap:4mm;align-items:center">
              <span style="font-size:9mm;font-weight:700;letter-spacing:-0.02em;color:${k.ink}">${MAIN.name}</span>${tag3(F.pick, 4.6)}</div>
            <div class="d nw" style="font-size:68mm;line-height:0.8;margin:8mm 0 0 -1.5mm;color:${k.ink}">${MAIN.price}</div>
            <div class="nw" style="font-size:7mm;font-weight:600;margin-top:8mm;color:${k.ink}">${MAIN.per} · ${MAIN.month}</div>
          </div>
          <div>${line(GRAD)}${line(SEM)}${line(FREE)}</div>
          <div>
            ${everyList({ size: 5.4, tickSize: 5.4, color: k.ink, tickColor: '#fff', gap: 2.6 })}
            <div style="margin-top:5mm;padding-top:4.4mm;border-top:0.5mm solid ${k.rule};font-size:5.4mm;font-weight:600;color:${k.ink}">Pay with ${F.pay}.</div>
          </div>`)}`;
      },
    },
    { id: 'v4', note: 'V1 with less: the Year Pass price big in light blue, then the other passes in plain rows. No box, no drawing.', html: () => simplePrices('v4') },
    { id: 'v5', note: 'V2 with less: the same rows on light paper. No cards, no small print.', html: () => simplePrices('v5') },
    { id: 'v6', note: 'V3 with less: solid blue, the prices and how to pay. Nothing else.', html: () => simplePrices('v6') },
  ],
};

// ======================================================================
// Flyer, A6, two sides. Members print 4 per A4 at home.
// ======================================================================
const FW = 105, FH = 148, FM = margin(FW, FH), FCW = FW - 2 * FM;

const flyerBack = (v) => {
  const k = LOOK[v];
  const small = v === 'v3' ? k.ink : k.sub;   // small text on the blue ground stays white
  const bestTag = v === 'v3' ? tag3(F.pick, 2.6)
    : `<span class="m" style="font-size:2.6mm;font-weight:500;${v === 'v2' ? `color:${C.accent};background:${C.tint}` : `color:${k.sub};border:0.25mm solid ${k.rule}`};padding:0.6mm 1.6mm;border-radius:4mm">${F.pick}</span>`;
  const row = (p) => `<div style="display:flex;justify-content:space-between;align-items:center;gap:4mm;padding:3.2mm 0;border-top:0.3mm solid ${k.rule}">
      <div><div class="nw" style="display:flex;gap:2mm;align-items:center;font-size:4.4mm;font-weight:700;letter-spacing:-0.01em;color:${k.ink}">${p.name}${p.main ? bestTag : ''}</div>
        <div style="font-size:3.1mm;font-weight:500;line-height:1.3;margin-top:0.9mm;color:${small}">${p.about}</div></div>
      <div class="nw" style="text-align:right"><div class="d" style="font-size:9mm;color:${v === 'v1' && p.main ? k.hi : k.ink}">${p.price}</div>
        <div style="font-size:2.9mm;font-weight:600;margin-top:0.8mm;color:${small}">${p.per}</div></div></div>`;
  const tickColor = v === 'v2' ? C.accent : (v === 'v1' ? k.sub : '#fff');
  return `
    ${ground(v)}
    ${column(FM, FW, FH, `
      <div>
        <div class="d nw" style="font-size:9mm;margin:0 0 4.4mm -0.4mm;color:${k.ink}">${v === 'v2' ? `Get the ${hi('v2', 'pass.')}` : 'Get the pass.'}</div>
        ${ORDER.map(row).join('')}
      </div>
      ${everyList({ size: 3.3, tickSize: 3.2, color: k.ink, tickColor, gap: 1.6 })}
      <div style="padding:3mm 3.6mm;border-radius:1.2mm;font-size:3.3mm;font-weight:600;line-height:1.35;${v === 'v2' ? `background:${C.tint};color:${C.ink}` : v === 'v1' ? `background:${k.card};border:0.3mm solid ${k.rule};color:${k.ink}` : `border:0.35mm solid ${k.rule};color:${k.ink}`}">${F.booth}</div>
      <div>
        <div style="font-size:3.1mm;font-weight:500;line-height:1.35;color:${v === 'v3' ? k.ink : k.sub}">${F.redeem}</div>
        <div class="m nw" style="display:flex;justify-content:space-between;margin-top:3mm;padding-top:2.6mm;border-top:0.3mm solid ${k.rule};font-size:3mm;color:${v === 'v3' ? k.ink : k.sub}"><span>${F.ig}</span><span>${F.site}</span></div>
      </div>`)}`;
};

// v4–v6 front: the logo, the headline, the QR, the ask, the site.
const simpleFlyerFront = (v) => {
  const k = LOOK[v], q = v === 'v6' ? 44 : 40;
  const t = qrTile(URLS.home, q, { radius: 1.2 });
  return `
    ${ground(v)}
    ${at(FM, FM, v === 'v6' ? word(5.6, k.word) : logo(v, 6))}
    ${at(FM - 0.6, 22, `Pick<br>the right<br>${hi(v, 'prof.')}`, `font-size:${v === 'v6' ? 21 : 19}mm;color:${k.ink}`, 'd nw')}
    ${at(FM, FH - FM - q, t.html)}
    ${at(FM + q + 5, FH - FM - q, `<div class="d" style="font-size:${v === 'v6' ? 7.4 : 6.6}mm;line-height:1.02">${CTA[0]}<br>${CTA[1]}</div>`, `color:${k.ink}`, 'nw')}
    ${atb(FM + q + 5, FM, SHORT.home, `font-size:2.9mm;color:${k.ink}`, 'm nw')}`;
};

// v4–v6 back: the passes and prices, how to buy, how to redeem. No small print under each pass.
const simpleFlyerBack = (v) => {
  const k = LOOK[v];
  const row = (p) => `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:3.6mm 0 2.6mm;border-top:0.3mm solid ${k.rule}">
    <span class="nw" style="font-size:4.8mm;font-weight:700;letter-spacing:-0.01em;color:${k.ink}">${p.name}</span>
    <span class="d nw" style="font-size:${p.main ? 12 : 9}mm;color:${p.main && !k.block ? k.hi : k.ink}">${p.price}</span></div>`;
  return `
    ${ground(v)}
    ${column(FM, FW, FH, `
      <div>
        <div class="d nw" style="font-size:9mm;margin:0 0 5mm -0.4mm;color:${k.ink}">Get the ${hi(v, 'pass.')}</div>
        ${ORDER.map(row).join('')}
      </div>
      <div>
        <div style="font-size:3.8mm;font-weight:600;line-height:1.4;color:${k.ink}">${F.booth}</div>
        <div style="font-size:3.5mm;font-weight:500;line-height:1.4;margin-top:3mm;color:${k.block ? k.ink : k.sub}">${F.redeem}</div>
      </div>`)}`;
};

const flyer = {
  id: 'flyer', piece: 'flyers', name: 'Flyer', size: 'A6, 105 × 148 mm', mm: [FW, FH], pages: ['Front', 'Back'],
  print: 'Paper. Print 4 per A4 at 100% (no fit to page). The back side flips on the long edge.',
  versions: [
    {
      id: 'v1',
      note: 'Navy front like the share card, with the drawing and the QR to profstopick.com; the back lists the passes.',
      html: (i) => {
        if (i === 1) return flyerBack('v1');
        const k = LOOK.v1;
        const t = qrTile(URLS.home, 38, { radius: 1.2 });
        return `
        ${ground('v1')}
        ${stars('v1', [['sparkle-four', 4.6, 88, 12], ['sparkle-small', 3, 76, 17], ['circle', 1.6, 60, 14], ['sparkle-four', 3.4, 14, 96]])}
        ${at(FM, FM, logo('v1', 6))}
        ${at(FM - 0.4, 24, `Pick the right<br>${hi('v1', 'prof.')}`, `font-size:14.6mm;color:${k.ink}`, 'd nw')}
        ${at(FM, 56, F.what, `width:52mm;font-size:3.9mm;line-height:1.35;color:${k.sub}`, 't')}
        ${at(54, 50, art('scene', 'landing-compare', 48, { set: k.draw }))}
        ${at(FM, FH - FM - 38, t.html)}
        ${at(FM + 43, FH - FM - 38, `
          <div class="d nw" style="font-size:6.4mm;line-height:1.02;color:${k.ink}">${CTA[0]}<br>${CTA[1]}</div>
          <div style="font-size:3.4mm;font-weight:500;line-height:1.3;margin-top:2.4mm;color:${k.sub}">${F.tagline}</div>`, 'width:46mm')}
        ${atb(FM + 43, FM, SHORT.home, `font-size:2.9mm;color:${k.ink}`, 'm nw')}`;
      },
    },
    {
      id: 'v2',
      note: 'Light paper like the app: the four things it does in a white card, and the QR in a thin-line box.',
      html: (i) => {
        if (i === 1) return flyerBack('v2');
        const k = LOOK.v2;
        const t = qrTile(URLS.home, 40, {});
        return `
        ${ground('v2')}
        ${column(FM, FW, FH, `
          <div>${logo('v2', 6)}
            <div class="d nw" style="font-size:14.6mm;margin:9mm 0 0 -0.4mm;color:${k.ink}">Pick the right<br>${hi('v2', 'prof.')}</div>
            <div class="nw" style="font-size:4.4mm;font-weight:600;margin-top:4.4mm;color:${k.ink}">${F.tagline}</div></div>
          <div style="background:#fff;border:0.3mm solid ${C.line};border-radius:1.2mm;display:grid;grid-template-columns:1fr 1fr">
            ${F.features.map((f, j) => `<div style="display:flex;gap:1.8mm;align-items:center;padding:3mm 3mm;font-size:3.5mm;font-weight:600;color:${k.ink};${j % 2 ? `border-left:0.3mm solid ${C.line};` : ''}${j > 1 ? `border-top:0.3mm solid ${C.line};` : ''}">${tick(3.2, C.accent)}<span class="nw">${f}</span></div>`).join('')}</div>
          <div style="display:flex;background:#fff;border:0.3mm solid ${C.line};border-radius:1.2mm;overflow:hidden">
            <div style="padding:1.4mm">${t.html}</div>
            <div style="flex:1;padding:4.6mm 4mm 4.4mm;display:flex;flex-direction:column;border-left:0.3mm solid ${C.line}">
              <div class="d nw" style="font-size:6.6mm;line-height:1.02;color:${k.ink}">${CTA[0]}<br>${CTA[1]}</div>
              <div style="font-size:3.4mm;font-weight:500;line-height:1.3;margin-top:2.4mm;color:${k.sub}">Make a free account.</div>
              <div class="m nw" style="margin-top:auto;font-size:2.9mm;color:${C.deep}">${SHORT.home}</div></div></div>`)}`;
      },
    },
    {
      id: 'v3',
      note: 'Solid blue, the headline as big as it fits, and a bigger QR. The back keeps the same facts.',
      html: (i) => {
        if (i === 1) return flyerBack('v3');
        const k = LOOK.v3;
        const t = qrTile(URLS.home, 44, { radius: 1.2 });
        return `
        ${ground('v3')}
        ${at(FM, FM, word(5.6, k.word))}
        ${at(FM - 0.6, 22, `Pick<br>the right<br>${hi('v3', 'prof.')}`, `font-size:21mm;color:${k.ink}`, 'd nw')}
        ${at(FM, FH - FM - 44, t.html)}
        ${at(FM + 49, FH - FM - 44, `<div class="d nw" style="font-size:7.4mm;line-height:1.02">${CTA[0]}<br>${CTA[1]}</div>`, `color:${k.ink}`)}
        ${atb(FM + 49, FM, SHORT.home, `font-size:2.9mm;color:${k.ink}`, 'm nw')}`;
      },
    },
    { id: 'v4', note: 'V1 with less: the headline, the QR, and the site. The back: the passes, how to buy, how to redeem.', html: (i) => (i ? simpleFlyerBack('v4') : simpleFlyerFront('v4')) },
    { id: 'v5', note: 'V2 with less: no feature card, no boxes. The back has no small print under each pass.', html: (i) => (i ? simpleFlyerBack('v5') : simpleFlyerFront('v5')) },
    { id: 'v6', note: 'V3 with less: the headline, the QR, and the site. The back: prices and how to buy only.', html: (i) => (i ? simpleFlyerBack('v6') : simpleFlyerFront('v6')) },
  ],
};

// ======================================================================
// Pass card, 90 × 54 mm. The voucher is on the pass: the front is the pass, the back prints the voucher code.
// Given after a cash, GCash, or Maya sale. The public files show F.sampleCode.
// `npm run cards -- <codes.txt>` prints the real codes into a private PDF (scripts/print/cards.mjs).
// ======================================================================
const KW = 90, KH = 54, KM = 5, KCW = KW - 2 * KM;
export const CARD_MM = [KW, KH];

export const cardFront = (v) => {
  const k = LOOK[v];
  if (v === 'v1') return `
    ${ground('v1')}
    ${stars('v1', [['sparkle-four', 3.4, 52, 8], ['sparkle-small', 2.2, 46, 16], ['circle', 1.2, 60, 44]])}
    ${at(KM, KM, logo('v1', 5.4))}
    ${at(56, 13, art('object', 'season-ticket', 30, { set: k.draw }))}
    ${atb(KM - 0.3, KM, `${hi('v1', 'Pass')} card`, `font-size:11mm;color:${k.ink}`, 'd nw')}`;
  if (v === 'v2') return `
    ${ground('v2')}
    ${at(KM, KM, logo('v2', 5.4))}
    ${at(57, 11, art('object', 'season-ticket', 29, { set: k.draw }))}
    ${atb(KM - 0.3, KM + 5.4, `${hi('v2', 'Pass')} card`, `font-size:11mm;color:${k.ink}`, 'd nw')}
    ${atb(KM, KM, F.site, `font-size:2.8mm;color:${k.sub}`, 'm nw')}`;
  if (v === 'v3') return `
    ${ground('v3')}
    ${at(KM, KM, word(4.6, k.word))}
    ${atb(KM - 0.6, KM - 0.4, `${hi('v3', 'Pass')} card`, `font-size:16mm;color:${k.ink}`, 'd nw')}`;
  // v4–v6: the logo and the word "Pass", nothing else
  return `
    ${ground(v)}
    ${at(KM, KM, v === 'v6' ? mark(v, 6) : logo(v, 5.4))}
    ${atb(KM - 0.6, KM - 0.6, hi(v, 'Pass'), `font-size:${v === 'v6' ? 20 : 16}mm;color:${k.ink}`, 'd nw')}`;
};

// code = the voucher code; pass = the pass it is for, if the codes list says (blank: not printed)
export const cardBack = (v, { code = F.sampleCode, pass = '' } = {}) => {
  const k = LOOK[v];
  const soft = k.block ? k.ink : k.sub;
  const label = `<span>Voucher code</span>${pass ? `<span>${esc(pass)}</span>` : ''}`;
  if (simple(v)) return `
    ${ground(v)}
    ${at(KM, KM, label, `width:${KCW}mm;display:flex;justify-content:space-between;font-size:2.8mm;color:${soft}`, 'm nw')}
    ${at(KM - 0.3, 16, esc(code), `font-size:10mm;font-weight:700;letter-spacing:0.05em;color:${k.ink}`, 'm nw')}
    ${atb(KM, KM, `Redeem at <b style="font-weight:700">${SHORT.pass}</b>`, `font-size:3.4mm;font-weight:500;color:${k.ink}`, 'nw')}`;
  const field = v === 'v2' ? `border:0.3mm solid ${C.ink3};` : '';
  return `
    ${ground(v)}
    ${at(KM, KM, label, `width:${KCW}mm;display:flex;justify-content:space-between;font-size:2.6mm;color:${soft}`, 'm nw')}
    ${at(KM, KM + 4, `<div style="height:17mm;background:#fff;${field}border-radius:1.2mm;display:flex;align-items:center;justify-content:center">
      <span class="m nw" style="font-size:9.4mm;font-weight:700;letter-spacing:0.06em;color:${C.ink}">${esc(code)}</span></div>`, `width:${KCW}mm`)}
    ${at(KM, 30, 'Sign in, tap “Have a code”, type this code.', `font-size:3.1mm;font-weight:500;color:${soft}`, 'nw')}
    ${atb(KM, KM, `<span>Redeem at <b style="font-weight:700">${SHORT.pass}</b></span>${mark(v, 4.6)}`, `width:${KCW}mm;display:flex;justify-content:space-between;align-items:center;border-top:0.25mm solid ${k.rule};padding-top:2.4mm;font-size:3.2mm;font-weight:500;color:${k.ink}`, 'nw')}`;
};

const card = {
  id: 'card', piece: 'card', name: 'Pass card, front', size: '90 × 54 mm, the pass', mm: [KW, KH], pages: ['Front'],
  print: 'Card stock, 250 gsm or more. Print this on one side and “Pass card, back” on the other. Ask the shop to cut to 90 × 54 mm.',
  versions: [
    { id: 'v1', note: 'Navy, the logo, “Pass card”, and the ticket drawing.', html: () => cardFront('v1') },
    { id: 'v2', note: 'Light paper like the app, with the ticket drawing and the site.', html: () => cardFront('v2') },
    { id: 'v3', note: 'Solid blue, “Pass card” in big type.', html: () => cardFront('v3') },
    { id: 'v4', note: 'V1 with less: the logo and “Pass”.', html: () => cardFront('v4') },
    { id: 'v5', note: 'V2 with less: the logo and “Pass”, no drawing.', html: () => cardFront('v5') },
    { id: 'v6', note: 'V3 with less: the badge and “Pass”.', html: () => cardFront('v6') },
  ],
};

const cardBackPrint = {
  id: 'cardback', piece: 'card', name: 'Pass card, back', size: '90 × 54 mm, the voucher code', mm: [KW, KH], pages: ['Back'],
  print: `The other side of the pass card. This file shows a sample code (${F.sampleCode}). For the real codes run npm run cards: one PDF, front and back, one card per code.`,
  versions: [
    { id: 'v1', note: 'Navy. The code in a big white box, one line on how to use it, and where to redeem it.', html: () => cardBack('v1') },
    { id: 'v2', note: 'Light paper. The code in a thin-line box, one line on how to use it, and where to redeem it.', html: () => cardBack('v2') },
    { id: 'v3', note: 'Solid blue. The code in a big white box, one line on how to use it, and where to redeem it.', html: () => cardBack('v3') },
    { id: 'v4', note: 'V1 with less: the code, big, and where to redeem it.', html: () => cardBack('v4') },
    { id: 'v5', note: 'V2 with less: the code, big, and where to redeem it.', html: () => cardBack('v5') },
    { id: 'v6', note: 'V3 with less: the code, big, and where to redeem it.', html: () => cardBack('v6') },
  ],
};

// every ₱ in Inter (see peso() in kit.mjs). Its bars reach right, so keep the kit's small gap after it.
const withPeso = (asset) => ({ ...asset, versions: asset.versions.map((v) => ({ ...v, html: async (i) => peso(await v.html(i)) })) });

export default {
  page: 'booth',
  assets: [banner, qrSign, prices, flyer, card, cardBackPrint].map(withPeso),
};

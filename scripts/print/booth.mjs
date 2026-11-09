// Print files for the profstopick booth (Nov 9–13, Red Brick Road): every printed piece, in six looks.
// Sizes in mm. `piece` is the id the 3D model uses. A version's html(i) returns page i.
// Words come from F in kit.mjs only. Looks: v1 Navy card, v2 Paper, v3 Blue (v2's layout, v3's colors), and
// v4–v6, the same three with less (LOOK in kit.mjs). One QR on every print: profstopick.com.
// Every ₱ goes through peso() at the end (Onest has no ₱, so it is set in Inter on purpose).
import { C, F, URLS, HOOKS, FAQ, LOOK, margin, word, wordCom, badge, lockup, art, confetti, qrTile, peso } from './kit.mjs';

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

// The one accent word, in the look's accent color (light blue on navy and blue, brand blue on paper). No box.
const hi = (v, t) => `<span style="color:${LOOK[v].hi}">${t}</span>`;
// the main pass tag (F.pick) in v2 and v3: a soft pill
const pill = (v, t, size, pad) => `<span class="m" style="font-size:${size}mm;color:${LOOK[v].hi};background:${LOOK[v].tagBg};padding:${pad};border-radius:10mm">${t}</span>`;

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
// the flyer backs: every pass the same, by price (no main pass first)
const BY_PRICE = F.passes;
const FREE = { name: F.free.name, price: F.free.price, per: '', about: `${F.free.lines.map((l, i) => (i ? l[0].toLowerCase() + l.slice(1) : l)).join(', ')}.` };

// ======================================================================
// Standing banner, 2 × 5 ft (609.6 × 1524 mm). Seen from 2–4 m. No prices: the price list and the flyer have them.
// People may hide the lower third, so the logo and the headline stay in the top two thirds (above 1016 mm).
// The layout was drawn at 600 × 1600 mm; Y() scales its heights and type sizes to the real banner,
// and X() its sparkle spots across. Sizes: wordmark 380+ mm wide, headline caps 56 mm or more.
// ======================================================================
const BW = 609.6, BH = 1524, BM = margin(BW, BH), BCW = BW - 2 * BM;
const Y = (n) => Math.round(n * BH / 1600);
const X = (n) => Math.round(n * BW / 600);

// v4–v6: logo, the headline on four lines as big as it fits, one more thing (v4, v5), the site. Nothing else.
const simpleBanner = (v) => {
  const k = LOOK[v], big = Y(v === 'v6' ? 196 : 190);
  const more = v === 'v4' ? at(BM, Y(1030), F.what, `width:${BCW}mm;font-size:${Y(36)}mm;line-height:1.3;color:${k.sub}`, 't')
    : v === 'v5' ? at(BM, Y(1030), F.features.join('<br>'), `font-size:${Y(38)}mm;font-weight:600;line-height:1.35;color:${k.sub}`, 'nw')
    : '';
  return `
    ${ground(v)}
    ${at(BM, Y(60), v === 'v6' ? word(Y(86), k.word) : logo(v, Y(80)))}
    ${at(BM - 8, Y(206), `Pick<br>the<br>right<br>${hi(v, 'prof.')}`, `font-size:${big}mm;color:${k.ink}`, 'd nw')}
    ${more}
    ${atb(BM - 2, BM, F.site, `font-size:${Y(v === 'v6' ? 62 : 56)}mm;color:${v === 'v5' ? C.accent : k.ink}`, 'd nw')}`;
};

// v1–v3: the share card layout. v1 on navy, v2 the same on light paper, v3 on blue.
const shareBanner = (v) => {
  const k = LOOK[v];
  return `
    ${ground(v)}
    ${stars(v, [['sparkle-four', Y(40), X(452), Y(332)], ['sparkle-small', Y(20), X(372), Y(372)], ['circle', Y(10), X(330), Y(188)], ['sparkle-four', Y(26), X(66), Y(1060)], ['circle', Y(9), X(92), Y(1488)], ['sparkle-small', Y(22), X(528), Y(1028)]])}
    ${at(BM, Y(60), logo(v, Y(80)))}
    ${at(BM - 4, Y(236), `Pick the right<br>${hi(v, 'prof.')}`, `font-size:${Y(84)}mm;color:${k.ink}`, 'd nw')}
    ${at(BM, Y(446), F.what, `width:${BCW}mm;font-size:${Y(31)}mm;line-height:1.3;color:${k.sub}`, 't')}
    ${at(BM, Y(628), `<div style="border-top:${Y(16) / 10}mm solid ${k.rule};padding-top:${Y(40)}mm">
      ${checks(F.features, { size: Y(36), tickSize: Y(34), color: k.ink, tickColor: k.hi, gap: Y(20) })}</div>`, `width:${BCW}mm`)}
    ${at(BW - BM - Y(440), Y(990), art('scene', 'landing-compare', Y(440), { set: k.draw }))}
    ${atb(BM - 2, BM, F.site, `font-size:${Y(52)}mm;color:${k.ink}`, 'd nw')}`;
};

const banner = {
  id: 'banner', piece: 'banner', name: 'Standing banner', size: '2 ft × 5 ft (609.6 × 1524 mm)', mm: [BW, BH], pages: ['Banner'],
  print: 'Tarp or banner cloth. Print at 100 dpi or more. Check the size against the stand before you print.',
  versions: [
    { id: 'v1', note: 'Like the share card: navy, “prof.” in light blue, what the site does, the four features, and the drawing.', html: () => shareBanner('v1') },
    { id: 'v2', note: 'V1 on light paper: dark type, “prof.” in brand blue, the same features and drawing. No box.', html: () => shareBanner('v2') },
    { id: 'v3', note: 'V2 in blue: white type, “prof.” in light blue, the same features and drawing.', html: () => shareBanner('v3') },
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

// v2 + v3: like the app. The QR sits in a white card with a thin line, and the link is inside the card.
const paperSign = (v) => {
  const k = LOOK[v];
  const t = signTile({
    footH: 13,
    foot: `<div class="m nw" style="width:100%;border-top:0.3mm solid ${C.line};padding-top:3.4mm;text-align:center;font-size:4.4mm;color:${C.deep}">${SHORT.home}</div>`,
  });
  return `
    ${ground(v)}
    ${at(AM, AM, logo(v, 7))}
    ${at(AM - 0.6, 27, `Try it ${hi(v, 'free.')}`, `font-size:17mm;color:${k.ink}`, 'd nw')}
    ${at(AM, 46, 'Prof reviews, schedules, and an AI advisor.', `font-size:5mm;font-weight:500;color:${k.sub}`, 'nw')}
    ${at(AM, 57, `<div style="border:0.3mm solid ${k.rule};border-radius:1.4mm;overflow:hidden;background:#fff">${t.html}</div>`)}`;
};

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
      html: () => paperSign('v2'),
    },
    { id: 'v3', note: 'V2 in blue: the logo, “Try it free.”, and the QR in a white card with the link inside.', html: () => paperSign('v3') },
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
        <div class="d nw" style="font-size:64mm;line-height:0.8;margin:9mm 0 0 -1.5mm;color:${k.hi}">${MAIN.price}</div>
      </div>
      <div>${row(GRAD)}${row(SEM)}${row(FREE)}</div>
      <div class="nw" style="font-size:5.6mm;font-weight:600;color:${k.ink}">Pay with ${F.pay}.</div>`)}`;
};

// v2 + v3: like the /pass page. Cards with thin lines, the Year Pass card in a ring.
const paperPrices = (v) => {
  const k = LOOK[v];
  const small = (p) => `<div style="background:${k.card};border:0.3mm solid ${k.rule};border-radius:1.4mm;padding:5mm 5mm 5.5mm;display:flex;flex-direction:column">
    <div class="nw" style="font-size:5mm;font-weight:700;letter-spacing:-0.015em;color:${k.ink}">${p.name}</div>
    <div class="nw" style="margin-top:3mm"><span class="d" style="font-size:13mm;color:${k.ink}">${p.price}</span>${p.per ? `<span style="font-size:3.6mm;font-weight:600;margin-left:1.4mm;color:${k.sub}">${p.per}</span>` : ''}</div>
    <div style="font-size:3.8mm;font-weight:500;line-height:1.35;margin-top:3mm;color:${k.sub}">${p.about}</div>
    ${p.month ? `<div style="font-size:3.6mm;font-weight:600;margin-top:auto;padding-top:3mm;color:${k.link}">${p.month}</div>` : ''}
  </div>`;
  return `
    ${ground(v)}
    ${column(PM, PW, PH, `
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center">${logo(v, 9)}<span class="m" style="font-size:3.6mm;color:${k.sub}">${F.site}</span></div>
        <div class="d nw" style="font-size:19mm;margin:12mm 0 0 -1mm;color:${k.ink}">Pick a ${hi(v, 'pass.')}</div></div>
      <div style="background:${k.card};border:0.6mm solid ${k.hi};border-radius:1.6mm;padding:7mm 8mm 8mm;display:flex;justify-content:space-between;align-items:flex-end">
        <div>
          <div class="nw" style="display:flex;gap:3mm;align-items:center">
            <span style="font-size:7.4mm;font-weight:700;letter-spacing:-0.02em;color:${k.ink}">${MAIN.name}</span>
            ${pill(v, F.pick, 3.4, '1.2mm 2.8mm')}</div>
          <div class="nw" style="display:flex;align-items:baseline;gap:2.4mm;margin-top:5mm">
            <span class="d" style="font-size:30mm;line-height:0.86;color:${k.ink}">${MAIN.price}</span>
            <span style="font-size:5.6mm;font-weight:600;color:${k.sub}">${MAIN.per}</span></div>
          <div class="nw" style="font-size:4.6mm;font-weight:500;margin-top:5mm;color:${k.ink}">${MAIN.about}</div>
          <div class="nw" style="font-size:4.2mm;font-weight:600;margin-top:1.6mm;color:${k.link}">${MAIN.month}</div>
        </div>
        ${art('object', 'season-ticket', 38, { set: k.draw, style: 'margin:0 -1mm 4mm 0' })}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4mm;align-items:stretch">${small(GRAD)}${small(SEM)}${small(FREE)}</div>
      <div style="background:${k.well};border-radius:1.4mm;padding:5mm 6mm 5.4mm">
        <div class="m" style="font-size:3.4mm;color:${k.sub};margin-bottom:3mm">Every pass</div>
        ${everyList({ size: 4.1, tickSize: 4.2, color: k.ink, tickColor: k.hi, gap: 3, row: true })}
      </div>
      <div class="nw" style="display:flex;gap:3mm;align-items:baseline;border-top:0.3mm solid ${k.rule};padding-top:4mm">
        <span class="m" style="font-size:3.4mm;color:${k.sub}">Pay with</span><span style="font-size:4.4mm;font-weight:600;color:${k.ink}">${F.pay}</span></div>`)}`;
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
    { id: 'v2', note: 'Like the /pass page: white cards with thin lines, the Year Pass card in a blue ring.', html: () => paperPrices('v2') },
    { id: 'v3', note: 'V2 in blue: see-through cards with thin lines, the Year Pass card in a light-blue ring.', html: () => paperPrices('v3') },
    { id: 'v4', note: 'V1 with less: the Year Pass price big in light blue, then the other passes in plain rows. No box, no drawing.', html: () => simplePrices('v4') },
    { id: 'v5', note: 'V2 with less: the same rows on light paper. No cards, no small print.', html: () => simplePrices('v5') },
    { id: 'v6', note: 'V3 with less: solid blue, the prices and how to pay. Nothing else.', html: () => simplePrices('v6') },
  ],
};

// ======================================================================
// Flyer, A6, two sides. Members print 4 per A4 at home.
// ======================================================================
const FW = 105, FH = 148, FM = margin(FW, FH), FCW = FW - 2 * FM;

// The four things the site does (F.features), two by two with a check each. card = in a thin-line box.
const featureGrid = (v, { card = true, size = 3.6 } = {}) => {
  const k = LOOK[v], line = `0.3mm solid ${k.rule}`;
  return `<div style="display:grid;grid-template-columns:1fr 1fr;${card ? `background:${k.card};border:${line};border-radius:1.2mm` : 'gap:2.6mm 3mm'}">
    ${F.features.map((f, j) => `<div style="display:flex;gap:1.8mm;align-items:center;${card ? `padding:3mm;${j % 2 ? `border-left:${line};` : ''}${j > 1 ? `border-top:${line};` : ''}` : ''}font-size:${size}mm;font-weight:600;color:${k.ink}">${tick(size * 0.9, v === 'v1' || v === 'v4' ? k.sub : k.hi)}<span class="nw">${f}</span></div>`).join('')}</div>`;
};
// the small label over a block
const label = (v, t) => `<div class="m" style="font-size:2.9mm;color:${LOOK[v].sub};margin-bottom:2.4mm">${t}</div>`;

// v1 on navy; v2 and v3 share the paper layout (v3 in blue)
const flyerBack = (v) => {
  const k = LOOK[v], v1 = v === 'v1';
  const row = (p, j) => `<div style="display:flex;justify-content:space-between;align-items:center;gap:4mm;padding:3mm 0;${j ? `border-top:0.3mm solid ${k.rule}` : ''}">
      <div><div class="nw" style="font-size:4.4mm;font-weight:700;letter-spacing:-0.01em;color:${k.ink}">${p.name}</div>
        <div style="font-size:3.1mm;font-weight:500;line-height:1.3;margin-top:0.9mm;color:${k.sub}">${p.about}</div></div>
      <div class="nw" style="text-align:right"><div class="d" style="font-size:9mm;color:${k.ink}">${p.price}</div>
        <div style="font-size:2.9mm;font-weight:600;margin-top:0.8mm;color:${k.sub}">${p.per}</div></div></div>`;
  return `
    ${ground(v)}
    ${column(FM, FW, FH, `
      <div class="d nw" style="font-size:9mm;margin-left:-0.4mm;color:${k.ink}">${v1 ? 'Get the pass.' : `Get the ${hi(v, 'pass.')}`}</div>
      <div style="border-top:0.3mm solid ${k.rule};border-bottom:0.3mm solid ${k.rule}">${BY_PRICE.map(row).join('')}</div>
      <div>${label(v, 'What you get')}${featureGrid(v)}</div>
      <div style="padding:3mm 3.6mm;border-radius:1.2mm;font-size:3.3mm;font-weight:600;line-height:1.35;color:${k.ink};${v1 ? `background:${k.card};border:0.3mm solid ${k.rule}` : `background:${v === 'v2' ? C.tint : k.well}`}">${F.booth}</div>
      <div class="m nw" style="font-size:3mm;color:${k.sub}">${F.site}</div>`)}`;
};

// v2 + v3 front: like the app. The four things it does in a card, and the QR in a thin-line box.
const paperFlyerFront = (v) => {
  const k = LOOK[v];
  const t = qrTile(URLS.home, 40, {});
  return `
    ${ground(v)}
    ${column(FM, FW, FH, `
      <div>${logo(v, 6)}
        <div class="d nw" style="font-size:14.6mm;margin:9mm 0 0 -0.4mm;color:${k.ink}">Pick the right<br>${hi(v, 'prof.')}</div>
        <div class="nw" style="font-size:4.4mm;font-weight:600;margin-top:4.4mm;color:${k.ink}">${F.tagline}</div></div>
      <div style="background:${k.card};border:0.3mm solid ${k.rule};border-radius:1.2mm;display:grid;grid-template-columns:1fr 1fr">
        ${F.features.map((f, j) => `<div style="display:flex;gap:1.8mm;align-items:center;padding:3mm 3mm;font-size:3.5mm;font-weight:600;color:${k.ink};${j % 2 ? `border-left:0.3mm solid ${k.rule};` : ''}${j > 1 ? `border-top:0.3mm solid ${k.rule};` : ''}">${tick(3.2, k.hi)}<span class="nw">${f}</span></div>`).join('')}</div>
      <div style="display:flex;background:${k.card};border:0.3mm solid ${k.rule};border-radius:1.2mm;overflow:hidden">
        <div style="padding:1.4mm;background:${k.tile}">${t.html}</div>
        <div style="flex:1;padding:4.6mm 4mm 4.4mm;display:flex;flex-direction:column;border-left:0.3mm solid ${k.rule}">
          <div class="d nw" style="font-size:6.6mm;line-height:1.02;color:${k.ink}">${CTA[0]}<br>${CTA[1]}</div>
          <div style="font-size:3.4mm;font-weight:500;line-height:1.3;margin-top:2.4mm;color:${k.sub}">Make a free account.</div>
          <div class="m nw" style="margin-top:auto;font-size:2.9mm;color:${k.link}">${SHORT.home}</div></div></div>`)}`;
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

// v4–v6 back: the passes and prices, the four features, how to buy. No small print under each pass.
const simpleFlyerBack = (v) => {
  const k = LOOK[v];
  const row = (p, j) => `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:3.4mm 0 2.6mm;${j ? `border-top:0.3mm solid ${k.rule}` : ''}">
    <span class="nw" style="font-size:4.8mm;font-weight:700;letter-spacing:-0.01em;color:${k.ink}">${p.name}</span>
    <span class="d nw" style="font-size:9mm;color:${k.ink}">${p.price}</span></div>`;
  return `
    ${ground(v)}
    ${column(FM, FW, FH, `
      <div class="d nw" style="font-size:9mm;margin-left:-0.4mm;color:${k.ink}">Get the ${hi(v, 'pass.')}</div>
      <div style="border-top:0.3mm solid ${k.rule};border-bottom:0.3mm solid ${k.rule}">${BY_PRICE.map(row).join('')}</div>
      <div>${label(v, 'What you get')}${featureGrid(v, { card: false, size: 3.8 })}</div>
      <div style="font-size:3.8mm;font-weight:600;line-height:1.4;color:${k.ink}">${F.booth}</div>
      <div class="m nw" style="font-size:3mm;color:${k.sub}">${F.site}</div>`)}`;
};

const flyer = {
  id: 'flyer', piece: 'flyers', name: 'Flyer', size: 'A6, 105 × 148 mm', mm: [FW, FH], pages: ['Front', 'Back'],
  print: 'Paper. Print 4 per A4 at 100% (no fit to page). The back side flips on the long edge.',
  versions: [
    {
      id: 'v1',
      note: 'Navy front like the share card, with the drawing and the QR to profstopick.com; the back lists the passes and the four features.',
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
    { id: 'v2', note: 'Light paper like the app: the four things it does in a white card, and the QR in a thin-line box.', html: (i) => (i ? flyerBack('v2') : paperFlyerFront('v2')) },
    { id: 'v3', note: 'V2 in blue: the four things it does in a see-through card, and the QR in a thin-line box. The back is V2 in blue.', html: (i) => (i ? flyerBack('v3') : paperFlyerFront('v3')) },
    { id: 'v4', note: 'V1 with less: the headline, the QR, and the site. The back: the passes, the four features, how to buy.', html: (i) => (i ? simpleFlyerBack('v4') : simpleFlyerFront('v4')) },
    { id: 'v5', note: 'V2 with less: no feature card, no boxes. The back has no small print under each pass.', html: (i) => (i ? simpleFlyerBack('v5') : simpleFlyerFront('v5')) },
    { id: 'v6', note: 'V3 with less: the headline, the QR, and the site. The back: prices, the four features, and how to buy.', html: (i) => (i ? simpleFlyerBack('v6') : simpleFlyerFront('v6')) },
  ],
};

// ======================================================================
// Pass card, 90 × 54 mm. Reads like a paid plan: "1 year of profstopick" and the pass name in a tag.
// The back has a blank box for the voucher code, written in by hand after a cash, GCash, or Maya sale.
// `npm run cards -- <codes.txt>` prints the real codes into a private PDF (scripts/print/cards.mjs).
// ======================================================================
const KW = 90, KH = 54, KM = 5, KCW = KW - 2 * KM;
export const CARD_MM = [KW, KH];

// the pass a card is for, by id or name ('year', 'Year Pass'). Blank: the main pass. No match: undefined.
export const passFor = (s = '') => {
  const t = String(s).trim().toLowerCase();
  return t ? F.passes.find((p) => p.id === t || p.name.toLowerCase() === t) : MAIN;
};

// the pass name tag, filled like a plan badge
const TAG = { v1: [C.sky, C.navy], v2: [C.accent, '#fff'], v3: [C.sky, C.navy] };
TAG.v4 = TAG.v1; TAG.v5 = TAG.v2; TAG.v6 = TAG.v3;
const passTag = (v, p, size = 2.6) => `<span class="m nw" style="display:inline-block;font-size:${size}mm;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${TAG[v][1]};background:${TAG[v][0]};padding:1.1mm 2.4mm 1mm;border-radius:10mm">${p.name}</span>`;

// what the card says the pass is: "1 semester of profstopick", "1 year of", "Graduation pass of"
const CARD_LINE = { semester: '1 semester', year: '1 year', graduation: 'Graduation pass' };

// front, v1–v3: the badge and the pass tag on top; "1 year of" and the wordmark at the bottom, the ticket drawing,
// sparkles (v1), and what the pass unlocks.
// front, v4–v6: the badge and profstopick.com (in the logo's letters) on top; "1 year of" and the wordmark at the bottom.
export const cardFront = (v, p = MAIN) => {
  const k = LOOK[v], rich = !simple(v);
  const big = rich ? 8 : 9.4;
  const line = CARD_LINE[p.id] || p.span;
  // a long line (Graduation pass) gets smaller so it stays on one line inside the card
  const size = Math.min(big, +(KCW / (line.length + 3) / 0.56).toFixed(2));
  return `
    ${ground(v)}
    ${v === 'v1' ? stars('v1', [['sparkle-four', 3.4, 54, 9], ['sparkle-small', 2.2, 48, 16]]) : ''}
    ${rich ? at(61, 17, art('object', 'season-ticket', 25, { set: k.draw })) : ''}
    ${at(KM, KM, mark(v, 6.4))}
    ${rich ? at(KM, KM + 0.6, passTag(v, p), `width:${KCW}mm;text-align:right`)
      : at(KM, KM, wordCom(4.2, k.word), `width:${KCW}mm;height:6.4mm;display:flex;justify-content:flex-end;align-items:center`)}
    ${atb(KM, KM, `
      <div class="d nw" style="font-size:${size}mm;margin-left:-0.3mm;color:${k.ink}">${hi(v, line)} of</div>
      ${word(big * 1.12, k.word, `margin-top:${(big * 0.22).toFixed(2)}mm`)}
      ${rich ? `<div class="nw" style="font-size:2.7mm;font-weight:600;margin-top:2.6mm;color:${k.sub}">${F.every.slice(0, 2).join(' · ')}</div>` : ''}`)}`;
};

// code = the voucher code; pass = the pass it is for, if the codes list says (blank: not printed).
// No code (the public files): the box is left white and empty, to write the code in by hand with a pen.
export const cardBack = (v, { code = '', pass = '' } = {}) => {
  const k = LOOK[v];
  const soft = k.sub;
  const label = `<span>Voucher code</span>${pass ? `<span>${esc(pass)}</span>` : ''}`;
  if (simple(v)) return `
    ${ground(v)}
    ${at(KM, KM, label, `width:${KCW}mm;display:flex;justify-content:space-between;font-size:2.8mm;color:${soft}`, 'm nw')}
    ${code ? at(KM - 0.3, 16, esc(code), `font-size:10mm;font-weight:700;letter-spacing:0.05em;color:${k.ink}`, 'm nw')
      : at(KM, 12, '', `width:${KCW}mm;height:20mm;background:#fff;border-radius:1.4mm;${v === 'v5' ? `border:0.3mm solid ${C.ink3};` : ''}`)}
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
    { id: 'v1', note: 'Navy, like a paid plan: “1 year of profstopick”, the Year Pass tag, what it unlocks, and the ticket drawing.', html: () => cardFront('v1') },
    { id: 'v2', note: 'Light paper: “1 year of profstopick”, the Year Pass tag in brand blue, what it unlocks, and the ticket drawing.', html: () => cardFront('v2') },
    { id: 'v3', note: 'V2 in blue: “1 year of profstopick”, the Year Pass tag, what it unlocks, and the ticket drawing.', html: () => cardFront('v3') },
    { id: 'v4', note: 'V1 with less: profstopick.com on top, and “1 year of profstopick”.', html: () => cardFront('v4') },
    { id: 'v5', note: 'V2 with less: profstopick.com on top, and “1 year of profstopick”.', html: () => cardFront('v5') },
    { id: 'v6', note: 'V3 with less: profstopick.com on top, and “1 year of profstopick”.', html: () => cardFront('v6') },
  ],
};

// the same front for the Semester and Graduation passes
const cardFor = (id) => {
  const p = F.passes.find((x) => x.id === id), line = `${CARD_LINE[id]} of profstopick`;
  return {
    ...card, id: `card-${id}`, name: `Pass card, front: ${p.name}`, size: `90 × 54 mm, “${line}”`,
    versions: card.versions.map((x) => ({ ...x, note: x.note.replace(/1 year of profstopick/g, line).replace(/Year Pass/g, p.name), html: () => cardFront(x.id, p) })),
  };
};

const cardBackPrint = {
  id: 'cardback', piece: 'card', name: 'Pass card, back', size: '90 × 54 mm, the voucher code', mm: [KW, KH], pages: ['Back'],
  print: 'The other side of the pass card. The code box is left blank: write the voucher code in it with a pen. To print the codes instead, run npm run cards: one PDF, front and back, one card per code.',
  versions: [
    { id: 'v1', note: 'Navy. The code in a big white box, one line on how to use it, and where to redeem it.', html: () => cardBack('v1') },
    { id: 'v2', note: 'Light paper. The code in a thin-line box, one line on how to use it, and where to redeem it.', html: () => cardBack('v2') },
    { id: 'v3', note: 'V2 in blue. The code in a big white box, one line on how to use it, and where to redeem it.', html: () => cardBack('v3') },
    { id: 'v4', note: 'V1 with less: a blank white box to write the code in, and where to redeem it.', html: () => cardBack('v4') },
    { id: 'v5', note: 'V2 with less: a blank box to write the code in, and where to redeem it.', html: () => cardBack('v5') },
    { id: 'v6', note: 'V3 with less: a blank white box to write the code in, and where to redeem it.', html: () => cardBack('v6') },
  ],
};

// ======================================================================
// Hook flyers, A6, two sides. One question a student already asks (HOOKS in kit.mjs), big, and "Pick the right
// prof." under it. The back is the flyer back of the same look. Hand out a mix.
// ======================================================================
const ask = (v, q) => q.split('\n').map((l) => l.replace(/\*(.+?)\*/g, (_, w) => hi(v, w))).join('<br>');

const hookFront = (v, h) => {
  const k = LOOK[v], rich = !simple(v), q = 36;
  const t = qrTile(URLS.home, q, { radius: 1.2 });
  return `
    ${ground(v)}
    ${v === 'v1' ? stars('v1', [['sparkle-four', 4.2, 54, 10], ['sparkle-small', 2.8, 47, 17]]) : ''}
    ${column(FM, FW, FH, `
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        ${v === 'v6' ? word(5.6, k.word) : logo(v, 6)}
        ${rich ? art(h.art[0], h.art[1], 30, { set: k.draw, style: 'margin:-2mm -1mm -6mm 0' }) : ''}</div>
      <div>
        <div class="d nw" style="font-size:${h.size + (rich ? 0 : 2)}mm;margin-left:-0.5mm;color:${k.ink}">${ask(v, h.q)}</div>
        <div class="nw" style="font-size:5.4mm;font-weight:700;letter-spacing:-0.01em;margin-top:4.4mm;color:${k.sub}">${F.headline.join(' ')}</div>
      </div>
      <div style="display:flex;gap:5mm">
        ${t.html}
        <div style="display:flex;flex-direction:column;justify-content:space-between;padding:1mm 0 0.4mm">
          <div class="d nw" style="font-size:6.4mm;line-height:1.02;color:${k.ink}">${CTA[0]}<br>${CTA[1]}</div>
          <div class="m nw" style="font-size:2.9mm;color:${v === 'v2' || v === 'v5' ? k.link || C.deep : k.ink}">${SHORT.home}</div></div></div>`)}`;
};

const HOOK_NOTE = {
  v1: 'Navy: the question big, the drawing, and the QR. The back lists the passes.',
  v2: 'Light paper: the question big with the accent word in brand blue, the drawing, and the QR.',
  v3: 'V2 in blue: the question big, the drawing, and the QR.',
  v4: 'V1 with less: the question, one line, the QR. No drawing.',
  v5: 'V2 with less: the question, one line, the QR. No drawing.',
  v6: 'V3 with less: the question, one line, the QR. No drawing.',
};
const flyerBackFor = (v) => (simple(v) ? simpleFlyerBack(v) : flyerBack(v));

const hookFlyers = HOOKS.map((h) => ({
  id: `hook-${h.id}`, piece: 'flyers', name: `Flyer: “${h.q.replace(/\*/g, '').replace(/\n/g, ' ')}”`, size: 'A6, 105 × 148 mm', mm: [FW, FH], pages: ['Front', 'Back'],
  print: flyer.print,
  versions: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6'].map((v) => ({ id: v, note: HOOK_NOTE[v], html: (i) => (i ? flyerBackFor(v) : hookFront(v, h)) })),
}));

// ======================================================================
// Staff FAQ, A4, two pages (print both sides). For the team at the booth, not for visitors. White, one version.
// Page 1: the prices, the site, reviews and privacy. Page 2: the passes, the AI advisor, paying and the code,
// and what to do after every sale. Words: FAQ in kit.mjs.
// ======================================================================
const faqPage = (i) => {
  const M = 15, CW = PW - 2 * M;
  const row = ([q, a]) => `<div style="display:grid;grid-template-columns:48mm 1fr;gap:6mm;padding:2.2mm 0 2.4mm;border-top:0.25mm solid ${C.line}">
    <div style="font-size:3.4mm;font-weight:700;line-height:1.3;color:${C.ink}">${q}</div>
    <div style="font-size:3.3mm;font-weight:500;line-height:1.4;color:${C.ink}">${a}</div></div>`;
  const section = ([title, list]) => `<div style="margin-top:7mm">
    <div class="m" style="font-size:3mm;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${C.accent};margin-bottom:2.4mm">${title}</div>
    ${list.map(row).join('')}</div>`;
  const price = (p) => `<div style="flex:1;border:0.25mm solid ${C.line};border-radius:1.4mm;padding:2.4mm 3.2mm">
    <div class="nw" style="font-size:3.1mm;font-weight:600;color:${C.ink2}">${p.name}</div>
    <div class="d nw" style="font-size:6.6mm;margin-top:1mm;color:${C.ink}">${p.price}</div></div>`;
  const head = i === 0
    ? `<div style="display:flex;justify-content:space-between;align-items:flex-end">
        <div><div class="d nw" style="font-size:10mm;color:${C.ink}">Booth FAQ</div>
          <div style="font-size:3.6mm;font-weight:500;margin-top:2mm;color:${C.ink2}">For staff. What visitors ask, and what to say.</div></div>
        ${lockup(5.6, LOGO.v2)}</div>
      <div style="display:flex;gap:2.6mm;margin-top:6mm">${[{ name: F.free.name, price: F.free.price }, SEM, MAIN, GRAD].map(price).join('')}</div>`
    : `<div style="display:flex;justify-content:space-between;align-items:center">
        <div class="d nw" style="font-size:7mm;color:${C.ink}">Booth FAQ, continued</div>${lockup(4.6, LOGO.v2)}</div>`;
  const steps = ['Check that the payment came in.', 'Write a code on the back of the card for that pass: 1 semester, 1 year, or Graduation.', 'Give the card and show them how to redeem it.', 'Log the sale and how they found us.'];
  const foot = i === 0
    ? `<div class="abs" style="left:${M}mm;bottom:${M}mm;width:${CW}mm;border-top:0.25mm solid ${C.line};padding-top:2.6mm;display:flex;justify-content:space-between;font-size:2.9mm;color:${C.ink2}" class="nw"><span>More on the back.</span><span class="m">1 / 2</span></div>`
    : `<div class="abs" style="left:${M}mm;bottom:${M}mm;width:${CW}mm;border-top:0.5mm solid ${C.ink};padding-top:3.4mm">
        <div class="m" style="font-size:3mm;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${C.accent};margin-bottom:2.4mm">After every sale</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:2.4mm 8mm">${steps.map((t, j) => `<div style="display:flex;gap:2.4mm;font-size:3.3mm;font-weight:600;line-height:1.35;color:${C.ink}"><span class="d" style="color:${C.accent}">${j + 1}</span><span>${t}</span></div>`).join('')}</div>
        <div class="m nw" style="display:flex;justify-content:space-between;margin-top:4mm;font-size:2.9mm;color:${C.ink2}"><span>${F.email} · ${F.ig}</span><span>2 / 2</span></div></div>`;
  return `
    <div class="fill" style="background:#fff"></div>
    <div class="abs" style="left:${M}mm;top:${M}mm;width:${CW}mm">
      ${head}
      ${FAQ.filter((x) => x[2] === i).map(section).join('')}
    </div>
    ${foot}`;
};

const faq = {
  id: 'faq', piece: 'faq', name: 'Staff FAQ', size: 'A4, 210 × 297 mm, two pages', mm: [PW, PH], pages: ['FAQ, page 1', 'FAQ, page 2'],
  print: 'Plain paper, A4, both sides (or two sheets). For the team: keep one behind the table. Not for visitors.',
  versions: [{ id: 'v1', look: 'staff', note: 'White, two pages: the prices, the site, reviews and privacy; then the passes, the AI advisor, paying, and the steps after every sale.', html: faqPage }],
};

// every ₱ in Inter (see peso() in kit.mjs). Its bars reach right, so keep the kit's small gap after it.
const withPeso = (asset) => ({ ...asset, versions: asset.versions.map((v) => ({ ...v, html: async (i) => peso(await v.html(i)) })) });

export default {
  page: 'booth',
  assets: [banner, qrSign, prices, flyer, ...hookFlyers, card, cardFor('semester'), cardFor('graduation'), cardBackPrint, faq].map(withPeso),
};

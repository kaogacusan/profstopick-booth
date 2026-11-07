// Pass cards with the real voucher codes: front, back, front, back ... one pair of 90 × 54 mm pages per code.
// The PDF goes next to the codes file, never in assets/: the booth site is public and each code is a paid pass.
//
//   npm run cards -- ~/Downloads/codes.txt        look v4
//   npm run cards -- ~/Downloads/codes.txt v1     any look, v1 to v6
//
// codes.txt: one code per line. Lines that start with # are skipped.
// To print the pass on the card too, add it after a comma:  ABCD-1234, Year Pass
import { chromium } from 'playwright-core';
import { readFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { BASE_CSS, FONTS, LOOKS, peso } from './kit.mjs';
import { CARD_MM, cardFront, cardBack } from './booth.mjs';

const [file, look = 'v4'] = process.argv.slice(2);
if (!file || !LOOKS.some((L) => L.id === look)) {
  console.error('Use: npm run cards -- <codes.txt> [v1 to v6]');
  process.exit(1);
}
const cards = (await readFile(file, 'utf8')).split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
  .map((l) => { const [code, pass = ''] = l.split(',').map((x) => x.trim()); return { code, pass }; });
if (!cards.length) { console.error(`No codes in ${file}`); process.exit(1); }

const [w, h] = CARD_MM;
const pg = (inner) => `<section class="pg" style="width:${w}mm;height:${h}mm">${peso(inner)}</section>`;
const front = pg(cardFront(look));
const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${FONTS}">
<style>@page{size:${w}mm ${h}mm;margin:0}${BASE_CSS}</style></head><body>${cards.map((c) => front + pg(cardBack(look, c))).join('')}</body></html>`;

const out = join(dirname(resolve(file)), `pass-cards-${look}.pdf`);
const browser = await chromium.launch();
try {
  const tab = await browser.newPage();
  await tab.setContent(html, { waitUntil: 'networkidle' });
  await tab.evaluate(() => document.fonts.ready);
  await tab.pdf({ path: out, width: `${w}mm`, height: `${h}mm`, printBackground: true, preferCSSPageSize: true });
} finally {
  await browser.close();
}
console.log(`${cards.length} cards, ${cards.length * 2} pages: ${out}`);

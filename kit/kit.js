// Brand kit page (/kit/). Fills the grids from two lists:
//   /assets/kit/index.json   files downloaded from profstopick.com/kitchen-sink (written by scripts/drawings.py)
//   /kit/files/files.json    files made from those (written by scripts/zip-kit.py): joined SVG drawings, share cards, zip size
// Big groups (drawings) are only built when their tab is opened. Every image is lazy.

const KIT = '/assets/kit/';
const OWN = '/kit/files/';

const SCHOOLS = {
  'ateneo-de-manila': 'Ateneo de Manila',
  'de-la-salle': 'De La Salle',
  mapua: 'Mapúa',
  'up-diliman': 'UP Diliman',
  ust: 'UST',
};

const COLORS = [
  { group: 'Brand', list: [
    { name: 'Navy', hex: '#0d3b7a', use: 'Share card background' },
    { name: 'Accent', hex: '#416ea8', use: 'Badge and app color' },
    { name: 'Accent deep', hex: '#31567f' },
    { name: 'Sky', hex: '#9ac0f4', use: 'Highlight word on the share card' },
  ] },
  { group: 'Backgrounds and lines', list: [
    { name: 'Tint', hex: '#eaeff6' },
    { name: 'Paper', hex: '#f7f8fa', use: 'Page background' },
    { name: 'Well', hex: '#eff1f5' },
    { name: 'Line', hex: '#e5e8ee', use: 'Hairline borders' },
  ] },
  { group: 'Text', list: [
    { name: 'Ink', hex: '#16181d', use: 'Body text and wordmark' },
    { name: 'Ink soft', hex: '#5a6170' },
  ] },
  { group: 'Score bands', small: true, list: [
    { name: 'Great', hex: '#1f9d55' },
    { name: 'Good', hex: '#84cc16' },
    { name: 'Okay', hex: '#eab308' },
    { name: 'Poor', hex: '#f97316' },
    { name: 'Bad', hex: '#ef4444' },
  ] },
];

// Drawing groups in tab order. png = ready PNGs from assets/kit/ready, svg = joined SVGs from kit/files.
const GROUPS = [
  { key: 'spot', label: 'Spot', kind: 'png' },
  { key: 'scene', label: 'Scene', kind: 'png' },
  { key: 'object', label: 'Object', kind: 'png' },
  { key: 'avatar', label: 'Avatar', kind: 'png' },
  { key: 'nav', label: 'Nav', kind: 'png' },
  { key: 'portrait', label: 'Portrait', kind: 'svg' },
  { key: 'wide', label: 'Wide', kind: 'svg' },
];
const SETS = {
  '': 'Dark lines with blue fill, for light backgrounds.',
  '-navy': 'White lines with light-blue fill, for navy backgrounds.',
};

const CONFETTI_COLORS = [
  { name: 'Accent', hex: '#416ea8' },
  { name: 'Navy', hex: '#0d3b7a' },
  { name: 'Ink', hex: '#16181d' },
  { name: 'Sky', hex: '#9ac0f4', onNavy: true },
];

const SHARE_NAMES = { 'og-home': 'Home', 'og-signin': 'Sign in' };

// ---------- helpers ----------
function h(tag, props = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'style') n.style.cssText = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k in n && !k.includes('-')) n[k] = v;
    else n.setAttribute(k, v);
  }
  n.append(...kids.flat().filter((k) => k != null && k !== false));
  return n;
}

const statusEl = document.getElementById('status');
function say(text) {
  statusEl.textContent = '';
  requestAnimationFrame(() => { statusEl.textContent = text; });
}

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.json();
}

// One downloadable tile: picture, file name below, a type chip ("PNG ↓") on hover/focus.
function fileTile({ href, download, src, name, type, label, inline }) {
  const img = inline ?? h('img', { src, alt: '', loading: 'lazy', decoding: 'async' });
  const em = h('span', { class: 'file__dl', 'aria-hidden': 'true' }, `${type} ↓`);
  const a = h('a', { class: 'file', href, download, 'aria-label': label, title: label },
    h('span', { class: 'file__img' }, img), em,
    h('span', { class: 'file__name' }, name));
  return { a, img, em };
}

// ---------- 01 app icons ----------
function sampleHex(img) {
  // The 192 icon is a filled rounded square; x 24, y 96 sits inside it.
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 24, 96, 1, 1, 0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  } catch { return null; }
}

function renderApps(stars) {
  const host = document.getElementById('apps');
  const slugs = [...new Set(stars.map((f) => f.replace(/-(192|512-maskable)\.png$/, '')))];
  slugs.forEach((slug) => {
    const name = SCHOOLS[slug] ?? slug;
    const img = h('img', { src: `${KIT}icon/star/${slug}-192.png`, alt: `${name} app icon`, width: 64, height: 64, decoding: 'async' });
    const hex = h('span', { class: 'mono' }, h('i'), h('span', {}, ' '));
    const dl = h('div', { class: 'app__dl' });
    if (stars.includes(`${slug}-192.png`)) dl.append(h('a', { class: 'btn btn--sm', href: `${KIT}icon/star/${slug}-192.png`, download: `profstopick-icon-${slug}-192.png` }, '192 px'));
    if (stars.includes(`${slug}-512-maskable.png`)) dl.append(h('a', { class: 'btn btn--sm', href: `${KIT}icon/star/${slug}-512-maskable.png`, download: `profstopick-icon-${slug}-512.png` }, '512 px'));
    host.append(h('li', { class: 'app' }, img, h('b', {}, name), hex, dl));
    img.decode().then(() => {
      const c = sampleHex(img);
      if (!c) return;
      hex.style.setProperty('--c', c);
      hex.lastChild.textContent = c;
    }).catch(() => {});
  });
}

// ---------- 02 colors ----------
async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const t = h('textarea', { value: text, style: 'position:fixed;opacity:0' });
      document.body.append(t);
      t.select();
      const ok = document.execCommand('copy');
      t.remove();
      return ok;
    } catch { return false; }
  }
}

function renderColors() {
  const host = document.getElementById('swatches');
  COLORS.forEach((g) => {
    const grid = h('div', { class: `swatches${g.small ? ' swatches--sm' : ''}` });
    g.list.forEach((c) => {
      const tip = h('span', { class: 'swatch__tip', 'aria-hidden': 'true' }, 'Copy');
      const btn = h('button', { type: 'button', class: 'swatch', style: `--c:${c.hex}`, 'aria-label': `${c.name}, ${c.hex}. Copy hex code` },
        h('span', { class: 'swatch__chip' }),
        tip,
        h('span', { class: 'swatch__meta' },
          h('b', {}, c.name),
          h('span', { class: 'swatch__hex' }, c.hex),
          c.use ? h('span', { class: 'swatch__use' }, c.use) : null));
      let timer;
      btn.addEventListener('click', async () => {
        const ok = await copy(c.hex);
        tip.textContent = ok ? 'Copied' : 'Copy failed';
        btn.classList.add('is-copied');
        say(ok ? `Copied ${c.hex}` : `Could not copy. The code is ${c.hex}`);
        clearTimeout(timer);
        timer = setTimeout(() => { btn.classList.remove('is-copied'); tip.textContent = 'Copy'; }, 1600);
      });
      grid.append(btn);
    });
    host.append(h('div', { class: 'cgroup' }, h('p', { class: 'mono' }, `${g.group} · ${g.list.length}`), grid));
  });
}

// ---------- 04 drawings ----------
function setupDrawings(drawings) {
  const tabsEl = document.getElementById('drawTabs');
  const panel = document.getElementById('drawPanel');
  const note = document.getElementById('drawNote');
  const setBtns = [...document.querySelectorAll('#drawSet button')];
  const groups = GROUPS.filter((g) => drawings[g.key]?.length);
  const built = new Map(); // group key -> tiles
  let current = groups[0]?.key;
  let set = '';

  const tabs = groups.map((g, i) => h('button', {
    type: 'button', role: 'tab', id: `dtab-${g.key}`,
    'aria-selected': String(i === 0), 'aria-controls': 'drawPanel', tabIndex: i === 0 ? 0 : -1,
    'data-key': g.key,
  }, g.label, h('span', { class: 'n' }, String(drawings[g.key].length))));
  tabsEl.append(...tabs);

  function paint(tiles, g) {
    tiles.forEach((t) => {
      if (t.set === set) return;
      t.set = set;
      const file = g.kind === 'svg' ? `${OWN}drawings/${g.key}/${t.name}${set}.svg` : `${KIT}ready/${g.key}/${t.name}${set}.png`;
      const type = g.kind.toUpperCase();
      t.img.src = file;
      t.a.href = file;
      t.a.download = `${t.name}${set}.${g.kind}`;
      t.a.setAttribute('aria-label', `Download ${t.name}${set}.${g.kind}`);
      t.a.title = `${t.name}${set}.${g.kind}`;
      t.em.textContent = `${type} ↓`;
    });
  }

  function show() {
    const g = groups.find((x) => x.key === current);
    if (!g) return;
    if (!built.has(g.key)) built.set(g.key, drawings[g.key].map((name) => ({ name, set: null, ...fileTile({ name, type: g.kind.toUpperCase() }) })));
    const tiles = built.get(g.key);
    paint(tiles, g);
    panel.dataset.group = g.key;
    panel.classList.toggle('is-navy', set === '-navy');
    panel.setAttribute('aria-labelledby', `dtab-${g.key}`);
    panel.replaceChildren(...tiles.map((t) => t.a));
    note.textContent = `${tiles.length} ${g.label.toLowerCase()} ${tiles.length === 1 ? 'illustration' : 'illustrations'}, ${g.kind.toUpperCase()}. ${SETS[set]}`;
  }

  function select(tab, focus = false) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    if (focus) tab.focus();
    current = tab.dataset.key;
    show();
  }

  tabs.forEach((t) => t.addEventListener('click', () => select(t)));
  tabsEl.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (step) { e.preventDefault(); select(tabs[(i + step + tabs.length) % tabs.length], true); }
    if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
    if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1], true); }
  });

  setBtns.forEach((b) => b.addEventListener('click', () => {
    set = b.dataset.set;
    setBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    show();
  }));

  // Build the first tab when the section gets close, not on page load.
  const io = new IntersectionObserver((es) => {
    if (es.some((e) => e.isIntersecting)) { io.disconnect(); show(); }
  }, { rootMargin: '600px 0px' });
  io.observe(panel);
}

// ---------- 05 icons + school marks ----------
function renderIcons(index) {
  const grid = document.getElementById('iconGrid');
  grid.append(...index.icons.map((n) => fileTile({
    href: `${KIT}brand-kit/icon/${n}.png`, download: `${n}.png`, src: `${KIT}brand-kit/icon/${n}.png`,
    name: n, type: 'PNG', label: `Download ${n}.png`,
  }).a));

  const marks = document.getElementById('markGrid');
  index.schools.forEach((f) => {
    const slug = f.replace(/\.png$/, '');
    marks.append(fileTile({
      href: `${KIT}icon/school/${f}`, download: `school-${f}`, src: `${KIT}icon/school/${f}`,
      name: SCHOOLS[slug] ?? slug, type: 'PNG', label: `Download ${SCHOOLS[slug] ?? slug} mark`,
    }).a);
  });
  index.mascots.forEach((f) => {
    const slug = f.replace(/-\d+\.png$/, '');
    const name = `${SCHOOLS[slug] ?? slug} mascot`;
    marks.append(fileTile({
      href: `${KIT}icon/mascot/${f}`, download: `mascot-${f}`, src: `${KIT}icon/mascot/${f}`,
      name, type: 'PNG', label: `Download ${name}`,
    }).a);
  });
}

// ---------- 06 confetti ----------
async function renderConfetti(names) {
  const grid = document.getElementById('confGrid');
  const seg = document.getElementById('confColor');
  let color = CONFETTI_COLORS[0];

  const shapes = await Promise.all(names.map(async (n) => {
    try {
      const raw = await (await fetch(`${KIT}motif/confetti/${n}.svg`)).text();
      // Keep only the <svg>, let CSS size it, paint every fill with currentColor.
      const svg = raw.slice(raw.indexOf('<svg'))
        .replace(/<metadata>[\s\S]*?<\/metadata>/, '')
        .replace(/\s(width|height)="[^"]*"/g, '')
        .replace(/fill="#[0-9a-fA-F]{3,6}"/g, 'fill="currentColor"');
      return { name: n, svg };
    } catch { return null; }
  }));

  const tiles = shapes.filter(Boolean).map((s) => {
    const holder = h('span', { html: s.svg });
    const svgEl = holder.firstElementChild;
    svgEl.setAttribute('aria-hidden', 'true');
    svgEl.setAttribute('focusable', 'false');
    return { ...s, ...fileTile({ name: s.name, type: 'SVG', inline: svgEl }) };
  });

  function paint() {
    grid.style.setProperty('--conf', color.hex);
    grid.classList.toggle('is-navy', !!color.onNavy);
    tiles.forEach((t) => {
      const out = t.svg.replace('<svg', `<svg width="256" height="256"`).replace(/currentColor/g, color.hex);
      const file = `${t.name}-${color.name.toLowerCase()}.svg`;
      t.a.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(out)}`;
      t.a.download = file;
      t.a.title = file;
      t.a.setAttribute('aria-label', `Download ${file}`);
    });
  }

  const btns = CONFETTI_COLORS.map((c, i) => h('button', { type: 'button', 'aria-pressed': String(i === 0) },
    h('span', { class: 'dot', style: `--c:${c.hex}` }), c.onNavy ? `${c.name} on navy` : c.name));
  btns.forEach((b, i) => b.addEventListener('click', () => {
    color = CONFETTI_COLORS[i];
    btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    paint();
  }));
  seg.append(...btns);
  grid.append(...tiles.map((t) => t.a));
  paint();
}

// ---------- 07 share cards ----------
function renderShare(list) {
  const host = document.getElementById('shareList');
  list.forEach((n) => {
    const name = SHARE_NAMES[n] ?? n;
    host.append(h('figure', { class: 'shot' },
      h('img', { src: `${KIT}og/${n}.png`, alt: `${name} share card: Pick the right prof.`, width: 1200, height: 630, loading: 'lazy', decoding: 'async' }),
      h('figcaption', {},
        h('span', {}, h('b', {}, `${name} card`), h('span', { class: 'mono' }, '1200 × 630 · PNG')),
        h('a', { class: 'btn btn--sm', href: `${KIT}og/${n}.png`, download: `profstopick-share-${n.replace(/^og-/, '')}.png` }, 'Download PNG'))));
  });
}

// ---------- reveal (same as render/page.js) ----------
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0, rootMargin: '0px 0px -12% 0px' });
document.querySelectorAll('.rise').forEach((el) => io.observe(el));

// ---------- go ----------
renderColors();

const [index, own] = await Promise.all([
  getJSON(`${KIT}index.json`),
  getJSON(`${OWN}files.json`).catch(() => ({ drawings: {}, share: ['og-home'] })),
]);

const drawings = { ...index.drawings, ...own.drawings };
const count = (sel, text) => { const n = document.querySelector(`[data-count="${sel}"]`); if (n) n.textContent = text; };
count('drawings', `${GROUPS.reduce((s, g) => s + (drawings[g.key]?.length ?? 0), 0)} illustrations`);
count('icons', `${index.icons.length} icons`);
count('confetti', `${index.confetti.length} shapes`);
if (own.zip?.bytes) document.getElementById('zipSize').textContent = `${(own.zip.bytes / 1e6).toFixed(1)} MB`;

renderApps(index.stars);
setupDrawings(drawings);
renderIcons(index);
renderShare(own.share?.length ? own.share : ['og-home']);
renderConfetti(index.confetti);

// / — the profstopick booth: our half of a shared 3 × 3 m tent on Red Brick Road (bazaar, Nov 9–13).
// Copied from the Blueprint booth render (~/blueprint/boothrender) and changed to the profstopick plan.
// Metres. X = across the tent (our half is x 0 to 1.5, on the left). Z = depth (0 = aisle side, -3 = back). Y = up.
// Words come from the marketing plan, the All Info file, and profstopick.com
// (~/Downloads/ADVO/PROFS2PICK/marketing-plan.html, ~/Downloads/ADVO/PROFS2PICK/Marketing Plan/all-info.html).
import { THREE, canvasTexture, loadImage } from '/render/stage.js';
import { mountPage } from '/render/page.js';
import { loadArt, mountAssets } from '/render/assets.js';

// ---------- sizes ----------
const HALF = 1.5;          // our width (bazaar rule)
const DEPTH = 3;           // tent depth (bazaar rule)
const EAVE = 2.0;          // eave height to ask for
const PEAK = 3.05;         // assumed
const T = { x0: 0, x1: 0.9, z0: -0.85, z1: -0.25, h: 0.75 };          // selling table (Marcus brings it; size assumed)
const BN = { x: 1.18, z: -2.7, w: 0.6, h: 1.6, y0: 0.08 };             // standing banner, assumed 60 × 160 cm
const QR_X = [0.26];                                                  // the one QR stand, back row
const QR_Z = -0.74;
const LAP = { x0: 0.56, x1: 0.88, z0: -0.64, z1: -0.42 };             // laptop base
const CH_X = [0.24, 0.66];                                           // the two chairs
const CH_Z = -1.4;

// ---------- the list ----------
const groups = [
  { code: 'print', label: 'Prints' },
  { code: 'stand', label: 'Stands' },
  { code: 'demo', label: 'Demo and sales' },
  { code: 'furniture', label: 'Furniture' },
  { code: 'home', label: 'Supplies' },
  { code: 'space', label: 'Space' },
];

const zoomTable = { az: 0.42, el: 0.6, tx: 0.45, ty: 0.86, tz: -0.55, size: 1.05, width: 1.5 };
const zoomBanner = { az: 0, el: 0.1, tx: 1.05, ty: 0.92, tz: -2.7, size: 2.0, width: 2.4 };

const pieces = [
  { id: 'banner', num: 1, cat: 'print', name: 'Standing banner', size: '60 × 160 cm (estimate; match the stand)', where: 'Back right, facing the aisle',
    cost: [700, 700], basis: 'planned', flag: 'Price not final',
    note: 'Shows the site name, headline, and what the site does. No prices: the price list and flyer have them. Keep the logo and headline in the top half, since people at the table block the bottom. Atasha’s printer quotes ₱350–450; Patrick is comparing two shops. Measure the stand before printing.',
    view: zoomBanner },
  { id: 'qr', num: 2, cat: 'print', name: 'QR sign', size: 'A5 (148 × 210 mm), QR at least 10 cm', where: 'Table, back row, in the QR stand',
    basis: 'members',
    note: 'One QR for the whole booth: the website, profstopick.com. A 10 cm QR scans from about 1 m away. Test it on two phones. The short link under the QR is the backup.', view: zoomTable },
  { id: 'prices', num: 3, cat: 'print', name: 'Price list', size: 'A4 (210 × 297 mm)', where: 'Table, front left, facing visitors',
    basis: 'members',
    note: 'Free, Semester ₱99, Year ₱150, Graduation ₱250. The Year Pass is listed first and largest as the main offer. Prices match the live site.', view: zoomTable },
  { id: 'flyers', num: 4, cat: 'print', name: 'Flyers', size: 'A6 (105 × 148 mm), double-sided', where: 'Table, front center. The floater carries a stack',
    basis: 'members',
    note: 'Members print 4 per A4 sheet. Front: headline and the QR to profstopick.com. Back: passes, how to pay at the booth, and how to redeem a code.', view: zoomTable },
  { id: 'card', num: 5, cat: 'print', name: 'Pass cards', size: '90 × 54 mm (business card)', where: 'Table, next to the flyers',
    basis: 'print',
    note: 'The voucher is on the pass. Front: the pass. Back: the voucher code, printed. Give one after each cash, GCash, or Maya sale. The buyer enters the code under “Have a code” at profstopick.com/pass. Print the real codes with npm run cards (a private PDF, never on this site).', view: zoomTable },

  { id: 'bannerstand', num: 6, cat: 'stand', name: 'Banner stand', size: 'Tarp stand, about 60 cm wide', where: 'Back right corner',
    cost: [0, 0], basis: 'lend',
    note: 'Lent by Atasha. Measure it first so the banner fits.', view: zoomBanner },
  { id: 'qrstands', num: 7, cat: 'stand', name: 'QR stand', size: '1 A5 acrylic stand', where: 'Table, back row',
    cost: [119, 119], basis: 'planned',
    note: '1 × ₱119. Holds the QR sign upright. The plan had 3; one QR needs one stand.', view: zoomTable },

  { id: 'laptop', num: 8, cat: 'demo', name: 'Demo laptops', size: '2–3 laptops with chargers, one on the table', where: 'Table, front right, screen facing the aisle',
    basis: 'borrow',
    note: 'Brought by members; Patrick brings one charger. Charge fully, then open profstopick.com and sign in to the demo account. A second laptop can go with the floater.', view: zoomTable },
  { id: 'wifi', num: null, cat: 'demo', name: 'Pocket Wi-Fi', size: 'One week of data', where: 'Under the table',
    cost: [150, 150], basis: 'planned',
    note: 'Patrick provides it. Keep a phone hotspot as backup. Test both before Nov 9.' },
  { id: 'power', num: null, cat: 'demo', name: 'Power strip and extension cords', size: '1–2 surge protectors, 5 outlets, 5 m', where: 'Under the table',
    basis: 'borrow',
    note: 'Brought by members. Ask the organizers for the nearest outlet. There may not be one.' },
  { id: 'phone', num: null, cat: 'demo', name: 'Phone and power bank', size: 'Phone with the Revenue Tracker open', where: 'With sales staff',
    basis: 'home',
    note: 'Log each sale, referral code, and how the buyer heard about us. Review totals at the end of each day.' },
  { id: 'pay', num: null, cat: 'demo', name: 'GCash and Maya QR', size: 'On a phone or printed', where: 'With sales staff',
    basis: 'home',
    note: 'Online payment is not live yet. Accept cash, GCash, or Maya. Confirm payment before giving a code.' },
  { id: 'cashbox', num: null, cat: 'demo', name: 'Cash box', size: 'Small lockable box', where: 'Behind the table, with sales staff',
    basis: 'borrow',
    note: 'Patrick borrows or buys it. Keep it off the front of the table. Count it at closing and match it to passes sold.' },

  { id: 'table', num: 9, cat: 'furniture', name: 'Selling table', size: 'About 0.9 × 0.6 m, 0.75 m high (estimate)', where: 'Front left, 0.25 m from the edge',
    basis: 'borrow',
    note: 'Marcus brings it on Monday. Measure it. A table longer than 1.2 m blocks the walkway.' },
  { id: 'cloth', num: 10, cat: 'furniture', name: 'Tablecloth', size: 'Covers the top and reaches the floor in front', where: 'On the selling table',
    cost: [379, 379], basis: 'planned',
    note: 'Black or navy preferred; white also works. Patrick buys it.', view: zoomTable },
  { id: 'chairs', num: 11, cat: 'furniture', name: 'Chairs', size: '2–3, any type', where: 'Behind the table',
    basis: 'borrow',
    note: 'Brought by members. Keep the walkway on the right clear.' },

  { id: 'box', num: 12, cat: 'home', name: 'Supply box', size: 'About 45 × 30 × 30 cm', where: 'Back left, on the floor',
    basis: 'home',
    note: 'Extra flyers and cards, pens, chargers, scissors, cardboard, and a glue gun (Atasha).' },
  { id: 'tape', num: null, cat: 'home', name: 'Tape, zip ties, glue sticks', size: 'Duct tape, zip ties, 2 glue sticks', where: 'In the supply box',
    cost: [274, 274], basis: 'planned',
    note: 'Patrick buys them.' },
  { id: 'sticker', num: null, cat: 'home', name: 'Sticker paper, super glue, glue gun sticks', size: 'For signs and decor', where: 'In the supply box',
    cost: [484, 484], basis: 'planned',
    note: 'Atasha buys the remaining items on Sat Nov 7. Check Patrick’s list first to avoid duplicates.' },

  { id: 'tent', num: 13, cat: 'space', name: 'Tent (our half)', size: '3 × 3 m tent; our half is 1.5 × 3 m (estimate). Eave at least 2.0 m', where: 'Red Brick Road, stall not yet assigned',
    cost: [1128, 1128], basis: 'paid',
    note: 'Paid: ₱1,126.76 per group (₱188 each). Only the tent is provided. Size is based on the Blueprint booth rules; confirm with Sophie. Ask for the highest leg setting: at a 1.8 m eave, a 5′9″ person has only 2 cm of headroom.' },
];

const views = [
  { id: 'corner', label: 'Corner', az: 0.62, el: 0.5, tx: 1.15, ty: 1.05, tz: -1.35, size: 4.4, width: 5.4 },
  { id: 'aisle', label: 'Front', az: 0, el: 0.09, tx: 1.5, ty: 1.3, tz: -1.5, size: 3.5, width: 4.3 },
  { id: 'side', label: 'Side', az: Math.PI / 2, el: 0.05, tx: 1.4, ty: 1.45, tz: -1.2, size: 3.6, width: 5.6 },
  { id: 'top', label: 'Top', az: 0, el: Math.PI / 2, tx: 1.45, ty: 0, tz: -1.15, size: 4.7, width: 4.4 },
  { id: 'table', label: 'Table', ...zoomTable },
  { id: 'banner', label: 'Banner', ...zoomBanner },
];

const layers = [
  { name: 'dims', label: 'Dimensions', mobileOff: true },
  { name: 'roof', label: 'Roof' },
  { name: 'people', label: 'People' },
];

// ---------- page text ----------
const week = [
  ['Sat Nov 7', 'Buy materials', 'Atasha buys the remaining items. Check Patrick’s list first. Send receipts to Mandy.'],
  ['Sun Nov 8', 'Final posts', 'QR code poster (Aeri, Atasha) and D-1 countdown (Aeri). Setup today if Sophie approves (Patrick leads).'],
  ['Before Nov 9', 'Team briefing', 'Prince briefs the team and hands out voucher codes. Test sign-up, one code, and every QR.'],
  ['Mon Nov 9', 'Opening day', 'Morning setup if not done on Sunday. Marcus brings the table. Open 8 AM–5 PM.'],
  ['Nov 10–12', 'Daily operations', 'Monitor the site, restock, and check totals each day. Enlistment is around Nov 12.'],
  ['Fri Nov 13', 'Last day', 'Final promotion push.'],
  ['Nov 14', 'Wrap-up', 'Support users during enlistment. Return unused capital to members.'],
];

// booth roles (ops doc). On a 2-person shift, one person does demo + sign-up, the other does sales.
const posts = [
  ['Booth lead · 1', 'Runs the booth and handles issues.'],
  ['Demo staff · 1', 'Shows visitors how to search profs and courses.'],
  ['Sign-up staff · 1', 'Helps visitors scan the QR and create an account.'],
  ['Sales staff · 1', 'Explains pricing, takes payment, gives the code, and logs the sale.'],
  ['Floater · 1', 'Manages the line, restocks, covers breaks, and hands out flyers.'],
];

const steps = [
  ['1', 'Attract', 'Draw visitors in with the banner, signs, and social posts.'],
  ['2', 'Demo', 'Show how to search profs and courses on the laptop.'],
  ['3', 'Pitch', 'Explain free vs. paid. Recommend the Year Pass.'],
  ['4', 'Sign up', 'Scan the QR code and create an account.'],
  ['5', 'Pay', 'Accept cash, GCash, or Maya. Give a voucher code to redeem on the site.'],
  ['6', 'Log', 'Record the sale, referral code, and source in the Revenue Tracker.'],
];

// the team and each shift color (business report)
const team = [
  { id: 'atasha', name: 'Atasha', full: 'Atasha Gaddi', color: '#8b5cf6', role: 'Group lead, marketing, and cashier. Buys materials. Provides the banner stand and printer.' },
  { id: 'aeri', name: 'Aeri', full: 'Mary “Aeri” Mantala', color: '#ec4899', role: 'Marketing: Instagram posts, reel, QR poster, and countdown. Booth decor.' },
  { id: 'mandy', name: 'Mandy', full: 'Mandy Bustamante', color: '#16a34a', role: 'Operations: materials list, Financial Tracker, and receipts.' },
  { id: 'marcus', name: 'Marcus', full: 'Marcus Yan', color: '#dc2626', role: 'Operations: reel interviews. Brings the table on Monday.' },
  { id: 'patrick', name: 'Patrick', full: 'Patrick Ong', color: '#2563eb', role: 'Operations: leads setup. Handles Wi-Fi, tablecloth, supplies, cash box, and banner quotes.' },
  { id: 'prince', name: 'Prince', full: 'Prince Wagan', color: '#fb923c', role: 'Website, pricing, voucher codes, and team briefing. Cashier.' },
];
const ALL = team.map((m) => m.id);

// booth shifts: 3 blocks a day (business report, the colored shift table)
const shifts = [
  ['Mon Nov 9', ['mandy', 'patrick'], ['atasha', 'aeri'], ['atasha', 'aeri', 'marcus']],
  ['Tue Nov 10', ['prince'], ALL, ['mandy', 'marcus', 'patrick']],
  ['Wed Nov 11', ['atasha', 'aeri', 'prince', 'patrick'], ALL, ['mandy', 'prince', 'marcus']],
  ['Thu Nov 12', ['atasha', 'aeri'], ['marcus'], ['mandy', 'patrick']],
  ['Fri Nov 13', ['atasha'], ALL, ALL],
];

const trouble = [
  ['Site is down', 'Show the recorded demo or screenshots. Tell Prince.'],
  ['No internet', 'Switch to a phone hotspot.'],
  ['Payment fails', 'Offer another payment method. Confirm payment before giving a code.'],
  ['QR won’t scan', 'Share the short link printed under the QR.'],
  ['Long line', 'Assign one person to manage the line.'],
  ['Missing staff', 'A backup member covers the role.'],
];

// ---------- textures (the print on each piece) ----------
// The print comes from the print files (/assets/print/booth, made by `npm run print`).
// Pick a version in the list below the model and the texture changes.
const art = await loadArt('booth');

function makeTextures() {
  return {
    banner: art.tex('banner', { w: 512 }),
    qr: art.tex('qr', { w: 512 }),            // one sign, the same in each stand
    prices: art.tex('prices', { w: 512 }),
    flyer: art.tex('flyer', { w: 384 }),     // front of the flyer
    card: art.tex('card', { w: 256 }),       // front of the card
    cardBack: art.tex('cardback', { w: 256 }),   // back of the card: the voucher code
  };
}

function brickTexture() {
  // Red Brick Road: running bond, 200 × 100 mm bricks. Texture covers 1.6 m × 1.6 m.
  const tex = canvasTexture(1024, 1024, (g, w, h) => {
    g.fillStyle = '#c9b2a0'; g.fillRect(0, 0, w, h);
    const bw = 128, bh = 64, m = 4;
    let s = 3;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let r = 0; r < h / bh; r++) {
      const off = r % 2 ? bw / 2 : 0;
      for (let c = -1; c < w / bw + 1; c++) {
        const l = 34 + rnd() * 10;
        const hue = 9 + rnd() * 8;
        g.fillStyle = `hsl(${hue} 52% ${l}%)`;
        g.fillRect(c * bw + off + m / 2, r * bh + m / 2, bw - m, bh - m);
      }
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// The demo laptop shows the live site (a screenshot of profstopick.com, assets/booth/site-home.jpg).
async function screenTexture() {
  const tex = canvasTexture(1024, 640, (g, w, h) => { g.fillStyle = '#f7f8fa'; g.fillRect(0, 0, w, h); });
  try {
    const im = await loadImage('/assets/booth/site-home.jpg');
    const g = tex.image.getContext('2d');
    g.drawImage(im, 0, 0, tex.image.width, tex.image.height);
    tex.needsUpdate = true;
  } catch { /* no screenshot: a blank screen */ }
  return tex;
}

// ---------- the model ----------
async function build(S) {
  const tx = makeTextures();
  const screen = await screenTexture();
  await art.ready();

  const L = { dims: S.layer('dims'), roof: S.layer('roof'), people: S.layer('people') };

  // ground: Red Brick Road
  const bricks = brickTexture();
  const gw = 12, gd = 9;
  bricks.repeat.set(gw / 1.6, gd / 1.6);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(gw, gd), S.mat(0xffffff, { map: bricks }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(1.5, 0, -0.5);
  ground.receiveShadow = true;
  S.add(ground);
  // fade the far ground edges into the page
  const fade = canvasTexture(512, 512, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, w * 0.18, w / 2, h / 2, w * 0.5);
    gr.addColorStop(0, 'rgba(247,248,250,0)'); gr.addColorStop(1, 'rgba(238,243,250,1)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  const fadeM = new THREE.Mesh(new THREE.PlaneGeometry(gw + 0.02, gd + 0.02), new THREE.MeshBasicMaterial({ map: fade, transparent: true, depthWrite: false }));
  fadeM.rotation.x = -Math.PI / 2;
  fadeM.position.set(1.5, 0.002, -0.5);
  S.add(fadeM);

  // our floor, the walkway, and the other group's floor
  S.add(S.box(0, 0.002, -DEPTH, HALF, 0.008, 0, S.mat(0xf3f6fb, { opacity: 0.55 }), { edges: false, cast: false }));
  S.add(S.box(T.x1, 0.009, -DEPTH, HALF, 0.012, 0, S.mat(0xd5e3f7, { opacity: 0.75 }), { edges: false, cast: false }));
  S.add(S.box(HALF, 0.002, -DEPTH, 3, 0.008, 0, S.mat(0xe4e9f2, { opacity: 0.62 }), { edges: false, cast: false }));
  S.tag([2.25, 0.02, -1.5], 'other group', { cls: 'tag--zone' });
  S.tag([1.2, 0.02, -1.6], 'walkway', { cls: 'tag--soft' });
  S.tag([1.5, 0.02, 1.95], 'aisle · Red Brick Road', { cls: 'tag--zone' });

  // 12 tent frame
  const steel = S.mat(0xe9edf3);
  const frame = new THREE.Group();
  const leg = 0.035;
  [[0, 0], [3, 0], [3, -3], [0, -3]].forEach(([x, z]) => frame.add(S.box(x - leg / 2, 0, z - leg / 2, x + leg / 2, EAVE, z + leg / 2, steel)));
  const bar = 0.03;
  frame.add(S.box(0, EAVE - bar, -bar / 2, 3, EAVE, bar / 2, steel));
  frame.add(S.box(0, EAVE - bar, -3 - bar / 2, 3, EAVE, -3 + bar / 2, steel));
  frame.add(S.box(-bar / 2, EAVE - bar, -3, bar / 2, EAVE, 0, steel));
  frame.add(S.box(3 - bar / 2, EAVE - bar, -3, 3 + bar / 2, EAVE, 0, steel));
  S.put('tent', frame);
  // roof canopy
  const P = [1.5, PEAK, -1.5];
  const c = [[0, EAVE, 0], [3, EAVE, 0], [3, EAVE, -3], [0, EAVE, -3]];
  const tri = [];
  for (let i = 0; i < 4; i++) tri.push(...c[i], ...c[(i + 1) % 4], ...P);
  const rg = new THREE.BufferGeometry();
  rg.setAttribute('position', new THREE.Float32BufferAttribute(tri, 3));
  rg.computeVertexNormals();
  const roof = new THREE.Mesh(rg, S.mat(0xffffff, { opacity: 0.2, side: THREE.DoubleSide }));
  roof.userData.noPick = true;
  S.edges(roof, 10);
  L.roof.add(roof);
  // the line between the two halves (no middle bar)
  S.add(S.lines([[HALF, 0.01, 0], [HALF, 0.01, -DEPTH]], S.dimMat));

  // neighbour tents, as faint frames, so the row reads
  [-3, 3].forEach((dx) => {
    const pts = [];
    const [a, b] = dx < 0 ? [-3, 0] : [3, 6];
    [[a, 0], [b, 0], [b, -3], [a, -3]].forEach(([x, z]) => pts.push([x, 0, z], [x, EAVE, z]));
    pts.push([a, EAVE, 0], [b, EAVE, 0], [a, EAVE, -3], [b, EAVE, -3], [a, EAVE, 0], [a, EAVE, -3], [b, EAVE, 0], [b, EAVE, -3]);
    const pk = [(a + b) / 2, PEAK, -1.5];
    [[a, 0], [b, 0], [b, -3], [a, -3]].forEach(([x, z]) => pts.push([x, EAVE, z], pk));
    S.add(S.lines(pts, S.faintMat));
    S.tag([(a + b) / 2, 0.02, -1.5], 'next tent', { cls: 'tag--soft' });
  });

  // 1 standing banner + 6 its stand
  const banner = S.panel({ w: BN.w, h: BN.h, t: 0.004, map: tx.banner });
  banner.position.set(BN.x, BN.y0 + BN.h / 2, BN.z);
  S.put('banner', banner);
  const standM = S.mat(0x3a4150);
  const stand = new THREE.Group();
  stand.add(S.box(BN.x - 0.31, 0, BN.z - 0.2, BN.x + 0.31, 0.03, BN.z - 0.12, standM));          // base
  stand.add(S.cyl(BN.x, 0.03, BN.z - 0.16, 0.009, BN.y0 + BN.h + 0.02, standM));               // pole
  stand.add(S.box(BN.x - 0.31, BN.y0 + BN.h, BN.z - 0.012, BN.x + 0.31, BN.y0 + BN.h + 0.018, BN.z + 0.004, standM));   // top bar
  stand.add(S.box(BN.x - 0.31, BN.y0 - 0.02, BN.z - 0.012, BN.x + 0.31, BN.y0, BN.z + 0.004, standM));                 // bottom bar
  S.put('bannerstand', stand);

  // 9 selling table
  const tableTop = S.mat(0xf4f1ea);
  const legM = S.mat(0x9aa3b5);
  const table = new THREE.Group();
  table.add(S.box(T.x0, T.h - 0.03, T.z0, T.x1, T.h, T.z1, tableTop));
  [[T.x0 + 0.04, T.z0 + 0.04], [T.x1 - 0.04, T.z0 + 0.04], [T.x0 + 0.04, T.z1 - 0.04], [T.x1 - 0.04, T.z1 - 0.04]]
    .forEach(([x, z]) => table.add(S.cyl(x, 0, z, 0.012, T.h - 0.03, legM)));
  S.put('table', table);

  // 10 tablecloth, navy: over the top, down the front and both sides. The back stays open for the seller.
  const clothM = S.mat(0x0d3b7a);
  const cloth = new THREE.Group();
  const co = 0.012;
  cloth.add(S.box(T.x0 - co, T.h - 0.034, T.z0 - co, T.x1 + co, T.h + 0.001, T.z1 + co, clothM));
  cloth.add(S.box(T.x0 - co, 0.02, T.z1, T.x1 + co, T.h - 0.034, T.z1 + co, clothM));
  cloth.add(S.box(T.x0 - co, 0.02, T.z0 - co, T.x0, T.h - 0.034, T.z1, clothM));
  cloth.add(S.box(T.x1, 0.02, T.z0 - co, T.x1 + co, T.h - 0.034, T.z1, clothM));
  S.put('cloth', cloth);

  // 2 the QR sign in 7 its acrylic stand, back row
  const acrylic = S.mat(0xdfe8f5, { opacity: 0.38 });
  const qrStands = new THREE.Group();
  QR_X.forEach((x) => {
    const sign = S.panel({ w: 0.148, h: 0.21, t: 0.003, map: tx.qr });
    const g = new THREE.Group();
    sign.position.set(0, 0.21 / 2 + 0.012, 0);
    g.add(sign);
    g.position.set(x, T.h, QR_Z);
    g.rotation.x = -0.14;
    S.put('qr', g);
    qrStands.add(S.box(x - 0.082, T.h, QR_Z - 0.045, x + 0.082, T.h + 0.008, QR_Z + 0.03, acrylic, { cast: false }));
    const back = S.box(-0.08, 0, -0.004, 0.08, 0.225, 0.0, acrylic, { cast: false });
    const bg = new THREE.Group();
    bg.add(back);
    bg.position.set(x, T.h + 0.008, QR_Z - 0.006);
    bg.rotation.x = -0.14;
    qrStands.add(bg);
  });
  S.put('qrstands', qrStands);

  // front row, flat
  const flat = (w, d, x, z, map, y = T.h, t = 0.003) => {
    const p = S.panel({ w, h: d, t, face: '+y', map });
    p.position.set(x, y + t / 2, z);
    return p;
  };
  // 3 price list, A4, top edge to the back
  const prices = flat(0.21, 0.297, 0.14, -0.43, tx.prices, T.h, 0.002);
  prices.rotation.y = 0.04;
  S.put('prices', prices);
  // 4 flyers
  const flyers = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const f = flat(0.105, 0.148, 0.33, -0.36, tx.flyer, T.h + i * 0.0025, 0.0025);
    f.rotation.y = -0.08 + i * 0.025;
    flyers.add(f);
  }
  S.put('flyers', flyers);
  // 5 pass cards
  const cards = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const cd = flat(0.09, 0.054, 0.46, -0.32, tx.card, T.h + i * 0.0022, 0.0022);
    cd.rotation.y = 0.06 - i * 0.03;
    cards.add(cd);
  }
  // one card turned over beside the stack, to show the back (the voucher code)
  const cb = flat(0.09, 0.054, 0.565, -0.335, tx.cardBack, T.h, 0.0022);
  cb.rotation.y = -0.1;
  cards.add(cb);
  S.put('card', cards);

  // 8 demo laptop, screen to the aisle
  const laptop = new THREE.Group();
  const shell = S.mat(0xc9ced8);
  laptop.add(S.box(LAP.x0, T.h, LAP.z0, LAP.x1, T.h + 0.016, LAP.z1, shell));
  laptop.add(S.box(LAP.x0 + 0.02, T.h + 0.016, LAP.z0 + 0.02, LAP.x1 - 0.02, T.h + 0.018, LAP.z0 + 0.13, S.mat(0x2a2f3a)));   // keys
  const lid = new THREE.Group();
  const lidW = LAP.x1 - LAP.x0, lidH = 0.21;
  lid.add(S.box(-lidW / 2, 0, -0.008, lidW / 2, lidH, 0, shell));
  const disp = S.panel({ w: lidW - 0.02, h: lidH - 0.025, t: 0.002, map: screen, edges: false });
  disp.position.set(0, (lidH - 0.025) / 2 + 0.012, 0.001);
  lid.add(disp);
  lid.position.set((LAP.x0 + LAP.x1) / 2, T.h + 0.016, LAP.z0);
  lid.rotation.x = -0.24;
  laptop.add(lid);
  S.put('laptop', laptop);
  // the laptop faces the aisle, so the visitor drives it. Turn it to the seller between demos.

  // 11 chairs, behind the table. Back rest away from the table.
  const chairM = S.mat(0x5a6170);
  const chairs = new THREE.Group();
  CH_X.forEach((x) => {
    const r = 0.21, z = CH_Z;
    chairs.add(S.box(x - r, 0.43, z - r, x + r, 0.46, z + r, chairM));                                  // seat
    chairs.add(S.box(x - r, 0.46, z - r, x + r, 0.86, z - r + 0.03, chairM));                          // back
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([dx, dz]) => chairs.add(S.cyl(x + dx * (r - 0.02), 0, z + dz * (r - 0.02), 0.011, 0.43, legM)));
  });
  S.put('chairs', chairs);

  // 12 supply box
  S.put('box', S.box(0.06, 0, -2.6, 0.51, 0.3, -2.3, S.mat(0xc79b6a)));

  // people: sales staff (5′9″) between the table and the chairs, and the floater in the aisle with flyers
  L.people.add(S.person(0.45, -1.03, { h: 1.7526 }));
  S.tag([0.45, 1.86, -1.03], 'sales staff, 5′9″', { cls: 'tag--soft', layer: 'people' });
  L.people.add(S.person(2.6, 1.3, { h: 1.7 }));
  S.tag([2.6, 1.82, 1.3], 'floater', { cls: 'tag--soft', layer: 'people' });

  // ---------- size lines ----------
  S.dim([0, 0, 0], [HALF, 0, 0], '1.5 m', { off: [0, 0, 0.32], tick: [0, 0, 1] });
  S.dim([0, 0, 0], [0, 0, -DEPTH], '3 m', { off: [-0.32, 0, 0], tick: [1, 0, 0] });
  S.dim([0, 0, 0], [0, EAVE, 0], 'eave 2.0 m', { off: [-0.3, 0, 0.3], tick: [1, 0, 0] });
  S.dim([3, 0, -1.5], [3, PEAK, -1.5], 'peak 3.05 m (estimate)', { off: [0.75, 0, 0], tick: [1, 0, 0] });
  S.dim([BN.x - BN.w / 2, BN.y0 + BN.h, BN.z + 0.02], [BN.x + BN.w / 2, BN.y0 + BN.h, BN.z + 0.02], '0.6 m', { off: [0, 0.14, 0], tick: [0, 1, 0] });
  S.dim([BN.x + BN.w / 2, BN.y0, BN.z + 0.02], [BN.x + BN.w / 2, BN.y0 + BN.h, BN.z + 0.02], '1.6 m', { off: [0.16, 0, 0], tick: [1, 0, 0] });
  S.dim([T.x1, 0.02, -2.05], [HALF, 0.02, -2.05], '0.6 m', { tick: [0, 0, 1] });
  S.dim([0, 0.01, 0], [0, 0.01, T.z1], '0.25 m', { off: [0.06, 0, 0], tick: [1, 0, 0] });

  // ---------- pins (numbers match the list) ----------
  const pins = {
    banner: [BN.x, 1.45, BN.z + 0.03], qr: [QR_X[0], T.h + 0.3, QR_Z], prices: [0.14, T.h + 0.04, -0.43],
    flyers: [0.33, T.h + 0.06, -0.36], card: [0.46, T.h + 0.05, -0.32],
    bannerstand: [BN.x + 0.3, 0.12, BN.z - 0.16], qrstands: [QR_X[0] - 0.06, T.h + 0.02, QR_Z + 0.02],
    laptop: [(LAP.x0 + LAP.x1) / 2, T.h + 0.26, LAP.z0 - 0.04], table: [T.x1, 0.42, T.z0],
    cloth: [T.x0 + 0.22, 0.38, T.z1 + 0.02], chairs: [CH_X[1] + 0.1, 0.9, CH_Z - 0.2],
    box: [0.28, 0.32, -2.45], tent: [3, EAVE - 0.25, 0],
  };
  pieces.forEach((p) => {
    if (!p.num || !pins[p.id]) return;
    S.pin(p.id, p.num, pins[p.id], 'pins');
  });
}

// ---------- page text that is not in the model ----------
document.getElementById('caption').textContent =
  'Measurements in metres. Booth size follows the Blueprint bazaar rules (1.5 × 3 m per group) and still needs to be confirmed with Sophie. Banner and table sizes are estimates until measured.';
document.getElementById('runSheet').innerHTML = week.map(([time, title, text]) => `<li><time>${time}</time><div><b>${title}</b><span>${text}</span></div></li>`).join('');
document.getElementById('posts').innerHTML = posts.map(([who, text]) => `<li><time>×${who.split(' · ')[1]}</time><div><b>${who.split(' · ')[0]}</b><span>${text}</span></div></li>`).join('');
document.getElementById('steps').innerHTML = steps.map(([n, title, text]) => `<li><span class="step__n">${n}</span><b>${title}</b><span>${text}</span></li>`).join('');
const byMember = new Map(team.map((m) => [m.id, m]));
const chip = (id) => { const m = byMember.get(id); return `<span class="chip" style="--c:${m.color}">${m.name}</span>`; };
const block = (ids) => (ids === ALL ? '<span class="chip chip--all">Everyone</span>' : ids.map(chip).join(''));
const BLOCKS = ['8–11 AM', '11 AM–2 PM', '2–5 PM'];
// dates across the top, the three time blocks down the side
document.getElementById('shiftHead').innerHTML = `<tr><th>Time</th>${shifts.map(([day]) => `<th scope="col">${day}</th>`).join('')}</tr>`;
document.getElementById('shiftBody').innerHTML = BLOCKS.map((time, i) => `<tr><th scope="row">${time}</th>${shifts.map(([day, ...blocks]) => `<td data-k="${day}">${block(blocks[i])}</td>`).join('')}</tr>`).join('');
document.getElementById('team').innerHTML = team.map((m) => `<li><span class="dot" style="--c:${m.color}"></span><div><b>${m.full}</b><span>${m.role}</span></div></li>`).join('');
document.getElementById('trouble').innerHTML = trouble.map(([k, v]) => `<li><b>${k}</b><span>${v}</span></li>`).join('');

mountPage({ pieces, groups, views, layers, build, shadowBox: 6 }).then((stage) => {
  if (stage) art.onChange(() => { stage.dirty = true; });
  mountAssets(art, { pieces, stage });
});

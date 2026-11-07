# profstopick — booth render and brand kit

A small site for the profstopick team: the bazaar booth (Nov 9–13) in 3D, the print files, and every brand file.
It is a copy of the Blueprint render pages (`~/blueprint/venuerender`, `~/blueprint/boothrender`), changed to profstopick.

No build step. Plain HTML, CSS, and JS.

```bash
cd ~/profstopick-booth
python3 -m http.server 5190     # then open http://localhost:5190/
```

## Pages

| Page | What it is |
|---|---|
| `/` | The booth: our half (1.5 × 3 m) of a shared 3 × 3 m tent on Red Brick Road. 3D model, numbered parts list, print files, the six sale steps, the week, booth roles, shifts and the team, open/close/fix, checklist with costs (₱3,234), what to check. |
| `/kit/` | The brand kit: logo, colors, type, drawings, icons, confetti, share cards. Every file downloads. One zip with everything. |

## Files

| File | What to change there |
|---|---|
| `booth.js` | The booth: sizes at the top (`HALF`, `DEPTH`, `EAVE`, the table `T`, the banner `BN`, the chairs `CH_X`), the parts list with costs, the week, the booth roles (`posts`), the six steps, the team and shift colors (`team`), the shifts (`shifts`), what to do if something goes wrong (`trouble`), and the 3D model. |
| `index.html` | The booth page text: the facts at the top, "What we know", "Still to check". |
| `kit/` | The brand kit page. |
| `render/` | The 3D engine and page wiring, copied from Blueprint. Colors are the profstopick tokens (top of `render/render.css`). |
| `scripts/print/kit.mjs` | The facts on every print (`F`: the main pass is the one with `main: true`, how to pay, how to redeem a code), the real links behind each QR (`URLS`), the six looks (`LOOKS`, `LOOK`), and the logo, drawing, and QR helpers. |
| `scripts/print/booth.mjs` | One entry per printed piece, with six versions each. |
| `assets/kit/` | Brand files from https://profstopick.com/kitchen-sink. `ready/` has the drawings joined into one PNG each (see below). |
| `assets/booth/site-home.jpg` | The picture of profstopick.com on the demo laptop. |

## Print files

Each printed piece (standing banner, QR sign, price list, flyers, hook flyers, pass cards) has six versions:

- **V1 Navy card**: like the share card. Navy, white type, one light-blue word, the line drawings.
- **V2 Paper**: like the app. Light paper, dark type, blue accents.
- **V3 Big type**: fewest words, biggest type, solid brand blue.
- **V4–V6**: V1–V3 with less. No drawings, no sparkles, no boxes, no small print.

Each version has a print **PDF** (vector) and a **JPG**. They are in `assets/print/booth/`. Pick a version on the page and the 3D model changes.

```bash
npm install                     # once
npm run print                   # every piece
npm run print -- booth qr       # one piece
```

There is one QR on every print: `https://profstopick.com` (`URLS.home`). Print one QR sign per stand. Test it on 2 phones before you print.

The banner has no prices. The price list and the flyer back have them.

The six hook flyers each ask one question big ("Want an easy A?", "Hate 8 AM classes?" ...). The words are in
`HOOKS` in `kit.mjs`. The back is the normal flyer back. Hand out a mix.

The staff FAQ (A4, white, one version) is for the team, not for visitors: the prices, then each common question with
what to say. The words are in `FAQ` in `kit.mjs`.

The pass card is the voucher. The front reads like a paid plan: "1 year of profstopick" and a Year Pass tag. The back
prints the voucher code. The files on this site show a sample code (`F.sampleCode`). Real codes never go in `assets/`
(the site is public). To print them:

```bash
npm run cards -- ~/Downloads/codes.txt v4    # one code per line; add ", Semester Pass" for another pass
```

A line with no pass prints the Year Pass. A line with a pass changes the front ("1 semester of profstopick") and names
the pass on the back.

This makes `pass-cards-v4.pdf` next to the codes file: front, back, front, back, one pair per code.

The Year Pass is first and biggest on every print (the plan's main sale). Online payment is not on yet, so the
prints say: pay with cash, GCash, or Maya, get a voucher code, redeem it at profstopick.com/pass. The referral
deal is not on the flyer (Sir Ingco does not like it). It is still in `F.referral` if the team keeps it.

## Drawings

On profstopick.com each drawing is two layers (lines + fill). `scripts/drawings.py` joins them into one PNG:
`<name>.png` (dark lines, blue fill, for light prints) and `<name>-navy.png` (white lines, light-blue fill, for navy prints).

```bash
npm run drawings
```

## Where the words come from

- Prices and pass words: the live site, `/pass`.
- Goals, sale steps, IG posts: the marketing plan (`~/Downloads/ADVO/PROFS2PICK/marketing-plan.html`).
- Team, shifts, materials with costs, money, open/close/fix, what is still open: the All Info file
  (`~/Downloads/ADVO/PROFS2PICK/Marketing Plan/all-info.html`, PDF next to it).
- Who brings what, setup day, voucher codes: the ENTREP group chat (`~/Downloads/ADVO/PROFS2PICK/Group Chat/`).
- Booth size and tent rules: the same bazaar rules as the Blueprint booth. Not confirmed. Check them with Sophie (entrep coordinator).

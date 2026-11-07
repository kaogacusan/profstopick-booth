# Builds the brand kit download for the /kit page.
#   python3 scripts/zip-kit.py
#
# 1. Makes a few files the site does not ship as files, from the site's own files:
#      kit/files/logo/wordmark-white.svg   white word + white badge with a navy star (as on the share card), for navy grounds
#      kit/files/logo/badge-white.svg      white badge, navy star
#      kit/files/logo/word-ink.svg         the word alone, ink #16181d
#      kit/files/logo/word-white.svg       the word alone, white
#      kit/files/drawings/<group>/<name>.svg and <name>-navy.svg
#                                          portrait + wide drawings (two-layer SVGs on the site) joined into one file
#      kit/files/files.json                what the page reads: extra drawings, share cards, zip size
# 2. Zips everything into assets/kit/profstopick-brand-kit.zip with plain folder names.
import json, re, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KIT = ROOT / 'assets' / 'kit'
OUT = ROOT / 'kit' / 'files'
ZIP = KIT / 'profstopick-brand-kit.zip'
TOP = 'profstopick-brand-kit'

INK, ACCENT, NAVY, SKY, WHITE = '#16181d', '#416ea8', '#0d3b7a', '#9ac0f4', '#ffffff'
# Same colors as scripts/drawings.py uses for the ready PNGs.
DRAW_SETS = {'': (INK, ACCENT), '-navy': (WHITE, SKY)}
# Drawings that are SVG only on the site. Folder on the site -> name in the kit.
SVG_GROUPS = {'portrait': 'portrait', 'bleed': 'wide'}


def write(path: Path, text: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text)


# ---------- logo ----------
word_svg = (KIT / 'brand' / 'wordmark.svg').read_text()
badge_svg = (KIT / 'brand' / 'badge.svg').read_text()


def white_badge(svg: str) -> str:
    # On the share card the badge is a white square with a navy star and a white face.
    svg = svg.replace(f'fill="{WHITE}" stroke="{WHITE}"', f'fill="{NAVY}" stroke="{NAVY}"')
    return svg.replace(ACCENT, WHITE)


inner = word_svg[word_svg.index('>') + 1:word_svg.rindex('</svg>')]
word_only = inner[:inner.index('</svg>') + 6]  # first nested <svg>: the letters, 255 x 51


def word(color: str) -> str:
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 255 51" width="255" height="51">'
            + word_only.replace(f'fill="{INK}"', f'fill="{color}"') + '</svg>\n')


write(OUT / 'logo' / 'wordmark-white.svg', white_badge(word_svg).replace(f'fill="{INK}"', f'fill="{WHITE}"'))
write(OUT / 'logo' / 'badge-white.svg', white_badge(badge_svg))
write(OUT / 'logo' / 'word-ink.svg', word(INK))
write(OUT / 'logo' / 'word-white.svg', word(WHITE))

# ---------- SVG-only drawings: join the line layer (ink) over the fill layer (accent) ----------
G_RE = re.compile(r'<g\b[^>]*>.*</g>', re.S)
VB_RE = re.compile(r'viewBox="([^"]+)"')
extra = {}
for src_group, name_group in SVG_GROUPS.items():
    src = KIT / 'illustration' / src_group
    names = sorted(f.name[:-8] for f in src.glob('*-ink.svg') if (src / f'{f.name[:-8]}-accent.svg').exists()) if src.is_dir() else []
    for n in names:
        ink = (src / f'{n}-ink.svg').read_text()
        acc = (src / f'{n}-accent.svg').read_text()
        vb = [float(v) for v in VB_RE.search(ink).group(1).split()]
        w, h = round(vb[2]), round(vb[3])
        for suffix, (ink_c, acc_c) in DRAW_SETS.items():
            layers = [G_RE.search(acc).group(0).replace('fill="#000000"', f'fill="{acc_c}"'),
                      G_RE.search(ink).group(0).replace('fill="#000000"', f'fill="{ink_c}"')]
            write(OUT / 'drawings' / name_group / f'{n}{suffix}.svg',
                  f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">\n'
                  + '\n'.join(layers) + '\n</svg>\n')
    if names:
        extra[name_group] = names
    print(f'{name_group}: {len(names)} joined')

# ---------- zip ----------
index = json.loads((KIT / 'index.json').read_text())
share = sorted(f.stem for f in (KIT / 'og').glob('*.png'))
files = []  # (source path, path inside the zip)


def add(src: Path, dst: str):
    if src.exists():
        files.append((src, f'{TOP}/{dst}'))
    else:
        print(f'  missing, skipped: {src.relative_to(ROOT)}')


for f in ['wordmark.svg', 'wordmark.png', 'badge.svg']:
    add(KIT / 'brand' / f, f'logo/{f}')
for f in sorted((OUT / 'logo').glob('*.svg')):
    add(f, f'logo/{f.name}')

for f in index['stars']:
    add(KIT / 'icon' / 'star' / f, f'app-icons/{f}')
for f in ['icon.png', 'apple-icon.png', 'favicon.ico']:
    add(KIT / f, f'app-icons/{f}')
for f in index['schools']:
    add(KIT / 'icon' / 'school' / f, f'school-marks/{f}')
for f in index['mascots']:
    add(KIT / 'icon' / 'mascot' / f, f'school-marks/mascot-{f}')

for group, names in index['drawings'].items():
    for n in names:
        add(KIT / 'ready' / group / f'{n}.png', f'drawings/{group}/{n}.png')
        add(KIT / 'ready' / group / f'{n}-navy.png', f'drawings-navy/{group}/{n}.png')
for group, names in extra.items():
    for n in names:
        add(OUT / 'drawings' / group / f'{n}.svg', f'drawings/{group}/{n}.svg')
        add(OUT / 'drawings' / group / f'{n}-navy.svg', f'drawings-navy/{group}/{n}.svg')

for n in index['icons']:
    add(KIT / 'brand-kit' / 'icon' / f'{n}.png', f'icons/{n}.png')
for n in index['confetti']:
    add(KIT / 'motif' / 'confetti' / f'{n}.svg', f'confetti/{n}.svg')
for n in share:
    add(KIT / 'og' / f'{n}.png', f'share-cards/{n}.png')

README = f"""profstopick brand kit
Files from profstopick.com/kitchen-sink, for the booth team.

FOLDERS
  logo/            wordmark (word + badge), badge, word alone. "-white" files are for navy grounds.
  app-icons/       the app icon per school. 192 = small. 512-maskable = wide edge, phones crop it.
  school-marks/    one black shape per school
  drawings/        dark lines + blue fill, see-through ground. For light grounds.
  drawings-navy/   white lines + light-blue fill, see-through ground. For navy grounds.
  icons/           40 icons. Reference only, not used in the product.
  confetti/        10 small shapes, SVG. Color them in any editor (they come in #102a4e).
  share-cards/     the link preview card, 1200 x 630

COLORS
  Navy        #0d3b7a   share card ground
  Accent      #416ea8   the badge, the app color
  Accent deep #31567f
  Sky         #9ac0f4   the light word on the share card
  Tint        #eaeff6
  Paper       #f7f8fa   page ground
  Well        #eff1f5
  Ink         #16181d   text, the word
  Ink soft    #5a6170
  Line        #e5e8ee   hairline borders
  Score bands: Great #1f9d55, Good #84cc16, Okay #eab308, Poor #f97316, Bad #ef4444

TYPE
  Onest          body and headlines   https://fonts.google.com/specimen/Onest
  Red Hat Mono   codes and numbers    https://fonts.google.com/specimen/Red+Hat+Mono
  Headlines: Onest 800, tight letter spacing, one word in blue. "Pick the right prof."
  Cards: 4px corners, hairline borders.
  The peso sign is not in Onest or Red Hat Mono. Use the ₱ from Inter (Google Fonts), so it looks the same everywhere.

LINES
  Pick the right prof.
  Enlist smarter with ProfstoPick.
  Real student reviews, live section schedules and an advisor for enlistment.
"""

ZIP.unlink(missing_ok=True)
with zipfile.ZipFile(ZIP, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    z.writestr(f'{TOP}/README.txt', README)
    for src, dst in files:
        # PNGs are already compressed; store them as is.
        z.write(src, dst, compress_type=zipfile.ZIP_STORED if src.suffix == '.png' else zipfile.ZIP_DEFLATED)

size = ZIP.stat().st_size
write(OUT / 'files.json', json.dumps({
    'zip': {'href': '/assets/kit/profstopick-brand-kit.zip', 'bytes': size, 'files': len(files) + 1},
    'drawings': extra,
    'share': share,
}, indent=1) + '\n')
print(f'{len(files) + 1} files -> {ZIP.relative_to(ROOT)} ({size / 1e6:.1f} MB)')

# Joins the two-layer drawings from profstopick.com (name-ink.png + name-accent.png) into ready-to-use PNGs.
# On the site the layers are CSS masks. Here each pair becomes:
#   assets/kit/ready/<group>/<name>.png          ink #16181d + accent #416ea8, see-through ground (for light prints)
#   assets/kit/ready/<group>/<name>-navy.png     white + light blue #9ac0f4, see-through ground (for navy prints)
#   assets/kit/ready/<group>/<name>-fill.png     navy lines + light blue, the inside filled white (for navy and blue
#                                                prints: in -navy the skin is see-through, so people look blue)
# It also writes assets/kit/index.json, the file list the /kit page reads.
#   python3 scripts/drawings.py
import json, os
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
KIT = ROOT / 'assets' / 'kit'
READY = KIT / 'ready'
# suffix: (lines, accent, inside or None)
SETS = {
    '': ((0x16, 0x18, 0x1d), (0x41, 0x6e, 0xa8), None),
    '-navy': ((0xff, 0xff, 0xff), (0x9a, 0xc0, 0xf4), None),
    '-fill': ((0x0d, 0x3b, 0x7a), (0x9a, 0xc0, 0xf4), (0xff, 0xff, 0xff)),
}
GROUPS = ['illustration/spot', 'illustration/scene', 'illustration/object', 'illustration/portrait',
          'illustration/bleed', 'illustration/avatar', 'icon/nav']

def paint(layer, rgb):
    out = Image.new('RGBA', layer.size, rgb + (0,))
    out.putalpha(layer.getchannel('A') if layer.mode == 'RGBA' else layer)
    return out

def inside(ink, acc, r=4):
    # Everything the outline closes in: close small gaps (grow by r), flood the outside, shrink back by r.
    lines = ImageChops.lighter(ink.getchannel('A'), acc.getchannel('A')).point(lambda v: 255 if v > 40 else 0)
    grown = lines.filter(ImageFilter.MaxFilter(2 * r + 1))
    pad = Image.new('L', (grown.width + 2, grown.height + 2), 0)
    pad.paste(grown, (1, 1))
    ImageDraw.floodfill(pad, (0, 0), 128)
    outside = pad.crop((1, 1, grown.width + 1, grown.height + 1)).point(lambda v: 255 if v == 128 else 0)
    return ImageChops.lighter(ImageChops.invert(outside).filter(ImageFilter.MinFilter(2 * r + 1)), lines)

index = {'drawings': {}}
for group in GROUPS:
    src = KIT / group
    if not src.is_dir():
        continue
    names = sorted({f.name[:-8] for f in src.glob('*-ink.png') if (src / f'{f.name[:-8]}-accent.png').exists()})
    short = group.split('/')[-1]
    dst = READY / short
    dst.mkdir(parents=True, exist_ok=True)
    for n in names:
        ink = Image.open(src / f'{n}-ink.png').convert('RGBA')
        acc = Image.open(src / f'{n}-accent.png').convert('RGBA')
        for suffix, (ink_rgb, acc_rgb, in_rgb) in SETS.items():
            img = Image.alpha_composite(paint(acc, acc_rgb), paint(ink, ink_rgb))
            if in_rgb:
                img = Image.alpha_composite(paint(inside(ink, acc), in_rgb), img)
            img.save(dst / f'{n}{suffix}.png', optimize=True)
    index['drawings'][short] = names
    print(f'{short}: {len(names)} drawings')

def files(sub, exts=('.png', '.svg', '.jpg')):
    d = KIT / sub
    return sorted(f.name for f in d.iterdir() if f.suffix in exts) if d.is_dir() else []

index['icons'] = [f[:-4] for f in files('brand-kit/icon')]
index['confetti'] = [f[:-4] for f in files('motif/confetti')]
index['stars'] = files('icon/star')
index['schools'] = files('icon/school')
index['mascots'] = files('icon/mascot')
(KIT / 'index.json').write_text(json.dumps(index, indent=1) + '\n')
print('index.json written')

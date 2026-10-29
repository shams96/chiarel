"""Composite a CHIAREL packshot onto a generated scene plate (dev tooling).
usage: python scripts/composite-plate.py plate.png cutout.png out.jpg '{"x":450,"y":790,"h":440,...}'
x,y = where the foot of the product touches the surface (plate pixels); h = product height in pixels.
Optional: refl (0-1), refl_blur, shadow [r,g,b], shadow_dir (px shift of the cast shadow, +right),
tint [r,g,b] and tint_amt (colour wash matching the scene light), rim [r,g,b], rim_amt, grain,
contact (0-1, dark line under the foot so it rests on the surface), erode (px, trims a cutout's edge halo),
solid_foot (true: cut the faint strip below the real foot), trim_bottom (cutout px, extra cut at the foot).
Keep refl at 0 on matte surfaces (cloth, stone, snow): a reflection there makes the product look like it floats.
"""
import sys, json, numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

plate_p, cut_p, out_p = sys.argv[1:4]
cfg = json.loads(sys.argv[4])
rng = np.random.default_rng(7)

bg = Image.open(plate_p).convert("RGB")
W, H = bg.size
scale_up = cfg.get("out_w", W) / W            # optional upscale of the whole plate before compositing
if scale_up != 1:
    bg = bg.resize((int(W * scale_up), int(H * scale_up)), Image.LANCZOS)
    W, H = bg.size
S = scale_up
x0, y0, ph = cfg["x"] * S, cfg["y"] * S, cfg["h"] * S

prod = Image.open(cut_p).convert("RGBA")
a_ = np.asarray(prod)[..., 3]
ys, xs = np.where(a_ > 70)
prod = prod.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
r = ph / prod.height
# A cutout often ends in a faint low-alpha shadow strip (or a white halo) below the real
# foot, which pushes the product up off the surface by that much. solid_foot cuts the
# strip below the last solid row; trim_bottom (cutout px) removes anything beyond that.
trim_src = cfg.get("trim_bottom", 0)
if cfg.get("solid_foot"):
    rows = (np.asarray(prod)[..., 3] >= 250).sum(1)
    last = np.where(rows > rows.max() * 0.2)[0].max()
    trim_src = max(trim_src, prod.height - 1 - last)
keep = prod.height - trim_src
prod = prod.crop((0, 0, prod.width, keep)).resize((int(prod.width * r), max(1, int(keep * r))), Image.LANCZOS)
erode =cfg.get("erode", 0)  # px; trims the light halo a packshot cutout leaves on its edge
if erode:
    from scipy.ndimage import minimum_filter
    pa = np.array(prod)
    pa[..., 3] = minimum_filter(pa[..., 3], size=int(erode) * 2 + 1)
    prod = Image.fromarray(pa)
pw, ph = prod.size
px, py = int(x0 - pw / 2), int(y0 - ph)

canvas = np.asarray(bg).astype(np.float32)
P = np.asarray(prod).astype(np.float32)
alpha = P[..., 3] / 255.0
rgb = P[..., :3]

# tint the product toward the scene light so it sits in the plate
tint = np.array(cfg.get("tint", [255, 240, 220]), np.float32)
ta = cfg.get("tint_amt", 0.06)
rgb = rgb * (1 - ta) + (rgb * tint / 255.0) * ta

def paste(layer_rgb, layer_a, x, y, out):
    h, w = layer_a.shape
    ya, yb = max(0, y), min(H, y + h); xa, xb = max(0, x), min(W, x + w)
    if ya >= yb or xa >= xb: return
    la = layer_a[ya - y:yb - y, xa - x:xb - x][..., None]
    lr = layer_rgb[ya - y:yb - y, xa - x:xb - x]
    out[ya:yb, xa:xb] = out[ya:yb, xa:xb] * (1 - la) + lr * la

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

# reflection on the surface under the product. Drawn BEFORE the shadows so it can
# never sit on top of the contact shadow: a bright mirrored band right under the
# foot makes the product look like it hovers. Only for genuinely glossy surfaces.
refl = cfg.get("refl", 0.0)
if refl > 0:
    rf = prod.transpose(Image.FLIP_TOP_BOTTOM)
    ra = np.asarray(rf)[..., 3].astype(np.float32) / 255.0
    rr = np.asarray(rf)[..., :3].astype(np.float32)
    fade = np.linspace(1, 0, ra.shape[0]) ** cfg.get("refl_fade", 1.8)
    ra = gaussian_filter(ra * fade[:, None] * refl, (cfg.get("refl_blur", 2.2) * S, 1.2 * S))
    rr = np.stack([gaussian_filter(rr[..., c], (2 * S, 1 * S)) for c in range(3)], -1)
    paste(rr, ra, px, int(y0) + 2, canvas)

# contact shadow + soft cast shadow
sh = np.zeros((H, W), np.float32)
ex, ey = pw * 0.55, max(6, ph * 0.03)
sh += np.exp(-((((xx - x0) / ex) ** 2 + ((yy - y0) / ey) ** 2)) * 1.1) * 0.85
dx = cfg.get("shadow_dir", 0.25) * pw
sh += np.exp(-((((xx - (x0 + dx)) / (pw * 1.0)) ** 2 + ((yy - (y0 + ey * 0.5)) / (ey * 2.6)) ** 2))) * 0.38
sh = gaussian_filter(sh, 6 * S)
sc = np.array(cfg.get("shadow", [20, 14, 10]), np.float32)
sa = np.clip(sh, 0, 0.9)[..., None] * cfg.get("shadow_amt", 0.9)
canvas = canvas * (1 - sa) + sc * sa

# tight, dark contact line hugging the foot (flat-ended, like a square base). This is
# what makes the product read as resting on the surface.
contact = cfg.get("contact", 0.0)
if contact > 0:
    ct = np.exp(-((np.abs(xx - x0) / (pw * 0.54)) ** 6 + ((yy - (y0 - 1)) / max(3.0, ph * 0.011)) ** 2))
    ct = gaussian_filter(ct.astype(np.float32), 1.4 * S)
    ca = np.clip(ct, 0, 1)[..., None] * contact
    canvas = canvas * (1 - ca) + sc * ca

# rim / bloom behind the glass (light wrapping)
bloom = np.exp(-(((xx - x0) / (pw * 1.1)) ** 2 + ((yy - (y0 - ph * 0.45)) / (ph * 0.6)) ** 2) * 1.5)
bloom = gaussian_filter(bloom.astype(np.float32), 25 * S)
rim = np.array(cfg.get("rim", [255, 236, 205]), np.float32)
canvas = canvas + (rim - canvas) * (bloom[..., None] * cfg.get("rim_amt", 0.10))

paste(rgb, alpha, px, py, canvas)

# unify: gentle grain
g = rng.normal(0, cfg.get("grain", 3.0), size=(H, W, 1)).astype(np.float32)
canvas = np.clip(canvas + g, 0, 255)
Image.fromarray(canvas.astype(np.uint8)).save(out_p, quality=93, subsampling=0)
print("ok", pw, ph)

#!/usr/bin/env python3
"""Generate Release 2.0 visual media assets into docs/design/assets/.

Usage: python3 gen_assets.py <source_profile_png_1024x1536> <repo_root>
Deterministic: no randomness without a fixed seed.
"""
import io, json, math, os, random, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops

SRC, ROOT = sys.argv[1], sys.argv[2]
OUT = os.path.join(ROOT, "docs/design/assets")
for d in ("profile", "social", "icons", "placeholders"):
    os.makedirs(os.path.join(OUT, d), exist_ok=True)

# ── Brand tokens (from src/App.jsx :root, night theme) ──
BG, BG2, SURF, SURF2 = "#060c18", "#090f1e", "#0d1626", "#111d30"
AMBER, CYAN, GREEN, ROSE, VIOLET = "#f59e0b", "#22d3ee", "#34d399", "#fb7185", "#a78bfa"
TEXT, TEXT2, MUTED = "#e2e8f0", "#94a3b8", "#475569"

def rgb(h, a=255):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)

F = "/usr/share/fonts/opentype/inter/"
def font(name, size):
    return ImageFont.truetype(F + name, size)
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
MONO_B = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"

def resize_rgba(im, size):
    """Premultiplied-alpha resize: avoids dark/light fringes on transparent edges."""
    return im.convert("RGBa").resize(size, Image.LANCZOS).convert("RGBA")

def text_tracked(draw, xy, s, fnt, fill, tracking=0.0):
    """Draw text with letter-spacing (tracking in px). Returns end x."""
    x, y = xy
    for ch in s:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += draw.textlength(ch, font=fnt) + tracking
    return x - tracking

def tracked_width(draw, s, fnt, tracking):
    return sum(draw.textlength(c, font=fnt) for c in s) + tracking * (len(s) - 1)

# ─────────────────────────────────────────────────────────────
# Shared cockpit background (rendered at scale k for supersampling)
# ─────────────────────────────────────────────────────────────
def cockpit_bg(w, h, k=2, glow_at=None, glow_color=AMBER, glow_r=0.45, seed=7, grid=40):
    W, H = w * k, h * k
    # vertical gradient BG -> SURF with slight diagonal
    base = Image.new("RGBA", (W, H), rgb(BG))
    grad = Image.linear_gradient("L").resize((W, H))  # top 0 -> bottom 255
    surf = Image.new("RGBA", (W, H), rgb(SURF))
    base = Image.composite(surf, base, grad.point(lambda v: int(v * 0.55)))
    # radial glow
    if glow_at:
        gx, gy = glow_at
        r = int(min(W, H) * glow_r)
        glow = Image.new("L", (W, H), 0)
        gd = ImageDraw.Draw(glow)
        gd.ellipse((gx * k - r, gy * k - r, gx * k + r, gy * k + r), fill=70)
        glow = glow.filter(ImageFilter.GaussianBlur(r * 0.45))
        base = Image.composite(Image.new("RGBA", (W, H), rgb(glow_color)), base, glow)
    over = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    # grid
    step = grid * k
    for x in range(0, W, step):
        d.line([(x, 0), (x, H)], fill=rgb(CYAN, 12), width=k)
    for y in range(0, H, step):
        d.line([(0, y), (W, y)], fill=rgb(CYAN, 12), width=k)
    # major grid every 4 cells, small crosshair marks at intersections
    for x in range(0, W, step * 4):
        for y in range(0, H, step * 4):
            d.line([(x - 5 * k, y), (x + 5 * k, y)], fill=rgb(CYAN, 45), width=k)
            d.line([(x, y - 5 * k), (x, y + 5 * k)], fill=rgb(CYAN, 45), width=k)
    base.alpha_composite(over)
    return base

def telemetry_trace(d, x0, x1, ybase, amp, k, color, alpha, seed=3, width=1.5):
    rnd = random.Random(seed)
    pts = []
    phase = rnd.random() * 6
    for i in range(0, int((x1 - x0)) + 1, 4):
        x = x0 + i
        y = ybase + amp * (0.55 * math.sin(i / 37 + phase) + 0.3 * math.sin(i / 11.0) + 0.15 * math.sin(i / 5.3 + 1))
        pts.append((x * k, y * k))
    d.line(pts, fill=rgb(color, alpha), width=max(1, int(width * k)), joint="curve")

def tick_scale(d, x0, x1, y, k, color, alpha, every=10, major=5, h=6):
    i = 0
    for x in range(int(x0), int(x1) + 1, every):
        hh = h * 1.8 if i % major == 0 else h
        d.line([(x * k, y * k), (x * k, (y - hh) * k)], fill=rgb(color, alpha if i % major == 0 else int(alpha * 0.6)), width=k)
        i += 1

def corner_brackets(d, box, k, color, alpha=255, L=18, w=2):
    x0, y0, x1, y1 = [v * k for v in box]
    L, w = L * k, w * k
    c = rgb(color, alpha)
    for (cx, cy, sx, sy) in ((x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)):
        d.line([(cx, cy), (cx + sx * L, cy)], fill=c, width=w)
        d.line([(cx, cy), (cx, cy + sy * L)], fill=c, width=w)

def gauge_arc(d, cx, cy, r, k, start, end, color, alpha, ticks=24, w=2):
    box = ((cx - r) * k, (cy - r) * k, (cx + r) * k, (cy + r) * k)
    d.arc(box, start, end, fill=rgb(color, alpha), width=w * k)
    for i in range(ticks + 1 if ticks else 0):
        a = math.radians(start + (end - start) * i / ticks)
        r1, r2 = r - 4, r - (14 if i % 4 == 0 else 8)
        d.line([((cx + r1 * math.cos(a)) * k, (cy + r1 * math.sin(a)) * k),
                ((cx + r2 * math.cos(a)) * k, (cy + r2 * math.sin(a)) * k)],
               fill=rgb(color, alpha if i % 4 == 0 else int(alpha * 0.6)), width=k)

results = []
def record(path, note=""):
    results.append((os.path.relpath(path, ROOT), note))

# ─────────────────────────────────────────────────────────────
# 1. Responsive profile set
# ─────────────────────────────────────────────────────────────
src = Image.open(SRC).convert("RGBA")
assert src.size == (1024, 1536), src.size
for w in (300, 450, 600, 900):
    h = w * 3 // 2
    im = resize_rgba(src, (w, h))
    p = os.path.join(OUT, "profile", f"profile-{w}.webp")
    im.save(p, "WEBP", quality=80, method=6, alpha_quality=90, exact=False)
    record(p)
    p = os.path.join(OUT, "profile", f"profile-{w}.avif")
    im.save(p, "AVIF", quality=60, speed=4, subsampling="4:2:0")
    record(p)
# Opaque JPEG fallback (flattened on --bg) for <img src> in non-WebP agents / email / previews
flat = Image.new("RGBA", (600, 900), rgb(BG))
flat.alpha_composite(resize_rgba(src, (600, 900)))
p = os.path.join(OUT, "profile", "profile-600-flat.jpg")
flat.convert("RGB").save(p, "JPEG", quality=82, optimize=True, progressive=True)
record(p)

# ─────────────────────────────────────────────────────────────
# 2. Open Graph card 1200x630
# ─────────────────────────────────────────────────────────────
OG_KICKER = "HMI ENGINEERING PORTFOLIO"

def og_card():
    w, h, k = 1200, 630, 2
    W, H = w * k, h * k
    img = cockpit_bg(w, h, k, glow_at=(935, 300), glow_color=AMBER, glow_r=0.36)
    d = ImageDraw.Draw(img, "RGBA")
    # cyan cool glow lower-left for depth
    cool = Image.new("L", (W, H), 0)
    ImageDraw.Draw(cool).ellipse((-300 * k, 380 * k, 500 * k, 1000 * k), fill=40)
    cool = cool.filter(ImageFilter.GaussianBlur(160 * k))
    img = Image.composite(Image.new("RGBA", (W, H), rgb(CYAN)), img, cool).convert("RGB")
    d = ImageDraw.Draw(img, "RGBA")  # RGB target + RGBA draw mode => alpha-blended strokes

    # gauge arc behind portrait (instrument-cluster cue)
    gauge_arc(d, 935, 330, 262, k, 150, 390, AMBER, 130, ticks=32)
    gauge_arc(d, 935, 330, 222, k, 150, 390, CYAN, 70, ticks=0, w=1)

    # portrait: rim-light glow from alpha, then portrait
    ph = 600
    pw = ph * 2 // 3
    por = resize_rgba(src, (pw * k, ph * k))
    # gentle grade: lift shadows toward cool navy, protect skin (low strength)
    r_, g_, b_, a_ = por.split()
    graded = Image.merge("RGB", (r_, g_, b_))
    shadow_tint = Image.new("RGB", graded.size, (20, 34, 58))
    lum = graded.convert("L").point(lambda v: int(max(0, 90 - v) * 0.9))  # mask only deep shadows
    graded = Image.composite(shadow_tint, graded, lum.point(lambda v: min(v, 60)))
    por = Image.merge("RGBA", (*graded.split(), a_))
    px, py = 935 - pw // 2, h - ph + 10
    rim = Image.new("RGBA", por.size, rgb(AMBER))
    # rim light only around head/shoulders: fade rim out toward the lower body
    rim_a = a_.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(14 * k)).point(lambda v: int(v * 0.45))
    vfade = Image.linear_gradient("L").resize(por.size).point(lambda v: max(0, 255 - int(v * 2.2)))
    rim.putalpha(ImageChops.multiply(rim_a, vfade))
    img = img.convert("RGBA")
    img.alpha_composite(rim, (px * k, py * k))
    # fade the bottom of the portrait into the background so the crop reads as intentional
    fade = Image.linear_gradient("L").resize(por.size).point(lambda v: 255 if v < 170 else int(255 - (v - 170) * 255 / 85 * 0.92))
    # soften the hard vertical crop edges of the source (shoulders are cut by the original framing)
    hgrad = Image.linear_gradient("L").rotate(90, expand=True).resize(por.size)  # left->right ramp
    side = ImageChops.darker(hgrad.point(lambda v: min(255, v * 6)), hgrad.point(lambda v: min(255, (255 - v) * 6)))
    por.putalpha(ImageChops.multiply(ImageChops.multiply(a_, fade), side))
    img.alpha_composite(por, (px * k, py * k))
    img = img.convert("RGB")
    d = ImageDraw.Draw(img, "RGBA")

    # left panel content
    x = 72
    # top status line
    f_mono_s = ImageFont.truetype(MONO, 15 * k)
    # Timeless kicker on purpose: link unfurlers cache OG images for weeks, so no availability status here.
    d.ellipse(((x) * k, 79 * k, (x + 9) * k, 88 * k), fill=rgb(CYAN))
    text_tracked(d, ((x + 20) * k, 74 * k), OG_KICKER, f_mono_s, rgb(CYAN, 230), tracking=2.5 * k)
    tick_scale(d, x, 560, 116, k, CYAN, 70, every=8, major=5, h=5)

    f_name = font("InterDisplay-Bold.otf", 68 * k)
    d.text((x * k, 150 * k), "S. Jeevanandham", font=f_name, fill=rgb(TEXT))
    f_title = ImageFont.truetype(MONO_B, 24 * k)
    text_tracked(d, (x * k, 246 * k), "SENIOR HMI ENGINEER", f_title, rgb(AMBER), tracking=4 * k)
    d.rectangle((x * k, 290 * k, (x + 64) * k, 293 * k), fill=rgb(AMBER))
    d.rectangle(((x + 70) * k, 290 * k, (x + 84) * k, 293 * k), fill=rgb(CYAN))

    f_tag = font("Inter-Regular.otf", 27 * k)
    d.text((x * k, 318 * k), "Qt/QML · Embedded C++ ·", font=f_tag, fill=rgb(TEXT2))
    d.text((x * k, 356 * k), "Automotive & Medical HMI", font=f_tag, fill=rgb(TEXT2))

    # telemetry trace under copy
    telemetry_trace(d, x, 560, 458, 14, k, CYAN, 170, seed=11, width=1.6)
    telemetry_trace(d, x, 560, 470, 8, k, AMBER, 120, seed=5, width=1.2)
    tick_scale(d, x, 560, 505, k, CYAN, 55, every=8, major=5, h=4)

    # URL chip
    f_url = ImageFont.truetype(MONO, 20 * k)
    url = "jeevanandhamsivasankar.github.io"
    uw = d.textlength(url, font=f_url) / k
    d.rounded_rectangle((x * k, 540 * k, (x + uw + 40) * k, 580 * k), radius=6 * k,
                        fill=rgb(SURF2, 220), outline=rgb(CYAN, 90), width=k)
    d.text(((x + 20) * k, 549 * k), url, font=f_url, fill=rgb(CYAN))

    # frame corners
    corner_brackets(d, (20, 20, w - 20, h - 20), k, AMBER, 200, L=26, w=2)
    out = img.resize((w, h), Image.LANCZOS).convert("RGB")
    return out

og = og_card()
p_png = os.path.join(OUT, "social", "og-card.png")
# Lossless truecolor first; if over budget, drop to 7 then 6 bits/channel (never a 256-colour
# palette: it posterises skin tones). Grid/gradient content compresses well at 7 bits.
from PIL import ImageOps
for bits in (8, 7, 6):
    cand = og if bits == 8 else ImageOps.posterize(og, bits)
    cand.save(p_png, "PNG", optimize=True)
    if os.path.getsize(p_png) <= 300_000:
        print(f"og-card.png: {bits} bits/channel", file=sys.stderr)
        break
if os.path.getsize(p_png) > 300_000:
    raise SystemExit(f"og-card.png too large: {os.path.getsize(p_png)}")
record(p_png)
p_jpg = os.path.join(OUT, "social", "og-card.jpg")
og.save(p_jpg, "JPEG", quality=86, optimize=True, progressive=True, subsampling=0)
record(p_jpg)

# ─────────────────────────────────────────────────────────────
# 3. Favicon set — pixel-grid "SJ" monogram (7-segment / cluster readout style)
#    Designed on a 16x16 grid; 1 grid px = 4 viewBox units (viewBox 64).
# ─────────────────────────────────────────────────────────────
# Monogram cells (x, y, w, h) in 16-grid px.
S_RECTS = [(3, 4, 5, 2), (3, 6, 2, 1), (3, 7, 5, 2), (6, 9, 2, 1), (3, 10, 5, 2)]
J_RECTS = [(11, 4, 2, 8), (9, 10, 2, 2), (9, 9, 2, 1)]
MONO_RECTS = S_RECTS + J_RECTS

def rects_to_path(rects, u=4):
    return " ".join(f"M{x*u} {y*u}h{w*u}v{h*u}h-{w*u}z" for x, y, w, h in rects)

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <title>SJ</title>
  <!-- Pixel-grid monogram: every edge sits on a 4-unit (=1px at 16x16) boundary, no font dependency. -->
  <rect width="64" height="64" rx="12" fill="{BG}"/>
  <rect x="2" y="2" width="60" height="60" rx="10" fill="none" stroke="{AMBER}" stroke-width="4" stroke-opacity=".9"/>
  <path fill="{AMBER}" d="{rects_to_path(MONO_RECTS)}"/>
</svg>
'''
p = os.path.join(OUT, "icons", "favicon.svg")
open(p, "w").write(svg)
record(p, "vector")

def draw_icon(size, *, maskable=False, rounded=True, border=True, detail=True):
    k = 4
    S = size * k
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im, "RGBA")
    full_bleed = maskable or not rounded
    if full_bleed:
        d.rectangle((0, 0, S, S), fill=rgb(BG))
    else:
        d.rounded_rectangle((0, 0, S - 1, S - 1), radius=int(S * 12 / 64), fill=rgb(BG))
    # content box: maskable safe zone = central 80% circle -> use 62% box
    box = 0.62 if maskable else 1.0
    off = S * (1 - box) / 2
    u = S * box / 16  # one grid px
    if detail and size >= 120:
        # faint cockpit grid + gauge arc (only where there is room)
        g = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        gd = ImageDraw.Draw(g)
        step = S / 12
        for i in range(1, 12):
            gd.line([(i * step, 0), (i * step, S)], fill=rgb(CYAN, 14), width=k)
            gd.line([(0, i * step), (S, i * step)], fill=rgb(CYAN, 14), width=k)
        cx = cy = S / 2
        r = S * (0.40 if maskable else 0.43)
        gd.arc((cx - r, cy - r, cx + r, cy + r), 135, 405, fill=rgb(AMBER, 60), width=max(k, int(S / 180)))
        for i in range(0, 25):
            a = math.radians(135 + 270 * i / 24)
            r1, r2 = r - S * 0.012, r - S * (0.05 if i % 4 == 0 else 0.03)
            gd.line([(cx + r1 * math.cos(a), cy + r1 * math.sin(a)), (cx + r2 * math.cos(a), cy + r2 * math.sin(a))],
                    fill=rgb(AMBER, 90 if i % 4 == 0 else 50), width=max(k, int(S / 256)))
        if not full_bleed:
            m = Image.new("L", (S, S), 0)
            ImageDraw.Draw(m).rounded_rectangle((0, 0, S - 1, S - 1), radius=int(S * 12 / 64), fill=255)
            g.putalpha(ImageChops.multiply(g.getchannel("A"), m))
        im.alpha_composite(g)
        d = ImageDraw.Draw(im, "RGBA")
    if border and not maskable:
        if size < 64:
            # small sizes: border is exactly the outermost device pixel ring (outline draws inward)
            d.rounded_rectangle((0, 0, S - 1, S - 1), radius=int(S * 12 / 64), outline=rgb(AMBER), width=S // 16)
        else:
            bw = S / 32  # 2 units of 64
            inset = bw * 1.5
            d.rounded_rectangle((inset, inset, S - 1 - inset, S - 1 - inset), radius=int(S * 10 / 64),
                                outline=rgb(AMBER), width=int(max(k, bw)))
    # glow behind monogram for large sizes
    if size >= 120:
        gl = Image.new("L", (S, S), 0)
        gld = ImageDraw.Draw(gl)
        for x, y, w, h in MONO_RECTS:
            gld.rectangle((off + x * u, off + y * u, off + (x + w) * u, off + (y + h) * u), fill=120)
        gl = gl.filter(ImageFilter.GaussianBlur(S / 40))
        glow = Image.new("RGBA", (S, S), rgb(AMBER))
        glow.putalpha(gl)
        im.alpha_composite(glow)
        d = ImageDraw.Draw(im, "RGBA")
    for x, y, w, h in MONO_RECTS:
        d.rectangle((round(off + x * u), round(off + y * u), round(off + (x + w) * u) - 1, round(off + (y + h) * u) - 1), fill=rgb(AMBER))
    # BOX (area-average) downsampling keeps grid-aligned edges crisp; LANCZOS would ring at 16/32 px
    out = im.resize((size, size), Image.BOX if size <= 64 else Image.LANCZOS)
    if full_bleed:
        out = out.convert("RGB")
    return out

icons = {
    "apple-touch-icon.png": dict(size=180, rounded=False),            # iOS masks corners itself; must be opaque
    "icon-192.png": dict(size=192),
    "icon-512.png": dict(size=512),
    "icon-maskable-512.png": dict(size=512, maskable=True),
    "favicon-32.png": dict(size=32, detail=False),
    "favicon-16.png": dict(size=16, detail=False),
}
for name, kw in icons.items():
    p = os.path.join(OUT, "icons", name)
    draw_icon(**kw).save(p, "PNG", optimize=True)
    record(p)
# Multi-resolution ICO (16/32/48) for legacy agents requesting /favicon.ico
p = os.path.join(OUT, "icons", "favicon.ico")
draw_icon(48, detail=False).save(p, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)],
                                 append_images=[draw_icon(16, detail=False), draw_icon(32, detail=False)])
record(p)

manifest = {
    "name": "S. Jeevanandham · Senior HMI Engineer",
    "short_name": "Jeevanandham",
    "description": "Portfolio of S. Jeevanandham — Senior HMI Engineer (Qt/QML, Embedded C++, automotive and medical device HMI).",
    "start_url": "/",
    "scope": "/",
    "display": "browser",
    "background_color": BG,
    "theme_color": BG,
    "icons": [
        {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
        {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
        {"src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
    ],
}
p = os.path.join(OUT, "icons", "site.webmanifest")
open(p, "w").write(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
record(p, "json")

# ─────────────────────────────────────────────────────────────
# 4. Media placeholders 1280x720 (16:9)
# ─────────────────────────────────────────────────────────────
def placeholder(kind):
    w, h, k = 1280, 720, 2
    accent = CYAN if kind == "video" else VIOLET
    img = cockpit_bg(w, h, k, glow_at=(640, 330), glow_color=accent, glow_r=0.40, grid=40)
    # diagonal hatch band at low alpha signals "not real content"
    hatch = Image.new("RGBA", img.size, (0, 0, 0, 0))
    hd = ImageDraw.Draw(hatch)
    for i in range(-h, w, 28):
        hd.line([(i * k, h * k), ((i + h) * k, 0)], fill=rgb(TEXT2, 8), width=k)
    img.alpha_composite(hatch)
    img = img.convert("RGB")
    d = ImageDraw.Draw(img, "RGBA")
    cx, cy = 640, 320
    if kind == "video":
        gauge_arc(d, cx, cy, 120, k, 135, 405, accent, 150, ticks=24)
        d.ellipse(((cx - 64) * k, (cy - 64) * k, (cx + 64) * k, (cy + 64) * k), fill=rgb(SURF2, 230), outline=rgb(accent, 200), width=2 * k)
        tri = [((cx - 20) * k, (cy - 32) * k), ((cx - 20) * k, (cy + 32) * k), ((cx + 34) * k, cy * k)]
        d.polygon(tri, fill=rgb(AMBER))
        # scrubber bar
        d.rounded_rectangle((120 * k, 600 * k, 1160 * k, 606 * k), radius=3 * k, fill=rgb(TEXT2, 40))
        d.rounded_rectangle((120 * k, 600 * k, 420 * k, 606 * k), radius=3 * k, fill=rgb(AMBER, 160))
        d.ellipse((414 * k, 597 * k, 426 * k, 609 * k), fill=rgb(AMBER))
        f = ImageFont.truetype(MONO, 15 * k)
        d.text((120 * k, 618 * k), "00:00 / 00:00", font=f, fill=rgb(TEXT2, 160))
        d.text((1160 * k, 618 * k), "CC", font=f, fill=rgb(TEXT2, 160), anchor="ra")
        title, sub = "HMI DEMO VIDEO", "16:9 · MP4 H.264 + WebM VP9 · poster + captions required"
    else:
        # generic "image frame" glyph: framed viewport with horizon + sun (no fake UI)
        fx0, fy0, fx1, fy1 = cx - 150, cy - 95, cx + 150, cy + 95
        d.rounded_rectangle((fx0 * k, fy0 * k, fx1 * k, fy1 * k), radius=10 * k, fill=rgb(SURF2, 210), outline=rgb(accent, 190), width=2 * k)
        d.polygon([((fx0 + 20) * k, (fy1 - 20) * k), ((cx - 40) * k, (cy - 10) * k), ((cx + 20) * k, (fy1 - 20) * k)], fill=rgb(accent, 90))
        d.polygon([((cx - 10) * k, (fy1 - 20) * k), ((cx + 60) * k, (cy + 10) * k), ((fx1 - 20) * k, (fy1 - 20) * k)], fill=rgb(accent, 140))
        d.ellipse(((cx + 70) * k, (fy0 + 25) * k, (cx + 110) * k, (fy0 + 65) * k), fill=rgb(AMBER, 220))
        corner_brackets(d, (fx0 - 18, fy0 - 18, fx1 + 18, fy1 + 18), k, accent, 200, L=22, w=2)
        title, sub = "PROJECT SCREENSHOT", "16:9 · AVIF + WebP + JPEG · 640/960/1280/1920 w · alt text required"
    # labels
    f_lbl = ImageFont.truetype(MONO_B, 18 * k)
    lab = "PLACEHOLDER — OWNER MEDIA"
    tw = tracked_width(d, lab, f_lbl, 4 * k) / k
    d.rounded_rectangle(((cx - tw / 2 - 18) * k, 40 * k, (cx + tw / 2 + 18) * k, 80 * k), radius=4 * k,
                        fill=rgb(AMBER, 36), outline=rgb(AMBER, 200), width=k)
    text_tracked(d, ((cx - tw / 2) * k, 49 * k), lab, f_lbl, rgb(AMBER), tracking=4 * k)
    f_t = font("InterDisplay-SemiBold.otf", 40 * k)
    tw = tracked_width(d, title, f_t, 6 * k) / k
    text_tracked(d, ((cx - tw / 2) * k, (cy + 150) * k), title, f_t, rgb(TEXT), tracking=6 * k)
    f_s = ImageFont.truetype(MONO, 16 * k)
    d.text((cx * k, (cy + 210) * k), sub, font=f_s, fill=rgb(TEXT2), anchor="ma")
    corner_brackets(d, (24, 24, w - 24, h - 24), k, AMBER, 170, L=28, w=2)
    return img.resize((w, h), Image.LANCZOS).convert("RGB")

for kind, name in (("video", "placeholder-hmi-demo-video.webp"), ("shot", "placeholder-project-screenshot.webp")):
    im = placeholder(kind)
    p = os.path.join(OUT, "placeholders", name)
    im.save(p, "WEBP", quality=82, method=6)
    record(p)

print(json.dumps(results))

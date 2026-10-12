# Visual & Media Specification — Release 2.0 (design upgrade)

**Product:** Portfolio of S. Jeevanandham, Senior HMI Engineer — https://jeevanandhamsivasankar.github.io
**Document ID:** VMS-PORTFOLIO-001 | **Version:** 0.1 (draft for Product Owner review) | **Date:** 2026-10-11
**Author role:** Visual & Media Designer (graphics, photography treatment, imagery, video)
**Inputs:** `docs/ARCHITECTURE_BRIEF.md`, `docs/SRS.md` v1.1, `index.html`, baseline `src/App.jsx`, `public/*`, `docs/design/tokens-v2.css` (UX proposal)
**Siblings (written in parallel, not duplicated here):** `docs/design/UX_DESIGN_SPEC.md` (layout, components, tokens), `docs/design/MOTION_SPEC.md` (all durations, easings, choreography).

> **Scope.** Release 1.0 is a pixel-parity re-architecture; nothing in this document applies to it. Everything here is a **Release 2.0 candidate**. Generated files live in `docs/design/assets/` and are moved into `public/` by engineering only after Product Owner approval (section 9 gives the mapping).
>
> **Out of scope here:** page layout, grid, spacing, component structure (UX spec) and any timing or easing (Motion spec). Where imagery depends on a rendered size (for example `sizes`), this spec uses today's CSS values and says the UX spec governs if they change.

---

## 1 Imagery audit (baseline as of Release 1.0)

Findings are numbered `VM-AUD-NN`. Severity: **H** = visible defect or wasted bytes for most visitors, **M** = quality or brand inconsistency, **L** = polish.

### 1.1 Profile photo (`public/profile.webp`, hero card)

| ID | Sev | Finding | Recommendation |
|---|---|---|---|
| VM-AUD-01 | H | One 600x900 WebP (96,100 B) is served to every device. The frame renders it at **220x265 CSS px** (`object-fit: cover; object-position: center top`), so a DPR-1 desktop downloads about 2.7x the pixels it needs. | Responsive `srcset` 300/450/600/900 in AVIF and WebP (section 3). Generated in `assets/profile/`. |
| VM-AUD-02 | H | `.hero-right` is `display:none` at ≤ 900 px, but `index.html` still preloads `/profile.webp` unconditionally and the `<img>` is eager. **Phones download 96 KB for an image they never show.** | Gate the preload with `media="(min-width: 901px)"` and give `sizes` a mobile value that selects the smallest candidate (section 3.4). If the UX spec brings the photo back on mobile in R2, recompute `sizes` from its rendered size. |
| VM-AUD-03 | M | No AVIF. AVIF at matched visual quality is 3.1x to 3.9x smaller than WebP for this portrait (table in 7.1). | Ship AVIF first, WebP second, inside `<picture>`. |
| VM-AUD-04 | M | The source is a cut-out with a transparent background, but `.profile-photo-frame::after` paints `var(--bg)` behind it, so the transparency only matters at the anti-aliased edge. The 2:3 file is cropped to roughly 5:6 by `object-fit`, which throws away the bottom 20 % of every download. | Keep transparency (it lets the R2 glow treatment in 2.4 sit behind the subject). Optional: a 5:6 cropped variant saves about 20 % per candidate; not generated until the UX spec fixes the frame ratio. |
| VM-AUD-05 | M | The highest-luminance area of the photo is the beige shirt, not the face; the eye lands on the chest. CSS adds `brightness(1.05) contrast(1.03) saturate(1.05)`, which lifts the shirt further. | Treatment in 2.3: protect highlights, slight vignette from the frame, rim light on head and shoulders. Remove the CSS brightness lift in R2 (bake any grade into the file instead). |
| VM-AUD-06 | L | `alt="S. Jeevanandham"` is correct (the photo is informative). No `fetchpriority`; no `loading`. The card fades in from `opacity:0`, so the photo is usually **not** the LCP element on desktop (the `h1` is). | Do not force `fetchpriority="high"` unless Lighthouse names the photo as LCP (NFR-MEDIA-004). |

### 1.2 Open Graph / social image (`public/profile-og.jpg`)

| ID | Sev | Finding | Recommendation |
|---|---|---|---|
| VM-AUD-07 | H | The OG image is the bare **600x900 portrait** (2:3). LinkedIn, Slack, X and Facebook render link cards at about 1.91:1, so they centre-crop it to a strip through the face or letterbox it as a small thumbnail. No name, role or brand is visible in the unfurl. | Purpose-built 1200x630 card (`assets/social/og-card.jpg`, 118 KB) with name, role, tagline, URL and the cockpit motif. |
| VM-AUD-08 | M | `twitter:card` is `summary` (small square thumbnail). There are no `og:image:width/height/alt`, no `og:image:type`, no `twitter:image`. | `summary_large_image` plus the full tag set in 6.2. |
| VM-AUD-09 | L | Any "availability" message baked into an OG image goes stale: unfurlers cache images for weeks. | The generated card deliberately uses a timeless kicker ("HMI ENGINEERING PORTFOLIO"), not "Open to opportunities". |

### 1.3 Favicon and app icons (`public/favicon.svg`)

| ID | Sev | Finding | Recommendation |
|---|---|---|---|
| VM-AUD-10 | H | The SVG draws "SJ" with `<text font-family="Barlow Condensed, Arial Narrow, sans-serif">`. A favicon cannot load web fonts, so every browser falls back to a local font: the monogram looks different on each OS, and on systems without Arial Narrow it is too wide for the frame. | Monogram drawn as **paths** (no font dependency) on a 16-px pixel grid. Generated: `assets/icons/favicon.svg` (525 B). |
| VM-AUD-11 | M | The 2.5-unit border in a 64-unit viewBox is 0.625 device px at 16x16, so it renders as a blurred half-tone ring; the letters (font-size 30) are under 8 px tall with sub-pixel stems. | All edges on 4-unit boundaries (= 1 device px at 16x16); border exactly one px ring. |
| VM-AUD-12 | M | No `apple-touch-icon` (iOS home-screen shows a page screenshot), no PNG or ICO fallback for agents that ignore SVG icons, no web app manifest. | Full set generated in `assets/icons/` (section 5.4). |

### 1.4 Design-card artwork (`DESIGN_CARDS[].art`, inline SVG, section "05 — Design Portfolio")

| ID | Sev | Finding | Recommendation |
|---|---|---|---|
| VM-AUD-13 | **H** | The **Medical Device HMI** artwork shows a realistic patient record: "Name: Rajesh Kumar, Age: 45, Session #12". In a medical-device context this reads as patient data (PHI), even if invented, and a medical-device hiring manager will notice. | Replace with clearly synthetic labels ("PATIENT ID 0000", "AGE —", "SESSION —") or remove the patient block. Never show a realistic personal name in medical artwork. |
| VM-AUD-14 | M | The artwork is illustrative wireframe, not the owner's real work, yet each card links to Behance with "View on Behance". The site has no real design thumbnails. | R2 option: owner supplies real Behance cover crops (own work, cleared for publication, OEM branding redacted). The SVG art stays as the fallback and for cards without media. See 2.6 for rights rules. |
| VM-AUD-15 | M | Text inside the art uses generic `monospace` at 8 to 10 px with 30 to 50 % alpha; it is illegible at card size and adds noise for screen readers if exposed. The infotainment card declares Material icon names (`call`, `music_note`, ...) in its data but never draws them, leaving five empty circles. | Mark every art SVG `aria-hidden="true" focusable="false"`; draw real glyphs or drop the unused field; keep in-art text to signal labels ≥ 10 px rendered. |
| VM-AUD-16 | L | Palette, stroke weights and the dark `#060c18` plate are consistent with the brand and with the cockpit art direction below. Good basis to keep. | Keep; align stroke widths to the icon grid (5.1). |

### 1.5 Icon consistency (skills chips, nav, buttons)

| ID | Sev | Finding | Recommendation |
|---|---|---|---|
| VM-AUD-17 | M | Three visual languages sit side by side in the same chip row: **Material Symbols** (outlined font, wght 200 to 300), **Simple Icons** brand marks (solid fills, each brand's own colour, loaded from `cdn.simpleicons.org`), and **30 custom SVGs** (24-grid, 1.5 stroke, round caps). Solid brand logos next to hairline outlines look heavier and pull focus. | Monochrome brand marks tinted to the category signal colour, at about 80 % optical size so their mass matches the 1.5-px outlines (section 5). |
| VM-AUD-18 | M | Some brand colours are near-invisible on the night background (Lua `#000080`, Jira `#0052CC`); the CSS compensates with a global `brightness(1.5)` filter that also over-brightens light logos. | Monochrome tint removes the need for the filter. |
| VM-AUD-19 | M | Runtime dependency on a third-party CDN for 19 skill icons (one request each, no cache control of ours, fallback to the `code` glyph on failure). | Self-host the 19 SVGs as a sprite or inline set (Simple Icons is CC0); removes `cdn.simpleicons.org` from the origin allowlist (NFR-SEC-002). |
| VM-AUD-20 | M | The Google Fonts request loads the **entire** Material Symbols variable font over four axes. Only about 60 distinct icons are used. | Request only the axis values used and add `&icon_names=` (Google Fonts subsetting), or replace with an inline SVG sprite. Exact byte saving to be measured by engineering (no network in this audit). |
| VM-AUD-21 | L | `alt` for brand icons is the raw slug ("adobexd", "stmicroelectronics"). The visible chip label already names the skill, so the icon is decorative in context. | `alt=""` (decorative) for chip icons, since the label is adjacent text. |

---

## 2 Art direction — "Automotive HMI cockpit"

### 2.1 Idea

The site should feel like **the owner's own instrument cluster at night**: a dark, calm display where information appears as instrumentation (gauges, scales, telemetry traces, readouts), not as decoration. Every visual motif should be something an HMI engineer would recognise from a real cluster or a medical control screen. Restraint is the signal of seniority: one accent, thin lines, generous dark space.

### 2.2 Colour roles in imagery

Colours come from the existing tokens (v1 names, with the `tokens-v2.css` names in brackets). Roles follow automotive telltale conventions (ISO 2575 intent: red = warning, amber = caution or attention, green = active or OK, cyan or blue = information).

| Role | Token | Hex (night) | Use in imagery | Do not |
|---|---|---|---|---|
| Plate / void | `--bg` (`--color-bg`) | `#060c18` | Base of every generated image | Pure black `#000` |
| Raised plate | `--surf`, `--surf2` | `#0d1626`, `#111d30` | Panels, chips, play-button disc | |
| Primary accent | `--amber` (`--sig-amber`) | `#f59e0b` | Needle, brand monogram, corner brackets, rim light, one key label | More than about 10 % of image area |
| Information | `--cyan` (`--sig-cyan`) | `#22d3ee` | Grid lines, telemetry traces, URL, scales | Large fills |
| Status OK | `--green` (`--sig-green`) | `#34d399` | Live/OK dots only | Decoration |
| Alert | `--rose` (`--sig-rose`) | `#fb7185` | STOP / fault states in HMI art only | Brand decoration |
| Creative | `--violet` (`--sig-violet`) | `#a78bfa` | Design-work category, screenshot placeholder | |
| Text | `--text`, `--text2` | `#e2e8f0`, `#94a3b8` | Names, captions | Amber body text |

Day theme: generated images with a baked dark plate (OG card, placeholders, poster frames) are shown as "screens" and are **not** recoloured for day. Transparent assets (profile photo, icons on chips) must read on both `#060c18` and `#fef9f0`.

### 2.3 Photography treatment (portrait of the owner)

Applies to the real photo only. **Never** generate, synthesise, AI-extend or retouch facial features of the person.

1. **Colour grade (baked, subtle):** keep skin tones natural. Lift only the deepest shadows (luma < 35 %) toward navy `#14223A` at ≤ 25 % strength. No global saturation or brightness lift (remove the CSS `filter` in R2). Highlights must not clip on the shirt.
2. **Rim light:** amber `#f59e0b` glow derived from the alpha mask (dilate 9 px, Gaussian blur ≈ 2.3 % of image height), ≤ 45 % opacity, **fading out from head to mid-chest**. Behind the subject only, never over the face.
3. **Edge integration:** where the source crop cuts the shoulders, fade the alpha over 4 % of the width at each side and over the bottom 30 % of the height so the cut reads as intentional.
4. **Duotone:** *not* allowed on the portrait. Allowed for secondary imagery (project screenshots shown as card backgrounds at rest): map luminance to `#060c18` → `#22d3ee` (or the card's signal colour) and show the full-colour image in the active state. The state change is a UX/Motion concern; this spec only defines the two treatments.
5. **Resampling:** premultiplied-alpha resize (Pillow `RGBa`) to avoid dark fringes on transparent edges; Lanczos; no sharpening beyond the encoder.

### 2.4 Brand motifs (for generated graphics, posters, placeholders)

All motifs are parametric and reproducible (`assets/gen_assets.py`).

| Motif | Specification |
|---|---|
| **Plate gradient** | Vertical `#060c18` → 55 % mix toward `#0d1626` at the bottom. |
| **Radial glow** | One soft glow per image, behind the hero object, in the image's accent colour, peak alpha ≈ 27 %, radius 36 to 45 % of the short side. A second, cooler cyan glow at ≤ 16 % alpha may sit in an opposite corner for depth. |
| **Grid** | 40-px cells (at 1x), 1-px cyan lines at ≈ 5 % alpha; small crosshair marks (10 px) every 4 cells at ≈ 18 % alpha. |
| **Tick scale** | Ticks every 8 to 10 px, major tick every 5th (1.8x length), cyan 20 to 30 % alpha. Used as a rule under kickers and above footers. |
| **Telemetry trace** | Sum of three sines (periods ≈ 37, 11, 5 px), seeded, 1.2 to 1.6 px, cyan ≈ 65 % alpha with a fainter amber companion trace. Abstract signal only: no fake axis values or units. |
| **Gauge arc** | 240° to 270° sweep, 2-px arc, ticks at 1/24 or 1/32 steps with a major every 4th, amber ≈ 50 % alpha; optional inner cyan arc at ≈ 27 %. |
| **Corner brackets** | 2-px amber L-shapes, 18 to 28 px arms, inset 20 to 24 px from the image edge. Mirrors the hero photo frame. |
| **Monogram** | Pixel-grid "SJ" (section 5.4), readout-style, amber on plate. |

**Typography inside images:** the site uses Barlow Condensed (display), Barlow (body), Share Tech Mono (labels). The generation environment had none of them installed, so the R2 drafts use **Inter Display Bold / Inter Regular** and **DejaVu Sans Mono** as metric-close stand-ins. Before release, re-run the generator with the brand fonts (all three are SIL OFL; point `F`/`MONO` in the script at local copies). Text in images must also exist as real HTML text or `alt`.

### 2.5 Do / don't

- Do: one accent per image, thin lines, dark space, signal colours by meaning.
- Do: keep every motif abstract (scales, traces, arcs) unless it is the owner's real work.
- Don't: chrome, lens flares, carbon-fibre textures, fake 3D dashboards, stock "futuristic HUD" packs.
- Don't: show OEM logos, vehicle brand marks, or client names in any artwork unless the owner confirms written permission.
- Don't: fabricate screenshots of projects, testimonials, client logos, or photos of the person.

### 2.6 Rights and confidentiality for owner-supplied media

Automotive and medical HMI work is normally under NDA. For every screenshot or video the owner supplies, the owner confirms (recorded in the asset manifest, 3.7): (a) the right to publish, (b) OEM/customer branding, VINs, part numbers, and patient data are removed or blurred, (c) any simulated data shown is clearly synthetic. Media without this confirmation is not published; the placeholder stays.

---

## 3 Image pipeline

### 3.1 Formats

| Content | Primary | Secondary | Fallback (`<img src>`) | Notes |
|---|---|---|---|---|
| Photo with transparency (portrait) | AVIF (alpha) | WebP (alpha) | WebP 600w | All evergreen browsers decode WebP; a JPEG flattened on `#060c18` (`profile-600-flat.jpg`) exists for e-mail and non-browser use only. |
| Photo / screenshot, opaque | AVIF | WebP | JPEG (progressive, 4:2:0) | Screenshots with UI text: AVIF/WebP at higher quality (3.2), never PNG-8. |
| Flat graphics, logos, icons | SVG | — | PNG only where SVG is not accepted (touch/app icons) | |
| Social card | JPEG (`og:image`) | PNG (≤ 300 KB) | — | Unfurlers do not reliably accept AVIF or WebP for `og:image`. |

### 3.2 Encoder settings (Pillow 12 / libavif 1.4 / libwebp 1.6 reference)

| Format | Setting |
|---|---|
| AVIF | `quality=60, speed=4, subsampling 4:2:0` (photos); screenshots with small text: `quality=72, subsampling 4:4:4` |
| WebP | `quality=80, method=6, alpha_quality=90`; screenshots `quality=88` |
| JPEG | `quality=82–86, progressive, optimize`; `subsampling=0` (4:4:4) when the image contains coloured text (OG card) |
| PNG | Truecolor first; if over budget, posterise to 7 then 6 bits per channel. **No 256-colour palette for images containing skin** (it posterises faces). |
| All | sRGB, strip EXIF/XMP/GPS (no location or camera serials leak), no embedded thumbnails. |

### 3.3 Width ladder per slot

| Slot | Aspect | Widths (px) | Rendered size today | Max candidate needed |
|---|---|---|---|---|
| Profile portrait | 2:3 | **300, 450, 600, 900** | 220x265 CSS (cover) | 660 px at DPR 3 → 900w |
| Project screenshot / card media | 16:9 | 640, 960, 1280, 1920 | Card width (UX spec) | 2x card width, capped 1920 |
| Video poster | 16:9 | 640, 1280 | Video box | 1280 |
| OG card | 1.91:1 | 1200 (fixed) | n/a | 1200x630 |

Ladder rule: steps of ≈ 1.5x; never upscale beyond the master (the portrait master is 1024x1536, so 900w is the top rung).

### 3.4 Markup contract

Portrait (values for today's 220-px frame; recompute `sizes` if the UX spec changes it):

```html
<!-- index.html head: preload only where the photo is visible -->
<link rel="preload" as="image" media="(min-width: 901px)"
      imagesrcset="/img/profile-300.avif 300w, /img/profile-450.avif 450w, /img/profile-600.avif 600w, /img/profile-900.avif 900w"
      imagesizes="220px" type="image/avif">

<picture>
  <source type="image/avif"
          srcset="/img/profile-300.avif 300w, /img/profile-450.avif 450w, /img/profile-600.avif 600w, /img/profile-900.avif 900w"
          sizes="(max-width: 900px) 1px, 220px">
  <source type="image/webp"
          srcset="/img/profile-300.webp 300w, /img/profile-450.webp 450w, /img/profile-600.webp 600w, /img/profile-900.webp 900w"
          sizes="(max-width: 900px) 1px, 220px">
  <img src="/img/profile-600.webp" width="600" height="900"
       alt="S. Jeevanandham" decoding="async" class="profile-photo">
</picture>
```

- `sizes="(max-width: 900px) 1px, …"` makes a hidden-on-mobile photo cost one 300w AVIF (11 KB) instead of 96 KB. If the photo is shown on mobile in R2, replace `1px` with its rendered width.
- Explicit `width`/`height` (intrinsic 2:3) on every `<img>` and a CSS `aspect-ratio` on the box: zero layout shift.
- Below-the-fold media (`#projects`, `#design`, video posters): `loading="lazy" decoding="async"`, never `fetchpriority="high"`.
- Above-the-fold media: no `loading="lazy"`; `fetchpriority="high"` only on the measured LCP element.
- Preload `type` must match the first `<source>` type, otherwise browsers that cannot decode it double-download.

### 3.5 Size budgets (per file, bytes as delivered)

| Asset | Budget | Generated |
|---|---|---|
| Portrait 300w AVIF / WebP | 15 KB / 25 KB | 11.3 KB / 22.6 KB |
| Portrait 450w AVIF / WebP | 25 KB / 50 KB | 19.1 KB / 45.4 KB |
| Portrait 600w AVIF / WebP | 35 KB / 90 KB | 27.5 KB / 85.2 KB |
| Portrait 900w AVIF / WebP | 60 KB / 190 KB | 47.6 KB / 184.6 KB |
| OG card JPEG / PNG | 150 KB / 300 KB | 118.6 KB / 234.4 KB |
| Screenshot 1280w AVIF / WebP / JPEG | 80 / 120 / 160 KB | n/a (owner media) |
| Poster frame 1280w (WebP) | 60 KB | placeholders 21–23 KB |
| Video clip (each format) | ≤ 2 MB target, 4 MB hard cap | n/a |
| Icon PNGs (all) | 64 KB each, 512 px | ≤ 58 KB |
| All images above the fold (desktop, first load) | 60 KB | ≈ 19 KB (450w AVIF at DPR 2) |

### 3.6 Naming and location

`<slot>-<width>.<ext>` (e.g. `profile-450.avif`, `proj-cluster-r1-1280.webp`). Proposed public folder: `public/img/` for raster media, `public/media/` for video and captions, icons at the site root (browsers and crawlers look there). Lower-case, hyphenated, no spaces, no personal data in filenames.

### 3.7 Production

- Pre-generated, committed assets made by a script (`docs/design/assets/gen_assets.py` is the reference). This adds **no build dependency**; adopting a Vite image plugin instead is an architecture decision for the Software Architect.
- An **asset manifest** (JSON, proposed `src/data/media.js` via model factories) lists for each media item: id, slot, `alt` or caption, widths, formats, intrinsic width/height, owner-rights confirmation (2.6), and for video the poster and caption track paths.

---

## 4 Video specification (owner-supplied HMI demo clips)

### 4.1 Encoding

| Property | MP4 (required) | WebM (recommended) |
|---|---|---|
| Codec | H.264 High profile, level ≤ 4.1, `yuv420p` | VP9, `yuv420p` |
| Container flags | `+faststart` (moov atom first) | default |
| Resolution | 1280x720 (16:9); 1920x1080 only if UI text is unreadable at 720p | same as MP4 |
| Frame rate | Source rate, max 30 fps; 60 fps only for needle/animation-smoothness demos, and then ≤ 10 s | same |
| Rate control | CRF 26–28 (x264 `-preset slow`), 2-pass if over budget | CRF 34–36, `-b:v 0`, `-row-mt 1` |
| Audio | **Strip** (`-an`) for ambient/autoplay clips; AAC 96 kb/s only for narrated clips | Opus 64 kb/s if narrated |
| Duration | 6–20 s loopable for ambient clips; ≤ 90 s for narrated walkthroughs (click-to-play only) | |
| Size | **≤ 2 MB target, 4 MB hard cap per file** for ambient clips; narrated clips ≤ 8 MB, never autoplay | |

Reference commands (ffmpeg is available in the dev environment):

```bash
ffmpeg -i in.mov -vf "scale=1280:-2,fps=30" -an -c:v libx264 -preset slow -crf 27 -profile:v high -pix_fmt yuv420p -movflags +faststart demo-720.mp4
ffmpeg -i in.mov -vf "scale=1280:-2,fps=30" -an -c:v libvpx-vp9 -crf 35 -b:v 0 -row-mt 1 -pix_fmt yuv420p demo-720.webm
ffmpeg -ss 2 -i demo-720.mp4 -frames:v 1 -q:v 2 poster.png   # then encode poster to WebP/AVIF per 3.2
```

### 4.2 Poster frames

- Mandatory for every `<video>`; same aspect ratio and intrinsic size as the video (no CLS).
- Pick a frame that explains the demo when nothing plays (the cluster at a meaningful state, not a black or transition frame).
- WebP 1280w (≤ 60 KB) plus 640w; until owner media exists, use `assets/placeholders/placeholder-hmi-demo-video.webp`.
- The `poster` attribute takes one URL; serve the 1280w WebP (or an AVIF via `<picture>` overlay if the UX spec uses a click-to-load facade).

### 4.3 Playback rules

1. Ambient clips may autoplay **only** with `muted playsinline loop` and **only** while ≥ 50 % in the viewport (IntersectionObserver); they pause when out of view or when the document is hidden.
2. With `prefers-reduced-motion: reduce`, nothing autoplays: show the poster with a visible play control.
3. With `Save-Data: on` / `navigator.connection.saveData`, or an effective type of `2g`/`slow-2g`, do not fetch video until the user asks: `preload="none"`.
4. Default `preload="none"` for all clips below the fold; `preload="metadata"` at most for a clip in the first viewport.
5. Every clip has a visible pause control (WCAG 2.2.2 for motion lasting > 5 s) and native controls on demand.
6. Sources ordered WebM (VP9) first, MP4 second; `width`/`height` attributes set.
7. No third-party players or hosted embeds (keeps NFR-SEC-002 intact).

Timings for any transition into/out of playback are owned by `MOTION_SPEC.md`.

### 4.4 Captions and transcripts

- Narrated clips: WebVTT captions (`<track kind="captions" srclang="en" default>`), human-reviewed, synchronised within 0.5 s.
- Silent clips: a one-to-three-sentence text description adjacent to the video (or `aria-describedby`) stating what the demo shows; a `kind="descriptions"` track is optional.
- Every clip: a text transcript or summary available on the page or via a link (WCAG 1.2.1 / 1.2.2 / 1.2.5 intent).
- The `<video>` has an accessible name (`aria-label` or a visible caption/figcaption).

---

## 5 Icon system guidance

### 5.1 Grid and stroke (custom SVG icons)

- 24x24 viewBox, 2-px safe margin (live area 20x20), stroke **1.5**, `stroke-linecap="round"`, `stroke-linejoin="round"`, `fill="none"` by default; solid fills only for small dots (≤ 3 px).
- Coordinates on 0.5-px multiples so 1.5 strokes sit centred on device pixels at 1x and 2x.
- Colour via `currentColor` (not a `c` prop) so day/night token changes cascade.
- Optical size: render at 16, 20 or 24 px only.

### 5.2 Sources and hierarchy

| Need | Source | Treatment |
|---|---|---|
| UI glyphs (nav, buttons, labels) | Material Symbols Outlined | wght 300, FILL 0, GRAD −25, opsz matched to size; subset via `icon_names` (VM-AUD-20) |
| Domain/protocol icons (UART, CAN, ...) | Custom SVG set (30 keys) | Rules in 5.1 |
| Third-party tools (Qt, Git, Figma, ...) | Simple Icons (CC0), **self-hosted** | Monochrome, `currentColor` tinted to the category signal token, scaled to 18 px inside the 22-px slot so solid marks match outline weight |

Trademarks: brand marks are used only to identify a tool the owner has used (nominative use), never altered in shape, never combined with the owner's monogram, never used for clients or employers.

### 5.3 Accessibility

Icons next to a text label are decorative: `aria-hidden="true"` (font glyphs) or `alt=""` (images). An icon-only control gets an accessible name on the control, not on the icon.

### 5.4 Monogram, favicon and app icons (generated)

The monogram is a **pixel-grid "SJ"** in the style of a cluster segment readout: 16x16 design grid, 2-px strokes, 1-px gaps, amber `#f59e0b` on `#060c18`, 1-px amber border ring. In `favicon.svg` every edge lies on a 4-unit boundary of the 64-unit viewBox, so it renders crisp at 16, 32 and 48 px with no font dependency. Large sizes (≥ 120 px) add the faint grid, a 270° gauge arc with ticks and a soft amber glow; small sizes do not.

| File | Purpose | Notes |
|---|---|---|
| `favicon.svg` | Modern browsers | Vector, 525 B |
| `favicon.ico` | Legacy agents requesting `/favicon.ico` | 16/32/48 multi-resolution |
| `favicon-16.png`, `favicon-32.png` | PNG fallbacks | Box-filtered, crisp |
| `apple-touch-icon.png` | iOS home screen | 180x180, **opaque**, full-bleed (iOS applies its own mask) |
| `icon-192.png`, `icon-512.png` | Manifest `purpose: any` | Rounded plate, transparent corners |
| `icon-maskable-512.png` | Manifest `purpose: maskable` | Opaque, monogram inside the 80 % safe circle |
| `site.webmanifest` | Install metadata | `display: browser` (portfolio, not an app) |

Manifest colours: `background_color` `#060c18` (`--bg`). `theme_color` is set to `#060c18` to **match the existing `<meta name="theme-color" content="#060c18">`**; using amber `#f59e0b` there would turn the mobile browser toolbar amber and contradict the meta tag. If the PO prefers an amber toolbar, both values must change together (open question Q3).

---

## 6 Social / link-unfurl card

### 6.1 Composition (`assets/social/og-card.jpg`, 1200x630)

Left 55 %: kicker "HMI ENGINEERING PORTFOLIO" with a tick scale, name "S. Jeevanandham", role "SENIOR HMI ENGINEER" (amber, tracked), amber/cyan rule, tagline "Qt/QML · Embedded C++ · Automotive & Medical HMI", telemetry traces, URL chip. Right 45 %: the real portrait with the treatment from 2.3, framed by a gauge arc; corner brackets on the canvas. Safe area: all text inside x 72–620, y 70–585, which survives the 1:1 centre-crop some apps apply to the left half only partially, so the **name and role are the elements kept above y 300** (they remain in a 1.91:1 → 2:1 crop). Minimum text size on the card: 20 px at 1200 w (≈ 10 px in a 600-px unfurl).

### 6.2 Head tags (R2 candidate)

```html
<meta property="og:image" content="https://jeevanandhamsivasankar.github.io/og-card.jpg" />
<meta property="og:image:type" content="image/jpeg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="S. Jeevanandham, Senior HMI Engineer: Qt/QML, Embedded C++, automotive and medical HMI" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://jeevanandhamsivasankar.github.io/og-card.jpg" />
<link rel="icon" href="/favicon.ico" sizes="48x48" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
```

This changes NFR-SEO-002 (which names `/profile-og.jpg` and `summary`) and NFR-DEPLOY-001's asset list; both need an SRS change request at R2.

---

## 7 Generated assets (`docs/design/assets/`)

All files were opened with Pillow after generation and their dimensions checked. Source for the portrait: original 1024x1536 RGBA PNG from git history (`git show dd9a86d^:public/profile.png`). Regenerate with:

```bash
git show dd9a86d^:public/profile.png > /tmp/profile.png
python3 docs/design/assets/gen_assets.py /tmp/profile.png .
```

The script is deterministic (seeded traces, fixed parameters). Pillow 12.3 with AVIF (libavif 1.4.2) and WebP (libwebp 1.6.0) support was used.

### 7.1 Inventory

| File | Dimensions | Format / mode | Bytes |
|---|---|---|---|
| `profile/profile-300.avif` | 300x450 | AVIF RGBA | 11,314 |
| `profile/profile-300.webp` | 300x450 | WebP RGBA | 22,574 |
| `profile/profile-450.avif` | 450x675 | AVIF RGBA | 19,105 |
| `profile/profile-450.webp` | 450x675 | WebP RGBA | 45,358 |
| `profile/profile-600.avif` | 600x900 | AVIF RGBA | 27,518 |
| `profile/profile-600.webp` | 600x900 | WebP RGBA | 85,164 |
| `profile/profile-900.avif` | 900x1350 | AVIF RGBA | 47,604 |
| `profile/profile-900.webp` | 900x1350 | WebP RGBA | 184,578 |
| `profile/profile-600-flat.jpg` | 600x900 | JPEG RGB (on `#060c18`) | 50,669 |
| `social/og-card.jpg` | 1200x630 | JPEG RGB, 4:4:4 | 118,626 |
| `social/og-card.png` | 1200x630 | PNG RGB (6 bits/channel) | 234,387 |
| `icons/favicon.svg` | vector, viewBox 64 | SVG (paths, no fonts) | 525 |
| `icons/favicon.ico` | 16, 32, 48 | ICO | 1,286 |
| `icons/favicon-16.png` | 16x16 | PNG RGBA | 260 |
| `icons/favicon-32.png` | 32x32 | PNG RGBA | 368 |
| `icons/apple-touch-icon.png` | 180x180 | PNG RGB (opaque) | 14,286 |
| `icons/icon-192.png` | 192x192 | PNG RGBA | 18,708 |
| `icons/icon-512.png` | 512x512 | PNG RGBA | 57,816 |
| `icons/icon-maskable-512.png` | 512x512 | PNG RGB (opaque) | 34,273 |
| `icons/site.webmanifest` | — | JSON (validated) | 728 |
| `placeholders/placeholder-hmi-demo-video.webp` | 1280x720 | WebP RGB | 22,814 |
| `placeholders/placeholder-project-screenshot.webp` | 1280x720 | WebP RGB | 20,806 |
| `gen_assets.py` | — | Python generator | — |

Comparison with today: the 600w WebP is 85 KB vs 96 KB for `public/profile.webp`; the 600w AVIF is 27.5 KB (−71 %). The DPR-2 desktop case (450w AVIF) is 19 KB (−80 %).

### 7.2 Placeholders

Both placeholders carry a visible **"PLACEHOLDER — OWNER MEDIA"** label, a diagonal hatch and generic glyphs (play disc with gauge arc; picture-frame glyph). They contain no fake UI, data, logos or claims. They are meant for prototypes and for the empty state of a media slot until real media is approved; they must not ship in production in place of a real project item (FR-MEDIA-009).

---

## 8 Requirement candidates (for SRS v2.0)

Priorities: **Must** / **Should** / **Could**. Verification: I = inspection, A = analysis, QT = qualification test.

### 8.1 Functional

| ID | Requirement | Acceptance criterion | Priority |
|---|---|---|---|
| FR-MEDIA-001 | The profile photo shall be delivered through `<picture>` with AVIF and WebP sources at widths 300, 450, 600 and 900 and a WebP `<img>` fallback carrying `alt="S. Jeevanandham"`, `width="600"`, `height="900"` and `decoding="async"`. | QT: at 1366x800 DPR 1 the selected `currentSrc` ends in `-300.avif` (Chromium); at DPR 2 in `-450.avif`. Inspection of markup confirms both sources, four widths each, and the attributes. | Must |
| FR-MEDIA-002 | Where the profile photo is not displayed (viewport ≤ 900 px in the current layout), the page shall not download more than the smallest profile candidate. | QT at 390x844: network log shows no profile request larger than the 300w candidate (≤ 25 KB) and no request for the 600w/900w files. | Must |
| FR-MEDIA-003 | The site shall serve a 1200x630 Open Graph image (`/og-card.jpg`) showing the owner's name, role and site URL, declared with `og:image`, `og:image:width`, `og:image:height`, `og:image:alt`, `og:image:type`, `twitter:card=summary_large_image` and `twitter:image`. | QT: meta values match; GET `/og-card.jpg` returns 200, `image/jpeg`, 1200x630, ≤ 150 KB. | Must |
| FR-MEDIA-004 | The favicon shall be drawn with vector paths only (no `<text>` or font reference) and shall be complemented by `favicon.ico` (16/32/48), `apple-touch-icon.png` (180x180, opaque) and a web app manifest with 192, 512 and maskable 512 icons. | I: `favicon.svg` contains no `<text>`/`font-family`. QT: each file returns 200 with the right type; manifest parses and every icon URL resolves with the declared size. | Should |
| FR-MEDIA-005 | Every `<video>` shall have a `poster` with the same aspect ratio as the video, explicit `width`/`height`, WebM (VP9) and MP4 (H.264) sources, `playsinline`, and `preload="none"` unless in the first viewport. | I + QT: attributes present on every video; poster loads; no video bytes are requested before the user scrolls to (or plays) a below-the-fold clip. | Must (when video ships) |
| FR-MEDIA-006 | Ambient video shall autoplay only `muted`, only while at least 50 % visible, only when `prefers-reduced-motion` is not `reduce`, and shall pause when out of view or when the document is hidden. A visible pause control shall be available for any clip longer than 5 s. | QT: with reduced motion emulated, `video.paused === true` after 3 s in view; without it, playing in view, paused after scrolling away; pause control operable by keyboard. | Must (when video ships) |
| FR-MEDIA-007 | Narrated videos shall have reviewed WebVTT captions (`kind="captions"`, `srclang="en"`); every video shall have an adjacent text description or transcript and an accessible name. | QT: each narrated video has a loadable caption track; each video has an accessible name and an associated description element. | Must (when video ships) |
| FR-MEDIA-008 | Design-card artwork shall be decorative (`aria-hidden="true"`) and shall contain no realistic personal names or patient data. | I: no person names in art data; QT: art SVGs are aria-hidden. | Must |
| FR-MEDIA-009 | Owner media slots without approved media shall render the brand placeholder or the existing SVG artwork; a placeholder labelled "Placeholder — owner media" shall not be published in the production build. | A: production build contains no `placeholder-*` file reference; I: manifest entries without rights confirmation fall back to SVG art. | Should |
| FR-MEDIA-010 | Skill-chip brand icons shall be self-hosted monochrome SVGs coloured with `currentColor` from the category signal token, with `alt=""` (or `aria-hidden`) because the chip label is adjacent. | QT: no request to `cdn.simpleicons.org`; computed colour of icons equals the category token in both themes; no chip icon has non-empty alt. | Should |
| FR-MEDIA-011 | Every owner-supplied screenshot or video shall be recorded in the media manifest with a rights/redaction confirmation before publication (section 2.6). | I: each manifest item has `rightsConfirmed: true` and a non-empty `alt` or description. | Must |

### 8.2 Non-functional

| ID | Requirement | Acceptance criterion | Priority |
|---|---|---|---|
| NFR-MEDIA-001 | Every raster `<img>`, `<picture>` and `<video>` shall declare intrinsic `width` and `height` (or the box an explicit `aspect-ratio`) so media causes no layout shift. | Lighthouse mobile and desktop: CLS < 0.05, with no media element listed under layout-shift culprits. | Must |
| NFR-MEDIA-002 | Delivered media shall respect the per-file budgets in section 3.5 (portrait 600w AVIF ≤ 35 KB, OG JPEG ≤ 150 KB, OG PNG ≤ 300 KB, video ≤ 4 MB per file, poster ≤ 60 KB). | A: CI size check over `dist/` fails the build on any file above its budget. | Must |
| NFR-MEDIA-003 | Above-the-fold image bytes on first desktop load shall not exceed 60 KB; on mobile (390x844) 25 KB. | A: Lighthouse/network log sum of image transfer before first scroll. | Should |
| NFR-MEDIA-004 | Below-the-fold images shall use `loading="lazy"`; `fetchpriority="high"` shall be used only on the element Lighthouse reports as LCP, and never on more than one element. | I + Lighthouse "LCP element" audit. | Should |
| NFR-MEDIA-005 | Published images shall contain no EXIF/XMP/GPS metadata and shall be in sRGB. | A: `exiftool`/Pillow scan of `dist/` finds no GPS or camera tags; ICC is absent or sRGB. | Must |
| NFR-MEDIA-006 | Imagery shall follow the art direction in section 2: brand tokens only, one accent per image, no fabricated photos of the owner, no fake project screenshots, no third-party or OEM logos without written permission. | I: Product Owner visual review checklist signed for each new asset. | Must |
| NFR-MEDIA-007 | Transparent assets (portrait, icons) shall remain legible on both theme backgrounds (`#060c18` and `#fef9f0`) with no visible fringe at 200 % zoom. | I: side-by-side review at 200 % in both themes. | Should |
| NFR-MEDIA-008 | Generated brand assets shall be reproducible from a committed script and source master. | A: running the generator on the documented master reproduces files with identical dimensions and sizes within ±2 %. | Could |
| NFR-MEDIA-009 | Video playback shall add no third-party origin (self-hosted files only). | QT: network log origins stay within the NFR-SEC-002 allowlist when videos play. | Must (when video ships) |

---

## 9 Hand-off: proposed moves into `public/` (after PO approval only)

| From `docs/design/assets/` | To | Replaces |
|---|---|---|
| `profile/profile-{300,450,600,900}.{avif,webp}` | `public/img/` | `public/profile.webp` (keep until markup switches) |
| `social/og-card.jpg` | `public/og-card.jpg` | `public/profile-og.jpg` (keep one release for cached unfurls) |
| `icons/favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `site.webmanifest` | `public/` (root) | `public/favicon.svg` |
| `placeholders/*` | Prototypes and dev fixtures only | — |
| `social/og-card.png`, `profile/profile-600-flat.jpg`, `favicon-16/32.png` | Not published by default (kept as masters / e-mail use) | — |

SRS items affected at R2: FR-HERO-011 (markup), NFR-PERF-003 (preload form), NFR-SEO-002, NFR-SEO-003, NFR-DEPLOY-001 (asset list), NFR-SEC-002 (drop `cdn.simpleicons.org` if FR-MEDIA-010 is accepted), EI-2, EI-9.

## 10 Open questions for the Product Owner / owner

- **Q1** Will real HMI demo videos and screenshots be supplied, and can the owner confirm publication rights and redaction (2.6)? Until then the placeholders and SVG art stay.
- **Q2** Should the R2 layout show the profile photo on mobile? (Changes `sizes` and FR-MEDIA-002.)
- **Q3** Manifest `theme_color`: keep `#060c18` (matches today's meta tag, chosen in the draft) or switch both to amber `#f59e0b`?
- **Q4** Replace the medical-card sample name now (it is a content fix that could even go into a R1.x patch) or at R2?
- **Q5** Approve re-rendering OG card and placeholders with the brand fonts (Barlow Condensed / Share Tech Mono) before release.

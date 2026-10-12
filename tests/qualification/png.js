// Minimal PNG decoder (8-bit, non-interlaced, colour types 0/2/3/4/6) and pixel-diff for visual regression.
import { inflateSync } from 'node:zlib'

export function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG')
  let off = 8
  let width = 0, height = 0, bitDepth = 0, colorType = 0, interlace = 0
  let palette = null
  const idat = []
  while (off < buf.length) {
    const len = buf.readUInt32BE(off)
    const type = buf.toString('ascii', off + 4, off + 8)
    const data = buf.subarray(off + 8, off + 8 + len)
    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      bitDepth = data[8]
      colorType = data[9]
      interlace = data[12]
    } else if (type === 'PLTE') palette = data
    else if (type === 'IDAT') idat.push(data)
    else if (type === 'IEND') break
    off += 12 + len
  }
  if (bitDepth !== 8 || interlace !== 0) throw new Error(`unsupported PNG (depth ${bitDepth}, interlace ${interlace})`)
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType]
  const bpp = channels
  const stride = width * channels
  const raw = inflateSync(Buffer.concat(idat))
  const px = Buffer.alloc(height * stride)
  for (let y = 0; y < height; y++) {
    const ft = raw[y * (stride + 1)]
    const src = y * (stride + 1) + 1
    const dst = y * stride
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[dst + x - bpp] : 0
      const b = y > 0 ? px[dst - stride + x] : 0
      const c = x >= bpp && y > 0 ? px[dst - stride + x - bpp] : 0
      let v = raw[src + x]
      if (ft === 1) v += a
      else if (ft === 2) v += b
      else if (ft === 3) v += (a + b) >> 1
      else if (ft === 4) {
        const p = a + b - c
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c)
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c
      }
      px[dst + x] = v & 255
    }
  }
  const rgba = Buffer.alloc(width * height * 4)
  for (let i = 0; i < width * height; i++) {
    let r, g, b, a = 255
    if (colorType === 6) [r, g, b, a] = [px[i * 4], px[i * 4 + 1], px[i * 4 + 2], px[i * 4 + 3]]
    else if (colorType === 2) [r, g, b] = [px[i * 3], px[i * 3 + 1], px[i * 3 + 2]]
    else if (colorType === 0) r = g = b = px[i]
    else if (colorType === 4) { r = g = b = px[i * 2]; a = px[i * 2 + 1] }
    else { const k = px[i] * 3; [r, g, b] = [palette[k], palette[k + 1], palette[k + 2]] }
    rgba.set([r, g, b, a], i * 4)
  }
  return { width, height, data: rgba }
}

const blend = (c, a) => 255 + (c - 255) * (a / 255)
function yiq(r, g, b) {
  return [0.29889531 * r + 0.58662247 * g + 0.11448223 * b, 0.59597799 * r - 0.2741761 * g - 0.32180189 * b, 0.21147017 * r - 0.52261711 * g + 0.31114694 * b]
}

/**
 * Pixel diff in the style of pixelmatch (YIQ delta, `threshold` 0..1), without anti-alias forgiveness.
 * Returns { mismatched, total, ratio, sizeMismatch }.
 */
export function diffPng(a, b, threshold = 0.2) {
  if (a.width !== b.width || a.height !== b.height) {
    return { mismatched: Math.max(a.width * a.height, b.width * b.height), total: Math.max(a.width * a.height, b.width * b.height), ratio: 1, sizeMismatch: `${a.width}x${a.height} vs ${b.width}x${b.height}` }
  }
  const max = 35215 * threshold * threshold
  let mismatched = 0
  const n = a.width * a.height
  for (let i = 0; i < n; i++) {
    const o = i * 4
    let r1 = a.data[o], g1 = a.data[o + 1], b1 = a.data[o + 2]
    let r2 = b.data[o], g2 = b.data[o + 1], b2 = b.data[o + 2]
    if (r1 === r2 && g1 === g2 && b1 === b2 && a.data[o + 3] === b.data[o + 3]) continue
    const a1 = a.data[o + 3], a2 = b.data[o + 3]
    if (a1 < 255) { r1 = blend(r1, a1); g1 = blend(g1, a1); b1 = blend(b1, a1) }
    if (a2 < 255) { r2 = blend(r2, a2); g2 = blend(g2, a2); b2 = blend(b2, a2) }
    const [y1, i1, q1] = yiq(r1, g1, b1)
    const [y2, i2, q2] = yiq(r2, g2, b2)
    const delta = 0.5053 * (y1 - y2) ** 2 + 0.299 * (i1 - i2) ** 2 + 0.1957 * (q1 - q2) ** 2
    if (delta > max) mismatched++
  }
  return { mismatched, total: n, ratio: mismatched / n, sizeMismatch: null }
}

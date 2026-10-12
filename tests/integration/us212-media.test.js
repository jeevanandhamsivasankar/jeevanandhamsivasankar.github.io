import { execSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { MEDIA } from '../../src/data/media.js'
import { isLocalUrl } from '../../src/models/mediaSchema.js'

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

describe('IT-061/062 media manifest and production bundle', () => {
  it('IT-061 manifest: rights confirmed, alt/description, local URLs only, unique ids', () => {
    expect(new Set(MEDIA.map((m) => m.id)).size).toBe(MEDIA.length)
    for (const m of MEDIA) {
      expect(m.rightsConfirmed).toBe(true)
      expect(Boolean(m.alt || m.description)).toBe(true)
      const urls = [m.src, m.poster, m.captions?.src, ...Object.values(m.sources ?? {})].filter(Boolean)
      urls.forEach((u) => expect(isLocalUrl(u), u).toBe(true))
    }
  })

  it('IT-062 production bundle has no placeholder file or reference', () => {
    const out = mkdtempSync(join(tmpdir(), 'us212-dist-'))
    execSync(`npx vite build --outDir ${out} --emptyOutDir`, { stdio: 'pipe' })
    expect(existsSync(join(out, 'index.html'))).toBe(true)
    const files = walk(out)
    expect(files.filter((f) => /placeholder-/.test(f))).toEqual([])
    for (const f of files.filter((x) => /\.(js|css|html)$/.test(x))) {
      expect(readFileSync(f, 'utf8'), f).not.toMatch(/placeholder-(hmi|project)/)
    }
  }, 120_000)
})

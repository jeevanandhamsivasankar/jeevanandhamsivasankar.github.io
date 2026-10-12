import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const script = join(process.cwd(), 'scripts/check-media-budget.mjs')
const run = (dir) => spawnSync('node', [script, dir, '--manifest', 'none.js'], { encoding: 'utf8' })
const dirWith = (files) => {
  const d = mkdtempSync(join(tmpdir(), 'it49-'))
  for (const [rel, buf] of Object.entries(files)) {
    mkdirSync(join(d, rel, '..'), { recursive: true })
    writeFileSync(join(d, rel), buf)
  }
  return d
}

describe('IT-049 budget script on fixtures', () => {
  it('IT-049 exits 0 for compliant fixtures and 1 for an oversized OG JPEG', () => {
    expect(run(dirWith({ 'og-card.jpg': Buffer.alloc(1000) })).status).toBe(0)
    const r = run(dirWith({ 'og-card.jpg': Buffer.alloc(151 * 1024) }))
    expect(r.status).toBe(1)
    expect(r.stderr).toMatch(/OG JPEG/)
  })

  it('IT-049 package.json exposes check:media and CI runs it after build', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
    expect(pkg.scripts['check:media']).toBe('node scripts/check-media-budget.mjs')
    const ci = readFileSync('.github/workflows/ci.yml', 'utf8')
    expect(ci.indexOf('npm run check:media')).toBeGreaterThan(ci.indexOf('npm run build'))
  })
})

describe('IT-050 dist has no placeholder / metadata', () => {
  it('IT-050 flags placeholder-* files and EXIF-bearing JPEGs', () => {
    const exif = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe1, 0, 8]), Buffer.from('Exif\0\0'), Buffer.alloc(8)])
    const r = run(dirWith({ 'img/placeholder-x.webp': Buffer.alloc(10), 'a.jpg': exif }))
    expect(r.status).toBe(1)
    expect(r.stderr).toMatch(/placeholder/)
    expect(r.stderr).toMatch(/EXIF/)
  })

  it('IT-050 built dist (when present) is clean', () => {
    if (!existsSync('dist')) return
    const r = spawnSync('node', [script, 'dist', '--manifest', 'none.js'], { encoding: 'utf8' })
    expect(r.stderr).toBe('')
    expect(r.status).toBe(0)
  })
})

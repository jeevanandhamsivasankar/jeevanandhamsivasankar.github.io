import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { checkBudgets, checkClean, validateManifest } from '../../../scripts/check-media-budget.mjs'

const mk = () => mkdtempSync(join(tmpdir(), 'mb-'))
const put = (dir, rel, bytes) => {
  const p = join(dir, rel)
  mkdirSync(join(p, '..'), { recursive: true })
  writeFileSync(p, Buffer.alloc(bytes, 1))
}

describe('UNIT-MEDIABUDGET', () => {
  it('UT-MEDIABUDGET-001 flags files over budget and passes files within budget', () => {
    const ok = mk()
    put(ok, 'img/profile-600.avif', 35 * 1024)
    put(ok, 'og-card.jpg', 150 * 1024)
    put(ok, 'og-card.png', 300 * 1024)
    put(ok, 'v/demo.mp4', 4 * 1024 * 1024)
    put(ok, 'v/demo-poster.webp', 60 * 1024)
    expect(checkBudgets(ok)).toEqual([])
    const bad = mk()
    put(bad, 'img/profile-600.avif', 35 * 1024 + 1)
    put(bad, 'og-card.jpg', 150 * 1024 + 1)
    put(bad, 'og-card.png', 300 * 1024 + 1)
    put(bad, 'v/demo.mp4', 4 * 1024 * 1024 + 1)
    put(bad, 'v/demo-poster.webp', 60 * 1024 + 1)
    expect(checkBudgets(bad)).toHaveLength(5)
    rmSync(ok, { recursive: true })
    rmSync(bad, { recursive: true })
  })

  it('UT-MEDIABUDGET-002 manifest entries need rightsConfirmed and non-empty alt/description', () => {
    expect(validateManifest([{ id: 'a', rightsConfirmed: true, alt: 'x', description: 'y' }])).toEqual([])
    expect(validateManifest([{ id: 'b', rightsConfirmed: false, alt: '', description: ' ' }])).toHaveLength(3)
    expect(checkClean(mk())).toEqual([])
  })
})

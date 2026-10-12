import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'))
/** vitest.config.js is evaluated in real Node (importing vite under jsdom breaks esbuild). */
const vitestConfig = JSON.parse(
  execFileSync(
    process.execPath,
    ['--input-type=module', '-e', `const { default: c } = await import(${JSON.stringify(path.resolve('vitest.config.js'))}); console.log(JSON.stringify(c))`],
    { encoding: 'utf8' },
  ),
)
const ci = fs.readFileSync(path.resolve('.github/workflows/ci.yml'), 'utf8')

describe('pipeline wiring (ARC-020, ARC-019)', () => {
  it('IT-042 scripts, coverage thresholds and CI wiring', () => {
    for (const name of ['dev', 'build', 'preview', 'lint', 'test', 'test:coverage', 'test:qualification', 'deploy']) {
      expect(pkg.scripts[name], `script ${name}`).toBeTruthy()
    }
    expect(pkg.scripts.deploy).toBe('gh-pages -d dist')
    expect(pkg.scripts.test).toMatch(/vitest/)
    expect(pkg.scripts['test:qualification']).toMatch(/playwright/)

    expect(Object.keys(pkg.dependencies).sort()).toEqual(['react', 'react-dom'])

    const cov = vitestConfig.test.coverage
    const t = cov.thresholds
    expect(t, 'coverage.thresholds').toBeDefined()
    expect(t.lines ?? t.statements).toBeGreaterThanOrEqual(80)
    const perGlob = Object.entries(t).filter(([k]) => /models|lib|hooks/.test(k))
    expect(perGlob.length, 'per-folder thresholds for models/lib/hooks').toBeGreaterThanOrEqual(3)
    for (const [, v] of perGlob) expect(v.lines).toBeGreaterThanOrEqual(90)

    expect(ci).toMatch(/npm run lint/)
    expect(ci).toMatch(/npm (run )?test\b(?!:)/)
    expect(ci).toMatch(/npm run build/)
    expect(ci).toMatch(/npm run test:qualification/)
  })
})

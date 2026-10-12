/**
 * Static / analysis qualification tests (viewport S): run once, in the desktop project, against the source tree
 * and the production build in dist/.
 */
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync, mkdtempSync } from 'node:fs'
import { join, relative, dirname, resolve, extname } from 'node:path'
import { tmpdir } from 'node:os'
import { gzipSync } from 'node:zlib'
import { test, expect, only, ROOT, readSrc } from './helpers.js'

/** Static (S) test: runs once, in the desktop project; the body receives testInfo. */
const staticTest = (title, fn) =>
  test(title, async ({ baseURL }, testInfo) => {
    only(testInfo, 'S')
    await fn(testInfo, baseURL)
  })

const SRC = join(ROOT, 'src')
function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}
const srcFiles = () => walk(SRC)
const jsFiles = () => srcFiles().filter((f) => /\.(js|jsx)$/.test(f))
const rel = (p) => relative(SRC, p).replace(/\\/g, '/')

staticTest('QT-048 Education content is data-driven (static inspection)', async () => {
  const src = readSrc('src/sections/Education.jsx')
  for (const lit of ['Adhiparasakthi', 'Electronics & Communication', 'CGPA', 'Key Domain Expertise', '2015 – 2020', 'ADAS / 3D Viz']) {
    expect(src, `literal "${lit}"`).not.toContain(lit)
  }
  expect(src).toMatch(/from\s+["'][^"']*data\/education\.js["']/)
})

staticTest('QT-065 Theme supplied through React Context (static inspection)', async () => {
  const ctx = readSrc('src/context/ThemeContext.jsx')
  expect(ctx).toMatch(/export function ThemeProvider/)
  expect(ctx).toMatch(/export function useThemeContext/)
  const nav = readSrc('src/components/layout/Nav.jsx')
  expect(nav).toMatch(/useThemeContext\(\)/)
  const sig = /export default function Nav\(\{([^}]*)\}\)/.exec(nav)
  expect(sig, 'Nav signature').not.toBeNull()
  expect(sig[1]).not.toMatch(/\b(theme|onToggle|toggle)\b/)
  const app = readSrc('src/App.jsx')
  expect(app).toMatch(/<ThemeProvider>/)
  expect(app).not.toMatch(/<Nav[^>]*\b(theme|onToggle)\s*=/)
})

staticTest('QT-073 Registry is the single definition of sections (static inspection)', async () => {
  const skip = (f) => /^(config\/sections\.js|sections\/|data\/)/.test(rel(f))
  const offenders = []
  for (const f of jsFiles().filter((x) => !skip(x))) {
    const s = readFileSync(f, 'utf8')
    if (/["']Certs["']/.test(s)) offenders.push(`${rel(f)}: nav label "Certs"`)
    if (/["']certifications["']/.test(s)) offenders.push(`${rel(f)}: section id "certifications"`)
    if (/["']about["']\s*,\s*["']experience["']/.test(s)) offenders.push(`${rel(f)}: ordered section-id list`)
  }
  expect(offenders).toEqual([])
  const app = readSrc('src/App.jsx')
  expect(app).toMatch(/import\s*\{[^}]*\bSECTIONS\b[^}]*\}\s*from\s*["'][^"']*config\/sections\.js["']/)
  const nav = readSrc('src/components/layout/Nav.jsx')
  // Nav gets its items from the registry via App (items prop) or imports NAV_ITEMS; it defines no labels itself
  expect(nav).not.toMatch(/["'](About|Experience|Skills|Projects|Design|Education|Resume|Contact)["']/)
})

staticTest('QT-082 Entry chunk gzip size does not exceed the baseline', async (testInfo) => {
  const html = readFileSync(join(ROOT, 'dist/index.html'), 'utf8')
  const m = /<script[^>]*type="module"[^>]*src="([^"]+)"/.exec(html)
  expect(m, 'entry script in dist/index.html').not.toBeNull()
  const buf = readFileSync(join(ROOT, 'dist', m[1]))
  const actual = gzipSync(buf, { level: 9 }).length
  const baseline = JSON.parse(readFileSync(join(ROOT, 'tests/qualification/baseline/bundle-baseline.json'), 'utf8')).gzipBytesLevel9
  testInfo.annotations.push({ type: 'entry-gzip-bytes', description: `${actual} (baseline ${baseline})` })
  expect(actual).toBeLessThanOrEqual(baseline)
})

staticTest('QT-101 npm audit of runtime dependencies', async (testInfo) => {
  test.setTimeout(120_000)
  const r = spawnSync('npm', ['audit', '--omit=dev', '--audit-level=high', '--json'], { cwd: ROOT, encoding: 'utf8', timeout: 90_000 })
  let report = null
  try {
    report = JSON.parse(r.stdout)
  } catch {
    /* not JSON */
  }
  const offline = !report || report.error || /ENOTFOUND|ECONNREFUSED|EAI_AGAIN|ETIMEDOUT|audit endpoint|network/i.test(`${r.stdout}${r.stderr}`)
  test.skip(offline, `registry not reachable (offline): ${(r.stderr || '').split('\n')[0]}`)
  expect(r.status).toBe(0)
  const v = report.metadata.vulnerabilities
  expect(v.high + v.critical).toBe(0)
  testInfo.annotations.push({ type: 'npm-audit', description: JSON.stringify(v) })
})

staticTest('QT-102 Module layout and thin composition root', async () => {
  const must = [
    'main.jsx', 'App.jsx', 'config/site.js', 'config/sections.js',
    'models/index.js', 'models/types.js', 'models/createModels.js', 'models/validate.js',
    'data/profile.js', 'data/experience.js', 'data/skills.js', 'data/projects.js', 'data/design.js',
    'data/education.js', 'data/certifications.js', 'data/contact.js',
    'context/ThemeContext.jsx',
    'hooks/useTheme.js', 'hooks/useReveal.js', 'hooks/useActiveSection.js', 'hooks/useScrolled.js',
    'hooks/useTypewriter.js', 'hooks/useParallax.js', 'hooks/usePrefersReducedMotion.js',
    'lib/solar.js', 'lib/random.js', 'lib/storage.js',
    'components/ui/Icon.jsx', 'components/ui/SectionLabel.jsx', 'components/ui/SectionTitle.jsx', 'components/ui/Button.jsx',
    'components/ui/Badge.jsx', 'components/ui/Section.jsx',
    'components/tech/TechIcon.jsx', 'components/tech/iconStrategies.js', 'components/tech/customSvgs.jsx', 'components/tech/SkillChip.jsx',
    'components/effects/GradientOrbs.jsx', 'components/effects/CursorGlow.jsx', 'components/effects/Particles.jsx',
    'components/widgets/Speedometer.jsx',
    'components/layout/Nav.jsx', 'components/layout/Footer.jsx', 'components/layout/Divider.jsx',
    'components/ErrorBoundary.jsx',
    'sections/Hero.jsx', 'sections/About.jsx', 'sections/Experience.jsx', 'sections/Skills.jsx', 'sections/Projects.jsx',
    'sections/Design.jsx', 'sections/Education.jsx', 'sections/Certifications.jsx', 'sections/Resume.jsx', 'sections/Contact.jsx',
    'styles/tokens.css', 'styles/base.css', 'styles/components.css', 'styles/sections.css', 'styles/index.css',
  ]
  expect(must.filter((f) => !existsSync(join(SRC, f)))).toEqual([])
  const app = readSrc('src/App.jsx')
  expect(app).not.toMatch(/<style/)
  expect(app).not.toMatch(/`[^`]*\{[^`]*:[^`]*;[^`]*\}[^`]*`/)
  for (const lit of ['Jeevanandham', 'PixelExpert', 'Lapiz', 'Who I Am', 'Toolbox', 'Career', 'Selected Work', 'Credentials', 'Senior HMI']) {
    expect(app, `content literal "${lit}"`).not.toContain(lit)
  }
  const imports = [...app.matchAll(/from\s+["']([^"']+)["']/g)].map((x) => x[1])
  const allowed = /^(react|\.\/(context|components|config|hooks)\/)/
  expect(imports.filter((i) => !allowed.test(i))).toEqual([])
})

const catOf = (p) => {
  const r = rel(p)
  if (r === 'App.jsx') return 'app'
  if (r === 'main.jsx') return 'main'
  if (r === 'config/site.js') return 'config/site'
  if (r === 'config/sections.js') return 'config/sections'
  if (r === 'components/ErrorBoundary.jsx') return 'errorboundary'
  if (r.startsWith('components/')) return r.split('/').slice(0, 2).join('/')
  if (r.startsWith('styles/')) return 'styles'
  return r.split('/')[0]
}
// SADS 4.3.2: category -> categories it may import (own category / siblings always allowed)
const MAY = {
  models: [],
  lib: ['config/site'],
  'config/site': [],
  data: ['models', 'config/site'],
  'config/sections': ['sections', 'models'],
  hooks: ['lib'],
  context: ['hooks'],
  'components/ui': ['hooks'],
  'components/tech': ['components/ui'],
  'components/effects': ['hooks', 'lib'],
  'components/widgets': ['hooks', 'lib'],
  'components/layout': ['components/ui', 'errorboundary', 'context', 'hooks', 'config/site', 'config/sections'],
  errorboundary: ['components/ui'],
  sections: ['data', 'config/site', 'components/ui', 'components/tech', 'components/widgets', 'components/effects', 'hooks', 'context'],
  app: ['context', 'hooks', 'components/layout', 'components/effects', 'errorboundary', 'components/ui', 'config/sections', 'config/site'],
  main: ['app', 'errorboundary', 'config/site', 'styles'],
}

staticTest('QT-103 One-way dependencies, React-free models and lib', async () => {
  const edges = new Map()
  const violations = []
  for (const f of jsFiles()) {
    const s = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    const specs = [...s.matchAll(/(?:import|export)\s+(?:[^"';]*?\s+from\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1] || m[2])
    const from = catOf(f)
    const deps = []
    for (const spec of specs) {
      if (!spec.startsWith('.')) {
        const pkg = spec.split('/')[0]
        if (['react', 'react-dom'].includes(pkg)) {
          if (['models', 'lib'].includes(from)) violations.push(`${rel(f)} imports ${spec} (React-free layer)`)
          if (pkg === 'react-dom' && from !== 'main') violations.push(`${rel(f)} imports ${spec}`)
        } else violations.push(`${rel(f)} imports unknown package ${spec}`)
        continue
      }
      let target = resolve(dirname(f), spec)
      if (!extname(target)) target += '.js'
      if (extname(target) === '.css') {
        if (from !== 'main' || rel(target) !== 'styles/index.css') violations.push(`${rel(f)} imports CSS ${spec}`)
        continue
      }
      const to = catOf(target)
      deps.push(target)
      if ((rel(target) === 'App.jsx' && from !== 'main') || rel(target) === 'main.jsx') violations.push(`${rel(f)} imports ${rel(target)} (upward)`)
      if (to !== from && !(MAY[from] || []).includes(to)) violations.push(`${rel(f)} [${from}] -> ${rel(target)} [${to}] not allowed by SADS 4.3.2`)
    }
    edges.set(f, deps)
  }
  // cycle detection
  const state = new Map()
  const cycles = []
  const dfs = (n, stack) => {
    state.set(n, 1)
    for (const d of edges.get(n) || []) {
      if (state.get(d) === 1) cycles.push([...stack, n, d].map(rel).join(' -> '))
      else if (!state.has(d)) dfs(d, [...stack, n])
    }
    state.set(n, 2)
  }
  for (const n of edges.keys()) if (!state.has(n)) dfs(n, [])
  expect.soft(cycles, 'import cycles').toEqual([])
  expect.soft(violations).toEqual([])
})

// ---------- CSS extraction / normalisation (QT-104) ----------
function normalise(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};:,>+~])\s*/g, '$1').replace(/;}/g, '}').trim()
}
function blocks(css) {
  // flat list of "context|selector{decls}"; @media wraps, @keyframes/@font-face kept whole
  const out = []
  const src = normalise(css)
  const readBlock = (start) => {
    let depth = 0
    for (let j = start; j < src.length; j++) {
      if (src[j] === '{') depth++
      else if (src[j] === '}') {
        depth--
        if (depth === 0) return j
      }
    }
    return src.length - 1
  }
  const parse = (from, to, ctx) => {
    let p = from
    while (p < to) {
      const open = src.indexOf('{', p)
      if (open === -1 || open >= to) break
      const header = src.slice(p, open)
      const close = readBlock(open)
      const body = src.slice(open + 1, close)
      if (/^@(media|supports)/.test(header)) parse(open + 1, close, `${ctx}${header}|`)
      else out.push(`${ctx}${header}{${body}}`)
      p = close + 1
    }
  }
  parse(0, src.length, '')
  return out
}

// Release 1 amendments (allowed differences vs baseline): DEF-012 adds -webkit-backdrop-filter pairs (NFR-PORT-001);
// DEF-021 changes the text colour of .exp-company-loc and .contact-loc to meet 4.5:1 (NFR-A11Y-006).
const relaxBlock = (b) => {
  let x = b.replace(/([{;])-webkit-backdrop-filter:[^;}]*/g, '$1')
  if (/(^|\|)\.(exp-company-loc|contact-loc)\{/.test(x)) x = x.replace(/([{;])color:[^;}]*/g, '$1')
  return x.replace(/;{2,}/g, ';').replace(/\{;/g, '{').replace(/;\}/g, '}')
}

test('QT-104 CSS moved unchanged and no runtime style injection', async ({ page }, testInfo) => {
  only(testInfo, 'S')
  const baseApp = execFileSync('git', ['show', 'dd9a86d:src/App.jsx'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 })
  const start = baseApp.indexOf('const CSS = `') + 'const CSS = `'.length
  const baseCss = baseApp.slice(start, baseApp.indexOf('`;', start))
  expect(baseCss.length).toBeGreaterThan(10_000)
  const index = readSrc('src/styles/index.css')
  const imports = [...index.matchAll(/@import\s+["']\.\/([^"']+)["']/g)].map((m) => m[1])
  expect(imports).toEqual(['tokens.css', 'base.css', 'components.css', 'sections.css'])
  const newCss = imports.map((f) => readSrc(`src/styles/${f}`)).join('\n')
  const allow = [/^\.skip-link(:focus)?\{/, /^:focus-visible\{/, /^a:focus-visible,button:focus-visible\{/, /^:focus:not\(:focus-visible\)\{/]
  const added = (b) => allow.some((r) => r.test(b.replace(/^.*\|/, '')))
  const base = blocks(baseCss).map(relaxBlock)
  const cur = blocks(newCss).filter((b) => !added(b)).map(relaxBlock)
  const count = (arr) => arr.reduce((m, b) => m.set(b, (m.get(b) || 0) + 1), new Map())
  const cb = count(base)
  const cc = count(cur)
  const missing = [...cb].filter(([b, n]) => (cc.get(b) || 0) < n).map(([b]) => b.slice(0, 120))
  const extra = [...cc].filter(([b, n]) => (cb.get(b) || 0) < n).map(([b]) => b.slice(0, 120))
  expect({ missing, extra }).toEqual({ missing: [], extra: [] })
  // relative order of rules sharing a selector
  const bySel = (arr) => {
    const m = new Map()
    for (const b of arr) {
      const k = b.slice(0, b.indexOf('{'))
      m.set(k, [...(m.get(k) || []), b])
    }
    return m
  }
  const sb = bySel(base)
  const sc = bySel(cur)
  const reordered = [...sb].filter(([k, v]) => JSON.stringify(v) !== JSON.stringify(sc.get(k))).map(([k]) => k)
  expect(reordered).toEqual([])
  // runtime: no <style> created by the app
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort())
  await page.goto('/')
  await page.waitForSelector('#hero')
  const styleTags = await page.evaluate(() => document.querySelectorAll('style').length)
  expect(styleTags).toBe(0)
})

staticTest('QT-105 Lint passes', async (testInfo) => {
  test.setTimeout(180_000)
  const r = spawnSync('npm', ['run', 'lint'], { cwd: ROOT, encoding: 'utf8', timeout: 170_000 })
  const out = `${r.stdout}\n${r.stderr}`
  const warnings = /(\d+) warnings?/.exec(out)
  if (warnings) testInfo.annotations.push({ type: 'lint-warnings', description: warnings[0] })
  expect(r.status, out.slice(-1500)).toBe(0)
})

staticTest('QT-106 Coverage thresholds enforced and met', async () => {
  const cfg = readFileSync(join(ROOT, 'vitest.config.js'), 'utf8')
  expect(cfg, 'coverage.thresholds configured').toMatch(/thresholds/)
  expect(cfg).toMatch(/lines:\s*80/)
  for (const g of ['src/models/**', 'src/lib/**', 'src/hooks/**']) expect(cfg, g).toContain(g)
  expect((cfg.match(/lines:\s*90/g) || []).length).toBeGreaterThanOrEqual(3)
  const sumPath = join(ROOT, 'coverage/coverage-summary.json')
  expect(existsSync(sumPath), 'coverage/coverage-summary.json').toBe(true)
  const sum = JSON.parse(readFileSync(sumPath, 'utf8'))
  expect(sum.total.lines.pct).toBeGreaterThanOrEqual(80)
  const group = (dir) => {
    const files = Object.entries(sum).filter(([k]) => k !== 'total' && k.includes(`/src/${dir}/`))
    expect(files.length, dir).toBeGreaterThan(0)
    const t = files.reduce((a, [, v]) => ({ covered: a.covered + v.lines.covered, total: a.total + v.lines.total }), { covered: 0, total: 0 })
    return (t.covered / t.total) * 100
  }
  for (const d of ['models', 'lib', 'hooks']) expect(group(d), `${d} line coverage`).toBeGreaterThanOrEqual(90)
})

staticTest('QT-107 JSDoc typedefs and factory signatures', async () => {
  const types = readSrc('src/models/types.js')
  const defined = new Set([...types.matchAll(/@typedef\s+(?:\{[^}]*(?:\{[^}]*\}[^}]*)*\}\s+)?(\w+)/g)].map((m) => m[1]))
  const need = ['Profile', 'Photo', 'Stat', 'GaugeStat', 'Section', 'Experience', 'SkillCategory', 'Skill', 'Project', 'DesignCard', 'Education', 'Certification', 'ContactLink', 'ResumeInfo', 'ResumeSkill', 'Highlight']
  expect(need.filter((n) => !defined.has(n)), `typedefs missing (found: ${[...defined].join(', ')})`).toEqual([])
  const cm = readSrc('src/models/createModels.js')
  const missing = []
  for (const m of cm.matchAll(/export function (create\w+)/g)) {
    const before = cm.slice(0, m.index)
    const doc = before.slice(before.lastIndexOf('/**'))
    if (!(before.trimEnd().endsWith('*/') && /@param/.test(doc) && /@returns?/.test(doc))) missing.push(m[1])
  }
  expect(missing, 'factories without @param/@returns').toEqual([])
})

staticTest('QT-108 Only react and react-dom as runtime dependencies', async () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
  expect(Object.keys(pkg.dependencies).sort()).toEqual(['react', 'react-dom'])
})

staticTest('QT-112 Cross-browser support (Chromium automated, others demonstrated)', async (testInfo) => {
  const missing = []
  for (const f of readdirSync(join(SRC, 'styles')).filter((n) => n.endsWith('.css'))) {
    const css = readSrc(`src/styles/${f}`).replace(/\/\*[\s\S]*?\*\//g, '')
    for (const m of css.matchAll(/\{([^{}]*)\}/g)) {
      const decls = m[1].split(';').map((d) => d.trim()).filter(Boolean)
      const get = (name) => decls.filter((d) => d.startsWith(`${name}:`)).map((d) => d.slice(name.length + 1).trim())
      for (const v of get('backdrop-filter')) {
        if (!get('-webkit-backdrop-filter').includes(v)) missing.push(`${f}: backdrop-filter: ${v} (block "${m[1].trim().slice(0, 50)}...")`)
      }
    }
  }
  expect(missing).toEqual([])
  testInfo.annotations.push({ type: 'manual', description: 'Firefox/Safari/Edge/iOS/Android demonstration checklist is recorded in TEST_REPORT' })
})

staticTest('QT-121 StrictMode correctness (analysis of IT evidence)', async () => {
  test.setTimeout(180_000)
  const main = readSrc('src/main.jsx')
  expect(main).toMatch(/<StrictMode>[\s\S]*<\/StrictMode>/)
  const out = join(mkdtempSync(join(tmpdir(), 'qt121-')), 'vitest.json')
  spawnSync('npx', ['vitest', 'run', 'tests/integration/strict.test.jsx', '--reporter=json', `--outputFile=${out}`], { cwd: ROOT, encoding: 'utf8', timeout: 170_000 })
  expect(existsSync(out), 'vitest JSON report').toBe(true)
  const rep = JSON.parse(readFileSync(out, 'utf8'))
  const tests = rep.testResults.flatMap((f) => f.assertionResults)
  expect(tests.length).toBeGreaterThan(0)
  const strict = tests.filter((t) => /strict/i.test(t.fullName || t.title))
  expect(strict.length).toBeGreaterThan(0)
  for (const t of strict) expect(t.status, t.fullName).toBe('passed')
})

staticTest('QT-126 Static build output with root base', async () => {
  const vite = readFileSync(join(ROOT, 'vite.config.js'), 'utf8')
  expect(vite.match(/base:\s*['"]([^'"]*)['"]/)?.[1] ?? '/').toBe('/')
  for (const f of ['index.html', 'Jeevanandham_Resume.pdf', 'profile.webp', 'profile-og.jpg', 'favicon.svg']) {
    expect(existsSync(join(ROOT, 'dist', f)), `dist/${f}`).toBe(true)
  }
  const html = readFileSync(join(ROOT, 'dist/index.html'), 'utf8')
  const urls = [...html.matchAll(/(?:src|href)="(\/?assets\/[^"]+)"/g)].map((m) => m[1])
  expect(urls.length).toBeGreaterThan(0)
  for (const u of urls) expect(u.startsWith('/assets/'), u).toBe(true)
})

staticTest('QT-127 Deploy script unchanged', async () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
  expect(pkg.scripts.deploy).toBe('gh-pages -d dist')
  expect(Object.keys(pkg.devDependencies)).toContain('gh-pages')
})

staticTest('QT-128 CI workflow gates lint, test and build', async () => {
  const ci = readFileSync(join(ROOT, '.github/workflows/ci.yml'), 'utf8')
  expect(ci).toMatch(/push:\s*\n\s*branches:\s*\[main\]/)
  expect(ci).toMatch(/\n\s*pull_request:/)
  expect(ci).toMatch(/node-version:\s*22/)
  expect(ci).not.toMatch(/continue-on-error/)
  const runs = [...ci.matchAll(/^\s*-?\s*run:\s*(.+)$/gm)].map((m) => m[1].trim())
  const idx = ['npm ci', 'npm run lint', 'npm test', 'npm run build'].map((c) => runs.indexOf(c))
  expect(idx.every((i) => i >= 0), `steps present: ${runs.join(' | ')}`).toBe(true)
  expect([...idx].sort((a, b) => a - b)).toEqual(idx)
})

staticTest('QT-129 Qualification tests run in CI against vite preview', async () => {
  const ci = readFileSync(join(ROOT, '.github/workflows/ci.yml'), 'utf8')
  expect(ci).toMatch(/playwright install[^\n]*chromium/)
  expect(ci).toMatch(/npm run test:qualification/)
  expect(ci).toMatch(/upload-artifact/)
  const cfg = readFileSync(join(ROOT, 'playwright.config.js'), 'utf8')
  expect(cfg).toMatch(/npm run build && npx vite preview --port \$\{PORT\}/)
  expect(cfg).toMatch(/PORT\s*=\s*4173/)
})

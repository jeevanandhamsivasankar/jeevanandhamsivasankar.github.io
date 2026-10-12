import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const BASELINE_COMMIT = 'dd9a86d'
// ADR-020 additions (skip link and keyboard focus indicator) are the only allowed new rule groups.
const ALLOWED_NEW = [/skip-link/, /:focus-visible/, /:focus:not\(/]

const norm = (s) => s.replace(/\s+/g, ' ').replace(/\s*([{}:;,>+~])\s*/g, '$1').replace(/;}/g, '}').trim()

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

/** Flatten CSS into [{ctx, selector, body}] in source order (at-rules become context). */
function parseRules(css, ctx = '') {
  const out = []
  let i = 0
  const text = stripComments(css)
  const len = text.length
  while (i < len) {
    const open = text.indexOf('{', i)
    const semi = text.indexOf(';', i)
    if (open === -1) break
    if (semi !== -1 && semi < open && text.slice(i, semi).trim().startsWith('@')) {
      i = semi + 1 // statement at-rule such as @import
      continue
    }
    const prelude = norm(text.slice(i, open))
    let depth = 1
    let j = open + 1
    while (j < len && depth > 0) {
      if (text[j] === '{') depth += 1
      else if (text[j] === '}') depth -= 1
      j += 1
    }
    const inner = text.slice(open + 1, j - 1)
    if (prelude.startsWith('@') && /\{/.test(inner)) {
      out.push(...parseRules(inner, ctx ? `${ctx} ${prelude}` : prelude))
    } else {
      const body = norm(inner)
      if (prelude.startsWith('@font-face') || prelude.startsWith('@')) {
        out.push({ ctx, selector: prelude, body })
      } else {
        out.push({ ctx, selector: prelude, body })
      }
    }
    i = j
  }
  return out
}

function baselineCss() {
  const src = execSync(`git show ${BASELINE_COMMIT}:src/App.jsx`, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
  const m = src.match(/const CSS = `([\s\S]*?)`;\n/)
  if (!m) throw new Error('baseline CSS template not found')
  return m[1]
}

function candidateCss() {
  const dir = path.resolve('src/styles')
  const index = fs.readFileSync(path.join(dir, 'index.css'), 'utf8')
  const files = [...index.matchAll(/@import\s+["']\.\/([^"']+)["']/g)].map((m) => m[1])
  expect(files).toEqual(['tokens.css', 'base.css', 'components.css', 'sections.css'])
  return files.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n')
}

const key = (r) => `${r.ctx}|${r.selector}`
const full = (r) => `${key(r)}{${r.body}}`

describe('CSS equivalence with the baseline (ARC-017, ARC-001)', () => {
  it('IT-039 CSS equivalence with the baseline CSS string', () => {
    const base = parseRules(baselineCss())
    const cand = parseRules(candidateCss())
    expect(base.length).toBeGreaterThan(300)

    const isAllowed = (r) => ALLOWED_NEW.some((re) => re.test(r.selector))
    const candCore = cand.filter((r) => !isAllowed(r))

    // multiset of complete rules (selector + declarations)
    const count = (rules) => {
      const m = new Map()
      for (const r of rules) m.set(full(r), (m.get(full(r)) ?? 0) + 1)
      return m
    }
    const bm = count(base)
    const cm = count(candCore)
    const missing = []
    const extra = []
    for (const [k, n] of bm) if ((cm.get(k) ?? 0) < n) missing.push(k.slice(0, 160))
    for (const [k, n] of cm) if ((bm.get(k) ?? 0) < n) extra.push(k.slice(0, 160))
    expect({ missing, extra }).toEqual({ missing: [], extra: [] })

    // per-selector declaration order (cascade) is preserved
    const seq = (rules) => {
      const m = new Map()
      for (const r of rules) m.set(key(r), [...(m.get(key(r)) ?? []), r.body])
      return m
    }
    const bs = seq(base)
    const cs = seq(candCore)
    const orderDiffs = []
    for (const [k, bodies] of bs) {
      if (JSON.stringify(bodies) !== JSON.stringify(cs.get(k))) orderDiffs.push(k)
    }
    expect(orderDiffs).toEqual([])
  })
})

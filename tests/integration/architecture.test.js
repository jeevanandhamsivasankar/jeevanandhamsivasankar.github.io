import fs from 'node:fs'
import path from 'node:path'

const SRC = path.resolve('src')

/* ---- layer classification (SADS section 4.3.2) ---- */
function layerOf(rel) {
  if (rel === 'App.jsx') return 'app'
  if (rel === 'main.jsx') return 'main'
  if (rel === 'config/site.js') return 'config-site'
  if (rel === 'config/sections.js') return 'config-sections'
  if (rel === 'components/ErrorBoundary.jsx') return 'error-boundary'
  if (rel.startsWith('styles/')) return 'styles'
  if (rel.startsWith('components/ui/')) return 'ui'
  if (rel.startsWith('components/tech/')) return 'tech'
  if (rel.startsWith('components/effects/')) return 'effects'
  if (rel.startsWith('components/widgets/')) return 'widgets'
  if (rel.startsWith('components/layout/')) return 'layout'
  const top = rel.split('/')[0]
  return top // models, lib, data, hooks, context, sections
}

const ALLOWED = {
  models: ['models'],
  lib: ['lib'],
  'config-site': [],
  data: ['models', 'config-site'],
  'config-sections': ['sections'],
  hooks: ['lib', 'hooks'],
  context: ['hooks', 'context'],
  ui: ['hooks', 'ui'],
  tech: ['ui', 'tech'],
  effects: ['hooks', 'lib', 'effects'],
  widgets: ['hooks', 'lib', 'widgets'],
  layout: ['ui', 'context', 'hooks', 'config-site', 'layout'],
  'error-boundary': ['ui'],
  sections: ['data', 'config-site', 'ui', 'tech', 'widgets', 'effects', 'hooks', 'context'],
  app: ['context', 'layout', 'effects', 'error-boundary', 'ui', 'config-sections', 'config-site'],
  main: ['app', 'error-boundary', 'styles'],
}
const FORBIDS_REACT = new Set(['models', 'lib', 'config-site', 'data']) // pure layers: no React, no packages

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (/\.(js|jsx)$/.test(e.name)) out.push(p)
  }
  return out
}

function importsOf(source) {
  const specs = []
  source = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  const re = /(?:import|export)\s+(?:[^'"()]*?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g
  for (const m of source.matchAll(re)) specs.push(m[1] ?? m[2])
  return specs
}

function resolveSpec(fromFile, spec) {
  if (!spec.startsWith('.')) return null
  const base = path.resolve(path.dirname(fromFile), spec)
  for (const cand of [base, `${base}.js`, `${base}.jsx`, path.join(base, 'index.js')]) {
    if (fs.existsSync(cand) && fs.statSync(cand).isFile()) return cand
  }
  return base
}

function buildGraph() {
  const files = walk(SRC)
  const graph = new Map()
  const external = new Map()
  for (const f of files) {
    const rel = path.relative(SRC, f).split(path.sep).join('/')
    const src = fs.readFileSync(f, 'utf8')
    const edges = []
    const ext = []
    for (const spec of importsOf(src)) {
      const target = resolveSpec(f, spec)
      if (target === null) ext.push(spec)
      else if (!/\.css$/.test(target)) edges.push(path.relative(SRC, target).split(path.sep).join('/'))
    }
    graph.set(rel, edges)
    external.set(rel, ext)
  }
  return { files, graph, external }
}

function findCycles(graph) {
  const cycles = []
  const state = new Map()
  const stack = []
  const visit = (n) => {
    state.set(n, 1)
    stack.push(n)
    for (const m of graph.get(n) ?? []) {
      if (!graph.has(m)) continue
      if (state.get(m) === 1) cycles.push([...stack.slice(stack.indexOf(m)), m].join(' -> '))
      else if (!state.has(m)) visit(m)
    }
    stack.pop()
    state.set(n, 2)
  }
  for (const n of graph.keys()) if (!state.has(n)) visit(n)
  return cycles
}

describe('architecture rules (ARC-019, ARC-020, ARC-005, ARC-007)', () => {
  it('IT-038 dependency-rule and layering test', () => {
    const { graph, external } = buildGraph()
    expect(graph.size).toBeGreaterThan(50)

    // folder dependency table
    const violations = []
    for (const [rel, edges] of graph) {
      const from = layerOf(rel)
      if (from === 'styles') continue
      const allowed = ALLOWED[from]
      if (!allowed) {
        violations.push(`${rel}: unclassified layer "${from}"`)
        continue
      }
      for (const e of edges) {
        const to = layerOf(e)
        if (to === from && from !== 'app' && from !== 'main') continue
        if (!allowed.includes(to)) violations.push(`${rel} (${from}) -> ${e} (${to})`)
      }
    }
    expect(violations, 'SADS 4.3.2 table violations').toEqual([])

    // models/ and lib/ (and data/, config/site.js) import no React or other packages
    const reactViolations = []
    for (const [rel, ext] of external) {
      if (FORBIDS_REACT.has(layerOf(rel)) && ext.length > 0) reactViolations.push(`${rel}: ${ext.join(', ')}`)
    }
    expect(reactViolations, 'framework-free layers').toEqual([])

    // R-NO-UPWARD
    const upward = []
    for (const [rel, edges] of graph) {
      for (const e of edges) {
        if ((e === 'App.jsx' && rel !== 'main.jsx') || e === 'main.jsx') upward.push(`${rel} -> ${e}`)
      }
    }
    expect(upward, 'R-NO-UPWARD').toEqual([])

    // R-ACYCLIC
    expect(findCycles(graph), 'R-ACYCLIC').toEqual([])

    // R-DEFAULT-EXPORT
    const sectionFiles = [...graph.keys()].filter((r) => r.startsWith('sections/'))
    expect(sectionFiles.length).toBe(10)
    const exportViolations = []
    for (const rel of sectionFiles) {
      const src = fs.readFileSync(path.join(SRC, rel), 'utf8')
      const defaults = src.match(/^export\s+default\b/gm) ?? []
      const others = src.match(/^export\s+(?!default\b)/gm) ?? []
      if (defaults.length !== 1) exportViolations.push(`${rel}: ${defaults.length} default exports`)
      if (others.length > 0) exportViolations.push(`${rel}: ${others.length} named export(s)`)
      if (!/^export\s+default\s+function\s+[A-Z]/m.test(src)) exportViolations.push(`${rel}: default export is not a named component function`)
    }
    expect(exportViolations, 'R-DEFAULT-EXPORT').toEqual([])
  })
})

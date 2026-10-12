import { cascadeCss, compact, parse, parseStyle, readFixture } from '../../utils/css.js'

function signature(root) {
  const out = []
  root.walkRules((rule) => {
    const at = []
    for (let p = rule.parent; p && p.type !== 'root'; p = p.parent) at.unshift(`${p.name} ${p.params}`)
    const decls = []
    rule.each((n) => n.type === 'decl' && decls.push(`${n.prop}:${compact(n.value)}${n.important ? '!' : ''}`))
    out.push(`${at.join('>')}|${rule.selectors.map(compact).join(',')}|${decls.join(';')}`)
  })
  return out
}

describe('UNIT-STYLE_INDEX', () => {
  it('UT-STYLE_INDEX-001 exactly eleven @imports in cascade order (Sprint 2) and no rules', () => {
    const r = parseStyle('index')
    const nodes = r.nodes.filter((n) => n.type !== 'comment')
    expect(nodes.every((n) => n.type === 'atrule' && n.name === 'import')).toBe(true)
    expect(nodes.map((n) => n.params.replace(/["']/g, ''))).toEqual([
      './tokens.css',
      './motion.css',
      './base.css',
      './components.css',
      './sections.css',
      './hero.css',
      './cluster.css',
      './intro.css',
      './theme-transition.css',
      './projects.css',
      './media.css',
    ])
    let rules = 0
    r.walkRules(() => (rules += 1))
    expect(rules).toBe(0)
  })

  it('UT-STYLE_INDEX-002 (SUDS 6.15) concatenated files equal the Sprint 2 approved baseline rules, in order (NFR-MAINT-009)', () => {
    const mine = signature(parse(cascadeCss()))
    const base = signature(parse(readFixture('baseline-css-s2.txt')))
    expect(base.length).toBeGreaterThan(300)
    expect(mine.filter((sig) => !base.includes(sig))).toEqual([])
    expect(base.filter((sig) => !mine.includes(sig))).toEqual([])
    expect(mine).toEqual(base)
  })
})

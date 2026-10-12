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

// Release 1 amendments (allowed differences vs baseline): DEF-012 -webkit-backdrop-filter pairs; DEF-021 colour of
// .exp-company-loc / .contact-loc.
function relax(sig) {
  const [at, sel, decls] = sig.split('|')
  const keep = decls
    .split(';')
    .filter((d) => !d.startsWith('-webkit-backdrop-filter:'))
    .filter((d) => !(/^(\.exp-company-loc|\.contact-loc)$/.test(sel) && d.startsWith('color:')))
  return `${at}|${sel}|${keep.join(';')}`
}

describe('UNIT-STYLE_INDEX', () => {
  it('UT-STYLE_INDEX-001 exactly four @imports in order tokens, base, components, sections and no rules', () => {
    const r = parseStyle('index')
    const nodes = r.nodes.filter((n) => n.type !== 'comment')
    expect(nodes.every((n) => n.type === 'atrule' && n.name === 'import')).toBe(true)
    expect(nodes.map((n) => n.params.replace(/["']/g, ''))).toEqual([
      './tokens.css',
      './base.css',
      './components.css',
      './sections.css',
    ])
    let rules = 0
    r.walkRules(() => (rules += 1))
    expect(rules).toBe(0)
  })

  it('UT-STYLE_INDEX-002 (SUDS 6.15) concatenated files keep every baseline rule in order; only skip-link/focus rules are added', () => {
    const mine = signature(parse(cascadeCss())).map(relax)
    const base = signature(parse(readFixture('baseline-css.txt'))).map(relax)
    const missing = base.filter((sig) => !mine.includes(sig))
    expect(missing).toEqual([])
    const extra = mine.filter((sig) => !base.includes(sig))
    // DEF-020 adds two overflow guards in @media (max-width: 540px)
    extra.forEach((sig) => expect(sig).toMatch(/skip-link|focus|540px\)\|\.(exp-header|contact-item)\|/))
    // relative order of baseline rules is preserved
    const idx = base.map((sig) => mine.indexOf(sig))
    expect([...idx].sort((a, b) => a - b)).toEqual(idx)
  })
})

import { readFileSync } from 'node:fs'
import postcss from 'postcss'

const css = readFileSync('src/styles/sections.css', 'utf8')
const root = postcss.parse(css)

describe('IT-058 sections.css cleanup and token usage', () => {
  it('IT-058 no raw ms/s in transitions or animations (infinite loops exempt)', () => {
    const bad = []
    root.walkDecls(/^(transition|animation)(-duration|-delay)?$/, (d) => {
      if (/\binfinite\b/.test(d.value)) return
      if (/(^|[\s,])\d*\.?\d+m?s\b/.test(d.value.replace(/var\([^)]*\)/g, ''))) bad.push(`${d.prop}: ${d.value}`)
    })
    expect(bad).toEqual([])
  })
  it('IT-058 no transition: all and no layout-property transitions', () => {
    root.walkDecls(/^transition(-property)?$/, (d) => {
      expect(d.value).not.toMatch(/\ball\b/)
      expect(d.value).not.toMatch(/\b(width|height|top|left|right|bottom|margin|padding|gap)\b/)
    })
  })
  it('IT-058 dead hero, gauge, profile and project rules are removed', () => {
    const dead = /\.(hero|gauge|hring|profile|project|ptag2|pico|status-dot|corner|scan\b)/
    const hits = []
    root.walkRules((r) => { if (dead.test(r.selector)) hits.push(r.selector) })
    expect(hits).toEqual([])
  })
  it('IT-058 no duplicate selectors outside media queries; hover lifts are <= 4px', () => {
    const seen = new Map()
    root.walkRules((r) => {
      if (r.parent.type !== 'root') return
      seen.set(r.selector, (seen.get(r.selector) || 0) + 1)
    })
    expect([...seen].filter(([, n]) => n > 1).map(([s]) => s)).toEqual([])
    for (const m of css.matchAll(/translateY\(-(\d+(?:\.\d+)?)px\)/g)) expect(Number(m[1])).toBeLessThanOrEqual(4)
  })
  it('IT-058 reveal uses --dur-slow and --ease-decel with stagger step <= 60ms', () => {
    let value = ''
    root.walkRules(/^\.reveal$/, (r) => r.walkDecls('transition', (d) => { value = d.value }))
    expect(value).toContain('var(--dur-slow)')
    expect(value).toContain('var(--ease-decel)')
    expect(css).toMatch(/--stagger-step:\s*60ms/)
  })
})

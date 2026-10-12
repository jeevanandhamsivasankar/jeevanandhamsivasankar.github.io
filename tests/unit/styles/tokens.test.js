import { cascadeCss, compact, declsFor, parse, parseStyle, readFixture } from '../../utils/css.js'

const root = () => parseStyle('tokens')

describe('UNIT-STYLE_TOKENS', () => {
  it('UT-STYLE_TOKENS-001 :root night tokens', () => {
    const d = declsFor(root(), ':root')
    expect(d).toMatchObject({
      '--bg': '#060c18',
      '--amber': '#f59e0b',
      '--cyan': '#22d3ee',
      '--green': '#34d399',
      '--rose': '#fb7185',
      '--violet': '#a78bfa',
      '--text': '#e2e8f0',
    })
  })

  it('UT-STYLE_TOKENS-002 [data-theme="day"] overrides', () => {
    const d = declsFor(root(), '[data-theme="day"]')
    expect(d).toMatchObject({
      '--bg': '#fef9f0',
      '--amber': '#b45309',
      '--cyan': '#0369a1',
      '--green': '#15803d',
      '--rose': '#be123c',
      '--violet': '#6d28d9',
      '--text': '#1e293b',
    })
  })

  it('UT-STYLE_TOKENS-003 contains only :root and [data-theme="day"] blocks; token set equals the baseline set', () => {
    const r = root()
    const selectors = []
    r.each((n) => {
      if (n.type === 'rule') selectors.push(n.selector)
      else expect(n.type).toBe('comment')
    })
    expect(selectors).toEqual([':root', '[data-theme="day"]'])
    r.walkDecls((d) => expect(d.prop.startsWith('--')).toBe(true))

    const base = parse(readFixture('baseline-css.txt'))
    for (const sel of [':root', '[data-theme="day"]']) {
      const mine = declsFor(r, sel)
      const theirs = declsFor(base, sel)
      expect(Object.keys(mine).sort()).toEqual(Object.keys(theirs).sort())
      for (const k of Object.keys(theirs)) expect(compact(mine[k])).toBe(compact(theirs[k]))
    }
    expect(cascadeCss()).toContain('--bg')
  })
})

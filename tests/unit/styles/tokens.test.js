import { cascadeCss, declsFor, parse, parseStyle, readFixture } from '../../utils/css.js'

// Sprint 2 (US-201, FR-UX-001/002): semantic tokens v2 with v1 names kept as aliases.
const root = () => parseStyle('tokens')
const ALIAS_SEL = ':root, [data-theme="day"]'
const firstFamily = (v) => v.split(',')[0].replace(/["']/g, '').trim()

describe('UNIT-STYLE_TOKENS', () => {
  it('UT-STYLE_TOKENS-001 :root night tokens', () => {
    const d = declsFor(root(), ':root')
    expect(d).toMatchObject({
      '--color-bg': '#060c18',
      '--color-text': '#e2e8f0',
      '--color-accent': '#f59e0b',
      '--color-focus': '#f59e0b',
      '--color-success': '#34d399',
      // FR-UX-002: brand signal values equal v1.1
      '--sig-amber': '#f59e0b',
      '--sig-cyan': '#22d3ee',
      '--sig-green': '#34d399',
      '--sig-rose': '#fb7185',
      '--sig-violet': '#a78bfa',
    })
    for (const k of ['--target-min', '--font-mono', '--font-sans', '--font-disp', '--color-surface', '--color-border-control']) {
      expect(d, k).toHaveProperty(k)
    }
  })

  it('UT-STYLE_TOKENS-002 [data-theme="day"] overrides', () => {
    const d = declsFor(root(), '[data-theme="day"]')
    expect(d).toMatchObject({
      '--color-bg': '#fef9f0',
      '--color-text': '#1e293b',
      // day amber and green darkened for contrast (NFR-A11Y-010); v1.1 day cyan, violet and rose kept
      '--sig-amber': '#a14a06',
      '--sig-cyan': '#0369a1',
      '--sig-green': '#047857',
      '--sig-violet': '#6d28d9',
      '--sig-rose': '#be123c',
      '--color-focus': '#a14a06',
    })
  })

  it('UT-STYLE_TOKENS-003 only :root, [data-theme="day"] and the v1 alias block; every v1.1 token still resolves; fonts unchanged', () => {
    const r = root()
    const selectors = []
    r.each((n) => {
      if (n.type === 'rule') selectors.push(n.selector.replace(/\s+/g, ' '))
      else expect(n.type).toBe('comment')
    })
    expect(selectors).toEqual([':root', '[data-theme="day"]', ALIAS_SEL])
    r.walkDecls((d) => expect(d.prop.startsWith('--')).toBe(true))

    // FR-UX-001: all v1 token names remain, as aliases or declarations
    const base = parse(readFixture('baseline-css.txt'))
    const declared = new Set([
      ...Object.keys(declsFor(r, ':root')),
      ...Object.keys(declsFor(r, '[data-theme="day"]')),
      ...Object.keys(declsFor(r, ALIAS_SEL)),
    ])
    const v1Names = Object.keys(declsFor(base, ':root'))
    expect(v1Names.length).toBeGreaterThan(10)
    expect(v1Names.filter((k) => !declared.has(k))).toEqual([])
    // aliases reference semantic tokens (no hard-coded colour)
    for (const [k, v] of Object.entries(declsFor(r, ALIAS_SEL))) expect(v, k).toMatch(/^var\(--/)

    // FR-UX-002: font families unchanged (primary family names)
    const d = declsFor(r, ':root')
    const b = declsFor(base, ':root')
    expect(firstFamily(d['--font-mono'])).toBe(firstFamily(b['--mono']))
    expect(firstFamily(d['--font-sans'])).toBe(firstFamily(b['--sans']))
    expect(firstFamily(d['--font-disp'])).toBe(firstFamily(b['--disp']))
    expect(cascadeCss()).toContain('--color-bg')
  })
})

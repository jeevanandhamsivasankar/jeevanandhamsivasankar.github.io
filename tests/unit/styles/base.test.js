import { cascadeCss, compact, declsFor, parse, parseStyle, rulesFor } from '../../utils/css.js'

const base = () => parseStyle('base')
const all = () => parse(cascadeCss())

describe('UNIT-STYLE_BASE', () => {
  it('UT-STYLE_BASE-001 reduced-motion block: durations, iteration-count (!important), scroll-behavior auto, particles/cursor hidden', () => {
    // NOTE: STP places the block in base.css, SUDS 6.15 keeps it last in sections.css; the cascade is checked.
    const root = all()
    let block = null
    root.walkAtRules('media', (a) => {
      if (a.params.includes('prefers-reduced-motion')) block = a
    })
    expect(block).not.toBeNull()
    const blk = parse(block.toString())
    const star = declsFor(blk, '*, *::before, *::after'.split(',')[0].trim(), { media: block.params })
    expect(star['animation-duration']).toBe('0.01ms !important')
    expect(star['animation-iteration-count']).toBe('1 !important')
    expect(star['transition-duration']).toBe('0.01ms !important')
    expect(declsFor(blk, 'html', { media: block.params })['scroll-behavior']).toBe('auto')
    expect(declsFor(blk, '.particle', { media: block.params }).display).toBe('none !important')
    expect(declsFor(blk, '.cursor-glow', { media: block.params }).display).toBe('none !important')
    // and it is the last at-rule of the cascade (nothing overrides it)
    const last = root.last
    expect(last.type === 'atrule' && last.params.includes('prefers-reduced-motion')).toBe(true)
  })

  it('UT-STYLE_BASE-002 html { scroll-behavior: smooth }', () => {
    expect(declsFor(base(), 'html')['scroll-behavior']).toBe('smooth')
  })

  it('UT-STYLE_BASE-003 .reveal hidden state, .reveal.visible resets, .d1/.d2/.d3 delays', () => {
    const r = all()
    const rev = declsFor(r, '.reveal')
    expect(rev.opacity).toBe('0')
    expect(compact(rev.transform)).toBe('translateY(30px)')
    const vis = declsFor(r, '.reveal.visible')
    expect(vis.opacity).toBe('1')
    expect(compact(vis.transform)).toMatch(/^translateY\(0(px)?\)$/)
    expect(declsFor(r, '.d1')['transition-delay']).toMatch(/^0\.1s( !important)?$/)
    expect(declsFor(r, '.d2')['transition-delay']).toMatch(/^0\.2s( !important)?$/)
    expect(declsFor(r, '.d3')['transition-delay']).toMatch(/^0\.3s( !important)?$/)
  })

  it('UT-STYLE_BASE-004 html/body transitions: background 1.2s, colour 0.6s', () => {
    const r = base()
    expect(compact(declsFor(r, 'html').transition)).toBe('background-color 1.2s ease,color 0.6s ease')
    expect(compact(declsFor(r, 'body').transition)).toBe('background 1.2s ease,color 0.6s ease')
  })

  it('UT-STYLE_BASE-005 appended focus rules after all baseline rules', () => {
    const r = base()
    const focus = rulesFor(r, 'a:focus-visible')
    expect(focus.length).toBeGreaterThan(0)
    const d = declsFor(r, 'a:focus-visible')
    expect(compact(d.outline)).toBe('2px solid var(--amber)')
    expect(d['outline-offset']).toBe('2px')
    expect(rulesFor(r, 'button:focus-visible').length).toBeGreaterThan(0)
    expect(declsFor(r, ':focus:not(:focus-visible)').outline).toBe('none')
    // appended last: after the final baseline keyframes
    const nodes = r.nodes.filter((n) => n.type !== 'comment')
    const lastKeyframes = nodes.map((n) => n.type === 'atrule' && n.name === 'keyframes').lastIndexOf(true)
    const focusIdx = nodes.indexOf(focus[0])
    expect(focusIdx).toBeGreaterThan(lastKeyframes)
  })

  it('UT-STYLE_BASE-006 body pseudo-element grid 56px and radial glow with day-theme variants', () => {
    const r = base()
    expect(compact(declsFor(r, 'body::before')['background-size'])).toBe('56px 56px')
    expect(declsFor(r, 'body::after').background).toContain('radial-gradient')
    expect(declsFor(r, '[data-theme="day"] body::before')['background-image']).toContain('linear-gradient')
    expect(declsFor(r, '[data-theme="day"] body::after').background).toContain('radial-gradient')
  })
})

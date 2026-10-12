import { cascadeCss, compact, declsFor, parse, parseStyle, rulesFor } from '../../utils/css.js'

const base = () => parseStyle('base')
const all = () => parse(cascadeCss())

describe('UNIT-STYLE_BASE', () => {
  it('UT-STYLE_BASE-001 reduced-motion block: durations, iteration-count (!important), scroll-behavior auto, particles/cursor hidden', () => {
    // NOTE: STP places the block in base.css, SUDS 6.15 keeps it last in sections.css; the cascade is checked.
    const root = all()
    let block = null
    root.walkAtRules('media', (a) => {
      if (a.params.includes('prefers-reduced-motion') && a.toString().includes('animation-iteration-count')) block = a
    })
    expect(block).not.toBeNull()
    const blk = parse(block.toString())
    const star = declsFor(blk, '*, *::before, *::after'.split(',')[0].trim(), { media: block.params })
    // Sprint 2 (FR-MOTION-007): durations are tokens that resolve to 0.01ms under reduced motion (motion.css)
    expect(star['animation-duration']).toBe('var(--dur-instant) !important')
    expect(star['animation-iteration-count']).toBe('1 !important')
    expect(star['transition-duration']).toBe('var(--dur-instant) !important')
    const motion = parseStyle('motion')
    let mblock = null
    motion.walkAtRules('media', (a) => {
      if (a.params.includes('prefers-reduced-motion')) mblock = a
    })
    const rd = declsFor(parse(mblock.toString()), ':root', { media: mblock.params })
    for (const k of ['instant', 'fast', 'base', 'slow', 'deliberate', 'theme', 'intro-max']) expect(rd[`--dur-${k}`], k).toBe('0.01ms')
    expect(declsFor(blk, '.reveal', { media: block.params })).toMatchObject({ opacity: '1', transform: 'none' })
    expect(declsFor(blk, 'html', { media: block.params })['scroll-behavior']).toBe('auto')
    expect(declsFor(blk, '.particle', { media: block.params }).display).toBe('none !important')
    expect(declsFor(blk, '.cursor-glow', { media: block.params }).display).toBe('none !important')
    // Sprint 2: later stylesheets (hero, cluster, ...) follow it, so the overrides are protected by !important
    expect(block.toString()).not.toMatch(/(animation|transition)-duration:[^;!]*;/)
  })

  it('UT-STYLE_BASE-002 html { scroll-behavior: smooth }', () => {
    expect(declsFor(base(), 'html')['scroll-behavior']).toBe('smooth')
  })

  it('UT-STYLE_BASE-003 .reveal hidden state, .reveal.visible resets, .d1/.d2/.d3 delays', () => {
    const r = all()
    const rev = declsFor(r, '.reveal')
    expect(rev.opacity).toBe('0')
    expect(compact(rev.transform)).toBe('translateY(24px)') // Sprint 2: 30px -> 24px (US-210)
    const vis = declsFor(r, '.reveal.visible')
    expect(vis.opacity).toBe('1')
    expect(compact(vis.transform)).toMatch(/^translateY\(0(px)?\)$/)
    // Sprint 2: stagger delays are multiples of --stagger-step
    expect(compact(declsFor(r, '.d1')['transition-delay'])).toMatch(/^var\(--stagger-step\) !important$/)
    expect(compact(declsFor(r, '.d2')['transition-delay'])).toMatch(/^calc\(var\(--stagger-step\) \* 2\) !important$/)
    expect(compact(declsFor(r, '.d3')['transition-delay'])).toMatch(/^calc\(var\(--stagger-step\) \* 3\) !important$/)
  })

  it('UT-STYLE_BASE-004 html/body transitions use --dur-theme (360 ms) for background and colour', () => {
    const r = base()
    expect(compact(declsFor(r, 'html').transition)).toBe('background-color var(--dur-theme) var(--ease-standard),color var(--dur-theme) var(--ease-standard)')
    expect(compact(declsFor(r, 'body').transition)).toBe('background var(--dur-theme) var(--ease-standard),color var(--dur-theme) var(--ease-standard)')
    expect(declsFor(parseStyle('motion'), ':root')['--dur-theme']).toBe('360ms')
  })

  it('UT-STYLE_BASE-005 appended focus rules after all baseline rules', () => {
    const r = base()
    const focus = rulesFor(r, 'a:focus-visible')
    expect(focus.length).toBeGreaterThan(0)
    const d = declsFor(r, 'a:focus-visible')
    expect(compact(d.outline)).toBe('2px solid var(--color-focus)') // US-203: focus token
    expect(d['outline-offset']).toBe('2px')
    expect(rulesFor(r, 'button:focus-visible').length).toBeGreaterThan(0)
    expect(declsFor(r, ':focus:not(:focus-visible)').outline).toBe('none')
    expect(d['box-shadow']).toContain('--color-focus-halo')
    // appended last: after the final keyframes
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

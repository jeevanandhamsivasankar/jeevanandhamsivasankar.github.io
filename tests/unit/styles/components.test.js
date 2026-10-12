import { cascadeCss, compact, declsFor, parse, parseStyle } from '../../utils/css.js'

const comp = () => parseStyle('components')
const all = () => parse(cascadeCss())

describe('UNIT-STYLE_COMPONENTS', () => {
  it('UT-STYLE_COMPONENTS-001 .nav fixed, top 0, height 64px, z-index 300', () => {
    const d = declsFor(comp(), '.nav')
    expect(d).toMatchObject({ position: 'fixed', top: '0', height: '64px', 'z-index': '300' })
  })

  it('UT-STYLE_COMPONENTS-002 .nav.scrolled height 54px; height transition on --dur-base', () => {
    const r = comp()
    expect(declsFor(r, '.nav.scrolled').height).toBe('54px')
    expect(declsFor(r, '.nav').transition).toMatch(/height var\(--dur-base\)/)
  })

  it('UT-STYLE_COMPONENTS-003 .mobile-menu fixed, top 64px; .open shows it', () => {
    const r = comp()
    const d = declsFor(r, '.mobile-menu')
    expect(d.position).toBe('fixed')
    expect(d.top).toBe('64px')
    expect(d.display).toBe('none')
    expect(declsFor(r, '.mobile-menu.open').display).toBe('flex')
  })

  it('UT-STYLE_COMPONENTS-004 chip image filters per theme', () => {
    const r = all()
    expect(compact(declsFor(r, '[data-theme="night"] .chip-icon-wrap img').filter)).toBe('brightness(1.5) saturate(1.1)')
    expect(compact(declsFor(r, '[data-theme="day"] .chip-icon-wrap img').filter)).toBe('brightness(0.85) saturate(1.05)')
  })

  it('UT-STYLE_COMPONENTS-005 orb sizes/durations and hring sizes/durations', () => {
    const r = all()
    const orbs = [[1, 700, 20], [2, 600, 25], [3, 500, 18], [4, 400, 28]]
    for (const [n, px, s] of orbs) {
      const d = declsFor(r, `.orb-${n}`)
      expect(d.width).toBe(`${px}px`)
      expect(d.height).toBe(`${px}px`)
      expect(d.animation).toContain(`${s}s`)
    }
    const rings = [[1, 580, 80], [2, 440, 55], [3, 300, 36], [4, 180, 24]]
    for (const [n, px, s] of rings) {
      const d = declsFor(r, `.hring-${n}`)
      expect(d.width).toBe(`${px}px`)
      expect(d.height).toBe(`${px}px`)
      expect(d.animation).toContain(`${s}s`)
    }
  })

  it('UT-STYLE_COMPONENTS-006 .cursor-glow 380px, transition --dur-instant (80ms) linear', () => {
    const d = declsFor(comp(), '.cursor-glow')
    expect(d.width).toBe('380px')
    expect(d.height).toBe('380px')
    expect(compact(d.transition)).toBe('left var(--dur-instant) linear,top var(--dur-instant) linear')
  })

  it('UT-STYLE_COMPONENTS-007 .skip-link off-screen (not display:none); :focus on-screen with z-index above the nav using theme tokens; appended after baseline rules', () => {
    // STP places the skip link in components.css; SUDS 6.15 appends it to base.css. The cascade is checked.
    const r = all()
    const d = declsFor(r, '.skip-link')
    expect(d.display).not.toBe('none')
    const offscreen = [d.top, d.left].some((v) => v && /^-\d/.test(v))
    expect(offscreen).toBe(true)
    const f = declsFor(r, '.skip-link:focus')
    expect(f.top ?? f.left).toMatch(/^(\d|var\(--space-)/) // Sprint 2: spacing token
    expect(f['z-index'] ?? d['z-index']).toBe('var(--z-skip)') // token, above the nav layer (v1.1: 301; Sprint 2: 400)
    expect(Number(declsFor(all(), ':root')['--z-skip'])).toBeGreaterThan(300)
    const all2 = { ...d, ...f }
    expect(JSON.stringify(all2)).toContain('var(--')
  })

  it('UT-STYLE_COMPONENTS-008 every backdrop-filter has a matching -webkit-backdrop-filter', () => {
    const r = all()
    let checked = 0
    const offenders = []
    r.walkRules((rule) => {
      const props = {}
      rule.each((n) => {
        if (n.type === 'decl') props[n.prop] = compact(n.value)
      })
      if ('backdrop-filter' in props) {
        checked += 1
        if (props['-webkit-backdrop-filter'] !== props['backdrop-filter']) offenders.push(rule.selector)
      }
    })
    expect(checked).toBeGreaterThan(10)
    expect(offenders).toEqual([])
  })

  it('UT-STYLE_COMPONENTS-009 cards/controls theme transitions: background, border, colour and shadow on --dur-theme', () => {
    // the grouped baseline rule (nav, cards, badges, buttons, footer) lives in base.css (SMOOTH THEME TRANSITIONS)
    const r = all()
    let t = null
    r.walkRules((rule) => {
      if (rule.selectors.includes('.nav') && rule.selectors.includes('.project-card')) {
        rule.walkDecls('transition', (d) => {
          t = compact(d.value)
        })
      }
    })
    expect(t).not.toBeNull()
    for (const p of ['background', 'background-color', 'border-color', 'color', 'box-shadow']) {
      expect(t).toContain(`${p} var(--dur-theme) var(--ease-standard)`)
    }
  })
})

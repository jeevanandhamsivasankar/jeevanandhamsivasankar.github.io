import { cascadeCss, compact, declsFor, parse, parseStyle } from '../../utils/css.js'

const sec = () => parseStyle('sections')
const all = () => parse(cascadeCss()) // Sprint 2: hero/cluster/projects rules live in their own stylesheets
const M900 = '(max-width: 900px)'
const M540 = '(max-width: 540px)'

describe('UNIT-STYLE_SECTIONS', () => {
  it('UT-STYLE_SECTIONS-001 .hero grid-template-columns "1fr 360px 260px", min-height 100vh', () => {
    // FR-HERO-001 (changed): the grid is no longer mandated, hero v2 keeps it; rule lives in hero.css (DEF-201 fix)
    const d = declsFor(all(), '.hero')
    expect(compact(d['grid-template-columns'])).toBe('1fr 360px 260px')
    expect(d['min-height']).toBe('100vh')
  })

  it('UT-STYLE_SECTIONS-002 max-width 900px block', () => {
    const r = all()
    const at = (s) => declsFor(r, s, { media: M900 })
    const hero = at('.hero')
    expect(compact(hero['grid-template-columns'])).toMatch(/^1fr( !important)?$/)
    expect(compact(hero.padding)).toBe('76px 24px 40px !important') // hero v2 (US-206) tightens 80/60 to 76/40
    expect(at('.hero .hero-center').display).toBe('flex') // FR-UX-004: compact cluster shown (profile card stays hidden)
    expect(at('.hero-right').display).toBe('none')
    expect(compact(at('.about-grid')['grid-template-columns'])).toMatch(/^1fr/)
    expect(compact(at('.projects-grid')['grid-template-columns'])).toMatch(/^1fr/)
    expect(compact(at('.behance-grid')['grid-template-columns'])).toMatch(/^1fr/)
    expect(compact(at('.edu-grid')['grid-template-columns'])).toMatch(/^1fr/)
    expect(compact(at('.resume-inner')['grid-template-columns'])).toMatch(/^1fr/)
    expect(compact(at('.skills-grid')['grid-template-columns'])).toMatch(/^1fr 1fr/)
    expect(compact(at('.certs-grid')['grid-template-columns'])).toMatch(/^1fr 1fr/)
    const pad = at('.section-wrap')
    expect(pad['padding-left']).toMatch(/^24px/)
    expect(pad['padding-right']).toMatch(/^24px/)
    expect(at('.theme-badge').display).toBe('none')
  })

  it('UT-STYLE_SECTIONS-003 max-width 540px block', () => {
    const r = all()
    const at = (s) => declsFor(r, s, { media: M540 })
    expect(compact(at('.skills-grid')['grid-template-columns'])).toMatch(/^1fr/)
    expect(compact(at('.certs-grid')['grid-template-columns'])).toMatch(/^1fr/)
    expect(at('.skills-grid')['grid-template-columns']).not.toMatch(/1fr 1fr/)
    expect(at('.hero .hero-cta')['flex-direction']).toBe('column')
    expect(at('.hero .hero-cta .btn').width).toBe('100%') // CTAs stack full width (US-206 AC3)
  })

  it('UT-STYLE_SECTIONS-004 about grid gap 40px at <= 900px', () => {
    expect(declsFor(sec(), '.about-grid', { media: M900 }).gap).toMatch(/^40px/)
  })

  it('UT-STYLE_SECTIONS-005 wide project cards span column 1 only at <= 900px', () => {
    const r = all()
    expect(declsFor(r, '.project-card.wide', { media: M900 })['grid-column']).toMatch(/^1/)
    expect(declsFor(r, '.project-card.wide')['grid-column']).toMatch(/^(1 \/ -1|span 2)$/)
  })

  it('UT-STYLE_SECTIONS-006 cert grid 3 columns by default', () => {
    expect(compact(declsFor(sec(), '.certs-grid')['grid-template-columns'])).toBe('repeat(3,1fr)')
  })
})

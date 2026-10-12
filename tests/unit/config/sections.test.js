import { SECTIONS, NAV_ITEMS, defineSections } from '../../../src/config/sections.js'
import Hero from '../../../src/sections/Hero.jsx'

const IDS = ['hero', 'about', 'experience', 'skills', 'projects', 'design', 'education', 'certifications', 'resume', 'contact']
const REACT_LAZY = Symbol.for('react.lazy')

describe('UNIT-CONFIG_SECTIONS', () => {
  it('UT-CONFIG_SECTIONS-001 SECTIONS ids are in the documented order', () => {
    expect(SECTIONS.map((s) => s.id)).toEqual(IDS)
  })

  it('UT-CONFIG_SECTIONS-002 ids are unique and slug-shaped', () => {
    const ids = SECTIONS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z][a-z0-9-]*$/)
  })

  it('UT-CONFIG_SECTIONS-003 hero: lazy false, showInNav false, component is the eager Hero function', () => {
    const hero = SECTIONS[0]
    expect(hero.lazy).toBe(false)
    expect(hero.showInNav).toBe(false)
    expect(typeof hero.component).toBe('function')
    expect(hero.component).toBe(Hero)
  })

  it('UT-CONFIG_SECTIONS-004 other 9: lazy true, showInNav true, component is a React.lazy object', () => {
    const rest = SECTIONS.slice(1)
    expect(rest).toHaveLength(9)
    for (const s of rest) {
      expect(s.lazy, s.id).toBe(true)
      expect(s.showInNav, s.id).toBe(true)
      expect(typeof s.component, s.id).toBe('object')
      expect(s.component.$$typeof, s.id).toBe(REACT_LAZY)
    }
  })

  it('UT-CONFIG_SECTIONS-005 NAV_ITEMS equals the nav-visible sections with documented labels and icons', () => {
    expect(NAV_ITEMS).toEqual(SECTIONS.filter((s) => s.showInNav))
    expect(NAV_ITEMS.map((s) => s.label)).toEqual([
      'About', 'Experience', 'Skills', 'Projects', 'Design', 'Education', 'Certs', 'Resume', 'Contact',
    ])
    expect(NAV_ITEMS.map((s) => s.icon)).toEqual([
      'person', 'work', 'build', 'rocket_launch', 'brush', 'school', 'verified', 'description', 'mail',
    ])
    expect(NAV_ITEMS.map((s) => s.id)).toEqual(IDS.slice(1))
  })

  it('UT-CONFIG_SECTIONS-006 number derived from position 01..09; heading "Certifications" for the Certs entry', () => {
    expect(NAV_ITEMS.map((s) => s.number)).toEqual(['01', '02', '03', '04', '05', '06', '07', '08', '09'])
    const certs = SECTIONS.find((s) => s.id === 'certifications')
    expect(certs.label).toBe('Certs')
    expect(certs.heading).toBe('Certifications')
    expect(certs.labelText).toBe('07 — Certifications')
    expect(NAV_ITEMS.map((s) => s.labelText)).toEqual([
      '01 — About', '02 — Experience', '03 — Skills', '04 — Engineering Projects',
      '05 — Design Portfolio', '06 — Education', '07 — Certifications', '08 — Resume', '09 — Contact',
    ])
    expect(SECTIONS[0].number).toBeNull()
  })

  it('UT-CONFIG_SECTIONS-007 minHeight is a positive number for each lazy entry', () => {
    for (const s of SECTIONS.filter((x) => x.lazy)) {
      expect(typeof s.minHeight, s.id).toBe('number')
      expect(s.minHeight, s.id).toBeGreaterThan(0)
    }
  })

  it('UT-CONFIG_SECTIONS-008 each lazy dynamic import resolves to a default-exported function component', async () => {
    for (const s of SECTIONS.filter((x) => x.lazy)) {
      // React.lazy initialiser throws the pending thenable until the import settles.
      const read = () => s.component._init(s.component._payload)
      let mod
      try {
        mod = read()
      } catch (pending) {
        await pending
        mod = read()
      }
      expect(typeof mod === 'function' || typeof mod?.default === 'function', s.id).toBe(true)
    }
  }, 30_000)

  it('UT-CONFIG_SECTIONS-009 array and entries are frozen; lazy component objects are not', () => {
    expect(Object.isFrozen(SECTIONS)).toBe(true)
    expect(Object.isFrozen(NAV_ITEMS)).toBe(true)
    for (const s of SECTIONS) expect(Object.isFrozen(s), s.id).toBe(true)
    expect(Object.isFrozen(SECTIONS[1].component)).toBe(false)
  })

  it('UT-CONFIG_SECTIONS-010 defineSections rejects duplicate ids and numbers the first headed entry "01"', () => {
    const base = { component: () => null, lazy: false, showInNav: false, label: null, heading: null, icon: null, title: null }
    expect(() => defineSections([{ ...base, id: 'x' }, { ...base, id: 'x' }])).toThrow('duplicate "x"')
    const out = defineSections([
      { ...base, id: 'top' },
      { ...base, id: 'extra', showInNav: true, label: 'Extra', heading: 'Extra Heading', icon: 'star' },
    ])
    expect(out[0].number).toBeNull()
    expect(out[1].number).toBe('01')
    expect(out[1].labelText).toBe('01 — Extra Heading')
  })
})

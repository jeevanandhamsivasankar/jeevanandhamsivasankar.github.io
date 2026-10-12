import { DESIGN_CARDS } from '../../../src/data/design.js'

describe('UNIT-DATA_DESIGN', () => {
  it('UT-DATA_DESIGN-001 5 cards with titles and tags in order', () => {
    expect(DESIGN_CARDS).toHaveLength(5)
    expect(DESIGN_CARDS.map((c) => c.title)).toEqual([
      'Automotive Instrument Clusters',
      'Medical Device HMI Design',
      'Infotainment UI Modules',
      'Multi-Platform UI/UX Designs',
      'Jeevanandham S — Full Design Portfolio',
    ])
    expect(DESIGN_CARDS.map((c) => c.tag)).toEqual([
      'AUTOMOTIVE', 'MEDICAL HMI', 'INFOTAINMENT · OEM', 'MULTI-PLATFORM', 'DESIGNER PROFILE',
    ])
  })

  it('UT-DATA_DESIGN-002 exactly one wide card: "Infotainment UI Modules"', () => {
    const wide = DESIGN_CARDS.filter((c) => c.wide)
    expect(wide.map((c) => c.title)).toEqual(['Infotainment UI Modules'])
  })

  it('UT-DATA_DESIGN-003 every href is the Behance profile', () => {
    for (const c of DESIGN_CARDS) expect(c.href).toBe('https://behance.net/s_jeevanandham')
  })

  it('UT-DATA_DESIGN-004 artKey values are unique strings', () => {
    const keys = DESIGN_CARDS.map((c) => c.artKey)
    for (const k of keys) expect(typeof k).toBe('string')
    expect(new Set(keys).size).toBe(keys.length)
  })
})

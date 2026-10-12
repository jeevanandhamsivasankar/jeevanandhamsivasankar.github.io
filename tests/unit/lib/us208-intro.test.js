import { decideIntro, hasPlayed, markPlayed, resolveIntroMode, INTRO_KEY, INTRO_MAX_MS } from '../../../src/lib/intro.js'

const mem = () => {
  const m = new Map()
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) }
}
const throwing = { getItem() { throw new Error('denied') }, setItem() { throw new Error('denied') } }

describe('UNIT-INTRO state machine', () => {
  it('UT-INTRO-001 first load with motion allowed and flag on plays full; key and cap are per spec', () => {
    expect(INTRO_KEY).toBe('jsv-intro-played')
    expect(INTRO_MAX_MS).toBeLessThanOrEqual(1200)
    expect(decideIntro({ enabled: true, reduced: false, storage: mem() })).toBe('full')
  })
  it('UT-INTRO-002 second load in the same session does not play', () => {
    const s = mem()
    expect(markPlayed(s)).toBe(true)
    expect(hasPlayed(s)).toBe(true)
    expect(decideIntro({ enabled: true, reduced: false, storage: s })).toBe('none')
  })
  it('UT-INTRO-003 reduced motion or flag off never plays', () => {
    expect(decideIntro({ enabled: true, reduced: true, storage: mem() })).toBe('none')
    expect(decideIntro({ enabled: false, reduced: false, storage: mem() })).toBe('none')
  })
  it('UT-INTRO-004 throwing or missing storage disables the intro and never throws', () => {
    expect(hasPlayed(throwing)).toBeNull()
    expect(markPlayed(throwing)).toBe(false)
    expect(decideIntro({ enabled: true, reduced: false, storage: throwing })).toBe('none')
    expect(decideIntro({ enabled: true, reduced: false, storage: null })).toBe('none')
    const win = { location: { search: '' }, matchMedia: () => ({ matches: true }) }
    expect(resolveIntroMode(true, win)).toBe('none')
  })
})

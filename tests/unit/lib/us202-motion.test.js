import { motionMs, MOTION_MS } from '../../../src/lib/motion.js'

describe('UNIT-MOTION', () => {
  it('UT-MOTION-001 returns the token value when motion is allowed', () => {
    expect(motionMs('fast', false)).toBe(140)
    expect(motionMs('--dur-base', false)).toBe(220)
    expect(motionMs('deliberate')).toBe(600)
  })

  it('UT-MOTION-002 returns 0 for every token when reduced motion is on', () => {
    for (const k of Object.keys(MOTION_MS)) expect(motionMs(k, true)).toBe(0)
  })

  it('UT-MOTION-003 unknown tokens resolve to 0 and never throw', () => {
    expect(motionMs('nope', false)).toBe(0)
    expect(motionMs(undefined, false)).toBe(0)
    expect(motionMs('constructor', false)).toBe(0)
  })
})

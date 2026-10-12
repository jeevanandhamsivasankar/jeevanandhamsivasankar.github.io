import {
  CLUSTER, createNeedle, stepNeedle, gearFor, cycleAt, CYCLE_LEN, createSim, advance, staticSim,
  snapshot, canLine, pushTicker, createRng, rpmFor, angleFor,
} from '../../../src/lib/cluster.js'

const run = (n, target, dtMs, step = 1) => {
  const s = createNeedle(9.0)
  let peak = 0
  for (let i = 0; i < n; i += 1) {
    for (let k = 0; k < step; k += 1) stepNeedle(s, target, dtMs / 1000)
    peak = Math.max(peak, s.x)
  }
  return { s, peak }
}

describe('UNIT-CLUSTER (US-207)', () => {
  it('UT-CLUSTER-001 spring converges and never overshoots more than 3 %', () => {
    const { s, peak } = run(300, 100, 16)
    expect(s.x).toBeCloseTo(100, 1)
    expect(peak).toBeLessThanOrEqual(100 * (1 + CLUSTER.maxOvershoot))
    const t = createNeedle(14.0)
    let p = 0
    for (let i = 0; i < 300; i += 1) { stepNeedle(t, 8000, 0.016); p = Math.max(p, t.x) }
    expect(p).toBeLessThanOrEqual(8000 * 1.03)
  })

  it('UT-CLUSTER-002 frame-rate independent: 2x8 ms equals 1x16 ms within 1 %', () => {
    const a = createNeedle(9.0), b = createNeedle(9.0)
    for (let i = 0; i < 20; i += 1) { stepNeedle(a, 100, 0.016); stepNeedle(b, 100, 0.008); stepNeedle(b, 100, 0.008) }
    expect(Math.abs(a.x - b.x) / 100).toBeLessThan(0.01)
  })

  it('UT-CLUSTER-003 dt is clamped to 50 ms', () => {
    const a = createNeedle(9.0), b = createNeedle(9.0)
    stepNeedle(a, 100, 5)
    stepNeedle(b, 100, 0.05)
    expect(a.x).toBeCloseTo(b.x, 9)
    const s1 = createSim(), s2 = createSim()
    advance(s1, 10); advance(s2, 0.05)
    expect(s1.t).toBeCloseTo(0.05, 9)
    expect(s1.speed).toBeCloseTo(s2.speed, 9)
  })

  it('UT-CLUSTER-004 gear changes with hysteresis (no flicker at boundaries)', () => {
    expect(gearFor(10, 0)).toBe(1)
    expect(gearFor(19, 1)).toBe(2)
    expect(gearFor(17, 2)).toBe(2) // just below the upshift point: stays
    expect(gearFor(11, 2)).toBe(1) // below 18 - 6: downshifts
    let g = 1, changes = 0
    for (let i = 0; i < 200; i += 1) {
      const v = 18 + Math.sin(i) * 2 // oscillate +-2 km/h around the 1->2 boundary
      const n = gearFor(v, g)
      if (n !== g) changes += 1
      g = n
    }
    expect(changes).toBeLessThanOrEqual(1)
    expect(gearFor(500, 1)).toBe(6)
  })

  it('UT-CLUSTER-005 drive cycle is deterministic, looped and bounded', () => {
    expect(cycleAt(12.3)).toEqual(cycleAt(12.3))
    expect(cycleAt(5).target).toBeCloseTo(cycleAt(5 + CYCLE_LEN).target, 9)
    for (let t = 0; t < CYCLE_LEN; t += 0.5) {
      const { target } = cycleAt(t)
      expect(target).toBeGreaterThanOrEqual(0)
      expect(target).toBeLessThanOrEqual(150)
    }
    expect(rpmFor(0, 1, 0)).toBe(780)
    expect(rpmFor(150, 6, 0)).toBeLessThanOrEqual(7600)
  })

  it('UT-CLUSTER-006 ticker is deterministic with a seeded RNG, bounded and CAN-shaped', () => {
    const sim = staticSim()
    const lines = (seed) => {
      const rng = createRng(seed), buf = []
      let text = ''
      for (let i = 0; i < 10; i += 1) text = pushTicker(buf, canLine(sim, i, rng))
      return text
    }
    expect(lines(3)).toBe(lines(3))
    expect(lines(3)).not.toBe(lines(4))
    const out = lines(3).split('\n')
    expect(out).toHaveLength(CLUSTER.tickerLines)
    expect(out[0]).toMatch(/0x[0-9A-F]{3} rc[0-9A-F] [A-Z_]+/)
  })

  it('UT-CLUSTER-007 static frame is deterministic, at rest and cruising', () => {
    const a = staticSim(), b = staticSim()
    expect(a).toEqual(b)
    expect(a.spd.v).toBe(0)
    expect(a.spd.x).toBe(a.speed)
    expect(a.speed).toBeGreaterThan(50)
    expect(a.gear).toBeGreaterThanOrEqual(2)
  })

  it('UT-CLUSTER-008 snapshot angles stay in range and digital text is quantised', () => {
    const sim = staticSim()
    const s = snapshot(sim, true)
    expect(s.speedAngle).toBeGreaterThanOrEqual(angleFor(0) - 3)
    expect(s.speedAngle).toBeLessThanOrEqual(CLUSTER.maxA + 6)
    expect(Number(s.rpmText) % 50).toBe(0)
    expect(s.gear).toMatch(/^[PN1-6]$/)
    expect(snapshot(createSim()).gear).toBe('P')
    expect(s.lamps.beam).toBe(true)
  })
})

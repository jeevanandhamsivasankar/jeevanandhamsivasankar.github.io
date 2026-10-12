import {
  GAUGE,
  speedAt,
  rpmAt,
  gaugeFrame,
  speedAngle,
  rpmAngle,
  arcPath,
  needlePoint,
  gaugeTicks,
} from '../../../src/lib/gauge.js'

const rad = (d) => (d * Math.PI) / 180

describe('UNIT-GAUGE', () => {
  it('UT-GAUGE-001 GAUGE constants are frozen with the SUDS values', () => {
    expect(GAUGE).toEqual({
      cx: 130, cy: 130, r: 100, rpmR: 112, minA: -215, maxA: 35,
      maxSpeed: 180, maxRpm: 8000, needleLen: 84, tickCount: 19, dt: 0.006,
    })
    expect(Object.isFrozen(GAUGE)).toBe(true)
  })

  it('UT-GAUGE-002 speedAt(0) === 88 and rpmAt(0) ~ 4309.765', () => {
    expect(speedAt(0)).toBe(88)
    expect(rpmAt(0)).toBeCloseTo(4309.765, 3)
    expect(rpmAt(0)).toBeCloseTo(4309.765181769476, 9)
  })

  it('UT-GAUGE-003 baseline formulas at t = 1', () => {
    expect(speedAt(1)).toBe(Math.sin(1 * 0.5) * 45 + 88 + Math.sin(1 * 1.4) * 22)
    expect(rpmAt(1)).toBe(Math.sin(1 * 0.7 + 1) * 1200 + 2800 + Math.cos(1 * 1.1) * 500)
  })

  it('UT-GAUGE-004 gaugeFrame returns { speed, rpm }', () => {
    expect(gaugeFrame(2.5)).toEqual({ speed: speedAt(2.5), rpm: rpmAt(2.5) })
  })

  it('UT-GAUGE-005 speedAngle: 0 -> -215, 180 -> 35, 500 clamps to 35', () => {
    expect(speedAngle(0)).toBe(-215)
    expect(speedAngle(180)).toBe(35)
    expect(speedAngle(500)).toBe(35)
    expect(speedAngle(90)).toBe(-90)
  })

  it('UT-GAUGE-006 rpmAngle: 0 -> -215, 8000 -> 35, 20000 clamps to 35', () => {
    expect(rpmAngle(0)).toBe(-215)
    expect(rpmAngle(8000)).toBe(35)
    expect(rpmAngle(20000)).toBe(35)
    expect(rpmAngle(4000)).toBe(-90)
  })

  it('UT-GAUGE-007 needlePoint(-215) equals centre + 84 * (cos, sin)', () => {
    const p = needlePoint(-215)
    expect(p.x).toBe(130 + 84 * Math.cos((-215 * Math.PI) / 180))
    expect(p.y).toBe(130 + 84 * Math.sin((-215 * Math.PI) / 180))
    expect(needlePoint(0)).toEqual({ x: 214, y: 130 })
  })

  it('UT-GAUGE-008 arcPath format and large-arc flag', () => {
    const big = arcPath(130, 130, 100, -215, 35)
    expect(big).toMatch(/^M -?[\d.e-]+ -?[\d.e-]+ A 100 100 0 1 1 -?[\d.e-]+ -?[\d.e-]+$/)
    const small = arcPath(130, 130, 100, -215, -100)
    expect(small).toMatch(/^M -?[\d.e-]+ -?[\d.e-]+ A 100 100 0 0 1 -?[\d.e-]+ -?[\d.e-]+$/)
    const sx = 130 + 100 * Math.cos(rad(-215))
    const sy = 130 + 100 * Math.sin(rad(-215))
    const ex = 130 + 100 * Math.cos(rad(35))
    const ey = 130 + 100 * Math.sin(rad(35))
    expect(big).toBe(`M ${sx} ${sy} A 100 100 0 1 1 ${ex} ${ey}`)
  })

  it('UT-GAUGE-009 arcPath large-arc boundary: sweep of exactly 180 -> 0, 181 -> 1', () => {
    expect(arcPath(0, 0, 1, 0, 180)).toContain(' 0 0 1 ')
    expect(arcPath(0, 0, 1, 0, 181)).toContain(' 0 1 1 ')
  })

  it('UT-GAUGE-010 gaugeTicks: 19 frozen ticks, 7 majors at 0,3,...,18', () => {
    const ticks = gaugeTicks()
    expect(ticks).toHaveLength(19)
    expect(Object.isFrozen(ticks)).toBe(true)
    const majors = ticks.flatMap((t, i) => (t.major ? [i] : []))
    expect(majors).toEqual([0, 3, 6, 9, 12, 15, 18])
    expect(ticks.every((t) => Object.isFrozen(t))).toBe(true)
  })

  it('UT-GAUGE-011 tick radii: outer 100, major inner 82, minor inner 90', () => {
    const dist = (x, y) => Math.hypot(x - 130, y - 130)
    for (const t of gaugeTicks()) {
      expect(dist(t.x1, t.y1)).toBeCloseTo(100, 9)
      expect(dist(t.x2, t.y2)).toBeCloseTo(t.major ? 82 : 90, 9)
    }
  })

  it('UT-GAUGE-012 first/last tick angles span -215..35 degrees', () => {
    const t = gaugeTicks()
    expect(t[0].x1).toBeCloseTo(130 + 100 * Math.cos(rad(-215)), 9)
    expect(t[0].y1).toBeCloseTo(130 + 100 * Math.sin(rad(-215)), 9)
    expect(t[18].x1).toBeCloseTo(130 + 100 * Math.cos(rad(35)), 9)
    expect(t[18].y1).toBeCloseTo(130 + 100 * Math.sin(rad(35)), 9)
  })
})

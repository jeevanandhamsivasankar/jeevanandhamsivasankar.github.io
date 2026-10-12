import { mulberry32, createParticles, PARTICLE_SEED, PARTICLE_COLORS } from '../../../src/lib/random.js'

const COLORS = ['#f59e0b', '#22d3ee', '#34d399', '#a78bfa', '#fb7185']
const take = (rng, n) => Array.from({ length: n }, () => rng())

describe('UNIT-RANDOM', () => {
  it('UT-RANDOM-001 same seed yields identical 1000-value sequences', () => {
    expect(take(mulberry32(42), 1000)).toEqual(take(mulberry32(42), 1000))
  })

  it('UT-RANDOM-002 different seeds yield different sequences', () => {
    expect(take(mulberry32(1), 10)).not.toEqual(take(mulberry32(2), 10))
  })

  it('UT-RANDOM-003 100000 draws are in [0, 1), never 1 or NaN', () => {
    const rng = mulberry32(PARTICLE_SEED)
    let min = Infinity
    let max = -Infinity
    for (let i = 0; i < 100_000; i += 1) {
      const v = rng()
      expect(Number.isNaN(v)).toBe(false)
      if (v < min) min = v
      if (v > max) max = v
    }
    expect(min).toBeGreaterThanOrEqual(0)
    expect(max).toBeLessThan(1)
  })

  it('UT-RANDOM-004 golden vector: first 3 values for seed 1', () => {
    const g = mulberry32(1)
    expect(g()).toBeCloseTo(0.6270739405881613, 15)
    expect(g()).toBeCloseTo(0.002735721180215478, 15)
    expect(g()).toBeCloseTo(0.5274470399599522, 15)
  })

  it('UT-RANDOM-005 seed coercion: 0, -1, 2^32+1, 3.7 give valid numbers in range', () => {
    for (const seed of [0, -1, 2 ** 32 + 1, 3.7]) {
      for (const v of take(mulberry32(seed), 100)) {
        expect(Number.isNaN(v)).toBe(false)
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThan(1)
      }
    }
    // uint32 semantics: 2^32 + 1 behaves like 1; 3.7 like 3
    expect(take(mulberry32(2 ** 32 + 1), 5)).toEqual(take(mulberry32(1), 5))
    expect(take(mulberry32(3.7), 5)).toEqual(take(mulberry32(3), 5))
  })

  it('UT-RANDOM-006 independent generators share no state', () => {
    const a = mulberry32(7)
    const b = mulberry32(7)
    const interleaved = []
    for (let i = 0; i < 20; i += 1) {
      interleaved.push(a())
      b()
    }
    expect(interleaved).toEqual(take(mulberry32(7), 20))
    expect(take(b, 1)[0]).toBe(take(mulberry32(7), 21)[20])
  })

  it('UT-RANDOM-007 createParticles(18, rng) returns 18 particles with ids 0..17', () => {
    const ps = createParticles(18, mulberry32(PARTICLE_SEED))
    expect(ps).toHaveLength(18)
    expect(ps.map((p) => p.id)).toEqual(Array.from({ length: 18 }, (_, i) => i))
  })

  it('UT-RANDOM-008 ranges for 1000 seeded particles', () => {
    const ps = createParticles(1000, mulberry32(12345))
    for (const p of ps) {
      expect(p.x).toBeGreaterThanOrEqual(0)
      expect(p.x).toBeLessThan(100)
      expect(p.y).toBeGreaterThanOrEqual(20)
      expect(p.y).toBeLessThan(90)
      expect(p.size).toBeGreaterThanOrEqual(1.5)
      expect(p.size).toBeLessThan(4)
      expect(p.dur).toBeGreaterThanOrEqual(4)
      expect(p.dur).toBeLessThan(9)
      expect(p.delay).toBeGreaterThanOrEqual(0)
      expect(p.delay).toBeLessThan(6)
      expect(typeof p.dx).toBe('string')
      expect(p.dx).toMatch(/^-?\d+(\.\d+)?(e-?\d+)?px$/)
      const dx = parseFloat(p.dx)
      expect(dx).toBeGreaterThanOrEqual(-30)
      expect(dx).toBeLessThan(30)
      expect(p.opacity).toBeGreaterThanOrEqual(0.3)
      expect(p.opacity).toBeLessThan(0.8)
      expect(COLORS).toContain(p.color)
    }
    expect(new Set(ps.map((p) => p.color)).size).toBe(5)
  })

  it('UT-RANDOM-009 lower boundary with rng = 0', () => {
    const [p] = createParticles(1, () => 0)
    expect(p).toMatchObject({
      id: 0, x: 0, y: 20, size: 1.5, dur: 4, delay: 0, dx: '-30px', color: '#f59e0b', opacity: 0.3,
    })
  })

  it('UT-RANDOM-010 upper boundary with rng = 0.999999', () => {
    const [p] = createParticles(1, () => 0.999999)
    expect(p.x).toBeLessThan(100)
    expect(p.x).toBeCloseTo(100, 3)
    expect(p.y).toBeLessThan(90)
    expect(p.y).toBeCloseTo(90, 3)
    expect(p.size).toBeLessThan(4)
    expect(p.size).toBeCloseTo(4, 3)
    expect(p.dur).toBeLessThan(9)
    expect(p.dur).toBeCloseTo(9, 3)
    expect(p.delay).toBeLessThan(6)
    expect(p.delay).toBeCloseTo(6, 3)
    expect(parseFloat(p.dx)).toBeLessThan(30)
    expect(parseFloat(p.dx)).toBeCloseTo(30, 3)
    expect(p.opacity).toBeLessThan(0.8)
    expect(p.opacity).toBeCloseTo(0.8, 3)
    expect(p.color).toBe('#fb7185')
  })

  it('UT-RANDOM-011 createParticles with the page seed twice is deep-equal; golden particle 0 and 17', () => {
    const a = createParticles(18, mulberry32(PARTICLE_SEED))
    const b = createParticles(18, mulberry32(PARTICLE_SEED))
    expect(a).toEqual(b)
    expect(a[0]).toEqual({
      id: 0,
      x: 40.632403222844005,
      y: 65.67739109043032,
      size: 2.221362917101942,
      dur: 6.092105710180476,
      delay: 5.652479432523251,
      dx: '-28.903061030432582px',
      color: '#a78bfa',
      opacity: 0.6875601053005085,
    })
    expect(a[17].x).toBe(7.370317191816866)
    expect(a[17].color).toBe('#f59e0b')
  })

  it('UT-RANDOM-012 rng call order and count: 8 calls per particle, 144 for 18', () => {
    const seen = []
    const rng = vi.fn(() => {
      const v = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.9][seen.length % 8]
      seen.push(v)
      return v
    })
    const [p] = createParticles(1, rng)
    expect(rng).toHaveBeenCalledTimes(8)
    expect(p.x).toBeCloseTo(10)
    expect(p.y).toBeCloseTo(20 + 0.2 * 70)
    expect(p.size).toBeCloseTo(1.5 + 0.3 * 2.5)
    expect(p.dur).toBeCloseTo(4 + 0.4 * 5)
    expect(p.delay).toBeCloseTo(0.5 * 6)
    expect(parseFloat(p.dx)).toBeCloseTo((0.6 - 0.5) * 60)
    expect(p.color).toBe(COLORS[Math.floor(0.7 * 5)])
    expect(p.opacity).toBeCloseTo(0.3 + 0.9 * 0.5)
    const counter = vi.fn(mulberry32(1))
    createParticles(18, counter)
    expect(counter).toHaveBeenCalledTimes(144)
  })

  it('UT-RANDOM-013 createParticles(0, rng) -> [] and Math.random is never called', () => {
    const spy = vi.spyOn(Math, 'random')
    expect(createParticles(0, mulberry32(1))).toEqual([])
    createParticles(18, mulberry32(1))
    expect(spy).not.toHaveBeenCalled()
  })

  it('UT-RANDOM-014 error cases: non-function rng -> TypeError; negative/non-integer count -> RangeError', () => {
    expect(() => createParticles(3, null)).toThrow(TypeError)
    expect(() => createParticles(3, 'x')).toThrow(TypeError)
    expect(() => createParticles(-1, mulberry32(1))).toThrow(RangeError)
    expect(() => createParticles(1.5, mulberry32(1))).toThrow(RangeError)
  })

  it('UT-RANDOM-004 palette constant matches the documented colours', () => {
    expect([...PARTICLE_COLORS]).toEqual(COLORS)
  })
})

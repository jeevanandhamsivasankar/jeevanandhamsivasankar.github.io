import { render } from '@testing-library/react'
import Hero from '../../src/sections/Hero.jsx'
import GradientOrbs from '../../src/components/effects/GradientOrbs.jsx'
import { PARTICLE_SEED, createParticles, mulberry32 } from '../../src/lib/random.js'
import { normColor } from '../utils/appHelpers.jsx'

const snapshot = (container) => [...container.querySelectorAll('.particle')].map((p) => p.getAttribute('style'))

describe('effects (ARC-012, ARC-007, ARC-016)', () => {
  it('IT-036 particles from the seeded PRNG; orbs and rings rendered', () => {
    const expected = createParticles(18, mulberry32(PARTICLE_SEED))
    const first = render(<Hero />)
    const particles = [...first.container.querySelectorAll('.particle')]
    expect(particles).toHaveLength(18)
    particles.forEach((el, i) => {
      const p = expected[i]
      expect(el.style.left).toBe(`${p.x}%`)
      expect(el.style.top).toBe(`${p.y}%`)
      expect(el.style.width).toBe(`${p.size}px`)
      expect(el.style.height).toBe(`${p.size}px`)
      expect(el.style.background).toBe(normColor(p.color))
      expect(el.style.opacity).toBe(String(p.opacity))
      expect(el.style.getPropertyValue('--dur')).toBe(`${p.dur}s`)
      expect(el.style.getPropertyValue('--delay')).toBe(`${p.delay}s`)
      expect(el.style.getPropertyValue('--dx')).toBe(p.dx)
    })
    const before = snapshot(first.container)
    expect(first.container.querySelectorAll('.hring')).toHaveLength(4)
    first.unmount()

    const second = render(<Hero />)
    expect(snapshot(second.container)).toEqual(before)
    second.unmount()

    const orbs = render(<GradientOrbs />)
    const wrap = orbs.container.querySelector('.orbs-wrap')
    expect(wrap).toHaveAttribute('aria-hidden', 'true')
    expect(wrap.querySelectorAll('.orb')).toHaveLength(4)
  })
})

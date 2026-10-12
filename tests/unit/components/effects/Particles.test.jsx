import { render } from '@testing-library/react'
import Particles from '../../../../src/components/effects/Particles.jsx'
import { createParticles, mulberry32, PARTICLE_SEED } from '../../../../src/lib/random.js'

const expected = createParticles(18, mulberry32(PARTICLE_SEED))
const q = (c) => [...c.querySelectorAll('.particle')]

describe('UNIT-PARTICLES', () => {
  it('UT-PARTICLES-001 renders 18 .particle', () => {
    const { container } = render(<Particles />)
    expect(q(container)).toHaveLength(18)
  })

  it('UT-PARTICLES-002 inline styles equal createParticles(18, mulberry32(SEED))', () => {
    const { container } = render(<Particles />)
    q(container).forEach((el, i) => {
      const p = expected[i]
      expect(el.style.left).toBe(`${p.x}%`)
      expect(el.style.top).toBe(`${p.y}%`)
      expect(el.style.width).toBe(`${p.size}px`)
      expect(el.style.height).toBe(`${p.size}px`)
      const probe = document.createElement('div')
      probe.style.background = p.color
      expect(el.style.background).toBe(probe.style.background)
      expect(el.style.opacity).toBe(String(p.opacity))
      expect(el.style.getPropertyValue('--dur')).toBe(`${p.dur}s`)
      expect(el.style.getPropertyValue('--delay')).toBe(`${p.delay}s`)
      expect(el.style.getPropertyValue('--dx')).toBe(p.dx)
    })
  })

  it('UT-PARTICLES-003 same output across unmount/remount', () => {
    const a = render(<Particles />)
    const html1 = a.container.innerHTML
    a.unmount()
    const b = render(<Particles />)
    expect(b.container.innerHTML).toBe(html1)
  })

  it('UT-PARTICLES-004 container or particles carry no semantics (aria-hidden)', () => {
    const { container } = render(<Particles />)
    const particles = q(container)
    const eachHidden = particles.every((el) => el.getAttribute('aria-hidden') === 'true')
    const wrapperHidden =
      container.children.length === 1 &&
      !container.firstChild.classList.contains('particle') &&
      container.firstChild.getAttribute('aria-hidden') === 'true'
    expect(eachHidden || wrapperHidden).toBe(true)
    particles.forEach((el) => {
      expect(el).not.toHaveAttribute('role')
      expect(el.textContent).toBe('')
    })
  })
})

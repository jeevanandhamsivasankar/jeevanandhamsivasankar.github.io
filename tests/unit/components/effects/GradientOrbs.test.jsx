import { render } from '@testing-library/react'
import GradientOrbs from '../../../../src/components/effects/GradientOrbs.jsx'

describe('UNIT-GRADIENT_ORBS', () => {
  it('UT-GRADIENT_ORBS-001 .orbs-wrap with aria-hidden="true"', () => {
    const { container } = render(<GradientOrbs />)
    expect(container.firstChild).toHaveClass('orbs-wrap')
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('UT-GRADIENT_ORBS-002 4 .orb children with baseline modifier classes in order', () => {
    const { container } = render(<GradientOrbs />)
    const orbs = [...container.firstChild.children]
    expect(orbs).toHaveLength(4)
    expect(orbs.map((o) => o.className)).toEqual(['orb orb-1', 'orb orb-2', 'orb orb-3', 'orb orb-4'])
  })
})

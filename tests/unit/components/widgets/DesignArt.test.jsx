import { render } from '@testing-library/react'
import DesignArt from '../../../../src/components/widgets/DesignArt.jsx'

describe('UNIT-DESIGN_ART', () => {
  it.each([
    ['cluster', '0 0 580 280'],
    ['medical', '0 0 580 280'],
    ['infotainment', '0 0 1160 300'],
    ['multiplatform', '0 0 580 280'],
    ['profile', '0 0 580 280'],
  ])('UT-DESIGN_ART-001 %s renders an svg with its viewBox', (key, vb) => {
    const { container } = render(<DesignArt artKey={key} />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg).toHaveAttribute('viewBox', vb)
  })

  it('UT-DESIGN_ART-002 unknown key renders nothing (also inherited keys)', () => {
    for (const k of ['nope', 'toString', 'constructor', undefined]) {
      const { container, unmount } = render(<DesignArt artKey={k} />)
      expect(container).toBeEmptyDOMElement()
      unmount()
    }
  })

  it('UT-DESIGN_ART-003 cluster art has 12 tick lines; medical contains "Rajesh Kumar"', () => {
    const { container, unmount } = render(<DesignArt artKey="cluster" />)
    const ticks = [...container.querySelectorAll('line')].filter((l) => l.getAttribute('stroke') === 'rgba(245,158,11,0.5)')
    expect(ticks).toHaveLength(12)
    unmount()
    const { container: c2 } = render(<DesignArt artKey="medical" />)
    expect(c2.textContent).toContain('Rajesh Kumar')
  })
})

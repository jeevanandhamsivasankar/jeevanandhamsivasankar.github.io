import { fireEvent, render } from '@testing-library/react'
import TechIcon from '../../../../src/components/tech/TechIcon.jsx'

describe('UNIT-TECH_ICON', () => {
  it('UT-TECH_ICON-001 si:cplusplus renders the img with expected attrs/style', () => {
    const { container } = render(<TechIcon icon="si:cplusplus" color="#f00" />)
    const img = container.querySelector('img')
    expect(img.getAttribute('src')).toMatch(/\/cplusplus$/)
    expect(img).toHaveAttribute('alt', 'cplusplus')
    expect(img).toHaveAttribute('width', '22')
    expect(img).toHaveAttribute('height', '22')
    expect(img.style.display).toBe('block')
    expect(img.style.objectFit).toBe('contain')
    expect(img.style.borderRadius).toBe('2px')
  })

  it('UT-TECH_ICON-002 si image has loading="lazy" and decoding="async" (ADR-014)', () => {
    const { container } = render(<TechIcon icon="si:cplusplus" color="#f00" />)
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('loading', 'lazy')
    expect(img).toHaveAttribute('decoding', 'async')
  })

  it('UT-TECH_ICON-003 error event on the img gives Icon "code" in the given colour', () => {
    const { container } = render(<TechIcon icon="si:cplusplus" color="#ff0000" />)
    fireEvent.error(container.querySelector('img'))
    expect(container.querySelector('img')).toBeNull()
    const span = container.querySelector('span')
    expect(span.textContent).toBe('code')
    expect(span.style.color).toBe('rgb(255, 0, 0)')
  })

  it('UT-TECH_ICON-004 error state persists across re-render with the same spec', () => {
    const { container, rerender } = render(<TechIcon icon="si:cplusplus" color="#ff0000" />)
    fireEvent.error(container.querySelector('img'))
    rerender(<TechIcon icon="si:cplusplus" color="#ff0000" />)
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('span').textContent).toBe('code')
  })

  it('UT-TECH_ICON-005 svg:lvgl renders the CUSTOM_SVGS svg using the colour', () => {
    const { container } = render(<TechIcon icon="svg:lvgl" color="#abc123" />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg.outerHTML).toContain('#abc123')
  })

  it('UT-TECH_ICON-006 svg:unknown gives Icon "code"', () => {
    const { container } = render(<TechIcon icon="svg:unknown" color="#0f0" />)
    expect(container.querySelector('svg')).toBeNull()
    expect(container.querySelector('span').textContent).toBe('code')
  })

  it('UT-TECH_ICON-007 ms:code is coloured; ms:rocket_launch uses that ligature', () => {
    const { container, unmount } = render(<TechIcon icon="ms:code" color="#ff0000" />)
    expect(container.querySelector('span').textContent).toBe('code')
    expect(container.querySelector('span').style.color).toBe('rgb(255, 0, 0)')
    unmount()
    const { container: c2 } = render(<TechIcon icon="ms:rocket_launch" color="#ff0000" />)
    expect(c2.querySelector('span').textContent).toBe('rocket_launch')
  })

  it('UT-TECH_ICON-008 foo:bar gives Icon "code"', () => {
    const { container } = render(<TechIcon icon="foo:bar" color="#0f0" />)
    expect(container.querySelector('span').textContent).toBe('code')
  })

  it('UT-TECH_ICON-009 default size 22; custom size applied to all variants', () => {
    const { container, unmount } = render(<TechIcon icon="si:qt" color="#fff" />)
    expect(container.querySelector('img')).toHaveAttribute('width', '22')
    unmount()
    const sizes = {
      si: (c) => c.querySelector('img').getAttribute('width'),
      svg: (c) => c.querySelector('svg').getAttribute('width'),
      ms: (c) => c.querySelector('span').style.fontSize,
      foo: (c) => c.querySelector('span').style.fontSize,
    }
    const specs = { si: 'si:qt', svg: 'svg:i2c', ms: 'ms:code', foo: 'foo:bar' }
    for (const [k, icon] of Object.entries(specs)) {
      const { container: c, unmount: u } = render(<TechIcon icon={icon} color="#fff" size={40} />)
      expect(sizes[k](c)).toMatch(/^40(px)?$/)
      u()
    }
  })
})

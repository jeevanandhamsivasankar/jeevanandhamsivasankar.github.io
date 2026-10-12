import { render } from '@testing-library/react'
import Icon from '../../../../src/components/ui/Icon.jsx'

const span = (c) => c.querySelector('span')

describe('UNIT-ICON', () => {
  it('UT-ICON-001 renders a span with the ligature text', () => {
    const { container } = render(<Icon name="rocket_launch" />)
    expect(span(container)).toBeInTheDocument()
    expect(span(container).tagName).toBe('SPAN')
    expect(span(container).textContent).toBe('rocket_launch')
  })

  it('UT-ICON-002 aria-hidden="true" by default', () => {
    const { container } = render(<Icon name="mail" />)
    expect(span(container)).toHaveAttribute('aria-hidden', 'true')
    expect(span(container)).not.toHaveAttribute('role')
  })

  it('UT-ICON-003 inline style equals the baseline Ms style', () => {
    const { container } = render(<Icon name="mail" />)
    const el = span(container)
    expect(el.style.fontFamily).toContain('Material Symbols Outlined')
    expect(el.style.fontVariationSettings.replace(/\s/g, '')).toBe("'FILL'0,'wght'300,'GRAD'-25,'opsz'48")
    expect(el.style.fontSize).toBe('18px')
    expect(el.style.lineHeight).toBe('1')
    expect(el.style.display).toBe('inline-block')
    expect(el.style.verticalAlign).toBe('middle')
    expect(el.style.userSelect).toBe('none')
  })

  it('UT-ICON-004 size, fill, wght applied; style merged and overriding', () => {
    const { container } = render(
      <Icon name="mail" size={30} fill={1} wght={200} style={{ color: 'red', fontSize: 40 }} />,
    )
    const el = span(container)
    expect(el.style.fontVariationSettings.replace(/\s/g, '')).toBe("'FILL'1,'wght'200,'GRAD'-25,'opsz'48")
    expect(el.style.color).toBe('red')
    expect(el.style.fontSize).toBe('40px') // style overrides size
    expect(el.style.display).toBe('inline-block') // base retained
    const { container: c2 } = render(<Icon name="x" size={30} />)
    expect(span(c2).style.fontSize).toBe('30px')
  })

  it('UT-ICON-005 label prop gives role="img", aria-label and no aria-hidden', () => {
    const { container } = render(<Icon name="mail" label="Email" />)
    const el = span(container)
    expect(el).toHaveAttribute('role', 'img')
    expect(el).toHaveAttribute('aria-label', 'Email')
    expect(el).not.toHaveAttribute('aria-hidden')
  })

  it('UT-ICON-006 does not emit class "ms" even when className is passed', () => {
    const { container } = render(<Icon name="mail" className="ms extra" />)
    const el = span(container)
    expect(el.className).toBe('')
    expect(el).not.toHaveAttribute('class')
  })
})

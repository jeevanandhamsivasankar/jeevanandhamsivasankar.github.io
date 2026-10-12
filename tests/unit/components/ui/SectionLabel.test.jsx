import { render } from '@testing-library/react'
import SectionLabel from '../../../../src/components/ui/SectionLabel.jsx'

describe('UNIT-SECTION_LABEL', () => {
  it('UT-SECTION_LABEL-001 renders div.section-label with an Icon of size 13 followed by the text', () => {
    const { container } = render(<SectionLabel icon="person" text="01 — About" />)
    const div = container.firstChild
    expect(div.tagName).toBe('DIV')
    expect(div).toHaveClass('section-label')
    const icon = div.firstChild
    expect(icon.tagName).toBe('SPAN')
    expect(icon.textContent).toBe('person')
    expect(icon.style.fontSize).toBe('13px')
    expect(div.lastChild.nodeType).toBe(Node.TEXT_NODE)
    expect(div.lastChild.textContent).toBe('01 — About')
  })

  it('UT-SECTION_LABEL-002 text exact; icon aria-hidden', () => {
    const { container } = render(<SectionLabel icon="work" text="02 — Experience" />)
    expect(container.firstChild.textContent).toBe('work02 — Experience')
    expect(container.querySelector('span')).toHaveAttribute('aria-hidden', 'true')
  })
})

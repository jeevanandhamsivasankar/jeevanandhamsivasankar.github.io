import { render } from '@testing-library/react'
import Badge from '../../../../src/components/ui/Badge.jsx'

describe('UNIT-BADGE', () => {
  it('UT-BADGE-001 renders span.badge with its text', () => {
    const { container } = render(<Badge>Qt / QML</Badge>)
    const el = container.firstChild
    expect(el.tagName).toBe('SPAN')
    expect(el).toHaveClass('badge')
    expect(el.textContent).toBe('Qt / QML')
  })
})

import { render } from '@testing-library/react'
import Divider from '../../../../src/components/layout/Divider.jsx'

describe('UNIT-DIVIDER', () => {
  it('UT-DIVIDER-001 renders an empty div.divider', () => {
    const { container } = render(<Divider />)
    expect(container.firstChild.tagName).toBe('DIV')
    expect(container.firstChild).toHaveClass('divider')
    expect(container.firstChild).toBeEmptyDOMElement()
  })
})

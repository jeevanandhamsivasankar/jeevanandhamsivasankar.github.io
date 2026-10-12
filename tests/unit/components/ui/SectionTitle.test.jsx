import { render, screen } from '@testing-library/react'
import SectionTitle from '../../../../src/components/ui/SectionTitle.jsx'

describe('UNIT-SECTION_TITLE', () => {
  it('UT-SECTION_TITLE-001 renders h2.section-title with string and element children', () => {
    const { container, unmount } = render(<SectionTitle>Who I Am</SectionTitle>)
    const h2 = screen.getByRole('heading', { level: 2 })
    expect(h2).toHaveClass('section-title')
    expect(h2).toHaveTextContent('Who I Am')
    expect(container.children).toHaveLength(1)
    unmount()

    render(
      <SectionTitle>
        Let&apos;s <em data-testid="em">Work</em>
      </SectionTitle>,
    )
    const h = screen.getByRole('heading', { level: 2 })
    expect(h).toHaveClass('section-title')
    expect(screen.getByTestId('em').parentElement).toBe(h)
    expect(h).toHaveTextContent("Let's Work")
  })
})

import { render, screen } from '@testing-library/react'
import { useReveal } from '../../../../src/hooks/useReveal.js'
import Section from '../../../../src/components/ui/Section.jsx'

vi.mock('../../../../src/hooks/useReveal.js', () => ({ useReveal: vi.fn() }))

describe('UNIT-SECTION', () => {
  it('UT-SECTION-001 renders <section> with id and data-section equal', () => {
    const { container } = render(<Section id="about" className="section-wrap">x</Section>)
    const el = container.firstChild
    expect(el.tagName).toBe('SECTION')
    expect(el).toHaveAttribute('id', 'about')
    expect(el).toHaveAttribute('data-section', 'about')
  })

  it('UT-SECTION-002 as="div" renders a div with the same attributes', () => {
    const { container } = render(<Section as="div" id="experience" className="full-band">x</Section>)
    const el = container.firstChild
    expect(el.tagName).toBe('DIV')
    expect(el).toHaveAttribute('id', 'experience')
    expect(el).toHaveAttribute('data-section', 'experience')
  })

  it('UT-SECTION-003 className and style passed through', () => {
    const { container } = render(
      <Section id="a" className="exp-band full-band" style={{ background: 'red' }}>x</Section>,
    )
    expect(container.firstChild).toHaveClass('exp-band', 'full-band')
    expect(container.firstChild.style.background).toBe('red')
  })

  it('UT-SECTION-004 label renders SectionLabel; title renders SectionTitle; neither when absent', () => {
    const { container, unmount } = render(
      <Section id="a" className="c" label={{ icon: 'person', text: '01 — About' }} title="Who I Am">x</Section>,
    )
    expect(container.querySelector('.section-label')).toHaveTextContent('01 — About')
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Who I Am')
    unmount()
    const { container: c2 } = render(<Section id="a" className="c">x</Section>)
    expect(c2.querySelector('.section-label')).toBeNull()
    expect(c2.querySelector('h2')).toBeNull()
  })

  it('UT-SECTION-005 children rendered after the heading (and inside .inner when inner)', () => {
    const { container } = render(
      <Section id="a" className="c" inner label={{ icon: 'x', text: 'L' }} title="T">
        <div data-testid="kid" />
      </Section>,
    )
    const inner = container.querySelector('.inner')
    expect(inner).not.toBeNull()
    const kids = [...inner.children].map((n) => n.className || n.dataset.testid)
    expect(kids[0]).toBe('section-label')
    expect(kids[1]).toBe('section-title')
    expect(inner.lastChild).toBe(screen.getByTestId('kid'))
  })

  it('UT-SECTION-006 calls useReveal with its root ref (current is the root)', () => {
    let captured
    useReveal.mockImplementation((ref) => {
      captured = ref
    })
    const { container } = render(<Section id="a" className="c">x</Section>)
    expect(useReveal).toHaveBeenCalled()
    // ref is populated by the time effects have run
    expect(captured.current).toBe(container.firstChild)
  })
})

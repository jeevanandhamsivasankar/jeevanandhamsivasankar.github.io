import { render, screen } from '@testing-library/react'
import Button from '../../../../src/components/ui/Button.jsx'

const get = () => screen.getByRole('link')

describe('UNIT-BUTTON', () => {
  it.each(['amber', 'outline', 'green'])('UT-BUTTON-001 variant %s gives classes btn btn-%s', (v) => {
    render(<Button variant={v} href="#x" icon="mail">Go</Button>)
    expect(get()).toHaveClass('btn', `btn-${v}`)
    expect(get().className).toBe(`btn btn-${v}`)
  })

  it('UT-BUTTON-002 icon rendered before the label; label text exact', () => {
    render(<Button variant="amber" href="#x" icon="rocket_launch">View Projects</Button>)
    const a = get()
    const icon = a.firstChild
    expect(icon.tagName).toBe('SPAN')
    expect(icon.textContent).toBe('rocket_launch')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(icon.style.fontSize).toBe('17px')
    expect(a.lastChild.textContent).toBe('View Projects')
    expect(a).toHaveAccessibleName('View Projects')
  })

  it('UT-BUTTON-003 href applied', () => {
    render(<Button variant="amber" href="#projects" icon="mail">Go</Button>)
    expect(get()).toHaveAttribute('href', '#projects')
  })

  it('UT-BUTTON-004 download value applied; absent gives no attribute', () => {
    const { unmount } = render(<Button variant="green" href="a.pdf" icon="download" download="My.pdf">R</Button>)
    expect(get()).toHaveAttribute('download', 'My.pdf')
    unmount()
    render(<Button variant="green" href="a.pdf" icon="download">R</Button>)
    expect(get()).not.toHaveAttribute('download')
  })

  it('UT-BUTTON-005 external gives target _blank and rel noopener noreferrer; otherwise neither', () => {
    const { unmount } = render(<Button variant="outline" href="https://x.y" icon="open_in_new" external>V</Button>)
    expect(get()).toHaveAttribute('target', '_blank')
    expect(get()).toHaveAttribute('rel', 'noopener noreferrer')
    unmount()
    render(<Button variant="outline" href="#x" icon="mail">V</Button>)
    expect(get()).not.toHaveAttribute('target')
    expect(get()).not.toHaveAttribute('rel')
  })

  it('UT-BUTTON-006 unknown variant never renders btn-undefined (SUDS: rendered as given)', () => {
    const { unmount } = render(<Button variant="purple" href="#x" icon="mail">V</Button>)
    expect(get().className).not.toContain('btn-undefined')
    expect(get()).toHaveClass('btn', 'btn-purple')
    unmount()
    render(<Button href="#x" icon="mail">V</Button>)
    expect(get().className).not.toContain('btn-undefined')
  })
})

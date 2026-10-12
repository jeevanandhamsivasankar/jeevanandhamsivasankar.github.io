import { lazy } from 'react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App.jsx'

vi.mock('../../src/config/sections.js', () => ({ SECTIONS: [] }))
vi.mock('../../src/context/ThemeContext.jsx', () => ({
  ThemeProvider: ({ children }) => <div data-testid="theme-provider">{children}</div>,
}))
vi.mock('../../src/components/effects/GradientOrbs.jsx', () => ({
  default: () => <div data-testid="orbs" />,
}))
vi.mock('../../src/components/effects/CursorGlow.jsx', () => ({
  default: () => <div data-testid="glow" />,
}))
vi.mock('../../src/components/layout/Nav.jsx', () => ({
  default: ({ items }) => <nav data-testid="nav" data-ids={items.map((i) => i.id).join(',')} />,
}))
vi.mock('../../src/components/layout/Footer.jsx', () => ({
  default: () => <footer data-testid="footer" />,
}))

const stub = (id, over = {}) => ({
  id,
  lazy: false,
  showInNav: true,
  minHeight: 100,
  component: () => <section id={id} data-testid={`sec-${id}`} />,
  ...over,
})
const three = () => [stub('hero', { showInNav: false }), stub('a'), stub('b')]

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('UNIT-APP', () => {
  it('UT-APP-001 composition order: skip link, orbs, glow, nav, main#main[tabindex=-1], footer inside ThemeProvider', () => {
    render(<App sections={three()} />)
    const provider = screen.getByTestId('theme-provider')
    const kids = [...provider.children]
    expect(kids.map((k) => k.getAttribute('data-testid') || k.tagName.toLowerCase() + (k.id ? `#${k.id}` : ''))).toEqual([
      'a',
      'orbs',
      'glow',
      'nav',
      'main#main',
      'footer',
    ])
    const main = provider.querySelector('main')
    expect(main).toHaveAttribute('id', 'main')
    expect(main).toHaveAttribute('tabindex', '-1')
    expect(kids[0]).toHaveClass('skip-link')
  })

  it('UT-APP-002 renders entries in order with a Divider between consecutive entries (3 entries -> 2 dividers)', () => {
    const { container } = render(<App sections={three()} />)
    const main = container.querySelector('main')
    expect([...main.children].map((c) => (c.classList.contains('divider') ? 'divider' : c.id))).toEqual([
      'hero',
      'divider',
      'a',
      'divider',
      'b',
    ])
    expect(main.querySelectorAll('.divider')).toHaveLength(2)
    // Nav is derived from the same registry (showInNav entries only)
    expect(screen.getByTestId('nav')).toHaveAttribute('data-ids', 'a,b')
  })

  it('UT-APP-003 eager entry rendered synchronously on the first render', () => {
    render(<App sections={[stub('hero', { showInNav: false })]} />)
    expect(screen.getByTestId('sec-hero')).toBeInTheDocument()
  })

  it('UT-APP-004 lazy entries wrapped in Suspense with a placeholder (id, data-section, min-height)', () => {
    const Never = lazy(() => new Promise(() => {}))
    const { container } = render(
      <App sections={[stub('hero', { showInNav: false }), stub('about', { lazy: true, minHeight: 900, component: Never })]} />,
    )
    const ph = container.querySelector('[data-section-placeholder]')
    expect(ph).toHaveAttribute('id', 'about')
    expect(ph).toHaveAttribute('data-section', 'about')
    expect(ph.style.minHeight).toBe('900px')
    expect(screen.getByTestId('sec-hero')).toBeInTheDocument()
  })

  it('UT-APP-005 each lazy entry is wrapped in its own section-level ErrorBoundary', async () => {
    const Bad = lazy(() => Promise.reject(new Error('chunk')))
    const Ok = lazy(() => Promise.resolve({ default: () => <p>fine</p> }))
    render(
      <App
        sections={[
          stub('hero', { showInNav: false }),
          stub('bad', { lazy: true, component: Bad }),
          stub('good', { lazy: true, component: Ok }),
        ]}
      />,
    )
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveAttribute('id', 'bad')
    expect(await screen.findByText('fine')).toBeInTheDocument()
    expect(screen.getByTestId('sec-hero')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('UT-APP-006 a.skip-link "Skip to content" href="#main" is the first focusable element', async () => {
    const user = userEvent.setup()
    render(<App sections={three()} />)
    const link = screen.getByRole('link', { name: 'Skip to content' })
    expect(link).toHaveClass('skip-link')
    expect(link).toHaveAttribute('href', '#main')
    await user.tab()
    expect(link).toHaveFocus()
    await waitFor(() => expect(document.querySelector('main')).toBeInTheDocument())
  })

  it('UT-APP-007 source contains no content literals or CSS (static scan of App.jsx)', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/App.jsx'), 'utf8')
    expect(src).not.toMatch(/<style/i)
    expect(src).not.toMatch(/style\s*=\s*\{\{/)
    expect(src).not.toMatch(/`[^`]*\{[^`]*:[^`]*;[^`]*`/) // CSS-in-template
    const withoutImports = src.replace(/^import .*$/gm, '')
    const literals = [...withoutImports.matchAll(/"([^"\n]*)"|'([^'\n]*)'/g)].map((m) => m[1] ?? m[2])
    const allowed = new Set(['', 'skip-link', '#main', 'main', 'Skip to content'])
    const offenders = literals.filter((l) => !allowed.has(l))
    expect(offenders).toEqual([])
    expect(src.split('\n').length).toBeLessThanOrEqual(60)
  })
})

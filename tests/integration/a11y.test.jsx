import { screen, within } from '@testing-library/react'
import App from '../../src/App.jsx'
import { EMAIL } from '../../src/config/site.js'
import { renderAndSettle, installFakeTime } from '../utils/appHelpers.jsx'

afterEach(() => vi.useRealTimers())

const LIGATURES = ['rocket_launch', 'mail', 'person', 'dark_mode', 'light_mode', 'wb_sunny', 'nights_stay', 'developer_board', 'download', 'open_in_new']
const hasLigature = (name) => name.split(/\s+/).some((w) => LIGATURES.includes(w))

describe('accessibility integration (ARC-010, ARC-011, ARC-014, ARC-016)', () => {
  it('IT-029 all Material Symbols spans in the app are aria-hidden', async () => {
    installFakeTime('2026-06-21T06:30:00Z') // day: theme button reads "Night"
    await renderAndSettle(<App />)

    const icons = [...document.querySelectorAll('span')].filter((s) => /Material Symbols/.test(s.getAttribute('style') ?? ''))
    expect(icons.length).toBeGreaterThan(50)
    for (const icon of icons) expect(icon, icon.textContent).toHaveAttribute('aria-hidden', 'true')
    expect(document.querySelector('span.ms')).toBeNull()

    // accessible names exclude the aria-hidden ligature text
    expect(screen.getByRole('link', { name: 'View Projects' })).toBeInTheDocument()
    expect(within(document.querySelector('.nav-links')).getByRole('link', { name: 'About' })).toBeInTheDocument()
    expect(within(document.querySelector('.nav-right')).getByRole('button', { name: 'Night' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: EMAIL })).toBeInTheDocument()
    for (const el of [...screen.getAllByRole('link'), ...screen.getAllByRole('button')]) {
      const label = el.getAttribute('aria-label')
      if (label) expect(hasLigature(label)).toBe(false)
    }
  })
})

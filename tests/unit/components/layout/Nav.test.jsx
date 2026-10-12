import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Nav from '../../../../src/components/layout/Nav.jsx'

const state = vi.hoisted(() => ({
  active: 'hero',
  scrolled: false,
  ctx: { isDay: false, toggle: null, now: null },
}))

vi.mock('../../../../src/context/ThemeContext.jsx', () => ({ useThemeContext: () => state.ctx }))
vi.mock('../../../../src/hooks/useActiveSection.js', () => ({ useActiveSection: () => state.active }))
vi.mock('../../../../src/hooks/useScrolled.js', () => ({ useScrolled: () => state.scrolled }))

const ITEMS = [
  ['about', 'person', 'About'],
  ['experience', 'work', 'Experience'],
  ['skills', 'build', 'Skills'],
  ['projects', 'rocket_launch', 'Projects'],
  ['design', 'brush', 'Design'],
  ['education', 'school', 'Education'],
  ['certifications', 'verified', 'Certs'],
  ['resume', 'description', 'Resume'],
  ['contact', 'mail', 'Contact'],
].map(([id, icon, label]) => ({ id, icon, label, showInNav: true }))

const NOW = new Date('2026-06-21T17:30:00Z') // 23:00 IST
let originalTz

beforeAll(() => {
  originalTz = process.env.TZ
  process.env.TZ = 'Asia/Kolkata'
})
afterAll(() => {
  if (originalTz === undefined) delete process.env.TZ
  else process.env.TZ = originalTz
})

beforeEach(() => {
  state.active = 'hero'
  state.scrolled = false
  state.ctx = { isDay: false, toggle: vi.fn(), now: NOW }
})

const setup = (items = ITEMS) => render(<Nav items={items} />)
const desktopLinks = (c) => [...c.querySelectorAll('.nav-links a')]
const mobile = (c) => c.querySelector('#mobile-menu')
const hamburger = () => screen.getByRole('button', { name: 'Menu' })

describe('UNIT-NAV', () => {
  it('UT-NAV-001 renders nav.nav; adds "scrolled" when useScrolled is true', () => {
    const { container, rerender } = setup()
    const nav = container.querySelector('nav')
    expect(nav).toHaveClass('nav')
    expect(nav).not.toHaveClass('scrolled')
    state.scrolled = true
    rerender(<Nav items={ITEMS} />)
    expect(container.querySelector('nav')).toHaveClass('nav', 'scrolled')
  })

  it('UT-NAV-002 logo: Icon developer_board (aria-hidden) + JEEVANANDHAM', () => {
    const { container } = setup()
    const logo = container.querySelector('.nav-logo')
    expect(logo.textContent).toBe('developer_boardJEEVANANDHAM')
    expect(logo.querySelector('span')).toHaveAttribute('aria-hidden', 'true')
    expect(logo.querySelector('span').style.fontSize).toBe('17px')
  })

  it('UT-NAV-003 9 links: href #id, label, Icon size 13', () => {
    const { container } = setup()
    const links = desktopLinks(container)
    expect(links).toHaveLength(9)
    links.forEach((a, i) => {
      expect(a).toHaveAttribute('href', `#${ITEMS[i].id}`)
      expect(a.textContent).toBe(ITEMS[i].icon + ITEMS[i].label)
      expect(a.querySelector('span').style.fontSize).toBe('13px')
    })
  })

  it('UT-NAV-004 only the link matching the active id has "active"', () => {
    state.active = 'skills'
    const { container } = setup()
    const active = desktopLinks(container).filter((a) => a.classList.contains('active'))
    expect(active).toHaveLength(1)
    expect(active[0]).toHaveAttribute('href', '#skills')
    // mobile links never get active
    expect(mobile(container).querySelectorAll('.active')).toHaveLength(0)
  })

  it('UT-NAV-005 never renders a link for an entry with showInNav: false', () => {
    const items = [{ id: 'hero', icon: 'home', label: 'Home', showInNav: false }, ...ITEMS]
    const { container } = setup(items)
    expect(container.querySelector('a[href="#hero"]')).toBeNull()
    expect(desktopLinks(container)).toHaveLength(9)
  })

  it('UT-NAV-006 badge DAY/NIGHT with wb_sunny/nights_stay per context', () => {
    const { container, rerender } = setup()
    const badge = () => container.querySelector('.theme-badge')
    expect(badge().firstChild.textContent).toBe('nights_stay')
    expect(badge().textContent).toMatch(/NIGHT/)
    state.ctx = { ...state.ctx, isDay: true }
    rerender(<Nav items={ITEMS} />)
    expect(badge().firstChild.textContent).toBe('wb_sunny')
    expect(badge().textContent).toMatch(/DAY/)
    expect(badge().textContent).not.toMatch(/NIGHT/)
  })

  it('UT-NAV-007 badge time uses en-IN 2-digit 12h format (Asia/Kolkata gives "11:00 pm")', () => {
    const { container } = setup()
    const expected = NOW.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    expect(expected).toBe('11:00 pm')
    expect(container.querySelector('.theme-badge').textContent).toBe('nights_stayNIGHT · 11:00 pm')
  })

  it('UT-NAV-008 badge re-renders when context now changes', () => {
    const { container, rerender } = setup()
    state.ctx = { ...state.ctx, now: new Date('2026-06-21T17:31:00Z') }
    rerender(<Nav items={ITEMS} />)
    expect(container.querySelector('.theme-badge').textContent).toContain('11:01 pm')
  })

  it('UT-NAV-009 theme button: title, labels/icons per theme, click calls toggle', async () => {
    const user = userEvent.setup()
    const { container, rerender } = setup()
    const btn = () => container.querySelector('nav .theme-btn')
    expect(btn()).toHaveAttribute('title', 'Toggle day/night theme')
    expect(btn().textContent).toBe('light_modeDay') // night shows "Day"
    state.ctx = { ...state.ctx, isDay: true }
    rerender(<Nav items={ITEMS} />)
    expect(btn().textContent).toBe('dark_modeNight') // day shows "Night"
    await user.click(btn())
    expect(state.ctx.toggle).toHaveBeenCalledTimes(1)
  })

  it('UT-NAV-010 hamburger: aria-label, aria-expanded false/true, aria-controls = mobile menu id', async () => {
    const user = userEvent.setup()
    const { container } = setup()
    expect(hamburger()).toHaveAttribute('aria-expanded', 'false')
    expect(hamburger().getAttribute('aria-controls')).toBe(mobile(container).id)
    expect(mobile(container).id).toBe('mobile-menu')
    await user.click(hamburger())
    expect(hamburger()).toHaveAttribute('aria-expanded', 'true')
  })

  it('UT-NAV-011 hamburger click toggles .mobile-menu.open', async () => {
    const user = userEvent.setup()
    const { container } = setup()
    expect(mobile(container)).not.toHaveClass('open')
    await user.click(hamburger())
    expect(mobile(container)).toHaveClass('open')
    await user.click(hamburger())
    expect(mobile(container)).not.toHaveClass('open')
  })

  it('UT-NAV-012 mobile menu: 9 links (Icon size 15) and the opposite-theme button', () => {
    const { container, rerender } = setup()
    const links = [...mobile(container).querySelectorAll('a')]
    expect(links).toHaveLength(9)
    links.forEach((a) => expect(a.querySelector('span').style.fontSize).toBe('15px'))
    const btn = () => mobile(container).querySelector('button.theme-btn')
    expect(btn().textContent).toContain('Switch to Day Mode') // night now
    expect(btn().style.marginTop).toBe('8px')
    expect(btn().style.width).toBe('100%')
    state.ctx = { ...state.ctx, isDay: true }
    rerender(<Nav items={ITEMS} />)
    expect(btn().textContent).toContain('Switch to Night Mode')
  })

  it('UT-NAV-013 mobile link click closes the menu', async () => {
    const user = userEvent.setup()
    const { container } = setup()
    await user.click(hamburger())
    expect(mobile(container)).toHaveClass('open')
    await user.click(mobile(container).querySelector('a'))
    expect(mobile(container)).not.toHaveClass('open')
  })

  it('UT-NAV-014 mobile theme button calls toggle and closes the menu', async () => {
    const user = userEvent.setup()
    const { container } = setup()
    await user.click(hamburger())
    await user.click(mobile(container).querySelector('button.theme-btn'))
    expect(state.ctx.toggle).toHaveBeenCalledTimes(1)
    expect(mobile(container)).not.toHaveClass('open')
  })

  it('UT-NAV-015 Escape while open closes and focuses the hamburger', async () => {
    const user = userEvent.setup()
    const { container } = setup()
    await user.click(hamburger())
    document.body.focus()
    await user.keyboard('{Escape}')
    expect(mobile(container)).not.toHaveClass('open')
    expect(hamburger()).toHaveFocus()
  })

  it('UT-NAV-016 Escape while closed: no state change, focus unchanged; other keys ignored', async () => {
    const user = userEvent.setup()
    const { container } = setup()
    const other = document.createElement('button')
    document.body.appendChild(other)
    other.focus()
    await user.keyboard('{Escape}')
    expect(mobile(container)).not.toHaveClass('open')
    expect(other).toHaveFocus()
    await user.click(hamburger())
    await user.keyboard('a{ArrowDown}{Tab}')
    expect(mobile(container)).toHaveClass('open')
    other.remove()
  })

  it('UT-NAV-017 key listener removed on close and on unmount', async () => {
    const user = userEvent.setup()
    const add = vi.spyOn(document, 'addEventListener')
    const remove = vi.spyOn(document, 'removeEventListener')
    const keyAdds = () => add.mock.calls.filter(([t]) => t === 'keydown')
    const keyRemoves = () => remove.mock.calls.filter(([t]) => t === 'keydown')
    const { unmount } = setup()
    expect(keyAdds()).toHaveLength(0) // none while closed
    await user.click(hamburger())
    expect(keyAdds()).toHaveLength(1)
    await user.click(hamburger()) // close
    expect(keyRemoves().length).toBe(1)
    expect(keyRemoves()[0][1]).toBe(keyAdds()[0][1])
    await user.click(hamburger()) // open again
    expect(keyAdds()).toHaveLength(2)
    unmount()
    expect(keyRemoves()).toHaveLength(2)
  })

  it('UT-NAV-018 nav has aria-label "Primary"; theme toggle name names the target mode without ligature text', () => {
    const { container } = setup()
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBe(container.querySelector('nav'))
    const nav = within(container.querySelector('nav'))
    const toggle = nav.getByRole('button', { name: 'Day' }) // night -> offers Day
    expect(toggle.textContent).toContain('light_mode')
    expect(toggle).toHaveAccessibleName('Day')
    expect(toggle).not.toHaveAccessibleName(/light_mode/)
    act(() => {})
    fireEvent.click(toggle)
  })
})

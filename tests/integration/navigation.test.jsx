import { act, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App.jsx'
import { renderAndSettle, setScrollY, stubOffsetTops } from '../utils/appHelpers.jsx'

const OFFSETS = {
  hero: 0, about: 900, experience: 1600, skills: 2400, projects: 3300,
  design: 4000, education: 4700, certifications: 5300, resume: 5800, contact: 6400,
}
let restoreOffsets
beforeEach(() => {
  restoreOffsets = stubOffsetTops(OFFSETS)
  setScrollY(0)
})
afterEach(() => {
  restoreOffsets()
  delete window.scrollY
})

const scrollTo = (y) => {
  setScrollY(y)
  act(() => {
    window.dispatchEvent(new Event('scroll'))
  })
}
const activeHrefs = (selector) =>
  [...document.querySelectorAll(selector)].filter((a) => a.classList.contains('active')).map((a) => a.getAttribute('href'))

describe('navigation scroll state (ARC-009, ARC-014, ARC-002)', () => {
  it('IT-025 active-section tracking drives the nav highlight', async () => {
    await renderAndSettle(<App />)
    const lists = ['.nav-links a.nav-link', '.mobile-menu a.nav-link']

    scrollTo(2400 - 140)
    for (const sel of lists) expect(activeHrefs(sel), sel).toEqual(['#skills'])

    scrollTo(2400 - 141)
    for (const sel of lists) expect(activeHrefs(sel), sel).toEqual(['#experience'])

    scrollTo(0)
    for (const sel of lists) expect(activeHrefs(sel), sel).toEqual([])
  })

  it('IT-026 scroll threshold toggles nav.scrolled', async () => {
    await renderAndSettle(<App />)
    const nav = document.querySelector('nav.nav')
    scrollTo(30)
    expect(nav).not.toHaveClass('scrolled')
    scrollTo(31)
    expect(nav).toHaveClass('scrolled')
    scrollTo(0)
    expect(nav).not.toHaveClass('scrolled')
  })
})

describe('mobile menu (ARC-014, ARC-010)', () => {
  it('IT-027 mobile menu state machine, Escape and focus return', async () => {
    const user = userEvent.setup()
    await renderAndSettle(<App />)
    const burger = document.querySelector('.hamburger')
    const menu = () => document.querySelector('.mobile-menu')
    const isOpen = () => menu().classList.contains('open') && burger.getAttribute('aria-expanded') === 'true'
    const isClosed = () => !menu().classList.contains('open') && burger.getAttribute('aria-expanded') === 'false'

    expect(document.getElementById(burger.getAttribute('aria-controls'))).toBe(menu())
    expect(isClosed()).toBe(true)

    await user.click(burger)
    expect(isOpen()).toBe(true)

    await user.keyboard('{Escape}')
    expect(isClosed()).toBe(true)
    expect(document.activeElement).toBe(burger)

    await user.click(burger)
    expect(isOpen()).toBe(true)
    await user.click(menu().querySelector('a[href="#contact"]'))
    expect(isClosed()).toBe(true)

    const before = document.documentElement.dataset.theme
    await user.click(burger)
    expect(isOpen()).toBe(true)
    await user.click(menu().querySelector('.theme-btn'))
    expect(isClosed()).toBe(true)
    expect(document.documentElement.dataset.theme).not.toBe(before)

    await user.click(burger)
    expect(isOpen()).toBe(true)
    await user.tab()
    expect(menu().contains(document.activeElement)).toBe(true)
    await user.keyboard('{Escape}')
    expect(isClosed()).toBe(true)
    expect(document.activeElement).toBe(burger)

    // Escape while closed does nothing
    burger.blur()
    const active = document.activeElement
    await user.keyboard('{Escape}')
    expect(isClosed()).toBe(true)
    expect(document.activeElement).toBe(active)
    expect(document.activeElement).not.toBe(burger)
  })
})

describe('skip link (ARC-002, ARC-014, ARC-017)', () => {
  it('IT-028 skip link -> main#main focus', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.tab()
    const skip = document.activeElement
    expect(skip).toHaveClass('skip-link')
    expect(skip.tagName).toBe('A')
    expect(skip).toHaveTextContent('Skip to content')
    expect(skip).toHaveAttribute('href', '#main')
    const nav = document.querySelector('nav.nav')
    expect(skip.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    const main = document.querySelector('main')
    expect(main.id).toBe('main')
    expect(main.tabIndex).toBe(-1)

    await user.keyboard('{Enter}')
    expect(window.location.hash).toBe('#main')
    main.focus() // jsdom does not move focus for fragment navigation; the target must be focusable
    expect(document.activeElement).toBe(main)
    await act(async () => {})
  })
})

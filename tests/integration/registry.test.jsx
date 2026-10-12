import { render, within } from '@testing-library/react'
import App from '../../src/App.jsx'
import { NAV_ITEMS, SECTIONS } from '../../src/config/sections.js'
import { renderAndSettle, settle } from '../utils/appHelpers.jsx'

const navAnchors = (selector) =>
  [...document.querySelectorAll(selector)].map((a) => ({
    label: a.textContent.replace(a.querySelector('span')?.textContent ?? '', '').trim(),
    href: a.getAttribute('href'),
    icon: a.querySelector('span')?.textContent,
  }))

describe('section registry integration (ARC-002, ARC-004, ARC-014, ARC-016)', () => {
  it('IT-009 section registry -> App render order and dividers', async () => {
    await renderAndSettle(<App />)
    const sections = [...document.querySelectorAll('[data-section]')]
    expect(sections.map((s) => s.dataset.section)).toEqual(SECTIONS.map((s) => s.id))
    for (const s of sections) expect(s.id).toBe(s.dataset.section)
    expect(document.querySelector('[data-section-placeholder]')).toBeNull()

    const main = document.querySelector('main')
    const dividers = main.querySelectorAll(':scope > .divider')
    expect(dividers).toHaveLength(9)
    const kids = [...main.children]
    kids.forEach((el, i) => {
      if (i % 2 === 0) expect(el.dataset.section).toBe(SECTIONS[i / 2].id)
      else expect(el).toHaveClass('divider')
    })
    expect(kids).toHaveLength(19)
  })

  it('IT-010 nav links derived from NAV_ITEMS', async () => {
    await renderAndSettle(<App />)
    const expected = NAV_ITEMS.map((s) => ({ label: s.label, href: `#${s.id}`, icon: s.icon }))
    expect(navAnchors('.nav-links a')).toEqual(expected)
    expect(navAnchors('.mobile-menu a')).toEqual(expected)
    expect(NAV_ITEMS).toEqual(SECTIONS.filter((s) => s.showInNav))
    expect(document.querySelector('nav a[href="#hero"], .mobile-menu a[href="#hero"]')).toBeNull()
  })
})

describe('registry override (ARC-004, ARC-002, ARC-014)', () => {
  afterAll(() => {
    vi.doUnmock('../../src/config/sections.js')
    vi.resetModules()
  })

  it('IT-011 registry change propagates to App and Nav (one entry = one section)', async () => {
    const real = await vi.importActual('../../src/config/sections.js')
    const ExtraStub = () => (
      <section id="extra" data-section="extra">
        extra stub
      </section>
    )
    const modified = [
      ...real.SECTIONS.map((s) => (s.id === 'skills' ? { ...s, label: 'Stack' } : s)),
      { id: 'extra', label: 'Extra', icon: 'star', showInNav: true, lazy: false, minHeight: 0, component: ExtraStub },
    ]
    vi.doMock('../../src/config/sections.js', () => ({
      ...real,
      SECTIONS: modified,
      NAV_ITEMS: modified.filter((s) => s.showInNav),
    }))
    vi.resetModules()
    const { default: FreshApp } = await import('../../src/App.jsx')
    render(<FreshApp />)
    await settle({ expected: 11 })

    const nav = document.querySelector('.nav-links')
    expect(within(nav).getByRole('link', { name: /Stack/ })).toHaveAttribute('href', '#skills')
    expect(nav.querySelectorAll('a')).toHaveLength(10)
    expect(nav.querySelector('a[href="#extra"]')).not.toBeNull()

    const main = document.querySelector('main')
    const kids = [...main.children]
    const last = kids[kids.length - 1]
    expect(last.id).toBe('extra')
    expect(last.dataset.section).toBe('extra')
    expect(kids[kids.length - 2]).toHaveClass('divider')
  })
})

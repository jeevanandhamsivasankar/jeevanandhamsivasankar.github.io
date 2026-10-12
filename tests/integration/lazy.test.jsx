import { act, render } from '@testing-library/react'
import App from '../../src/App.jsx'
import { SECTIONS } from '../../src/config/sections.js'
import { getIntersectionObservers, triggerIntersection } from '../utils/browserMocks.js'
import { setScrollY, settle, stubOffsetTops } from '../utils/appHelpers.jsx'

describe('lazy sections (ARC-002, ARC-004, ARC-016, ARC-010, ARC-009)', () => {
  it('IT-012 lazy sections + Suspense + reveal observer', async () => {
    render(<App />)
    const lazyEntries = SECTIONS.filter((s) => s.lazy)
    expect(lazyEntries).toHaveLength(9)
    for (const entry of lazyEntries) {
      const ph = document.getElementById(entry.id)
      expect(ph).not.toBeNull()
      expect(ph).toHaveAttribute('data-section', entry.id)
      expect(ph).toHaveAttribute('data-section-placeholder')
      expect(ph.style.minHeight).toBe(`${entry.minHeight}px`)
    }

    await settle()
    expect(document.querySelector('[data-section-placeholder]')).toBeNull()

    const observers = getIntersectionObservers().filter((o) => o.thresholds.includes(0.06))
    for (const entry of lazyEntries) {
      const section = document.getElementById(entry.id)
      const reveals = [...section.querySelectorAll('.reveal')]
      if (reveals.length === 0) continue
      const matching = observers.filter((o) => reveals.some((r) => o.elements.has(r)))
      expect(matching, entry.id).toHaveLength(1)
      expect(matching[0].thresholds).toEqual([0.06])
      expect([...matching[0].elements].sort()).toEqual([...reveals].sort())
    }

    const about = document.getElementById('about')
    const reveals = [...about.querySelectorAll('.reveal')]
    expect(reveals.length).toBeGreaterThan(0)
    const aboutObs = observers.find((o) => o.elements.has(reveals[0]))
    for (const el of reveals) act(() => triggerIntersection(el, true))
    for (const el of reveals) {
      expect(el).toHaveClass('visible')
      expect(aboutObs.elements.has(el)).toBe(false)
    }
  })
})

describe('deep link (ARC-002, ARC-009, ARC-004)', () => {
  afterEach(() => {
    vi.doUnmock('../../src/sections/Resume.jsx')
    vi.resetModules()
    window.location.hash = ''
  })

  it('IT-013 deep link to a lazy section and placeholder-based active tracking', async () => {
    let release
    const gate = new Promise((resolve) => {
      release = resolve
    })
    const realResume = await vi.importActual('../../src/sections/Resume.jsx')
    vi.doMock('../../src/sections/Resume.jsx', async () => {
      await gate
      return realResume
    })
    vi.resetModules()
    window.location.hash = '#resume'
    const scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView')
    const { default: FreshApp } = await import('../../src/App.jsx')
    const restore = stubOffsetTops({ hero: 0, about: 900, experience: 1600, skills: 2400, projects: 3300, design: 4000, education: 4700, certifications: 5300, resume: 5800, contact: 9000 })

    let view
    await act(async () => {
      view = render(<FreshApp />)
    })
    // other sections resolve; the Resume import is held
    for (let i = 0; i < 40 && document.querySelectorAll('[data-section-placeholder]').length > 1; i += 1) {
      await act(async () => {
        await new Promise((r) => setTimeout(r, 10))
      })
    }
    const ph = document.getElementById('resume')
    expect(ph).toHaveAttribute('data-section-placeholder')
    expect(ph).toHaveAttribute('data-section', 'resume')
    expect(scrollSpy).not.toHaveBeenCalled()

    // active-section tracking counts the placeholder
    setScrollY(6000)
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    const active = [...document.querySelectorAll('.nav-links .nav-link.active')].map((a) => a.getAttribute('href'))
    expect(active).toEqual(['#resume'])

    release()
    await settle()
    expect(document.getElementById('resume')).not.toHaveAttribute('data-section-placeholder')
    expect(scrollSpy).toHaveBeenCalledTimes(1)
    expect(scrollSpy.mock.contexts[0].id).toBe('resume')

    view.rerender(<FreshApp />)
    await act(async () => {})
    expect(scrollSpy).toHaveBeenCalledTimes(1)
    restore()
  })
})

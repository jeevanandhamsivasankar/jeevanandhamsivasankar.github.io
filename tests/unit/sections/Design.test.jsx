import { fireEvent, render } from '@testing-library/react'
import Design from '../../../src/sections/Design.jsx'
import { URLS } from '../../../src/config/site.js'
import { norm, sectionFrame } from '../../utils/styleNorm.js'

const h = vi.hoisted(() => ({ override: null }))
vi.mock('../../../src/data/design.js', async (importActual) => {
  const actual = await importActual()
  return {
    ...actual,
    get DESIGN_CARDS() {
      return h.override ?? actual.DESIGN_CARDS
    },
  }
})

afterEach(() => {
  h.override = null
})

describe('UNIT-DESIGN', () => {
  it('UT-DESIGN-001 root id "design", full band; label "05 — Design Portfolio" (brush); title "Creative Work"', () => {
    const { container } = render(<Design />)
    const root = sectionFrame(container, {
      id: 'design', tag: 'div', labelIcon: 'brush', labelText: '05 — Design Portfolio', title: 'Creative Work',
    })
    expect(root).toHaveClass('full-band')
  })

  it('UT-DESIGN-002 5 a.behance-card; only "Infotainment UI Modules" wide; art svg; tag; "View on Behance"', () => {
    const { container } = render(<Design />)
    const cards = [...container.querySelectorAll('a.behance-card')]
    expect(cards).toHaveLength(5)
    const wide = cards.filter((c) => c.classList.contains('wide'))
    expect(wide).toHaveLength(1)
    expect(wide[0].querySelector('.bc-title').textContent).toBe('Infotainment UI Modules')
    cards.forEach((c) => {
      expect(c.querySelector('.behance-card-bg svg')).not.toBeNull()
      const tag = c.querySelector('.bc-tag')
      expect(tag.querySelector('span').textContent.length).toBeGreaterThan(0)
      expect(tag.style.color).not.toBe('')
      expect(c.querySelector('.bc-cta').textContent).toContain('View on Behance')
    })
    expect(cards[0].querySelector('.bc-tag').style.color).toBe(norm('color', '#f59e0b'))
  })

  it('UT-DESIGN-003 href Behance, target=_blank, rel="noopener noreferrer"', () => {
    const { container } = render(<Design />)
    container.querySelectorAll('a.behance-card').forEach((a) => {
      expect(a).toHaveAttribute('href', URLS.behance)
      expect(a).toHaveAttribute('target', '_blank')
      expect(a).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('UT-DESIGN-004 cards have reveal d<i mod 2>', () => {
    const { container } = render(<Design />)
    ;[...container.querySelectorAll('a.behance-card')].forEach((a, i) => {
      expect(a).toHaveClass('reveal', `d${i % 2}`)
    })
  })

  it('UT-DESIGN-005 unknown artKey: card renders without art, no crash', () => {
    h.override = [
      {
        tag: 'T', icon: 'brush', color: '#f59e0b', title: 'No Art', desc: 'd', wide: false,
        artKey: 'does-not-exist', href: URLS.behance,
      },
    ]
    const { container } = render(<Design />)
    const card = container.querySelector('a.behance-card')
    expect(card).not.toBeNull()
    expect(card.querySelector('.behance-card-bg')).toBeEmptyDOMElement()
    expect(card.querySelector('.bc-title').textContent).toBe('No Art')
  })

  it('UT-DESIGN-006 hover has no inline CTA handler in the baseline; hover/leave leave the CTA unchanged', () => {
    const { container } = render(<Design />)
    const card = container.querySelector('a.behance-card')
    const cta = card.querySelector('.bc-cta')
    const before = cta.getAttribute('style')
    fireEvent.mouseOver(card)
    expect(cta.getAttribute('style')).toBe(before)
    fireEvent.mouseOut(card)
    expect(cta.getAttribute('style')).toBe(before)
  })
})

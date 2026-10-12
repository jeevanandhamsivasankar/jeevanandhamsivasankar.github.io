import { createRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import Hero from '../../../src/sections/Hero.jsx'
import { RESUME } from '../../../src/config/site.js'
import { HERO_BADGES, GAUGE_STATS, GAUGE_STACK_TAGS, PROFILE, PROFILE_TAGS, HERO_ROLES } from '../../../src/data/profile.js'
import { norm } from '../../utils/styleNorm.js'

const h = vi.hoisted(() => ({
  reduced: false,
  typed: 'TYPED',
  twCalls: [],
  parCalls: [],
  parRef: null,
}))

vi.mock('../../../src/hooks/usePrefersReducedMotion.js', () => ({ usePrefersReducedMotion: () => h.reduced }))
vi.mock('../../../src/hooks/useTypewriter.js', () => ({
  useTypewriter: (words, opts) => {
    h.twCalls.push([words, opts])
    return h.typed
  },
}))
vi.mock('../../../src/hooks/useParallax.js', () => ({
  useParallax: (opts) => {
    h.parCalls.push(opts)
    return h.parRef
  },
}))
vi.mock('../../../src/components/widgets/Speedometer.jsx', () => ({
  default: () => <svg data-testid="speedometer" />,
}))

beforeEach(() => {
  h.reduced = false
  h.typed = 'TYPED'
  h.twCalls = []
  h.parCalls = []
  h.parRef = createRef()
})

describe('UNIT-HERO', () => {
  it('UT-HERO-001 section#hero.hero[data-section=hero] with .hero-content, .hero-center, .hero-right', () => {
    const { container } = render(<Hero />)
    const root = container.firstElementChild
    expect(root.tagName).toBe('SECTION')
    expect(root).toHaveAttribute('id', 'hero')
    expect(root).toHaveAttribute('data-section', 'hero')
    expect(root).toHaveClass('hero')
    for (const c of ['hero-content', 'hero-center', 'hero-right']) expect(root.querySelector(`.${c}`)).not.toBeNull()
  })

  it('UT-HERO-002 tag line with developer_board icon; one h1 with em "Jeevanandham" and br before "B.ECE"', () => {
    const { container } = render(<Hero />)
    const tag = container.querySelector('.hero-tag')
    expect(tag.firstChild.textContent).toBe('developer_board')
    expect(tag.textContent).toBe('developer_board' + PROFILE.heroTag)
    const h1s = container.querySelectorAll('h1')
    expect(h1s).toHaveLength(1)
    expect(h1s[0].querySelector('em').textContent).toBe('Jeevanandham')
    const br = h1s[0].querySelector('br')
    expect(br).not.toBeNull()
    expect(br.nextSibling.textContent).toBe('B.ECE')
  })

  it('UT-HERO-003 .hero-typewriter shows useTypewriter output followed by the cursor element', () => {
    const { container } = render(<Hero />)
    const tw = container.querySelector('.hero-typewriter')
    expect(tw.children[0].textContent).toBe('TYPED')
    expect(tw.children[1]).toHaveClass('cursor')
    expect(h.twCalls[0][0]).toEqual(HERO_ROLES)
  })

  it('UT-HERO-004 bio with 2 strong elements built from data segments (no HTML strings)', () => {
    const { container } = render(<Hero />)
    const bio = container.querySelector('.hero-bio')
    const strong = [...bio.querySelectorAll('strong')].map((s) => s.textContent)
    expect(strong).toEqual(['4.9+ years', 'Qt/QML, Embedded C++, and real-time UI engineering'])
    expect(bio.textContent).toBe(PROFILE.bio.map((s) => (typeof s === 'string' ? s : s.text)).join(''))
  })

  it('UT-HERO-005 8 Badges from data', () => {
    const { container } = render(<Hero />)
    const badges = [...container.querySelectorAll('.hero-badges .badge')]
    expect(badges.map((b) => b.textContent)).toEqual([...HERO_BADGES])
    expect(badges).toHaveLength(8)
  })

  it('UT-HERO-006 3 Buttons: amber #projects, outline #contact, green resume with download name', () => {
    const { container } = render(<Hero />)
    const btns = [...container.querySelectorAll('.hero-cta a')]
    expect(btns).toHaveLength(3)
    expect(btns[0]).toHaveClass('btn-amber')
    expect(btns[0]).toHaveAttribute('href', '#projects')
    expect(btns[1]).toHaveClass('btn-outline')
    expect(btns[1]).toHaveAttribute('href', '#contact')
    expect(btns[2]).toHaveClass('btn-green')
    expect(btns[2]).toHaveAttribute('href', RESUME.href)
    expect(btns[2]).toHaveAttribute('download', RESUME.downloadName)
  })

  it('UT-HERO-007 gauge widget: label, Speedometer, 3 gauge stats with inline colours, 5 stack tags', () => {
    const { container } = render(<Hero />)
    const gw = container.querySelector('.gauge-widget')
    expect(gw.querySelector('.gauge-label-top').textContent).toBe(PROFILE.gaugeLabel)
    expect(screen.getByTestId('speedometer')).toBeInTheDocument()
    const stats = [...gw.querySelectorAll('.gauge-stat')]
    expect(stats).toHaveLength(3)
    stats.forEach((s, i) => {
      expect(s.querySelector('.gauge-stat-val').textContent).toBe(GAUGE_STATS[i].num)
      expect(s.querySelector('.gauge-stat-val').style.color).toBe(norm('color', GAUGE_STATS[i].color))
      expect(s.querySelector('.gauge-stat-lbl').textContent).toBe(GAUGE_STATS[i].label)
    })
    expect([...gw.querySelectorAll('.gauge-stack-tag')].map((t) => t.textContent)).toEqual([...GAUGE_STACK_TAGS])
    expect(GAUGE_STACK_TAGS).toHaveLength(5)
  })

  it('UT-HERO-008 profile card: img attrs, .scan, 4 .corner, panel texts and 4 tags', () => {
    const { container } = render(<Hero />)
    const img = container.querySelector('img.profile-photo')
    expect(img).toHaveAttribute('src', PROFILE.photo.src)
    expect(img).toHaveAttribute('alt', PROFILE.photo.alt)
    expect(img).toHaveAttribute('width', '600')
    expect(img).toHaveAttribute('height', '900')
    expect(img).toHaveAttribute('decoding', 'async')
    expect(container.querySelector('.scan')).not.toBeNull()
    expect(container.querySelectorAll('.corner')).toHaveLength(4)
    expect(container.querySelector('.pname').textContent).toBe(PROFILE.displayName)
    expect(container.querySelector('.prole').textContent).toBe(PROFILE.titleCaps)
    expect(container.querySelector('.status-row').textContent).toBe(PROFILE.status)
    const tags = [...container.querySelectorAll('.ptag')].map((t) => t.textContent)
    expect(tags).toEqual([...PROFILE_TAGS])
    expect(tags).toHaveLength(4)
  })

  it('UT-HERO-009 error on the profile img sets display none; panel remains', () => {
    const { container } = render(<Hero />)
    const img = container.querySelector('img.profile-photo')
    fireEvent.error(img)
    expect(img.style.display).toBe('none')
    expect(container.querySelector('.profile-info-panel')).toBeInTheDocument()
    expect(container.querySelector('.pname')).toBeVisible()
  })

  it('UT-HERO-010 parallax ref attached to .profile-card with inline transition "transform 0.15s ease-out"', () => {
    const { container } = render(<Hero />)
    const card = container.querySelector('.profile-card')
    expect(h.parRef.current).toBe(card)
    expect(card.style.transition).toBe('transform 0.15s ease-out')
  })

  it('UT-HERO-011 renders Particles and 4 .hring in .hero-rings (aria-hidden)', () => {
    const { container } = render(<Hero />)
    expect(container.querySelectorAll('.particle')).toHaveLength(18)
    const rings = container.querySelector('.hero-rings')
    expect(rings.querySelectorAll('.hring')).toHaveLength(4)
    expect(rings).toHaveAttribute('aria-hidden', 'true')
  })

  it('UT-HERO-012 reduced motion: typewriter enabled:false, parallax enabled:false', () => {
    h.reduced = true
    render(<Hero />)
    expect(h.twCalls.at(-1)[1]).toEqual(expect.objectContaining({ enabled: false }))
    expect(h.parCalls.at(-1)).toEqual(expect.objectContaining({ enabled: false }))
    // and enabled otherwise
    h.reduced = false
    render(<Hero />)
    expect(h.twCalls.at(-1)[1]).toEqual(expect.objectContaining({ enabled: true }))
    expect(h.parCalls.at(-1)).toEqual(expect.objectContaining({ enabled: true }))
  })
})

import { fireEvent, render } from '@testing-library/react'
import Skills from '../../src/sections/Skills.jsx'
import { SKILL_CATEGORIES } from '../../src/data/skills.js'
import { CUSTOM_SVGS } from '../../src/components/tech/customSvgs.jsx'
import { SIMPLE_ICONS_BASE } from '../../src/components/tech/iconStrategies.js'

const specs = SKILL_CATEGORIES.flatMap((c) => c.skills)
const count = (prefix) => specs.filter((s) => s.icon.startsWith(prefix)).length

describe('skills with tech icons (ARC-011, ARC-016, ARC-006, ARC-010)', () => {
  it('IT-019 TechIcon strategies inside SkillChip in the Skills section', () => {
    const { container } = render(<Skills />)
    const chips = [...container.querySelectorAll('.skill-chip')]
    expect(chips).toHaveLength(specs.length)

    const wraps = chips.map((c) => c.querySelector('.chip-icon-wrap'))
    expect(container.querySelectorAll('.chip-icon-wrap img')).toHaveLength(count('si:'))
    expect(container.querySelectorAll('.chip-icon-wrap svg')).toHaveLength(count('svg:'))
    const msSpans = wraps.filter((w) => w.querySelector('span[aria-hidden="true"]') && !w.querySelector('img, svg'))
    expect(msSpans).toHaveLength(count('ms:'))

    specs.forEach((spec, i) => {
      const wrap = wraps[i]
      const [kind, value] = spec.icon.split(':')
      if (kind === 'si') {
        const img = wrap.querySelector('img')
        expect(img, spec.name).not.toBeNull()
        expect(img).toHaveAttribute('alt', value)
        expect(img).toHaveAttribute('src', `https://cdn.simpleicons.org/${value}`)
        expect(img.getAttribute('src').startsWith(SIMPLE_ICONS_BASE)).toBe(true)
      } else if (kind === 'svg') {
        expect(Object.hasOwn(CUSTOM_SVGS, value), `${spec.name} -> ${value}`).toBe(true)
        expect(wrap.querySelector('svg'), spec.name).not.toBeNull()
        expect(wrap.textContent, `${spec.name} must not use the code fallback`).not.toBe('code')
      } else {
        expect(wrap.textContent).toBe(value)
      }
    })
  })

  it('IT-020 CDN image error falls back only for the affected chip', () => {
    const { container } = render(<Skills />)
    const chipOf = (name) => [...container.querySelectorAll('.skill-chip')].find((c) => c.textContent.includes(name))
    const git = chipOf('Git')
    const gitImg = git.querySelector('img')
    expect(gitImg).not.toBeNull()
    const before = container.querySelectorAll('img').length

    fireEvent.error(gitImg)
    const icon = git.querySelector('.chip-icon-wrap span')
    expect(git.querySelector('img')).toBeNull()
    expect(icon).toHaveTextContent('code')
    const gitColor = specs.find((s) => s.name === 'Git').color
    const probe = document.createElement('i')
    probe.style.color = gitColor
    expect(icon.style.color).toBe(probe.style.color)
    expect(container.querySelectorAll('img')).toHaveLength(before - 1)

    for (const img of container.querySelectorAll('img')) fireEvent.error(img)
    const chips = container.querySelectorAll('.skill-chip')
    expect(chips).toHaveLength(58)
    for (const chip of chips) expect(chip.querySelector('img')).toBeNull()
  })
})

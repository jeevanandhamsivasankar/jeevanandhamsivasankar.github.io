import { fireEvent, render } from '@testing-library/react'
import SkillChip from '../../../../src/components/tech/SkillChip.jsx'

const skill = { name: 'Qt/QML', icon: 'ms:code', color: '#22d3ee' }
const CAT = '#f59e0b'
const chip = (c) => c.querySelector('.skill-chip')

describe('UNIT-SKILL_CHIP', () => {
  it('UT-SKILL_CHIP-001 renders .skill-chip > .chip-icon-wrap (TechIcon size 22) and .chip-label', () => {
    const { container } = render(<SkillChip skill={{ ...skill, icon: 'si:qt' }} catColor={CAT} />)
    const wrap = chip(container).querySelector('.chip-icon-wrap')
    expect(wrap).not.toBeNull()
    expect(wrap.querySelector('img')).toHaveAttribute('width', '22')
    const label = chip(container).querySelector('.chip-label')
    expect(label.textContent).toBe('Qt/QML')
  })

  it('UT-SKILL_CHIP-002 TechIcon colour = skill.color, or catColor when absent', () => {
    const { container, unmount } = render(<SkillChip skill={skill} catColor={CAT} />)
    expect(container.querySelector('.chip-icon-wrap span').style.color).toBe('rgb(34, 211, 238)')
    unmount()
    const { container: c2 } = render(<SkillChip skill={{ name: 'X', icon: 'ms:code' }} catColor={CAT} />)
    expect(c2.querySelector('.chip-icon-wrap span').style.color).toBe('rgb(245, 158, 11)')
  })

  it('UT-SKILL_CHIP-003 hover: borderColor catColor+66, boxShadow, label colour = skill colour', () => {
    const { container } = render(<SkillChip skill={skill} catColor={CAT} />)
    fireEvent.mouseEnter(chip(container))
    // jsdom normalises colours; compare through a probe element
    const probe = document.createElement('div')
    probe.style.borderColor = CAT + '66'
    expect(chip(container).style.borderColor).toBe(probe.style.borderColor)
    expect(chip(container).getAttribute('style')).toContain('inset 0 1px 0 var(--glass-shine)')
    expect(chip(container).style.boxShadow).toContain('0 6px 24px')
    expect(chip(container).style.boxShadow).toContain('var(--glass-shine)')
    expect(container.querySelector('.chip-label').style.color).toBe('rgb(34, 211, 238)')
  })

  it('UT-SKILL_CHIP-004 mouse leave restores empty inline styles', () => {
    const { container } = render(<SkillChip skill={skill} catColor={CAT} />)
    fireEvent.mouseEnter(chip(container))
    fireEvent.mouseLeave(chip(container))
    expect(chip(container).style.borderColor).toBe('')
    expect(chip(container).style.boxShadow).toBe('')
    expect(container.querySelector('.chip-label').style.color).toBe('')
  })

  it('UT-SKILL_CHIP-005 skill without colour: hover label colour = catColor', () => {
    const { container } = render(<SkillChip skill={{ name: 'X', icon: 'ms:code' }} catColor={CAT} />)
    fireEvent.mouseEnter(chip(container))
    expect(container.querySelector('.chip-label').style.color).toBe('rgb(245, 158, 11)')
  })
})

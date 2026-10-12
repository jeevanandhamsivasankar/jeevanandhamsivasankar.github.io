import { SKILL_CATEGORIES, SAFETY_HIGHLIGHT } from '../../../src/data/skills.js'
import { parseIconRef } from '../../../src/components/tech/iconStrategies.js'
import { CUSTOM_SVGS } from '../../../src/components/tech/customSvgs.jsx'

const allSkills = SKILL_CATEGORIES.flatMap((c) => c.skills)

describe('UNIT-DATA_SKILLS', () => {
  it('UT-DATA_SKILLS-001 9 categories in order with skill counts 9,10,7,5,10,5,1,8,3 (58 total)', () => {
    expect(SKILL_CATEGORIES.map((c) => c.label)).toEqual([
      'Primary Language', 'HMI Frameworks', 'Embedded & OS', 'Communication Interfaces', 'Tools & DevOps',
      'Testing & Debugging', 'Database', 'Design & UX', 'Methodologies',
    ])
    expect(SKILL_CATEGORIES.map((c) => c.skills.length)).toEqual([9, 10, 7, 5, 10, 5, 1, 8, 3])
    expect(allSkills).toHaveLength(58)
    expect(Object.isFrozen(SKILL_CATEGORIES)).toBe(true)
  })

  it('UT-DATA_SKILLS-002 category labels unique; skill names unique within each category', () => {
    const labels = SKILL_CATEGORIES.map((c) => c.label)
    expect(new Set(labels).size).toBe(labels.length)
    for (const c of SKILL_CATEGORIES) {
      const names = c.skills.map((s) => s.name)
      expect(new Set(names).size, c.label).toBe(names.length)
    }
  })

  it('UT-DATA_SKILLS-003 every headerColor is 7-char hex and every headerBg an rgba tint', () => {
    for (const c of SKILL_CATEGORIES) {
      expect(c.headerColor, c.label).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(c.headerBg, c.label).toMatch(/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/)
    }
  })

  it('UT-DATA_SKILLS-004 every skill icon parses with parseIconRef into si/ms/svg', () => {
    for (const s of allSkills) {
      const { kind, value } = parseIconRef(s.icon)
      expect(['si', 'ms', 'svg'], s.name).toContain(kind)
      expect(value.length, s.name).toBeGreaterThan(0)
    }
  })

  it('UT-DATA_SKILLS-005 every svg: key exists in CUSTOM_SVGS', () => {
    const keys = allSkills.map((s) => parseIconRef(s.icon)).filter((p) => p.kind === 'svg').map((p) => p.value)
    expect(keys.length).toBeGreaterThan(0)
    for (const k of keys) expect(Object.keys(CUSTOM_SVGS), k).toContain(k)
  })

  it('UT-DATA_SKILLS-006 set of si: slugs equals the SRS EI-2 list (19 slugs)', () => {
    const slugs = new Set(
      allSkills.map((s) => parseIconRef(s.icon)).filter((p) => p.kind === 'si').map((p) => p.value),
    )
    expect([...slugs].sort()).toEqual(
      [
        'cplusplus', 'qt', 'lua', 'linux', 'yoctoproject', 'ubuntu', 'stmicroelectronics', 'git', 'jira', 'cmake',
        'jenkins', 'sqlite', 'figma', 'adobeillustrator', 'adobexd', 'adobephotoshop', 'gimp', 'affinity', 'miro',
      ].sort(),
    )
    expect(slugs.size).toBe(19)
  })

  it('UT-DATA_SKILLS-007 SAFETY_HIGHLIGHT title, description and 5 chips in order', () => {
    expect(SAFETY_HIGHLIGHT.title).toBe('ISO 26262 Awareness')
    expect(SAFETY_HIGHLIGHT.desc).toBe(
      'Safety-oriented HMI behavior with focus on system reliability, deterministic performance, and user-safety considerations. Practical application across automotive HMI projects — safety-aware UI interaction design, structured validation flows, and Functional Safety methodology awareness.',
    )
    expect([...SAFETY_HIGHLIGHT.chips]).toEqual([
      'Safety-Aware UI', 'Deterministic Performance', 'Structured Validation', 'FMEA Awareness', 'Fail-Safe Patterns',
    ])
  })
})

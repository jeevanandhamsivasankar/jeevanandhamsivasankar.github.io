import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as typesModule from '../../../src/models/types.js'

const src = readFileSync(resolve(process.cwd(), 'src/models/types.js'), 'utf8')
const typedefNames = [...src.matchAll(/@typedef\s+(?:\{(?:[^{}]|\{[^{}]*\})*\}\s+|\{[\s\S]*?\}\s+)?(\w+)/g)].map((m) => m[1])
const allNames = new Set(
  [...src.matchAll(/@typedef\b[\s\S]*?(?=\*\/)/g)].map((m) => {
    const body = m[0].replace(/^@typedef\s*/, '')
    // object typedef without a type: "@typedef {Object} Name"; or "{type} Name"
    const mm = body.match(/^\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}\s+(\w+)/)
    return mm ? mm[1] : null
  }).filter(Boolean),
)

/** STP names -> accepted names in the SUDS/implementation (the two documents use different names for three). */
const REQUIRED = {
  Profile: ['Profile'],
  Photo: ['Photo'],
  Stat: ['Stat'],
  GaugeStat: ['GaugeStat', 'Stat'],
  Section: ['Section', 'SectionEntry'],
  Experience: ['Experience'],
  SkillCategory: ['SkillCategory'],
  Skill: ['Skill'],
  Project: ['Project'],
  DesignCard: ['DesignCard'],
  Education: ['Education'],
  Certification: ['Certification'],
  ContactLink: ['ContactLink'],
  ResumeInfo: ['ResumeInfo', 'ResumePreview'],
  ResumeSkill: ['ResumeSkill'],
  Highlight: ['Highlight'],
  IconRef: ['IconRef'],
  CssColor: ['CssColor'],
}

const blocks = [...src.matchAll(/\/\*\*[\s\S]*?\*\//g)].map((m) => m[0]).filter((b) => !b.includes("import("))
const propsOf = (name) =>
  blocks.find((b) => new RegExp(`@typedef\\s+\\{[\\s\\S]*\\}\\s+${name}\\s*(\\n|\\*/|$|\\s)`).test(b) && b.split('@typedef').length === 2) ?? ''

describe('UNIT-TYPES', () => {
  it('UT-TYPES-001 contains a @typedef for each model', () => {
    expect(typedefNames.length).toBeGreaterThan(10)
    for (const [stpName, accepted] of Object.entries(REQUIRED)) {
      expect(accepted.some((n) => allNames.has(n)), `typedef for ${stpName}`).toBe(true)
    }
  })

  it('UT-TYPES-002 each typedef lists the required fields of the model', () => {
    const fields = {
      Profile: ['name', 'nameParts', 'title', 'location', 'email', 'phone', 'roles', 'bio', 'badges', 'photo', 'stats', 'aboutParagraphs'],
      Photo: ['src', 'alt', 'width', 'height'],
      Stat: ['label', 'num', 'color'],
      Experience: ['role', 'company', 'period', 'location', 'icon', 'desc'],
      Skill: ['name', 'icon'],
      SkillCategory: ['label', 'headerColor', 'headerBg', 'skills'],
      Project: ['title', 'num', 'period', 'domain', 'icon', 'color', 'bg', 'border', 'desc', 'tags', 'line'],
      DesignCard: ['title', 'tag', 'icon', 'color', 'desc', 'artKey', 'href'],
      Education: ['title', 'subtitle', 'icon', 'iconColor', 'tags', 'tagVariant'],
      Certification: ['name', 'org', 'icon'],
      ContactLink: ['kind', 'label', 'href', 'icon', 'external', 'group'],
      ResumeSkill: ['label', 'w', 'g'],
      Highlight: ['title', 'icon', 'titleIcon', 'desc', 'chips'],
    }
    for (const [name, list] of Object.entries(fields)) {
      const text = propsOf(name)
      expect(text, `typedef ${name} found`).not.toBe('')
      for (const f of list) expect(text, `${name}.${f}`).toMatch(new RegExp(`\\b${f}\\b`))
    }
  })

  it('UT-TYPES-003 module has no runtime side effects (exports nothing)', () => {
    expect(Object.keys(typesModule)).toEqual([])
    expect(src).not.toMatch(/^\s*import\s/m)
  })
})

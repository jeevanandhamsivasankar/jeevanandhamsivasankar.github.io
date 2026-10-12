import * as models from '../../../src/models/createModels.js'
import { ModelValidationError } from '../../../src/models/validate.js'

const {
  createProfile, createStat, createSection, createExperience, createSkill, createSkillCategory,
  createProject, createDesignCard, createEducation, createCertification, createContactLink,
  createResumeSkill, createResumePreview, createRichText, createPhoto, createHighlight,
} = models

const clone = (v) => structuredClone(v)

/* ---------- valid baseline fixtures (functions to give fresh copies) ---------- */
const fx = {
  photo: () => ({ src: 'profile.webp', alt: 'S. Jeevanandham', width: 600, height: 900 }),
  stat: () => ({ num: '4.9+', label: 'Yrs Exp', color: '#f59e0b' }),
  aboutStat: () => ({ icon: 'schedule', num: '4.9+', label: 'Years Experience', color: '#f59e0b' }),
  profile: () => ({
    name: 'S. Jeevanandham',
    nameParts: { before: 'S. ', emphasis: 'Jeevanandham', after: 'B.ECE' },
    displayName: 'S. JEEVANANDHAM',
    title: 'Senior HMI Engineer',
    titleCaps: 'SENIOR HMI ENGINEER',
    heroTag: 'Senior HMI Engineer · Chennai, India',
    location: 'Chennai, Tamil Nadu, India',
    email: 'jeevanandhamsivashankaran@gmail.com',
    phone: '+91 8111010315',
    roles: ['Qt / QML Developer', 'Embedded HMI Engineer'],
    bio: ['Senior engineer with ', { text: '4.9+ years', mark: 'strong' }, ' of HMI work.'],
    badges: ['Qt / QML', 'LVGL'],
    gaugeLabel: 'Live HMI Cluster Demo',
    gaugeStats: [{ num: '4.9+', label: 'Yrs Exp', color: '#f59e0b' }],
    stackTags: ['Qt/QML', 'LVGL'],
    profileTags: ['Automotive HMI', 'Medical HMI'],
    status: 'OPEN TO OPPORTUNITIES',
    photo: { src: 'profile.webp', alt: 'S. Jeevanandham', width: 600, height: 900 },
    stats: [{ icon: 'schedule', num: '4.9+', label: 'Years Experience', color: '#f59e0b' }],
    aboutParagraphs: [['I am a ', { text: 'Senior Software Engineer', mark: 'hl' }, '.']],
  }),
  hero: () => ({ id: 'hero', component: () => null, lazy: false, showInNav: false }),
  navSection: () => ({
    id: 'about', component: { $$typeof: Symbol.for('react.lazy'), _payload: {} }, lazy: true,
    showInNav: true, label: 'About', heading: 'About', icon: 'person', title: 'Who I Am', minHeight: 900,
  }),
  experience: () => ({
    icon: 'medical_services', role: 'Senior Software Engineer', company: 'PixelExpert',
    period: 'SEP 2024 — JAN 2026', location: 'Chennai, Tamil Nadu', desc: 'Led HMI design.',
  }),
  skill: () => ({ name: 'C++', icon: 'si:cplusplus', color: '#00599C' }),
  skillCategory: () => ({
    label: 'Primary Language', headerColor: '#f59e0b', headerBg: 'rgba(245,158,11,0.14)',
    skills: [{ name: 'C++', icon: 'si:cplusplus', color: '#00599C' }, { name: 'OOP', icon: 'svg:oop' }],
  }),
  project: () => ({
    period: 'OCT 2024 — JAN 2026', num: 'PROJECT_01', domain: 'Medical Device', icon: 'medical_services',
    color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)', title: 'Laser HMI',
    desc: 'Full-ownership HMI.', tags: ['Qt/QML', 'C++'], line: 'linear-gradient(90deg,#34d399,#22d3ee)',
  }),
  designCard: () => ({
    tag: 'AUTOMOTIVE', icon: 'directions_car', color: '#f59e0b', title: 'Clusters', desc: 'HMI design work.',
    artKey: 'cluster', href: 'https://behance.net/s_jeevanandham',
  }),
  education: () => ({
    title: 'B.E. ECE', subtitle: 'College', icon: 'school', iconColor: '#22d3ee',
    tags: ['2015 – 2020', 'ECE'], tagVariant: 'edu',
  }),
  certification: () => ({ name: 'QML for Beginners', org: 'UDEMY', icon: 'school' }),
  contact: () => ({
    kind: 'email', label: 'a@b.co', href: 'mailto:a@b.co', icon: 'mail', external: false, group: 'primary',
  }),
  resumeSkill: () => ({ label: 'Qt / QML', w: '92%', g: 'linear-gradient(90deg,#f59e0b,#22d3ee)' }),
  resumePreview: () => ({
    heading: 'Download My Resume', intro: 'Details.', fileLabel: 'RESUME.PDF', name: 'S. JEEVANANDHAM',
    roleLine: 'SENIOR', contactRows: [{ icon: 'mail', text: 'a@b.co' }], skillsHeading: 'KEY SKILLS',
    bars: [{ label: 'Qt / QML', w: '92%', g: 'linear-gradient(90deg,#f59e0b,#22d3ee)' }],
  }),
  highlight: () => ({
    title: 'ISO 26262 Awareness', icon: 'verified_user', titleIcon: 'shield', desc: 'Safety.', chips: ['A', 'B'],
  }),
  richText: () => ['a', { text: 'b', mark: 'hl' }],
}

/** [model name, factory, fresh-fixture function] */
const FACTORIES = [
  ['RichText', createRichText, fx.richText],
  ['Photo', createPhoto, fx.photo],
  ['Stat', createStat, fx.stat],
  ['Profile', createProfile, fx.profile],
  ['ResumeSkill', createResumeSkill, fx.resumeSkill],
  ['ResumePreview', createResumePreview, fx.resumePreview],
  ['Section', createSection, fx.hero],
  ['Experience', createExperience, fx.experience],
  ['Skill', createSkill, fx.skill],
  ['SkillCategory', createSkillCategory, fx.skillCategory],
  ['Highlight', createHighlight, fx.highlight],
  ['Project', createProject, fx.project],
  ['DesignCard', createDesignCard, fx.designCard],
  ['Education', createEducation, fx.education],
  ['Certification', createCertification, fx.certification],
  ['ContactLink', createContactLink, fx.contact],
]

const mutate = (make, fn) => {
  const raw = make()
  fn(raw)
  return raw
}
const rejects = (factory, raw, model) => {
  let err
  try {
    factory(raw)
  } catch (e) {
    err = e
  }
  expect(err, 'expected a throw').toBeInstanceOf(ModelValidationError)
  if (model) expect(err.model).toBe(model)
  return err
}

describe('UNIT-CREATE_MODELS', () => {
  it('UT-CREATE_MODELS-001 createProfile: valid baseline returns an equal, deeply frozen object', () => {
    const raw = fx.profile()
    const p = createProfile(raw)
    expect(p).toEqual({
      ...raw,
      bio: [{ text: 'Senior engineer with ' }, { text: '4.9+ years', mark: 'strong' }, { text: ' of HMI work.' }],
      aboutParagraphs: [[{ text: 'I am a ' }, { text: 'Senior Software Engineer', mark: 'hl' }, { text: '.' }]],
    })
    expect(Object.isFrozen(p)).toBe(true)
    expect(Object.isFrozen(p.roles)).toBe(true)
    expect(Object.isFrozen(p.photo)).toBe(true)
    expect(Object.isFrozen(p.bio)).toBe(true)
    expect(Object.isFrozen(p.bio[1])).toBe(true)
    expect(Object.isFrozen(p.gaugeStats[0])).toBe(true)
    expect(Object.isFrozen(p.aboutParagraphs[0][1])).toBe(true)
  })

  it('UT-CREATE_MODELS-002 createProfile rejects empty roles, bad photo size/alt and invalid email', () => {
    rejects(createProfile, mutate(fx.profile, (r) => { r.roles = [] }), 'Profile')
    for (const bad of [0, -1, '600', NaN, undefined]) {
      rejects(createProfile, mutate(fx.profile, (r) => { r.photo.width = bad }))
      rejects(createProfile, mutate(fx.profile, (r) => { r.photo.height = bad }))
    }
    rejects(createProfile, mutate(fx.profile, (r) => { r.photo.alt = '' }))
    rejects(createProfile, mutate(fx.profile, (r) => { r.email = 'not-an-email' }), 'Profile')
  })

  it('UT-CREATE_MODELS-003 createStat accepts an About stat and a gauge stat (icon omitted)', () => {
    expect(createStat(fx.aboutStat(), { requireIcon: true }).icon).toBe('schedule')
    const g = createStat(fx.stat())
    expect(g).toEqual(fx.stat())
    expect('icon' in g).toBe(false)
  })

  it('UT-CREATE_MODELS-004 createStat rejects numeric num, invalid colour and non-ligature icon', () => {
    rejects(createStat, mutate(fx.stat, (r) => { r.num = 4.9 }), 'Stat')
    rejects(createStat, mutate(fx.stat, (r) => { r.color = 'amber' }), 'Stat')
    rejects(createStat, mutate(fx.aboutStat, (r) => { r.icon = 'Not An Icon' }), 'Stat')
    rejects(createStat, mutate(fx.aboutStat, (r) => { r.icon = 42 }), 'Stat')
  })

  it('UT-CREATE_MODELS-005 createSection: hero entry {id:hero, showInNav:false} valid without label/icon', () => {
    const s = createSection(fx.hero())
    expect(s).toMatchObject({ id: 'hero', lazy: false, showInNav: false, label: null, icon: null })
    expect(Object.isFrozen(s)).toBe(true)
  })

  it('UT-CREATE_MODELS-006 createSection rejects showInNav without label/icon and non-slug id', () => {
    rejects(createSection, mutate(fx.navSection, (r) => { delete r.label }), 'Section')
    rejects(createSection, mutate(fx.navSection, (r) => { delete r.icon }), 'Section')
    rejects(createSection, mutate(fx.navSection, (r) => { r.id = 'About Me' }), 'Section')
    expect(() => createSection(fx.navSection())).not.toThrow()
  })

  it('UT-CREATE_MODELS-007 createExperience: valid baseline accepted', () => {
    expect(createExperience(fx.experience())).toEqual(fx.experience())
  })

  it('UT-CREATE_MODELS-008 createSkill valid with and without colour (colour stays undefined)', () => {
    expect(createSkill({ name: 'OOP', icon: 'svg:oop' }).color).toBeUndefined()
    expect(createSkill(fx.skill()).color).toBe('#00599C')
  })

  it('UT-CREATE_MODELS-009 createSkill rejects icon foo:bar and non-string colour', () => {
    rejects(createSkill, mutate(fx.skill, (r) => { r.icon = 'foo:bar' }), 'Skill')
    rejects(createSkill, mutate(fx.skill, (r) => { r.color = 123 }), 'Skill')
  })

  it('UT-CREATE_MODELS-010 createSkillCategory: valid baseline accepted; nested skills frozen', () => {
    const c = createSkillCategory(fx.skillCategory())
    expect(c.skills).toHaveLength(2)
    expect(Object.isFrozen(c)).toBe(true)
    expect(Object.isFrozen(c.skills)).toBe(true)
    expect(Object.isFrozen(c.skills[0])).toBe(true)
  })

  it('UT-CREATE_MODELS-011 createSkillCategory rejects short/rgba headerColor, empty skills and duplicate skill names', () => {
    rejects(createSkillCategory, mutate(fx.skillCategory, (r) => { r.headerColor = '#fff' }), 'SkillCategory')
    rejects(createSkillCategory, mutate(fx.skillCategory, (r) => { r.headerColor = 'rgba(1,2,3,0.5)' }), 'SkillCategory')
    rejects(createSkillCategory, mutate(fx.skillCategory, (r) => { r.skills = [] }), 'SkillCategory')
    const err = rejects(
      createSkillCategory,
      mutate(fx.skillCategory, (r) => { r.skills[1].name = 'C++' }),
      'SkillCategory',
    )
    expect(err.message).toContain('duplicate')
  })

  it('UT-CREATE_MODELS-012 createProject: valid baseline accepted; wide defaults to false', () => {
    const p = createProject(fx.project())
    expect(p.wide).toBe(false)
    expect(p.title).toBe('Laser HMI')
    expect(createProject({ ...fx.project(), wide: true }).wide).toBe(true)
  })

  it('UT-CREATE_MODELS-013 createProject rejects empty/duplicate tags, wide "yes" and non-hex colour', () => {
    rejects(createProject, mutate(fx.project, (r) => { r.tags = [] }), 'Project')
    rejects(createProject, mutate(fx.project, (r) => { r.tags = ['A', 'A'] }), 'Project')
    rejects(createProject, mutate(fx.project, (r) => { r.wide = 'yes' }), 'Project')
    rejects(createProject, mutate(fx.project, (r) => { r.color = '#34d39999' }), 'Project')
    expect(rejects(createProject, {}, 'Project').message).toBe('Invalid Project: title is required')
  })

  it('UT-CREATE_MODELS-014 createDesignCard: valid baseline accepted', () => {
    const c = createDesignCard(fx.designCard())
    expect(c).toMatchObject({ artKey: 'cluster', wide: false, href: 'https://behance.net/s_jeevanandham' })
  })

  it('UT-CREATE_MODELS-015 createDesignCard rejects javascript: and http: hrefs and unknown artKey', () => {
    rejects(createDesignCard, mutate(fx.designCard, (r) => { r.href = 'javascript:alert(1)' }), 'DesignCard')
    rejects(createDesignCard, mutate(fx.designCard, (r) => { r.href = 'http://behance.net/x' }), 'DesignCard')
    rejects(createDesignCard, mutate(fx.designCard, (r) => { r.artKey = 'unknown' }), 'DesignCard')
  })

  it('UT-CREATE_MODELS-016 createEducation: valid degree (edu) and domain cards accepted', () => {
    expect(createEducation(fx.education()).tagVariant).toBe('edu')
    expect(createEducation({ ...fx.education(), tagVariant: 'domain' }).tagVariant).toBe('domain')
  })

  it('UT-CREATE_MODELS-017 createEducation rejects tagVariant other', () => {
    rejects(createEducation, mutate(fx.education, (r) => { r.tagVariant = 'other' }), 'Education')
  })

  it('UT-CREATE_MODELS-018 createCertification: valid baseline accepted', () => {
    expect(createCertification(fx.certification())).toEqual(fx.certification())
  })

  it('UT-CREATE_MODELS-019 createContactLink: valid email, phone and three social links accepted', () => {
    const links = [
      fx.contact(),
      { kind: 'phone', label: '+91 8111010315', href: 'tel:+918111010315', icon: 'phone', external: false, group: 'primary' },
      { kind: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/in/x/', icon: 'open_in_new', external: true, group: 'social' },
      { kind: 'behance', label: 'Behance', href: 'https://behance.net/x', icon: 'brush', external: true, group: 'social' },
      { kind: 'github', label: 'GitHub', href: 'https://github.com/x', icon: 'terminal', external: true, group: 'social' },
    ]
    for (const l of links) expect(createContactLink(l)).toEqual(l)
  })

  it('UT-CREATE_MODELS-020 createContactLink rejects javascript:, data: and http: hrefs', () => {
    for (const href of ['javascript:alert(1)', 'data:text/html,x', 'http://example.com']) {
      const err = rejects(createContactLink, mutate(fx.contact, (r) => { r.href = href }), 'ContactLink')
      expect(err.field).toBe('href')
    }
  })

  it('UT-CREATE_MODELS-021 createContactLink rejects kind twitter, group other and external "true"', () => {
    rejects(createContactLink, mutate(fx.contact, (r) => { r.kind = 'twitter' }), 'ContactLink')
    rejects(createContactLink, mutate(fx.contact, (r) => { r.group = 'other' }), 'ContactLink')
    rejects(createContactLink, mutate(fx.contact, (r) => { r.external = 'true' }), 'ContactLink')
  })

  it('UT-CREATE_MODELS-022 createResumeSkill: valid {label, w, g} accepted', () => {
    expect(createResumeSkill(fx.resumeSkill())).toEqual(fx.resumeSkill())
  })

  it('UT-CREATE_MODELS-023 createResumeSkill w boundaries: "92", "120%", "-1%" rejected; "0%" and "100%" accepted', () => {
    for (const w of ['92', '120%', '-1%', '101%', '']) {
      rejects(createResumeSkill, mutate(fx.resumeSkill, (r) => { r.w = w }), 'ResumeSkill')
    }
    for (const w of ['0%', '100%']) {
      expect(createResumeSkill(mutate(fx.resumeSkill, (r) => { r.w = w })).w).toBe(w)
    }
  })

  it('UT-CREATE_MODELS-024 text segments (rich text) valid with and without emphasis; highlight card valid', () => {
    expect(createRichText(['a', { text: 'b', mark: 'hl' }, { text: 'c' }])).toEqual([
      { text: 'a' }, { text: 'b', mark: 'hl' }, { text: 'c' },
    ])
    expect(createRichText([{ text: 'x', mark: 'strong' }])[0].mark).toBe('strong')
    rejects(createRichText, [{ text: 'x', mark: 'em' }], 'RichText')
    expect(createHighlight(fx.highlight()).chips).toEqual(['A', 'B'])
  })

  describe.each(FACTORIES)('%s factory contract', (model, factory, make) => {
    it(`UT-CREATE_MODELS-025 ${model}: result frozen at every level; strict-mode assignment throws TypeError`, () => {
      const out = factory(make())
      const walk = (v, path) => {
        if (v !== null && typeof v === 'object' && Object.getPrototypeOf(v) !== null && typeof v.$$typeof === 'undefined') {
          expect(Object.isFrozen(v), `${model}${path}`).toBe(true)
          Object.entries(v).forEach(([k, c]) => walk(c, `${path}.${k}`))
        }
      }
      walk(out, '')
      expect(() => {
        out.__newField = 1
      }).toThrow(TypeError)
      const firstKey = Array.isArray(out) ? 0 : Object.keys(out)[0]
      expect(() => {
        out[firstKey] = 'changed'
      }).toThrow(TypeError)
    })

    it(`UT-CREATE_MODELS-026 ${model}: input not mutated, not returned by identity, later mutation does not leak`, () => {
      const raw = make()
      const snapshot = Array.isArray(raw) ? clone(raw) : model === 'Section' ? { ...raw } : clone(raw)
      const out = factory(raw)
      expect(out).not.toBe(raw)
      if (model !== 'Section') expect(raw).toEqual(snapshot)
      const before = JSON.stringify(out)
      if (Array.isArray(raw)) {
        raw.push('late')
        if (typeof raw[1] === 'object') raw[1].text = 'mutated'
      } else {
        for (const key of Object.keys(raw)) {
          const v = raw[key]
          if (Array.isArray(v)) v.push('late')
          else if (v && typeof v === 'object' && typeof v.$$typeof === 'undefined') v.__x = 1
          else if (typeof v === 'string') raw[key] = 'changed'
        }
      }
      expect(JSON.stringify(out)).toBe(before)
    })

    it(`UT-CREATE_MODELS-027 ${model}: unknown extra fields are rejected consistently`, () => {
      const raw = make()
      if (Array.isArray(raw)) raw[1].extra = 'x'
      else raw.extraField = 'x'
      const err = rejects(factory, raw, model)
      expect(err.message).toContain('is not a known field')
    })

    it(`UT-CREATE_MODELS-028 ${model}: non-object input throws ModelValidationError naming the model`, () => {
      for (const bad of [undefined, null, 'x']) {
        const err = rejects(factory, bad, model)
        expect(err.message).toContain(model)
      }
    })
  })
})

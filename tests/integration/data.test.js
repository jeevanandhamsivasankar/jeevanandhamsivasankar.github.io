const modules = import.meta.glob('../../src/data/*.js', { eager: true })

function collectUnfrozen(value, trail, seen, out) {
  if (value === null || (typeof value !== 'object' && typeof value !== 'function')) return
  if (seen.has(value)) return
  seen.add(value)
  if (typeof value === 'function') return
  if (!Object.isFrozen(value)) out.push(trail)
  for (const key of Reflect.ownKeys(value)) collectUnfrozen(value[key], `${trail}.${String(key)}`, seen, out)
}

describe('content data modules (ARC-006, ARC-005, ARC-003)', () => {
  it('IT-017 data modules build validated, deeply frozen models at import', async () => {
    const names = Object.keys(modules).map((p) => p.split('/').pop())
    expect(names).toEqual(
      expect.arrayContaining([
        'certifications.js', 'contact.js', 'design.js', 'education.js',
        'experience.js', 'profile.js', 'projects.js', 'skills.js',
      ]),
    )

    const exp = await import('../../src/data/experience.js')
    const skills = await import('../../src/data/skills.js')
    const projects = await import('../../src/data/projects.js')
    const design = await import('../../src/data/design.js')
    const edu = await import('../../src/data/education.js')
    const certs = await import('../../src/data/certifications.js')
    const contact = await import('../../src/data/contact.js')
    const profile = await import('../../src/data/profile.js')

    expect(exp.EXPERIENCE).toHaveLength(4)
    expect(skills.SKILL_CATEGORIES).toHaveLength(9)
    expect(skills.SKILL_CATEGORIES.reduce((n, c) => n + c.skills.length, 0)).toBe(58)
    expect(projects.PROJECTS).toHaveLength(6)
    expect(design.DESIGN_CARDS).toHaveLength(5)
    expect(edu.EDUCATION).toHaveLength(2)
    expect(certs.CERTIFICATIONS).toHaveLength(3)
    expect(contact.CONTACT_LINKS).toHaveLength(5)
    expect(profile.HERO_ROLES).toHaveLength(5)
    expect(profile.HERO_BADGES).toHaveLength(8)
    expect(profile.GAUGE_STATS).toHaveLength(3)
    expect(profile.STATS).toHaveLength(4)

    const unfrozen = []
    const seen = new WeakSet()
    for (const [file, mod] of Object.entries(modules)) {
      for (const [exportName, value] of Object.entries(mod)) {
        collectUnfrozen(value, `${file.split('/').pop()}:${exportName}`, seen, unfrozen)
      }
    }
    expect(unfrozen).toEqual([])
  })

  afterEach(() => {
    vi.doUnmock('../../src/config/site.js')
    vi.resetModules()
  })

  it('IT-018 invalid content fails fast at module load naming entity and field', async () => {
    const real = await vi.importActual('../../src/config/site.js')
    const load = () => import('../../src/data/contact.js').then(() => null, (e) => e)

    // variant 1: unsafe URL
    vi.doMock('../../src/config/site.js', () => ({
      ...real,
      URLS: Object.freeze({ ...real.URLS, github: 'javascript:alert(1)' }),
    }))
    vi.resetModules()
    let err = await load()
    expect(err).not.toBeNull()
    expect(err.name).toBe('ModelValidationError')
    expect(err.model).toBe('ContactLink')
    expect(err.field).toBe('href')
    expect(err.message).toContain('ContactLink')
    expect(err.message).toContain('href')

    // variant 2: empty e-mail address
    vi.doUnmock('../../src/config/site.js')
    vi.doMock('../../src/config/site.js', () => ({ ...real, EMAIL: '' }))
    vi.resetModules()
    err = await load()
    expect(err).not.toBeNull()
    expect(err.name).toBe('ModelValidationError')
    expect(err.model).toBe('ContactLink')
    expect(['label', 'href']).toContain(err.field)
    expect(err.message).toContain('ContactLink')
    expect(err.message).toContain(err.field)
  })
})

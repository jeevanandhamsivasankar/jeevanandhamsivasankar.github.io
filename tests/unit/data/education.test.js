import { EDUCATION } from '../../../src/data/education.js'

describe('UNIT-DATA_EDUCATION', () => {
  it('UT-DATA_EDUCATION-001 degree card and domain card with tags, icons, colours and variants', () => {
    expect(EDUCATION).toHaveLength(2)
    const [degree, domain] = EDUCATION
    expect(degree).toMatchObject({ icon: 'school', iconColor: '#22d3ee', tagVariant: 'edu' })
    expect([...degree.tags]).toEqual(['2015 – 2020', 'CGPA: 6.34 / 10', 'ECE'])
    expect(domain).toMatchObject({ icon: 'military_tech', iconColor: '#f59e0b', tagVariant: 'domain' })
    expect(domain.tags).toHaveLength(5)
    expect([...domain.tags]).toEqual([
      'Automotive HMI', 'Medical Device HMI', 'Instrument Clusters', 'Infotainment', 'ADAS / 3D Viz',
    ])
  })

  it('UT-DATA_EDUCATION-002 titles and subtitles are byte-identical to the baseline', () => {
    expect(EDUCATION.map((e) => e.title)).toEqual(['B.E. — Electronics & Communication Engineering', 'Key Domain Expertise'])
    expect(EDUCATION.map((e) => e.subtitle)).toEqual([
      'Adhiparasakthi College of Engineering (Anna University), Tamil Nadu',
      '4.9+ years of production-grade specialisation in HMI engineering across Automotive and Medical device industries',
    ])
    expect(Object.isFrozen(EDUCATION)).toBe(true)
  })
})

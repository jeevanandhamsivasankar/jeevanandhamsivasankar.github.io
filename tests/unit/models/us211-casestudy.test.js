import { createCaseStudy, createProject } from '../../../src/models/index.js'
import { PROJECTS } from '../../../src/data/projects.js'

const base = {
  title: 'T', num: 'P', period: 'A', domain: 'D', icon: 'speed', color: '#f59e0b',
  bg: 'rgba(1,2,3,0.1)', border: 'rgba(1,2,3,0.2)', desc: 'x', tags: ['a'], line: 'linear-gradient(90deg,#fff,#000)',
}

describe('UNIT-CASESTUDY', () => {
  it('UT-CASESTUDY-001 createCaseStudy keeps only present rows in order, frozen', () => {
    const cs = createCaseStudy({ solution: 's', problem: 'p' })
    expect(Object.keys(cs)).toEqual(['problem', 'solution'])
    expect(Object.isFrozen(cs)).toBe(true)
  })

  it('UT-CASESTUDY-002 rejects empty, blank, unknown rows', () => {
    expect(() => createCaseStudy({})).toThrow('Invalid CaseStudy: value')
    expect(() => createCaseStudy({ impact: ' ' })).toThrow('Invalid CaseStudy: impact')
    expect(() => createCaseStudy({ metric: '5x' })).toThrow('Invalid CaseStudy: metric')
  })

  it('UT-CASESTUDY-003 Project accepts optional caseStudy/nda; v1.1 projects stay valid; impact omitted where unsupported', () => {
    expect(createProject(base)).not.toHaveProperty('caseStudy')
    expect(createProject({ ...base, caseStudy: { problem: 'p' }, nda: true }).caseStudy.problem).toBe('p')
    expect(() => createProject({ ...base, nda: 'yes' })).toThrow('Invalid Project: nda')
    expect(PROJECTS.filter((p) => !p.caseStudy.impact).map((p) => p.num)).toEqual(['PROJECT_01', 'PROJECT_04', 'PROJECT_05'])
  })
})

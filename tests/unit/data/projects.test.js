import { PROJECTS } from '../../../src/data/projects.js'

describe('UNIT-DATA_PROJECTS', () => {
  it('UT-DATA_PROJECTS-001 6 projects in order; num unique', () => {
    expect(PROJECTS).toHaveLength(6)
    expect(PROJECTS.map((p) => p.num)).toEqual([
      'PROJECT_01', 'PROJECT_02', 'PROJECT_03', 'PROJECT_04', 'PROJECT_05', 'R&D',
    ])
    expect(new Set(PROJECTS.map((p) => p.num)).size).toBe(6)
    expect(PROJECTS.map((p) => p.title)).toEqual([
      'Physiotherapy Laser Therapy HMI',
      'LVGL Cluster — MIMXRT1170',
      'SUV In-Vehicle Infotainment System',
      'Sports Bike Cluster — i.MX6',
      'Two-Wheeler OEM Cluster — CGI Studio',
      'ADAS 3D Demonstrator & R&D Projects',
    ])
  })

  it('UT-DATA_PROJECTS-002 exactly 2 wide (PROJECT_03 and R&D)', () => {
    expect(PROJECTS.filter((p) => p.wide).map((p) => p.num)).toEqual(['PROJECT_03', 'R&D'])
  })

  it('UT-DATA_PROJECTS-003 project 1 has 5 tags; project 3 has 8 tags', () => {
    expect(PROJECTS[0].title).toBe('Physiotherapy Laser Therapy HMI')
    expect([...PROJECTS[0].tags]).toEqual(['Qt/QML', 'C++', 'SQLite3', 'UART/CRC', 'Linux'])
    expect(PROJECTS[2].tags).toHaveLength(8)
    expect([...PROJECTS[2].tags]).toEqual([
      'Qt/QML', 'C++', 'Jenkins', 'Plastic SCM', 'A-SPICE', 'Figma Enterprise', 'Polarion', 'Linux',
    ])
  })

  it('UT-DATA_PROJECTS-004 colours are 7-char hex; line is a gradient string', () => {
    for (const p of PROJECTS) {
      expect(p.color, p.num).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(p.line, p.num).toMatch(/^linear-gradient\(.+\)$/)
      expect(Object.isFrozen(p)).toBe(true)
    }
  })
})

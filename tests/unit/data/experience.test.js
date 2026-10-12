import { EXPERIENCE } from '../../../src/data/experience.js'

describe('UNIT-DATA_EXPERIENCE', () => {
  it('UT-DATA_EXPERIENCE-001 4 entries, newest first; frozen', () => {
    expect(EXPERIENCE).toHaveLength(4)
    expect(Object.isFrozen(EXPERIENCE)).toBe(true)
    EXPERIENCE.forEach((e) => expect(Object.isFrozen(e)).toBe(true))
    expect(EXPERIENCE.map((e) => e.period)).toEqual([
      'SEP 2024 — JAN 2026', 'APR 2022 — AUG 2024', 'SEP 2021 — MAR 2022', 'MAY 2019 — SEP 2019',
    ])
  })

  it('UT-DATA_EXPERIENCE-002 entry 1 and entry 4 fields are exact', () => {
    expect(EXPERIENCE[0]).toMatchObject({
      role: 'Senior Software Engineer',
      company: 'PixelExpert Technology & Services Pvt. Ltd.',
      period: 'SEP 2024 — JAN 2026',
      location: 'Chennai, Tamil Nadu',
    })
    expect(EXPERIENCE[3].role).toBe('Graphics Designer Trainee')
    expect(EXPERIENCE[3].company).toBe('Lapiz Digital Services Pvt. Ltd.')
    expect(EXPERIENCE.map((e) => e.role)).toEqual([
      'Senior Software Engineer', 'Embedded Software Engineer', 'Graduate Engineer Trainee', 'Graphics Designer Trainee',
    ])
  })

  it('UT-DATA_EXPERIENCE-003 every period matches MON YYYY — MON YYYY (em dash)', () => {
    for (const e of EXPERIENCE) expect(e.period).toMatch(/^[A-Z]{3} \d{4} — [A-Z]{3} \d{4}$/)
  })

  it('UT-DATA_EXPERIENCE-004 icons and descriptions are byte-identical to the baseline', () => {
    expect(EXPERIENCE.map((e) => e.icon)).toEqual(['medical_services', 'directions_car', 'school', 'palette'])
    expect(EXPERIENCE.map((e) => e.desc)).toEqual([
      'Led HMI design & development for a medical physiotherapy laser therapy device — full ownership from UX design through Qt/QML implementation, embedded C++ backend, custom UART framework with CRC validation, and SQLite3 patient database. Safety-aware screen interactions, structured validation, and Linux-based device control integration.',
      'Developed automotive Instrument Cluster and Infotainment HMI across multiple OEM programs using Qt/QML, LVGL, Candera CGI Studio, and Embedded C. Worked as HCL external engineer on a SUV infotainment platform delivering Calls, Media, Settings, and Vehicle Stats modules in A-SPICE aligned Jenkins CI/CD environment.',
      'Hands-on embedded development training on STM32 — UART, SPI, I²C, GPIO protocols. Built TouchGFX-based Instrument Cluster prototype with speedometer, odometer, alerts, trip metres, and fuel gauge. Foundational training in structured UI graphics and embedded integration.',
      'Internship focused on visual design fundamentals, digital graphics production, and creative tooling across Adobe Creative Suite.',
    ])
  })
})

import * as profile from '../../../src/data/profile.js'
import {
  PROFILE, HERO_ROLES, HERO_BADGES, GAUGE_STATS, GAUGE_STACK_TAGS, STATS, PROFILE_TAGS,
  ABOUT_PARAGRAPHS, RESUME_PREVIEW,
} from '../../../src/data/profile.js'

const deepFrozen = (v) =>
  v === null || typeof v !== 'object' || (Object.isFrozen(v) && Object.values(v).every(deepFrozen))
const plain = (rt) => rt.map((s) => s.text).join('')

describe('UNIT-DATA_PROFILE', () => {
  it('UT-DATA_PROFILE-001 module loads without throwing and all exports are frozen', () => {
    expect(Object.keys(profile).length).toBeGreaterThan(5)
    for (const [name, value] of Object.entries(profile)) expect(deepFrozen(value), name).toBe(true)
  })

  it('UT-DATA_PROFILE-002 HERO_ROLES are the 5 roles in order', () => {
    expect([...HERO_ROLES]).toEqual([
      'Qt / QML Developer', 'Embedded HMI Engineer', 'UX / UI Engineer', 'Instrument Cluster Dev', 'Medical Device HMI Eng',
    ])
  })

  it('UT-DATA_PROFILE-003 HERO_BADGES are the 8 badges in order', () => {
    expect([...HERO_BADGES]).toEqual([
      'Qt / QML', 'Embedded C++', 'LVGL', 'CAN Bus', 'A-SPICE', 'Linux HMI', 'SQLite3', 'FreeRTOS',
    ])
  })

  it('UT-DATA_PROFILE-004 GAUGE_STATS and GAUGE_STACK_TAGS', () => {
    expect(GAUGE_STATS).toHaveLength(3)
    expect(GAUGE_STATS.map((s) => [s.num, s.label, s.color])).toEqual([
      ['4.9+', 'Yrs Exp', '#f59e0b'],
      ['8+', 'Projects', '#22d3ee'],
      ['2', 'Domains', '#34d399'],
    ])
    expect([...GAUGE_STACK_TAGS]).toEqual(['Qt/QML', 'LVGL', 'C++', 'CAN', 'UART'])
  })

  it('UT-DATA_PROFILE-005 STATS are the 4 About stats with icons and colours', () => {
    expect(STATS).toHaveLength(4)
    expect(STATS.map((s) => s.icon)).toEqual(['schedule', 'rocket_launch', 'devices', 'code'])
    expect(STATS.map((s) => s.color)).toEqual(['#f59e0b', '#22d3ee', '#34d399', '#a78bfa'])
    expect(STATS.map((s) => [s.num, s.label])).toEqual([
      ['4.9+', 'Years Experience'], ['8+', 'Projects Shipped'], ['2', 'Domains — Auto & Med'], ['C++', 'Primary Language'],
    ])
  })

  it('UT-DATA_PROFILE-006 PROFILE_TAGS and status', () => {
    expect([...PROFILE_TAGS]).toEqual(['Automotive HMI', 'Medical HMI', 'Qt/QML', 'UX Design'])
    expect(PROFILE.status).toBe('OPEN TO OPPORTUNITIES')
  })

  it('UT-DATA_PROFILE-007 photo is {src, alt, width, height}', () => {
    expect(PROFILE.photo).toEqual({ src: 'profile.webp', alt: 'S. Jeevanandham', width: 600, height: 900 })
  })

  it('UT-DATA_PROFILE-008 hero bio: two emphasised segments and byte-identical plain text', () => {
    const strong = PROFILE.bio.filter((s) => s.mark === 'strong').map((s) => s.text)
    expect(strong).toEqual(['4.9+ years', 'Qt/QML, Embedded C++, and real-time UI engineering'])
    expect(plain(PROFILE.bio)).toBe(
      'Senior Software Engineer with 4.9+ years in Automotive HMI, Infotainment Systems, Instrument Clusters, and Medical Device HMI. Specialising in Qt/QML, Embedded C++, and real-time UI engineering across production-grade OEM programs.',
    )
  })

  it('UT-DATA_PROFILE-009 ABOUT_PARAGRAPHS: 4 paragraphs and 5 highlight phrases in order', () => {
    expect(ABOUT_PARAGRAPHS).toHaveLength(4)
    const hls = ABOUT_PARAGRAPHS.flatMap((p) => p.filter((s) => s.mark === 'hl').map((s) => s.text))
    expect(hls).toEqual([
      'Senior Software Engineer',
      'automotive and medical device industries',
      'Qt/QML and Embedded C++',
      'engineering rigour and UX design sensibility',
      'A-SPICE aligned development',
    ])
    expect(plain(ABOUT_PARAGRAPHS[0])).toBe(
      "I'm a Senior Software Engineer with deep expertise in Human Machine Interface development for the automotive and medical device industries. Over 4.9 years, I've shipped production-grade HMIs for instrument clusters, infotainment systems, and medical therapy devices.",
    )
    expect(plain(ABOUT_PARAGRAPHS[1])).toBe(
      "My stack centres on Qt/QML and Embedded C++, complemented by LVGL, Candera CGI Studio, and TouchGFX. I've worked across STM32, i.MX6, i.MX8M, and MIMXRT1170 platforms, building everything from low-level driver integrations to polished, safety-aware UI layers.",
    )
    expect(plain(ABOUT_PARAGRAPHS[2])).toBe(
      'I bring an unusual combination of engineering rigour and UX design sensibility — holding a Google UX Design Professional Certificate and contributing to visual design work across all my projects using Figma and Adobe tooling.',
    )
    expect(plain(ABOUT_PARAGRAPHS[3])).toBe(
      'Experienced in A-SPICE aligned development, Agile execution, CI/CD pipelines, documentation discipline, UART communication frameworks (structured byte framing + CRC), SQLite3 database integration, and Linux-based system development.',
    )
  })

  it('UT-DATA_PROFILE-010 RESUME_PREVIEW role line and 4 bars', () => {
    expect(RESUME_PREVIEW.roleLine).toBe(
      'SENIOR SOFTWARE ENGINEER – AUTOMOTIVE & MEDICAL HMI | UI/UX | QT/QML | EMBEDDED C++',
    )
    expect(RESUME_PREVIEW.bars.map((b) => [b.label, b.w])).toEqual([
      ['Qt / QML', '92%'], ['Embedded C++', '88%'], ['LVGL / HMI', '85%'], ['UX / Figma', '78%'],
    ])
  })
})

import { CERTIFICATIONS } from '../../../src/data/certifications.js'

describe('UNIT-DATA_CERTIFICATIONS', () => {
  it('UT-DATA_CERTIFICATIONS-001 3 certifications with exact names, orgs and icons; names unique', () => {
    expect(CERTIFICATIONS.map((c) => [c.name, c.org, c.icon])).toEqual([
      ['Qt 6 Core — Beginner, Intermediate & Advanced', 'UDEMY', 'school'],
      ['QML for Beginners', 'UDEMY', 'school'],
      ['Google UX Design Professional Certificate', 'COURSERA — CREDLY VERIFIED', 'verified_user'],
    ])
    expect(new Set(CERTIFICATIONS.map((c) => c.name)).size).toBe(3)
    expect(Object.isFrozen(CERTIFICATIONS)).toBe(true)
  })
})

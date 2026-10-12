import {
  toIst,
  dayOfYear,
  sunriseSunsetHours,
  dayWindow,
  getSunPhase,
  DEFAULT_GEO,
  LONGITUDE_CORRECTION_H,
} from '../../../src/lib/solar.js'
import { THEME_GEO } from '../../../src/config/site.js'
import * as solarModule from '../../../src/lib/solar.js'

const MIN = 60_000
const HOUR = 3_600_000
const IST_OFFSET = 5.5 * HOUR
/** Instant for an IST wall-clock time (month 1-based). */
const ist = (y, mo, d, h = 0, mi = 0, s = 0, ms = 0) =>
  new Date(Date.UTC(y, mo - 1, d, h, mi, s, ms) - IST_OFFSET)
/** IST midnight (ms) of 2026-06-21 (day 172) */
const D172 = Date.UTC(2026, 5, 21) - IST_OFFSET
const hms = (hours) => {
  const s = Math.round(hours * 3600)
  return { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60, total: s }
}
const secs = (h, m, s) => h * 3600 + m * 60 + s

describe('UNIT-SOLAR', () => {
  it('UT-SOLAR-001 toIst gives IST fields 2026-01-01 05:30', () => {
    expect(toIst(new Date('2026-01-01T00:00:00Z'))).toEqual({
      year: 2026, month: 0, day: 1, hours: 5, minutes: 30,
    })
  })

  it('UT-SOLAR-002 toIst midnight rollover', () => {
    expect(toIst(new Date('2026-06-21T18:29:00Z'))).toMatchObject({ month: 5, day: 21, hours: 23, minutes: 59 })
    expect(toIst(new Date('2026-06-21T18:31:00Z'))).toMatchObject({ month: 5, day: 22, hours: 0, minutes: 1 })
  })

  it('UT-SOLAR-003 dayOfYear is 1 at 1 Jan 00:00 IST and 365 at 31 Dec 23:59 IST 2026', () => {
    expect(dayOfYear(new Date('2025-12-31T18:30:00Z'))).toBe(1)
    expect(dayOfYear(new Date('2026-12-31T18:29:00Z'))).toBe(365)
  })

  it('UT-SOLAR-004 year boundary 2026-12-31T18:29:59Z -> 365 and 18:30:00Z -> 1', () => {
    expect(dayOfYear(new Date('2026-12-31T18:29:59Z'))).toBe(365)
    expect(dayOfYear(new Date('2026-12-31T18:30:00Z'))).toBe(1)
    expect(toIst(new Date('2026-12-31T18:30:00Z')).year).toBe(2027)
  })

  it('UT-SOLAR-005 leap year 2028-02-29 12:00 IST -> 60; 2028-12-31 12:00 IST -> 366', () => {
    expect(dayOfYear(ist(2028, 2, 29, 12))).toBe(60)
    expect(dayOfYear(ist(2028, 12, 31, 12))).toBe(366)
  })

  it('UT-SOLAR-006 11:59 and 12:01 IST on the same date give the same dayOfYear', () => {
    expect(dayOfYear(ist(2026, 6, 21, 11, 59))).toBe(dayOfYear(ist(2026, 6, 21, 12, 1)))
    expect(dayOfYear(ist(2026, 3, 15, 11, 59))).toBe(dayOfYear(ist(2026, 3, 15, 12, 1)))
  })

  it('UT-SOLAR-007 23:59 IST and 00:01 IST next day differ by exactly 1', () => {
    expect(dayOfYear(ist(2026, 6, 22, 0, 1)) - dayOfYear(ist(2026, 6, 21, 23, 59))).toBe(1)
    expect(dayOfYear(ist(2026, 1, 1, 0, 1)) - dayOfYear(ist(2025, 12, 31, 23, 59))).not.toBe(1) // year wraps to 1
  })

  it('UT-SOLAR-008 correction constant is 5.5 - 80.27/15 = +0.1487 h', () => {
    expect(LONGITUDE_CORRECTION_H).toBeCloseTo(0.14867, 4)
    expect(LONGITUDE_CORRECTION_H.toFixed(4)).toBe('0.1487')
    expect(LONGITUDE_CORRECTION_H).toBeGreaterThan(0)
    expect(LONGITUDE_CORRECTION_H).toBeCloseTo(5.5 - 80.27 / 15, 10)
  })

  it.each([1, 79, 172, 266, 355, 365])(
    'UT-SOLAR-009 sunrise + sunset = 24 for day %i',
    (d) => {
      const { sunrise, sunset } = sunriseSunsetHours(d, 13.08)
      expect(sunrise + sunset).toBeCloseTo(24, 9)
    },
  )

  it('UT-SOLAR-010 day 172 window with correction is 05:45:47 to 18:32:03 IST (+-60 s)', () => {
    const { start, end } = dayWindow(172)
    expect(Math.abs(start * 3600 - secs(5, 45, 47))).toBeLessThanOrEqual(60)
    expect(Math.abs(end * 3600 - secs(18, 32, 3))).toBeLessThanOrEqual(60)
  })

  it('UT-SOLAR-011 day 355 window is 06:32:03 to 17:45:47 IST (+-60 s)', () => {
    const { start, end } = dayWindow(355)
    expect(Math.abs(start * 3600 - secs(6, 32, 3))).toBeLessThanOrEqual(60)
    expect(Math.abs(end * 3600 - secs(17, 45, 47))).toBeLessThanOrEqual(60)
  })

  it('UT-SOLAR-012 days 79 and 266 give identical windows (06:09:46-18:08:05 IST)', () => {
    const a = dayWindow(79)
    const b = dayWindow(266)
    expect(a.start).toBeCloseTo(b.start, 6)
    expect(a.end).toBeCloseTo(b.end, 6)
    expect(Math.abs(a.start * 3600 - secs(6, 9, 46))).toBeLessThanOrEqual(60)
    expect(Math.abs(a.end * 3600 - secs(18, 8, 5))).toBeLessThanOrEqual(60)
  })

  it('UT-SOLAR-013 clamping at lat 80: always day on 172, always night on 355, no NaN', () => {
    const polar = { lat: 80, lon: 80.27, tzOffsetHours: 5.5 }
    for (const d of [172, 355]) {
      const { sunrise, sunset } = sunriseSunsetHours(d, 80)
      expect(Number.isNaN(sunrise)).toBe(false)
      expect(Number.isNaN(sunset)).toBe(false)
    }
    expect(sunriseSunsetHours(172, 80)).toEqual({ sunrise: 0, sunset: 24 })
    expect(sunriseSunsetHours(355, 80)).toEqual({ sunrise: 12, sunset: 12 })
    const day172 = Date.UTC(2026, 5, 21) - IST_OFFSET
    for (let m = 0; m < 1440; m += 10) {
      expect(getSunPhase(new Date(day172 + m * MIN), polar)).toBe('day')
    }
    const day355 = Date.UTC(2026, 11, 21) - IST_OFFSET
    expect(dayOfYear(new Date(day355))).toBe(355)
    for (let m = 0; m < 1440; m += 10) {
      expect(getSunPhase(new Date(day355 + m * MIN), polar)).toBe('night')
    }
  })

  it('UT-SOLAR-014 getSunPhase 2026-06-21T06:30:00Z (12:00 IST) -> day', () => {
    expect(getSunPhase(new Date('2026-06-21T06:30:00Z'))).toBe('day')
  })

  it('UT-SOLAR-015 getSunPhase 23:00 IST -> night; 00:00:00 IST exactly -> night', () => {
    expect(getSunPhase(new Date('2026-06-21T17:30:00Z'))).toBe('night')
    expect(getSunPhase(ist(2026, 6, 21, 0, 0, 0))).toBe('night')
  })

  it('UT-SOLAR-016 inclusive start: sunrise+correction instant -> day; 1 ms earlier -> night', () => {
    const { start } = dayWindow(172)
    const startMs = D172 + Math.ceil(start * HOUR)
    expect(getSunPhase(new Date(startMs))).toBe('day')
    expect(getSunPhase(new Date(startMs - 1))).toBe('night')
  })

  it('UT-SOLAR-017 exclusive end: sunset+correction instant -> night; 1 ms earlier -> day', () => {
    const { end } = dayWindow(172)
    const endMs = D172 + Math.ceil(end * HOUR)
    expect(getSunPhase(new Date(endMs))).toBe('night')
    expect(getSunPhase(new Date(endMs - 1))).toBe('day')
  })

  it('UT-SOLAR-018 day 172 boundary instants', () => {
    expect(getSunPhase(new Date('2026-06-21T00:15:40Z'))).toBe('night')
    expect(getSunPhase(new Date('2026-06-21T00:15:55Z'))).toBe('day')
    expect(getSunPhase(new Date('2026-06-21T13:02:00Z'))).toBe('day')
    expect(getSunPhase(new Date('2026-06-21T13:02:10Z'))).toBe('night')
  })

  it('UT-SOLAR-019 day 355 boundary instants', () => {
    expect(getSunPhase(new Date('2026-12-21T01:02:00Z'))).toBe('night')
    expect(getSunPhase(new Date('2026-12-21T01:02:10Z'))).toBe('day')
    expect(getSunPhase(new Date('2026-12-21T12:15:40Z'))).toBe('day')
    expect(getSunPhase(new Date('2026-12-21T12:15:55Z'))).toBe('night')
  })

  describe('timezone independence', () => {
    let originalTz
    beforeEach(() => {
      originalTz = process.env.TZ
    })
    afterEach(() => {
      if (originalTz === undefined) delete process.env.TZ
      else process.env.TZ = originalTz
    })

    const instants = Array.from({ length: 20 }, (_, i) =>
      Date.UTC(2026, 0, 1) + i * 17 * 24 * HOUR + i * 37 * MIN + (i % 7) * HOUR,
    )
    const snapshot = () =>
      instants.map((t) => [getSunPhase(new Date(t)), dayOfYear(new Date(t)), toIst(new Date(t))])

    it('UT-SOLAR-020 results identical for TZ = UTC, Asia/Kolkata, New_York, Kiritimati, Pago_Pago, Lord_Howe', () => {
      process.env.TZ = 'UTC'
      const reference = snapshot()
      for (const tz of [
        'Asia/Kolkata',
        'America/New_York',
        'Pacific/Kiritimati',
        'Pacific/Pago_Pago',
        'Australia/Lord_Howe',
      ]) {
        process.env.TZ = tz
        expect(snapshot(), tz).toEqual(reference)
      }
    })

    it('UT-SOLAR-021 instants within +-1 h of DST changes equal the UTC-zone results', () => {
      const centres = [
        Date.UTC(2026, 2, 8, 7, 0),
        Date.UTC(2026, 10, 1, 6, 0),
        Date.UTC(2026, 2, 29, 1, 0),
      ]
      const all = centres.flatMap((c) =>
        Array.from({ length: 13 }, (_, i) => c - HOUR + i * 10 * MIN),
      )
      const run = () => all.map((t) => [getSunPhase(new Date(t)), dayOfYear(new Date(t)), toIst(new Date(t))])
      process.env.TZ = 'UTC'
      const reference = run()
      for (const tz of ['America/New_York', 'Europe/London']) {
        process.env.TZ = tz
        expect(run(), tz).toEqual(reference)
      }
    })
  })

  it('UT-SOLAR-022 uses no local-time API', () => {
    const spies = ['getTimezoneOffset', 'getHours', 'getDate', 'getFullYear'].map((m) =>
      vi.spyOn(Date.prototype, m),
    )
    const d = new Date('2026-06-21T06:30:00Z')
    getSunPhase(d)
    dayOfYear(d)
    toIst(d)
    dayWindow(172)
    spies.forEach((s) => expect(s).not.toHaveBeenCalled())
  })

  it('UT-SOLAR-023 purity: input not mutated, repeatable, no mutable exports', () => {
    const d = new Date('2026-06-21T06:30:00Z')
    const before = d.getTime()
    const r1 = getSunPhase(d)
    const r2 = getSunPhase(d)
    expect(d.getTime()).toBe(before)
    expect(r1).toBe(r2)
    expect(dayOfYear(d)).toBe(dayOfYear(d))
    for (const [name, value] of Object.entries(solarModule)) {
      const t = typeof value
      expect(['function', 'number'].includes(t) || Object.isFrozen(value), name).toBe(true)
    }
  })

  it('UT-SOLAR-024 default geo equals THEME_GEO; lon 82.5 gives correction 0', () => {
    expect(DEFAULT_GEO).toEqual(THEME_GEO)
    expect(DEFAULT_GEO).toEqual({ lat: 13.08, lon: 80.27, tzOffsetHours: 5.5 })
    const a = dayWindow(172, { lat: 13.08, lon: 82.5, tzOffsetHours: 5.5 })
    const raw = sunriseSunsetHours(172, 13.08)
    expect(a.start).toBeCloseTo(raw.sunrise, 10)
    expect(a.end).toBeCloseTo(raw.sunset, 10)
    const def = dayWindow(172)
    expect(def.start - raw.sunrise).toBeCloseTo(LONGITUDE_CORRECTION_H, 10)
  })

  it('UT-SOLAR-025 invalid inputs never return anything but day/night (SUDS: invalid date fails safe to night)', () => {
    expect(getSunPhase(new Date('nope'))).toBe('night')
    for (const bad of [new Date(NaN), 'not a date', NaN, undefined, null, 0, 1.7e12, '2026-06-21T06:30:00Z']) {
      let result
      expect(() => {
        result = getSunPhase(bad)
      }).not.toThrow()
      expect(['day', 'night']).toContain(result)
    }
  })

  it('UT-SOLAR-026 full-day sweep on day 172 at 1-min steps gives exactly two transitions night->day->night', () => {
    const seq = []
    for (let m = 0; m < 1440; m += 1) seq.push(getSunPhase(new Date(D172 + m * MIN)))
    const transitions = []
    for (let i = 1; i < seq.length; i += 1) if (seq[i] !== seq[i - 1]) transitions.push(`${seq[i - 1]}>${seq[i]}`)
    expect(seq[0]).toBe('night')
    expect(transitions).toEqual(['night>day', 'day>night'])
  })
})

// keep helper referenced for readability of failure messages
void hms

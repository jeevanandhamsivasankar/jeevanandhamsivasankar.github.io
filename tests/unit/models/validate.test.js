import {
  ModelValidationError,
  assertString,
  assertNonEmptyString,
  assertArray,
  assertBoolean,
  assertColor,
  assertHexColor,
  assertUrl,
  assertEmail,
  assertIconRef,
  assertOneOf,
  assertRequired,
  assertUnique,
  assertComponent,
  assertKnownKeys,
  assertPlainObject,
  assertMsIcon,
  assertNonNegativeNumber,
  deepFreeze,
  fail,
} from '../../../src/models/validate.js'

const M = 'Test'
const F = 'field'
const ok = (fn, ...args) => expect(() => fn(...args, M, F)).not.toThrow()
const bad = (fn, ...args) => expect(() => fn(...args, M, F)).toThrow(ModelValidationError)

describe('UNIT-VALIDATE', () => {
  it('UT-VALIDATE-001 assertString accepts "x" and "" and rejects 1, null, undefined, {}', () => {
    ok(assertString, 'x')
    ok(assertString, '')
    for (const v of [1, null, undefined, {}]) bad(assertString, v)
  })

  it('UT-VALIDATE-002 assertNonEmptyString rejects "", "   " and non-strings', () => {
    ok(assertNonEmptyString, 'a')
    for (const v of ['', '   ', 1, null, undefined, {}, []]) bad(assertNonEmptyString, v)
  })

  it('UT-VALIDATE-003 assertArray accepts arrays, rejects strings/objects; minLength 1 rejects []', () => {
    ok(assertArray, [])
    ok(assertArray, [1])
    bad(assertArray, 'abc')
    bad(assertArray, {})
    expect(() => assertArray([], M, F, { minLength: 1 })).toThrow(ModelValidationError)
    expect(() => assertArray([1], M, F, { minLength: 1 })).not.toThrow()
  })

  it('UT-VALIDATE-004 assertBoolean accepts true/false and rejects "true", 0, undefined', () => {
    ok(assertBoolean, true)
    ok(assertBoolean, false)
    for (const v of ['true', 0, undefined, null]) bad(assertBoolean, v)
  })

  it('UT-VALIDATE-005 assertColor accepts hex, rgba and linear-gradient', () => {
    for (const v of ['#f59e0b', 'rgba(245,158,11,0.14)', 'linear-gradient(90deg,#f59e0b,#22d3ee)']) ok(assertColor, v)
  })

  it('UT-VALIDATE-006 assertColor rejects "red", "#zzzzzz", "", 123, "rgb("', () => {
    for (const v of ['red', '#zzzzzz', '', 123, 'rgb(']) bad(assertColor, v)
  })

  it('UT-VALIDATE-007 hex-only validator (#rrggbb) rejects "#fff" and rgba(...)', () => {
    ok(assertHexColor, '#f59e0b')
    for (const v of ['#fff', 'rgba(245,158,11,0.14)', '#f59e0b99', 'red']) bad(assertHexColor, v)
  })

  it.each([
    'https://behance.net/s_jeevanandham',
    'mailto:a@b.co',
    'tel:+918111010315',
    '#about',
    'Jeevanandham_Resume.pdf',
    '/profile.webp',
  ])('UT-VALIDATE-008 assertUrl accepts %s', (v) => ok(assertUrl, v))

  it.each([
    'javascript:alert(1)',
    ' JaVaScRiPt:alert(1)',
    'java\tscript:x',
    'data:text/html,x',
    'vbscript:x',
    'http://example.com',
    '//evil.com',
    'file:///etc/passwd',
    '',
  ])('UT-VALIDATE-009 assertUrl rejects %j', (v) => bad(assertUrl, v))

  it('UT-VALIDATE-010 assertEmail accepts a valid address and rejects "a@", "@b.co", "a b@c.d"', () => {
    ok(assertEmail, 'jeevanandhamsivashankaran@gmail.com')
    for (const v of ['a@', '@b.co', 'a b@c.d']) bad(assertEmail, v)
  })

  it.each(['si:cplusplus', 'ms:rocket_launch', 'svg:i2c'])('UT-VALIDATE-011 assertIconRef accepts %s', (v) =>
    ok(assertIconRef, v),
  )

  it.each(['foo:bar', 'si:', 'si:Qt', 'cplusplus', 'ms:rocket-launch'])(
    'UT-VALIDATE-012 assertIconRef rejects %s',
    (v) => bad(assertIconRef, v),
  )

  it('UT-VALIDATE-013 assertOneOf accepts listed values and rejects others and case variants', () => {
    const allowed = ['primary', 'social']
    expect(() => assertOneOf('primary', allowed, M, F)).not.toThrow()
    expect(() => assertOneOf('social', allowed, M, F)).not.toThrow()
    for (const v of ['other', 'Primary', 'SOCIAL', '', 1]) {
      expect(() => assertOneOf(v, allowed, M, F)).toThrow(ModelValidationError)
    }
  })

  it('UT-VALIDATE-014 ModelValidationError is an Error with name, model, field and a message with both', () => {
    let err
    try {
      fail('Project', 'title', 'is required')
    } catch (e) {
      err = e
    }
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(ModelValidationError)
    expect(err.name).toBe('ModelValidationError')
    expect(err.model).toBe('Project')
    expect(err.field).toBe('title')
    expect(err.message).toContain('Project')
    expect(err.message).toContain('title')
    expect(err.message).toBe('Invalid Project: title is required')
    try {
      assertNonEmptyString(undefined, 'Project', 'title')
    } catch (e) {
      expect(e.message).toBe('Invalid Project: title is required')
    }
  })

  it('UT-VALIDATE-015 validators return undefined and have no side effects', () => {
    const arr = Object.freeze(['a'])
    const obj = Object.freeze({ a: 1 })
    expect(assertString('x', M, F)).toBeUndefined()
    expect(assertNonEmptyString('x', M, F)).toBeUndefined()
    expect(assertArray(arr, M, F)).toBeUndefined()
    expect(assertBoolean(true, M, F)).toBeUndefined()
    expect(assertColor('#f59e0b', M, F)).toBeUndefined()
    expect(assertHexColor('#f59e0b', M, F)).toBeUndefined()
    expect(assertUrl('#a', M, F)).toBeUndefined()
    expect(assertEmail('a@b.co', M, F)).toBeUndefined()
    expect(assertIconRef('si:qt', M, F)).toBeUndefined()
    expect(assertOneOf('a', ['a'], M, F)).toBeUndefined()
    expect(assertMsIcon('mail', M, F)).toBeUndefined()
    expect(assertNonNegativeNumber(0, M, F)).toBeUndefined()
    expect(assertPlainObject(obj, M, F)).toBeUndefined()
    expect(assertKnownKeys(obj, ['a'], M)).toBeUndefined()
    expect(assertUnique(['a', 'b'], M, F)).toBeUndefined()
    expect(assertComponent(() => null, M, F)).toBeUndefined()
    expect(assertRequired(0, M, F)).toBeUndefined()
    expect(arr).toEqual(['a'])
    expect(obj).toEqual({ a: 1 })
  })

  it('UT-VALIDATE-016 assertUnique reports the first duplicate; assertKnownKeys names the unknown key', () => {
    expect(() => assertUnique(['a', 'b', 'a', 'b'], M, F)).toThrow('Invalid Test: field must be unique (duplicate "a")')
    expect(() => assertKnownKeys({ a: 1, z: 2 }, ['a'], M)).toThrow('Invalid Test: z is not a known field')
  })

  it('UT-VALIDATE-017 deepFreeze freezes nested arrays/objects, leaves functions and class instances untouched, returns the value', () => {
    const fn = () => 1
    const inst = new Date(0)
    const v = { a: [{ b: 1 }], f: fn, d: inst }
    expect(deepFreeze(v)).toBe(v)
    expect(Object.isFrozen(v)).toBe(true)
    expect(Object.isFrozen(v.a)).toBe(true)
    expect(Object.isFrozen(v.a[0])).toBe(true)
    expect(Object.isFrozen(fn)).toBe(false)
    expect(Object.isFrozen(inst)).toBe(false)
    expect(deepFreeze(5)).toBe(5)
    expect(deepFreeze(null)).toBeNull()
  })

  it('UT-VALIDATE-018 required check first: undefined/null give "is required"', () => {
    for (const fn of [assertString, assertNonEmptyString, assertBoolean, assertUrl, assertColor]) {
      expect(() => fn(undefined, M, F)).toThrow('Invalid Test: field is required')
      expect(() => fn(null, M, F)).toThrow('Invalid Test: field is required')
    }
  })
})

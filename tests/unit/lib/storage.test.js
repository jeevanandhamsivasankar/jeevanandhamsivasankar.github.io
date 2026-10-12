import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { readThemeOverride, writeThemeOverride } from '../../../src/lib/storage.js'
import { THEME_STORAGE_KEY } from '../../../src/config/site.js'

const KEY = 'jsv-theme-override'

/** Recording storage stub. */
function makeStub(initial = {}) {
  const data = { ...initial }
  return {
    data,
    getItem: vi.fn((k) => (k in data ? data[k] : null)),
    setItem: vi.fn((k, v) => {
      data[k] = String(v)
    }),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }
}

describe('UNIT-STORAGE', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    window.localStorage.clear()
  })

  it('UT-STORAGE-001 readThemeOverride returns "day" and "night" for stored values', () => {
    expect(readThemeOverride(makeStub({ [KEY]: 'day' }))).toBe('day')
    expect(readThemeOverride(makeStub({ [KEY]: 'night' }))).toBe('night')
  })

  it('UT-STORAGE-002 missing key -> null', () => {
    expect(readThemeOverride(makeStub())).toBeNull()
  })

  it.each(['foo', '', 'DAY', ' night', 'null'])('UT-STORAGE-003 invalid value %j -> null', (v) => {
    expect(readThemeOverride(makeStub({ [KEY]: v }))).toBeNull()
  })

  it('UT-STORAGE-004 reads only key jsv-theme-override via THEME_STORAGE_KEY', () => {
    const stub = makeStub({ [KEY]: 'day' })
    readThemeOverride(stub)
    expect(THEME_STORAGE_KEY).toBe(KEY)
    expect(stub.getItem.mock.calls).toEqual([[KEY]])
  })

  it('UT-STORAGE-005 getItem throws (SecurityError) -> null, no throw, no console.error', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const stub = {
      getItem: () => {
        throw new DOMException('denied', 'SecurityError')
      },
    }
    expect(readThemeOverride(stub)).toBeNull()
    expect(err).not.toHaveBeenCalled()
  })

  it('UT-STORAGE-006 localStorage getter throws -> read null, write false, no throw', () => {
    const spy = vi.spyOn(globalThis, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    expect(readThemeOverride()).toBeNull()
    expect(writeThemeOverride('night')).toBe(false)
    expect(spy).toHaveBeenCalled()
  })

  it('UT-STORAGE-007 localStorage undefined -> read null, write false', () => {
    vi.spyOn(globalThis, 'localStorage', 'get').mockReturnValue(undefined)
    expect(readThemeOverride()).toBeNull()
    expect(writeThemeOverride('day')).toBe(false)
  })

  it('UT-STORAGE-008 writeThemeOverride("night", stub) calls setItem and returns true', () => {
    const stub = makeStub()
    expect(writeThemeOverride('night', stub)).toBe(true)
    expect(stub.setItem).toHaveBeenCalledTimes(1)
    expect(stub.setItem).toHaveBeenCalledWith(KEY, 'night')
  })

  it('UT-STORAGE-009 writeThemeOverride("day") with real jsdom storage persists the value', () => {
    window.localStorage.clear()
    expect(writeThemeOverride('day')).toBe(true)
    expect(window.localStorage.getItem(KEY)).toBe('day')
    expect(window.localStorage.length).toBe(1)
    expect(readThemeOverride()).toBe('day')
  })

  it('UT-STORAGE-010 setItem throws QuotaExceededError -> false, no throw', () => {
    const stub = {
      setItem: () => {
        throw new DOMException('full', 'QuotaExceededError')
      },
    }
    expect(writeThemeOverride('night', stub)).toBe(false)
  })

  it('UT-STORAGE-011 invalid theme argument -> false, nothing written', () => {
    const stub = makeStub()
    expect(writeThemeOverride('foo', stub)).toBe(false)
    expect(writeThemeOverride(undefined, stub)).toBe(false)
    expect(stub.setItem).not.toHaveBeenCalled()
  })

  it('UT-STORAGE-012 never touches other keys, clear or removeItem', () => {
    const stub = makeStub({ other: 'keep', another: '1' })
    readThemeOverride(stub)
    writeThemeOverride('day', stub)
    expect(stub.data.other).toBe('keep')
    expect(stub.data.another).toBe('1')
    expect(stub.clear).not.toHaveBeenCalled()
    expect(stub.removeItem).not.toHaveBeenCalled()
    expect(stub.setItem.mock.calls.every(([k]) => k === KEY)).toBe(true)
  })

  it('UT-STORAGE-013 holds no module state; only imports the site config key', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/lib/storage.js'), 'utf8')
    const imports = [...src.matchAll(/^\s*import\s.*$/gm)].map((m) => m[0].trim())
    expect(imports).toHaveLength(1)
    expect(imports[0]).toMatch(/config\/site\.js/)
    expect(src).not.toMatch(/^\s*(let|var)\s/m)
    expect(src).not.toMatch(/^(const)\s+\w+\s*=\s*(new|\[|\{)/m)
    expect(src).not.toMatch(/\bimport\s+.*react/)
  })
})

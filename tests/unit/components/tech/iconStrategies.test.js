import { isValidElement } from 'react'
import { render } from '@testing-library/react'
import {
  ICON_STRATEGIES,
  SIMPLE_ICONS_BASE,
  fallbackIcon,
  parseIconRef,
} from '../../../../src/components/tech/iconStrategies.js'
import Icon from '../../../../src/components/ui/Icon.jsx'

describe('UNIT-ICON_STRATEGIES', () => {
  it('UT-ICON_STRATEGIES-001 parseIconRef splits known prefixes', () => {
    expect(parseIconRef('si:cplusplus')).toEqual({ kind: 'si', value: 'cplusplus' })
    expect(parseIconRef('svg:i2c')).toEqual({ kind: 'svg', value: 'i2c' })
    expect(parseIconRef('ms:rocket_launch')).toEqual({ kind: 'ms', value: 'rocket_launch' })
  })

  it('UT-ICON_STRATEGIES-002 unknown prefix selects the fallback strategy', () => {
    const ref = parseIconRef('foo:bar')
    expect(ref.kind).toBeNull()
    expect(ICON_STRATEGIES[ref.kind]).toBeUndefined()
    const el = (ICON_STRATEGIES[ref.kind] || fallbackIcon)({ value: ref.value, color: 'red', size: 22 })
    expect(el.props.name).toBe('code')
  })

  it('UT-ICON_STRATEGIES-003 nocolon, empty, null, undefined fall back without throwing', () => {
    for (const v of ['nocolon', '', null, undefined, 42, ':x', 'constructor:x']) {
      expect(() => parseIconRef(v)).not.toThrow()
      expect(parseIconRef(v).kind).toBeNull()
    }
    expect(parseIconRef(null)).toEqual({ kind: null, value: '' })
    expect(parseIconRef('nocolon')).toEqual({ kind: null, value: 'nocolon' })
  })

  it('UT-ICON_STRATEGIES-004 only the first colon splits', () => {
    expect(parseIconRef('ms:a:b')).toEqual({ kind: 'ms', value: 'a:b' })
  })

  it('UT-ICON_STRATEGIES-005 ICON_STRATEGIES keys exactly si, ms, svg; map frozen', () => {
    expect(Object.keys(ICON_STRATEGIES).sort()).toEqual(['ms', 'si', 'svg'])
    expect(Object.isFrozen(ICON_STRATEGIES)).toBe(true)
  })

  it('UT-ICON_STRATEGIES-006 si strategy builds https://cdn.simpleicons.org/<slug>', () => {
    expect(SIMPLE_ICONS_BASE).toBe('https://cdn.simpleicons.org/')
    const el = ICON_STRATEGIES.si({ value: 'qt', color: '#fff', size: 22, failed: false, onError() {} })
    expect(el.type).toBe('img')
    expect(el.props.src).toBe('https://cdn.simpleicons.org/qt')
  })

  it('UT-ICON_STRATEGIES-007 fallback strategy renders Icon "code" in the given colour', () => {
    const el = fallbackIcon({ color: '#123456', size: 30 })
    expect(isValidElement(el)).toBe(true)
    expect(el.type).toBe(Icon)
    expect(el.props.name).toBe('code')
    expect(el.props.size).toBe(30)
    const { container } = render(el)
    expect(container.firstChild.textContent).toBe('code')
    expect(container.firstChild.style.color).toBe('rgb(18, 52, 86)')
  })
})

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { CUSTOM_SVGS } from '../../../../src/components/tech/customSvgs.jsx'

const BASELINE = JSON.parse(
  readFileSync(resolve(process.cwd(), 'tests/fixtures/baseline-custom-svgs.json'), 'utf8'),
)
const KEYS = [
  'oop', 'stl', 'smartptr', 'bit', 'struct', 'lvgl', 'touchgfx', 'guiguider', 'crank', 'candera',
  'vglite', 'freertos', 'nxp', 'uart', 'spi', 'i2c', 'can', 'gpio', 'plasticscm', 'tklogger', 'ea',
  'polarion', 'gdb', 'dlt', 'hil', 'ecu', 'fontforge', 'agile', 'aspice', 'uml',
]

describe('UNIT-CUSTOM_SVGS', () => {
  it('UT-CUSTOM_SVGS-001 exactly 30 keys in baseline order', () => {
    expect(Object.keys(CUSTOM_SVGS)).toEqual(KEYS)
    expect(KEYS).toHaveLength(30)
  })

  it.each(KEYS)('UT-CUSTOM_SVGS-002 %s factory returns an svg with width and height = size', (k) => {
    const el = CUSTOM_SVGS[k]('#112233', 31)
    expect(el.type).toBe('svg')
    expect(el.props.width).toBe(31)
    expect(el.props.height).toBe(31)
  })

  it.each(KEYS)('UT-CUSTOM_SVGS-003 %s uses the passed colour', (k) => {
    const html = renderToStaticMarkup(CUSTOM_SVGS[k]('#abc123', 22))
    expect(html).toContain('#abc123')
  })

  it.each(KEYS)('UT-CUSTOM_SVGS-004 %s markup equals the baseline snapshot (dd9a86d)', (k) => {
    expect(renderToStaticMarkup(CUSTOM_SVGS[k]('#abc123', 22))).toBe(BASELINE[k])
  })

  it('UT-CUSTOM_SVGS-005 registry frozen', () => {
    expect(Object.isFrozen(CUSTOM_SVGS)).toBe(true)
  })
})

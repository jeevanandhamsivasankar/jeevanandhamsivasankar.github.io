import { useState, useCallback } from 'react'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { ThemeProvider, useThemeContext } from '../../../src/context/ThemeContext.jsx'
import { useTheme } from '../../../src/hooks/useTheme.js'

vi.mock('../../../src/hooks/useTheme.js', () => ({ useTheme: vi.fn() }))

const NOW = new Date('2026-06-21T06:30:00Z')
const stable = { toggle: vi.fn() }

function Consumer({ id = 'c' }) {
  const ctx = useThemeContext()
  return (
    <div data-testid={id}>
      <span data-testid={`${id}-theme`}>{ctx.theme}</span>
      <span data-testid={`${id}-isday`}>{String(ctx.isDay)}</span>
      <span data-testid={`${id}-now`}>{ctx.now.toISOString()}</span>
      <button onClick={ctx.toggle}>toggle-{id}</button>
    </div>
  )
}

describe('UNIT-THEME_CONTEXT', () => {
  beforeEach(() => {
    stable.toggle = vi.fn()
    useTheme.mockReset()
    useTheme.mockReturnValue({ theme: 'day', isDay: true, isManual: false, toggle: stable.toggle, now: NOW })
  })

  it('UT-THEME_CONTEXT-001 ThemeProvider renders its children', () => {
    render(
      <ThemeProvider>
        <p data-testid="child">hello</p>
      </ThemeProvider>,
    )
    expect(screen.getByTestId('child')).toHaveTextContent('hello')
  })

  it('UT-THEME_CONTEXT-002 consumer receives {theme, isDay, toggle, now} from useTheme', () => {
    const captured = []
    function Probe() {
      captured.push(useThemeContext())
      return null
    }
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    const seen = captured[captured.length - 1]
    expect(seen).toEqual(
      expect.objectContaining({ theme: 'day', isDay: true, toggle: stable.toggle, now: NOW }),
    )
  })

  it('UT-THEME_CONTEXT-003 toggle calls the hook toggle and all consumers re-render with the new theme', () => {
    useTheme.mockImplementation(() => {
      const [theme, setTheme] = useState('day')
      const toggle = useCallback(() => setTheme((t) => (t === 'day' ? 'night' : 'day')), [])
      return { theme, isDay: theme === 'day', isManual: false, toggle, now: NOW }
    })
    render(
      <ThemeProvider>
        <Consumer id="a" />
        <Consumer id="b" />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('a-theme')).toHaveTextContent('day')
    expect(screen.getByTestId('b-theme')).toHaveTextContent('day')
    fireEvent.click(screen.getByText('toggle-a'))
    expect(screen.getByTestId('a-theme')).toHaveTextContent('night')
    expect(screen.getByTestId('b-theme')).toHaveTextContent('night')
    expect(screen.getByTestId('b-isday')).toHaveTextContent('false')
  })

  it('UT-THEME_CONTEXT-007 context toggle is the hook toggle (called once per click)', () => {
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    )
    fireEvent.click(screen.getByText('toggle-c'))
    expect(stable.toggle).toHaveBeenCalledTimes(1)
  })

  it('UT-THEME_CONTEXT-004 useThemeContext outside the provider throws the documented message', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Consumer />)).toThrow('useThemeContext must be used within ThemeProvider')
    err.mockRestore()
  })

  it('UT-THEME_CONTEXT-005 provider calls useTheme exactly once per render', () => {
    const { rerender } = render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    )
    expect(useTheme).toHaveBeenCalledTimes(1)
    rerender(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    )
    expect(useTheme).toHaveBeenCalledTimes(2)
  })

  it('UT-THEME_CONTEXT-006 context value is referentially stable when the provider re-renders without state change', () => {
    const values = []
    function Probe() {
      values.push(useThemeContext())
      return null
    }
    function Parent() {
      const [, setN] = useState(0)
      return (
        <>
          <button onClick={() => setN((n) => n + 1)}>bump</button>
          <ThemeProvider>
            <Probe />
          </ThemeProvider>
        </>
      )
    }
    render(<Parent />)
    act(() => {
      fireEvent.click(screen.getByText('bump'))
    })
    expect(values.length).toBeGreaterThanOrEqual(2)
    expect(values[values.length - 1]).toBe(values[0])
  })
})

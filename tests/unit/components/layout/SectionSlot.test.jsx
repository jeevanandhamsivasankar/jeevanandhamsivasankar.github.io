import { lazy } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SectionSlot from '../../../../src/components/layout/SectionSlot.jsx'

const entry = (over) => ({ id: 'about', lazy: false, minHeight: 321, component: () => <p>body</p>, ...over })

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('UNIT-SECTION_SLOT', () => {
  it('UT-SECTION_SLOT-001 eager entry renders the component with meta', () => {
    const Comp = vi.fn(() => <p>eager</p>)
    const e = entry({ component: Comp })
    render(<SectionSlot entry={e} />)
    expect(screen.getByText('eager')).toBeInTheDocument()
    expect(Comp.mock.calls[0][0]).toEqual({ meta: e })
  })

  it('UT-SECTION_SLOT-002 lazy pending shows the placeholder (id, data-section, marker, min-height)', () => {
    const Never = lazy(() => new Promise(() => {}))
    const { container } = render(<SectionSlot entry={entry({ lazy: true, component: Never })} />)
    const ph = container.querySelector('[data-section-placeholder]')
    expect(ph).not.toBeNull()
    expect(ph).toHaveAttribute('id', 'about')
    expect(ph).toHaveAttribute('data-section', 'about')
    expect(ph).toHaveAttribute('aria-busy', 'true')
    expect(ph.style.minHeight).toBe('321px')
  })

  it('UT-SECTION_SLOT-003 resolving lazy shows the section', async () => {
    const Ok = lazy(() => Promise.resolve({ default: () => <p>loaded</p> }))
    const { container } = render(<SectionSlot entry={entry({ lazy: true, component: Ok })} />)
    expect(await screen.findByText('loaded')).toBeInTheDocument()
    expect(container.querySelector('[data-section-placeholder]')).toBeNull()
  })

  it('UT-SECTION_SLOT-004 rejected lazy import shows fallback with id and working Reload button', async () => {
    const user = userEvent.setup()
    const reload = vi.fn()
    const orig = window.location
    Object.defineProperty(window, 'location', { configurable: true, value: { ...orig, reload } })
    try {
      const Bad = lazy(() => Promise.reject(new Error('chunk failed')))
      const { container } = render(<SectionSlot entry={entry({ lazy: true, component: Bad })} />)
      const alert = await screen.findByRole('alert')
      expect(alert).toHaveAttribute('id', 'about')
      expect(alert).toHaveAttribute('data-section', 'about')
      expect(alert).toHaveTextContent('This section failed to load.')
      await user.click(screen.getByRole('button', { name: 'Reload page' }))
      expect(reload).toHaveBeenCalledTimes(1)
      expect(container.querySelector('[data-section-placeholder]')).toBeNull()
    } finally {
      Object.defineProperty(window, 'location', { configurable: true, value: orig })
    }
  })

  it('UT-SECTION_SLOT-005 a throwing component shows the fallback while a sibling slot still renders', async () => {
    const Boom = () => {
      throw new Error('boom')
    }
    render(
      <>
        <SectionSlot entry={entry({ id: 'bad', component: Boom })} />
        <SectionSlot entry={entry({ id: 'good', component: () => <p>sibling ok</p> })} />
      </>,
    )
    await waitFor(() => expect(screen.getByRole('alert')).toHaveAttribute('id', 'bad'))
    expect(screen.getByText('sibling ok')).toBeInTheDocument()
  })
})

import { lazy, Suspense, useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorBoundary from '../../../src/components/ErrorBoundary.jsx'

let errSpy
beforeEach(() => {
  errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

const Boom = ({ msg = 'boom' }) => {
  throw new Error(msg)
}

describe('UNIT-ERROR_BOUNDARY', () => {
  it('UT-ERROR_BOUNDARY-001 renders children when nothing throws', () => {
    render(
      <ErrorBoundary fallback={<p>fb</p>}>
        <p>fine</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('fine')).toBeInTheDocument()
    expect(screen.queryByText('fb')).toBeNull()
  })

  it('UT-ERROR_BOUNDARY-002 child throwing during render renders the fallback node', () => {
    render(
      <ErrorBoundary fallback={<p>fallback node</p>}>
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByText('fallback node')).toBeInTheDocument()
  })

  it('UT-ERROR_BOUNDARY-003 function fallback receives (error, reset); reset re-renders children', async () => {
    const user = userEvent.setup()
    let shouldThrow = true
    const Maybe = () => {
      if (shouldThrow) throw new Error('first')
      return <p>recovered</p>
    }
    const fb = vi.fn((error, reset) => (
      <button onClick={reset}>retry: {error.message}</button>
    ))
    render(
      <ErrorBoundary fallback={fb}>
        <Maybe />
      </ErrorBoundary>,
    )
    expect(fb).toHaveBeenCalled()
    expect(fb.mock.calls[0][0]).toBeInstanceOf(Error)
    expect(typeof fb.mock.calls[0][1]).toBe('function')
    shouldThrow = false
    await user.click(screen.getByRole('button', { name: 'retry: first' }))
    expect(screen.getByText('recovered')).toBeInTheDocument()
  })

  it('UT-ERROR_BOUNDARY-004 componentDidCatch logs via console.error', () => {
    render(
      <ErrorBoundary fallback={<p>x</p>}>
        <Boom msg="logged" />
      </ErrorBoundary>,
    )
    const own = errSpy.mock.calls.find(([first]) => typeof first === 'string' && first.includes('ErrorBoundary'))
    expect(own).toBeDefined()
    expect(own[1]).toBeInstanceOf(Error)
    expect(own[1].message).toBe('logged')
  })

  it('UT-ERROR_BOUNDARY-005 onError receives the error and component stack', () => {
    const onError = vi.fn()
    render(
      <ErrorBoundary fallback={<p>x</p>} onError={onError}>
        <Boom msg="reported" />
      </ErrorBoundary>,
    )
    expect(onError).toHaveBeenCalledTimes(1)
    const [error, info] = onError.mock.calls[0]
    expect(error.message).toBe('reported')
    expect(typeof info.componentStack).toBe('string')
    expect(info.componentStack.length).toBeGreaterThan(0)
  })

  it('UT-ERROR_BOUNDARY-006 no fallback prop renders default fallback text (role=alert)', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.')
  })

  it('UT-ERROR_BOUNDARY-007 Suspense child whose lazy import rejects renders the fallback', async () => {
    const Bad = lazy(() => Promise.reject(new Error('chunk')))
    render(
      <ErrorBoundary fallback={<p>lazy fallback</p>}>
        <Suspense fallback={<p>loading</p>}>
          <Bad />
        </Suspense>
      </ErrorBoundary>,
    )
    expect(await screen.findByText('lazy fallback')).toBeInTheDocument()
  })

  it('UT-ERROR_BOUNDARY-008 errors thrown in event handlers are not caught; page stays', () => {
    const swallow = (e) => e.preventDefault()
    window.addEventListener('error', swallow)
    const Clicky = () => {
      const [n, setN] = useState(0)
      return (
        <button
          onClick={() => {
            setN(n + 1)
            throw new Error('handler')
          }}
        >
          click {n}
        </button>
      )
    }
    try {
      render(
        <ErrorBoundary fallback={<p>fallback</p>}>
          <Clicky />
        </ErrorBoundary>,
      )
      try {
        fireEvent.click(screen.getByRole('button'))
      } catch {
        /* React may rethrow the handler error synchronously */
      }
      expect(screen.queryByText('fallback')).toBeNull()
      expect(screen.getByRole('button')).toBeInTheDocument()
    } finally {
      window.removeEventListener('error', swallow)
    }
  })

  it('UT-ERROR_BOUNDARY-009 nested boundaries: inner catches first; outer intact', () => {
    render(
      <ErrorBoundary fallback={<p>outer fb</p>}>
        <p>outer ok</p>
        <ErrorBoundary fallback={<p>inner fb</p>}>
          <Boom />
        </ErrorBoundary>
      </ErrorBoundary>,
    )
    expect(screen.getByText('inner fb')).toBeInTheDocument()
    expect(screen.getByText('outer ok')).toBeInTheDocument()
    expect(screen.queryByText('outer fb')).toBeNull()
  })
})

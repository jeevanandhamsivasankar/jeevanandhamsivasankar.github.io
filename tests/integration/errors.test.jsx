import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { settle } from '../utils/appHelpers.jsx'

const SECTION_PATHS = ['Projects', 'Skills', 'Design']

afterEach(() => {
  for (const name of SECTION_PATHS) vi.doUnmock(`../../src/sections/${name}.jsx`)
  vi.doUnmock('../../src/App.jsx')
  vi.doUnmock('react-dom/client')
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('error containment (ARC-015, ARC-002, ARC-016, ARC-001)', () => {
  it('IT-014 section ErrorBoundary isolates a throwing section', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.doMock('../../src/sections/Projects.jsx', () => ({
      default: () => {
        throw new Error('boom')
      },
    }))
    vi.resetModules()
    const { default: App } = await import('../../src/App.jsx')
    await act(async () => {
      render(<App />)
    })
    await settle()

    const projects = document.getElementById('projects')
    expect(projects).not.toBeNull()
    expect(projects).toHaveTextContent(/failed to load/i)
    expect(within(projects).getByRole('button', { name: /reload/i })).toBeInTheDocument()

    const others = [...document.querySelectorAll('[data-section]')].filter((s) => s.id !== 'projects')
    expect(others).toHaveLength(9)
    expect(document.getElementById('about')).toHaveTextContent('Who I Am')
    expect(document.querySelector('nav.nav')).not.toBeNull()
    expect(document.querySelector('footer')).not.toBeNull()
    expect(errorSpy.mock.calls.some((args) => args.some((a) => a instanceof Error && a.message === 'boom'))).toBe(true)
  })

  it('IT-015 rejected lazy import shows the fallback with a working Reload', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const reload = vi.fn()
    vi.stubGlobal('location', { ...window.location, reload })
    vi.doMock('../../src/sections/Skills.jsx', () => {
      const err = new Error('Loading chunk skills failed')
      err.name = 'ChunkLoadError'
      throw err
    })
    vi.resetModules()
    const { default: App } = await import('../../src/App.jsx')
    await act(async () => {
      render(<App />)
    })
    await settle()

    const skills = document.getElementById('skills')
    expect(skills).toHaveTextContent(/failed to load/i)
    expect(document.querySelectorAll('[role="alert"]')).toHaveLength(1) // that section only
    expect(document.getElementById('about')).not.toHaveTextContent(/failed to load/i)

    fireEvent.click(within(skills).getByRole('button', { name: /reload/i }))
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('IT-016 page-level ErrorBoundary when App itself fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const renderMock = vi.fn()
    vi.doMock('react-dom/client', () => ({
      createRoot: () => ({ render: renderMock }),
      default: { createRoot: () => ({ render: renderMock }) },
    }))
    vi.doMock('../../src/App.jsx', () => ({
      default: () => {
        throw new Error('app exploded')
      },
    }))
    vi.resetModules()
    document.body.innerHTML = '<div id="root"></div>'
    await import('../../src/main.jsx')
    const { OWNER_NAME, OWNER_TITLE, EMAIL } = await import('../../src/config/site.js')
    const tree = renderMock.mock.calls[0][0]

    render(tree)
    expect(screen.getByText(OWNER_NAME)).toBeInTheDocument()
    expect(screen.getByText(OWNER_TITLE)).toBeInTheDocument()
    const mail = document.querySelector(`a[href="mailto:${EMAIL}"]`)
    expect(mail).not.toBeNull()
    const resume = document.querySelector('a[href="Jeevanandham_Resume.pdf"]')
    expect(resume).not.toBeNull()
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument()
  })
})

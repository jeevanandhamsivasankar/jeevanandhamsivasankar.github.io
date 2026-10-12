import { StrictMode } from 'react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const h = vi.hoisted(() => ({ renderFn: vi.fn(), createRoot: vi.fn() }))

vi.mock('react-dom/client', () => ({
  createRoot: (...a) => {
    h.createRoot(...a)
    return { render: h.renderFn }
  },
}))
vi.mock('../../src/App.jsx', () => ({ default: function AppStub() { return null } }))

let rootEl
async function loadMain() {
  vi.resetModules()
  h.renderFn.mockClear()
  h.createRoot.mockClear()
  await import('../../src/main.jsx')
}

beforeEach(() => {
  rootEl = document.createElement('div')
  rootEl.id = 'root'
  document.body.appendChild(rootEl)
})
afterEach(() => rootEl.remove())

describe('UNIT-MAIN', () => {
  it('UT-MAIN-001 calls createRoot(document.getElementById("root")) once', async () => {
    await loadMain()
    expect(h.createRoot).toHaveBeenCalledTimes(1)
    expect(h.createRoot).toHaveBeenCalledWith(rootEl)
    expect(h.renderFn).toHaveBeenCalledTimes(1)
  })

  it('UT-MAIN-002 renders StrictMode > ErrorBoundary (page fallback) > App', async () => {
    await loadMain()
    const tree = h.renderFn.mock.calls[0][0]
    const { default: ErrorBoundary } = await import('../../src/components/ErrorBoundary.jsx')
    const { default: App } = await import('../../src/App.jsx')
    expect(tree.type).toBe(StrictMode)
    const eb = tree.props.children
    expect(eb.type).toBe(ErrorBoundary)
    expect(eb.props.fallback).toBeTruthy()
    expect(eb.props.children.type).toBe(App)
  })

  it('UT-MAIN-003 imports ./styles/index.css exactly once', async () => {
    await loadMain() // the CSS import must not break module evaluation
    const src = readFileSync(resolve(process.cwd(), 'src/main.jsx'), 'utf8')
    expect(src.match(/import\s+["']\.\/styles\/index\.css["']/g)).toHaveLength(1)
  })

  it('UT-MAIN-004 page fallback shows owner name, title, email link, resume link and a reload button', async () => {
    await loadMain()
    const site = await import('../../src/config/site.js')
    const fallback = h.renderFn.mock.calls[0][0].props.children.props.fallback
    render(fallback)
    expect(screen.getByText(site.OWNER_NAME)).toBeInTheDocument()
    expect.soft(screen.queryByText(new RegExp(site.OWNER_TITLE))).not.toBeNull()
    expect.soft(document.querySelector(`a[href="mailto:${site.EMAIL}"]`)).not.toBeNull()
    const resume = document.querySelector(`a[href="${site.RESUME.href}"]`)
    expect(resume).not.toBeNull()
    const reload = vi.fn()
    const orig = window.location
    Object.defineProperty(window, 'location', { configurable: true, value: { ...orig, reload } })
    try {
      await userEvent.setup().click(screen.getByRole('button', { name: /reload/i }))
      expect(reload).toHaveBeenCalled()
    } finally {
      Object.defineProperty(window, 'location', { configurable: true, value: orig })
    }
  })
})

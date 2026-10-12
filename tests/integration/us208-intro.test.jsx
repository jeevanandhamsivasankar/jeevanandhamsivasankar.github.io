import { readFileSync } from 'node:fs'
import { render, screen, act, fireEvent } from '@testing-library/react'
import App from '../../src/App.jsx'
import { SITE } from '../../src/config/site.js'

describe('IT-056 App mounts the ignition intro lazily behind the flag', () => {
  afterEach(() => { window.history.replaceState({}, '', '/'); sessionStorage.clear() })

  it('IT-056 flag defaults to a boolean and App code-splits the intro', () => {
    expect(typeof SITE.intro).toBe('boolean')
    const src = readFileSync('src/components/effects/Overlays.jsx', 'utf8')
    expect(src).toMatch(/lazy\(\(\) => import\("\.\/IgnitionIntro\.jsx"\)\)/)
    expect(src).not.toMatch(/^import IgnitionIntro/m)
    expect(readFileSync('src/App.jsx', 'utf8')).toMatch(/Overlays introEnabled=\{SITE\.intro\}/)
  })
  // Flag enabled by the owner (2026-10-12): the intro plays on the first load of a session only.
  it('IT-056 intro absent once played this session, present on a fresh session, skippable and marks session', async () => {
    sessionStorage.setItem('jsv-intro-played', '1')
    const { unmount } = render(<App sections={[]} />)
    expect(screen.queryByTestId('ignition-intro')).toBeNull()
    unmount()
    sessionStorage.removeItem('jsv-intro-played')
    render(<App sections={[]} />)
    const root = await screen.findByTestId('ignition-intro')
    expect(sessionStorage.getItem('jsv-intro-played')).toBe('1')
    const skip = screen.getByRole('button', { name: 'Skip intro' })
    expect(root.querySelector('[aria-hidden="true"]')).not.toBeNull()
    await act(async () => { fireEvent.click(skip) })
    expect(screen.queryByTestId('ignition-intro')).toBeNull()
  })
})

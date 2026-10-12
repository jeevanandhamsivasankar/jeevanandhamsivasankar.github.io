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
  it('IT-056 intro absent when the flag is off, present with ?intro=1, skippable and marks session', async () => {
    const { unmount } = render(<App sections={[]} />)
    expect(screen.queryByTestId('ignition-intro')).toBeNull()
    unmount()
    window.history.replaceState({}, '', '/?intro=1')
    render(<App sections={[]} />)
    const root = await screen.findByTestId('ignition-intro')
    expect(sessionStorage.getItem('jsv-intro-played')).toBe('1')
    const skip = screen.getByRole('button', { name: 'Skip intro' })
    expect(root.querySelector('[aria-hidden="true"]')).not.toBeNull()
    await act(async () => { fireEvent.click(skip) })
    expect(screen.queryByTestId('ignition-intro')).toBeNull()
  })
})

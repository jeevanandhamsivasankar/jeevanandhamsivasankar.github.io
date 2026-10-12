import App from '../../src/App.jsx'
import { getIntersectionObservers } from '../utils/browserMocks.js'
import { renderAndSettle } from '../utils/appHelpers.jsx'

describe('reveal fallback (ARC-009, ARC-010, ARC-016, ARC-002)', () => {
  const savedWin = window.IntersectionObserver
  const savedGlobal = globalThis.IntersectionObserver
  afterEach(() => {
    window.IntersectionObserver = savedWin
    globalThis.IntersectionObserver = savedGlobal
  })

  it('IT-030 IO-missing reveal fallback across all lazy sections', async () => {
    delete window.IntersectionObserver
    delete globalThis.IntersectionObserver
    await renderAndSettle(<App />)

    const reveals = [...document.querySelectorAll('.reveal')]
    expect(reveals.length).toBeGreaterThan(20)
    for (const el of reveals) expect(el).toHaveClass('visible')
    expect(getIntersectionObservers()).toHaveLength(0)
  })
})

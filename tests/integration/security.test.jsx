import App from '../../src/App.jsx'
import { renderAndSettle } from '../utils/appHelpers.jsx'

describe('link security (ARC-016, ARC-010, ARC-003)', () => {
  it('IT-031 every target=_blank anchor carries rel="noopener noreferrer"', async () => {
    await renderAndSettle(<App />)
    const anchors = [...document.querySelectorAll('a[target="_blank"]')]
    expect(anchors.length).toBeGreaterThan(0)
    for (const a of anchors) {
      const rel = (a.getAttribute('rel') ?? '').split(/\s+/)
      expect(rel, a.outerHTML.slice(0, 80)).toEqual(expect.arrayContaining(['noopener', 'noreferrer']))
    }
  })
})

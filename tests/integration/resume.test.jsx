import App from '../../src/App.jsx'
import { RESUME } from '../../src/config/site.js'
import { renderAndSettle } from '../utils/appHelpers.jsx'

describe('resume links (ARC-016, ARC-003, ARC-010)', () => {
  it('IT-032 all resume links use the configured path and download name', async () => {
    await renderAndSettle(<App />)
    const downloads = [...document.querySelectorAll('a[download]')]
    expect(downloads).toHaveLength(3)
    for (const a of downloads) {
      expect(a.getAttribute('href')).toBe(RESUME.href)
      expect(a.getAttribute('download')).toBe(RESUME.downloadName)
    }
    expect(RESUME.downloadName).toBe('Jeevanandham_SeniorHMIEngineer_Resume.pdf')

    const views = [...document.querySelectorAll(`a[href="${RESUME.href}"]:not([download])`)]
    expect(views).toHaveLength(2)
    for (const a of views) {
      expect(a).toHaveAttribute('target', '_blank')
      expect(a.getAttribute('rel')).toMatch(/noopener/)
    }
  })
})

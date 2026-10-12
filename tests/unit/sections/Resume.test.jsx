import { render, screen } from '@testing-library/react'
import Resume from '../../../src/sections/Resume.jsx'
import { RESUME } from '../../../src/config/site.js'
import { RESUME_PREVIEW } from '../../../src/data/profile.js'
import { norm, sectionFrame } from '../../utils/styleNorm.js'

describe('UNIT-RESUME', () => {
  it('UT-RESUME-001 label "08 — Resume" (description); h3 "Download My Resume"; no h2; paragraph text', () => {
    const { container } = render(<Resume />)
    sectionFrame(container, {
      id: 'resume', tag: 'div', labelIcon: 'description', labelText: '08 — Resume', title: null,
    })
    expect(container.querySelector('h2')).toBeNull()
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Download My Resume')
    expect(container.querySelector('.resume-info p').textContent).toBe(RESUME_PREVIEW.intro)
  })

  it('UT-RESUME-002 "Download PDF" btn-green with href/download from config; "View Online" btn-outline external', () => {
    const { container } = render(<Resume />)
    const dl = screen.getByRole('link', { name: 'Download PDF' })
    expect(dl).toHaveClass('btn', 'btn-green')
    expect(dl).toHaveAttribute('href', RESUME.href)
    expect(dl).toHaveAttribute('download', RESUME.downloadName)
    const view = screen.getByRole('link', { name: 'View Online' })
    expect(view).toHaveClass('btn', 'btn-outline')
    expect(view).toHaveAttribute('href', RESUME.href)
    expect(view).toHaveAttribute('target', '_blank')
    expect(view).toHaveAttribute('rel', 'noopener noreferrer')
    expect(container.querySelectorAll('.resume-info a')).toHaveLength(2)
  })

  it('UT-RESUME-003 preview header uses RESUME.pages; name; role line; location/email/phone rows', () => {
    const { container } = render(<Resume />)
    const header = container.querySelector('.resume-preview-header')
    expect(header.textContent).toMatch(new RegExp(`·\\s+${RESUME.pages} PAGES$`))
    expect(header.textContent).toContain(RESUME_PREVIEW.fileLabel)
    expect(container.querySelector('.rdp-name').textContent).toBe(RESUME_PREVIEW.name)
    expect(container.querySelector('.rdp-role').textContent).toBe(RESUME_PREVIEW.roleLine)
    const preview = container.querySelector('.resume-preview')
    for (const { text } of RESUME_PREVIEW.contactRows) expect(preview.textContent).toContain(text)
    expect(RESUME_PREVIEW.contactRows).toHaveLength(3)
  })

  it('UT-RESUME-004 4 skill rows with fill widths 92, 88, 85, 78 percent and gradient backgrounds', () => {
    const { container } = render(<Resume />)
    const fills = [...container.querySelectorAll('.rdp-skill-row .rdp-bar-fill')]
    expect(fills.map((f) => f.style.width)).toEqual(['92%', '88%', '85%', '78%'])
    fills.forEach((f, i) => {
      expect(f.style.background).toContain('linear-gradient')
      expect(f.style.background).toBe(norm('background', RESUME_PREVIEW.bars[i].g))
    })
  })

  it('UT-RESUME-005 small "Download" link with the download name; small "View" link external', () => {
    const { container } = render(<Resume />)
    const small = [...container.querySelectorAll('.resume-preview a')]
    expect(small).toHaveLength(2)
    expect(small[0].textContent).toBe('downloadDownload')
    expect(small[0]).toHaveAttribute('download', RESUME.downloadName)
    expect(small[1].textContent).toBe('open_in_newView')
    expect(small[1]).toHaveAttribute('target', '_blank')
    expect(small[1]).toHaveAttribute('rel', 'noopener noreferrer')
  })
})

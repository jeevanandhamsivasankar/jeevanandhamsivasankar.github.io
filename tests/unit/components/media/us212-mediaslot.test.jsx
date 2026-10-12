import { act, fireEvent, render, screen } from '@testing-library/react'
import MediaSlot from '../../../../src/components/media/MediaSlot.jsx'
import { checkMediaItem, createMediaItem } from '../../../../src/models/mediaSchema.js'
import { setMatchMedia, triggerIntersection } from '../../../utils/browserMocks.js'

const video = (extra = {}) => ({
  id: 'v1', kind: 'video', sources: { webm: '/media/a.webm', mp4: '/media/a.mp4' }, poster: '/media/a.webp',
  width: 1280, height: 720, alt: 'Cluster demo', description: 'A demo clip', ambient: true, durationSec: 8,
  rightsConfirmed: true, ...extra,
})
const image = (extra = {}) => ({
  id: 'i1', kind: 'image', src: '/media/a.webp', width: 640, height: 360, alt: 'Screen', rightsConfirmed: true, ...extra,
})

function stubPlayback() {
  const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function () {
    Object.defineProperty(this, 'paused', { value: false, configurable: true })
    return Promise.resolve()
  })
  const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function () {
    Object.defineProperty(this, 'paused', { value: true, configurable: true })
  })
  return { play, pause }
}

describe('UNIT-MEDIASLOT', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('UT-MEDIASLOT-001 video: no sources before near; poster/size/playsinline/preload=none; WebM + MP4 once within a viewport', () => {
    const { container } = render(<MediaSlot item={video()} />)
    const v = container.querySelector('video')
    expect(v).toHaveAttribute('poster', '/media/a.webp')
    expect(v).toHaveAttribute('width', '1280')
    expect(v).toHaveAttribute('height', '720')
    expect(v).toHaveAttribute('preload', 'none')
    expect(v.playsInline).toBe(true)
    expect(container.querySelectorAll('source')).toHaveLength(0)
    act(() => triggerIntersection(container.querySelector('.media-slot__frame'), true))
    const types = [...container.querySelectorAll('source')].map((s) => s.getAttribute('type'))
    expect(types).toEqual(['video/webm', 'video/mp4'])
  })

  it('UT-MEDIASLOT-002 narrated video without a caption track is refused: empty state, no <video>', () => {
    vi.stubEnv('DEV', false)
    const { container } = render(<MediaSlot item={video({ narrated: true, ambient: false })} fallback={<i data-testid="art" />} />)
    expect(container.querySelector('video')).toBeNull()
    expect(container.querySelector('[data-state="empty"]')).not.toBeNull()
    expect(screen.getByTestId('art')).toBeInTheDocument()
    expect(checkMediaItem(video({ narrated: true }))).toMatchObject({ field: 'captions' })
    const ok = render(<MediaSlot item={video({ narrated: true, ambient: false, captions: { src: '/media/a.vtt', srclang: 'en', label: 'English' } })} />)
    expect(ok.container.querySelector('video')).not.toBeNull()
  })

  it('UT-MEDIASLOT-003 ambient: plays muted at >= 50 % visible, pauses when scrolled away; reduced motion never autoplays and shows play', () => {
    const { play, pause } = stubPlayback()
    const { container, unmount } = render(<MediaSlot item={video()} />)
    const frame = container.querySelector('.media-slot__frame')
    act(() => triggerIntersection(frame, true))
    expect(play).toHaveBeenCalled()
    expect(container.querySelector('video').muted).toBe(true)
    act(() => triggerIntersection(frame, false))
    expect(pause).toHaveBeenCalled()
    unmount()

    play.mockClear()
    setMatchMedia({ '(prefers-reduced-motion: reduce)': true })
    const r = render(<MediaSlot item={video()} />)
    act(() => triggerIntersection(r.container.querySelector('.media-slot__frame'), true))
    expect(play).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /play video/i })).toBeInTheDocument()
  })

  it('UT-MEDIASLOT-004 clips > 5 s get a named pause/play button; user play starts loading', () => {
    const { play } = stubPlayback()
    const { container } = render(<MediaSlot item={video({ ambient: false, durationSec: 12 })} />)
    const btn = screen.getByRole('button', { name: /play video: cluster demo/i })
    expect(container.querySelectorAll('source')).toHaveLength(0)
    fireEvent.click(btn)
    expect(container.querySelectorAll('source').length).toBeGreaterThan(0)
    expect(play).toHaveBeenCalled()
    const short = render(<MediaSlot item={video({ durationSec: 3 })} />)
    expect(short.container.querySelector('button')).toBeNull()
  })

  it('UT-MEDIASLOT-005 no item: production renders fallback only; DEV renders the labelled placeholder; NDA never', () => {
    vi.stubEnv('DEV', false)
    const prod = render(<MediaSlot fallback={<i data-testid="art" />} />)
    expect(prod.container.querySelector('[data-state="empty"]')).not.toBeNull()
    expect(screen.getByTestId('art')).toBeInTheDocument()
    expect(prod.container.textContent).not.toMatch(/PLACEHOLDER/)
    prod.unmount()
    window.history.pushState({}, '', '/?placeholders=1')
    const preview = render(<MediaSlot fallback={<i />} />)
    expect(preview.container.textContent).toContain('PLACEHOLDER - OWNER MEDIA')
    preview.unmount()
    const nda = render(<MediaSlot nda fallback={<i data-testid="art2" />} />)
    expect(nda.container.textContent).not.toMatch(/PLACEHOLDER/)
    window.history.pushState({}, '', '/')
    vi.stubEnv('DEV', true)
    const dev = render(<MediaSlot fallback={<i />} />)
    expect(dev.container.querySelector('[data-state="placeholder"]')).not.toBeNull()
  })

  it('UT-MEDIASLOT-006 validation: rights, alt/description, local URLs only; image renders lazily with alt and size', () => {
    expect(checkMediaItem(image({ rightsConfirmed: false }))).toMatchObject({ field: 'rightsConfirmed' })
    expect(checkMediaItem(image({ alt: undefined }))).toMatchObject({ field: 'alt' })
    expect(checkMediaItem(image({ src: 'https://cdn.example.com/a.webp' }))).toMatchObject({ field: 'src' })
    expect(checkMediaItem(image({ src: '//cdn.example.com/a.webp' }))).toMatchObject({ field: 'src' })
    expect(checkMediaItem(video({ poster: 'http://x/y.webp' }))).toMatchObject({ field: 'poster' })
    expect(() => createMediaItem(image({ rightsConfirmed: false }))).toThrow('Invalid MediaItem: rightsConfirmed')
    expect(Object.isFrozen(createMediaItem(image()))).toBe(true)
    const { container } = render(<MediaSlot item={image()} />)
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('loading', 'lazy')
    expect(img).toHaveAttribute('alt', 'Screen')
    expect(img).toHaveAttribute('width', '640')
  })
})

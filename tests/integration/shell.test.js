import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const html = fs.readFileSync(path.resolve('index.html'), 'utf8')
const doc = new DOMParser().parseFromString(html, 'text/html')
const meta = (sel) => doc.querySelector(`meta[${sel}]`)?.getAttribute('content')

/**
 * vite.config.js is evaluated in a real Node process: importing vite inside the jsdom
 * environment breaks esbuild's TextEncoder invariant.
 */
function inspectViteConfig(indexHtml) {
  const script = `
    const { default: cfg } = await import(${JSON.stringify(path.resolve('vite.config.js'))})
    const plugins = [cfg.plugins].flat(Infinity).filter(Boolean)
    const out = []
    for (const p of plugins) {
      const hook = typeof p.transformIndexHtml === 'function' ? p.transformIndexHtml : p.transformIndexHtml?.handler
      let html = null
      if (hook) { const r = await hook(${JSON.stringify(indexHtml)}); html = typeof r === 'string' ? r : JSON.stringify(r) }
      out.push({ name: p.name, apply: typeof p.apply === 'string' ? p.apply : typeof p.apply, hasTransform: Boolean(hook), html })
    }
    console.log(JSON.stringify(out))
  `
  return JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', script], { encoding: 'utf8' }))
}

describe('HTML shell and build config (ARC-018, ARC-020)', () => {
  it('IT-041 HTML shell metadata and build-only CSP plugin', async () => {
    expect(doc.documentElement.getAttribute('lang')).toBe('en')
    expect(doc.title).toMatch(/Jeevanandham/)
    expect(meta('name="description"')).toMatch(/Qt\/QML/)
    expect(meta('name="author"')).toBeTruthy()
    expect(meta('name="theme-color"')).toBeTruthy()
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://jeevanandhamsivasankar.github.io/')
    for (const p of ['og:type', 'og:url', 'og:title', 'og:description', 'og:image']) {
      expect(meta(`property="${p}"`), p).toBeTruthy()
    }
    expect(meta('name="twitter:card"')).toBeTruthy()
    expect(doc.querySelector('link[rel="icon"]')?.getAttribute('href')).toBeTruthy()
    const preload = doc.querySelector('link[rel="preload"][as="image"]')
    expect(preload?.getAttribute('href')).toBe('/profile.webp')
    expect(doc.querySelector('noscript')?.textContent).toMatch(/JavaScript/i)
    expect(doc.getElementById('root')).not.toBeNull()

    // no inline script besides the module entry
    const scripts = [...doc.querySelectorAll('script')]
    expect(scripts.filter((s) => !s.hasAttribute('src'))).toHaveLength(0)
    expect(scripts).toHaveLength(1)
    expect(scripts[0].getAttribute('type')).toBe('module')
    expect(scripts[0].getAttribute('src')).toBe('/src/main.jsx')
    expect(html).not.toMatch(/http-equiv=["']Content-Security-Policy/i) // dev HTML stays CSP-free

    // build-only CSP plugin (ADR-013)
    const plugins = inspectViteConfig(html)
    const csp = plugins.find((p) => p.apply === 'build' && p.hasTransform)
    expect(csp, 'plugin with apply: "build" and transformIndexHtml').toBeDefined()
    // Vite accepts either an HTML string or tag descriptors ({ tag: 'meta', attrs: { 'http-equiv': ... } })
    expect(csp.html).toMatch(/http-equiv["']?(?:=\\?["']|\s*:\s*"?)\s*Content-Security-Policy/i)
  })
})

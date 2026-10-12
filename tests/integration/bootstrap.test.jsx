import { StrictMode } from 'react'
import fs from 'node:fs'
import path from 'node:path'

const { createRootMock, renderMock } = vi.hoisted(() => {
  const renderMock = vi.fn()
  return { renderMock, createRootMock: vi.fn(() => ({ render: renderMock })) }
})
vi.mock('react-dom/client', () => ({ createRoot: createRootMock, default: { createRoot: createRootMock } }))

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (/\.(js|jsx)$/.test(e.name)) out.push(p)
  }
  return out
}

describe('bootstrap (ARC-001, ARC-015, ARC-002, ARC-017)', () => {
  it('IT-001 entry renders StrictMode > ErrorBoundary > App into #root and imports global CSS once', async () => {
    document.body.innerHTML = '<div id="root"></div>'
    await import('../../src/main.jsx')
    const { default: App } = await import('../../src/App.jsx')
    const { default: ErrorBoundary } = await import('../../src/components/ErrorBoundary.jsx')

    expect(createRootMock).toHaveBeenCalledTimes(1)
    expect(createRootMock).toHaveBeenCalledWith(document.getElementById('root'))
    expect(renderMock).toHaveBeenCalledTimes(1)

    const tree = renderMock.mock.calls[0][0]
    expect(tree.type).toBe(StrictMode)
    const boundary = tree.props.children
    expect(boundary.type).toBe(ErrorBoundary)
    expect(boundary.props.children.type).toBe(App)

    // static scan: styles/index.css is the only CSS import in src/**/*.js(x)
    const cssImports = []
    const importRe = /import\s+(?:[^'"]*?from\s+)?['"]([^'"]+\.css)['"]/g
    for (const file of walk(path.resolve('src'))) {
      const src = fs.readFileSync(file, 'utf8')
      for (const m of src.matchAll(importRe)) cssImports.push({ file: path.relative('src', file), spec: m[1] })
    }
    expect(cssImports).toEqual([{ file: 'main.jsx', spec: './styles/index.css' }])
  })
})

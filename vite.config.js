import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ADR-013: Content-Security-Policy as a <meta> tag, injected at BUILD time only
// (Vite's dev server injects inline scripts for HMR, which this policy would block).
export const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // 'unsafe-inline': React style props
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://cdn.simpleicons.org",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

function cspPlugin() {
  return {
    name: 'inject-csp-meta',
    apply: 'build',
    transformIndexHtml(html) {
      const meta = `<meta http-equiv="Content-Security-Policy" content="${CSP}" />`
      return html.replace(/<head>/i, `<head>\n    ${meta}`)
    },
  }
}

export default defineConfig({
  plugins: [react(), cspPlugin()],
  base: '/',   // IMPORTANT
})

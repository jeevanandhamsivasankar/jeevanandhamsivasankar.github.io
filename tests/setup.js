import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import { installBrowserMocks, resetBrowserMocks } from './utils/browserMocks.js'

installBrowserMocks()

afterEach(() => {
  cleanup()
  resetBrowserMocks()
})

// The ignition intro (US-208) plays once per session; mark it played so App-level tests see the page itself.
// Intro-specific tests clear this key explicitly.
beforeEach(() => {
  try { sessionStorage.setItem('jsv-intro-played', '1') } catch { /* storage unavailable */ }
})

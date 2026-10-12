import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { installBrowserMocks, resetBrowserMocks } from './utils/browserMocks.js'

installBrowserMocks()

afterEach(() => {
  cleanup()
  resetBrowserMocks()
})

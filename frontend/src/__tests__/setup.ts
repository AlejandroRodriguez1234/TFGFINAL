import '@testing-library/jest-dom'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

// Silence Zustand persist warnings in tests
beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

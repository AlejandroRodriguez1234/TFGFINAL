import { describe, it, expect } from 'vitest'
import { cn } from '@utils/cn'

describe('cn — classname utility', () => {
  it('returns a single class string unchanged', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('merges multiple classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('omits falsy values', () => {
    expect(cn('foo', false && 'bar', null, undefined, '')).toBe('foo')
  })

  it('handles conditional object syntax', () => {
    expect(cn({ 'text-red-500': true, 'text-green-500': false })).toBe('text-red-500')
  })

  it('deduplicates conflicting Tailwind classes (last wins)', () => {
    expect(cn('text-red-500', 'text-green-500')).toBe('text-green-500')
  })

  it('merges padding utilities correctly', () => {
    expect(cn('p-4', 'px-2')).toBe('p-4 px-2')
  })

  it('returns empty string for no args', () => {
    expect(cn()).toBe('')
  })

  it('handles array of classes', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c')
  })
})

import { formatRuntime, formatDate, truncate } from '@/lib/utils/format'
import { tmdbImage } from '@/lib/utils/tmdb-image'
import { cn } from '@/lib/utils/cn'

describe('formatRuntime', () => {
  it('returns empty string for null/undefined', () => {
    expect(formatRuntime(null)).toBe('')
    expect(formatRuntime(undefined)).toBe('')
  })
  it('formats minutes only when under 60', () => {
    expect(formatRuntime(45)).toBe('45m')
  })
  it('formats hours only when no remainder', () => {
    expect(formatRuntime(120)).toBe('2h')
  })
  it('formats hours and minutes', () => {
    expect(formatRuntime(95)).toBe('1h 35m')
  })
  it('handles 0 minutes', () => {
    expect(formatRuntime(0)).toBe('')
  })
})

describe('formatDate', () => {
  it('returns empty string for null', () => {
    expect(formatDate(null)).toBe('')
  })
  it('returns year string', () => {
    expect(formatDate(new Date('2023-07-15'))).toBe('2023')
  })
  it('accepts string input', () => {
    expect(formatDate('2021-01-01')).toBe('2021')
  })
})

describe('truncate', () => {
  it('does not truncate when under limit', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })
  it('truncates and appends ellipsis', () => {
    const result = truncate('hello world', 5)
    expect(result.endsWith('…')).toBe(true)
    expect(result.length).toBeLessThanOrEqual(6)
  })
  it('does not truncate when exactly at limit', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })
})

describe('tmdbImage', () => {
  it('returns null for null path', () => {
    expect(tmdbImage(null)).toBeNull()
    expect(tmdbImage(undefined)).toBeNull()
  })
  it('builds correct URL with default size', () => {
    const url = tmdbImage('/abc.jpg')
    expect(url).toBe('https://image.tmdb.org/t/p/w500/abc.jpg')
  })
  it('respects custom size', () => {
    const url = tmdbImage('/abc.jpg', 'w780')
    expect(url).toBe('https://image.tmdb.org/t/p/w780/abc.jpg')
  })
})

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })
  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })
  it('deduplicates tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})

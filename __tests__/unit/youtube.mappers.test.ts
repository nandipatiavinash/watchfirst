import { parseDuration } from '@/lib/youtube/mappers'

describe('parseDuration (ISO 8601)', () => {
  it('parses minutes and seconds', () => {
    expect(parseDuration('PT12M34S')).toBe(13) // 12 + 34/60 ≈ 12.57 → rounds to 13
  })
  it('parses hours, minutes, seconds', () => {
    expect(parseDuration('PT1H2M3S')).toBe(62) // 60 + 2 + 3/60 ≈ 62.05 → rounds to 62
  })
  it('parses minutes only', () => {
    expect(parseDuration('PT45M')).toBe(45)
  })
  it('parses seconds only', () => {
    expect(parseDuration('PT30S')).toBe(1) // 0.5 → rounds to 1
  })
  it('parses hours only', () => {
    expect(parseDuration('PT2H')).toBe(120)
  })
  it('returns 0 for invalid input', () => {
    expect(parseDuration('garbage')).toBe(0)
  })
  it('handles zero duration', () => {
    expect(parseDuration('PT0S')).toBe(0)
  })
})

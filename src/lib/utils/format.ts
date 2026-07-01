export function formatRuntime(mins: number | null | undefined): string {
  if (!mins) return ''
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ''
  return new Date(date).getFullYear().toString()
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trimEnd() + '…'
}
